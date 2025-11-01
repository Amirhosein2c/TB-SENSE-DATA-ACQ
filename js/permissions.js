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
      const micPermission = await navigator.permissions.query({
        name: "microphone",
      });

      // console.log('Camera permission:', cameraPermission.state);
      console.log("Microphone permission:", micPermission.state);

      // if (cameraPermission.state === 'granted' && micPermission.state === 'granted') {
      //   this.permissionsGranted = true;
      //   return true;
      // }

      if (micPermission.state === "granted") {
        this.permissionsGranted = true;
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking permissions:", error);
      return false;
    }
  }

  // Request permissions proactively
  async requestPermissions() {
    try {
      // Request both camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        // video: true,
        audio: true,
      });

      // Permissions granted - stop the stream immediately
      stream.getTracks().forEach((track) => track.stop());

      this.permissionsGranted = true;

      // Store that permissions were granted
      localStorage.setItem("tbsense_permissions_granted", "true");

      console.log("Permissions granted successfully");
      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);

      if (error.name === "NotAllowedError") {
        alert(
          "Camera and microphone access are required for this app to function. Please grant permissions in your browser settings."
        );
      } else if (error.name === "NotFoundError") {
        alert("No camera or microphone found on this device.");
      }

      return false;
    }
  }

  // Initialize permissions on app load
  async initialize() {
    // Check if we've already requested permissions
    const previouslyGranted = localStorage.getItem(
      "tbsense_permissions_granted"
    );

    if (previouslyGranted === "true") {
      // Verify permissions are still granted
      const stillGranted = await this.checkPermissions();
      if (stillGranted) {
        console.log("Permissions already granted");
        this.keepMicrophoneActive();
        return true;
      }
    }

    // First time or permissions revoked - request them
    console.log("Requesting permissions for the first time...");
    const granted = await this.requestPermissions();
    if (granted) {
      this.keepMicrophoneActive();
    }
    return granted;
  }

  // Keep microphone permission active while app is open
  async keepMicrophoneActive() {
    try {
      if (this.activeMicStream) {
        return;
      }

      this.activeMicStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      console.log("Microphone stream active and permission maintained.");

      // Periodically check permission every 2 minutes
      setInterval(async () => {
        const micPermission = await navigator.permissions.query({
          name: "microphone",
        });
        if (micPermission.state !== "granted") {
          console.warn("Microphone permission lost, re-requesting...");
          await this.requestPermissions();
        }
      }, 120000);
    } catch (error) {
      console.error("Error keeping microphone active:", error);
    }
  }

  // // Get camera stream (will not prompt if already granted)
  // async getCameraStream() {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: { facingMode: 'environment' } // Use back camera on mobile
  //     });
  //     return stream;
  //   } catch (error) {
  //     console.error('Error accessing camera:', error);
  //     throw error;
  //   }
  // }

  // Get microphone stream (will not prompt if already granted)
  async getMicrophoneStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      return stream;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      throw error;
    }
  }
}

// Create global instance
window.permissionManager = new PermissionManager();

// Initialize permissions when the page loads
document.addEventListener("DOMContentLoaded", async function () {
  // Only request permissions on index page or first visit
  const currentPage = window.location.pathname;

  // Apply permission logic to both index and cough_record pages
  if (
    currentPage.includes("index.html") ||
    currentPage.includes("cough_record.html") ||
    currentPage === "/" ||
    currentPage.endsWith("/")
  ) {
    // Warn if running on insecure context
    if (location.protocol !== "https:" && location.hostname !== "localhost") {
      console.warn(
        "⚠️ Microphone access requires HTTPS or localhost. Please run the app on https://localhost or a secure server."
      );
      alert(
        "Microphone access is blocked because this page is not served over HTTPS. Please use https://localhost or a secure connection."
      );
    }

    // Force permission request on load
    await window.permissionManager.initialize();

    // Add fallback: re-request permission on first user interaction
    const ensureMicAccess = async () => {
      const granted = await window.permissionManager.checkPermissions();
      if (!granted) {
        console.warn(
          "Microphone permission not yet granted, requesting again..."
        );
        await window.permissionManager.requestPermissions();
      }
    };

    document.body.addEventListener("click", ensureMicAccess, { once: true });
    document.body.addEventListener("touchstart", ensureMicAccess, {
      once: true,
    });
  }
});
