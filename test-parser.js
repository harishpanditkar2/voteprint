const fs = require('fs');

function extractVotersFromPage(pagePath) {
  const text = fs.readFileSync(pagePath, 'utf8');

  // Regex to match voter entries
  // Pattern: optional serial number, XUA ID, code, मतदाराचे पूर्ण : name, then details
  const voterRegex = /(\d+)?\s*XUA(\d+)\s+\d+\/\d+\/\d+\s*मतदाराचे पूर्ण\s*:\s*([^\n]+?)(?:\n|$)/g;

  const voters = [];
  let match;

  while ((match = voterRegex.exec(text)) !== null) {
    const serial = match[1] || '';
    const voterId = 'XUA' + match[2];
    const namePart = match[3].trim();

    // Extract name, age, gender from the following text
    const afterMatch = text.substring(match.index + match[0].length);
    const ageMatch = afterMatch.match(/वय\s*:\s*(\d+)/);
    const genderMatch = afterMatch.match(/लिंग\s*:\s*(पु|स्री|स्त्री|महिला|पुरुष)/);

    const age = ageMatch ? ageMatch[1] : '';
    const genderRaw = genderMatch ? genderMatch[1] : '';
    const gender = genderRaw === 'पु' || genderRaw === 'पुरुष' ? 'M' : (genderRaw === 'स्री' || genderRaw === 'स्त्री' || genderRaw === 'महिला' ? 'F' : '');

    // Clean name
    let name = namePart.replace(/नांव/g, '').trim();
    name = name.replace(/\[.*?\]/g, '').trim();

    if (name) {
      voters.push({
        serial: serial || (voters.length + 1).toString(),
        voterId,
        name,
        age,
        gender
      });
    }
  }

  return voters;
}

// Test with page001
const voters = extractVotersFromPage('./ward7-w7f2-output/page001.txt');

console.log('Extracted voters:');
voters.forEach(v => {
  console.log(`${v.serial} | ${v.voterId} | ${v.name} | ${v.age} | ${v.gender}`);
});