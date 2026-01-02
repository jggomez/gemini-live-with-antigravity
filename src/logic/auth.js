import { auth } from "../integration/firebase.js";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

/**
 * Initializes anonymous authentication for the session
 * @returns {Promise<User>} The authenticated user
 */
export async function initializeAuth() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("Authenticated as:", user.uid);
                resolve(user);
            }
        });

        signInAnonymously(auth).catch((error) => {
            console.error("Auth failed:", error);
            reject(error);
        });
    });
}
