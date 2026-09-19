/**
 * EMR / HIS Clinical Note Generator (SOAP Format)
 * Designed for Thai Hospital Information Systems (HOSxP, SSK, HomC, etc.)
 */

function generateEMRNote(patient, stagingThai, stagingESC, stagingACC, outOfOfficeEval, targetBP, riskEval, thaiRiskResult, preventResult, score2Result, medPlan) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const {
    hn = '-', name = 'ไม่ระบุชื่อ', age, sex, sbp, dbp, hr,
    weight, height, bmi, tc, hdl, ldl, tg, scr, egfr, kLevel, uacr,
    dm, smoking, cad, stroke, hf, af, ckd, isPregnant, currentMedsCount, currentMedsList = []
  } = patient;

  const genderStr = (sex === 1) ? 'ชาย' : 'หญิง';

  // --- Subjective (S) ---
  let subjective = `[S] ผู้ป่วยเพศ${genderStr} อายุ ${age || '-'} ปี (HN: ${hn})`;
  const symptoms = [];
  if (isPregnant) symptoms.push('ตั้งครรภ์');
  if (smoking === 1) symptoms.push('สูบบุหรี่ปัจจุบัน');
  if (currentMedsList && currentMedsList.length > 0) {
    const medsStr = currentMedsList.map(m => (typeof m === 'string' ? m : `${m.name} ${m.dose || ''} (${m.freq || ''})`.trim())).join(', ');
    subjective += ` | ปัจจุบันได้รับยาลดความดัน ${currentMedsList.length} รายการ (${medsStr})`;
  } else {
    subjective += ` | ยังไม่เคยได้รับยาลดความดัน (Treatment-naïve)`;
  }
  if (symptoms.length > 0) subjective += ` | ประวัติเสี่ยง: ${symptoms.join(', ')}`;

  // --- Objective (O) ---
  let objective = `[O] Vital Signs & Labs:`;
  objective += `\n- Office BP: ${sbp || '-'}/${dbp || '-'} mmHg | Pulse: ${hr ? hr + ' bpm' : 'N/A'}`;
  if (patient.homeSbp && patient.homeDbp) {
    objective += ` | Home BP (HBPM): ${patient.homeSbp}/${patient.homeDbp} mmHg`;
  }
  if (bmi) {
    objective += `\n- BMI: ${bmi} kg/m² (ส่วนสูง: ${height || '-'} cm, น้ำหนัก: ${weight || '-'} kg)`;
  }
  const labItems = [];
  if (scr) labItems.push(`Cr: ${scr} mg/dL`);
  if (egfr) labItems.push(`eGFR (CKD-EPI 2021): ${egfr} mL/min/1.73m²`);
  if (kLevel) labItems.push(`K+: ${kLevel} mEq/L`);
  if (uacr) labItems.push(`UACR: ${uacr} mg/g`);
  if (tc) labItems.push(`TC: ${tc} mg/dL`);
  if (tg) labItems.push(`TG: ${tg} mg/dL`);
  if (hdl) labItems.push(`HDL: ${hdl} mg/dL`);
  if (ldl) labItems.push(`LDL (Calc): ${typeof ldl === 'number' ? ldl.toFixed(1) : ldl} mg/dL`);
  if (labItems.length > 0) {
    objective += `\n- Labs: ${labItems.join(' | ')}`;
  }

  // --- Assessment (A) ---
  let assessment = `[A] Clinical Assessment & Staging:`;
  assessment += `\n1. HT Staging:`;
  assessment += `\n   - Thai HT 2567: ${stagingThai.label}`;
  assessment += `\n   - ESC 2024: ${stagingESC.label}`;
  assessment += `\n   - AHA/ACC 2025: ${stagingACC.label}`;
  if (outOfOfficeEval && outOfOfficeEval.type !== 'INSUFFICIENT_DATA') {
    assessment += `\n2. Out-of-Office BP: ${outOfOfficeEval.title}`;
  }
  assessment += `\n3. Cardiovascular Risk: ${riskEval.label} (${riskEval.reason})`;
  if (thaiRiskResult && typeof thaiRiskResult.pct === 'number') {
    assessment += `\n   - Thai CV Risk (EGAT 10-yr): ${thaiRiskResult.pct.toFixed(2)}% (${thaiRiskResult.categoryLabel})`;
  }
  if (preventResult && typeof preventResult.cvd === 'number') {
    assessment += `\n   - AHA PREVENT 10-yr: Total CVD ${preventResult.cvd.toFixed(2)}%, ASCVD ${preventResult.ascvd.toFixed(2)}%, HF ${preventResult.hf.toFixed(2)}%`;
  }
  if (score2Result && typeof score2Result.pct === 'number') {
    assessment += `\n   - ESC SCORE2 10-yr: ${score2Result.pct.toFixed(2)}% (${score2Result.category})`;
  }
  if (medPlan.compIndications && medPlan.compIndications.length > 0) {
    assessment += `\n4. Compelling Indications: ${medPlan.compIndications.join(', ')}`;
  }
  if (medPlan.resistantHtDetected) {
    assessment += `\n🚨 Alert: Suspected Resistant Hypertension (BP uncontrolled on ≥3 drugs including diuretic) -> แนะนำคัดกรอง Primary Aldosteronism (ARR)`;
  }

  // --- Plan (P) ---
  const guideName = (medPlan.activeGuideline === 'aha') ? 'AHA/ACC 2025' : ((medPlan.activeGuideline === 'esc') ? 'ESC 2024' : 'Thai HT 2567');
  let plan = `[P] Management Plan (${guideName}):`;
  plan += `\n1. BP Target: ${medPlan.targetBPText || targetBP.thai.text} (${medPlan.targetRationale || targetBP.thai.rationale})`;
  plan += `\n2. Pharmacotherapy: ${medPlan.strategyTitle}`;
  plan += `\n   - กลยุทธ์: ${medPlan.strategy}`;
  if (medPlan.drugChoices && medPlan.drugChoices.length > 0) {
    plan += `\n   - รายการยาที่แนะนำ:`;
    medPlan.drugChoices.forEach((d, idx) => {
      plan += `\n     ${idx + 1}. ${d.name} (${d.dose || d.startDose}) - ${d.notes || ''}`;
    });
  }
  if (medPlan.spcOptions && medPlan.spcOptions.length > 0) {
    const spcExample = medPlan.spcOptions[0].items ? medPlan.spcOptions[0].items[0] : null;
    if (spcExample) {
      plan += `\n   - ตัวอย่าง Single-Pill Combination (SPC): ${spcExample.brand} (${spcExample.generic}) ${spcExample.strengths[0]}`;
    }
  }
  plan += `\n3. Non-Pharmacological / TLC:`;
  plan += `\n   - จำกัดโซเดียม < 1,500–2,000 mg/วัน (ลดน้ำปลา ซีอิ๊ว ผงชูรส ซดน้ำแกงน้อยลง)`;
  plan += `\n   - อาหาร DASH Diet (เน้นผัก ผลไม้ ธัญพืชไม่ขัดสี ถั่ว ลดไขมันอิ่มตัว)`;
  plan += `\n   - ออกกำลังกายแอโรบิกปานกลาง 150 นาที/สัปดาห์ ควบคุมน้ำหนัก BMI < 23 kg/m²`;
  plan += `\n   - หลีกเลี่ยงเครื่องดื่มแอลกอฮอล์และงดสูบบุหรี่เด็ดขาด`;
  plan += `\n4. Monitoring & Follow-up:`;
  plan += `\n   - ${medPlan.monitoring}`;
  plan += `\n   - แนะนำผู้ป่วยจดบันทึกความดันโลหิตที่บ้าน 7 วันก่อนนัด (Home BP log)`;

  const references = `[References]\n` +
    `• สมาคมความดันโลหิตสูงแห่งประเทศไทย. (2567). แนวทางการรักษาโรคความดันโลหิตสูงในเวชปฏิบัติทั่วไป พ.ศ. 2567. กรุงเทพฯ: สมาคมความดันโลหิตสูงแห่งประเทศไทย.\n` +
    `• McEvoy, J. W., et al. (2024). 2024 ESC Guidelines for the management of elevated blood pressure and hypertension. European Heart Journal, 45(38), 3912–4016.\n` +
    `• Whelton, P. K., et al. (2025). 2025 AHA/ACC/AANP/AAPA/ABC/ACCP/ACPM/AGS/AMA/ASPC/NMA/PCNA/SGIM Guideline for the prevention, detection, evaluation and management of high blood pressure in adults. Hypertension, 82(10), e212–e316.`;

  const fullNote = `--- HYPERTENSION CLINICAL DECISION NOTE ---\nบันทึกเมื่อ: ${dateStr}\n\n${subjective}\n\n${objective}\n\n${assessment}\n\n${plan}\n\n${references}\n------------------------------------------`;

  return {
    subjective,
    objective,
    assessment,
    plan,
    fullNote
  };
}

function copyEMRNoteToClipboard(noteText, successCallback) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(noteText).then(() => {
      if (typeof successCallback === 'function') successCallback();
    }).catch(err => {
      fallbackCopyText(noteText, successCallback);
    });
  } else {
    fallbackCopyText(noteText, successCallback);
  }
}

function fallbackCopyText(text, successCallback) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    if (typeof successCallback === 'function') successCallback();
  } catch (err) {
    console.error('Fallback copy failed', err);
  }
  document.body.removeChild(textArea);
}

// Export functions
if (typeof window !== 'undefined') {
  window.generateEMRNote = generateEMRNote;
  window.copyEMRNoteToClipboard = copyEMRNoteToClipboard;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateEMRNote, copyEMRNoteToClipboard };
}
