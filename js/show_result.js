// Tailwind CSS Configuration
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1193d4",
        "background-light": "#f6f7f8",
        "background-dark": "#101c22",
      },
      fontFamily: {
        display: ["Public Sans"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
};

// Load passport data when page loads
document.addEventListener("DOMContentLoaded", function () {
  loadCoughAnalysisData();
  setupNavigationButtons();
});

// Function to setup navigation buttons
function setupNavigationButtons() {
  const retakeBtn = document.getElementById("retakeBtn");
  const acceptBtn = document.getElementById("acceptBtn");

  // Retake button - go back to cough_record.html to record again
  if (retakeBtn) {
    retakeBtn.addEventListener("click", function () {
      // Keep patient data in localStorage so user doesn't need to re-enter
      const patientDataStr = localStorage.getItem("patientData");
      if (patientDataStr) {
        const patientData = JSON.parse(patientDataStr);
        // Remove only the recorded audio so user can record again
        delete patientData.audio;
        localStorage.setItem("patientData", JSON.stringify(patientData));
        console.log("Retake: kept patient info, removed audio data.");
      }

      // Navigate back to cough recording page
      window.location.href = "cough_record.html";
    });
  }

  // Accept and Save button - start new patient flow
  if (acceptBtn) {
    acceptBtn.addEventListener("click", async function () {
      // Retrieve patient data from localStorage
      const patientDataStr = localStorage.getItem("patientData");
      if (!patientDataStr) {
        alert("No patient data found to send.");
        return;
      }

      const patientData = JSON.parse(patientDataStr);
      console.log("Sending stored patient data to webhook:", patientData);

      try {
        const response = await fetch(WEBHOOKS.COUGH_STORAGE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patientData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Webhook response:", data);
        // alert("Data successfully sent to backend!");

        // Clear all data from sessionStorage for new patient
        sessionStorage.clear();
        localStorage.removeItem("patientData");

        // Navigate to cough_record.html to start fresh
        window.location.href = "cough_record.html";
      } catch (error) {
        console.error("Error sending data to webhook:", error);
        alert("Failed to send data to backend. Please try again.");
      }
    });
  }

  // Display stored patient data in table
  const patientDataStr = localStorage.getItem("patientData");
  if (patientDataStr) {
    try {
      const patientData = JSON.parse(patientDataStr);
      document.getElementById("patientNameField").textContent =
        patientData.patientName || "N/A";
      document.getElementById("patientAgeField").textContent =
        patientData.patientAge || "N/A";
      document.getElementById("nationalIdField").textContent =
        patientData.nationalId || "N/A";
      document.getElementById("patientGenderField").textContent =
        patientData.patientGender || "N/A";
      document.getElementById("patientBGDiseaseField").textContent =
        patientData.patientBGDisease || "N/A";
      document.getElementById("physicianNameField").textContent =
        patientData.physicianName || "N/A";
    } catch (error) {
      console.error("Error displaying patient data:", error);
    }
  }
}

// patientName,
// nationalId,
// patientAge,
// patientGender,
// patientBGDisease,
// physicianName,

// Function to load cough analysis data from sessionStorage
function loadCoughAnalysisData() {
  const coughDataStr = sessionStorage.getItem("coughAnalysisData");
  const testResultField = document.getElementById("testResult");
  const sampleQualityField = document.getElementById("sampleQuality");

  if (coughDataStr) {
    try {
      const data = JSON.parse(coughDataStr);
      console.log("Cough analysis data:", data);

      // Display test result
      if (testResultField && data.result) {
        const result = data.result.toLowerCase();

        // Set color based on result
        let colorClass = "text-slate-500";
        if (result === "positive") {
          colorClass = "text-red-500";
        } else if (result === "negative") {
          colorClass = "text-green-600";
        }

        testResultField.className = `font-bold ${colorClass}`;
        testResultField.textContent =
          data.result.charAt(0).toUpperCase() + data.result.slice(1);
      } else if (testResultField) {
        testResultField.className = "font-bold text-slate-400";
        testResultField.textContent = "Not available";
      }

      // Display sample quality
      if (sampleQualityField && data.quality) {
        const quality = data.quality.toLowerCase();

        // Set color based on quality
        let colorClass = "text-slate-500";
        if (
          quality === "good" ||
          quality === "acceptable" ||
          quality === "excellent"
        ) {
          colorClass = "text-green-600";
        } else if (quality === "poor" || quality === "bad") {
          colorClass = "text-red-500";
        } else if (quality === "fair" || quality === "moderate") {
          colorClass = "text-yellow-600";
        }

        sampleQualityField.className = `font-medium ${colorClass}`;
        sampleQualityField.textContent =
          data.quality.charAt(0).toUpperCase() + data.quality.slice(1);
      } else if (sampleQualityField) {
        sampleQualityField.className = "font-medium text-slate-400";
        sampleQualityField.textContent = "Not available";
      }
    } catch (error) {
      console.error("Error parsing cough analysis data:", error);
      console.error("Raw data:", coughDataStr);

      // Show error
      if (testResultField) {
        testResultField.className = "font-bold text-red-500";
        testResultField.textContent = "Error loading data";
      }
      if (sampleQualityField) {
        sampleQualityField.className = "font-medium text-red-500";
        sampleQualityField.textContent = "Error loading data";
      }
    }
  } else {
    console.warn("No cough analysis data in sessionStorage");

    // Show no data message
    if (testResultField) {
      testResultField.className = "font-bold text-slate-400";
      testResultField.textContent = "No data";
    }
    if (sampleQualityField) {
      sampleQualityField.className = "font-medium text-slate-400";
      sampleQualityField.textContent = "No data";
    }
  }
}
