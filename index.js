const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// 1. Middleware Setup
app.use(cors());
app.use(express.json());
// This line makes your HTML, CSS, and JS files accessible
app.use(express.static(path.join(__dirname)));

// 2. Ensure 'uploads' directory exists for Render
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 3. Multer Configuration for PDF uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// 4. ROUTES

// Serves your index.html file when you visit the main URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// PDF Upload and AI Processing Route
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);

    pdf(dataBuffer).then(function(data) {
        // Clean up: delete file after parsing to save Render space
        fs.unlinkSync(filePath);
        
        res.json({
            message: "File uploaded and parsed",
            text: data.text
        });
    }).catch(err => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ error: "PDF Parse Error: " + err.message });
    });
});

// View Searches Route (from your video)
let searchLogs = [];
app.get('/searches', (req, res) => {
    res.json(searchLogs);
});

// 5. Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

