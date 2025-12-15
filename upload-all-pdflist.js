const fs = require('fs');
const path = require('path');
const TesseractCLIParser = require('./lib/tesseractCLIParser');
const DataValidator = require('./lib/dataValidator');

async function uploadAllPDFs() {
  const pdflistDir = path.join(__dirname, 'pdflist');
  const outputDir = path.join(__dirname, 'output');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get all PDF files
  const pdfFiles = fs.readdirSync(pdflistDir).filter(file => file.endsWith('.pdf'));
  
  console.log(`\n📂 Found ${pdfFiles.length} PDF files in pdflist directory\n`);
  console.log('=' .repeat(80));

  const allVoters = [];
  const summaryStats = {
    totalFiles: pdfFiles.length,
    processedFiles: 0,
    failedFiles: 0,
    totalVoters: 0,
    byWard: {},
    byBooth: {},
    byGender: { M: 0, F: 0, O: 0 }
  };

  for (const pdfFile of pdfFiles) {
    const pdfPath = path.join(pdflistDir, pdfFile);
    console.log(`\n📄 Processing: ${pdfFile}`);
    console.log('-'.repeat(80));

    try {
      // Extract ward and booth from filename
      // Format: BoothVoterList_A4_Ward_7_Booth_1.pdf
      const wardMatch = pdfFile.match(/Ward[_\s](\d+)/i);
      const boothMatch = pdfFile.match(/Booth[_\s](\d+)/i);
      
      const expectedWard = wardMatch ? wardMatch[1] : null;
      const expectedBooth = boothMatch ? boothMatch[1] : null;

      console.log(`📍 Expected Ward: ${expectedWard}, Booth: ${expectedBooth}`);

      // Parse PDF using OCR (Tesseract CLI)
      const extractedVoters = await TesseractCLIParser.parseVoterPDFWithOCR(pdfPath);

      console.log(`✅ Extracted ${extractedVoters.length} voters`);

      // REAL-TIME VALIDATION before saving
      console.log('\n🔍 Validating extracted data...');
      const validation = DataValidator.validatePDFExtraction(
        extractedVoters,
        73, // Expected pages for Ward 7 Booth 1 (adjust per PDF)
        30  // Expected voters per page
      );
      
      DataValidator.printValidationReport(validation, `VALIDATION - ${pdfFile}`);
      
      // Stop if critical errors
      if (!validation.valid && validation.errors.some(e => e.includes('CRITICAL'))) {
        console.log('❌ CRITICAL ERRORS FOUND - STOPPING UPLOAD FOR THIS FILE');
        console.log('⚠️  Fix errors and retry. Data NOT saved.\n');
        summaryStats.failedFiles++;
        continue;
      }
      
      // Warn if accuracy too low
      const accuracyNum = parseFloat(validation.accuracy);
      if (accuracyNum < 80) {
        console.log(`⚠️  WARNING: Accuracy ${validation.accuracy} is below 80%`);
        console.log('⚠️  Consider manual review before using this data\n');
      }

      console.log(`✅ Validation passed with ${validation.accuracy} accuracy`);

      // Update ward/booth if extracted from filename
      if (expectedWard || expectedBooth) {
        extractedVoters.forEach(voter => {
          if (expectedWard) voter.expectedWard = expectedWard;
          if (expectedBooth) voter.expectedBooth = expectedBooth;
          
          // Use extracted ward/booth as fallback
          if (!voter.actualWard && expectedWard) voter.actualWard = expectedWard;
          if (!voter.actualBooth && expectedBooth) voter.actualBooth = expectedBooth;
        });
      }

      // Add to all voters
      allVoters.push(...extractedVoters);

      // Update stats
      summaryStats.processedFiles++;
      summaryStats.totalVoters += extractedVoters.length;

      // Count by ward and booth
      extractedVoters.forEach(voter => {
        const ward = voter.actualWard || voter.expectedWard || 'Unknown';
        const booth = voter.actualBooth || voter.expectedBooth || 'Unknown';
        const gender = voter.gender || 'O';

        summaryStats.byWard[ward] = (summaryStats.byWard[ward] || 0) + 1;
        summaryStats.byBooth[`${ward}/${booth}`] = (summaryStats.byBooth[`${ward}/${booth}`] || 0) + 1;
        summaryStats.byGender[gender] = (summaryStats.byGender[gender] || 0) + 1;
      });

      // Save individual file output
      const outputFileName = `${path.basename(pdfFile, '.pdf')}_${new Date().toISOString().split('T')[0]}.json`;
      const outputPath = path.join(outputDir, outputFileName);
      fs.writeFileSync(outputPath, JSON.stringify(extractedVoters, null, 2));
      console.log(`💾 Saved to: ${outputFileName}`);

    } catch (error) {
      console.error(`❌ Failed to process ${pdfFile}:`, error.message);
      summaryStats.failedFiles++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 UPLOAD SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Files: ${summaryStats.totalFiles}`);
  console.log(`✅ Processed: ${summaryStats.processedFiles}`);
  console.log(`❌ Failed: ${summaryStats.failedFiles}`);
  console.log(`👥 Total Voters: ${summaryStats.totalVoters}`);
  
  console.log('\n📍 Voters by Ward:');
  Object.entries(summaryStats.byWard)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([ward, count]) => {
      console.log(`   Ward ${ward}: ${count} voters`);
    });

  console.log('\n🏢 Voters by Booth (Ward/Booth):');
  Object.entries(summaryStats.byBooth)
    .sort()
    .forEach(([booth, count]) => {
      console.log(`   ${booth}: ${count} voters`);
    });

  console.log('\n👤 Voters by Gender:');
  console.log(`   Male: ${summaryStats.byGender.M || 0}`);
  console.log(`   Female: ${summaryStats.byGender.F || 0}`);
  console.log(`   Other: ${summaryStats.byGender.O || 0}`);

  // Save combined data
  if (allVoters.length > 0) {
    const timestamp = new Date().toISOString().split('T')[0];
    const combinedPath = path.join(outputDir, `all_voters_combined_${timestamp}.json`);
    fs.writeFileSync(combinedPath, JSON.stringify(allVoters, null, 2));
    console.log(`\n💾 Combined data saved to: all_voters_combined_${timestamp}.json`);

    // Update main voters.json
    const votersJsonPath = path.join(__dirname, 'public', 'data', 'voters.json');
    
    // Backup existing
    if (fs.existsSync(votersJsonPath)) {
      const backupPath = `${votersJsonPath}.backup_${Date.now()}`;
      fs.copyFileSync(votersJsonPath, backupPath);
      console.log(`📦 Backed up existing voters.json to: ${path.basename(backupPath)}`);
    }

    // Write new data
    fs.writeFileSync(votersJsonPath, JSON.stringify(allVoters, null, 2));
    console.log(`✅ Updated public/data/voters.json with ${allVoters.length} voters`);

    // Generate report
    const reportPath = path.join(outputDir, `upload_report_${timestamp}.txt`);
    const report = `
VOTER DATA UPLOAD REPORT
Generated: ${new Date().toISOString()}
${'='.repeat(80)}

SUMMARY:
- Total PDF Files: ${summaryStats.totalFiles}
- Successfully Processed: ${summaryStats.processedFiles}
- Failed: ${summaryStats.failedFiles}
- Total Voters Extracted: ${summaryStats.totalVoters}

DISTRIBUTION BY WARD:
${Object.entries(summaryStats.byWard)
  .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
  .map(([ward, count]) => `Ward ${ward}: ${count} voters`)
  .join('\n')}

DISTRIBUTION BY BOOTH:
${Object.entries(summaryStats.byBooth)
  .sort()
  .map(([booth, count]) => `${booth}: ${count} voters`)
  .join('\n')}

GENDER DISTRIBUTION:
- Male: ${summaryStats.byGender.M || 0}
- Female: ${summaryStats.byGender.F || 0}
- Other: ${summaryStats.byGender.O || 0}

FILES PROCESSED:
${pdfFiles.map(f => `- ${f}`).join('\n')}

${'='.repeat(80)}
`;

    fs.writeFileSync(reportPath, report);
    console.log(`📄 Generated report: upload_report_${timestamp}.txt`);
  }

  console.log('\n✅ All uploads complete!\n');
}

// Run the upload
uploadAllPDFs().catch(console.error);
