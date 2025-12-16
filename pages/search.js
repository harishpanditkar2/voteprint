import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [allVoters, setAllVoters] = useState([]);
  const [filteredVoters, setFilteredVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVoters, setSelectedVoters] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [editingVoter, setEditingVoter] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 'grid' : 'list'); // 'list' or 'grid'
  const [showFilters, setShowFilters] = useState(true);
  const [language, setLanguage] = useState('mr'); // 'mr' (Marathi) or 'en' (English)
  const [showAddVoterForm, setShowAddVoterForm] = useState(false);
  const [showCustomPrint, setShowCustomPrint] = useState(false);
  const [customPrintForm, setCustomPrintForm] = useState({
    voterId: '',
    serialNumber: '',
    name: '',
    age: '',
    gender: '',
    ward: '',
    booth: '1',
    relation: '',
    house: ''
  });
  const [newVoterForm, setNewVoterForm] = useState({
    name_english: '',
    name_marathi: '',
    voter_id: '',
    serial_number: '',
    ward: '',
    booth: '',
    age: '',
    gender: '',
    father_husband_name: '',
    house_number: '',
    polling_center: ''
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30); // Show 30 voters per page
  
  const [filters, setFilters] = useState({
    ward: '',
    booth: '',
    gender: '',
    ageRange: ''
  });

  const translations = {
    mr: {
      title: 'मतदार शोध',
      subtitle: 'मतदार रेकॉर्ड शोधा आणि व्यवस्थापित करा',
      search: 'नाव, मतदार क्रमांक, किंवा सीरियल नंबर द्वारे शोधा',
      filters: 'फिल्टर',
      allWards: 'सर्व प्रभाग',
      allBooths: 'सर्व बूथ',
      allGenders: 'सर्व',
      male: 'पुरुष',
      female: 'स्त्री',
      allAges: 'सर्व वय',
      clearFilters: 'फिल्टर साफ करा',
      showing: 'दाखवत आहे',
      of: 'पैकी',
      voters: 'मतदार',
      selected: 'निवडले',
      edit: 'संपादित करा',
      print: 'प्रिंट करा',
      generatePDF: 'PDF तयार करा',
      addVoter: 'मतदार जोडा',
      age: 'वय',
      gender: 'लिंग',
      ward: 'प्रभाग',
      booth: 'बूथ',
      pollingCenter: 'मतदान केंद्र',
      noResults: 'कोणतेही मतदार आढळले नाहीत',
      tryAdjusting: 'तुमचा शोध किंवा फिल्टर समायोजित करण्याचा प्रयत्न करा'
    },
    en: {
      title: 'Voter Search',
      subtitle: 'Search and manage voter records',
      search: 'Search by name, voter ID, or serial number...',
      filters: 'Filters',
      allWards: 'All Wards',
      allBooths: 'All Booths',
      allGenders: 'All',
      male: 'Male',
      female: 'Female',
      allAges: 'All Ages',
      clearFilters: 'Clear Filters',
      showing: 'Showing',
      of: 'of',
      voters: 'voters',
      selected: 'selected',
      edit: 'Edit',
      print: 'Print',
      generatePDF: 'Generate PDF',
      addVoter: 'Add Voter',
      age: 'Age',
      gender: 'Gender',
      ward: 'Ward',
      booth: 'Booth',
      pollingCenter: 'Polling Center',
      noResults: 'No voters found',
      tryAdjusting: 'Try adjusting your search or filters'
    }
  };

  const t = translations[language];

  useEffect(() => {
    loadAllVoters();
    
    // Set initial view mode based on screen size
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('grid');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, query, allVoters]);

  const loadAllVoters = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/data/voters.json');
      const data = await response.json();

      if (response.ok) {
        setAllVoters(Array.isArray(data) ? data : []);
        setFilteredVoters(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to load voters');
      }
    } catch (err) {
      setError('Error loading voters: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allVoters];

    if (query.trim()) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(voter => 
        (voter.name && voter.name.toLowerCase().includes(searchLower)) ||
        (voter.voterId && voter.voterId.toLowerCase().includes(searchLower)) ||
        (voter.serialNumber && voter.serialNumber.toString().includes(searchLower))
      );
    }

    if (filters.ward) {
      filtered = filtered.filter(voter => (voter.actualWard || voter.ward) === filters.ward);
    }

    if (filters.booth) {
      filtered = filtered.filter(voter => (voter.actualBooth || voter.booth) === filters.booth);
    }

    if (filters.gender) {
      filtered = filtered.filter(voter => voter.gender === filters.gender);
    }

    if (filters.ageRange) {
      filtered = filtered.filter(voter => {
        const age = parseInt(voter.age);
        if (isNaN(age)) return false;
        
        switch(filters.ageRange) {
          case '18-30': return age >= 18 && age <= 30;
          case '31-45': return age >= 31 && age <= 45;
          case '46-60': return age >= 46 && age <= 60;
          case '60+': return age > 60;
          default: return true;
        }
      });
    }

    // Sort by uniqueSerial number (numeric order, not alphabetic)
    filtered.sort((a, b) => {
      const serialA = a.uniqueSerial || a.serialNumber || '';
      const serialB = b.uniqueSerial || b.serialNumber || '';
      
      // Extract numeric part from serial like "W7F1-S146" -> 146
      const strA = serialA.toString();
      const strB = serialB.toString();
      
      // Find last number in the serial string
      const matchA = strA.match(/(\d+)(?!.*\d)/);
      const matchB = strB.match(/(\d+)(?!.*\d)/);
      
      const numA = matchA ? parseInt(matchA[1]) : 0;
      const numB = matchB ? parseInt(matchB[1]) : 0;
      
      return numA - numB;
    });

    setFilteredVoters(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({ ward: '', booth: '', gender: '', ageRange: '' });
    setQuery('');
  };

  const uniqueWards = [...new Set(allVoters.map(v => v.actualWard || v.ward).filter(Boolean))].sort((a, b) => parseInt(a) - parseInt(b));
  const uniqueBooths = [...new Set(allVoters.map(v => v.actualBooth || v.booth).filter(Boolean))].sort((a, b) => parseInt(a) - parseInt(b));

  // Pagination calculations
  const { currentVoters, totalPages, indexOfFirstItem, indexOfLastItem } = useMemo(() => {
    const totalPages = Math.ceil(filteredVoters.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentVoters = filteredVoters.slice(indexOfFirstItem, indexOfLastItem);
    return { currentVoters, totalPages, indexOfFirstItem, indexOfLastItem };
  }, [filteredVoters, currentPage, itemsPerPage]);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const toggleVoterSelection = (voterId) => {
    setSelectedVoters(prev => {
      if (prev.includes(voterId)) {
        return prev.filter(id => id !== voterId);
      } else {
        return [...prev, voterId];
      }
    });
  };

  const selectAll = () => {
    setSelectedVoters(filteredVoters.map(v => v.voterId));
  };

  const clearSelection = () => {
    setSelectedVoters([]);
  };

  const openEditModal = (voter, e) => {
    if (e) e.stopPropagation();
    setEditingVoter(voter);
    setEditForm({
      voterId: voter.voterId,
      serialNumber: voter.serialNumber || '',
      name: voter.name || '',
      age: voter.age || '',
      gender: voter.gender || ''
    });
  };

  const handleGeneratePDF = (voter) => {
    setGeneratingPDF(true);
    window.open(`/api/generate-pdf?voterId=${voter.voterId}`, '_blank');
    setTimeout(() => setGeneratingPDF(false), 1000);
  };

  const handlePrintVoter = (voter) => {
    // Open PDF in new window and trigger print dialog
    window.open(`/api/generate-pdf?voterId=${voter.voterId}`, '_blank');
  };

  const closeEditModal = () => {
    setEditingVoter(null);
    setEditForm({});
  };

  const handleAddVoter = async () => {
    setSaving(true);

    try {
      const response = await fetch('/api/add-voter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVoterForm)
      });

      const data = await response.json();

      if (response.ok) {
        setAllVoters(prev => [...prev, data.voter]);
        alert('Voter added successfully!');
        setShowAddVoterForm(false);
        setNewVoterForm({
          name_english: '',
          name_marathi: '',
          voter_id: '',
          serial_number: '',
          ward: '',
          booth: '',
          age: '',
          gender: '',
          father_husband_name: '',
          house_number: '',
          polling_center: ''
        });
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = async () => {
    setSaving(true);

    try {
      const response = await fetch('/api/update-voter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (response.ok) {
        setAllVoters(prev => prev.map(v => 
          v.voterId === editForm.voterId ? data.voter : v
        ));
        alert('Voter updated successfully!');
        closeEditModal();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDFs = async () => {
    if (selectedVoters.length === 0) {
      alert('Please select at least one voter');
      return;
    }

    setGenerating(true);

    try {
      // Get selected voter objects
      const votersToGenerate = filteredVoters.filter(v => selectedVoters.includes(v.voterId));
      
      // Open PDF window immediately with same format as single print
      const pdfWindow = window.open('', '_blank');
      pdfWindow.document.write(`
        <html>
        <head>
          <title>मतदार पावती - ${votersToGenerate.length} मतदार</title>
          <link href="https://fonts.googleapis.com/css2?family=Kalam:wght@700&display=swap" rel="stylesheet">
          <style>
            @media print {
              @page { size: 80mm auto; margin: 2mm; }
              body { margin: 0; }
              .page-break { page-break-after: always; }
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Noto Sans Devanagari', 'Mangal', Arial, sans-serif;
              width: 80mm;
              margin: 0 auto;
              padding: 0;
              color: #000;
              background: #fff;
            }
            .page-break {
              page-break-after: always;
              margin-bottom: 10mm;
            }
            .main-title {
              text-align: center;
              font-size: 20px;
              font-weight: 900;
              margin: 0 0 3mm 0;
              padding: 2mm 0;
              border-bottom: 3px solid #000;
            }
            .info-box {
              border: 2px solid #000;
              padding: 3mm;
              margin: 3mm 0;
              background: #fff;
              width: 100%;
              box-sizing: border-box;
            }
            .info-line {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin: 1.5mm 0;
              padding: 1mm 0;
              font-size: 16px;
              font-weight: 700;
            }
            .info-label {
              flex-shrink: 0;
              padding-right: 3mm;
            }
            .info-value {
              text-align: right;
              font-weight: 900;
            }
            .section-title {
              font-size: 17px;
              font-weight: 900;
              text-align: center;
              margin: 3mm 0 2mm 0;
              padding: 1.5mm 0;
            }
            .polling-box {
              font-size: 15px;
              line-height: 1.7;
              padding: 3mm;
              border: 2px solid #000;
              font-weight: 700;
              text-align: center;
              margin: 2mm 0 3mm 0;
              width: 100%;
              box-sizing: border-box;
            }
            .promo-section {
              margin-top: 4mm;
              padding: 0;
              text-align: center;
              border-top: 3px solid #000;
              padding-top: 3mm;
            }
            .promo-text {
              font-family: 'Kalam', cursive;
              font-size: 16px;
              line-height: 1.8;
              margin-bottom: 3mm;
              font-weight: 700;
              padding: 0 1mm;
            }
            .candidates-box {
              font-family: 'Noto Sans Devanagari', 'Mangal', Arial, sans-serif;
              font-weight: 700;
              margin: 3mm 0;
              line-height: 1.8;
              width: 100%;
              box-sizing: border-box;
            }
            .candidate-logo {
              width: 60mm;
              height: auto;
              display: block;
              margin: 0.5mm auto;
            }
            .candidate-line {
              font-size: 16px;
              margin: 0;
              padding: 0;
              word-wrap: break-word;
              overflow-wrap: break-word;
              line-height: 1.8;
            }
            .qr-section {
              margin-top: 4mm;
              padding: 3mm 1mm;
              text-align: center;
            }
            .qr-title {
              font-family: 'Kalam', cursive;
              font-size: 15px;
              font-weight: 700;
              margin-bottom: 3mm;
              line-height: 1.6;
            }
            .qr-code {
              width: 42mm;
              height: 42mm;
              margin: 0 auto;
              display: block;
            }
            .qr-url {
              font-size: 15px;
              margin-top: 2.5mm;
              line-height: 1.6;
              font-weight: 700;
            }
          </style>
        </head>
        <body>
          ${votersToGenerate.map((voter, index) => `
            <div class="${index < votersToGenerate.length - 1 ? 'page-break' : ''}">
              <div class="main-title">मतदार माहिती</div>
              <div class="info-box">
                <div class="info-line">
                  <span class="info-label">नाव:</span>
                  <span class="info-value">${voter.name || 'N/A'}</span>
                </div>
                <div class="info-line">
                  <span class="info-label">वय/लिंग:</span>
                  <span class="info-value">${voter.age || 'N/A'} / ${voter.gender === 'M' ? 'पुरुष' : voter.gender === 'F' ? 'स्त्री' : 'N/A'}</span>
                </div>
                <div class="info-line">
                  <span class="info-label">मतदान कार्ड:</span>
                  <span class="info-value">${voter.voterId || 'N/A'}</span>
                </div>
                <div class="info-line">
                  <span class="info-label">प्रभाग/अनु क्र:</span>
                  <span class="info-value">${voter.actualWard || (voter.partNumber ? voter.partNumber.split('/')[1] : voter.ward) || 'N/A'} / ${voter.partNumber ? voter.partNumber.split('/')[2] : voter.serialNumber || 'N/A'}</span>
                </div>
              </div>
              <div class="info-box">
                <div class="section-title" style="margin: 0 0 2mm 0; padding: 0; text-align: center; font-size: 16px;">मतदानाचा पत्ता</div>
                <div style="font-size: 15px; line-height: 1.6; margin-bottom: 2mm; font-weight: 700;">
                  मतदान केंद्र क्र. ${voter.actualBooth || (voter.partNumber ? voter.partNumber.split('/')[2] : voter.booth) || 'N/A'} – ${voter.pollingCenter || 'मतदान केंद्रनिहाय मतदार यादी'}
                </div>
                <div class="info-line">
                  <span class="info-label">मतदान दिनांक:</span>
                  <span class="info-value">20 डिसेंबर 2025</span>
                </div>
                <div class="info-line">
                  <span class="info-label">मतदान वेळ:</span>
                  <span class="info-value">सकाळी 7 ते संध्याकाळी 6</span>
                </div>
              </div>
              <div class="promo-section">
                <div class="promo-text">
                  <span style="font-size: 22px;">धनुष्यबाण</span> या चिन्हासमोरील बटन दाबून<br/>
                  प्रचंड मतांनी विजयी करा !
                </div>
                <img src="/logo.png" alt="Logo" class="candidate-logo" />
                <div class="candidates-box">
                  <div class="candidate-line"><strong>नगर अध्यक्ष: सुरेंद्र शामसुंदर जेवरे</strong></div>
                  <div class="candidate-line"><strong>नगरसेवक प्रभाग 7 अ: सुरेंद्र शामसुंदर जेवरे</strong></div>
                  <div class="candidate-line"><strong>नगरसेवक प्रभाग 7 ब: मेघा सुरेंद्र जेवरे</strong></div>
                </div>
              </div>
              <div class="qr-section">
                <div class="qr-title">डेमो मतदान करण्यासाठी QR कोड स्कॅन करा</div>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://dhanushyaban7.matdan.in" 
                     alt="QR Code" 
                     class="qr-code" />
                <div class="qr-url">
                  किंवा https://dhanushyaban7.matdan.in<br/>
                  वेबसाइट उघडून डेमो मतदान करा
                </div>
              </div>
            </div>
          `).join('')}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
          </script>
        </body>
        </html>
      `);
      pdfWindow.document.close();
      
      setSelectedVoters([]);
      setGenerating(false);
    } catch (err) {
      alert('Error: ' + err.message);
      setGenerating(false);
    }
  };

  const printVoter = (voter, e) => {
    if (e) e.stopPropagation();
    const boothNumber = voter.actualBooth || voter.booth || 'N/A';
    const pollingCenter = boothNumber === '1' ? 'खोली क्र.1, नगरपरिषद स्वामी विवेकानंद सभागृह, अशोकनगर, बारामती' : 
                         boothNumber === '2' ? 'खोली क्र.1, जिल्हा परिषद शाळा, चिंचकर इस्टेट, प्रगतीनगर, बारामती' : 
                         boothNumber === '3' ? 'खोली क्र.2, जिल्हा परिषद शाळा, चिंचकर इस्टेट, प्रगतीनगर, बारामती' : 
                         'मतदान केंद्रनिहाय मतदार यादी';
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>मतदार पावती</title>
        <link href="https://fonts.googleapis.com/css2?family=Kalam:wght@700&display=swap" rel="stylesheet">
        <style>
          @media print {
            @page { size: 80mm auto; margin: 2mm; }
            body { margin: 0; }
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: 'Noto Sans Devanagari', 'Mangal', Arial, sans-serif;
            width: 80mm;
            margin: 0 auto;
            padding: 0;
            color: #000;
            background: #fff;
          }
          .main-title {
            text-align: center;
            font-size: 20px;
            font-weight: 900;
            margin: 0 0 3mm 0;
            padding: 2mm 0;
            border-bottom: 3px solid #000;
          }
          .info-box {
            border: 2px solid #000;
            padding: 3mm;
            margin: 3mm 0;
            background: #fff;
            width: 100%;
            box-sizing: border-box;
          }
          .info-line {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 1.5mm 0;
            padding: 1mm 0;
            font-size: 16px;
            font-weight: 700;
          }
          .info-label {
            flex-shrink: 0;
            padding-right: 3mm;
          }
          .info-value {
            text-align: right;
            font-weight: 900;
          }
          .section-title {
            font-size: 17px;
            font-weight: 900;
            text-align: center;
            margin: 3mm 0 2mm 0;
            padding: 1.5mm 0;
          }
          .polling-box {
            font-size: 15px;
            line-height: 1.7;
            padding: 3mm;
            border: 2px solid #000;
            font-weight: 700;
            text-align: center;
            margin: 2mm 0 3mm 0;
            width: 100%;
            box-sizing: border-box;
          }
          .promo-section {
            margin-top: 1mm;
            padding: 0;
            text-align: center;
            border-top: 3px solid #000;
            padding-top: 2mm;
          }
          .promo-text {
            font-family: 'Kalam', cursive;
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 1mm;
            font-weight: 700;
            padding: 0 1mm;
          }
          .candidates-box {
            font-family: 'Noto Sans Devanagari', 'Mangal', Arial, sans-serif;
            font-weight: 700;
            margin: 1mm 0;
            line-height: 1.8;
            width: 100%;
            box-sizing: border-box;
          }
          .candidate-logo {
            width: 60mm;
            height: auto;
            display: block;
            margin: 0 auto;
          }
          .candidate-line {
            font-size: 16px;
            margin: 0;
            padding: 0;
            word-wrap: break-word;
            overflow-wrap: break-word;
            line-height: 1.8;
          }
          .qr-section {
            margin-top: 4mm;
            padding: 3mm 1mm;
            text-align: center;
          }
          .qr-title {
            font-family: 'Kalam', cursive;
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 3mm;
            line-height: 1.6;
          }
          .qr-code {
            width: 42mm;
            height: 42mm;
            margin: 0 auto;
            display: block;
          }
          .qr-url {
            font-size: 15px;
            margin-top: 2.5mm;
            line-height: 1.6;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="main-title">मतदार माहिती</div>
        <div class="info-box">
          <div class="info-line">
            <span class="info-label">नाव:</span>
            <span class="info-value">${voter.name || 'N/A'}</span>
          </div>
          ${(voter.age || voter.gender) ? `<div class="info-line">
            <span class="info-label">वय/लिंग:</span>
            <span class="info-value">${voter.age || '-'} / ${voter.gender === 'M' ? 'पुरुष' : voter.gender === 'F' ? 'स्त्री' : '-'}</span>
          </div>` : ''}
          ${voter.voterId ? `<div class="info-line">
            <span class="info-label">मतदान कार्ड:</span>
            <span class="info-value">${voter.voterId}</span>
          </div>` : ''}
          ${(voter.actualWard || voter.ward || voter.serialNumber) ? `<div class="info-line">
            <span class="info-label">प्रभाग/अनु क्र:</span>
            <span class="info-value">${voter.actualWard || (voter.partNumber ? voter.partNumber.split('/')[1] : voter.ward) || '-'} / ${voter.partNumber ? voter.partNumber.split('/')[2] : voter.serialNumber || '-'}</span>
          </div>` : ''}
        </div>
        <div class="info-box">
          <div class="section-title" style="margin: 0 0 2mm 0; padding: 0; text-align: center; font-size: 16px;">मतदानाचा पत्ता</div>
          <div style="font-size: 15px; line-height: 1.6; margin-bottom: 2mm; font-weight: 700;">
            मतदान केंद्र क्र. ${boothNumber} – ${pollingCenter}
          </div>
          <div class="info-line">
            <span class="info-label">मतदान दिनांक:</span>
            <span class="info-value">20 डिसेंबर 2025</span>
          </div>
          <div class="info-line">
            <span class="info-label">मतदान वेळ:</span>
            <span class="info-value">सकाळी 7 ते संध्याकाळी 6</span>
          </div>
        </div>
        <div class="promo-section">
          <div class="promo-text">
            <span style="font-size: 22px;">धनुष्यबाण</span> या चिन्हासमोरील बटन दाबून<br/>
            प्रचंड मतांनी विजयी करा !
          </div>
          <img src="/logo.png" alt="Logo" class="candidate-logo" />
          <div class="candidates-box">
            <div class="candidate-line"><strong>नगर अध्यक्ष: सुरेंद्र शामसुंदर जेवरे</strong></div>
            <div class="candidate-line"><strong>नगरसेवक प्रभाग 7 अ: सुरेंद्र शामसुंदर जेवरे</strong></div>
            <div class="candidate-line"><strong>नगरसेवक प्रभाग 7 ब: मेघा सुरेंद्र जेवरे</strong></div>
          </div>
        </div>
        <div class="qr-section">
          <div class="qr-title">डेमो मतदान करण्यासाठी QR कोड स्कॅन करा</div>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://dhanushyaban7.matdan.in" 
               alt="QR Code" 
               class="qr-code" />
          <div class="qr-url">
            किंवा https://dhanushyaban7.matdan.in<br/>
            वेबसाइट उघडून डेमो मतदान करा
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 250);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <>
      <Head>
        <title>{t.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: #f8f9fa;
          min-height: 100vh;
        }
      `}</style>

      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#ff6b35',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '20px' }}>←</span> Back
          </Link>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => {
                setCustomPrintForm({
                  voterId: '',
                  serialNumber: '',
                  name: '',
                  age: '',
                  gender: 'M',
                  ward: '',
                  booth: '1',
                  relation: '',
                  house: ''
                });
                setShowCustomPrint(true);
              }}
              style={{
                padding: '8px 16px',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ✏️ Custom Print
            </button>

            <button
              onClick={() => setLanguage(language === 'mr' ? 'en' : 'mr')}
              style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                color: '#1a1a1a'
              }}
            >
              {language === 'mr' ? '🇮🇳 मराठी' : '🇮🇳 English'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#1a1a1a',
            marginBottom: '4px',
            letterSpacing: '-0.5px'
          }}>
            {t.title}
          </h1>
          <p style={{
            color: '#666666',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {t.subtitle}
          </p>
        </div>

        {loading && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '60px 40px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <div style={{ fontSize: '16px', color: '#666666', fontWeight: '600' }}>Loading voters...</div>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fee2e2',
            borderRadius: '12px',
            padding: '16px',
            color: '#991b1b',
            fontSize: '14px',
            fontWeight: '600',
            border: '2px solid #ef4444',
            marginBottom: '16px'
          }}>
            ❌ {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Search Bar */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.search}
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 44px',
                    fontSize: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontWeight: '500',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '20px'
                }}>
                  🔍
                </span>
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer',
                      padding: '4px',
                      color: '#999'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Button & Stats */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '16px',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  style={{
                    padding: '10px 20px',
                    background: activeFiltersCount > 0 ? '#ff6b35' : '#f3f4f6',
                    color: activeFiltersCount > 0 ? 'white' : '#1a1a1a',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>⚙️</span>
                  {t.filters}
                  {activeFiltersCount > 0 && (
                    <span style={{
                      background: 'rgba(255,255,255,0.3)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '12px'
                    }}>
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <div style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#666666'
                }}>
                  {t.showing} <span style={{ color: '#ff6b35', fontSize: '16px' }}>{filteredVoters.length}</span> {t.of} {allVoters.length} {t.voters}
                </div>
              </div>

              {/* Filter Bottom Sheet */}
              {showFilters && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px'
                  }}>
                    <select
                      value={filters.ward}
                      onChange={(e) => handleFilterChange('ward', e.target.value)}
                      style={{
                        padding: '12px',
                        fontSize: '14px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontWeight: '600',
                        backgroundColor: filters.ward ? '#fff3e0' : 'white',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="">{t.allWards}</option>
                      {uniqueWards.map(ward => (
                        <option key={ward} value={ward}>{t.ward} {ward}</option>
                      ))}
                    </select>

                    <select
                      value={filters.booth}
                      onChange={(e) => handleFilterChange('booth', e.target.value)}
                      style={{
                        padding: '12px',
                        fontSize: '14px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontWeight: '600',
                        backgroundColor: filters.booth ? '#fff3e0' : 'white',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="">{t.allBooths}</option>
                      {uniqueBooths.map(booth => (
                        <option key={booth} value={booth}>{t.booth} {booth}</option>
                      ))}
                    </select>

                    <select
                      value={filters.gender}
                      onChange={(e) => handleFilterChange('gender', e.target.value)}
                      style={{
                        padding: '12px',
                        fontSize: '14px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontWeight: '600',
                        backgroundColor: filters.gender ? '#fff3e0' : 'white',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="">{t.allGenders}</option>
                      <option value="M">👨 {t.male}</option>
                      <option value="F">👩 {t.female}</option>
                    </select>

                    <select
                      value={filters.ageRange}
                      onChange={(e) => handleFilterChange('ageRange', e.target.value)}
                      style={{
                        padding: '12px',
                        fontSize: '14px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontWeight: '600',
                        backgroundColor: filters.ageRange ? '#fff3e0' : 'white',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="">{t.allAges}</option>
                      <option value="18-30">18-30</option>
                      <option value="31-45">31-45</option>
                      <option value="46-60">46-60</option>
                      <option value="60+">60+</option>
                    </select>

                    <button
                      onClick={clearFilters}
                      style={{
                        padding: '12px',
                        background: '#666666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      ❌ {t.clearFilters}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bulk Selection Toolbar */}
            {selectedVoters.length > 0 && (
              <div style={{
                position: 'sticky',
                top: '61px',
                zIndex: 90,
                background: '#ff6b35',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '800',
                  color: 'white'
                }}>
                  {selectedVoters.length} {t.selected}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleGeneratePDFs}
                    disabled={generating}
                    style={{
                      padding: '10px 20px',
                      background: 'white',
                      color: '#ff6b35',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '800',
                      cursor: generating ? 'not-allowed' : 'pointer',
                      opacity: generating ? 0.6 : 1
                    }}
                  >
                    {generating ? '⏳ Generating...' : `📄 ${t.generatePDF}`}
                  </button>
                  <button
                    onClick={clearSelection}
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '2px solid white',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* View Toggle */}
            {filteredVoters.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#666'
                }}>
                  View Mode:
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setViewMode('list')}
                    style={{
                      padding: '10px 20px',
                      background: viewMode === 'list' ? '#ff6b35' : 'white',
                      color: viewMode === 'list' ? 'white' : '#666',
                      border: '2px solid ' + (viewMode === 'list' ? '#ff6b35' : '#e5e7eb'),
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>☰</span> List View
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={{
                      padding: '10px 20px',
                      background: viewMode === 'grid' ? '#ff6b35' : 'white',
                      color: viewMode === 'grid' ? 'white' : '#666',
                      border: '2px solid ' + (viewMode === 'grid' ? '#ff6b35' : '#e5e7eb'),
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>⊞</span> Grid View
                  </button>
                </div>
              </div>
            )}

            {/* Results Summary */}
            {filteredVoters.length > 0 && (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                fontSize: '14px',
                fontWeight: '600',
                color: '#666'
              }}>
                <span>
                  {t.showing} {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredVoters.length)} {t.of} {filteredVoters.length} {t.voters}
                </span>
                
                {/* Data Quality Summary */}
                {(() => {
                  const withIssues = filteredVoters.filter(v => !v.name || !v.age || !v.gender || v.ocrFailed || v.pendingManualEntry).length;
                  const blankNames = filteredVoters.filter(v => !v.name || v.name.trim() === '').length;
                  const missingAge = filteredVoters.filter(v => !v.age).length;
                  const missingGender = filteredVoters.filter(v => !v.gender).length;
                  
                  if (withIssues > 0) {
                    return (
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ 
                          background: '#ffebee', 
                          color: '#c62828', 
                          padding: '6px 12px', 
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '700'
                        }}>
                          {/* Data quality badges hidden */}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <span>Page {currentPage} of {totalPages}</span>
              </div>
            )}

            {/* Voter List */}
            {filteredVoters.length > 0 ? (
              <div style={{ 
                display: viewMode === 'grid' ? 'grid' : 'flex',
                flexDirection: viewMode === 'list' ? 'column' : undefined,
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fit, minmax(380px, 1fr))' : undefined,
                gap: '12px'
              }}>
                {currentVoters.map((voter, index) => {
                  const isGridView = viewMode === 'grid';
                  const isSelected = selectedVoters.includes(voter.voterId);
                  const hasIssues = !voter.name || !voter.age || !voter.gender || voter.ocrFailed || voter.pendingManualEntry;
                  const issueColor = hasIssues ? '#ffebee' : (isSelected ? '#fff3e0' : 'white');
                  const borderColor = hasIssues ? '#ef5350' : (isSelected ? '#ff6b35' : 'transparent');
                  
                  return (
                  <div
                    key={voter.voterId || index}
                    onClick={() => toggleVoterSelection(voter.voterId)}
                    style={{
                      position: 'relative',
                      background: issueColor,
                      borderRadius: '16px',
                      padding: isGridView ? '16px' : '20px',
                      boxShadow: isSelected 
                        ? '0 8px 24px rgba(255, 107, 53, 0.25), 0 0 0 3px rgba(255, 107, 53, 0.1)' 
                        : '0 2px 8px rgba(0,0,0,0.08)',
                      display: 'flex',
                      flexDirection: isGridView ? 'column' : 'row',
                      gap: '16px',
                      alignItems: isGridView ? 'stretch' : 'flex-start',
                      cursor: 'pointer',
                      border: `2px solid ${borderColor}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      minHeight: isGridView ? 'auto' : '140px',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Serial Number Badge */}
                    {isGridView && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'linear-gradient(135deg, #ff6b35 0%, #f7b731 100%)',
                        color: 'white',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '700',
                        boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
                        zIndex: 10,
                        letterSpacing: '0.5px'
                      }}>
                        #{voter.uniqueSerial || voter.serialNumber}
                      </div>
                    )}

                    {/* Data Quality Warning Badge - Hidden */}
                    {false && hasIssues && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: isGridView ? '60px' : '12px',
                        background: 'linear-gradient(135deg, #ef5350 0%, #e53935 100%)',
                        color: 'white',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        boxShadow: '0 4px 12px rgba(239, 83, 80, 0.3)',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{ fontSize: '14px' }}>⚠️</span>
                        <span>{!voter.name || (voter.name && voter.name.trim() === '') ? 'नाव नाही' : !voter.age || (typeof voter.age === 'string' && voter.age.trim() === '') ? 'वय नाही' : !voter.gender || (typeof voter.gender === 'string' && voter.gender.trim() === '') ? 'लिंग नाही' : 'अपूर्ण'}</span>
                      </div>
                    )}

                    {/* Checkbox - Top Right */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: isSelected ? 'none' : '2px solid #e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isSelected ? 'linear-gradient(135deg, #ff6b35 0%, #f7b731 100%)' : 'white',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      boxShadow: isSelected ? '0 4px 12px rgba(255, 107, 53, 0.4)' : '0 2px 4px rgba(0,0,0,0.1)',
                      zIndex: 10,
                      transition: 'all 0.2s'
                    }}>
                      {isSelected && '✓'}
                    </div>

                    {/* Voter Image Thumbnail */}
                    {voter.cardImage && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomedImage(voter.cardImage);
                        }}
                        style={{
                          width: isGridView ? '100%' : '90px',
                          height: isGridView ? '150px' : '90px',
                          minWidth: isGridView ? 'auto' : '90px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: '2px solid #e5e7eb',
                          background: '#f8f9fa',
                          cursor: 'zoom-in'
                        }}
                      >
                        <img 
                          src={voter.cardImage} 
                          alt="Card"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    )}

                    {/* Voter Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Serial Number Badge for List View */}
                      {!isGridView && voter.uniqueSerial === 'W7F1-S2' && console.log('Rendering list view badge for S2')}
                      {!isGridView && (
                        <div style={{
                          display: 'inline-block',
                          background: 'linear-gradient(135deg, #ff6b35 0%, #f7b731 100%)',
                          color: 'white',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '700',
                          marginBottom: '8px',
                          marginRight: '8px',
                          boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
                          letterSpacing: '0.5px'
                        }}>
                          #{voter.uniqueSerial || voter.serialNumber}
                        </div>
                      )}
                      <div style={{
                        fontSize: isGridView ? '19px' : '20px',
                        fontWeight: '700',
                        color: '#1a1a1a',
                        marginBottom: isGridView ? '10px' : '8px',
                        marginTop: isGridView ? '32px' : '0',
                        lineHeight: '1.4',
                        overflow: 'visible',
                        wordWrap: 'break-word',
                        display: 'block'
                      }}>
                        {voter.name || 'नाव उपलब्ध नाही'}
                      </div>
                      <div style={{
                        fontSize: isGridView ? '14px' : '15px',
                        color: '#4b5563',
                        fontWeight: '500',
                        lineHeight: '1.8',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#6b7280', background: '#f9fafb', padding: '6px 10px', borderRadius: '6px', display: 'inline-block' }}>{voter.voterId}</div>
                        {voter.anukramank && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>अ.क्र.</span>
                            <span style={{ fontSize: '14px', color: '#1f2937', fontWeight: '700', background: '#e0f2fe', padding: '4px 10px', borderRadius: '6px' }}>{voter.anukramank}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '16px' }}>👤</span>
                            <span>{t.age} <strong style={{ color: '#1f2937' }}>{voter.age}</strong></span>
                          </span>
                          <span style={{ color: '#d1d5db' }}>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '16px' }}>{voter.gender === 'M' ? '👨' : voter.gender === 'F' ? '👩' : '👤'}</span>
                            <span><strong style={{ color: '#1f2937' }}>{voter.gender === 'M' ? t.male : voter.gender === 'F' ? t.female : 'N/A'}</strong></span>
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '16px' }}>🏛️</span>
                            <span>{t.ward} <strong style={{ color: '#1f2937' }}>{voter.actualWard || voter.expectedWard || voter.ward || 'N/A'}</strong></span>
                          </span>
                          <span style={{ color: '#d1d5db' }}>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '16px' }}>🗳️</span>
                            <span>{t.booth} <strong style={{ color: '#1f2937' }}>{voter.actualBooth || voter.expectedBooth || voter.booth || 'N/A'}</strong></span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ position: 'absolute', bottom: '12px', right: '12px', display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingVoter(voter);
                          setEditForm({
                            voterId: voter.voterId || '',
                            serialNumber: voter.serial || voter.serialNumber || '',
                            name: voter.name || '',
                            age: voter.age || '',
                            gender: voter.gender || '',
                            ward: voter.ward || voter.actualWard || '',
                            booth: voter.booth || voter.actualBooth || ''
                          });
                        }}
                        style={{
                          width: '44px',
                          height: '44px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title={t.print}
                      >
                        🖨️
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '60px 40px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a1a', marginBottom: '8px' }}>
                  {t.noResults}
                </div>
                <div style={{ fontSize: '14px', color: '#666666', fontWeight: '500' }}>
                  {t.tryAdjusting}
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredVoters.length > itemsPerPage && (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '16px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '10px 20px',
                    background: currentPage === 1 ? '#f3f4f6' : '#ff6b35',
                    color: currentPage === 1 ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  ⏮️ First
                </button>
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  style={{
                    padding: '10px 20px',
                    background: currentPage === 1 ? '#f3f4f6' : '#ff6b35',
                    color: currentPage === 1 ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  ← Prev
                </button>

                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        style={{
                          padding: '10px 16px',
                          background: currentPage === pageNum ? '#ff6b35' : 'white',
                          color: currentPage === pageNum ? 'white' : '#666',
                          border: '2px solid ' + (currentPage === pageNum ? '#ff6b35' : '#e5e7eb'),
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          minWidth: '44px'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '10px 20px',
                    background: currentPage === totalPages ? '#f3f4f6' : '#ff6b35',
                    color: currentPage === totalPages ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Next →
                </button>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '10px 20px',
                    background: currentPage === totalPages ? '#f3f4f6' : '#ff6b35',
                    color: currentPage === totalPages ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Last ⏭️
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Zoomed Image Modal */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            cursor: 'zoom-out'
          }}
        >
          <div style={{
            position: 'relative',
            maxWidth: '95vw',
            maxHeight: '95vh',
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoomedImage(null);
              }}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
            <img 
              src={zoomedImage}
              alt="Zoomed voter card"
              style={{
                maxWidth: '95vw',
                maxHeight: '95vh',
                width: 'auto',
                height: 'auto',
                display: 'block'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingVoter && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '2px solid #f3f4f6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '800',
                color: '#1a1a1a'
              }}>
                ✏️ {t.edit}
              </h2>
              <button
                onClick={closeEditModal}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {editingVoter.cardImage && (
                <div style={{ marginBottom: '20px' }}>
                  <img 
                    src={editingVoter.cardImage} 
                    alt="Voter card"
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#666666',
                    textTransform: 'uppercase'
                  }}>
                    Name <span style={{ color: '#ff6b35' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleEditFormChange('name', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#666666',
                      textTransform: 'uppercase'
                    }}>
                      {t.age}
                    </label>
                    <input
                      type="number"
                      value={editForm.age}
                      onChange={(e) => handleEditFormChange('age', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#666666',
                      textTransform: 'uppercase'
                    }}>
                      {t.gender}
                    </label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => handleEditFormChange('gender', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        outline: 'none',
                        background: 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    >
                      <option value="M">{t.male}</option>
                      <option value="F">{t.female}</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#666666',
                      textTransform: 'uppercase'
                    }}>
                      Voter ID
                    </label>
                    <input
                      type="text"
                      value={editForm.voterId}
                      onChange={(e) => handleEditFormChange('voterId', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#666666',
                      textTransform: 'uppercase'
                    }}>
                      अनु. क्रमांक (Serial)
                    </label>
                    <input
                      type="text"
                      value={editForm.serialNumber}
                      onChange={(e) => handleEditFormChange('serialNumber', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#666666',
                      textTransform: 'uppercase'
                    }}>
                      प्रभाग (Ward)
                    </label>
                    <input
                      type="text"
                      value={editForm.ward}
                      onChange={(e) => handleEditFormChange('ward', e.target.value)}
                      placeholder="Ward"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#666666',
                      textTransform: 'uppercase'
                    }}>
                      मतदान केंद्र (Booth)
                    </label>
                    <select
                      value={editForm.booth}
                      onChange={(e) => handleEditFormChange('booth', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        outline: 'none',
                        background: 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    >
                      <option value="">Select Booth</option>
                      <option value="1">1 - खोली क्र.1, नगरपरिषद स्वामी विवेकानंद सभागृह, अशोकनगर, बारामती</option>
                      <option value="2">2 - खोली क्र.1, जिल्हा परिषद शाळा, चिंचकर इस्टेट, प्रगतीनगर, बारामती</option>
                      <option value="3">3 - खोली क्र.2, जिल्हा परिषद शाळा, चिंचकर इस्टेट, प्रगतीनगर, बारामती</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '2px solid #f3f4f6',
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  onClick={closeEditModal}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#f3f4f6',
                    color: '#666666',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const voterToPrint = {
                      ...editingVoter,
                      voterId: editForm.voterId,
                      serial: editForm.serialNumber,
                      serialNumber: editForm.serialNumber,
                      name: editForm.name,
                      age: editForm.age,
                      gender: editForm.gender,
                      ward: editForm.ward,
                      actualWard: editForm.ward,
                      booth: editForm.booth,
                      actualBooth: editForm.booth
                    };
                    printVoter(voterToPrint, e);
                  }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  🖨️ Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Print Modal */}
      {showCustomPrint && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '2px solid #f3f4f6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '800',
                color: '#1a1a1a'
              }}>
                ✏️ Custom Print
              </h2>
              <button
                onClick={() => setShowCustomPrint(false)}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Name Field - First */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#666666',
                    textTransform: 'uppercase'
                  }}>
                    Name <span style={{ color: '#ff6b35' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={customPrintForm.name}
                    onChange={(e) => setCustomPrintForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter Full Name"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#666666',
                      textTransform: 'uppercase'
                    }}>
                      Age
                    </label>
                    <input
                      type="number"
                      value={customPrintForm.age}
                      onChange={(e) => setCustomPrintForm(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="Age"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#666666',
                      textTransform: 'uppercase'
                    }}>
                      Gender
                    </label>
                    <select
                      value={customPrintForm.gender}
                      onChange={(e) => setCustomPrintForm(prev => ({ ...prev, gender: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="">Select</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>
                </div>

                {/* Voter ID and Serial */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#666666',
                      textTransform: 'uppercase'
                    }}>
                      Voter ID
                    </label>
                    <input
                      type="text"
                      value={customPrintForm.voterId}
                      onChange={(e) => setCustomPrintForm(prev => ({ ...prev, voterId: e.target.value }))}
                      placeholder="Enter Voter ID"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#666666',
                      textTransform: 'uppercase'
                    }}>
                      Serial Number
                    </label>
                    <input
                      type="text"
                      value={customPrintForm.serialNumber}
                      onChange={(e) => setCustomPrintForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                      placeholder="Enter Serial"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Ward and Booth */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#666666',
                      textTransform: 'uppercase'
                    }}>
                      प्रभाग (Ward)
                    </label>
                    <input
                      type="text"
                      value={customPrintForm.ward}
                      onChange={(e) => setCustomPrintForm(prev => ({ ...prev, ward: e.target.value }))}
                      placeholder="Ward"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#666666',
                      textTransform: 'uppercase'
                    }}>
                      मतदान केंद्र (Booth)
                    </label>
                    <select
                      value={customPrintForm.booth}
                      onChange={(e) => setCustomPrintForm(prev => ({ ...prev, booth: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        outline: 'none',
                        background: 'white'
                      }}
                    >
                      <option value="">Select Booth</option>
                      <option value="1">1 - खोली क्र.1, नगरपरिषद स्वामी विवेकानंद सभागृह, अशोकनगर, बारामती</option>
                      <option value="2">2 - खोली क्र.1, जिल्हा परिषद शाळा, चिंचकर इस्टेट, प्रगतीनगर, बारामती</option>
                      <option value="3">3 - खोली क्र.2, जिल्हा परिषद शाळा, चिंचकर इस्टेट, प्रगतीनगर, बारामती</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const voterToPrint = {
                    voterId: customPrintForm.voterId,
                    serial: customPrintForm.serialNumber,
                    serialNumber: customPrintForm.serialNumber,
                    name: customPrintForm.name,
                    age: customPrintForm.age,
                    gender: customPrintForm.gender,
                    relation: customPrintForm.relation,
                    house: customPrintForm.house,
                    ward: customPrintForm.ward,
                    actualWard: customPrintForm.ward,
                    booth: customPrintForm.booth,
                    actualBooth: customPrintForm.booth
                  };
                  printVoter(voterToPrint, e);
                  setShowCustomPrint(false);
                }}
                disabled={!customPrintForm.name}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '14px',
                  background: (!customPrintForm.name) ? '#cbd5e0' : '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: (!customPrintForm.name) ? 'not-allowed' : 'pointer',
                  opacity: (!customPrintForm.name) ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                🖨️ Print Custom Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Voter Modal */}
      {showAddVoterForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '2px solid #f3f4f6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '800',
                color: '#1a1a1a'
              }}>
                ➕ {t.addVoter}
              </h2>
              <button
                onClick={() => setShowAddVoterForm(false)}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#666666'
                  }}>
                    Name (English)
                  </label>
                  <input
                    type="text"
                    value={newVoterForm.name_english}
                    onChange={(e) => setNewVoterForm({...newVoterForm, name_english: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#666666'
                  }}>
                    नाव (मराठी) *
                  </label>
                  <input
                    type="text"
                    value={newVoterForm.name_marathi}
                    onChange={(e) => setNewVoterForm({...newVoterForm, name_marathi: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#666666'
                    }}>
                      Voter ID *
                    </label>
                    <input
                      type="text"
                      value={newVoterForm.voter_id}
                      onChange={(e) => setNewVoterForm({...newVoterForm, voter_id: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#666666'
                    }}>
                      Serial Number *
                    </label>
                    <input
                      type="text"
                      value={newVoterForm.serial_number}
                      onChange={(e) => setNewVoterForm({...newVoterForm, serial_number: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#666666'
                    }}>
                      Ward *
                    </label>
                    <input
                      type="text"
                      value={newVoterForm.ward}
                      onChange={(e) => setNewVoterForm({...newVoterForm, ward: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#666666'
                    }}>
                      Booth *
                    </label>
                    <input
                      type="text"
                      value={newVoterForm.booth}
                      onChange={(e) => setNewVoterForm({...newVoterForm, booth: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#666666'
                    }}>
                      Age
                    </label>
                    <input
                      type="number"
                      value={newVoterForm.age}
                      onChange={(e) => setNewVoterForm({...newVoterForm, age: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#666666'
                    }}>
                      Gender
                    </label>
                    <select
                      value={newVoterForm.gender}
                      onChange={(e) => setNewVoterForm({...newVoterForm, gender: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="">Select</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#666666'
                  }}>
                    Father/Husband Name
                  </label>
                  <input
                    type="text"
                    value={newVoterForm.father_husband_name}
                    onChange={(e) => setNewVoterForm({...newVoterForm, father_husband_name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#666666'
                  }}>
                    House Number
                  </label>
                  <input
                    type="text"
                    value={newVoterForm.house_number}
                    onChange={(e) => setNewVoterForm({...newVoterForm, house_number: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#666666'
                  }}>
                    Polling Center
                  </label>
                  <input
                    type="text"
                    value={newVoterForm.polling_center}
                    onChange={(e) => setNewVoterForm({...newVoterForm, polling_center: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '2px solid #f3f4f6',
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  onClick={() => setShowAddVoterForm(false)}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#f3f4f6',
                    color: '#666666',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.5 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddVoter}
                  disabled={saving || !newVoterForm.name_marathi || !newVoterForm.voter_id}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: saving ? '#cbd5e0' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: (saving || !newVoterForm.name_marathi || !newVoterForm.voter_id) ? 'not-allowed' : 'pointer',
                    opacity: (saving || !newVoterForm.name_marathi || !newVoterForm.voter_id) ? 0.5 : 1
                  }}
                >
                  {saving ? '💾 Adding...' : '✓ Add Voter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
