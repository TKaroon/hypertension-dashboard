# 🩺 วิธีติดตั้งและใช้งานบน Google Apps Script (GAS Guide)

เอกสารนี้อธิบายขั้นตอนการนำ **Hypertension Master Dashboard & Clinical Decision Support Webapp** ไปติดตั้งบน **Google Apps Script** เพื่อเปิดใช้งานเป็น Web App หรือใช้งานสูตรคำนวณใน Google Sheets

---

## โครงสร้างไฟล์ในโฟลเดอร์ `gas/`

1. **`Code.gs`** (Server-side Script):
   - ฟังก์ชัน `doGet(e)` สำหรับเปิด Web App
   - ฟังก์ชัน `savePatientRecord(data)` สำหรับบันทึกข้อมูลสรุปลงใน Google Sheets
   - สูตรคำนวณทางการแพทย์สำหรับใช้ในช่องตาราง Google Sheets:
     - `=CALC_EGFR(scr, age, sex)` (CKD-EPI 2021 Race-Free)
     - `=THAI_CV_RISK(age, sex, sbp, dm, smoker, tc, wc, height, mode)` (Thai CV Risk / EGAT)
     - `=PREVENT_TOTAL_CVD(age, sex, tc, hdl, sbp, bmi, egfr, dm, smoke, bpMeds, statin)` (AHA PREVENT Total CVD)
     - `=PREVENT_ASCVD(...)` (AHA PREVENT ASCVD)
     - `=PREVENT_HF(...)` (AHA PREVENT Heart Failure)
     - `=SCORE2(age, sex, smoker, sbp, tc, hdl, dm)` (ESC SCORE2 / SCORE2-OP)
     - `=HT_STAGE_THAI(sbp, dbp)` (Thai HT Guideline 2567 Staging)
     - `=HT_STAGE_ESC(sbp, dbp)` (ESC Guidelines 2024 Staging)
     - `=HT_STAGE_AHA(sbp, dbp, preventRisk, hasComorbidity)` (AHA/ACC 2025 Staging)

2. **`Index.html`** (Client-side Web App):
   - ไฟล์ HTML ฉบับ Standalone รวม CSS และ JavaScript ทั้งหมด 6 โมดูลไว้ในไฟล์เดียว
   - ใช้งานได้บน Google Apps Script HtmlService ทันที 100% ไม่ต้องตั้งค่า Web Server ภายนอก

---

## ขั้นตอนการติดตั้งบน Google Apps Script (แบบ Step-by-Step)

### วิธีที่ 1: ติดตั้งผ่าน Google Sheets (แนะนำ เพื่อให้ได้ทั้ง Web App และสูตรใน Sheets)
1. เปิด [Google Sheets](https://sheets.new) สร้างสเปรดชีตใหม่ (เช่น ตั้งชื่อว่า `Hypertension Registry & Dashboard`)
2. ไปที่เมนูด้านบน คลิก **ส่วนขยาย (Extensions)** ➔ **Apps Script**
3. ที่แท็บไฟล์ด้านซ้าย จะมีไฟล์ `Code.gs` อยู่แล้ว ให้ลบโค้ดเดิมออกทั้งหมด แล้วคัดลอกโค้ดจากไฟล์ `gas/Code.gs` มาวางแทนที่ แล้วกดบันทึก (Ctrl+S / Cmd+S)
4. คลิกที่เครื่องหมายบวก **`+`** ข้างคำว่า "ไฟล์" (Files) ➔ เลือก **HTML**
5. ตั้งชื่อไฟล์ว่า **`Index`** (ไม่ต้องใส่นามสกุล .html)
6. คัดลอกโค้ดทั้งหมดจากไฟล์ `gas/Index.html` มาวางแทนที่โค้ดเดิม แล้วกดบันทึก

---

### วิธีที่ 2: การ Deploy ให้เป็น Web App เพื่อใช้งาน
1. ที่มุมขวาบนของหน้า Apps Script คลิกปุ่มสีน้ำเงิน **การทำให้ใช้งานได้ (Deploy)** ➔ เลือก **การทำให้ใช้งานได้รายการใหม่ (New deployment)**
2. คลิกรูปฟันเฟือง ⚙️ ข้าง "เลือกประเภท" (Select type) ➔ เลือก **เว็บแอป (Web app)**
3. ตั้งค่าการเผยแพร่ดังนี้:
   - **คำอธิบาย (Description):** เช่น `Hypertension Master Dashboard v1.0`
   - **ดำเนินการในฐานะ (Execute as):** **ฉัน (Me)**
   - **ผู้มีสิทธิ์เข้าถึง (Who has access):** **ทุกคน (Anyone)** *(เพื่อให้แพทย์หรือผู้ป่วยเปิดใช้งานผ่านลิงก์ได้โดยไม่ต้องขอสิทธิ์)*
4. คลิกปุ่ม **การทำให้ใช้งานได้ (Deploy)**
5. หากระบบขอสิทธิ์การเข้าถึง (Authorization Required) ให้คลิก:
   - **ตรวจสอบสิทธิ์ (Authorize access)**
   - เลือกบัญชี Google ของท่าน
   - คลิก **ขั้นสูง (Advanced)** ➔ คลิก **ไปที่ [ชื่อโปรเจกต์] (ไม่ปลอดภัย) / Go to project (unsafe)**
   - คลิก **อนุญาต (Allow)**
6. คัดลอก **URL ของเว็บแอป (Web app URL)** ที่ได้ นำไปเปิดใช้งานบนเบราว์เซอร์ ทั้งคอมพิวเตอร์ แท็บเล็ต หรือสมาร์ทโฟนได้ทันที!
