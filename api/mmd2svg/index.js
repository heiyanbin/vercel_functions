
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const app = express();

app.use(express.text());

app.post('/api/mmd2svg', async (req, res) => {
    try {
        const mermaidText = req.body;
        if (!mermaidText) {
            return res.status(400).send('Mermaid text is required');
        }

        const inputFilePath = path.join('/tmp', `input-${Date.now()}.mmd`);
        const outputFilePath = path.join('/tmp', `output-${Date.now()}.svg`);

        await fs.writeFile(inputFilePath, mermaidText);

        const command = `mmdc -i ${inputFilePath} -o ${outputFilePath}`;

        exec(command, async (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                console.error(`stderr: ${stderr}`);
                await fs.unlink(inputFilePath);
                if (fs.existsSync(outputFilePath)) {
                    await fs.unlink(outputFilePath);
                }
                return res.status(500).send(`Failed to convert mermaid to svg: ${stderr}`);
            }

            try {
                const svg = await fs.readFile(outputFilePath, 'utf8');
                res.setHeader('Content-Type', 'image/svg+xml');
                res.send(svg);
            } catch (readError) {
                console.error('Error reading SVG file:', readError);
                return res.status(500).send('Failed to read generated SVG');
            } finally {
                await fs.unlink(inputFilePath);
                await fs.unlink(outputFilePath);
            }
        });

    } catch (e) {
        console.error('Server error:', e);
        res.status(500).send('Failed to convert mermaid to svg');
    }
});

module.exports = app;

