/**
 * Hypertension Master Dashboard - Main Application Controller
 * พัฒนาโดย นพ.ธนภพ การุญ วิทยาลัยแพทยศาสตร์และการสาธารณสุข มหาวิทยาลัยอุบลราชธานี
 * ติดต่อ/ข้อเสนอแนะ: myfolk36@gmail.com, thanaphop.k@ubu.ac.th
 */

// Global Application State
const appState = {
  mode: 'clinician', // 'clinician' or 'patient'
  activeGuideline: 'thai', // 'thai', 'aha', 'esc'
  thaiRiskMode: 'lab', // 'lab' or 'non-lab' (matching lipid-ascvd-dashboard.pages.dev)
  editingMedIndex: -1,
  patient: {
    hn: '',
    name: '',
    physician: '',
    age: 52,
    sex: 1, // 1 = Male, 0 = Female
    height: 165,
    weight: 68,
    waist: 34,
    sbp: 148,
    dbp: 92,
    hr: 78,
    homeSbp: null,
    homeDbp: null,
    scr: 1.0,
    egfr: 86.2,
    kLevel: 4.2,
    uacr: null,
    tc: 210,
    tg: 150,
    hdl: 48,
    ldl: 132,
    nonHdl: 162,
    dm: 0,
    smoking: 0,
    cad: 0,
    hf: 0,
    stroke: 0,
    af: 0,
    frailty: 0,
    isPregnant: 0,
    currentMedStatus: 'naive', // 'naive' or 'treated'
    currentMedsList: [] // Array of { id, name, brand, dose, freq, isSPC, classes, generic }
  },
  lastResults: null
};
if (typeof window !== 'undefined') {
  window.appState = appState;
}

// --- Mode Switching ---
function switchAppMode(mode) {
  appState.mode = mode;
  const clinicianView = document.getElementById('clinician-mode-view');
  const patientView = document.getElementById('patient-mode-view');
  const btnClinician = document.getElementById('btn-mode-clinician');
  const btnPatient = document.getElementById('btn-mode-patient');

  if (mode === 'patient') {
    document.body.classList.add('print-mode-patient');
    if (clinicianView) clinicianView.style.display = 'none';
    if (patientView) patientView.style.display = 'block';
    if (btnClinician) btnClinician.classList.remove('active');
    if (btnPatient) btnPatient.classList.add('active');
    if (appState.lastResults) {
      window.renderPatientDashboard(appState.patient, appState.lastResults.stagingThai, appState.lastResults.targetBP, appState.lastResults.medPlan);
    }
  } else {
    document.body.classList.remove('print-mode-patient');
    if (clinicianView) clinicianView.style.display = 'block';
    if (patientView) patientView.style.display = 'none';
    if (btnClinician) btnClinician.classList.add('active');
    if (btnPatient) btnPatient.classList.remove('active');
  }
}

// --- Guideline Switcher ---
function setActiveGuideline(guideKey) {
  appState.activeGuideline = guideKey;
  ['thai', 'aha', 'esc'].forEach(k => {
    const btn = document.getElementById(`btn-guide-${k}`);
    if (btn) {
      if (k === guideKey) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });
  recalculateAll();
}

// --- Thai CV Risk Mode Switcher (Matching lipid-ascvd-dashboard.pages.dev) ---
function setThaiMode(m) {
  appState.thaiRiskMode = m;
  const btnLab = document.getElementById('btn-t-lab');
  const btnNonLab = document.getElementById('btn-t-nonlab');
  if (btnLab && btnNonLab) {
    if (m === 'lab') {
      btnLab.className = 'active';
      btnLab.style.background = '#213875';
      btnLab.style.color = '#fff';
      btnLab.style.boxShadow = '0 2px 4px rgba(33,56,117,0.25)';
      btnNonLab.className = '';
      btnNonLab.style.background = 'transparent';
      btnNonLab.style.color = '#475569';
      btnNonLab.style.boxShadow = 'none';
    } else {
      btnNonLab.className = 'active';
      btnNonLab.style.background = '#213875';
      btnNonLab.style.color = '#fff';
      btnNonLab.style.boxShadow = '0 2px 4px rgba(33,56,117,0.25)';
      btnLab.className = '';
      btnLab.style.background = 'transparent';
      btnLab.style.color = '#475569';
      btnLab.style.boxShadow = 'none';
    }
  }
  recalculateAll();
}
window.setThaiMode = setThaiMode;
window.setThaiRiskMode = setThaiMode;

// --- Input Handlers ---
function setSex(sexVal) {
  appState.patient.sex = sexVal;
  const btnMale = document.getElementById('btn-sex-male');
  const btnFemale = document.getElementById('btn-sex-female');
  if (sexVal === 1) {
    btnMale.classList.add('active');
    btnFemale.classList.remove('active');
  } else {
    btnMale.classList.remove('active');
    btnFemale.classList.add('active');
  }
  recalculateAll();
}

function toggleCondition(conditionKey, isChecked) {
  const p = appState.patient;
  const val = isChecked ? 1 : 0;
  const chip = document.getElementById(`chip-${conditionKey}`);
  if (chip) {
    if (isChecked) chip.classList.add('checked');
    else chip.classList.remove('checked');
  }

  switch (conditionKey) {
    case 'dm': p.dm = val; break;
    case 'smoke': p.smoking = val; break;
    case 'cad': p.cad = val; break;
    case 'hf': p.hf = val; break;
    case 'stroke': p.stroke = val; break;
    case 'af': p.af = val; break;
    case 'frailty': p.frailty = val; break;
    case 'pregnant': p.isPregnant = val; break;
  }
  recalculateAll();
}

// --- Current Medication Manager Handlers ---
function setCurrentMedStatus(status) {
  appState.patient.currentMedStatus = status;
  const btnNaive = document.getElementById('btn-med-status-naive');
  const btnTreated = document.getElementById('btn-med-status-treated');
  const panel = document.getElementById('panel-treated-meds');

  if (status === 'treated') {
    if (btnNaive) btnNaive.classList.remove('active');
    if (btnTreated) btnTreated.classList.add('active');
    if (panel) panel.style.display = 'block';
  } else {
    if (btnNaive) btnNaive.classList.add('active');
    if (btnTreated) btnTreated.classList.remove('active');
    if (panel) panel.style.display = 'none';
    appState.patient.currentMedsList = [];
  }
  renderCurrentMedsList();
  recalculateAll();
}
if (typeof window !== 'undefined') {
  window.setCurrentMedStatus = setCurrentMedStatus;
}

// 2-Step Comprehensive Drug Catalog (100% Thai Guideline Formulary & SPCs)
const MED_CLASS_MAP = {
  CCB: {
    label: '💊 CCB (เช่น Amlodipine, Felodipine)',
    drugs: [
      { id: 'amlodipine', name: 'Amlodipine (Norvasc / Generic)' },
      { id: 'felodipine', name: 'Felodipine ER (Plendil ER)' },
      { id: 'manidipine', name: 'Manidipine (Manyper)' },
      { id: 'lercanidipine', name: 'Lercanidipine (Zanidip)' },
      { id: 'nitrendipine', name: 'Nitrendipine (Baypress)' },
      { id: 'nifedipine', name: 'Nifedipine (Adalat CR / Generic SR)' },
      { id: 'diltiazem', name: 'Diltiazem (Herbesser) [Non-DHP]' },
      { id: 'verapamil', name: 'Verapamil (Isoptin) [Non-DHP]' }
    ]
  },
  ARB: {
    label: '💊 ARB (เช่น Losartan, Telmisartan)',
    drugs: [
      { id: 'losartan', name: 'Losartan (Cozaar / Generic)' },
      { id: 'telmisartan', name: 'Telmisartan (Micardis / Generic)' },
      { id: 'valsartan', name: 'Valsartan (Diovan)' },
      { id: 'irbesartan', name: 'Irbesartan (Aprovel)' },
      { id: 'candesartan', name: 'Candesartan (Blopress)' },
      { id: 'olmesartan', name: 'Olmesartan (Olmetec)' },
      { id: 'azilsartan', name: 'Azilsartan (Edarbi)' }
    ]
  },
  ACEI: {
    label: '💊 ACEI (เช่น Enalapril, Ramipril)',
    drugs: [
      { id: 'enalapril', name: 'Enalapril (Renitec / Generic)' },
      { id: 'ramipril', name: 'Ramipril (Tritace)' },
      { id: 'lisinopril', name: 'Lisinopril (Zestril)' },
      { id: 'perindopril', name: 'Perindopril (Coversyl)' },
      { id: 'captopril', name: 'Captopril (Capoten / Generic)' },
      { id: 'benazepril', name: 'Benazepril (Cibacen)' },
      { id: 'quinapril', name: 'Quinapril (Accupril)' },
      { id: 'imidapril', name: 'Imidapril (Tanatril)' }
    ]
  },
  Diuretic: {
    label: '💊 Diuretic (HCTZ / Indapamide / Lasix)',
    drugs: [
      { id: 'hctz', name: 'Hydrochlorothiazide (HCTZ)' },
      { id: 'indapamide', name: 'Indapamide SR (Natrilix SR)' },
      { id: 'chlorthalidone', name: 'Chlorthalidone (Hygroton)' },
      { id: 'furosemide', name: 'Furosemide (Lasix)' },
      { id: 'amiloride', name: 'Amiloride (Moduretic component)' },
      { id: 'triamterene', name: 'Triamterene (Dyrenium)' }
    ]
  },
  BB: {
    label: '💊 Beta-blocker (Bisoprolol, Carvedilol)',
    drugs: [
      { id: 'bisoprolol', name: 'Bisoprolol (Concor / Generic)' },
      { id: 'carvedilol', name: 'Carvedilol (Dilatrend)' },
      { id: 'metoprolol', name: 'Metoprolol (Betaloc / Betaloc-ZOK)' },
      { id: 'nebivolol', name: 'Nebivolol (Nebilet)' },
      { id: 'atenolol', name: 'Atenolol (Tenormin)' },
      { id: 'propranolol', name: 'Propranolol (Inderal)' }
    ]
  },
  MRA: {
    label: '💊 MRA (Spironolactone, Eplerenone)',
    drugs: [
      { id: 'spironolactone', name: 'Spironolactone (Aldactone)' },
      { id: 'eplerenone', name: 'Eplerenone (Inspra)' }
    ]
  },
  SPC: {
    label: '⚡ ยาเม็ดรวม (Single-Pill SPC)',
    drugs: [
      { id: 'spc_twynsta', name: 'Twynsta (Telmisartan + Amlodipine)' },
      { id: 'spc_exforge', name: 'Exforge (Valsartan + Amlodipine)' },
      { id: 'spc_sevikar', name: 'Sevikar (Olmesartan + Amlodipine)' },
      { id: 'spc_amlozar', name: 'Amlozar (Losartan + Amlodipine)' },
      { id: 'spc_coveram', name: 'Coveram (Perindopril + Amlodipine)' },
      { id: 'spc_viacoram', name: 'Viacoram (Perindopril + Amlodipine)' },
      { id: 'spc_hyzaar', name: 'Hyzaar (Losartan + HCTZ)' },
      { id: 'spc_micardisplus', name: 'MicardisPlus (Telmisartan + HCTZ)' },
      { id: 'spc_codiovan', name: 'Co-Diovan (Valsartan + HCTZ)' },
      { id: 'spc_coversylplus', name: 'Coversyl Plus (Perindopril + Indapamide)' },
      { id: 'spc_triplixam', name: 'Triplixam (Perindopril + Indapamide + Amlodipine)' },
      { id: 'spc_exforgehct', name: 'Exforge HCT (Valsartan + Amlodipine + HCTZ)' },
      { id: 'spc_sevikarhct', name: 'Sevikar HCT (Olmesartan + Amlodipine + HCTZ)' }
    ]
  },
  Other: {
    label: '🔹 กลุ่มอื่นๆ (Alpha-1 / Direct Vasodilator)',
    drugs: [
      { id: 'doxazosin', name: 'Doxazosin (Cardura)' },
      { id: 'prazosin', name: 'Prazosin (Minipress)' },
      { id: 'terazosin', name: 'Terazosin (Hytrin)' },
      { id: 'methyldopa', name: 'Methyldopa (Aldomet)' },
      { id: 'hydralazine', name: 'Hydralazine (Apresoline)' },
      { id: 'minoxidil', name: 'Minoxidil (Loniten)' }
    ]
  }
};
if (typeof window !== 'undefined') {
  window.MED_CLASS_MAP = MED_CLASS_MAP;
}

function initCurrentMedDropdowns() {
  const classSelect = document.getElementById('sel-add-med-class');
  if (classSelect) {
    classSelect.value = 'CCB';
  }
  onAddMedClassChange();
}

function onAddMedClassChange() {
  const classSelect = document.getElementById('sel-add-med-class');
  const drugSelect = document.getElementById('sel-add-med-drug');
  if (!classSelect || !drugSelect) return;

  const currentClass = classSelect.value || 'CCB';
  const group = MED_CLASS_MAP[currentClass];
  drugSelect.innerHTML = '';

  if (group && group.drugs) {
    group.drugs.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.text = d.name;
      drugSelect.appendChild(opt);
    });
  }

  onAddMedDrugChange();
}

function onAddMedDrugChange() {
  const drugSelect = document.getElementById('sel-add-med-drug');
  const doseSelect = document.getElementById('sel-add-med-dose');
  const freqSelect = document.getElementById('sel-add-med-freq');
  if (!drugSelect || !doseSelect) return;

  const val = drugSelect.value;
  doseSelect.innerHTML = '';

  if (val && val.startsWith('spc_')) {
    const spc = (window.ALL_SPCS && window.ALL_SPCS[val]) || (window.findSPCInCatalog && window.findSPCInCatalog(val));
    if (spc && spc.strengths) {
      spc.strengths.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.text = s;
        doseSelect.appendChild(opt);
      });
      if (freqSelect) freqSelect.value = 'OD';
    } else {
      const spcKey = val.replace('spc_', '');
      const pop = window.POPULAR_SPCS ? window.POPULAR_SPCS[spcKey] : null;
      if (pop) {
        const opt = document.createElement('option');
        opt.value = pop.dose;
        opt.text = pop.dose;
        doseSelect.appendChild(opt);
        if (freqSelect) freqSelect.value = 'OD';
      }
    }
  } else if (val) {
    const drug = window.findDrugInCatalog ? window.findDrugInCatalog(val) : (window.THAI_HT_DRUGS ? window.THAI_HT_DRUGS[val] : null);
    if (drug && drug.standardDoses) {
      drug.standardDoses.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.text = d;
        doseSelect.appendChild(opt);
      });
      if (freqSelect) {
        if (drug.standardFreqs && drug.standardFreqs.includes('OD')) {
          freqSelect.value = 'OD';
        } else if (drug.standardFreqs && drug.standardFreqs.length > 0) {
          freqSelect.value = drug.standardFreqs[0];
        }
      }
    }
  }
}

function addMedicationFromForm() {
  const drugSelect = document.getElementById('sel-add-med-drug');
  const doseSelect = document.getElementById('sel-add-med-dose');
  const freqSelect = document.getElementById('sel-add-med-freq');
  if (!drugSelect || !doseSelect || !freqSelect) return;

  const val = drugSelect.value;
  const dose = doseSelect.value;
  const freq = freqSelect.value;
  if (!val) return;

  let newMed = null;
  if (val.startsWith('spc_')) {
    const spc = (window.ALL_SPCS && window.ALL_SPCS[val]) || (window.findSPCInCatalog && window.findSPCInCatalog(val));
    if (spc) {
      newMed = {
        id: spc.id,
        name: spc.name,
        brand: spc.brand,
        generic: spc.generic,
        dose: dose || (spc.strengths ? spc.strengths[0] : ''),
        freq: freq || 'OD',
        isSPC: true,
        classes: spc.classes
      };
    } else {
      const spcKey = val.replace('spc_', '');
      const pop = window.POPULAR_SPCS ? window.POPULAR_SPCS[spcKey] : null;
      if (pop) {
        newMed = {
          id: spcKey,
          name: pop.name,
          brand: pop.brand,
          generic: pop.generic,
          dose: dose || pop.dose,
          freq: freq || 'OD',
          isSPC: true,
          classes: pop.classes
        };
      }
    }
  } else {
    const drug = window.findDrugInCatalog ? window.findDrugInCatalog(val) : (window.THAI_HT_DRUGS ? window.THAI_HT_DRUGS[val] : null);
    if (drug) {
      newMed = {
        id: drug.id,
        name: drug.name,
        brand: drug.brandTH,
        dose: dose,
        freq: freq,
        isSPC: false,
        classes: [drug.classGroup]
      };
    }
  }

  if (newMed) {
    if (appState.editingMedIndex >= 0 && appState.editingMedIndex < appState.patient.currentMedsList.length) {
      appState.patient.currentMedsList[appState.editingMedIndex] = newMed;
      cancelEditCurrentMed();
    } else {
      appState.patient.currentMedsList.push(newMed);
    }
  }

  renderCurrentMedsList();
  recalculateAll();
}

function editCurrentMed(index) {
  if (index < 0 || index >= appState.patient.currentMedsList.length) return;
  appState.editingMedIndex = index;
  const med = appState.patient.currentMedsList[index];

  // Determine Class group
  let targetClass = 'CCB';
  if (med.isSPC || (med.id && med.id.startsWith('spc_'))) {
    targetClass = 'SPC';
  } else {
    for (const [grpKey, grpVal] of Object.entries(MED_CLASS_MAP)) {
      if (grpVal.drugs && grpVal.drugs.some(d => d.id === med.id)) {
        targetClass = grpKey;
        break;
      }
    }
  }

  const classSelect = document.getElementById('sel-add-med-class');
  if (classSelect) {
    classSelect.value = targetClass;
    onAddMedClassChange();
  }

  const drugSelect = document.getElementById('sel-add-med-drug');
  if (drugSelect) {
    let foundVal = null;
    for (let i = 0; i < drugSelect.options.length; i++) {
      const optVal = drugSelect.options[i].value;
      if (optVal === med.id || (med.isSPC && (optVal === 'spc_' + med.id || optVal.replace('spc_', '') === med.id))) {
        foundVal = optVal;
        break;
      }
    }
    if (foundVal) {
      drugSelect.value = foundVal;
    }
    onAddMedDrugChange();
  }

  const doseSelect = document.getElementById('sel-add-med-dose');
  if (doseSelect && med.dose) {
    doseSelect.value = med.dose;
  }

  const freqSelect = document.getElementById('sel-add-med-freq');
  if (freqSelect && med.freq) {
    freqSelect.value = med.freq;
  }

  const banner = document.getElementById('editing-med-banner');
  const editName = document.getElementById('editing-med-name');
  const lblTitle = document.getElementById('lbl-add-med-title');
  const btnAction = document.getElementById('btn-add-med-action');
  const btnCancel = document.getElementById('btn-cancel-med-edit');
  if (banner) banner.style.display = 'flex';
  if (editName) editName.innerText = `${med.name} ${med.dose || ''} ${med.freq || ''}`;
  if (lblTitle) lblTitle.innerText = `✏️ แก้ไขรายการยา: ${med.name}`;
  if (btnAction) {
    btnAction.innerText = '💾 บันทึกการแก้ไข (Update)';
    btnAction.className = 'btn btn-primary';
    btnAction.style.background = '#16a34a';
    btnAction.style.borderColor = '#15803d';
  }
  if (btnCancel) btnCancel.style.display = 'inline-flex';

  renderCurrentMedsList();

  const addBox = document.getElementById('add-med-box');
  if (addBox) {
    addBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function cancelEditCurrentMed() {
  appState.editingMedIndex = -1;
  const banner = document.getElementById('editing-med-banner');
  const lblTitle = document.getElementById('lbl-add-med-title');
  const btnAction = document.getElementById('btn-add-med-action');
  const btnCancel = document.getElementById('btn-cancel-med-edit');
  if (banner) banner.style.display = 'none';
  if (lblTitle) lblTitle.innerText = '+ เพิ่มยาลดความดันที่ได้รับ:';
  if (btnAction) {
    btnAction.innerText = '+ เพิ่มยา';
    btnAction.className = 'btn btn-primary btn-add-med';
    btnAction.style.background = '';
    btnAction.style.borderColor = '';
  }
  if (btnCancel) btnCancel.style.display = 'none';
  renderCurrentMedsList();
}

function removeCurrentMed(index) {
  if (appState.editingMedIndex === index) {
    cancelEditCurrentMed();
  } else if (appState.editingMedIndex > index) {
    appState.editingMedIndex--;
  }
  appState.patient.currentMedsList.splice(index, 1);
  renderCurrentMedsList();
  recalculateAll();
}

function clearAllCurrentMeds() {
  cancelEditCurrentMed();
  appState.patient.currentMedsList = [];
  renderCurrentMedsList();
  recalculateAll();
}

function applyPresetMed(presetKey) {
  cancelEditCurrentMed();
  appState.patient.currentMedStatus = 'treated';
  const btnNaive = document.getElementById('btn-med-status-naive');
  const btnTreated = document.getElementById('btn-med-status-treated');
  const panel = document.getElementById('panel-treated-meds');
  if (btnNaive) btnNaive.classList.remove('active');
  if (btnTreated) btnTreated.classList.add('active');
  if (panel) panel.style.display = 'block';

  switch (presetKey) {
    case 'amlo5':
      appState.patient.currentMedsList = [
        { id: 'amlodipine', name: 'Amlodipine', brand: 'Norvasc', dose: '5 mg', freq: 'OD', isSPC: false, classes: ['CCB'] }
      ];
      break;
    case 'losar50':
      appState.patient.currentMedsList = [
        { id: 'losartan', name: 'Losartan', brand: 'Cozaar', dose: '50 mg', freq: 'OD', isSPC: false, classes: ['RAS'] }
      ];
      break;
    case 'enala10_bid':
      appState.patient.currentMedsList = [
        { id: 'enalapril', name: 'Enalapril', brand: 'Renitec', dose: '10 mg', freq: 'BID', isSPC: false, classes: ['RAS'] }
      ];
      break;
    case 'dual_amlo_losar':
      appState.patient.currentMedsList = [
        { id: 'amlodipine', name: 'Amlodipine', brand: 'Norvasc', dose: '5 mg', freq: 'OD', isSPC: false, classes: ['CCB'] },
        { id: 'losartan', name: 'Losartan', brand: 'Cozaar', dose: '50 mg', freq: 'OD', isSPC: false, classes: ['RAS'] }
      ];
      break;
    case 'twynsta_40_5':
      appState.patient.currentMedsList = [
        { id: 'twynsta_40_5', name: 'Twynsta 40/5 mg OD', brand: 'Twynsta', generic: 'Telmisartan 40 mg + Amlodipine 5 mg', dose: '40/5 mg', freq: 'OD', isSPC: true, classes: ['RAS', 'CCB'] }
      ];
      break;
    case 'triple_full':
      appState.patient.currentMedsList = [
        { id: 'amlodipine', name: 'Amlodipine', brand: 'Norvasc', dose: '10 mg', freq: 'OD', isSPC: false, classes: ['CCB'] },
        { id: 'losartan', name: 'Losartan', brand: 'Cozaar', dose: '100 mg', freq: 'OD', isSPC: false, classes: ['RAS'] },
        { id: 'hctz', name: 'Hydrochlorothiazide (HCTZ)', brand: 'Generic', dose: '25 mg', freq: 'OD', isSPC: false, classes: ['Diuretic'] }
      ];
      break;
  }

  renderCurrentMedsList();
  recalculateAll();
}

function renderCurrentMedsList() {
  const container = document.getElementById('current-meds-list-container');
  const summaryBadge = document.getElementById('badge-med-count-summary');
  if (!container) return;

  const list = appState.patient.currentMedsList;
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = '<div style="font-size:0.8rem; color:#94a3b8; font-style:italic; padding:6px 0;">ยังไม่มีรายการยาที่เพิ่ม (เลือกยาด้านล่างแล้วกด "+ เพิ่มยา")</div>';
    if (summaryBadge) {
      summaryBadge.className = 'badge badge-neutral';
      summaryBadge.innerText = (appState.patient.currentMedStatus === 'treated') ? '0 ชนิด (ยังไม่ได้ระบุยา)' : '0 ชนิด (Naïve)';
    }
    return;
  }

  list.forEach((med, idx) => {
    const isEditingThis = (appState.editingMedIndex === idx);
    const div = document.createElement('div');
    div.className = 'current-med-chip' + (isEditingThis ? ' med-editing-active' : '');
    div.innerHTML = `
      <div class="med-info">
        <span class="med-title">💊 ${med.name}</span>
        <span class="med-dose-tag">${med.dose || ''} ${med.freq || ''}</span>
        ${med.isSPC ? '<span class="med-spc-badge">SPC ยาผสม</span>' : ''}
        ${isEditingThis ? '<span style="font-size:0.7rem; color:#2563eb; font-weight:700; margin-left:6px;">(กำลังแก้ไข...)</span>' : ''}
      </div>
      <div class="med-actions">
        <button type="button" class="btn-edit-med" title="แก้ไขยานี้" onclick="editCurrentMed(${idx})">✏️</button>
        <button type="button" class="btn-del-med" title="ลบยานี้" onclick="removeCurrentMed(${idx})">🗑️</button>
      </div>
    `;
    container.appendChild(div);
  });

  if (summaryBadge) {
    summaryBadge.className = 'badge badge-blue';
    summaryBadge.innerText = `${list.length} รายการยา (On Treatment)`;
  }
}

// --- Sync State from Input Elements ---
function syncInputsToState() {
  const p = appState.patient;
  p.hn = document.getElementById('inp-hn')?.value || '';
  p.name = document.getElementById('inp-name')?.value || '';
  p.physician = document.getElementById('inp-doc')?.value || '';
  p.age = parseFloat(document.getElementById('inp-age')?.value) || 50;
  p.height = parseFloat(document.getElementById('inp-height')?.value) || 165;
  p.weight = parseFloat(document.getElementById('inp-weight')?.value) || 68;
  p.waist = parseFloat(document.getElementById('inp-waist')?.value) || 34;

  p.sbp = parseFloat(document.getElementById('inp-sbp')?.value) || 120;
  p.dbp = parseFloat(document.getElementById('inp-dbp')?.value) || 80;
  p.hr = parseFloat(document.getElementById('inp-hr')?.value) || null;

  const homeSbpInp = document.getElementById('inp-home-sbp')?.value;
  const homeDbpInp = document.getElementById('inp-home-dbp')?.value;
  p.homeSbp = homeSbpInp ? parseFloat(homeSbpInp) : null;
  p.homeDbp = homeDbpInp ? parseFloat(homeDbpInp) : null;

  p.scr = parseFloat(document.getElementById('inp-scr')?.value) || null;
  p.kLevel = parseFloat(document.getElementById('inp-k')?.value) || null;
  const uacrInp = document.getElementById('inp-uacr')?.value;
  p.uacr = uacrInp ? parseFloat(uacrInp) : null;

  p.tc = parseFloat(document.getElementById('inp-tc')?.value) || null;
  p.tg = parseFloat(document.getElementById('inp-tg')?.value) != null ? parseFloat(document.getElementById('inp-tg')?.value) : null;
  p.hdl = parseFloat(document.getElementById('inp-hdl')?.value) || null;

  if (p.tc && p.hdl && p.tg != null && window.calcEffectiveLdl) {
    p.nonHdl = Math.max(0, Math.round((p.tc - p.hdl) * 10) / 10);
    p.ldlFriedewald = Math.round(window.calcFriedewald(p.tc, p.hdl, p.tg) * 10) / 10;
    p.ldlSampson = Math.round(window.calcSampson(p.tc, p.hdl, p.tg) * 10) / 10;
    p.ldlModSampson = Math.round(window.calcModifiedSampson(p.tc, p.hdl, p.tg) * 10) / 10;
    p.ldl = Math.max(0, Math.round(window.calcEffectiveLdl(p.tc, p.hdl, p.tg) * 10) / 10);
  } else {
    p.nonHdl = (p.tc && p.hdl) ? Math.max(0, p.tc - p.hdl) : null;
    p.ldl = parseFloat(document.getElementById('inp-ldl')?.value) || null;
  }
}

// --- Core Recalculation Engine ---
function recalculateAll() {
  syncInputsToState();
  const p = appState.patient;

  // 0. Lipid Calculations Live Badge Sync
  const lblLdl = document.getElementById('lbl-ldl-val');
  const lblLdlMethod = document.getElementById('lbl-ldl-method');
  const lblNonHdl = document.getElementById('lbl-non-hdl-val');
  const lblFriedewald = document.getElementById('lbl-friedewald-val');
  const badgeTgWarn = document.getElementById('badge-tg-warning');

  if (p.ldl != null) {
    if (lblLdl) lblLdl.innerText = p.ldl.toFixed(1);
    if (lblNonHdl) lblNonHdl.innerText = (p.nonHdl != null) ? p.nonHdl.toFixed(1) : '-';
    if (lblFriedewald) {
      lblFriedewald.innerText = (p.tg > 400) ? 'ไม่แนะนำ (TG > 400)' : `${p.ldlFriedewald != null ? p.ldlFriedewald.toFixed(1) : '-'} mg/dL`;
    }
    if (lblLdlMethod) {
      if (p.tg <= 400) {
        lblLdlMethod.innerText = '(Modified Sampson / NIH Eq. 2)';
      } else if (p.tg <= 800) {
        lblLdlMethod.innerText = '(Modified Sampson - Extended)';
      } else {
        lblLdlMethod.innerText = '(Friedewald Fallback)';
      }
    }
    if (badgeTgWarn) {
      badgeTgWarn.style.display = (p.tg >= 500) ? 'block' : 'none';
    }
  } else {
    if (lblLdl) lblLdl.innerText = '-';
    if (lblNonHdl) lblNonHdl.innerText = '-';
    if (lblFriedewald) lblFriedewald.innerText = '-';
    if (badgeTgWarn) badgeTgWarn.style.display = 'none';
  }

  // 1. BMI Calculation
  const bmiRes = window.calculateBmi(p.weight, p.height);
  if (bmiRes) {
    p.bmi = bmiRes.bmi;
    document.getElementById('lbl-bmi-val').innerText = `${bmiRes.bmi} kg/m²`;
    document.getElementById('lbl-bmi-cat').innerText = bmiRes.category;
  }

  // 2. CKD-EPI 2021 eGFR Calculation
  if (p.scr && p.age) {
    p.egfr = window.calcCKDEPI2021(p.scr, p.age, p.sex);
    const ckdRes = window.getCkdStage(p.egfr, p.uacr);
    document.getElementById('lbl-egfr-val').innerText = `${p.egfr} mL/min/1.73m²`;
    document.getElementById('lbl-ckd-stage').innerText = `${ckdRes.stage} (${ckdRes.desc})`;
  } else {
    p.egfr = null;
    document.getElementById('lbl-egfr-val').innerText = 'N/A';
    document.getElementById('lbl-ckd-stage').innerText = 'ไม่ได้ระบุ Creatinine';
  }

  // 3. Out-of-Office BP Evaluation (White-coat / Masked HT)
  const outOfOfficeEval = window.evaluateOutofOfficeBP(p.sbp, p.dbp, p.homeSbp, p.homeDbp, null, null);

  // 4. Target BP
  const targetBP = window.getTargetBP(p);

  // 5. Cardiovascular Risk Calculation
  // Thai CV Risk Score (EGAT) - Supports Lab-based (TC) and Non-lab (Waist) switcher
  const currentThaiMode = appState.thaiRiskMode || 'lab';
  const thaiRisk = window.calculateThaiRisk(p.age, p.sex, p.sbp, p.dm, p.smoking, p.tc, p.waist, p.height, currentThaiMode);
  thaiRisk.mode = currentThaiMode;

  // AHA PREVENT 2023/2025 Full Engine
  const preventRisk = window.calculatePreventApiFull(
    p.age, p.sex, p.tc, p.hdl, p.sbp, p.bmi, p.egfr, p.dm, p.smoking, (p.currentMedsList.length > 0 ? 1 : 0), 0
  );

  // ESC SCORE2
  const score2Risk = window.calcSCORE2(p.age, p.sex, p.smoking, p.sbp, p.tc, p.hdl, 'Moderate', p.dm);

  // Overall Clinical Risk Categorization
  const riskEval = window.evaluateOverallRisk(p, thaiRisk.pct);

  // 6. Staging across 3 Guidelines (AHA/ACC 2025 uses PREVENT 10-yr CVD cutoff 7.5%)
  const hasHighRiskComorbidity = (p.dm === 1 || p.ckd === 1 || p.cad === 1 || p.stroke === 1 || (p.egfr && p.egfr < 60));
  const stagingThai = window.classifyThai2024(p.sbp, p.dbp);
  const stagingESC = window.classifyESC2024(p.sbp, p.dbp);
  const stagingACC = window.classifyAHAACC2025(p.sbp, p.dbp, preventRisk ? preventRisk.cvd : null, hasHighRiskComorbidity);

  // 7. Pharmacotherapy Recommendation Plan (Guideline-Specific)
  const medPlan = window.generateMedicationPlan(p, stagingThai, stagingESC, stagingACC, riskEval, appState.activeGuideline);

  // Cache results
  appState.lastResults = {
    stagingThai,
    stagingESC,
    stagingACC,
    outOfOfficeEval,
    targetBP,
    thaiRisk,
    preventRisk,
    score2Risk,
    riskEval,
    medPlan
  };

  // --- Render to DOM ---
  updateDashboardDOM();

  // If currently in patient mode, update patient dashboard
  if (appState.mode === 'patient') {
    window.renderPatientDashboard(p, stagingThai, targetBP, medPlan);
  }
}

// --- DOM Rendering Helper ---
function updateDashboardDOM() {
  const {
    stagingThai, stagingESC, stagingACC, outOfOfficeEval,
    targetBP, thaiRisk, preventRisk, score2Risk, riskEval, medPlan
  } = appState.lastResults;

  const guide = appState.activeGuideline;

  // Update Guideline Switcher Buttons Active State
  ['thai', 'aha', 'esc'].forEach(k => {
    const btn = document.getElementById(`btn-guide-${k}`);
    if (btn) {
      if (k === guide) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });

  // Staging Banner
  document.getElementById('lbl-staging-thai').innerText = stagingThai.label;
  document.getElementById('lbl-staging-desc').innerText = stagingThai.desc;
  const badgeStaging = document.getElementById('badge-staging');
  badgeStaging.className = `badge ${stagingThai.badge}`;
  badgeStaging.innerText = stagingThai.stage.toUpperCase();

  // Out-of-Office BP Banner
  const outOfOfficeBox = document.getElementById('outofoffice-eval-box');
  if (outOfOfficeEval && outOfOfficeEval.type !== 'INSUFFICIENT_DATA') {
    outOfOfficeBox.style.display = 'block';
    outOfOfficeBox.className = `alert-box ${outOfOfficeEval.alertClass || 'alert-blue'}`;
    outOfOfficeBox.innerHTML = `<strong>${outOfOfficeEval.title}</strong><div style="margin-top:2px;">${outOfOfficeEval.desc}</div>`;
  } else {
    outOfOfficeBox.style.display = 'none';
  }

  // 3-Guideline Comparison Table
  document.getElementById('cmp-class-thai').innerHTML = `<strong>${stagingThai.stage}</strong><br><span style="font-size:0.75rem; color:#64748b;">${stagingThai.label}</span>`;
  document.getElementById('cmp-class-esc').innerHTML = `<strong>${stagingESC.stage}</strong><br><span style="font-size:0.75rem; color:#64748b;">${stagingESC.label}</span>`;
  document.getElementById('cmp-class-acc').innerHTML = `<strong>${stagingACC.stage}</strong><br><span style="font-size:0.75rem; color:#64748b;">${stagingACC.label}</span>`;

  document.getElementById('cmp-target-thai').innerHTML = `<strong>${targetBP.thai.text}</strong>`;
  document.getElementById('cmp-target-esc').innerHTML = `<strong>${targetBP.esc.text}</strong>`;
  document.getElementById('cmp-target-acc').innerHTML = `<strong>${targetBP.aha ? targetBP.aha.text : targetBP.acc.text}</strong>`;

  // Staging Initiation comparison
  const isThaiDual = stagingThai.code === 'STAGE2' || riskEval.code === 'HIGH' || riskEval.code === 'VERY_HIGH';
  document.getElementById('cmp-init-thai').innerHTML = isThaiDual ? '⚡ เริ่มยา 2 ชนิดพร้อมกัน (Dual SPC)' : '🌱 ปรับพฤติกรรม + เริ่มยาเดี่ยว (Monotherapy)';
  document.getElementById('cmp-init-esc').innerHTML = (stagingESC.code === 'HYPERTENSION') ? '⚡ Immediate Dual Therapy (SPC)' : '🌱 Lifestyle 3 mo (พิจารณายาถ้า High Risk)';
  document.getElementById('cmp-init-acc').innerHTML = stagingACC.initStrategy;

  document.getElementById('cmp-pearl-thai').innerText = targetBP.thai.rationale;
  document.getElementById('cmp-pearl-esc').innerText = targetBP.esc.rationale;
  document.getElementById('cmp-pearl-acc').innerText = targetBP.aha ? targetBP.aha.rationale : targetBP.acc.rationale;

  // Cardiovascular Risk Section
  const badgeOverall = document.getElementById('badge-overall-risk');
  badgeOverall.className = `badge ${riskEval.badge}`;
  badgeOverall.innerText = riskEval.label;
  document.getElementById('lbl-risk-rationale').innerText = riskEval.reason;

  // Thai CV Risk Score (2 decimal places)
  document.getElementById('lbl-thai-risk-val').innerText = `${thaiRisk.pct.toFixed(2)}%`;
  document.getElementById('lbl-thai-risk-cat').innerText = thaiRisk.categoryLabel + thaiRisk.note;
  const lblThaiMode = document.getElementById('lbl-thai-risk-mode-desc');
  if (lblThaiMode) {
    lblThaiMode.innerText = (currentThaiMode === 'lab')
      ? `Ramathibodi / EGAT (ใช้ผลเลือด TC: ${p.tc || 200} mg/dL)`
      : `Ramathibodi / EGAT (ไม่ใช้ผลเลือด: รอบเอว ${p.waist || 34}″ / สูง ${p.height || 165} ซม.)`;
  }

  // AHA PREVENT (Total CVD is Primary, 2 decimal places)
  if (preventRisk) {
    document.getElementById('lbl-prevent-val').innerText = `Total CVD ${preventRisk.cvd.toFixed(2)}%`;
    document.getElementById('lbl-prevent-sub').innerText = `ASCVD: ${preventRisk.ascvd.toFixed(2)}% | Heart Failure: ${preventRisk.hf.toFixed(2)}%`;
  } else {
    document.getElementById('lbl-prevent-val').innerText = 'N/A';
    document.getElementById('lbl-prevent-sub').innerText = 'อายุอยู่นอกเกณฑ์ (30–79 ปี)';
  }

  // ESC SCORE2 (2 decimal places)
  if (score2Risk) {
    document.getElementById('lbl-score2-val').innerText = `${score2Risk.pct.toFixed(2)}%`;
    document.getElementById('lbl-score2-cat').innerText = score2Risk.category;
  } else {
    document.getElementById('lbl-score2-val').innerText = 'N/A';
    document.getElementById('lbl-score2-cat').innerText = 'อายุอยู่นอกเกณฑ์ (40–89 ปี)';
  }

  // =========================================================================
  // Section 5: Dynamic Pharmacotherapy & Guideline Rendering
  // =========================================================================

  // Guideline Title & Target BP Box
  const guideTitles = {
    thai: 'เป้าหมายความดันโลหิต (Target BP) — สมาคมความดันโลหิตสูงแห่งประเทศไทย 2567',
    aha: 'เป้าหมายความดันโลหิต (Target BP) — AHA/ACC 2025 Guideline',
    esc: 'เป้าหมายความดันโลหิต (Target BP) — European Society of Cardiology (ESC 2024)'
  };
  const guideBadges = {
    thai: '(Thai HT 2567)',
    aha: '(AHA/ACC 2025)',
    esc: '(ESC 2024)'
  };

  const titleEl = document.getElementById('lbl-active-guide-title');
  if (titleEl) titleEl.innerText = guideTitles[guide] || guideTitles.thai;

  document.getElementById('lbl-target-bp-val').innerText = medPlan.targetBPText;
  document.getElementById('lbl-target-bp-badge').innerText = guideBadges[guide] || '';
  document.getElementById('lbl-target-bp-reason').innerText = medPlan.targetRationale;

  // Control Status Badge
  const badgeControl = document.getElementById('badge-control-status');
  if (badgeControl) {
    if (appState.patient.currentMedsList.length === 0) {
      badgeControl.className = 'badge badge-neutral';
      badgeControl.innerText = 'ยังไม่ได้รับยา (Naïve)';
    } else if (medPlan.isBPControlled) {
      badgeControl.className = 'badge badge-green';
      badgeControl.innerText = '🟢 ความดันถึงเป้าหมายแล้ว (Controlled)';
    } else {
      badgeControl.className = 'badge badge-amber';
      badgeControl.innerText = '🔴 ความดันยังเกินเป้าหมาย (Uncontrolled)';
    }
  }

  // Current Regimen Summary Banner
  const currentRegimenBox = document.getElementById('current-regimen-eval-box');
  if (currentRegimenBox) {
    const meds = appState.patient.currentMedsList;
    if (appState.patient.currentMedStatus === 'treated' && meds.length === 0) {
      currentRegimenBox.innerHTML = `
        <div style="font-size:0.82rem; font-weight:700; color:#b45309;">
          ⚠️ สถานะ: กำลังได้รับยา แต่ยังไม่ได้เลือกรายการยา — กรุณาเลือกยาและกด "+ เพิ่มยา" ในช่องด้านซ้าย
        </div>
      `;
    } else if (meds.length === 0) {
      currentRegimenBox.innerHTML = `
        <div style="font-size:0.82rem; font-weight:700; color:#475569;">
          🌱 สถานะยาปัจจุบัน: ยังไม่ได้รับยาลดความดัน (Treatment-Naïve)
        </div>
      `;
    } else {
      const distinctNames = meds.map(m => `<strong>${m.name}</strong> ${m.dose || ''} (${m.freq || ''})`).join(' + ');
      const triadNote = medPlan.currentMedAnalysis.hasCoreTriad
        ? '<span style="color:#0f766e; font-weight:700;"> | ⚡ ได้รับยาแกนหลัก 3 ประสาน (A+C+D) ครบถ้วน</span>'
        : '';
      currentRegimenBox.innerHTML = `
        <div style="font-size:0.82rem; color:#1e293b; line-height:1.5;">
          <strong>💊 ยาปัจจุบัน (${meds.length} รายการ, ${medPlan.currentMedAnalysis.classCount} กลุ่มกลไก):</strong> ${distinctNames} ${triadNote}
        </div>
      `;
    }
  }

  // Medication Strategy Title & Description
  document.getElementById('lbl-med-strategy-title').innerText = medPlan.strategyTitle;
  document.getElementById('lbl-med-strategy-desc').innerText = medPlan.strategy;

  // Safety Alerts Container
  const alertsContainer = document.getElementById('safety-alerts-container');
  alertsContainer.innerHTML = '';
  if (medPlan.alerts && medPlan.alerts.length > 0) {
    medPlan.alerts.forEach(a => {
      const div = document.createElement('div');
      div.className = `alert-box ${a.level === 'danger' ? 'alert-red' : 'alert-amber'}`;
      div.style.marginBottom = '8px';
      div.innerHTML = `<strong>${a.title}</strong><div style="margin-top:2px;">${a.desc}</div>`;
      alertsContainer.appendChild(div);
    });
  }

  // Drug Choices
  const drugChoicesContainer = document.getElementById('drug-choices-container');
  drugChoicesContainer.innerHTML = '';
  if (medPlan.drugChoices && medPlan.drugChoices.length > 0) {
    medPlan.drugChoices.forEach(d => {
      const card = document.createElement('div');
      card.className = 'drug-item-card';
      card.innerHTML = `
        <div class="drug-item-header">
          <span class="drug-item-name">${d.name}</span>
          <span class="drug-item-dose">${d.dose || d.startDose || ''}</span>
        </div>
        <div class="drug-item-notes">${d.notes || ''}</div>
      `;
      drugChoicesContainer.appendChild(card);
    });
  }

  // SPC Options Available in Thailand (Concise & Clean Pills)
  const spcContainer = document.getElementById('spc-options-container');
  const spcWrapper = document.getElementById('box-spc-options-wrapper');
  if (spcContainer) {
    spcContainer.innerHTML = '';
    if (medPlan.spcOptions && medPlan.spcOptions.length > 0) {
      if (spcWrapper) spcWrapper.style.display = 'block';
      let html = '<div style="display:flex; flex-direction:column; gap:6px;">';
      medPlan.spcOptions.forEach(cat => {
        cat.items.forEach(item => {
          html += `
            <div class="spc-item-row" style="font-size:0.82rem; display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:6px 10px;">
              <div>
                <strong style="color:#1e40af;">💊 ${item.brand}</strong>
                <span style="color:#475569; margin-left:4px;">(${item.generic})</span>
              </div>
              <div style="text-align:right;">
                <span style="color:#64748b; font-size:0.76rem; background:#f1f5f9; padding:2px 6px; border-radius:4px;">${item.strengths.join(' | ')}</span>
                <span style="font-size:0.75rem; color:#0d9488; font-weight:600; margin-left:4px;">${item.edStatus.includes('ในบัญชี') ? 'ED' : 'Non-ED'}</span>
              </div>
            </div>
          `;
        });
      });
      html += '</div>';
      spcContainer.innerHTML = html;
    } else {
      if (spcWrapper) spcWrapper.style.display = 'none';
    }
  }

  // Monitoring text
  document.getElementById('lbl-monitoring-text').innerText = medPlan.monitoring;
}

// --- Quick Presets Loader ---
function loadPreset(presetKey) {
  const p = appState.patient;

  // Reset toggles first
  ['dm', 'smoke', 'cad', 'hf', 'stroke', 'af', 'frailty', 'pregnant'].forEach(k => {
    const chk = document.getElementById(`chk-${k}`);
    if (chk) chk.checked = false;
    const chip = document.getElementById(`chip-${k}`);
    if (chip) chip.classList.remove('checked');
    p[k === 'smoke' ? 'smoking' : (k === 'pregnant' ? 'isPregnant' : k)] = 0;
  });

  document.getElementById('inp-home-sbp').value = '';
  document.getElementById('inp-home-dbp').value = '';
  p.homeSbp = null;
  p.homeDbp = null;

  switch (presetKey) {
    case 'normal':
      p.age = 32; setSex(1);
      p.sbp = 116; p.dbp = 74; p.hr = 70;
      p.scr = 0.9; p.kLevel = 4.1; p.tc = 185; p.tg = 110; p.hdl = 52;
      setCurrentMedStatus('naive');
      break;

    case 'bpatrisk':
      p.age = 44; setSex(1);
      p.sbp = 134; p.dbp = 86; p.hr = 76;
      p.scr = 1.0; p.kLevel = 4.3; p.tc = 220; p.tg = 165; p.hdl = 45;
      document.getElementById('chk-smoke').checked = true;
      toggleCondition('smoke', true);
      setCurrentMedStatus('naive');
      break;

    case 'stage1':
      p.age = 50; setSex(1);
      p.sbp = 148; p.dbp = 92; p.hr = 78;
      p.scr = 1.0; p.kLevel = 4.2; p.tc = 215; p.tg = 155; p.hdl = 46;
      setCurrentMedStatus('naive');
      break;

    case 'elderly':
      p.age = 76; setSex(0);
      p.sbp = 164; p.dbp = 82; p.hr = 72; // ISH
      p.scr = 1.1; p.kLevel = 4.4; p.tc = 195; p.tg = 125; p.hdl = 55;
      document.getElementById('chk-frailty').checked = true;
      toggleCondition('frailty', true);
      setCurrentMedStatus('naive');
      break;

    case 'dm_ckd':
      p.age = 58; setSex(0);
      p.sbp = 144; p.dbp = 88; p.hr = 80;
      p.scr = 1.4; p.kLevel = 4.6; p.tc = 210; p.tg = 200; p.hdl = 40;
      document.getElementById('inp-uacr').value = 180;
      document.getElementById('chk-dm').checked = true;
      toggleCondition('dm', true);
      setCurrentMedStatus('naive');
      break;

    case 'cad_hf':
      p.age = 63; setSex(1);
      p.sbp = 138; p.dbp = 84; p.hr = 84;
      p.scr = 1.2; p.kLevel = 4.3; p.tc = 175; p.tg = 210; p.hdl = 38;
      document.getElementById('chk-cad').checked = true;
      toggleCondition('cad', true);
      document.getElementById('chk-hf').checked = true;
      toggleCondition('hf', true);
      setCurrentMedStatus('naive');
      break;

    case 'resistant':
      p.age = 60; setSex(1);
      p.sbp = 154; p.dbp = 96; p.hr = 80;
      p.scr = 1.1; p.kLevel = 4.3; p.tc = 205; p.tg = 165; p.hdl = 44;
      applyPresetMed('triple_full');
      break;

    case 'whitecoat':
      p.age = 48; setSex(1);
      p.sbp = 152; p.dbp = 94; p.hr = 88; // Elevated in clinic
      p.homeSbp = 124; p.homeDbp = 76; // Normal at home
      document.getElementById('inp-home-sbp').value = 124;
      document.getElementById('inp-home-dbp').value = 76;
      p.scr = 0.95; p.kLevel = 4.2; p.tc = 200; p.tg = 125; p.hdl = 50;
      setCurrentMedStatus('naive');
      break;
  }

  // Update inputs
  document.getElementById('inp-age').value = p.age;
  document.getElementById('inp-sbp').value = p.sbp;
  document.getElementById('inp-dbp').value = p.dbp;
  document.getElementById('inp-hr').value = p.hr || 75;
  document.getElementById('inp-scr').value = p.scr || 1.0;
  document.getElementById('inp-k').value = p.kLevel || 4.2;
  document.getElementById('inp-tc').value = p.tc || 200;
  if (document.getElementById('inp-tg')) document.getElementById('inp-tg').value = p.tg || 150;
  document.getElementById('inp-hdl').value = p.hdl || 50;
  if (document.getElementById('inp-ldl')) document.getElementById('inp-ldl').value = p.ldl || 120;

  recalculateAll();
}

function updateLipidCalculations() {
  recalculateAll();
}
if (typeof window !== 'undefined') {
  window.loadPreset = loadPreset;
}

// --- EMR Modal Handlers ---
function openEMRModal() {
  recalculateAll();
  const {
    stagingThai, stagingESC, stagingACC, outOfOfficeEval,
    targetBP, riskEval, thaiRisk, preventRisk, score2Risk, medPlan
  } = appState.lastResults;

  const noteObj = window.generateEMRNote(
    appState.patient, stagingThai, stagingESC, stagingACC,
    outOfOfficeEval, targetBP, riskEval, thaiRisk, preventRisk, score2Risk, medPlan
  );

  const textarea = document.getElementById('emr-note-text');
  if (textarea) textarea.value = noteObj.fullNote;

  const modal = document.getElementById('emr-modal-overlay');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeEMRModal() {
  const modal = document.getElementById('emr-modal-overlay');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function handleModalBackdrop(e) {
  if (e && e.target && e.target.id === 'emr-modal-overlay') {
    closeEMRModal();
  }
}

function copyEMRNote() {
  const text = document.getElementById('emr-note-text')?.value;
  if (!text) return;

  window.copyEMRNoteToClipboard(text, () => {
    showToast('✅ คัดลอกบันทึกเวชระเบียน (EMR SOAP Note) เรียบร้อยแล้ว!');
  });
}

function showToast(message) {
  const toast = document.getElementById('toast-msg');
  if (!toast) return;
  toast.innerText = message;
  toast.style.display = 'flex';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// =========================================================================
// A4 STRICT 1-PAGE PRINT & PREVIEW SYSTEM
// =========================================================================

function syncPrintSheets() {
  syncInputsToState();
  if (!appState.lastResults) {
    recalculateAll();
  }
  const p = appState.patient;
  const res = appState.lastResults;
  if (!res) return;

  const { stagingThai, stagingESC, stagingACC, targetBP, thaiRisk, preventRisk, score2Risk, riskEval, medPlan } = res;

  // Thai Date Formatter
  const today = new Date();
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const dateStr = `${today.getDate()} ${thaiMonths[today.getMonth()]} ${today.getFullYear() + 543}`;

  // Comorbidities Summary string
  const comorbList = [];
  if (p.dm === 1) comorbList.push('เบาหวาน (DM)');
  if (p.cad === 1) comorbList.push('หลอดเลือดหัวใจ (CAD)');
  if (p.hf === 1) comorbList.push('หัวใจล้มเหลว (HF)');
  if (p.stroke === 1) comorbList.push('อัมพฤกษ์/อัมพาต (Stroke/TIA)');
  if (p.af === 1) comorbList.push('หัวใจห้องบนสั่นพลิ้ว (AF)');
  if (p.ckd === 1 || (p.egfr && p.egfr < 60)) comorbList.push(`โรคไตเรื้อรัง (CKD${p.egfr ? ' eGFR ' + p.egfr : ''})`);
  if (p.smoking === 1) comorbList.push('สูบบุหรี่ (Smoker)');
  if (p.frailty === 1) comorbList.push('ผู้สูงอายุเปราะบาง (Frailty)');
  if (p.isPregnant === 1) comorbList.push('สตรีมีครรภ์ (Pregnancy)');
  const comorbStr = comorbList.length > 0 ? comorbList.join(' • ') : 'ไม่มีโรคร่วมหรือข้อบ่งชี้บังคับเด่น';

  // Blank Handwriting Dotted Line Placeholders
  const blankName = '....................................';
  const blankHn = '........................';
  const blankDoc = '....................................';
  const blankSign = '....................................................';

  // -------------------------------------------------------------------------
  // 1. SYNC CLINICIAN PRINT SHEET (#print-report-sheet)
  // -------------------------------------------------------------------------
  const prsName = document.getElementById('prs-name');
  if (prsName) prsName.innerText = p.name ? p.name : blankName;

  const prsHn = document.getElementById('prs-hn');
  if (prsHn) prsHn.innerText = p.hn ? p.hn : blankHn;

  const prsDate = document.getElementById('prs-date');
  if (prsDate) prsDate.innerText = dateStr;

  const prsDoc = document.getElementById('prs-doc');
  if (prsDoc) prsDoc.innerText = p.physician ? p.physician : blankDoc;

  const prsSignDoc = document.getElementById('prs-sign-doc') || document.getElementById('prs-sign-name');
  if (prsSignDoc) prsSignDoc.innerText = p.physician ? p.physician : blankSign;

  const prsAgeSex = document.getElementById('prs-age-sex');
  if (prsAgeSex) prsAgeSex.innerText = `${p.age} ปี / ${p.sex === 1 ? 'ชาย (Male)' : 'หญิง (Female)'}`;

  const prsBmi = document.getElementById('prs-bmi');
  if (prsBmi) prsBmi.innerText = p.bmi ? `${p.bmi} kg/m²` : '-';

  const prsOfficeBp = document.getElementById('prs-office-bp');
  if (prsOfficeBp) prsOfficeBp.innerText = `${p.sbp} / ${p.dbp}`;

  const prsHr = document.getElementById('prs-hr');
  if (prsHr) prsHr.innerText = p.hr ? `${p.hr}` : '-';

  const prsHomeBp = document.getElementById('prs-home-bp');
  if (prsHomeBp) {
    prsHomeBp.innerText = (p.homeSbp && p.homeDbp) ? `${p.homeSbp}/${p.homeDbp} mmHg` : 'ไม่มีข้อมูล (แนะนำทำ 7-2-2)';
  }

  const prsWaist = document.getElementById('prs-waist');
  if (prsWaist) prsWaist.innerText = p.waist ? `${p.waist} นิ้ว (${Math.round(p.waist * 2.54)} ซม.)` : '-';

  // Labs
  const prsScr = document.getElementById('prs-scr');
  if (prsScr) prsScr.innerText = (p.scr != null && !isNaN(p.scr)) ? `${p.scr}` : '-';

  const prsEgfr = document.getElementById('prs-egfr');
  if (prsEgfr) prsEgfr.innerText = (p.egfr != null && !isNaN(p.egfr)) ? `${p.egfr} mL/min/1.73m²` : '-';

  const prsK = document.getElementById('prs-k');
  if (prsK) prsK.innerText = (p.kLevel != null && !isNaN(p.kLevel)) ? `${p.kLevel}` : '-';

  const prsUacr = document.getElementById('prs-uacr');
  if (prsUacr) prsUacr.innerText = (p.uacr != null && !isNaN(p.uacr)) ? `${p.uacr}` : '-';

  const prsTc = document.getElementById('prs-tc');
  if (prsTc) prsTc.innerText = (p.tc != null && !isNaN(p.tc)) ? `${p.tc} mg/dL` : '-';

  const prsTcTg = document.getElementById('prs-tc-tg');
  if (prsTcTg) {
    const tcStr = (p.tc != null && !isNaN(p.tc)) ? `${p.tc}` : '-';
    const tgStr = (p.tg != null && !isNaN(p.tg)) ? `${p.tg}` : '-';
    prsTcTg.innerText = `${tcStr} / ${tgStr}`;
  }

  const prsLipids = document.getElementById('prs-lipids');
  if (prsLipids) {
    const hdlStr = (p.hdl != null && !isNaN(p.hdl)) ? `${p.hdl}` : '-';
    const ldlStr = (p.ldl != null && !isNaN(p.ldl)) ? `${p.ldl.toFixed(1)}` : '-';
    prsLipids.innerText = `${hdlStr} / ${ldlStr}`;
  }

  const prsComorbidList = document.getElementById('prs-comorbid-list');
  if (prsComorbidList) prsComorbidList.innerText = comorbStr;

  // Staging & Target
  const prsStagingTitle = document.getElementById('prs-staging-title');
  if (prsStagingTitle) prsStagingTitle.innerText = stagingThai.label || stagingThai.stage;

  const prsStagingDesc = document.getElementById('prs-staging-desc');
  if (prsStagingDesc) prsStagingDesc.innerText = stagingThai.desc || '-';

  const prsTargetVal = document.getElementById('prs-target-val');
  if (prsTargetVal) prsTargetVal.innerText = targetBP.thai.text;

  const prsTargetStatus = document.getElementById('prs-target-status');
  if (prsTargetStatus) {
    const isCtrl = (p.sbp <= 130 && p.dbp <= 80);
    prsTargetStatus.innerText = isCtrl ? '✅ ควบคุมความดันได้ตามเป้าหมาย (Controlled BP)' : '⚠️ ยังไม่ถึงเกณฑ์เป้าหมาย (Uncontrolled BP)';
  }

  // Mini Guideline Table
  const prsGuideTableBody = document.getElementById('prs-guideline-table-body');
  if (prsGuideTableBody) {
    prsGuideTableBody.innerHTML = `
      <tr>
        <td style="font-weight:700;">การจัดระดับ (Staging)</td>
        <td style="color:#1e40af; font-weight:700;">${stagingThai.stage}</td>
        <td style="color:#0f766e; font-weight:700;">${stagingESC.stage}</td>
        <td style="color:#b45309; font-weight:700;">${stagingACC.stage}</td>
      </tr>
      <tr>
        <td style="font-weight:700;">เกณฑ์เริ่มยา (Threshold)</td>
        <td>≥ 140/90 (หรือ 130/80 หาก High Risk)</td>
        <td>≥ 140/90 (หรือ 120–139 หาก High Risk)</td>
        <td>≥ 130/80 (Stage 1 CVD ≥ 7.5% / Comorb)</td>
      </tr>
      <tr>
        <td style="font-weight:700;">เป้าหมายความดัน (Target)</td>
        <td style="color:#166534; font-weight:700;">${targetBP.thai.text}</td>
        <td style="color:#0f766e; font-weight:700;">${targetBP.esc.text}</td>
        <td style="color:#b45309; font-weight:700;">${targetBP.aha.text}</td>
      </tr>
    `;
  }

  // 10-Yr CVD Risk Assessment (Strict 2 Decimals)
  const prsThaiRiskVal = document.getElementById('prs-thai-risk-val');
  if (prsThaiRiskVal) prsThaiRiskVal.innerText = `${thaiRisk.pct.toFixed(2)}%`;

  const prsThaiRiskCat = document.getElementById('prs-thai-risk-cat');
  const thaiModeTag = (appState.thaiRiskMode === 'non-lab') ? '[Non-lab/รอบเอว]' : '[Lab/TC]';
  if (prsThaiRiskCat) prsThaiRiskCat.innerText = `${thaiRisk.categoryLabel} ${thaiModeTag}${thaiRisk.note ? ' ' + thaiRisk.note : ''}`;

  const prsPreventVal = document.getElementById('prs-prevent-val');
  if (prsPreventVal) {
    prsPreventVal.innerText = preventRisk ? `Total CVD ${preventRisk.cvd.toFixed(2)}%` : 'N/A';
  }

  const prsPreventSub = document.getElementById('prs-prevent-sub');
  if (prsPreventSub) {
    prsPreventSub.innerText = preventRisk ? `ASCVD: ${preventRisk.ascvd.toFixed(2)}% | HF: ${preventRisk.hf.toFixed(2)}%` : 'อายุอยู่นอกเกณฑ์ (30–79 ปี)';
  }

  const prsScore2Val = document.getElementById('prs-score2-val');
  if (prsScore2Val) {
    prsScore2Val.innerText = score2Risk ? `${score2Risk.pct.toFixed(2)}%` : 'N/A';
  }

  const prsScore2Cat = document.getElementById('prs-score2-cat');
  if (prsScore2Cat) {
    prsScore2Cat.innerText = score2Risk ? score2Risk.category : 'อายุอยู่นอกเกณฑ์ (40–89 ปี)';
  }

  const prsOverallRiskText = document.getElementById('prs-overall-risk-text');
  if (prsOverallRiskText) {
    prsOverallRiskText.innerText = `${riskEval.label} — ${riskEval.reason}`;
  }

  // Pharmacotherapy Plan
  const prsCurrentMedsList = document.getElementById('prs-current-meds-list');
  if (prsCurrentMedsList) {
    if (p.currentMedsList.length === 0) {
      prsCurrentMedsList.innerHTML = '<span style="color:#64748b; font-style:italic;">ยังไม่ได้รับยาลดความดัน (Treatment-Naïve)</span>';
    } else {
      prsCurrentMedsList.innerHTML = p.currentMedsList.map((m, idx) => `
        <div style="margin-bottom:2px;">
          <strong>${idx + 1}. ${m.name}</strong> ${m.dose || ''} ${m.freq || ''}
          ${m.isSPC ? '<span style="font-size:5.8pt; color:#4338ca; background:#e0e7ff; padding:1px 3px; border-radius:3px;">SPC ยาผสม</span>' : ''}
        </div>
      `).join('');
    }
  }

  const prsRecRegimenTitle = document.getElementById('prs-rec-regimen-title');
  if (prsRecRegimenTitle) prsRecRegimenTitle.innerText = medPlan.strategyTitle || 'คำแนะนำสูตรยาตามแนวทางเวชปฏิบัติ';

  const prsRecRegimenDesc = document.getElementById('prs-rec-regimen-desc');
  if (prsRecRegimenDesc) prsRecRegimenDesc.innerText = medPlan.strategy || '-';

  const prsSpcPillExamples = document.getElementById('prs-spc-pill-examples');
  if (prsSpcPillExamples) {
    if (medPlan.spcOptions && medPlan.spcOptions.length > 0) {
      const spcTexts = medPlan.spcOptions.slice(0, 3).map(s => `<strong>${s.brand || s.name}</strong> (${s.generic || s.dose})`).join(', ');
      prsSpcPillExamples.innerHTML = `ยาเม็ดรวมทางเลือก (SPC Options): ${spcTexts}`;
    } else {
      prsSpcPillExamples.innerText = 'พิจารณาการให้ยาเดี่ยว (Monotherapy) หรือยาแยกเม็ดตามความเหมาะสม';
    }
  }

  const prsMonitoringText = document.getElementById('prs-monitoring-text');
  if (prsMonitoringText) {
    prsMonitoringText.innerText = medPlan.monitoring || 'นัดตรวจติดตามความดันโลหิตและประเมินผลข้างเคียงใน 2–4 สัปดาห์ | ตรวจ Serum Creatinine และ Potassium ซ้ำใน 2–4 สัปดาห์';
  }

  // 1.1 SYNC PAGE 2 OF CLINICIAN REPORT (#prs-page-2: Comprehensive Patient Self-Care)
  const p2Name = document.getElementById('prs-p2-name');
  if (p2Name) p2Name.innerText = p.name ? p.name : blankName;

  const p2Hn = document.getElementById('prs-p2-hn');
  if (p2Hn) p2Hn.innerText = p.hn ? p.hn : blankHn;

  const p2Date = document.getElementById('prs-p2-date');
  if (p2Date) p2Date.innerText = dateStr;

  const p2Target = document.getElementById('prs-p2-target');
  if (p2Target) p2Target.innerText = `${targetBP.thai.text} มม.ปรอท`;

  const p2Bp = document.getElementById('prs-p2-bp-reading');
  if (p2Bp) p2Bp.innerText = `${p.sbp}/${p.dbp} mmHg`;

  // -------------------------------------------------------------------------
  // 2. SYNC PATIENT PRINT SHEET (#print-patient-sheet)
  // -------------------------------------------------------------------------
  const ppsName = document.getElementById('pps-name');
  if (ppsName) ppsName.innerText = p.name ? p.name : blankName;

  const ppsHn = document.getElementById('pps-hn');
  if (ppsHn) ppsHn.innerText = p.hn ? p.hn : blankHn;

  const ppsDate = document.getElementById('pps-date');
  if (ppsDate) ppsDate.innerText = dateStr;

  const ppsTarget = document.getElementById('pps-target');
  if (ppsTarget) ppsTarget.innerText = `${targetBP.thai.text} มิลลิเมตรปรอท`;

  const ppsBpReading = document.getElementById('pps-bp-reading');
  if (ppsBpReading) ppsBpReading.innerText = `${p.sbp} / ${p.dbp}`;

  // Patient BP Status & Traffic Light
  const ppsStatusIndicator = document.getElementById('pps-status-indicator');
  const ppsStatusTitle = document.getElementById('pps-status-title');
  const ppsStatusAdvice = document.getElementById('pps-status-advice');

  if (p.sbp >= 180 || p.dbp >= 120) {
    if (ppsStatusIndicator) ppsStatusIndicator.style.background = '#dc2626';
    if (ppsStatusTitle) {
      ppsStatusTitle.innerText = '🚨 ความดันโลหิตสูงวิกฤต (ต้องพบแพทย์ทันที)';
      ppsStatusTitle.style.color = '#991b1b';
    }
    if (ppsStatusAdvice) {
      ppsStatusAdvice.innerText = 'ความดันของท่านสูงมากจนอาจส่งผลกระทบต่อหัวใจ สมอง และไต หากมีอาการปวดศีรษะรุนแรง ตาพร่า เจ็บหน้าอก หรือเหนื่อยหอบ ต้องไปโรงพยาบาลทันที';
    }
  } else if (p.sbp >= 160 || p.dbp >= 100) {
    if (ppsStatusIndicator) ppsStatusIndicator.style.background = '#ea580c';
    if (ppsStatusTitle) {
      ppsStatusTitle.innerText = '⚠️ ความดันโลหิตสูง ระยะที่ 2 (ต้องทานยาสม่ำเสมอ)';
      ppsStatusTitle.style.color = '#c2410c';
    }
    if (ppsStatusAdvice) {
      ppsStatusAdvice.innerText = 'ความดันของท่านอยู่ในระดับสูง ต้องรับประทานยาลดความดันตามที่แพทย์สั่งอย่างต่อเนื่อง ห้ามหยุดยาเอง และเริ่มปรับอาหารลดเค็มทันที';
    }
  } else if (p.sbp >= 140 || p.dbp >= 90) {
    if (ppsStatusIndicator) ppsStatusIndicator.style.background = '#f59e0b';
    if (ppsStatusTitle) {
      ppsStatusTitle.innerText = '⚠️ ความดันโลหิตสูง ระยะที่ 1 (ควรปรับพฤติกรรมและทานยา)';
      ppsStatusTitle.style.color = '#b45309';
    }
    if (ppsStatusAdvice) {
      ppsStatusAdvice.innerText = 'ความดันโลหิตสูงกว่าเกณฑ์มาตรฐาน แนะนำรับประทานยาตามแพทย์สั่ง ร่วมกับการลดอาหารรสเค็ม ออกกำลังกาย และคุมน้ำหนัก';
    }
  } else if (p.sbp >= 130 || p.dbp >= 80) {
    if (ppsStatusIndicator) ppsStatusIndicator.style.background = '#eab308';
    if (ppsStatusTitle) {
      ppsStatusTitle.innerText = '🟡 ความดันโลหิตกลุ่มเสี่ยง (BP at risk)';
      ppsStatusTitle.style.color = '#854d0e';
    }
    if (ppsStatusAdvice) {
      ppsStatusAdvice.innerText = 'ความดันเริ่มสูงกว่าค่าปกติ แนะนำปรับเปลี่ยนพฤติกรรมชีวิตอย่างเคร่งครัด งดของเค็ม และตรวจวัดความดันที่บ้านสม่ำเสมอ';
    }
  } else {
    if (ppsStatusIndicator) ppsStatusIndicator.style.background = '#15803d';
    if (ppsStatusTitle) {
      ppsStatusTitle.innerText = '🟢 ความดันโลหิตอยู่ในเกณฑ์เป้าหมายที่ดี (Well Controlled)';
      ppsStatusTitle.style.color = '#166534';
    }
    if (ppsStatusAdvice) {
      ppsStatusAdvice.innerText = 'ท่านควบคุมความดันได้ดีมาก ขอให้รับประทานยาต่อเนื่องตามแพทย์สั่ง (ห้ามหยุดยาเอง) และรักษาวิถีชีวิตสุขภาพดีต่อไป';
    }
  }

  // Patient Meds Schedule Table
  const ppsMedsContent = document.getElementById('pps-meds-content');
  if (ppsMedsContent) {
    if (p.currentMedsList.length === 0) {
      ppsMedsContent.innerHTML = '<div style="color:#64748b; font-style:italic; padding:4px 0;">ปัจจุบันแพทย์ยังไม่ได้สั่งยาลดความดันโลหิต (รักษาด้วยการปรับเปลี่ยนพฤติกรรมการดำเนินชีวิต Thai DASH)</div>';
    } else {
      let medsHtml = `
        <table style="width:100%; border-collapse:collapse; font-size:7pt;">
          <thead>
            <tr style="background:#f1f5f9; border-bottom:1.5px solid #cbd5e1;">
              <th style="text-align:left; padding:3px 6px; width:36%;">ชื่อยาลดความดัน</th>
              <th style="text-align:left; padding:3px 6px; width:18%;">ขนาดที่ทาน</th>
              <th style="text-align:left; padding:3px 6px; width:22%;">เวลาที่ต้องทานยา</th>
              <th style="text-align:left; padding:3px 6px; width:24%;">ข้อแนะนำพิเศษ</th>
            </tr>
          </thead>
          <tbody>
      `;
      p.currentMedsList.forEach(m => {
        let timeText = '☀️ ทานหลังอาหารเช้า';
        if (m.freq === 'BID') timeText = '☀️ เช้า และ 🌙 เย็น';
        else if (m.freq === 'TID') timeText = '☀️ เช้า • เที่ยง • เย็น';
        else if (m.freq === 'HS') timeText = '🌙 ก่อนนอน';

        medsHtml += `
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:3px 6px; font-weight:700; color:#1e3a8a;">
              💊 ${m.name} ${m.isSPC ? '<span style="font-size:5.8pt; background:#e0e7ff; color:#3730a3; padding:1px 3px; border-radius:3px;">ยาผสม</span>' : ''}
            </td>
            <td style="padding:3px 6px;">${m.dose || '-'}</td>
            <td style="padding:3px 6px; font-weight:600; color:#0f766e;">${timeText}</td>
            <td style="padding:3px 6px; color:#475569;">ทานสม่ำเสมอทุกวัน ห้ามหยุดยาเอง</td>
          </tr>
        `;
      });
      medsHtml += '</tbody></table>';
      ppsMedsContent.innerHTML = medsHtml;
    }
  }
}

// --- Print Preview Modal Controls ---
function switchPrintPreviewTab(tab) {
  document.querySelectorAll('.print-tab-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btn-ptab-${tab}`);
  if (activeBtn) activeBtn.classList.add('active');

  document.body.classList.remove('print-only-p1', 'print-only-p2');
  const p1 = document.querySelector('#print-preview-content-box .prs-page-1');
  const p2 = document.querySelector('#print-preview-content-box .prs-page-2');
  const sep = document.querySelector('#print-preview-content-box .prs-page-break');

  if (tab === 'p1') {
    document.body.classList.add('print-only-p1');
    if (p1) p1.style.display = 'block';
    if (p2) p2.style.display = 'none';
    if (sep) sep.style.display = 'none';
  } else if (tab === 'p2') {
    document.body.classList.add('print-only-p2');
    if (p1) p1.style.display = 'none';
    if (p2) p2.style.display = 'block';
    if (sep) sep.style.display = 'none';
  } else {
    // 'all'
    if (p1) p1.style.display = 'block';
    if (p2) p2.style.display = 'block';
    if (sep) sep.style.display = 'block';
  }
}

function openPrintPreviewModal(mode) {
  // Sync state and recalculate
  syncInputsToState();
  recalculateAll();

  const printMode = mode || (appState.mode === 'patient' ? 'patient' : 'clinician');

  // Toggle class on body
  if (printMode === 'patient') {
    document.body.classList.add('print-mode-patient');
  } else {
    document.body.classList.remove('print-mode-patient');
  }

  // Populate data into DOM print sheets
  syncPrintSheets();

  // Set modal texts
  const titleEl = document.getElementById('print-modal-title');
  const subEl = document.getElementById('print-modal-subtitle');
  const tabsEl = document.getElementById('print-modal-page-tabs');

  if (titleEl) {
    titleEl.innerText = (printMode === 'patient')
      ? 'ใบคำแนะนำการดูแลตนเองสำหรับประชาชน / ผู้ป่วย (A4 1 หน้า)'
      : 'สรุปผลการประเมินทางคลินิกและการรักษา (Executive Clinical Summary)';
  }
  if (subEl) {
    subEl.innerText = (printMode === 'patient')
      ? 'ใบคำแนะนำดูแลตนเอง Thai DASH & ตารางบันทึกความดันโลหิต 7-2-2 Home BP Log'
      : 'แบบจำลองผลรายงานสรุปตรงตามใบพิมพ์รายงานทางการแพทย์ A4 & บันทึก PDF';
  }

  if (tabsEl) {
    tabsEl.style.display = (printMode === 'patient') ? 'none' : 'flex';
  }

  // Clone active sheet into modal preview content box
  const previewBox = document.getElementById('print-preview-content-box');
  const targetSheet = (printMode === 'patient')
    ? document.getElementById('print-patient-sheet')
    : document.getElementById('print-report-sheet');

  if (previewBox && targetSheet) {
    previewBox.innerHTML = '';
    const clone = targetSheet.cloneNode(true);
    clone.id = clone.id + '-preview-clone';
    clone.style.display = 'block';
    clone.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
    previewBox.appendChild(clone);
  }

  // Reset tab selection to all 2 pages for clinician mode
  if (printMode === 'clinician') {
    switchPrintPreviewTab('all');
  } else {
    document.body.classList.remove('print-only-p1', 'print-only-p2');
  }

  // Open modal
  const modal = document.getElementById('print-preview-modal-overlay');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closePrintPreviewModal() {
  const modal = document.getElementById('print-preview-modal-overlay');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
  document.body.classList.remove('print-only-p1', 'print-only-p2');
}

function executePrintFromModal() {
  window.print();
}

function handlePrintModalBackdrop(e) {
  if (e && e.target && e.target.id === 'print-preview-modal-overlay') {
    closePrintPreviewModal();
  }
}

// Attach functions to window
if (typeof window !== 'undefined') {
  window.editCurrentMed = editCurrentMed;
  window.cancelEditCurrentMed = cancelEditCurrentMed;
  window.syncPrintSheets = syncPrintSheets;
  window.switchPrintPreviewTab = switchPrintPreviewTab;
  window.openPrintPreviewModal = openPrintPreviewModal;
  window.openSummaryReportModal = openPrintPreviewModal;
  window.closePrintPreviewModal = closePrintPreviewModal;
  window.executePrintFromModal = executePrintFromModal;
  window.handlePrintModalBackdrop = handlePrintModalBackdrop;
  window.updateLipidCalculations = updateLipidCalculations;
}

// --- Event Listeners Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  // Populate current meds dropdown
  initCurrentMedDropdowns();

  // Listen to all inputs
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(el => {
    if (el.id !== 'sel-add-med-drug' && el.id !== 'sel-add-med-dose' && el.id !== 'sel-add-med-freq') {
      el.addEventListener('input', recalculateAll);
      el.addEventListener('change', recalculateAll);
    }
  });

  // ESC to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeEMRModal();
      closePrintPreviewModal();
    }
  });

  // Auto-sync print sheet on browser print
  window.addEventListener('beforeprint', () => {
    syncPrintSheets();
  });

  // Initial calculation
  renderCurrentMedsList();
  recalculateAll();
});
