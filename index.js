 const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// 1. Middleware
app.use(cors());
app.use(express.json());
// This line tells Express to serve your HTML, CSS, and JS files 
// from the main folder so you don't get "Cannot GET /"
app.use(express.static(path.join(__dirname)));

// 2. Ensure 'uploads' directory exists (Render needs this)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 3. Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// 4. Routes

// Serve the homepage (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// PDF Upload and Parse Route
app.post('/upload', upload.single('pdfFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);

    pdf(dataBuffer).then(function(data) {
        // Delete the file after parsing to keep the Render disk clean
        fs.unlinkSync(filePath);
        
        res.json({
            success: true,
            text: data.text,
            info: data.info
        });
    }).catch(err => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ error: "Error parsing PDF: " + err.message });
    });
});

// 5. Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
