import { NavigationController } from './ui/navigation.js';
import { uploadDocument } from './logic/storage.js';
import { generateDocumentSummary, generateVisualInfographic } from './logic/gemini.js';
import { startVoiceSession, stopVoiceSession, isVoiceActive } from './logic/voice.js';
import { marked } from 'marked';
import './assets/style.css';

// Global state for the current session
let currentFile = null;
let currentSummary = "";
let navigation = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DocuMind Initialized');

    // Initialize Navigation
    navigation = new NavigationController();

    // Setup File Upload Interactions
    setupFileUpload();

    // Setup Dashboard Interactions
    setupDashboardActions();

    // Setup Voice Interactions
    setupVoiceInteractions();

    // Setup Infographic Interactions
    setupInfographicActions();

    // Setup Quick Action Buttons (Post-upload)
    setupQuickActions();
});

function setupInfographicActions() {
    const downloadBtn = document.querySelector('#section-infographic .primary-btn');
    const redesignBtn = document.querySelector('#section-infographic .secondary-btn');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const img = document.querySelector('#infographic-canvas img');
            if (img) {
                const link = document.createElement('a');
                link.href = img.src;
                link.download = 'documind-infographic.png';
                link.click();
            } else {
                alert("No infographic available to download yet.");
            }
        });
    }

    if (redesignBtn) {
        redesignBtn.addEventListener('click', () => {
            const canvas = document.getElementById('infographic-canvas');
            if (canvas) {
                // Clear and force regeneration
                canvas.innerHTML = '<div class="initial-state"><p>Regenerating design...</p></div>';
                handleInfographicGeneration();
            }
        });
    }
}

function setupFileUpload() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const selectBtn = document.getElementById('select-files-btn');

    if (!selectBtn || !fileInput) return;

    selectBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            currentFile = file;
            handleFileUpload(file);
        }
    });

    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#1a73e8';
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = '#2d3748';
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/pdf') {
                currentFile = file;
                handleFileUpload(file);
            }
        });
    }
}

function setupDashboardActions() {
    const generateInfographicBtn = document.querySelector('.next-btn[data-next="infographic"]');
    if (generateInfographicBtn) {
        generateInfographicBtn.addEventListener('click', async () => {
            if (!currentFile) return;
            await handleInfographicGeneration();
        });
    }
}

function setupQuickActions() {
    const actionButtons = document.querySelectorAll('.action-card');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.getAttribute('data-goto');

            // If going to infographic, ensure it's generated
            if (targetSection === 'infographic') {
                handleInfographicGeneration();
            }

            navigation.navigateTo(targetSection);
        });
    });
}

function setupVoiceInteractions() {
    const micBtn = document.getElementById('activate-mic');
    const container = document.querySelector('.voice-experience-container');
    const statusText = document.querySelector('.voice-status');
    const transcriptBox = document.getElementById('voice-transcript');

    if (micBtn) {
        micBtn.addEventListener('click', async () => {
            if (isVoiceActive()) {
                await stopVoiceSession();
                container.classList.remove('active');
                if (statusText) statusText.innerText = "Ready to listen...";
                micBtn.innerHTML = `
                    <div class="btn-content">
                        <span class="mic-icon">🎙️</span>
                        <span class="btn-text">Activate Voice Assistant</span>
                    </div>
                `;
            } else {
                try {
                    if (!currentSummary) {
                        throw new Error("The document is still being analyzed. Please wait a moment.");
                    }

                    if (statusText) statusText.innerText = "Connecting to Gemini...";
                    micBtn.querySelector('.btn-text').innerText = "Connecting...";

                    let lastSpeaker = null;
                    let lastMessageElement = null;

                    const updateTranscription = (type, text) => {
                        if (!transcriptBox || !text) return;

                        // Clear empty state on first message
                        const emptyState = transcriptBox.querySelector('.empty-state');
                        if (emptyState) emptyState.remove();

                        const speaker = type === 'user' ? 'User' : 'Gemini';
                        const cleanedText = text.trim();
                        if (!cleanedText) return;

                        if (lastSpeaker === speaker && lastMessageElement) {
                            const contentSpan = lastMessageElement.querySelector('.content');
                            if (contentSpan.innerText.slice(-cleanedText.length) !== cleanedText) {
                                contentSpan.innerText += (contentSpan.innerText ? ' ' : '') + cleanedText;
                            }
                        } else {
                            const div = document.createElement('div');
                            div.className = `transcript-message ${type === 'user' ? 'user-message' : 'system-message'}`;
                            div.innerHTML = `<span class="content">${cleanedText}</span>`;
                            transcriptBox.appendChild(div);
                            lastMessageElement = div;
                            lastSpeaker = speaker;
                        }

                        transcriptBox.scrollTop = transcriptBox.scrollHeight;
                    };

                    await startVoiceSession(currentSummary, updateTranscription);

                    container.classList.add('active');
                    if (statusText) statusText.innerText = "Gemini is listening...";
                    micBtn.innerHTML = `
                        <div class="btn-content">
                            <span class="mic-icon">🛑</span>
                            <span class="btn-text">Stop Conversation</span>
                        </div>
                    `;
                } catch (error) {
                    alert(error.message);
                    if (statusText) statusText.innerText = "Error: " + error.message;
                    micBtn.innerHTML = `
                        <div class="btn-content">
                            <span class="mic-icon">🎙️</span>
                            <span class="btn-text">Activate Voice Assistant</span>
                        </div>
                    `;
                }
            }
        });
    }
}

async function handleFileUpload(file) {
    const progressContainer = document.getElementById('upload-progress');
    const progressBar = progressContainer.querySelector('.progress-bar-fill');
    const statusText = document.getElementById('status-text');
    const percentText = document.getElementById('progress-percent');
    const quickActions = document.getElementById('post-upload-actions');
    const uploadCard = document.getElementById('drop-zone');

    // Initially disable action buttons to avoid errors
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.style.opacity = '0.5';
        card.style.pointerEvents = 'none';
        card.style.cursor = 'wait';
        const span = card.querySelector('span');
        if (span && !span.dataset.original) {
            span.dataset.original = span.innerText;
            span.innerText = 'Analyzing...';
        }
    });

    if (uploadCard) uploadCard.classList.add('hidden');
    if (quickActions) quickActions.classList.remove('hidden');
    if (progressContainer) progressContainer.classList.remove('hidden');

    // Show PDF in the previewer
    const pdfFrame = document.getElementById('pdf-frame');
    const pdfPlaceholder = document.getElementById('pdf-no-preview');
    if (pdfFrame && pdfPlaceholder) {
        const fileURL = URL.createObjectURL(file);
        pdfFrame.src = fileURL;
        pdfFrame.style.display = 'block';
        pdfPlaceholder.style.display = 'none';
    }

    statusText.innerText = 'Uploading document to sync with Gemini...';

    try {
        // 1. First, we must upload the document to get a public URL for the Template Model
        const downloadURL = await uploadDocument(file, (progress) => {
            const displayProgress = Math.round(progress);
            if (progressBar) progressBar.style.width = `${displayProgress}%`;
            if (percentText) percentText.innerText = `${displayProgress}%`;
        });

        statusText.innerText = 'Gemini is extracting key technical points via Prompt Template...';

        // 2. Now we can generate the summary using the template and the voice context
        // We use the downloadURL for the summary (as requested by user template)
        // and the file object for the voice context (as it still uses multimodal parts)

        const summaryMarkdown = await generateDocumentSummary(downloadURL);

        currentSummary = summaryMarkdown;

        const summaryContainer = document.getElementById('summary-content');
        if (summaryContainer) {
            summaryContainer.innerHTML = marked.parse(summaryMarkdown);
        }

        // Enable action cards once analysis is ready
        actionCards.forEach(card => {
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
            card.style.cursor = 'pointer';
            card.style.borderColor = 'var(--accent-blue)';
            const span = card.querySelector('span');
            if (span && span.dataset.original) {
                span.innerText = span.dataset.original;
            }
        });

        statusText.innerText = 'Analysis complete! Select a tool below to explore.';

    } catch (error) {
        statusText.innerText = 'AI Analysis failed: ' + error.message;
        console.error('Core process failed:', error);
    }
}

async function handleInfographicGeneration() {
    const infographicCanvas = document.getElementById('infographic-canvas');
    if (!infographicCanvas || !currentFile) return;

    // Check if we need to generate (if empty, initial-state, or showing an error)
    const needsGeneration =
        infographicCanvas.querySelector('.initial-state') ||
        infographicCanvas.querySelector('.error-text') ||
        infographicCanvas.innerHTML.trim() === '';

    if (needsGeneration) {
        infographicCanvas.innerHTML = `
            <div class="loading-overlay">
                <div class="spinner"></div>
                <p>Gemini is drawing your infographic...</p>
            </div>
        `;

        try {
            const imageData = await generateVisualInfographic(currentFile);
            infographicCanvas.innerHTML = `
                <div class="infographic-wrapper">
                    <img src="data:${imageData.mimeType};base64,${imageData.data}" alt="AI Generated Infographic">
                </div>
            `;
        } catch (error) {
            infographicCanvas.innerHTML = `
                <div class="error-text">
                    Failed to generate infographic: ${error.message}
                </div>
            `;
        }
    }
}
