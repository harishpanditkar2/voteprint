const fs = require('fs');

// Read the voters file
let voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));

// Create backup
const backupPath = `./public/data/voters-backup-w7f1-corrections-${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(voters, null, 2));
console.log(`Backup created: ${backupPath}\n`);

// Corrections data from user
const corrections = [
  { serial: 2, name: 'खुशबू महमद रफिक बागवान' },
  { serial: 5, age: 31 },
  { serial: 7, name: 'करिश्मा शब्बीर बागवान' },
  { serial: 9, age: 31 },
  { serial: 13, age: 39 },
  { serial: 15, name: 'सई निलेश चिवटे' },
  { serial: 17, age: 38 },
  { serial: 19, name: 'आकाश हिराचंद देशमुख' },
  { serial: 48, name: 'दूरर्या मुस्तफा हवेलिवाला' },
  { serial: 66, age: 31 },
  { serial: 67, name: 'शंतनु जगन्नाथ कुंभार' },
  { serial: 77, age: 31 },
  { serial: 82, name: 'आशा समकित ओसवाल' },
  { serial: 91, name: 'पृथ्वीराज शांताराम पिंगळे' },
  { serial: 92, name: 'सुभाष यशवंत रावळ' },
  { serial: 96, age: 37 },
  { serial: 114, age: 34 },
  { serial: 125, age: 31 },
  { serial: 130, name: 'श्वेता देवीचद कटारिया' },
  { serial: 135, name: 'श्वेत जगताप' },
  { serial: 154, name: 'शाद्रुल विश्वास शेळके' },
  { serial: 178, name: 'शैलेश विश्वनाथ कळत्रे' },
  { serial: 204, name: 'छाया शंकर भुजवळ' },
  { serial: 216, age: 23 },
  { serial: 256, name: 'शीला विनोद सोरटे' },
  { serial: 277, name: 'मुस्ताफ हकीमुद्दिन जिनीयवाला' },
  { serial: 412, name: 'सुश्मिता पवार' },
  { serial: 424, age: 32 },
  { serial: 458, age: 31 },
  { serial: 460, age: 22 },
  { serial: 470, age: 22 },
  { serial: 473, age: 29 },
  { serial: 481, name: 'सुशीला कलुजिया' },
  { serial: 482, age: 39 },
  { serial: 495, age: 37 },
  { serial: 512, age: 31 },
  { serial: 547, age: 31 },
  { serial: 551, age: 31, gender: 'M' },
  { serial: 562, name: 'यश शहा' },
  { serial: 566, name: 'ऋतूजा राजेंद्र धुमाळ' },
  { serial: 582, name: 'ऋषिकेश संजय भुजे', gender: 'M' },
  { serial: 587, name: 'स्वप्नाली चंकेश्वरा' },
  { serial: 594, name: 'सुशीलकुमार शर्मा' },
  { serial: 598, age: 71 },
  { serial: 612, age: 53, gender: 'F' },
  { serial: 629, name: 'रश्मी राजकुमार शहा' },
  { serial: 645, age: 53 },
  { serial: 657, name: 'इशाका ठरत्रावाला' },
  { serial: 667, age: 19 },
  { serial: 689, name: 'प्रिया सुयोग पोतदार', age: 24 },
  { serial: 709, name: 'शैलेश श्रीधर पोटे' },
  { serial: 710, name: 'शरयू अतुल चव्हाण' },
  { serial: 720, name: 'गौरीश संभाजी पाटील', age: 19, gender: 'M' },
  { serial: 747, name: 'वैशाली मनोज मोरे' },
  { serial: 763, age: 19, gender: 'M' },
  { serial: 783, name: 'सफिया सोहेल शेख' },
  { serial: 795, name: 'गिरीश शरद कदम' },
  { serial: 800, name: 'आश्लेषा विश्वजीत शिरसट' },
  { serial: 801, name: 'सुष्मिता अमरसिंह पवार' },
  { serial: 803, name: 'राजश्री संतोष शिर्के' },
  { serial: 808, name: 'रेशमा इसाक शेख' },
  { serial: 821, name: 'सारा शहीर शेख' },
  { serial: 827, age: 31 },
  { serial: 839, name: 'रोहित मोहन गानबोटे' },
  { serial: 847, age: 35 },
  { serial: 857, age: 31 },
  { serial: 865, age: 31 },
  { serial: 869, name: 'ऋतूजा चंद्रकांत शिंगाडे' },
  { serial: 884, name: 'स्वप्निल माने' },
  { serial: 885, age: 31 },
  { serial: 900, age: 31 },
  { serial: 904, age: 35 },
  { serial: 910, age: 35 },
  { serial: 946, age: 31 },
  { serial: 973, name: 'कमल हरिदास राऊत' }
];

let corrected = 0;
let notFound = 0;

console.log('Applying corrections to W7F1:\n');

for (const correction of corrections) {
  const voterIndex = voters.findIndex(v => 
    v.ward === '7' && v.booth === '1' && v.serial === correction.serial
  );
  
  if (voterIndex === -1) {
    console.log(`❌ Serial ${correction.serial}: NOT FOUND`);
    notFound++;
    continue;
  }
  
  const voter = voters[voterIndex];
  const changes = [];
  
  if (correction.name && voter.name !== correction.name) {
    changes.push(`Name: "${voter.name}" → "${correction.name}"`);
    voters[voterIndex].name = correction.name;
  }
  
  if (correction.age && voter.age !== correction.age) {
    changes.push(`Age: ${voter.age} → ${correction.age}`);
    voters[voterIndex].age = correction.age;
  }
  
  if (correction.gender && voter.gender !== correction.gender) {
    changes.push(`Gender: ${voter.gender} → ${correction.gender}`);
    voters[voterIndex].gender = correction.gender;
  }
  
  if (changes.length > 0) {
    console.log(`✅ Serial ${correction.serial}: ${changes.join(', ')}`);
    corrected++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Corrected: ${corrected} voters`);
console.log(`   Not found: ${notFound} voters`);

// Save updated voters
fs.writeFileSync('./public/data/voters.json', JSON.stringify(voters, null, 2));
console.log(`\n✅ Updated voters.json with corrections`);
