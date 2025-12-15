const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfParser = new PDFParser();

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
  const text = pdfParser.getRawTextContent();
  console.log('Total text length:', text.length);
  console.log('\nFirst 1000 characters:');
  console.log(text.substring(0, 1000));
  console.log('\n---\n');
  
  // Check for voter IDs
  const ids = text.match(/XUA\d{7}/g);
  console.log('Found voter IDs:', ids ? ids.length : 0);
  if (ids) {
    console.log('First 5 IDs:', ids.slice(0, 5));
  }
});

pdfParser.loadPDF('./pdflist/BoothVoterList_A4_Ward_7_Booth_1 - converted.pdf');
