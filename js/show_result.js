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

// Load data when page loads
document.addEventListener("DOMContentLoaded", function () {
  loadCoughAnalysisData();
  setupNavigationButtons();
});

// Navigation buttons setup
function setupNavigationButtons() {
  const retakeBtn = document.getElementById("retakeBtn");
  const acceptBtn = document.getElementById("acceptBtn");

  // Retake button
  if (retakeBtn) {
    retakeBtn.addEventListener("click", function () {
      const patientDataStr = localStorage.getItem("patientData");
      if (patientDataStr) {
        const patientData = JSON.parse(patientDataStr);
        delete patientData.audio;
        localStorage.setItem("patientData", JSON.stringify(patientData));
        console.log("Retake: kept patient info, removed audio data.");
      }
      window.location.href = "cough_record.html";
    });
  }

  // Accept button
  if (acceptBtn) {
    acceptBtn.addEventListener("click", async function () {
      const patientDataStr = localStorage.getItem("patientData");
      if (!patientDataStr) {
        alert("No patient data found to send.");
        return;
      }

      const patientData = JSON.parse(patientDataStr);
      const coughDataStr = sessionStorage.getItem("coughAnalysisData");

      if (coughDataStr) {
        try {
          const parsed = JSON.parse(coughDataStr);
          const coughData = parsed.data || parsed; // handle both shapes
          patientData.testResult = coughData.result ?? "N/A";
          patientData.sampleQuality = coughData.quality ?? "N/A";
        } catch (error) {
          console.error("Error parsing cough analysis data:", error);
          patientData.testResult = "Error";
          patientData.sampleQuality = "Error";
        }
      } else {
        patientData.testResult = "N/A";
        patientData.sampleQuality = "N/A";
      }

      console.log("Sending stored patient data to webhook:", patientData);

      try {
        const response = await fetch(WEBHOOKS.COUGH_STORAGE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patientData),
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        console.log("Webhook response:", data);

        sessionStorage.clear();
        localStorage.removeItem("patientData");
        window.location.href = "cough_record.html";
      } catch (error) {
        console.error("Error sending data to webhook:", error);
        alert("Failed to send data to backend. Please try again.");
      }
    });
  }

  // Display stored patient data
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

// Function to load cough analysis data
function loadCoughAnalysisData() {
  const coughDataStr = sessionStorage.getItem("coughAnalysisData");
  const testResultField = document.getElementById("testResult");
  const sampleQualityField = document.getElementById("sampleQuality");

  console.log("Raw coughAnalysisData from sessionStorage:", coughDataStr);

  if (coughDataStr) {
    try {
      const parsed = JSON.parse(coughDataStr);
      const data = parsed.data || parsed; // normalize structure

      console.log("Parsed cough analysis data:", data);

      // ----- TEST RESULT -----
      if (
        testResultField &&
        data.result !== undefined &&
        data.result !== null
      ) {
        const resultValue = Number(data.result);
        console.log("Numeric test result value:", resultValue);

        if (isNaN(resultValue)) {
          testResultField.className = "font-bold text-gray-500";
          testResultField.textContent = `Invalid Result (${data.result})`;
          return;
        }

        let resultLabel = "";
        let colorClass = "text-slate-500";

        if (resultValue > 75) {
          resultLabel = "Highly Probable";
          colorClass = "text-red-600";
        } else if (resultValue > 50) {
          resultLabel = "Weakly Probable";
          colorClass = "text-orange-500";
        } else if (resultValue > 25) {
          resultLabel = "Weakly Negative";
          colorClass = "text-green-500";
        } else if (resultValue >= 0) {
          resultLabel = "Highly Negative";
          colorClass = "text-green-700";
        } else {
          resultLabel = "Invalid Result";
          colorClass = "text-gray-500";
        }

        testResultField.className = `font-bold ${colorClass}`;
        testResultField.textContent = `${resultLabel} (${resultValue.toFixed(
          1
        )}%)`;
      } else if (testResultField) {
        console.warn("No valid result field in cough data");
        testResultField.className = "font-bold text-slate-400";
        testResultField.textContent = "Not available";
      }

      // ----- SAMPLE QUALITY -----
      if (sampleQualityField && data.quality) {
        const qualityValue = String(data.quality).toLowerCase();
        console.log("Sample quality:", qualityValue);

        let colorClass = "text-slate-500";
        if (qualityValue === "detected") colorClass = "text-green-600";
        else if (qualityValue === "not_detected") colorClass = "text-red-500";
        else if (qualityValue === "server_error" || qualityValue === "error")
          colorClass = "text-blue-600";

        sampleQualityField.className = `font-medium ${colorClass}`;
        sampleQualityField.textContent =
          qualityValue.charAt(0).toUpperCase() + qualityValue.slice(1);
      } else if (sampleQualityField) {
        console.warn("No valid quality field in cough data");
        sampleQualityField.className = "font-medium text-slate-400";
        sampleQualityField.textContent = "Not available";
      }
    } catch (error) {
      console.error("Error parsing cough analysis data:", error);
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
