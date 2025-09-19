const express = require('express');
const { default: fetch } = require('node-fetch');
const pako = require('pako');

const app = express();

app.use(express.text());

app.post('/api/mmd2svg', async (req, res) => {
    try {
        const mermaidText = req.body;
        if (!mermaidText) {
            return res.status(400).send('Mermaid text is required');
        }

        // Compress and encode mermaid text to URL-safe base64
        const data = Buffer.from(mermaidText, 'utf8');
        const compressed = pako.deflate(data, { level: 9 });
        const base64Mermaid = Buffer.from(compressed)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');

        const krokiUrl = `https://kroki.io/mermaid/svg/${base64Mermaid}`;

        const response = await fetch(krokiUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Kroki API error: ${response.status} - ${errorText}`);
            return res.status(response.status).send(`Kroki API error: ${errorText}`);
        }

        const svg = await response.text();

        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svg);

    } catch (e) {
        console.error('Server error:', e);
        res.status(500).send('Failed to convert mermaid to svg');
    }
});

module.exports = app;