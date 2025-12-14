# Voter PDF Generator

A complete Next.js application for parsing voter list PDFs, generating individual voter cards, and printing to thermal printers.

## Features

✅ Upload & parse voter PDF from mahasecvoterlist.in
✅ Extract structured voter data (name, age, address, booth, ward)
✅ Search voters by name, booth, or ward
✅ Generate individual PDFs for each voter
✅ Thermal printer integration (80mm thermal paper)
✅ Web-based UI for easy access
✅ Production-ready for deployment

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Usage Workflow

1. **Upload PDF** - Go to home page and upload voter list PDF
2. **Search Voters** - Navigate to search page, search by name/booth/ward
3. **Generate PDFs** - Select voters and generate individual PDFs
4. **Print** - Connect thermal printer and print voter cards

## Project Structure

```
voter/
├── lib/
│   ├── pdfParser.js          # Parse voter PDFs
│   ├── pdfGenerator.js       # Generate individual PDFs
│   └── thermalPrinter.js     # Thermal printer integration
├── pages/
│   ├── api/
│   │   ├── upload.js         # Upload & parse endpoint
│   │   ├── search.js         # Search voters endpoint
│   │   ├── generate-pdf.js   # Generate PDFs endpoint
│   │   └── print.js          # Print endpoint
│   ├── index.js              # Home page (upload)
│   └── search.js             # Search page
├── public/
│   ├── uploads/              # Uploaded PDFs (temporary)
│   ├── pdfs/                 # Generated voter PDFs
│   └── downloads/            # ZIP archives
├── data/
│   └── voters.json           # Cached voter data
└── package.json
```

## API Endpoints

### POST /api/upload
Upload and parse voter PDF
- **Body:** `multipart/form-data` with `file` field
- **Response:** `{ success: true, voterCount: 1234, voters: [...] }`

### GET /api/search
Search voters
- **Query params:** `q` (query), `field` (name/booth/ward), `limit` (50)
- **Response:** `{ success: true, data: [...] }`

### POST /api/generate-pdf
Generate individual PDFs
- **Body:** `{ voterIds: [...] }` or `{ generateAll: true }`
- **Response:** `{ success: true, generated: 50, pdfs: [...] }`

### POST /api/print
Print to thermal printer
- **Body:** `{ voterId: "VOTER_123", printerIP: "192.168.1.100" }`
- **Response:** `{ success: true, message: "Printed successfully" }`

## Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
MAX_PDF_SIZE=50000000
PRINTER_IP=192.168.1.100
PRINTER_PORT=9100
```

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Deploy to Other Platforms

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Configuration

### PDF Parser Configuration

Edit `lib/pdfParser.js` to adjust parsing logic based on your PDF format. The current implementation uses pipe-delimited format.

### Thermal Printer Configuration

Edit `lib/thermalPrinter.js` to customize:
- ESC/POS commands
- Paper width (default: 80mm)
- Print layout

## Troubleshooting

### PDF Parsing Issues
- Verify PDF format matches expected structure
- Adjust regex in `parseSingleVoterLine()` method
- Check console logs for parsing errors

### Thermal Printer Connection
- Ensure printer is on same network
- Verify IP address and port
- Test connection using `/api/print` with `testPrint: true`

### File Upload Errors
- Check file size limits (default: 50MB)
- Ensure `public/uploads` directory has write permissions

## Use Cases

Perfect for:
- Electoral candidates needing voter cards
- Political campaigns (Matdan Prachar)
- Voter registration drives
- Booth-level voter management
- Ward-wise voter analysis

## Tech Stack

- **Frontend:** Next.js, React
- **Backend:** Node.js, Next.js API Routes
- **PDF Generation:** PDFKit
- **PDF Parsing:** pdf2json, pdf-parse
- **File Upload:** Formidable
- **Thermal Printing:** ESC/POS commands via TCP/IP

## License

ISC

## Support

For issues or questions, check the documentation files:
- `PROJECT_SETUP.md` - Detailed setup guide
- `VS_CODE_AGENT_GUIDE.md` - Step-by-step instructions
- `QUICK_START.md` - Quick reference

---

**Built for electoral campaigns and voter management** 🗳️
