const text = `मतदाराचे पूर्ण:रोहिणी लालासाहेब गाडेकर मतदाराचे पूर्ण: रणजीत लालासाहेब गाडेकर मतदाराचे पूर्ण: कामिनी शैलेश गलांडे`;

const namePattern = /मतदाराचे\s+पूर्ण\s*[:\s]+([\u0900-\u097F]+(?:\s+[\u0900-\u097F]+)*?)(?=\s+(?:मतदाराचे|नांव|वडि|पती|\n|$))/g;

const matches = [];
let match;
while ((match = namePattern.exec(text)) !== null) {
  matches.push(match[1]);
}

console.log(`Found ${matches.length} names:`);
matches.forEach((name, i) => {
  console.log(`${i + 1}. ${name}`);
});
