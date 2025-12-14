// pages/api/save-name-corrections.js
// Save verified name corrections

import { writeFile } from 'fs/promises';
import { join } from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { corrections } = req.body;

    if (!corrections || typeof corrections !== 'object') {
      return res.status(400).json({ error: 'Invalid corrections data' });
    }

    // Save corrections to file
    const correctionsPath = join(process.cwd(), 'data', 'name-corrections.json');
    await writeFile(correctionsPath, JSON.stringify(corrections, null, 2));

    console.log(`✅ Saved ${Object.keys(corrections).length} name corrections`);

    return res.status(200).json({
      success: true,
      message: `Saved ${Object.keys(corrections).length} name corrections`,
      count: Object.keys(corrections).length
    });
  } catch (error) {
    console.error('Error saving corrections:', error);
    return res.status(500).json({
      error: 'Failed to save corrections',
      details: error.message
    });
  }
}
