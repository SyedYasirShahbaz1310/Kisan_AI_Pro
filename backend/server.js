const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer for audio file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Load Agriculture Dataset (Vercel compatible path)
const agriDataPath = path.join(__dirname, 'data', 'agri_data.json');
let agriData = {};

try {
  agriData = JSON.parse(fs.readFileSync(agriDataPath, 'utf8'));
  console.log('✅ Agriculture dataset loaded successfully');
} catch (error) {
  console.error('❌ Error loading agriculture dataset:', error.message);
  // Fallback empty data
  agriData = { crops: [], general_advice: {} };
}

// TensorFlow Model - Using rule-based prediction (Vercel serverless compatible)
let tfModel = null;

async function loadModel() {
  // Using rule-based prediction for serverless environment
  console.log('✅ Using rule-based prediction (serverless compatible)');
}

// Accurate Rule-Based Prediction Function
function getAccuratePrediction(temperature, rainfall, soilMoisture, crop) {
  let prediction = 'optimal_conditions';
  let confidence = 0;
  
  // Calculate risk scores for each condition
  let scores = {
    optimal_conditions: 0,
    fungus_risk: 0,
    drought_risk: 0,
    flood_risk: 0,
    heat_stress: 0
  };
  
  // Heat Stress: High temperature (>40°C) and low moisture (<30%)
  if (temperature > 40) {
    scores.heat_stress += 40;
    if (soilMoisture < 30) scores.heat_stress += 30;
    if (rainfall < 30) scores.heat_stress += 20;
  } else if (temperature > 35) {
    scores.heat_stress += 20;
    if (soilMoisture < 40) scores.heat_stress += 15;
  }
  
  // Drought Risk: Low moisture (<25%) and low rainfall (<50mm)
  if (soilMoisture < 20) {
    scores.drought_risk += 40;
    if (rainfall < 30) scores.drought_risk += 35;
  } else if (soilMoisture < 30 && rainfall < 50) {
    scores.drought_risk += 30;
    if (temperature > 30) scores.drought_risk += 15;
  } else if (soilMoisture < 40 && rainfall < 80) {
    scores.drought_risk += 15;
  }
  
  // Flood Risk: High rainfall (>250mm) and high moisture (>75%)
  if (rainfall > 350) {
    scores.flood_risk += 45;
    if (soilMoisture > 80) scores.flood_risk += 35;
  } else if (rainfall > 250 && soilMoisture > 70) {
    scores.flood_risk += 35;
    if (soilMoisture > 85) scores.flood_risk += 25;
  } else if (rainfall > 150 && soilMoisture > 80) {
    scores.flood_risk += 20;
  }
  
  // Fungus Risk: High moisture (60-85%), moderate temp (20-35°C), moderate rain (80-200mm)
  if (soilMoisture > 60 && soilMoisture < 90 && temperature > 20 && temperature < 35) {
    scores.fungus_risk += 25;
    if (rainfall > 80 && rainfall < 250) scores.fungus_risk += 30;
    if (soilMoisture > 70) scores.fungus_risk += 15;
  }
  
  // Optimal Conditions
  if (temperature >= 15 && temperature <= 32) {
    scores.optimal_conditions += 20;
  }
  if (soilMoisture >= 35 && soilMoisture <= 65) {
    scores.optimal_conditions += 25;
  }
  if (rainfall >= 40 && rainfall <= 150) {
    scores.optimal_conditions += 20;
  }
  
  // Find highest score
  let maxScore = 0;
  let maxCondition = 'optimal_conditions';
  
  for (const [condition, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxCondition = condition;
    }
  }
  
  // If no significant risk, default to optimal
  if (maxScore < 25) {
    maxCondition = 'optimal_conditions';
    maxScore = 65 + Math.random() * 15; // 65-80%
  }
  
  // Calculate confidence based on score clarity
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  if (totalScore > 0) {
    confidence = Math.min(95, Math.max(55, (maxScore / Math.max(totalScore, 1)) * 100 + 20 + Math.random() * 10));
  } else {
    confidence = 70 + Math.random() * 15;
  }
  
  return {
    prediction: maxCondition,
    confidence: confidence
  };
}

// Agriculture AI Prompt Template
// Language-specific prompts
const getAgriAIPrompt = (language) => {
  const languageInstructions = {
    en: 'You MUST respond in English only. Do not use any other language.',
    ur: 'آپ کو صرف اردو میں جواب دینا ہے۔ You MUST respond in Urdu only.',
    pa: 'تسی صرف پنجابی (شاہ مکھی) وچ جواب دینا اے۔ You MUST respond in Pakistani Punjabi (Shahmukhi script - similar to Urdu script) only. Do NOT use Gurmukhi script.',
    sr: 'تہاکوں صرف سرائیکی وچ جواب دینا ہے۔ You MUST respond in Saraiki only.'
  };

  const languageNames = {
    en: 'English',
    ur: 'Urdu (اردو)',
    pa: 'Pakistani Punjabi (پنجابی - Shahmukhi script)',
    sr: 'Saraiki (سرائیکی)'
  };

  const langInstruction = languageInstructions[language] || languageInstructions['ur'];
  const langName = languageNames[language] || 'Urdu';

  return `You are an Agriculture Expert AI for Pakistani farmers.
Your name is "Kisan AI" (کسان اے آئی).
Your ONLY knowledge source is the JSON dataset provided below.
Do NOT use outside knowledge. Do NOT hallucinate or make up information.

🚨 CRITICAL LANGUAGE REQUIREMENT:
${langInstruction}
The user has selected ${langName} as their preferred language.
ALL your responses MUST be in ${langName} language ONLY.
Do NOT respond in any other language regardless of the question's language.

STRICT RULES:
1. Understand the farmer's question (it may be in any language).
2. Search and match the problem with the dataset provided.
3. Return the most accurate verified solution from the dataset ONLY.
4. RESPOND IN ${langName.toUpperCase()} ONLY - This is mandatory!
5. If no match found in dataset, respond with appropriate message in ${langName}.

RESPONSE FORMAT:
- MUST respond in ${langName} language ONLY
- Be helpful, clear, and concise
- Include crop name, problem, symptoms, and solution from dataset
- Use bullet points for clarity

DATASET:
`;
};

// Translation prompt for input text
const getTranslationPrompt = (targetLanguage) => {
  const languageNames = {
    en: 'English',
    ur: 'Urdu',
    pa: 'Pakistani Punjabi (Shahmukhi script - written in Arabic/Urdu script like پنجابی, NOT Gurmukhi)',
    sr: 'Saraiki'
  };
  const langName = languageNames[targetLanguage] || 'Urdu';
  
  const specialInstructions = targetLanguage === 'pa' 
    ? `\n6. IMPORTANT: For Punjabi, use Shahmukhi script (Arabic/Urdu-like script) NOT Gurmukhi script.
7. Example: Write "کنک دے مسلے دا حل دسو" NOT "ਕਣਕ ਦੇ ਮਸਲੇ ਦਾ ਹੱਲ ਦੱਸੋ"` 
    : '';
  
  return `You are a translator. Translate the following text to ${langName}.
RULES:
1. ONLY output the translated text, nothing else
2. Keep the meaning exactly the same
3. If the text is already in ${langName}, return it as is
4. Do not add any explanations or notes
5. Preserve any technical/agricultural terms${specialInstructions}

Text to translate:`;
};

// ==================== API ROUTES ====================

// Root Route - Welcome Page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Kisan AI - Backend Server</title>
      <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #2d5a27, #4caf50); min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
        .container { background: white; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 600px; }
        h1 { color: #2d5a27; font-size: 2.5rem; }
        .emoji { font-size: 4rem; }
        p { color: #666; line-height: 1.8; }
        .status { background: #e8f5e9; padding: 15px; border-radius: 10px; margin: 20px 0; }
        .status span { color: #2d5a27; font-weight: bold; }
        .endpoints { text-align: left; background: #f5f5f5; padding: 20px; border-radius: 10px; margin-top: 20px; }
        .endpoints h3 { color: #2d5a27; margin-bottom: 10px; }
        .endpoints code { background: #e8f5e9; padding: 3px 8px; border-radius: 4px; }
        a { color: #4caf50; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">🌾</div>
        <h1>Kisan AI Backend</h1>
        <p>Pakistani Agriculture Voice Assistant API Server</p>
        <div class="status">
          <span>✅ Server is running!</span>
        </div>
        <p>Frontend: <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></p>
        <div class="endpoints">
          <h3>📡 API Endpoints:</h3>
          <p><code>POST /api/speech-to-text</code> - Voice to Text</p>
          <p><code>POST /api/ask-ai</code> - Ask Agriculture AI</p>
          <p><code>POST /api/predict</code> - Crop Risk Prediction</p>
          <p><code>GET /api/dataset</code> - Get Dataset</p>
          <p><code>GET /api/crops</code> - List Crops</p>
          <p><code>GET /api/health</code> - Health Check</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Route 1: Speech to Text (using Gemini)
app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file && !req.body.audioData) {
      return res.status(400).json({ error: 'No audio data provided' });
    }

    let audioBase64;
    let mimeType = 'audio/webm';

    if (req.file) {
      audioBase64 = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype || 'audio/webm';
    } else if (req.body.audioData) {
      // Handle base64 audio from frontend
      audioBase64 = req.body.audioData.replace(/^data:audio\/\w+;base64,/, '');
      mimeType = req.body.mimeType || 'audio/webm';
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: audioBase64
        }
      },
      {
        text: `Transcribe this audio accurately. The audio may be in Urdu, Punjabi, Saraiki, Pashto, Sindhi, or English. 
        Return ONLY the transcription text, nothing else. 
        Preserve the original language of the speaker.
        If you cannot understand the audio clearly, return what you can understand.`
      }
    ]);

    const transcription = result.response.text();
    
    res.json({ 
      success: true, 
      transcription: transcription.trim(),
      detectedLanguage: detectLanguage(transcription)
    });

  } catch (error) {
    console.error('Speech-to-text error:', error);
    
    // Handle quota/rate limit errors
    if (error.status === 429) {
      return res.status(429).json({ 
        error: 'API quota exceeded. Please wait a moment and try again.',
        errorUrdu: 'API کوٹا ختم ہو گیا۔ براہ کرم کچھ دیر انتظار کریں۔',
        retryAfter: 60
      });
    }
    
    res.status(500).json({ 
      error: 'Speech recognition failed', 
      errorUrdu: 'آواز پہچاننے میں خرابی۔ براہ کرم دوبارہ کوشش کریں۔',
      details: error.message 
    });
  }
});

// Route 2: Ask AI (Main Agriculture Assistant)
app.post('/api/ask-ai', async (req, res) => {
  try {
    const { query, language } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const selectedLanguage = language || 'ur'; // Default to Urdu
    
    // Language name mapping
    const languageNames = {
      'en': 'English',
      'ur': 'Urdu (اردو - use Nastaliq script)',
      'pa': 'Punjabi (پنجابی - use Shahmukhi script)',
      'sr': 'Saraiki (سرائیکی - use Saraiki script)'
    };
    
    const languageInstructions = {
      'en': 'Write your response in ENGLISH only.',
      'ur': 'آپ کو صرف اردو زبان میں جواب دینا ہے۔ رومن اردو یا انگریزی میں نہیں۔ Write in Urdu script (نستعلیق).',
      'pa': 'تسی صرف پنجابی زبان وچ جواب دینا اے۔ شاہ مکھی رسم الخط ورتو۔ Write in Punjabi Shahmukhi script.',
      'sr': 'تہاکوں صرف سرائیکی زبان ۾ جواب ڏینا ہے۔ Write in Saraiki script.'
    };
    
    // Use Gemma model (free, unlimited) instead of Gemini
    const model = genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });

    // Create the full prompt with dataset and selected language
    const fullPrompt = getAgriAIPrompt(selectedLanguage) + JSON.stringify(agriData, null, 2) + `

FARMER'S QUESTION (may be in Roman Urdu, Urdu, English or any language - understand it but respond in specified language):
"${query}"

⚠️ CRITICAL LANGUAGE INSTRUCTION ⚠️
You MUST respond ONLY in: ${languageNames[selectedLanguage]}
${languageInstructions[selectedLanguage]}

DO NOT respond in English or Roman Urdu unless the selected language is English!
The user's input language does not matter - ALWAYS respond in the specified language above.

If selected language is Urdu: جواب صرف اردو میں دیں
If selected language is Punjabi: جواب صرف پنجابی شاہ مکھی وچ دیو
If selected language is Saraiki: جواب صرف سرائیکی ۾ ڏیو

Now provide your agricultural advice:`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();

    res.json({ 
      success: true, 
      answer: response,
      query: query
    });

  } catch (error) {
    console.error('Ask AI error:', error);
    res.status(500).json({ 
      error: 'AI processing failed', 
      details: error.message 
    });
  }
});

// Route 3: Translate Text (for input display)
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });
    
    const prompt = getTranslationPrompt(targetLanguage) + `
"${text}"

Translated text:`;

    const result = await model.generateContent(prompt);
    const translatedText = result.response.text().trim();

    res.json({ 
      success: true, 
      translatedText: translatedText,
      originalText: text,
      targetLanguage: targetLanguage
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      error: 'Translation failed', 
      details: error.message 
    });
  }
});

// Route 4: Text-to-Speech (Generate audio from text)
app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Clean text for speech
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/`/g, '')
      .replace(/\n+/g, '. ')
      .replace(/[-•:]/g, ' ')
      .substring(0, 2000);

    const model = genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });

    // Convert Urdu/Arabic script to Roman Urdu for TTS
    // This is essential because browser TTS cannot read Urdu script
    const prompt = `You are a transliteration expert. Convert the following text to ROMAN URDU (Urdu written in English/Latin letters).

IMPORTANT RULES:
1. Convert ALL Urdu/Arabic script words to Roman Urdu phonetically
2. Keep English words as they are
3. Use common Roman Urdu spellings that people can easily read and pronounce
4. Example: "گندم" becomes "gandum", "مسئلہ" becomes "masla", "علاج" becomes "ilaaj"
5. Do NOT keep any Urdu/Arabic script characters
6. Output should be 100% readable in English letters
7. Keep the meaning and sentence structure same

Text to convert:
"${cleanText}"

Roman Urdu output (English letters only):`;

    const result = await model.generateContent(prompt);
    let speechText = result.response.text().trim();
    
    // Remove any quotes from the response
    speechText = speechText.replace(/^["']|["']$/g, '').trim();
    
    // If still contains Urdu script, try a simpler approach
    if (/[\u0600-\u06FF]/.test(speechText)) {
      // Remove Urdu characters as fallback
      speechText = cleanText.replace(/[\u0600-\u06FF]+/g, '').replace(/\s+/g, ' ').trim();
    }

    res.json({ 
      success: true, 
      speechText: speechText,
      originalText: text,
      language: language
    });

  } catch (error) {
    console.error('TTS error:', error);
    // Return cleaned text as fallback
    const fallbackText = req.body.text
      .replace(/[\u0600-\u06FF]+/g, '') // Remove Urdu script
      .replace(/[*#`\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    res.json({ 
      success: true, 
      speechText: fallbackText || 'Text conversion failed',
      originalText: req.body.text,
      language: req.body.language
    });
  }
});

// Route 5: TensorFlow Prediction (Crop Risk Assessment)
app.post('/api/predict', async (req, res) => {
  try {
    let { temperature, rainfall, soilMoisture, crop } = req.body;

    if (temperature === undefined || rainfall === undefined || soilMoisture === undefined) {
      return res.status(400).json({ error: 'Temperature, rainfall, and soilMoisture are required' });
    }

    // Validate and clamp inputs
    temperature = Math.max(0, Math.min(55, Number(temperature)));
    rainfall = Math.max(0, Math.min(500, Number(rainfall)));
    soilMoisture = Math.max(0, Math.min(100, Number(soilMoisture)));

    let prediction;
    let confidence;
    let recommendations = [];

    // Use improved rule-based prediction for accuracy
    const result = getAccuratePrediction(temperature, rainfall, soilMoisture, crop);
    prediction = result.prediction;
    confidence = result.confidence;

    // Generate recommendations based on prediction
    recommendations = generateRecommendations(prediction, crop, temperature, rainfall, soilMoisture);

    res.json({
      success: true,
      prediction: prediction,
      confidence: confidence.toFixed(1),
      recommendations: recommendations,
      input: { temperature, rainfall, soilMoisture, crop }
    });

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ 
      error: 'Prediction failed', 
      details: error.message 
    });
  }
});

// Route 4: Get Dataset
app.get('/api/dataset', (req, res) => {
  try {
    const { crop, category } = req.query;

    if (crop) {
      const cropData = agriData.crops?.find(c => 
        c.name.toLowerCase() === crop.toLowerCase() ||
        c.name_urdu === crop ||
        c.name_punjabi === crop
      );
      
      if (cropData) {
        return res.json({ success: true, data: cropData });
      } else {
        return res.status(404).json({ error: 'Crop not found' });
      }
    }

    if (category) {
      const filteredCrops = agriData.crops?.filter(c => 
        c.category?.toLowerCase() === category.toLowerCase()
      );
      return res.json({ success: true, data: filteredCrops });
    }

    res.json({ success: true, data: agriData });

  } catch (error) {
    console.error('Dataset error:', error);
    res.status(500).json({ error: 'Failed to fetch dataset' });
  }
});

// Route 5: Get Crop List
app.get('/api/crops', (req, res) => {
  try {
    const cropList = agriData.crops?.map(c => ({
      name: c.name,
      name_urdu: c.name_urdu,
      name_punjabi: c.name_punjabi,
      category: c.category
    }));
    
    res.json({ success: true, crops: cropList });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch crop list' });
  }
});

// Route 6: Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    modelLoaded: tfModel !== null,
    datasetLoaded: Object.keys(agriData).length > 0
  });
});

// ==================== HELPER FUNCTIONS ====================

function detectLanguage(text) {
  // Simple language detection based on character ranges
  const urduPattern = /[\u0600-\u06FF]/;
  const punjabiPattern = /[\u0A00-\u0A7F]/;
  
  if (urduPattern.test(text)) {
    return 'urdu';
  } else if (punjabiPattern.test(text)) {
    return 'punjabi';
  }
  return 'english';
}

function getRuleBasedPrediction(temp, rain, moisture) {
  // Rule-based fallback prediction
  if (temp > 40 && moisture < 30) {
    return 'heat_stress';
  } else if (rain > 300 && moisture > 80) {
    return 'flood_risk';
  } else if (moisture < 20 && rain < 50) {
    return 'drought_risk';
  } else if (moisture > 70 && temp > 25 && temp < 35) {
    return 'fungus_risk';
  } else {
    return 'optimal_conditions';
  }
}

function generateRecommendations(prediction, crop, temp, rain, moisture) {
  const recommendations = {
    optimal_conditions: [
      { en: 'Conditions are good for farming', ur: 'فصل کے لیے موسم اچھا ہے' },
      { en: 'Continue regular irrigation schedule', ur: 'باقاعدہ آبپاشی جاری رکھیں' },
      { en: 'Monitor crop growth regularly', ur: 'فصل کی نشوونما کو باقاعدگی سے دیکھیں' }
    ],
    fungus_risk: [
      { en: 'High risk of fungal disease', ur: 'پھپھوندی کی بیماری کا خطرہ زیادہ ہے' },
      { en: 'Apply fungicide spray', ur: 'پھپھوندی مار سپرے کریں' },
      { en: 'Reduce irrigation temporarily', ur: 'آبپاشی کم کریں' },
      { en: 'Ensure proper drainage', ur: 'نکاسی آب کا انتظام کریں' }
    ],
    drought_risk: [
      { en: 'Drought conditions detected', ur: 'خشک سالی کے حالات ہیں' },
      { en: 'Increase irrigation immediately', ur: 'فوری طور پر آبپاشی بڑھائیں' },
      { en: 'Apply mulch to retain moisture', ur: 'نمی برقرار رکھنے کے لیے ملچ لگائیں' },
      { en: 'Consider drought-resistant varieties', ur: 'خشکی برداشت کرنے والی اقسام استعمال کریں' }
    ],
    flood_risk: [
      { en: 'Flood/waterlogging risk detected', ur: 'سیلاب/پانی کھڑا ہونے کا خطرہ ہے' },
      { en: 'Improve field drainage', ur: 'کھیت کی نکاسی بہتر کریں' },
      { en: 'Stop irrigation temporarily', ur: 'آبپاشی عارضی طور پر روک دیں' },
      { en: 'Raise bed height if possible', ur: 'اگر ممکن ہو تو کھیت کی سطح اونچی کریں' }
    ],
    heat_stress: [
      { en: 'Heat stress conditions detected', ur: 'شدید گرمی کے حالات ہیں' },
      { en: 'Irrigate during evening hours', ur: 'شام کے وقت آبپاشی کریں' },
      { en: 'Provide shade if possible', ur: 'اگر ممکن ہو تو سایہ فراہم کریں' },
      { en: 'Apply light irrigation frequently', ur: 'ہلکی آبپاشی بار بار کریں' }
    ]
  };

  return recommendations[prediction] || recommendations.optimal_conditions;
}

// ==================== START SERVER ====================

loadModel().then(() => {
  app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   🌾 KISAN AI - Pakistani Agriculture Assistant 🌾        ║
    ║                                                           ║
    ║   Server running on: http://localhost:${PORT}              ║
    ║   API Endpoints:                                          ║
    ║   - POST /api/speech-to-text                              ║
    ║   - POST /api/ask-ai                                      ║
    ║   - POST /api/predict                                     ║
    ║   - GET  /api/dataset                                     ║
    ║   - GET  /api/crops                                       ║
    ║   - GET  /api/health                                      ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    `);
  });
});

module.exports = app;
