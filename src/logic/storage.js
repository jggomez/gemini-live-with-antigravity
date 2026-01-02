import { storage } from "../integration/firebase.js";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

/**
 * Uploads a document to Firebase Storage with progress tracking
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<string>} - The download URL of the uploaded file
 */
export async function uploadDocument(file, onProgress) {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `documents/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);
            },
            (error) => {
                console.error("Storage upload error:", error);
                reject(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            }
        );
    });
}
