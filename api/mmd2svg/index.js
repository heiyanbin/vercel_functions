
const express = require('express');
const https = require('https');

const app = express();

app.use(express.text());

app.post('/api/mmd2svg', (req, res) => {
    const mermaidText = req.body;
    if (!mermaidText) {
        return res.status(400).send('Mermaid text is required');
    }

    const encodedMermaid = Buffer.from(mermaidText).toString('base64url');

    const options = {
        hostname: 'mermaid.ink',
        path: `/svg/${encodedMermaid}`,
        method: 'GET'
    };

    const proxyReq = https.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (e) => {
        console.error(e);
        res.status(500).send('Failed to convert mermaid to svg');
    });

    proxyReq.end();
});

module.exports = app;
