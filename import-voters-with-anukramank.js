const fs = require('fs');

// This script imports voter data and automatically assigns anukramank (continuous sequence)
// Usage: Paste your voter data array into the 'newVotersData' variable below

const newVotersData = [
  { "voterId": "XUA7224868", "name": "गजानन यशवंत अनासपुरे", "uniqueSerial": "W7F1-S1", "serialNumber": "1", "age": "82", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224850", "name": "मंदा गजानन अनासपुरे", "uniqueSerial": "W7F1-S2", "serialNumber": "2", "age": "75", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7225139", "name": "तनुजा जावेद बागवान", "uniqueSerial": "W7F1-S3", "serialNumber": "3", "age": "31", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224801", "name": "खुशरबु मंहमदरफिक बागवान", "uniqueSerial": "W7F1-S4", "serialNumber": "4", "age": "31", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224645", "name": "अंजुम गणी बागवान", "uniqueSerial": "W7F1-S5", "serialNumber": "5", "age": "39", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7225162", "name": "इम्रान शब्बीर बागवान", "uniqueSerial": "W7F1-S6", "serialNumber": "6", "age": "29", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224819", "name": "करिश्मा शब्बीर बागवान", "uniqueSerial": "W7F1-S7", "serialNumber": "7", "age": "28", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224942", "name": "अनिता नविनकुमार बखडा", "uniqueSerial": "W7F1-S8", "serialNumber": "8", "age": "54", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224959", "name": "श्रेयंस नविनकुमार बखडा", "uniqueSerial": "W7F1-S9", "serialNumber": "9", "age": "39", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224785", "name": "जयश्री अतुल भुजबळ", "uniqueSerial": "W7F1-S10", "serialNumber": "10", "age": "37", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7351711", "name": "रसिका शंकरराव भुजबळ", "uniqueSerial": "W7F1-S11", "serialNumber": "11", "age": "31", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224694", "name": "शिल्पा कुणाल बोरा", "uniqueSerial": "W7F1-S12", "serialNumber": "12", "age": "37", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7351448", "name": "संदिप महावीर बोराळकर", "uniqueSerial": "W7F1-S13", "serialNumber": "13", "age": "42", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7351463", "name": "अमृता संदिप बोराळकर", "uniqueSerial": "W7F1-S14", "serialNumber": "14", "age": "36", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7670524", "name": "सई निलेश चिवटे", "uniqueSerial": "W7F1-S15", "serialNumber": "15", "age": "40", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224678", "name": "धनश्री प्रकाश दळवी", "uniqueSerial": "W7F1-S16", "serialNumber": "16", "age": "31", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7225063", "name": "सिमा विजय दासरवार", "uniqueSerial": "W7F1-S17", "serialNumber": "17", "age": "34", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7793805", "name": "अमृता हिराचंद देशमुख", "uniqueSerial": "W7F1-S18", "serialNumber": "18", "age": "29", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7793813", "name": "आकाश हिराचंद देशमुख", "uniqueSerial": "W7F1-S19", "serialNumber": "19", "age": "26", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7670508", "name": "देवदत्त जगदीश देशपांडे", "uniqueSerial": "W7F1-S20", "serialNumber": "20", "age": "29", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7556418", "name": "अपूर्वा राजेंद्र देशपांडे", "uniqueSerial": "W7F1-S21", "serialNumber": "21", "age": "28", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224892", "name": "पराग दिलीपकुमार दोशी", "uniqueSerial": "W7F1-S22", "serialNumber": "22", "age": "42", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224900", "name": "काजल पराग दोशी", "uniqueSerial": "W7F1-S23", "serialNumber": "23", "age": "37", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7670482", "name": "मयुर सुधाकर गाडे", "uniqueSerial": "W7F1-S24", "serialNumber": "24", "age": "32", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7670474", "name": "मंदार सुधाकर गाडे", "uniqueSerial": "W7F1-S25", "serialNumber": "25", "age": "30", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224637", "name": "लालासाहेब कृष्णराव गाडेकर", "uniqueSerial": "W7F1-S26", "serialNumber": "26", "age": "67", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7225089", "name": "लता लालासाहेब गाडेकर", "uniqueSerial": "W7F1-S27", "serialNumber": "27", "age": "58", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224546", "name": "रोहिणी लालासाहेब गाडेकर", "uniqueSerial": "W7F1-S28", "serialNumber": "28", "age": "35", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224561", "name": "रणजीत लालासाहेब गाडेकर", "uniqueSerial": "W7F1-S29", "serialNumber": "29", "age": "31", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7670540", "name": "कामिनी शैलेश गलांडे", "uniqueSerial": "W7F1-S30", "serialNumber": "30", "age": "30", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7670532", "name": "नेहा रोहित गानबोटे", "uniqueSerial": "W7F1-S31", "serialNumber": "31", "age": "34", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224579", "name": "सायली रमेश गानबोटे", "uniqueSerial": "W7F1-S32", "serialNumber": "32", "age": "42", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224504", "name": "भद्रबाहु मगनलाल गांधी", "uniqueSerial": "W7F1-S33", "serialNumber": "33", "age": "75", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224462", "name": "सुरेखा भद्रबाहु गांधी", "uniqueSerial": "W7F1-S34", "serialNumber": "34", "age": "74", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224454", "name": "श्रध्दा भद्रबाहु गांधी", "uniqueSerial": "W7F1-S35", "serialNumber": "35", "age": "46", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7750508", "name": "पुजा विनोद गांधी", "uniqueSerial": "W7F1-S36", "serialNumber": "36", "age": "28", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7556400", "name": "तुषार गोविंद गदादे", "uniqueSerial": "W7F1-S37", "serialNumber": "37", "age": "41", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224405", "name": "प्रतिक रघुनाथ गावडे", "uniqueSerial": "W7F1-S38", "serialNumber": "38", "age": "31", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7750425", "name": "प्रियांका शंकर गावडे", "uniqueSerial": "W7F1-S39", "serialNumber": "39", "age": "30", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224413", "name": "अनिल विश्वनाथ गवळी", "uniqueSerial": "W7F1-S40", "serialNumber": "40", "age": "47", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7225014", "name": "मयुर जयकुमार घाडगे", "uniqueSerial": "W7F1-S41", "serialNumber": "41", "age": "32", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7670557", "name": "सुरज मोहनराव घुले", "uniqueSerial": "W7F1-S42", "serialNumber": "42", "age": "34", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7491897", "name": "किशोर महादेव गोंजारी", "uniqueSerial": "W7F1-S43", "serialNumber": "43", "age": "55", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7491905", "name": "छाया किशोर गोंजारी", "uniqueSerial": "W7F1-S44", "serialNumber": "44", "age": "52", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7491913", "name": "श्रुति किशोर गोंजारी", "uniqueSerial": "W7F1-S45", "serialNumber": "45", "age": "29", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA8244303", "name": "सिद्धी किशोर गोंजारी", "uniqueSerial": "W7F1-S46", "serialNumber": "46", "age": "27", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7615487", "name": "वंदना प्रशांत गुरव", "uniqueSerial": "W7F1-S47", "serialNumber": "47", "age": "32", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7351810", "name": "दुर्या मुस्ताफा हवेलीवाला", "uniqueSerial": "W7F1-S48", "serialNumber": "48", "age": "32", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224397", "name": "संताजी मुरलीधर होवाळ", "uniqueSerial": "W7F1-S49", "serialNumber": "49", "age": "50", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224389", "name": "सोनिया संगिता होवाळ", "uniqueSerial": "W7F1-S50", "serialNumber": "50", "age": "37", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7670441", "name": "अमित अजित इंगळे", "uniqueSerial": "W7F1-S51", "serialNumber": "51", "age": "44", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224876", "name": "वसंत मारूती जगदाळे", "uniqueSerial": "W7F1-S52", "serialNumber": "52", "age": "54", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224769", "name": "विजया वसंत जगदाळे", "uniqueSerial": "W7F1-S53", "serialNumber": "53", "age": "47", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224777", "name": "दिक्षा वसंत जगदाळे", "uniqueSerial": "W7F1-S54", "serialNumber": "54", "age": "29", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7750391", "name": "योगेश झुंझारराव जगताप", "uniqueSerial": "W7F1-S55", "serialNumber": "55", "age": "48", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7750409", "name": "कावेरी योगेश जगताप", "uniqueSerial": "W7F1-S56", "serialNumber": "56", "age": "46", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7750474", "name": "मुर्तुजा मुस्तुफा जिनियावाला", "uniqueSerial": "W7F1-S57", "serialNumber": "57", "age": "27", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224884", "name": "योगिता चेतन कदम", "uniqueSerial": "W7F1-S58", "serialNumber": "58", "age": "49", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7615420", "name": "राहुल शांताराम काळभोर", "uniqueSerial": "W7F1-S59", "serialNumber": "59", "age": "49", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7615438", "name": "जयश्री राहुल काळभोर", "uniqueSerial": "W7F1-S60", "serialNumber": "60", "age": "46", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7750383", "name": "अक्षय देवीचंद कटारिया", "uniqueSerial": "W7F1-S61", "serialNumber": "61", "age": "26", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7225287", "name": "विनय महाउंगाप्पा कोलकी", "uniqueSerial": "W7F1-S62", "serialNumber": "62", "age": "55", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7225279", "name": "उमा विनय कोलकी", "uniqueSerial": "W7F1-S63", "serialNumber": "63", "age": "45", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7615453", "name": "जगन्नाथ नारायण कुंभार", "uniqueSerial": "W7F1-S64", "serialNumber": "64", "age": "59", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7615461", "name": "तेजश्री जगन्नाथ कुंभार", "uniqueSerial": "W7F1-S65", "serialNumber": "65", "age": "48", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224728", "name": "ओंकार जगन्नाथ कुंभार", "uniqueSerial": "W7F1-S66", "serialNumber": "66", "age": "39", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224710", "name": "विपुल जगन्नाथ कुंभार", "uniqueSerial": "W7F1-S67", "serialNumber": "67", "age": "28", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA8244345", "name": "प्रियांका हनुमंत लकडे", "uniqueSerial": "W7F1-S68", "serialNumber": "68", "age": "30", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224991", "name": "पद्मनाथ महेश लंके", "uniqueSerial": "W7F1-S69", "serialNumber": "69", "age": "30", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7351935", "name": "अनिराध्द महेश लंके", "uniqueSerial": "W7F1-S70", "serialNumber": "70", "age": "29", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7670516", "name": "सोनाली सचिन लोणकर", "uniqueSerial": "W7F1-S71", "serialNumber": "71", "age": "32", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224496", "name": "सचिन भास्कर महाजन", "uniqueSerial": "W7F1-S72", "serialNumber": "72", "age": "42", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7351422", "name": "श्रीकुमार विजयकुमार महामुनी", "uniqueSerial": "W7F1-S73", "serialNumber": "73", "age": "50", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7351430", "name": "स्मिता श्रीकुमार महामुनी", "uniqueSerial": "W7F1-S74", "serialNumber": "74", "age": "50", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224553", "name": "धन्यकुमार भगवान माने", "uniqueSerial": "W7F1-S75", "serialNumber": "75", "age": "62", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224439", "name": "रेखा धन्यकुमार माने", "uniqueSerial": "W7F1-S76", "serialNumber": "76", "age": "53", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7225105", "name": "अजिंक्य धन्यकुमार माने", "uniqueSerial": "W7F1-S77", "serialNumber": "77", "age": "39", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224488", "name": "मुनीरा मोहमद नासीकवाला", "uniqueSerial": "W7F1-S78", "serialNumber": "78", "age": "43", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224470", "name": "हुसेन सादिक नाशिकवाला", "uniqueSerial": "W7F1-S79", "serialNumber": "79", "age": "32", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7225329", "name": "निलीमा मारूतराव नेवसे", "uniqueSerial": "W7F1-S80", "serialNumber": "80", "age": "52", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7750433", "name": "सारिका अमित ओसवाल", "uniqueSerial": "W7F1-S81", "serialNumber": "81", "age": "41", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7750458", "name": "आज्ञा समकित ओसवाल", "uniqueSerial": "W7F1-S82", "serialNumber": "82", "age": "42", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7750466", "name": "सय्यम जयंतीलाल ओसवाल", "uniqueSerial": "W7F1-S83", "serialNumber": "83", "age": "26", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7491939", "name": "प्रीती मधुकर पांढरे", "uniqueSerial": "W7F1-S84", "serialNumber": "84", "age": "30", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7850738", "name": "किर्ती सुजीत पराडकर", "uniqueSerial": "W7F1-S85", "serialNumber": "85", "age": "44", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224595", "name": "अजय घनश्याम पटेल", "uniqueSerial": "W7F1-S86", "serialNumber": "86", "age": "45", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224587", "name": "वैशाली अजय पटेल", "uniqueSerial": "W7F1-S87", "serialNumber": "87", "age": "40", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7615446", "name": "सिद्धार्थ ज्ञानेश्वर फराटे", "uniqueSerial": "W7F1-S88", "serialNumber": "88", "age": "28", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7351851", "name": "शांताराम बबन पिंगळे", "uniqueSerial": "W7F1-S89", "serialNumber": "89", "age": "62", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7225022", "name": "सुनिता शांताराम पिंगळे", "uniqueSerial": "W7F1-S90", "serialNumber": "90", "age": "49", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224918", "name": "पृथ्वीराज शांताराम पिंगळे", "uniqueSerial": "W7F1-S91", "serialNumber": "91", "age": "29", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7225030", "name": "सुभाष विश्वनाथ रावळ", "uniqueSerial": "W7F1-S92", "serialNumber": "92", "age": "73", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7225048", "name": "विनय विवेक रावळ", "uniqueSerial": "W7F1-S93", "serialNumber": "93", "age": "37", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224736", "name": "पियुष बाबुराव रूपनवर", "uniqueSerial": "W7F1-S94", "serialNumber": "94", "age": "30", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224512", "name": "संतोष दत्तात्रय सणस", "uniqueSerial": "W7F1-S95", "serialNumber": "95", "age": "50", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7225121", "name": "सपना महावीर संचेती", "uniqueSerial": "W7F1-S96", "serialNumber": "96", "age": "36", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7750441", "name": "साहिल संजय संचेती", "uniqueSerial": "W7F1-S97", "serialNumber": "97", "age": "28", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224447", "name": "सौरभ राजेंद्र सस्ते", "uniqueSerial": "W7F1-S98", "serialNumber": "98", "age": "33", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224421", "name": "सायली राजेंद्र सस्ते", "uniqueSerial": "W7F1-S99", "serialNumber": "99", "age": "29", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7225055", "name": "संजय मोतीचंद शहा", "uniqueSerial": "W7F1-S100", "serialNumber": "100", "age": "65", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7670433", "name": "सागर अरविंद शहा", "uniqueSerial": "W7F1-S101", "serialNumber": "101", "age": "48", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224967", "name": "नुपूर संजय शहा", "uniqueSerial": "W7F1-S102", "serialNumber": "102", "age": "30", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7556426", "name": "पुजा शिरिष शहा", "uniqueSerial": "W7F1-S103", "serialNumber": "103", "age": "28", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224603", "name": "श्रीमती प्रकाश शहा", "uniqueSerial": "W7F1-S104", "serialNumber": "104", "age": "78", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224611", "name": "सुदर्शन प्रकाश शहा", "uniqueSerial": "W7F1-S105", "serialNumber": "105", "age": "49", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7351455", "name": "सोनाली सागर शहा", "uniqueSerial": "W7F1-S106", "serialNumber": "106", "age": "45", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7670490", "name": "प्रदिप ज्ञानदेव सुर्वे", "uniqueSerial": "W7F1-S107", "serialNumber": "107", "age": "28", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7351505", "name": "अनिता अजय तलवाड", "uniqueSerial": "W7F1-S108", "serialNumber": "108", "age": "54", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7351489", "name": "साक्षी अजय तलवाड", "uniqueSerial": "W7F1-S109", "serialNumber": "109", "age": "32", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7351471", "name": "शिवानी अजय तलवाड", "uniqueSerial": "W7F1-S110", "serialNumber": "110", "age": "29", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224793", "name": "दीलनवाझ शब्बीर तांबोळी", "uniqueSerial": "W7F1-S111", "serialNumber": "111", "age": "31", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224538", "name": "हर्षद चंद्रकांत तीसगांवकर", "uniqueSerial": "W7F1-S112", "serialNumber": "112", "age": "31", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224983", "name": "स्वप्नील राजकुमार उपाध्ये", "uniqueSerial": "W7F1-S113", "serialNumber": "113", "age": "38", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7225071", "name": "सुरज राजकुमार उपाध्ये", "uniqueSerial": "W7F1-S114", "serialNumber": "114", "age": "38", "gender": "M", "ward": "7", "booth": "1" },
  { "voterId": "XUA7351513", "name": "शर्वरी प्रदिप व्होरा", "uniqueSerial": "W7F1-S115", "serialNumber": "115", "age": "30", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224934", "name": "मिनल वैभव व्होरा", "uniqueSerial": "W7F1-S116", "serialNumber": "116", "age": "39", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224835", "name": "कल्पना हावप्पा वड्डे", "uniqueSerial": "W7F1-S117", "serialNumber": "117", "age": "59", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7225006", "name": "सोनल हावप्पा वड्डे", "uniqueSerial": "W7F1-S118", "serialNumber": "118", "age": "34", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7224843", "name": "मिनल हावप्पा वड्डे", "uniqueSerial": "W7F1-S119", "serialNumber": "119", "age": "42", "gender": "F", "ward": "7", "booth": "1" },
  { "voterId": "XUA7615479", "name": "पुजा दिपक वडगांवकर", "uniqueSerial": "W7F1-S120", "serialNumber": "120", "age": "33", "gender": "F", "ward": "7", "booth": "1" },
];

console.log('\n=== Importing Voters with Anukramank ===\n');

if (newVotersData.length === 0) {
  console.log('⚠️ No data provided. Please paste voter data into the newVotersData array.');
  process.exit(1);
}

// Read current voters
const votersPath = 'public/data/voters.json';
let currentVoters = [];
try {
  currentVoters = JSON.parse(fs.readFileSync(votersPath, 'utf-8'));
} catch (err) {
  console.log('Starting with empty database...');
}

// Get the last anukramank number
let lastAnukramank = 0;
if (currentVoters.length > 0) {
  const maxAnukramank = Math.max(...currentVoters.map(v => v.anukramank || 0));
  lastAnukramank = maxAnukramank;
}

console.log(`Current voters: ${currentVoters.length}`);
console.log(`Last anukramank: ${lastAnukramank}`);
console.log(`New voters to add: ${newVotersData.length}\n`);

// Add anukramank to each new voter
const votersWithAnukramank = newVotersData.map((voter, index) => ({
  ...voter,
  anukramank: lastAnukramank + index + 1
}));

// Merge with existing voters
const allVoters = [...currentVoters, ...votersWithAnukramank];

// Create backup before saving
const timestamp = Date.now();
const backupPath = `public/data/voters.json.backup-before-import-${timestamp}`;
if (currentVoters.length > 0) {
  fs.writeFileSync(backupPath, JSON.stringify(currentVoters, null, 2), 'utf-8');
  console.log(`✅ Backup created: ${backupPath}`);
}

// Save updated data
fs.writeFileSync(votersPath, JSON.stringify(allVoters, null, 2), 'utf-8');

console.log(`✅ Successfully imported ${newVotersData.length} voters!`);
console.log(`   Total voters now: ${allVoters.length}`);
console.log(`   Anukramank range: ${lastAnukramank + 1} to ${lastAnukramank + newVotersData.length}\n`);

// Show first 5 examples
console.log('First 5 imported voters:');
votersWithAnukramank.slice(0, 5).forEach(v => {
  console.log(`  अ.क्र. ${v.anukramank} | ${v.uniqueSerial} | ${v.name}`);
});

console.log('\n=== Import Complete! ===\n');
