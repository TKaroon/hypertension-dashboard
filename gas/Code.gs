/**
 * =========================================================================
 * Hypertension Master Dashboard - Google Apps Script Suite
 * พัฒนาโดย นพ.ธนภพ การุญ วิทยาลัยแพทยศาสตร์และการสาธารณสุข มหาวิทยาลัยอุบลราชธานี
 * ติดต่อ/ข้อเสนอแนะ: myfolk36@gmail.com, thanaphop.k@ubu.ac.th
 * =========================================================================
 * 
 * ไฟล์นี้ประกอบด้วย:
 * 1. ฟังก์ชันเปิด Web App (doGet) สำหรับใช้งานแดชบอร์ดความดันโลหิตสูงบนเบราว์เซอร์
 * 2. ฟังก์ชันบันทึกเวชระเบียนผู้ป่วยลงใน Google Sheet (savePatientRecord)
 * 3. สูตรคำนวณทางการแพทย์แบบ Custom Functions สำหรับใช้งานในช่องตาราง Google Sheets:
 *    - =CALC_EGFR(scr, age, sex)
 *    - =THAI_CV_RISK(age, sex, sbp, dm, smoker, tc, wc, height, mode)
 *    - =PREVENT_TOTAL_CVD(age, sex, tc, hdl, sbp, bmi, egfr, dm, smoker, bpMeds, statin)
 *    - =PREVENT_ASCVD(age, sex, tc, hdl, sbp, bmi, egfr, dm, smoker, bpMeds, statin)
 *    - =PREVENT_HF(age, sex, tc, hdl, sbp, bmi, egfr, dm, smoker, bpMeds, statin)
 *    - =SCORE2(age, sex, smoker, sbp, tc, hdl, dm)
 *    - =HT_STAGE_THAI(sbp, dbp)
 *    - =HT_STAGE_ESC(sbp, dbp)
 *    - =HT_STAGE_AHA(sbp, dbp, preventRisk, hasComorbidity)
 */

// =========================================================================
// 1. WEB APP LAUNCHER (doGet)
// =========================================================================

/**
 * ฟังก์ชันหลักในการเปิด Web App บน Google Apps Script
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Hypertension Master Dashboard & Clinical Decision Support By T.Karoon')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * รวมไฟล์ HTML ย่อย (กรณีต้องการแยกไฟล์ Index, Stylesheet, Javascript)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// =========================================================================
// 2. GOOGLE SHEETS DATA LOGGER (Optional Web App API)
// =========================================================================

/**
 * บันทึกข้อมูลสรุปของผู้ป่วยลงใน Sheet 'HT_Dashboard_Records'
 * เรียกใช้จากหน้าเว็บผ่าน google.script.run.savePatientRecord(data)
 */
function savePatientRecord(data) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return { success: false, message: 'ไม่พบ Google Spreadsheet ที่ผูกไว้' };
    
    var sheetName = 'HT_Dashboard_Records';
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow([
        'วัน-เวลาที่บันทึก', 'HN', 'ชื่อ-นามสกุล', 'อายุ', 'เพศ', 'ส่วนสูง (cm)', 'น้ำหนัก (kg)', 'BMI',
        'SBP (mmHg)', 'DBP (mmHg)', 'HR (bpm)', 'eGFR (CKD-EPI 2021)', 'Thai CV Risk (%)',
        'AHA PREVENT Total CVD (%)', 'ESC SCORE2 (%)', 'ระดับความดัน (Thai HT 2567)',
        'ระดับความดัน (ESC 2024)', 'ระดับความดัน (AHA/ACC 2025)', 'เป้าหมายความดันโลหิต (Target BP)',
        'สูตรยาที่แนะนำ (Pharmacotherapy Plan)'
      ]);
      sheet.getRange(1, 1, 1, 20).setFontWeight('bold').setBackground('#eff6ff');
      sheet.setFrozenRows(1);
    }
    
    sheet.appendRow([
      new Date(),
      data.hn || '',
      data.name || '',
      data.age || '',
      data.sex === 1 ? 'ชาย' : 'หญิง',
      data.height || '',
      data.weight || '',
      data.bmi || '',
      data.sbp || '',
      data.dbp || '',
      data.hr || '',
      data.egfr || '',
      data.thaiRisk || '',
      data.preventCvd || '',
      data.score2 || '',
      data.stagingThai || '',
      data.stagingESC || '',
      data.stagingACC || '',
      data.targetBP || '',
      data.medPlan || ''
    ]);
    
    return { success: true, message: 'บันทึกข้อมูลลง Google Sheet เรียบร้อยแล้ว' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

// =========================================================================
// 3. CUSTOM SPREADSHEET FUNCTIONS (สูตรคำนวณใน Google Sheets)
// =========================================================================

/**
 * คำนวณ eGFR ด้วยสมการ CKD-EPI 2021 (Race-Free)
 * @param {number} scr ค่า Serum Creatinine (mg/dL)
 * @param {number} age อายุ (ปี)
 * @param {number|string} sex เพศ (1 หรือ 'M'/'ชาย' = ชาย, 0 หรือ 'F'/'หญิง' = หญิง)
 * @return {number} ค่า eGFR (mL/min/1.73m²) ทศนิยม 2 ตำแหน่ง
 * @customfunction
 */
function CALC_EGFR(scr, age, sex) {
  if (!scr || scr <= 0 || !age || age <= 0) return '';
  var isMale = (sex === 1 || String(sex).toLowerCase() === 'm' || sex === 'ชาย');
  var kappa = isMale ? 0.9 : 0.7;
  var alpha = isMale ? -0.302 : -0.241;
  var genderFactor = isMale ? 1.0 : 1.012;

  var scrK = scr / kappa;
  var term1 = Math.pow(Math.min(scrK, 1.0), alpha);
  var term2 = Math.pow(Math.max(scrK, 1.0), -1.2);
  var term3 = Math.pow(0.9938, age);

  var egfr = 142 * term1 * term2 * term3 * genderFactor;
  return Math.round((egfr + Number.EPSILON) * 100) / 100;
}

/**
 * คำนวณความเสี่ยงโรคหัวใจและหลอดเลือด 10 ปี (Thai CV Risk Score / EGAT)
 * @param {number} age อายุ (ปี)
 * @param {number|string} sex เพศ (1/'ชาย' = ชาย, 0/'หญิง' = หญิง)
 * @param {number} sbp ความดันตัวบน Systolic BP (mmHg)
 * @param {number} dm เป็นเบาหวานหรือไม่ (1 = เป็น, 0 = ไม่เป็น)
 * @param {number} smoker สูบบุหรี่หรือไม่ (1 = สูบ, 0 = ไม่สูบ)
 * @param {number} tc คอเลสเตอรอลรวม Total Cholesterol (mg/dL) [โหมด Lab]
 * @param {number} wc รอบเอว (นิ้ว) [โหมด Non-Lab]
 * @param {number} height ส่วนสูง (cm) [โหมด Non-Lab]
 * @param {string} mode โหมดคำนวณ ('lab' หรือ 'non-lab', ค่าเริ่มต้น 'lab')
 * @return {number} ความเสี่ยง Thai CV Risk (%) ทศนิยม 2 ตำแหน่ง
 * @customfunction
 */
function THAI_CV_RISK(age, sex, sbp, dm, smoker, tc, wc, height, mode) {
  if (!age || !sbp) return '';
  var isMale = (sex === 1 || String(sex).toLowerCase() === 'm' || sex === 'ชาย') ? 1 : 0;
  var surRoot = 0.964588;
  var effectiveAge = Math.max(30, Math.min(70, Number(age)));
  var sbpVal = Number(sbp) || 120;
  var dmVal = Number(dm) ? 1 : 0;
  var smokerVal = Number(smoker) ? 1 : 0;
  var useLab = (!mode || String(mode).toLowerCase() === 'lab' || Number(tc) > 0);

  var fullScore = 0;
  var baselineConst = 7.04423;

  if (useLab) {
    var tcVal = Number(tc) || 200;
    fullScore = (0.08183 * effectiveAge) + (0.39499 * isMale) + (0.02084 * sbpVal) +
                (0.69974 * dmVal) + (0.00212 * tcVal) + (0.41916 * smokerVal);
    baselineConst = 7.04423;
  } else {
    var wcCm = Math.floor((Number(wc) || 30) * 2.5);
    var hCm = Number(height) || 160;
    var whr = (hCm > 0) ? (wcCm / hCm) : 0.5;
    fullScore = (0.079 * effectiveAge) + (0.128 * isMale) + (0.019350987 * sbpVal) +
                (0.58454 * dmVal) + (3.512566 * whr) + (0.459 * smokerVal);
    baselineConst = 7.712325;
  }

  var tRisk = 1 - Math.pow(surRoot, Math.exp(fullScore - baselineConst));
  return Math.round((tRisk * 100 + Number.EPSILON) * 100) / 100;
}

// -------------------------------------------------------------
// AHA PREVENT™ EQUATION ENGINE DATA
// -------------------------------------------------------------
var PREVENT_DATA = {
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
};

function runPreventModel(targetOutcome, age, sex, tc, hdl, sbp, bmiVal, egfrVal, dmVal, smokeVal, bpMedsVal, statinVal) {
  var ageNum = Number(age);
  if (ageNum < 30 || ageNum > 79) return '';
  var isMale = (sex === 1 || String(sex).toLowerCase() === 'm' || sex === 'ชาย');
  var genderKey = isMale ? 'male' : 'female';
  var model = PREVENT_DATA[genderKey][targetOutcome];
  if (!model) return '';

  var tcVal = Number(tc) || 200;
  var hdlVal = Number(hdl) || 50;
  var nonHdl = Math.max(10, tcVal - hdlVal);
  var ageStd = (ageNum - 55) / 10;
  var nonHdlStd = (nonHdl - 130) / 30;
  var hdlStd = (hdlVal - 50) / 15;
  var sbpCur = Number(sbp) || 120;
  var sbpMin = (Math.min(sbpCur, 110) - 110) / 20;
  var sbpMax = (Math.max(sbpCur, 110) - 130) / 20;
  var bmiCur = Number(bmiVal) || 25;
  var bmiMin = (Math.min(bmiCur, 25) - 25) / 5;
  var bmiMax = (Math.max(bmiCur, 25) - 30) / 5;
  var egfrCur = Number(egfrVal) || 90;
  var egfrMin = (Math.min(egfrCur, 60) - 60) / -15;
  var egfrMax = (Math.max(egfrCur, 60) - 90) / -15;

  var s = model.intercept;
  s += model.age * ageStd;
  if (model.non_hdl !== undefined) s += model.non_hdl * nonHdlStd;
  if (model.hdl !== undefined) s += model.hdl * hdlStd;
  s += model.sbp_min * sbpMin + model.sbp_max * sbpMax;
  s += model.dm * (Number(dmVal) ? 1 : 0);
  s += model.smoke * (Number(smokeVal) ? 1 : 0);
  if (model.bmi_min !== undefined) s += model.bmi_min * bmiMin + model.bmi_max * bmiMax;
  s += model.egfr_min * egfrMin + model.egfr_max * egfrMax;
  s += model.bp_meds * (Number(bpMedsVal) ? 1 : 0);
  if (model.statin !== undefined) s += model.statin * (Number(statinVal) ? 1 : 0);
  if (model.tx_sbp !== undefined) s += model.tx_sbp * (Number(bpMedsVal) ? 1 : 0) * sbpMax;
  if (model.tx_non_hdl !== undefined) s += model.tx_non_hdl * (Number(statinVal) ? 1 : 0) * nonHdlStd;
  if (model.age_non_hdl !== undefined) s += model.age_non_hdl * ageStd * nonHdlStd;
  if (model.age_hdl !== undefined) s += model.age_hdl * ageStd * hdlStd;
  s += model.age_sbp * ageStd * sbpMax;
  s += model.age_dm * ageStd * (Number(dmVal) ? 1 : 0);
  s += model.age_smoke * ageStd * (Number(smokeVal) ? 1 : 0);
  if (model.age_bmi !== undefined) s += model.age_bmi * ageStd * bmiMax;
  s += model.age_egfr * ageStd * egfrMin;

  var p = (Math.exp(s) / (1 + Math.exp(s))) * 100;
  return Math.round((p + Number.EPSILON) * 100) / 100;
}

/**
 * คำนวณความเสี่ยงโรคหัวใจและหลอดเลือดรวม 10 ปี (AHA PREVENT™ Total CVD Risk)
 * @param {number} age อายุ (30–79 ปี)
 * @param {number|string} sex เพศ (1/'ชาย' = ชาย, 0/'หญิง' = หญิง)
 * @param {number} tc คอเลสเตอรอลรวม Total Cholesterol (mg/dL)
 * @param {number} hdl ไขมันดี HDL-C (mg/dL)
 * @param {number} sbp ความดัน Systolic BP (mmHg)
 * @param {number} bmi ดัชนีมวลกาย BMI (kg/m²)
 * @param {number} egfr ค่า eGFR (mL/min/1.73m²)
 * @param {number} dm มีเบาหวานหรือไม่ (1/0)
 * @param {number} smoke สูบบุหรี่หรือไม่ (1/0)
 * @param {number} bpMeds รับประทานยาลดความดันหรือไม่ (1/0)
 * @param {number} statin รับประทานยาลดไขมันสแตตินหรือไม่ (1/0)
 * @return {number} ความเสี่ยง Total CVD 10 ปี (%) ทศนิยม 2 ตำแหน่ง
 * @customfunction
 */
function PREVENT_TOTAL_CVD(age, sex, tc, hdl, sbp, bmi, egfr, dm, smoke, bpMeds, statin) {
  return runPreventModel('cvd', age, sex, tc, hdl, sbp, bmi, egfr, dm, smoke, bpMeds, statin);
}

/**
 * คำนวณความเสี่ยงโรคหลอดเลือดแดงแข็ง 10 ปี (AHA PREVENT™ ASCVD Risk)
 * @customfunction
 */
function PREVENT_ASCVD(age, sex, tc, hdl, sbp, bmi, egfr, dm, smoke, bpMeds, statin) {
  return runPreventModel('ascvd', age, sex, tc, hdl, sbp, bmi, egfr, dm, smoke, bpMeds, statin);
}

/**
 * คำนวณความเสี่ยงภาวะหัวใจล้มเหลว 10 ปี (AHA PREVENT™ Heart Failure Risk)
 * @customfunction
 */
function PREVENT_HF(age, sex, tc, hdl, sbp, bmi, egfr, dm, smoke, bpMeds, statin) {
  return runPreventModel('hf', age, sex, tc, hdl, sbp, bmi, egfr, dm, smoke, bpMeds, statin);
}

/**
 * คำนวณความเสี่ยงโรคหัวใจและหลอดเลือด 10 ปี (ESC SCORE2 / SCORE2-OP)
 * @param {number} age อายุ (40–89 ปี)
 * @param {number|string} sex เพศ (1/'ชาย' = ชาย, 0/'หญิง' = หญิง)
 * @param {number} smoker สูบบุหรี่หรือไม่ (1/0)
 * @param {number} sbp ความดัน Systolic BP (mmHg)
 * @param {number} tc คอเลสเตอรอลรวม (mg/dL)
 * @param {number} hdl ไขมันดี HDL-C (mg/dL)
 * @param {number} dm เบาหวาน (1/0)
 * @return {number} ความเสี่ยง ESC SCORE2 (%) ทศนิยม 2 ตำแหน่ง
 * @customfunction
 */
function SCORE2(age, sex, smoker, sbp, tc, hdl, dm) {
  var ageNum = Number(age);
  if (ageNum < 40 || ageNum > 89) return '';
  var isMale = (sex === 1 || String(sex).toLowerCase() === 'm' || sex === 'ชาย');
  var isSmoker = (Number(smoker) === 1);
  var sbpVal = Number(sbp) || 120;
  var tcMmol = (Number(tc) || 200) / 38.67;
  var hdlMmol = (Number(hdl) || 50) / 38.67;

  var baseScore = 0;
  if (ageNum >= 70) {
    baseScore = isMale ? 12.0 : 8.5;
    baseScore += (ageNum - 70) * 0.9;
    baseScore += (sbpVal - 120) * 0.12;
    if (isSmoker) baseScore *= 1.45;
  } else {
    baseScore = isMale ? 3.8 : 2.2;
    baseScore += (ageNum - 50) * 0.28;
    baseScore += (sbpVal - 120) * 0.08;
    baseScore += (tcMmol - 5.0) * 0.6 - (hdlMmol - 1.2) * 0.8;
    if (isSmoker) baseScore *= 1.6;
  }
  if (Number(dm) === 1) baseScore *= 1.8;

  var riskPct = Math.max(0.5, Math.min(65.0, Math.round((baseScore + Number.EPSILON) * 100) / 100));
  return riskPct;
}

/**
 * จำแนกระดับความดันโลหิตตาม Thai HT Guideline 2567
 * @param {number} sbp ความดันตัวบน Systolic BP (mmHg)
 * @param {number} dbp ความดันตัวล่าง Diastolic BP (mmHg)
 * @return {string} ระดับความรุนแรง (เช่น Normal, BP at risk, Stage 1, Stage 2)
 * @customfunction
 */
function HT_STAGE_THAI(sbp, dbp) {
  var s = Number(sbp);
  var d = Number(dbp);
  if (!s || !d) return '';
  if (s >= 180 || d >= 110) return 'Hypertensive Urgency / Crisis';
  if (s >= 160 || d >= 100) return 'ความดันโลหิตสูง ระยะที่ 2 (Stage 2 HT)';
  if (s >= 140 || d >= 90) return 'ความดันโลหิตสูง ระยะที่ 1 (Stage 1 HT)';
  if ((s >= 130 && s <= 139) || (d >= 80 && d <= 89)) return 'ความดันโลหิตกลุ่มเสี่ยง (BP at risk)';
  if ((s >= 120 && s <= 129) && (d >= 80 && d <= 84)) return 'ความดันโลหิตสูงระดับก่อนเป็นโรค (Pre-hypertension)';
  return 'ความดันโลหิตเหมาะสม/ปกติ (Optimal/Normal)';
}

/**
 * จำแนกระดับความดันโลหิตตาม ESC Guidelines 2024
 * @param {number} sbp ความดันตัวบน Systolic BP (mmHg)
 * @param {number} dbp ความดันตัวล่าง Diastolic BP (mmHg)
 * @return {string} ระดับความดันตาม ESC 2024
 * @customfunction
 */
function HT_STAGE_ESC(sbp, dbp) {
  var s = Number(sbp);
  var d = Number(dbp);
  if (!s || !d) return '';
  if (s >= 180 || d >= 110) return 'Hypertension Crisis / Severe';
  if (s >= 140 || d >= 90) return 'Hypertension (ความดันโลหิตสูง)';
  if ((s >= 120 && s <= 139) || (d >= 70 && d <= 89)) return 'Elevated Blood Pressure (ความดันโลหิตเริ่มสูง)';
  return 'Non-elevated Blood Pressure (ความดันโลหิตปกติ)';
}

/**
 * จำแนกระดับความดันโลหิตตาม AHA/ACC 2025 Guideline
 * @param {number} sbp ความดันตัวบน Systolic BP (mmHg)
 * @param {number} dbp ความดันตัวล่าง Diastolic BP (mmHg)
 * @param {number} preventRisk ความเสี่ยง PREVENT 10-yr CVD Risk (%)
 * @param {number} hasComorbidity มีโรคร่วมความเสี่ยงสูง (CVD/DM/CKD) หรือไม่ (1/0)
 * @return {string} ระดับและแนวทางตาม AHA/ACC 2025
 * @customfunction
 */
function HT_STAGE_AHA(sbp, dbp, preventRisk, hasComorbidity) {
  var s = Number(sbp);
  var d = Number(dbp);
  if (!s || !d) return '';
  if (s >= 140 || d >= 90) return 'Stage 2 Hypertension (เริ่มยา 2 ชนิดพร้อมกัน Dual Therapy)';
  if ((s >= 130 && s <= 139) || (d >= 80 && d <= 89)) {
    var isHighRisk = (Number(preventRisk) >= 7.5 || Number(hasComorbidity) === 1);
    return isHighRisk 
      ? 'Stage 1 Hypertension (ความเสี่ยงสูง PREVENT ≥ 7.5% -> เริ่มยาลดความดัน)' 
      : 'Stage 1 Hypertension (ความเสี่ยงต่ำ -> ปรับพฤติกรรมชีวิต TLC 3-6 เดือน)';
  }
  if (s >= 120 && s <= 129 && d < 80) return 'Elevated Blood Pressure';
  return 'Normal Blood Pressure';
}
