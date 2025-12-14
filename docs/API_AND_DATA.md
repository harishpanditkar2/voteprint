# API & Data Structure

## API Endpoints

### `/api/update-voter.js`
- **Method**: POST
- **Purpose**: Update a voter's data after manual edit/verification
- **Request Body**:
  - `voterId` (required)
  - Any fields to update: name, age, gender, fatherName, relativeDetail, houseNumber, address
- **Response**:
  - `{ success: true, message: 'Voter updated successfully', voter: { ...updatedVoter } }`
- **Behavior**:
  - Updates both `data/voters.json` and `public/data/voters.json`
  - Adds `updatedAt` and `manuallyEdited` fields

## Data Structure: `voters.json`
Each voter object contains:
- `serialNumber`: string
- `voterId`: string
- `partNumber`: string
- `pageNumber`: number
- `name`: string
- `age`: string
- `gender`: 'M' | 'F' | ''
- `fatherName`: string
- `relativeDetail`: 'Father' | 'Husband' | ''
- `houseNumber`: string
- `address`: string
- `ward`: string
- `booth`: string
- `cardImage`: string (relative path to cropped image)
- `manuallyEdited`: boolean
- `updatedAt`: ISO string
- `source`: string
- `nameStatus`: string
- `dataQuality`: object
- `id`: string
- `createdAt`: ISO string

## Notes
- All edits are tracked for audit.
- Data is always kept in sync between `/data` and `/public/data`.
- Images are stored in `/public/voter-cards/`.

---

See `/pages/api/update-voter.js` and `/data/voters.json` for details.
