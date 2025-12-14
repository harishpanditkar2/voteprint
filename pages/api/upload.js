// pages/api/upload.js
// Upload and parse voter PDF

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import formidable from 'formidable';
import TesseractCLIParser from '../../lib/tesseractCLIParser';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ensure upload directory exists
    await mkdir(join(process.cwd(), 'public/uploads'), { recursive: true });

    const form = formidable({
      uploadDir: join(process.cwd(), 'public/uploads'),
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      filename: (name, ext, part, form) => {
        return `${Date.now()}_${part.originalFilename}`;
      },
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Handle both single file and array formats
    const pdfFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!pdfFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const originalName = pdfFile.originalFilename || pdfFile.newFilename || 'unknown.pdf';
    if (!originalName.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ error: 'Only PDF files allowed' });
    }

    // Extract ward and booth from filename
    // Format: BoothVoterList_A4_Ward_7_Booth_1.pdf
    const wardMatch = originalName.match(/Ward[_\s]+(\d+)/i);
    const boothMatch = originalName.match(/Booth[_\s]+(\d+)/i);
    const fileMetadata = {
      ward: wardMatch ? wardMatch[1] : null,
      booth: boothMatch ? boothMatch[1] : null
    };

    // Parse the PDF using OCR (Tesseract CLI for clean Marathi text)
    console.log(`📄 Parsing PDF with OCR: ${originalName}`);
    console.log(`📂 File path: ${pdfFile.filepath}`);
    if (fileMetadata.ward) console.log(`📍 Ward from filename: ${fileMetadata.ward}`);
    if (fileMetadata.booth) console.log(`📍 Booth from filename: ${fileMetadata.booth}`);
    
    // maxPages=1 for quick testing (set to null for all pages)
    const voters = await TesseractCLIParser.parseVoterPDFWithOCR(pdfFile.filepath, 1);

    console.log(`✓ Extracted ${voters.length} voters`);

    return res.status(200).json({
      success: true,
      message: `Successfully extracted ${voters.length} voters from PDF`,
      voterCount: voters.length,
      voters: voters.slice(0, 10)
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Failed to parse PDF',
      details: error.message,
    });
  }
}
