// server.js
const express = require('express');
const cors = require('cors'); // Required for handling cross-origin requests from your frontend
const app = express();
const port = 3000; // The port your server will listen on

// Enable CORS for all origins. This is crucial for development,
// as your HTML file (client-side) will likely be on a different origin (e.g., file:// or a different port)
// than your Node.js server. For production, consider restricting this to specific origins.
app.use(cors());

// Middleware to parse raw body for the upload test.
// 'application/octet-stream' is used for binary data transfer.
// 'limit' sets the maximum request body size (e.g., 50MB). Adjust as needed.
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));

// --- Download Test Endpoint ---
// This endpoint sends a large dummy file to the client.
// The client will measure how long it takes to download this.
app.get('/download-test', (req, res) => {
    // Get the requested size from query parameter, default to 20MB
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
// This endpoint receives data uploaded from the client.
// The client will measure how long it takes to upload data to this endpoint.
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

// Start the server and listen for incoming requests
app.listen(port, () => {
    console.log(`Speed test backend listening at http://localhost:${port}`);
});