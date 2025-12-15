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
    // Support both body and query params
    const voterId = req.body.voterId || req.query.voterId;
    const printerIP = req.body.printerIP || req.query.printerIP || '192.168.1.100';
    const printerPort = req.body.printerPort || req.query.printerPort || 9100;
    const testPrint = req.body.testPrint || req.query.testPrint === 'true';

    // Initialize printer with shorter timeout
    if (!printer) {
      printer = new ThermalPrinterManager({
        interface: `tcp://${printerIP}:${printerPort}`,
        timeout: 3000, // 3 seconds instead of 21
      });

      try {
        await printer.connect();
      } catch (connectError) {
        return res.status(503).json({
          error: 'Printer not reachable',
          details: 'Unable to connect to printer. Please check if the printer is online.',
          printerIP,
          printerPort,
        });
      }
    }

    // Test print
    if (testPrint) {
      const testResult = await printer.testPrint();
      return res.status(200).json({
        success: testResult.success,
        message: testResult.message,
      });
    }

    if (!voterId) {
      return res.status(400).json({ error: 'voterId is required' });
    }

    // Load voter data
    const allVoters = await VoterPDFParser.loadCachedVoters();
    const voter = allVoters?.find(v => v.voterId === voterId || v.id === voterId);

    if (!voter) {
      return res.status(404).json({ error: 'Voter not found' });
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
