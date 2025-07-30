// api/index.js
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all origins. For production, consider restricting this to specific origins.
app.use(cors());

// Middleware to parse raw body for the upload test.
// 'application/octet-stream' is used for binary data transfer.
// 'limit' sets the maximum request body size.
// Vercel's Hobby plan has a default payload limit of 4.5MB.
// If your UPLOAD_FILE_SIZE_MB in the client is 50MB, you will need to:
// 1. Upgrade your Vercel plan to Pro or Enterprise.
// 2. Configure the maxDuration and memory for your serverless function in vercel.json.
//    Example vercel.json (at the root of your project):
//    {
//      "functions": {
//        "api/**/*.js": {
//          "maxDuration": 60, // 60 seconds
//          "memory": 1024 // 1GB
//        }
//      }
//    }
// For testing on Vercel's Hobby plan, consider reducing UPLOAD_FILE_SIZE_MB in your client-side
// HTML to something like 4 (for 4MB) to fit within the default limits.
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' })); // Set limit based on your client's UPLOAD_FILE_SIZE_MB

// --- Download Test Endpoint ---
app.get('/download-test', (req, res) => {
    const sizeMB = parseInt(req.query.size) || 20;
    const sizeBytes = sizeMB * 1024 * 1024; // Convert MB to Bytes

    // Create a Buffer filled with dummy data.
    // Using Buffer.alloc is efficient for creating large binary data.
    const dummyData = Buffer.alloc(sizeBytes, '0');

    // Set response headers to ensure proper download and prevent caching
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', sizeBytes);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send the dummy data as the response
    res.send(dummyData);
    console.log(`Sent ${sizeMB}MB for download test.`);
});

// --- Upload Test Endpoint ---
app.post('/upload-test', (req, res) => {
    // The `express.raw` middleware has already parsed the incoming binary data
    // and made it available in `req.body`. We just need to acknowledge receipt.
    if (req.body) {
        console.log(`Received ${req.body.length / (1024 * 1024)}MB for upload test.`);
    } else {
        console.log('Received empty body for upload test.');
    }
    // Send a success status back to the client
    res.status(200).send('Upload received successfully');
});

// Export the app for Vercel to use as a serverless function
module.exports = app;
