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

// ==================== DM PROJECT PARITY: SMART DOCUMENT & LAB AI SCANNER ====================
let uploadedFilesList = []; // Up to 10 files { name, size, type, dataUrl, base64 }
let lastExtractedData = null;

function initApiKey() {
  const saved = localStorage.getItem('dm_master_gemini_api_key') || localStorage.getItem('gemini_api_key') || '';
  const inp = document.getElementById('input-api-key');
  if (inp && saved) inp.value = saved;
  const modalInp = document.getElementById('gemini-api-key-input');
  if (modalInp && saved) modalInp.value = saved;
}

function saveApiKey() {
  const inp = document.getElementById('input-api-key');
  const key = inp ? inp.value.trim() : (document.getElementById('gemini-api-key-input')?.value.trim() || '');
  if (key) {
    localStorage.setItem('dm_master_gemini_api_key', key);
    localStorage.setItem('gemini_api_key', key);
    const modalInp = document.getElementById('gemini-api-key-input');
    if (modalInp) modalInp.value = key;
  } else {
    localStorage.removeItem('dm_master_gemini_api_key');
    localStorage.removeItem('gemini_api_key');
  }
}

function clearApiKey() {
  const inp = document.getElementById('input-api-key');
  if (inp) inp.value = '';
  const modalInp = document.getElementById('gemini-api-key-input');
  if (modalInp) modalInp.value = '';
  localStorage.removeItem('dm_master_gemini_api_key');
  localStorage.removeItem('gemini_api_key');
}

function toggleApiKeyVisibility() {
  const inp = document.getElementById('input-api-key') || document.getElementById('gemini-api-key-input');
  const icon = document.getElementById('eye-icon');
  if (!inp) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    if (icon) icon.setAttribute('data-lucide', 'eye-off');
  } else {
    inp.type = 'password';
    if (icon) icon.setAttribute('data-lucide', 'eye');
  }
  renderIconsSafe();
}

async function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  const remainingSlots = 10 - uploadedFilesList.length;
  if (remainingSlots <= 0) {
    alert('อัปโหลดไฟล์ครบจำนวนสูงสุด 10 ไฟล์แล้ว');
    return;
  }

  const filesToAdd = files.slice(0, remainingSlots);
  if (files.length > remainingSlots) {
    alert(`สามารถเลือกเพิ่มได้อีกเพียง ${remainingSlots} ไฟล์ (รวมไม่เกิน 10 ไฟล์)`);
  }

  for (const file of filesToAdd) {
    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const pdfRes = await renderPdfPageToJpeg(file);
        uploadedFilesList.push({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: 'application/pdf',
          dataUrl: pdfRes.dataUrl,
          base64: pdfRes.base64
        });
      } else {
        const imgRes = await compressAndEncodeImage(file);
        uploadedFilesList.push({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type || 'image/jpeg',
          dataUrl: imgRes.dataUrl,
          base64: imgRes.base64
        });
      }
    } catch (err) {
      console.warn('File processing notice for ' + file.name + ':', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        uploadedFilesList.push({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
          dataUrl: event.target.result,
          base64: event.target.result.split(',')[1]
        });
        renderUploadedThumbnails();
      };
      reader.readAsDataURL(file);
    }
  }

  renderUploadedThumbnails();
  e.target.value = '';
}

function removeFile(index) {
  uploadedFilesList.splice(index, 1);
  renderUploadedThumbnails();
}

function clearAllUploadedFiles() {
  uploadedFilesList = [];
  renderUploadedThumbnails();
  dismissExtractionReview();
}

function renderUploadedThumbnails() {
  const container = document.getElementById('upload-preview-container');
  const grid = document.getElementById('thumbnails-grid');
  const countBadge = document.getElementById('file-count-badge');

  if (countBadge) countBadge.innerText = uploadedFilesList.length;
  if (!container || !grid) return;

  if (uploadedFilesList.length === 0) {
    container.style.display = 'none';
    grid.innerHTML = '';
    return;
  }

  container.style.display = 'block';
  grid.innerHTML = '';

  uploadedFilesList.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'ai-thumb-item';

    let previewHtml = '';
    if (file.type && file.type.includes('pdf')) {
      previewHtml = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:4px; text-align:center;">
          <i data-lucide="file-text" style="width:24px; height:24px; color:#e11d48;"></i>
          <span style="font-size:9px; font-weight:700; color:#334155; margin-top:2px;">PDF</span>
        </div>
      `;
    } else {
      previewHtml = `<img src="${file.dataUrl}" alt="${file.name}">`;
    }

    item.innerHTML = `
      ${previewHtml}
      <button type="button" onclick="removeFile(${index})" class="ai-thumb-del" title="ลบไฟล์นี้">
        <i data-lucide="x" style="width:12px; height:12px;"></i>
      </button>
      <div class="ai-thumb-caption">${file.name}</div>
    `;
    grid.appendChild(item);
  });

  renderIconsSafe();
}

// AI MULTIMODAL EXTRACTION ENGINE WITH STRICT PDPA COMPLIANCE & DYNAMIC MODEL SELECTION
async function processDocumentsWithAI() {
  const apiKey = (document.getElementById('input-api-key')?.value || localStorage.getItem('dm_master_gemini_api_key') || localStorage.getItem('gemini_api_key') || '').trim();
  if (!apiKey) {
    alert('กรุณากรอก Google Gemini API Key เพื่อใช้งานระบบอ่านเอกสาร AI Vision (ไม่มีค่าใช้จ่าย)');
    document.getElementById('input-api-key')?.focus();
    return;
  }

  if (uploadedFilesList.length === 0) {
    alert('กรุณาเลือกไฟล์ภาพถ่ายผลแล็บหรือ PDF อย่างน้อย 1 ไฟล์');
    return;
  }

  const progressBox = document.getElementById('scan-progress-box');
  const progressBar = document.getElementById('scan-progress-bar');
  const statusText = document.getElementById('scan-status-text');
  const percentText = document.getElementById('scan-percent-text');
  const btnScan = document.getElementById('btn-run-ai-scan');

  if (progressBox) progressBox.style.display = 'flex';
  if (btnScan) {
    btnScan.disabled = true;
    btnScan.style.opacity = '0.5';
  }

  if (progressBar) progressBar.style.width = '20%';
  if (statusText) statusText.innerText = `เตรียมไฟล์ภาพและเอกสาร ${uploadedFilesList.length} ไฟล์...`;
  if (percentText) percentText.innerText = '20%';

  try {
    const parts = [];

    uploadedFilesList.forEach(file => {
      let mime = file.type;
      if (!mime || mime === '') {
        mime = file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
      }
      parts.push({
        inlineData: {
          mimeType: mime === 'application/pdf' ? 'image/jpeg' : mime,
          data: file.base64
        }
      });
    });

    const promptText = `
You are an expert clinical medical laboratory data extraction and hypertension decision-support AI assistant.
Your task is to analyze the provided ${uploadedFilesList.length} medical document(s), lab slips, or OPD cards belonging to the patient.

CRITICAL PDPA / PRIVACY COMPLIANCE MANDATE:
- NEVER extract, output, or mention ANY Patient Identifiable Information (PII) such as Patient Name, Citizen ID / National ID Number (13 digits), Hospital Number (HN), Telephone Number, Address, Date of Birth, or Hospital Staff Names.
- DO NOT INCLUDE ANY PERSONAL IDENTIFIERS. Extract ONLY numerical medical parameters, laboratory readings, and clinical diagnoses.

Extract the following clinical variables from the documents if present:
1. "age": integer or null (e.g. 56)
2. "sex": "male" or "female" or null
3. "weight_kg": number or null
4. "height_cm": number or null
5. "waist_inches": number or null (if waist in cm, divide by 2.54)
6. "sbp": integer or null (Office Systolic BP mmHg)
7. "dbp": integer or null (Office Diastolic BP mmHg)
8. "hr": integer or null (Heart Rate / Pulse bpm)
9. "home_sbp": integer or null (Home SBP mmHg)
10. "home_dbp": integer or null (Home DBP mmHg)
11. "serum_cr": number or null (Creatinine in mg/dL. If µmol/L, divide by 88.4)
12. "potassium_k": number or null (Serum K+ in mEq/L or mmol/L)
13. "uacr": number or null (Urine Albumin/Creatinine Ratio in mg/g, or microalbumin)
14. "total_cholesterol": number or null (TC in mg/dL. If mmol/L, multiply by 38.67)
15. "triglycerides": number or null (TG in mg/dL. If mmol/L, multiply by 88.57)
16. "hdl": number or null (HDL-C in mg/dL. If mmol/L, multiply by 38.67)
17. "ldl": number or null (LDL-C in mg/dL)
18. "fbs": number or null (Fasting Blood Sugar in mg/dL)
19. "hba1c": number or null (HbA1c in %)
20. "diabetes": boolean or null (true if diabetes, FBS >= 126, or HbA1c >= 6.5%)
21. "smoking": boolean or null (true if current smoker)
22. "cad": boolean or null (true if coronary artery disease, prior MI, angina, PCI, or CABG)
23. "heart_failure": boolean or null (true if Heart failure, CHF, HFrEF, HFpEF)
24. "stroke": boolean or null (true if stroke or TIA)
25. "af": boolean or null (true if atrial fibrillation)
26. "frailty": boolean or null (true if documented frail, elderly fall risk, bedridden)
27. "pregnant": boolean or null (true if pregnancy is documented)
28. "current_medications": {
      "acei_arb": boolean or null (Enalapril, Lisinopril, Ramipril, Losartan, Telmisartan, Valsartan),
      "ccb": boolean or null (Amlodipine, Felodipine, Manidipine, Lercanidipine),
      "diuretic": boolean or null (HCTZ, Indapamide, Chlorthalidone),
      "beta_blocker": boolean or null (Atenolol, Bisoprolol, Carvedilol, Metoprolol),
      "mra": boolean or null (Spironolactone, Eplerenone),
      "statin": boolean or null (Atorvastatin, Simvastatin, Rosuvastatin)
    },
29. "detected_summary": brief string summarizing findings in Thai/English strictly without personal names/HNs.

Output MUST be strictly valid JSON format matching this schema without any markdown backticks.
`;

    parts.push({ text: promptText });

    if (progressBar) progressBar.style.width = '40%';
    if (statusText) statusText.innerText = 'กำลังตรวจสอบโมเดล Gemini Vision ที่พร้อมใช้งาน...';
    if (percentText) percentText.innerText = '40%';

    let discoveredModel = 'gemini-3.5-flash-lite';
    try {
      discoveredModel = await findWorkingGeminiModel(apiKey);
    } catch (mErr) {
      console.warn('Model discovery failed, using fallback:', mErr);
      if (mErr.message && mErr.message.includes('API Key ไม่ถูกต้อง')) {
        throw mErr;
      }
    }

    const candidateModels = [
      discoveredModel,
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash'
    ].filter((m, i, arr) => m && arr.indexOf(m) === i);

    if (progressBar) progressBar.style.width = '55%';
    if (statusText) statusText.innerText = `กำลังส่งภาพไปยัง Gemini Vision (${discoveredModel})...`;
    if (percentText) percentText.innerText = '55%';

    const payload = {
      contents: [{ role: 'user', parts: parts }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    };

    let lastError = null;
    let responseJson = null;
    let usedModel = null;

    for (const model of candidateModels) {
      try {
        console.log(`Attempting Gemini Vision OCR with model: ${model}`);
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${response.status} ${response.statusText}`;
          console.warn(`Model ${model} failed:`, errMsg);
          lastError = new Error(`[${model}] ${errMsg}`);
          continue;
        }

        const data = await response.json();
        if (data && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          responseJson = data;
          usedModel = model;
          console.log(`Successfully extracted data using model: ${model}`);
          break;
        }
      } catch (callErr) {
        console.warn(`Model ${model} network error:`, callErr);
        lastError = callErr;
      }
    }

    if (!responseJson || !responseJson.candidates || !responseJson.candidates[0]?.content?.parts?.[0]?.text) {
      let errMsg = lastError ? lastError.message : 'ไม่สามารถประมวลผลด้วย AI ได้ กรุณาตรวจสอบ API Key';
      if (errMsg.includes('API key not valid') || errMsg.includes('API_KEY_INVALID')) {
        errMsg = 'API Key ไม่ถูกต้อง กรุณาตรวจสอบ API Key จาก Google AI Studio';
      } else if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
        errMsg = 'โควตาการใช้งาน Gemini API ฟรีเต็มชั่วคราว กรุณารอสักครู่แล้วลองใหม่';
      }
      throw new Error(errMsg);
    }

    if (progressBar) progressBar.style.width = '85%';
    if (statusText) statusText.innerText = `ถอดรหัสผลตรวจสำเร็จ (${usedModel}) และตรวจทาน PDPA...`;
    if (percentText) percentText.innerText = '85%';

    const rawContent = responseJson.candidates[0].content.parts[0].text;
    let cleanJsonStr = rawContent.trim();
    if (cleanJsonStr.startsWith('```json')) {
      cleanJsonStr = cleanJsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanJsonStr.startsWith('```')) {
      cleanJsonStr = cleanJsonStr.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const data = JSON.parse(cleanJsonStr);
    lastExtractedData = data;

    if (progressBar) progressBar.style.width = '100%';
    if (statusText) statusText.innerText = 'สกัดข้อมูลสำเร็จเรียบร้อย!';
    if (percentText) percentText.innerText = '100%';

    setTimeout(() => {
      if (progressBox) progressBox.style.display = 'none';
      showExtractionReview(data);
    }, 600);

  } catch (err) {
    console.error(err);
    if (progressBox) progressBox.style.display = 'none';
    alert('เกิดข้อผิดพลาดในการวิเคราะห์เอกสาร: ' + err.message);
  } finally {
    if (btnScan) {
      btnScan.disabled = false;
      btnScan.style.opacity = '1';
    }
  }
}

function showExtractionReview(data) {
  const reviewBox = document.getElementById('extraction-review-box');
  const previewGrid = document.getElementById('extracted-values-preview');
  if (!reviewBox || !previewGrid) return;
  previewGrid.innerHTML = '';

  const items = [
    { label: 'Office BP', val: (data.sbp && data.dbp) ? `${data.sbp}/${data.dbp} mmHg` : (data.sbp ? `${data.sbp} mmHg` : null), highlight: true },
    { label: 'Heart Rate', val: data.hr ? `${data.hr} bpm` : null },
    { label: 'Home BP', val: (data.home_sbp && data.home_dbp) ? `${data.home_sbp}/${data.home_dbp} mmHg` : null },
    { label: 'Age', val: data.age ? `${data.age} ปี` : null },
    { label: 'Sex', val: data.sex ? (data.sex === 'female' ? 'หญิง (Female)' : 'ชาย (Male)') : null },
    { label: 'Serum Cr', val: data.serum_cr ? `${data.serum_cr} mg/dL` : null, highlight: true },
    { label: 'Serum K+', val: data.potassium_k ? `${data.potassium_k} mEq/L` : null, highlight: true },
    { label: 'Urine ACR', val: data.uacr ? `${data.uacr} mg/g` : null, highlight: true },
    { label: 'Total Chol', val: data.total_cholesterol ? `${data.total_cholesterol} mg/dL` : null },
    { label: 'Triglycerides', val: data.triglycerides ? `${data.triglycerides} mg/dL` : null },
    { label: 'HDL-C', val: data.hdl ? `${data.hdl} mg/dL` : null },
    { label: 'LDL-C', val: data.ldl ? `${data.ldl} mg/dL` : null, highlight: true },
    { label: 'Weight', val: data.weight_kg ? `${data.weight_kg} kg` : null },
    { label: 'Height', val: data.height_cm ? `${data.height_cm} cm` : null },
    { label: 'Waist', val: data.waist_inches ? `${data.waist_inches} นิ้ว` : null },
    { label: 'Diabetes', val: data.diabetes ? 'เป็นเบาหวาน (DM)' : null },
    { label: 'Smoking', val: data.smoking ? 'สูบบุหรี่ (Smoking)' : null },
    { label: 'CAD / ASCVD', val: data.cad ? 'มีประวัติโรคหัวใจ (CAD)' : null },
    { label: 'Heart Failure', val: data.heart_failure ? 'หัวใจล้มเหลว (HF)' : null },
    { label: 'Stroke', val: data.stroke ? 'หลอดเลือดสมอง (Stroke)' : null },
    { label: 'AF', val: data.af ? 'หัวใจเต้นพลิ้ว (AF)' : null }
  ];

  items.forEach(it => {
    if (it.val !== null && it.val !== undefined) {
      const div = document.createElement('div');
      div.className = `ai-review-chip ${it.highlight ? 'highlight' : ''}`;
      div.innerHTML = `
        <div class="ai-chip-label">${it.label}</div>
        <div class="ai-chip-val">${it.val}</div>
      `;
      previewGrid.appendChild(div);
    }
  });

  if (data.detected_summary) {
    const sumDiv = document.createElement('div');
    sumDiv.className = 'ai-summary-chip';
    sumDiv.innerHTML = `<strong>สรุปข้อมูลที่พบ:</strong> ${data.detected_summary}`;
    previewGrid.appendChild(sumDiv);
  }

  reviewBox.style.display = 'block';
  renderIconsSafe();
}

function applyExtractedData() {
  if (!lastExtractedData) return;
  const d = lastExtractedData;

  function setInp(id, val) {
    if (val === undefined || val === null || val === '') return;
    const el = document.getElementById(id);
    if (!el) return;
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  if (d.age) setInp('inp-age', d.age);
  if (d.sex) {
    const s = d.sex.toString().toLowerCase();
    if (typeof setSex === 'function') {
      setSex(s === 'female' || s === '0' ? 0 : 1);
    }
  }
  if (d.height_cm || d.height) setInp('inp-height', d.height_cm || d.height);
  if (d.weight_kg || d.weight) setInp('inp-weight', d.weight_kg || d.weight);

  let waist = d.waist_inches || d.waist;
  if (waist && waist > 50) waist = (waist / 2.54).toFixed(1);
  if (waist) setInp('inp-waist', waist);

  if (d.sbp) setInp('inp-sbp', d.sbp);
  if (d.dbp) setInp('inp-dbp', d.dbp);
  if (d.hr) setInp('inp-hr', d.hr);
  if (d.home_sbp) setInp('inp-home-sbp', d.home_sbp);
  if (d.home_dbp) setInp('inp-home-dbp', d.home_dbp);

  if (d.serum_cr || d.serum_creatinine) setInp('inp-scr', d.serum_cr || d.serum_creatinine);
  if (d.potassium_k || d.k_level) setInp('inp-k', d.potassium_k || d.k_level);
  if (d.uacr) setInp('inp-uacr', d.uacr);

  if (d.total_cholesterol) setInp('inp-tc', Math.round(d.total_cholesterol));
  if (d.triglycerides || d.triglyceride) setInp('inp-tg', Math.round(d.triglycerides || d.triglyceride));
  if (d.hdl || d.hdl_c) setInp('inp-hdl', Math.round(d.hdl || d.hdl_c));

  function setCondition(chkId, key, val) {
    if (val === undefined || val === null || val === '') return;
    const isChecked = !!val;
    const chk = document.getElementById(chkId);
    if (chk) chk.checked = isChecked;
    if (typeof toggleCondition === 'function') {
      toggleCondition(key, isChecked);
    }
  }

  setCondition('chk-dm', 'dm', d.diabetes);
  setCondition('chk-smoke', 'smoke', d.smoking);
  setCondition('chk-cad', 'cad', d.cad);
  setCondition('chk-hf', 'hf', d.heart_failure);
  setCondition('chk-stroke', 'stroke', d.stroke);
  setCondition('chk-af', 'af', d.af);
  setCondition('chk-frailty', 'frailty', d.frailty);
  setCondition('chk-pregnant', 'isPregnant', d.pregnant);

  if (d.current_medications && typeof setCurrentMedStatus === 'function') {
    const meds = d.current_medications;
    let detectedMeds = [];
    if (meds.ccb) {
      detectedMeds.push({ id: 'amlodipine', name: 'Amlodipine', brand: 'Norvasc', dose: '5 mg', freq: 'OD', isSPC: false, classes: ['CCB'] });
    }
    if (meds.acei_arb) {
      detectedMeds.push({ id: 'losartan', name: 'Losartan', brand: 'Cozaar', dose: '50 mg', freq: 'OD', isSPC: false, classes: ['RAS'] });
    }
    if (meds.diuretic) {
      detectedMeds.push({ id: 'hctz', name: 'Hydrochlorothiazide (HCTZ)', brand: 'Generic', dose: '25 mg', freq: 'OD', isSPC: false, classes: ['Diuretic'] });
    }
    if (meds.beta_blocker) {
      detectedMeds.push({ id: 'atenolol', name: 'Atenolol', brand: 'Tenormin', dose: '50 mg', freq: 'OD', isSPC: false, classes: ['BB'] });
    }
    if (meds.mra) {
      detectedMeds.push({ id: 'spironolactone', name: 'Spironolactone', brand: 'Aldactone', dose: '25 mg', freq: 'OD', isSPC: false, classes: ['MRA'] });
    }

    if (detectedMeds.length > 0 && window.appState) {
      window.appState.patient.currentMedStatus = 'treated';
      window.appState.patient.currentMedsList = detectedMeds;
      setCurrentMedStatus('treated');
      if (typeof renderCurrentMedsList === 'function') renderCurrentMedsList();
    }
  }

  if (typeof syncInputsToState === 'function') syncInputsToState();
  if (typeof calcLipidPanel === 'function') calcLipidPanel();
  if (typeof updateLipidCalculations === 'function') updateLipidCalculations();
  if (typeof recalculateAll === 'function') recalculateAll();
  if (typeof syncPrintSheets === 'function') syncPrintSheets();

  dismissExtractionReview();
  showToast('✅ นำเข้าข้อมูลทางห้องปฏิบัติการและสัญญาณชีพเข้าสู่ Dashboard เรียบร้อยแล้ว!');
}

function dismissExtractionReview() {
  const reviewBox = document.getElementById('extraction-review-box');
  if (reviewBox) reviewBox.style.display = 'none';
}

function focusAiScanner() {
  const card = document.getElementById('ai-scanner-card');
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('ai-scanner-pulse-highlight');
    setTimeout(() => {
      card.classList.remove('ai-scanner-pulse-highlight');
    }, 2000);
  }
}

function renderIconsSafe() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    try { lucide.createIcons(); } catch(e) {}
  }
}

function initLabImport() {
  initApiKey();

  // Load stored Gemini API Key for modal
  const savedKey = localStorage.getItem('dm_master_gemini_api_key') || localStorage.getItem('gemini_api_key') || '';
  const keyInput = document.getElementById('gemini-api-key-input');
  const statusSpan = document.getElementById('gemini-key-status');
  if (keyInput) keyInput.value = savedKey;
  if (statusSpan) {
    if (savedKey) {
      statusSpan.innerText = '✅ บันทึก Key แล้ว (' + savedKey.substring(0, 6) + '...)';
      statusSpan.style.color = '#15803d';
    } else {
      statusSpan.innerText = '(ยังไม่ได้ระบุ Key - กรุณากรอก API Key ด้านล่าง)';
      statusSpan.style.color = '#b45309';
    }
  }

  // Setup drag & drop on both dropzones
  ['dropzone', 'lab-dropzone'].forEach(id => {
    const dz = document.getElementById(id);
    if (!dz) return;
    ['dragenter', 'dragover'].forEach(eventName => {
      dz.addEventListener(eventName, function(e) {
        e.preventDefault();
        e.stopPropagation();
        dz.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dz.addEventListener(eventName, function(e) {
        e.preventDefault();
        e.stopPropagation();
        dz.classList.remove('dragover');
      }, false);
    });

    dz.addEventListener('drop', function(e) {
      const dt = e.dataTransfer;
      const files = dt ? dt.files : null;
      if (files && files.length > 0) {
        if (id === 'dropzone') {
          handleFileSelect({ target: { files: files } });
        } else {
          handleIncomingFiles(files);
        }
      }
    }, false);
  });

  // Global Paste Listener (Ctrl+V / Cmd+V)
  window.addEventListener('paste', function(e) {
    if (e.clipboardData && e.clipboardData.items) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            handleFileSelect({ target: { files: [file] } });
            focusAiScanner();
          }
          return;
        }
      }
    }
  });

  renderIconsSafe();
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
  activeLabEngine = 'gemini';
  const configBox = document.getElementById('lab-gemini-config-box');
  if (configBox) configBox.style.display = 'block';
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
    // Gemini AI Multimodal Engine
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
  window.initApiKey = initApiKey;
  window.saveApiKey = saveApiKey;
  window.clearApiKey = clearApiKey;
  window.handleFileSelect = handleFileSelect;
  window.removeFile = removeFile;
  window.clearAllUploadedFiles = clearAllUploadedFiles;
  window.renderUploadedThumbnails = renderUploadedThumbnails;
  window.processDocumentsWithAI = processDocumentsWithAI;
  window.showExtractionReview = showExtractionReview;
  window.applyExtractedData = applyExtractedData;
  window.dismissExtractionReview = dismissExtractionReview;
  window.focusAiScanner = focusAiScanner;
  window.renderIconsSafe = renderIconsSafe;
}
