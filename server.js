const express = require('express');
const fs = require('fs');
const fetch = require('node-fetch');
const multer = require('multer');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT=3002;

// Enable CORS for all routes
app.use(cors());

app.post('/upload', upload.single('file'), async (req, res) => {
    const filename = req.file.path;

    try {
        const result = await query(filename);
        res.json(result);
    } catch (error) {
        console.error('Error processing the image:', error);
        res.status(500).send('Error processing the image');
    }
});

async function query(filename) {
    const data = fs.readFileSync(filename);
    const response = await fetch(
        "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
        {
            headers: {
                Authorization: "Bearer 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",
                "Content-Type": "application/json",
            },
            method: "POST",
            body: data,
        }
    );

    const result = await response.json();
    return result;
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});