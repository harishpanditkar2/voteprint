const fs = require('fs');

// Read the voters database
const voters = JSON.parse(fs.readFileSync('public/data/voters.json', 'utf8'));

// Get all Ward 7 voters (actualWard or expectedWard = 7)
const ward7Voters = voters.filter(v => 
  v.actualWard === '7' || v.expectedWard === '7' || v.ward === '7'
);

console.log(`Total Ward 7 voters: ${ward7Voters.length}`);
console.log('');

// Group by booth
const byBooth = {};
ward7Voters.forEach(v => {
  const booth = v.actualBooth || v.booth;
  if (!byBooth[booth]) byBooth[booth] = [];
  byBooth[booth].push(v);
});

console.log('=== Ward 7 Voters by Booth ===');
Object.keys(byBooth).sort((a, b) => parseInt(a) - parseInt(b)).forEach(booth => {
  const votersInBooth = byBooth[booth];
  const serials = votersInBooth.map(v => parseInt(v.serialNumber)).sort((a, b) => a - b);
  const maxSerial = Math.max(...serials);
  
  console.log(`\nBooth ${booth}: ${votersInBooth.length} voters`);
  console.log(`  Serial range: ${serials[0]} to ${maxSerial}`);
  
  // Check for duplicates
  const serialCounts = {};
  serials.forEach(s => {
    serialCounts[s] = (serialCounts[s] || 0) + 1;
  });
  
  const duplicates = Object.entries(serialCounts).filter(([s, count]) => count > 1);
  if (duplicates.length > 0) {
    console.log(`  ⚠️ DUPLICATES: ${duplicates.map(([s, c]) => `Serial ${s} (x${c})`).join(', ')}`);
  }
  
  // Check for gaps
  const gaps = [];
  for (let i = 1; i <= maxSerial; i++) {
    if (!serials.includes(i)) {
      gaps.push(i);
    }
  }
  
  if (gaps.length > 0) {
    console.log(`  ⚠️ GAPS: ${gaps.length} missing serials`);
    if (gaps.length <= 20) {
      console.log(`     Missing: ${gaps.join(', ')}`);
    }
  }
});

// Analyze by page numbers to identify files
console.log('\n\n=== Analyzing by Page Numbers (to identify files) ===');
const pageNumbers = [...new Set(ward7Voters.map(v => v.pageNumber))].sort((a, b) => a - b);
console.log(`Page numbers in Ward 7: ${pageNumbers.join(', ')}`);

// Try to identify file boundaries
console.log('\n=== Grouping by likely file source ===');
ward7Voters.sort((a, b) => a.pageNumber - b.pageNumber);

// Group by page ranges
const file1 = ward7Voters.filter(v => v.pageNumber <= 30); // Assuming ~991 voters in ~30 pages
const file2 = ward7Voters.filter(v => v.pageNumber > 30 && v.pageNumber <= 60);
const file3 = ward7Voters.filter(v => v.pageNumber > 60);

console.log(`\nFile 1 (pages 1-30): ${file1.length} voters`);
if (file1.length > 0) {
  const f1Serials = file1.map(v => parseInt(v.serialNumber)).sort((a, b) => a - b);
  console.log(`  Serial range: ${Math.min(...f1Serials)} to ${Math.max(...f1Serials)}`);
  console.log(`  Booths: ${[...new Set(file1.map(v => v.actualBooth || v.booth))].sort().join(', ')}`);
}

console.log(`\nFile 2 (pages 31-60): ${file2.length} voters`);
if (file2.length > 0) {
  const f2Serials = file2.map(v => parseInt(v.serialNumber)).sort((a, b) => a - b);
  console.log(`  Serial range: ${Math.min(...f2Serials)} to ${Math.max(...f2Serials)}`);
  console.log(`  Booths: ${[...new Set(file2.map(v => v.actualBooth || v.booth))].sort().join(', ')}`);
}

console.log(`\nFile 3 (pages 61+): ${file3.length} voters`);
if (file3.length > 0) {
  const f3Serials = file3.map(v => parseInt(v.serialNumber)).sort((a, b) => a - b);
  console.log(`  Serial range: ${Math.min(...f3Serials)} to ${Math.max(...f3Serials)}`);
  console.log(`  Booths: ${[...new Set(file3.map(v => v.actualBooth || v.booth))].sort().join(', ')}`);
}

// Check first page of each potential file for booth info
console.log('\n\n=== First Page Analysis ===');
const page3Voters = ward7Voters.filter(v => v.pageNumber === 3);
console.log(`\nPage 3 (likely File 1 start):`);
console.log(`  Voters: ${page3Voters.length}`);
if (page3Voters.length > 0) {
  page3Voters.slice(0, 5).forEach(v => {
    console.log(`    Serial ${v.serialNumber}: ${v.name} - Booth ${v.actualBooth || v.booth}`);
  });
}
