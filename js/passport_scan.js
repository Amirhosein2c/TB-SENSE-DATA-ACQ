// Tailwind CSS Configuration
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#1193d4",
        "background-light": "#f6f7f8",
        "background-dark": "#101c22",
        "content-light": "#101c22",
        "content-dark": "#f6f7f8",
        "neon-blue": "#00F0FF",
        "neon-green": "#00FF7F"
      },
      fontFamily: {
        "display": ["Public Sans", "sans-serif"]
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

// Camera and navigation functionality
let stream = null;
let capturedImageData = null;

document.addEventListener('DOMContentLoaded', function() {
  const cameraFeed = document.getElementById('cameraFeed');
  const photoCanvas = document.getElementById('photoCanvas');
  const captureBtn = document.getElementById('captureBtn');
  const acceptBtn = document.getElementById('acceptBtn');
  const retakeBtn = document.getElementById('retakeBtn');
  const backBtn = document.getElementById('backBtn');

  // Start camera when page loads
  startCamera();

  // Back button navigation
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      stopCamera();
      window.location.href = 'index.html';
    });
  }

  // Capture photo button
  if (captureBtn) {
    captureBtn.addEventListener('click', function() {
      capturePhoto();
    });
  }

  // Retake button
  if (retakeBtn) {
    retakeBtn.addEventListener('click', function() {
      retakePhoto();
    });
  }

  // Accept and Send button
  if (acceptBtn) {
    acceptBtn.addEventListener('click', async function() {
      if (!capturedImageData) {
        alert('No image captured. Please capture a photo first.');
        return;
      }

      // Show loading state
      const acceptBtnText = document.getElementById('acceptBtnText');
      const loadingSpinner = document.getElementById('loadingSpinner');
      
      acceptBtn.disabled = true;
      retakeBtn.disabled = true;
      
      if (acceptBtnText) acceptBtnText.textContent = 'Processing...';
      if (loadingSpinner) loadingSpinner.classList.remove('hidden');

      try {
        // Send image to webhook
        const response = await fetch(WEBHOOKS.MRZ_SCAN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: capturedImageData,
            timestamp: new Date().toISOString()
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Webhook response:', data);

        // Store the response data in sessionStorage for use in next page
        sessionStorage.setItem('passportData', JSON.stringify(data));

        // Stop camera and navigate to next page
        stopCamera();
        window.location.href = 'cough_record.html';

      } catch (error) {
        console.error('Error sending image to webhook:', error);
        alert('Failed to process image. Please try again.');
        
        // Reset button state
        acceptBtn.disabled = false;
        retakeBtn.disabled = false;
        if (acceptBtnText) acceptBtnText.textContent = 'Accept and Send';
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
      }
    });
  }

  // Function to start camera
  async function startCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (cameraFeed) {
        cameraFeed.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please ensure camera permissions are granted.');
    }
  }

  // Function to stop camera
  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
  }

  // Function to capture photo
  function capturePhoto() {
    if (!cameraFeed || !photoCanvas) return;

    const context = photoCanvas.getContext('2d');
    
    // Set canvas size to match video
    photoCanvas.width = cameraFeed.videoWidth;
    photoCanvas.height = cameraFeed.videoHeight;
    
    // Draw the current video frame to canvas
    context.drawImage(cameraFeed, 0, 0, photoCanvas.width, photoCanvas.height);
    
    // Store captured image data
    // capturedImageData = photoCanvas.toDataURL('image/jpeg');
    capturedImageData = photoCanvas.toDataURL('image/jpeg').split(',')[1];
    
    // Hide video, show canvas
    cameraFeed.classList.add('hidden');
    photoCanvas.classList.remove('hidden');
    
    // Stop camera stream
    stopCamera();
    
    // Disable capture button, enable accept and retake buttons
    captureBtn.disabled = true;
    captureBtn.classList.add('opacity-50', 'cursor-not-allowed');
    acceptBtn.disabled = false;
    acceptBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    retakeBtn.disabled = false;
    retakeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }

  // Function to retake photo
  function retakePhoto() {
    // Show video, hide canvas
    cameraFeed.classList.remove('hidden');
    photoCanvas.classList.add('hidden');
    
    // Clear captured image data
    capturedImageData = null;
    
    // Restart camera
    startCamera();
    
    // Enable capture button, disable accept and retake buttons
    captureBtn.disabled = false;
    captureBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    acceptBtn.disabled = true;
    acceptBtn.classList.add('opacity-50', 'cursor-not-allowed');
    retakeBtn.disabled = true;
    retakeBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }

  // Clean up camera stream when leaving page
  window.addEventListener('beforeunload', function() {
    stopCamera();
  });
});
