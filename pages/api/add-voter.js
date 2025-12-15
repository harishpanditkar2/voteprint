// pages/api/add-voter.js
// Add a new voter to the database

import VoterPDFParser from '../../lib/pdfParser';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const newVoter = req.body;

    // Validate required fields
    const requiredFields = ['name_english', 'name_marathi', 'voter_id', 'serial_number', 'ward', 'booth'];
    const missingFields = requiredFields.filter(field => !newVoter[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields
      });
    }

    // Load existing voters
    const voters = await VoterPDFParser.loadCachedVoters();

    // Check for duplicate voter_id
    const existingVoter = voters.find(v => v.voter_id === newVoter.voter_id);
    if (existingVoter) {
      return res.status(400).json({
        error: 'Voter ID already exists',
        existingVoter
      });
    }

    // Add metadata
    newVoter.added_date = new Date().toISOString();
    newVoter.manually_added = true;

    // Add to voters array
    voters.push(newVoter);

    // Save to file
    const dataPath = path.join(process.cwd(), 'public/data/voters.json');
    fs.writeFileSync(dataPath, JSON.stringify(voters, null, 2));

    return res.status(200).json({
      success: true,
      message: 'Voter added successfully',
      voter: newVoter,
      totalVoters: voters.length
    });
  } catch (error) {
    console.error('Error adding voter:', error);
    return res.status(500).json({
      error: 'Failed to add voter',
      details: error.message
    });
  }
}
