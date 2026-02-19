import { liveModel, startAudioConversation } from "../integration/firebase.js";

let session = null;
let controller = null;
let isConversationActive = false;

/**
 * Starts a live voice conversation session with Gemini
 * @param {string} summary - The summary text
 * @returns {Promise<Object>} The conversation controller
 */
export async function startVoiceSession(summary = "") {
    try {
        if (isConversationActive) return controller;

        console.log("1. Connecting to Gemini Live...");
        session = await liveModel.connect();

        if (!session) throw new Error("Connection failed.");
        console.log("2. Session connected.");

        console.log("3. Enabling audio hardware...");
        controller = await startAudioConversation(session);

        const voiceContext = summary;

        console.log("4. Priming Gemini with document context...");
        await session.send(`SYSTEM INSTRUCTION: 
        1. Context: ${voiceContext}.
        2. Responses: maximum 4 sentences.
        3. Simple rule: If the user speaks a different language, respond in that language unmistakably.
        4. Keep the audio channel open and ALWAYS listen to the user after speaking.
        
        INITIAL GREETING: Hello! I'm Achird. I've analyzed your document. How can I help you today?`);

        isConversationActive = true;
        return controller;

    } catch (error) {
        console.error("Gemini Live Failure:", error);
        await stopVoiceSession();
        throw error;
    }
}

/**
 * Attaches a listener for transcription events by overriding the session receive method.
 * @param {Object} controllerObj - The conversation controller (not directly used here but kept for API consistency if needed later)
 * @param {Function} onTranscription - Callback (type, text) => void
 */
export function attachTranscriptionListener(controllerObj, onTranscription) {
    if (!session) {
        console.warn("Cannot attach listener: No active session.");
        return;
    }

    // TAP INTO THE STREAM: 
    // We override receive() to "peek" at the messages before they reach the audio engine.
    // Encapsulated here to avoid polluting the main start logic.
    const originalReceive = session.receive.bind(session);
    session.receive = () => {
        const stream = originalReceive();
        return (async function* () {
            for await (const message of stream) {
                if (message.type === 'serverContent') {
                    if (message.inputTranscription) {
                        if (onTranscription) onTranscription('user', message.inputTranscription.text);
                    }
                    if (message.outputTranscription) {
                        if (onTranscription) onTranscription('model', message.outputTranscription.text);
                    }
                }
                yield message;
            }
        })();
    };
}

/**
 * Stops the current voice conversation session
 */
export async function stopVoiceSession() {
    try {
        if (controller) {
            await controller.stop();
            controller = null;
        }
        session = null;
        isConversationActive = false;
        console.log("Gemini Live Session Closed.");
    } catch (error) {
        console.error("Failed to stop voice session:", error);
    }
}

/**
 * Checks if a voice session is currently active
 * @returns {boolean}
 */
export function isVoiceActive() {
    return isConversationActive;
}
