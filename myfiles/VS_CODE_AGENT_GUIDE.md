# VS Code AI Agent Instructions - Voter PDF Generator Project

**This document contains step-by-step instructions for your VS Code AI Agent to create and test this project locally.**

---

## 📋 TASK SEQUENCE FOR YOUR VS CODE AGENT

### STEP 1: Create Project Folder Structure

Execute in terminal:
```bash
# Create main project folder
mkdir voter-pdf-generator
cd voter-pdf-generator

# Create all necessary directories
mkdir -p lib pages/api public/{uploads,pdfs,downloads} styles data

# Initialize Node.js project
npm init -y
```

---

### STEP 2: Install All Dependencies

Run this command:
```bash
npm install next react react-dom pdfkit pdf-parse pdf2json axios dotenv multer formidable

# Dev dependencies
npm install --save-dev tailwindcss postcss autoprefixer
```

**Explanation:**
- `next`: Next.js framework for React
- `pdfkit`: Generate individual PDFs
- `pdf2json`: Parse voter PDFs
- `pdf-parse`: Alternative PDF parsing
- `multer/formidable`: Handle file uploads
- `axios`: HTTP client for API calls
- `dotenv`: Environment variables

---

### STEP 3: Update package.json Scripts

Add to the `"scripts"` section:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

### STEP 4: Create Files from Provided Code

Your human has provided you with these files. Create them:

**In `lib/` folder:**
- `pdfParser.js` - Parse PDF and extract voter data
- `pdfGenerator.js` - Generate individual voter PDFs
- `thermalPrinter.js` - Thermal printer integration

**In `pages/api/` folder:**
- `upload.js` - Upload and parse PDF endpoint
- `search.js` - Search voters endpoint
- `generate-pdf.js` - Generate PDFs endpoint
- `print.js` - Thermal printer endpoint

**In root folder:**
- `package.json` - Already created
- `.env.local` - Environment configuration

---

### STEP 5: Create .env.local Configuration

Create file `.env.local` in project root with:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
MAX_PDF_SIZE=50000000
PRINTER_IP=192.168.1.100
PRINTER_PORT=9100
```

---

### STEP 6: Create .gitignore

Create `.gitignore` file:
```
node_modules/
.next/
.env.local
public/uploads/*
public/pdfs/*
public/downloads/*
data/voters.json
*.log
.DS_Store
```

---

### STEP 7: Create Home Page (pages/index.js)

```javascript
import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/upload', formData);
      setResult(response.data);
    } catch (error) {
      setResult({ error: error.response?.data?.error || 'Upload failed' });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>📋 Voter List PDF Generator</h1>
      
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0])}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Upload PDF'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
          {result.error ? (
            <p style={{ color: 'red' }}>❌ {result.error}</p>
          ) : (
            <>
              <p style={{ color: 'green' }}>✓ {result.message}</p>
              <p>Total voters: <strong>{result.voterCount}</strong></p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### STEP 8: Create Search Page (pages/search.js)

```javascript
import { useState } from 'react';
import axios from 'axios';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query || query.length < 2) return;

    setLoading(true);
    try {
      const response = await axios.get(`/api/search?q=${query}&field=name`);
      setResults(response.data);
    } catch (error) {
      setResults({ error: error.response?.data?.error || 'Search failed' });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🔍 Search Voters</h1>
      
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter voter name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '8px', width: '300px' }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results && (
        <div style={{ marginTop: '20px' }}>
          {results.error ? (
            <p style={{ color: 'red' }}>❌ {results.error}</p>
          ) : (
            <>
              <p>Found: <strong>{results.totalFound}</strong> voters</p>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Age</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Booth</th>
                  </tr>
                </thead>
                <tbody>
                  {results.data.map(voter => (
                    <tr key={voter.id}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{voter.name}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{voter.age}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{voter.booth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### STEP 9: Start Development Server

Run in terminal:
```bash
npm run dev
```

**Expected output:**
```
> next dev
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  
✓ Ready in 2.5s
```

---

### STEP 10: Test Locally

1. **Open in browser:** http://localhost:3000
2. **Download test PDF** from: `mahasecvoterlist.in`
3. **Upload the PDF** on the home page
4. **Check console** for extraction results
5. **Go to /search** to test searching

---

### STEP 11: Generate Individual PDFs

Once voters are extracted, call API:

```bash
# Generate PDFs for specific voters
curl -X POST http://localhost:3000/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "voterIds": ["VOTER_ID_1", "VOTER_ID_2"],
    "generateAll": false
  }'

# OR generate all voters
curl -X POST http://localhost:3000/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"generateAll": true}'
```

**Output:** Individual PDFs will be created in `public/pdfs/`

---

### STEP 12: Test Thermal Printer Integration

```bash
curl -X POST http://localhost:3000/api/print \
  -H "Content-Type: application/json" \
  -d '{
    "voterId": "VOTER_ID_HERE",
    "printerIP": "192.168.1.100",
    "printerPort": 9100,
    "testPrint": true
  }'
```

---

## 🚀 DEPLOY TO VERCEL

Once everything works locally:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Your app will be live at: https://your-project.vercel.app
```

---

## 📝 IMPORTANT NOTES FOR YOUR AGENT

1. **PDF Format:** Adjust `pdfParser.js` parsing logic to match your actual PDF format
   - Update the regex in `parseSingleVoterLine()` method
   - Test with actual voter PDF to verify extraction

2. **Thermal Printer Setup:**
   - Find printer IP: On thermal printer, press button for network settings
   - Default port: 9100
   - Ensure laptop and printer are on same WiFi network

3. **File Uploads:**
   - Max file size: 50MB
   - Only PDFs accepted
   - Uploaded files stored in `public/uploads/`
   - Extracted voter data cached in `data/voters.json`

4. **Error Handling:**
   - All APIs return `{ success: boolean, message: string, error?: string }`
   - Check browser console for detailed errors
   - Check terminal console for server-side logs

5. **Performance:**
   - For 1000+ voters, PDF generation may take 2-3 minutes
   - Use `generateAll: false` with specific voter IDs for testing
   - Implement progress tracking for large batches

---

## 🧪 TEST CHECKLIST

- [ ] Project created and dependencies installed
- [ ] Home page loads at http://localhost:3000
- [ ] Search page loads at http://localhost:3000/search
- [ ] PDF upload works and extracts voter data
- [ ] Search functionality returns results
- [ ] Individual PDF generation creates files in `public/pdfs/`
- [ ] API endpoints respond correctly
- [ ] Thermal printer test succeeds (if printer connected)
- [ ] Build succeeds: `npm run build`
- [ ] Deployment to Vercel is successful

---

## 🆘 TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| `Module not found` | Run `npm install` again |
| `Port 3000 already in use` | Kill process: `lsof -ti:3000 \| xargs kill -9` |
| `PDF parsing returns no voters` | Update regex in `pdfParser.js` to match PDF format |
| `Printer connection fails` | Verify printer IP and port in `.env.local` |
| `File upload size error` | Increase `MAX_PDF_SIZE` in `.env.local` |
| `Build fails on Vercel` | Check `build.log` in Vercel dashboard |

---

**Your human will monitor progress and provide feedback. Report status after each major step!**
