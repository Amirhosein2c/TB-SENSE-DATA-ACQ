// Tailwind CSS Configuration
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#1193d4",
        "background-light": "#f6f7f8",
        "background-dark": "#101c22",
      },
      fontFamily: {
        "display": ["Public Sans"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
}

// Load passport data when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadPassportData();
  loadCoughAnalysisData();
  setupNavigationButtons();
});

// Function to setup navigation buttons
function setupNavigationButtons() {
  const retakeBtn = document.getElementById('retakeBtn');
  const acceptBtn = document.getElementById('acceptBtn');

  // Retake button - go back to cough_record.html to record again
  if (retakeBtn) {
    retakeBtn.addEventListener('click', function() {
      // Navigate back to cough recording page
      // The passport data remains in sessionStorage for the user to try again
      window.location.href = 'cough_record.html';
    });
  }

  // Accept and Save button - start new patient flow
  if (acceptBtn) {
    acceptBtn.addEventListener('click', function() {
      // Clear all data from sessionStorage for new patient
      sessionStorage.clear();
      
      // Navigate to passport scan page to start fresh
      window.location.href = 'passport_scan.html';
    });
  }
}


// Function to load passport data from sessionStorage
function loadPassportData() {
  const passportDataStr = sessionStorage.getItem('passportData');
  const nameField = document.getElementById('nameField');
  const dobField = document.getElementById('dobField');
  const passportField = document.getElementById('passportField');
  const nationalityField = document.getElementById('nationalityField');
  const expirationField = document.getElementById('expirationField');

  if (passportDataStr) {
    try {
      let parsedData = JSON.parse(passportDataStr);
      
      // Handle array response - webhook returns an array with one object
      const data = Array.isArray(parsedData) ? parsedData[0] : parsedData;
      
      console.log('Passport data in results:', data);

      // Display full name
      if (nameField && data.fullName) {
        nameField.textContent = data.fullName;
      } else if (nameField) {
        nameField.innerHTML = '<span class="text-slate-400">Not available</span>';
      }

      // Display date of birth
      if (dobField && data.dateOfBirth) {
        dobField.textContent = data.dateOfBirth;
      } else if (dobField) {
        dobField.innerHTML = '<span class="text-slate-400">Not available</span>';
      }

      // Display passport number
      if (passportField && data.passportNumber) {
        passportField.textContent = data.passportNumber;
      } else if (passportField) {
        passportField.innerHTML = '<span class="text-slate-400">Not available</span>';
      }

      // Display nationality
      if (nationalityField && data.nationality) {
        nationalityField.textContent = data.nationality;
      } else if (nationalityField) {
        nationalityField.innerHTML = '<span class="text-slate-400">Not available</span>';
      }

      // Display expiration date
      if (expirationField && data.expirationDate) {
        expirationField.textContent = data.expirationDate;
      } else if (expirationField) {
        expirationField.innerHTML = '<span class="text-slate-400">Not available</span>';
      }

    } catch (error) {
      console.error('Error parsing passport data:', error);
      console.error('Raw data:', passportDataStr);
      
      // Show error in all fields
      if (nameField) nameField.innerHTML = '<span class="text-red-500">Error loading data</span>';
      if (dobField) dobField.innerHTML = '<span class="text-red-500">Error loading data</span>';
      if (passportField) passportField.innerHTML = '<span class="text-red-500">Error loading data</span>';
      if (nationalityField) nationalityField.innerHTML = '<span class="text-red-500">Error loading data</span>';
      if (expirationField) expirationField.innerHTML = '<span class="text-red-500">Error loading data</span>';
    }
  } else {
    // No data found
    console.warn('No passport data in sessionStorage');
    if (nameField) nameField.innerHTML = '<span class="text-slate-400">No data</span>';
    if (dobField) dobField.innerHTML = '<span class="text-slate-400">No data</span>';
    if (passportField) passportField.innerHTML = '<span class="text-slate-400">No data</span>';
    if (nationalityField) nationalityField.innerHTML = '<span class="text-slate-400">No data</span>';
    if (expirationField) expirationField.innerHTML = '<span class="text-slate-400">No data</span>';
  }
}

// Function to load cough analysis data from sessionStorage
function loadCoughAnalysisData() {
  const coughDataStr = sessionStorage.getItem('coughAnalysisData');
  const testResultField = document.getElementById('testResult');
  const sampleQualityField = document.getElementById('sampleQuality');
  
  if (coughDataStr) {
    try {
      const data = JSON.parse(coughDataStr);
      console.log('Cough analysis data:', data);
      
      // Display test result
      if (testResultField && data.result) {
        const result = data.result.toLowerCase();
        
        // Set color based on result
        let colorClass = 'text-slate-500';
        if (result === 'positive') {
          colorClass = 'text-red-500';
        } else if (result === 'negative') {
          colorClass = 'text-green-600';
        }
        
        testResultField.className = `font-bold ${colorClass}`;
        testResultField.textContent = data.result.charAt(0).toUpperCase() + data.result.slice(1);
      } else if (testResultField) {
        testResultField.className = 'font-bold text-slate-400';
        testResultField.textContent = 'Not available';
      }
      
      // Display sample quality
      if (sampleQualityField && data.quality) {
        const quality = data.quality.toLowerCase();
        
        // Set color based on quality
        let colorClass = 'text-slate-500';
        if (quality === 'good' || quality === 'acceptable' || quality === 'excellent') {
          colorClass = 'text-green-600';
        } else if (quality === 'poor' || quality === 'bad') {
          colorClass = 'text-red-500';
        } else if (quality === 'fair' || quality === 'moderate') {
          colorClass = 'text-yellow-600';
        }
        
        sampleQualityField.className = `font-medium ${colorClass}`;
        sampleQualityField.textContent = data.quality.charAt(0).toUpperCase() + data.quality.slice(1);
      } else if (sampleQualityField) {
        sampleQualityField.className = 'font-medium text-slate-400';
        sampleQualityField.textContent = 'Not available';
      }
      
    } catch (error) {
      console.error('Error parsing cough analysis data:', error);
      console.error('Raw data:', coughDataStr);
      
      // Show error
      if (testResultField) {
        testResultField.className = 'font-bold text-red-500';
        testResultField.textContent = 'Error loading data';
      }
      if (sampleQualityField) {
        sampleQualityField.className = 'font-medium text-red-500';
        sampleQualityField.textContent = 'Error loading data';
      }
    }
  } else {
    console.warn('No cough analysis data in sessionStorage');
    
    // Show no data message
    if (testResultField) {
      testResultField.className = 'font-bold text-slate-400';
      testResultField.textContent = 'No data';
    }
    if (sampleQualityField) {
      sampleQualityField.className = 'font-medium text-slate-400';
      sampleQualityField.textContent = 'No data';
    }
  }
}
