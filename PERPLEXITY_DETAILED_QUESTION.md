# DETAILED PROBLEM EXPLANATION FOR PERPLEXITY AI

## OVERVIEW
We are building a voter card management system for Ward 7 of Baramati Municipal Council, Maharashtra, India. We need to extract and import ALL voter data from official PDF documents into a JSON database.

---

## CURRENT STATUS

### What Works ✅
- Database structure is correct
- UI displays voters with "अ.क्र." (Anukramank) sequential numbering
- Pagination working (30 voters per page)
- Search and filter functionality operational
- No duplicate voters in current data
- Server running at http://localhost:3000

### The Problem ❌
- **Target**: 2,715 total voters across 3 booth files
- **Currently Imported**: Only 1,760 voters (65%)
- **Missing**: ~955 voters need to be extracted and imported

---

## DATA SOURCE FILES

### PDF Files (Editable Text-Based PDFs)
Located in: `pdflist/`

1. **BoothVoterList_A4_Ward_7_Booth_1 - converted.pdf**
   - Expected: 991 voters
   - Currently extracted: 625 voters

2. **BoothVoterList_A4_Ward_7_Booth_2 - converted.pdf**
   - Expected: 861 voters
   - Currently extracted: 558 voters

3. **BoothVoterList_A4_Ward_7_Booth_3 - converted.pdf**
   - Expected: 863 voters
   - Currently extracted: 577 voters

### Text Files (Pre-extracted from PDFs)
We also have text files extracted from these PDFs:
- `W7F1.txt` (1,931 lines) - Contains 705 unique voter IDs
- `W7F2.txt` (1,586 lines) - Contains 586 unique voter IDs
- `W7F3.txt` - Contains 620 unique voter IDs

**Total unique voter IDs found in text files: 1,911** (but user confirms actual count should be 2,715)

---

## DATA STRUCTURE

### Required Fields for Each Voter
```javascript
{
  "voterId": "XUA7224868",              // Unique 10-char ID (XUA + 7 digits)
  "name": "गजानन यशवंत अनासपुरे",       // Full name in Marathi (Devanagari script)
  "uniqueSerial": "W7F1-S1",           // Format: W{ward}F{file}-S{serial}
  "serialNumber": "1",                  // Serial number within the file
  "age": "82",                          // Age in years (string format)
  "gender": "M",                        // "M" for Male, "F" for Female
  "ward": "7",                          // Ward number (always "7" for this data)
  "booth": "1",                         // Booth/File number (1, 2, or 3)
  "anukramank": 1                       // Sequential number (1 to 2715)
}
```

---

## PDF/TEXT FILE STRUCTURE

### Layout Challenge
The voter lists are formatted in a **3-COLUMN LAYOUT** on each page, making parsing extremely difficult.

### Example of Text Structure (from W7F1.txt):
```
Line 23: मतदाराचे पूर्ण :गजानन यशवंत अनासपुरे
Line 24: XUA7224868 201/138/143 I
Line 25: मतदाराचे पूर्ण: मंदा गजानन अनासपुरे
Line 26: XUA7224850 201/138/144 I
Line 27: मतदाराचे पूर्ण: तनुजा जावेद बागवान
Line 28: XUA7225139 201/138/145
Line 29: नांव नांव नांव [वडिलांचे नाव :यक्षवंत अनासपुरे e | [पतीचे नाव :गजानन अनासपुरे nee | पतीचे नाव :जावेद बागवान mae घर क्रमांक INA et घर क्रमांक :1% R | घर क्रमांक :1४% व
Line 30: [वय : ८२ लिंग :पु [वय : ७५ लिंग :सरी 'वय : ३१ लिंग : स्री
Line 31: 4 XUA7224801 201/138/146 5 XUA7224645 201/138/147 _ XUA7225162 201/138/148
Line 32: मतदाराचे पूर्ण :खुश्रबु मंहमदरफिक बागवान मतदाराचे पूर्ण:अंजुम गणी बागवान 'मतदाराचे पूर्ण: इम्रान शब्बीर बागवान नांव नांव नांव
```

### Key Patterns to Extract:

1. **Voter ID**: `XUA` followed by exactly 7 digits (e.g., `XUA7224868`)

2. **Serial Number**: Usually appears before voter ID on same line or nearby
   - Example: `1 XUA7224868` or `4 XUA7224801`
   - Range: 1-991 for File 1, 1-861 for File 2, 1-863 for File 3

3. **Name**: Appears after pattern `मतदाराचे पूर्ण` or `मतदाराचे पुर्ण` followed by colon
   - Pattern: `मतदाराचे पूर्ण :गजानन यशवंत अनासपुरे`
   - Name is in Devanagari (Unicode range: \u0900-\u097F)
   - Can be 2-4 words (first name, father/husband name, surname)

4. **Age**: After `वय :` or `वय:` pattern
   - Can be in Devanagari numerals (०-९) or Arabic numerals (0-9)
   - Example: `वय : ८२` = Age 82
   - Devanagari to Arabic: ० → 0, १ → 1, २ → 2, ३ → 3, ४ → 4, ५ → 5, ६ → 6, ७ → 7, ८ → 8, ९ → 9

5. **Gender**: After `लिंग :` or `लिंग:` pattern
   - Male: `पु` (sometimes appears as `पु` or `it` or `ol` in corrupted text)
   - Female: `स्री`, `ख्री`, `सरी`, `oot` (various spellings/corruptions)
   - Alternative detection: If text contains `पतीचे नाव` (husband's name), voter is female

6. **Reference Numbers**: Pattern like `201/138/143` appears after voter ID
   - Format: `page/section/entry` (can be ignored for our purposes)

---

## CHALLENGES WE'VE ENCOUNTERED

### 1. Multi-Column Text Merging
When text is extracted from the PDF, the 3 columns merge together on each line:
```
Column 1 Text | Column 2 Text | Column 3 Text
```
This causes:
- Names from different voters to concatenate
- Age/gender from one voter matching to another voter's ID
- Difficulty determining which data belongs to which voter

### 2. Text Encoding Issues
- Devanagari script (Marathi language) sometimes has encoding issues
- UTF-8 HTML entities appearing in extracted text
- Example: `à¤®à¤¤à¤¦à¤¾à¤°` instead of proper Devanagari

### 3. Inconsistent Formatting
- Some lines have complete voter data
- Some voters span multiple lines
- Serial numbers appear in different positions
- Gender markers have multiple variations

### 4. Name Extraction Complexity
- Names contain 2-4 words with spaces
- Must distinguish name from father's name, husband's name
- Pattern: `मतदाराचे पूर्ण नांव : [NAME]` but formatting varies
- Multi-column layout causes names to merge: "Name1 Name2 Name3" all on one line

---

## WHAT WE'VE TRIED

### Attempt 1: pdf-parse Module
```javascript
const pdf = require('pdf-parse');
// RESULT: Module structure incompatible, couldn't extract text
```

### Attempt 2: pdf2json Module  
```javascript
const PDFParser = require('pdf2json');
// RESULT: Returned 0 characters - PDFs might be image-based or encrypted
```

### Attempt 3: pdfjs-dist Module
```javascript
const { getDocument } = require('pdfjs-dist/legacy/build/pdf.js');
// RESULT: Module path not found, import errors
```

### Attempt 4: Direct Text File Parsing
```javascript
// Read W7F1.txt, W7F2.txt, W7F3.txt
// Use regex to find voter IDs
// Extract context around each ID
// RESULT: Only 15 voters extracted (99% failure rate)
// REASON: Name extraction regex too strict, multi-column merge issues
```

### Attempt 5: Improved Text Parser
```javascript
// Better context extraction (500 chars before, 800 after voter ID)
// Multiple name pattern attempts
// RESULT: 1,760 voters extracted (65% success)
// ISSUE: Names corrupted due to multi-column text merging
```

---

## CODE EXAMPLES OF WHAT WE'VE TRIED

### Current Best Extraction (Gets 1,760 voters but names corrupted)
```javascript
const fs = require('fs');

function parseTextFile(filePath, fileNumber) {
  const content = fs.readFileSync(filePath, 'utf8');
  const voters = [];
  
  // Find all voter IDs
  const voterIdPattern = /XUA\d{7}/g;
  let match;
  
  while ((match = voterIdPattern.exec(content)) !== null) {
    const voterId = match[0];
    const position = match.index;
    
    // Get context around voter ID
    const contextStart = Math.max(0, position - 500);
    const contextEnd = Math.min(content.length, position + 800);
    const context = content.substring(contextStart, contextEnd);
    
    // Extract serial number (digit before XUA)
    const beforeId = context.substring(0, context.indexOf(voterId));
    const serialMatch = beforeId.match(/(\d+)\s*$/);
    const serialNumber = serialMatch ? serialMatch[1] : null;
    
    if (!serialNumber) continue;
    
    // Extract name (Marathi text after "मतदाराचे पूर्ण")
    const namePatterns = [
      /मतदाराचे\s*पूर्ण[^:]*:\s*([ऀ-ॿ\s]+?)(?=\s*XUA)/,
      /पूर्ण[^:]*:\s*([ऀ-ॿ\s]+?)(?=\s*XUA)/
    ];
    
    let name = '';
    for (const pattern of namePatterns) {
      const nameMatch = beforeId.match(pattern);
      if (nameMatch && nameMatch[1].trim().length >= 5) {
        name = nameMatch[1].trim().replace(/\s+/g, ' ');
        break;
      }
    }
    
    if (!name) continue;
    
    // Extract age
    const afterId = context.substring(context.indexOf(voterId) + 10);
    const ageMatch = afterId.match(/वय\s*[:：]?\s*([०-९\d]+)/);
    const age = ageMatch ? ageMatch[1]
      .replace(/०/g, '0').replace(/१/g, '1').replace(/२/g, '2')
      .replace(/३/g, '3').replace(/४/g, '4').replace(/५/g, '5')
      .replace(/६/g, '6').replace(/७/g, '7').replace(/८/g, '8')
      .replace(/९/g, '9') : '30';
    
    // Extract gender
    const genderMatch = afterId.match(/लिंग\s*[:：]?\s*(पु|स्री|ख्री|सरी)/);
    const gender = genderMatch ? (genderMatch[1] === 'पु' ? 'M' : 'F') : 'M';
    
    voters.push({
      voterId,
      name,
      uniqueSerial: `W7F${fileNumber}-S${serialNumber}`,
      serialNumber,
      age,
      gender,
      ward: "7",
      booth: fileNumber.toString()
    });
  }
  
  return voters;
}
```

### The Problem with This Approach:
- **Names get corrupted** because the multi-column layout causes text from multiple voters to appear on the same line
- Example extracted name: `"खुश्रबु मंहमदरफिक बागवान मतदाराचे पूर्ण:अंजुम गणी बागवान 'मतदाराचे पूर्ण: इम्रान शब्बीर बागवान नांव नांव नांव"`
- This is actually 3 different voters' names merged together!

---

## TECHNICAL ENVIRONMENT

### Node.js Modules Available
- `fs` (file system)
- `pdf-parse@2.4.5` (but not working correctly)
- `pdf2json` (returns empty text)
- `pdfjs-dist` (import path issues)
- `pdf-poppler` (available but not tested)

### File System Structure
```
D:\web\election\voter\
├── pdflist/
│   ├── BoothVoterList_A4_Ward_7_Booth_1 - converted.pdf (11.2 MB)
│   ├── BoothVoterList_A4_Ward_7_Booth_2 - converted.pdf
│   ├── BoothVoterList_A4_Ward_7_Booth_3 - converted.pdf
│   ├── W7F1.txt (UTF-8 text file, 1931 lines)
│   ├── W7F2.txt (UTF-8 text file, 1586 lines)
│   └── W7F3.txt (UTF-8 text file)
├── public/
│   └── data/
│       └── voters.json (currently has 1760 voters)
└── [various extraction scripts we've created]
```

---

## WHAT WE NEED HELP WITH

### Primary Question:
**How can we accurately extract ALL 2,715 voters from these PDFs/text files, specifically handling the multi-column layout issue?**

### Specific Sub-Questions:

1. **Text Extraction Method**:
   - Should we use a different Node.js library for PDF text extraction?
   - Can we use Python (pdfplumber, PyPDF2, etc.) instead and call it from Node.js?
   - Is there a way to extract text column-by-column instead of line-by-line?

2. **Multi-Column Parsing Strategy**:
   - How to detect column boundaries in extracted text?
   - Should we use position-based parsing (X/Y coordinates of text)?
   - Can we split each line into 3 columns based on character positions or patterns?

3. **Name Extraction Approach**:
   - How to reliably extract Marathi names when text from multiple columns merges?
   - Should we look for specific delimiter patterns between columns?
   - Can we use the structure pattern (serial number → voter ID → name → father/husband → age → gender) to segment data?

4. **Alternative Approaches**:
   - Would OCR (Tesseract with Marathi language pack) give better results?
   - Should we convert PDF pages to images and use coordinate-based extraction?
   - Is there a table detection library that could identify the columnar structure?

5. **Data Validation**:
   - How to verify we've extracted all voters (cross-reference serial numbers 1-991, 1-861, 1-863)?
   - How to detect and handle missing/skipped voters?

---

## SAMPLE RAW TEXT FROM W7F1.txt

```
STATE ELECTION COMMISSION MANARASHTRA
राज्य निवडणूक आयोग
महाराष्ट्र
बारामती नगर परिषद
मतदान केंद्रनिहाय मतदार यादी
प्रभाग क्र. :७/वार्ड ७
मतदान केंद्र :१/ नगरपरिषद स्वामी विवेकानंद सभागृह, अशोकनगर खोली क्र.१

मतदाराचे पूर्ण :गजानन यशवंत अनासपुरे
XUA7224868 201/138/143 I
मतदाराचे पूर्ण: मंदा गजानन अनासपुरे
XUA7224850 201/138/144 I
मतदाराचे पूर्ण: तनुजा जावेद बागवान
XUA7225139 201/138/145
नांव नांव नांव [वडिलांचे नाव :यक्षवंत अनासपुरे e | [पतीचे नाव :गजानन अनासपुरे nee | पतीचे नाव :जावेद बागवान mae घर क्रमांक INA et घर क्रमांक :1% R | घर क्रमांक :1४% व
[वय : ८२ लिंग :पु [वय : ७५ लिंग :सरी 'वय : ३१ लिंग : स्री
4 XUA7224801 201/138/146 5 XUA7224645 201/138/147 _ XUA7225162 201/138/148
मतदाराचे पूर्ण :खुश्रबु मंहमदरफिक बागवान मतदाराचे पूर्ण:अंजुम गणी बागवान 'मतदाराचे पूर्ण: इम्रान शब्बीर बागवान नांव नांव नांव [वडिलांचे नाव :मंहमदरफिक बागवान ७०० | वडिलांचे नाव :गणी बागवान oo | वडिलांचे नाव :शब्बीर बागवान *%
घर क्रमांक INA ot | घर क्रमांक A ०" ०७०० | चर क्रमांक A पडि
वय : ३१ लिंग ol वय 39 लिंग oot वय : २९ लिंग :पु
```

**Analysis of this sample:**
- Lines 1-10: Header information
- Lines 11-14: **Voter 1**: Serial 1, ID XUA7224868, Name "गजानन यशवंत अनासपुरे"
- Lines 15-17: **Voter 2**: Serial 2, ID XUA7224850, Name "मंदा गजानन अनासपुरे"  
- Lines 18-19: **Voter 3**: Serial 3, ID XUA7225139, Name "तनुजा जावेद बागवान"
- Line 20: Father/husband names for voters 1-3 (merged into one line)
- Line 21: Ages and genders for voters 1-3 (merged into one line)
- Line 22: **THREE voters on one line**: Serial 4 (XUA7224801), Serial 5 (XUA7224645), Serial 6 (XUA7225162)
- Line 23: Names of all 3 voters merged together!
- Lines 24-25: Father names and other details merged

---

## SUCCESS CRITERIA

We need a solution that can:
1. Extract ALL 2,715 voters with 100% coverage
2. Correctly parse Marathi names without corruption/merging
3. Accurately map serial numbers (1-991, 1-861, 1-863)
4. Extract correct age and gender for each voter
5. Handle the multi-column layout properly

---

## QUESTIONS FOR PERPLEXITY

1. What is the best approach/library/tool to extract text from multi-column PDF documents while preserving column structure?

2. How can we parse the extracted text to correctly separate data from 3 columns that have been merged into single lines?

3. Are there any Node.js or Python libraries specifically designed for handling Indian language (Devanagari script) PDFs with tabular/columnar data?

4. Should we use a completely different approach (OCR, table detection, coordinate-based extraction)?

5. Can you provide sample code that would correctly parse this specific text structure?

---

## ADDITIONAL CONTEXT

- Language: Marathi (uses Devanagari script, Unicode range U+0900 to U+097F)
- Document source: Official Maharashtra State Election Commission voter lists
- File format: PDF documents are editable (text-based, not scanned images)
- User confirmed: PDFs are editable and contain searchable text
- System: Windows, Node.js v22.18.0, Next.js application
- Database: Simple JSON file (voters.json)

---

Thank you for any guidance you can provide!
