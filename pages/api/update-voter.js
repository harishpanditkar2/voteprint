import fs from 'fs';
import path from 'path';

/**
 * API endpoint to update voter information
 * POST /api/update-voter
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const updatedVoter = req.body;

    console.log('📝 Update voter request:', {
      voterId: updatedVoter.voterId,
      fields: Object.keys(updatedVoter)
    });

    if (!updatedVoter.voterId) {
      return res.status(400).json({ error: 'Voter ID is required' });
    }

    // Read current voters data
    const publicDataPath = path.join(process.cwd(), 'public', 'data', 'voters.json');
    
    const votersData = JSON.parse(fs.readFileSync(publicDataPath, 'utf-8'));
    console.log(`📊 Total voters in database: ${votersData.length}`);

    // Find and update the voter
    const voterIndex = votersData.findIndex(v => v.voterId === updatedVoter.voterId);

    if (voterIndex === -1) {
      console.error(`❌ Voter not found with ID: ${updatedVoter.voterId}`);
      console.log('Available voter IDs (first 5):', votersData.slice(0, 5).map(v => v.voterId));
      return res.status(404).json({ 
        error: 'Voter not found',
        voterId: updatedVoter.voterId,
        totalVoters: votersData.length
      });
    }

    console.log(`✅ Found voter at index ${voterIndex}`);

    // Update voter data (preserve fields not in update)
    votersData[voterIndex] = {
      ...votersData[voterIndex],
      name: updatedVoter.name || votersData[voterIndex].name,
      age: updatedVoter.age || votersData[voterIndex].age,
      gender: updatedVoter.gender || votersData[voterIndex].gender,
      fatherName: updatedVoter.fatherName || votersData[voterIndex].fatherName,
      relativeDetail: updatedVoter.relativeDetail || votersData[voterIndex].relativeDetail,
      houseNumber: updatedVoter.houseNumber || votersData[voterIndex].houseNumber,
      address: updatedVoter.address || votersData[voterIndex].address,
      updatedAt: new Date().toISOString(),
      manuallyEdited: true
    };

    // Save to public data location
    fs.writeFileSync(publicDataPath, JSON.stringify(votersData, null, 2));

    console.log('💾 Voter updated successfully:', votersData[voterIndex].name);

    return res.status(200).json({
      success: true,
      message: 'Voter updated successfully',
      voter: votersData[voterIndex]
    });

  } catch (error) {
    console.error('Update voter error:', error);
    return res.status(500).json({
      error: 'Failed to update voter',
      details: error.message
    });
  }
}
