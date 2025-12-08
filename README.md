# 🌾 Kisan AI - Pakistani Agriculture Voice Assistant

<div align="center">

![Kisan AI Logo](https://img.shields.io/badge/Kisan_AI-Agriculture-green?style=for-the-badge&logo=seedling)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-18+-blue?style=flat-square&logo=react)
![TensorFlow](https://img.shields.io/badge/TensorFlow.js-ML-orange?style=flat-square&logo=tensorflow)

**Voice-enabled AI assistant for Pakistani farmers in Urdu, Punjabi, Saraiki, and English**

</div>

---

## 📋 Features

- 🎤 **Voice Input**: Speak in Urdu, Punjabi, Saraiki, Pashto, Sindhi, or English
- 🤖 **AI-Powered**: Uses Google Gemini 1.5 Flash for intelligent responses
- 📊 **Crop Risk Prediction**: TensorFlow.js model for weather-based predictions
- 🌙 **Dark/Light Theme**: Beautiful responsive UI
- 📱 **Mobile Friendly**: Works on all devices
- 🔒 **Verified Data Only**: No hallucination, uses only verified agriculture data

---

## 🗂️ Project Structure

```
Kisan_AI/
├── backend/
│   ├── server.js          # Express API server
│   ├── trainModel.js      # TensorFlow.js training script
│   ├── package.json
│   └── .env               # API keys
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── index.js
│   │   └── index.css      # Styles with theme support
│   └── package.json
├── knowledge/
│   └── agri_data.json     # Agriculture dataset
├── models/
│   └── crop_model/        # Trained TensorFlow model
└── README.md
```

---

## 🚀 Installation Guide

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Train the ML Model (One-time)

```bash
cd backend
npm run train-model
```

This will create the TensorFlow.js model in `models/crop_model/`

### Step 3: Start Backend Server

```bash
cd backend
npm start
```

Server will run on `http://localhost:5000`

### Step 4: Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### Step 5: Start Frontend

```bash
cd frontend
npm start
```

Frontend will run on `http://localhost:3000`

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/speech-to-text` | POST | Convert voice to text (Gemini STT) |
| `/api/ask-ai` | POST | Ask agriculture question |
| `/api/predict` | POST | Get crop risk prediction |
| `/api/dataset` | GET | Get agriculture dataset |
| `/api/crops` | GET | Get list of all crops |
| `/api/health` | GET | Server health check |

### Example: Ask AI

```bash
curl -X POST http://localhost:5000/api/ask-ai \
  -H "Content-Type: application/json" \
  -d '{"query": "گندم پر زنگ کی بیماری کا علاج بتائیں"}'
```

### Example: Predict Risk

```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"temperature": 35, "rainfall": 200, "soilMoisture": 75, "crop": "wheat"}'
```

---

## 🎯 How It Works

1. **Farmer speaks** in their local language (Urdu/Punjabi/etc.)
2. **Speech-to-Text**: Gemini converts voice to text
3. **AI Processing**: Gemini searches the agriculture dataset
4. **Risk Prediction**: TensorFlow model analyzes weather data
5. **Response**: Answer displayed in farmer's language

---

## 🌾 Dataset Information

The `agri_data.json` contains:

- **Crops**: Wheat, Cotton, Rice (expandable to 50+)
- **Problems**: Diseases, pests, deficiencies
- **Solutions**: Organic & chemical treatments
- **Sources**: Punjab Agriculture Department, PARC

---

## 🧠 ML Model

The TensorFlow.js model predicts:

| Input | Output Classes |
|-------|----------------|
| Temperature (°C) | ✅ Optimal Conditions |
| Rainfall (mm) | 🍄 Fungus Risk |
| Soil Moisture (%) | ☀️ Drought Risk |
| | 🌊 Flood Risk |
| | 🔥 Heat Stress |

---

## 📱 Screenshots

### Light Theme
- Clean, green agriculture theme
- Big microphone button
- Markdown-styled responses

### Dark Theme
- Easy on eyes for night use
- Full Urdu/Punjabi font support

---

## 🔧 Configuration

Edit `backend/.env` for API key:

```env
GEMINI_API_KEY=your_api_key_here
PORT=5000
```

---

## 📞 Support

- Punjab Agriculture Helpline: **0800-15000**
- PARC Website: www.parc.gov.pk

---

## 📄 License

MIT License - Free for all Pakistani farmers! 🇵🇰

---

<div align="center">

**Made with ❤️ for Pakistani Farmers**

🌾 کسان اے آئی - پاکستانی کسانوں کے لیے 🌾

</div>
