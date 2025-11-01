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

// Audio recording functionality
let mediaRecorder = null;
let audioChunks = [];
let recordedAudioBlob = null;
let isRecording = false;
let recordingStartTime = null;
let recordingDuration = 0;
let recordingTimer = null;

document.addEventListener('DOMContentLoaded', function() {
  const backBtn = document.getElementById('backBtn');
  const recordBtn = document.getElementById('recordBtn');
  const recordBtnText = document.getElementById('recordBtnText');
  const recordBtnIcon = document.getElementById('recordBtnIcon');
  const recordingDurationDiv = document.getElementById('recordingDuration');
  const durationSecondsSpan = document.getElementById('durationSeconds');
  
  // Load passport data from sessionStorage
  loadPassportData();
  
  // Load and display previous recording duration if exists
  loadRecordingDuration();

  // Back button navigation
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      if (isRecording) {
        stopRecording();
      }
      window.location.href = 'index.html';
    });
  }

  // Record button - two-state toggle functionality
  if (recordBtn) {
    recordBtn.addEventListener('click', function() {
      if (!isRecording) {
        startRecording();
      } else {
        stopRecording();
      }
    });
  }

  // // Function to load passport data
  // function loadPassportData() {
  //   const passportDataStr = sessionStorage.getItem('passportData');
  //   const nameField = document.getElementById('nameField');
  //   const dobField = document.getElementById('dobField');
  //   const passportField = document.getElementById('passportField');
  //   const nationalityField = document.getElementById('nationalityField');
  //   const expirationField = document.getElementById('expirationField');
  //   const loadingIndicator = document.getElementById('loadingIndicator');

  //   if (passportDataStr) {
  //     try {
  //       let parsedData = JSON.parse(passportDataStr);
        
  //       // Handle array response - webhook returns an array with one object
  //       const data = Array.isArray(parsedData) ? parsedData[0] : parsedData;
        
  //       console.log('Passport data:', data); // Debug log
        
  //       // Remove loading indicator
  //       if (loadingIndicator) {
  //         loadingIndicator.remove();
  //       }

  //       // Display full name
  //       if (nameField && data.fullName) {
  //         nameField.innerHTML = `
  //           ${data.fullName}
  //           <span class="material-symbols-outlined text-green-500 text-xl">check_circle</span>
  //         `;
  //       } else if (nameField) {
  //         nameField.innerHTML = `
  //           <span class="text-slate-400">Not available</span>
  //         `;
  //       }

  //       // Display date of birth
  //       if (dobField && data.dateOfBirth) {
  //         dobField.innerHTML = `
  //           ${data.dateOfBirth}
  //           <span class="material-symbols-outlined text-green-500 text-xl">check_circle</span>
  //         `;
  //       } else if (dobField) {
  //         dobField.innerHTML = `
  //           <span class="text-slate-400">Not available</span>
  //         `;
  //       }

  //       // Display passport number
  //       if (passportField && data.passportNumber) {
  //         passportField.innerHTML = `
  //           ${data.passportNumber}
  //           <span class="material-symbols-outlined text-green-500 text-xl">check_circle</span>
  //         `;
  //       } else if (passportField) {
  //         passportField.innerHTML = `
  //           <span class="text-slate-400">Not available</span>
  //         `;
  //       }

  //       // Display nationality
  //       if (nationalityField && data.nationality) {
  //         nationalityField.innerHTML = `
  //           ${data.nationality}
  //           <span class="material-symbols-outlined text-green-500 text-xl">check_circle</span>
  //         `;
  //       } else if (nationalityField) {
  //         nationalityField.innerHTML = `
  //           <span class="text-slate-400">Not available</span>
  //         `;
  //       }

  //       // Display expiration date
  //       if (expirationField && data.expirationDate) {
  //         expirationField.innerHTML = `
  //           ${data.expirationDate}
  //           <span class="material-symbols-outlined text-green-500 text-xl">check_circle</span>
  //         `;
  //       } else if (expirationField) {
  //         expirationField.innerHTML = `
  //           <span class="text-slate-400">Not available</span>
  //         `;
  //       }

  //     } catch (error) {
  //       console.error('Error parsing passport data:', error);
  //       console.error('Raw data:', passportDataStr);
  //       if (loadingIndicator) {
  //         loadingIndicator.textContent = 'Error loading data';
  //         loadingIndicator.classList.add('text-red-500');
  //       }
  //     }
  //   } else {
  //     // No data found
  //     console.warn('No passport data in sessionStorage');
  //     if (loadingIndicator) {
  //       loadingIndicator.textContent = 'No data available';
  //       loadingIndicator.classList.add('text-red-500');
  //     }
  //   }
  // }

  // Function to load and display previous recording duration
  function loadRecordingDuration() {
    const savedDuration = sessionStorage.getItem('recordingDuration');
    const recordingDurationDiv = document.getElementById('recordingDuration');
    const durationSecondsSpan = document.getElementById('durationSeconds');
    
    if (savedDuration && recordingDurationDiv && durationSecondsSpan) {
      // Show the duration display
      recordingDurationDiv.classList.remove('hidden');
      durationSecondsSpan.textContent = savedDuration;
      
      console.log('Loaded previous recording duration:', savedDuration, 'seconds');
    }
  }

  // Function to start recording
  async function startRecording() {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      isRecording = true;
      recordingStartTime = Date.now();
      recordingDuration = 0;

      // Start timer to update duration display
      if (durationSecondsSpan) {
        durationSecondsSpan.textContent = '0.0';
      }
      if (recordingDurationDiv) {
        recordingDurationDiv.classList.remove('hidden');
      }
      
      recordingTimer = setInterval(() => {
        recordingDuration = (Date.now() - recordingStartTime) / 1000;
        if (durationSecondsSpan) {
          durationSecondsSpan.textContent = recordingDuration.toFixed(1);
        }
      }, 100); // Update every 100ms for smooth animation

      mediaRecorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener('stop', () => {
        recordedAudioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        
        // Calculate final duration
        recordingDuration = (Date.now() - recordingStartTime) / 1000;
        
        // Save recording duration to sessionStorage
        sessionStorage.setItem('recordingDuration', recordingDuration.toFixed(1));
        
        // Update final display
        if (durationSecondsSpan) {
          durationSecondsSpan.textContent = recordingDuration.toFixed(1);
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Automatically send to backend after recording stops
        runCoughTest();
      });

      mediaRecorder.start();

      // Update button appearance
      if (recordBtnText) {
        recordBtnText.textContent = 'Recording, Press to Stop';
      }
      if (recordBtn) {
        recordBtn.classList.add('bg-red-600');
        recordBtn.classList.remove('bg-primary', 'animate-pulse-subtle');
      }

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please ensure microphone permissions are granted.');
      isRecording = false;
      
      // Clear timer if error occurs
      if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
      }
    }
  }

  // Function to stop recording
  function stopRecording() {
    if (!isRecording || !mediaRecorder) return;

    // Stop the timer
    if (recordingTimer) {
      clearInterval(recordingTimer);
      recordingTimer = null;
    }

    mediaRecorder.stop();
    isRecording = false;

    // Disable button while processing
    if (recordBtn) {
      recordBtn.disabled = true;
      recordBtn.classList.remove('bg-red-600');
      recordBtn.classList.add('bg-slate-500');
    }
    
    // Update button text to show processing
    if (recordBtnText) {
      recordBtnText.textContent = 'Processing...';
    }
  }

  // Function to run cough test
  async function runCoughTest() {
    if (!recordedAudioBlob) {
      alert('Please record a cough sample first.');
      return;
    }

    // Keep button disabled and show processing state
    if (recordBtn) {
      recordBtn.disabled = true;
    }
    if (recordBtnText) {
      recordBtnText.textContent = 'Sending to server...';
    }

    try {
      // Convert audio blob to base64
      const base64AudioWithPrefix = await blobToBase64(recordedAudioBlob);
      
      // Remove the data URL prefix (data:audio/wav;base64,)
      const base64Audio = base64AudioWithPrefix.split(',')[1];

      // Send audio to webhook
      const response = await fetch(WEBHOOKS.COUGH_ANALYSIS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Audio,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Cough analysis response:', data);

      // Store the response data in sessionStorage for use in next page
      sessionStorage.setItem('coughAnalysisData', JSON.stringify(data));

      // Navigate to show_result.html
      window.location.href = 'show_result.html';

    } catch (error) {
      console.error('Error sending audio to webhook:', error);
      alert('Failed to analyze cough sample. Please try again.');
      
      // Reset button state to allow retry
      if (recordBtn) {
        recordBtn.disabled = false;
        recordBtn.classList.remove('bg-slate-500');
        recordBtn.classList.add('bg-primary', 'animate-pulse-subtle');
      }
      if (recordBtnText) {
        recordBtnText.textContent = 'Start Recording Cough Sample';
      }
    }
  }

  // Helper function to convert blob to base64
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
});
