/**
 * Patient Mode & Thai Public Health Education Engine
 * Designed for patients and general public with easy-to-understand visuals,
 * practical Thai lifestyle recommendations, 7-2-2 Home BP guide, and red flags.
 */

function renderPatientDashboard(patient, stagingThai, targetBP, medPlan) {
  const container = document.getElementById('patient-mode-view');
  if (!container) return;

  const { sbp = 120, dbp = 80, age = 50, dm, ckd, cad, stroke, currentMedsList = [], medStatus = 'naive' } = patient;

  // Determine traffic-light color and badge
  let statusColor = '#15803d';
  let statusBg = '#f0fdf4';
  let statusBorder = '#bbf7d0';
  let statusTitle = 'ความดันโลหิตอยู่ในเกณฑ์ปกติ (Normal)';
  let statusAdvice = 'ความดันโลหิตของท่านอยู่ในระดับดีเยี่ยม! ควรรักษารูปแบบการใช้ชีวิตที่ดี กินอาหารมีประโยชน์ และออกกำลังกายสม่ำเสมอ ตรวจวัดความดันซ้ำปีละ 1 ครั้ง';

  if (sbp >= 180 || dbp >= 120) {
    statusColor = '#991b1b';
    statusBg = '#fff1f2';
    statusBorder = '#fecdd3';
    statusTitle = '🚨 ความดันโลหิตสูงระดับวิกฤต (Crisis Level)';
    statusAdvice = 'ระดับความดันโลหิตของท่านสูงมากจนอาจเกิดอันตรายต่อหลอดเลือดสมอง หัวใจ หรือไต หากมีอาการปวดศีรษะรุนแรง ตาพร่า เจ็บหน้าอก เหนื่อยหอบ หรือแขนขาอ่อนแรง ควรรีบพบแพทย์ทันที!';
  } else if (sbp >= 160 || dbp >= 100) {
    statusColor = '#dc2626';
    statusBg = '#fef2f2';
    statusBorder = '#fecaca';
    statusTitle = '🔴 ความดันโลหิตสูง ระยะที่ 2 (Stage 2)';
    statusAdvice = 'ระดับความดันโลหิตของท่านสูงชัดเจน ต้องได้รับการดูแลรักษาโดยแพทย์ ร่วมกับการปรับพฤติกรรมชีวิตและรับประทานยาอย่างสม่ำเสมอ ห้ามหยุดยาเองเด็ดขาด';
  } else if (sbp >= 140 || dbp >= 90) {
    statusColor = '#ea580c';
    statusBg = '#fff7ed';
    statusBorder = '#fed7aa';
    statusTitle = '🟠 ความดันโลหิตสูง ระยะที่ 1 (Stage 1)';
    statusAdvice = 'ระดับความดันโลหิตของท่านเริ่มสูงเข้าสู่เกณฑ์โรคความดันโลหิตสูง ควรปรึกษาแพทย์เพื่อประเมินความเสี่ยง ตรวจหาภาวะแทรกซ้อน และวางแผนการปรับพฤติกรรมหรือเริ่มยา';
  } else if ((sbp >= 130 && sbp <= 139) || (dbp >= 80 && dbp <= 89)) {
    statusColor = '#b45309';
    statusBg = '#fffbeb';
    statusBorder = '#fde68a';
    statusTitle = '🟡 ความดันโลหิตกลุ่มเสี่ยง (BP at risk)';
    statusAdvice = 'ระดับความดันของท่านเริ่มปริ่มสูง (กลุ่มเสี่ยงใหม่ตามคำแนะนำปี 2567) มีโอกาสพัฒนาเป็นโรคความดันโลหิตสูงได้ง่าย ควรลดเค็ม คุมน้ำหนัก และวัดความดันที่บ้านเป็นประจำ';
  } else if ((sbp >= 120 && sbp <= 129) && (dbp >= 80 && dbp <= 84)) {
    statusColor = '#0284c7';
    statusBg = '#f0f9ff';
    statusBorder = '#bae6fd';
    statusTitle = '🔵 ความดันโลหิตสูงระดับก่อนเป็นโรค (Pre-hypertension)';
    statusAdvice = 'ความดันเริ่มสูงกว่าระดับอุดมคติเล็กน้อย ปรับอาหารและออกกำลังกายจะช่วยดึงกลับมาเป็นปกติได้โดยไม่ต้องใช้ยา';
  }

  // Simple Target explanation
  let simpleTarget = targetBP && targetBP.thai ? targetBP.thai.text : 'SBP 120–130, DBP 70–79 mmHg';
  let simpleTargetReason = '';
  if (age > 65) {
    simpleTargetReason = 'สำหรับผู้สูงอายุ แนะนำให้คุมความดันตัวบนอยู่ที่ 130–139 mmHg และตัวล่าง 70–79 mmHg เพื่อความปลอดภัย ป้องกันอาการหน้ามืดวิงเวียนเวลาเปลี่ยนท่าทาง';
  } else {
    simpleTargetReason = 'สำหรับวัยทำงานและผู้มีโรคประจำตัว แนะนำให้ควบคุมให้อยู่ที่ 120–130 mmHg และตัวล่าง 70–79 mmHg เพื่อปกป้องหลอดเลือดสมอง หัวใจ และชะลอไตเสื่อมได้ดีที่สุด';
  }

  // Medication status html
  let medsHtml = '';
  if (medStatus === 'treated' && currentMedsList && currentMedsList.length > 0) {
    const medItems = currentMedsList.map(m => {
      let freqText = 'วันละ 1 ครั้ง';
      if (m.freq === 'bid') freqText = 'วันละ 2 ครั้ง (เช้า-เย็น)';
      else if (m.freq === 'tid') freqText = 'วันละ 3 ครั้ง';
      else if (m.freq === 'qhs') freqText = 'วันละ 1 ครั้ง ก่อนนอน';
      
      const spcTag = m.isSPC ? '<span style="background:#e0e7ff; color:#3730a3; padding:2px 8px; border-radius:12px; font-size:0.75rem; font-weight:600; margin-left:6px;">ยาเม็ดรวม Single-Pill</span>' : '';
      return `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <span style="font-weight:700; color:#0f172a; font-size:0.95rem;">${m.genericName || m.name}</span>
            ${spcTag}
            <div style="color:#64748b; font-size:0.82rem; margin-top:2px;">กลุ่มยา: ${m.className || m.class || 'ยาลดความดัน'}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:700; color:#2563eb; font-size:0.95rem;">${m.doseMg} มก.</div>
            <div style="color:#475569; font-size:0.82rem;">${freqText}</div>
          </div>
        </div>
      `;
    }).join('');

    const isControlled = medPlan && medPlan.controlStatus ? medPlan.controlStatus.isControlled : false;
    const ctrlBadge = isControlled
      ? `<div style="background:#dcfce7; border:1px solid #86efac; color:#166534; padding:8px 12px; border-radius:6px; font-size:0.88rem; font-weight:600; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
          <span>✅</span> ควบคุมความดันได้ตามเป้าหมาย — โปรดรับประทานยาอย่างต่อเนื่อง ห้ามหยุดยาเองแม้ความดันจะปกติแล้ว
        </div>`
      : `<div style="background:#fef2f2; border:1px solid #fecaca; color:#991b1b; padding:8px 12px; border-radius:6px; font-size:0.88rem; font-weight:600; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
          <span>⚠️</span> ความดันโลหิตยังสูงกว่าเป้าหมาย — โปรดรับประทานยาตามแพทย์สั่งอย่างเคร่งครัด และปรึกษาแพทย์ในนัดถัดไปเพื่อพิจารณาปรับขนาดยาหรือเพิ่มชนิดยา
        </div>`;

    medsHtml = `
      <div class="patient-card" style="margin-top:16px; border-left: 5px solid #0d9488;">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
          <span style="font-size:1.6rem;">💊</span>
          <div>
            <h3 style="margin:0; color:#0f766e; font-size:1.15rem;">ยาลดความดันโลหิตที่ท่านรับประทานในปัจจุบัน (${currentMedsList.length} รายการ)</h3>
            <p style="margin:2px 0 0 0; color:#475569; font-size:0.88rem;">รับประทานยาสม่ำเสมอตรงเวลา และนำซองยามาด้วยทุกครั้งที่พบแพทย์</p>
          </div>
        </div>
        ${ctrlBadge}
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${medItems}
        </div>
      </div>
    `;
  } else {
    medsHtml = `
      <div class="patient-card" style="margin-top:16px; border-left: 5px solid #64748b;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:1.6rem;">🌿</span>
          <div>
            <h3 style="margin:0; color:#334155; font-size:1.15rem;">ประวัติการใช้ยา: ยังไม่เคยได้รับประทานยาลดความดัน (Treatment-Naïve)</h3>
            <p style="margin:2px 0 0 0; color:#475569; font-size:0.88rem;">${sbp >= 140 || dbp >= 90 ? 'ความดันโลหิตของท่านสูงกว่าเกณฑ์ปกติ หากแพทย์พิจารณาเริ่มยา ควรรับประทานต่อเนื่องควบคู่กับการปรับพฤติกรรม' : 'เน้นการดูแลสุขภาพ ปรับเปลี่ยนพฤติกรรมชีวิต และตรวจวัดความดันโลหิตซ้ำเป็นประจำ'}</p>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <!-- Top Patient Status Banner -->
    <div class="patient-card status-banner" style="background:${statusBg}; border-color:${statusBorder};">
      <div class="patient-status-header">
        <div class="patient-status-indicator" style="background:${statusColor};"></div>
        <div>
          <h2 style="color:${statusColor}; margin:0; font-size:1.35rem; font-weight:700;">${statusTitle}</h2>
          <p style="margin:4px 0 0 0; color:#475569; font-size:0.95rem;">ผลการประเมินจากความดันล่าสุดของท่าน: <strong>${sbp}/${dbp} mmHg</strong></p>
        </div>
      </div>
      <p style="margin:12px 0 0 0; color:#1e293b; font-size:0.95rem; line-height:1.6;">${statusAdvice}</p>
    </div>

    <!-- Gauge / Visual Numbers Explanation Grid -->
    <div class="patient-grid-2" style="margin-top:16px;">
      <!-- SBP Card -->
      <div class="patient-card num-card">
        <div class="num-card-title">ความดันตัวบน (Systolic BP)</div>
        <div class="num-card-value" style="color:${sbp >= 140 ? '#dc2626' : (sbp >= 130 ? '#b45309' : '#15803d')};">
          ${sbp} <span class="num-unit">mmHg</span>
        </div>
        <div class="num-card-desc">
          คือแรงดันเลือดขณะหัวใจบีบตัวสูบฉีดเลือดไปเลี้ยงร่างกาย เกณฑ์ปกติคือ <strong>น้อยกว่า 120 mmHg</strong>
        </div>
      </div>

      <!-- DBP Card -->
      <div class="patient-card num-card">
        <div class="num-card-title">ความดันตัวล่าง (Diastolic BP)</div>
        <div class="num-card-value" style="color:${dbp >= 90 ? '#dc2626' : (dbp >= 80 ? '#b45309' : '#15803d')};">
          ${dbp} <span class="num-unit">mmHg</span>
        </div>
        <div class="num-card-desc">
          คือแรงดันเลือดขณะหัวใจคลายตัว เกณฑ์ปกติคือ <strong>น้อยกว่า 80 mmHg</strong>
        </div>
      </div>
    </div>

    <!-- Personal Target BP Section -->
    <div class="patient-card" style="margin-top:16px; border-left: 5px solid #2563eb;">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:1.6rem;">🎯</span>
        <div>
          <h3 style="margin:0; color:#1e3a8a; font-size:1.15rem;">เป้าหมายความดันโลหิตที่เหมาะสมสำหรับท่าน</h3>
          <div style="font-size:1.4rem; font-weight:800; color:#2563eb; margin:4px 0;">${simpleTarget}</div>
        </div>
      </div>
      <p style="margin:8px 0 0 0; color:#475569; font-size:0.92rem; line-height:1.5;">${simpleTargetReason}</p>
    </div>

    <!-- Current Medications & Adherence Advice -->
    ${medsHtml}

    <!-- Thai DASH Diet & 5 Lifestyle Pillars -->
    <div class="patient-card" style="margin-top:16px;">
      <h3 style="margin:0 0 12px 0; color:#0f172a; font-size:1.15rem; display:flex; align-items:center; gap:8px;">
        <span>🥗</span> 5 หัวใจสำคัญในการปรับเปลี่ยนพฤติกรรมลดความดันโลหิต (Thai DASH & Lifestyle)
      </h3>
      <div class="lifestyle-action-grid">
        <div class="action-item">
          <div class="action-icon">🧂</div>
          <div>
            <strong>1. ลดเค็ม ลดโซเดียม (ลดได้ 5–8 mmHg)</strong>
            <p>จำกัดโซเดียมไม่เกิน 2,000 มก./วัน เทียบเท่าเกลือแกงไม่เกิน 1 ช้อนชา หรือน้ำปลา/ซีอิ๊วไม่เกิน 3–4 ช้อนชาต่อวัน หลีกเลี่ยงการซดน้ำแกงจนหมดชาม งดอาหารหมักดอง บะหมี่กึ่งสำเร็จรูป ปลาร้า และหมูยอ</p>
          </div>
        </div>

        <div class="action-item">
          <div class="action-icon">🥦</div>
          <div>
            <strong>2. รับประทานอาหารแบบ DASH Diet (ลดได้ 8–14 mmHg)</strong>
            <p>เน้นผักผลไม้สดที่มีกากใยและโพแทสเซียมสูง เช่น ผักใบเขียว กล้วย ส้ม แก้วมังกร มะละกอ ถั่ว ธัญพืชไม่ขัดสี และปลา เลี่ยงเนื้อสัตว์ติดมันและของทอด</p>
          </div>
        </div>

        <div class="action-item">
          <div class="action-icon">🏃</div>
          <div>
            <strong>3. ออกกำลังกายแบบแอโรบิกสม่ำเสมอ (ลดได้ 4–9 mmHg)</strong>
            <p>เดินเร็ว วิ่งเหยาะ ว่ายน้ำ หรือปั่นจักรยาน อย่างน้อย 30 นาที/วัน 5 วัน/สัปดาห์ (รวม 150 นาที/สัปดาห์) ช่วยให้หลอดเลือดยืดหยุ่นดีขึ้น</p>
          </div>
        </div>

        <div class="action-item">
          <div class="action-icon">⚖️</div>
          <div>
            <strong>4. ควบคุมน้ำหนักตัว (ลดน้ำหนัก 1 กก. ลดความดันได้ 1 mmHg)</strong>
            <p>ควบคุมดัชนีมวลกาย (BMI) ให้อยู่ในช่วง 18.5–22.9 kg/m² และรอบเอวไม่เกิน 90 ซม. ในผู้ชาย หรือ 80 ซม. ในผู้หญิง</p>
          </div>
        </div>

        <div class="action-item">
          <div class="action-icon">🚭</div>
          <div>
            <strong>5. งดสูบบุหรี่และจำกัดแอลกอฮอล์ (ลดได้ 2–4 mmHg)</strong>
            <p>สารนิโคตินทำให้หลอดเลือดหดเกร็งทันที การงดสูบบุหรี่ช่วยลดความเสี่ยงเส้นเลือดหัวใจและสมองตีบตันได้ทันที</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 7-2-2 Home BP Monitoring Protocol -->
    <div class="patient-card" style="margin-top:16px; background:#f8fafc;">
      <h3 style="margin:0 0 10px 0; color:#0f172a; font-size:1.15rem; display:flex; align-items:center; gap:8px;">
        <span>🏠</span> วิธีการวัดความดันโลหิตที่บ้านด้วยตนเอง (กฎ 7-2-2 Home BP Protocol)
      </h3>
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:14px;">
        <ul style="margin:0; padding-left:20px; color:#334155; line-height:1.7; font-size:0.92rem;">
          <li><strong>วัดติดต่อกัน 7 วัน:</strong> โดยเฉพาะในสัปดาห์ก่อนมาพบแพทย์</li>
          <li><strong>วันละ 2 ช่วงเวลา:</strong>
            <ul>
              <li><strong>ช่วงเช้า:</strong> ภายใน 1 ชั่วโมงหลังตื่นนอน ปัสสาวะเรียบร้อยแล้ว และ <em>ก่อน</em> รับประทานอาหารเช้าหรือยากิน</li>
              <li><strong>ช่วงเย็น:</strong> ก่อนเข้านอน</li>
            </ul>
          </li>
          <li><strong>ช่วงละ 2 ครั้ง:</strong> นั่งพักนิ่งๆ 5 นาที ไม่พูดคุย ไม่ไขว่ห้าง วัดครั้งที่ 1 รอ 1 นาที แล้ววัดครั้งที่ 2 จากนั้นจดบันทึกค่าเฉลี่ย</li>
          <li><strong>ใช้เครื่องวัดแบบต้นแขน:</strong> ที่ได้มาตรฐาน พันแถบรัดแขน (Cuff) ให้อยู่ระดับเดียวกับหัวใจ</li>
        </ul>
      </div>
      <div style="margin-top:12px; display:flex; justify-content:flex-end;">
        <button type="button" class="btn btn-secondary" onclick="window.printPatientHandout()">
          📄 พิมพ์ใบคำแนะนำและตารางจดความดันที่บ้าน (Print A4)
        </button>
      </div>
    </div>

    <!-- Red Flag Warning Signs -->
    <div class="patient-card red-flags-card" style="margin-top:16px;">
      <h3 style="margin:0 0 8px 0; color:#991b1b; font-size:1.15rem; display:flex; align-items:center; gap:8px;">
        <span>🚨</span> สัญญาณเตือนอันตราย! ต้องรีบพบแพทย์หรือโทร 1669 ทันที
      </h3>
      <p style="margin:0 0 10px 0; color:#7f1d1d; font-size:0.9rem;">หากท่านมีความดันโลหิตสูงร่วมกับมีอาการผิดปกติข้อใดข้อหนึ่งต่อไปนี้ เป็นสัญญาณเตือนว่าหลอดเลือดสมอง หัวใจ หรือไตกำลังได้รับความเสียหายเฉียบพลัน:</p>
      <div class="red-flags-grid">
        <div class="red-flag-pill">⚡ ปวดศีรษะรุนแรงเฉียบพลันอย่างที่ไม่เคยเป็นมาก่อน</div>
        <div class="red-flag-pill">👁️ ตาพร่ามัว มองเห็นภาพซ้อน หรือตาบอดชั่วขณะ</div>
        <div class="red-flag-pill">💔 เจ็บแน่นหน้าอกรุนแรง เหมือนมีอะไรมาทับ ร้าวไปกราม/แขน</div>
        <div class="red-flag-pill">🫁 เหนื่อยหอบ หายใจไม่ทัน นอนราบไม่ได้</div>
        <div class="red-flag-pill">🗣️ ปากเบี้ยว หน้าเบี้ยว แขนขาอ่อนแรงข้างใดข้างหนึ่ง พูดไม่ชัด (อาการ Stroke)</div>
        <div class="red-flag-pill">💫 วิงเวียนศีรษะ เดินเซ สับสน ชัก หรือหมดสติ</div>
      </div>
    </div>
  `;
}

function printPatientHandout() {
  if (typeof window.openPrintPreviewModal === 'function') {
    window.openPrintPreviewModal('patient');
  } else {
    document.body.classList.add('print-mode-patient');
    window.print();
  }
}

// Export functions to window and module
if (typeof window !== 'undefined') {
  window.renderPatientDashboard = renderPatientDashboard;
  window.printPatientHandout = printPatientHandout;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderPatientDashboard, printPatientHandout };
}
