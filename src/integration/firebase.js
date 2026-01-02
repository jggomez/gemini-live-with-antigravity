import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { getAI, getGenerativeModel, getLiveGenerativeModel, getTemplateGenerativeModel, GoogleAIBackend, ResponseModality, startAudioConversation } from "firebase/ai";

// Firebase Configuration for gemini-live-vibe-coding-2025
const firebaseConfig = {
    apiKey: "AIzaSyAOShal2hcvvAtetMWLFaMFwTubiJxUK7I",
    authDomain: "gemini-live-vibe-coding-2025.firebaseapp.com",
    projectId: "gemini-live-vibe-coding-2025",
    storageBucket: "gemini-live-vibe-coding-2025.firebasestorage.app",
    messagingSenderId: "749343279250",
    appId: "1:749343279250:web:6b86200654eb5ef2e07e4b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize App Check with reCAPTCHA v3
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LfLmT0sAAAAAFeHzVcji9xt4uI6u1o4-CQ5CjTG'),
    isTokenAutoRefreshEnabled: true
});

// Initialize AI Service
const ai = getAI(app, { backend: new GoogleAIBackend() });


export const imageModel = getGenerativeModel(ai, {
    model: "gemini-2.5-flash-image",
    systemInstruction: "You are an expert in visual representation. Your goal is to transform complex information into a clear, professional, and high-impact infographic using a clean and modern design.",
    generationConfig: {
        responseModalities: [ResponseModality.TEXT, ResponseModality.IMAGE],
    },
});

// Template Model for Prompt Templates
export const templateModel = getTemplateGenerativeModel(ai);

// Live Model for Audio (Native Audio Preview)
export const liveModel = getLiveGenerativeModel(ai, {
    model: "gemini-2.5-flash-native-audio-preview-12-2025",
    generationConfig: {
        responseModalities: [ResponseModality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        speechConfig: {
            voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "Achird" },
            },
        },
    },
});

export { startAudioConversation };

// Integration Layer Services
export const functions = getFunctions(app, "us-central1");
export const storage = getStorage(app);

export default app;
