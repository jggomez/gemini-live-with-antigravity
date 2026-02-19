import { generateVisualInfographic } from "../logic/gemini.js";
import { store } from "../state/store.js";

export class InfographicController {
    constructor() {
        this.downloadBtn = document.querySelector('#section-infographic .primary-btn');
        this.redesignBtn = document.querySelector('#section-infographic .secondary-btn');
        this.generateBtn = document.querySelector('.next-btn[data-next="infographic"]');
        this.canvas = document.getElementById('infographic-canvas');

        this.init();
    }

    init() {
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.handleDownload());
        }

        if (this.redesignBtn) {
            this.redesignBtn.addEventListener('click', () => {
                this.updateCanvas('<div class="initial-state"><p>Regenerating design...</p></div>');
                this.handleGeneration();
            });
        }

        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', async () => {
                this.handleGeneration();
            });
        }

        // Also listen for navigation to this section? 
        // Logic moved to main.js navigation integration or handled by checking state
    }

    async handleGeneration() {
        const file = store.get('currentFile');
        if (!file || !this.canvas) return;

        // Check if generation is needed
        const needsGeneration =
            this.canvas.querySelector('.initial-state') ||
            this.canvas.querySelector('.error-text') ||
            this.canvas.innerHTML.trim() === '';

        if (!needsGeneration) return;

        store.setState({ infographicStatus: "generating" });
        this.updateCanvas(`
            <div class="loading-overlay">
                <div class="spinner"></div>
                <p>Gemini is drawing your infographic...</p>
            </div>
        `);

        try {
            const imageData = await generateVisualInfographic(file);

            this.updateCanvas(`
                <div class="infographic-wrapper">
                    <img src="data:${imageData.mimeType};base64,${imageData.data}" alt="AI Generated Infographic">
                </div>
            `);
            store.setState({ infographicStatus: "complete" });

        } catch (error) {
            store.setState({ infographicStatus: "error" });
            this.updateCanvas(`
                <div class="error-text">
                    Failed to generate infographic: ${error.message}
                </div>
            `);
        }
    }

    handleDownload() {
        const img = this.canvas?.querySelector('img');
        if (img) {
            const link = document.createElement('a');
            link.href = img.src;
            link.download = 'documind-infographic.png';
            link.click();
        } else {
            alert("No infographic available to download yet.");
        }
    }

    updateCanvas(html) {
        if (this.canvas) this.canvas.innerHTML = html;
    }
}
