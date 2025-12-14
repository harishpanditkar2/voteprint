# Voter List Extraction & Verification System

## Overview
This project extracts, verifies, and manages voter data from scanned PDF lists (in Marathi), providing a modern, responsive web UI for search, verification, editing, and printing. It is designed for high accuracy, visual verification, and easy correction of OCR errors.

## Key Features
- **PDF to Data Extraction**: Uses Tesseract CLI OCR (mar+eng) for robust Marathi text extraction.
- **Image Cropping**: Crops each voter's card from the PDF for visual verification.
- **Modern UI/UX**: Fully responsive, clean, and mobile-friendly React/Next.js frontend.
- **Search & Filter**: By name, voter ID, father/husband, ward, booth, gender, age range.
- **Visual Verification**: Each voter record displays the cropped card image for cross-checking.
- **Edit & Correction**: Modal allows editing any field, with audit trail (manuallyEdited, updatedAt).
- **Print Support**: Print individual voter details (for thermal printers) or generate PDFs for selected voters.
- **Data Integrity**: All changes update both data/voters.json and public/data/voters.json.

## Architecture
- **Backend**: Node.js, Tesseract CLI, Sharp, pdf-to-png-converter, custom extraction logic.
- **Frontend**: Next.js (React), modern CSS, responsive design, modal-based editing/verification.
- **Data**: JSON files for all voters, with per-voter image paths.

## Workflow
1. **Upload PDF**: User uploads a scanned voter list PDF.
2. **OCR & Extraction**: System converts PDF to high-res PNG, runs Tesseract OCR, applies Marathi-specific corrections, and extracts all voter fields.
3. **Image Cropping**: Each voter's card is cropped and saved as a JPEG for verification.
4. **Data Storage**: All voter data is saved in data/voters.json and public/data/voters.json.
5. **UI Interaction**: Users search, filter, view, edit, and print voter records via the web UI.
6. **Edit/Verify**: Users can edit any field, verify against the image, and save corrections.

## Folder Structure
- `/pages` - Next.js pages (search, upload, API endpoints)
- `/lib` - Core extraction and OCR logic
- `/public/voter-cards` - Cropped voter card images
- `/data` - Master voter data (voters.json)
- `/public/data` - Public-facing voter data (voters.json)
- `/docs` - Project documentation

## Main Files
- `lib/tesseractCLIParser.js` - OCR, extraction, and image cropping logic
- `pages/search.js` - Main UI for search, verification, edit, print
- `pages/api/update-voter.js` - API endpoint for saving edits
- `data/voters.json` - Master voter data
- `public/voter-cards/` - Cropped images for each voter

## Developer Notes
- All UI/UX is mobile-first and responsive.
- All OCR logic is tuned for Marathi, with custom error correction.
- All edits are tracked (manuallyEdited, updatedAt).
- Print is designed for thermal printers (details only, no image).
- All code is modular and well-commented for easy extension.

See the rest of the docs folder for detailed guides on each part of the system.
