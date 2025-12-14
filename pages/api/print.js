// pages/api/print.js
// Send voter card to thermal printer

import ThermalPrinterManager from '../../lib/thermalPrinter';
import VoterPDFParser from '../../lib/pdfParser';

let printer = null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { voterId, printerIP = '192.168.1.100', printerPort = 9100, testPrint = false } = req.body;

    // Initialize printer if not already done
    if (!printer) {
      printer = new ThermalPrinterManager({
        interface: `tcp://${printerIP}:${printerPort}`,
      });

      await printer.connect();
    }

    // Test print
    if (testPrint) {
      const testResult = await printer.testPrint();
      return res.status(200).json({
        success: testResult.success,
        message: testResult.message,
      });
    }

    // Load voter data
    const allVoters = await VoterPDFParser.loadCachedVoters();
    const voter = allVoters?.find(v => v.id === voterId);

    if (!voter) {
      return res.status(400).json({ error: 'Voter not found' });
    }

    // Print
    const result = await printer.printVoterCard(voter);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Print error:', error);

    // Attempt to reconnect on next request
    if (printer) {
      printer.disconnect();
      printer = null;
    }

    return res.status(500).json({
      error: 'Printer error',
      details: error.message,
      tip: 'Ensure printer is connected and on the same network',
    });
  }
}
