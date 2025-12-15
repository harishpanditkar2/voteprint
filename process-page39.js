const fs = require('fs');
const path = require('path');

// Voter data from PDF page processing
const voters = [
  { serial: 852, voterId: 'XUA7794134', name: 'रत्नप्रभा हनुमंत मदने', father: 'हनुमंत नामदेव मदने', age: 36, gender: 'F' },
  { serial: 853, voterId: 'XUA7556582', name: 'तुषार धन्यकुमार माने', father: 'धन्यकुमार माने', age: 29, gender: 'M' },
  { serial: 854, voterId: 'XUA7671076', name: 'शिखा प्रणव मोता', husband: 'प्रणव मोता', age: 37, gender: 'F' },
  { serial: 855, voterId: 'XUA7352396', name: 'शकुंतला दत्तोबा ननवरे', husband: 'दत्तोबा ननवरे', age: 76, gender: 'F' },
  { serial: 856, voterId: 'XUA7352404', name: 'गणेश दत्तोबा ननवरे', father: 'दत्तोबा ननवरे', age: 46, gender: 'M' },
  { serial: 857, voterId: 'XUA7615859', name: 'सुमित्रा सम्राट निकम', husband: 'सम्राट निकम', age: 39, gender: 'F' },
  { serial: 858, voterId: 'XUA7937519', name: 'पुजा मधुकर पांढरे', father: 'मधुकर पांढरे', age: 26, gender: 'F' },
  { serial: 859, voterId: 'XUA7937535', name: 'श्रीप्रसाद मधुकर पांढरे', father: 'मधुकर पांढरे', age: 25, gender: 'M' },
  { serial: 860, voterId: 'XUA7850894', name: 'वसंत गुंडीबा पवार', father: 'गुंडीबा पवार', age: 70, gender: 'M' },
  { serial: 861, voterId: 'XUA1000314', name: 'कुसुम लक्ष्मण पोटे', husband: 'लक्ष्मण पोटे', age: 74, gender: 'F' },
  { serial: 862, voterId: 'XUA7615867', name: 'प्रज्ञा अशोक साळुंखे', father: 'अशोक साळुंखे', age: 28, gender: 'F' },
  { serial: 863, voterId: 'XUA7794084', name: 'असीफ जमीर शेख', father: 'जमीर शोख', age: 26, gender: 'M' },
  { serial: 864, voterId: 'XUA7556673', name: 'मिरा रतनलाल शर्मा', father: 'रतनलाल शर्मा', age: 46, gender: 'F' },
  { serial: 865, voterId: 'XUA7794126', name: 'विश्‍वास शिवाजीराव शेळके', father: 'शिवाजीराव शेळके', age: 47, gender: 'M' },
  { serial: 866, voterId: 'XUA7352107', name: 'संताजी लक्ष्मणराव शेळके', father: 'लक्ष्मणराव शेळके', age: 43, gender: 'M' },
  { serial: 867, voterId: 'XUA7352115', name: 'मनिषा संताजी शेळके', husband: 'संताजी शेळके', age: 38, gender: 'F' },
  { serial: 868, voterId: 'XUA7615800', name: 'केतन चंद्रकांत शिंगाडे', father: 'चंद्रकांत शिंगाडे', age: 39, gender: 'M' },
  { serial: 869, voterId: 'XUA7615818', name: 'क्र्तुजा चंद्रकांत शिंगाडे', father: 'चंद्रकांत शिंगाडे', age: 28, gender: 'F' },
  { serial: 870, voterId: 'XUA7615768', name: 'पियुष अभिनंदन सुदेंचामुथा', father: 'अभिनंदन सुदेंचामुथा', age: 42, gender: 'M' },
  { serial: 871, voterId: 'XUA7615743', name: 'अभिनंदन रामलाल सुदेंचामुथा', father: 'रामलाल सुदेंचामुथा', age: 72, gender: 'M' },
  { serial: 872, voterId: 'XUA7615750', name: 'मंगला अभिनंदन सुदेंचामुथा', husband: 'अभिनंदन सुदेंचामुथा', age: 66, gender: 'F' },
  { serial: 873, voterId: 'XUA7615784', name: 'पंकज अभिनंदन सुदेंचामुथा', father: 'अभिनंदन सुदेंचामुथा', age: 40, gender: 'M' },
  { serial: 874, voterId: 'XUA7615776', name: 'योगिता पियुष सुदेंचामुथा', husband: 'पियुष सुदेंचामुथा', age: 39, gender: 'F' },
  { serial: 875, voterId: 'XUA7615792', name: 'लविना पंकज सुदेंचामुथा', husband: 'पंकज सुदेंचामुथा', age: 37, gender: 'F' },
  { serial: 876, voterId: 'XUA7352180', name: 'मुकुंद मोतीसिंह', father: 'निर्मलाबाई', age: 32, gender: 'M', uncertain: 'Relationship is mother instead of father' },
  { serial: 877, voterId: 'XUA7492135', name: 'निरा शरद वेताळ', husband: 'शरद वेताळ', age: 49, gender: 'F' },
  { serial: 878, voterId: 'XUA8024010', name: 'कोमल गणेश मुंडलीक', husband: 'गणेश मुंडलीक', age: 27, gender: 'F' },
  { serial: 879, voterId: 'XUA7996879', name: 'लक्ष्मण भिमाजी पोटे', father: 'भिमाजी पोटे', age: 76, gender: 'M' },
  { serial: 880, voterId: 'XUA7996721', name: 'नारायण लक्ष्मण पोटे', father: 'लक्ष्मण पोटे', age: 45, gender: 'M' },
  { serial: 881, voterId: 'XUA7996762', name: 'संजय लक्ष्मण पोटे', father: 'लक्ष्मण पोटे', age: 43, gender: 'M' }
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