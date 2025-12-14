const voters = require('./public/data/voters.json');

const noName = voters.filter(v => !v.name || v.name.trim() === '');
console.log(`Total voters: ${voters.length}`);
console.log(`Voters without names: ${noName.length}\n`);

noName.forEach((v, i) => {
  console.log(`${i + 1}. Serial ${v.serialNumber}: ${v.voterId} ${v.partNumber}`);
  console.log(`   Age: ${v.age} | Gender: ${v.gender}\n`);
});
