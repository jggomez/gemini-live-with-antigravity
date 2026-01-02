import { imageModel, templateModel } from "../integration/firebase.js";

/**
 * Converts a File object to a Part object for Gemini AI
 * @param {File} file - The file to convert
 * @returns {Promise<Object>} - The Part object with base64 data
 */
export async function fileToGenerativePart(file) {
    const base64EncodedDataPromise = new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            data: await base64EncodedDataPromise,
            mimeType: file.type,
        },
    };
}

/**
 * Generates an executive summary of a PDF document using a prompt template in Gemini
 * @param {string} fileUrl - The public URL of the PDF file
 * @returns {Promise<string>} - The generated summary text
 */
export async function generateDocumentSummary(fileUrl) {
    try {
        // Use the prompt template created by the user
        const result = await templateModel.generateContent(
            'generatedocumentsummary-v100',
            {
                fileUrl: fileUrl,
            }
        );

        const response = result.response;
        return response.text() ?? "Could not generate summary.";
    } catch (error) {
        console.error("Gemini template analysis error:", error);
        throw new Error("Gemini analysis failed: " + error.message);
    }
}


/**
 * Generates a visual infographic image based on the PDF content
 * @param {File} file - The PDF file to analyze
 * @returns {Promise<Object>} - The image data (mimeType and base64 data)
 */
export async function generateVisualInfographic(file) {
    try {
        const prompt = `You are a world-class graphic designer specializing in technical infographics. 
        Analyze the attached document and CREATE A SINGLE IMAGE that visualizes its architecture, hierarchy, and key concepts.
        
        STYLE REQUIREMENTS:
        - Modern, minimalist, and professional.
        - Use a dark theme compatible with high-end tech presentations.
        - Use elegant gradients and clear icons.
        - Ensure text highlights are legible.
        
        OUTPUT: Return only the generated image as a multimodal response. Do not provide text explanations.`;

        const pdfPart = await fileToGenerativePart(file);

        // Gemini 2.5 Image model uses inlineDataParts() helper
        const result = await imageModel.generateContent([prompt, pdfPart]);
        const response = result.response;

        // Try using the official helper from the example
        const inlineDataParts = response.inlineDataParts();
        if (inlineDataParts && inlineDataParts.length > 0) {
            console.log("Infographic image successfully generated via inlineDataParts.");
            return inlineDataParts[0].inlineData;
        }

        throw new Error("Gemini returned a text response instead of an image. Ensure the prompt correctly instructs image generation.");
    } catch (error) {
        console.error("Infographic Failure:", error);
        throw new Error("Infographic Engine Error: " + error.message);
    }
}
