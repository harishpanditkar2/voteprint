import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [showFilters, setShowFilters] = useState(false);
  const [language, setLanguage] = useState('mr'); // 'mr' (Marathi) or 'en' (English)
  
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
  }, []);

  useEffect(() => {
    applyFilters();
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

  const handlePrintVoter = async (voter) => {
    setPrinting(true);
    try {
      const response = await fetch(`/api/print?voterId=${voter.voterId}`, { method: 'POST' });
      if (response.ok) {
        alert('Print job sent successfully!');
      } else {
        alert('Failed to send print job');
      }
    } catch (error) {
      console.error('Print error:', error);
      alert('Error sending print job');
    } finally {
      setPrinting(false);
    }
  };

  const closeEditModal = () => {
    setEditingVoter(null);
    setEditForm({});
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
              padding: 2mm;
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
              font-family: 'Kalam', cursive;
              font-weight: 700;
              border: 2px solid #000;
              padding: 3mm 1mm;
              margin: 3mm 0;
              line-height: 1.8;
              width: 100%;
              box-sizing: border-box;
            }
            .candidate-line {
              font-size: 17px;
              margin-bottom: 2.5mm;
              padding: 1mm 0;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            .candidate-line:last-child {
              margin-bottom: 0;
            }
            .qr-section {
              margin-top: 4mm;
              padding: 3mm 1mm;
              text-align: center;
            }
            .qr-title {
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
              ${voter.pollingCenter ? `
              <div class="section-title">मतदानाचा पत्ता</div>
              <div class="polling-box">
                मतदान केंद्र क्र. ${voter.actualBooth || (voter.partNumber ? voter.partNumber.split('/')[2] : voter.booth) || 'N/A'} – ${voter.pollingCenter}
              </div>
              ` : ''}
              <div class="info-box">
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
                  या सर्व उमेदवारांना मतदानाच्या दिवशी सुद्धा<br/>
                  <span style="font-size: 22px;">धनुष्यबाण</span> या चिन्हासमोरील बटन दाबून<br/>
                  प्रचंड मतांनी विजयी करा !
                </div>
                <div class="candidates-box">
                  <div class="candidate-line">नगर अध्यक्ष: सुरेंद्र शामसुंदर जेवरे</div>
                  <div class="candidate-line">नगरसेवक प्रभाग 7अ: सुरेंद्र शामसुंदर जेवरे</div>
                  <div class="candidate-line">नगरसेवक प्रभाग 7ब: मेघा सुरेंद्र जेवरे</div>
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
            padding: 2mm;
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
            font-family: 'Kalam', cursive;
            font-weight: 700;
            border: 2px solid #000;
            padding: 3mm 1mm;
            margin: 3mm 0;
            line-height: 1.8;
            width: 100%;
            box-sizing: border-box;
          }
          .candidate-line {
            font-size: 17px;
            margin-bottom: 2.5mm;
            padding: 1mm 0;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          .candidate-line:last-child {
            margin-bottom: 0;
          }
          .qr-section {
            margin-top: 4mm;
            padding: 3mm 1mm;
            text-align: center;
          }
          .qr-title {
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
        ${voter.pollingCenter ? `
        <div class="section-title">मतदानाचा पत्ता</div>
        <div class="polling-box">
          मतदान केंद्र क्र. ${voter.actualBooth || (voter.partNumber ? voter.partNumber.split('/')[2] : voter.booth) || 'N/A'} – ${voter.pollingCenter}
        </div>
        ` : ''}
        <div class="info-box">
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
            या सर्व उमेदवारांना मतदानाच्या दिवशी सुद्धा<br/>
            <span style="font-size: 22px;">धनुष्यबाण</span> या चिन्हासमोरील बटन दाबून<br/>
            प्रचंड मतांनी विजयी करा !
          </div>
          <div class="candidates-box">
            <div class="candidate-line">नगर अध्यक्ष: सुरेंद्र शामसुंदर जेवरे</div>
            <div class="candidate-line">नगरसेवक प्रभाग 7अ: सुरेंद्र शामसुंदर जेवरे</div>
            <div class="candidate-line">नगरसेवक प्रभाग 7ब: मेघा सुरेंद्र जेवरे</div>
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
                    gap: '12px',
                    marginBottom: '12px'
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
                  </div>

                  <button
                    onClick={clearFilters}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#666666',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {t.clearFilters}
                  </button>
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
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '8px 16px',
                    background: viewMode === 'list' ? '#ff6b35' : 'white',
                    color: viewMode === 'list' ? 'white' : '#666',
                    border: '2px solid ' + (viewMode === 'list' ? '#ff6b35' : '#e5e7eb'),
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>☰</span> List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '8px 16px',
                    background: viewMode === 'grid' ? '#ff6b35' : 'white',
                    color: viewMode === 'grid' ? 'white' : '#666',
                    border: '2px solid ' + (viewMode === 'grid' ? '#ff6b35' : '#e5e7eb'),
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>⊞</span> Grid
                </button>
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
                {filteredVoters.map((voter, index) => {
                  const isGridView = viewMode === 'grid';
                  const isSelected = selectedVoters.includes(voter.voterId);
                  
                  return (
                  <div
                    key={voter.voterId || index}
                    onClick={() => toggleVoterSelection(voter.voterId)}
                    style={{
                      background: isSelected ? '#fff3e0' : 'white',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: isSelected 
                        ? '0 4px 12px rgba(255, 107, 53, 0.2)' 
                        : '0 1px 3px rgba(0,0,0,0.1)',
                      display: 'flex',
                      flexDirection: isGridView ? 'column' : 'row',
                      gap: '12px',
                      alignItems: isGridView ? 'stretch' : 'center',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #ff6b35' : '2px solid transparent',
                      transition: 'all 0.2s',
                      minHeight: isGridView ? 'auto' : '72px'
                    }}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width: '44px',
                      height: '44px',
                      minWidth: '44px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isSelected ? '#ff6b35' : 'white',
                      color: 'white',
                      fontSize: '20px',
                      fontWeight: 'bold'
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
                          width: isGridView ? '100%' : '56px',
                          height: isGridView ? '150px' : '72px',
                          minWidth: isGridView ? 'auto' : '56px',
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
                      <div style={{
                        fontSize: isGridView ? '18px' : '16px',
                        fontWeight: '700',
                        color: '#1a1a1a',
                        marginBottom: isGridView ? '8px' : '4px',
                        overflow: isGridView ? 'visible' : 'hidden',
                        textOverflow: isGridView ? 'normal' : 'ellipsis',
                        whiteSpace: isGridView ? 'normal' : 'nowrap'
                      }}>
                        {voter.name || 'Name not available'}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#666666',
                        fontWeight: '500',
                        lineHeight: isGridView ? '1.8' : '1.4'
                      }}>
                        {isGridView ? (
                          <div>
                            <div>#{voter.serialNumber} • {voter.voterId}</div>
                            <div>{t.age} {voter.age} • {voter.gender === 'M' ? t.male : voter.gender === 'F' ? t.female : 'N/A'}</div>
                            <div>{t.ward} {voter.actualWard || (voter.partNumber ? voter.partNumber.split('/')[1] : voter.ward) || 'N/A'} • {t.booth} {voter.actualBooth || voter.booth || 'N/A'}</div>
                          </div>
                        ) : (
                          <div>
                            #{voter.serialNumber} • {voter.voterId}
                            <br />
                            {t.age} {voter.age} • {voter.gender === 'M' ? t.male : voter.gender === 'F' ? t.female : 'N/A'} • {t.ward} {voter.actualWard || (voter.partNumber ? voter.partNumber.split('/')[1] : voter.ward) || 'N/A'} • {t.booth} {voter.actualBooth || voter.booth || 'N/A'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0, flexDirection: isGridView ? 'row' : 'row', justifyContent: isGridView ? 'flex-end' : 'flex-start' }}>
                      <button
                        onClick={(e) => openEditModal(voter, e)}
                        style={{
                          width: '44px',
                          height: '44px',
                          background: '#f3f4f6',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title={t.edit}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGeneratePDF(voter);
                        }}
                        disabled={generatingPDF}
                        style={{
                          width: '44px',
                          height: '44px',
                          background: generatingPDF ? '#d1d5db' : '#ff6b35',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '16px',
                          cursor: generatingPDF ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title={t.pdf}
                      >
                        📄
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrintVoter(voter);
                        }}
                        disabled={printing}
                        style={{
                          width: '44px',
                          height: '44px',
                          background: printing ? '#d1d5db' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '16px',
                          cursor: printing ? 'not-allowed' : 'pointer',
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
                    Name
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
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="">Select</option>
                      <option value="M">{t.male}</option>
                      <option value="F">{t.female}</option>
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
                  onClick={handleSaveEdit}
                  disabled={saving || !editForm.name}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: saving ? '#cbd5e0' : '#ff6b35',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: (saving || !editForm.name) ? 'not-allowed' : 'pointer',
                    opacity: (saving || !editForm.name) ? 0.5 : 1
                  }}
                >
                  {saving ? '💾 Saving...' : '✓ Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
