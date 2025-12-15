const fs = require('fs');
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');

// Try different approaches to read PDF
async function checkPDF() {
  const pdfPath = './pdflist/page2.pdf';
  
  console.log('🔍 Checking page2.pdf...\n');
  
  // Check if file exists
  if (!fs.existsSync(pdfPath)) {
    console.log('❌ File not found!');
    return;
  }
  
  const stats = fs.statSync(pdfPath);
  console.log(`✅ File exists: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`   Path: ${pdfPath}\n`);
  
  // Try pdfjs-dist
  try {
    const dataBuffer = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjs.getDocument({ data: dataBuffer });
    const pdfDoc = await loadingTask.promise;
    
    console.log('📄 PDF INFORMATION:');
    console.log('='.repeat(70));
    console.log(`Pages: ${pdfDoc.numPages}`);
    
    // Extract text from first page
    const page = await pdfDoc.getPage(1);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(' ');
    
    console.log(`Characters: ${text.length}`);
    console.log('='.repeat(70));
    
    // Show first 1000 characters
    console.log('\n📝 FIRST 1000 CHARACTERS:\n');
    console.log(text.substring(0, 1000));
    console.log('\n...\n');
    
    // Check for proper Marathi
    const hasProperAa = /[क-ह]ा[क-ह]/.test(text);
    console.log('\n🔍 MARATHI CHECK:');
    console.log('='.repeat(70));
    if (hasProperAa) {
      console.log('✅ FOUND proper "ा" vowel signs - text looks GOOD!');
      
      // Extract some words with आ
      const matches = text.match(/[क-ह]ा[क-ह][क-ह\u093E-\u094F\u0902\u0903]*/g);
      if (matches) {
        console.log(`\n   Examples with "ा": ${matches.slice(0, 10).join(', ')}`);
      }
    } else {
      console.log('❌ NO "ा" vowel signs found - text is CORRUPTED');
    }
    
    // Check voter IDs
    const voterIds = text.match(/[XC][UR][AM]\d{7}/g);
    if (voterIds) {
      console.log(`\n✅ Found ${voterIds.length} voter IDs: ${voterIds.slice(0, 5).join(', ')}`);
    }
    
    // Save to file
    fs.writeFileSync('./page2-extracted.txt', text, 'utf8');
    console.log('\n💾 Full text saved to: page2-extracted.txt');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkPDF().catch(console.error);
