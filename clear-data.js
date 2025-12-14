const fs = require('fs');
const path = require('path');

// Clear voters.json
const votersPath = path.join(__dirname, 'public', 'data', 'voters.json');
fs.writeFileSync(votersPath, '[]', 'utf8');

console.log('✅ Cleared public/data/voters.json');
console.log('📤 Ready for fresh upload with OCR text cleaning');
