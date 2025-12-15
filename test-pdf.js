const fs = require('fs');
const pdf = require('pdf-parse');

async function test() {
  const buf = fs.readFileSync('./pdflist/BoothVoterList_A4_Ward_7_Booth_1 - converted.pdf');
  console.log('Loaded PDF, size:', buf.length);
  console.log('pdf module type:', typeof pdf);
  console.log('pdf.default type:', typeof pdf.default);
  
  let data;
  if (typeof pdf === 'function') {
    data = await pdf(buf);
  } else if (typeof pdf.default === 'function') {
    data = await pdf.default(buf);
  } else {
    console.log('Available keys:', Object.keys(pdf));
    return;
  }
  
  console.log('Pages:', data.numpages);
  console.log('Text length:', data.text.length);
  console.log('First 500 chars:', data.text.substring(0, 500));
}

test().catch(e => console.error('Error:', e.message));
