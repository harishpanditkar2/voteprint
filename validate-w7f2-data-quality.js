const fs = require('fs');

// Read the voters data
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));

// Filter W7F2 voters
const w7f2Voters = voters.filter(v => v.booth === '2');

console.log(`\n📊 W7F2 Data Quality Report`);
console.log(`Total W7F2 Voters: ${w7f2Voters.length}`);
console.log(`Expected: 861\n`);

// Check for undefined ages
const undefinedAges = w7f2Voters.filter(v => v.age === undefined || v.age === null || isNaN(v.age));
if (undefinedAges.length > 0) {
    console.log(`❌ UNDEFINED AGES (${undefinedAges.length}):`);
    undefinedAges.forEach(v => {
        console.log(`  Serial ${v.serial}: ${v.name} (ID: ${v.voterId})`);
    });
    console.log('');
}

// Check for undefined genders
const undefinedGenders = w7f2Voters.filter(v => v.gender === undefined || v.gender === null);
if (undefinedGenders.length > 0) {
    console.log(`❌ UNDEFINED GENDERS (${undefinedGenders.length}):`);
    undefinedGenders.forEach(v => {
        console.log(`  Serial ${v.serial}: ${v.name} (ID: ${v.voterId})`);
    });
    console.log('');
}

// Check for unrealistic ages (>120 or <18)
const unrealisticAges = w7f2Voters.filter(v => v.age > 120 || v.age < 0);
if (unrealisticAges.length > 0) {
    console.log(`❌ UNREALISTIC AGES (${unrealisticAges.length}):`);
    unrealisticAges.forEach(v => {
        console.log(`  Serial ${v.serial}: ${v.name}, Age: ${v.age} (ID: ${v.voterId})`);
    });
    console.log('');
}

// Check for duplicate voter IDs
const voterIdMap = {};
const duplicateIds = [];
w7f2Voters.forEach(v => {
    if (voterIdMap[v.voterId]) {
        duplicateIds.push(v.voterId);
    }
    voterIdMap[v.voterId] = (voterIdMap[v.voterId] || 0) + 1;
});

if (duplicateIds.length > 0) {
    console.log(`❌ DUPLICATE VOTER IDs (${duplicateIds.length}):`);
    duplicateIds.forEach(id => {
        const voters = w7f2Voters.filter(v => v.voterId === id);
        console.log(`  ID ${id} appears ${voterIdMap[id]} times:`);
        voters.forEach(v => {
            console.log(`    Serial ${v.serial}: ${v.name}`);
        });
    });
    console.log('');
}

// Check for duplicate serials
const serialMap = {};
const duplicateSerials = [];
w7f2Voters.forEach(v => {
    if (serialMap[v.serial]) {
        duplicateSerials.push(v.serial);
    }
    serialMap[v.serial] = (serialMap[v.serial] || 0) + 1;
});

if (duplicateSerials.length > 0) {
    console.log(`❌ DUPLICATE SERIALS (${duplicateSerials.length}):`);
    duplicateSerials.forEach(serial => {
        const voters = w7f2Voters.filter(v => v.serial === serial);
        console.log(`  Serial ${serial} appears ${serialMap[serial]} times:`);
        voters.forEach(v => {
            console.log(`    ${v.name} (ID: ${v.voterId})`);
        });
    });
    console.log('');
}

// Check for missing names
const missingNames = w7f2Voters.filter(v => !v.name || v.name.trim() === '');
if (missingNames.length > 0) {
    console.log(`❌ MISSING NAMES (${missingNames.length}):`);
    missingNames.forEach(v => {
        console.log(`  Serial ${v.serial}: (ID: ${v.voterId})`);
    });
    console.log('');
}

// Check for invalid gender values
const validGenders = ['M', 'F', 'पु', 'स्री'];
const invalidGenders = w7f2Voters.filter(v => v.gender && !validGenders.includes(v.gender));
if (invalidGenders.length > 0) {
    console.log(`❌ INVALID GENDERS (${invalidGenders.length}):`);
    invalidGenders.forEach(v => {
        console.log(`  Serial ${v.serial}: ${v.name}, Gender: "${v.gender}" (ID: ${v.voterId})`);
    });
    console.log('');
}

// Summary
const totalIssues = undefinedAges.length + undefinedGenders.length + 
                   unrealisticAges.length + duplicateIds.length + 
                   duplicateSerials.length + missingNames.length + invalidGenders.length;

console.log(`\n${'='.repeat(60)}`);
if (totalIssues === 0) {
    console.log('✅✅✅ DATA QUALITY CHECK PASSED: No issues found!');
} else {
    console.log(`❌ DATA QUALITY CHECK FAILED: ${totalIssues} issue(s) found`);
}
console.log(`${'='.repeat(60)}\n`);
