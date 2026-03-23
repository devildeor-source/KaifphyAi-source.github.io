const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let knowledgeBase = ""; // This is the AI's "memory"

// 1. UPLOAD & LEARN
const upload = multer({ dest: 'uploads/' });
app.post('/upload', upload.single('file'), (req, res) => {
    const dataBuffer = fs.readFileSync(req.file.path);
    pdf(dataBuffer).then(data => {
        knowledgeBase += data.text; // AI "learns" the PDF content
        fs.unlinkSync(req.file.path);
        res.json({ message: "Knowledge added to AI brain." });
    });
});

// 2. THE AI CHAT (The Brain)
app.post('/chat', (req, res) => {
    const userQuestion = req.body.message.toLowerCase();
    
    // This is a simple logic "brain" - you can later connect 
    // an API key here for full GPT-style reasoning.
    if (knowledgeBase.includes(userQuestion)) {
        res.json({ reply: "I found information related to that in your files..." });
    } else {
        res.json({ reply: "I don't have that in my memory yet. Please upload a physics PDF." });
    }
});

app.listen(process.env.PORT || 3000);
