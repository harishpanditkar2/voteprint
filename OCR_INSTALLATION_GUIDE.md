# OCR Tools Installation Guide

## Required Tools for Comprehensive OCR

### 1. Tesseract OCR (with Hindi/Devanagari support)

**Option A: Using Chocolatey (Recommended - Run PowerShell as Administrator)**
```powershell
choco install tesseract -y
```

**Option B: Manual Installation**
1. Download from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install tesseract-ocr-w64-setup-5.x.x.exe
3. Add to PATH: `C:\Program Files\Tesseract-OCR`
4. Download Hindi language data:
   - Download `hin.traineddata` from: https://github.com/tesseract-ocr/tessdata
   - Place in: `C:\Program Files\Tesseract-OCR\tessdata\`

### 2. Poppler (PDF to Image conversion)

**Option A: Using Chocolatey (Run PowerShell as Administrator)**
```powershell
choco install poppler -y
```

**Option B: Manual Installation**
1. Download from: https://github.com/oschwartz10612/poppler-windows/releases/
2. Extract to `C:\Program Files\poppler`
3. Add to PATH: `C:\Program Files\poppler\Library\bin`

### 3. Verify Installation

```powershell
tesseract --version
pdftoppm -h
pdftotext -h
```

## Alternative: Node.js-Only Solution

If you cannot install system tools, use the Node.js-based extraction script:
```bash
npm install pdf-parse pdf2pic tesseract.js
node comprehensive-ocr-extraction-nodejs.js
```

This uses pure JavaScript libraries but may be slower.

## Current Status

- **W7F1**: ✅ Complete (934 voters, all ages/genders correct)
- **W7F2**: ✅ Complete (861 voters, all ages/genders correct)  
- **W7F3**: ⚠️ Partial (719 voters, 423 ages, gender needs correction)

## Next Steps

1. **Install tools using Admin PowerShell**
2. **Run comprehensive extraction**: `node comprehensive-ocr-extraction.js`
3. **Verify results**: `node final-quality-check.js`
