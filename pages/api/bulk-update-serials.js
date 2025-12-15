import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: 'Invalid updates array' });
    }

    // Read current database
    const votersPath = path.join(process.cwd(), 'public', 'data', 'voters.json');
    const voters = JSON.parse(fs.readFileSync(votersPath, 'utf8'));

    // Create backup
    const backupPath = path.join(process.cwd(), 'public', 'data', `voters.json.backup-${Date.now()}`);
    fs.writeFileSync(backupPath, JSON.stringify(voters, null, 2));

    // Apply updates
    let updated = 0;
    updates.forEach(update => {
      const voter = voters.find(v => v.voterId === update.voterId);
      if (voter) {
        const oldSerial = voter.serialNumber;
        const oldCardImage = voter.cardImage;

        voter.serialNumber = update.serialNumber.toString();
        voter.uniqueSerial = update.uniqueSerial || `${voter.fileReference}-S${update.serialNumber}`;

        // Update card image path
        if (voter.cardImage && voter.voterId) {
          const newCardImage = `/voter-cards/voter_${voter.voterId}_sn${update.serialNumber}_page${voter.pageNumber}.jpg`;
          voter.cardImage = newCardImage;

          // Rename actual file
          const oldPath = path.join(process.cwd(), 'public', oldCardImage);
          const newPath = path.join(process.cwd(), 'public', newCardImage);

          try {
            if (fs.existsSync(oldPath) && oldPath !== newPath) {
              fs.renameSync(oldPath, newPath);
            }
          } catch (err) {
            console.error('Error renaming card:', err.message);
          }
        }

        voter.updatedAt = new Date().toISOString();
        updated++;
      }
    });

    // Save updated database
    fs.writeFileSync(votersPath, JSON.stringify(voters, null, 2));

    res.status(200).json({ 
      success: true,
      updated,
      backup: backupPath
    });

  } catch (error) {
    console.error('Error updating serials:', error);
    res.status(500).json({ error: error.message });
  }
}
