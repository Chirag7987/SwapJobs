const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/parse', upload.single('resume'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    
    let text = '';
    
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const parsed = await pdfParse(dataBuffer);
      text = parsed.text;
    } else {
      return res.status(400).json({ success: false, error: 'Unsupported format. Only PDF supported in this version.' });
    }

    fs.unlinkSync(filePath); // Clean up uploaded file

    const parsedData = await parseWithOpenAI(text);

    return res.json({
      success: true,
      data: parsedData,
      confidence: 0.95,
      warnings: ['Parsed using AI. Please verify for accuracy.']
    });
  } catch (error) {
    console.error('Error parsing resume:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while parsing resume.',
      confidence: 0,
      warnings: []
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

async function parseWithOpenAI(text) {
  const prompt = `
You are a resume parser. Extract structured information from the resume text below and return it as a JSON object with this schema:

{
  personalInfo: {
    fullName: string,
    email: string,
    phone: string,
    location: string,
    website: string,
    linkedin: string
  },
  professionalSummary: string,
  workExperience: [{
    id: string,
    company: string,
    position: string,
    startDate: string (YYYY-MM),
    endDate: string (YYYY-MM or empty if current),
    current: boolean,
    location: string,
    responsibilities: [string]
  }],
  education: [{
    id: string,
    institution: string,
    degree: string,
    field: string,
    graduationYear: number,
    gpa: string,
    achievements: [string]
  }],
  skills: [{
    id: string,
    name: string,
    category: "technical" | "soft",
    level: "Beginner" | "Intermediate" | "Advanced" | "Expert"
  }],
  certifications: [{
    id: string,
    name: string,
    issuer: string,
    issueDate: string (YYYY-MM),
    expiryDate: string (YYYY-MM or empty),
    credentialId: string
  }],
  languages: [{
    id: string,
    name: string,
    proficiency: "Native" | "Fluent" | "Conversational" | "Basic"
  }]
}

Resume text:
"""\n${text}\n"""
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are an expert resume parser.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 2000
  });

  const responseText = completion.choices[0].message.content;

  try {
    const json = JSON.parse(responseText);
    return json;
  } catch (err) {
    console.error('Failed to parse JSON from OpenAI response:', responseText);
    throw new Error('OpenAI returned invalid JSON.');
  }
}

