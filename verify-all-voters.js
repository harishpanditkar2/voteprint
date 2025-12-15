const fs = require('fs');
const path = require('path');

// Read both data sources
const currentDB = require('./public/data/voters.json');
const extractedData = require('./output/voter_data_ward_138_booth_143_2025-12-15.json');

console.log('='.repeat(80));
console.log('📊 VOTER DATA CROSS-VALIDATION REPORT');
console.log('='.repeat(80));
console.log(`\n📁 Current Database: ${currentDB.length} voters`);
console.log(`📁 Extracted PDF Data: ${extractedData.voters.length} voters\n`);

// Create maps for quick lookup
const currentMap = new Map(currentDB.map(v => [v.serialNumber, v]));
const extractedMap = new Map(extractedData.voters.map(v => [v.serialNumber, v]));

// Validation counters
let perfectMatches = 0;
let nameDiscrepancies = [];
let voterIdDiscrepancies = [];
let ageDiscrepancies = [];
let genderDiscrepancies = [];
let missingInCurrent = [];
let missingInExtracted = [];

console.log('🔍 Cross-checking all 827 voters...\n');

// Check each voter in extracted data
extractedData.voters.forEach(extracted => {
    const sn = extracted.serialNumber;
    const current = currentMap.get(sn);
    
    if (!current) {
        missingInCurrent.push({
            sn,
            voterId: extracted.voterId,
            name: extracted.name
        });
        return;
    }
    
    let hasDiscrepancy = false;
    
    // Check Voter ID
    if (current.voterId !== extracted.voterId) {
        voterIdDiscrepancies.push({
            sn,
            current: current.voterId,
            extracted: extracted.voterId,
            name: extracted.name
        });
        hasDiscrepancy = true;
    }
    
    // Check Name (normalize spaces)
    const currentName = current.name.trim().replace(/\s+/g, ' ');
    const extractedName = extracted.name.trim().replace(/\s+/g, ' ');
    if (currentName !== extractedName) {
        nameDiscrepancies.push({
            sn,
            voterId: extracted.voterId,
            current: currentName,
            extracted: extractedName
        });
        hasDiscrepancy = true;
    }
    
    // Check Age
    if (current.age !== extracted.age) {
        ageDiscrepancies.push({
            sn,
            voterId: extracted.voterId,
            name: extracted.name,
            current: current.age,
            extracted: extracted.age
        });
        hasDiscrepancy = true;
    }
    
    // Check Gender (normalize)
    const currentGender = current.gender === 'M' || current.gender === 'पुरुष' ? 'M' : 
                         current.gender === 'F' || current.gender === 'स्त्री' ? 'F' : 'O';
    const extractedGender = extracted.gender.includes('Male') || extracted.gender === 'पुरुष' ? 'M' : 
                           extracted.gender.includes('Female') || extracted.gender === 'स्त्री' ? 'F' : 'O';
    
    if (currentGender !== extractedGender) {
        genderDiscrepancies.push({
            sn,
            voterId: extracted.voterId,
            name: extracted.name,
            current: currentGender,
            extracted: extractedGender
        });
        hasDiscrepancy = true;
    }
    
    if (!hasDiscrepancy) {
        perfectMatches++;
    }
});

// Check for voters in current DB but not in extracted
currentDB.forEach(current => {
    if (!extractedMap.has(current.serialNumber)) {
        missingInExtracted.push({
            sn: current.serialNumber,
            voterId: current.voterId,
            name: current.name
        });
    }
});

// Print Results
console.log('='.repeat(80));
console.log('✅ VALIDATION RESULTS');
console.log('='.repeat(80));
console.log(`\n✅ Perfect Matches: ${perfectMatches}/${extractedData.voters.length} (${(perfectMatches/extractedData.voters.length*100).toFixed(2)}%)`);
console.log(`\n📊 DISCREPANCY SUMMARY:`);
console.log(`   ❌ Name Mismatches: ${nameDiscrepancies.length}`);
console.log(`   ❌ Voter ID Mismatches: ${voterIdDiscrepancies.length}`);
console.log(`   ❌ Age Mismatches: ${ageDiscrepancies.length}`);
console.log(`   ❌ Gender Mismatches: ${genderDiscrepancies.length}`);
console.log(`   ⚠️  Missing in Current DB: ${missingInCurrent.length}`);
console.log(`   ⚠️  Missing in Extracted: ${missingInExtracted.length}`);

// Show sample discrepancies
if (nameDiscrepancies.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('📝 NAME DISCREPANCIES (First 10):');
    console.log('='.repeat(80));
    nameDiscrepancies.slice(0, 10).forEach(d => {
        console.log(`\nSerial: ${d.sn} | Voter ID: ${d.voterId}`);
        console.log(`  Current DB:  "${d.current}"`);
        console.log(`  Extracted:   "${d.extracted}"`);
    });
}

if (voterIdDiscrepancies.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('🆔 VOTER ID DISCREPANCIES (First 10):');
    console.log('='.repeat(80));
    voterIdDiscrepancies.slice(0, 10).forEach(d => {
        console.log(`\nSerial: ${d.sn} | Name: ${d.name}`);
        console.log(`  Current DB:  ${d.current}`);
        console.log(`  Extracted:   ${d.extracted}`);
    });
}

if (ageDiscrepancies.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('🎂 AGE DISCREPANCIES (First 10):');
    console.log('='.repeat(80));
    ageDiscrepancies.slice(0, 10).forEach(d => {
        console.log(`\nSerial: ${d.sn} | ${d.name} (${d.voterId})`);
        console.log(`  Current DB: ${d.current} years | Extracted: ${d.extracted} years`);
    });
}

// Generate detailed report file
const reportPath = path.join(__dirname, 'output', 'VALIDATION_REPORT.txt');
let reportContent = `VOTER DATA VALIDATION REPORT
Generated: ${new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}
${'='.repeat(80)}

SUMMARY:
- Total Voters: ${extractedData.voters.length}
- Perfect Matches: ${perfectMatches} (${(perfectMatches/extractedData.voters.length*100).toFixed(2)}%)
- Name Discrepancies: ${nameDiscrepancies.length}
- Voter ID Discrepancies: ${voterIdDiscrepancies.length}
- Age Discrepancies: ${ageDiscrepancies.length}
- Gender Discrepancies: ${genderDiscrepancies.length}

${'='.repeat(80)}
DETAILED DISCREPANCIES:
${'='.repeat(80)}

`;

if (nameDiscrepancies.length > 0) {
    reportContent += `\nNAME DISCREPANCIES (${nameDiscrepancies.length}):\n${'-'.repeat(80)}\n`;
    nameDiscrepancies.forEach(d => {
        reportContent += `\nSN: ${d.sn} | ID: ${d.voterId}\n`;
        reportContent += `  Current:   "${d.current}"\n`;
        reportContent += `  Extracted: "${d.extracted}"\n`;
    });
}

if (voterIdDiscrepancies.length > 0) {
    reportContent += `\n\nVOTER ID DISCREPANCIES (${voterIdDiscrepancies.length}):\n${'-'.repeat(80)}\n`;
    voterIdDiscrepancies.forEach(d => {
        reportContent += `\nSN: ${d.sn} | Name: ${d.name}\n`;
        reportContent += `  Current:   ${d.current}\n`;
        reportContent += `  Extracted: ${d.extracted}\n`;
    });
}

if (ageDiscrepancies.length > 0) {
    reportContent += `\n\nAGE DISCREPANCIES (${ageDiscrepancies.length}):\n${'-'.repeat(80)}\n`;
    ageDiscrepancies.forEach(d => {
        reportContent += `\nSN: ${d.sn} | ${d.name} (${d.voterId})\n`;
        reportContent += `  Current: ${d.current} years | Extracted: ${d.extracted} years\n`;
    });
}

fs.writeFileSync(reportPath, reportContent, 'utf-8');

console.log('\n' + '='.repeat(80));
console.log(`📄 Detailed report saved: ${reportPath}`);
console.log('='.repeat(80));

// Summary recommendation
console.log('\n💡 RECOMMENDATION:');
if (perfectMatches === extractedData.voters.length) {
    console.log('   ✅ All data matches perfectly! Database is accurate.');
} else {
    const accuracy = (perfectMatches/extractedData.voters.length*100).toFixed(2);
    console.log(`   ⚠️  Data accuracy: ${accuracy}%`);
    if (nameDiscrepancies.length > 0 || voterIdDiscrepancies.length > 0) {
        console.log('   🔧 Critical discrepancies found. Consider updating database.');
    } else {
        console.log('   ℹ️  Minor discrepancies only. Database is acceptable.');
    }
}
console.log('\n');
