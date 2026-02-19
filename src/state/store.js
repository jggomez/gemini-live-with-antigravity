/**
 * Central State Store
 * Manages application state using a simple subscription pattern.
 */

class Store {
    constructor() {
        this.state = {
            currentFile: null,
            currentSummary: "",
            isVoiceActive: false,
            uploadProgress: 0,
            analysisStatus: "idle", // idle, uploading, analyzing, complete, error
            infographicStatus: "idle" // idle, generating, complete, error
        };
        this.listeners = new Set();
    }

    /**
     * Get a specific state value
     * @param {string} key 
     */
    get(key) {
        return this.state[key];
    }

    /**
     * Update state and notify listeners
     * @param {Object} partialState 
     */
    setState(partialState) {
        this.state = { ...this.state, ...partialState };
        this.notify();
    }

    /**
     * Subscribe to state changes
     * @param {Function} listener 
     * @returns {Function} unsubscribe function
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

// Export a singleton instance
export const store = new Store();
