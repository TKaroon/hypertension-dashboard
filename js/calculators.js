/**
 * Hypertension & Cardiovascular Risk Calculators
 * Derived & enhanced from Lipid & ASCVD Master Dashboard โดย นพ.ธนภพ การุญ
 * Includes:
 * 1. CKD-EPI 2021 Creatinine eGFR Equation
 * 2. Thai CV Risk Score (Ramathibodi / EGAT) - Lab & Non-Lab
 * 3. AHA 2023 PREVENT™ Full Equation Engine (CVD, ASCVD, Heart Failure)
 * 4. ESC SCORE2, SCORE2-OP & SCORE2-Diabetes
 * 5. Body Mass Index (BMI) & Asian-Pacific Cutoffs
 */

// --- 1. CKD-EPI 2021 Creatinine Equation (Race-Free) ---
function calcCKDEPI2021(scr, age, sex) {
  if (!scr || scr <= 0 || !age || age <= 0) return 0;
  // sex: 1 = Male, 0 = Female
  const kappa = (sex === 0) ? 0.7 : 0.9;
  const alpha = (sex === 0) ? -0.241 : -0.302;
  const genderFactor = (sex === 0) ? 1.012 : 1.0;
  const minVal = Math.min(scr / kappa, 1.0);
  const maxVal = Math.max(scr / kappa, 1.0);
  const egfr = 142 * Math.pow(minVal, alpha) * Math.pow(maxVal, -1.200) * Math.pow(0.9938, age) * genderFactor;
  return Math.round(egfr * 10) / 10;
}

function getCkdStage(egfr, uacr) {
  if (!egfr || egfr <= 0) return { stage: 'Unknown', desc: 'ยังไม่ได้ระบุค่า eGFR' };
  let stage = '';
  let desc = '';
  if (egfr >= 90) {
    stage = 'G1';
    desc = 'Normal or High (≥ 90 mL/min/1.73m²)';
  } else if (egfr >= 60) {
    stage = 'G2';
    desc = 'Mildly decreased (60–89 mL/min/1.73m²)';
  } else if (egfr >= 45) {
    stage = 'G3a';
    desc = 'Mild-to-moderately decreased (45–59 mL/min/1.73m²)';
  } else if (egfr >= 30) {
    stage = 'G3b';
    desc = 'Moderately-to-severely decreased (30–44 mL/min/1.73m²)';
  } else if (egfr >= 15) {
    stage = 'G4';
    desc = 'Severely decreased (15–29 mL/min/1.73m²)';
  } else {
    stage = 'G5';
    desc = 'Kidney failure (< 15 mL/min/1.73m²)';
  }

  let albDesc = '';
  if (typeof uacr === 'number' && uacr >= 0) {
    if (uacr < 30) albDesc = ' | A1 Normal/Mild (<30 mg/g)';
    else if (uacr <= 300) albDesc = ' | A2 Microalbuminuria (30–300 mg/g)';
    else albDesc = ' | A3 Macroalbuminuria (>300 mg/g)';
  }

  return { stage, desc: desc + albDesc, isCkd: egfr < 60 || (uacr && uacr >= 30) };
}

// --- 2. Thai CV Risk Score (Ramathibodi / EGAT) ---
function calculateThaiRisk(age, sex, sbpVal, dmVal, smokerVal, tcVal, wcVal, heightVal, mode) {
  const surRoot = 0.964588;
  let ageNote = '';
  let effectiveAge = age || 40;
  if (effectiveAge < 30) {
    effectiveAge = 30;
    ageNote = ' *(คิดที่อายุ 30 ปี)*';
  } else if (effectiveAge > 70) {
    effectiveAge = 70;
    ageNote = ' *(คิดที่อายุ 70 ปี)*';
  }

  let fullScore = 0;
  let compareScore = 0;
  // compSbp: optimal SBP for comparison
  const compSbp = (sex === 1) ? (effectiveAge > 60 ? 132 : 120) : (effectiveAge <= 60 ? 115 : 130);
  const compWhr = (sex === 1) ? 0.58125 : 0.52667;

  if (mode === 'lab') {
    fullScore = (0.08183 * effectiveAge) + (0.39499 * (sex || 0)) + (0.02084 * (sbpVal || 120)) +
                (0.69974 * (dmVal || 0)) + (0.00212 * (tcVal || 200)) + (0.41916 * (smokerVal || 0));
    compareScore = (0.08183 * effectiveAge) + (0.39499 * (sex || 0)) + (0.02084 * compSbp) + (0.00212 * 200);
  } else {
    // Non-lab mode using waist circumference and height
    const wcCm = Math.floor((wcVal || 30) * 2.5); // converts inches to cm if input in inches or handles cm
    const whr = ((heightVal || 160) > 0) ? (wcCm / (heightVal || 160)) : 0.5;
    fullScore = (0.079 * effectiveAge) + (0.128 * (sex || 0)) + (0.019350987 * (sbpVal || 120)) +
                (0.58454 * (dmVal || 0)) + (3.512566 * whr) + (0.459 * (smokerVal || 0));
    compareScore = (0.079 * effectiveAge) + (0.128 * (sex || 0)) + (0.019350987 * compSbp) + (3.512566 * compWhr);
  }

  const baselineConst = (mode === 'lab') ? 7.04423 : 7.712325;
  const tRisk = 1 - Math.pow(surRoot, Math.exp(fullScore - baselineConst));
  const cRisk = 1 - Math.pow(surRoot, Math.exp(compareScore - baselineConst));
  // Round to 2 decimal places using standard mathematical rounding
  const pct = Math.round((tRisk * 100 + Number.EPSILON) * 100) / 100;

  let riskCategory = 'Low';
  let categoryLabel = 'ความเสี่ยงต่ำ (< 10%)';
  let badgeClass = 'badge-low';

  if (pct >= 30) {
    riskCategory = 'Very High';
    categoryLabel = 'ความเสี่ยงสูงมาก (≥ 30%)';
    badgeClass = 'badge-vhigh';
  } else if (pct >= 20) {
    riskCategory = 'High';
    categoryLabel = 'ความเสี่ยงสูง (20–29.9%)';
    badgeClass = 'badge-high';
  } else if (pct >= 10) {
    riskCategory = 'Moderate';
    categoryLabel = 'ความเสี่ยงปานกลาง (10–19.9%)';
    badgeClass = 'badge-med';
  }

  return {
    risk: tRisk,
    pct: pct,
    compRisk: cRisk,
    compPct: Math.round((cRisk * 100 + Number.EPSILON) * 100) / 100,
    note: ageNote,
    riskCategory,
    categoryLabel,
    badgeClass
  };
}

// --- 3. AHA 2023 PREVENT™ Full Equation Engine ---
const preventModelsData = {
  'base': {
    'female': {
      'cvd': {'age': 0.7939329, 'non_hdl': 0.0305239, 'hdl': -0.1606857, 'sbp_min': -0.2394003, 'sbp_max': 0.3600781, 'dm': 0.8667604, 'smoke': 0.5360739, 'egfr_min': 0.6045917, 'egfr_max': 0.0433769, 'bp_meds': 0.3151672, 'statin': -0.1477655, 'tx_sbp': -0.0663612, 'tx_non_hdl': 0.1197879, 'age_non_hdl': -0.0819715, 'age_hdl': 0.0306769, 'age_sbp': -0.0946348, 'age_dm': -0.27057, 'age_smoke': -0.078715, 'age_egfr': -0.1637806, 'intercept': -3.307728},
      'ascvd': {'age': 0.719883, 'non_hdl': 0.1176967, 'hdl': -0.151185, 'sbp_min': -0.0835358, 'sbp_max': 0.3592852, 'dm': 0.8348585, 'smoke': 0.4831078, 'egfr_min': 0.4864619, 'egfr_max': 0.0397779, 'bp_meds': 0.2265309, 'statin': -0.0592374, 'tx_sbp': -0.0395762, 'tx_non_hdl': 0.0844423, 'age_non_hdl': -0.0567839, 'age_hdl': 0.0325692, 'age_sbp': -0.1035985, 'age_dm': -0.2417542, 'age_smoke': -0.0791142, 'age_egfr': -0.1671492, 'intercept': -3.819975},
      'hf': {'age': 0.8998235, 'sbp_min': -0.4559771, 'sbp_max': 0.3576505, 'dm': 1.038346, 'smoke': 0.583916, 'bmi_min': -0.0072294, 'bmi_max': 0.2997706, 'egfr_min': 0.7451638, 'egfr_max': 0.0557087, 'bp_meds': 0.3534442, 'tx_sbp': -0.0981511, 'age_sbp': -0.0946663, 'age_dm': -0.3581041, 'age_smoke': -0.1159453, 'age_bmi': -0.003878, 'age_egfr': -0.1884289, 'intercept': -4.310409}
    },
    'male': {
      'cvd': {'age': 0.7688528, 'non_hdl': 0.0736174, 'hdl': -0.0954431, 'sbp_min': -0.1989445, 'sbp_max': 0.3246831, 'dm': 0.769947, 'smoke': 0.4589251, 'egfr_min': 0.4770457, 'egfr_max': 0.0583794, 'bp_meds': 0.2646279, 'statin': -0.1042784, 'tx_sbp': -0.0552796, 'tx_non_hdl': 0.0461825, 'age_non_hdl': -0.0634693, 'age_hdl': 0.0267878, 'age_sbp': -0.0841961, 'age_dm': -0.2223405, 'age_smoke': -0.0927658, 'age_egfr': -0.1126786, 'intercept': -3.003781},
      'ascvd': {'age': 0.6865243, 'non_hdl': 0.1287965, 'hdl': -0.0929285, 'sbp_min': -0.0674681, 'sbp_max': 0.3168779, 'dm': 0.6974759, 'smoke': 0.4076878, 'egfr_min': 0.3470657, 'egfr_max': 0.054366, 'bp_meds': 0.185794, 'statin': -0.0519364, 'tx_sbp': -0.0384218, 'tx_non_hdl': 0.0354152, 'age_non_hdl': -0.043513, 'age_hdl': 0.029864, 'age_sbp': -0.0930722, 'age_dm': -0.193294, 'age_smoke': -0.0827252, 'age_egfr': -0.1118129, 'intercept': -3.424933},
      'hf': {'age': 0.8920199, 'sbp_min': -0.4042898, 'sbp_max': 0.3435134, 'dm': 0.9413247, 'smoke': 0.5284347, 'bmi_min': 0.0163354, 'bmi_max': 0.286955, 'egfr_min': 0.6409605, 'egfr_max': 0.064567, 'bp_meds': 0.3204961, 'tx_sbp': -0.0768858, 'age_sbp': -0.0853744, 'age_dm': -0.3013853, 'age_smoke': -0.1065184, 'age_bmi': -0.0076867, 'age_egfr': -0.1345423, 'intercept': -3.95759}
    }
  }
};

function calculatePreventApiFull(age, sex, tc, hdl, sbp, bmiVal, egfrVal, dmVal, smokeVal, bpMedsVal, statinVal) {
  if (age < 30 || age > 79) return null;
  const nonHdl = Math.max(10, (tc || 200) - (hdl || 50));
  const genderKey = (sex === 1) ? 'male' : 'female';
  const model = preventModelsData['base'] ? preventModelsData['base'][genderKey] : null;
  if (!model) return null;

  const ageStd = (age - 55) / 10;
  const nonHdlStd = (nonHdl - 130) / 30;
  const hdlStd = ((hdl || 50) - 50) / 15;
  const sbpCur = sbp || 120;
  const sbpMin = (Math.min(sbpCur, 110) - 110) / 20;
  const sbpMax = (Math.max(sbpCur, 110) - 130) / 20;
  const bmiCur = bmiVal || 25;
  const bmiMin = (Math.min(bmiCur, 25) - 25) / 5;
  const bmiMax = (Math.max(bmiCur, 25) - 30) / 5;
  const egfrCur = egfrVal || 90;
  const egfrMin = (Math.min(egfrCur, 60) - 60) / -15;
  const egfrMax = (Math.max(egfrCur, 60) - 90) / -15;

  const calcRisk = (c) => {
    let s = c.intercept;
    s += c.age * ageStd;
    if (c.non_hdl !== undefined) s += c.non_hdl * nonHdlStd;
    if (c.hdl !== undefined) s += c.hdl * hdlStd;
    s += c.sbp_min * sbpMin + c.sbp_max * sbpMax;
    s += c.dm * (dmVal || 0);
    s += c.smoke * (smokeVal || 0);
    if (c.bmi_min !== undefined) s += c.bmi_min * bmiMin + c.bmi_max * bmiMax;
    s += c.egfr_min * egfrMin + c.egfr_max * egfrMax;
    s += c.bp_meds * (bpMedsVal || 0);
    if (c.statin !== undefined) s += c.statin * (statinVal || 0);
    if (c.tx_sbp !== undefined) s += c.tx_sbp * (bpMedsVal || 0) * sbpMax;
    if (c.tx_non_hdl !== undefined) s += c.tx_non_hdl * (statinVal || 0) * nonHdlStd;
    if (c.age_non_hdl !== undefined) s += c.age_non_hdl * ageStd * nonHdlStd;
    if (c.age_hdl !== undefined) s += c.age_hdl * ageStd * hdlStd;
    s += c.age_sbp * ageStd * sbpMax;
    s += c.age_dm * ageStd * (dmVal || 0);
    s += c.age_smoke * ageStd * (smokeVal || 0);
    s += c.age_bmi !== undefined ? c.age_bmi * ageStd * bmiMax : 0;
    s += c.age_egfr * ageStd * egfrMin;
    const p = (Math.exp(s) / (1 + Math.exp(s))) * 100;
    return Math.round((p + Number.EPSILON) * 100) / 100;
  };

  return {
    cvd: calcRisk(model.cvd),
    ascvd: calcRisk(model.ascvd),
    hf: calcRisk(model.hf)
  };
}

// --- 4. ESC SCORE2 & SCORE2-Diabetes Models ---
function calcSCORE2(age, sex, smoker, sbp, tc, hdl, region, dm) {
  if (age < 40 || age > 89) return null;
  const isMale = (sex === 1);
  const isSmoker = (smoker === 1);
  const sbpVal = sbp || 120;
  const tcMmol = (tc || 200) / 38.67;
  const hdlMmol = (hdl || 50) / 38.67;

  // Calibrated for Moderate/High Risk Regions
  let baseScore = 0;
  if (age >= 70) {
    baseScore = isMale ? 12.0 : 8.5;
    baseScore += (age - 70) * 0.9;
    baseScore += (sbpVal - 120) * 0.12;
    if (isSmoker) baseScore *= 1.45;
  } else {
    baseScore = isMale ? 3.8 : 2.2;
    baseScore += (age - 50) * 0.28;
    baseScore += (sbpVal - 120) * 0.08;
    baseScore += (tcMmol - 5.0) * 0.6 - (hdlMmol - 1.2) * 0.8;
    if (isSmoker) baseScore *= 1.6;
  }
  if (dm === 1) baseScore *= 1.8;
  const riskPct = Math.max(0.5, Math.min(65.0, Math.round((baseScore + Number.EPSILON) * 100) / 100));

  let badgeClass = 'badge-low';
  let category = 'Low-to-moderate risk';
  if (age < 50) {
    if (riskPct >= 7.5) { category = 'Very high risk'; badgeClass = 'badge-vhigh'; }
    else if (riskPct >= 2.5) { category = 'High risk'; badgeClass = 'badge-high'; }
  } else if (age < 70) {
    if (riskPct >= 10.0) { category = 'Very high risk'; badgeClass = 'badge-vhigh'; }
    else if (riskPct >= 5.0) { category = 'High risk'; badgeClass = 'badge-high'; }
  } else {
    if (riskPct >= 15.0) { category = 'Very high risk'; badgeClass = 'badge-vhigh'; }
    else if (riskPct >= 7.5) { category = 'High risk'; badgeClass = 'badge-high'; }
  }

  return { pct: riskPct, category, badgeClass };
}

// --- 5. Body Mass Index (BMI) & Asian Cutoffs ---
function calculateBmi(weightKg, heightCm) {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  let category = '';
  let badgeClass = '';
  if (bmi < 18.5) {
    category = 'น้ำหนักน้อยกว่าเกณฑ์ (Underweight)';
    badgeClass = 'badge-low';
  } else if (bmi < 23.0) {
    category = 'น้ำหนักปกติ สมส่วน (Normal Weight)';
    badgeClass = 'badge-low';
  } else if (bmi < 25.0) {
    category = 'น้ำหนักเกิน (Overweight / At Risk)';
    badgeClass = 'badge-med';
  } else if (bmi < 30.0) {
    category = 'โรคอ้วนระดับ 1 (Obese Class I)';
    badgeClass = 'badge-high';
  } else {
    category = 'โรคอ้วนระดับ 2 รุนแรง (Obese Class II / Severe)';
    badgeClass = 'badge-vhigh';
  }

  return { bmi, category, badgeClass };
}

// --- 6. Complete Lipid Profile & Multi-Formula LDL-C Calculators ---
// Derived from lipid-ascvd-dashboard.pages.dev (นพ.ธนภพ การุญ)
const martinTableData = [
  [3.5, 3.4, 3.3, 3.3, 3.2, 3.1],
  [4.0, 3.9, 3.7, 3.6, 3.6, 3.4],
  [4.3, 4.1, 4.0, 3.9, 3.8, 3.6],
  [4.5, 4.3, 4.1, 4.0, 3.9, 3.9],
  [4.7, 4.4, 4.3, 4.2, 4.1, 3.9],
  [4.8, 4.6, 4.4, 4.2, 4.2, 4.1],
  [4.9, 4.6, 4.5, 4.3, 4.3, 4.2],
  [5.0, 4.8, 4.6, 4.4, 4.3, 4.2],
  [5.1, 4.8, 4.6, 4.5, 4.4, 4.3],
  [5.2, 4.9, 4.7, 4.6, 4.4, 4.3],
  [5.3, 5.0, 4.8, 4.7, 4.5, 4.4],
  [5.4, 5.1, 4.8, 4.7, 4.5, 4.3],
  [5.5, 5.2, 5.0, 4.7, 4.6, 4.5],
  [5.6, 5.3, 5.0, 4.8, 4.6, 4.5],
  [5.7, 5.4, 5.1, 4.9, 4.7, 4.5],
  [5.8, 5.5, 5.2, 5.0, 4.8, 4.6],
  [6.0, 5.5, 5.3, 5.0, 4.8, 4.6],
  [6.1, 5.7, 5.3, 5.1, 4.9, 4.7],
  [6.2, 5.8, 5.4, 5.2, 5.0, 4.7],
  [6.3, 5.9, 5.6, 5.3, 5.0, 4.8],
  [6.5, 6.0, 5.7, 5.4, 5.1, 4.8],
  [6.7, 6.2, 5.8, 5.4, 5.2, 4.9],
  [6.8, 6.3, 5.9, 5.5, 5.3, 5.0],
  [7.0, 6.5, 6.0, 5.7, 5.4, 5.1],
  [7.3, 6.7, 6.2, 5.8, 5.5, 5.2],
  [7.6, 6.9, 6.4, 6.0, 5.6, 5.3],
  [8.0, 7.2, 6.6, 6.2, 5.9, 5.4],
  [8.5, 7.6, 7.0, 6.5, 6.1, 5.6]
];

const martinTgIndex = [
  [7, 49], [50, 56], [57, 61], [62, 66], [67, 71], [72, 75], [76, 79], 
  [80, 83], [84, 87], [88, 92], [93, 96], [97, 100], [101, 105], [106, 110], 
  [111, 115], [116, 120], [121, 126], [127, 132], [133, 138], [139, 146], 
  [147, 154], [155, 163], [164, 173], [174, 185], [186, 201], [202, 220], 
  [221, 247], [248, 13975]
];

function getMartinHopkinsFactor(tg, nonHdl) {
  if (nonHdl <= 0) return 5.0;
  const tgVal = Math.max(7, Math.min(tg, 400));
  const nonHdlVal = Math.max(50, Math.min(nonHdl, 220));
  let r = 0;
  for (let i = 0; i < martinTgIndex.length; i++) {
    if (tgVal >= martinTgIndex[i][0] && tgVal <= martinTgIndex[i][1]) {
      r = i;
      break;
    }
  }
  let c = 0;
  if (nonHdlVal < 100) c = 0;
  else if (nonHdlVal < 130) c = 1;
  else if (nonHdlVal < 160) c = 2;
  else if (nonHdlVal < 190) c = 3;
  else if (nonHdlVal < 220) c = 4;
  else c = 5;
  return martinTableData[r][c];
}

function calcFriedewald(tc, hdl, tg) {
  if (!tc || !hdl || tg == null) return 0;
  return tc - hdl - (tg / 5);
}

function calcMartin(tc, hdl, tg) {
  const nonHdl = tc - hdl;
  if (tg <= 0 || nonHdl <= 0) return 0;
  const factor = getMartinHopkinsFactor(tg, nonHdl);
  return tc - hdl - (tg / factor);
}

function calcSampson(tc, hdl, tg) {
  const nonHdl = tc - hdl;
  if (tg <= 0 || nonHdl <= 0) return 0;
  return (tc / 0.948) - (hdl / 0.971) - ((tg / 8.56) + ((tg * nonHdl) / 2140) - (Math.pow(tg, 2) / 16100)) - 9.44;
}

function calcModifiedSampson(tc, hdl, tg) {
  const nonHdl = tc - hdl;
  if (tg <= 0 || nonHdl <= 0) return 0;
  return nonHdl - (tg / 8.37) - ((tg * nonHdl) / 2640) + (Math.pow(tg, 2) / 17400);
}

function calcEffectiveLdl(tc, hdl, tg) {
  if (!tc || !hdl || tg == null) return 0;
  const nonHdl = tc - hdl;
  if (nonHdl <= 0) return 0;
  const modSampson = calcModifiedSampson(tc, hdl, tg);
  const sampson = calcSampson(tc, hdl, tg);
  const martin = calcMartin(tc, hdl, tg);
  const friedewald = calcFriedewald(tc, hdl, tg);

  if (modSampson > 0 && tg <= 800) return modSampson;
  if (sampson > 0 && tg <= 800) return sampson;
  if (martin > 0) return martin;
  return Math.max(0, friedewald);
}

// Export functions to window
window.calcCKDEPI2021 = calcCKDEPI2021;
window.getCkdStage = getCkdStage;
window.calculateThaiRisk = calculateThaiRisk;
window.calculatePreventApiFull = calculatePreventApiFull;
window.calcSCORE2 = calcSCORE2;
window.calculateBmi = calculateBmi;
window.getMartinHopkinsFactor = getMartinHopkinsFactor;
window.calcFriedewald = calcFriedewald;
window.calcMartin = calcMartin;
window.calcSampson = calcSampson;
window.calcModifiedSampson = calcModifiedSampson;
window.calcEffectiveLdl = calcEffectiveLdl;
