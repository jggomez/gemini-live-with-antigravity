import { uploadDocument } from "../logic/storage.js";
import { generateDocumentSummary } from "../logic/gemini.js";
import { store } from "../state/store.js";
import { marked } from 'marked';

export class DocumentController {
    constructor() {
        this.dropZone = document.getElementById('drop-zone');
        this.fileInput = document.getElementById('file-input');
        this.selectBtn = document.getElementById('select-files-btn');
        this.summaryContainer = document.getElementById('summary-content');
        this.pdfFrame = document.getElementById('pdf-frame');
        this.pdfPlaceholder = document.getElementById('pdf-no-preview');

        // UI Elements for progress
        this.progressContainer = document.getElementById('upload-progress');
        this.progressBar = this.progressContainer?.querySelector('.progress-bar-fill');
        this.statusText = document.getElementById('status-text');
        this.percentText = document.getElementById('progress-percent');
        this.quickActions = document.getElementById('post-upload-actions');
        this.uploadCard = document.getElementById('drop-zone');
        this.actionCards = document.querySelectorAll('.action-card');

        this.init();
    }

    init() {
        if (this.selectBtn && this.fileInput) {
            this.selectBtn.addEventListener('click', () => this.fileInput.click());
            this.fileInput.addEventListener('change', (e) => this.handleFileSelection(e.target.files[0]));
        }

        if (this.dropZone) {
            this.dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.dropZone.style.borderColor = '#1a73e8';
            });
            this.dropZone.addEventListener('dragleave', () => {
                this.dropZone.style.borderColor = '#2d3748';
            });
            this.dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                this.handleFileSelection(e.dataTransfer.files[0]);
            });
        }
    }

    async handleFileSelection(file) {
        if (!file || file.type !== 'application/pdf') return;

        store.setState({ currentFile: file, analysisStatus: "uploading" });
        this.updateUIForUploadStart(file);

        try {
            this.updateStatus('Uploading document to sync with Gemini...');

            // Upload
            const downloadURL = await uploadDocument(file, (progress) => {
                this.updateProgress(progress);
            });

            store.setState({ analysisStatus: "analyzing" });
            this.updateStatus('Gemini is extracting key technical points via Prompt Template...');

            // Analyze
            const summaryMarkdown = await generateDocumentSummary(downloadURL);
            store.setState({ currentSummary: summaryMarkdown, analysisStatus: "complete" });

            // Update UI
            if (this.summaryContainer) {
                this.summaryContainer.innerHTML = marked.parse(summaryMarkdown);
            }

            this.updateUIForCompletion();
            this.updateStatus('Analysis complete! Select a tool below to explore.');

        } catch (error) {
            store.setState({ analysisStatus: "error" });
            this.updateStatus('AI Analysis failed: ' + error.message);
            console.error('Document processing failed:', error);
        }
    }

    updateUIForUploadStart(file) {
        // Disable actions
        this.actionCards.forEach(card => {
            card.style.opacity = '0.5';
            card.style.pointerEvents = 'none';
            card.style.cursor = 'wait';
            const span = card.querySelector('span');
            if (span && !span.dataset.original) {
                span.dataset.original = span.innerText;
                span.innerText = 'Analyzing...';
            }
        });

        if (this.uploadCard) this.uploadCard.classList.add('hidden');
        if (this.quickActions) this.quickActions.classList.remove('hidden');
        if (this.progressContainer) this.progressContainer.classList.remove('hidden');

        // Show PDF
        if (this.pdfFrame && this.pdfPlaceholder) {
            const fileURL = URL.createObjectURL(file);
            this.pdfFrame.src = fileURL;
            this.pdfFrame.style.display = 'block';
            this.pdfPlaceholder.style.display = 'none';
        }
    }

    updateProgress(progress) {
        const displayProgress = Math.round(progress);
        store.setState({ uploadProgress: displayProgress });
        if (this.progressBar) this.progressBar.style.width = `${displayProgress}%`;
        if (this.percentText) this.percentText.innerText = `${displayProgress}%`;
    }

    updateStatus(text) {
        if (this.statusText) this.statusText.innerText = text;
    }

    updateUIForCompletion() {
        this.actionCards.forEach(card => {
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
            card.style.cursor = 'pointer';
            card.style.borderColor = 'var(--accent-blue)';
            const span = card.querySelector('span');
            if (span && span.dataset.original) {
                span.innerText = span.dataset.original;
            }
        });
    }
}
