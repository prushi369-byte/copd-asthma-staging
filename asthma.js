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
  const inhalerCheckboxes = document.querySelectorAll('input[name="inhalers"]:checked');
  const inhalers = Array.from(inhalerCheckboxes).map(cb => cb.value);
  const frequency = document.getElementById('frequency').value;

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
  resultHtml += `<p><strong>Inhalers used:</strong> ${inhalers.length > 0 ? inhalers.join(', ') : 'None selected'}</p>`;
  if (frequency) {
    resultHtml += `<p><strong>Inhaler use frequency:</strong> ${frequency} times per week</p>`;
  }

  // Hide the form and show the result
  document.getElementById('asthmaForm').style.display = 'none';
  const resultDiv = document.getElementById('asthmaResult');
  resultDiv.innerHTML = resultHtml;
  resultDiv.style.display = 'block';
  // scroll to result
  resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// Initialize form display on page load
window.addEventListener('DOMContentLoaded', () => {
  showStep();
});