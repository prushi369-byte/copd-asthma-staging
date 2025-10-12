/*
 * Asthma staging script.
 * Implements a simple multi‑step questionnaire based on the Global Initiative
 * for Asthma (GINA) guidelines and other widely used criteria for classifying
 * asthma severity. It collects lung function, symptom frequency and activity
 * limitation information from the user, then determines a severity category
 * (intermittent, mild persistent, moderate persistent or severe persistent)
 * based on the most severe finding. The selected inhalers and use frequency
 * are displayed with the results for context.
 */

let currentStep = 1;
const totalSteps = 5;

// List of inhaler identifiers used in the form. These correspond to checkbox and frequency input IDs.
const inhalerList = ['SABA', 'LABA', 'ICS', 'ICS_LABA', 'LAMA', 'other'];

/**
 * Show only the active step and update navigation buttons.
 */
function showStep() {
  const steps = document.querySelectorAll('.step');
  steps.forEach((step, index) => {
    step.classList.toggle('active', index === currentStep - 1);
  });
  // Update navigation buttons
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  prevBtn.disabled = currentStep === 1;
  if (currentStep === totalSteps) {
    nextBtn.textContent = 'Submit';
  } else {
    nextBtn.textContent = 'Next';
  }
}

/**
 * Attach event listeners to inhaler checkboxes so that the corresponding
 * frequency fields are enabled only when the inhaler is selected. When
 * unchecked, the frequency input is cleared and disabled.
 */
function setupInhalerFields() {
  inhalerList.forEach(id => {
    const checkbox = document.getElementById('inh_' + id);
    const freqInput = document.getElementById('freq_' + id);
    if (!checkbox || !freqInput) return;
    // Initially disable all frequency fields (in case markup changed)
    freqInput.disabled = !checkbox.checked;
    checkbox.addEventListener('change', function () {
      freqInput.disabled = !this.checked;
      if (!this.checked) {
        freqInput.value = '';
      }
    });
  });
}

/**
 * Advance to the next step or submit the form on the final step.
 */
function nextStep() {
  // Validate current step inputs before moving on
  if (!validateCurrentStep()) return;
  if (currentStep === totalSteps) {
    // Final step: compute and display the result
    computeAsthmaStage();
    return;
  }
  currentStep++;
  showStep();
}

/**
 * Move back one step.
 */
function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep();
  }
}

/**
 * Validate required fields on the current step.
 * Returns true if all required fields are filled, otherwise false.
 */
function validateCurrentStep() {
  const stepElement = document.querySelector('.step.active');
  if (!stepElement) return true;
  const inputs = stepElement.querySelectorAll('input, select');
  for (const input of inputs) {
    if (input.hasAttribute('required') && !input.value) {
      alert('Please complete the required field before continuing.');
      return false;
    }
  }
  return true;
}

/**
 * Compute asthma stage based on collected inputs and display a summary.
 */
function computeAsthmaStage() {
  // Gather values
  const fev1 = parseFloat(document.getElementById('fev1').value);
  const daytime = document.getElementById('daytime').value;
  const nighttime = document.getElementById('nighttime').value;
  const activity = document.getElementById('activity').value;
  // Gather inhaler selections and their frequency values
  const inhalerData = [];
  inhalerList.forEach(id => {
    const cb = document.getElementById('inh_' + id);
    const freq = document.getElementById('freq_' + id);
    if (cb && cb.checked) {
      inhalerData.push({ name: cb.value, freq: freq && freq.value ? freq.value : '' });
    }
  });

  // Maps for symptom severity
  const daytimeMap = { '<=2': 1, '3-6': 2, 'daily': 3, 'throughout': 4 };
  const nighttimeMap = { '<=2': 1, '3-4': 2, '5+': 3, 'often': 4 };
  const activityMap = { 'none': 1, 'minor': 2, 'some': 3, 'extreme': 4 };

  // Determine overall severity: start with 1 (intermittent)
  let severity = 1;
  if (!isNaN(fev1)) {
    if (fev1 < 60) {
      severity = Math.max(severity, 4);
    } else if (fev1 < 80) {
      severity = Math.max(severity, 3);
    }
  }
  severity = Math.max(severity, daytimeMap[daytime] || 1);
  severity = Math.max(severity, nighttimeMap[nighttime] || 1);
  severity = Math.max(severity, activityMap[activity] || 1);

  // Determine stage name and description
  let stageName = '';
  let stageDescription = '';
  switch (severity) {
    case 1:
      stageName = 'Intermittent (Mild) Asthma';
      stageDescription =
        'Symptoms occur infrequently (≤2 days/week), with minimal nighttime waking (≤2 times/month) and no limitation of activities. Lung function (FEV₁) is typically ≥80% predicted.';
      break;
    case 2:
      stageName = 'Mild Persistent Asthma';
      stageDescription =
        'Symptoms are present on 3–6 days per week or 3–4 nights per month. There may be minor limitation of activity and FEV₁ is ≥80% predicted.';
      break;
    case 3:
      stageName = 'Moderate Persistent Asthma';
      stageDescription =
        'Symptoms occur daily and nighttime awakenings ≥5 times per month. There is some limitation of activities and lung function is between 60–80% predicted.';
      break;
    case 4:
      stageName = 'Severe Persistent Asthma';
      stageDescription =
        'Symptoms are present throughout the day, nighttime symptoms occur often, activities are extremely limited, and lung function is ≤60% predicted.';
      break;
    default:
      stageName = 'Intermittent (Mild) Asthma';
      stageDescription =
        'Symptoms occur infrequently with minimal impact on daily activities.';
  }

  // Build result HTML
  let resultHtml = `<h2>Results</h2>`;
  resultHtml += `<p><strong>Estimated Asthma Severity:</strong> ${stageName}</p>`;
  resultHtml += `<p>${stageDescription}</p>`;
  if (!isNaN(fev1)) {
    resultHtml += `<p><strong>FEV<sub>1</sub>% provided:</strong> ${fev1}%</p>`;
  }
  if (inhalerData.length > 0) {
    resultHtml += `<p><strong>Inhalers used:</strong></p><ul>`;
    inhalerData.forEach(item => {
      const freqText = item.freq ? `${item.freq} times per week` : 'frequency not specified';
      resultHtml += `<li>${item.name}: ${freqText}</li>`;
    });
    resultHtml += '</ul>';
  } else {
    resultHtml += `<p><strong>Inhalers used:</strong> None selected</p>`;
  }

  // Add a button to download the report as a PDF
  resultHtml += `<button type="button" id="downloadPdfBtn">Download PDF Report</button>`;

  // Hide the form and show the result
  document.getElementById('asthmaForm').style.display = 'none';
  const resultDiv = document.getElementById('asthmaResult');
  resultDiv.innerHTML = resultHtml;
  resultDiv.style.display = 'block';
  // scroll to result
  resultDiv.scrollIntoView({ behavior: 'smooth' });

  // Attach click handler to download button after it has been added to DOM
  const downloadBtn = document.getElementById('downloadPdfBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadAsthmaReportPDF);
  }
}

/**
 * Generate a PDF file containing the asthma staging report using jsPDF and
 * download it to the user's device. This function extracts the plain text
 * from the result container and writes it into a PDF document.
 */
function downloadAsthmaReportPDF() {
  // Ensure jsPDF is available
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert('PDF library not loaded. Please try again.');
    return;
  }
  const resultDiv = document.getElementById('asthmaResult');
  if (!resultDiv) return;
  // Extract text content; replace multiple newlines and trim spaces
  const text = resultDiv.innerText.trim();
  const doc = new jsPDF();
  const lines = doc.splitTextToSize(text, 180);
  doc.setFontSize(12);
  doc.text(lines, 10, 10);
  doc.save('asthma_report.pdf');
}

// Initialize form display on page load
window.addEventListener('DOMContentLoaded', () => {
  showStep();
  // Inhaler frequency fields are always enabled; remove dynamic disabling
});