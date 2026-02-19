/**
 * Environment Configuration
 * Centralizes access to environment variables and provides validation.
 */

const getEnv = (key) => {
    // Vite environment
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[key];
    }
    // Node.js environment (for tests)
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    return undefined;
};

const env = {
    firebase: {
        apiKey: getEnv('VITE_FIREBASE_API_KEY'),
        authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
        projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
        storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
        appId: getEnv('VITE_FIREBASE_APP_ID'),
        captchaKey: getEnv('VITE_FIREBASE_CAPTCHA_KEY')
    },
    gemini: {
        imageModel: "gemini-2.5-flash-image",
        liveModel: "gemini-2.5-flash-native-audio-preview-12-2025",
        templateModel: "generatedocumentsummary-v100"
    }
};

// Validation
const requiredKeys = [
    'apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'captchaKey'
];

const missingKeys = requiredKeys.filter(key => !env.firebase[key]);

if (missingKeys.length > 0) {
    console.error(`Missing required environment variables: ${missingKeys.join(', ')}. Check your .env file.`);
}

export default env;
