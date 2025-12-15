import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function SerialCorrection() {
  const [voters, setVoters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [corrections, setCorrections] = useState({});

  useEffect(() => {
    loadVoters();
  }, []);

  const loadVoters = async () => {
    try {
      const res = await fetch('/data/voters.json');
      const data = await res.json();
      const ward7 = data.filter(v => v.actualWard === '7' || v.expectedWard === '7');
      setVoters(ward7);
      setLoading(false);
    } catch (err) {
      console.error('Error loading voters:', err);
      setLoading(false);
    }
  };

  const pageVoters = voters
    .filter(v => v.pageNumber === currentPage)
    .sort((a,b) => parseInt(a.serialNumber || 0) - parseInt(b.serialNumber || 0));

  const handleSerialChange = (voterId, newSerial) => {
    setCorrections(prev => ({
      ...prev,
      [voterId]: newSerial
    }));
  };

  const saveCorrections = async () => {
    setSaving(true);
    
    const updates = Object.entries(corrections).map(([voterId, newSerial]) => ({
      voterId,
      serialNumber: newSerial,
      uniqueSerial: `W7F1-S${newSerial}` // Adjust file ref as needed
    }));

    try {
      const res = await fetch('/api/bulk-update-serials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      if (res.ok) {
        alert('Saved successfully!');
        setCorrections({});
        loadVoters();
      } else {
        alert('Error saving');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
    
    setSaving(false);
  };

  const pages = [...new Set(voters.map(v => v.pageNumber))].sort((a,b) => a-b);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <>
      <Head>
        <title>Serial Number Correction - Ward 7</title>
      </Head>

      <div style={{ padding: 20, fontFamily: 'system-ui' }}>
        <h1>Ward 7 Serial Number Correction</h1>
        
        <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {pages.map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                padding: '8px 16px',
                background: page === currentPage ? '#ff6b35' : '#f0f0f0',
                color: page === currentPage ? 'white' : 'black',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Page {page}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <strong>Page {currentPage}</strong> - {pageVoters.length} voters
          {Object.keys(corrections).length > 0 && (
            <button
              onClick={saveCorrections}
              disabled={saving}
              style={{
                marginLeft: 20,
                padding: '10px 20px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              {saving ? 'Saving...' : `Save ${Object.keys(corrections).length} Changes`}
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {pageVoters.map((voter, index) => (
            <div key={voter.id || index} style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 15,
              background: corrections[voter.voterId] ? '#fff9e6' : 'white'
            }}>
              {voter.cardImage && (
                <img
                  src={voter.cardImage}
                  alt="Voter card"
                  style={{ width: '100%', height: 200, objectFit: 'cover', marginBottom: 10, borderRadius: 4 }}
                />
              )}

              <div style={{ marginBottom: 10 }}>
                <strong>Current Serial:</strong> {voter.uniqueSerial || voter.serialNumber}
              </div>

              <div style={{ marginBottom: 10 }}>
                <strong>Voter ID:</strong> {voter.voterId || 'N/A'}
              </div>

              <div style={{ marginBottom: 10 }}>
                <strong>Name:</strong> {voter.name || '(blank)'}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 5 }}>
                  <strong>Correct Serial:</strong>
                </label>
                <input
                  type="number"
                  value={corrections[voter.voterId] || voter.serialNumber || ''}
                  onChange={(e) => handleSerialChange(voter.voterId, e.target.value)}
                  style={{
                    width: '100%',
                    padding: 8,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: 16
                  }}
                  placeholder="Enter correct serial"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
