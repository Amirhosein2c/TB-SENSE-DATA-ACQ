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
      console.log("Parsed cough analysis data:", parsed);

      // ✅ Normalize structure: handle if it's an array or a single object
      const data = Array.isArray(parsed) ? parsed[0] : parsed;

      if (!data) {
        console.error("Cough data is empty or invalid:", parsed);
        if (testResultField) testResultField.textContent = "Not available";
        if (sampleQualityField)
          sampleQualityField.textContent = "Not available";
        return;
      }

      // ✅ Extract values
      const resultValue = data.result;
      const qualityValue = data.quality;

      console.log("Result value:", resultValue, "Quality value:", qualityValue);

      // ✅ Display sample quality
      if (sampleQualityField) {
        if (qualityValue !== undefined && qualityValue !== null) {
          sampleQualityField.textContent = qualityValue;
        } else {
          sampleQualityField.textContent = "Not available";
        }
      }

      // ✅ Display test result
      if (testResultField) {
        if (typeof resultValue === "number" && !isNaN(resultValue)) {
          testResultField.textContent = `${resultValue}%`;
        } else if (
          typeof resultValue === "string" &&
          resultValue.trim() !== ""
        ) {
          testResultField.textContent = resultValue;
        } else {
          testResultField.textContent = "Not available";
        }
      }

      // ✅ Optional: color-coding (you can remove this section if not needed)
      if (sampleQualityField) {
        const q = qualityValue?.toLowerCase?.() || "";
        if (q.includes("detected")) {
          sampleQualityField.style.color = "green";
        } else if (q.includes("not_detected")) {
          sampleQualityField.style.color = "gray";
        } else {
          sampleQualityField.style.color = "black";
        }
      }
    } catch (err) {
      console.error("Error parsing coughAnalysisData:", err);
      if (testResultField) testResultField.textContent = "Not available";
      if (sampleQualityField) sampleQualityField.textContent = "Not available";
    }
  } else {
    console.warn("No coughAnalysisData found in sessionStorage");
    if (testResultField) testResultField.textContent = "Not available";
    if (sampleQualityField) sampleQualityField.textContent = "Not available";
  }
}

// ✅ Run after page loads
document.addEventListener("DOMContentLoaded", loadCoughAnalysisData);
