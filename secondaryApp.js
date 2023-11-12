const express = require('express');
const app = express();
const port = 3002; // Ensure this port is different from your main app

app.use(express.json());

app.all('*', (req, res) => {
    res.send({
        message: 'This is the secondary app response',
        originalBody: req.body,
        originalQuery: req.query,
        originalParams: req.params
    });
});

app.listen(port, () => {
    console.log(`Secondary app listening at http://localhost:${port}`);
});

