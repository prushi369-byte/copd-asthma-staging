/*
 * COPD staging script.
 * This function uses spirometry results, exacerbation history and the mMRC
 * dyspnea scale to assign a GOLD grade and ABE group according to the Global
 * Initiative for Chronic Obstructive Lung Disease (GOLD) guidelines. It then
 * displays a summary with the patient's inhaler use.
 */

function computeCOPD() {
  // Retrieve form values
  const ratio = parseFloat(document.getElementById('ratio').value);
  const fev1percent = parseFloat(document.getElementById('fev1percent').value);
  const exacerbations = parseInt(document.getElementById('exacerbations').value, 10);
  const hospitalizations = parseInt(document.getElementById('hospitalizations').value, 10);
  const mmrcInputs = document.querySelectorAll('input[name="mmrc"]');
  let mmrc = null;
  mmrcInputs.forEach(radio => {
    if (radio.checked) mmrc = parseInt(radio.value, 10);
  });
  const inhalerCheckboxes = document.querySelectorAll('input[name="inhalers"]:checked');
  const inhalers = Array.from(inhalerCheckboxes).map(cb => cb.value);
  const frequency = document.getElementById('copdFrequency').value;

  // Validate required fields (HTML required attributes handle most checks)
  if (isNaN(ratio) || isNaN(fev1percent) || isNaN(exacerbations) || isNaN(hospitalizations) || mmrc === null) {
    alert('Please fill in all required fields.');
    return;
  }

  // Determine GOLD grade based on FEV1 % predicted
  let goldGrade = '';
  let goldDescription = '';
  if (fev1percent >= 80) {
    goldGrade = 'GOLD 1 (Mild)';
    goldDescription = 'Airflow obstruction is mild with FEV₁ ≥80% predicted.';
  } else if (fev1percent >= 50) {
    goldGrade = 'GOLD 2 (Moderate)';
    goldDescription = 'Airflow obstruction is moderate with FEV₁ between 50% and 79% predicted.';
  } else if (fev1percent >= 30) {
    goldGrade = 'GOLD 3 (Severe)';
    goldDescription = 'Airflow obstruction is severe with FEV₁ between 30% and 49% predicted.';
  } else {
    goldGrade = 'GOLD 4 (Very Severe)';
    goldDescription = 'Airflow obstruction is very severe with FEV₁ <30% predicted.';
  }

  // Determine ABE group
  let abeGroup = '';
  let abeDescription = '';
  if (hospitalizations >= 1 || exacerbations >= 2) {
    abeGroup = 'Group E';
    abeDescription =
      'High risk for exacerbations: two or more moderate exacerbations or at least one hospitalization in the past year.';
  } else if (mmrc >= 2) {
    abeGroup = 'Group B';
    abeDescription =
      'Higher symptom burden: mMRC score ≥2 with 0–1 moderate exacerbations and no hospitalization in the past year.';
  } else {
    abeGroup = 'Group A';
    abeDescription =
      'Lower symptom burden: mMRC score 0–1 with 0–1 moderate exacerbations and no hospitalization in the past year.';
  }

  // Build result HTML
  let resultHtml = `<h2>Results</h2>`;
  // Confirm the diagnostic ratio
  if (ratio < 0.7) {
    resultHtml += `<p><strong>Diagnostic Criterion:</strong> Your FEV<sub>1</sub>/FVC ratio is ${ratio.toFixed(
      2
    )}, which is below the 0.70 threshold used to confirm airflow obstruction in COPD.</p>`;
  } else {
    resultHtml += `<p><strong>Diagnostic Criterion:</strong> Your FEV<sub>1</sub>/FVC ratio is ${ratio.toFixed(
      2
    )}. Values ≥0.70 are generally considered normal; consult a healthcare professional for interpretation.</p>`;
  }
  resultHtml += `<p><strong>GOLD Grade:</strong> ${goldGrade}</p>`;
  resultHtml += `<p>${goldDescription}</p>`;
  resultHtml += `<p><strong>ABE Group:</strong> ${abeGroup}</p>`;
  resultHtml += `<p>${abeDescription}</p>`;
  // Provide treatment recommendation based on the GOLD 2025 pocket guide.  The
  // recommendations are tailored to the patient’s ABE group and summarise
  // first‑line inhaler therapy as described in the GOLD guidelines.
  let copdRecommendation = '';
  if (abeGroup === 'Group A') {
    copdRecommendation +=
      '<p><strong>GOLD 2025 recommended treatment:</strong></p><ul>' +
      '<li>Offer bronchodilator therapy to relieve breathlessness; this may be a short‑acting or long‑acting bronchodilator. A long‑acting bronchodilator (LABA or LAMA) is preferred if available and affordable except in patients with very occasional breathlessness.</li>' +
      '<li>Continue treatment if benefit is documented; reassess regularly.</li>' +
      '<li>Rescue short‑acting bronchodilators should be prescribed to all patients for immediate symptom relief【525439884052066†L1210-L1211】.</li>' +
      '</ul>';
  } else if (abeGroup === 'Group B') {
    copdRecommendation +=
      '<p><strong>GOLD 2025 recommended treatment:</strong></p><ul>' +
      '<li>Initiate therapy with a combination of a long‑acting beta agonist and a long‑acting muscarinic antagonist (LABA+LAMA); clinical trials demonstrate that LABA+LAMA is superior to LAMA alone for symptom control.</li>' +
      '<li>If LABA+LAMA is not appropriate, there is no evidence to recommend one class of long‑acting bronchodilator over another; select either LABA or LAMA based on the patient’s perception of symptom relief.</li>' +
      '<li>Investigate and manage comorbidities that may contribute to symptoms.</li>' +
      '<li>Rescue short‑acting bronchodilators should be prescribed to all patients for immediate symptom relief【525439884052066†L1210-L1211】.</li>' +
      '</ul>';
  } else if (abeGroup === 'Group E') {
    copdRecommendation +=
      '<p><strong>GOLD 2025 recommended treatment:</strong></p><ul>' +
      '<li>A dual bronchodilator combination (LABA+LAMA) is the preferred initial therapy.</li>' +
      '<li>Do not initiate LABA+ICS without LAMA; if an inhaled corticosteroid is indicated (e.g., blood eosinophil count ≥300 cells/µL or concomitant asthma), use triple therapy with LABA+LAMA+ICS, which is superior to LABA+ICS.</li>' +
      '<li>Consider triple therapy at diagnosis when eosinophil count is high (≥300 cells/µL).</li>' +
      '<li>Patients with COPD and co‑existing asthma should be treated like asthma patients, making inhaled corticosteroids mandatory.</li>' +
      '<li>Rescue short‑acting bronchodilators should be prescribed to all patients for immediate symptom relief【525439884052066†L1210-L1211】.</li>' +
      '</ul>';
  }
  resultHtml += `<p><strong>FEV<sub>1</sub>% provided:</strong> ${fev1percent}%</p>`;
  resultHtml += `<p><strong>mMRC score:</strong> ${mmrc}</p>`;
  resultHtml += `<p><strong>Number of moderate exacerbations:</strong> ${exacerbations}</p>`;
  resultHtml += `<p><strong>Number of hospitalizations:</strong> ${hospitalizations}</p>`;
  resultHtml += `<p><strong>Inhalers used:</strong> ${inhalers.length > 0 ? inhalers.join(', ') : 'None selected'}</p>`;
  if (frequency) {
    resultHtml += `<p><strong>Inhaler use frequency:</strong> ${frequency} times per week</p>`;
  }
  // Append recommendation if available
  if (copdRecommendation) {
    resultHtml += copdRecommendation;
  }
  // Append a PDF download button
  resultHtml += `<button type="button" id="downloadCopdPdfBtn">Download PDF Report</button>`;
  // Display the result and hide the form
  document.getElementById('copdForm').style.display = 'none';
  const resultDiv = document.getElementById('copdResult');
  resultDiv.innerHTML = resultHtml;
  resultDiv.style.display = 'block';
  resultDiv.scrollIntoView({ behavior: 'smooth' });

  // Attach download button for PDF report after it has been added to the DOM
  const downloadBtn = document.getElementById('downloadCopdPdfBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadCopdReportPDF);
  }
}

/**
 * Generate a PDF file containing the COPD staging report using jsPDF and
 * download it to the user's device. This function extracts the plain text
 * from the result container and writes it into a PDF document.
 */
function downloadCopdReportPDF() {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert('PDF library not loaded. Please try again.');
    return;
  }
  const resultDiv = document.getElementById('copdResult');
  if (!resultDiv) return;
  const text = resultDiv.innerText.trim();
  const doc = new jsPDF();
  const lines = doc.splitTextToSize(text, 180);
  doc.setFontSize(12);
  doc.text(lines, 10, 10);
  doc.save('copd_report.pdf');
}