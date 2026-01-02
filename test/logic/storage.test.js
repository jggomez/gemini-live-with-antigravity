import test from 'node:test';
import assert from 'node:assert';
import { mock } from 'node:test';

// 1. Setup all mocks BEFORE importing the file under test
// Mock the local firebase integration
mock.module('../../src/integration/firebase.js', {
    namedExports: {
        storage: { mockStorage: true }
    }
});

// Mock the firebase storage dependency
const mockRef = mock.fn(() => ({ ref: 'mock-ref' }));
const mockGetDownloadURL = mock.fn(async () => 'https://mock-download-url.com');

// Define a helper for the upload task simulation
const createMockUploadTask = (shouldFail = false) => {
    const listeners = {};
    const task = {
        snapshot: { ref: { path: 'documents/fake-path' } },
        on: mock.fn((event, progressCb, errorCb, completeCb) => {
            listeners.progress = progressCb;
            listeners.error = errorCb;
            listeners.complete = completeCb;

            // Simulate progress immediately if not failing
            if (!shouldFail) {
                // Use process.nextTick or setImmediate to avoid race conditions
                setImmediate(() => {
                    if (listeners.progress) {
                        listeners.progress({ bytesTransferred: 50, totalBytes: 100 });
                        listeners.progress({ bytesTransferred: 100, totalBytes: 100 });
                    }
                    if (listeners.complete) {
                        listeners.complete();
                    }
                });
            } else {
                setImmediate(() => {
                    if (listeners.error) {
                        listeners.error(new Error('Mock upload failed'));
                    }
                });
            }
        })
    };
    return task;
};

let currentUploadTask = null;
const mockUploadBytesResumable = mock.fn((refParam, fileParam) => {
    return currentUploadTask;
});

mock.module('firebase/storage', {
    namedExports: {
        ref: mockRef,
        uploadBytesResumable: mockUploadBytesResumable,
        getDownloadURL: mockGetDownloadURL
    }
});

// 2. Import the module dynamically to ensure mocks are active
const { uploadDocument } = await import('../../src/logic/storage.js');

test('uploadDocument - successful upload', async (t) => {
    const mockFile = { name: 'test.pdf' };
    const onProgress = mock.fn();

    currentUploadTask = createMockUploadTask(false);

    const url = await uploadDocument(mockFile, onProgress);

    assert.strictEqual(url, 'https://mock-download-url.com');
    assert.strictEqual(onProgress.mock.calls.length, 2);
    assert.strictEqual(onProgress.mock.calls[0].arguments[0], 50);
    assert.strictEqual(onProgress.mock.calls[1].arguments[0], 100);
});

test('uploadDocument - handling error', async (t) => {
    // Mock console.error to avoid messy output for an expected error
    t.mock.method(console, 'error', () => { });

    const mockFile = { name: 'error.pdf' };
    currentUploadTask = createMockUploadTask(true);

    await assert.rejects(
        async () => await uploadDocument(mockFile),
        { message: 'Mock upload failed' }
    );
});
