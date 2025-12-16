const fs = require('fs');

// Read the voters file
const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));

// Get W7F1 voters
const w7f1Voters = voters.filter(v => v.ward === '7' && v.booth === '1');

console.log(`W7F1 has ${w7f1Voters.length} voters\n`);

// Check specific serials mentioned in the issue
const problematicSerials = [2, 5, 7, 9, 13, 15, 17, 19, 48, 66, 67, 77, 82, 91, 92, 96, 114, 125, 130, 135, 154, 178, 204, 216, 256, 277, 412, 424, 458, 460, 470, 473, 481, 482, 495, 512, 547, 551, 562, 566, 582, 587, 594, 598, 612, 629, 645, 657, 667, 689, 709, 710, 720, 747, 763, 783, 795, 800, 801, 803, 808, 821, 827, 832, 839, 847, 857, 865, 869, 884, 885, 900, 904, 910, 946, 973];

console.log('Checking problematic serials:\n');

for (const serial of problematicSerials) {
  const voter = w7f1Voters.find(v => v.serial === serial);
  if (voter) {
    const issues = [];
    if (!voter.name || voter.name.trim() === '') issues.push('NO_NAME');
    if (!voter.voterId || voter.voterId.trim() === '') issues.push('NO_VOTER_ID');
    if (!voter.age || voter.age === 0) issues.push('NO_AGE');
    if (!voter.gender) issues.push('NO_GENDER');
    
    if (issues.length > 0) {
      console.log(`Serial ${serial}: ${voter.voterId || 'NO_ID'} | ${voter.name || 'NO_NAME'} | Age: ${voter.age || 'MISSING'} | Gender: ${voter.gender || 'MISSING'}`);
      console.log(`  Issues: ${issues.join(', ')}`);
    }
  } else {
    console.log(`Serial ${serial}: NOT FOUND IN DATABASE`);
  }
}
