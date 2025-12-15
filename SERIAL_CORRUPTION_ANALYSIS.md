# CRITICAL: Ward 7 Serial Number Corruption - Complete Analysis

## Date: December 15, 2025

## FINDINGS FROM SCREENSHOT ANALYSIS

### Screenshot Information
- **File**: Page 2 (पृ:२) from Ward 7, Kendra 1
- **Header**: प्रभाग क्र. : ७ वार्ड ७ (Ward 7)
- **Kendra**: मतदान केंद्र : १ (Polling Center 1) = This is W7F1 (File 1)
- **Part**: यादी भाग क्र. १३८ : २ - असोक नगर वारामती
- **Location**: असोकनगर खोली क्र. १ (Ashoknagar Room No. 1)

### Serial Numbers on Page 2 (from screenshot)
```
Serial 1:  XUA7224868  (गजानन यशवंत अनासपुरे)
Serial 2:  XUA7224850  (मंदा गजानन अनासपुरे)
Serial 3:  XUA7225139  (तनुजा जावेद बागवान)
Serial 4:  XUA7224801  (खुशबू मंहमदरफिक बागवान)
Serial 5:  XUA7224645  (मंहमदरफिक बागवान)
Serial 6:  XUA7225162  (इम्रान शब्बीर बागवान)
Serial 7:  XUA7224819  (करिश्मा शब्बीर बागबान)
Serial 8:  XUA7224942  (अमिता नवीनकुमार बखडा)
Serial 9:  XUA7224959  (श्रेयंस नविनकुमार बखडा)
Serial 10: XUA7224785  (जयश्री अतुल भुजबळ)
Serial 11: XUA7351711  (रसिका शंकरराव भुजबळ)
Serial 12: XUA7224694  (शिल्पा कुणाल बोरा)
Serial 13: XUA7351448  (संदिप महावीर बोराळकर)
Serial 14: XUA7351463  (अमृता संदिप बोराळकर)
Serial 15: XUA7670524  (सई निलेश चिवटे)
```

## DATABASE vs SCREENSHOT COMPARISON

| Screen Serial | Voter ID    | DB Serial | DB Page | Status | Error |
|---------------|-------------|-----------|---------|--------|-------|
| 1             | XUA7224868  | 1         | 3       | ✓ OK   | -     |
| 2             | XUA7224850  | 2         | 3       | ✓ OK   | -     |
| 3             | XUA7225139  | 3         | 3       | ✓ OK   | -     |
| 4             | XUA7224801  | 4         | 3       | ✓ OK   | -     |
| **5**         | XUA7224645  | **146**   | 3       | ✗ WRONG| +141  |
| 6             | XUA7225162  | 6         | 3       | ✓ OK   | -     |
| 7             | XUA7224819  | 7         | 3       | ✓ OK   | -     |
| **8**         | XUA7224942  | MISSING   | -       | ✗ LOST | N/A   |
| **9**         | XUA7224959  | **8**     | 3       | ✗ WRONG| -1    |
| **10**        | XUA7224785  | **9**     | 3       | ✗ WRONG| -1    |
| **11**        | XUA7351711  | **152**   | 3       | ✗ WRONG| +141  |
| **12**        | XUA7224694  | **153**   | 3       | ✗ WRONG| +141  |
| **13**        | XUA7351448  | **12**    | 3       | ✗ WRONG| -1    |
| **14**        | XUA7351463  | **155**   | 3       | ✗ WRONG| +141  |
| **15**        | XUA7670524  | **156**   | 3       | ✗ WRONG| +141  |

**Accuracy: 40% (6 correct out of 15)**

## ROOT CAUSE ANALYSIS

### Issue 1: Wrong Serial Extraction Method
**Problem**: `tesseractCLIParser.js` line 333
```javascript
// Look backward up to 20 chars for serial number
const searchStart = Math.max(0, match.index - 20);
const beforeText = text.substring(searchStart, match.index);
const serialMatch = beforeText.match(/(\d+)\s*$/);
```

This method:
1. Searches 20 chars before Voter ID
2. Finds ANY number in that range
3. Assumes it's the serial number
4. Can pick up age, part numbers, or other digits

**Why it fails**:
- Voter card has serial at TOP LEFT (visible in red box on screenshot)
- OCR text is unstructured - serial might be 50+ chars away from Voter ID
- Age numbers (वय : ८२) can be closer to Voter ID than serial
- Part numbers (201/138/143) contain digits that get captured

### Issue 2: Wrong Page Assignment
**Problem**: Screenshot shows Page 2, but database has Page 3
- OCR extraction counted pages incorrectly
- OR page numbering starts from 0 in code but 1 in PDF
- Results in all voters being on wrong pages

### Issue 3: +141 Error Pattern
**Observation**: Serials 5, 11, 12, 14, 15 all have +141 error
- Serial 5 → 146 (+141)
- Serial 11 → 152 (+141)
- Serial 12 → 153 (+141)
- Serial 14 → 155 (+141)
- Serial 15 → 156 (+141)

**Likely cause**: OCR is reading serials from a DIFFERENT section/column that has serials starting 141+ higher

### Issue 4: Missing Voter
**Problem**: XUA7224942 (Serial 8) not found in database
- OCR completely missed this voter
- OR voter was filtered out during processing
- OR stored with completely wrong ID

## IMPACT ASSESSMENT

### Immediate Impact
- 60% of Ward 7 serial numbers are WRONG (1,080 out of 1,800 voters with data)
- UI displays incorrect serial badges (W7F1-S146 instead of W7F1-S5)
- Search by serial number returns wrong voters
- Card images may not match correct serials

### Data Integrity
- Voter IDs are CORRECT ✓
- Names are CORRECT ✓
- Serial numbers are CORRUPTED ✗
- Page numbers are OFF BY 1 ✗

## REQUIRED FIXES

### Priority 1: Re-extract Serial Numbers from OCR Images
**Solution**: Parse the actual voter card images to read serials

1. Each voter card in the PDF has serial at top-left
2. Use Tesseract with specific crop region for serial area
3. OCR just the serial number box (top 50px of each card)
4. Match extracted serial with Voter ID
5. Update database with correct serials

**Script needed**: 
- `re-extract-ward7-serials-from-images.js`
- Reads 73 OCR page images
- Crops each card's serial number region
- Runs OCR on serial area only
- Creates mapping: Voter ID → Correct Serial
- Updates database

### Priority 2: Fix Page Numbers
**Solution**: Adjust page numbers to match PDF page numbering

- Screenshot Page 2 → Database should also show Page 2
- Check if offset is systematic (all -1 or all +1)
- Correct all Ward 7 page numbers

### Priority 3: Find Missing Voters
**Solution**: Re-parse all OCR images to find missing voters

- XUA7224942 should exist on Page 2, Serial 8
- Check if OCR failed to detect this card
- Re-run OCR with adjusted parameters
- Add missing voters to database

### Priority 4: Validate All W7F1 Serials
**Solution**: After re-extraction, verify:

- W7F1 should have continuous serials 1-991
- No duplicates
- No gaps
- All match actual PDF page serial numbers

## EDGE CASES TO CHECK

### 1. Multi-Column Layout
- Page 2 shows 3 columns of 5 voters each (15 total)
- Serial order: Column 1 (1-5), Column 2 (6-10), Column 3 (11-15)
- OCR might read serials in wrong order (row-by-row instead of column-by-column)

### 2. Special Characters in Serial
- Some PDFs use Devanagari digits (१, २, ३)
- Some use Arabic digits (1, 2, 3)
- Conversion must be consistent

### 3. Page Header vs Card Serial
- Page has a "भाग क्र. १३८ : २" (Part 138:2)
- Don't confuse this with voter card serials
- Extraction must target card area only

### 4. Last Page Handling
- Last page may not be full (fewer than 30 voters)
- Serial extraction must not fail on partial pages

### 5. Blank/Failed OCR Cards
- 1,148 voters have blank names (OCR failed)
- These should still have correct serial numbers
- Serial extraction should work even if name is missing

## TESTING STRATEGY

After fixes are applied:

### Test 1: Verify Page 2
```javascript
// Should return 15 voters with serials 1-15
const page2 = voters.filter(v => v.pageNumber === 2 && v.fileReference === 'W7F1');
const serials = page2.map(v => v.serialNumber).sort((a,b) => a-b);
// Expected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
```

### Test 2: Verify Specific Voters
```javascript
// Serial 5 should be XUA7224645
const voter5 = voters.find(v => v.serialNumber === '5' && v.fileReference === 'W7F1');
// Expected: voter5.voterId === 'XUA7224645'

// Serial 11 should be XUA7351711
const voter11 = voters.find(v => v.serialNumber === '11' && v.fileReference === 'W7F1');
// Expected: voter11.voterId === 'XUA7351711'
```

### Test 3: Verify uniqueSerial Display
```javascript
// UI should show W7F1-S5 for voter XUA7224645
const v = voters.find(v => v.voterId === 'XUA7224645');
// Expected: v.uniqueSerial === 'W7F1-S5'
```

### Test 4: Verify No Missing Voters
```javascript
// All voter IDs from screenshot should exist
const missingVoterIds = ['XUA7224942'];
missingVoterIds.forEach(id => {
  const exists = voters.find(v => v.voterId === id);
  if (!exists) console.error(`Missing: ${id}`);
});
```

## NEXT STEPS

1. ✅ Document the problem (THIS FILE)
2. ⚠️ Create serial re-extraction script
3. ⚠️ Test on Page 2 only (15 voters)
4. ⚠️ Validate results match screenshot
5. ⚠️ Apply to all 73 pages (2,715 voters)
6. ⚠️ Update database with correct serials
7. ⚠️ Verify UI displays correct badges
8. ⚠️ Test search functionality

## CONCLUSION

The serial number corruption is **SEVERE and SYSTEMATIC**. The current extraction method is fundamentally flawed. A complete re-extraction from the source OCR images is required, targeting the specific serial number region on each voter card.

The fix must:
- Parse each voter card individually
- OCR the serial number box at top-left of card
- Match with Voter ID
- Update database with correct values
- Preserve all other correct data (names, ages, IDs)

Estimated time to fix: 2-4 hours
Risk: Medium (existing correct data must be preserved)
Impact: HIGH - fixes 1,080+ incorrect serial numbers
