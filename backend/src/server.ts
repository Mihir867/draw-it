import express, { Request, Response } from 'express';
import fs from 'fs';
import fetch from 'node-fetch';
import multer from 'multer';
import cors from 'cors';

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = 3002;

// Enable CORS for all routes
app.use(cors());

// Extend the Request interface to include the `file` property
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

app.post('/upload', upload.single('file'), async (req: MulterRequest, res: Response) => {
    const filename = req.file?.path;

    if (!filename) {
        return res.status(400).send('No file uploaded');
    }

    try {
        const result = await query(filename);
        res.json(result);
    } catch (error) {
        console.error('Error processing the image:', error);
        res.status(500).send('Error processing the image');
    }
});

async function query(filename: string): Promise<any> {
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

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
