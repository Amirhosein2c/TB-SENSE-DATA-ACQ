// Permission Management for Camera and Microphone
// This ensures permissions are requested once and remembered across sessions

class PermissionManager {
  constructor() {
    this.permissionsGranted = false;
  }

  // Check if permissions are already granted
  async checkPermissions() {
    try {
      // Check camera permission
      // const cameraPermission = await navigator.permissions.query({ name: 'camera' });
      const micPermission = await navigator.permissions.query({ name: 'microphone' });
      
      // console.log('Camera permission:', cameraPermission.state);
      console.log('Microphone permission:', micPermission.state);
      
      // if (cameraPermission.state === 'granted' && micPermission.state === 'granted') {
      //   this.permissionsGranted = true;
      //   return true;
      // }
      
      if ( micPermission.state === 'granted') {
        this.permissionsGranted = true;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  // Request permissions proactively
  async requestPermissions() {
    try {
      // Request both camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        // video: true, 
        audio: true 
      });
      
      // Permissions granted - stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
      
      this.permissionsGranted = true;
      
      // Store that permissions were granted
      localStorage.setItem('tbsense_permissions_granted', 'true');
      
      console.log('Permissions granted successfully');
      return true;
      
    } catch (error) {
      console.error('Error requesting permissions:', error);
      
      if (error.name === 'NotAllowedError') {
        alert('Camera and microphone access are required for this app to function. Please grant permissions in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        alert('No camera or microphone found on this device.');
      }
      
      return false;
    }
  }

  // Initialize permissions on app load
  async initialize() {
    // Check if we've already requested permissions
    const previouslyGranted = localStorage.getItem('tbsense_permissions_granted');
    
    if (previouslyGranted === 'true') {
      // Verify permissions are still granted
      const stillGranted = await this.checkPermissions();
      if (stillGranted) {
        console.log('Permissions already granted');
        return true;
      }
    }
    
    // First time or permissions revoked - request them
    console.log('Requesting permissions for the first time...');
    return await this.requestPermissions();
  }

  // Get camera stream (will not prompt if already granted)
  async getCameraStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      return stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      throw error;
    }
  }

  // Get microphone stream (will not prompt if already granted)
  async getMicrophoneStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }
}

// Create global instance
window.permissionManager = new PermissionManager();

// Initialize permissions when the page loads
document.addEventListener('DOMContentLoaded', async function() {
  // Only request permissions on index page or first visit
  const currentPage = window.location.pathname;
  
  if (currentPage.includes('index.html') || currentPage === '/' || currentPage.endsWith('/')) {
    await window.permissionManager.initialize();
  }
});
