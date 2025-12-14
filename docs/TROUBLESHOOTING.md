# Troubleshooting Guide

## Common Issues

### 1. Tesseract Not Found
- **Symptom**: Error about Tesseract not installed.
- **Fix**: Install Tesseract v5+ and add to PATH. See official docs or INSTALL_TESSERACT.md.

### 2. Marathi Text Garbled
- **Symptom**: Names/fields are unreadable or wrong in Marathi.
- **Fix**: Ensure Tesseract is run with `-l mar+eng` and high-res images. Check correction map in `tesseractCLIParser.js`.

### 3. Cropped Images Misaligned
- **Symptom**: Voter card images do not match data.
- **Fix**: Ensure cropping skips header row and is row-wise. See OCR_EXTRACTION.md.

### 4. Edits Not Saving
- **Symptom**: Changes in UI do not persist.
- **Fix**: Check `/api/update-voter.js` and file permissions for `/data/voters.json` and `/public/data/voters.json`.

### 5. UI Not Responsive
- **Symptom**: Layout breaks on mobile.
- **Fix**: Check CSS in `/pages/search.js` and UI_UX_GUIDE.md.

## Debugging Tips
- Use browser DevTools for UI issues.
- Check server logs for backend errors.
- Use sample PDFs for testing OCR.

## Getting Help
- See all docs in `/docs/`
- Contact the maintainer or open an issue with details.

---

See also: PROJECT_OVERVIEW.md, OCR_EXTRACTION.md, UI_UX_GUIDE.md
