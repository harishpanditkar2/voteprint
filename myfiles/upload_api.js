// pages/api/upload.js
// Upload and parse voter PDF

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import formidable from 'formidable';
import VoterPDFParser from '../../lib/pdfParser';

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
    const form = formidable({
      uploadDir: join(process.cwd(), 'public/uploads'),
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    });

    // Ensure upload directory exists
    await mkdir(join(process.cwd(), 'public/uploads'), { recursive: true });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const pdfFile = files.file?.[0];

    if (!pdfFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!pdfFile.originalFilename?.endsWith('.pdf')) {
      return res.status(400).json({ error: 'Only PDF files allowed' });
    }

    // Parse the PDF
    console.log(`📄 Parsing PDF: ${pdfFile.originalFilename}`);
    const voters = await VoterPDFParser.parseVoterPDF(pdfFile.filepath);

    console.log(`✓ Extracted ${voters.length} voters`);

    return res.status(200).json({
      success: true,
      message: `Successfully parsed ${voters.length} voters`,
      voterCount: voters.length,
      voters: voters.slice(0, 10), // Return first 10 for preview
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Failed to parse PDF',
      details: error.message,
    });
  }
}
