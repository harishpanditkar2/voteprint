const fs = require('fs');

// Read voters.json
const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));

// Corrections provided by user
const corrections = [
  { serial: "4", name: "खुशबू महमद रफिक बागवान", age: null, gender: null },
  { serial: "5", voterId: "", name: "", age: "31", gender: "" },
  { serial: "7", name: "करिश्मा शब्बीर बागवान", age: null, gender: null },
  { serial: "9", voterId: "", name: "", age: "31", gender: "" },
  { serial: "13", voterId: "", name: "", age: "39", gender: "" },
  { serial: "15", name: "सई निलेश चिवटे", age: null, gender: null },
  { serial: "17", voterId: "", name: "", age: "38", gender: "" },
  { serial: "19", name: "आकाश हिराचंद देशमुख", age: null, gender: null },
  { serial: "48", name: "दूरर्या मुस्तफा हवेलिवाला", age: null, gender: null },
  { serial: "66", voterId: "", name: "", age: "31", gender: "" },
  { serial: "67", name: "शंतनु जगन्नाथ कुंभार", age: null, gender: null },
  { serial: "77", voterId: "", name: "", age: "31", gender: "" },
  { serial: "82", name: "आशा समकित ओसवाल", age: null, gender: null },
  { serial: "91", name: "पृथ्वीराज शांताराम पिंगळे", age: null, gender: null },
  { serial: "92", name: "सुभाष यशवंत रावळ", age: null, gender: null },
  { serial: "96", voterId: "", name: "", age: "37", gender: "" },
  { serial: "114", voterId: "", name: "", age: "34", gender: "" },
  { serial: "125", voterId: "", name: "", age: "31", gender: "" },
  { serial: "130", name: "श्वेता देवीचद कटारिया", age: null, gender: null },
  { serial: "135", name: "श्वेत जगताप", age: null, gender: null },
  { serial: "154", name: "शाद्रुल विश्वास शेळके", age: null, gender: null },
  { serial: "178", name: "शैलेश विश्वनाथ कळत्रे", age: null, gender: null },
  { serial: "204", name: "छाया शंकर भुजवळ ,", age: null, gender: null },
  { serial: "216", voterId: "", name: "", age: "23", gender: "" },
  { serial: "256", name: "शीला विनोद सोरटे", age: null, gender: null },
  { serial: "277", name: "मुस्ताफ हकीमुद्दिन जिनीयवाला", age: null, gender: null },
  { serial: "412", name: "सुश्मिता पवार", age: null, gender: null },
  { serial: "424", voterId: "", name: "", age: "32", gender: "" },
  { serial: "458", voterId: "", name: "", age: "31", gender: "" },
  { serial: "460", voterId: "", name: "", age: "22", gender: "" },
  { serial: "470", voterId: "", name: "", age: "22", gender: "" },
  { serial: "473", voterId: "", name: "", age: "29", gender: "" },
  { serial: "481", name: "सुशीला कलुजिया", age: null, gender: null },
  { serial: "482", voterId: "", name: "", age: "39", gender: "" },
  { serial: "495", voterId: "", name: "", age: "37", gender: "" },
  { serial: "512", voterId: "", name: "", age: "31", gender: "" },
  { serial: "547", voterId: "", name: "", age: "31", gender: "" },
  { serial: "551", voterId: "", name: "", age: "31", gender: "Male" },
  { serial: "562", name: "यश शहा", age: null, gender: null },
  { serial: "566", name: "ऋतूजा राजेंद्र धुमाळ", age: null, gender: null },
  { serial: "582", name: "ऋषिकेश संजय भुजे", age: null, gender: "Male" },
  { serial: "587", name: "स्वप्नाली चंकेश्वरा", age: null, gender: null },
  { serial: "594", name: "सुशीलकुमार शर्मा", age: null, gender: null },
  { serial: "598", voterId: "", name: "", age: "71", gender: "" },
  { serial: "612", voterId: "", name: "", age: "53", gender: "" },
  { serial: "629", name: "रश्मी राजकुमार शहा", age: null, gender: null },
  { serial: "645", voterId: "", name: "", age: "53", gender: "" },
  { serial: "657", name: "इशाका ठरत्रावाला", age: null, gender: null },
  { serial: "667", voterId: "", name: "", age: "19", gender: "" },
  { serial: "689", name: "प्रिया सुयोग पोतदार", age: "24", gender: null },
  { serial: "709", name: "शैलेश श्रीधर पोटे", age: null, gender: null },
  { serial: "710", voterId: "", name: "", age: "", gender: "" },
  { serial: "720", name: "गौरीश संभाजी पाटील", age: "19", gender: "Male" },
  { serial: "747", name: "वैशाली मनोज मोरे", age: null, gender: null },
  { serial: "763", voterId: "", name: "", age: "19", gender: "Male" },
  { serial: "783", name: "सफिया सोहेल शेख", age: null, gender: null },
  { serial: "795", name: "गिरीश शरद कदम", age: null, gender: null },
  { serial: "800", name: "आश्लेषा विश्वजीत शिरसट", age: null, gender: null },
  { serial: "801", name: "सुष्मिता अमरसिंह पवार", age: null, gender: null },
  { serial: "803", name: "राजश्री संतोष शिर्के", age: null, gender: null },
  { serial: "808", name: "रेशमा इसाक शेख", age: null, gender: null },
  { serial: "884", name: "स्वप्निल माने", age: null, gender: null },
  { serial: "821", name: "सारा शहीर शेख", age: null, gender: null },
  { serial: "827", voterId: "", name: "", age: "31", gender: "" },
  { serial: "832", voterId: "", name: "", age: "", gender: "" },
  { serial: "839", name: "रोहित मोहन गानबोटे", age: null, gender: null },
  { serial: "847", voterId: "", name: "", age: "35", gender: "" },
  { serial: "857", voterId: "", name: "", age: "31", gender: "" },
  { serial: "865", voterId: "", name: "", age: "31", gender: "" }, // duplicate serial
  { serial: "869", name: "ऋतूजा चंद्रकांत शिंगाडे", age: null, gender: null },
  { serial: "885", voterId: "", name: "", age: "31", gender: "" },
  { serial: "900", voterId: "", name: "", age: "31", gender: "" },
  { serial: "904", voterId: "", name: "", age: "35", gender: "" },
  { serial: "910", voterId: "", name: "", age: "35", gender: "" },
  { serial: "946", voterId: "", name: "", age: "31", gender: "" },
  { serial: "973", name: "कमल हरिदास राऊत", age: null, gender: null },
  { serial: "47", name: "वंदना प्रशांत गुरव", age: null, gender: null },
  { serial: "220", name: "अर्चना स्वप्निल गांधी", age: null, gender: null },
  { serial: "286", name: "अश्विनी अशोक गलांडे", age: null, gender: null },
  { serial: "304", name: "जोहर आल्लीहुसेन नासिकवाला", age: null, gender: null },
  { serial: "320", name: "वैशाली रमेश गानबोटे", age: null, gender: null },
  { serial: "440", name: "यश दिलीप संघवी", age: null, gender: null },
  { serial: "455", name: "अमन रहिमान शेख", age: null, gender: null },
  { serial: "480", voterId: "", name: "", age: "39", gender: "" },
  { serial: "600", voterId: "", name: "", age: "62", gender: "" },
  { serial: "731", voterId: "BFD0855916", name: "", age: "", gender: "" },
  { serial: "780", voterId: "", name: "", age: "53", gender: "" },
  { serial: "814", voterId: "UBE7228554", name: "", age: "", gender: "" },
  { serial: "832", name: "गौरव गिरीश देशपांडे", age: null, gender: null }, // duplicate serial
  { serial: "865", voterId: "", name: "", age: "55", gender: "" }, // duplicate serial
  { serial: "868", voterId: "", name: "", age: "31", gender: "" },
  { serial: "884", name: "पायल अजिंक्य शाह", age: null, gender: null }, // duplicate serial
  { serial: "912", voterId: "XUA4595476", name: "रतनलाल रामकुमार गादिया", age: "71", gender: null },
  { serial: "953", name: "अविनाश रामा गाडे", age: null, gender: null },
  { serial: "959", name: "रंजना दीपक काटे", age: "53", gender: null }
];

// Gender detection helper
function detectGender(name) {
  if (!name) return null;
  
  const femaleIndicators = ['ा$', 'ी$', 'ता$', 'ना$', 'िया$', 'या$', 'ली$'];
  const maleIndicators = ['श$', 'र$', 'न$', 'म$', 'ल$', 'द$', 'त$'];
  
  const commonFemaleNames = ['खुशबू', 'करिश्मा', 'सई', 'आशा', 'श्वेता', 'शीला', 'सुश्मिता', 
    'सुशीला', 'ऋतूजा', 'स्वप्नाली', 'रश्मी', 'इशाका', 'प्रिया', 'वैशाली', 'सफिया', 
    'आश्लेषा', 'सुष्मिता', 'राजश्री', 'रेशमा', 'सारा', 'वंदना', 'अर्चना', 'अश्विनी', 
    'पायल', 'रंजना', 'छाया'];
  
  const commonMaleNames = ['आकाश', 'शंतनु', 'पृथ्वीराज', 'सुभाष', 'शाद्रुल', 'शैलेश', 
    'मुस्ताफ', 'यश', 'ऋषिकेश', 'सुशीलकुमार', 'गौरीश', 'गिरीश', 'स्वप्निल', 'रोहित', 
    'अमन', 'गौरव', 'रतनलाल', 'अविनाश'];
  
  // Check common names first
  for (const fname of commonFemaleNames) {
    if (name.includes(fname)) return 'F';
  }
  for (const mname of commonMaleNames) {
    if (name.includes(mname)) return 'M';
  }
  
  // Check endings
  for (const indicator of femaleIndicators) {
    if (new RegExp(indicator).test(name)) return 'F';
  }
  
  return null; // Unable to determine
}

let updatesCount = 0;
let issuesLog = [];

// Apply corrections
corrections.forEach(correction => {
  const voter = voters.find(v => 
    v.ward === "7" && 
    v.booth === "1" && 
    v.serial === correction.serial
  );
  
  if (!voter) {
    issuesLog.push(`Serial ${correction.serial} not found in W7B1`);
    return;
  }
  
  let updated = false;
  
  // Update name if provided
  if (correction.name && correction.name !== voter.name) {
    // Clean the name
    const cleanName = correction.name.replace(/\s*,\s*$/, '').trim();
    console.log(`Serial ${correction.serial}: Name "${voter.name}" → "${cleanName}"`);
    voter.name = cleanName;
    updated = true;
  }
  
  // Update age if provided
  if (correction.age !== null && correction.age !== undefined && correction.age !== "") {
    const currentAge = voter.age;
    if (currentAge !== correction.age) {
      console.log(`Serial ${correction.serial}: Age "${currentAge}" → "${correction.age}"`);
      voter.age = correction.age;
      updated = true;
    }
  }
  
  // Update gender if provided
  if (correction.gender !== null && correction.gender !== undefined && correction.gender !== "") {
    const newGender = correction.gender === "Male" ? "M" : correction.gender;
    if (voter.gender !== newGender) {
      console.log(`Serial ${correction.serial}: Gender "${voter.gender}" → "${newGender}"`);
      voter.gender = newGender;
      updated = true;
    }
  }
  
  // Update voterId if provided
  if (correction.voterId !== undefined && correction.voterId !== "" && correction.voterId !== voter.voterId) {
    console.log(`Serial ${correction.serial}: VoterID "${voter.voterId}" → "${correction.voterId}"`);
    voter.voterId = correction.voterId;
    updated = true;
  }
  
  // Auto-detect gender if still missing or needs correction
  if (voter.name && (!voter.gender || voter.gender === "")) {
    const detectedGender = detectGender(voter.name);
    if (detectedGender) {
      console.log(`Serial ${correction.serial}: Auto-detected gender "${detectedGender}" for "${voter.name}"`);
      voter.gender = detectedGender;
      updated = true;
    }
  }
  
  if (updated) {
    updatesCount++;
  }
});

// Save updated data
fs.writeFileSync('./public/data/voters.json', JSON.stringify(voters, null, 2));

console.log('\n=== UPDATE SUMMARY ===');
console.log(`Total records updated: ${updatesCount}`);
console.log(`Total W7B1 voters: ${voters.filter(v => v.ward === "7" && v.booth === "1").length}`);

if (issuesLog.length > 0) {
  console.log('\n=== ISSUES ===');
  issuesLog.forEach(issue => console.log(issue));
}

// Generate verification report
const w7b1Voters = voters.filter(v => v.ward === "7" && v.booth === "1");
const missingAge = w7b1Voters.filter(v => !v.age || v.age === "");
const missingGender = w7b1Voters.filter(v => !v.gender || v.gender === "");
const missingName = w7b1Voters.filter(v => !v.name || v.name === "");

console.log('\n=== W7B1 DATA QUALITY ===');
console.log(`Total voters: ${w7b1Voters.length}`);
console.log(`Missing age: ${missingAge.length}`);
console.log(`Missing gender: ${missingGender.length}`);
console.log(`Missing name: ${missingName.length}`);
console.log(`Complete records: ${w7b1Voters.length - missingAge.length - missingGender.length - missingName.length}`);

// Show gender distribution
const males = w7b1Voters.filter(v => v.gender === "M").length;
const females = w7b1Voters.filter(v => v.gender === "F").length;
console.log(`\nGender: ${males}M / ${females}F (${((males/w7b1Voters.length)*100).toFixed(1)}% / ${((females/w7b1Voters.length)*100).toFixed(1)}%)`);

console.log('\n✓ Data updated successfully!');
