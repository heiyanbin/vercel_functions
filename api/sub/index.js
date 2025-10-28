const express = require('express');
const app = express();

app.get('/api/sub', async (req, res) => {
    //const url = "https://sub3.smallstrawberry.com/api/v1/client/subscribe?token=01e22a23040d1dd7b60c57ddb645213c"
    const url = "https://blogzone.me/link/Gzx1eQIbsYnc3wTY2co0SkrcgdX8oeA6x6cY05qvQzHRtr1IjNerHBH?clash=1"
    const r = await fetch(url)
    const text = await r.text()
    res.type("application/x-yaml").status(r.status).send(text)
});

module.exports = app;
