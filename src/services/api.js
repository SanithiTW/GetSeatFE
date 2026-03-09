// server.js
const express = require('express');
const cors = require('cors');
const crypto = require('crypto'); // built-in Node module

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // parses JSON requests

// Test route to check server
app.get('/', (req, res) => {
    const token = crypto.randomBytes(16).toString('hex'); // example using crypto
    res.send({ message: 'Server is running!', token });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});