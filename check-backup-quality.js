const fs = require('fs');

const voters = JSON.parse(fs.readFileSync('./voters-backup-w7f2-w7f3-1765880803853.json', 'utf-8'));

const w7f1 = voters.filter(v => v.ward === '7' && v.booth === '1');
const w7f2 = voters.filter(v => v.ward === '7' && v.booth === '2');
const w7f3 = voters.filter(v => v.ward === '7' && v.booth === '3');

console.log('Backup File Quality Check:\n');
console.log('W7F1:', w7f1.length, 'voters');
console.log('W7F2:', w7f2.length, 'voters');
console.log('W7F3:', w7f3.length, 'voters');
console.log('Total:', voters.length, 'voters\n');

console.log('W7F2 Age Quality:');
const w7f2WithAge = w7f2.filter(v => v.age && v.age !== 'N/A' && v.age !== 'NA').length;
console.log(`  With ages: ${w7f2WithAge}/${w7f2.length}`);

console.log('\nW7F3 Age Quality:');
const w7f3WithAge = w7f3.filter(v => v.age && v.age !== 'N/A' && v.age !== 'NA').length;
console.log(`  With ages: ${w7f3WithAge}/${w7f3.length}`);

console.log('\nW7F2 Samples:');
w7f2.slice(0, 5).forEach(v => {
  console.log(`  ${v.serial}. ${v.name} (${v.age}/${v.gender}) - ${v.voterId}`);
});

console.log('\nW7F3 Samples:');
w7f3.slice(0, 5).forEach(v => {
  console.log(`  ${v.serial}. ${v.name} (${v.age}/${v.gender}) - ${v.voterId}`);
});
