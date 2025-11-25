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

document.addEventListener("DOMContentLoaded", () => {
  const physicianNameInput = document.getElementById("physicianName");
  const centerNameInput = document.getElementById("centerName");
  const nextPageBtn = document.getElementById("nextPageBtn");
  const backBtn = document.getElementById("backBtn");

  // Pre-fill physician name if stored
  const savedPhysicianName = localStorage.getItem("physicianName");
  const savedCenterName = localStorage.getItem("centerName");
  if (savedPhysicianName && physicianNameInput) {
    physicianNameInput.value = savedPhysicianName;
  }
  if (savedCenterName && centerNameInput) {
    centerNameInput.value = savedCenterName;
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => {
      const physicianName = physicianNameInput.value.trim();
      if (physicianName) {
        localStorage.setItem("physicianName", physicianName);
        window.location.href = "cough_record.html";
      } else {
        alert("Please enter the physician's name.");
      }

      const centerName = centerNameInput.value.trim();
      if (centerName) {
        localStorage.setItem("centerName", centerName);
        window.location.href = "cough_record.html";
      } else {
        alert("Please enter the Medical Center's name.");
      }
    });
  }
});
