# Voter List PDF Generator - Complete Setup Guide

## Project Structure

```
voter-pdf-generator/
├── package.json
├── .env.local
├── .gitignore
├── README.md
├── lib/
│   ├── pdfParser.js           # Parse voter PDF
│   ├── pdfGenerator.js        # Generate individual PDFs
│   └── thermalPrinter.js      # Thermal printer integration
├── pages/
│   ├── api/
│   │   ├── upload.js          # Upload PDF endpoint
│   │   ├── search.js          # Search voters endpoint
│   │   ├── generate-pdf.js    # Generate PDF endpoint
│   │   └── print.js           # Print to thermal printer endpoint
│   ├── index.js               # Homepage
│   └── search.js              # Search page
├── public/
│   └── uploads/               # Temporary uploaded PDFs
├── styles/
│   └── globals.css            # Styling
└── data/
    └── voters.json            # Cached voter data
```

## Installation Steps

### 1. Create project folder
```bash
mkdir voter-pdf-generator
cd voter-pdf-generator
```

### 2. Initialize Node project
```bash
npm init -y
```

### 3. Install dependencies
```bash
npm install next react react-dom pdfkit pdf-parse pdf2json axios dotenv multer
npm install --save-dev tailwindcss postcss autoprefixer
```

### 4. Add scripts to package.json
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

## Key Features

- **PDF Parsing**: Extract voter data from downloaded PDF
- **Individual PDFs**: Generate separate PDF for each voter with formatted details
- **Search**: Find voters by name, booth, ward
- **Print**: Direct thermal printer integration
- **Web UI**: Beautiful search and download interface
- **Vercel Ready**: Deploy with one command

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
MAX_PDF_SIZE=50000000
```

## Running the Project

### Local Development
```bash
npm run dev
# Open http://localhost:3000
```

### Build for Production
```bash
npm run build
npm run start
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## File Formats

- **Input**: Voter list PDF from mahasecvoterlist.in
- **Output**: Individual PDFs in `public/pdfs/` directory
- **Cache**: Voter data stored in `data/voters.json`
