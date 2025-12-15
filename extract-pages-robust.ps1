# Extract remaining pages with better error handling
$env:TESSDATA_PREFIX = "D:\web\election\voter"
$tesseract = "C:\Program Files\Tesseract-OCR\tesseract.exe"
$imagesDir = "pdflist\images\prabhag7ward1"
$outputDir = "ward7-reextraction-output"

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$images = Get-ChildItem "$imagesDir\*.jpg" | Sort-Object Name

Write-Host "=== Extracting Pages (Robust Mode) ===" -ForegroundColor Cyan
Write-Host ""

$pageNum = 0
foreach ($image in $images) {
    $pageNum++
    $outputTxt = Join-Path $outputDir "page$($pageNum.ToString('000')).txt"
    
    # Skip if already exists
    if (Test-Path $outputTxt) {
        Write-Host "[$pageNum/73] Already done" -ForegroundColor Gray
        continue
    }
    
    Write-Host "[$pageNum/73] $($image.Name.Substring(0, 40))..." -NoNewline
    
    try {
        # Create temp output without extension for Tesseract
        $tempBase = Join-Path $outputDir "temp_page$pageNum"
        
        # Run with error suppression
        $ErrorActionPreference = "SilentlyContinue"
        & $tesseract $image.FullName $tempBase -l mar+eng --psm 6 2>$null
        $ErrorActionPreference = "Continue"
        
        # Check if temp file was created
        $tempTxt = "$tempBase.txt"
        if (Test-Path $tempTxt) {
            # Rename to final name
            Move-Item $tempTxt $outputTxt -Force
            
            $content = Get-Content $outputTxt -Raw
            $voterIds = ([regex]::Matches($content, '\b(XUA|CRM|XRM)\d{7}\b')).Count
            Write-Host " $voterIds voters" -ForegroundColor Green
        } else {
            Write-Host " No output" -ForegroundColor Red
        }
    } catch {
        Write-Host " ERROR" -ForegroundColor Red
    }
    
    # Small delay to avoid issues
    Start-Sleep -Milliseconds 100
}

Write-Host ""
$extracted = (Get-ChildItem "$outputDir\page*.txt").Count
Write-Host "Extracted: $extracted / 73 pages" -ForegroundColor Cyan
Write-Host ""
