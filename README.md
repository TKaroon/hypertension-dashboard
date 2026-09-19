# 🩺 Hypertension Master Dashboard & Clinical Decision Support Webapp
### ระบบประเมิน วินิจฉัย และวางแผนการรักษาโรคความดันโลหิตสูงแบบบูรณาการ
**พัฒนาโดย นพ.ธนภพ การุญ วิทยาลัยแพทยศาสตร์และการสาธารณสุข มหาวิทยาลัยอุบลราชธานี** (ติดต่อ/ข้อเสนอแนะ: `myfolk36@gmail.com`, `thanaphop.k@ubu.ac.th`)

---

## 📖 บทนำและภาพรวม (Overview)
Webapp นี้พัฒนาขึ้นเพื่อเป็นเครื่องมือช่วยตัดสินใจทางคลินิก (Clinical Decision Support System - CDSS) และสื่อสุขศึกษาสำหรับประชาชน ในการประเมิน วินิจฉัย จำแนกระดับความรุนแรง (Staging) และวางแผนการรักษาโรคความดันโลหิตสูง โดยรวบรวมและบูรณาการแนวทางเวชปฏิบัติฉบับล่าสุดจาก 3 สถาบันชั้นนำ:

1. **🇹🇭 สมาคมความดันโลหิตสูงแห่งประเทศไทย (Thai HT 2567)**
2. **🇪🇺 European Society of Cardiology (ESC 2024)**
3. **🇺🇸 American Heart Association / American College of Cardiology (AHA/ACC 2025)**

---

## ✨ ฟังก์ชันเด่นของระบบ (Key Features)

### 1. โหมดการใช้งาน 2 รูปแบบ (Dual Mode Architecture)
- **👨‍⚕️ โหมดแพทย์ / บุคลากรทางการแพทย์ (Clinician Mode):**
  - แสดงผลเชิงลึกทางคลินิก: การวินิจฉัย, การตรวจหาภาวะ White-Coat HT และ Masked HT
  - ตารางเปรียบเทียบ 3 Guidelines แบบคู่ขนาน (Side-by-Side Comparison Matrix)
  - แผนการให้ยา (Starting dose, Target/Max dose, Compelling indications, Contraindications)
  - ตัวอย่างสูตรยาผสมเม็ดเดียว (Single-Pill Combinations - SPC) ที่มีใช้ในประเทศไทย
  - อัลกอริทึมความดันดื้อยา (Resistant Hypertension) และยาตัวที่ 4 (Spironolactone / MRA)
  - แผนการตรวจติดตามผลและตรวจเลือดทางห้องปฏิบัติการ (Lab monitoring: K+, Cr/eGFR)
- **👥 โหมดประชาชน / ผู้ป่วย (Patient Mode):**
  - แดชบอร์ดเข้าใจง่าย มาตรวัดสีแบบสัญญาณไฟจราจร (เขียว, เหลือง, ส้ม, แดง)
  - คำอธิบายความหมายของตัวเลขตัวบน (Systolic) และตัวล่าง (Diastolic)
  - คำอธิบายเป้าหมายความดันเฉพาะบุคคล (Personal Target BP)
  - 5 หัวใจสำคัญในการปรับเปลี่ยนพฤติกรรม (Thai DASH Diet & Lifestyle) พร้อมตัวอย่างอาหารไทยและการลดโซเดียม
  - กฎ 7-2-2 ในการวัดความดันโลหิตที่บ้าน (Home BP Monitoring Protocol)
  - สัญญาณเตือนอันตราย (Red Flag Warning Signs) ที่ต้องรีบไปโรงพยาบาลหรือโทร 1669 ทันที

### 2. เครื่องมือคำนวณและประเมินความเสี่ยงต่อโรคหัวใจและหลอดเลือด (Cardiovascular Risk Engines)
ต่อยอดและสืบทอดความแม่นยำทางคณิตศาสตร์จาก **Lipid Calculator & ASCVD Master Dashboard**:
- **Thai CV Risk Score (Ramathibodi / EGAT):** ประเมินความเสี่ยงเกิดโรคหัวใจและหลอดเลือดใน 10 ปี ทั้งแบบใช้ผลเลือด (Lab-based) และแบบใช้เส้นรอบเอวต่อส่วนสูง (Non-lab based)
- **AHA PREVENT™ Full Engine (2023/2024):** คำนวณความเสี่ยง 10 ปีสำหรับ Total CVD, ASCVD และ Heart Failure
- **ESC SCORE2, SCORE2-OP & SCORE2-Diabetes:** คำนวณความเสี่ยงโรคหัวใจและหลอดเลือดตามเกณฑ์ยุโรป
- **CKD-EPI 2021 Equation:** คำนวณอัตราการกรองของไต (eGFR) และจำแนกระยะโรคไตเรื้อรัง (CKD Stage G1–G5 และ Albuminuria A1–A3)

### 3. ปุ่มลัดเคสตัวอย่าง 8 รูปแบบ (Quick Clinical Presets)
กดครั้งเดียวเพื่อโหลดข้อมูลผู้ป่วยจำลอง:
1. **ผู้มีสุขภาพดี ความดันปกติ (Normal BP)**
2. **กลุ่มเสี่ยงความดันโลหิตสูง (BP at risk 130–139/80–89 mmHg - เกณฑ์ใหม่ Thai 2567)**
3. **โรคความดันโลหิตสูง ระยะที่ 1 วัยทำงาน (Stage 1 HT Uncomplicated)**
4. **ผู้สูงอายุ > 65 ปี ความดันสูงระยะที่ 2 (Elderly Stage 2 ISH - เป้าหมาย 130–139 mmHg)**
5. **เบาหวานร่วมกับโรคไตเรื้อรัง (DM with CKD & Albuminuria - ข้อบ่งชี้ RAS Blocker)**
6. **โรคหัวใจขาดเลือดและหัวใจล้มเหลว (CAD / Post-MI with HFrEF - GDMT 4 เสาหลัก)**
7. **สงสัยความดันโลหิตสูงดื้อยา (Suspected Resistant HT - ได้รับยา ≥3 ชนิดแล้วยังคุมไม่ได้)**
8. **สงสัยภาวะความดันโลหิตสูงเมื่อพบแพทย์ (White-Coat Hypertension - Office สูงแต่ Home ปกติ)**

### 4. การส่งออกและพิมพ์รายงาน (Export & Print Ready)
- **📋 1-Click Copy EMR SOAP Note:** คัดลอกข้อความสรุปทางคลินิกลงคลิปบอร์ดในรูปแบบ SOAP (Subjective, Objective, Assessment, Plan) ครบถ้วน พร้อมวางในระบบ รพ. เช่น HOSxP, SSK, HomC ทันที
- **🖨️ A4 Medical Report & Patient Handout:** จัดหน้ารายงานสำหรับการพิมพ์มาตรฐาน A4 เพื่อบันทึกลงเวชระเบียนหรือแจกผู้ป่วยเป็นตารางจดบันทึกความดันโลหิตที่บ้าน 7 วัน

---

## 📁 โครงสร้างไฟล์ (Project File Structure)

```text
Hypertension/
├── index.html            # โครงสร้างหลัก UI, Input Forms, Dashboards, Modals
├── css/
│   └── styles.css        # ดีไซน์ระบบ Medical Dashboard, Responsive & Print Styles
├── js/
│   ├── calculators.js    # เครื่องคำนวณ eGFR (CKD-EPI 2021), Thai CV Risk, PREVENT, SCORE2, BMI
│   ├── guidelines.js     # กฎการวินิจฉัย Staging (Thai 2567, ESC 2024, ACC/AHA), Target BP, Risk Matrix
│   ├── medications.js    # ฐานข้อมูลยาในไทย, รายการยาผสม SPC, Resistant HT Algorithm, DDI Alerts
│   ├── emr_generator.js  # ตัวสร้างบันทึกเวชระเบียน SOAP และระบบ 1-Click Copy
│   ├── patient_mode.js   # ตัวเรนเดอร์โหมดประชาชน คำอธิบายตัวเลข อาหาร DASH กฎ 7-2-2
│   └── app.js            # ตัวควบคุม State, Event Listeners, Quick Presets และอัปเดตแบบ Real-time
└── README.md             # เอกสารอธิบายระบบและการใช้งาน
```

---

## 🚀 วิธีเปิดใช้งานและการนำไปขึ้นระบบ (Deployment)

### 1. การใช้งานบนเครื่องคอมพิวเตอร์ (Local Use)
- ไม่จำเป็นต้องติดตั้งโปรแกรมหรือ Node.js ใดๆ
- ดับเบิลคลิกไฟล์ `index.html` เพื่อเปิดใช้งานบนเบราว์เซอร์ (Chrome, Edge, Safari, Firefox) ได้ทันที
- ประมวลผลบนเครื่องของผู้ใช้ 100% (Client-Side Only) ปลอดภัยตามมาตรฐาน PDPA / HIPAA ข้อมูลสุขภาพไม่ถูกส่งออกภายนอก

### 2. การนำขึ้น Cloudflare Pages (Deploy to `pages.dev`)
1. นำโฟลเดอร์นี้อัปโหลดขึ้น GitHub Repository
2. เข้าสู่ Cloudflare Dashboard -> Pages -> Create a project -> Connect to Git
3. เลือก Repository นี้ โดยกำหนด Build command เป็น **ว่าง (None)** และ Output directory เป็น `/`
4. พร้อมใช้งานบนโดเมน `https://your-app-name.pages.dev` ได้ทันทีแบบเดียวกับ `lipid-ascvd-dashboard.pages.dev`

---

## 📚 เอกสารอ้างอิงทางวิชาการ (References)

1. สมาคมความดันโลหิตสูงแห่งประเทศไทย. (2567). *แนวทางการรักษาโรคความดันโลหิตสูงในเวชปฏิบัติทั่วไป พ.ศ. 2567*. กรุงเทพฯ: สมาคมความดันโลหิตสูงแห่งประเทศไทย.
2. McEvoy, J. W., et al. (2024). 2024 ESC Guidelines for the management of elevated blood pressure and hypertension. *European Heart Journal*, 45(38), 3912–4016. https://doi.org/10.1093/eurheartj/ehae178
3. Whelton, P. K., et al. (2025). 2025 AHA/ACC/AANP/AAPA/ABC/ACCP/ACPM/AGS/AMA/ASPC/NMA/PCNA/SGIM Guideline for the prevention, detection, evaluation and management of high blood pressure in adults. *Hypertension*, 82(10), e212–e316. https://doi.org/10.1161/HYP.0000000000000249

