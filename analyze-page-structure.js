const fs = require('fs');
const path = require('path');

console.log('=== Analyzing OCR Page Structure ===\n');

// Read current voters data
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));
const ward7Voters = voters.filter(v => v.actualWard === '7' || v.expectedWard === '7');

console.log('Current Ward 7 voters:', ward7Voters.length);
console.log('');

// Analyze page structure
console.log('=== Page Analysis ===\n');

// Group by page and check for issues
const pageGroups = {};
ward7Voters.forEach(v => {
  if (!pageGroups[v.pageNumber]) {
    pageGroups[v.pageNumber] = [];
  }
  pageGroups[v.pageNumber].push(v);
});

// Check each page
const issues = [];
Object.keys(pageGroups).sort((a,b) => parseInt(a) - parseInt(b)).forEach(pageNum => {
  const votersOnPage = pageGroups[pageNum];
  const withData = votersOnPage.filter(v => v.name && v.name.trim());
  
  if (withData.length === 0) return;
  
  // Check for duplicate serials on same page
  const serials = withData.map(v => v.serialNumber);
  const serialCounts = {};
  serials.forEach(s => serialCounts[s] = (serialCounts[s] || 0) + 1);
  const duplicates = Object.entries(serialCounts).filter(([s, count]) => count > 1);
  
  if (duplicates.length > 0) {
    issues.push({
      page: pageNum,
      issue: 'duplicate_serials',
      count: duplicates.length,
      serials: duplicates.map(([s]) => s)
    });
  }
  
  // Check for non-sequential serials
  const sortedSerials = serials.map(s => parseInt(s)).sort((a,b) => a-b);
  const range = sortedSerials[sortedSerials.length - 1] - sortedSerials[0];
  if (range > 100) {
    issues.push({
      page: pageNum,
      issue: 'wide_serial_range',
      range: range,
      min: sortedSerials[0],
      max: sortedSerials[sortedSerials.length - 1]
    });
  }
});

console.log('Total issues found:', issues.length);
console.log('');

// Report top issues
console.log('=== Top Page Issues ===\n');
issues.slice(0, 10).forEach(issue => {
  if (issue.issue === 'duplicate_serials') {
    console.log(`Page ${issue.page}: ${issue.count} duplicate serial numbers`);
    console.log(`  Duplicates: ${issue.serials.join(', ')}`);
  } else if (issue.issue === 'wide_serial_range') {
    console.log(`Page ${issue.page}: Serial range ${issue.min}-${issue.max} (span: ${issue.range})`);
  }
  console.log('');
});

// Check specific pages
console.log('=== Detailed Page 3 Analysis ===\n');
const page3 = pageGroups['3'] || [];
const page3WithData = page3.filter(v => v.name && v.name.trim()).sort((a,b) => parseInt(a.serialNumber) - parseInt(b.serialNumber));
console.log('Total voters on page 3:', page3WithData.length);
console.log('Serial range:', Math.min(...page3WithData.map(v => parseInt(v.serialNumber))), '-', Math.max(...page3WithData.map(v => parseInt(v.serialNumber))));
console.log('');
console.log('First 10 voters:');
page3WithData.slice(0, 10).forEach(v => {
  console.log(`  Serial ${v.serialNumber}: ${v.name} (${v.voterId})`);
});

// Expected structure: Each page should have approximately 30-40 sequential voters
console.log('\n=== Expected vs Actual Structure ===\n');
console.log('Standard PDF voter list page contains ~30-40 voters in sequence');
console.log('Current data shows mixed serial numbers across pages');
console.log('');

// Identify the root cause
console.log('=== Root Cause Analysis ===\n');
console.log('Issue: Serial numbers are being extracted incorrectly or mixed up');
console.log('The PDF pages show serial numbers printed on each voter card');
console.log('These need to be extracted properly from the card images, not the page header');
console.log('');
console.log('Action needed:');
console.log('1. Re-parse voter cards from OCR images');
console.log('2. Extract serial number from each individual voter card');
console.log('3. Ensure proper sequence per file (W7F1: 1-991, W7F2: 1-861, W7F3: 1-863)');
console.log('4. Fix card image cropping to match voter boundaries');

// Export problematic pages for review
const problemPages = issues.map(i => parseInt(i.page)).slice(0, 20);
fs.writeFileSync('ward7-problem-pages.json', JSON.stringify({
  issues: issues,
  problemPages: problemPages,
  summary: {
    totalIssues: issues.length,
    duplicateSerials: issues.filter(i => i.issue === 'duplicate_serials').length,
    wideRanges: issues.filter(i => i.issue === 'wide_serial_range').length
  }
}, null, 2));

console.log('\n✓ Problem analysis saved to: ward7-problem-pages.json');
