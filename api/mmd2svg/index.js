const express = require('express');
const pako = require('pako');

const app = express();

app.use(express.text());

app.post('/api/mmd2svg', async (req, res) => {
    try {
        const mermaidText = req.body;
        if (!mermaidText) {
            return res.status(400).send('Mermaid text is required');
        }

        const outputFormat = req.query.output_format.trim();

        // Compress and encode mermaid text to URL-safe base64
        const data = Buffer.from(mermaidText, 'utf8');
        const compressed = pako.deflate(data, { level: 9 });
        const base64Mermaid = Buffer.from(compressed)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');

        const krokiUrl = `https://kroki.io/mermaid/${outputFormat}/${base64Mermaid}`;

        const response = await fetch(krokiUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Kroki API error: ${response.status} - ${errorText}`);
            return res.status(response.status).send(`Kroki API error: ${errorText}`);
        }

        const output = await response.buffer(); // Get buffer for both SVG and PNG

        if (outputFormat === 'png') {
            res.setHeader('Content-Type', 'image/png');
        } else {
            res.setHeader('Content-Type', 'image/svg+xml');
        }
        res.send(output);

    } catch (e) {
        console.error('Server error:', e);
        res.status(500).send('Failed to convert mermaid to svg');
    }
});

module.exports = app;