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
  const physicianName = localStorage.getItem('physicianName');
  if (physicianName) {
    console.log('Physician Name:', physicianName);
  }

  const backBtn = document.getElementById('backBtn');
  const recordBtn = document.getElementById('recordBtn');
  const recordBtnText = document.getElementById('recordBtnText');
  const recordBtnIcon = document.getElementById('recordBtnIcon');
  const recordingDurationDiv = document.getElementById('recordingDuration');
  const durationSecondsSpan = document.getElementById('durationSeconds');
  
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
    const patientForm = document.getElementById('patientForm');
    // if (!patientForm.checkValidity()) {
    //   alert('Please fill out all patient details.');
    //   // Optionally, you can add code here to highlight the invalid fields.
    //   return;
    // }

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

      // Get patient details from the form
      const patientName = document.getElementById('patientName').value;
      const nationalId = document.getElementById('nationalId').value;
      const patientAge = document.getElementById('patientAge').value;
      const patientGender = document.getElementById('patientGender').value;
      const patientBGDisease = document.getElementById('patientBGDisease').value;

      // Send audio and patient data to webhook
      const response = await fetch(WEBHOOKS.COUGH_ANALYSIS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Audio,
          timestamp: new Date().toISOString(),
          patientName: patientName,
          nationalId: nationalId,
          patientAge: patientAge,
          patientGender: patientGender,
          patientBGDisease: patientBGDisease,
          physicianName: localStorage.getItem('physicianName') || ''
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
