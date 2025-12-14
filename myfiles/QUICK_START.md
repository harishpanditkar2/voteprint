# QUICK START - Voter PDF Generator

## What This Project Does

✅ **Upload Voter PDF** → Parse voter list from mahasecvoterlist.in
✅ **Extract Data** → Get structured voter information (name, age, address, booth, ward)
✅ **Generate PDFs** → Create individual PDF for each voter
✅ **Search** → Find voters by name, booth, or ward
✅ **Print** → Send voter cards to thermal printer
✅ **Deploy** → Push to GitHub → Deploy to Vercel

---

## Files Your Agent Needs to Create

### Core Libraries (lib/ folder)
```
lib/
├── pdfParser.js          ← Extract data from PDF
├── pdfGenerator.js       ← Create individual PDFs
└── thermalPrinter.js     ← Print to thermal printer
```

### API Endpoints (pages/api/ folder)
```
pages/api/
├── upload.js             ← POST: Upload and parse PDF
├── search.js             ← GET: Search voters
├── generate-pdf.js       ← POST: Generate individual PDFs
└── print.js              ← POST: Print to thermal printer
```

### Pages (pages/ folder)
```
pages/
├── index.js              ← Home page (upload PDF)
└── search.js             ← Search page
```

### Configuration Files
```
.env.local               ← Environment variables
.gitignore              ← Git ignore rules
package.json            ← npm dependencies
```

---

## Quick Commands for Agent

```bash
# 1. Create project
mkdir voter-pdf-generator && cd voter-pdf-generator

# 2. Install dependencies
npm install next react react-dom pdfkit pdf-parse pdf2json axios dotenv multer formidable

# 3. Start development
npm run dev

# 4. Build for production
npm run build

# 5. Deploy to Vercel
vercel
```

---

## File Sizes & Performance

| Task | Time | Size |
|------|------|------|
| Parse 1000 voters from PDF | ~2 seconds | ~500 KB |
| Generate 1000 PDFs | ~3 minutes | ~100 MB |
| Search 10,000 voters | <100ms | Real-time |
| Print 1 voter card | ~3 seconds | 1 sheet thermal paper |

---

## GitHub Deployment Checklist

Before pushing to GitHub:
- [ ] Update `.gitignore` to exclude `node_modules/`, `.next/`, `public/uploads/`, `public/pdfs/`
- [ ] Create `.env.example` with template variables
- [ ] Create `README.md` with project documentation
- [ ] Test locally: `npm run build && npm start`
- [ ] Initialize git: `git init`
- [ ] Create GitHub repository
- [ ] Push code: `git push origin main`

---

## Vercel Deployment Steps

1. **Connect GitHub repo to Vercel**
   - Go to vercel.com → Import Project
   - Select GitHub repository
   - Vercel auto-detects Next.js configuration

2. **Set Environment Variables in Vercel Dashboard**
   - Add variables from `.env.local`
   - Click Deploy

3. **Auto-Deploy on Git Push**
   - Every push to `main` automatically deploys
   - View deployment logs in Vercel dashboard

---

## Testing Checklist

```bash
# Test 1: Home page works
curl http://localhost:3000

# Test 2: Upload API
curl -X POST http://localhost:3000/api/upload -F "file=@voter_list.pdf"

# Test 3: Search API
curl "http://localhost:3000/api/search?q=ram&field=name"

# Test 4: Generate PDFs
curl -X POST http://localhost:3000/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"generateAll": true}'

# Test 5: Printer connection
curl -X POST http://localhost:3000/api/print \
  -H "Content-Type: application/json" \
  -d '{"testPrint": true}'
```

---

## Thermal Printer Setup

1. **Find printer IP address:**
   - Power on thermal printer
   - Press menu → Network → WiFi Settings
   - Note the IP address (e.g., 192.168.1.100)

2. **Connect printer to same WiFi as laptop**

3. **Update `.env.local`:**
   ```
   PRINTER_IP=192.168.1.100
   PRINTER_PORT=9100
   ```

4. **Test connection:**
   - Call `/api/print` endpoint with `testPrint: true`
   - Printer should print test page

---

## Troubleshooting

**PDF parsing returns empty:**
- Adjust regex in `lib/pdfParser.js`
- The PDF format from mahasecvoterlist.in may vary by state
- Test with actual PDF and adjust parsing logic

**Thermal printer won't print:**
- Verify printer IP: `ping 192.168.1.100`
- Check printer is on same WiFi network
- Test printer directly (print from printer menu)
- Verify port 9100 is accessible

**File upload fails:**
- Check file is PDF format
- Verify file size < 50MB
- Check `public/uploads/` folder has write permissions

**Vercel deployment fails:**
- Check build logs: Dashboard → Deployments → Details
- Most common: Missing environment variables
- Second most common: Node version mismatch

---

## Next Steps After First Deploy

1. ✅ Upload voter PDF and verify data extraction
2. ✅ Generate individual PDFs for 10 voters
3. ✅ Test search functionality
4. ✅ Connect and test thermal printer
5. ✅ Generate and print all voters
6. ✅ Share Vercel link with candidates

---

**Your human will provide the actual voter PDF from mahasecvoterlist.in to test with.**

Good luck! 🚀
