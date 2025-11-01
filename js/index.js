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

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
  const beginScanBtn = document.getElementById('beginScanBtn');
  
  if (beginScanBtn) {
    beginScanBtn.addEventListener('click', function() {
      window.location.href = 'passport_scan.html';
    });
  }
});
