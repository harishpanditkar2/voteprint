# Perplexity Consultation: Node.js Tesseract OCR for Marathi PDF

## Problem Statement

I'm extracting voter data from Maharashtra government PDFs that use **custom font encoding**. When I copy text from the PDF, it shows garbled characters instead of correct Marathi:

- **PDF displays visually:** गजानन यशवंत अनासपुरे ✅
- **Copy-paste gives:** गजबननयशवनतअनबसपपरव ❌

## What Works (Debug Script)

My debug script produces **PERFECT** Marathi text:

```javascript
// debug-ocr.js - THIS WORKS PERFECTLY
const { pdfToPng } = require('pdf-to-png-converter');
const Tesseract = require('tesseract.js');

const pdfBuffer = await fs.readFile(pdfPath);
const pngPages = await pdfToPng(pdfBuffer, {
  viewportScale: 2.0,
  outputFileMask: 'page'
});

const result = await Tesseract.recognize(
  imagePath,
  'mar+eng', // Marathi + English
  { logger: m => console.log(m.progress) }
);

console.log(result.data.text);
```

**Output:** ✅ Correct Marathi text!
```
मतदाराचे पूर्ण: गजानन यशवंत अनासपुरे
🔍 Voter IDs found: 29
📖 Devanagari: YES ✅
📊 Confidence: 66%
```

## What Doesn't Work (Production API)

Same code in Next.js API route produces **garbage**:

```javascript
// pages/api/upload.js - PRODUCES GARBAGE
const result = await Tesseract.recognize(
  tempImagePath,
  'mar+eng',
  { logger: m => console.log(m.progress) }
);
```

**Output:** ❌ Garbage
```
"MOM पजा पय
पणणणपणणपतणाव 00000 80100101 8810 1818818101 81010 [8
000 00mO 0 0mDo MOD 0OMOMID M00 DoOmoo 00100"
```

## Environment Details

- **Node.js:** v22.18.0
- **Next.js:** 16.0.10 (Turbopack)
- **tesseract.js:** Latest
- **pdf-to-png-converter:** Latest
- **OS:** Windows 11
- **PDF:** Government voter list (Maharashtra)

## Questions for Perplexity

1. **Why does the same OCR code work in debug script but fail in Next.js API?**
   - Is it related to Next.js environment?
   - Memory/process limits?
   - Image quality differences?

2. **What are the optimal settings for Marathi OCR?**
   ```javascript
   const pngPages = await pdfToPng(pdfBuffer, {
     viewportScale: ?, // 2.0 or 3.0?
     disableFontFace: ?,
     useSystemFonts: ?
   });

   const result = await Tesseract.recognize(imagePath, 'mar+eng', {
     tessedit_pageseg_mode: ?, // PSM mode?
     tessedit_char_whitelist: ?,
     // Other options?
   });
   ```

3. **Should I preprocess images before OCR?**
   - Increase contrast?
   - Convert to grayscale?
   - Denoise?
   - Use sharp library?

4. **Is there a better approach?**
   - Use Tesseract CLI instead of tesseract.js?
   - Different PDF to image library?
   - Python subprocess with pytesseract?
   - Cloud OCR API?

5. **How to ensure consistent results between test and production?**

## Current Workaround

Using pdf2json for fast extraction:
- ✅ 100% accurate: Voter IDs, ages, gender, ward, booth
- ❌ Garbled names due to custom font

**Goal:** Get OCR working to extract correct Marathi names automatically.

## Sample PDF Characteristics

- **Size:** 2.76 MB, 73 pages
- **Layout:** 3-column format, ~30 voters per page
- **Font:** Custom ToUnicode CMap (not standard Devanagari)
- **Content:** Voter IDs (XUA/CRM/XRM + numbers), Marathi names, ages

## Expected Output

```json
{
  "voterId": "XUA7224868",
  "name": "गजानन यशवंत अनासपुरे",  // ✅ Correct Marathi
  "age": "82",
  "gender": "M"
}
```

---

## Please provide:
1. Step-by-step configuration for reliable Marathi OCR in Node.js
2. Debugging approach to identify why test works but production fails
3. Alternative solutions if tesseract.js isn't suitable
4. Performance optimization tips for 73-page PDFs
