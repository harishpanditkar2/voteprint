// lib/pdfParser.js
// Extract voter data from uploaded PDF

const PDFParser = require('pdf2json');
const fs = require('fs').promises;
const path = require('path');

class VoterPDFParser {
  /**
   * Parse voter list PDF and extract structured data
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<Array>} Array of voter objects
   */
  static async parseVoterPDF(filePath) {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on('pdfParser_dataReady', async (pdfData) => {
        try {
          const voters = this.extractVoterData(pdfData);
          
          // Cache the data
          const dataDir = path.join(process.cwd(), 'data');
          await fs.mkdir(dataDir, { recursive: true });
          await fs.writeFile(
            path.join(dataDir, 'voters.json'),
            JSON.stringify(voters, null, 2)
          );

          resolve(voters);
        } catch (error) {
          reject(error);
        }
      });

      pdfParser.on('pdfParser_dataError', (error) => {
        reject(new Error(`PDF parsing error: ${error.message}`));
      });

      pdfParser.loadPDF(filePath);
    });
  }

  /**
   * Extract voter information from parsed PDF data
   * @param {object} pdfData - Parsed PDF data from pdf2json
   * @returns {Array} Structured voter array
   */
  static extractVoterData(pdfData) {
    const voters = [];
    const pageCount = pdfData.pages.length;

    for (let i = 0; i < pageCount; i++) {
      const page = pdfData.pages[i];
      const pageText = this.extractPageText(page);
      const pageVoters = this.parseVoterLines(pageText);
      voters.push(...pageVoters);
    }

    return voters;
  }

  /**
   * Extract raw text from PDF page
   */
  static extractPageText(page) {
    let text = '';
    if (page.texts) {
      page.texts.forEach((textItem) => {
        text += textItem.R?.[0]?.T || '';
      });
    }
    return text;
  }

  /**
   * Parse individual voter lines from page text
   * Adjust regex pattern based on your PDF format
   */
  static parseVoterLines(pageText) {
    const voters = [];
    
    // Split by common delimiters or line breaks
    const lines = pageText.split(/[\n\r]+/).filter(line => line.trim());

    lines.forEach((line, index) => {
      const voter = this.parseSingleVoterLine(line);
      if (voter) {
        voter.id = `VOTER_${Date.now()}_${index}`;
        voter.createdAt = new Date();
        voters.push(voter);
      }
    });

    return voters;
  }

  /**
   * Parse a single voter line
   * Adjust parsing logic based on your PDF format
   */
  static parseSingleVoterLine(line) {
    // Expected format: NAME | AGE | GENDER | ADDRESS | BOOTH | WARD
    // Adjust this regex to match your voter PDF format
    
    const parts = line.split('|').map(p => p.trim());
    
    if (parts.length < 4) return null;

    // Skip header rows
    if (line.toLowerCase().includes('name') || 
        line.toLowerCase().includes('age') ||
        line.toLowerCase().includes('serial')) {
      return null;
    }

    return {
      serialNumber: parts[0] || '',
      name: parts[1] || '',
      age: parts[2] || '',
      gender: parts[3] || '',
      fatherName: parts[4] || '',
      address: parts[5] || '',
      booth: parts[6] || '',
      ward: parts[7] || '',
      relativeDetail: parts[8] || ''
    };
  }

  /**
   * Load cached voter data
   */
  static async loadCachedVoters() {
    try {
      const filePath = path.join(process.cwd(), 'data', 'voters.json');
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  /**
   * Search voters by various criteria
   */
  static async searchVoters(query, field = 'name') {
    const voters = await this.loadCachedVoters();
    
    if (!voters) return [];

    const searchTerm = query.toLowerCase();
    return voters.filter(voter => {
      const fieldValue = voter[field]?.toString().toLowerCase() || '';
      return fieldValue.includes(searchTerm);
    });
  }
}

module.exports = VoterPDFParser;
