const express = require('express');
const app = express();

app.get('/api/greet', (req, res) => {
    const name = req.query.name || 'World';
    res.send(`Hello, ${name}!`);
});

module.exports = app;
