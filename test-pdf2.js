const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function test() {
  const buf = fs.readFileSync('./pdflist/BoothVoterList_A4_Ward_7_Booth_1 - converted.pdf');
  const parser = new PDFParse(buf);
  const data = await parser.parse();
  
  console.log('Success! Pages:', data.info.numPages);
  console.log('Text length:', data.text.length);
  console.log('First 500 chars:');
  console.log(data.text.substring(0, 500));
}

test().catch(e => console.error('Error:', e.message));
