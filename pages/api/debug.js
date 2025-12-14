// pages/api/debug.js
// Debug endpoint to test voter data and cache

import VoterPDFParser from '../../lib/pdfParser';

export default async function handler(req, res) {
  try {
    // Load cached voters
    const voters = await VoterPDFParser.loadCachedVoters();

    if (!voters) {
      return res.status(200).json({
        success: true,
        message: 'No cached voter data found. Upload a PDF first.',
        hasCachedData: false,
        voterCount: 0,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cached voter data found',
      hasCachedData: true,
      voterCount: voters.length,
      sampleVoters: voters.slice(0, 5),
      stats: {
        totalVoters: voters.length,
        withNames: voters.filter(v => v.name).length,
        withAddresses: voters.filter(v => v.address).length,
        withBooths: voters.filter(v => v.booth).length,
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
