const fs = require('fs');

const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf8'));
const w7f1 = voters.filter(v => v.uniqueSerial && v.uniqueSerial.startsWith('W7F1'));

console.log('W7F1 Name Samples (first 20):');
console.log('='.repeat(60));

w7f1.slice(0, 20).forEach((voter, idx) => {
  console.log(`${idx + 1}. ${voter.name} (${voter.voterId})`);
});

console.log('\n' + '='.repeat(60));
console.log(`\nTotal W7F1 voters: ${w7f1.length}`);

// Check for common corruption patterns
const corruptionPatterns = {
  'त instead of ता': 0,
  'न instead of ना': 0,
  'व instead of वा': 0,
  'ब instead of बा': 0,
  'Contains जब (should be जा)': 0,
  'Contains पज (should be पा)': 0,
  'Ends with doubled consonants': 0
};

w7f1.forEach(voter => {
  if (!voter.name) return;
  
  const name = voter.name;
  
  // Check patterns
  if (name.includes('जब')) corruptionPatterns['Contains जब (should be जा)']++;
  if (name.includes('पज')) corruptionPatterns['Contains पज (should be पा)']++;
  if (/[क-ह][क-ह]\s|[क-ह][क-ह]$/.test(name)) corruptionPatterns['Ends with doubled consonants']++;
});

console.log('\nCorruption Pattern Analysis:');
console.log('='.repeat(60));
Object.entries(corruptionPatterns).forEach(([pattern, count]) => {
  if (count > 0) {
    console.log(`${pattern}: ${count} voters`);
  }
});
