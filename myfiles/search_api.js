// pages/api/search.js
// Search voters by name, booth, ward

import VoterPDFParser from '../../lib/pdfParser';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q, field = 'name', limit = 50 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Query too short. Minimum 2 characters.',
      });
    }

    // Search voters
    const results = await VoterPDFParser.searchVoters(q, field);

    // Limit results
    const limited = results.slice(0, parseInt(limit));

    return res.status(200).json({
      success: true,
      query: q,
      field,
      totalFound: results.length,
      returned: limited.length,
      data: limited,
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      error: 'Search failed',
      details: error.message,
    });
  }
}
