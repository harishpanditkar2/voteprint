const { exec } = require('child-process-promise');
const fs = require('fs').promises;
const path = require('path');
const { PDFParse } = require('pdf-parse');

/**
 * Dual Extraction Parser - Uses BOTH PDF text extraction AND OCR
 * Matches and merges results for maximum accuracy
 */
class DualExtractionParser {
  
  /**
   * Extract voters using both PDF text and OCR, then match and merge
   * @param {string} pdfPath - Path to PDF file
   * @returns {Promise<Array>} Merged voter data with confidence scores
   */
  static async extractVotersWithDualMethod(pdfPath) {
    console.log('\n🔄 Starting DUAL EXTRACTION (PDF Text + OCR)...\n');
    
    // Extract using both methods in parallel
    const [pdfTextVoters, ocrVoters] = await Promise.all([
      this.extractFromPDFText(pdfPath),
      this.extractFromOCR(pdfPath)
    ]);
    
    console.log(`\n📊 Extraction Results:`);
    console.log(`   PDF Text: ${pdfTextVoters.length} voters`);
    console.log(`   OCR: ${ocrVoters.length} voters`);
    
    // Match and merge results
    const mergedVoters = this.matchAndMerge(pdfTextVoters, ocrVoters);
    
    console.log(`   ✅ Merged: ${mergedVoters.length} voters\n`);
    
    return mergedVoters;
  }
  
  /**
   * Extract voter data from PDF text layer
   */
  static async extractFromPDFText(pdfPath) {
    console.log('📄 Extracting from PDF text layer...');
    
    try {
      const pdfBuffer = await fs.readFile(pdfPath);
      const pdfParse = new PDFParse(pdfBuffer);
      const pdfData = await pdfParse.parse();
      
      const voters = [];
      const text = pdfData.text;
      
      // Split into pages (approximate - pdf-parse doesn't give exact pages)
      // Extract all voters from full text
      const allVoters = this.parseVotersFromText(text, 0);
      
      console.log(`   ✓ PDF Text extracted ${allVoters.length} voters`);
      return allVoters;
      
    } catch (error) {
      console.error('   ❌ PDF text extraction failed:', error.message);
      return [];
    }
  }
  
  /**
   * Parse voter data from PDF text
   */
  static parseVotersFromText(text, pageNumber) {
    const voters = [];
    
    // Voter ID pattern: XUA followed by 7 digits
    const voterIdPattern = /[A-Z]{3}\d{7}/g;
    const voterIds = text.match(voterIdPattern) || [];
    
    // Serial number pattern: digits at start of line
    const serialPattern = /(?:^|\s)(\d{1,4})\s+/g;
    const serials = [];
    let match;
    while ((match = serialPattern.exec(text)) !== null) {
      serials.push(match[1]);
    }
    
    // Age pattern: 2-3 digit numbers (18-120)
    const agePattern = /\b([1-9]\d|1[0-2]\d)\b/g;
    const ages = [];
    while ((match = agePattern.exec(text)) !== null) {
      const age = parseInt(match[1]);
      if (age >= 18 && age <= 120) {
        ages.push(age.toString());
      }
    }
    
    // Gender pattern: M/F or Male/Female or पुरुष/स्त्री
    const genderPattern = /\b(M|F|Male|Female|पुरुष|स्त्री)\b/gi;
    const genders = text.match(genderPattern) || [];
    
    // Create voter objects
    const maxLength = Math.max(voterIds.length, serials.length, ages.length, genders.length);
    
    for (let i = 0; i < voterIds.length; i++) {
      const voter = {
        voterId: voterIds[i],
        serialNumber: serials[i] || null,
        age: ages[i] || null,
        gender: this.normalizeGender(genders[i]),
        pageNumber: pageNumber,
        source: 'pdf-text',
        confidence: {
          voterId: 0.95,  // High confidence for PDF text IDs
          serialNumber: serials[i] ? 0.9 : 0,
          age: ages[i] ? 0.85 : 0,
          gender: genders[i] ? 0.8 : 0
        }
      };
      
      voters.push(voter);
    }
    
    return voters;
  }
  
  /**
   * Extract voter data using OCR
   */
  static async extractFromOCR(pdfPath) {
    console.log('🔍 Extracting from OCR (Tesseract)...');
    
    try {
      const TesseractCLIParser = require('./tesseractCLIParser');
      
      // Ensure pdfPath is a string
      const pdfPathStr = typeof pdfPath === 'string' ? pdfPath : pdfPath.toString();
      
      const voters = await TesseractCLIParser.parseVoterPDFWithOCR(pdfPathStr);
      
      // Add source and confidence scores
      voters.forEach(voter => {
        voter.source = 'ocr';
        voter.confidence = {
          voterId: 0.8,  // Lower confidence for OCR IDs
          name: 0.9,      // High confidence for Marathi names
          age: 0.85,
          gender: 0.8
        };
      });
      
      console.log(`   ✓ OCR extracted ${voters.length} voters`);
      return voters;
      
    } catch (error) {
      console.error('   ❌ OCR extraction failed:', error.message);
      return [];
    }
  }
  
  /**
   * Match and merge results from both extraction methods
   */
  static matchAndMerge(pdfTextVoters, ocrVoters) {
    console.log('\n🔗 Matching and merging results...');
    
    const mergedVoters = [];
    const usedOcrIndices = new Set();
    const mismatches = [];
    
    // Match by voter ID
    for (const pdfVoter of pdfTextVoters) {
      // Find matching OCR voter by ID
      const ocrIndex = ocrVoters.findIndex((ocr, idx) => 
        !usedOcrIndices.has(idx) && ocr.voterId === pdfVoter.voterId
      );
      
      if (ocrIndex !== -1) {
        const ocrVoter = ocrVoters[ocrIndex];
        usedOcrIndices.add(ocrIndex);
        
        // Merge: Use best field from each source
        const merged = {
          // Prefer PDF text for IDs (higher accuracy)
          voterId: pdfVoter.voterId,
          serialNumber: pdfVoter.serialNumber || ocrVoter.serialNumber,
          
          // Prefer OCR for Marathi name (better character recognition)
          name: ocrVoter.name || pdfVoter.name,
          relativeName: ocrVoter.relativeName,
          relation: ocrVoter.relation,
          
          // Cross-validate age and gender
          age: this.crossValidateField('age', pdfVoter.age, ocrVoter.age),
          gender: this.crossValidateField('gender', pdfVoter.gender, ocrVoter.gender),
          
          // OCR specific fields
          address: ocrVoter.address,
          ward: ocrVoter.ward,
          booth: ocrVoter.booth,
          actualWard: ocrVoter.actualWard,
          actualBooth: ocrVoter.actualBooth,
          pollingCenter: ocrVoter.pollingCenter,
          partNumber: ocrVoter.partNumber,
          cardImage: ocrVoter.cardImage,
          
          // Metadata
          pageNumber: pdfVoter.pageNumber || ocrVoter.pageNumber,
          extractionMethod: 'dual',
          confidenceScore: this.calculateConfidence(pdfVoter, ocrVoter)
        };
        
        // Check for mismatches
        if (pdfVoter.age && ocrVoter.age && pdfVoter.age !== ocrVoter.age) {
          mismatches.push({
            voterId: merged.voterId,
            field: 'age',
            pdfValue: pdfVoter.age,
            ocrValue: ocrVoter.age
          });
        }
        
        mergedVoters.push(merged);
      } else {
        // No OCR match - use PDF text only
        mergedVoters.push({
          ...pdfVoter,
          extractionMethod: 'pdf-text-only',
          confidenceScore: 0.7
        });
      }
    }
    
    // Add remaining OCR voters not matched
    ocrVoters.forEach((ocrVoter, idx) => {
      if (!usedOcrIndices.has(idx)) {
        mergedVoters.push({
          ...ocrVoter,
          extractionMethod: 'ocr-only',
          confidenceScore: 0.75
        });
      }
    });
    
    // Log statistics
    const matched = usedOcrIndices.size;
    const pdfOnly = pdfTextVoters.length - matched;
    const ocrOnly = ocrVoters.length - matched;
    
    console.log(`   ✓ Matched: ${matched} voters`);
    console.log(`   ⚠ PDF only: ${pdfOnly} voters`);
    console.log(`   ⚠ OCR only: ${ocrOnly} voters`);
    
    if (mismatches.length > 0) {
      console.log(`   ⚠️ Found ${mismatches.length} field mismatches - review needed`);
    }
    
    return mergedVoters;
  }
  
  /**
   * Cross-validate field from both sources
   */
  static crossValidateField(fieldName, pdfValue, ocrValue) {
    if (!pdfValue && !ocrValue) return null;
    if (!pdfValue) return ocrValue;
    if (!ocrValue) return pdfValue;
    
    // If both exist and match, high confidence
    if (pdfValue === ocrValue) return pdfValue;
    
    // Mismatch - prefer PDF text for numbers, OCR for text
    if (fieldName === 'age' || fieldName === 'serialNumber') {
      return pdfValue; // Prefer PDF text for numbers
    }
    
    return ocrValue; // Prefer OCR for text fields
  }
  
  /**
   * Calculate overall confidence score
   */
  static calculateConfidence(pdfVoter, ocrVoter) {
    let score = 0;
    let count = 0;
    
    if (pdfVoter.voterId === ocrVoter.voterId) {
      score += 0.95;
      count++;
    }
    
    if (pdfVoter.age === ocrVoter.age) {
      score += 0.9;
      count++;
    }
    
    if (pdfVoter.gender === ocrVoter.gender) {
      score += 0.85;
      count++;
    }
    
    return count > 0 ? (score / count).toFixed(2) : 0.5;
  }
  
  /**
   * Normalize gender values
   */
  static normalizeGender(gender) {
    if (!gender) return null;
    
    const g = gender.toString().toLowerCase();
    if (g.includes('m') || g.includes('पुरुष')) return 'M';
    if (g.includes('f') || g.includes('स्त्री')) return 'F';
    
    return null;
  }
}

module.exports = DualExtractionParser;
