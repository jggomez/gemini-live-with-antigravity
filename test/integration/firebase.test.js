import test from 'node:test';
import assert from 'node:assert';
import { mock } from 'node:test';

// --- Global Mocks for Browser Environment ---
// Firebase App Check and shared libraries often peek at the DOM or global scope
global.document = {
    createElement: mock.fn(() => ({
        style: {},
        setAttribute: mock.fn(),
        appendChild: mock.fn()
    })),
    head: { appendChild: mock.fn() },
    getElementsByTagName: mock.fn(() => [{ appendChild: mock.fn() }])
};
global.self = global;
global.window = global;
global.location = { href: 'http://localhost' };

// --- Load .env for Tests (No external dependencies) ---
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env');

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}


// --- Firebase SDK Mocks ---

const mockApp = { name: '[DEFAULT]' };
const mockInitializeApp = mock.fn(() => mockApp);

const mockInitializeAppCheck = mock.fn();
class MockReCaptchaV3Provider {
    constructor(key) { this.siteKey = key; }
}

const mockGetStorage = mock.fn(() => ({ type: 'storage' }));
const mockGetFunctions = mock.fn(() => ({ type: 'functions' }));

const mockAI = { type: 'ai' };
const mockGetAI = mock.fn(() => mockAI);
const mockGetGenerativeModel = mock.fn((ai, config) => ({ ...config, type: 'generativeModel' }));
const mockGetLiveGenerativeModel = mock.fn((ai, config) => ({ ...config, type: 'liveModel' }));
const mockGetTemplateGenerativeModel = mock.fn(() => ({ type: 'templateModel' }));

// Register all external mocks
mock.module('firebase/app', { namedExports: { initializeApp: mockInitializeApp } });
mock.module('firebase/app-check', {
    namedExports: {
        initializeAppCheck: mockInitializeAppCheck,
        ReCaptchaV3Provider: MockReCaptchaV3Provider
    }
});
mock.module('firebase/storage', { namedExports: { getStorage: mockGetStorage } });
mock.module('firebase/functions', { namedExports: { getFunctions: mockGetFunctions } });
mock.module('firebase/ai', {
    namedExports: {
        getAI: mockGetAI,
        getGenerativeModel: mockGetGenerativeModel,
        getLiveGenerativeModel: mockGetLiveGenerativeModel,
        getTemplateGenerativeModel: mockGetTemplateGenerativeModel,
        GoogleAIBackend: class { },
        ResponseModality: { TEXT: 'TEXT', IMAGE: 'IMAGE', AUDIO: 'AUDIO' },
        startAudioConversation: mock.fn()
    }
});

// --- Dynamic Import of integration/firebase.js ---
const {
    default: firebaseApp,
    imageModel,
    templateModel,
    liveModel,
    storage,
    functions
} = await import('../../src/integration/firebase.js');

// --- Tests ---

test('Firebase Initialization - should use correct config', (t) => {
    assert.strictEqual(mockInitializeApp.mock.calls.length, 1);
    const config = mockInitializeApp.mock.calls[0].arguments[0];

    assert.strictEqual(config.projectId, "gemini-live-vibe-coding-2025");
    assert.strictEqual(config.apiKey, "AIzaSyAOShal2hcvvAtetMWLFaMFwTubiJxUK7I");
    assert.strictEqual(firebaseApp, mockApp);
});

test('App Check - should initialize with ReCaptcha V3', (t) => {
    assert.strictEqual(mockInitializeAppCheck.mock.calls.length, 1);
    const provider = mockInitializeAppCheck.mock.calls[0].arguments[1].provider;

    assert.strictEqual(provider.siteKey, '6LfLmT0sAAAAAFeHzVcji9xt4uI6u1o4-CQ5CjTG');
});

test('Generative Models - should be configured with correct versions', (t) => {
    // Image Model
    assert.strictEqual(imageModel.model, "gemini-2.5-flash-image");

    // Live Model
    assert.strictEqual(liveModel.model, "gemini-2.5-flash-native-audio-preview-12-2025");
    assert.strictEqual(liveModel.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName, "Achird");

    // Template Model
    assert.strictEqual(templateModel.type, 'templateModel');
});

test('Services - should be correctly exported', (t) => {
    assert.strictEqual(storage.type, 'storage');
    assert.strictEqual(functions.type, 'functions');
});
