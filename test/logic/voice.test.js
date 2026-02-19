import test from 'node:test';
import assert from 'node:assert';
import { mock } from 'node:test';

// --- Mocks Setup ---

const mockSession = {
    connect: mock.fn(async () => mockSession),
    send: mock.fn(async () => { }),
    receive: mock.fn(() => {
        // Return an async generator to simulate the stream
        return (async function* () {
            yield { type: 'serverContent', inputTranscription: { text: 'Hello from user' } };
            yield { type: 'serverContent', outputTranscription: { text: 'Hello from Gemini' } };
        })();
    })
};

const mockController = {
    stop: mock.fn(async () => { })
};

const mockLiveModel = {
    connect: mock.fn(async () => mockSession)
};

const mockStartAudioConversation = mock.fn(async () => mockController);

// Register mocks for the integration layer
mock.module('../../src/integration/firebase.js', {
    namedExports: {
        liveModel: mockLiveModel,
        startAudioConversation: mockStartAudioConversation
    }
});

// --- Dynamic Import of logic/voice.js ---
// We need to use a clean import or handle the singleton state if needed
const { startVoiceSession, stopVoiceSession, isVoiceActive, attachTranscriptionListener } = await import('../../src/logic/voice.js');

// --- Tests ---

test('isVoiceActive - should reflect initial state', (t) => {
    assert.strictEqual(isVoiceActive(), false);
});

test('startVoiceSession - should establish connection and set active state', async (t) => {
    const onTranscription = mock.fn();
    const summary = "Test Context";

    const controller = await startVoiceSession(summary);

    // Attach listener manually as per new API
    attachTranscriptionListener(controller, onTranscription);

    assert.strictEqual(controller, mockController);
    assert.strictEqual(isVoiceActive(), true);
    assert.strictEqual(mockLiveModel.connect.mock.calls.length, 1);

    // Verify system instruction was sent
    assert.strictEqual(mockSession.send.mock.calls.length, 1);
    assert.ok(mockSession.send.mock.calls[0].arguments[0].includes(summary));

    // Verify transcription peeking works by triggering the overriden receive
    const stream = mockSession.receive();
    for await (const _ of stream) {
        // Just consume the stream to trigger the logic inside voice.js
    }

    assert.strictEqual(onTranscription.mock.calls.length, 2);
    assert.deepStrictEqual(onTranscription.mock.calls[0].arguments, ['user', 'Hello from user']);
    assert.deepStrictEqual(onTranscription.mock.calls[1].arguments, ['model', 'Hello from Gemini']);
});

test('startVoiceSession - should return existing controller if already active', async (t) => {
    mockLiveModel.connect.mock.resetCalls();
    const controller = await startVoiceSession();
    assert.strictEqual(controller, mockController);
    assert.strictEqual(mockLiveModel.connect.mock.calls.length, 0); // Should not connect again
});

test('stopVoiceSession - should close session and reset state', async (t) => {
    await stopVoiceSession();

    assert.strictEqual(isVoiceActive(), false);
    assert.strictEqual(mockController.stop.mock.calls.length, 1);
});

test('startVoiceSession - should handle connection failure', async (t) => {
    t.mock.method(console, 'error', () => { });

    // Set mock to fail
    mockLiveModel.connect.mock.mockImplementationOnce(async () => {
        throw new Error("Connection Timeout");
    });

    await assert.rejects(
        async () => await startVoiceSession(),
        { message: "Connection Timeout" }
    );

    assert.strictEqual(isVoiceActive(), false);
});
