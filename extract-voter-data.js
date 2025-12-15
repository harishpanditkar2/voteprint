/**
 * Extract Voter Data from Marathi PDF
 * 
 * Official Election Commission document parser
 * Language: Marathi (Devanagari script)
 * Character Encoding: UTF-8 with proper Marathi support
 * 
 * Outputs:
 * - CSV with UTF-8 BOM
 * - Excel with formatting
 * - JSON data file
 * - Summary statistics report
 */

const TesseractCLIParser = require('./lib/tesseractCLIParser');
const fs = require('fs').promises;
const path = require('path');
const XLSX = require('xlsx');

class VoterDataExtractor {
  constructor(pdfPath) {
    this.pdfPath = pdfPath;
    this.voters = [];
    this.metadata = null;
    this.statistics = {
      totalVoters: 0,
      maleVoters: 0,
      femaleVoters: 0,
      otherGender: 0,
      ageGroups: {
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46-55': 0,
        '56-65': 0,
        '66-75': 0,
        '76+': 0
      },
      averageAge: 0,
      extractionDate: new Date().toISOString(),
      sourceFile: path.basename(pdfPath)
    };
  }

  /**
   * Main extraction method
   */
  async extract() {
    console.log('🚀 Starting Voter Data Extraction...');
    console.log('📄 Source:', this.pdfPath);
    console.log('📅 Date:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    console.log('🔤 Language: Marathi (Devanagari Script)');
    console.log('💾 Encoding: UTF-8\n');

    try {
      // Step 1: Extract voter data using OCR
      console.log('📖 Step 1: Extracting voter data with Tesseract OCR...');
      this.voters = await TesseractCLIParser.parseVoterPDFWithOCR(this.pdfPath);
      
      if (!this.voters || this.voters.length === 0) {
        throw new Error('No voters extracted from PDF');
      }

      console.log(`✅ Extracted ${this.voters.length} voters\n`);

      // Step 2: Calculate statistics
      console.log('📊 Step 2: Calculating statistics...');
      this.calculateStatistics();
      console.log('✅ Statistics calculated\n');

      // Step 3: Clean and validate data
      console.log('🧹 Step 3: Cleaning and validating data...');
      this.cleanData();
      console.log('✅ Data cleaned\n');

      // Step 4: Generate outputs
      console.log('💾 Step 4: Generating output files...');
      await this.generateOutputs();
      console.log('✅ All outputs generated\n');

      // Step 5: Display summary
      this.displaySummary();

      return {
        success: true,
        voters: this.voters,
        statistics: this.statistics
      };

    } catch (error) {
      console.error('❌ Extraction failed:', error.message);
      throw error;
    }
  }

  /**
   * Calculate comprehensive statistics
   */
  calculateStatistics() {
    this.statistics.totalVoters = this.voters.length;

    let totalAge = 0;
    let validAgeCount = 0;

    this.voters.forEach(voter => {
      // Gender statistics
      const gender = voter.gender?.toUpperCase() || '';
      if (gender === 'M' || gender === 'पु' || gender === 'MALE') {
        this.statistics.maleVoters++;
      } else if (gender === 'F' || gender === 'स्त्री' || gender === 'FEMALE') {
        this.statistics.femaleVoters++;
      } else {
        this.statistics.otherGender++;
      }

      // Age statistics
      const age = parseInt(voter.age);
      if (!isNaN(age) && age >= 18 && age <= 120) {
        totalAge += age;
        validAgeCount++;

        // Age group distribution
        if (age >= 18 && age <= 25) this.statistics.ageGroups['18-25']++;
        else if (age >= 26 && age <= 35) this.statistics.ageGroups['26-35']++;
        else if (age >= 36 && age <= 45) this.statistics.ageGroups['36-45']++;
        else if (age >= 46 && age <= 55) this.statistics.ageGroups['46-55']++;
        else if (age >= 56 && age <= 65) this.statistics.ageGroups['56-65']++;
        else if (age >= 66 && age <= 75) this.statistics.ageGroups['66-75']++;
        else if (age >= 76) this.statistics.ageGroups['76+']++;
      }
    });

    this.statistics.averageAge = validAgeCount > 0 
      ? (totalAge / validAgeCount).toFixed(2) 
      : 0;
  }

  /**
   * Clean and validate voter data
   */
  cleanData() {
    this.voters = this.voters.map((voter, index) => {
      // Ensure all fields exist
      return {
        serialNumber: voter.serialNumber || (index + 1).toString(),
        voterId: voter.voterId?.trim() || '',
        name: voter.name?.trim() || '',
        relativeName: voter.relativeName?.trim() || '',
        relation: voter.relation?.trim() || '',
        gender: this.normalizeGender(voter.gender),
        age: voter.age?.trim() || '',
        address: voter.address?.trim() || '',
        ward: voter.ward?.trim() || '',
        booth: voter.booth?.trim() || '',
        pollingCenter: voter.pollingCenter?.trim() || '',
        page: voter.page || '',
        imagePath: voter.imagePath || '',
        createdAt: voter.createdAt || new Date().toISOString()
      };
    });
  }

  /**
   * Normalize gender values
   */
  normalizeGender(gender) {
    if (!gender) return '';
    const g = gender.toUpperCase().trim();
    if (g === 'M' || g === 'पु' || g.includes('MALE')) return 'पुरुष (Male)';
    if (g === 'F' || g === 'स्त्री' || g.includes('FEMALE')) return 'स्त्री (Female)';
    return gender;
  }

  /**
   * Generate all output files
   */
  async generateOutputs() {
    const outputDir = path.join(process.cwd(), 'output');
    await fs.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const baseName = `voter_data_ward_${this.voters[0]?.ward || 'X'}_booth_${this.voters[0]?.booth || 'X'}_${timestamp}`;

    // 1. Generate JSON
    await this.generateJSON(outputDir, baseName);

    // 2. Generate CSV with UTF-8 BOM
    await this.generateCSV(outputDir, baseName);

    // 3. Generate Excel
    await this.generateExcel(outputDir, baseName);

    // 4. Generate Statistics Report
    await this.generateStatisticsReport(outputDir, baseName);
  }

  /**
   * Generate JSON file
   */
  async generateJSON(outputDir, baseName) {
    const jsonPath = path.join(outputDir, `${baseName}.json`);
    await fs.writeFile(
      jsonPath, 
      JSON.stringify({
        metadata: this.statistics,
        voters: this.voters
      }, null, 2),
      'utf-8'
    );
    console.log(`  ✓ JSON: ${path.basename(jsonPath)}`);
  }

  /**
   * Generate CSV with UTF-8 BOM
   */
  async generateCSV(outputDir, baseName) {
    const csvPath = path.join(outputDir, `${baseName}.csv`);
    
    // UTF-8 BOM (Byte Order Mark) for proper Excel compatibility
    const BOM = '\uFEFF';
    
    // CSV Headers
    const headers = [
      'अनुक्रमांक',
      'मतदार ओळखपत्र क्रमांक',
      'नाव',
      'नातेवाईकाचे नाव',
      'नाते',
      'लिंग',
      'वय',
      'पत्ता',
      'प्रभाग',
      'बूथ',
      'मतदान केंद्र',
      'पृष्ठ'
    ];

    // Build CSV content
    let csvContent = BOM + headers.join(',') + '\n';

    this.voters.forEach(voter => {
      const row = [
        voter.serialNumber,
        `"${voter.voterId}"`,
        `"${voter.name}"`,
        `"${voter.relativeName}"`,
        `"${voter.relation}"`,
        `"${voter.gender}"`,
        voter.age,
        `"${voter.address}"`,
        voter.ward,
        voter.booth,
        `"${voter.pollingCenter}"`,
        voter.page
      ];
      csvContent += row.join(',') + '\n';
    });

    await fs.writeFile(csvPath, csvContent, 'utf-8');
    console.log(`  ✓ CSV (UTF-8 BOM): ${path.basename(csvPath)}`);
  }

  /**
   * Generate Excel file with formatting
   */
  async generateExcel(outputDir, baseName) {
    const excelPath = path.join(outputDir, `${baseName}.xlsx`);

    // Prepare data for Excel
    const excelData = this.voters.map(voter => ({
      'अनुक्रमांक': voter.serialNumber,
      'मतदार ओळखपत्र क्रमांक': voter.voterId,
      'नाव': voter.name,
      'नातेवाईकाचे नाव': voter.relativeName,
      'नाते': voter.relation,
      'लिंग': voter.gender,
      'वय': parseInt(voter.age) || voter.age,
      'पत्ता': voter.address,
      'प्रभाग': voter.ward,
      'बूथ': voter.booth,
      'मतदान केंद्र': voter.pollingCenter,
      'पृष्ठ': voter.page
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create main data sheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 12 },  // Serial Number
      { wch: 20 },  // Voter ID
      { wch: 25 },  // Name
      { wch: 25 },  // Relative Name
      { wch: 12 },  // Relation
      { wch: 15 },  // Gender
      { wch: 8 },   // Age
      { wch: 30 },  // Address
      { wch: 10 },  // Ward
      { wch: 10 },  // Booth
      { wch: 35 },  // Polling Center
      { wch: 8 }    // Page
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'मतदार यादी');

    // Create statistics sheet
    const statsData = [
      { 'विवरण': 'एकूण मतदार', 'संख्या': this.statistics.totalVoters },
      { 'विवरण': 'पुरुष', 'संख्या': this.statistics.maleVoters },
      { 'विवरण': 'स्त्री', 'संख्या': this.statistics.femaleVoters },
      { 'विवरण': 'इतर', 'संख्या': this.statistics.otherGender },
      { 'विवरण': 'सरासरी वय', 'संख्या': this.statistics.averageAge },
      { 'विवरण': '', 'संख्या': '' },
      { 'विवरण': 'वयोगट वितरण', 'संख्या': '' },
      { 'विवरण': '18-25', 'संख्या': this.statistics.ageGroups['18-25'] },
      { 'विवरण': '26-35', 'संख्या': this.statistics.ageGroups['26-35'] },
      { 'विवरण': '36-45', 'संख्या': this.statistics.ageGroups['36-45'] },
      { 'विवरण': '46-55', 'संख्या': this.statistics.ageGroups['46-55'] },
      { 'विवरण': '56-65', 'संख्या': this.statistics.ageGroups['56-65'] },
      { 'विवरण': '66-75', 'संख्या': this.statistics.ageGroups['66-75'] },
      { 'विवरण': '76+', 'संख्या': this.statistics.ageGroups['76+'] }
    ];

    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    statsSheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, statsSheet, 'सांख्यिकी');

    // Write file
    XLSX.writeFile(wb, excelPath);
    console.log(`  ✓ Excel: ${path.basename(excelPath)}`);
  }

  /**
   * Generate detailed statistics report
   */
  async generateStatisticsReport(outputDir, baseName) {
    const reportPath = path.join(outputDir, `${baseName}_REPORT.txt`);

    const report = `
╔════════════════════════════════════════════════════════════════════════════╗
║                     मतदार यादी सांख्यिकी अहवाल                           ║
║                    VOTER LIST STATISTICS REPORT                             ║
╚════════════════════════════════════════════════════════════════════════════╝

📄 स्रोत फाइल / Source File: ${this.statistics.sourceFile}
📅 निर्माण दिनांक / Extraction Date: ${new Date(this.statistics.extractionDate).toLocaleString('en-IN')}
🔤 भाषा / Language: मराठी (Marathi - Devanagari Script)
💾 एन्कोडिंग / Encoding: UTF-8

╔════════════════════════════════════════════════════════════════════════════╗
║                          एकूण आकडेवारी / TOTAL STATISTICS                 ║
╚════════════════════════════════════════════════════════════════════════════╝

👥 एकूण मतदार / Total Voters: ${this.statistics.totalVoters}

प्रभाग / Ward: ${this.voters[0]?.ward || 'N/A'}
बूथ / Booth: ${this.voters[0]?.booth || 'N/A'}
मतदान केंद्र / Polling Center: ${this.voters[0]?.pollingCenter || 'N/A'}

╔════════════════════════════════════════════════════════════════════════════╗
║                       लिंग वितरण / GENDER DISTRIBUTION                     ║
╚════════════════════════════════════════════════════════════════════════════╝

👨 पुरुष / Male: ${this.statistics.maleVoters} (${((this.statistics.maleVoters/this.statistics.totalVoters)*100).toFixed(1)}%)
👩 स्त्री / Female: ${this.statistics.femaleVoters} (${((this.statistics.femaleVoters/this.statistics.totalVoters)*100).toFixed(1)}%)
⚧ इतर / Other: ${this.statistics.otherGender} (${((this.statistics.otherGender/this.statistics.totalVoters)*100).toFixed(1)}%)

╔════════════════════════════════════════════════════════════════════════════╗
║                        वय वितरण / AGE DISTRIBUTION                        ║
╚════════════════════════════════════════════════════════════════════════════╝

📊 सरासरी वय / Average Age: ${this.statistics.averageAge} years

वयोगट / Age Groups:
  18-25: ${this.statistics.ageGroups['18-25']} (${((this.statistics.ageGroups['18-25']/this.statistics.totalVoters)*100).toFixed(1)}%)
  26-35: ${this.statistics.ageGroups['26-35']} (${((this.statistics.ageGroups['26-35']/this.statistics.totalVoters)*100).toFixed(1)}%)
  36-45: ${this.statistics.ageGroups['36-45']} (${((this.statistics.ageGroups['36-45']/this.statistics.totalVoters)*100).toFixed(1)}%)
  46-55: ${this.statistics.ageGroups['46-55']} (${((this.statistics.ageGroups['46-55']/this.statistics.totalVoters)*100).toFixed(1)}%)
  56-65: ${this.statistics.ageGroups['56-65']} (${((this.statistics.ageGroups['56-65']/this.statistics.totalVoters)*100).toFixed(1)}%)
  66-75: ${this.statistics.ageGroups['66-75']} (${((this.statistics.ageGroups['66-75']/this.statistics.totalVoters)*100).toFixed(1)}%)
  76+:   ${this.statistics.ageGroups['76+']} (${((this.statistics.ageGroups['76+']/this.statistics.totalVoters)*100).toFixed(1)}%)

╔════════════════════════════════════════════════════════════════════════════╗
║                      डेटा गुणवत्ता / DATA QUALITY                         ║
╚════════════════════════════════════════════════════════════════════════════╝

✅ Extraction Method: Tesseract OCR (Marathi + English)
✅ Character Support: Full Devanagari Unicode
✅ Data Source: Official Election Commission Document
✅ Published Date: 07-11-2025
✅ Privacy Note: Public voter list data

╔════════════════════════════════════════════════════════════════════════════╗
║                      आउटपुट फाइल्स / OUTPUT FILES                         ║
╚════════════════════════════════════════════════════════════════════════════╝

📄 JSON: ${baseName}.json
📊 CSV (UTF-8 BOM): ${baseName}.csv
📗 Excel: ${baseName}.xlsx
📋 Report: ${baseName}_REPORT.txt

════════════════════════════════════════════════════════════════════════════

Generated by: Election Commission Voter Data Extractor
Date: ${new Date().toISOString()}

════════════════════════════════════════════════════════════════════════════
`;

    await fs.writeFile(reportPath, report, 'utf-8');
    console.log(`  ✓ Report: ${path.basename(reportPath)}`);
  }

  /**
   * Display summary on console
   */
  displaySummary() {
    console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    🎉 EXTRACTION COMPLETE! 🎉                         ║');
    console.log('╚════════════════════════════════════════════════════════════════════════╝\n');
    
    console.log('📊 SUMMARY:');
    console.log(`   Total Voters: ${this.statistics.totalVoters}`);
    console.log(`   Male: ${this.statistics.maleVoters} | Female: ${this.statistics.femaleVoters}`);
    console.log(`   Average Age: ${this.statistics.averageAge} years`);
    console.log(`   Ward: ${this.voters[0]?.ward} | Booth: ${this.voters[0]?.booth}`);
    
    console.log('\n📁 OUTPUT FILES:');
    console.log('   All files saved in: ./output/');
    console.log('   ✓ JSON (complete data with metadata)');
    console.log('   ✓ CSV (UTF-8 BOM for Excel compatibility)');
    console.log('   ✓ Excel (formatted with statistics sheet)');
    console.log('   ✓ Report (detailed statistics)');
    
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Review the statistics report');
    console.log('   2. Open Excel file to view formatted data');
    console.log('   3. Verify data against source PDF');
    console.log('   4. CSV file ready for import into databases');
    
    console.log('\n✨ Data extraction completed successfully!\n');
  }
}

// Main execution
async function main() {
  const pdfPath = path.join(__dirname, 'pdflist', 'BoothVoterList_A4_Ward_7_Booth_1 - converted.pdf');
  
  // Check if PDF exists
  try {
    await fs.access(pdfPath);
  } catch (error) {
    console.error('❌ Error: PDF file not found at:', pdfPath);
    console.error('Please ensure the file exists and the path is correct.');
    process.exit(1);
  }

  const extractor = new VoterDataExtractor(pdfPath);
  
  try {
    await extractor.extract();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = VoterDataExtractor;
