// lib/thermalPrinter.js
// Integration with thermal printers for direct printing

const net = require('net');

class ThermalPrinterManager {
  constructor(printerConfig = {}) {
    this.config = {
      type: printerConfig.type || 'epson', // 'epson' or 'star'
      interface: printerConfig.interface || 'tcp://192.168.1.100:9100', // Network printer IP
      encoding: printerConfig.encoding || 'UTF8',
      ...printerConfig
    };
    this.socket = null;
  }

  /**
   * Connect to thermal printer
   */
  async connect() {
    return new Promise((resolve, reject) => {
      if (this.config.interface.startsWith('tcp://')) {
        const [host, port] = this.config.interface.replace('tcp://', '').split(':');
        
        this.socket = net.createConnection(parseInt(port), host);
        
        this.socket.on('connect', () => {
          console.log('✓ Connected to thermal printer');
          resolve(true);
        });

        this.socket.on('error', (err) => {
          console.error('✗ Printer connection error:', err.message);
          reject(err);
        });

        this.socket.on('close', () => {
          console.log('Printer disconnected');
        });
      } else {
        reject(new Error('USB/Serial printing not supported. Use network printer.'));
      }
    });
  }

  /**
   * Send raw ESC/POS commands to printer
   */
  sendCommand(buffer) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error('Printer not connected'));
      }

      this.socket.write(buffer, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  /**
   * Print voter card on thermal printer
   */
  async printVoterCard(voter) {
    try {
      const commands = this.generateVoterCardCommands(voter);
      
      for (const command of commands) {
        await this.sendCommand(command);
        // Small delay between commands
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return { success: true, message: 'Voter card printed successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Generate ESC/POS commands for voter card
   */
  generateVoterCardCommands(voter) {
    const commands = [];

    // Initialize printer
    commands.push(Buffer.from([0x1B, 0x40])); // Reset

    // Set center alignment
    commands.push(Buffer.from([0x1B, 0x61, 0x01]));

    // Title
    commands.push(this.createTextCommand('VOTER CARD'));
    commands.push(this.createDashedLine());

    // Set left alignment
    commands.push(Buffer.from([0x1B, 0x61, 0x00]));

    // Voter details
    commands.push(this.createTextCommand(`अनु क्रमांक: ${voter.serialNumber || 'N/A'}`));
    commands.push(this.createTextCommand(`Name: ${voter.name || 'N/A'}`));
    commands.push(this.createTextCommand(`Voter ID: ${voter.voterId || 'N/A'}`));
    commands.push(this.createTextCommand(`Age: ${voter.age || 'N/A'} | Gender: ${voter.gender || 'N/A'}`));
    commands.push(this.createTextCommand(`खोली क्रमांक: ${voter.houseNumber || 'N/A'}`));
    
    // Address with Polling Center
    const pollingCenter = voter.pollingCenter || 'नगरपरिषद स्वामी विवेकानंद सभागृह, अशोकनगर,बारामती';
    const booth = voter.actualBooth || voter.booth || '1';
    commands.push(this.createTextCommand(`मतदान केंद्र क्र. ${booth}`));
    commands.push(this.createTextCommand(pollingCenter));
    
    commands.push(this.createTextCommand(`Ward: ${voter.actualWard || voter.ward || 'N/A'}`));
    commands.push(this.createTextCommand(`Booth: ${booth}`));

    // Set center alignment for footer
    commands.push(Buffer.from([0x1B, 0x61, 0x01]));
    commands.push(this.createDashedLine());
    commands.push(this.createTextCommand(`Printed: ${new Date().toLocaleString('en-IN')}`));

    // Cut paper
    commands.push(Buffer.from([0x1B, 0x69])); // Partial cut

    // Feed lines
    commands.push(this.createTextCommand('\n\n'));

    return commands;
  }

  /**
   * Helper: Create text command
   */
  createTextCommand(text) {
    return Buffer.concat([
      Buffer.from([0x1B, 0x21, 0x00]), // Normal text
      Buffer.from(text + '\n', this.config.encoding)
    ]);
  }

  /**
   * Helper: Create dashed line
   */
  createDashedLine() {
    return this.createTextCommand('─'.repeat(40));
  }

  /**
   * Batch print multiple voters
   */
  async printMultipleVoters(voters) {
    const results = [];

    for (const voter of voters) {
      try {
        const result = await this.printVoterCard(voter);
        results.push({ ...result, voterId: voter.id });
      } catch (error) {
        results.push({
          success: false,
          message: error.message,
          voterId: voter.id
        });
      }
    }

    return results;
  }

  /**
   * Test printer connection
   */
  async testPrint() {
    try {
      const testCommand = Buffer.concat([
        Buffer.from([0x1B, 0x40]), // Reset
        Buffer.from([0x1B, 0x61, 0x01]), // Center align
        Buffer.from('Test Print\n', 'utf-8'),
        Buffer.from([0x1B, 0x69]) // Cut
      ]);

      await this.sendCommand(testCommand);
      return { success: true, message: 'Printer test successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Disconnect from printer
   */
  disconnect() {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
      console.log('Printer disconnected');
    }
  }
}

module.exports = ThermalPrinterManager;
