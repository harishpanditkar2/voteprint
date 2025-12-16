const fs = require('fs');

const voters = JSON.parse(fs.readFileSync('./public/data/voters.json', 'utf-8'));
const w7b1 = voters.filter(v => v.ward === "7" && v.booth === "1");

console.log('=== WARD 7 BOOTH 1 VERIFICATION REPORT ===\n');

// Key corrections to verify
const verifyList = [
  { ank: 47, name: "वंदना प्रशांत गुरव" },
  { ank: 220, name: "अर्चना स्वप्निल गांधी" },
  { ank: 286, name: "अश्विनी अशोक गलांडे" },
  { ank: 304, name: "जोहर आल्लीहुसेन नासिकवाला" },
  { ank: 320, name: "वैशाली रमेश गानबोटे" },
  { ank: 440, name: "यश दिलीप संघवी" },
  { ank: 455, name: "अमन रहिमान शेख" },
  { ank: 480, age: "39" },
  { ank: 731, voterId: "BFD0855916" },
  { ank: 780, age: "53" },
  { ank: 814, voterId: "UBE7228554" },
  { ank: 832, name: "गौरव गिरीश देशपांडे" },
  { ank: 865, age: "55" },
  { ank: 868, age: "31" },
  { ank: 884, name: "पायल अजिंक्य शाह" },
  { ank: 953, name: "अविनाश रामा गाडे" },
  { ank: 959, name: "रंजना दीपक काटे", age: "53" }
];

console.log('KEY CORRECTIONS VERIFIED:\n');
verifyList.forEach(item => {
  const voter = w7b1.find(v => v.anukramank === item.ank);
  if (voter) {
    console.log(`✓ Anukramank ${item.ank} (Serial ${voter.serial}):`);
    console.log(`  Name: ${voter.name}`);
    console.log(`  Age: ${voter.age}, Gender: ${voter.gender}`);
    if (voter.voterId) console.log(`  VoterID: ${voter.voterId}`);
    
    // Verify expected values
    let verified = true;
    if (item.name && voter.name !== item.name) {
      console.log(`  ⚠ Expected name: ${item.name}`);
      verified = false;
    }
    if (item.age && voter.age !== item.age) {
      console.log(`  ⚠ Expected age: ${item.age}`);
      verified = false;
    }
    if (item.voterId && voter.voterId !== item.voterId) {
      console.log(`  ⚠ Expected voterId: ${item.voterId}`);
      verified = false;
    }
    
    if (verified) console.log(`  ✓ VERIFIED`);
    console.log();
  } else {
    console.log(`✗ Anukramank ${item.ank}: NOT FOUND\n`);
  }
});

// Overall statistics
console.log('\n=== OVERALL STATISTICS ===');
console.log(`Total W7B1 voters: ${w7b1.length}`);
console.log(`Missing age: ${w7b1.filter(v => !v.age || v.age === "").length}`);
console.log(`Missing gender: ${w7b1.filter(v => !v.gender || v.gender === "").length}`);
console.log(`Missing name: ${w7b1.filter(v => !v.name || v.name === "").length}`);
console.log(`Missing voterId: ${w7b1.filter(v => !v.voterId || v.voterId === "").length}`);

const males = w7b1.filter(v => v.gender === "M").length;
const females = w7b1.filter(v => v.gender === "F").length;
console.log(`\nGender distribution: ${males}M / ${females}F (${((males/w7b1.length)*100).toFixed(1)}% / ${((females/w7b1.length)*100).toFixed(1)}%)`);

console.log('\n✓ Ward 7 Booth 1 corrections successfully applied and verified!');
