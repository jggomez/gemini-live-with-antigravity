import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { getAI, getGenerativeModel, getLiveGenerativeModel, getTemplateGenerativeModel, GoogleAIBackend, ResponseModality, startAudioConversation } from "firebase/ai";
import env from "../config/env.js";

// Initialize Firebase
const app = initializeApp(env.firebase);

// Initialize App Check with reCAPTCHA v3
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(env.firebase.captchaKey),
    isTokenAutoRefreshEnabled: true
});

// Initialize AI Service
const ai = getAI(app, { backend: new GoogleAIBackend() });


export const imageModel = getGenerativeModel(ai, {
    model: env.gemini.imageModel,
    systemInstruction: "You are an expert in visual representation. Your goal is to transform complex information into a clear, professional, and high-impact infographic using a clean and modern design.",
    generationConfig: {
        responseModalities: [ResponseModality.TEXT, ResponseModality.IMAGE],
    },
});

// Template Model for Prompt Templates
export const templateModel = getTemplateGenerativeModel(ai);

// Live Model for Audio (Native Audio Preview)
export const liveModel = getLiveGenerativeModel(ai, {
    model: env.gemini.liveModel,
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
