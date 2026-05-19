const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.0';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta2/models/${GEMINI_MODEL}:generateText`;

const generateNotes = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid OCR text payload with at least 20 characters.'
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured. Add GEMINI_API_KEY to your .env file.'
      });
    }

    const prompt = `You are StudyBoost AI, an intelligent study assistant. Convert the OCR text below into a polished student-friendly study guide. Correct OCR mistakes, improve structure, add headings, bullet points, key takeaways, and exam-focused tips. Output valid JSON with the fields: title, summary, notes, keyPoints, importantConcepts, examTips. Do not include any explanation outside the JSON structure. OCR text:\n\n${text}`;

    const response = await axios.post(
      `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
      {
        prompt: { text: prompt },
        temperature: 0.2,
        maxOutputTokens: 900
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const gptResponse = response.data?.candidates?.[0]?.output || response.data?.candidates?.[0]?.content || '';
    const parsed = parseJsonFromText(gptResponse);

    const notesData = {
      title: parsed.title || 'StudyBoost AI Notes',
      summary: parsed.summary || '',
      notes: parsed.notes || '',
      keyPoints: parsed.keyPoints || '',
      importantConcepts: parsed.importantConcepts || '',
      examTips: parsed.examTips || '',
      raw: gptResponse
    };

    return res.json({ success: true, data: notesData });
  } catch (error) {
    console.error('Gemini request failed:', error?.response?.data || error.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate notes from Gemini API. Please try again later.'
    });
  }
};

function parseJsonFromText(text) {
  if (!text || typeof text !== 'string') {
    return {};
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {};
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    return {};
  }
}

module.exports = { generateNotes };
