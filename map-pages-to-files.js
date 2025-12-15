const fs = require('fs');
const path = require('path');

console.log('=== Mapping OCR Pages to Source Files ===\n');

// Read voters data
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));
const ward7Voters = voters.filter(v => v.actualWard === '7' || v.expectedWard === '7');

// Check image directories
const imageDirs = ['pdflist/images/prabhag7ward1', 'pdflist/images/prabhag7ward2', 'pdflist/images/prabhag7ward3'];
const allImages = {};

imageDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));
    allImages[dir] = files;
    console.log(`${dir}: ${files.length} pages`);
  }
});

console.log('\n=== File Reference Analysis ===\n');

// Group by file reference
const fileGroups = { 'W7F1': [], 'W7F2': [], 'W7F3': [] };
ward7Voters.forEach(v => {
  if (v.fileReference) {
    fileGroups[v.fileReference].push(v);
  }
});

Object.entries(fileGroups).forEach(([ref, voters]) => {
  const withData = voters.filter(v => v.name && v.name.trim());
  const pages = [...new Set(voters.map(v => v.pageNumber))].sort((a,b) => a-b);
  console.log(`${ref}: ${voters.length} voters (${withData.length} with data)`);
  console.log(`  Pages: ${Math.min(...pages)}-${Math.max(...pages)} (${pages.length} unique pages)`);
  console.log(`  Expected pages: ${ref === 'W7F1' ? '~30' : '~27'} pages`);
  console.log('');
});

// The issue: All 73 pages are from "Booth 1" but contain data from all 3 files
console.log('=== CRITICAL FINDING ===\n');
console.log('All 73 OCR page images are from "BoothVoterList_A4_Ward_7_Booth_1 - converted"');
console.log('But the database has voters from W7F1, W7F2, and W7F3');
console.log('');
console.log('This means:');
console.log('1. The original extraction combined all 3 PDFs into these 73 pages');
console.log('2. OR we need to find the other 2 PDFs pages separately');
console.log('3. Page numbering (1-73) spans across all 3 files');
console.log('');

// Check page distribution per file
console.log('=== Page Distribution Per File ===\n');
Object.entries(fileGroups).forEach(([ref, voters]) => {
  const pageGroups = {};
  voters.filter(v => v.name && v.name.trim()).forEach(v => {
    if (!pageGroups[v.pageNumber]) pageGroups[v.pageNumber] = [];
    pageGroups[v.pageNumber].push(v);
  });
  
  console.log(`${ref}:`);
  const pages = Object.keys(pageGroups).map(p => parseInt(p)).sort((a,b) => a-b);
  console.log(`  Pages with data: ${pages.slice(0, 10).join(', ')}${pages.length > 10 ? '...' : ''}`);
  console.log(`  First page: ${pages[0]}, Last page: ${pages[pages.length-1]}`);
  
  // Calculate expected page range
  if (ref === 'W7F1') {
    console.log(`  Expected: Pages 1-30 (991 voters / ~33 per page)`);
  } else if (ref === 'W7F2') {
    console.log(`  Expected: Pages 31-56 (861 voters / ~33 per page)`);
  } else if (ref === 'W7F3') {
    console.log(`  Expected: Pages 57-83 (863 voters / ~33 per page)`);
  }
  console.log('');
});

// Conclusion
console.log('=== SOLUTION ===\n');
console.log('The 73 OCR pages are sequentially processed from 3 concatenated PDFs:');
console.log('  Pages 1-30 (approx): W7F1 (991 voters)');
console.log('  Pages 31-56 (approx): W7F2 (861 voters)');
console.log('  Pages 57-73 (approx): W7F3 (863 voters)');
console.log('');
console.log('The issue is that fileReference assignment logic was incorrect.');
console.log('Voters need to be re-assigned based on their actual page number:');
console.log('  Page 1-30 → W7F1');
console.log('  Page 31-56 → W7F2');
console.log('  Page 57-73 → W7F3');
console.log('');
console.log('Serial numbers should then restart within each page range.');
