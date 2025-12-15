const fs = require('fs');

// Read a sample OCR file
const ocrText = fs.readFileSync('./ward7-reextraction-output/page003_ocr.txt', 'utf8');

console.log('Testing name extraction patterns:\n');

// Pattern 1: Original (between "मतदाराचे पूर्ण:" and next keyword)
const pattern1 = /मतदाराचे\s+पूर्ण\s*[:]*\s*([\u0900-\u097F\s]+?)\s*नांव/g;
let matches1 = [];
let match;
while ((match = pattern1.exec(ocrText)) !== null) {
  matches1.push(match[1].trim());
}

console.log('Pattern 1 (current): मतदाराचे पूर्ण ... नांव');
console.log(`Found: ${matches1.length} names`);
matches1.slice(0, 5).forEach((n, i) => console.log(`  ${i+1}. ${n}`));

// Pattern 2: Alternative
const pattern2 = /मतदाराचे\s+पूर्ण[:\s]*([\u0900-\u097F\s]+?)\s+नांव/g;
let matches2 = [];
while ((match = pattern2.exec(ocrText)) !== null) {
  matches2.push(match[1].trim());
}

console.log('\nPattern 2: मतदाराचे पूर्ण <name> नांव');
console.log(`Found: ${matches2.length} names`);
matches2.slice(0, 5).forEach((n, i) => console.log(`  ${i+1}. ${n}`));

// Pattern 3: Look at what's actually in the text
console.log('\n=== Sample OCR Text ===');
const lines = ocrText.split('\n').filter(l => l.includes('मतदाराचे'));
lines.slice(0, 3).forEach(l => {
  console.log(l.substring(0, 120));
});

// Pattern 4: Split on colon
console.log('\n=== Trying colon split ===');
const pattern4 = /मतदाराचे\s+पूर्ण\s*[:]([\u0900-\u097F\s]+?)\s+नांव/g;
let matches4 = [];
while ((match = pattern4.exec(ocrText)) !== null) {
  matches4.push(match[1].trim());
}
console.log(`Found: ${matches4.length} names`);
matches4.slice(0, 5).forEach((n, i) => console.log(`  ${i+1}. ${n}`));
