import test from 'node:test';
import assert from 'node:assert';
import { mock } from 'node:test';

// --- Mocks Setup ---

// Mock FileReader (Browser API)
global.FileReader = class {
    constructor() {
        this.onloadend = null;
        this.onerror = null;
        this.result = null;
    }
    readAsDataURL(file) {
        // Simulate successful reading
        setTimeout(() => {
            this.result = 'data:application/pdf;base64,mockBase64Data';
            if (this.onloadend) this.onloadend();
        }, 0);
    }
};

// Mock Firebase models
const mockTemplateModel = {
    generateContent: mock.fn(async (templateId, data) => ({
        response: {
            text: () => `Summary for ${data.fileUrl}`
        }
    }))
};

const mockImageModel = {
    generateContent: mock.fn(async (parts) => ({
        response: {
            inlineDataParts: () => [
                {
                    inlineData: {
                        data: 'mockImageBase64',
                        mimeType: 'image/png'
                    }
                }
            ]
        }
    }))
};

// Register mocks for the integration layer
mock.module('../../src/integration/firebase.js', {
    namedExports: {
        templateModel: mockTemplateModel,
        imageModel: mockImageModel
    }
});

// --- Dynamic Import of logic/gemini.js ---
const { fileToGenerativePart, generateDocumentSummary, generateVisualInfographic } = await import('../../src/logic/gemini.js');

// --- Tests ---

test('fileToGenerativePart - should convert file to base64 part', async (t) => {
    const mockFile = {
        type: 'application/pdf',
        name: 'document.pdf'
    };

    const result = await fileToGenerativePart(mockFile);

    assert.strictEqual(result.inlineData.mimeType, 'application/pdf');
    assert.strictEqual(result.inlineData.data, 'mockBase64Data');
});

test('generateDocumentSummary - should return summary text on success', async (t) => {
    const fileUrl = 'https://example.com/doc.pdf';

    const summary = await generateDocumentSummary(fileUrl);

    assert.strictEqual(summary, `Summary for ${fileUrl}`);
    assert.strictEqual(mockTemplateModel.generateContent.mock.calls.length, 1);
    assert.strictEqual(mockTemplateModel.generateContent.mock.calls[0].arguments[0], 'generatedocumentsummary-v100');
    assert.deepStrictEqual(mockTemplateModel.generateContent.mock.calls[0].arguments[1], { fileUrl });
});

test('generateDocumentSummary - should throw error on failure', async (t) => {
    const consoleMock = t.mock.method(console, 'error', () => { });

    // Temporarily override the mock to fail
    const originalGenerateContent = mockTemplateModel.generateContent;
    mockTemplateModel.generateContent = mock.fn(async () => {
        throw new Error('API Error');
    });

    await assert.rejects(
        async () => await generateDocumentSummary('url'),
        { message: 'Gemini analysis failed: API Error' }
    );

    // Restore
    mockTemplateModel.generateContent = originalGenerateContent;
});

test('generateVisualInfographic - should return infographic data on success', async (t) => {
    const mockFile = {
        type: 'application/pdf',
        name: 'infra.pdf'
    };

    const result = await generateVisualInfographic(mockFile);

    assert.strictEqual(result.data, 'mockImageBase64');
    assert.strictEqual(result.mimeType, 'image/png');
    assert.strictEqual(mockImageModel.generateContent.mock.calls.length, 1);
});

test('generateVisualInfographic - should throw error if no image is returned', async (t) => {
    t.mock.method(console, 'error', () => { });

    // Override to return empty parts
    const originalGenerateContent = mockImageModel.generateContent;
    mockImageModel.generateContent = mock.fn(async () => ({
        response: {
            inlineDataParts: () => []
        }
    }));

    await assert.rejects(
        async () => await generateVisualInfographic({ type: 'pdf' }),
        { message: /Gemini returned a text response instead of an image/ }
    );

    mockImageModel.generateContent = originalGenerateContent;
});
