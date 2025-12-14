// pages/api/voters.js
// Get all cached voters

import VoterPDFParser from '../../lib/pdfParser';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const voters = await VoterPDFParser.loadCachedVoters();

    if (!voters || voters.length === 0) {
      return res.status(404).json({
        error: 'No voter data available. Please upload a PDF first.',
        voters: []
      });
    }

    return res.status(200).json({
      success: true,
      count: voters.length,
      voters: voters
    });
  } catch (error) {
    console.error('Error loading voters:', error);
    return res.status(500).json({
      error: 'Failed to load voters',
      details: error.message,
      voters: []
    });
  }
}
