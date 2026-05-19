const sourcePreview = document.getElementById('sourcePreview');
const generateNotesBtn = document.getElementById('generateNotesBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const resetSessionBtn = document.getElementById('resetSessionBtn');
const aiStatus = document.getElementById('aiStatus');
const generatedCard = document.getElementById('generatedCard');
const notesOutput = document.getElementById('notesOutput');
const copySummaryBtn = document.getElementById('copySummaryBtn');
const toastMessage = document.getElementById('toastMessage');
const imageUploadPreview = document.getElementById('imageUploadPreview');
const imagePreview = document.getElementById('imagePreview');
const removeImageFromNotes = document.getElementById('removeImageFromNotes');

let generatedNotes = null;
let sourceText = '';
let imageData = '';

async function initNotesPage() {
  sourceText = sessionStorage.getItem('studyboost_ocr_text') || '';
  imageData = sessionStorage.getItem('studyboost_image_data') || '';

  if (!sourceText && !imageData) {
    window.location.href = 'ocr-tool.html';
    return;
  }

  if (imageData) {
    if (!sourceText) {
      // Hide image card and show only status card during extraction
      if (imageUploadPreview) imageUploadPreview.style.display = 'none';
      aiStatus.textContent = 'Extracting text from uploaded image...';
      sourceText = await extractTextFromImage(imageData);
      if (!sourceText) {
        aiStatus.textContent = 'Unable to extract text from the uploaded image.';
        // Show image card again if extraction fails
        showImagePreview(imageData);
        return;
      }
      sessionStorage.setItem('studyboost_ocr_text', sourceText);
    } else {
      // If text already exists, show image preview
      showImagePreview(imageData);
    }
  }

  sourcePreview.textContent = sourceText;
}

function showImagePreview(dataUrl) {
  if (!imageUploadPreview || !imagePreview || !removeImageFromNotes) return;
  imagePreview.src = dataUrl;
  imageUploadPreview.style.display = 'block';
  removeImageFromNotes.style.display = 'inline-flex';
}

async function extractTextFromImage(imageUrl) {
  try {
    const worker = Tesseract.createWorker({
      logger: (m) => {
        if (m.status === 'recognizing text') {
          aiStatus.textContent = `Extracting text: ${Math.round(m.progress * 100)}%`;
        }
      }
    });

    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(imageUrl);
    await worker.terminate();

    return text.trim();
  } catch (error) {
    console.error('OCR extraction failed:', error);
    return '';
  }
}

function showToast(message) {
  toastMessage.textContent = message;
  toastMessage.classList.add('toast-visible');
  setTimeout(() => {
    toastMessage.classList.remove('toast-visible');
  }, 2400);
}

async function generateSmartNotes() {
  if (!sourceText || generateNotesBtn.disabled) return;

  generateNotesBtn.disabled = true;
  downloadPdfBtn.disabled = true;
  // Hide image card during processing, show only status card
  if (imageUploadPreview) imageUploadPreview.style.display = 'none';
  aiStatus.textContent = 'Sending OCR text to Gemini AI...';
  generatedCard.style.display = 'none';
  notesOutput.innerHTML = '';

  try {
    const response = await fetch('/api/generate-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: sourceText })
    });

    if (!response.ok) {
      throw new Error('Could not reach notes service.');
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.message || 'Gemini API returned an invalid response.');
    }

    generatedNotes = result.data;
    displayGeneratedNotes(result.data);
    downloadPdfBtn.disabled = false;
    aiStatus.textContent = 'Smart notes are ready. Review and download your PDF.';
    showToast('Notes generated successfully');
  } catch (error) {
    console.error(error);
    aiStatus.textContent = 'Unable to generate notes. Please try again.';
    showToast('Failed to generate notes.');
  } finally {
    generateNotesBtn.disabled = false;
  }
}

function displayGeneratedNotes(data) {
  generatedCard.style.display = 'block';
  const summaryHtml = data.summary ? `<div class="notes-section"><h4>Summary</h4><p>${escapeHtml(data.summary)}</p></div>` : '';
  const notesHtml = data.notes ? `<div class="notes-section"><h4>Bullet Notes</h4><p>${escapeHtml(data.notes)}</p></div>` : '';
  const keyPointsHtml = data.keyPoints ? `<div class="notes-section"><h4>Key Points</h4><p>${escapeHtml(data.keyPoints)}</p></div>` : '';
  const conceptsHtml = data.importantConcepts ? `<div class="notes-section"><h4>Important Concepts</h4><p>${escapeHtml(data.importantConcepts)}</p></div>` : '';
  const tipsHtml = data.examTips ? `<div class="notes-section"><h4>Exam Tips</h4><p>${escapeHtml(data.examTips)}</p></div>` : '';

  notesOutput.innerHTML = `
    <div class="notes-card-title">${escapeHtml(data.title || 'Smart Study Notes')}</div>
    ${summaryHtml}
    ${notesHtml}
    ${keyPointsHtml}
    ${conceptsHtml}
    ${tipsHtml}
  `;
}

function copySummary() {
  if (!generatedNotes || !generatedNotes.summary) {
    showToast('No summary to copy yet.');
    return;
  }

  navigator.clipboard.writeText(generatedNotes.summary).then(() => {
    showToast('Summary copied to clipboard');
  }).catch(() => {
    showToast('Unable to copy summary');
  });
}

function escapeHtml(text) {
  const element = document.createElement('div');
  element.textContent = text;
  return element.innerHTML.replace(/\n/g, '<br>');
}

function generatePdf() {
  if (!generatedNotes) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  const maxWidth = 520;
  let currentY = 60;

  doc.setFontSize(18);
  doc.setTextColor('#4F46E5');
  doc.text(generatedNotes.title || 'StudyBoost AI Notes', margin, currentY);
  currentY += 30;

  doc.setFontSize(11);
  doc.setTextColor('#94A3B8');
  doc.text('Generated by StudyBoost AI • Clean study notes for faster review', margin, currentY);
  currentY += 28;

  currentY = addPdfSection(doc, 'Summary', generatedNotes.summary, currentY, margin, maxWidth);
  currentY = addPdfSection(doc, 'Bullet Notes', generatedNotes.notes, currentY, margin, maxWidth);
  currentY = addPdfSection(doc, 'Key Points', generatedNotes.keyPoints, currentY, margin, maxWidth);
  currentY = addPdfSection(doc, 'Important Concepts', generatedNotes.importantConcepts, currentY, margin, maxWidth);
  currentY = addPdfSection(doc, 'Exam Tips', generatedNotes.examTips, currentY, margin, maxWidth);

  doc.save('StudyBoostAI-Notes.pdf');
}

function addPdfSection(doc, title, content, y, margin, maxWidth) {
  if (!content) return y;

  if (y > 700) {
    doc.addPage();
    y = 60;
  }

  doc.setFontSize(14);
  doc.setTextColor('#FFFFFF');
  doc.text(title, margin, y);
  y += 18;

  doc.setFontSize(11);
  doc.setTextColor('#D1D5DB');
  const wrapped = doc.splitTextToSize(content, maxWidth);
  doc.text(wrapped, margin, y);
  y += wrapped.length * 14 + 14;

  return y;
}

function resetSession() {
  sessionStorage.removeItem('studyboost_ocr_text');
  sessionStorage.removeItem('studyboost_image_data');
  window.location.href = 'ocr-tool.html';
}

function removeImagePreview() {
  sessionStorage.removeItem('studyboost_image_data');
  imageData = '';
  if (imageUploadPreview) imageUploadPreview.style.display = 'none';
  if (sourcePreview) sourcePreview.textContent = '';
  showToast('Image removed. Upload again to continue.');
}

generateNotesBtn.addEventListener('click', generateSmartNotes);
downloadPdfBtn.addEventListener('click', generatePdf);
copySummaryBtn.addEventListener('click', copySummary);
resetSessionBtn.addEventListener('click', resetSession);
if (removeImageFromNotes) {
  removeImageFromNotes.addEventListener('click', removeImagePreview);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNotesPage);
} else {
  initNotesPage();
}
