$env:TESSDATA_PREFIX = "D:\web\election\voter"
$tesseract = "C:\Program Files\Tesseract-OCR\tesseract.exe"
$imagesDir = "pdflist\images\prabhag7ward1"
$outputDir = "ward7-reextraction-output"

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$images = Get-ChildItem "$imagesDir\*.jpg" | Sort-Object Name
$total = $images.Count

Write-Host ""
Write-Host "=== Extracting $total pages ===" -ForegroundColor Cyan
Write-Host "Output: $outputDir"
Write-Host ""

$completed = 0
$failed = 0

foreach ($image in $images) {
    $completed++
    $pageNum = $completed
    $outputBase = Join-Path $outputDir "page$($pageNum.ToString('000'))"
    $outputTxt = "$outputBase.txt"
    
    Write-Host "[$pageNum/$total] Processing..." -NoNewline
    
    try {
        & $tesseract $image.FullName $outputBase -l mar+eng --psm 6 2>$null
        
        if (Test-Path $outputTxt) {
            $content = Get-Content $outputTxt -Raw -ErrorAction SilentlyContinue
            if ($content) {
                $voterIds = ([regex]::Matches($content, '\b(XUA|CRM|XRM)\d{7}\b')).Count
                Write-Host " OK - $voterIds voters" -ForegroundColor Green
            } else {
                Write-Host " Empty" -ForegroundColor Yellow
                $failed++
            }
        } else {
            Write-Host " Failed" -ForegroundColor Red
            $failed++
        }
    } catch {
        Write-Host " Error: $_" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "=== Complete ===" -ForegroundColor Cyan
Write-Host "Processed: $completed pages"
Write-Host "Failed: $failed pages"
Write-Host ""
Write-Host "Next: node analyze-extracted-text.js"
Write-Host ""
