# OCR Setup Guide for Windows

## Option 1: Quick Install with Chocolatey (Recommended)

```powershell
# Install chocolatey if not already installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install poppler
choco install poppler -y

# Verify installation
pdftoppm -v
```

## Option 2: Manual Install (if Chocolatey doesn't work)

1. Download poppler for Windows:
   - Go to: https://github.com/oschwartz10612/poppler-windows/releases/
   - Download latest release (e.g., `Release-24.02.0-0.zip`)

2. Extract the ZIP file to: `C:\poppler`

3. Add to PATH:
   ```powershell
   # Add poppler to PATH permanently
   $env:Path += ";C:\poppler\Library\bin"
   [Environment]::SetEnvironmentVariable("Path", $env:Path, [EnvironmentVariableTarget]::Machine)
   ```

4. Restart terminal and verify:
   ```powershell
   pdftoppm -v
   ```

## Option 3: Alternative - Use pdf-to-png (Pure Node.js)

If poppler installation is problematic, use this pure Node.js alternative:

```bash
npm install pdf-to-png-converter
```

Then use the alternative OCR parser (already created in your project).

## Testing OCR

Once poppler is installed:

```bash
# Test OCR extraction
node test-ocr.js

# This will:
# 1. Convert PDF pages to images
# 2. Run Tesseract OCR with Marathi language
# 3. Extract correct Devanagari text
# 4. Save results to data/voters.json
```

## Expected Performance

- **Speed**: ~30-60 seconds per page (OCR is slow but accurate)
- **Accuracy**: 95%+ for printed Devanagari text
- **Result**: Correct Marathi names like "गजानन यशवंत अनासपुरे" ✅

## Troubleshooting

**Error: "Error: spawn pdftoppm ENOENT"**
- Solution: Install poppler (see options above)

**Error: "Tesseract language not found"**
- Solution: Tesseract.js auto-downloads language data on first run
- Make sure you have internet connection

**OCR is too slow**
- Normal! OCR processes ~1-2 pages per minute
- For 73 pages: expect 35-70 minutes total
- Alternative: Use hybrid approach (accurate IDs + manual name verification)

## Next Steps

After installation:
1. Run `node test-ocr.js` to test extraction
2. Review first 3 voters to verify correct Marathi text
3. If successful, update upload API to use OCR
4. For production: Consider running OCR as background job
