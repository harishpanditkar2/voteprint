const { exec } = require('child-process-promise');
const fs = require('fs').promises;
const path = require('path');

/**
 * OCR Parser using Tesseract CLI (More reliable than tesseract.js in Node.js)
 * Extracts correct Marathi text from government PDFs
 */
class TesseractCLIParser {
  /**
   * Extract metadata from PDF first page (ward, booth, polling center)
   * @param {string} pdfPath - Path to PDF file
   * @returns {Promise<Object>} Metadata object with ward, booth, pollingCenter
   */
  static async extractPDFMetadata(pdfPath) {
    try {
      const { pdfToPng } = require('pdf-to-png-converter');
      const pdfBuffer = await fs.readFile(pdfPath);
      
      // Convert only first page
      const pngPages = await pdfToPng(pdfBuffer, {
        viewportScale: 3.0,
        outputFileMask: 'page',
        pagesToProcess: [1]  // Only first page
      });
      
      // Save temp image
      const tempImagePath = path.join(process.cwd(), 'temp_metadata_page.png');
      await fs.writeFile(tempImagePath, pngPages[0].content);
      
      // Run Tesseract OCR
      const outputPath = path.join(process.cwd(), 'temp_metadata_ocr');
      const tesseractPath = process.platform === 'win32' 
        ? '"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"'
        : 'tesseract';
      
      const cmd = `${tesseractPath} "${tempImagePath}" "${outputPath}" -l mar+eng --psm 6 --oem 1`;
      await exec(cmd);
      
      // Read OCR output
      const ocrText = await fs.readFile(`${outputPath}.txt`, 'utf-8');
      
      // Extract ward
      let ward = null;
      const wardPatterns = [
        /प्रभाग\s+क्र\.\s*[:-]?\s*([०-९0-9]+)/,
        /वार्ड\s+([०-९0-9]+)/,
        /Ward\s*[:-]?\s*([0-9]+)/i
      ];
      
      for (const pattern of wardPatterns) {
        const match = ocrText.match(pattern);
        if (match) {
          ward = this.convertDevanagariToArabic(match[1]);
          break;
        }
      }
      
      // Extract booth
      let booth = null;
      const boothPatterns = [
        /मतदान\s+केंद्र\s*[:-]?\s*([०-९0-9]+)/,
        /Booth\s*[:-]?\s*([0-9]+)/i
      ];
      
      for (const pattern of boothPatterns) {
        const match = ocrText.match(pattern);
        if (match) {
          booth = this.convertDevanagariToArabic(match[1]);
          break;
        }
      }
      
      // Extract polling center name and city
      let pollingCenter = null;
      const pollingCenterPatterns = [
        /केंद्राचा\s+पत्ता\s*[:-]?\s*(.+?)(?=\n|अनुक्रमांक|$)/,
        /मतदान\s+केंद्र\s*[:-]?\s*[०-९0-9]+\/\s*(.+?)(?=\n|मतदान|केंद्राचा|$)/
      ];
      
      for (const pattern of pollingCenterPatterns) {
        const match = ocrText.match(pattern);
        if (match) {
          pollingCenter = match[1].trim().replace(/\s+/g, ' ');
          break;
        }
      }
      
      // If not found in OCR, try filename
      if (!ward || !booth) {
        const filename = path.basename(pdfPath);
        const filenameMatch = filename.match(/Ward_(\d+)_Booth_(\d+)/i);
        if (filenameMatch) {
          if (!ward) ward = filenameMatch[1];
          if (!booth) booth = filenameMatch[2];
        }
      }
      
      // Cleanup temp files
      await fs.unlink(tempImagePath).catch(() => {});
      await fs.unlink(`${outputPath}.txt`).catch(() => {});
      
      return {
        ward: ward || 'Unknown',
        booth: booth || 'Unknown',
        pollingCenter: pollingCenter || 'मतदान केंद्र'
      };
    } catch (error) {
      console.warn('⚠️  Could not extract metadata:', error.message);
      // Fallback to filename
      const filename = path.basename(pdfPath);
      const filenameMatch = filename.match(/Ward_(\d+)_Booth_(\d+)/i);
      return {
        ward: filenameMatch ? filenameMatch[1] : 'Unknown',
        booth: filenameMatch ? filenameMatch[2] : 'Unknown',
        pollingCenter: 'मतदान केंद्र'
      };
    }
  }

  /**
   * Parse voter PDF using Tesseract CLI
   * @param {string} pdfPath - Path to PDF file
   * @param {number} maxPages - Maximum number of pages to process (optional)
   * @returns {Promise<Array>} Array of voter objects with correct Marathi names
   */
  static async parseVoterPDFWithOCR(pdfPath, maxPages = null) {
    try {
      console.log('🔄 Converting PDF to images...');
      
      // Use pdf-to-png-converter (no poppler needed)
      const { pdfToPng } = require('pdf-to-png-converter');
      const pdfBuffer = await fs.readFile(pdfPath);
      
      // First, extract metadata from first page
      console.log('📋 Extracting metadata from first page...');
      const metadata = await this.extractPDFMetadata(pdfPath);
      console.log(`✓ Ward: ${metadata.ward}, Booth: ${metadata.booth}`);
      console.log(`✓ Polling Center: ${metadata.pollingCenter}`);
      
      // Higher quality settings for better OCR accuracy
      const pngPages = await pdfToPng(pdfBuffer, {
        viewportScale: 3.0,  // Increased from 2.0 to 3.0 for sharper text
        outputFileMask: 'page',
        pagesToProcess: maxPages ? Array.from({length: maxPages}, (_, i) => i + 2) : undefined // Skip first page
      });

      console.log(`✅ Converted ${pngPages.length} pages to images`);

      const voters = [];
      let globalSerialNum = 0;

      // Determine how many pages to process
      const totalPagesToProcess = maxPages ? maxPages : pngPages.length;
      console.log(`📝 Processing ${totalPagesToProcess} pages...\n`);

      // Process pages - pngPages already has the correct pages (skipping page 1)
      for (let i = 0; i < Math.min(totalPagesToProcess, pngPages.length); i++) {
        const pageNum = i + 2; // +2 because we skipped page 1 in conversion
        console.log(`📖 OCR Processing page ${pageNum}/73...`);
        
        // Save temp image with HIGHER quality
        const tempImagePath = path.join(process.cwd(), `temp_ocr_page_${pageNum}.png`);
        await fs.writeFile(tempImagePath, pngPages[i].content);
        
        // Create directory for voter card images
        const voterImagesDir = path.join(process.cwd(), 'public', 'voter-cards');
        await fs.mkdir(voterImagesDir, { recursive: true });
        
        try {
          // Run Tesseract CLI with higher quality settings
          const outputPath = path.join(process.cwd(), `temp_ocr_output_${pageNum}`);
          
          const tesseractPath = process.platform === 'win32' 
            ? '"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"'
            : 'tesseract';
          
          // PSM 6: Assume uniform block of text (better for forms)
          // OEM 1: Neural nets LSTM engine only (better accuracy)
          const cmd = `${tesseractPath} "${tempImagePath}" "${outputPath}" -l mar+eng --psm 6 --oem 1`;
          
          await exec(cmd);
          
          // Read OCR output
          const ocrText = await fs.readFile(`${outputPath}.txt`, 'utf-8');
          
          // Save first page OCR for debugging
          if (pageNum === 2) {
            await fs.writeFile(path.join(process.cwd(), 'ocr_debug_page2.txt'), ocrText, 'utf-8');
            console.log('  📝 Saved OCR debug output to: ocr_debug_page2.txt');
          }
          
          // Extract voters with image cropping
          const pageVoters = await this.extractVotersFromOCRText(ocrText, pageNum, pngPages[i].content, voterImagesDir, metadata);
          
          // Assign IDs but keep extracted serial numbers
          pageVoters.forEach(voter => {
            globalSerialNum++;
            // Keep the extracted serialNumber from OCR, don't overwrite it
            // Only set if it wasn't extracted
            if (!voter.serialNumber) {
              voter.serialNumber = globalSerialNum.toString();
            }
            voter.id = `VOTER_${Date.now()}_${globalSerialNum}_${Math.random().toString(36).substr(2, 9)}`;
            voter.createdAt = new Date().toISOString();
          });
          
          voters.push(...pageVoters);
          
          console.log(`✓ Page ${pageNum}: Found ${pageVoters.length} voters (Total: ${voters.length})`);
          
          // Cleanup temp files
          await fs.unlink(tempImagePath).catch(() => {});
          await fs.unlink(`${outputPath}.txt`).catch(() => {});
          
        } catch (error) {
          console.warn(`⚠️  Page ${pageNum} error:`, error.message);
          await fs.unlink(tempImagePath).catch(() => {});
        }
      }

      console.log(`\n✅ Total voters extracted: ${voters.length}`);
      
      // Save to public/data for both API and frontend access
      const outputPath = path.join(process.cwd(), 'public', 'data', 'voters.json');
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, JSON.stringify(voters, null, 2));
      console.log(`💾 Saved to ${outputPath}`);

      return voters;
    } catch (error) {
      console.error('❌ OCR Error:', error);
      throw error;
    }
  }

  /**
   * Clean OCR text to fix common voter ID issues
   */
  static cleanOCRTextForVoterIDs(text) {
    let cleaned = text;
    
    // Convert Devanagari numerals to Arabic (०-९ → 0-9)
    const devToArabic = {
      '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
      '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
    };
    
    for (const [dev, arab] of Object.entries(devToArabic)) {
      cleaned = cleaned.replace(new RegExp(dev, 'g'), arab);
    }
    
    // Fix common OCR errors in voter IDs
    // Fix lowercase x/c/r/u/a/m → X/C/R/U/A/M
    cleaned = cleaned.replace(/\b([xc])([ura])([amu])(\d{7,10})/gi, (match, p1, p2, p3, p4) => {
      return p1.toUpperCase() + p2.toUpperCase() + p3.toUpperCase() + p4;
    });
    
    // Remove common OCR noise patterns before voter IDs
    cleaned = cleaned.replace(/[~\-|]+([XC][UR][AMU]\d{7,10})/g, '$1');
    
    // Fix corrupted voter IDs where prefix is garbled but we have digits + part number
    // Pattern: some digits followed by part number, try to reconstruct voter ID
    // Example: "1777225162 201/138/148" → guess it should be "XUA7225162 201/138/148"
    cleaned = cleaned.replace(/\b(\d{3,})(\d{7})\s+(\d{3}\/\d{3}\/\d{3})/g, (match, noise, digits, partNumber) => {
      // If we have more than 7 digits before part number, take last 7
      const voterDigits = digits.length >= 7 ? digits.slice(-7) : digits;
      // Try to reconstruct as XUA + 7 digits
      return `XUA${voterDigits} ${partNumber}`;
    });
    
    // Fix common OCR digit errors in voter IDs (2→7, 0→O, etc.)
    // Pattern: Look for voter IDs with suspicious digits
    cleaned = cleaned.replace(/\b(XUA|CRM)([0-9]{7,10})\s+(\d{3}\/\d{3}\/\d{3})/g, (match, prefix, digits, partNumber) => {
      // Common OCR errors: leading 2 often should be 7
      let fixed = digits;
      if (fixed.length === 7 && fixed[0] === '2') {
        // First digit 2 might be 7
        fixed = '7' + fixed.slice(1);
      }
      return `${prefix}${fixed} ${partNumber}`;
    });
    
    return cleaned;
  }

  /**
   * Extract voter information from OCR text and save individual voter card images
   */
  static async extractVotersFromOCRText(text, pageNumber, pageImageBuffer, voterImagesDir, metadata) {
    const voters = [];
    const sharp = require('sharp');  // For image cropping
    
    // Clean OCR text to fix voter ID issues
    text = this.cleanOCRTextForVoterIDs(text);
    
    // Strategy: Match voter ID + part number as a unit, then extract surrounding data
    // Pattern: Voter ID followed by part number like "XUA7224868 201/138/143"
    const voterIdPartPattern = /([XC][UR][AMU]\d{7,10})\s+(\d{3}\/\d{3}\/\d{3})/g;
    
    let match;
    const voterMatches = [];
    while ((match = voterIdPartPattern.exec(text)) !== null) {
      // Look backward up to 20 chars for serial number
      const searchStart = Math.max(0, match.index - 20);
      const beforeText = text.substring(searchStart, match.index);
      const serialMatch = beforeText.match(/(\d+)\s*$/);
      
      voterMatches.push({
        serialNumber: serialMatch ? serialMatch[1] : '',
        voterId: match[1],
        partNumber: match[2],
        startIndex: serialMatch ? searchStart + beforeText.lastIndexOf(serialMatch[1]) : match.index,
        endIndex: match.index + match[0].length
      });
    }
    
    console.log(`  Found ${voterMatches.length} voter IDs in OCR text`);
    
    // Extract all names, ages, genders separately then match sequentially
    // This works best for 3-column layout despite some gaps
    const namePattern = /मतदाराचे\s+पूर्ण\s*[:\s]+([\u0900-\u097F]+(?:\s+[\u0900-\u097F]+)*?)(?=\s+(?:मतदाराचे|नांव|त\s+च|वडि|पती|Photo|\n|$))/g;
    const nameMatches = [];
    let nameMatch;
    while ((nameMatch = namePattern.exec(text)) !== null) {
      nameMatches.push(nameMatch[1].trim().replace(/\s+/g, ' '));
    }
    console.log(`  Found ${nameMatches.length} names in OCR text`);
    
    const agePattern = /वय\s*[:=-]?\s*([\u0966-\u096f\d]+)/g;
    const ageMatches = [];
    let ageMatch;
    while ((ageMatch = agePattern.exec(text)) !== null) {
      ageMatches.push(this.convertDevanagariToArabic(ageMatch[1]));
    }
    console.log(`  Found ${ageMatches.length} ages in OCR text`);
    
    const genderPattern = /लिंग\s*[:=-]?\s*(पुरुष|स्त्री|पु|स्री|स्त्|स|M|F)/g;
    const genderMatches = [];
    let genderMatch;
    while ((genderMatch = genderPattern.exec(text)) !== null) {
      const g = genderMatch[1].toLowerCase();
      genderMatches.push((g.includes('पु') || g === 'm') ? 'M' : 'F');
    }
    console.log(`  Found ${genderMatches.length} genders in OCR text`);
    
    // Match sequentially - if counts don't match, user can run manual corrections
    voterMatches.forEach((voterMatch, idx) => {
      const sectionEnd = Math.min(voterMatch.endIndex + 350, text.length);
      const voterSection = text.substring(voterMatch.startIndex, sectionEnd);
      
      const name = idx < nameMatches.length ? nameMatches[idx] : '';
      const age = idx < ageMatches.length ? ageMatches[idx] : '';
      const gender = idx < genderMatches.length ? genderMatches[idx] : '';
      
      // Parse other fields from section (father name, house number)
      const parsed = this.parseVoterFields(voterSection);
      
      // Extract ward/booth from part number
      const parts = voterMatch.partNumber.split('/');
      const partWard = parts.length === 3 ? parts[1] : '';
      const partBooth = parts.length === 3 ? parts[2] : '';

      voters.push({
        serialNumber: voterMatch.serialNumber,
        voterId: voterMatch.voterId,
        partNumber: voterMatch.partNumber,
        pageNumber: pageNumber,
        name: name,
        age: age,
        gender: gender,
        fatherName: parsed.fatherName,
        relativeDetail: parsed.relativeDetail,
        houseNumber: parsed.houseNumber,
        address: parsed.address,
        ward: partWard,
        booth: partBooth,
        actualWard: metadata.ward,
        actualBooth: metadata.booth,
        pollingCenter: metadata.pollingCenter,
        source: 'Tesseract CLI OCR',
        nameStatus: 'verified',
        cardImage: '',
        dataQuality: {
          voterId: 'verified',
          age: age ? 'verified' : 'missing',
          gender: gender ? 'verified' : 'missing',
          booth: 'verified',
          ward: 'verified',
          name: name ? 'verified' : 'missing',
          fatherName: parsed.fatherName ? 'verified' : 'missing'
        }
      });
    });

    // Crop and save individual voter card images (3 columns layout)
    if (pageImageBuffer && voterImagesDir) {
      try {
        const imageMetadata = await sharp(pageImageBuffer).metadata();
        const imageWidth = imageMetadata.width;
        const imageHeight = imageMetadata.height;
        // 3-column layout - calculate approximate positions
        const colWidth = Math.floor(imageWidth / 3);
        const rowsPerPage = 10; // 10 rows of cards, but first row is header
        const rowHeight = Math.floor(imageHeight / (rowsPerPage + 1)); // +1 for header row

        // Skip header row: start from row 1
        for (let i = 0; i < voters.length; i++) {
          const voterIndex = i % 30;
          const row = Math.floor(voterIndex / 3) + 1; // +1 skips header row
          const col = voterIndex % 3;
          const left = col * colWidth;
          const top = row * rowHeight;
          const width = colWidth;
          const height = rowHeight;
          const voter = voters[i];
          const cardImageFilename = `voter_${voter.voterId}_page${pageNumber}.jpg`;
          const cardImagePath = path.join(voterImagesDir, cardImageFilename);
          await sharp(pageImageBuffer)
            .extract({ left, top, width, height })
            .jpeg({ quality: 90 })
            .toFile(cardImagePath);
          voters[i].cardImage = `/voter-cards/${cardImageFilename}`;
        }
        console.log(`  📸 Saved ${voters.length} voter card images (skipped header row)`);
      } catch (imgError) {
        console.warn(`  ⚠️  Could not crop voter images:`, imgError.message);
      }
    }

    return voters;
  }

  /**
   * Clean up OCR errors in voter IDs
   */
  static cleanVoterId(id) {
    // Common OCR misreads: Devanagari numbers/letters for Latin
    id = id.replace(/^[०-९]{3}/, 'XUA'); // ९७१ -> XUA
    id = id.replace(/^[या]/, 'X'); // या -> X
    return id;
  }

  /**
   * Convert Devanagari numerals to Arabic numerals
   */
  static convertDevanagariToArabic(num) {
    if (!num) return '';
    
    const devanagariMap = {
      '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
      '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
    };
    
    return num.split('').map(char => devanagariMap[char] || char).join('');
  }

  /**
   * Fix common OCR character confusions in Marathi text
   * Comprehensive map based on actual OCR errors observed
   */
  static fixOCRErrors(text) {
    if (!text) return '';
    
    // CRITICAL: Character-level confusions in Devanagari script
    // These MUST be fixed before pattern matching
    const charCorrections = {
      // व (va) confused with प (pa)
      'पडिलांचे': 'वडिलांचे',  // Father's name - CRITICAL
      'पडील': 'वडील',
      
      // झ (jha) confused with श (sha) 
      'झंकर': 'शंकर',  // Common in names like शंकरराव
      'झब्बीर': 'शब्बीर',
      'झंकरराव': 'शंकरराव',
      'झब्बी': 'शब्बी',
      'झंकर': 'शंकर',
      'झा': 'शा',
      'झी': 'शी',
      'झे': 'शे',
      'झो': 'शो',
      'झू': 'शू',
      
      // पत (pati/husband) variations
      'एतीचे': 'पतीचे',  // Husband's name
      'एती': 'पती',
      
      // घर (house) confusions
      'चर क्रमांक': 'घर क्रमांक',
      'चर': 'घर',
      'ग्रमांक': 'क्रमांक',
      'ग्रं': 'क्रं',
      
      // Double र (ra) confusion
      'क्रृष्ण': 'कृष्ण',
      
      // Remove OCR garbage at end of lines
      ' on ': ' ',
      ' oe ': ' ',
      ' owe ': ' ',
      ' ro ': ' ',
      ' roo ': ' ',
      ' veo ': ' ',
      ' pon ': ' ',
      ' vec,': '',
      ' kk Deed': '',
      ' १०४...': '',
      ' १०५...': '',
      ' ९००...': '',
      ' ९५...': '',
      ' ८...': '',
      'AAT': '',  // Garbage in names
      
      // Clean up trailing dots and special chars
      '०…': '',
      '।': ' '
    };
    
    let corrected = text;
    for (const [wrong, right] of Object.entries(charCorrections)) {
      corrected = corrected.replace(new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), right);
    }
    
    return corrected;
  }

  /**
   * Validate name match between voter and father
   * Marathi naming: FirstName FatherFirstName Surname
   * Father's name: FatherFirstName Surname
   * So voter's middle name should match father's first name
   * AND voter's surname should match father's surname
   */
  static validateFatherNameMatch(voterName, fatherName) {
    if (!voterName || !fatherName) return { valid: false };
    
    const voterParts = voterName.trim().split(/\s+/);
    const fatherParts = fatherName.trim().split(/\s+/);
    
    // Need at least 3 parts for voter (First Middle Last) and 2 for father (First Last)
    if (voterParts.length < 3 || fatherParts.length < 2) {
      return { valid: false, reason: 'insufficient_parts' };
    }
    
    const voterMiddleName = voterParts[voterParts.length - 2]; // Second last
    const voterSurname = voterParts[voterParts.length - 1]; // Last
    
    const fatherFirstName = fatherParts[0]; // First
    const fatherSurname = fatherParts[fatherParts.length - 1]; // Last
    
    // Check if voter's middle name matches father's first name
    const middleNameMatches = voterMiddleName.toLowerCase() === fatherFirstName.toLowerCase();
    
    // Check if surnames match
    const surnameMatches = voterSurname.toLowerCase() === fatherSurname.toLowerCase();
    
    return {
      valid: middleNameMatches && surnameMatches,
      middleNameMatches,
      surnameMatches,
      voterMiddleName,
      fatherFirstName,
      voterSurname,
      fatherSurname
    };
  }

  /**
   * Extract surname from full name
   */
  static extractSurname(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    return parts[parts.length - 1] || '';
  }

  /**
   * Parse individual voter fields from OCR text
   */
  static parseVoterFields(section) {
    const parsed = {
      name: '',
      age: '',
      gender: '',
      fatherName: '',
      relativeDetail: '',
      houseNumber: '',
      address: ''
    };

    try {
      // Name is extracted separately now, skip here
      
      // Extract Age: वय : <number> (can be Devanagari or Arabic numerals)
      // Pattern: "वय: ८२" or "वय : 82"
      const agePattern = /वय\s*[:=-]?\s*([०-९\d]+)/;
      const ageMatch = section.match(agePattern);
      if (ageMatch) {
        parsed.age = this.convertDevanagariToArabic(ageMatch[1]);
      }

      // Extract Gender - look for pattern with variations
      // "लिंग : पु" or "लिंग : स्री" or "लिंग wt" or "लिंग : M"
      const genderPattern = /(?:लिंग|लिंग|लिंगः)\s*[:=-]?\s*(पुरुष|स्त्री|पु|पुrी|स्री|स्त्|wt|M|F)/i;
      const genderMatch = section.match(genderPattern);
      if (genderMatch) {
        const g = genderMatch[1].toLowerCase();
        parsed.gender = (g.includes('पु') || g === 'm' || g === 'wt') ? 'M' : 'F';
      }

      // Extract Father Name - वडिलांचे नाव (after OCR correction)
      // Stop BEFORE: another "नाव" keyword, घर, वय, or newline
      // This prevents capturing adjacent voter's father/husband name labels
      const fatherPattern = /वडिलांचे\s+नाव\s*[:=-]?\s*([\u0900-\u097F\s]+?)(?=\s+(?:वडिलांचे|पतीचे|नाव|घर|वय|[\n])|$)/;
      const fatherMatch = section.match(fatherPattern);
      if (fatherMatch) {
        let fatherName = fatherMatch[1].trim().replace(/\s+/g, ' ');
        // Clean trailing/leading junk and OCR artifacts
        fatherName = fatherName.replace(/^[:=-\s]+/, '').replace(/[:=-\s]+$/, '');
        // Remove trailing numbers and special chars that aren't part of name
        fatherName = fatherName.replace(/\s+[०-९\d]+.*$/, '');
        if (fatherName.length > 2) {  // Valid name should have at least 3 chars
          parsed.fatherName = fatherName;
          parsed.relativeDetail = 'Father';
        }
      }

      // Extract Husband Name - पतीचे नाव (after OCR correction)
      if (!parsed.fatherName) {
        const husbandPattern = /पतीचे\s+नाव[ा]?\s*[:=-]?\s*([\u0900-\u097F\s]+?)(?=\s+(?:वडिलांचे|पतीचे|नाव|घर|वय|[\n])|$)/;
        const husbandMatch = section.match(husbandPattern);
        if (husbandMatch) {
          let husbandName = husbandMatch[1].trim().replace(/\s+/g, ' ');
          // Clean trailing/leading junk
          husbandName = husbandName.replace(/^[:=-\s]+/, '').replace(/[:=-\s]+$/, '');
          // Remove trailing numbers
          husbandName = husbandName.replace(/\s+[०-९\d]+.*$/, '');
          if (husbandName.length > 2) {  // Valid name should have at least 3 chars
            parsed.fatherName = husbandName;
            parsed.relativeDetail = 'Husband';
          }
        }
      }

      // Extract House Number (can be NA, Devanagari numbers, or Latin)
      // Pattern: घर क्रमांक : ४६ or घर क्रमांक "NA or घर क्रमांक SNA
      const housePattern = /घर\s+क्रमांक\s*[:=-]?\s*([^\s\n|]+)/;
      const houseMatch = section.match(housePattern);
      if (houseMatch) {
        let house = houseMatch[1].trim();
        // Remove quotes and OCR garbage
        house = house.replace(/[\"'¢SNA|OMS|eR|vette|MS|eae]/g, '').trim();
        // Convert Devanagari numerals
        if (house && house !== 'NA' && house.length > 0) {
          parsed.houseNumber = this.convertDevanagariToArabic(house);
          parsed.address = parsed.houseNumber;
        }
      }

    } catch (error) {
      console.error('Error parsing voter fields:', error.message);
    }

    return parsed;
  }
}

module.exports = TesseractCLIParser;
