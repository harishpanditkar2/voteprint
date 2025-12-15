const fs = require('fs');
const path = require('path');

// Voter data from PDF page processing
const voters = [
  { serial: 783, voterId: 'XUA8873143', name: 'सफिया सोहेल शोख', husband: 'सोहेल शोख', age: 31, gender: 'F' },
  { serial: 784, voterId: 'XUA8875445', name: 'अमर शिवाजी पवार', father: 'शिवाजी पवार', age: 44, gender: 'M' },
  { serial: 785, voterId: 'XUA8875932', name: 'मोहम्मद नोमन मसादिक बागवान', father: 'मसादिक बागवान', age: 18, gender: 'M' },
  { serial: 786, voterId: 'XUA8876906', name: 'प्रतिक राजेश गलिंदे', father: 'राजेश गलिंदे', age: 26, gender: 'M' },
  { serial: 787, voterId: 'XUA8877615', name: 'साईमित बबन घाडगे', father: 'बबन घाडगे', age: 18, gender: 'M' },
  { serial: 788, voterId: '7515055652', name: 'सचिन विद्याचंद्र शाह', father: 'विद्याचंद्र शाह', age: 60, gender: 'M', uncertain: 'Voter ID appears to be phone number' },
  { serial: 789, voterId: '8100606582', name: 'वैजंती श्रीनिवास काकडे', husband: 'श्रीनिवास काकडे', age: 54, gender: 'F', uncertain: 'Voter ID appears to be phone number' },
  { serial: 790, voterId: 'XUA1544972', name: 'विनय सतिश शहा', father: 'सतिश शहा', age: 40, gender: 'M' },
  { serial: 791, voterId: 'XUA8878837', name: 'स्मृती शैलेश कळंत्रे', father: 'शैलेश विश्वनाथ कळंत्रे', age: 24, gender: 'F' },
  { serial: 792, voterId: 'XUA8879306', name: 'प्रविण प्रकाश भामे', father: 'प्रकाश भामे', age: 31, gender: 'M' },
  { serial: 793, voterId: 'XUA8879587', name: 'रंगनाथ बाळासाहेब काटकर', father: 'बाळासाहेब काटकर', age: 44, gender: 'M' },
  { serial: 794, voterId: 'XUAB879801', name: 'पल्लवी संदीप आल्हाट', husband: 'संदीप आल्हाट', age: 25, gender: 'F' },
  { serial: 795, voterId: 'XUA8880254', name: 'गिरीक्ष शरद कदम', father: 'शरद कदम', age: 18, gender: 'M' },
  { serial: 796, voterId: 'XUA8880668', name: 'राबिया फारुख तांबोळी', father: 'फारुख तांबोळी', age: 19, gender: 'F' },
  { serial: 797, voterId: 'XUA8880858', name: 'विनीता सुमन कोकाटे', father: 'सुमन कोकाटे', age: 49, gender: 'F', uncertain: 'Relationship is mother instead of husband' },
  { serial: 798, voterId: 'XUA8883431', name: 'अपेक्षा विकास ओझर्डे', father: 'विकास ओझर्डे', age: 18, gender: 'F' },
  { serial: 799, voterId: 'XUA8883928', name: 'रूचिता पांडुरंग पिंगळे', father: 'पांडुरंग पिंगळे', age: 30, gender: 'F' },
  { serial: 800, voterId: 'XUA8887606', name: 'आवलेषा विववजीत शिरसट', husband: 'विववजीत शिरसट', age: 29, gender: 'F' },
  { serial: 801, voterId: 'XUA8890584', name: 'सुकमिता अमरसिंह पवार', father: 'अमरसिंह पवार', age: 19, gender: 'F' },
  { serial: 802, voterId: 'XUA8890840', name: 'सोनाली रोहन शिंदे', husband: 'रोहन शिंदे', age: 26, gender: 'F' },
  { serial: 803, voterId: 'XUA8892127', name: 'राजश्री संतोष कळ', father: 'संतोष कळ', age: 19, gender: 'F' },
  { serial: 804, voterId: 'XUA8892564', name: 'गीतांजली शरद कदम', father: 'शरद संपतराव कदम', age: 18, gender: 'F' },
  { serial: 805, voterId: 'XUA8892788', name: 'अमेय संतोष शिर्के', father: 'संतोष शिर्के', age: 24, gender: 'M' },
  { serial: 806, voterId: 'XUA8893117', name: 'सोनाली सचिन पाठक', husband: 'सचिन पाठक', age: 41, gender: 'F' },
  { serial: 807, voterId: 'XUA8752933', name: 'किशोरी पुष्पा कुलकर्णी', father: 'पुष्पा कुलकर्णी', age: 19, gender: 'F', uncertain: 'Relationship is mother instead of husband' },
  { serial: 808, voterId: 'SRO7222672', name: 'रेकमा इसाक दोख', father: 'इसाक दोख', age: 27, gender: 'F' },
  { serial: 809, voterId: 'MMQ1653997', name: 'सविता शंकर माने', husband: 'शंकर माने', age: 47, gender: 'F' },
  { serial: 810, voterId: '08६7662828', name: 'शंकर रामचंद्र माने', father: 'रामचंद्र माने', age: 56, gender: 'M', uncertain: 'Voter ID appears to be phone number' },
  { serial: 811, voterId: '08९6945836', name: 'श्रुतिका शंकर माने', father: 'शंकर माने', age: 26, gender: 'F', uncertain: 'Voter ID appears to be phone number' },
  { serial: 812, voterId: '77718427155', name: 'अक्षय बालकृष्ण जगदाळे', father: 'बालकृष्ण जगदाळे', age: 22, gender: 'M', uncertain: 'Voter ID appears to be phone number' },
  { serial: 813, voterId: '08६7662802', name: 'मालन रामचंद्र माने', husband: 'रामचंद्र माने', age: 79, gender: 'F', uncertain: 'Voter ID appears to be phone number' },
  { serial: 814, voterId: '08६7228554', name: 'स्वप्नील शंकर माने', father: 'शंकर माने', age: 22, gender: 'M', uncertain: 'Voter ID appears to be phone number' }
];

// Process voters
const processedVoters = voters.map(voter => {
  const processed = {
    voterId: voter.voterId,
    name: voter.name,
    serial: voter.serial,
    age: voter.age,
    gender: voter.gender,
    ward: '7',
    booth: '1'
  };

  // Add relationship field based on gender
  if (voter.gender === 'F') {
    processed.husband = voter.husband || '';
  } else {
    processed.father = voter.father || '';
  }

  // Add uncertain flag if present
  if (voter.uncertain) {
    processed.uncertain = voter.uncertain;
  }

  return processed;
});

// Write to temp file
fs.writeFileSync('temp-page-data.json', JSON.stringify(processedVoters, null, 2), 'utf8');

console.log(`Processed ${processedVoters.length} voters from page data`);
console.log('Data saved to temp-page-data.json');

// Display summary
processedVoters.forEach(voter => {
  const genderIcon = voter.gender === 'M' ? '♂️' : '♀️';
  const relation = voter.husband ? ` (Husband: ${voter.husband})` : voter.father ? ` (Father: ${voter.father})` : '';
  const uncertainNote = voter.uncertain ? ` [UNCERTAIN: ${voter.uncertain}]` : '';
  console.log(`${genderIcon} Serial ${voter.serial}: ${voter.name}${relation}${uncertainNote}`);
});