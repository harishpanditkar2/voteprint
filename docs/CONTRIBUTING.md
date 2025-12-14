# Contributing Guide

Thank you for your interest in contributing!

## Getting Started
1. **Clone the repository** and install dependencies (`npm install`).
2. **Install Tesseract CLI** (v5+, with Marathi language data) and ensure it is in your PATH.
3. **Run the dev server**: `npm run dev` (Next.js)
4. **Test OCR extraction**: `node test-tesseract-cli.js` (see OCR_EXTRACTION.md)

## Code Structure
- **Frontend**: `/pages` (Next.js, React)
- **Backend/OCR**: `/lib/tesseractCLIParser.js`
- **Data**: `/data/voters.json`, `/public/data/voters.json`
- **Images**: `/public/voter-cards/`
- **Docs**: `/docs/`

## Coding Standards
- Use modern JS/React best practices
- Keep UI responsive and accessible
- Comment code for clarity
- Keep all features working (search, edit, print, image, etc.)

## Making Changes
- Test all changes locally
- Ensure no features are broken
- Update documentation if needed

## Reporting Issues
- File issues with clear steps to reproduce
- Attach screenshots or sample PDFs if possible

## Contact
For questions, contact the project maintainer or open an issue.

---

See the rest of the docs folder for detailed guides.
