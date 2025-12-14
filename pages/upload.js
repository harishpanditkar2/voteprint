import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)' }}>
      <Head>
        <title>Upload Voter PDF - Voter PDF Generator</title>
        <meta name="description" content="Upload and parse voter list PDFs" />
      </Head>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '900', 
            color: 'white',
            marginBottom: '10px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            🗳️ Upload Voter PDF
          </h1>
          <p style={{ 
            fontSize: '16px',
            color: 'rgba(255,255,255,0.95)',
            fontWeight: '500'
          }}>
            Upload voter list PDF from mahasecvoterlist.in
          </p>
        </div>

        {/* Upload Form Card */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px', 
          padding: '32px', 
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          marginBottom: '20px'
        }}>
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                fontWeight: '700',
                fontSize: '16px',
                color: '#2d3748'
              }}>
                Select PDF File
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '16px',
                  border: '3px dashed #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.borderColor = '#ff6b35'}
                onMouseOut={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              <p style={{ 
                fontSize: '12px', 
                color: '#718096', 
                marginTop: '8px',
                fontStyle: 'italic'
              }}>
                Filename format: BoothVoterList_A4_Ward_7_Booth_1.pdf
              </p>
            </div>

            {file && (
              <div style={{ 
                marginBottom: '24px', 
                padding: '16px', 
                background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                borderRadius: '12px',
                color: 'white'
              }}>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>
                  ✅ Selected: {file.name}
                </p>
                <p style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>
                  Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || uploading}
              style={{
                width: '100%',
                padding: '16px',
                background: uploading ? '#cbd5e0' : 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '800',
                cursor: uploading ? 'not-allowed' : 'pointer',
                boxShadow: uploading ? 'none' : '0 4px 15px rgba(255, 107, 53, 0.4)',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
              onMouseOver={(e) => !uploading && (e.target.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => !uploading && (e.target.style.transform = 'translateY(0)')}
            >
              {uploading ? '⏳ Uploading & Parsing...' : '📤 Upload & Parse PDF'}
            </button>
          </form>

          {error && (
            <div style={{ 
              marginTop: '24px', 
              padding: '16px', 
              backgroundColor: '#fed7d7', 
              borderRadius: '12px', 
              color: '#c53030',
              borderLeft: '4px solid #e53e3e'
            }}>
              <strong>❌ Error:</strong> {error}
            </div>
          )}

          {result && (
            <div style={{ 
              marginTop: '24px', 
              padding: '20px', 
              background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '800', 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ✅ Upload Successful!
              </h3>
              <p style={{ fontSize: '16px', marginBottom: '16px', fontWeight: '600' }}>
                📊 Voters Extracted: {result.voterCount}
              </p>
              
              <p style={{ fontSize: '14px', marginBottom: '20px', opacity: 0.95 }}>
                Voter data has been cached. You can now search voters.
              </p>
              
              <Link href="/search" style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#38a169',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '16px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                🔍 Search Voters →
              </Link>

              {result.voters && result.voters.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    marginBottom: '10px',
                    opacity: 0.9
                  }}>
                    Preview (First 10 voters):
                  </h4>
                  <div style={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto', 
                    fontSize: '11px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    padding: '12px'
                  }}>
                    <pre style={{ 
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {JSON.stringify(result.voters, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Back to Search Link */}
        <div style={{ textAlign: 'center' }}>
          <Link href="/search" style={{ 
            color: 'white', 
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'inline-block',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          >
            ← Back to Search
          </Link>
        </div>
      </main>
    </div>
  );
}
