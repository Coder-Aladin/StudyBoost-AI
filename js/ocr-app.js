/* ================================================
   OCR APPLICATION - VANILLA JAVASCRIPT
   ================================================ */

// DOM Elements
const dragDropZone = document.getElementById('dragDropZone');
const imageInput = document.getElementById('imageInput');
const uploadBtn = document.getElementById('uploadBtn');
const uploadBtnSecondary = document.getElementById('uploadBtnSecondary');
const extractBtn = document.getElementById('extractBtn');
const generateNotesBtn = document.getElementById('generateNotesBtn');
const copyBtn = document.getElementById('copyBtn');
const resetBtn = document.getElementById('resetBtn');
const toastMessage = document.getElementById('toastMessage');

const previewCard = document.getElementById('previewCard');
const imageGrid = document.getElementById('imageGrid');
const floatingPreviewImage = document.getElementById('floatingPreviewImage');
const previewCount = document.getElementById('previewCount');
const errorMessage = document.getElementById('errorMessage');

const processingSection = document.getElementById('processingSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const processingStatus = document.getElementById('processingStatus');

const outputSection = document.getElementById('outputSection');
const textOutput = document.getElementById('textOutput');
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');
const confidenceScore = document.getElementById('confidenceScore');
const copySuccess = document.getElementById('copySuccess');

// State Management
const state = {
    imageFiles: [],
    extractedText: '',
    isProcessing: false,
    confidence: 0
};

// Supported image types
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 6;

/* ================================================
   EVENT LISTENERS - UPLOAD HANDLING
   ================================================ */

uploadBtn.addEventListener('click', () => imageInput.click());
uploadBtnSecondary.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', (e) => {
    handleMultipleFiles(e.target.files);
});

dragDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragDropZone.classList.add('dragover');
});

dragDropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragDropZone.classList.remove('dragover');
});

dragDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDropZone.classList.remove('dragover');
    handleMultipleFiles(e.dataTransfer.files);
});

imageGrid.addEventListener('click', (event) => {
    const button = event.target.closest('.btn-remove-image');
    if (!button) return;
    const index = Number(button.dataset.index);
    removeImage(index);
});

extractBtn.addEventListener('click', startOCRExtraction);
generateNotesBtn.addEventListener('click', redirectToNotesPage);
copyBtn.addEventListener('click', copyExtractedText);
resetBtn.addEventListener('click', clearAll);

/* ================================================
   IMAGE UPLOAD HANDLERS
   ================================================ */

function handleMultipleFiles(fileList) {
    hideError();
    const files = Array.from(fileList).slice(0, MAX_IMAGES - state.imageFiles.length);

    if (files.length === 0) {
        showError(`You can upload up to ${MAX_IMAGES} images at once.`);
        return;
    }

    files.forEach((file) => {
        if (!SUPPORTED_TYPES.includes(file.type)) {
            showError('❌ Unsupported file type. Please upload JPG, PNG, GIF, or WebP images.');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            showError('❌ File size exceeds 10MB limit. Please choose a smaller image.');
            return;
        }

        state.imageFiles.push(file);
    });

    if (state.imageFiles.length > 0) {
        renderImageGallery();
        extractBtn.disabled = false;
    }
}

function renderImageGallery() {
    if (state.imageFiles.length === 0) {
        previewCard.style.display = 'none';
        imageGrid.style.display = 'none';
        return;
    }

    previewCard.style.display = 'block';
    imageGrid.style.display = 'grid';
    previewCount.textContent = `${state.imageFiles.length} page(s) selected`;

    const firstFile = state.imageFiles[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        floatingPreviewImage.src = event.target.result;
    };
    reader.readAsDataURL(firstFile);

    imageGrid.innerHTML = state.imageFiles
        .map((file, index) => {
            const objectURL = URL.createObjectURL(file);
            return `
                <div class="image-card">
                    <img src="${objectURL}" alt="Uploaded page ${index + 1} preview">
                    <button class="btn-remove-image" data-index="${index}" aria-label="Remove page ${index + 1}">✕</button>
                    <div class="image-card-label">Page ${index + 1}</div>
                </div>
            `;
        })
        .join('');

    dragDropZone.style.display = 'none';
}

function removeImage(index) {
    state.imageFiles.splice(index, 1);
    if (state.imageFiles.length === 0) {
        clearAll();
        return;
    }
    renderImageGallery();
}

function clearAll() {
    state.imageFiles = [];
    state.extractedText = '';
    state.confidence = 0;
    imageInput.value = '';
    previewCard.style.display = 'none';
    imageGrid.style.display = 'none';
    dragDropZone.style.display = 'block';
    extractBtn.disabled = true;
    outputSection.style.display = 'none';
    processingSection.style.display = 'none';
    textOutput.textContent = '';
    charCount.textContent = '0';
    wordCount.textContent = '0';
    confidenceScore.textContent = '0%';
    hideError();
}

/* ================================================
   OCR EXTRACTION HANDLER
   ================================================ */

async function startOCRExtraction() {
    if (state.imageFiles.length === 0 || state.isProcessing) {
        return;
    }

    state.isProcessing = true;
    extractBtn.disabled = true;
    processingSection.style.display = 'block';
    outputSection.style.display = 'none';
    hideError();
    updateProgress(0);

    try {
        const { createWorker } = Tesseract;
        const worker = await createWorker();
        worker.on('progress', handleOCRProgress);

        updateProcessingStatus('Loading language pack...');
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');

        const results = [];
        let totalConfidence = 0;

        for (let index = 0; index < state.imageFiles.length; index += 1) {
            const file = state.imageFiles[index];
            updateProcessingStatus(`Scanning page ${index + 1} of ${state.imageFiles.length}...`);
            const { data } = await worker.recognize(file);
            results.push(data.text);
            totalConfidence += data.confidence || 0;
        }

        await worker.terminate();

        const combinedText = results.filter(Boolean).join('\n\n---\n\n');
        const averageConfidence = state.imageFiles.length > 0 ? totalConfidence / state.imageFiles.length : 0;
        processOCRResults(combinedText, averageConfidence);
    } catch (error) {
        handleOCRError(error);
    } finally {
        state.isProcessing = false;
        extractBtn.disabled = false;
    }
}

function handleOCRProgress(progress) {
    const percentage = Math.round((progress.progress || 0) * 100);
    updateProgress(percentage);

    if (progress.status) {
        updateProcessingStatus(`${progress.status.replace(/_/g, ' ')}...`);
    }
}

function updateProgress(percentage) {
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;
}

function updateProcessingStatus(message) {
    processingStatus.textContent = message;
}

function processOCRResults(text, confidence) {
    if (!text || text.trim() === '') {
        showError('⚠️ No text detected in the images. Try a different upload or improve lighting.');
        processingSection.style.display = 'none';
        return;
    }

    state.extractedText = text;
    state.confidence = confidence;
    displayOCRResults(text, confidence);
}

function displayOCRResults(text, confidence) {
    textOutput.textContent = text;
    const stats = calculateTextStats(text);
    charCount.textContent = stats.characters;
    wordCount.textContent = stats.words;
    confidenceScore.textContent = `${Math.round(confidence * 100)}%`;

    processingSection.style.display = 'none';
    outputSection.style.display = 'block';
    generateNotesBtn.disabled = false;
    setTimeout(() => outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
}

function calculateTextStats(text) {
    const characters = text.length;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return { characters, words };
}

function handleOCRError(error) {
    console.error('OCR Error:', error);
    processingSection.style.display = 'none';
    showError('❌ An error occurred during OCR processing. Try another image or reload the page.');
}

/* ================================================
   OUTPUT SECTION HANDLERS
   ================================================ */

function copyExtractedText() {
    if (!state.extractedText) {
        showError('No extracted text to copy yet.');
        return;
    }

    navigator.clipboard.writeText(state.extractedText).then(() => {
        copySuccess.style.display = 'block';
        copyBtn.innerHTML = '<span class="copy-icon">✓</span><span class="copy-text">Copied!</span>';
        setTimeout(() => {
            copySuccess.style.display = 'none';
            copyBtn.innerHTML = '<span class="copy-icon">📋</span><span class="copy-text">Copy</span>';
        }, 2000);
    }).catch((error) => {
        console.error('Copy error:', error);
        showError('❌ Unable to copy text. Please try again.');
    });
}

function redirectToNotesPage() {
    if (!state.extractedText) {
        showError('Extract OCR text first before generating notes.');
        return;
    }

    sessionStorage.setItem('studyboost_ocr_text', state.extractedText);
    window.location.href = 'generate-notes.html';
}

/* ================================================
   UTILITY FUNCTIONS
   ================================================ */

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

function showToast(message) {
    if (!toastMessage) return;
    toastMessage.textContent = message;
    toastMessage.classList.add('toast-visible');
    setTimeout(() => {
        toastMessage.classList.remove('toast-visible');
    }, 2200);
}

function initializeApp() {
    if (typeof Tesseract === 'undefined') {
        showError('❌ Tesseract.js failed to load. Refresh the page to retry.');
        return;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
