const fs = require('fs');

// Read voters.json
const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));

// User's data with corrections (using anukramank as "Serial No.")
const userCorrections = [
  { ank: 4, name: "खुशबू महमद रफिक बागवान", age: "", gender: "" },
  { ank: 5, name: "", age: "31", gender: "" },
  { ank: 7, name: "करिश्मा शब्बीर बागवान", age: "", gender: "" },
  { ank: 9, name: "", age: "31", gender: "" },
  { ank: 13, name: "", age: "39", gender: "" },
  { ank: 15, name: "सई निलेश चिवटे", age: "", gender: "" },
  { ank: 17, name: "", age: "38", gender: "" },
  { ank: 19, name: "आकाश हिराचंद देशमुख", age: "", gender: "" },
  { ank: 48, name: "दूरर्या मुस्तफा हवेलिवाला", age: "", gender: "" },
  { ank: 66, name: "", age: "31", gender: "" },
  { ank: 67, name: "शंतनु जगन्नाथ कुंभार", age: "", gender: "" },
  { ank: 77, name: "", age: "31", gender: "" },
  { ank: 82, name: "आशा समकित ओसवाल", age: "", gender: "" },
  { ank: 91, name: "पृथ्वीराज शांताराम पिंगळे", age: "", gender: "" },
  { ank: 92, name: "सुभाष यशवंत रावळ", age: "", gender: "" },
  { ank: 96, name: "", age: "37", gender: "" },
  { ank: 114, name: "", age: "34", gender: "" },
  { ank: 125, name: "", age: "31", gender: "" },
  { ank: 130, name: "श्वेता देवीचद कटारिया", age: "", gender: "" },
  { ank: 135, name: "श्वेत जगताप", age: "", gender: "" },
  { ank: 154, name: "शाद्रुल विश्वास शेळके", age: "", gender: "" },
  { ank: 178, name: "शैलेश विश्वनाथ कळत्रे", age: "", gender: "" },
  { ank: 204, name: "छाया शंकर भुजवळ", age: "", gender: "" }, // Remove comma
  { ank: 216, name: "", age: "23", gender: "" },
  { ank: 256, name: "शीला विनोद सोरटे", age: "", gender: "" },
  { ank: 277, name: "मुस्ताफ हकीमुद्दिन जिनीयवाला", age: "", gender: "" },
  { ank: 412, name: "सुश्मिता पवार", age: "", gender: "" },
  { ank: 424, name: "", age: "32", gender: "" },
  { ank: 458, name: "", age: "31", gender: "" },
  { ank: 460, name: "", age: "22", gender: "" },
  { ank: 470, name: "", age: "22", gender: "" },
  { ank: 473, name: "", age: "29", gender: "" },
  { ank: 481, name: "सुशीला कलुजिया", age: "", gender: "" },
  { ank: 482, name: "", age: "39", gender: "" },
  { ank: 495, name: "", age: "37", gender: "" },
  { ank: 512, name: "", age: "31", gender: "" },
  { ank: 547, name: "", age: "31", gender: "" },
  { ank: 551, name: "", age: "31", gender: "Male" },
  { ank: 562, name: "यश शहा", age: "", gender: "" },
  { ank: 566, name: "ऋतूजा राजेंद्र धुमाळ", age: "", gender: "" },
  { ank: 582, name: "ऋषिकेश संजय भुजे", age: "", gender: "Male" },
  { ank: 587, name: "स्वप्नाली चंकेश्वरा", age: "", gender: "" },
  { ank: 594, name: "सुशीलकुमार शर्मा", age: "", gender: "" },
  { ank: 598, name: "", age: "71", gender: "" },
  { ank: 612, name: "", age: "53", gender: "" },
  { ank: 629, name: "रश्मी राजकुमार शहा", age: "", gender: "" },
  { ank: 645, name: "", age: "53", gender: "" },
  { ank: 657, name: "इशाका ठरत्रावाला", age: "", gender: "" },
  { ank: 667, name: "", age: "19", gender: "" },
  { ank: 689, name: "प्रिया सुयोग पोतदार", age: "24", gender: "" },
  { ank: 709, name: "शैलेश श्रीधर पोटे", age: "", gender: "" },
  { ank: 710, name: "", age: "", gender: "" },
  { ank: 720, name: "गौरीश संभाजी पाटील", age: "19", gender: "Male" },
  { ank: 747, name: "वैशाली मनोज मोरे", age: "", gender: "" },
  { ank: 763, name: "", age: "19", gender: "Male" },
  { ank: 783, name: "सफिया सोहेल शेख", age: "", gender: "" },
  { ank: 795, name: "गिरीश शरद कदम", age: "", gender: "" },
  { ank: 800, name: "आश्लेषा विश्वजीत शिरसट", age: "", gender: "" },
  { ank: 801, name: "सुष्मिता अमरसिंह पवार", age: "", gender: "" },
  { ank: 803, name: "राजश्री संतोष शिर्के", age: "", gender: "" },
  { ank: 808, name: "रेशमा इसाक शेख", age: "", gender: "" },
  { ank: 821, name: "सारा शहीर शेख", age: "", gender: "" },
  { ank: 827, name: "", age: "31", gender: "" },
  { ank: 832, name: "", age: "", gender: "" },
  { ank: 839, name: "रोहित मोहन गानबोटे", age: "", gender: "" },
  { ank: 847, name: "", age: "35", gender: "" },
  { ank: 857, name: "", age: "31", gender: "" },
  { ank: 865, name: "", age: "31", gender: "" },
  { ank: 869, name: "ऋतूजा चंद्रकांत शिंगाडे", age: "", gender: "" },
  { ank: 885, name: "", age: "31", gender: "" },
  { ank: 900, name: "", age: "31", gender: "" },
  { ank: 904, name: "", age: "35", gender: "" },
  { ank: 910, name: "", age: "35", gender: "" },
  { ank: 946, name: "", age: "31", gender: "" },
  { ank: 973, name: "कमल हरिदास राऊत", age: "", gender: "" },
  { ank: 47, name: "वंदना प्रशांत गुरव", age: "", gender: "" },
  { ank: 220, name: "अर्चना स्वप्निल गांधी", age: "", gender: "" },
  { ank: 286, name: "अश्विनी अशोक गलांडे", age: "", gender: "" },
  { ank: 304, name: "जोहर आल्लीहुसेन नासिकवाला", age: "", gender: "" },
  { ank: 320, name: "वैशाली रमेश गानबोटे", age: "", gender: "" },
  { ank: 440, name: "यश दिलीप संघवी", age: "", gender: "" },
  { ank: 455, name: "अमन रहिमान शेख", age: "", gender: "" },
  { ank: 480, name: "", age: "39", gender: "" },
  { ank: 600, name: "", age: "62", gender: "" },
  { ank: 731, voterId: "BFD0855916", name: "", age: "", gender: "" },
  { ank: 780, name: "", age: "53", gender: "" },
  { ank: 814, voterId: "UBE7228554", name: "", age: "", gender: "" },
  { ank: 832, name: "गौरव गिरीश देशपांडे", age: "", gender: "" },
  { ank: 865, name: "", age: "55", gender: "" },
  { ank: 868, name: "", age: "31", gender: "" },
  { ank: 884, name: "पायल अजिंक्य शाह", age: "", gender: "" },
  { ank: 884, name: "स्वप्निल माने", age: "", gender: "" }, // duplicate anukramank in user data
  { ank: 912, voterId: "XUA4595476", name: "रतनलाल रामकुमार गादिया", age: "71", gender: "" },
  { ank: 953, name: "अविनाश रामा गाडे", age: "", gender: "" },
  { ank: 959, name: "रंजना दीपक काटे", age: "53", gender: "" }
];

let updatesCount = 0;
let corrections = [];

const w7b1 = voters.filter(v => v.ward === "7" && v.booth === "1");

userCorrections.forEach(correction => {
  const voter = w7b1.find(v => v.anukramank === correction.ank);
  
  if (!voter) {
    corrections.push({ ank: correction.ank, issue: "NOT FOUND" });
    return;
  }
  
  let changes = [];
  
  // Check name
  if (correction.name && correction.name !== voter.name) {
    const cleanName = correction.name.replace(/\s*,\s*$/, '').trim();
    changes.push(`Name: "${voter.name}" → "${cleanName}"`);
    voter.name = cleanName;
  }
  
  // Check age
  if (correction.age && correction.age !== voter.age) {
    changes.push(`Age: "${voter.age}" → "${correction.age}"`);
    voter.age = correction.age;
  }
  
  // Check gender
  if (correction.gender) {
    const newGender = correction.gender === "Male" ? "M" : correction.gender;
    if (newGender !== voter.gender) {
      changes.push(`Gender: "${voter.gender}" → "${newGender}"`);
      voter.gender = newGender;
    }
  }
  
  // Check voterId
  if (correction.voterId && correction.voterId !== voter.voterId) {
    changes.push(`VoterID: "${voter.voterId}" → "${correction.voterId}"`);
    voter.voterId = correction.voterId;
  }
  
  if (changes.length > 0) {
    corrections.push({
      ank: correction.ank,
      serial: voter.serial,
      changes: changes
    });
    updatesCount++;
  }
});

// Display corrections
console.log('=== CORRECTIONS TO BE APPLIED ===\n');
corrections.forEach(corr => {
  if (corr.issue) {
    console.log(`Anukramank ${corr.ank}: ${corr.issue}`);
  } else {
    console.log(`Anukramank ${corr.ank} (Serial ${corr.serial}):`);
    corr.changes.forEach(change => console.log(`  - ${change}`));
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total records updated: ${updatesCount}`);
console.log(`Records checked: ${userCorrections.length}`);

if (updatesCount > 0) {
  // Save backup
  fs.writeFileSync('./public/data/voters-backup-before-w7b1-fix.json', 
    JSON.stringify(voters, null, 2));
  
  // Save updated data
  fs.writeFileSync('./public/data/voters.json', JSON.stringify(voters, null, 2));
  console.log('\n✓ Backup created: voters-backup-before-w7b1-fix.json');
  console.log('✓ Data updated successfully!');
} else {
  console.log('\n✓ No corrections needed - all data matches!');
}
