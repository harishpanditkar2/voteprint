const fs = require('fs');
const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf8'));

const w7f1 = voters.filter(v => v.uniqueSerial && v.uniqueSerial.startsWith('W7F1'));
const blank = w7f1.filter(v => !v.name || v.name.trim() === '');
const complete = w7f1.filter(v => v.name && v.name.trim() !== '');

console.log('✅ Ward 7 Booth 1 (W7F1) Verification\n');
console.log('Total:    ', w7f1.length);
console.log('Complete: ', complete.length);
console.log('Blank:    ', blank.length);
console.log('Success:  ', ((complete.length / w7f1.length) * 100).toFixed(1) + '%');

console.log('\n📋 Sample Filled Voters:');
complete.slice(0, 10).forEach((v, i) => {
  console.log(`${i+1}. ${v.uniqueSerial} - ${v.name.substring(0, 30)}`);
});
