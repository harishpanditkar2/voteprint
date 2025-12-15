# Extract OCR text from all Ward 7 pages using Tesseract
$env:TESSDATA_PREFIX = "D:\web\election\voter"
$tesseract = "C:\Program Files\Tesseract-OCR\tesseract.exe"
$imagesDir = "pdflist\images\prabhag7ward1"
$outputDir = "ward7-reextraction-output"

# Create output directory
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

# Get all image files
$images = Get-ChildItem "$imagesDir\*.jpg" | Sort-Object Name

Write-Host "`n=== Extracting OCR text from $($images.Count) pages ===`n" -ForegroundColor Green

$pageNum = 0
foreach ($image in $images) {
    $pageNum++
    $outputFile = Join-Path $outputDir "page$($pageNum.ToString('000')).txt"
    
    Write-Host "[$pageNum/$($images.Count)] $($image.Name)" -NoNewline
    
    try {
        # Run Tesseract
        & $tesseract $image.FullName stdout -l mar+eng --psm 6 2>$null | Out-File -FilePath $outputFile -Encoding UTF8
        
        if (Test-Path $outputFile) {
            $content = Get-Content $outputFile -Raw
            $voterIds = ([regex]::Matches($content, '\b(XUA|CRM|XRM)\d{7}\b')).Count
            Write-Host " - OK ($voterIds voter IDs, $($content.Length) chars)" -ForegroundColor Green
        } else {
            Write-Host " - No output" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " - ERROR: $_" -ForegroundColor Red
    }
}

Write-Host "`n=== Complete! ===`n" -ForegroundColor Green
Write-Host "OCR text saved to: $outputDir\"
Write-Host "Next: Run 'node analyze-extracted-text.js' to process the data`n"
