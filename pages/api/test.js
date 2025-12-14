// pages/api/test.js
// Test endpoint to verify API is working

export default async function handler(req, res) {
  return res.status(200).json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
  });
}
