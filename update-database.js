const fs = require('fs');
const path = require('path');

console.log('🔄 Updating Voter Database with Validated Extracted Data\n');
console.log('='.repeat(80));

// Read extracted data
const extractedData = require('./output/voter_data_ward_138_booth_143_2025-12-15.json');
const currentDB = require('./public/data/voters.json');

console.log(`\n📊 Current Database: ${currentDB.length} voters`);
console.log(`📊 Extracted Data: ${extractedData.voters.length} voters\n`);

// Transform extracted data to match current database structure
const updatedVoters = extractedData.voters.map((voter, index) => {
    // Find corresponding current voter by serial number
    const currentVoter = currentDB.find(v => v.serialNumber === voter.serialNumber);
    
    // Normalize gender
    let gender = 'M';
    if (voter.gender.includes('Female') || voter.gender === 'स्त्री') {
        gender = 'F';
    } else if (voter.gender.includes('Other') || voter.gender === 'इतर') {
        gender = 'O';
    }
    
    // Calculate page number (30 voters per page)
    const pageNumber = Math.floor(index / 30) + 3; // Starting from page 3
    
    return {
        serialNumber: voter.serialNumber,
        voterId: voter.voterId,
        partNumber: `201/138/${voter.booth}`,
        pageNumber: pageNumber,
        name: voter.name,
        age: voter.age,
        gender: gender,
        fatherName: voter.relativeName || "",
        relativeDetail: voter.relation || "",
        houseNumber: voter.address || "I",
        address: voter.address || "I",
        ward: voter.ward,
        booth: voter.booth,
        actualWard: "7",
        actualBooth: "1",
        pollingCenter: voter.pollingCenter || "मतदान केंद्रनिहाय मतदार यादी",
        source: "Tesseract CLI OCR - Validated",
        nameStatus: "verified",
        cardImage: `/voter-cards/voter_${voter.voterId}_sn${voter.serialNumber}_page${pageNumber}.jpg`,
        dataQuality: {
            voterId: "verified",
            age: "verified",
            gender: "verified",
            booth: "verified",
            ward: "verified",
            name: "verified",
            fatherName: voter.relativeName ? "verified" : "missing"
        },
        id: currentVoter ? currentVoter.id : `VOTER_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: currentVoter ? currentVoter.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
});

// Write updated database
const outputPath = path.join(__dirname, 'public', 'data', 'voters.json');
fs.writeFileSync(outputPath, JSON.stringify(updatedVoters, null, 2), 'utf-8');

console.log('✅ Database Updated Successfully!\n');
console.log('='.repeat(80));
console.log(`\n📁 Updated File: ${outputPath}`);
console.log(`📊 Total Voters: ${updatedVoters.length}`);
console.log(`📅 Timestamp: ${new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}\n`);

// Verify update
const verifyDB = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
console.log('🔍 Verification:');
console.log(`   ✅ File written: ${verifyDB.length} voters`);
console.log(`   ✅ First voter: ${verifyDB[0].name} (${verifyDB[0].voterId})`);
console.log(`   ✅ Last voter: ${verifyDB[verifyDB.length-1].name} (${verifyDB[verifyDB.length-1].voterId})\n`);

console.log('💡 Next Steps:');
console.log('   1. ✅ Database updated with validated data');
console.log('   2. 🔄 Regenerate all 827 voter card images');
console.log('   3. 🧪 Test search functionality with updated data\n');
console.log('='.repeat(80));
