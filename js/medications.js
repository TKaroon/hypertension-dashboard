/**
 * Comprehensive Antihypertensive Medication Database & Decision Support
 * Based on:
 * 1. ตารางภาคผนวกแสดงขนาดยาลดความดันเลือด (สมาคมความดันโลหิตสูงแห่งประเทศไทย / Lexicomp)
 * 2. แนวทางการรักษาโรคความดันโลหิตสูงในเวชปฏิบัติทั่วไป พ.ศ. 2567 (Thai HT 2567)
 * 3. 2024 ESC Guidelines for elevated BP and hypertension (ESC 2024)
 * 4. 2025 AHA/ACC/AANP/AAPA/ABC/ACCP/ACPM/AGS/AMA/ASPC/NMA/PCNA/SGIM Guideline (AHA/ACC 2025)
 */

// =========================================================================
// 1. COMPREHENSIVE THAI ANTIHYPERTENSIVE DRUG REGISTRY
// =========================================================================

const THAI_HT_DRUGS = {
  // -------------------------------------------------------------
  // THIAZIDE AND THIAZIDE-LIKE DIURETICS
  // -------------------------------------------------------------
  hctz: {
    id: 'hctz',
    name: 'Hydrochlorothiazide (HCTZ)',
    brandTH: 'Generic',
    classGroup: 'Diuretic',
    subClass: 'Thiazide',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED)',
    onset: '~2 ชม.',
    peak: '4–6 ชม.',
    tHalf: '6–15 ชม.',
    metabolism: 'ไม่มี',
    excretion: 'ปัสสาวะ 61%',
    standardDoses: ['12.5 mg', '25 mg', '50 mg'],
    standardFreqs: ['OD', 'BID'],
    gfrNormal: { doseRange: '12.5–50 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 50 },
    gfrModerate: { doseRange: '12.5–50 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 50, note: 'วันละ 1 ครั้ง' },
    gfrSevere: { doseRange: 'หลีกเลี่ยง/ประสิทธิภาพไม่ดี', freq: '-', maxDaily: 0, status: 'ineffective', note: 'ประสิทธิภาพการออกฤทธิ์ไม่ดีเมื่อ GFR < 10 (หรือ eGFR < 30)' },
    notes: 'ยาพื้นฐานในบัญชียาหลักแห่งชาติ ราคาประหยัด ขนาดยา 12.5–25 mg ให้ผลลดความดันดี หากใช้ >25 mg เสี่ยงเกลือแร่ผิดปกติโดยไม่เพิ่มฤทธิ์ลดความดันมากนัก'
  },
  indapamide: {
    id: 'indapamide',
    name: 'Indapamide (Indapamide SR)',
    brandTH: 'Natrilix SR / Generic',
    classGroup: 'Diuretic',
    subClass: 'Thiazide-like',
    edStatus: 'ยานอกบัญชียาหลัก (Non-ED / รพ.บางแห่ง)',
    onset: 'ไม่มีข้อมูล',
    peak: 'ไม่มีข้อมูล',
    tHalf: '14 และ 25 ชม.',
    metabolism: 'ตับ',
    excretion: 'ปัสสาวะ 70%, อุจจาระ 23%',
    standardDoses: ['1.5 mg (SR)', '2.5 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '1.25–2.5 mg/วัน (SR 1.5 mg)', freq: 'วันละ 1 ครั้ง', maxDaily: 2.5 },
    gfrModerate: { doseRange: '1.25–2.5 mg/วัน (SR 1.5 mg)', freq: 'วันละ 1 ครั้ง', maxDaily: 2.5 },
    gfrSevere: { doseRange: 'หลีกเลี่ยง/ประสิทธิภาพไม่ดี', freq: '-', maxDaily: 0, status: 'ineffective', note: 'ประสิทธิภาพการออกฤทธิ์ไม่ดีเมื่อ GFR < 10' },
    notes: 'Thiazide-like diuretic ที่มีหลักฐานการศึกษาสูงมาก (HYVET study) ผลข้างเคียงต่อเมแทบอลิซึมน้อย ไม่รบกวนน้ำตาล/ไขมัน เหมาะในผู้สูงอายุ'
  },
  chlorthalidone: {
    id: 'chlorthalidone',
    name: 'Chlorthalidone',
    brandTH: 'Hygroton',
    classGroup: 'Diuretic',
    subClass: 'Thiazide-like',
    edStatus: 'ยานอกบัญชียาหลัก (Non-ED)',
    onset: '~2.6 ชม.',
    peak: '2–6 ชม.',
    tHalf: '40–60 ชม.',
    metabolism: 'ตับ',
    excretion: 'ปัสสาวะ',
    standardDoses: ['12.5 mg', '25 mg', '50 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '12.5–25 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 25 },
    gfrModerate: { doseRange: '12.5–25 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 25 },
    gfrSevere: { doseRange: 'หลีกเลี่ยง/ประสิทธิภาพไม่ดี', freq: '-', maxDaily: 0, status: 'ineffective', note: 'ประสิทธิภาพการออกฤทธิ์ไม่ดีเมื่อ GFR < 10' },
    notes: 'ออกฤทธิ์ยาวนาน 48–72 ชม. สมาคมโรคหัวใจสหรัฐฯ (AHA/ACC) แนะนำมากกว่า HCTZ'
  },
  furosemide: {
    id: 'furosemide',
    name: 'Furosemide',
    brandTH: 'Lasix / Generic',
    classGroup: 'Diuretic',
    subClass: 'Loop diuretic',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED)',
    onset: 'ยากิน 30–60 นาที, ยาฉีด ~5 นาที',
    peak: '1–2 ชม.',
    tHalf: '0.5–2 ชม. (ไตวายระยะสุดท้าย 9 ชม.)',
    metabolism: 'ตับ (มีเล็กน้อย)',
    excretion: 'ปัสสาวะ (ยากิน 50%, ยาฉีด 80%), อุจจาระ',
    standardDoses: ['20 mg', '40 mg', '80 mg', '120 mg'],
    standardFreqs: ['OD', 'BID'],
    gfrNormal: { doseRange: '20–80 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 80 },
    gfrModerate: { doseRange: '20–80 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 80 },
    gfrSevere: { doseRange: '20–80 mg/วัน (ปรับเพิ่มได้ใน CKD)', freq: 'วันละ 1–2 ครั้ง', maxDaily: 160, note: 'ยาทางเลือกหลักสำหรับขับปัสสาวะและคุมความดันเมื่อ eGFR < 30' },
    notes: 'ใช้เป็นยาขับปัสสาวะหลักเมื่อไตเสื่อม (eGFR < 30) หรือมีภาวะน้ำเกิน/หัวใจล้มเหลว'
  },
  amiloride: {
    id: 'amiloride',
    name: 'Amiloride',
    brandTH: 'Moduretic (ร่วมกับ HCTZ)',
    classGroup: 'Diuretic',
    subClass: 'Potassium-sparing',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (สูตรผสม)',
    onset: '2 ชม.',
    peak: '6–10 ชม.',
    tHalf: '6–9 ชม. (CrCl < 50: 21–144 ชม.)',
    metabolism: 'ไม่มี',
    excretion: 'ปัสสาวะ 50%, อุจจาระ 40%',
    standardDoses: ['2.5 mg', '5 mg', '10 mg'],
    standardFreqs: ['OD', 'BID'],
    gfrNormal: { doseRange: '5–20 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 20 },
    gfrModerate: { doseRange: '2.5–10 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 10, note: 'ปรับลดขนาด 50% เมื่อ GFR 10–50' },
    gfrSevere: { doseRange: '❌ หลีกเลี่ยงการใช้ยา', freq: '-', maxDaily: 0, status: 'avoid', note: 'หลีกเลี่ยงการใช้ยาเมื่อ GFR < 10 (เสี่ยง Hyperkalemia รุนแรง)' },
    notes: 'ขับปัสสาวะโดยไม่สูญเสียโพแทสเซียม ห้ามใช้เมื่อมีภาวะโพแทสเซียมในเลือดสูง'
  },
  triamterene: {
    id: 'triamterene',
    name: 'Triamterene',
    brandTH: 'Dyrenium',
    classGroup: 'Diuretic',
    subClass: 'Potassium-sparing',
    edStatus: 'ยานอกบัญชียาหลัก',
    onset: '2–4 ชม.',
    peak: 'อาจใช้เวลาหลายวัน',
    tHalf: 'ไม่มีข้อมูล',
    metabolism: 'Sulfate conjugation',
    excretion: 'ปัสสาวะ 21%, <50%',
    standardDoses: ['50 mg', '100 mg'],
    standardFreqs: ['OD', 'BID'],
    gfrNormal: { doseRange: '50–100 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 100 },
    gfrModerate: { doseRange: '50–100 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 100 },
    gfrSevere: { doseRange: '❌ หลีกเลี่ยงการใช้ยา', freq: '-', maxDaily: 0, status: 'avoid', note: 'หลีกเลี่ยงการใช้ยาเมื่อ GFR < 10' },
    notes: 'ระวังโพแทสเซียมในเลือดสูง ห้ามใช้ในไตวายรุนแรง'
  },

  // -------------------------------------------------------------
  // MINERALOCORTICOID RECEPTOR ANTAGONISTS (MRA)
  // -------------------------------------------------------------
  spironolactone: {
    id: 'spironolactone',
    name: 'Spironolactone',
    brandTH: 'Aldactone / Generic',
    classGroup: 'MRA',
    subClass: 'Aldosterone antagonist',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED)',
    onset: 'ไม่มีข้อมูล',
    peak: 'ไม่มีข้อมูล',
    tHalf: '1.4–16.5 ชม.',
    metabolism: 'ตับ',
    excretion: 'ปัสสาวะ, น้ำดี',
    standardDoses: ['12.5 mg', '25 mg', '50 mg', '100 mg'],
    standardFreqs: ['OD', 'BID'],
    gfrNormal: { doseRange: '25–100 mg/วัน (ใน HT แนะนำ 25–50 mg)', freq: 'วันละ 1–2 ครั้ง', maxDaily: 100 },
    gfrModerate: { doseRange: '25–100 mg/วัน (HT แนะนำ 12.5–25 mg)', freq: 'วันละ 1–2 ครั้ง', maxDaily: 50, note: 'ระมัดระวังเป็นพิเศษเมื่อ eGFR < 45' },
    gfrSevere: { doseRange: '❌ หลีกเลี่ยงการใช้ยา', freq: '-', maxDaily: 0, status: 'avoid', note: 'หลีกเลี่ยงการใช้ยาเมื่อ GFR < 10 (และ eGFR < 30)' },
    notes: 'ยาทางเลือกอันดับ 1 สำหรับ Resistant Hypertension (PATHWAY-2 trial) ต้องตรวจติดตาม K+ และ Cr หลังเริ่มยา 1–2 สัปดาห์'
  },
  eplerenone: {
    id: 'eplerenone',
    name: 'Eplerenone',
    brandTH: 'Inspra',
    classGroup: 'MRA',
    subClass: 'Selective aldosterone antagonist',
    edStatus: 'ยานอกบัญชียาหลัก (Non-ED)',
    onset: 'ไม่มีข้อมูล',
    peak: 'ไม่มีข้อมูล',
    tHalf: '4–6 ชม.',
    metabolism: 'ตับ CYP3A4',
    excretion: 'ปัสสาวะ 67%, อุจจาระ 32%',
    standardDoses: ['25 mg', '50 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '25–50 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 50 },
    gfrModerate: { doseRange: '25 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 25, note: 'ห้ามใช้หาก eGFR < 30 หรือ Cr > 2.0 (หญิง) / 2.5 (ชาย)' },
    gfrSevere: { doseRange: '❌ หลีกเลี่ยงการใช้ยา', freq: '-', maxDaily: 0, status: 'avoid' },
    notes: 'Selective aldosterone blocker ไม่ทำให้เกิดเต้านมโตในเพศชาย (Gynecomastia)'
  },

  // -------------------------------------------------------------
  // ANGIOTENSIN CONVERTING ENZYME INHIBITORS (ACEIs)
  // -------------------------------------------------------------
  enalapril: {
    id: 'enalapril',
    name: 'Enalapril',
    brandTH: 'Renitec / Generic',
    classGroup: 'RAS',
    subClass: 'ACEI',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED)',
    onset: '~1 ชม.',
    peak: '4–6 ชม.',
    tHalf: '2 ชม.',
    metabolism: 'ตับ เปลี่ยนเป็น enalaprilat',
    excretion: 'ปัสสาวะ 61%, อุจจาระ 33%',
    standardDoses: ['2.5 mg', '5 mg', '10 mg', '20 mg'],
    standardFreqs: ['OD', 'BID'],
    gfrNormal: { doseRange: '2.5–40 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 40 },
    gfrModerate: { doseRange: '1.25–40 mg/วัน (ให้ 50–100%)', freq: 'วันละ 1–2 ครั้ง', maxDaily: 20, note: 'ให้ 50–100% ของขนาดปกติ' },
    gfrSevere: { doseRange: '1.25–10 mg/วัน (ให้ 25%)', freq: 'วันละ 1–2 ครั้ง', maxDaily: 10, note: 'ลดขนาดยาเหลือ 25% (สูงสุด 10 mg/วัน)' },
    notes: 'ยาหลักราคาประหยัดในระบบสาธารณสุขไทย แนะนำแบ่งให้วันละ 2 ครั้งเพื่อคุมความดันได้ครอบคลุม 24 ชม.'
  },
  ramipril: {
    id: 'ramipril',
    name: 'Ramipril',
    brandTH: 'Tritace',
    classGroup: 'RAS',
    subClass: 'ACEI',
    edStatus: 'ยานอกบัญชียาหลัก (Non-ED)',
    onset: '1–2 ชม.',
    peak: 'ไม่มีข้อมูล',
    tHalf: '13–>50 ชม.',
    metabolism: 'ตับ เปลี่ยนเป็น ramiprilat',
    excretion: 'ปัสสาวะ 60%, อุจจาระ 40%',
    standardDoses: ['2.5 mg', '5 mg', '10 mg'],
    standardFreqs: ['OD', 'BID'],
    gfrNormal: { doseRange: '2.5–10 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 10 },
    gfrModerate: { doseRange: '1.25–5 mg/วัน (ให้ 25–50%)', freq: 'วันละ 1 ครั้ง', maxDaily: 5, note: 'ลดขนาดเหลือ 25–50% วันละ 1 ครั้ง' },
    gfrSevere: { doseRange: '1.25–2.5 mg/วัน (ให้ 25%)', freq: 'วันละ 1 ครั้ง', maxDaily: 2.5, note: 'ลดขนาดเหลือ 25% วันละ 1 ครั้ง' },
    notes: 'หลักฐาน HOPE study เด่นชัดในการป้องกันโรคหัวใจและหลอดเลือด และชะลอโรคไต'
  },
  lisinopril: {
    id: 'lisinopril',
    name: 'Lisinopril',
    brandTH: 'Zestril',
    classGroup: 'RAS',
    subClass: 'ACEI',
    edStatus: 'ยานอกบัญชียาหลัก (Non-ED)',
    onset: '1 ชม.',
    peak: '~6 ชม.',
    tHalf: '12 ชม.',
    metabolism: 'ไม่มี',
    excretion: 'ปัสสาวะ',
    standardDoses: ['5 mg', '10 mg', '20 mg', '40 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '5–40 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 40 },
    gfrModerate: { doseRange: '2.5–30 mg/วัน (ให้ 50–75%)', freq: 'วันละ 1 ครั้ง', maxDaily: 20, note: 'ลดขนาดเหลือ 50–75%' },
    gfrSevere: { doseRange: '1.25–20 mg/วัน (ให้ 25–50%)', freq: 'วันละ 1 ครั้ง', maxDaily: 10, note: 'ลดขนาดเหลือ 25–50%' },
    notes: 'ขับออกทางไตโดยตรง ไม่ผ่านกระบวนการเปลี่ยนแปลงที่ตับ'
  },
  perindopril: {
    id: 'perindopril',
    name: 'Perindopril',
    brandTH: 'Coversyl',
    classGroup: 'RAS',
    subClass: 'ACEI',
    edStatus: 'ยานอกบัญชียาหลัก (Non-ED)',
    onset: 'ไม่มีข้อมูล',
    peak: '1–2 ชม.',
    tHalf: '30–120 นาที',
    metabolism: 'ตับ เปลี่ยนเป็น perindoprilat',
    excretion: 'ปัสสาวะ 75%',
    standardDoses: ['2.5 mg', '4 mg', '5 mg', '8 mg', '10 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '5–20 mg/วัน (ขนาดมาตรฐานไทย 5–10 mg)', freq: 'วันละ 1 ครั้ง', maxDaily: 10 },
    gfrModerate: { doseRange: '2 mg ทุก 24–48 ชม.', freq: 'ทุก 24–48 ชม.', maxDaily: 2, note: 'ให้ 2 mg ทุก 24–48 ชม.' },
    gfrSevere: { doseRange: '2 mg ทุก 48 ชม.', freq: 'ทุก 48 ชม.', maxDaily: 2, note: 'ให้ 2 mg ทุก 48 ชม.' },
    notes: 'ออกฤทธิ์นาน 24 ชม. มีสูตรผสม SPC ในไทยหลายสูตร (Coveram, Coversyl Plus, Triplixam)'
  },
  captopril: {
    id: 'captopril',
    name: 'Captopril',
    brandTH: 'Capoten / Generic',
    classGroup: 'RAS',
    subClass: 'ACEI',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED)',
    onset: '15 นาที',
    peak: '1–1.5 ชม.',
    tHalf: '1.7 ชม. (ไตวายรุนแรง 32 ชม.)',
    metabolism: 'ตับ 50%',
    excretion: 'ปัสสาวะ >95%',
    standardDoses: ['12.5 mg', '25 mg', '50 mg'],
    standardFreqs: ['BID', 'TID'],
    gfrNormal: { doseRange: '25–150 mg/วัน', freq: 'วันละ 2–3 ครั้ง', maxDaily: 150 },
    gfrModerate: { doseRange: '18.75–112.5 mg/วัน (ให้ 75%)', freq: 'ทุก 12–18 ชม.', maxDaily: 112.5, note: 'ให้ 75% ทุก 12–18 ชม.' },
    gfrSevere: { doseRange: '12.5–75 mg/วัน (ให้ 50%)', freq: 'ทุก 24 ชม.', maxDaily: 75, note: 'ให้ 50% ทุก 24 ชม.' },
    notes: 'ออกฤทธิ์เร็ว ครึ่งชีวิตสั้น มักใช้ในภาวะเร่งด่วน (Urgency) หรือต้องการยาออกฤทธิ์สั้น'
  },
  benazepril: {
    id: 'benazepril',
    name: 'Benazepril',
    brandTH: 'Cibacen',
    classGroup: 'RAS',
    subClass: 'ACEI',
    edStatus: 'ยานอกบัญชียาหลัก',
    onset: 'ไม่มีข้อมูล',
    peak: '2–4 ชม.',
    tHalf: '10–11 ชม.',
    metabolism: 'ตับ เปลี่ยนเป็น benazeprilat',
    excretion: 'ปัสสาวะ',
    standardDoses: ['5 mg', '10 mg', '20 mg'],
    standardFreqs: ['OD', 'BID'],
    gfrNormal: { doseRange: '5–40 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 40 },
    gfrModerate: { doseRange: '2.5–30 mg/วัน (25–50%)', freq: 'วันละ 1–2 ครั้ง', maxDaily: 20 },
    gfrSevere: { doseRange: '1.25–20 mg/วัน (25%)', freq: 'วันละ 1 ครั้ง', maxDaily: 10 },
    notes: 'ยาในกลุ่ม ACEI ที่มีทางขับออกทั้งไตและตับ'
  },
  quinapril: {
    id: 'quinapril',
    name: 'Quinapril',
    brandTH: 'Accupril',
    classGroup: 'RAS',
    subClass: 'ACEI',
    edStatus: 'ยานอกบัญชียาหลัก',
    onset: '1 ชม.',
    peak: '2–4 ชม.',
    tHalf: '0.8–3 ชม.',
    metabolism: 'เปลี่ยนเป็น quinaprilat',
    excretion: 'ปัสสาวะ',
    standardDoses: ['5 mg', '10 mg', '20 mg', '40 mg'],
    standardFreqs: ['OD', 'BID'],
    gfrNormal: { doseRange: '5–80 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 80 },
    gfrModerate: { doseRange: '5–12.5 mg ทุก 24 ชม.', freq: 'ทุก 24 ชม.', maxDaily: 12.5 },
    gfrSevere: { doseRange: '2.5 mg ทุก 24 ชม.', freq: 'ทุก 24 ชม.', maxDaily: 2.5 },
    notes: 'ปรับลดขนาดเมื่อไตเสื่อม'
  },
  imidapril: {
    id: 'imidapril',
    name: 'Imidapril',
    brandTH: 'Tanatril',
    classGroup: 'RAS',
    subClass: 'ACEI',
    edStatus: 'ยานอกบัญชียาหลัก',
    onset: 'ไม่มีข้อมูล',
    peak: 'ไม่มีข้อมูล',
    tHalf: 'ไม่มีข้อมูล',
    metabolism: 'ตับ',
    excretion: 'ปัสสาวะ',
    standardDoses: ['2.5 mg', '5 mg', '10 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '2.5–20 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 20 },
    gfrModerate: { doseRange: '2.5–10 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 10 },
    gfrSevere: { doseRange: '1.25–5 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 5 },
    notes: 'อุบัติการณ์ไอแห้งต่ำกว่า Enalapril เล็กน้อย'
  },

  // -------------------------------------------------------------
  // ANGIOTENSIN RECEPTOR BLOCKERS (ARBs)
  // -------------------------------------------------------------
  losartan: {
    id: 'losartan',
    name: 'Losartan',
    brandTH: 'Cozaar / Generic',
    classGroup: 'RAS',
    subClass: 'ARB',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED)',
    onset: '~6 ชม.',
    peak: 'ไม่มีข้อมูล',
    tHalf: '7.4±2.4 ชม.',
    metabolism: 'ตับ 14% ผ่าน CYP2C9, 3A4',
    excretion: 'ปัสสาวะ 35%, อุจจาระ 60%',
    standardDoses: ['25 mg', '50 mg', '100 mg'],
    standardFreqs: ['OD', 'BID'],
    gfrNormal: { doseRange: '25–100 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 100 },
    gfrModerate: { doseRange: '25–100 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 100 },
    gfrSevere: { doseRange: '25–100 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 100, note: 'ไม่ต้องปรับขนาดยาตามไต' },
    notes: 'ยาหลักอันดับ 1 กลุ่ม ARB ในไทย มีฤทธิ์ uricosuric ช่วยลดกรดยูริก เหมาะกับผู้ป่วยเกาต์/กรดยูริกสูง'
  },
  telmisartan: {
    id: 'telmisartan',
    name: 'Telmisartan',
    brandTH: 'Micardis / Generic',
    classGroup: 'RAS',
    subClass: 'ARB',
    edStatus: 'ยานอกบัญชียาหลัก (Non-ED / รพ.บางแห่ง)',
    onset: '1–2 ชม.',
    peak: 'ไม่มีข้อมูล',
    tHalf: '24 ชม.',
    metabolism: 'ตับ',
    excretion: 'อุจจาระ 97%',
    standardDoses: ['20 mg', '40 mg', '80 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '20–80 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 80 },
    gfrModerate: { doseRange: '20–80 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 80 },
    gfrSevere: { doseRange: '20–80 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 80, note: 'ขับทางน้ำดี 97% ไม่ต้องปรับขนาดยาตามไต' },
    notes: 'ออกฤทธิ์ยาวนาน (>24 ชม.) กระตุ้น PPAR-gamma เหมาะกับผู้ป่วยเบาหวาน/Metabolic syndrome'
  },
  valsartan: {
    id: 'valsartan',
    name: 'Valsartan',
    brandTH: 'Diovan',
    classGroup: 'RAS',
    subClass: 'ARB',
    edStatus: 'ยานอกบัญชียาหลัก (Non-ED)',
    onset: '~2 ชม.',
    peak: 'ไม่มีข้อมูล',
    tHalf: '~6 ชม.',
    metabolism: 'เปลี่ยนเป็นสารไม่ออกฤทธิ์',
    excretion: 'อุจจาระ 83%, ปัสสาวะ ~13%',
    standardDoses: ['80 mg', '160 mg', '320 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '80–320 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 320 },
    gfrModerate: { doseRange: '80–320 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 320 },
    gfrSevere: { doseRange: '80–320 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 320, note: 'ไม่ต้องปรับขนาดยาตามไต' },
    notes: 'มีหลักฐานทางคลินิกเด่นชัดใน Heart Failure และ Post-MI'
  },
  irbesartan: {
    id: 'irbesartan',
    name: 'Irbesartan',
    brandTH: 'Aprovel',
    classGroup: 'RAS',
    subClass: 'ARB',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED บัญชีย่อย)',
    onset: 'ไม่มีข้อมูล',
    peak: '1–2 ชม.',
    tHalf: '11–15 ชม.',
    metabolism: 'ตับ ผ่าน CYP2C9',
    excretion: 'อุจจาระ 80%, ปัสสาวะ 20%',
    standardDoses: ['150 mg', '300 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '150–300 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 300 },
    gfrModerate: { doseRange: '150–300 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 300 },
    gfrSevere: { doseRange: '150–300 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 300, note: 'ไม่ต้องปรับขนาดยาตามไต' },
    notes: 'หลักฐานเด่นชัดในการชะลอโรคไตจากเบาหวาน (IDNT study)'
  },
  candesartan: {
    id: 'candesartan',
    name: 'Candesartan',
    brandTH: 'Blopress',
    classGroup: 'RAS',
    subClass: 'ARB',
    edStatus: 'ยานอกบัญชียาหลัก (Non-ED)',
    onset: '2–3 ชม.',
    peak: '6–8 ชม.',
    tHalf: '5–9 ชม.',
    metabolism: 'Ester hydrolysis ที่ตับ',
    excretion: 'อุจจาระ 67%, ปัสสาวะ 33%',
    standardDoses: ['8 mg', '16 mg', '32 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '8–32 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 32 },
    gfrModerate: { doseRange: '8–32 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 32 },
    gfrSevere: { doseRange: '8–32 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 32, note: 'ไม่ต้องปรับขนาดยาตามไต' },
    notes: 'หลักฐานชัดเจนในภาวะหัวใจล้มเหลว (CHARM study)'
  },
  olmesartan: {
    id: 'olmesartan',
    name: 'Olmesartan',
    brandTH: 'Olmetec',
    classGroup: 'RAS',
    subClass: 'ARB',
    edStatus: 'ยานอกบัญชียาหลัก (Non-ED)',
    onset: 'ไม่มีข้อมูล',
    peak: 'ไม่มีข้อมูล',
    tHalf: '13 ชม.',
    metabolism: 'ลำไส้เปลี่ยนเป็นสารออกฤทธิ์',
    excretion: 'อุจจาระ 50–65%, ปัสสาวะ 35–50%',
    standardDoses: ['20 mg', '40 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '20–40 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 40 },
    gfrModerate: { doseRange: '20–40 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 40 },
    gfrSevere: { doseRange: '20–40 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 40, note: 'ไม่ต้องปรับขนาดยาตามไต' },
    notes: 'ลดความดันโลหิตได้ทรงพลังมาก'
  },
  azilsartan: {
    id: 'azilsartan',
    name: 'Azilsartan',
    brandTH: 'Edarbi',
    classGroup: 'RAS',
    subClass: 'ARB',
    edStatus: 'ยานอกบัญชียาหลัก (Non-ED)',
    onset: 'ไม่มีข้อมูล',
    peak: 'ไม่มีข้อมูล',
    tHalf: '~11 ชม.',
    metabolism: 'ตับ ผ่าน CYP2C9',
    excretion: 'อุจจาระ 55%, ปัสสาวะ 42%',
    standardDoses: ['40 mg', '80 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '40–80 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 80 },
    gfrModerate: { doseRange: '40–80 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 80 },
    gfrSevere: { doseRange: '40–80 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 80, note: 'ไม่ต้องปรับขนาดยาตามไต' },
    notes: 'ARB รุ่นล่าสุด ควบคุมความดัน 24 ชม. ได้อย่างคงที่'
  },

  // -------------------------------------------------------------
  // CALCIUM CHANNEL BLOCKERS (CCBs) - DIHYDROPYRIDINES
  // -------------------------------------------------------------
  amlodipine: {
    id: 'amlodipine',
    name: 'Amlodipine',
    brandTH: 'Norvasc / Generic',
    classGroup: 'CCB',
    subClass: 'DHP-CCB',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED)',
    onset: '24–48 ชม.',
    peak: 'ไม่มีข้อมูล',
    tHalf: '30–50 ชม.',
    metabolism: 'ตับ',
    excretion: 'ปัสสาวะ',
    standardDoses: ['2.5 mg', '5 mg', '10 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '2.5–10 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 10 },
    gfrModerate: { doseRange: '2.5–10 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 10 },
    gfrSevere: { doseRange: '2.5–10 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 10, note: 'ไม่ต้องปรับขนาดยาตามไต' },
    notes: 'ยาหลักอันดับ 1 ในไทย ครึ่งชีวิตยาวนาน 35–50 ชม. ป้องกัน Stroke ได้ดีเยี่ยม'
  },
  felodipine: {
    id: 'felodipine',
    name: 'Felodipine ER',
    brandTH: 'Plendil ER',
    classGroup: 'CCB',
    subClass: 'DHP-CCB',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED)',
    onset: '2–5 ชม.',
    peak: 'ไม่มีข้อมูล',
    tHalf: '11–16 ชม.',
    metabolism: 'ตับ ผ่าน CYP3A4',
    excretion: 'ปัสสาวะ 70%, อุจจาระ 10%',
    standardDoses: ['2.5 mg', '5 mg', '10 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '2.5–10 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 10 },
    gfrModerate: { doseRange: '2.5–10 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 10 },
    gfrSevere: { doseRange: '2.5–10 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 10, note: 'ไม่ต้องปรับขนาดยาตามไต' },
    notes: 'ยาในบัญชียาหลัก รูปแบบออกฤทธิ์เนิ่น ห้ามเคี้ยวหรือบดเม็ดยา'
  },
  manidipine: {
    id: 'manidipine',
    name: 'Manidipine',
    brandTH: 'Manyper',
    classGroup: 'CCB',
    subClass: 'DHP-CCB',
    edStatus: 'ยานอกบัญชียาหลัก (Non-ED)',
    onset: '15–45 นาที',
    peak: 'ไม่มีข้อมูล',
    tHalf: '3.94–7.95 ชม.',
    metabolism: 'ตับ ผ่าน CYP3A4',
    excretion: 'อุจจาระ 63%, ปัสสาวะ 31%',
    standardDoses: ['5 mg', '10 mg', '20 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '5–20 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 20 },
    gfrModerate: { doseRange: '5–20 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 20 },
    gfrSevere: { doseRange: '5–20 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 20, note: 'ไม่ต้องปรับขนาดยาตามไต' },
    notes: 'ขยายทั้ง afferent และ efferent renal arteriole ลดความดันในไต เกิดข้อเท้าบวมน้อยกว่า Amlodipine'
  },
  lercanidipine: {
    id: 'lercanidipine',
    name: 'Lercanidipine',
    brandTH: 'Zanidip',
    classGroup: 'CCB',
    subClass: 'DHP-CCB',
    edStatus: 'ยานอกบัญชียาหลัก (Non-ED)',
    onset: 'ไม่มีข้อมูล',
    peak: 'ไม่มีข้อมูล',
    tHalf: '8–10 ชม.',
    metabolism: 'ตับ ผ่าน CYP3A4',
    excretion: 'ปัสสาวะ 50%',
    standardDoses: ['10 mg', '20 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '10–20 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 20 },
    gfrModerate: { doseRange: '10–20 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 20 },
    gfrSevere: { doseRange: '10–20 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 20, note: 'ไม่ต้องปรับขนาดยาตามไต' },
    notes: 'Vascular selective สูงมาก อัตราการเกิดข้อเท้าบวมต่ำมาก'
  },
  nitrendipine: {
    id: 'nitrendipine',
    name: 'Nitrendipine',
    brandTH: 'Baypress',
    classGroup: 'CCB',
    subClass: 'DHP-CCB',
    edStatus: 'ยานอกบัญชียาหลัก',
    onset: 'ไม่มีข้อมูล',
    peak: 'ไม่มีข้อมูล',
    tHalf: '10–22 ชม.',
    metabolism: 'ตับ',
    excretion: 'ปัสสาวะ, อุจจาระ',
    standardDoses: ['10 mg', '20 mg'],
    standardFreqs: ['OD', 'BID'],
    gfrNormal: { doseRange: '10–40 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 40 },
    gfrModerate: { doseRange: '10–40 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 40 },
    gfrSevere: { doseRange: '10–40 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 40 },
    notes: 'Syst-Eur study แสดงผลลด Stroke เด่นชัดในผู้สูงอายุ'
  },
  nifedipine: {
    id: 'nifedipine',
    name: 'Nifedipine (SR / CR)',
    brandTH: 'Adalat CR / Generic SR',
    classGroup: 'CCB',
    subClass: 'DHP-CCB',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (CR/SR)',
    onset: 'ควรหลีกเลี่ยงชนิดออกฤทธิ์สั้น',
    peak: 'ไม่มีข้อมูล',
    tHalf: '2–5 ชม.',
    metabolism: 'ตับ ผ่าน CYP3A4',
    excretion: 'ปัสสาวะ 60–80%, อุจจาระ',
    standardDoses: ['20 mg (SR)', '30 mg (CR)', '60 mg (CR)'],
    standardFreqs: ['OD (CR)', 'BID (SR)'],
    gfrNormal: { doseRange: '30–90 mg/วัน', freq: 'SR: วันละ 2 ครั้ง / CR: วันละ 1 ครั้ง', maxDaily: 90 },
    gfrModerate: { doseRange: '30–90 mg/วัน', freq: 'SR: วันละ 2 ครั้ง / CR: วันละ 1 ครั้ง', maxDaily: 90 },
    gfrSevere: { doseRange: '30–90 mg/วัน', freq: 'SR: วันละ 2 ครั้ง / CR: วันละ 1 ครั้ง', maxDaily: 90, note: 'ไม่ต้องปรับขนาดยาตามไต' },
    notes: 'ห้ามใช้ Short-acting Nifedipine แคปซูลหยดใต้ลิ้นเด็ดขาด! ให้ใช้เฉพาะรูปแบบ SR (วันละ 2 ครั้ง) หรือ CR (วันละ 1 ครั้ง)'
  },

  // -------------------------------------------------------------
  // CCBs - NON-DIHYDROPYRIDINES
  // -------------------------------------------------------------
  verapamil: {
    id: 'verapamil',
    name: 'Verapamil',
    brandTH: 'Isoptin / Isoptin SR',
    classGroup: 'CCB',
    subClass: 'Non-DHP CCB',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED)',
    onset: 'ไม่มีข้อมูล',
    peak: 'ยากินชนิดออกฤทธิ์ทันที 1–2 ชม., ชนิดออกฤทธิ์นาน 3–5 นาที',
    tHalf: 'ยากิน 12 ชม., ยกเว้น 2–5 ชม.',
    metabolism: 'ตับ',
    excretion: 'ปัสสาวะ ~70%, อุจจาระ >16%',
    standardDoses: ['40 mg', '80 mg', '120 mg', '240 mg (SR)'],
    standardFreqs: ['TID (regular)', 'OD (SR)'],
    gfrNormal: { doseRange: '120–480 mg/วัน', freq: 'แบ่งออกทุก 8 ชม. หรือ SR วันละ 1 ครั้ง', maxDaily: 480 },
    gfrModerate: { doseRange: '120–480 mg/วัน', freq: 'แบ่งออกทุก 8 ชม. หรือ SR วันละ 1 ครั้ง', maxDaily: 480 },
    gfrSevere: { doseRange: '120–480 mg/วัน', freq: 'แบ่งออกทุก 8 ชม. หรือ SR วันละ 1 ครั้ง', maxDaily: 480 },
    notes: 'ลดทั้งความดันและอัตราการเต้นหัวใจ ⚠️ ห้ามใช้ร่วมกับ Beta-blocker ในผู้ป่วยที่มีการนำไฟฟ้าหัวใจช้าหรือหัวใจล้มเหลว'
  },
  diltiazem: {
    id: 'diltiazem',
    name: 'Diltiazem',
    brandTH: 'Herbesser / Herbesser R',
    classGroup: 'CCB',
    subClass: 'Non-DHP CCB',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED)',
    onset: 'ยากินชนิดออกฤทธิ์ทันที 30–60 นาที',
    peak: 'ไม่มีข้อมูล',
    tHalf: '3–9 ชม.',
    metabolism: 'ตับ',
    excretion: 'ปัสสาวะ, อุจจาระ',
    standardDoses: ['30 mg', '60 mg', '100 mg (SR)', '200 mg (SR)'],
    standardFreqs: ['TID (regular)', 'OD (SR)'],
    gfrNormal: { doseRange: '120–480 mg/วัน', freq: 'แบ่งออกทุก 6–8 ชม. 3 ครั้ง/วัน หรือ SR วันละ 1 ครั้ง', maxDaily: 480 },
    gfrModerate: { doseRange: '120–480 mg/วัน', freq: 'แบ่งออกทุก 6–8 ชม. 3 ครั้ง/วัน หรือ SR วันละ 1 ครั้ง', maxDaily: 480 },
    gfrSevere: { doseRange: '120–480 mg/วัน', freq: 'แบ่งออกทุก 6–8 ชม. 3 ครั้ง/วัน หรือ SR วันละ 1 ครั้ง', maxDaily: 480 },
    notes: 'ลดความดันและชะลอการเต้นหัวใจ ระวังการใช้ร่วมกับ Beta-blocker'
  },

  // -------------------------------------------------------------
  // BETA-BLOCKERS (BBs)
  // -------------------------------------------------------------
  bisoprolol: {
    id: 'bisoprolol',
    name: 'Bisoprolol',
    brandTH: 'Concor / Generic',
    classGroup: 'BB',
    subClass: 'Beta-1 Selective',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED)',
    onset: '1–2 ชม.',
    peak: 'ไม่มีข้อมูล',
    tHalf: '9–12 ชม. (CrCl < 40: 27–36 ชม.)',
    metabolism: 'ตับ',
    excretion: 'ปัสสาวะ 50% (รูปไม่เปลี่ยนแปลง), อุจจาระ <2%',
    standardDoses: ['2.5 mg', '5 mg', '10 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '2.5–10 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 10 },
    gfrModerate: { doseRange: '1.25–7.5 mg/วัน (ให้ 75%)', freq: 'วันละ 1 ครั้ง', maxDaily: 7.5, note: 'จำกัดขนาดยาไม่เกิน 7.5 mg/วัน' },
    gfrSevere: { doseRange: '1.25–5 mg/วัน (ให้ 50%)', freq: 'วันละ 1 ครั้ง', maxDaily: 5, note: 'จำกัดขนาดยาไม่เกิน 5 mg/วัน' },
    notes: 'Beta-1 selective สูงมาก ใช้ได้ทั้งใน CAD, Heart Failure (HFrEF) และช่วยคุม Heart Rate'
  },
  carvedilol: {
    id: 'carvedilol',
    name: 'Carvedilol',
    brandTH: 'Dilatrend / Generic',
    classGroup: 'BB',
    subClass: 'Non-selective + Alpha-1 blocker',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED)',
    onset: '0.5–1 ชม.',
    peak: '1–2 ชม.',
    tHalf: '7–10 ชม.',
    metabolism: 'ตับ ผ่าน CYP2C9, 2D6, 3A4',
    excretion: 'อุจจาระ, ปัสสาวะ <2%',
    standardDoses: ['3.125 mg', '6.25 mg', '12.5 mg', '25 mg'],
    standardFreqs: ['BID'],
    gfrNormal: { doseRange: '6.25–50 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 50 },
    gfrModerate: { doseRange: '6.25–50 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 50 },
    gfrSevere: { doseRange: '6.25–50 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 50, note: 'ขับทางตับเป็นหลัก ไม่ต้องปรับลดตามไต' },
    notes: 'ปิดกั้นทั้ง Beta และ Alpha-1 ทำให้หลอดเลือดขยายตัว ดีเยี่ยมใน HFrEF และ CAD'
  },
  metoprolol: {
    id: 'metoprolol',
    name: 'Metoprolol (Tartrate / Succinate XL)',
    brandTH: 'Betaloc / Betaloc-ZOK',
    classGroup: 'BB',
    subClass: 'Beta-1 Selective',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (Tartrate: ED, Succinate XL: Non-ED)',
    onset: 'ยากิน ชนิดออกฤทธิ์ทันที 1 ชม.',
    peak: 'ยากิน ชนิดออกฤทธิ์ทันที 1–2 ชม.',
    tHalf: '3–4 ชม.',
    metabolism: 'ตับ ผ่าน CYP2D6',
    excretion: 'ปัสสาวะ 95% (ในรูปเมแทบอไลต์)',
    standardDoses: ['25 mg', '50 mg', '100 mg'],
    standardFreqs: ['OD (Succinate XL)', 'BID (Tartrate)'],
    gfrNormal: { doseRange: '50–400 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 400 },
    gfrModerate: { doseRange: '50–400 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 400 },
    gfrSevere: { doseRange: '50–400 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 400 },
    notes: 'รูปแบบ Succinate XL ออกฤทธิ์นาน ได้รับการรับรองใน Heart Failure (MERIT-HF)'
  },
  nebivolol: {
    id: 'nebivolol',
    name: 'Nebivolol',
    brandTH: 'Nebilet',
    classGroup: 'BB',
    subClass: 'Beta-1 Selective + NO donor',
    edStatus: 'ยานอกบัญชียาหลัก (Non-ED)',
    onset: 'ไม่มีข้อมูล',
    peak: 'ไม่มีข้อมูล',
    tHalf: '12–32 ชม.',
    metabolism: 'ตับ',
    excretion: 'ปัสสาวะ 38–67%, อุจจาระ 13–44%',
    standardDoses: ['2.5 mg', '5 mg', '10 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '5–40 mg/วัน (ไทยใช้ 5–10 mg)', freq: 'วันละ 1 ครั้ง', maxDaily: 10 },
    gfrModerate: { doseRange: '5–40 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 10 },
    gfrSevere: { doseRange: '5–40 mg/วัน (เริ่ม 2.5 mg)', freq: 'วันละ 1 ครั้ง', maxDaily: 10, note: 'เริ่ม 2.5 mg OD ในไตวายรุนแรง' },
    notes: 'Beta-1 selective สูงสุด + กระตุ้น Nitric Oxide ขยายหลอดเลือดและส่งผลต่อสมรรถภาพทางเพศน้อย'
  },
  atenolol: {
    id: 'atenolol',
    name: 'Atenolol',
    brandTH: 'Tenormin / Generic',
    classGroup: 'BB',
    subClass: 'Beta-1 Selective (Hydrophilic)',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED)',
    onset: '≤1 ชม.',
    peak: '2–4 ชม.',
    tHalf: '6–7 ชม. (ไตวายระยะสุดท้าย 15–35 ชม.)',
    metabolism: 'ตับ',
    excretion: 'ปัสสาวะ 50%, อุจจาระ 50%',
    standardDoses: ['25 mg', '50 mg', '100 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '25–100 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 100 },
    gfrModerate: { doseRange: '25–50 mg/วัน', freq: 'วันละ 1 ครั้ง', maxDaily: 50, note: 'จำกัดไม่เกิน 50 mg/วัน' },
    gfrSevere: { doseRange: '25 mg/วัน (หรือวันเว้นวัน)', freq: 'วันละ 1 ครั้ง', maxDaily: 25, note: 'จำกัดไม่เกิน 25 mg/วัน' },
    notes: 'ขับออกทางไตสูง ไม่แนะนำเป็นยาตัวแรกใน HT เนื่องจากป้องกัน Stroke ได้ด้อยกว่ากลุ่มอื่น'
  },
  propranolol: {
    id: 'propranolol',
    name: 'Propranolol',
    brandTH: 'Inderal / Generic',
    classGroup: 'BB',
    subClass: 'Non-selective',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED)',
    onset: 'ไม่มีข้อมูล',
    peak: 'ไม่มีข้อมูล',
    tHalf: '3–6 ชม.',
    metabolism: 'ตับ',
    excretion: 'ปัสสาวะ',
    standardDoses: ['10 mg', '40 mg'],
    standardFreqs: ['BID', 'TID'],
    gfrNormal: { doseRange: '40–480 mg/วัน', freq: 'วันละ 2–3 ครั้ง', maxDaily: 480 },
    gfrModerate: { doseRange: '40–480 mg/วัน', freq: 'วันละ 2–3 ครั้ง', maxDaily: 480 },
    gfrSevere: { doseRange: '40–480 mg/วัน', freq: 'วันละ 2–3 ครั้ง', maxDaily: 480 },
    notes: 'ยาเก่า เหมาะสำหรับลด sympathetic tone, ไทรอยด์เป็นพิษ, หรือป้องกันไมเกรน'
  },

  // -------------------------------------------------------------
  // ALPHA-1 BLOCKERS
  // -------------------------------------------------------------
  doxazosin: {
    id: 'doxazosin',
    name: 'Doxazosin',
    brandTH: 'Cardura / Cardura XL',
    classGroup: 'Alpha-blocker',
    subClass: 'Alpha-1 blocker',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED บัญชีย่อย)',
    onset: 'ไม่มีข้อมูล',
    peak: 'ไม่มีข้อมูล',
    tHalf: '22 ชม.',
    metabolism: 'ตับ ผ่าน CYP3A4, 2D6, 2C9',
    excretion: 'อุจจาระ 63%, ปัสสาวะ 9%',
    standardDoses: ['1 mg', '2 mg', '4 mg', '8 mg'],
    standardFreqs: ['OD'],
    gfrNormal: { doseRange: '1–16 mg/วัน', freq: 'วันละ 1 ครั้ง ก่อนนอน', maxDaily: 16 },
    gfrModerate: { doseRange: '1–16 mg/วัน', freq: 'วันละ 1 ครั้ง ก่อนนอน', maxDaily: 16 },
    gfrSevere: { doseRange: '1–16 mg/วัน', freq: 'วันละ 1 ครั้ง ก่อนนอน', maxDaily: 16, note: 'ไม่ต้องปรับขนาดยาตามไต' },
    notes: 'ยาทางเลือกตัวที่ 4 ในความดันดื้อยา หรือผู้ป่วยชายที่มีต่อมลูกหมากโต (BPH) ระวังความดันตกท่ายืน'
  },
  prazosin: {
    id: 'prazosin',
    name: 'Prazosin',
    brandTH: 'Minipress',
    classGroup: 'Alpha-blocker',
    subClass: 'Alpha-1 blocker',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED)',
    onset: '2 ชม.',
    peak: '2–4 ชม.',
    tHalf: '2–3 ชม.',
    metabolism: 'ไม่มีข้อมูล',
    excretion: 'อุจจาระ, ปัสสาวะ 6–10%',
    standardDoses: ['1 mg', '2 mg', '5 mg'],
    standardFreqs: ['BID', 'TID'],
    gfrNormal: { doseRange: '1–20 mg/วัน', freq: 'วันละ 2–3 ครั้ง', maxDaily: 20 },
    gfrModerate: { doseRange: '1–20 mg/วัน', freq: 'วันละ 2–3 ครั้ง', maxDaily: 20 },
    gfrSevere: { doseRange: '1–20 mg/วัน', freq: 'วันละ 2–3 ครั้ง', maxDaily: 20 },
    notes: 'ระวัง First-dose syncope ควรเริ่มขนาดต่ำก่อนนอน'
  },
  terazosin: {
    id: 'terazosin',
    name: 'Terazosin',
    brandTH: 'Hytrin',
    classGroup: 'Alpha-blocker',
    subClass: 'Alpha-1 blocker',
    edStatus: 'ยานอกบัญชียาหลัก',
    onset: '15 นาที',
    peak: '2–3 ชม.',
    tHalf: '12 ชม.',
    metabolism: 'ตับ',
    excretion: 'อุจจาระ 60%, ปัสสาวะ 40%',
    standardDoses: ['1 mg', '2 mg', '5 mg'],
    standardFreqs: ['OD', 'BID'],
    gfrNormal: { doseRange: '1–20 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 20 },
    gfrModerate: { doseRange: '1–20 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 20 },
    gfrSevere: { doseRange: '1–20 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 20 },
    notes: 'ใช้คุมความดันและลดอาการต่อมลูกหมากโต'
  },

  // -------------------------------------------------------------
  // CENTRAL-ACTING ALPHA-2 AGONISTS
  // -------------------------------------------------------------
  methyldopa: {
    id: 'methyldopa',
    name: 'Methyldopa',
    brandTH: 'Aldomet',
    classGroup: 'Central-acting',
    subClass: 'Alpha-2 agonist',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED)',
    onset: 'ไม่มีข้อมูล',
    peak: 'กินยาครั้งเดียว 3–6 ชม.',
    tHalf: '1.5–2 ชม. (ไตวายระยะสุดท้าย 48–72 ชม.)',
    metabolism: 'ลำไส้, ตับ',
    excretion: 'ปัสสาวะ 70%',
    standardDoses: ['250 mg', '500 mg'],
    standardFreqs: ['BID', 'TID'],
    gfrNormal: { doseRange: '250–3000 mg/วัน', freq: 'วันละ 2–3 ครั้ง', maxDaily: 3000 },
    gfrModerate: { doseRange: '250–3000 mg/วัน', freq: 'วันละ 2–3 ครั้ง', maxDaily: 3000 },
    gfrSevere: { doseRange: '250–3000 mg/วัน', freq: 'วันละ 1–2 ครั้ง', maxDaily: 1500, note: 'แบ่งให้วันละ 1–2 ครั้ง (เสี่ยงยาคั่ง)' },
    notes: 'ยาทางเลือกอันดับ 1 สำหรับรักษาความดันโลหิตสูงในสตรีมีครรภ์ มีความปลอดภัยสูงต่อทารก'
  },

  // -------------------------------------------------------------
  // DIRECT VASODILATORS
  // -------------------------------------------------------------
  hydralazine: {
    id: 'hydralazine',
    name: 'Hydralazine',
    brandTH: 'Apresoline / Generic',
    classGroup: 'Direct Vasodilator',
    subClass: 'Arteriolar vasodilator',
    edStatus: 'ยาในบัญชียาหลักแห่งชาติ (ED)',
    onset: '10–80 นาที',
    peak: 'ไม่มีข้อมูล',
    tHalf: '3–7 ชม.',
    metabolism: 'ตับ',
    excretion: 'ปัสสาวะ',
    standardDoses: ['25 mg', '50 mg'],
    standardFreqs: ['BID', 'TID', 'QID'],
    gfrNormal: { doseRange: '25–300 mg/วัน (แบ่งกิน 3–4 ครั้ง)', freq: 'วันละ 3–4 ครั้ง', maxDaily: 300 },
    gfrModerate: { doseRange: '25–300 mg/วัน (แบ่งกิน 3–4 ครั้ง)', freq: 'วันละ 3–4 ครั้ง', maxDaily: 300 },
    gfrSevere: { doseRange: '25–300 mg ทุก 8–16 ชม.', freq: 'ทุก 8–16 ชม.', maxDaily: 150, note: 'ขยายช่วงเวลาให้ยาเป็นทุก 8–16 ชม.' },
    notes: 'ปลอดภัยในสตรีมีครรภ์และไตวาย มักต้องให้ร่วมกับ Beta-blocker เพื่อลด Reflex Tachycardia'
  },
  minoxidil: {
    id: 'minoxidil',
    name: 'Minoxidil',
    brandTH: 'Loniten',
    classGroup: 'Direct Vasodilator',
    subClass: 'Potent vasodilator',
    edStatus: 'ยานอกบัญชียาหลัก',
    onset: '30 นาที',
    peak: '2–3 ชม.',
    tHalf: '3.5–4.2 ชม.',
    metabolism: 'ตับ',
    excretion: 'ปัสสาวะ 12%',
    standardDoses: ['2.5 mg', '5 mg', '10 mg'],
    standardFreqs: ['OD', 'BID'],
    gfrNormal: { doseRange: '5–100 mg/วัน', freq: 'วันละ 1–3 ครั้ง', maxDaily: 100 },
    gfrModerate: { doseRange: '5–100 mg/วัน', freq: 'วันละ 1–3 ครั้ง', maxDaily: 100 },
    gfrSevere: { doseRange: '5–100 mg/วัน', freq: 'วันละ 1–3 ครั้ง', maxDaily: 100 },
    notes: 'ยาลดความดันที่ทรงพลังมาก สงวนไว้สำหรับ Severe Refractory HT ทำให้บวมน้ำและขนดก (Hypertrichosis)'
  }
};

// Aliases for alternative keys
THAI_HT_DRUGS['hydrochlorothiazide'] = THAI_HT_DRUGS['hctz'];
THAI_HT_DRUGS['spiro'] = THAI_HT_DRUGS['spironolactone'];
THAI_HT_DRUGS['metoprolol_succinate'] = THAI_HT_DRUGS['metoprolol'];
THAI_HT_DRUGS['metoprolol_tartrate'] = THAI_HT_DRUGS['metoprolol'];

// =========================================================================
// 2. THAI SINGLE-PILL COMBINATIONS (SPC) DATABASE
// =========================================================================

// Complete Catalog of All 13 Thai SPC Combinations
const ALL_SPCS = {
  spc_twynsta: {
    id: 'spc_twynsta',
    brand: 'Twynsta',
    name: 'Twynsta (Telmisartan + Amlodipine)',
    generic: 'Telmisartan / Amlodipine',
    strengths: ['40/5 mg', '40/10 mg', '80/5 mg', '80/10 mg'],
    classes: ['RAS', 'CCB'],
    edStatus: 'ยานอกบัญชี (Non-ED)'
  },
  spc_exforge: {
    id: 'spc_exforge',
    brand: 'Exforge',
    name: 'Exforge (Valsartan + Amlodipine)',
    generic: 'Valsartan / Amlodipine',
    strengths: ['80/5 mg', '160/5 mg', '160/10 mg'],
    classes: ['RAS', 'CCB'],
    edStatus: 'ยานอกบัญชี (Non-ED)'
  },
  spc_sevikar: {
    id: 'spc_sevikar',
    brand: 'Sevikar',
    name: 'Sevikar (Olmesartan + Amlodipine)',
    generic: 'Olmesartan / Amlodipine',
    strengths: ['20/5 mg', '40/5 mg', '40/10 mg'],
    classes: ['RAS', 'CCB'],
    edStatus: 'ยานอกบัญชี (Non-ED)'
  },
  spc_amlozar: {
    id: 'spc_amlozar',
    brand: 'Amlozar',
    name: 'Amlozar (Losartan + Amlodipine)',
    generic: 'Losartan / Amlodipine',
    strengths: ['50/5 mg', '100/5 mg'],
    classes: ['RAS', 'CCB'],
    edStatus: 'ยานอกบัญชี/โรงพยาบาลรัฐ'
  },
  spc_coveram: {
    id: 'spc_coveram',
    brand: 'Coveram',
    name: 'Coveram (Perindopril + Amlodipine)',
    generic: 'Perindopril / Amlodipine',
    strengths: ['5/5 mg', '5/10 mg', '10/5 mg', '10/10 mg'],
    classes: ['RAS', 'CCB'],
    edStatus: 'ยานอกบัญชี (Non-ED)'
  },
  spc_viacoram: {
    id: 'spc_viacoram',
    brand: 'Viacoram',
    name: 'Viacoram (Perindopril + Amlodipine)',
    generic: 'Perindopril / Amlodipine',
    strengths: ['3.5/2.5 mg', '7/5 mg'],
    classes: ['RAS', 'CCB'],
    edStatus: 'ยานอกบัญชี (Low-dose initiation)'
  },
  spc_hyzaar: {
    id: 'spc_hyzaar',
    brand: 'Hyzaar',
    name: 'Hyzaar (Losartan + HCTZ)',
    generic: 'Losartan / Hydrochlorothiazide',
    strengths: ['50/12.5 mg', '100/25 mg'],
    classes: ['RAS', 'Diuretic'],
    edStatus: 'ในบัญชียาหลัก/เบิกได้ในหลายสิทธิ'
  },
  spc_micardisplus: {
    id: 'spc_micardisplus',
    brand: 'MicardisPlus',
    name: 'MicardisPlus (Telmisartan + HCTZ)',
    generic: 'Telmisartan / Hydrochlorothiazide',
    strengths: ['40/12.5 mg', '80/12.5 mg', '80/25 mg'],
    classes: ['RAS', 'Diuretic'],
    edStatus: 'ยานอกบัญชี (Non-ED)'
  },
  spc_codiovan: {
    id: 'spc_codiovan',
    brand: 'Co-Diovan',
    name: 'Co-Diovan (Valsartan + HCTZ)',
    generic: 'Valsartan / Hydrochlorothiazide',
    strengths: ['80/12.5 mg', '160/12.5 mg', '160/25 mg'],
    classes: ['RAS', 'Diuretic'],
    edStatus: 'ยานอกบัญชี (Non-ED)'
  },
  spc_coversylplus: {
    id: 'spc_coversylplus',
    brand: 'Coversyl Plus',
    name: 'Coversyl Plus (Perindopril + Indapamide)',
    generic: 'Perindopril / Indapamide',
    strengths: ['2.5/0.625 mg', '5/1.25 mg', '10/2.5 mg'],
    classes: ['RAS', 'Diuretic'],
    edStatus: 'ยานอกบัญชี (Non-ED)'
  },
  spc_triplixam: {
    id: 'spc_triplixam',
    brand: 'Triplixam',
    name: 'Triplixam (Perindopril + Indapamide + Amlodipine)',
    generic: 'Perindopril / Indapamide / Amlodipine',
    strengths: ['5/1.25/5 mg', '5/1.25/10 mg', '10/2.5/5 mg', '10/2.5/10 mg'],
    classes: ['RAS', 'Diuretic', 'CCB'],
    edStatus: 'ยานอกบัญชี (Triple SPC)'
  },
  spc_exforgehct: {
    id: 'spc_exforgehct',
    brand: 'Exforge HCT',
    name: 'Exforge HCT (Valsartan + Amlodipine + HCTZ)',
    generic: 'Valsartan / Amlodipine / Hydrochlorothiazide',
    strengths: ['160/5/12.5 mg', '160/10/12.5 mg', '160/10/25 mg'],
    classes: ['RAS', 'Diuretic', 'CCB'],
    edStatus: 'ยานอกบัญชี (Non-ED)'
  },
  spc_sevikarhct: {
    id: 'spc_sevikarhct',
    brand: 'Sevikar HCT',
    name: 'Sevikar HCT (Olmesartan + Amlodipine + HCTZ)',
    generic: 'Olmesartan / Amlodipine / Hydrochlorothiazide',
    strengths: ['20/5/12.5 mg', '40/5/12.5 mg', '40/10/12.5 mg', '40/10/25 mg'],
    classes: ['RAS', 'Diuretic', 'CCB'],
    edStatus: 'ยานอกบัญชี (Non-ED)'
  }
};

function findSPCInCatalog(idOrBrand) {
  if (!idOrBrand) return null;
  const raw = String(idOrBrand).trim().toLowerCase();
  if (ALL_SPCS[raw]) return ALL_SPCS[raw];
  const cleaned = raw.replace(/^spc_/, '').replace(/[^a-z0-9]/g, '');
  for (const k in ALL_SPCS) {
    const spc = ALL_SPCS[k];
    const kClean = k.replace(/^spc_/, '').replace(/[^a-z0-9]/g, '');
    const bClean = spc.brand.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (kClean === cleaned || bClean === cleaned || spc.brand.toLowerCase().startsWith(cleaned)) {
      return spc;
    }
  }
  return null;
}

const SPC_DATABASE = [
  // Dual: ARB + CCB
  {
    classes: 'ARB + CCB',
    thaiCategory: 'ARB ผสม CCB (ตัวเลือกยอดนิยมอันดับ 1 ในไทย)',
    items: [
      { brand: 'Twynsta', generic: 'Telmisartan / Amlodipine', strengths: ['40/5 mg', '40/10 mg', '80/5 mg', '80/10 mg'], edStatus: 'ยานอกบัญชี (Non-ED)' },
      { brand: 'Exforge', generic: 'Valsartan / Amlodipine', strengths: ['80/5 mg', '160/5 mg', '160/10 mg'], edStatus: 'ยานอกบัญชี (Non-ED)' },
      { brand: 'Sevikar', generic: 'Olmesartan / Amlodipine', strengths: ['20/5 mg', '40/5 mg', '40/10 mg'], edStatus: 'ยานอกบัญชี (Non-ED)' },
      { brand: 'Amlozar', generic: 'Losartan / Amlodipine', strengths: ['50/5 mg', '100/5 mg'], edStatus: 'ยานอกบัญชี/โรงพยาบาลรัฐ' }
    ]
  },
  // Dual: ACEI + CCB
  {
    classes: 'ACEI + CCB',
    thaiCategory: 'ACEI ผสม CCB (ลดหลอดเลือดสมองและปกป้องไต)',
    items: [
      { brand: 'Coveram', generic: 'Perindopril / Amlodipine', strengths: ['5/5 mg', '5/10 mg', '10/5 mg', '10/10 mg'], edStatus: 'ยานอกบัญชี (Non-ED)' },
      { brand: 'Viacoram', generic: 'Perindopril / Amlodipine', strengths: ['3.5/2.5 mg', '7/5 mg'], edStatus: 'ยานอกบัญชี (Low-dose initiation)' }
    ]
  },
  // Dual: ARB + Thiazide
  {
    classes: 'ARB + Thiazide',
    thaiCategory: 'ARB ผสม Thiazide (เหมาะกับคนสูงอายุหรือความดันเค็มเกิน)',
    items: [
      { brand: 'Hyzaar', generic: 'Losartan / Hydrochlorothiazide', strengths: ['50/12.5 mg', '100/25 mg'], edStatus: 'ในบัญชียาหลัก/เบิกได้ในหลายสิทธิ' },
      { brand: 'MicardisPlus', generic: 'Telmisartan / Hydrochlorothiazide', strengths: ['40/12.5 mg', '80/12.5 mg', '80/25 mg'], edStatus: 'ยานอกบัญชี (Non-ED)' },
      { brand: 'Co-Diovan', generic: 'Valsartan / Hydrochlorothiazide', strengths: ['80/12.5 mg', '160/12.5 mg', '160/25 mg'], edStatus: 'ยานอกบัญชี (Non-ED)' }
    ]
  },
  // Dual: ACEI + Thiazide-like
  {
    classes: 'ACEI + Thiazide-like',
    thaiCategory: 'ACEI ผสม Indapamide (ผลงานวิจัยลด Stroke สูง)',
    items: [
      { brand: 'Coversyl Plus', generic: 'Perindopril / Indapamide', strengths: ['2.5/0.625 mg', '5/1.25 mg', '10/2.5 mg'], edStatus: 'ยานอกบัญชี (Non-ED)' }
    ]
  },
  // Triple: RAS + CCB + Diuretic
  {
    classes: 'Triple SPC (RAS blocker + CCB + Diuretic)',
    thaiCategory: 'ยาผสม 3 ชนิดในเม็ดเดียว (Triple Single-Pill Combination)',
    items: [
      { brand: 'Triplixam', generic: 'Perindopril / Indapamide / Amlodipine', strengths: ['5/1.25/5 mg', '5/1.25/10 mg', '10/2.5/5 mg', '10/2.5/10 mg'], edStatus: 'ยานอกบัญชี (Triple SPC)' },
      { brand: 'Exforge HCT', generic: 'Valsartan / Amlodipine / Hydrochlorothiazide', strengths: ['160/5/12.5 mg', '160/10/12.5 mg', '160/10/25 mg'], edStatus: 'ยานอกบัญชี (Non-ED)' },
      { brand: 'Sevikar HCT', generic: 'Olmesartan / Amlodipine / Hydrochlorothiazide', strengths: ['20/5/12.5 mg', '40/5/12.5 mg', '40/10/12.5 mg', '40/10/25 mg'], edStatus: 'ยานอกบัญชี (Non-ED)' }
    ]
  }
];

// Popular Thai SPC Preset Map for Quick Selection
const POPULAR_SPCS = {
  twynsta_40_5: { name: 'Twynsta 40/5 mg OD', brand: 'Twynsta', generic: 'Telmisartan 40 mg + Amlodipine 5 mg', classes: ['RAS', 'CCB'], dose: '40/5 mg OD' },
  twynsta_80_5: { name: 'Twynsta 80/5 mg OD', brand: 'Twynsta', generic: 'Telmisartan 80 mg + Amlodipine 5 mg', classes: ['RAS', 'CCB'], dose: '80/5 mg OD' },
  twynsta_80_10: { name: 'Twynsta 80/10 mg OD', brand: 'Twynsta', generic: 'Telmisartan 80 mg + Amlodipine 10 mg', classes: ['RAS', 'CCB'], dose: '80/10 mg OD' },
  coveram_5_5: { name: 'Coveram 5/5 mg OD', brand: 'Coveram', generic: 'Perindopril 5 mg + Amlodipine 5 mg', classes: ['RAS', 'CCB'], dose: '5/5 mg OD' },
  coveram_10_5: { name: 'Coveram 10/5 mg OD', brand: 'Coveram', generic: 'Perindopril 10 mg + Amlodipine 5 mg', classes: ['RAS', 'CCB'], dose: '10/5 mg OD' },
  hyzaar_50_125: { name: 'Hyzaar 50/12.5 mg OD', brand: 'Hyzaar', generic: 'Losartan 50 mg + HCTZ 12.5 mg', classes: ['RAS', 'Diuretic'], dose: '50/12.5 mg OD' },
  hyzaar_100_25: { name: 'Hyzaar 100/25 mg OD', brand: 'Hyzaar', generic: 'Losartan 100 mg + HCTZ 25 mg', classes: ['RAS', 'Diuretic'], dose: '100/25 mg OD' },
  coversyl_plus: { name: 'Coversyl Plus 5/1.25 mg OD', brand: 'Coversyl Plus', generic: 'Perindopril 5 mg + Indapamide 1.25 mg', classes: ['RAS', 'Diuretic'], dose: '5/1.25 mg OD' },
  triplixam_5_125_5: { name: 'Triplixam 5/1.25/5 mg OD', brand: 'Triplixam', generic: 'Perindopril 5 + Indapamide 1.25 + Amlodipine 5 mg', classes: ['RAS', 'Diuretic', 'CCB'], dose: '5/1.25/5 mg OD' },
  triplixam_10_25_10: { name: 'Triplixam 10/2.5/10 mg OD', brand: 'Triplixam', generic: 'Perindopril 10 + Indapamide 2.5 + Amlodipine 10 mg', classes: ['RAS', 'Diuretic', 'CCB'], dose: '10/2.5/10 mg OD' }
};

// =========================================================================
// 3. GFR RENAL DOSE CHECKER HELPER
// =========================================================================

function findDrugInCatalog(idOrName) {
  if (!idOrName) return null;
  const key = String(idOrName).toLowerCase().trim();
  if (THAI_HT_DRUGS[key]) return THAI_HT_DRUGS[key];
  for (const k in THAI_HT_DRUGS) {
    const d = THAI_HT_DRUGS[k];
    if (d.id.toLowerCase() === key || d.name.toLowerCase() === key || d.name.toLowerCase().startsWith(key) || key.startsWith(d.id.toLowerCase())) {
      return d;
    }
  }
  return null;
}

function checkGFRDosing(drugId, doseMg, egfr) {
  const drug = findDrugInCatalog(drugId);
  if (!drug || !egfr || isNaN(egfr)) return { status: 'normal', text: '' };

  if (egfr < 10) {
    if (drug.gfrSevere.status === 'avoid') {
      return {
        status: 'danger',
        level: 'avoid',
        text: `🚨 หลีกเลี่ยงการใช้ ${drug.name} เมื่อ eGFR < 10 mL/min (${drug.gfrSevere.note || 'เสี่ยงอันตราย'})`,
        guidance: drug.gfrSevere.doseRange
      };
    }
    if (drug.gfrSevere.status === 'ineffective') {
      return {
        status: 'warning',
        level: 'ineffective',
        text: `⚠️ ${drug.name} มีประสิทธิภาพลดลงมากเมื่อไตวายรุนแรง (eGFR < 10)`,
        guidance: drug.gfrSevere.doseRange
      };
    }
    return {
      status: 'warning',
      level: 'adjusted',
      text: `⚠️ ไตวายรุนแรง (eGFR < 10): แนะนำปรับขนาดยา ${drug.name} เป็น ${drug.gfrSevere.doseRange}`,
      guidance: drug.gfrSevere.doseRange
    };
  } else if (egfr <= 50) {
    if (drug.gfrModerate.note) {
      return {
        status: 'info',
        level: 'moderate_adjust',
        text: `ℹ️ ไตเสื่อมปานกลาง (eGFR 10–50): แนะนำปรับขนาดยา ${drug.name} เป็น ${drug.gfrModerate.doseRange} (${drug.gfrModerate.note})`,
        guidance: drug.gfrModerate.doseRange
      };
    }
  }

  return { status: 'normal', text: 'ขนาดยาปกติ ไม่ต้องปรับลดตามไต' };
}

// =========================================================================
// 4. CURRENT MEDICATION REGIMEN ANALYZER
// =========================================================================

function analyzeCurrentMedications(currentMedsList, patient) {
  const list = currentMedsList || [];
  const classesSet = new Set();
  const alerts = [];
  let hasACEI = false;
  let hasARB = false;
  let hasNonDHP = false;
  let hasBB = false;
  let hasDiuretic = false;
  let hasCCB = false;
  let hasMRA = false;

  list.forEach(med => {
    // Handle SPC
    if (med.isSPC || (med.id && String(med.id).startsWith('spc_')) || (med.brand && findSPCInCatalog(med.brand))) {
      const spc = findSPCInCatalog(med.id || med.brand);
      const classes = med.classes || (spc ? spc.classes : []);
      classes.forEach(c => classesSet.add(c));
      const generic = (med.generic || (spc ? spc.generic : '') || '').toLowerCase();
      if (classes.includes('RAS')) {
        if (generic.includes('perindopril') || generic.includes('enalapril') || generic.includes('ramipril') || generic.includes('lisinopril')) {
          hasACEI = true;
        } else {
          hasARB = true;
        }
      }
      if (classes.includes('CCB')) hasCCB = true;
      if (classes.includes('Diuretic')) hasDiuretic = true;
    } else {
      const drug = findDrugInCatalog(med.id || med.name);
      if (drug) {
        classesSet.add(drug.classGroup);
        if (drug.subClass === 'ACEI') hasACEI = true;
        if (drug.subClass === 'ARB') hasARB = true;
        if (drug.subClass === 'Non-DHP CCB') hasNonDHP = true;
        if (drug.classGroup === 'BB') hasBB = true;
        if (drug.classGroup === 'Diuretic') hasDiuretic = true;
        if (drug.classGroup === 'CCB') hasCCB = true;
        if (drug.classGroup === 'MRA') hasMRA = true;

        // Check Renal dose adjustment for this drug
        if (patient.egfr) {
          const gfrCheck = checkGFRDosing(med.id, parseFloat(med.dose) || 0, patient.egfr);
          if (gfrCheck.status === 'danger' || gfrCheck.status === 'warning') {
            alerts.push({
              level: gfrCheck.status,
              title: `การปรับยาตามไต: ${drug.name}`,
              desc: gfrCheck.text
            });
          }
        }
      }
    }
  });

  // 1. Harmful Interaction: Dual RAS Blockade (ACEI + ARB)
  if (hasACEI && hasARB) {
    alerts.push({
      level: 'danger',
      title: '🚨 ข้อห้ามใช้อันตราย: Dual RAS Blockade (ใช้ ACEI ร่วมกับ ARB)',
      desc: 'แนวทางเวชปฏิบัติทุกฉบับ (Thai HT 2567, ESC 2024, AHA/ACC 2025) สั่งห้ามใช้ ACEI ร่วมกับ ARB พร้อมกันโดยเด็ดขาด เนื่องจากเพิ่มความเสี่ยงต่อไตวายเฉียบพลัน (Acute Kidney Injury) ภาวะโพแทสเซียมสูงรุนแรง และความดันตก โดยไม่ช่วยลดอัตราการเสียชีวิตหรือโรคหัวใจ แนะนำให้หยุดยาตัวใดตัวหนึ่งทันที!'
    });
  }

  // 2. Caution: Non-DHP CCB + Beta-blocker
  if (hasNonDHP && hasBB) {
    alerts.push({
      level: 'warning',
      title: '⚠️ ข้อควรระวัง: การใช้ Non-DHP CCB (Verapamil/Diltiazem) ร่วมกับ Beta-blocker',
      desc: 'ยาทั้งสองกลุ่มออกฤทธิ์กดการนำไฟฟ้าที่ AV node และชะลอการบีบตัวของหัวใจ เสี่ยงต่อภาวะหัวใจเต้นช้ามาก (Severe Bradycardia) หรือหัวใจหยุดเต้น (Heart Block) ควรติดตามคลื่นไฟฟ้าหัวใจและอัตราการเต้นของหัวใจอย่างใกล้ชิด'
    });
  }

  // 3. Ineffective Diuretic at low eGFR
  if (hasDiuretic && patient.egfr && patient.egfr < 30) {
    const takesLoop = list.some(m => m.id === 'furosemide');
    if (!takesLoop) {
      alerts.push({
        level: 'warning',
        title: '⚠️ ประสิทธิภาพยาขับปัสสาวะในภาวะไตเสื่อม (eGFR < 30 mL/min)',
        desc: 'ยาขับปัสสาวะกลุ่ม Thiazide หรือ Thiazide-like มีประสิทธิภาพลดลงอย่างมากเมื่อ eGFR < 30 mL/min แนะนำพิจารณาเปลี่ยนเป็นยากลุ่ม Loop Diuretic (Furosemide 20–80 mg/วัน) เพื่อการควบคุมความดันและลดการคั่งของน้ำในร่างกายที่มีประสิทธิภาพ'
      });
    }
  }

  const distinctClasses = Array.from(classesSet);
  const classCount = distinctClasses.length;

  // Determine Core Triad (RAS + CCB + Diuretic)
  const hasCoreTriad = (classesSet.has('RAS') || (hasACEI || hasARB)) && hasCCB && hasDiuretic;

  return {
    medsList: list,
    classCount,
    distinctClasses,
    hasCoreTriad,
    hasACEI,
    hasARB,
    hasCCB,
    hasDiuretic,
    hasBB,
    hasMRA,
    alerts
  };
}

// =========================================================================
// 5. MASTER PHARMACOTHERAPY DECISION ENGINE
// =========================================================================

function generateMedicationPlan(patient, stagingThai, stagingESC, stagingACC, riskEval, activeGuideline) {
  const guide = activeGuideline || 'thai'; // 'thai', 'aha', 'esc'
  const p = patient;
  const sbp = p.sbp || 120;
  const dbp = p.dbp || 80;
  const age = p.age || 50;
  const frailty = p.frailty || 0;
  const kLevel = p.kLevel || null;
  const egfr = p.egfr || null;
  const uacr = p.uacr || null;
  const isPregnant = p.isPregnant || 0;

  // Comorbidities
  const dm = p.dm || 0;
  const cad = p.cad || 0;
  const hf = p.hf || 0;
  const stroke = p.stroke || 0;
  const af = p.af || 0;
  const ckd = (egfr && egfr < 60) || (uacr && uacr >= 30);

  // Analyze Current Medications
  const currentMedAnalysis = analyzeCurrentMedications(p.currentMedsList, p);
  const { classCount, hasCoreTriad } = currentMedAnalysis;

  const alerts = [...currentMedAnalysis.alerts];
  const compIndications = [];
  let drugChoices = [];
  let spcOptions = [];
  let strategyTitle = '';
  let strategy = '';
  let resistantHtDetected = false;
  let targetBPText = '';
  let targetRationale = '';

  // -------------------------------------------------------------------------
  // Guideline-Specific Target BP Setup
  // -------------------------------------------------------------------------
  let targetSbpMax = 130;
  let targetDbpMax = 80;

  if (guide === 'thai') {
    if (age > 65 || frailty) {
      targetBPText = '130–139 / 70–79 mmHg';
      targetSbpMax = 139;
      targetDbpMax = 79;
      targetRationale = 'ผู้สูงอายุ > 65 ปี หรือมีภาวะเปราะบาง: คุม SBP 130–139 mmHg เพื่อความปลอดภัย ป้องกันความดันตกท่ายืนและการหกล้ม';
    } else if (ckd && (!uacr || uacr < 300)) {
      targetBPText = '130–139 / 70–79 mmHg';
      targetSbpMax = 139;
      targetDbpMax = 79;
      targetRationale = 'ผู้ป่วยโรคไตเรื้อรังที่ไม่มีโปรตีนรั่วรุนแรง: คุม 130–139 mmHg เพื่อรักษา Renal Perfusion';
    } else {
      targetBPText = '120–130 / 70–80 mmHg';
      targetSbpMax = 130;
      targetDbpMax = 80;
      targetRationale = 'ผู้ป่วยอายุ 18–65 ปีทั่วไป, เบาหวาน, หรือมีโรคหลอดเลือดหัวใจ: คุมเข้มงวด 120–130 mmHg เพื่อลดโอกาสเกิด Stroke และ CV events สูงสุด';
    }
  } else if (guide === 'esc') {
    if (age >= 85 || frailty) {
      targetBPText = '< 140/80 mmHg (หรือตามที่ผู้ป่วยทนได้)';
      targetSbpMax = 139;
      targetDbpMax = 79;
      targetRationale = 'ESC 2024: ผู้ป่วยสูงอายุมากหรือเปราะบาง คุม < 140/80 mmHg โดยเน้นความปลอดภัยและคุณภาพชีวิต';
    } else {
      targetBPText = '120–129 / 70–79 mmHg (if tolerated)';
      targetSbpMax = 129;
      targetDbpMax = 79;
      targetRationale = 'ESC 2024 New Concept: แนะนำเป้าหมาย SBP 120–129 mmHg สำหรับผู้ป่วยส่วนใหญ่หากทนยาได้ดี เพื่อลดอัตราเสียชีวิตจาก CV';
    }
  } else {
    // AHA/ACC 2025
    targetBPText = '< 130/80 mmHg';
    targetSbpMax = 129;
    targetDbpMax = 79;
    targetRationale = 'AHA/ACC 2025: กำหนดเป้าหมายความดันระดับเดียว < 130/80 mmHg สำหรับผู้ใหญ่ทุกกลุ่มที่มีข้อบ่งชี้ในการรักษา';
  }

  // Check if BP is currently controlled to target
  const isBPControlled = (sbp <= targetSbpMax && dbp <= targetDbpMax);

  // -------------------------------------------------------------------------
  // SPECIAL POPULATION: PREGNANCY
  // -------------------------------------------------------------------------
  if (isPregnant) {
    strategyTitle = '🚨 แผนการรักษาความดันโลหิตสูงในสตรีตั้งครรภ์ (Hypertension in Pregnancy)';
    strategy = 'ห้ามใช้ยากลุ่ม ACEI, ARB และ MRA โดยเด็ดขาดเนื่องจากเป็น Teratogenic ต่อทารกในครรภ์ ยาที่ปลอดภัยและแนะนำให้ใช้ ได้แก่ Methyldopa, Labetalol, Nifedipine (SR/CR) หรือ Hydralazine';
    alerts.push({
      level: 'danger',
      title: '🚨 ห้ามใช้ยากลุ่ม ACEI, ARB, MRA ในสตรีมีครรภ์',
      desc: 'ยาในกลุ่ม RAS blockers และ MRA ทำให้เกิดทารกพิการ ไตไม่พัฒนา (Renal dysgenesis) ภาวะน้ำคร่ำน้อย (Oligohydramnios) และทารกเสียชีวิตในครรภ์ได้'
    });
    drugChoices = [
      { name: 'Methyldopa (Aldomet)', dose: '250–500 mg วันละ 2–3 ครั้ง (สูงสุด 2,000–3,000 mg/วัน)', notes: 'ยาตัวเลือกอันดับ 1 ในสตรีมีครรภ์ มีประวัติความปลอดภัยต่อทารกยาวนานที่สุด' },
      { name: 'Nifedipine CR (Adalat CR) หรือ SR', dose: '30–60 mg วันละ 1 ครั้ง (CR) หรือ 20 mg วันละ 2 ครั้ง (SR)', notes: 'ยาขยายหลอดเลือด CCB ที่ปลอดภัยในหญิงตั้งครรภ์ ห้ามเคี้ยวเม็ดยา' },
      { name: 'Hydralazine (Apresoline)', dose: '25–50 mg วันละ 3–4 ครั้ง', notes: 'ใช้เสริมกรณีที่คุมความดันไม่ได้ หรือใช้ในภาวะ Severe Preeclampsia' }
    ];

    return {
      activeGuideline: guide,
      targetBPText,
      targetRationale,
      isBPControlled,
      strategyTitle,
      strategy,
      recommendedClasses: ['Methyldopa', 'DHP-CCB (Nifedipine CR)', 'Direct Vasodilator (Hydralazine)'],
      drugChoices,
      spcOptions: [],
      resistantHtDetected: false,
      isResistantHT: false,
      compIndications: ['สตรีมีครรภ์ (Pregnancy)'],
      currentMedAnalysis,
      alerts,
      monitoring: 'วัดความดันอย่างใกล้ชิด ตรวจติดตามโปรตีนในปัสสาวะ (Urine protein) เพื่อเฝ้าระวัง Preeclampsia'
    };
  }

  // -------------------------------------------------------------------------
  // COMPELLING INDICATIONS IDENTIFICATION
  // -------------------------------------------------------------------------
  if (hf) compIndications.push('ภาวะหัวใจล้มเหลว (Heart Failure with reduced EF - HFrEF)');
  if (cad) compIndications.push('โรคหลอดเลือดหัวใจโคโรนารี / กล้ามเนื้อหัวใจขาดเลือดเดิม (CAD / Prior MI)');
  if (ckd) compIndications.push('โรคไตเรื้อรังและ/หรือมีโปรตีนไข่ขาวรั่วในปัสสาวะ (CKD with Albuminuria)');
  if (dm) compIndications.push('โรคเบาหวาน (Diabetes Mellitus)');
  if (stroke) compIndications.push('ประวัติหลอดเลือดสมองขาดเลือดหรือ TIA (Prior Stroke/TIA)');
  if (af) compIndications.push('หัวใจห้องบนสั่นพลิ้ว (Atrial Fibrillation) ต้องการคุม Heart Rate');

  // Safety Alerts for Lab Values
  if (kLevel && kLevel >= 5.2) {
    alerts.push({
      level: 'warning',
      title: '⚠️ โพแทสเซียมในเลือดสูง (Hyperkalemia K ≥ 5.2 mEq/L)',
      desc: 'ระมัดระวังเป็นพิเศษในการปรับขนาดยา ACEI/ARB และห้ามเริ่ม Spironolactone (MRA) จนกว่าระดับ K+ จะลดลงต่ำกว่า 5.0 mEq/L'
    });
  }
  if (egfr && egfr < 30) {
    alerts.push({
      level: 'warning',
      title: '⚠️ การทำงานของไตเสื่อมรุนแรง (eGFR < 30 mL/min/1.73m²)',
      desc: 'หลีกเลี่ยง Thiazide diuretics (ประสิทธิภาพลดลง) ให้พิจารณา Loop diuretic (Furosemide) แทน และระวังการใช้ MRA'
    });
  }

  // -------------------------------------------------------------------------
  // SCENARIO 0: TREATED BUT NO DRUGS SPECIFIED YET
  // -------------------------------------------------------------------------
  if (p.currentMedStatus === 'treated' && classCount === 0) {
    strategyTitle = '⚠️ ผู้ป่วยได้รับยาลดความดันอยู่แล้ว (ยังไม่ได้ระบุชื่อยา)';
    strategy = 'กรุณาเลือกกลุ่มยาและชื่อยาที่ผู้ป่วยรับประทานอยู่จริงจากช่อง "+ เพิ่มยาลดความดันที่ได้รับ" ทางด้านซ้าย เพื่อให้ระบบประเมินความเหมาะสม ตรวจสอบความเข้ากันของยา และวางแผนการปรับยา';
    drugChoices = [
      { name: 'กรุณาระบุยาเดิมทางด้านซ้าย', dose: '-', notes: 'เลือกกลุ่มยาและชื่อยาแล้วกด "+ เพิ่มยา"' }
    ];
    spcOptions = [];
    return {
      activeGuideline: guide,
      targetBPText,
      targetRationale,
      isBPControlled,
      strategyTitle,
      strategy,
      recommendedClasses: [],
      drugChoices,
      spcOptions,
      resistantHtDetected: false,
      isResistantHT: false,
      compIndications,
      currentMedAnalysis,
      alerts,
      monitoring: 'นัดตรวจติดตามและประเมินยาเดิม'
    };
  }

  // -------------------------------------------------------------------------
  // SCENARIO 1: CONTROLLED BP ON CURRENT MEDICATIONS (ความดันถึงเป้าหมายแล้ว)
  // -------------------------------------------------------------------------
  if (classCount > 0 && isBPControlled) {
    strategyTitle = `✅ ความดันโลหิตควบคุมได้ตามเป้าหมายของ ${guide === 'thai' ? 'Thai HT 2567' : (guide === 'esc' ? 'ESC 2024' : 'AHA/ACC 2025')} (Controlled BP)`;
    strategy = `ระดับความดันปัจจุบัน (${sbp}/${dbp} mmHg) อยู่ในเกณฑ์เป้าหมาย (${targetBPText}) แนะนำคงสูตรยาเดิมที่ผู้ป่วยได้รับอยู่ (Maintain Current Regimen) ร่วมกับการปรับเปลี่ยนพฤติกรรมชีวิต`;

    if (classCount >= 2 && !p.currentMedsList.some(m => m.isSPC)) {
      strategy += ` | คำแนะนำเสริม: ผู้ป่วยรับประทานยาหลายเม็ดแยกกัน สามารถพิจารณาเปลี่ยนเป็นยาเม็ดรวม Single-Pill Combination (SPC) ในขนาดเทียบเท่าเดิม เพื่อเพิ่มความร่วมมือในการกินยาและความสะดวกของผู้ป่วย`;
    }

    drugChoices = p.currentMedsList.map(m => ({
      name: `${m.name} [ยาปัจจุบัน]`,
      dose: `${m.dose || ''} ${m.freq || ''}`,
      notes: 'ให้รับประทานยาเดิมต่อเนื่อง ตรวจเช็คความสม่ำเสมอในการกินยา'
    }));

    spcOptions = classCount >= 2 ? SPC_DATABASE.slice(0, 1) : [];

    return {
      activeGuideline: guide,
      targetBPText,
      targetRationale,
      isBPControlled: true,
      strategyTitle,
      strategy,
      recommendedClasses: currentMedAnalysis.distinctClasses,
      drugChoices,
      spcOptions,
      resistantHtDetected: false,
      isResistantHT: false,
      compIndications,
      currentMedAnalysis,
      alerts,
      monitoring: 'นัดตรวจติดตามความดันและตรวจการทำงานของไต (eGFR, Electrolytes) ทุก 6–12 เดือน'
    };
  }

  // -------------------------------------------------------------------------
  // SCENARIO 2: RESISTANT HYPERTENSION EVALUATION (Uncontrolled on ≥3 meds with Core Triad)
  // -------------------------------------------------------------------------
  if (classCount >= 3 && hasCoreTriad && !isBPControlled) {
    resistantHtDetected = true;
    alerts.push({
      level: 'danger',
      title: '🚨 วินิจฉัยสงสัยภาวะความดันโลหิตสูงดื้อยา (Suspected Resistant Hypertension)',
      desc: 'ความดันยังเกินเป้าหมายทั้งที่ได้รับยาแกนหลักครบ 3 กลุ่ม (RAS blocker + CCB + Diuretic) ในขนาดที่เหมาะสม คำแนะนำ: 1) ตรวจเช็คความร่วมมือในการกินยา (Adherence) 2) ตรวจวัดความดันที่บ้าน (HBPM) เพื่อแยกภาวะ White-coat resistant HT 3) คัดกรองภาวะ Primary Aldosteronism โดยส่งตรวจ Aldosterone-to-Renin Ratio (ARR) ในผู้ป่วย Resistant HT ทุกราย แม้ระดับ K+ จะปกติก็ตาม (คำแนะนำ AHA/ACC 2025 & Thai HT 2567)'
    });

    strategyTitle = 'แผนการรักษาภาวะความดันโลหิตสูงดื้อยา (Step 4 Resistant HT Algorithm)';
    strategy = 'คงยาแกนหลัก 3 ชนิดเดิม (A + C + D) ไว้ และพิจารณาเพิ่มยาตัวที่ 4 ตามผลการศึกษา PATHWAY-2 Trial & แนวทางเวชปฏิบัติ';

    if (!kLevel || (kLevel <= 4.5 && (!egfr || egfr >= 45))) {
      drugChoices.push({
        name: 'Spironolactone (ยาตัวเลือกอันดับ 1)',
        dose: 'เริ่ม 25 mg OD (หรือ 12.5 mg ในผู้สูงอายุ) ปรับได้ถึง 50 mg OD',
        notes: 'ยาทางเลือกอันดับ 1 ที่มีหลักฐานลดความดันใน Resistant HT ดีที่สุด (PATHWAY-2 trial) ต้องเจาะเลือดตรวจ K+ และ Cr ซ้ำหลังเริ่มยา 1–2 สัปดาห์'
      });
    } else {
      alerts.push({
        level: 'warning',
        title: '⚠️ ข้อจำกัดในการใช้ MRA (K > 4.5 หรือ eGFR < 45)',
        desc: `ผู้ป่วยมี K+ (${kLevel || 'N/A'}) หรือ eGFR (${egfr || 'N/A'}) ที่เสี่ยงต่อ Hyperkalemia แนะนำเลือกใช้ Alpha-1 blocker หรือ Beta-blocker แทน MRA`
      });
      drugChoices.push({
        name: 'Doxazosin (Cardura)',
        dose: 'เริ่ม 1–2 mg OD ก่อนนอน ปรับได้ถึง 4–8 mg OD',
        notes: 'ยาตัวเลือกทดแทน MRA ปลอดภัยในเรื่องระดับโพแทสเซียม เหมาะกับผู้ชายที่มีต่อมลูกหมากโต'
      });
      drugChoices.push({
        name: 'Bisoprolol (Concor)',
        dose: '5–10 mg OD',
        notes: 'ยาตัวเลือกช่วยลด sympathetic activity เหมาะเป็นพิเศษหากมี Heart rate เร็ว (> 80 bpm)'
      });
    }

    spcOptions = SPC_DATABASE.filter(cat => cat.classes.includes('Triple'));

    return {
      activeGuideline: guide,
      targetBPText,
      targetRationale,
      isBPControlled: false,
      strategyTitle,
      strategy,
      recommendedClasses: ['MRA (Spironolactone 25–50 mg)', 'Alpha-1 blocker (Doxazosin)', 'Beta-blocker (Bisoprolol)'],
      drugChoices,
      spcOptions,
      resistantHtDetected: true,
      isResistantHT: true,
      compIndications,
      currentMedAnalysis,
      alerts,
      monitoring: 'นัดตรวจติดตามความดันโลหิตและเจาะเลือดตรวจ Serum K+ และ Creatinine ซ้ำใน 1–2 สัปดาห์ และส่งตรวจ ARR คัดกรอง Primary Aldosteronism'
    };
  }

  // -------------------------------------------------------------------------
  // SCENARIO 3: COMPELLING INDICATIONS OVERRIDE (HFrEF, CAD, CKD Proteinuria)
  // -------------------------------------------------------------------------
  if (hf) {
    strategyTitle = 'แผนการรักษาความดันโลหิตสูงร่วมกับภาวะหัวใจล้มเหลว (HFrEF GDMT)';
    strategy = 'ให้การรักษาตามแนวทาง Guideline-Directed Medical Therapy (GDMT 4 เสาหลัก): ARNI/ACEI/ARB + Beta-Blocker (หลักฐานลดตาย) + MRA + SGLT2i';
    drugChoices = [
      { name: 'ARNI (Sacubitril/Valsartan) หรือ ARB/ACEI', dose: 'ตามขนาดยารักษาหัวใจล้มเหลว', notes: 'ชะลอการนอน รพ. และลดอัตราการเสียชีวิตจากโรคหัวใจ' },
      { name: 'Bisoprolol (Concor) หรือ Carvedilol (Dilatrend)', dose: 'เริ่มขนาดยาต่ำและค่อยๆ ไตเตรท', notes: 'ลดอัตราการเสียชีวิตอย่างมีนัยสำคัญใน HFrEF' },
      { name: 'Spironolactone', dose: '12.5–25 mg OD', notes: 'ช่วยลด myocardial fibrosis (ระวัง K+ และ eGFR)' }
    ];
    spcOptions = [];
  } else if (cad) {
    strategyTitle = 'แผนการรักษาความดันโลหิตสูงร่วมกับโรคหลอดเลือดหัวใจ (CAD / Post-MI)';
    strategy = 'เน้นยากลุ่มที่ลดการทำงานของหัวใจ ป้องกันการขาดเลือดซ้ำ: Beta-Blocker + RAS Blocker (ACEI/ARB) + DHP-CCB';
    drugChoices = [
      { name: 'Bisoprolol หรือ Metoprolol Succinate', dose: '2.5–5 mg OD (ปรับได้ถึง 10 mg OD)', notes: 'ลด Myocardial oxygen demand ป้องกัน Ischemia ซ้ำ' },
      { name: 'Telmisartan หรือ Ramipril / Perindopril', dose: 'ตามขนาดยามาตรฐาน', notes: 'ป้องกัน Adverse cardiac remodeling' },
      { name: 'Amlodipine (ถ้าความดันยังไม่ถึงเป้าหมาย)', dose: '5–10 mg OD', notes: 'ขยายหลอดเลือดโคโรนารี บรรเทาอาการแน่นหน้าอก' }
    ];
    spcOptions = SPC_DATABASE.filter(cat => cat.classes.includes('ARB + CCB') || cat.classes.includes('ACEI + CCB'));
  } else if (ckd) {
    strategyTitle = 'แผนการรักษาความดันโลหิตสูงร่วมกับโรคไตเรื้อรัง/มีไข่ขาวรั่ว (CKD Nephroprotection)';
    strategy = 'แนะนำเริ่มยากลุ่ม RAS Blocker (ACEI หรือ ARB) ในขนาดที่เหมาะสมเพื่อลด Intraglomerular pressure และชะลอไตเสื่อม ร่วมกับ CCB หรือ Diuretic';
    drugChoices = [
      { name: 'Telmisartan 40–80 mg OD หรือ Losartan 50–100 mg OD', dose: 'ปรับขนาดยาจนถึงขนาดสูงสุดที่ทนได้', notes: 'ลด Albuminuria/Proteinuria และชะลอการเข้าสู่ภาวะไตวายระยะสุดท้าย (ESKD)' },
      { name: 'Amlodipine หรือ Manidipine (Manyper)', dose: '5–10 mg OD (Manidipine 10–20 mg OD)', notes: 'คุมความดันร่วมกับ ARB โดย Manidipine ช่วยลดความดันในไตและบวมน้อย' }
    ];
    spcOptions = SPC_DATABASE.filter(cat => cat.classes.includes('ARB + CCB') || cat.classes.includes('ACEI + CCB'));
  }

  // -------------------------------------------------------------------------
  // SCENARIO 4: UNCOMPLICATED HYPERTENSION BY CURRENT MEDS COUNT & GUIDELINE
  // -------------------------------------------------------------------------
  else {
    const isFrailElderly = (age >= 80 || frailty);

    // CASE 4A: TREATMENT-NAÏVE (ผู้ป่วยยังไม่เคยได้รับยา)
    if (classCount === 0) {
      if (guide === 'aha') {
        // AHA/ACC 2025 Logic
        const preventRisk = p.preventRisk ? p.preventRisk.cvd : null;
        const isStage2 = (sbp >= 140 || dbp >= 90);
        const isStage1 = (sbp >= 130 && sbp < 140) || (dbp >= 80 && dbp < 90);

        if (isStage2) {
          strategyTitle = 'AHA/ACC 2025: การรักษาเริ่มต้นด้วยยา 2 ชนิดพร้อมกัน (Initial Dual Therapy)';
          strategy = 'สำหรับ Stage 2 HT (ความดัน ≥ 140/90 mmHg หรือสูงกว่าเป้าหมาย > 20/10 mmHg): แนะนำเริ่มยา 2 ชนิดพร้อมกันต่างกลุ่มกลไก โดยเน้น Single-Pill Combination (SPC)';
          drugChoices = [
            { name: 'สูตรหลัก: ARB + DHP-CCB (เช่น Telmisartan 40 + Amlodipine 5 mg OD)', dose: 'Twynsta 40/5 mg OD หรือ Amlozar', notes: 'ลดความดันได้รวดเร็ว เพิ่มความร่วมมือในการกินยา' },
            { name: 'สูตรทางเลือก: ARB + Thiazide (เช่น Losartan 50 + HCTZ 12.5 mg OD)', dose: 'Hyzaar 50/12.5 mg OD', notes: 'เหมาะกับคนสูงอายุหรือมีเกลือคั่ง' }
          ];
          spcOptions = SPC_DATABASE.slice(0, 1);
        } else if (isStage1 && preventRisk !== null && preventRisk < 7.5) {
          strategyTitle = 'AHA/ACC 2025: ปรับพฤติกรรมชีวิต 3–6 เดือน (Lifestyle Modification)';
          strategy = `ผู้ป่วยเป็น Stage 1 HT (130–139/80–89 mmHg) ที่มี AHA PREVENT 10-year CVD risk ต่ำกว่า 7.5% (${preventRisk}%) และไม่มีโรคร่วม: แนะนำปรับเปลี่ยนพฤติกรรมอย่างเข้มงวด 3–6 เดือน หากยังเกิน 130/80 mmHg จึงพิจารณาเริ่มยา`;
          drugChoices = [
            { name: 'Lifestyle TLC: อาหาร DASH Diet, ลดโซเดียม < 2,000 mg/วัน, ออกกำลังกาย', dose: 'ประเมินซ้ำใน 3–6 เดือน', notes: 'สามารถลด SBP ได้ 5–11 mmHg' }
          ];
          spcOptions = [];
        } else {
          // Stage 1 with PREVENT ≥ 7.5% or high risk
          strategyTitle = 'AHA/ACC 2025: เริ่มยาลดความดัน (PREVENT CVD ≥ 7.5% หรือมีความเสี่ยงสูง)';
          strategy = 'ผู้ป่วย Stage 1 HT ที่มีความเสี่ยง AHA PREVENT ≥ 7.5%: แนะนำเริ่มยาลดความดัน 1 ชนิด (First-line: RAS blocker, CCB หรือ Thiazide)';
          drugChoices = [
            { name: 'Amlodipine', dose: '5 mg OD', notes: 'ยาขยายหลอดเลือด DHP-CCB คุมความดันได้สม่ำเสมอ' },
            { name: 'Telmisartan หรือ Losartan', dose: 'Telmisartan 40 mg OD หรือ Losartan 50 mg OD', notes: 'ความทนทานต่อยาสูง ผลข้างเคียงต่ำ' }
          ];
          spcOptions = SPC_DATABASE.slice(0, 1);
        }
      } else {
        // Thai HT 2567 & ESC 2024 Logic
        const isThaiStage2OrHigh = (stagingThai.code === 'STAGE2' || riskEval.code === 'HIGH' || riskEval.code === 'VERY_HIGH' || sbp >= 150 || dbp >= 95);

        if (isFrailElderly || (!isThaiStage2OrHigh && stagingThai.code === 'STAGE1' && riskEval.code === 'LOW')) {
          // Monotherapy
          strategyTitle = `${guide === 'thai' ? 'Thai HT 2567' : 'ESC 2024'}: การรักษาเริ่มต้นด้วยยาชนิดเดียว (Initial Monotherapy)`;
          strategy = isFrailElderly
            ? 'ผู้ป่วยสูงอายุมากหรือเปราะบาง: แนะนำเริ่มยาชนิดเดียวในขนาดต่ำสุด (Start low, go slow) เพื่อป้องกันภาวะความดันตกท่ายืน'
            : 'ผู้ป่วยความดันโลหิตสูงระยะที่ 1 ความเสี่ยงต่ำ: เริ่มยาชนิดเดียวร่วมกับการปรับพฤติกรรมชีวิต';
          drugChoices = [
            { name: 'Amlodipine', dose: isFrailElderly ? '2.5 mg OD' : '5 mg OD', notes: 'ป้องกัน Stroke ได้ดี ออกฤทธิ์นาน 24 ชม.' },
            { name: 'Telmisartan หรือ Losartan', dose: isFrailElderly ? '20–40 mg OD' : '40–80 mg OD', notes: 'ผลข้างเคียงต่ำมาก ปกป้องหลอดเลือดและไต' },
            { name: 'Indapamide SR (Natrilix SR)', dose: '1.5 mg OD', notes: 'หลักฐาน HYVET study ชัดเจนในผู้สูงอายุ' }
          ];
          spcOptions = [];
        } else {
          // Standard Initial Dual Combination (SPC)
          strategyTitle = `${guide === 'thai' ? 'Thai HT 2567' : 'ESC 2024'}: เริ่มต้นด้วยยาผสม 2 ชนิดในเม็ดเดียว (Standard Initial Dual SPC)`;
          strategy = 'แนวทาง Thai HT 2567 และ ESC 2024 แนะนำเริ่มยา 2 ชนิดพร้อมกันเป็นตัวเลือกมาตรฐาน (Standard of care) สำหรับผู้ป่วยส่วนใหญ่ เพื่อคุมความดันให้ถึงเป้าหมายได้รวดเร็วและเพิ่มความร่วมมือในการกินยา';
          drugChoices = [
            { name: 'สูตรผสมที่ 1 (Preferred): ARB + DHP-CCB', dose: 'เช่น Telmisartan 40 mg + Amlodipine 5 mg OD (Twynsta 40/5)', notes: 'ประสิทธิภาพสูงมาก อาการข้อเท้าบวมจาก CCB จะลดลงเมื่อใช้ร่วมกับ ARB' },
            { name: 'สูตรผสมที่ 2 (Alternative): ARB + Thiazide', dose: 'เช่น Losartan 50 mg + HCTZ 12.5 mg OD (Hyzaar 50/12.5)', notes: 'เหมาะกับคนสูงอายุหรือมีเกลือคั่ง' }
          ];
          spcOptions = SPC_DATABASE.slice(0, 1);
        }
      }
    }

    // CASE 4B: ON 1 DRUG (MONOTHERAPY) BUT UNCONTROLLED (ได้รับยา 1 ชนิดแล้วความดันยังเกินเป้าหมาย)
    else if (classCount === 1) {
      const currentDrug = p.currentMedsList[0];
      const currentClass = currentMedAnalysis.distinctClasses[0];

      strategyTitle = `แผนการปรับยาสำหรับผู้ป่วยที่ได้รับยา 1 ชนิด (Escalation from Monotherapy)`;
      strategy = `ผู้ป่วยได้รับยา ${currentDrug.name} (${currentDrug.dose || ''}) แต่ระดับความดันโลหิต (${sbp}/${dbp} mmHg) ยังไม่ถึงเป้าหมาย (${targetBPText}):
` +
        `• ทางเลือกหลักตามคำแนะนำ ${guide === 'thai' ? 'Thai HT 2567' : 'ESC 2024'}: แนะนำ "เพิ่มยาชนิดที่ 2 ที่มีกลไกเสริมกันเป็นยาเม็ดรวม Dual SPC" (ซึ่งลดความดันได้ดีกว่าการเพิ่มขนาดยาเดี่ยวถึง 5 เท่าและผลข้างเคียงน้อยกว่า)
` +
        `• ทางเลือกสำรอง: หากเพิ่งเริ่มยา สามารถพิจารณาไตเตรทขนาดยาเดิมขึ้นสู่ขนาดมาตรฐาน/สูงสุด`;

      if (currentClass === 'CCB') {
        drugChoices = [
          { name: 'เพิ่มยากลุ่ม ARB ร่วมด้วย (เปลี่ยนเป็น Dual SPC: ARB + CCB)', dose: 'เช่น Telmisartan 40 mg + Amlodipine 5 mg (Twynsta 40/5 mg OD)', notes: 'แนะนำอันดับ 1: ARB ขยายหลอดเลือดดำ ช่วยลดอาการข้อเท้าบวมจาก CCB ได้อย่างชัดเจน' },
          { name: 'ทางเลือกไตเตรทยาเดิม: Amlodipine', dose: 'ปรับเพิ่มเป็น 10 mg OD', notes: 'ทางเลือกสำรอง: อาจเพิ่มความเสี่ยงข้อเท้าบวมและหน้าแดง' }
        ];
        spcOptions = SPC_DATABASE.filter(cat => cat.classes.includes('ARB + CCB') || cat.classes.includes('ACEI + CCB')).slice(0, 1);
      } else if (currentClass === 'RAS') {
        drugChoices = [
          { name: 'เพิ่มยากลุ่ม DHP-CCB ร่วมด้วย (เปลี่ยนเป็น Dual SPC: ARB/ACEI + CCB)', dose: 'เช่น Telmisartan 40 mg + Amlodipine 5 mg (Twynsta 40/5 mg OD)', notes: 'แนะนำอันดับ 1: ผลเสริมฤทธิ์ลดความดันโลหิตและป้องกันหลอดเลือดสมองสูงสุด' },
          { name: 'เพิ่มยาขับปัสสาวะ Thiazide-like ร่วมด้วย (สูตรผสม ARB + Diuretic)', dose: 'เช่น Indapamide SR 1.5 mg OD หรือ HCTZ 12.5–25 mg OD', notes: 'เหมาะเป็นพิเศษหากผู้ป่วยมีเกลือคั่งหรือเป็นผู้สูงอายุ' }
        ];
        spcOptions = SPC_DATABASE.filter(cat => cat.classes.includes('ARB + CCB') || cat.classes.includes('ARB + Thiazide')).slice(0, 1);
      } else if (currentClass === 'Diuretic') {
        drugChoices = [
          { name: 'เพิ่มยากลุ่ม ARB หรือ CCB ร่วมด้วย', dose: 'เช่น เพิ่ม Telmisartan 40 mg หรือ Amlodipine 5 mg OD', notes: 'ช่วยคุมความดันและลดผลข้างเคียงทางเมแทบอลิซึมของยาขับปัสสาวะ' }
        ];
        spcOptions = SPC_DATABASE.slice(0, 1);
      } else if (currentClass === 'BB') {
        strategy += `
⚠️ ข้อสังเกต: หากไม่มีข้อบ่งชี้จำเพาะทางหัวใจ (CAD/HF/AF) ยากลุ่ม Beta-blocker ไม่แนะนำเป็นยาเดี่ยวตัวแรก แนะนำพิจารณาปรับเพิ่มหรือเปลี่ยนเป็น ARB หรือ CCB`;
        drugChoices = [
          { name: 'เพิ่มยากลุ่ม DHP-CCB หรือ ARB', dose: 'เช่น Amlodipine 5 mg OD หรือ Telmisartan 40 mg OD', notes: 'เพิ่มประสิทธิภาพการป้องกัน Stroke และลดความดัน' }
        ];
        spcOptions = SPC_DATABASE.slice(0, 1);
      } else {
        drugChoices = [
          { name: 'เพิ่มยากลุ่ม ARB หรือ CCB เป็นยาตัวที่ 2', dose: 'ตามขนาดยามาตรฐาน', notes: 'ก้าวสู่การรักษาแบบ Dual combination' }
        ];
        spcOptions = SPC_DATABASE.slice(0, 1);
      }
    }

    // CASE 4C: ON 2 DRUGS (DUAL THERAPY) BUT UNCONTROLLED (ได้รับยา 2 ชนิดแล้วความดันยังเกินเป้าหมาย)
    else if (classCount === 2) {
      strategyTitle = `แผนการปรับยาสำหรับผู้ป่วยที่ได้รับยา 2 ชนิด (Escalation to Triple Therapy: Step 3)`;
      strategy = `ผู้ป่วยได้รับยา 2 ชนิด (${currentMedAnalysis.distinctClasses.join(' + ')}) แต่ระดับความดันโลหิต (${sbp}/${dbp} mmHg) ยังสูงกว่าเป้าหมาย (${targetBPText}):
` +
        `• หากขนาดยายังเป็นขนาดเริ่มต้น: สามารถปรับเพิ่มขนาดยาของสูตรผสมเดิมขึ้นสู่ขนาดเต็ม (Full-dose Dual SPC เช่น Twynsta 80/10 mg)
` +
        `• หากใช้ขนาดยามาตรฐานแล้ว: ก้าวสู่ Step 3 เพิ่มยาตัวที่ 3 ให้ครบสูตรแกนหลัก 3 ประสาน (Triple Therapy: RAS + CCB + Diuretic)`;

      if (!currentMedAnalysis.hasDiuretic) {
        drugChoices = [
          { name: 'เพิ่มยาขับปัสสาวะ Thiazide-like (Indapamide SR หรือ HCTZ) ให้ครบ Triple Therapy', dose: 'Indapamide SR 1.5 mg OD หรือ HCTZ 12.5–25 mg OD', notes: 'แนะนำอันดับ 1: เติมยาตัวที่ 3 (A + C + D) เพื่อขับเกลือและน้ำส่วนเกิน' },
          { name: 'เปลี่ยนเป็นยาผสม 3 ชนิดในเม็ดเดียว (Triple Single-Pill Combination)', dose: 'Triplixam (Perindopril/Indapamide/Amlodipine) หรือ Exforge HCT', notes: 'ลดจำนวนเม็ดยาเหลือเม็ดเดียว เพิ่มความร่วมมือในการกินยา' }
        ];
      } else if (!currentMedAnalysis.hasCCB) {
        drugChoices = [
          { name: 'เพิ่มยาขยายหลอดเลือด DHP-CCB (Amlodipine) ให้ครบสูตร 3 ประสาน', dose: 'Amlodipine 5–10 mg OD', notes: 'ขยายหลอดเลือดแดงส่วนปลาย ลดความต้านทานหลอดเลือด' }
        ];
      } else if (!currentMedAnalysis.hasACEI && !currentMedAnalysis.hasARB) {
        drugChoices = [
          { name: 'เพิ่มยากลุ่ม ARB (Telmisartan หรือ Losartan) ให้ครบสูตร 3 ประสาน', dose: 'Telmisartan 40–80 mg OD หรือ Losartan 50–100 mg OD', notes: 'ยับยั้งระบบ RAAS ปกป้องหลอดเลือดและไต' }
        ];
      } else {
        drugChoices = [
          { name: 'ปรับเพิ่มขนาดยาเดิมสู่ขนาดสูงสุด (Dose Titration)', dose: 'เช่น ปรับ Amlodipine เป็น 10 mg / Losartan เป็น 100 mg OD', notes: 'เพิ่มขนาดยาเต็มที่ก่อนพิจารณาเติมยาตัวที่ 3' }
        ];
      }
      spcOptions = SPC_DATABASE.filter(cat => cat.classes.includes('Triple'));
    }

    // CASE 4D: ON 3 DRUGS BUT NOT CORE TRIAD OR SUBMAXIMAL (ได้รับยา 3 ชนิดแต่ยังไม่ใช่สูตร A+C+D หรือขนาดยายังต่ำ)
    else if (classCount === 3 && !hasCoreTriad) {
      strategyTitle = `แผนการปรับยาให้ตรงตามสูตรแกนหลัก 3 ประสาน (Core Triad Optimization)`;
      strategy = `ผู้ป่วยได้รับยา 3 ชนิด (${currentMedAnalysis.distinctClasses.join(' + ')}) แต่ยังขาดองค์ประกอบของสูตรแกนหลักมาตรฐาน (RAS blocker + CCB + Diuretic) แนะนำปรับโครงสร้างสูตรยาให้มีองค์ประกอบครบทั้ง 3 กลุ่มก่อนวินิจฉัยภาวะดื้อยา`;

      const missing = [];
      if (!currentMedAnalysis.hasACEI && !currentMedAnalysis.hasARB) missing.push('RAS blocker (ARB/ACEI)');
      if (!currentMedAnalysis.hasCCB) missing.push('CCB (Amlodipine)');
      if (!currentMedAnalysis.hasDiuretic) missing.push('Diuretic (Thiazide/Loop)');

      drugChoices = [
        { name: `ปรับเพิ่ม/ทดแทนด้วยยากลุ่มที่ยังขาด: ${missing.join(', ')}`, dose: 'ตามขนาดยามาตรฐาน', notes: 'การได้รับยา A + C + D ครบ มีประสิทธิภาพลดความดันโลหิตสูงสุดตามหลักเวชปฏิบัติ' },
        { name: 'พิจารณาเปลี่ยนเป็น Triple SPC (เช่น Triplixam หรือ Exforge HCT)', dose: 'วันละ 1 เม็ด', notes: 'คุมความดันด้วยยาเม็ดเดียว' }
      ];
      spcOptions = SPC_DATABASE.filter(cat => cat.classes.includes('Triple'));
    }

    // CASE 4E: ON ≥ 4 DRUGS (ได้รับยาตั้งแต่ 4 ชนิดขึ้นไป)
    else {
      strategyTitle = `แผนการรักษาภาวะความดันโลหิตสูงดื้อยาขั้นรุนแรงหรือซับซ้อน (Refractory Hypertension)`;
      strategy = `ผู้ป่วยได้รับยาตั้งแต่ 4 ชนิดขึ้นไปแล้วแต่ความดันยังเกินเป้าหมาย แนะนำ:
` +
        `1. ส่งต่อผู้เชี่ยวชาญด้านความดันโลหิตสูง (Hypertension Specialist), อายุรแพทย์โรคไต หรืออายุรแพทย์โรคหัวใจ
` +
        `2. ตรวจค้นหาสาเหตุทุติยภูมิเชิงลึก (Secondary Hypertension) เช่น Renal Artery Stenosis, Pheochromocytoma, Cushing syndrome, OSA
` +
        `3. พิจารณาหัตถการจี้ทำลายเส้นประสาทหลอดเลือดไต (Renal Denervation - RDN) ตามคำแนะนำของ ESC 2024 และ Thai HT 2567 หากมีข้อบ่งชี้`;
      drugChoices = [
        { name: 'ส่งต่อปรึกษาแพทย์เฉพาะทาง (Specialist Consultation)', dose: 'รพ.ศูนย์ / โรงเรียนแพทย์', notes: 'ประเมิน Secondary HT และ Complex pharmacology' }
      ];
      spcOptions = [];
    }
  }

  // Common Monitoring
  const monitoring = 'นัดตรวจติดตามความดันโลหิตและประเมินผลข้างเคียงใน 2–4 สัปดาห์ | หากเริ่มหรือปรับขนาดยา ACEI, ARB, Diuretic หรือ MRA ให้ตรวจ Serum Creatinine และ Potassium ซ้ำใน 2–4 สัปดาห์ (หาก Cr เพิ่มไม่เกิน 30% ถือว่ายอมรับได้)';

  return {
    activeGuideline: guide,
    targetBPText,
    targetRationale,
    isBPControlled,
    strategyTitle,
    strategy,
    recommendedClasses: currentMedAnalysis.distinctClasses,
    drugChoices,
    spcOptions,
    resistantHtDetected,
    isResistantHT: resistantHtDetected,
    compIndications,
    currentMedAnalysis,
    alerts,
    monitoring
  };
}

// Attach to window / global scope
if (typeof window !== 'undefined') {
  window.THAI_HT_DRUGS = THAI_HT_DRUGS;
  window.SPC_DATABASE = SPC_DATABASE;
  window.POPULAR_SPCS = POPULAR_SPCS;
  window.ALL_SPCS = ALL_SPCS;
  window.findSPCInCatalog = findSPCInCatalog;
  window.findDrugInCatalog = findDrugInCatalog;
  window.checkGFRDosing = checkGFRDosing;
  window.analyzeCurrentMedications = analyzeCurrentMedications;
  window.generateMedicationPlan = generateMedicationPlan;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    THAI_HT_DRUGS,
    SPC_DATABASE,
    POPULAR_SPCS,
    ALL_SPCS,
    findSPCInCatalog,
    findDrugInCatalog,
    checkGFRDosing,
    analyzeCurrentMedications,
    generateMedicationPlan
  };
}
