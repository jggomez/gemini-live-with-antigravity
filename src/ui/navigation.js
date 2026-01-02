/**
 * UI Navigation Controller
 * Manages the transitions between different sections of the SPA
 */

export class NavigationController {
    constructor() {
        this.sections = document.querySelectorAll('.app-section');
        this.navLinks = document.querySelectorAll('.nav-links a');
        this.nextButtons = document.querySelectorAll('.next-btn');

        this.init();
    }

    init() {
        // Handle Top Navigation Clicks
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('data-section');
                this.navigateTo(sectionId);
            });
        });

        // Handle "Next Step" Button Clicks
        this.nextButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const nextSectionId = btn.getAttribute('data-next');
                this.navigateTo(nextSectionId);
            });
        });
    }

    navigateTo(sectionId) {
        // Validation: Don't navigate to dashboard if no file is uploaded (optional logic later)

        // Hide all sections
        this.sections.forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(`section-${sectionId}`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update Nav Menu active state
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
