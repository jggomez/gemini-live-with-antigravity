import { startVoiceSession, stopVoiceSession, isVoiceActive, attachTranscriptionListener } from "../logic/voice.js";
import { store } from "../state/store.js";

export class VoiceController {
    constructor() {
        this.micBtn = document.getElementById('activate-mic');
        this.container = document.querySelector('.voice-experience-container');
        this.statusText = document.querySelector('.voice-status');
        this.transcriptBox = document.getElementById('voice-transcript');

        // Track local state for chat UI to avoid global variables
        this.lastSpeaker = null;
        this.lastMessageElement = null;

        this.init();
    }

    init() {
        if (this.micBtn) {
            this.micBtn.addEventListener('click', () => this.handleMicToggle());
        }
    }

    async handleMicToggle() {
        const state = store.get('isVoiceActive');

        if (state) {
            await this.stopConnection();
        } else {
            await this.startConnection();
        }
    }

    async startConnection() {
        const summary = store.get('currentSummary');

        if (!summary) {
            alert("The document is still being analyzed. Please wait a moment.");
            return;
        }

        try {
            this.updateUIStatus("Connecting...", "Connecting to Gemini...");

            // Start session and attach the transcription listener
            const controller = await startVoiceSession(summary);

            // Use the new helper to attach listener safely (Refactoring "Monkey Patch")
            attachTranscriptionListener(controller, (type, text) => {
                this.handleTranscription(type, text);
            });

            store.setState({ isVoiceActive: true });
            this.container.classList.add('active');
            this.updateUIStatus("Stop Conversation", "Gemini is listening...", "🛑");

        } catch (error) {
            alert(error.message);
            this.updateUIStatus("Activate Voice Assistant", "Error: " + error.message, "🎙️");
        }
    }

    async stopConnection() {
        await stopVoiceSession();
        store.setState({ isVoiceActive: false });
        this.container.classList.remove('active');
        this.updateUIStatus("Activate Voice Assistant", "Ready to listen...", "🎙️");
    }

    updateUIStatus(btnText, statusMsg, icon = null) {
        if (this.statusText) this.statusText.innerText = statusMsg;

        if (this.micBtn) {
            const iconHtml = icon ? `<span class="mic-icon">${icon}</span>` : this.micBtn.querySelector('.mic-icon').outerHTML;
            this.micBtn.innerHTML = `
                <div class="btn-content">
                    ${iconHtml}
                    <span class="btn-text">${btnText}</span>
                </div>
            `;
        }
    }

    handleTranscription(type, text) {
        if (!this.transcriptBox || !text) return;

        // Clear empty state
        const emptyState = this.transcriptBox.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        const speaker = type === 'user' ? 'User' : 'Gemini';
        const cleanedText = text.trim();
        if (!cleanedText) return;

        // Append to last message if same speaker (Chat UI logic)
        if (this.lastSpeaker === speaker && this.lastMessageElement) {
            const contentSpan = this.lastMessageElement.querySelector('.content');
            if (contentSpan.innerText.slice(-cleanedText.length) !== cleanedText) {
                contentSpan.innerText += (contentSpan.innerText ? ' ' : '') + cleanedText;
            }
        } else {
            const div = document.createElement('div');
            div.className = `transcript-message ${type === 'user' ? 'user-message' : 'system-message'}`;
            div.innerHTML = `<span class="content">${cleanedText}</span>`;
            this.transcriptBox.appendChild(div);
            this.lastMessageElement = div;
            this.lastSpeaker = speaker;
        }

        this.transcriptBox.scrollTop = this.transcriptBox.scrollHeight;
    }
}
