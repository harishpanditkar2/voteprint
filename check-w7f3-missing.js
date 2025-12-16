const fs = require('fs');

// Read the voters file
const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));

// Get W7F3 voters
const w7f3Voters = voters.filter(v => v.ward === '7' && v.booth === '3');
const serials = w7f3Voters.map(v => v.serial).sort((a, b) => a - b);

console.log(`W7F3 has ${w7f3Voters.length} voters`);
console.log(`Serial range: ${serials[0]} to ${serials[serials.length - 1]}`);

// Read W7F3 text to see what serials should exist
const w7f3Text = fs.readFileSync('./pdflist/W7F3.txt', 'utf-8');
const voterPattern = /(\d+)\s+([A-Z]{3}[A-B]?\d{7})\s+(\d{3}\/\d{3}\/\d{3,4})/g;
const matches = [...w7f3Text.matchAll(voterPattern)];

const expectedSerials = matches.map(m => parseInt(m[1])).sort((a, b) => a - b);
console.log(`\nExpected ${expectedSerials.length} voters based on file`);

// Find missing
const missing = expectedSerials.filter(s => !serials.includes(s));
console.log(`\nMissing ${missing.length} voters:`);
if (missing.length <= 100) {
  console.log(missing.join(', '));
}

// Show some missing voter details from file
if (missing.length > 0) {
  console.log(`\nFirst 10 missing voter details from file:`);
  let count = 0;
  for (const match of matches) {
    const serial = parseInt(match[1]);
    if (missing.includes(serial) && count < 10) {
      console.log(`Serial ${serial}: ${match[2]} ${match[3]}`);
      count++;
    }
  }
}
