document.addEventListener('DOMContentLoaded', () => {
  const physicianNameInput = document.getElementById('physicianName');
  const nextBtn = document.getElementById('nextBtn');
  const backBtn = document.getElementById('backBtn');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  nextBtn.addEventListener('click', () => {
    const physicianName = physicianNameInput.value.trim();
    if (physicianName) {
      localStorage.setItem('physicianName', physicianName);
      window.location.href = 'cough_record.html';
    } else {
      alert('Please enter the physician\'s name.');
    }
  });
});
