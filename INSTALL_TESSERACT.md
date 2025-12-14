# Tesseract Installation Guide for Windows

## Quick Install (5 minutes)

### Step 1: Download Tesseract
1. Go to: https://github.com/UB-Mannheim/tesseract/wiki
2. Download latest installer: `tesseract-ocr-w64-setup-5.3.3.20231005.exe`
3. Run the installer

### Step 2: During Installation
- ✅ Check "Add to PATH"
- ✅ Select "Marathi" language data
- Install location: `C:\Program Files\Tesseract-OCR`

### Step 3: Verify Installation
```powershell
# Restart PowerShell, then run:
tesseract --version
tesseract --list-langs  # Should show "mar" and "eng"
```

### Step 4: Test OCR
```powershell
cd D:\web\election\voter
tesseract debug_page2.png test_output -l mar+eng --psm 6
cat test_output.txt
```

## Alternative: Chocolatey Install

```powershell
# Install Chocolatey if not installed
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Tesseract
choco install tesseract -y

# Download Marathi language data
# Go to: https://github.com/tesseract-ocr/tessdata
# Download mar.traineddata
# Copy to: C:\Program Files\Tesseract-OCR\tessdata\
```

## Troubleshooting

**Error: "tesseract not recognized"**
- Restart terminal after installation
- Manually add to PATH: `C:\Program Files\Tesseract-OCR`

**Error: "mar language not found"**
- Download from: https://github.com/tesseract-ocr/tessdata/raw/main/mar.traineddata
- Copy to: `C:\Program Files\Tesseract-OCR\tessdata\mar.traineddata`

## After Installation

Run:
```bash
npm install child-process-promise
node test-tesseract-cli.js
```

This will extract correct Marathi names!
