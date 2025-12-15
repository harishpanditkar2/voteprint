const fs = require('fs');

console.log('=== DEEP ANALYSIS: Serial Number Corruption ===\n');

// Read database
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));

// Screenshot data from Page 2 (as shown by user)
const screenshotPage2 = [
  { screenSerial: 1, voterId: 'XUA7224868', name: 'शाहरुख अनासपुरे' },
  { screenSerial: 2, voterId: 'XUA7224850', name: 'मंदा गजानन अनासपुरे' },
  { screenSerial: 3, voterId: 'XUA7225139', name: 'तनुजा जावेद बागवान' },
  { screenSerial: 4, voterId: 'XUA7224801', name: 'खुशबू मंहमदरफिक बागवान' },
  { screenSerial: 5, voterId: 'XUA7224645', name: 'मंहमदरफिक बागवान' },
  { screenSerial: 6, voterId: 'XUA7225162', name: 'इम्रान शब्बीर बागवान' },
  { screenSerial: 7, voterId: 'XUA7224819', name: 'करिश्मा शब्बीर बागबान' },
  { screenSerial: 8, voterId: 'XUA7224942', name: 'अमिता नवीनकुमार बखडा' },
  { screenSerial: 9, voterId: 'XUA7224959', name: 'श्रेयंस नविनकुमार बखडा' },
  { screenSerial: 10, voterId: 'XUA7224785', name: 'जयश्री अतुल भुजबळ' },
  { screenSerial: 11, voterId: 'XUA7351711', name: 'रसिका शंकरराव भुजबळ' },
  { screenSerial: 12, voterId: 'XUA7224694', name: 'शिल्पा कुणाल बोरा' },
  { screenSerial: 13, voterId: 'XUA7351448', name: 'संदिप महावीर बोराळकर' },
  { screenSerial: 14, voterId: 'XUA7351463', name: 'अमृता संदिप बोराळकर' },
  { screenSerial: 15, voterId: 'XUA7670524', name: 'सई निलेश चिवटे' }
];

console.log('Comparing Screenshot vs Database:\n');
console.log('Screen | Voter ID    | Screenshot | Database  | Database    | Status');
console.log('Serial |             | Serial     | Serial    | Page        |');
console.log('-------|-------------|------------|-----------|-------------|--------');

const issues = [];

screenshotPage2.forEach(screen => {
  const dbVoter = voters.find(v => v.voterId === screen.voterId);
  if (dbVoter) {
    const correct = screen.screenSerial === parseInt(dbVoter.serialNumber);
    const status = correct ? '✓ OK' : '✗ WRONG';
    console.log(
      `  ${String(screen.screenSerial).padStart(2)}   | ${screen.voterId} | ${String(screen.screenSerial).padStart(2)}         | ${String(dbVoter.serialNumber).padStart(3)}       | Page ${dbVoter.pageNumber}     | ${status}`
    );
    
    if (!correct) {
      issues.push({
        voterId: screen.voterId,
        correctSerial: screen.screenSerial,
        wrongSerial: dbVoter.serialNumber,
        dbPage: dbVoter.pageNumber,
        fileRef: dbVoter.fileReference,
        name: dbVoter.name
      });
    }
  } else {
    console.log(
      `  ${String(screen.screenSerial).padStart(2)}   | ${screen.voterId} | ${String(screen.screenSerial).padStart(2)}         | ---       | ---         | ✗ MISSING`
    );
    issues.push({
      voterId: screen.voterId,
      correctSerial: screen.screenSerial,
      wrongSerial: 'MISSING',
      status: 'NOT FOUND IN DATABASE'
    });
  }
});

console.log('\n=== CRITICAL ISSUES FOUND ===\n');
console.log(`${issues.length} out of 15 voters have incorrect serial numbers!\n`);

console.log('Details of incorrect serials:');
issues.forEach(issue => {
  if (issue.wrongSerial !== 'MISSING') {
    console.log(`\n${issue.voterId} (${issue.name || 'Unknown'})`);
    console.log(`  Correct Serial: ${issue.correctSerial}`);
    console.log(`  Wrong in DB: ${issue.wrongSerial}`);
    console.log(`  File: ${issue.fileRef}`);
    console.log(`  DB Page: ${issue.dbPage} (Screenshot shows Page 2)`);
  }
});

// Check if this is a systematic problem
console.log('\n=== PATTERN ANALYSIS ===\n');
const correctSerials = issues.filter(i => i.correctSerial === parseInt(i.wrongSerial)).length;
const wrongSerials = issues.length - correctSerials;

console.log(`Correct serials: ${correctSerials}`);
console.log(`Wrong serials: ${wrongSerials}`);
console.log(`Accuracy: ${((correctSerials / issues.length) * 100).toFixed(1)}%`);

// Analyze the pattern of wrong serials
console.log('\nPattern of errors:');
const serialMapping = issues.filter(i => i.wrongSerial !== 'MISSING').map(i => ({
  correct: i.correctSerial,
  wrong: parseInt(i.wrongSerial),
  diff: parseInt(i.wrongSerial) - i.correctSerial
}));

serialMapping.forEach(m => {
  console.log(`  Serial ${m.correct} → DB has ${m.wrong} (difference: ${m.diff})`);
});

// Save detailed analysis
fs.writeFileSync('serial-corruption-analysis.json', JSON.stringify({
  screenshotData: screenshotPage2,
  issues: issues,
  summary: {
    totalChecked: screenshotPage2.length,
    wrongSerials: wrongSerials,
    correctSerials: correctSerials,
    accuracy: `${((correctSerials / screenshotPage2.length) * 100).toFixed(1)}%`
  }
}, null, 2));

console.log('\n✓ Detailed analysis saved to: serial-corruption-analysis.json');

// ROOT CAUSE ANALYSIS
console.log('\n=== ROOT CAUSE ===\n');
console.log('The OCR extraction has incorrectly parsed serial numbers from the PDF.');
console.log('Serial numbers appear to be extracted from the wrong position on the page.');
console.log('Some serials are reading values from other columns or sections.');
console.log('\nPossible causes:');
console.log('1. OCR reading serial from wrong table column');
console.log('2. Serial number regex pattern matching wrong text');
console.log('3. Page structure parsing error');
console.log('4. Serial numbers stored in non-sequential order');
