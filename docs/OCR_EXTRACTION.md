# OCR Extraction & Image Cropping

## Overview
This module handles all PDF-to-data extraction, including:
- Converting PDF pages to high-res PNGs
- Running Tesseract CLI OCR (mar+eng)
- Applying Marathi-specific corrections
- Extracting all voter fields (name, age, gender, etc.)
- Cropping each voter's card image for verification

## Main File: `lib/tesseractCLIParser.js`

### Key Steps
1. **PDF to PNG**: Uses `pdf-to-png-converter` with high viewportScale for sharp images.
2. **Tesseract CLI**: Runs `tesseract` with `--psm 6 --oem 1 -l mar+eng` for best accuracy.
3. **Marathi Correction**: Applies a comprehensive map of OCR error corrections (e.g., पडिलांचे→वडिलांचे, झ→श).
4. **Field Extraction**: Uses regex and pattern matching to extract:
   - Name
   - Age
   - Gender
   - Father/Husband Name
   - House Number
   - Address
   - Ward/Booth (from part number)
5. **Image Cropping**: Uses `sharp` to crop each voter's card from the page image, skipping the header row.
6. **Data Output**: Each voter gets a `cardImage` path and all fields in the output JSON.

### Cropping Logic
- 3-column, 10-row layout per page (30 voters/page)
- Skips the first row (header) for cropping
- Row-wise mapping: first voter gets first card image, etc.

### Output
- All voter data is saved to `data/voters.json` and `public/data/voters.json`
- Cropped images saved to `public/voter-cards/`

### Customization
- Correction map can be extended for new OCR errors
- Cropping logic can be tuned for different layouts

---

See `lib/tesseractCLIParser.js` for full implementation and comments.
