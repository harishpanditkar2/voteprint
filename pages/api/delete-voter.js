// pages/api/delete-voter.js
// Delete a voter from the database

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { voterId } = req.body;

    if (!voterId) {
      return res.status(400).json({ error: 'Voter ID is required' });
    }

    // Read current voters data
    const publicDataPath = path.join(process.cwd(), 'public', 'data', 'voters.json');
    const votersData = JSON.parse(fs.readFileSync(publicDataPath, 'utf-8'));

    // Find voter index
    const voterIndex = votersData.findIndex(v => 
      (v.voterId === voterId || v.voter_id === voterId)
    );

    if (voterIndex === -1) {
      return res.status(404).json({ error: 'Voter not found' });
    }

    // Remove voter
    const deletedVoter = votersData.splice(voterIndex, 1)[0];

    // Save updated data
    fs.writeFileSync(publicDataPath, JSON.stringify(votersData, null, 2));

    return res.status(200).json({
      success: true,
      message: 'Voter deleted successfully',
      voter: deletedVoter,
      totalVoters: votersData.length
    });
  } catch (error) {
    console.error('Error deleting voter:', error);
    return res.status(500).json({
      error: 'Failed to delete voter',
      details: error.message
    });
  }
}
