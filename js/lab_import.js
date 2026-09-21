/**
 * SMART LAB & DOCUMENT IMPORT CONTROLLER (AI Multimodal & Client-Side PDF Parser)
 * รองรับการนำเข้าภาพถ่ายสลิปแล็บ / เอกสาร PDF สูงสุด 10 รูป พร้อมมาตรการ PDPA Zero-Retention
 * พัฒนาโดย นพ.ธนภพ การุญ วิทยาลัยแพทยศาสตร์และการสาธารณสุข มหาวิทยาลัยอุบลราชธานี
 */

let activeLabEngine = 'gemini'; // 'gemini' | 'pdfjs'
let currentLabFiles = []; // Array of { id, file, name, size, type, objectUrl, base64, dataUrl } (max 10)
let currentPreviewIndex = 0;
let currentExtractedData = {};
let originalUnmaskedData = {};

function initLabImport() {
  // Load stored Gemini API Key
  const savedKey = localStorage.getItem('gemini_api_key') || '';
  const keyInput = document.getElementById('gemini-api-key-input');
  const statusSpan = document.getElementById('gemini-key-status');
  if (keyInput) keyInput.value = savedKey;
  if (statusSpan) {
    if (savedKey) {
      statusSpan.innerText = '✅ บันทึก Key แล้ว (' + savedKey.substring(0, 6) + '...)';
      statusSpan.style.color = '#15803d';
    } else {
      statusSpan.innerText = '(ยังไม่ได้ระบุ Key - ใช้ PDF Parser แบบออฟไลน์ได้)';
      statusSpan.style.color = '#b45309';
    }
  }

  // Setup drag & drop on dropzone
  const dropzone = document.getElementById('lab-dropzone');
  if (dropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      }, false);
    });

    dropzone.addEventListener('drop', function(e) {
      const dt = e.dataTransfer;
      const files = dt ? dt.files : null;
      if (files && files.length > 0) {
        handleIncomingFiles(files);
      }
    }, false);
  }

  // Global Paste Listener (Ctrl+V / Cmd+V)
  window.addEventListener('paste', function(e) {
    if (e.clipboardData && e.clipboardData.items) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            openLabImportModal();
            handleIncomingFiles([file]);
          }
          return;
        }
      }
    }
  });
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLabImport);
} else {
  initLabImport();
}

function openLabImportModal() {
  const modal = document.getElementById('lab-import-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  const reviewArea = document.getElementById('lab-review-area');
  const isReview = reviewArea && reviewArea.style.display !== 'none';
  if (typeof updateLabModalFooterState === 'function') {
    updateLabModalFooterState(isReview ? 'review' : 'queue');
  }
}

function closeLabImportModal() {
  const modal = document.getElementById('lab-import-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
  purgeLabMemory();
  if (typeof updateLabModalFooterState === 'function') {
    updateLabModalFooterState('queue');
  }
}

function handleLabImportBackdropClick(e) {
  if (e && e.target && e.target.id === 'lab-import-modal') {
    closeLabImportModal();
  }
}

function triggerFileSelect() {
  const fileInput = document.getElementById('lab-file-input');
  if (fileInput) fileInput.click();
}

function triggerCameraCapture() {
  const camInput = document.getElementById('lab-camera-input');
  if (camInput) camInput.click();
}

function handleFileInputChange(e) {
  if (e && e.target && e.target.files && e.target.files.length > 0) {
    handleIncomingFiles(e.target.files);
  }
}

function switchLabEngine(engine) {
  activeLabEngine = engine;
  const btnGemini = document.getElementById('btn-engine-gemini');
  const btnPdfjs = document.getElementById('btn-engine-pdfjs');
  const configBox = document.getElementById('lab-gemini-config-box');

  if (engine === 'gemini') {
    if (btnGemini) btnGemini.classList.add('active');
    if (btnPdfjs) btnPdfjs.classList.remove('active');
    if (configBox) configBox.style.display = 'block';
  } else {
    if (btnPdfjs) btnPdfjs.classList.add('active');
    if (btnGemini) btnGemini.classList.remove('active');
    if (configBox) configBox.style.display = 'none';
  }
}

function saveGeminiApiKey() {
  const input = document.getElementById('gemini-api-key-input');
  const statusSpan = document.getElementById('gemini-key-status');
  const val = input ? input.value.trim() : '';
  if (!val) {
    localStorage.removeItem('gemini_api_key');
    if (statusSpan) {
      statusSpan.innerText = '(ยังไม่ได้ระบุ Key)';
      statusSpan.style.color = '#b45309';
    }
    showToast('⚠️ ลบ Gemini API Key เรียบร้อยแล้ว');
    return;
  }
  localStorage.setItem('gemini_api_key', val);
  if (statusSpan) {
    statusSpan.innerText = '✅ บันทึก Key แล้ว (' + val.substring(0, 6) + '...)';
    statusSpan.style.color = '#15803d';
  }
  showToast('✅ บันทึก Gemini API Key เรียบร้อยแล้ว!');
}

function toggleApiKeyVisibility() {
  const input = document.getElementById('gemini-api-key-input');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

// Update Modal Footer Buttons depending on workflow state ('queue' | 'loading' | 'review')
function updateLabModalFooterState(state) {
  const btnAction = document.getElementById('btn-apply-lab-data');
  const btnReset = document.getElementById('btn-reset-lab-batch');
  if (!btnAction) return;

  if (state === 'review') {
    btnAction.className = 'lab-btn-apply';
    btnAction.style.background = '';
    btnAction.disabled = false;
    btnAction.innerHTML = '<span>✅ นำเข้าข้อมูลสู่ Dashboard และคำนวณผลทันที (Apply &amp; Calculate)</span>';
    btnAction.onclick = applyExtractedDataToDashboard;
    if (btnReset) btnReset.style.display = 'inline-block';
  } else if (state === 'loading') {
    btnAction.className = 'btn btn-outline';
    btnAction.style.background = '';
    btnAction.disabled = true;
    btnAction.innerHTML = '<span>⏳ กำลังประมวลผล...</span>';
    btnAction.onclick = null;
    if (btnReset) btnReset.style.display = 'none';
  } else {
    // 'queue' or initial upload
    btnAction.disabled = false;
    const count = currentLabFiles ? currentLabFiles.length : 0;
    if (count > 0) {
      btnAction.className = 'lab-btn-apply';
      btnAction.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
      btnAction.innerHTML = `<span>✨ วิเคราะห์และประเมินผล (${count} รูป)</span>`;
      btnAction.onclick = startBatchAnalysis;
    } else {
      btnAction.className = 'btn btn-outline';
      btnAction.style.background = '';
      btnAction.innerHTML = '<span>📷 / 📄 เลือกภาพหรือ PDF</span>';
      btnAction.onclick = triggerFileSelect;
    }
    if (btnReset) btnReset.style.display = count > 0 ? 'inline-block' : 'none';
  }
}

function resetLabImportState() {
  purgeLabMemory();
  const dropzone = document.getElementById('lab-dropzone');
  const loadingState = document.getElementById('lab-loading-state');
  const reviewArea = document.getElementById('lab-review-area');
  const queueBox = document.getElementById('lab-multi-queue');
  if (dropzone) dropzone.style.display = 'flex';
  if (loadingState) loadingState.style.display = 'none';
  if (reviewArea) reviewArea.style.display = 'none';
  if (queueBox) queueBox.style.display = 'none';
  updateLabModalFooterState('queue');
}

// PDPA Zero-Retention Memory Purge Function
function purgeLabMemory(showNotice = false) {
  if (currentLabFiles && currentLabFiles.length > 0) {
    currentLabFiles.forEach(item => {
      if (item.objectUrl) {
        try { URL.revokeObjectURL(item.objectUrl); } catch (e) {}
      }
      item.base64 = null;
      item.dataUrl = null;
      item.file = null;
      item.objectUrl = null;
    });
  }
  currentLabFiles = [];
  currentExtractedData = {};
  originalUnmaskedData = {};

  const previewImg = document.getElementById('lab-preview-img');
  if (previewImg) {
    previewImg.src = '';
    previewImg.style.display = 'none';
  }
  const canvas = document.getElementById('lab-preview-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = 'none';
  }
  const fallback = document.getElementById('lab-preview-fallback');
  if (fallback) fallback.style.display = 'none';

  const fileInput = document.getElementById('lab-file-input');
  if (fileInput) fileInput.value = '';
  const camInput = document.getElementById('lab-camera-input');
  if (camInput) camInput.value = '';

  const strip = document.getElementById('lab-thumbnail-strip');
  if (strip) strip.innerHTML = '';
  const queueBox = document.getElementById('lab-multi-queue');
  if (queueBox) queueBox.style.display = 'none';

  if (showNotice) {
    showToast('🔒 ทำลายข้อมูลและภาพถ่ายใน RAM เรียบร้อยแล้ว (PDPA Zero-Retention)');
  }
}

// Multi-Image Queue Manager (Up to 10 Images)
function handleIncomingFiles(fileList) {
  if (!fileList || fileList.length === 0) return;
  const filesArray = Array.from(fileList);

  const validFiles = filesArray.filter(f => {
    const isPdf = f.type === 'application/pdf' || (f.name && f.name.toLowerCase().endsWith('.pdf'));
    const isImg = (f.type && f.type.startsWith('image/')) || (f.name && /\.(jpe?g|png|webp|bmp)$/i.test(f.name));
    return isPdf || isImg;
  });

  if (validFiles.length === 0) {
    alert('กรุณาเลือกไฟล์ภาพ (.jpg, .png, .webp) หรือเอกสาร PDF');
    return;
  }

  const availableSlots = 10 - currentLabFiles.length;
  if (availableSlots <= 0) {
    alert('⚠️ คิวรูปภาพเต็มแล้ว (สูงสุด 10 ภาพ) กรุณาลบภาพที่ไม่ต้องการออกก่อนเพิ่มใหม่');
    return;
  }

  const filesToAdd = validFiles.slice(0, availableSlots);
  if (validFiles.length > availableSlots) {
    alert(`⚠️ เลือกมาทั้งหมด ${validFiles.length} ภาพ ระบบเพิ่มเข้าคิวให้ ${availableSlots} ภาพแรก (รองรับสูงสุดไม่เกิน 10 ภาพ)`);
  }

  filesToAdd.forEach((file) => {
    let objectUrl = '';
    try {
      objectUrl = URL.createObjectURL(file);
    } catch (e) {
      console.warn('Object URL error:', e);
    }

    currentLabFiles.push({
      id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      file: file,
      name: file.name || `document_${currentLabFiles.length + 1}`,
      size: file.size || 0,
      type: file.type || 'image/jpeg',
      objectUrl: objectUrl,
      base64: null,
      dataUrl: null
    });
  });

  renderMultiImageQueue();
}

function renderMultiImageQueue() {
  const queueBox = document.getElementById('lab-multi-queue');
  const strip = document.getElementById('lab-thumbnail-strip');
  const countBadge = document.getElementById('lab-queue-count-badge');
  const btnCount = document.getElementById('btn-analysis-count');
  const dropzone = document.getElementById('lab-dropzone');
  const reviewArea = document.getElementById('lab-review-area');

  if (reviewArea) reviewArea.style.display = 'none';

  if (currentLabFiles.length === 0) {
    if (queueBox) queueBox.style.display = 'none';
    if (dropzone) dropzone.style.display = 'flex';
    if (typeof updateLabModalFooterState === 'function') updateLabModalFooterState('queue');
    return;
  }

  if (queueBox) queueBox.style.display = 'flex';
  if (dropzone) dropzone.style.display = 'flex';

  if (countBadge) countBadge.innerText = `${currentLabFiles.length} / 10 รูป`;
  if (btnCount) btnCount.innerText = currentLabFiles.length;

  if (strip) {
    strip.innerHTML = '';
    currentLabFiles.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'lab-thumb-card';
      card.id = `thumb-${idx}`;

      const isPdf = item.type === 'application/pdf' || item.name.toLowerCase().endsWith('.pdf');
      const sizeStr = item.size > 1048576 ? (item.size / 1048576).toFixed(1) + 'MB' : Math.round(item.size / 1024) + 'KB';

      card.innerHTML = `
        <span class="lab-thumb-index">#${idx + 1}</span>
        <button type="button" class="lab-thumb-del" onclick="removeLabFile(${idx})" title="ลบภาพนี้">✕</button>
        ${isPdf ? `<div style="display:flex;align-items:center;justify-content:center;height:72px;font-size:1.8rem;background:#f1f5f9;">📄</div>` : `<img src="${item.objectUrl}" alt="Thumb ${idx + 1}">`}
        <div class="lab-thumb-meta" title="${item.name}">${item.name}<br>(${sizeStr})</div>
      `;
      strip.appendChild(card);
    });
  }

  if (typeof updateLabModalFooterState === 'function') updateLabModalFooterState('queue');
}

function removeLabFile(idx) {
  if (currentLabFiles[idx] && currentLabFiles[idx].objectUrl) {
    try { URL.revokeObjectURL(currentLabFiles[idx].objectUrl); } catch(e) {}
  }
  currentLabFiles.splice(idx, 1);
  renderMultiImageQueue();
}

function clearAllLabFiles() {
  purgeLabMemory();
  renderMultiImageQueue();
  showToast('🗑️ ล้างคิวภาพเรียบร้อยแล้ว (PDPA Clean)');
}

// Dynamic Gemini Model Discovery via ModelService.ListModels
async function findWorkingGeminiModel(apiKey) {
  const blockedKeywords = [
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5',
    'gemini-1.0'
  ];

  const preferredModelOrder = [
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash'
  ];

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      if (data.models && Array.isArray(data.models)) {
        const validModels = data.models
          .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name.replace(/^models\//, ''))
          .filter(m => !blockedKeywords.some(bad => m.includes(bad)));

        console.log('Available non-deprecated Gemini models for this key:', validModels);

        for (const pref of preferredModelOrder) {
          const match = validModels.find(m => m === pref);
          if (match) return match;
        }

        for (const pref of preferredModelOrder) {
          const match = validModels.find(m => m.startsWith(pref + '-'));
          if (match) return match;
        }

        const any3Flash = validModels.find(m => m.startsWith('gemini-3.') && m.includes('flash'));
        if (any3Flash) return any3Flash;

        const anyFlash = validModels.find(m => m.includes('flash'));
        if (anyFlash) return anyFlash;

        const anyGen = validModels.find(m => m.includes('gemini'));
        if (anyGen) return anyGen;
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      if (errData.error && errData.error.message) {
        throw new Error(errData.error.message);
      }
    }
  } catch (e) {
    console.warn('ListModels check notice:', e);
    if (e.message && (e.message.includes('API key not valid') || e.message.includes('API_KEY_INVALID'))) {
      throw new Error('API Key ไม่ถูกต้อง: กรุณาตรวจสอบ API Key จาก Google AI Studio');
    }
  }
  return 'gemini-3.5-flash-lite';
}

// Local PDF Text & Layout Extractor
async function parsePdfLocally(arrayBuffer, file) {
  if (!window.pdfjsLib) {
    throw new Error('PDF.js library ยังไม่พร้อมใช้งาน');
  }

  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  const maxPages = Math.min(pdf.numPages, 5);
  for (let p = 1; p <= maxPages; p++) {
    const page = await pdf.getPage(p);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += '\n' + pageText;
  }

  // Render Page 1 to preview canvas
  try {
    const page1 = await pdf.getPage(1);
    const canvas = document.getElementById('lab-preview-canvas');
    if (canvas) {
      const viewport = page1.getViewport({ scale: 1.0 });
      const scale = Math.min(260 / viewport.width, 380 / viewport.height);
      const scaledViewport = page1.getViewport({ scale: Math.max(scale, 0.4) });
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      const ctx = canvas.getContext('2d');
      await page1.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
      canvas.style.display = 'block';
      const img = document.getElementById('lab-preview-img');
      const fallback = document.getElementById('lab-preview-fallback');
      if (img) img.style.display = 'none';
      if (fallback) fallback.style.display = 'none';
    }
  } catch (renderErr) {
    console.warn('Canvas render error:', renderErr);
    const fallback = document.getElementById('lab-preview-fallback');
    if (fallback) fallback.style.display = 'block';
  }

  // Run medical regex extractor
  const extracted = parseLabText(fullText);
  renderExtractedDataToReviewForm(extracted, file);
}

// Medical Regex Dictionary Parser for Thai & English Lab Reports
function parseLabText(text) {
  const result = {};
  if (!text) return result;
  const clean = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Total Cholesterol
  const tcMatch = clean.match(/(?:total\s*cholesterol|t[-.]?chol(?:esterol)?|\btc\b|คอเลสเตอรอล|โคเลสเตอรอล|cholesterol)\s*[:=]?\s*([0-9]{2,3}(?:\.[0-9]+)?)/i);
  if (tcMatch) result.total_cholesterol = parseFloat(tcMatch[1]);

  // Triglyceride
  const tgMatch = clean.match(/(?:triglycerides?|\btg\b|ไตรกลีเซอไรด์|trig)\s*[:=]?\s*([0-9]{2,4}(?:\.[0-9]+)?)/i);
  if (tgMatch) result.triglyceride = parseFloat(tgMatch[1]);

  // HDL-C
  const hdlMatch = clean.match(/(?:hdl[- ]*chol(?:esterol)?|hdl[- ]*c|\bhdl\b|เอชดีแอล)\s*[:=]?\s*([0-9]{1,3}(?:\.[0-9]+)?)/i);
  if (hdlMatch) result.hdl_c = parseFloat(hdlMatch[1]);

  // LDL-C
  const ldlMatch = clean.match(/(?:direct\s*ldl(?:[- ]*c)?|ldl[- ]*chol(?:esterol)?|ldl[- ]*c|\bldl\b|แอลดีแอล)\s*[:=]?\s*([0-9]{2,3}(?:\.[0-9]+)?)/i);
  if (ldlMatch) result.ldl_c = parseFloat(ldlMatch[1]);

  // Serum Creatinine
  const crMatch = clean.match(/(?:serum\s*creatinine|s\.?cr(?:eatinine)?|creatinine|\bcr\b|ครีเอตินิน)\s*[:=]?\s*([0-9]{1,2}(?:\.[0-9]{1,2})?)/i);
  if (crMatch) result.serum_creatinine = parseFloat(crMatch[1]);

  // Potassium (K+)
  const kMatch = clean.match(/(?:serum\s*potassium|potassium|\bk\+?\b|โพแทสเซียม)\s*[:=]?\s*([0-9]{1,2}(?:\.[0-9]{1,2})?)/i);
  if (kMatch) result.k_level = parseFloat(kMatch[1]);

  // eGFR
  const egfrMatch = clean.match(/(?:egfr|gfr|ckd[- ]*epi)\s*[:=]?\s*([0-9]{1,3}(?:\.[0-9]+)?)/i);
  if (egfrMatch) result.egfr = parseFloat(egfrMatch[1]);

  // UACR / Microalbumin
  const uacrMatch = clean.match(/(?:uacr|urine\s*alb\/cr|microalbumin\/?cr|ไข่ขาวรั่ว)\s*[:=]?\s*([0-9]{1,4}(?:\.[0-9]+)?)/i);
  if (uacrMatch) result.uacr = parseFloat(uacrMatch[1]);

  // HbA1c
  const a1cMatch = clean.match(/(?:hba1c|hemoglobin\s*a1c|\ba1c\b|glycated\s*hb|ฮีโมโกลบิน\s*เอวันซี)\s*[:=]?\s*([0-9]{1,2}(?:\.[0-9]+)?)/i);
  if (a1cMatch) result.hba1c = parseFloat(a1cMatch[1]);

  // FBS / Glucose
  const fbsMatch = clean.match(/(?:fbs|fasting\s*blood\s*sugar|fasting\s*glucose|glucose)\s*[:=]?\s*([0-9]{2,3}(?:\.[0-9]+)?)/i);
  if (fbsMatch) {
    result.fbs = parseFloat(fbsMatch[1]);
    if (result.fbs >= 126 && result.diabetes === undefined) result.diabetes = true;
  }

  // Blood Pressure
  const bpMatch = clean.match(/(?:bp|blood\s*pressure|ความดันโลหิต)\s*[:=]?\s*([0-9]{2,3})\s*[\/\-]\s*([0-9]{2,3})/i);
  if (bpMatch) {
    result.sbp = parseInt(bpMatch[1], 10);
    result.dbp = parseInt(bpMatch[2], 10);
  }

  // Heart Rate
  const hrMatch = clean.match(/(?:hr|pulse|heart\s*rate|ชีพจร)\s*[:=]?\s*([0-9]{2,3})/i);
  if (hrMatch) result.hr = parseInt(hrMatch[1], 10);

  // Age
  const ageMatch = clean.match(/(?:อายุ|age)\s*[:=]?\s*([0-9]{1,3})\s*(?:ปี|yrs?|years?)?/i);
  if (ageMatch) result.age = parseInt(ageMatch[1], 10);

  // Sex
  const sexMatch = clean.match(/(?:เพศ|sex|gender)\s*[:=]?\s*(ชาย|หญิง|male|female|\bm\b|\bf\b)/i);
  if (sexMatch) {
    const s = sexMatch[1].toLowerCase();
    if (s === 'ชาย' || s === 'male' || s === 'm') result.sex = 'male';
    else if (s === 'หญิง' || s === 'female' || s === 'f') result.sex = 'female';
  }

  // HN
  const hnMatch = clean.match(/(?:hn|h\.n\.|เลขประจำตัวผู้ป่วย)\s*[:=]?\s*([A-Za-z0-9\/\-]+)/i);
  if (hnMatch) result.hn = hnMatch[1].trim();

  // Patient Name
  const nameMatch = clean.match(/(?:ชื่อ[- ]*สกุล|ชื่อผู้ป่วย|patient\s*name|name)\s*[:=]?\s*([^\n\r,0-9]{3,35})/i);
  if (nameMatch) result.patient_name = nameMatch[1].trim();

  // Date
  const dateMatch = clean.match(/(?:วันที่ตรวจ|วันที่|date|collection\s*date)\s*[:=]?\s*([0-9]{1,2}[\/\-.][0-9]{1,2}[\/\-.][0-9]{2,4})/i);
  if (dateMatch) result.test_date = dateMatch[1].trim();

  // Weight / Height / Waist
  const wtMatch = clean.match(/(?:bw|body\s*weight|น้ำหนัก|weight)\s*[:=]?\s*([0-9]{2,3}(?:\.[0-9]+)?)\s*(?:kg|กก)?/i);
  if (wtMatch) result.weight = parseFloat(wtMatch[1]);

  const htMatch = clean.match(/(?:ht|height|ส่วนสูง)\s*[:=]?\s*([0-9]{2,3}(?:\.[0-9]+)?)\s*(?:cm|ซม)?/i);
  if (htMatch) result.height = parseFloat(htMatch[1]);

  const waistMatch = clean.match(/(?:waist|รอบเอว)\s*[:=]?\s*([0-9]{2,3}(?:\.[0-9]+)?)\s*(?:นิ้ว|inch|in|\"|ซม|cm)?/i);
  if (waistMatch) {
    let w = parseFloat(waistMatch[1]);
    if (w > 50) w = Math.round(w / 2.54); // Convert cm to inches if > 50
    result.waist = w;
  }

  return result;
}

// Compress & encode image for fast upload, accurate OCR, and memory safety
function compressAndEncodeImage(file, maxDimension = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('ไม่พบไฟล์ภาพ'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ภาพได้'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('ไม่สามารถประมวลผลรูปภาพได้'));
      img.onload = () => {
        let width = img.naturalWidth || img.width || 800;
        let height = img.naturalHeight || img.height || 600;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas 2D Context ไม่พร้อมใช้งาน'));

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64 = dataUrl.split(',')[1] || '';
        resolve({ dataUrl, base64, width, height });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Render PDF Page to high-res JPEG for Gemini Multimodal
async function renderPdfPageToJpeg(file, pageNum = 1, scale = 2.0) {
  if (!window.pdfjsLib) {
    throw new Error('PDF.js library ยังไม่พร้อมใช้งาน');
  }
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D Context ไม่พร้อมใช้งาน');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  await page.render({ canvasContext: ctx, viewport: viewport }).promise;

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  const base64 = dataUrl.split(',')[1] || '';
  return { dataUrl, base64, width: viewport.width, height: viewport.height };
}

// Batch Multi-Image Synthesis Engine (Supports up to 10 Images + PDPA Compliance)
async function startBatchAnalysis() {
  if (!currentLabFiles || currentLabFiles.length === 0) {
    alert('กรุณาเลือกไฟล์ภาพหรือเอกสาร PDF อย่างน้อย 1 ไฟล์ (สูงสุด 10 รูป)');
    return;
  }

  if (typeof updateLabModalFooterState === 'function') {
    updateLabModalFooterState('loading');
  }

  const dropzone = document.getElementById('lab-dropzone');
  const queueBox = document.getElementById('lab-multi-queue');
  const reviewArea = document.getElementById('lab-review-area');
  const loadingState = document.getElementById('lab-loading-state');
  const loadingTitle = document.getElementById('lab-loading-title');
  const loadingDesc = document.getElementById('lab-loading-desc');

  if (dropzone) dropzone.style.display = 'none';
  if (queueBox) queueBox.style.display = 'none';
  if (reviewArea) reviewArea.style.display = 'none';
  if (loadingState) loadingState.style.display = 'block';

  const numFiles = currentLabFiles.length;
  if (loadingTitle) {
    loadingTitle.innerText = `✨ AI Multimodal กำลังวิเคราะห์และผสานข้อมูลจาก ${numFiles} รูปภาพ...`;
  }
  if (loadingDesc) {
    loadingDesc.innerText = `ระบบกำลังสังเคราะห์ตัวแปรทางคลินิก (BP, Renal labs, Lipid panel, Vitals, Comorbidities) จากสลิปทุกใบ กรุณารอสักครู่...`;
  }

  try {
    // 1. Local PDF Parser Engine check
    if (activeLabEngine === 'pdfjs') {
      const firstPdf = currentLabFiles.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
      if (!firstPdf) {
        alert('Local PDF Parser รองรับเฉพาะไฟล์เอกสาร PDF เท่านั้น กรุณาสลับไปใช้ Gemini AI Multimodal เพื่ออ่านภาพถ่ายสลิป');
        resetLabImportState();
        return;
      }
      if (numFiles > 1) {
        showToast('ℹ️ Local PDF Parser ประมวลผลเอกสาร PDF ไฟล์แรกในคิว');
      }
      const buf = await firstPdf.file.arrayBuffer();
      await parsePdfLocally(buf, firstPdf.file);
      return;
    }

    // 2. Gemini AI Multimodal Engine
    const apiKey = (localStorage.getItem('gemini_api_key') || '').trim();
    if (!apiKey) {
      if (loadingState) loadingState.style.display = 'none';
      if (dropzone) dropzone.style.display = 'flex';
      if (queueBox) queueBox.style.display = 'flex';
      alert('💡 สำหรับการอ่านภาพถ่ายสลิป/กระดาษด้วย AI จำเป็นต้องระบุ Gemini API Key (ฟรี)\n\nกรุณากรอก API Key ในช่องด้านบน หรือคลิกลิงก์ "รับ Gemini API Key ฟรีจาก Google AI Studio" (ใช้เวลาเพียง 1 นาที)');
      document.getElementById('gemini-api-key-input')?.focus();
      return;
    }

    // Prepare image parts array
    const imageParts = [];
    for (let i = 0; i < currentLabFiles.length; i++) {
      const item = currentLabFiles[i];
      if (item.type === 'application/pdf' || item.name.toLowerCase().endsWith('.pdf')) {
        const pdfRes = await renderPdfPageToJpeg(item.file);
        item.base64 = pdfRes.base64;
        item.dataUrl = pdfRes.dataUrl;
        imageParts.push({ mimeType: 'image/jpeg', data: pdfRes.base64, name: item.name });
      } else {
        const imgRes = await compressAndEncodeImage(item.file);
        item.base64 = imgRes.base64;
        item.dataUrl = imgRes.dataUrl;
        imageParts.push({ mimeType: 'image/jpeg', data: imgRes.base64, name: item.name });
      }
    }

    const prompt = `You are an expert clinical hypertension and cardiology multimodal AI.
You are provided with ${numFiles} medical lab slips, hospital monitor photos, prescription slips, or clinical report documents belonging to the SAME patient.
Your task is to synthesize, cross-reference, and aggregate all clinical laboratory values and patient parameters across ALL images into a single unified JSON object.

[PDPA & Privacy Protection Rule]:
- Strictly DO NOT extract, output, or store national identification numbers (เลขประจำตัวประชาชน 13 หลัก), telephone numbers, home addresses, or contact information.
- For patient_name and hn: extract ONLY if clearly visible on the slip, otherwise leave null.

[Multi-slip Cross-Referencing Rule]:
- Slip 1 might have Lipid panel (Cholesterol, Triglyceride, HDL, LDL).
- Slip 2 might have Renal profile (Creatinine, Potassium K+, eGFR, UACR) or Glycemic status (HbA1c, FBS).
- Slip 3 might have Blood Pressure (Office or Home BP), Heart Rate, Body Weight, Height, Waist circumference, Smoking status, or Medications / Comorbidities (Diabetes, CAD, Stroke, Heart Failure, AF).
- Synthesize all documents into one consolidated clinical record.
- If the same test appears on multiple slips, use the most recent or highest-precision reading.
- Standard unit for lipids is mg/dL. If mmol/L is reported, convert to mg/dL:
  * Total Cholesterol, HDL-C, LDL-C: multiply mmol/L by 38.67
  * Triglycerides: multiply mmol/L by 88.57
- Standard unit for Serum Creatinine is mg/dL. If in µmol/L, divide by 88.4.
- Standard unit for Serum Potassium (K+) is mEq/L or mmol/L.
- If FBS >= 126 or HbA1c >= 6.5%, set diabetes to true.
- If waist circumference is in cm, convert to inches by dividing by 2.54 if requested.

Respond ONLY with valid JSON with this exact schema:
{
  "patient_name": string or null,
  "hn": string or null,
  "test_date": "YYYY-MM-DD" or null,
  "age": number or null,
  "sex": "male" | "female" | null,
  "height": number (cm) or null,
  "weight": number (kg) or null,
  "waist": number (inches) or null,
  "sbp": number (Office SBP mmHg) or null,
  "dbp": number (Office DBP mmHg) or null,
  "hr": number (bpm) or null,
  "home_sbp": number (Home SBP mmHg) or null,
  "home_dbp": number (Home DBP mmHg) or null,
  "serum_creatinine": number (mg/dL) or null,
  "k_level": number (mEq/L) or null,
  "uacr": number (mg/g) or null,
  "total_cholesterol": number (mg/dL) or null,
  "triglyceride": number (mg/dL) or null,
  "hdl_c": number (mg/dL) or null,
  "ldl_c": number (mg/dL) or null,
  "fbs": number (mg/dL) or null,
  "hba1c": number (%) or null,
  "diabetes": boolean or null,
  "smoking": boolean or null,
  "cad": boolean or null,
  "hf": boolean or null,
  "stroke": boolean or null,
  "af": boolean or null
}`;

    let preferredModel = 'gemini-3.5-flash-lite';
    try {
      preferredModel = await findWorkingGeminiModel(apiKey);
    } catch (mErr) {
      console.warn('Dynamic model discovery notice:', mErr);
    }

    const fallbackList = [
      preferredModel,
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-2.5-flash'
    ];
    const blockedKeywords = ['gemini-2.5-flash-lite', 'gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-1.5', 'gemini-1.0'];
    const candidateModels = fallbackList.filter((m, idx, arr) => 
      m && arr.indexOf(m) === idx && !blockedKeywords.some(bad => m.includes(bad))
    );

    const contentsParts = [{ text: prompt }];
    for (const p of imageParts) {
      contentsParts.push({
        inlineData: {
          mimeType: p.mimeType,
          data: p.data
        }
      });
    }

    const payload = {
      contents: [{ parts: contentsParts }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    };

    let lastError = null;
    let resJson = null;

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${response.status} ${response.statusText}`;
          lastError = new Error(`[${model}] ${errMsg}`);
          console.warn(`Model ${model} failed:`, errMsg);
          continue;
        }

        resJson = await response.json();
        if (resJson && resJson.candidates && resJson.candidates[0]?.content?.parts?.[0]?.text) {
          console.log(`Successfully synthesized ${numFiles} images using: ${model}`);
          break;
        }
      } catch (callErr) {
        lastError = callErr;
        console.warn(`Model ${model} network error:`, callErr);
      }
    }

    if (!resJson || !resJson.candidates || !resJson.candidates[0]?.content?.parts?.[0]?.text) {
      let errMsg = lastError ? lastError.message : 'ไม่สามารถประมวลผลด้วย AI ได้ กรุณาตรวจสอบ API Key';
      if (errMsg.includes('API key not valid') || errMsg.includes('API_KEY_INVALID')) {
        errMsg = 'API Key ไม่ถูกต้อง กรุณาตรวจสอบ API Key จาก Google AI Studio';
      } else if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
        errMsg = 'โควตาการใช้งาน Gemini API ฟรีชั่วคราวเต็ม กรุณารอสักครู่แล้วลองใหม่';
      }
      throw new Error(errMsg);
    }

    const textOut = resJson.candidates[0].content.parts[0].text;
    let parsed = {};
    try {
      parsed = JSON.parse(textOut);
    } catch (e) {
      const clean = textOut.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(clean);
    }

    setupReviewImageSwitcher();
    renderExtractedDataToReviewForm(parsed);

  } catch (err) {
    console.error('Batch extraction error:', err);
    if (loadingState) loadingState.style.display = 'none';
    if (queueBox && currentLabFiles.length > 0) queueBox.style.display = 'flex';
    else if (dropzone) dropzone.style.display = 'flex';
    if (typeof updateLabModalFooterState === 'function') updateLabModalFooterState('queue');
    alert('เกิดข้อผิดพลาดในการอ่านเอกสาร: ' + (err.message || err));
  }
}

// Setup thumbnail switcher chips in review pane
function setupReviewImageSwitcher() {
  currentPreviewIndex = 0;
  const chipsContainer = document.getElementById('lab-preview-chips-container');
  const chipsBox = document.getElementById('lab-preview-chips');
  
  if (chipsContainer && chipsBox) {
    if (currentLabFiles.length > 1) {
      chipsContainer.style.display = 'block';
      chipsBox.innerHTML = '';
      currentLabFiles.forEach((item, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lab-preview-chip' + (idx === 0 ? ' active' : '');
        btn.innerText = `รูปที่ ${idx + 1}`;
        btn.onclick = () => switchPreviewImage(idx);
        chipsBox.appendChild(btn);
      });
    } else {
      chipsContainer.style.display = 'none';
    }
  }
  switchPreviewImage(0);
}

function switchPreviewImage(idx) {
  if (!currentLabFiles || !currentLabFiles[idx]) return;
  currentPreviewIndex = idx;

  const chips = document.querySelectorAll('.lab-preview-chip');
  chips.forEach((c, i) => {
    if (i === idx) c.classList.add('active');
    else c.classList.remove('active');
  });

  const item = currentLabFiles[idx];
  const previewImg = document.getElementById('lab-preview-img');
  const previewFilename = document.getElementById('lab-preview-filename');
  const canvas = document.getElementById('lab-preview-canvas');
  const fallback = document.getElementById('lab-preview-fallback');

  if (previewFilename) {
    previewFilename.innerText = `(#${idx + 1}/${currentLabFiles.length}) ` + (item.name || 'document');
  }

  if (previewImg) {
    previewImg.src = item.dataUrl || item.objectUrl || '';
    previewImg.style.display = 'block';
  }
  if (canvas) canvas.style.display = 'none';
  if (fallback) fallback.style.display = 'none';
}

// PDPA De-identification Masking Switch
function handlePdpaMaskToggle(e) {
  const isMasked = document.getElementById('rev-pdpa-mask')?.checked;
  const nameInput = document.getElementById('rev-pt-name');
  const hnInput = document.getElementById('rev-pt-hn');
  if (!nameInput || !hnInput) return;

  if (isMasked) {
    nameInput.value = 'ผู้รับการตรวจ (นิรนาม / Anonymized)';
    hnInput.value = 'HN-******';
    nameInput.disabled = true;
    hnInput.disabled = true;
  } else {
    nameInput.disabled = false;
    hnInput.disabled = false;
    nameInput.value = originalUnmaskedData.patient_name || '';
    hnInput.value = originalUnmaskedData.hn || '';
  }
}

// Populate data into review grid
function renderExtractedDataToReviewForm(data, file) {
  currentExtractedData = data || {};
  originalUnmaskedData = {
    patient_name: data.patient_name || '',
    hn: data.hn || ''
  };

  function setField(fieldId, badgeId, val, formatFn) {
    const input = document.getElementById(fieldId);
    const badge = document.getElementById(badgeId);
    if (!input) return;

    if (val !== undefined && val !== null && val !== '') {
      input.value = formatFn ? formatFn(val) : val;
      input.classList.add('detected-highlight');
      if (badge) badge.style.display = 'inline-block';
    } else {
      input.classList.remove('detected-highlight');
      if (badge) badge.style.display = 'none';
    }
  }

  const isMasked = document.getElementById('rev-pdpa-mask') ? document.getElementById('rev-pdpa-mask').checked : true;
  if (isMasked) {
    const nameInput = document.getElementById('rev-pt-name');
    const hnInput = document.getElementById('rev-pt-hn');
    if (nameInput) {
      nameInput.value = 'ผู้รับการตรวจ (นิรนาม / Anonymized)';
      nameInput.disabled = true;
    }
    if (hnInput) {
      hnInput.value = 'HN-******';
      hnInput.disabled = true;
    }
    const badgeName = document.getElementById('badge-pt-name');
    const badgeHn = document.getElementById('badge-pt-hn');
    if (badgeName) badgeName.style.display = data.patient_name ? 'inline-block' : 'none';
    if (badgeHn) badgeHn.style.display = data.hn ? 'inline-block' : 'none';
  } else {
    setField('rev-pt-name', 'badge-pt-name', data.patient_name);
    setField('rev-pt-hn', 'badge-pt-hn', data.hn);
  }

  // Date normalization
  let dateStr = data.test_date;
  if (dateStr && dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      let yr = parseInt(parts[2], 10);
      if (yr > 2400) yr -= 543;
      dateStr = yr + '-' + parts[1].padStart(2, '0') + '-' + parts[0].padStart(2, '0');
    }
  }
  setField('rev-date', 'badge-date', dateStr);

  setField('rev-age', 'badge-age', data.age);
  if (data.sex !== undefined && data.sex !== null) {
    const sexVal = (data.sex === 'male' || data.sex === '1' || data.sex === 1) ? '1' : '0';
    setField('rev-sex', 'badge-sex', sexVal);
  } else {
    setField('rev-sex', 'badge-sex', null);
  }

  setField('rev-height', 'badge-height', data.height);
  setField('rev-weight', 'badge-weight', data.weight);
  setField('rev-waist', 'badge-waist', data.waist);

  setField('rev-sbp', 'badge-sbp', data.sbp);
  setField('rev-dbp', 'badge-dbp', data.dbp);
  setField('rev-hr', 'badge-hr', data.hr);
  setField('rev-home-sbp', 'badge-home-sbp', data.home_sbp);
  setField('rev-home-dbp', 'badge-home-dbp', data.home_dbp);

  // Labs
  setField('rev-scr', 'badge-scr', data.serum_creatinine);
  setField('rev-k', 'badge-k', data.k_level);
  setField('rev-uacr', 'badge-uacr', data.uacr);
  setField('rev-tc', 'badge-tc', data.total_cholesterol, Math.round);
  setField('rev-tg', 'badge-tg', data.triglyceride, Math.round);
  setField('rev-hdl', 'badge-hdl', data.hdl_c, Math.round);
  setField('rev-ldl', 'badge-ldl', data.ldl_c, Math.round);
  setField('rev-fbs', 'badge-fbs', data.fbs);
  setField('rev-hba1c', 'badge-hba1c', data.hba1c);

  // Comorbidities
  if (data.diabetes !== undefined && data.diabetes !== null) {
    setField('rev-dm', 'badge-dm', data.diabetes ? '1' : '0');
  } else {
    setField('rev-dm', 'badge-dm', null);
  }

  if (data.smoking !== undefined && data.smoking !== null) {
    setField('rev-smoke', 'badge-smoke', data.smoking ? '1' : '0');
  } else {
    setField('rev-smoke', 'badge-smoke', null);
  }

  if (data.cad !== undefined && data.cad !== null) {
    setField('rev-cad', 'badge-cad', data.cad ? '1' : '0');
  } else {
    setField('rev-cad', 'badge-cad', null);
  }

  if (data.hf !== undefined && data.hf !== null) {
    setField('rev-hf', 'badge-hf', data.hf ? '1' : '0');
  } else {
    setField('rev-hf', 'badge-hf', null);
  }

  if (data.stroke !== undefined && data.stroke !== null) {
    setField('rev-stroke', 'badge-stroke', data.stroke ? '1' : '0');
  } else {
    setField('rev-stroke', 'badge-stroke', null);
  }

  if (data.af !== undefined && data.af !== null) {
    setField('rev-af', 'badge-af', data.af ? '1' : '0');
  } else {
    setField('rev-af', 'badge-af', null);
  }

  // Hide loading, show review area
  const loadingState = document.getElementById('lab-loading-state');
  const reviewArea = document.getElementById('lab-review-area');
  if (loadingState) loadingState.style.display = 'none';
  if (reviewArea) reviewArea.style.display = 'flex';
  if (typeof updateLabModalFooterState === 'function') updateLabModalFooterState('review');
}

// Apply verified values to Dashboard and Calculate
async function applyExtractedDataToDashboard() {
  const reviewArea = document.getElementById('lab-review-area');
  const isReviewVisible = reviewArea && reviewArea.style.display !== 'none';

  if (!isReviewVisible) {
    if (currentLabFiles && currentLabFiles.length > 0) {
      await startBatchAnalysis();
      return;
    } else {
      alert('กรุณาเลือกหรือถ่ายภาพสลิปใบแล็บก่อนนำเข้าข้อมูล');
      return;
    }
  }

  const isMasked = document.getElementById('rev-pdpa-mask')?.checked;
  const ptName = isMasked ? 'ผู้รับการตรวจ (นิรนาม / Anonymized)' : (document.getElementById('rev-pt-name')?.value.trim() || '');
  const ptHn = isMasked ? 'HN-******' : (document.getElementById('rev-pt-hn')?.value.trim() || '');
  
  const age = document.getElementById('rev-age')?.value;
  const sex = document.getElementById('rev-sex')?.value;
  const height = document.getElementById('rev-height')?.value;
  const weight = document.getElementById('rev-weight')?.value;
  const waist = document.getElementById('rev-waist')?.value;

  const sbp = document.getElementById('rev-sbp')?.value;
  const dbp = document.getElementById('rev-dbp')?.value;
  const hr = document.getElementById('rev-hr')?.value;
  const homeSbp = document.getElementById('rev-home-sbp')?.value;
  const homeDbp = document.getElementById('rev-home-dbp')?.value;

  const scr = document.getElementById('rev-scr')?.value;
  const k = document.getElementById('rev-k')?.value;
  const uacr = document.getElementById('rev-uacr')?.value;
  const tc = document.getElementById('rev-tc')?.value;
  const tg = document.getElementById('rev-tg')?.value;
  const hdl = document.getElementById('rev-hdl')?.value;

  const dm = document.getElementById('rev-dm')?.value;
  const smoke = document.getElementById('rev-smoke')?.value;
  const cad = document.getElementById('rev-cad')?.value;
  const hf = document.getElementById('rev-hf')?.value;
  const stroke = document.getElementById('rev-stroke')?.value;
  const af = document.getElementById('rev-af')?.value;

  function updateField(id, val) {
    if (val === undefined || val === null || val === '') return;
    const el = document.getElementById(id);
    if (!el) return;
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // 1. Patient Profile
  updateField('inp-name', ptName);
  updateField('inp-hn', ptHn);
  updateField('inp-age', age);
  if (sex !== undefined && sex !== null && sex !== '') {
    if (typeof setSex === 'function') {
      setSex(parseInt(sex, 10));
    }
  }
  updateField('inp-height', height);
  updateField('inp-weight', weight);
  updateField('inp-waist', waist);

  // 2. Vitals & BP
  updateField('inp-sbp', sbp);
  updateField('inp-dbp', dbp);
  updateField('inp-hr', hr);
  updateField('inp-home-sbp', homeSbp);
  updateField('inp-home-dbp', homeDbp);

  // 3. Laboratory Data
  updateField('inp-scr', scr);
  updateField('inp-k', k);
  updateField('inp-uacr', uacr);
  updateField('inp-tc', tc);
  updateField('inp-tg', tg);
  updateField('inp-hdl', hdl);

  // 4. Comorbidities & Conditions
  function setCondition(chkId, key, val) {
    if (val === undefined || val === null || val === '') return;
    const isChecked = val === '1' || val === 1 || val === true;
    const chk = document.getElementById(chkId);
    if (chk) chk.checked = isChecked;
    if (typeof toggleCondition === 'function') {
      toggleCondition(key, isChecked);
    }
  }

  setCondition('chk-dm', 'dm', dm);
  setCondition('chk-smoke', 'smoke', smoke);
  setCondition('chk-cad', 'cad', cad);
  setCondition('chk-hf', 'hf', hf);
  setCondition('chk-stroke', 'stroke', stroke);
  setCondition('chk-af', 'af', af);

  // Trigger state synchronization & calculations
  if (typeof syncInputsToState === 'function') syncInputsToState();
  if (typeof updateLipidCalculations === 'function') updateLipidCalculations();
  if (typeof recalculateAll === 'function') recalculateAll();
  if (typeof syncPrintSheets === 'function') syncPrintSheets();

  closeLabImportModal();

  const summaryParts = [];
  if (sbp) summaryParts.push('BP ' + sbp + (dbp ? '/' + dbp : ''));
  if (tc) summaryParts.push('TC ' + tc);
  if (tg) summaryParts.push('TG ' + tg);
  if (hdl) summaryParts.push('HDL ' + hdl);
  if (scr) summaryParts.push('Cr ' + scr);
  if (k) summaryParts.push('K+ ' + k);

  showToast('✅ นำเข้าผลตรวจ (' + (summaryParts.join(', ') || 'ข้อมูลครบถ้วน') + ') และคำนวณผลเรียบร้อยแล้ว!');
}

function showToast(msg) {
  const toast = document.getElementById('toast-msg');
  if (!toast) return;
  toast.innerHTML = `<span>${msg}</span>`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Export functions to window for global inline onclick handlers
if (typeof window !== 'undefined') {
  window.openLabImportModal = openLabImportModal;
  window.closeLabImportModal = closeLabImportModal;
  window.handleLabImportBackdropClick = handleLabImportBackdropClick;
  window.triggerFileSelect = triggerFileSelect;
  window.triggerCameraCapture = triggerCameraCapture;
  window.handleFileInputChange = handleFileInputChange;
  window.switchLabEngine = switchLabEngine;
  window.saveGeminiApiKey = saveGeminiApiKey;
  window.toggleApiKeyVisibility = toggleApiKeyVisibility;
  window.resetLabImportState = resetLabImportState;
  window.purgeLabMemory = purgeLabMemory;
  window.removeLabFile = removeLabFile;
  window.clearAllLabFiles = clearAllLabFiles;
  window.startBatchAnalysis = startBatchAnalysis;
  window.switchPreviewImage = switchPreviewImage;
  window.handlePdpaMaskToggle = handlePdpaMaskToggle;
  window.applyExtractedDataToDashboard = applyExtractedDataToDashboard;
  window.showToast = showToast;
}
