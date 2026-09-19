/**
 * Clinical Decision Guidelines for Hypertension
 * Integrating:
 * 1. สมาคมความดันโลหิตสูงแห่งประเทศไทย พ.ศ. 2567 (Thai HT 2567)
 * 2. European Society of Cardiology Guidelines (ESC 2024)
 * 3. American Heart Association / American College of Cardiology Guidelines (AHA/ACC 2025)
 */

// --- 1. Blood Pressure Staging & Classification ---

function classifyThai2024(sbp, dbp) {
  if (!sbp || !dbp) return { stage: 'Unknown', label: 'ไม่ระบุค่าความดัน', badge: 'badge-low', code: 'UNKNOWN' };

  if (sbp >= 180 || dbp >= 120) {
    return {
      stage: 'Hypertensive Crisis / Emergency',
      label: 'ภาวะวิกฤตความดันโลหิตสูง (Hypertensive Crisis / Emergency)',
      desc: 'ความดันโลหิตสูงวิกฤต (SBP ≥ 180 หรือ DBP ≥ 120) ต้องประเมินภาวะอวัยวะเป้าหมายถูกทำลายเฉียบพลัน (Acute HMOD)',
      badge: 'badge-vhigh',
      code: 'CRISIS',
      isCrisis: true
    };
  }
  if (sbp >= 140 && dbp < 90) {
    return {
      stage: 'Isolated Systolic Hypertension (ISH)',
      label: 'ความดันซิสโตลิกสูงเดี่ยว (Isolated Systolic HT)',
      desc: 'SBP ≥ 140 mmHg และ DBP < 90 mmHg พบบ่อยในผู้สูงอายุจากหลอดเลือดแดงแข็งตัว',
      badge: sbp >= 160 ? 'badge-high' : 'badge-med',
      code: 'ISH'
    };
  }
  if (sbp >= 160 || dbp >= 100) {
    return {
      stage: 'Hypertension Stage 2',
      label: 'โรคความดันโลหิตสูง ระยะที่ 2 (Stage 2 HT)',
      desc: 'SBP ≥ 160 mmHg หรือ DBP ≥ 100 mmHg แนะนำเริ่มยาลดความดัน 2 ชนิดพร้อมกัน (Single-Pill Combination)',
      badge: 'badge-high',
      code: 'STAGE2'
    };
  }
  if (sbp >= 140 || dbp >= 90) {
    return {
      stage: 'Hypertension Stage 1',
      label: 'โรคความดันโลหิตสูง ระยะที่ 1 (Stage 1 HT)',
      desc: 'SBP 140–159 mmHg หรือ DBP 90–99 mmHg เริ่มปรับพฤติกรรมชีวิตและพิจารณาเริ่มยาตามระดับความเสี่ยง',
      badge: 'badge-med',
      code: 'STAGE1'
    };
  }
  if ((sbp >= 130 && sbp <= 139) || (dbp >= 80 && dbp <= 89)) {
    return {
      stage: 'BP at risk',
      label: 'ความดันโลหิตกลุ่มเสี่ยง (BP at risk)',
      desc: 'SBP 130–139 mmHg หรือ DBP 80–89 mmHg ปรับพฤติกรรมสุขภาพอย่างเข้มงวดและติดตาม HBPM สม่ำเสมอ',
      badge: 'badge-med',
      code: 'BP_AT_RISK'
    };
  }
  if ((sbp >= 120 && sbp <= 129) && (dbp >= 80 && dbp <= 84)) {
    return {
      stage: 'Pre-hypertension',
      label: 'ความดันโลหิตสูงระดับก่อนเป็นโรค (Prehypertension)',
      desc: 'SBP 120–129 mmHg และ/หรือ DBP 80–84 mmHg แนะนำปรับเปลี่ยนพฤติกรรมสุขภาพ',
      badge: 'badge-low',
      code: 'PRE_HT'
    };
  }
  return {
    stage: 'Normal BP',
    label: 'ความดันโลหิตปกติ (Normal BP)',
    desc: 'SBP < 120 mmHg และ DBP < 80 mmHg คงการปฏิบัติตัวที่ดีและวัดความดันซ้ำทุกปี',
    badge: 'badge-low',
    code: 'NORMAL'
  };
}

function classifyESC2024(sbp, dbp) {
  if (!sbp || !dbp) return { stage: 'Unknown', label: 'ไม่ระบุค่า', badge: 'badge-low', code: 'UNKNOWN' };

  if (sbp >= 180 || dbp >= 120) {
    return {
      stage: 'Severe Hypertension / Crisis',
      label: 'Severe Hypertension (≥ 180/120 mmHg)',
      desc: 'Acute HMOD evaluation required immediately',
      badge: 'badge-vhigh',
      code: 'CRISIS'
    };
  }
  if (sbp >= 140 || dbp >= 90) {
    return {
      stage: 'Hypertension',
      label: 'Hypertension (≥ 140/90 mmHg)',
      desc: 'Lifestyle modification + immediate dual combination therapy recommended',
      badge: 'badge-high',
      code: 'HYPERTENSION'
    };
  }
  if ((sbp >= 120 && sbp <= 139) || (dbp >= 70 && dbp <= 89)) {
    return {
      stage: 'Elevated Blood Pressure',
      label: 'Elevated BP (120–139 / 70–89 mmHg)',
      desc: 'Lifestyle for 3 months; consider pharmacotherapy if high CVD risk and SBP ≥ 130',
      badge: 'badge-med',
      code: 'ELEVATED'
    };
  }
  return {
    stage: 'Non-elevated Blood Pressure',
    label: 'Non-elevated BP (< 120/70 mmHg)',
    desc: 'Optimal healthy blood pressure range',
    badge: 'badge-low',
    code: 'NON_ELEVATED'
  };
}

// 2025 AHA/ACC Multisociety Guidelines
function classifyAHAACC2025(sbp, dbp, preventRiskPct, hasComorbidities) {
  if (!sbp || !dbp) return { stage: 'Unknown', label: 'ไม่ระบุค่า', badge: 'badge-low', code: 'UNKNOWN', initStrategy: '-' };

  if (sbp >= 180 || dbp >= 120) {
    return {
      stage: 'Hypertensive Crisis',
      label: 'Hypertensive Crisis (> 180 and/or > 120 mmHg)',
      desc: 'Emergency or urgency evaluation needed immediately',
      badge: 'badge-vhigh',
      code: 'CRISIS',
      initStrategy: '⚡ Immediate evaluation & treatment'
    };
  }
  if (sbp >= 140 || dbp >= 90) {
    return {
      stage: 'Stage 2 Hypertension',
      label: 'Stage 2 Hypertension (≥ 140 or ≥ 90 mmHg)',
      desc: 'Lifestyle + prompt initiation of 2 antihypertensive agents of different classes (preferably SPC)',
      badge: 'badge-high',
      code: 'STAGE2',
      initStrategy: '⚡ Dual-class combination (SPC preferred)'
    };
  }
  if ((sbp >= 130 && sbp <= 139) || (dbp >= 80 && dbp <= 89)) {
    const isHighRisk = hasComorbidities || (typeof preventRiskPct === 'number' && preventRiskPct >= 7.5);
    const initStrategy = isHighRisk
      ? '💊 เริ่มยาทันที (เนื่องจาก PREVENT 10-yr CVD ≥ 7.5% หรือมีโรคร่วม)'
      : '🌱 ปรับพฤติกรรม 3–6 เดือน (หากยังคง ≥ 130/80 จึงเริ่มยา)';

    return {
      stage: 'Stage 1 Hypertension',
      label: 'Stage 1 Hypertension (130–139 or 80–89 mmHg)',
      desc: isHighRisk
        ? 'เริ่มยาลดความดันทันทีเนื่องจากมีความเสี่ยงโรคหัวใจ 10 ปี (PREVENT) ≥ 7.5% หรือมีโรคร่วม (CVD/DM/CKD)'
        : 'เริ่มด้วยการปรับพฤติกรรมสุขภาพ 3–6 เดือน หากความดันยังคง ≥ 130/80 mmHg จึงเริ่มยาลดความดัน',
      badge: 'badge-med',
      code: 'STAGE1',
      initStrategy: initStrategy,
      isHighRisk: isHighRisk
    };
  }
  if ((sbp >= 120 && sbp <= 129) && dbp < 80) {
    return {
      stage: 'Elevated Blood Pressure',
      label: 'Elevated BP (120–129 and < 80 mmHg)',
      desc: 'Non-pharmacological therapy recommended, reassess in 3–6 months',
      badge: 'badge-low',
      code: 'ELEVATED',
      initStrategy: '🌱 ปรับเปลี่ยนพฤติกรรมสุขภาพ (Non-pharmacological)'
    };
  }
  return {
    stage: 'Normal Blood Pressure',
    label: 'Normal BP (< 120 and < 80 mmHg)',
    desc: 'Promote optimal lifestyle habits, reassess annually',
    badge: 'badge-low',
    code: 'NORMAL',
    initStrategy: '🟢 คงพฤติกรรมสุขภาพที่ดี ตรวจซ้ำทุกปี'
  };
}

// --- 2. Out-of-Office BP Diagnostics (HBPM & ABPM) ---

function evaluateOutofOfficeBP(officeSbp, officeDbp, homeSbp, homeDbp, abpmSbp, abpmDbp) {
  const isOfficeElevated = (officeSbp >= 140 || officeDbp >= 90);
  let isOutOfOfficeElevated = null;
  let method = '';

  if (homeSbp && homeDbp) {
    // HBPM threshold: ≥ 135/85 mmHg
    isOutOfOfficeElevated = (homeSbp >= 135 || homeDbp >= 85);
    method = `HBPM (เฉลี่ย ${homeSbp}/${homeDbp} mmHg)`;
  } else if (abpmSbp && abpmDbp) {
    // 24h ABPM threshold: ≥ 130/80 mmHg
    isOutOfOfficeElevated = (abpmSbp >= 130 || abpmDbp >= 80);
    method = `ABPM 24h (เฉลี่ย ${abpmSbp}/${abpmDbp} mmHg)`;
  }

  if (isOutOfOfficeElevated === null) {
    return {
      type: 'INSUFFICIENT_DATA',
      title: 'ยังไม่มีข้อมูลการวัดความดันนอกสถานพยาบาล',
      desc: 'แนะนำส่งเสริมให้ผู้ป่วยวัดความดันโลหิตที่บ้าน (HBPM) ติดต่อกัน 7 วัน (เช้า-เย็น) เพื่อยืนยันการวินิจฉัยและตรวจหาภาวะ White-coat หรือ Masked HT',
      badge: 'badge-med'
    };
  }

  if (isOfficeElevated && !isOutOfOfficeElevated) {
    return {
      type: 'WHITE_COAT_HT',
      title: '⚠️ สงสัยภาวะความดันโลหิตสูงเมื่อพบแพทย์ (White-Coat Hypertension)',
      desc: `ความดันที่คลินิก/รพ. สูง (≥ 140/90) แต่ความดันจากการวัดนอกสถานพยาบาล ${method} อยู่ในเกณฑ์ปกติ (< 135/85) แนะนำปรับเปลี่ยนพฤติกรรม ตรวจติดตาม HBPM สม่ำเสมอ และระวังการให้ยาลดความดันจนต่ำเกินไป`,
      badge: 'badge-med',
      alertClass: 'alert-amber'
    };
  }

  if (!isOfficeElevated && isOutOfOfficeElevated) {
    return {
      type: 'MASKED_HT',
      title: '🚨 ตรวจพบภาวะความดันโลหิตสูงแอบแฝง (Masked Hypertension)',
      desc: `ความดันที่คลินิก/รพ. ปกติ แต่ความดันนอกสถานพยาบาล ${method} สูงกว่าเกณฑ์ (≥ 135/85) มีความเสี่ยงต่อโรคหัวใจและหลอดเลือดเทียบเท่าผู้ป่วยความดันโลหิตสูงทั่วไป แนะนำให้การรักษาด้วยยาและปรับพฤติกรรมเช่นเดียวกับ Hypertension`,
      badge: 'badge-high',
      alertClass: 'alert-red'
    };
  }

  if (isOfficeElevated && isOutOfOfficeElevated) {
    return {
      type: 'SUSTAINED_HT',
      title: '🔴 โรคความดันโลหิตสูงต่อเนื่องแท้จริง (Sustained Hypertension)',
      desc: `ความดันโลหิตสูงทั้งในสถานพยาบาลและนอกสถานพยาบาล ${method} ยืนยันการวินิจฉัยโรคความดันโลหิตสูงอย่างสมบูรณ์ ควรเริ่มแผนการรักษาด้วยยาและการปรับพฤติกรรมทันที`,
      badge: 'badge-high',
      alertClass: 'alert-red'
    };
  }

  return {
    type: 'TRUE_NORMOTENSION',
    title: '🟢 ความดันโลหิตปกติแท้จริง (True Normotension)',
    desc: `ระดับความดันโลหิตอยู่ในเกณฑ์ปกติทั้งในสถานพยาบาลและ ${method}`,
    badge: 'badge-low',
    alertClass: 'alert-green'
  };
}

// --- 3. Blood Pressure Treatment Targets ---

function getTargetBP(patient) {
  const { age, dm, ckd, cad, stroke, hf, frailty } = patient;

  // Thai HT 2567 Target
  let thaiTarget = {
    sbp: '120–130',
    dbp: '70–79',
    text: '120–130 / 70–79 mmHg',
    rationale: 'เป้าหมายมาตรฐานสำหรับอายุ 18–65 ปี เพื่อการปกป้องหัวใจ สมอง และไตสูงสุด'
  };

  if (frailty) {
    thaiTarget = {
      sbp: '< 140 (ตามความทนทาน)',
      dbp: '70–79',
      text: '< 140 / 70–79 mmHg (Individualized)',
      rationale: 'ผู้สูงอายุที่มีภาวะเปราะบาง: ระวังความดันตกในท่ายืน (Orthostatic Hypotension) ไม่แนะนำลด SBP < 120 หรือ DBP < 70 mmHg'
    };
  } else if (age > 65) {
    thaiTarget = {
      sbp: '130–139',
      dbp: '70–79',
      text: '130–139 / 70–79 mmHg',
      rationale: 'ผู้สูงอายุ > 65 ปี: แนะนำ SBP 130–139 mmHg และ DBP 70–79 mmHg ค่อยๆ ปรับลดเพื่อความปลอดภัย'
    };
  } else if (dm || ckd || cad || stroke) {
    thaiTarget = {
      sbp: '120–130',
      dbp: '70–79',
      text: '120–130 / 70–79 mmHg',
      rationale: 'มีโรคร่วมสำคัญ (DM, CKD with proteinuria, CAD, Stroke): แนะนำเป้าหมายเข้มงวด 120–130 / 70–79 mmHg เพื่อชะลอไตเสื่อมและลด recurrent CV event'
    };
  }

  // ESC 2024 Target
  let escTarget = {
    sbp: '120–129',
    dbp: '70–79',
    text: '120–129 / 70–79 mmHg',
    rationale: 'ESC 2024 แนะนำเป้าหมาย SBP 120–129 mmHg หากผู้ป่วยทนได้ดี (if tolerated) สำหรับผู้ใหญ่ส่วนใหญ่'
  };
  if (age >= 85 || frailty) {
    escTarget = {
      sbp: 'As tolerated (< 140)',
      dbp: '70–79',
      text: '< 140 / 70–79 mmHg (Individualized)',
      rationale: 'Very elderly (≥ 85y) or severe frailty: individualized target based on tolerability and symptom monitoring'
    };
  }

  // AHA/ACC 2025 Target
  const ahaTarget = {
    sbp: '< 130',
    dbp: '< 80',
    text: '< 130 / 80 mmHg',
    rationale: 'AHA/ACC 2025 แนะนำเป้าหมายสากล < 130/80 mmHg ในผู้ป่วยทุกกลุ่ม ทั้งผู้ป่วยทั่วไป ผู้สูงอายุ เบาหวาน และโรคไตเรื้อรัง'
  };

  return {
    thai: thaiTarget,
    esc: escTarget,
    aha: ahaTarget,
    acc: ahaTarget // backward compatibility
  };
}

// --- 4. Cardiovascular Risk Stratification Matrix ---

function evaluateOverallRisk(patient, thaiRiskPct) {
  const { cad, stroke, hf, pad, ckd, egfr, uacr, dm, smoking, sbp, dbp, tc } = patient;

  if (cad || stroke || hf || pad) {
    return {
      category: 'Very High Risk',
      label: 'ความเสี่ยงสูงมาก (Very High CV Risk)',
      badge: 'badge-vhigh',
      reason: 'มีประวัติโรคหัวใจและหลอดเลือดทางคลินิก (Documented Clinical ASCVD: CAD / Stroke / HF / PAD)',
      code: 'VERY_HIGH'
    };
  }
  if (egfr && egfr < 30) {
    return {
      category: 'Very High Risk',
      label: 'ความเสี่ยงสูงมาก (Very High CV Risk)',
      badge: 'badge-vhigh',
      reason: 'โรคไตเรื้อรังระยะรุนแรง (Severe CKD Stage 4–5, eGFR < 30 mL/min/1.73m²)',
      code: 'VERY_HIGH'
    };
  }
  if (uacr && uacr > 300) {
    return {
      category: 'Very High Risk',
      label: 'ความเสี่ยงสูงมาก (Very High CV Risk)',
      badge: 'badge-vhigh',
      reason: 'มีภาวะไข่ขาวรั่วในปัสสาวะปริมาณมาก (Macroalbuminuria, UACR > 300 mg/g)',
      code: 'VERY_HIGH'
    };
  }
  if (dm && (egfr && egfr < 60 || uacr >= 30)) {
    return {
      category: 'Very High Risk',
      label: 'ความเสี่ยงสูงมาก (Very High CV Risk)',
      badge: 'badge-vhigh',
      reason: 'เบาหวานร่วมกับภาวะไตเสื่อมหรือไข่ขาวรั่ว (DM with Kidney Target Organ Damage)',
      code: 'VERY_HIGH'
    };
  }

  if (dm) {
    return {
      category: 'High Risk',
      label: 'ความเสี่ยงสูง (High CV Risk)',
      badge: 'badge-high',
      reason: 'ผู้ป่วยโรคเบาหวาน (Diabetes Mellitus)',
      code: 'HIGH'
    };
  }
  if (egfr && egfr < 60) {
    return {
      category: 'High Risk',
      label: 'ความเสี่ยงสูง (High CV Risk)',
      badge: 'badge-high',
      reason: 'โรคไตเรื้อรังระยะปานกลาง (CKD Stage 3, eGFR 30–59 mL/min/1.73m²)',
      code: 'HIGH'
    };
  }
  if (sbp >= 180 || dbp >= 110) {
    return {
      category: 'High Risk',
      label: 'ความเสี่ยงสูง (High CV Risk)',
      badge: 'badge-high',
      reason: 'มีความดันโลหิตสูงระดับรุนแรงเดี่ยว (Severe BP elevation SBP ≥ 180 หรือ DBP ≥ 110)',
      code: 'HIGH'
    };
  }
  if (tc && tc >= 310) {
    return {
      category: 'High Risk',
      label: 'ความเสี่ยงสูง (High CV Risk)',
      badge: 'badge-high',
      reason: 'มีระดับคอเลสเตอรอลสูงรุนแรง (Marked hypercholesterolemia TC ≥ 310 mg/dL)',
      code: 'HIGH'
    };
  }

  if (typeof thaiRiskPct === 'number') {
    if (thaiRiskPct >= 30) {
      return {
        category: 'Very High Risk',
        label: `ความเสี่ยงสูงมาก (${thaiRiskPct}% Thai CV Risk)`,
        badge: 'badge-vhigh',
        reason: `คะแนนความเสี่ยงโรคหลอดเลือดหัวใจ 10 ปี (Thai CV Risk Score) = ${thaiRiskPct}%`,
        code: 'VERY_HIGH'
      };
    }
    if (thaiRiskPct >= 20) {
      return {
        category: 'High Risk',
        label: `ความเสี่ยงสูง (${thaiRiskPct}% Thai CV Risk)`,
        badge: 'badge-high',
        reason: `คะแนนความเสี่ยงโรคหลอดเลือดหัวใจ 10 ปี (Thai CV Risk Score) = ${thaiRiskPct}%`,
        code: 'HIGH'
      };
    }
    if (thaiRiskPct >= 10) {
      return {
        category: 'Moderate Risk',
        label: `ความเสี่ยงปานกลาง (${thaiRiskPct}% Thai CV Risk)`,
        badge: 'badge-med',
        reason: `คะแนนความเสี่ยงโรคหลอดเลือดหัวใจ 10 ปี (Thai CV Risk Score) = ${thaiRiskPct}%`,
        code: 'MODERATE'
      };
    }
    return {
      category: 'Low Risk',
      label: `ความเสี่ยงต่ำ (${thaiRiskPct}% Thai CV Risk)`,
      badge: 'badge-low',
      reason: `คะแนนความเสี่ยงโรคหลอดเลือดหัวใจ 10 ปี (Thai CV Risk Score) = ${thaiRiskPct}%`,
      code: 'LOW'
    };
  }

  return {
    category: 'Moderate Risk',
    label: 'ความเสี่ยงปานกลาง (Moderate Risk)',
    badge: 'badge-med',
    reason: 'ประเมินจากปัจจัยเสี่ยงพื้นฐานทั่วไป',
    code: 'MODERATE'
  };
}

// Export functions to window
window.classifyThai2024 = classifyThai2024;
window.classifyESC2024 = classifyESC2024;
window.classifyAHAACC2025 = classifyAHAACC2025;
window.classifyACCAHA2017 = classifyAHAACC2025; // alias for backward compatibility
window.evaluateOutofOfficeBP = evaluateOutofOfficeBP;
window.getTargetBP = getTargetBP;
window.evaluateOverallRisk = evaluateOverallRisk;
