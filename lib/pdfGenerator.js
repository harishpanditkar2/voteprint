// lib/pdfGenerator.js
// Generate individual PDF for each voter

const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');

class VoterPDFGenerator {
  /**
   * Generate individual PDF for a single voter
   * @param {object} voter - Voter data object
   * @param {string} outputDir - Directory to save PDFs
   * @returns {Promise<string>} Path to generated PDF
   */
  static async generateVoterPDF(voter, outputDir = 'public/pdfs') {
    return new Promise(async (resolve, reject) => {
      try {
        // Ensure output directory exists
        await fs.mkdir(outputDir, { recursive: true });

        // Create filename
        const filename = `voter_${voter.serialNumber}_${voter.name.replace(/\s+/g, '_')}.pdf`;
        const filepath = path.join(process.cwd(), outputDir, filename);

        // Create PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margin: 40
        });

        // Pipe to file
        const stream = require('fs').createWriteStream(filepath);
        doc.pipe(stream);

        // Add content
        this.addVoterContent(doc, voter);

        // Finalize PDF
        doc.end();

        stream.on('finish', () => {
          resolve({
            filename,
            filepath,
            url: `/pdfs/${filename}`
          });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate a single PDF with multiple voters (one page per voter)
   * @param {Array} voters - Array of voter objects
   * @param {string} outputDir - Output directory
   * @returns {Promise<object>} Generated PDF info
   */
  static async generateMultiPageVoterPDF(voters, outputDir = 'public/pdfs') {
    return new Promise(async (resolve, reject) => {
      try {
        // Ensure output directory exists
        await fs.mkdir(outputDir, { recursive: true });

        // Create filename with timestamp
        const timestamp = Date.now();
        const filename = `voters_${timestamp}.pdf`;
        const filepath = path.join(process.cwd(), outputDir, filename);

        // Create PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margin: 40
        });

        // Pipe to file
        const stream = require('fs').createWriteStream(filepath);
        doc.pipe(stream);

        console.log(`📄 Generating multi-page PDF with ${voters.length} voters...`);

        // Add each voter as a new page
        voters.forEach((voter, index) => {
          if (index > 0) {
            doc.addPage(); // Add new page for each voter except first
          }
          this.addVoterContent(doc, voter);
          
          if ((index + 1) % 10 === 0) {
            console.log(`✓ Added ${index + 1}/${voters.length} voter pages`);
          }
        });

        // Finalize PDF
        doc.end();

        stream.on('finish', () => {
          console.log(`✅ Multi-page PDF generated: ${filename}`);
          resolve({
            filename,
            filepath,
            url: `/pdfs/${filename}`,
            voterCount: voters.length
          });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate PDFs for multiple voters
   * @param {Array} voters - Array of voter objects
   * @param {string} outputDir - Output directory
   * @returns {Promise<Array>} Array of generated PDF info
   */
  static async generateBulkVoterPDFs(voters, outputDir = 'public/pdfs') {
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    console.log(`📋 Starting batch PDF generation for ${voters.length} voters...`);

    for (let i = 0; i < voters.length; i++) {
      try {
        const voter = voters[i];
        const result = await this.generateVoterPDF(voter, outputDir);
        results.push(result);
        successCount++;

        // Log progress every 10 PDFs
        if ((i + 1) % 10 === 0) {
          console.log(`✓ Generated ${i + 1}/${voters.length} PDFs`);
        }
      } catch (error) {
        errorCount++;
        console.error(`✗ Error generating PDF for voter ${i}:`, error.message);
      }
    }

    console.log(`\n✅ Batch generation complete: ${successCount} successful, ${errorCount} failed`);
    return results;
  }

  /**
   * Add voter details to PDF document
   */
  static addVoterContent(doc, voter) {
    // Header
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('VOTER PROFILE CARD', { align: 'center' })
      .fontSize(10)
      .font('Helvetica')
      .text('━'.repeat(80), { align: 'center' });

    doc.moveDown(0.5);

    // Voter ID Section
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(voter.name || 'N/A', { underline: true })
      .fontSize(10)
      .font('Helvetica');

    doc.moveDown(0.3);

    // Details table-like layout
    const leftX = 40;
    const rightX = 300;
    const startY = doc.y;

    // Left column
    doc.text('Voter ID:', leftX, startY, { continued: true }).font('Helvetica-Bold');
    doc.text(` ${voter.serialNumber || 'N/A'}`, { continued: false });

    doc.text('Age:', leftX, doc.y, { continued: true }).font('Helvetica-Bold');
    doc.text(` ${voter.age || 'N/A'}`, { continued: false }).font('Helvetica');

    doc.text('Gender:', leftX, doc.y, { continued: true }).font('Helvetica-Bold');
    doc.text(` ${voter.gender || 'N/A'}`, { continued: false }).font('Helvetica');

    // Right column
    doc.text("Father's Name:", rightX, startY, { continued: true }).font('Helvetica-Bold');
    doc.text(` ${voter.fatherName || 'N/A'}`, { continued: false }).font('Helvetica');

    doc.moveDown(0.3);

    // Address
    doc.text('Address:', leftX, doc.y, { continued: true }).font('Helvetica-Bold');
    doc.font('Helvetica');
    
    const address = voter.address || 'N/A';
    const wrappedAddress = this.wrapText(address, 70);
    doc.text(` ${wrappedAddress.join(' ')}`);

    doc.moveDown(0.3);

    // Booth & Ward
    doc.text('Polling Booth:', leftX, doc.y, { continued: true }).font('Helvetica-Bold');
    doc.text(` ${voter.booth || 'N/A'}`, { continued: false }).font('Helvetica');

    doc.text('Ward:', leftX, doc.y, { continued: true }).font('Helvetica-Bold');
    doc.text(` ${voter.ward || 'N/A'}`, { continued: false }).font('Helvetica');

    // Additional details
    if (voter.relativeDetail) {
      doc.moveDown(0.3);
      doc.text('Relative Detail:', leftX, doc.y, { continued: true }).font('Helvetica-Bold');
      doc.text(` ${voter.relativeDetail}`, { continued: false }).font('Helvetica');
    }

    // Footer
    doc.moveDown(1);
    doc
      .fontSize(10)
      .text('━'.repeat(80), { align: 'center' })
      .fontSize(8)
      .font('Helvetica-Oblique')
      .text(`Generated: ${new Date().toLocaleString('en-IN')}`, { align: 'center' })
      .text(`Document ID: ${voter.id || 'N/A'}`, { align: 'center' });
  }

  /**
   * Helper: Wrap text to specified width
   */
  static wrapText(text, width) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = [];

    words.forEach(word => {
      if (word.length + (currentLine.join(' ').length) > width) {
        lines.push(currentLine.join(' '));
        currentLine = [word];
      } else {
        currentLine.push(word);
      }
    });

    if (currentLine.length > 0) {
      lines.push(currentLine.join(' '));
    }

    return lines;
  }

  /**
   * Generate a ZIP file containing all PDFs
   * (For batch download)
   */
  static async generateZipArchive(pdfPaths, outputPath = 'public/downloads/voters.zip') {
    const archiver = require('archiver');
    const output = require('fs').createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on('close', () => resolve(outputPath));
      archive.on('error', reject);

      archive.pipe(output);
      
      pdfPaths.forEach(pdfPath => {
        archive.file(pdfPath, { name: path.basename(pdfPath) });
      });

      archive.finalize();
    });
  }
}

module.exports = VoterPDFGenerator;
