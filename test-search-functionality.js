const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Search Functionality\n');
console.log('='.repeat(80));

// Load voters database
const voters = require('./public/data/voters.json');
console.log(`\n📊 Database loaded: ${voters.length} voters`);

// Test search by name
console.log('\n🔎 Test 1: Search by Name "गजानन"');
const nameResults = voters.filter(v => v.name.includes('गजानन'));
console.log(`   Found ${nameResults.length} matches:`);
nameResults.slice(0, 5).forEach(v => {
    console.log(`   - ${v.serialNumber}. ${v.name} (${v.voterId})`);
});

// Test search by voter ID
console.log('\n🔎 Test 2: Search by Voter ID "XUA7224868"');
const idResult = voters.find(v => v.voterId === 'XUA7224868');
if (idResult) {
    console.log(`   ✅ Found: ${idResult.name}`);
    console.log(`      Serial: ${idResult.serialNumber}`);
    console.log(`      Age: ${idResult.age}`);
    console.log(`      Gender: ${idResult.gender}`);
    console.log(`      Page: ${idResult.pageNumber}`);
} else {
    console.log('   ❌ Not found');
}

// Test search the corrected voter (Serial 146)
console.log('\n🔎 Test 3: Search Serial 146 (Previously incorrect)');
const serial146 = voters.find(v => v.serialNumber === '146');
if (serial146) {
    console.log(`   ✅ Found: ${serial146.name} (${serial146.voterId})`);
    console.log(`      Expected: अंजुम गणी बागवान (XUA7224645)`);
    console.log(`      Match: ${serial146.name === 'अंजुम गणी बागवान' && serial146.voterId === 'XUA7224645' ? '✅ CORRECT!' : '❌ MISMATCH'}`);
}

// Test pagination - get page 1 (first 30 voters)
console.log('\n📄 Test 4: Pagination - Page 1 (First 30 voters)');
const page1 = voters.filter(v => v.pageNumber === 3).slice(0, 30);
console.log(`   Found ${page1.length} voters on page 3`);
console.log(`   First: ${page1[0].serialNumber}. ${page1[0].name}`);
console.log(`   Last: ${page1[page1.length-1].serialNumber}. ${page1[page1.length-1].name}`);

// Test gender filter
console.log('\n👥 Test 5: Gender Distribution');
const males = voters.filter(v => v.gender === 'M').length;
const females = voters.filter(v => v.gender === 'F').length;
const others = voters.filter(v => v.gender === 'O').length;
console.log(`   Male: ${males} (${(males/voters.length*100).toFixed(1)}%)`);
console.log(`   Female: ${females} (${(females/voters.length*100).toFixed(1)}%)`);
console.log(`   Other: ${others} (${(others/voters.length*100).toFixed(1)}%)`);

// Test age range
console.log('\n🎂 Test 6: Age Range Filter (18-30)');
const youngVoters = voters.filter(v => {
    const age = parseInt(v.age);
    return age >= 18 && age <= 30;
});
console.log(`   Found ${youngVoters.length} voters aged 18-30`);
console.log(`   Sample: ${youngVoters.slice(0, 3).map(v => `${v.name} (${v.age})`).join(', ')}`);

// Verify all pages have voters
console.log('\n📄 Test 7: Verify All Pages');
const pageStats = {};
voters.forEach(v => {
    if (!pageStats[v.pageNumber]) {
        pageStats[v.pageNumber] = 0;
    }
    pageStats[v.pageNumber]++;
});
const pages = Object.keys(pageStats).sort((a, b) => parseInt(a) - parseInt(b));
console.log(`   Total pages with voters: ${pages.length}`);
console.log(`   Page range: ${pages[0]} to ${pages[pages.length-1]}`);
console.log(`   All pages have voters: ${pages.length === 28 ? '✅ YES' : '❌ NO'}`);

// Check for card images
console.log('\n🖼️ Test 8: Voter Card Images');
const withImages = voters.filter(v => v.cardImage && v.cardImage !== '').length;
console.log(`   Voters with card images: ${withImages}/${voters.length}`);
console.log(`   Image path format: ${voters[0].cardImage}`);

console.log('\n' + '='.repeat(80));
console.log('✅ ALL TESTS COMPLETED');
console.log('='.repeat(80));
console.log('\n💡 Ready to test on web interface:');
console.log('   🌐 Search Page: http://localhost:3000/search');
console.log('   📝 Upload Page: http://localhost:3000/upload');
console.log('   🏠 Home Page: http://localhost:3000\n');
