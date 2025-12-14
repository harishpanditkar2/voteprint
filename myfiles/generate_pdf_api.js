// pages/api/generate-pdf.js
// Generate individual PDFs for voters

import VoterPDFGenerator from '../../lib/pdfGenerator';
import VoterPDFParser from '../../lib/pdfParser';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { voterIds = [], generateAll = false } = req.body;

    // Load cached voters
    const allVoters = await VoterPDFParser.loadCachedVoters();

    if (!allVoters || allVoters.length === 0) {
      return res.status(400).json({
        error: 'No voter data available. Please upload a PDF first.',
      });
    }

    let votersToGenerate = [];

    if (generateAll) {
      votersToGenerate = allVoters;
    } else if (voterIds.length > 0) {
      votersToGenerate = allVoters.filter(v => voterIds.includes(v.id));
    } else {
      return res.status(400).json({
        error: 'Provide either voterIds or set generateAll to true',
      });
    }

    if (votersToGenerate.length === 0) {
      return res.status(400).json({ error: 'No voters found to generate' });
    }

    console.log(`📄 Starting PDF generation for ${votersToGenerate.length} voters...`);

    // Generate PDFs
    const results = await VoterPDFGenerator.generateBulkVoterPDFs(
      votersToGenerate,
      'public/pdfs'
    );

    return res.status(200).json({
      success: true,
      message: `Generated PDFs for ${results.length} voters`,
      generated: results.length,
      pdfs: results,
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate PDFs',
      details: error.message,
    });
  }
}
