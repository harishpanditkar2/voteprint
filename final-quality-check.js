const voters = require('./public/data/voters.json');

const w7f1 = voters.filter(v => v.ward === '7' && v.booth === '1');
const w7f2 = voters.filter(v => v.ward === '7' && v.booth === '2');
const w7f3 = voters.filter(v => v.ward === '7' && v.booth === '3');

console.log('📊 Complete Database Quality Report\n');

console.log('W7F1 (934 expected):');
console.log(`  Total: ${w7f1.length}`);
console.log(`  Ages: ${w7f1.filter(v => v.age && v.age !== 'N/A' && parseInt(v.age) >= 18).length}`);
console.log(`  Males: ${w7f1.filter(v => v.gender === 'M').length}`);
console.log(`  Females: ${w7f1.filter(v => v.gender === 'F').length}\n`);

console.log('W7F2 (861 expected):');
console.log(`  Total: ${w7f2.length}`);
console.log(`  Ages: ${w7f2.filter(v => v.age && v.age !== 'N/A' && parseInt(v.age) >= 18).length}`);
console.log(`  Males: ${w7f2.filter(v => v.gender === 'M').length}`);
console.log(`  Females: ${w7f2.filter(v => v.gender === 'F').length}\n`);

console.log('W7F3 (719 expected):');
console.log(`  Total: ${w7f3.length}`);
console.log(`  Ages: ${w7f3.filter(v => v.age && v.age !== 'N/A' && v.age !== '0' && parseInt(v.age) >= 18).length}`);
console.log(`  Males: ${w7f3.filter(v => v.gender === 'M').length}`);
console.log(`  Females: ${w7f3.filter(v => v.gender === 'F').length}\n`);

console.log('W7F3 Sample:');
w7f3.slice(0, 20).forEach(v => {
  console.log(`  ${v.serial}. ${v.name} (${v.age}/${v.gender}) - ${v.voterId}`);
});

console.log('\n📊 Overall Summary:');
console.log(`  Total voters: ${voters.length}`);
console.log(`  Expected: 2514 (934+861+719)`);
console.log(`  Match: ${voters.length === 2514 ? '✅' : '❌'}`);
