import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaMicrophone, FaStop, FaSun, FaMoon, FaLeaf, FaUser, FaRobot, FaCloudSunRain, FaExclamationTriangle, FaGlobe, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Language translations
const translations = {
  en: {
    appName: 'Kisan AI',
    appSubtitle: 'Agriculture Assistant',
    micPrompt: '🎤 Press button to ask your question',
    recording: '🔴 Recording... Speak now',
    processing: '⏳ Processing...',
    yourQuestion: 'Your Question',
    aiResponse: 'Kisan AI Response',
    preparingAnswer: 'Preparing answer...',
    cropRisk: 'Crop Risk Assessment',
    temperature: '🌡️ Temperature (°C)',
    rainfall: '🌧️ Rainfall (mm)',
    soilMoisture: '💧 Soil Moisture (%)',
    crop: '🌾 Crop',
    predict: 'Predict',
    predictionResult: '🔮 Prediction Result',
    confidence: 'Confidence',
    recommendations: '📋 Recommendations:',
    footer1: '🌾 Kisan AI - For Pakistani Farmers',
    footer2: 'Punjab Agriculture Department | PARC Data Sources',
    micError: 'Could not access microphone. Please allow permission.',
    apiQuotaError: 'API quota exceeded. Please wait 1 minute and try again.',
    processingError: 'Voice processing failed. Please try again.',
    predictionError: 'Prediction failed.',
    speakResponse: '🔊 Listen',
    stopSpeaking: '🔇 Stop',
    speaking: '🔊 Speaking...',
    wheat: 'Wheat',
    cotton: 'Cotton',
    rice: 'Rice',
    optimal: 'Optimal Conditions ✅',
    fungus: 'Fungus Risk 🍄',
    drought: 'Drought Risk ☀️',
    flood: 'Flood Risk 🌊',
    heat: 'Heat Stress 🔥',
    // Chatbot translations
    chatbotTitle: 'Kisan AI Assistant',
    chatbotWelcome: 'Hello! 👋 I am Kisan AI. How can I help you with farming today?',
    chatbotPlaceholder: 'Type your question here...',
    chatbotSend: 'Send',
    chatbotTyping: 'Typing...'
  },
  ur: {
    appName: 'کسان اے آئی',
    appSubtitle: 'زرعی معاون',
    micPrompt: '🎤 اپنا سوال پوچھنے کے لیے بٹن دبائیں',
    recording: '🔴 ریکارڈنگ جاری ہے... بولیں',
    processing: '⏳ پروسیسنگ ہو رہی ہے...',
    yourQuestion: 'آپ کا سوال',
    aiResponse: 'کسان AI جواب',
    preparingAnswer: 'جواب تیار ہو رہا ہے...',
    cropRisk: 'موسمی پیش گوئی',
    temperature: '🌡️ درجہ حرارت (°C)',
    rainfall: '🌧️ بارش (mm)',
    soilMoisture: '💧 زمین کی نمی (%)',
    crop: '🌾 فصل',
    predict: 'پیش گوئی کریں',
    predictionResult: '🔮 پیش گوئی کا نتیجہ',
    confidence: 'اعتماد',
    recommendations: '📋 سفارشات:',
    footer1: '🌾 کسان AI - پاکستانی کسانوں کے لیے',
    footer2: 'پنجاب زراعت ڈیپارٹمنٹ | PARC ڈیٹا',
    micError: 'مائیکروفون تک رسائی نہیں ہو سکی۔ براہ کرم اجازت دیں۔',
    apiQuotaError: 'API کوٹا ختم ہو گیا۔ براہ کرم 1 منٹ انتظار کریں۔',
    processingError: 'آواز پروسیسنگ میں خرابی آ گئی۔ دوبارہ کوشش کریں۔',
    predictionError: 'پیش گوئی میں خرابی آ گئی۔',
    speakResponse: '🔊 سنیں',
    stopSpeaking: '🔇 بند کریں',
    speaking: '🔊 بول رہا ہے...',
    wheat: 'گندم',
    cotton: 'کپاس',
    rice: 'چاول',
    optimal: 'موزوں حالات ✅',
    fungus: 'پھپھوندی کا خطرہ 🍄',
    drought: 'خشک سالی کا خطرہ ☀️',
    flood: 'سیلاب کا خطرہ 🌊',
    heat: 'شدید گرمی 🔥',
    // Chatbot translations
    chatbotTitle: 'کسان AI اسسٹنٹ',
    chatbotWelcome: 'السلام علیکم! 👋 میں کسان AI ہوں۔ کھیتی باڑی میں کیسے مدد کر سکتا ہوں؟',
    chatbotPlaceholder: 'اپنا سوال یہاں لکھیں...',
    chatbotSend: 'بھیجیں',
    chatbotTyping: 'لکھ رہا ہے...'
  },
  pa: {
    appName: 'کسان اے آئی',
    appSubtitle: 'کھیتی باڑی مددگار',
    micPrompt: '🎤 اپنا سوال پُچھن لئی بٹن دباؤ',
    recording: '🔴 ریکارڈنگ ہو رہی اے... بولو',
    processing: '⏳ پروسیسنگ ہو رہی اے...',
    yourQuestion: 'تہاڈا سوال',
    aiResponse: 'کسان AI جواب',
    preparingAnswer: 'جواب تیار ہو رہیا اے...',
    cropRisk: 'موسم دی پیش گوئی',
    temperature: '🌡️ درجہ حرارت (°C)',
    rainfall: '🌧️ مینہہ (mm)',
    soilMoisture: '💧 زمین دی نمی (%)',
    crop: '🌾 فصل',
    predict: 'پیش گوئی کرو',
    predictionResult: '🔮 پیش گوئی دا نتیجہ',
    confidence: 'اعتماد',
    recommendations: '📋 سفارشاں:',
    footer1: '🌾 کسان AI - پاکستانی کساناں لئی',
    footer2: 'پنجاب زراعت ڈیپارٹمنٹ | PARC ڈیٹا',
    micError: 'مائیکروفون تیکر رسائی نئیں ہو سکی۔ مہربانی نال اجازت دیو۔',
    apiQuotaError: 'API کوٹا ختم ہو گیا۔ مہربانی نال 1 منٹ انتظار کرو۔',
    processingError: 'آواز پروسیسنگ وچ خرابی آ گئی۔ دوبارہ کوشش کرو۔',
    predictionError: 'پیش گوئی وچ خرابی آ گئی۔',
    speakResponse: '🔊 سنو',
    stopSpeaking: '🔇 بند کرو',
    speaking: '🔊 بول رہیا اے...',
    wheat: 'کنک',
    cotton: 'کپاہ',
    rice: 'جھونا',
    optimal: 'ودھیا حالات ✅',
    fungus: 'پھپھوندی دا خطرہ 🍄',
    drought: 'سوکے دا خطرہ ☀️',
    flood: 'ہڑھ دا خطرہ 🌊',
    heat: 'سخت گرمی 🔥',
    // Chatbot translations
    chatbotTitle: 'کسان AI اسسٹنٹ',
    chatbotWelcome: 'سلام! 👋 میں کسان AI ہاں۔ کھیتی باڑی وچ کویں مدد کر سکدا ہاں؟',
    chatbotPlaceholder: 'اپنا سوال ایتھے لکھو...',
    chatbotSend: 'بھیجو',
    chatbotTyping: 'لکھ رہیا اے...'
  },
  sr: {
    appName: 'کسان اے آئی',
    appSubtitle: 'زرعی مددگار',
    micPrompt: '🎤 اپنا سوال پچھن کیتے بٹن دٻاؤ',
    recording: '🔴 ریکارڈنگ تھیندی پئی اے... ٻولو',
    processing: '⏳ پروسیسنگ تھیندی پئی اے...',
    yourQuestion: 'تہاڈا سوال',
    aiResponse: 'کسان AI جواب',
    preparingAnswer: 'جواب تیار تھیندا پیا اے...',
    cropRisk: 'موسم دی پیش گوئی',
    temperature: '🌡️ درجہ حرارت (°C)',
    rainfall: '🌧️ مینہہ (mm)',
    soilMoisture: '💧 زمین دی نمی (%)',
    crop: '🌾 فصل',
    predict: 'پیش گوئی کرو',
    predictionResult: '🔮 پیش گوئی دا نتیجہ',
    confidence: 'اعتماد',
    recommendations: '📋 صلاحاں:',
    footer1: '🌾 کسان AI - پاکستانی کساناں کیتے',
    footer2: 'پنجاب زراعت ڈیپارٹمنٹ | PARC ڈیٹا',
    micError: 'مائیکروفون تائیں رسائی کائنی تھی سڳی۔ مہربانی نال اجازت ڈیو۔',
    apiQuotaError: 'API کوٹا ختم تھی ڳیا۔ مہربانی نال 1 منٹ انتظار کرو۔',
    processingError: 'آواز پروسیسنگ وچ خرابی آ ڳئی۔ ولا کوشش کرو۔',
    predictionError: 'پیش گوئی وچ خرابی آ ڳئی۔',
    speakResponse: '🔊 ٻڄو',
    stopSpeaking: '🔇 بند کرو',
    speaking: '🔊 ٻول رہیا اے...',
    wheat: 'کنک',
    cotton: 'کپاہ',
    rice: 'جھونا',
    optimal: 'چنڳے حالات ✅',
    fungus: 'پھپھوندی دا خطرہ 🍄',
    drought: 'سوکے دا خطرہ ☀️',
    flood: 'ہڑ دا خطرہ 🌊',
    heat: 'سخت گرمی 🔥',
    // Chatbot translations
    chatbotTitle: 'کسان AI اسسٹنٹ',
    chatbotWelcome: 'سلام! 👋 میں کسان AI ہاں۔ کھیتی باڑی وچ کیویں مدد کر سڳدا ہاں؟',
    chatbotPlaceholder: 'اپنا سوال ایتھے لکھو...',
    chatbotSend: 'بھیجو',
    chatbotTyping: 'لکھ رہیا اے...'
  }
};

const languageNames = {
  en: 'English',
  ur: 'اردو',
  pa: 'پنجابی',
  sr: 'سرائیکی'
};

function App() {
  const [theme, setTheme] = useState('light');
  // Default language is Urdu
  const [language, setLanguage] = useState('ur');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  const [originalTranscript, setOriginalTranscript] = useState(''); // Store original for re-translation
  const [isSpeaking, setIsSpeaking] = useState(false); // For TTS status
  
  // Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);
  
  // Weather inputs for prediction
  const [weatherData, setWeatherData] = useState({
    temperature: 30,
    rainfall: 50,
    soilMoisture: 40,
    crop: 'wheat'
  });

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const prevLanguageRef = useRef(language);
  const synthRef = useRef(window.speechSynthesis);
  const chatEndRef = useRef(null);
  const voicesLoadedRef = useRef(false);
  const availableVoicesRef = useRef([]);
  
  // Get current translations
  const t = translations[language];
  
  // Pre-load voices on app start (important for mobile)
  useEffect(() => {
    const loadVoices = () => {
      const voices = synthRef.current.getVoices();
      if (voices.length > 0) {
        availableVoicesRef.current = voices;
        voicesLoadedRef.current = true;
        console.log('✅ Voices loaded:', voices.length);
      }
    };
    
    // Load immediately
    loadVoices();
    
    // Also listen for voices changed event (some browsers load async)
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = loadVoices;
    }
    
    // Retry loading after a delay (for mobile)
    setTimeout(loadVoices, 500);
    setTimeout(loadVoices, 1000);
    setTimeout(loadVoices, 2000);
  }, []);
  
  // Initialize chat with welcome message
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([{
        type: 'bot',
        text: t.chatbotWelcome,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, []);
  
  // Update welcome message when language changes
  useEffect(() => {
    if (chatMessages.length === 1 && chatMessages[0].type === 'bot') {
      setChatMessages([{
        type: 'bot',
        text: t.chatbotWelcome,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [language, t.chatbotWelcome]);
  
  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Reference to track if we should stop speaking
  const shouldStopRef = useRef(false);

  // Text-to-Speech function - speaks in selected language
  const speakResponse = async (text) => {
    if (!text) return;
    
    // If already speaking, stop first
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    
    // Reset stop flag
    shouldStopRef.current = false;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    setIsSpeaking(true);
    
    let textToSpeak = text;
    
    // For non-English languages, convert Urdu script to Roman Urdu for TTS
    if (language !== 'en') {
      try {
        // Call backend to convert Urdu to Roman Urdu for speech
        const response = await axios.post(`${API_BASE}/text-to-speech`, {
          text: text,
          language: language
        });
        if (response.data.success && response.data.speechText) {
          textToSpeak = response.data.speechText;
        }
      } catch (err) {
        console.log('Using original text for TTS');
      }
    }
    
    // Clean the text
    let cleanText = textToSpeak
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/`/g, '')
      .replace(/[-•:]/g, ' ')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .replace(/[۔]/g, '.')
      .trim();
    
    // Get available voices - use pre-loaded voices first
    let voices = availableVoicesRef.current.length > 0 
      ? availableVoicesRef.current 
      : synthRef.current.getVoices();
    
    // If still no voices, try to load them (mobile fix)
    if (voices.length === 0) {
      await new Promise(resolve => {
        const checkVoices = () => {
          voices = synthRef.current.getVoices();
          if (voices.length > 0) {
            availableVoicesRef.current = voices;
            resolve();
          }
        };
        synthRef.current.onvoiceschanged = checkVoices;
        // Multiple timeouts for mobile compatibility
        setTimeout(checkVoices, 100);
        setTimeout(checkVoices, 300);
        setTimeout(checkVoices, 500);
        setTimeout(resolve, 1000); // Final timeout
      });
      voices = synthRef.current.getVoices();
    }
    
    // Mobile fallback - if no voices, show alert
    if (voices.length === 0) {
      console.log('No TTS voices available');
      setIsSpeaking(false);
      return;
    }
    
    // Select voice - for Urdu use Hindi or English India
    let selectedVoice = null;
    
    if (language === 'en') {
      selectedVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('en-US')) ||
                      voices.find(v => v.lang.includes('en-US')) ||
                      voices.find(v => v.lang.startsWith('en'));
    } else {
      // Try Hindi first, then English India (good for Roman Urdu)
      selectedVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('hi')) ||
                      voices.find(v => v.lang.includes('hi-IN')) ||
                      voices.find(v => v.name.includes('Google') && v.lang.includes('en-IN')) ||
                      voices.find(v => v.lang.includes('en-IN')) ||
                      voices.find(v => v.name.includes('Google')) ||
                      voices.find(v => v.lang.startsWith('en'));
    }
    
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }
    
    console.log('🔊 Using voice:', selectedVoice?.name, selectedVoice?.lang);
    
    // Split into sentences for better control
    const sentences = cleanText.split(/[.۔!?]+/).filter(s => s.trim());
    
    // For mobile - speak as one chunk if sentences are few
    if (sentences.length <= 3) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = language === 'en' ? 'en-US' : 'hi-IN';
      }
      utterance.rate = 0.85;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.log('TTS Error:', e);
        setIsSpeaking(false);
      };
      
      synthRef.current.speak(utterance);
      return;
    }
    
    let currentIndex = 0;
    
    const speakNext = () => {
      // Check if we should stop
      if (shouldStopRef.current || currentIndex >= sentences.length) {
        setIsSpeaking(false);
        shouldStopRef.current = false;
        return;
      }
      
      const sentence = sentences[currentIndex].trim();
      if (!sentence) {
        currentIndex++;
        speakNext();
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(sentence);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = language === 'en' ? 'en-US' : 'hi-IN';
      }
      
      utterance.rate = 0.85;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        currentIndex++;
        if (!shouldStopRef.current) {
          setTimeout(speakNext, 150);
        } else {
          setIsSpeaking(false);
        }
      };
      
      utterance.onerror = () => {
        currentIndex++;
        if (!shouldStopRef.current) {
          setTimeout(speakNext, 150);
        } else {
          setIsSpeaking(false);
        }
      };
      
      synthRef.current.speak(utterance);
    };
    
    speakNext();
  };

  // Stop speaking - properly stops all speech
  const stopSpeaking = () => {
    shouldStopRef.current = true;
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  // Re-translate content when language changes
  useEffect(() => {
    const translateExistingContent = async () => {
      // Only translate if language actually changed and we have content
      if (prevLanguageRef.current !== language && originalTranscript) {
        setIsProcessing(true);
        try {
          // Translate the input text to new language
          const translateResponse = await axios.post(`${API_BASE}/translate`, {
            text: originalTranscript,
            targetLanguage: language
          });
          
          if (translateResponse.data.success) {
            setTranscript(translateResponse.data.translatedText);
          }

          // Get new AI response in the new language
          const aiResponseData = await axios.post(`${API_BASE}/ask-ai`, {
            query: originalTranscript,
            language: language
          });

          if (aiResponseData.data.success) {
            setAiResponse(aiResponseData.data.answer);
          }
        } catch (err) {
          console.error('Translation error:', err);
        } finally {
          setIsProcessing(false);
        }
      }
      prevLanguageRef.current = language;
    };

    translateExistingContent();
  }, [language, originalTranscript]);

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // Set language based on selected language
      const langMap = {
        'en': 'en-US',
        'ur': 'ur-PK',
        'pa': 'pa-PK',
        'sr': 'ur-PK' // Saraiki uses Urdu recognition
      };
      recognitionRef.current.lang = langMap[language] || 'ur-PK';
    }
  }, [language]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const startRecording = async () => {
    try {
      setError('');
      setTranscript('');
      setAiResponse('');
      
      // Check if Web Speech API is available
      if (!recognitionRef.current) {
        // Fallback to old method if Web Speech API not available
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await processAudio(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        return;
      }

      // Use Web Speech API (FREE - No API quota!)
      const langMap = {
        'en': 'en-US',
        'ur': 'ur-PK',
        'pa': 'pa-PK',
        'sr': 'ur-PK'
      };
      recognitionRef.current.lang = langMap[language] || 'ur-PK';
      
      recognitionRef.current.onresult = async (event) => {
        const text = event.results[0][0].transcript;
        setIsRecording(false);
        
        // Store original text for re-translation when language changes
        setOriginalTranscript(text);
        
        // Now process: translate input + get AI response
        setIsProcessing(true);
        try {
          // Step 1: Translate input to selected language (for display)
          let displayText = text;
          try {
            const translateResponse = await axios.post(`${API_BASE}/translate`, {
              text: text,
              targetLanguage: language
            });
            if (translateResponse.data.success) {
              displayText = translateResponse.data.translatedText;
            }
          } catch (translateErr) {
            console.log('Translation skipped, using original text');
          }
          setTranscript(displayText);

          // Step 2: Get AI response in selected language
          const aiResponseData = await axios.post(`${API_BASE}/ask-ai`, {
            query: text, // Send original for better understanding
            language: language
          });

          if (aiResponseData.data.success) {
            setAiResponse(aiResponseData.data.answer);
            // Automatically speak the AI response
            setTimeout(() => {
              speakResponse(aiResponseData.data.answer);
            }, 500);
          }
        } catch (err) {
          if (err.response?.status === 429) {
            setError(t.apiQuotaError);
          } else {
            setError(t.processingError);
          }
          console.error('AI error:', err);
        } finally {
          setIsProcessing(false);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'no-speech') {
          setError(language === 'en' ? 'No speech detected. Please try again.' : 'آواز نہیں سنی گئی۔ دوبارہ کوشش کریں۔');
        } else if (event.error === 'not-allowed') {
          setError(t.micError);
        } else {
          setError(t.processingError);
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError(t.micError);
      console.error('Microphone error:', err);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    setTranscript('');
    setAiResponse('');

    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result;
        
        try {
          // Step 1: Speech to Text
          const sttResponse = await axios.post(`${API_BASE}/speech-to-text`, {
            audioData: base64Audio,
            mimeType: 'audio/webm'
          });

          if (sttResponse.data.success) {
            const text = sttResponse.data.transcription;
            setTranscript(text);

            // Step 2: Ask AI
            const aiResponseData = await axios.post(`${API_BASE}/ask-ai`, {
              query: text,
              language: language,
              detectedLanguage: sttResponse.data.detectedLanguage
            });

            if (aiResponseData.data.success) {
              setAiResponse(aiResponseData.data.answer);
            }
          }
        } catch (err) {
          if (err.response?.status === 429) {
            setError(t.apiQuotaError);
          } else {
            setError(t.processingError);
          }
          console.error('Processing error:', err);
        }
      };
    } catch (err) {
      if (err.response?.status === 429) {
        setError(t.apiQuotaError);
      } else {
        setError(t.processingError);
      }
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePredict = async () => {
    setIsProcessing(true);
    setPrediction(null);
    setError('');

    try {
      const response = await axios.post(`${API_BASE}/predict`, weatherData);
      if (response.data.success) {
        setPrediction(response.data);
      }
    } catch (err) {
      setError(t.predictionError);
      console.error('Prediction error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Chatbot send message function
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = {
      type: 'user',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatTyping(true);
    
    try {
      const response = await axios.post(`${API_BASE}/ask-ai`, {
        query: chatInput.trim(),
        language: language
      });
      
      if (response.data.success) {
        const botMessage = {
          type: 'bot',
          text: response.data.answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, botMessage]);
      }
    } catch (err) {
      const errorMessage = {
        type: 'bot',
        text: t.processingError,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatTyping(false);
    }
  };
  
  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getPredictionLabel = (pred) => {
    const labels = {
      'optimal_conditions': t.optimal,
      'fungus_risk': t.fungus,
      'drought_risk': t.drought,
      'flood_risk': t.flood,
      'heat_stress': t.heat
    };
    return labels[pred] || pred;
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🌾</span>
          <div className="logo-text">
            <h1>{t.appName}</h1>
            <span className={language !== 'en' ? 'urdu-text' : ''}>{t.appSubtitle}</span>
          </div>
        </div>
        <div className="header-controls">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <FaMoon /> : <FaSun />}
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Language Selector */}
        <div className="language-selector">
          <FaGlobe className="lang-icon" />
          {Object.keys(languageNames).map((lang) => (
            <button
              key={lang}
              className={`lang-btn ${language === lang ? 'active' : ''}`}
              onClick={() => setLanguage(lang)}
              style={{ borderRadius: '50px' }}
            >
              {languageNames[lang]}
            </button>
          ))}
        </div>

        {/* Microphone Section */}
        <section className="mic-section">
          <button 
            className={`mic-button ${isRecording ? 'recording' : ''}`}
            onClick={handleMicClick}
            disabled={isProcessing}
          >
            {isRecording ? <FaStop /> : <FaMicrophone />}
          </button>
          <p className={`mic-status ${isRecording ? 'recording' : ''} ${language !== 'en' ? 'urdu-text' : ''}`}>
            {isRecording 
              ? t.recording 
              : isProcessing 
                ? t.processing
                : t.micPrompt}
          </p>
        </section>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {/* Chat Container */}
        <div className="chat-container">
          {/* User Transcript */}
          {transcript && (
            <div className="message-card user">
              <div className="message-header">
                <FaUser className="message-icon" />
                <span className="message-label">{t.yourQuestion}</span>
              </div>
              <div className={`message-content ${language !== 'en' ? 'urdu-text' : ''}`}>
                {transcript}
              </div>
            </div>
          )}

          {/* AI Response */}
          {aiResponse && (
            <div className="message-card ai">
              <div className="message-header">
                <FaRobot className="message-icon" />
                <span className="message-label">{t.aiResponse}</span>
                {/* Speaker Button */}
                <button 
                  className={`speaker-btn ${isSpeaking ? 'speaking' : ''}`}
                  onClick={() => isSpeaking ? stopSpeaking() : speakResponse(aiResponse)}
                  title={isSpeaking ? t.stopSpeaking : t.speakResponse}
                >
                  {isSpeaking ? <FaVolumeMute /> : <FaVolumeUp />}
                  <span className="speaker-text">
                    {isSpeaking ? t.speaking : t.speakResponse}
                  </span>
                </button>
              </div>
              <div className="message-content">
                <ReactMarkdown>{aiResponse}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Loading */}
          {isProcessing && (
            <div className="loading">
              <div className="loading-spinner"></div>
              <span className={language !== 'en' ? 'urdu-text' : ''}>{t.preparingAnswer}</span>
            </div>
          )}
        </div>

        {/* Weather Prediction Section */}
        <section className="weather-section">
          <h3><FaCloudSunRain /> {t.cropRisk}</h3>
          <div className="weather-inputs">
            <div className="input-group">
              <label>{t.temperature}</label>
              <input 
                type="number" 
                value={weatherData.temperature}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (val < 0) val = 0;
                  if (val > 55) val = 55;
                  setWeatherData({...weatherData, temperature: val});
                }}
                min="0" 
                max="55"
                step="1"
              />
            </div>
            <div className="input-group">
              <label>{t.rainfall}</label>
              <input 
                type="number" 
                value={weatherData.rainfall}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (val < 0) val = 0;
                  if (val > 500) val = 500;
                  setWeatherData({...weatherData, rainfall: val});
                }}
                min="0" 
                max="500"
                step="1"
              />
            </div>
            <div className="input-group">
              <label>{t.soilMoisture}</label>
              <input 
                type="number" 
                value={weatherData.soilMoisture}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (val < 0) val = 0;
                  if (val > 100) val = 100;
                  setWeatherData({...weatherData, soilMoisture: val});
                }}
                min="0" 
                max="100"
                step="1"
              />
            </div>
            <div className="input-group">
              <label>{t.crop}</label>
              <select 
                value={weatherData.crop}
                onChange={(e) => setWeatherData({...weatherData, crop: e.target.value})}
              >
                <option value="wheat">{t.wheat}</option>
                <option value="cotton">{t.cotton}</option>
                <option value="rice">{t.rice}</option>
              </select>
            </div>
          </div>
          <button className="predict-btn" onClick={handlePredict} disabled={isProcessing}>
            <FaLeaf /> {t.predict}
          </button>

          {/* Prediction Result */}
          {prediction && (
            <div className="prediction-card" style={{marginTop: '1.5rem'}}>
              <div className="prediction-header">
                <h3>{t.predictionResult}</h3>
              </div>
              <div className="prediction-result">
                <span className={`prediction-badge ${prediction.prediction}`}>
                  {getPredictionLabel(prediction.prediction)}
                </span>
                <span className="confidence">
                  {t.confidence}: {prediction.confidence}%
                </span>
              </div>
              <div className="recommendations">
                <h4>{t.recommendations}</h4>
                <ul>
                  {prediction.recommendations?.map((rec, idx) => (
                    <li key={idx}>
                      <span>{language === 'en' ? rec.en : rec.ur}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>{t.footer1}</p>
        <p>{t.footer2}</p>
      </footer>
      
      {/* Floating Chatbot Widget */}
      <div className={`chatbot-widget ${isChatOpen ? 'open' : ''}`}>
        {/* Chat Window */}
        {isChatOpen && (
          <div className="chatbot-window">
            {/* Chat Header */}
            <div className="chatbot-header">
              <div className="chatbot-header-info">
                <div className="chatbot-avatar">🌾</div>
                <div className="chatbot-header-text">
                  <h4>{t.chatbotTitle}</h4>
                  <span className="chatbot-status">● Online</span>
                </div>
              </div>
              <button className="chatbot-close" onClick={() => setIsChatOpen(false)}>
                ✕
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="chatbot-messages">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.type}`}>
                  {msg.type === 'bot' && <div className="chat-avatar">🌾</div>}
                  <div className="chat-bubble">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                    <span className="chat-time">{msg.time}</span>
                  </div>
                  {msg.type === 'user' && <div className="chat-avatar user-avatar">👤</div>}
                </div>
              ))}
              {isChatTyping && (
                <div className="chat-message bot">
                  <div className="chat-avatar">🌾</div>
                  <div className="chat-bubble typing">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            {/* Chat Input */}
            <div className="chatbot-input-area">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleChatKeyPress}
                placeholder={t.chatbotPlaceholder}
                className={language !== 'en' ? 'urdu-text' : ''}
              />
              <button 
                className="chat-send-btn" 
                onClick={handleChatSend}
                disabled={!chatInput.trim() || isChatTyping}
              >
                {t.chatbotSend}
              </button>
            </div>
          </div>
        )}
        
        {/* Floating Button */}
        <button 
          className={`chatbot-toggle ${isChatOpen ? 'active' : ''}`}
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          {isChatOpen ? '✕' : '💬'}
        </button>
      </div>
    </div>
  );
}

export default App;
