import { NavigationController } from './ui/navigation.js';
import { DocumentController } from './controllers/DocumentController.js';
import { VoiceController } from './controllers/VoiceController.js';
import { InfographicController } from './controllers/InfographicController.js';
import './assets/style.css';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DocuMind Initialized');

    // Initialize Navigation
    const navigation = new NavigationController();

    // Initialize Domain Controllers
    new DocumentController();
    new VoiceController();
    new InfographicController();

    // Setup Quick Action Navigation (Post-upload)
    setupQuickActions(navigation);
});

function setupQuickActions(navigation) {
    const actionButtons = document.querySelectorAll('.action-card');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.getAttribute('data-goto');

            // Note: Infographic generation is now handled by InfographicController
            // checking the state or DOM when the section becomes active, 
            // OR we can explicitly trigger it here if we want to ensure it starts immediately.
            // For now, let's rely on the InfographicController's "Generate" button 
            // or we could add a store subscription in InfographicController to react to section changes?
            // Simpler approach: Just navigate. The user can click generate.
            // OR: We can trigger a click on the generate button if we want auto-start.

            if (targetSection === 'infographic') {
                // Dispatch a custom event or let the controller handle it?
                // For legacy behavior parity, let's try to trigger the generation if needed.
                // Better architecture: InfographicController should listen for navigation events or visibility changes.
                // For this refactor, let's keep it simple. The user might need to click "Generate" 
                // if coming from the dashboard, but the "next-btn" handles that in DocumentController?
                // Wait, the "next-btn" in dashboard has `data-next="infographic"`.
                // navigation.js handles `next-btn` clicks to navigate.

                // Let's modify InfographicController to auto-generate if active?
                // Or just let the user click the button.
                // The previous main.js called `handleInfographicGeneration()` on click.
                // The `InfographicController` has a `init` that listens to `.next-btn[data-next="infographic"]`.
                // BUT the action cards in `post-upload-actions` also traverse.

                const infographicControllerBtn = document.querySelector('.next-btn[data-next="infographic"]');
                if (infographicControllerBtn) infographicControllerBtn.click();
            }

            navigation.navigateTo(targetSection);
        });
    });
}
