// lib/pdfParser.js
// Extract voter data from uploaded PDF
//
// ⚠️ KNOWN LIMITATION: Custom Font Encoding Issue
// The Maharashtra voter list PDFs use custom font encoding that doesn't
// map correctly to Unicode. This affects NAME extraction (garbled text).
// 
// ✅ WORKING CORRECTLY: Voter IDs, Age, Gender, Booth, Ward (100% accurate)
// ⚠️ NEEDS VERIFICATION: Names, Father/Husband names (may be garbled)
//
// SOLUTION: Use voter ID as primary key. Names can be verified/corrected
// through admin interface or cross-referenced with official voter database.

const PDFParser = require('pdf2json');
const fs = require('fs').promises;
const path = require('path');

class VoterPDFParser {
  /**
   * Parse voter list PDF and extract structured data
   * @param {string} filePath - Path to the PDF file
   * @param {object} fileMetadata - Metadata from filename (ward, booth)
   * @returns {Promise<Array>} Array of voter objects
   */
  static async parseVoterPDF(filePath, fileMetadata = {}) {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on('pdfParser_dataReady', async (pdfData) => {
        try {
          const voters = this.extractVoterData(pdfData, fileMetadata);
          
          // Cache the data in public/data for both API and frontend access
          const dataDir = path.join(process.cwd(), 'public', 'data');
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
   * @param {object} fileMetadata - Metadata from filename (ward, booth)
   * @returns {Array} Structured voter array
   */
  static extractVoterData(pdfData, fileMetadata = {}) {
    const voters = [];
    
    // Check if pdfData and pages exist
    if (!pdfData || !pdfData.Pages || !Array.isArray(pdfData.Pages)) {
      console.error('Invalid PDF data structure:', pdfData);
      throw new Error('Invalid PDF structure. Unable to extract pages.');
    }

    const pageCount = pdfData.Pages.length;
    console.log(`📄 Processing ${pageCount} pages...`);

    for (let i = 0; i < pageCount; i++) {
      const page = pdfData.Pages[i];
      const pageWidth = page.Width || 20;
      const textItems = this.extractPageText(page);
      const pageVoters = this.parseVotersWithSpatialClustering(textItems, pageWidth, i + 1, fileMetadata);
      voters.push(...pageVoters);
    }

    console.log(`✓ Extracted ${voters.length} voters from ${pageCount} pages`);
    return voters;
  }

  /**
   * Extract raw text from PDF page with positional information
   * Returns array of text items with coordinates for spatial clustering
   */
  static extractPageText(page) {
    const textItems = [];
    
    // pdf2json structure: page.Texts is the array of text items
    if (page.Texts && Array.isArray(page.Texts)) {
      page.Texts.forEach((textItem) => {
        try {
          // Each text item has R array with text data
          if (textItem.R && Array.isArray(textItem.R)) {
            textItem.R.forEach(run => {
              if (run.T) {
                // Decode URI encoded text
                const decoded = decodeURIComponent(run.T);
                // Store text with position coordinates
                textItems.push({
                  text: decoded,
                  x: textItem.x || 0,
                  y: textItem.y || 0,
                  R: textItem.R
                });
              }
            });
          }
        } catch (e) {
          // Skip malformed text items
          console.warn('Error decoding text:', e.message);
        }
      });
    }
    
    return textItems;
  }

  /**
   * Detect column boundaries using X-coordinate clustering
   * Based on Perplexity's spatial clustering algorithm
   */
  static detectColumnBoundaries(textItems, pageWidth = 20) {
    if (!textItems || textItems.length === 0) {
      return { col1: { start: 0, end: 7 }, col2: { start: 7, end: 14 }, col3: { start: 14, end: 20 } };
    }

    // Get all unique X positions
    const xPositions = textItems.map(item => item.x).sort((a, b) => a - b);
    
    // Find gaps in X positions (these indicate column boundaries)
    const gaps = [];
    for (let i = 1; i < xPositions.length; i++) {
      const gap = xPositions[i] - xPositions[i - 1];
      if (gap > pageWidth * 0.05) { // Gap larger than 5% of page width
        gaps.push({
          position: (xPositions[i] + xPositions[i - 1]) / 2,
          gap: gap
        });
      }
    }
    
    // Sort gaps by size and take the 2 largest (for 3 columns)
    const largestGaps = gaps
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 2)
      .map(g => g.position)
      .sort((a, b) => a - b);
    
    // Define column boundaries
    if (largestGaps.length >= 2) {
      return {
        col1: { start: 0, end: largestGaps[0] },
        col2: { start: largestGaps[0], end: largestGaps[1] },
        col3: { start: largestGaps[1], end: pageWidth }
      };
    } else if (largestGaps.length === 1) {
      return {
        col1: { start: 0, end: largestGaps[0] },
        col2: { start: largestGaps[0], end: pageWidth },
        col3: { start: pageWidth, end: pageWidth + 1 }
      };
    } else {
      // Default 3 equal columns
      return {
        col1: { start: 0, end: pageWidth / 3 },
        col2: { start: pageWidth / 3, end: (2 * pageWidth) / 3 },
        col3: { start: (2 * pageWidth) / 3, end: pageWidth }
      };
    }
  }

  /**
   * Group text items by column and Y-position
   * Cluster text items into logical "rows" within each column
   */
  static groupTextByColumnAndRow(textItems, columnBoundaries, rowThreshold = 0.2) {
    const groups = { col1: [], col2: [], col3: [] };
    
    // Assign text to columns
    textItems.forEach(item => {
      const x = item.x;
      let columnKey;
      
      if (x < columnBoundaries.col1.end) columnKey = 'col1';
      else if (x < columnBoundaries.col2.end) columnKey = 'col2';
      else columnKey = 'col3';
      
      groups[columnKey].push(item);
    });
    
    // Within each column, group by Y-position (same row)
    const rowGroups = {};
    Object.keys(groups).forEach(colKey => {
      const colTexts = groups[colKey];
      
      colTexts.forEach(item => {
        // Round Y position to nearest row (texts with similar Y are in same row)
        const rowKey = Math.round(item.y / rowThreshold) * rowThreshold;
        const groupKey = `${colKey}_${rowKey}`;
        
        if (!rowGroups[groupKey]) {
          rowGroups[groupKey] = [];
        }
        rowGroups[groupKey].push(item);
      });
    });
    
    // Sort within each row by X position (left to right)
    Object.keys(rowGroups).forEach(rowKey => {
      rowGroups[rowKey].sort((a, b) => a.x - b.x);
    });
    
    return rowGroups;
  }

  /**
   * Parse voters using spatial clustering algorithm
   * Based on Perplexity's multi-column PDF parsing solution
   */
  static parseVotersWithSpatialClustering(textItems, pageWidth, pageNumber, fileMetadata = {}) {
    const voters = [];
    
    if (!textItems || textItems.length === 0) {
      return voters;
    }

    // Step 1: Detect column boundaries
    const columnBoundaries = this.detectColumnBoundaries(textItems, pageWidth);
    
    // Step 2: Separate text by columns
    const columnTexts = { col1: [], col2: [], col3: [] };
    
    textItems.forEach(item => {
      const x = item.x;
      let columnKey;
      
      if (x < columnBoundaries.col1.end) columnKey = 'col1';
      else if (x < columnBoundaries.col2.end) columnKey = 'col2';
      else columnKey = 'col3';
      
      columnTexts[columnKey].push(item);
    });
    
    // Step 3: Process each column separately (top to bottom)
    const voterIdPattern = /([XC][UR][AMU]\d{7,10})\s+(\d{3}\/\d{3}\/\d{3})/;
    let globalVoterCount = 0;
    
    // Process columns in order: col1, col2, col3
    ['col1', 'col2', 'col3'].forEach(colKey => {
      const colItems = columnTexts[colKey];
      
      // Sort by Y position (top to bottom)
      colItems.sort((a, b) => a.y - b.y);
      
      // Build full column text
      const colText = colItems.map(item => item.text).join(' ');
      
      // Find all voter IDs in this column
      let match;
      const voterIdPatternGlobal = /([XC][UR][AMU]\d{7,10})\s+(\d{3}\/\d{3}\/\d{3})/g;
      const voterPositions = [];
      
      while ((match = voterIdPatternGlobal.exec(colText)) !== null) {
        voterPositions.push({
          voterId: match[1],
          partNumber: match[2],
          startIndex: match.index,
          match: match[0]
        });
      }
      
      // For each voter ID, extract surrounding context
      voterPositions.forEach((voterPos, idx) => {
        globalVoterCount++;
        
        // Get context: from current voter ID to next voter ID (or end of column)
        const startIdx = voterPos.startIndex;
        const nextVoterPos = voterPositions[idx + 1];
        const endIdx = nextVoterPos ? nextVoterPos.startIndex : colText.length;
        
        const voterContext = colText.substring(startIdx, endIdx);
        
        // Parse fields from this context
        const voterIdMatch = [voterContext, voterPos.voterId, voterPos.partNumber];
        const voter = this.parseMarathiVoterFields(voterContext, voterIdMatch, globalVoterCount, pageNumber, fileMetadata);
        
        if (voter && voter.voterId) {
          voter.id = `VOTER_${Date.now()}_${globalVoterCount}_${Math.random().toString(36).substr(2, 9)}`;
          voter.createdAt = new Date();
          voters.push(voter);
        }
      });
    });
    
    return voters;
  }
  
  /**
   * Clean Devanagari text by removing extra spaces within words
   */
  static cleanDevanagariText(text) {
    if (!text) return '';
    
    // Remove ALL spaces between Devanagari characters (Unicode range: \u0900-\u097F)
    // This handles cases like "गजबनन यशव न त" → "गजबनन यशवनत"
    let cleaned = text;
    
    // Repeatedly remove spaces between Devanagari characters until no more found
    let prevLength = 0;
    while (cleaned.length !== prevLength) {
      prevLength = cleaned.length;
      cleaned = cleaned.replace(/([\u0900-\u097F])\s+([\u0900-\u097F])/g, '$1$2');
    }
    
    // Keep spaces between complete words (when there's more than one space or punctuation)
    // Replace multiple spaces with single space to separate actual words
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
    
    return cleaned.trim();
  }

  /**
   * Parse Marathi voter fields from grouped row text
   * Extracts individual fields using Devanagari patterns
   * Format: <Serial> <Name> मतदाराचे पूर्ण नाव : वडिलांचे नाव <FatherName> : घर क्रमांक : <House> वय : <Age> लिंग : <Gender>
   */
  static parseMarathiVoterFields(voterText, voterIdMatch, serialNum, pageNumber, fileMetadata = {}) {
    const voter = {
      serialNumber: serialNum.toString(),
      voterId: voterIdMatch[1],
      partNumber: voterIdMatch[2],
      pageNumber: pageNumber,
      name: '',
      age: '',
      gender: '',
      fatherName: '',
      relativeDetail: '',
      houseNumber: '',
      address: '',
      booth: '',
      ward: '',
      actualWard: fileMetadata.ward || '',
      actualBooth: fileMetadata.booth || ''
    };
    
    // Debug: Log first 500 chars of voter text for troubleshooting
    if (serialNum <= 3) {
      console.log(`\n🔍 Debug Voter #${serialNum} (${voterIdMatch[1]}):`);
      console.log('Text sample:', voterText.substring(0, 500));
    }
    
    try {
      // Extract ward/booth from part number (format: 201/138/143)
      const parts = voterIdMatch[2].split('/');
      if (parts.length === 3) {
        voter.ward = parts[1];
        voter.booth = parts[2];
      }
      
      // Extract Name: Appears BEFORE "मतदबरबच" (garbled "मतदाराचे")
      // Format: <VoterID> <PartNumber> <Serial> <Name> मतदबरबच...
      // The name has many spaces: "गजबनन   यशव न त   अनबसप प र व"
      const namePattern = /\d+\s+([\u0900-\u097F\s]+?)\s*मतद[ाब]र[ाब]च/;
      const nameMatch = voterText.match(namePattern);
      if (nameMatch) {
        let name = nameMatch[1].trim();
        name = this.cleanDevanagariText(name);
        voter.name = name;
      }
      
      // Extract Father Name: वररलबनच व नबव (garbled "वडिलांचे नाव")
      // Format: "वररलबनच व नबव यशव न त अनबसप प र व :"
      const fatherPattern = /व[रड]र?[िल][िल][ाल][नब]च?\s*[ेव]\s*न[ाब]व\s+([^\:]+?)?\s*:/;
      const fatherMatch = voterText.match(fatherPattern);
      if (fatherMatch) {
        voter.relativeDetail = 'Father';
        let fatherName = fatherMatch[1] ? fatherMatch[1].trim() : '';
        fatherName = this.cleanDevanagariText(fatherName);
        voter.fatherName = fatherName;
      }
      
      // Extract Husband Name: पतीचे नाव or पततच व नाव
      const husbandPattern = /पत[ती][ीच][चे]\s*[ेव]\s*न[ाब]व\s*[:\s]+([^:वघ]+?)\s*:/;
      const husbandMatch = voterText.match(husbandPattern);
      if (husbandMatch) {
        voter.relativeDetail = 'Husband';
        let husbandName = husbandMatch[1].trim();
        husbandName = this.cleanDevanagariText(husbandName);
        if (!voter.fatherName) {
          voter.fatherName = husbandName;
        }
      }
      
      // Extract House Number: : <Value> घर क्रमांक or घर कमांक
      const housePattern = /:\s*([^\s]+)\s+घर\s*क[रम][मॉा][ांन]क/;
      const houseMatch = voterText.match(housePattern);
      if (houseMatch) {
        voter.houseNumber = houseMatch[1].trim();
        voter.address = voter.houseNumber;
      }
      
      // Extract Age: Pattern is ": <age> वय :" or before "वय"
      // Look for digits followed by "वय" keyword
      const agePattern = /[:\s](\d{2,3})\s+(?:प\s*[पू]|सत|[^\u0900-\u097F])*?\s*वय/;
      const ageMatch = voterText.match(agePattern);
      if (ageMatch) {
        voter.age = ageMatch[1];
      }
      
      // Extract Gender: Look for gender indicators
      // Pattern 1: Check for "प प" or "पुरुष" for Male
      // Pattern 2: Check for "सत" or "स्त्री" for Female
      const malePattern = /\d+\s+(?:प\s*[पू]|पुरुष)\s+वय/i;
      const femalePattern = /\d+\s+(?:सत|स्त्री)\s+वय/i;
      
      if (malePattern.test(voterText)) {
        voter.gender = 'M';
      } else if (femalePattern.test(voterText)) {
        voter.gender = 'F';
      }
      
      // Additional check: Look in the text for direct gender markers
      if (!voter.gender) {
        if (/लिंग\s*[:：]\s*(?:प|पुरुष)/i.test(voterText)) {
          voter.gender = 'M';
        } else if (/लिंग\s*[:：]\s*(?:सत|स्त्री)/i.test(voterText)) {
          voter.gender = 'F';
        }
      }
      
      // Clean up all text fields with Devanagari cleaner
      ['name', 'fatherName', 'houseNumber', 'address'].forEach(key => {
        if (voter[key]) {
          voter[key] = this.cleanDevanagariText(voter[key]);
        }
      });
      
      // Final cleanup
      Object.keys(voter).forEach(key => {
        if (typeof voter[key] === 'string') {
          voter[key] = voter[key].trim();
        }
      });
      
    } catch (error) {
      console.error('Error parsing voter fields:', error.message);
      return null;
    }
    
    return voter;
  }

  /**
   * Parse a single voter record
   * Based on Maharashtra voter list format
   */
  static parseSingleVoterRecord(text) {
    if (!text || text.trim().length < 20) return null;
    
    const voter = {
      serialNumber: '',
      name: '',
      age: '',
      gender: '',
      fatherName: '',
      relativeDetail: '',
      houseNumber: '',
      voterId: '',
      partNumber: '',
      address: '',
      booth: '',
      ward: ''
    };
    
    try {
      // Extract Serial Number: नबव followed by number
      const serialMatch = text.match(/नबव\s+(\d+)/);
      if (serialMatch) {
        voter.serialNumber = serialMatch[1];
      }
      
      // Determine relation type
      if (text.includes('वररलबनच') || text.includes('वररल')) {
        voter.relativeDetail = 'Father';
      } else if (text.includes('पततच') || text.includes('पतत')) {
        voter.relativeDetail = 'Husband';
      }
      
      // Extract House Number: घर कमबनक
      const houseMatch = text.match(/घर\s*कमबनक\s*वय\s*:\s*मतदबरबच\s*व\s*प\s*प\s*र\s*र\s*नबनव\s*(\d+)\s*:\s*([^:]+?)\s*:/);
      if (houseMatch) {
        voter.age = houseMatch[1];
        voter.houseNumber = houseMatch[2].trim();
      } else {
        // Alternate pattern
        const ageMatch = text.match(/नबनव\s*(\d+)\s*:/);
        if (ageMatch) {
          voter.age = ageMatch[1];
        }
      }
      
      // Extract Gender: ललग : प प (Male) or ललग : सत (Female)
      const genderMatch = text.match(/ललग\s*:\s*([^\s\n]+)/);
      if (genderMatch) {
        const genderText = genderMatch[1].trim();
        if (genderText.includes('प')) {
          voter.gender = 'M';
        } else if (genderText.includes('सत') || genderText.includes('स')) {
          voter.gender = 'F';
        }
      }
      
      // Extract Voter ID: XUA or CRM followed by numbers and part number
      const voterIdMatch = text.match(/([A-Z]{3}\d{7,10})\s*(\d{3}\/\d{3}\/\d{3})/);
      if (voterIdMatch) {
        voter.voterId = voterIdMatch[1];
        voter.partNumber = voterIdMatch[2];
        
        // Extract Ward/Booth info from part number
        const parts = voterIdMatch[2].split('/');
        if (parts.length === 3) {
          voter.ward = parts[1];
          voter.booth = parts[2];
        }
      }
      
      // Extract Names: Pattern is typically <relative_name> <voter_name> <XUA_ID>
      // Find text between ":" and "XUA" or "CRM"
      const nameBlock = text.match(/:\s*:\s*([^X]+?)(?=\s*[XC][URR][AMU])/);
      if (nameBlock) {
        const names = nameBlock[1].trim().split(/\s+/);
        // Usually the pattern is: RelativeName VoterName
        // Take last few words as voter name, first few as relative name
        if (names.length >= 4) {
          const midpoint = Math.floor(names.length / 2);
          voter.fatherName = names.slice(0, midpoint).join(' ');
          voter.name = names.slice(midpoint).join(' ');
        } else if (names.length >= 2) {
          voter.fatherName = names[0];
          voter.name = names.slice(1).join(' ');
        } else {
          voter.name = names.join(' ');
        }
      }
      
      // Clean up names - remove extra characters
      if (voter.name) {
        voter.name = voter.name.replace(/[^\u0900-\u097F\s]/g, '').trim();
      }
      if (voter.fatherName) {
        voter.fatherName = voter.fatherName.replace(/[^\u0900-\u097F\s]/g, '').trim();
      }
      
      // Build address from available info
      voter.address = voter.houseNumber || '';
      
      // Validation: Must have at least name OR age and voter ID
      if (!voter.name && !voter.age) {
        return null;
      }
      
      if (!voter.voterId) {
        return null; // Every record should have a voter ID
      }
      
      // Clean up empty fields
      Object.keys(voter).forEach(key => {
        if (typeof voter[key] === 'string') {
          voter[key] = voter[key].trim();
        }
      });
      
    } catch (error) {
      console.error('Error parsing voter record:', error.message);
      return null;
    }
    
    return voter;
  }

  /**
   * Load cached voter data
   */
  static async loadCachedVoters() {
    try {
      const filePath = path.join(process.cwd(), 'public', 'data', 'voters.json');
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
