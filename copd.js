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
  resultHtml += `<p><strong>FEV<sub>1</sub>% provided:</strong> ${fev1percent}%</p>`;
  resultHtml += `<p><strong>mMRC score:</strong> ${mmrc}</p>`;
  resultHtml += `<p><strong>Number of moderate exacerbations:</strong> ${exacerbations}</p>`;
  resultHtml += `<p><strong>Number of hospitalizations:</strong> ${hospitalizations}</p>`;
  resultHtml += `<p><strong>Inhalers used:</strong> ${inhalers.length > 0 ? inhalers.join(', ') : 'None selected'}</p>`;
  if (frequency) {
    resultHtml += `<p><strong>Inhaler use frequency:</strong> ${frequency} times per week</p>`;
  }
  // Display the result and hide the form
  document.getElementById('copdForm').style.display = 'none';
  const resultDiv = document.getElementById('copdResult');
  resultDiv.innerHTML = resultHtml;
  resultDiv.style.display = 'block';
  resultDiv.scrollIntoView({ behavior: 'smooth' });
}