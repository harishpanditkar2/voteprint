const voters = require('./public/data/voters.json');

console.log(`Total voters: ${voters.length}`);
console.log('\nLast 3 voters:');

const last3 = voters.slice(-3);
last3.forEach((v, i) => {
  const voterNum = voters.length - 3 + i + 1;
  console.log(`\n${voterNum}. ${v.name}`);
  console.log(`   ID: ${v.voterId} | Part: ${v.partNumber}`);
  console.log(`   Age: ${v.age} | Gender: ${v.gender}`);
});
