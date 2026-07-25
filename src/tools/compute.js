// WellWater HQ -- "Which tests does my well need?" selector.
// Grounded in EPA/CDC private-well guidance: coliform bacteria + nitrate tested
// annually as the baseline; broader metals/mineral panel every 3-5 years;
// immediate (re)testing after flooding, nearby construction, or a change in
// taste/odor/color; nitrate is a particular concern where an infant or a
// pregnant/nursing person drinks the water. Arsenic and radon risk is
// regional, so we point to the county health department rather than
// asserting a risk level we can't know.
export function compute(v) {
  const testNow = [];
  const testThisYear = [
    'Total coliform bacteria & E. coli (annual baseline)',
    'Nitrate/nitrite (annual baseline)'
  ];
  const testEvery3to5 = [
    'Arsenic, lead & other metals panel',
    'Water hardness, iron & manganese'
  ];

  let status = 'ok';

  if (v.floodingConstruction === 1) {
    testNow.push('Bacteria retest: flooding or nearby construction can introduce contamination into a well');
    status = 'bad';
  }
  if (v.tasteOdorColorChange === 1) {
    testNow.push('Test for the changed parameter: a sudden taste, odor, or color change is a signal to test right away, not wait for the annual round');
    status = 'bad';
  }
  if (v.infantPregnant === 1 && (v.lastBacteriaTest === 0 || v.lastBacteriaTest === 3)) {
    testNow.push("Nitrate test: recommended before an infant or someone pregnant/nursing drinks water that hasn't been tested recently (EPA limit: 10 mg/L nitrate as N)");
    status = 'bad';
  }

  if (status !== 'bad') {
    if (v.lastBacteriaTest === 0 || v.lastBacteriaTest === 3) {
      status = 'warn';
    } else if (v.lastBacteriaTest === 2) {
      status = 'warn';
    }
  }

  if (v.lastBacteriaTest === 0) {
    testThisYear[0] = 'Total coliform bacteria & E. coli: overdue, this well has never been tested';
  } else if (v.lastBacteriaTest === 3) {
    testThisYear[0] = 'Total coliform bacteria & E. coli: overdue, last tested more than 3 years ago';
  } else if (v.lastBacteriaTest === 2) {
    testThisYear[0] = 'Total coliform bacteria & E. coli: due, last tested 1-3 years ago';
  }

  if (v.arsenicRadonConcern === 2) {
    testEvery3to5.push('Radon: ask your county health department; radon risk is highly regional');
  } else {
    testEvery3to5.push('Arsenic and radon: ask your county health department whether either is a known concern in your area');
  }

  if (v.wellAge === 3 || v.wellAge === 0) {
    testEvery3to5.push('Well casing/seal inspection: worth a professional look on an older or unknown-age well');
  }

  return {
    status,
    outputs: {
      testNow: { value: testNow.length ? testNow.join('. ') + '.' : 'Nothing urgent based on your answers. Keep to the annual and 3-5 year schedule below.' },
      testThisYear: { value: testThisYear.join('. ') + '.' },
      testEvery3to5: { value: testEvery3to5.join('. ') + '.' }
    }
  };
}
