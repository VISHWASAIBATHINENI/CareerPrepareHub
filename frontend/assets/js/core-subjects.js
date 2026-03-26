const watchButtons = document.querySelectorAll('.watch-btn');
const API_BASE_URL = 'http://localhost:5000/api';

let videoLinks = {
  dsa: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
  os: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O',
  dbms: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRiyryTrbKHX1Sh9luYI0dhX',
  computerNetworks: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV',
  toc: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y',
  coa: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiG4m7Y8E8Gq9i7U1t9K6c5x',
  compilerDesign: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiE0rX1Xjv1QYgKx1J7x1QyA',
  softwareEngineering: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiF0bB1V7q4C0F7E7zZ0F8dY',
};

function render() {
  watchButtons.forEach((button) => {
    const subjectKey = button.dataset.subjectKey;
    button.href = videoLinks[subjectKey] || '#';
    button.textContent = 'Open English Video';
  });
}

async function init() {
  try {
    const response = await fetch(`${API_BASE_URL}/content/core-subject-videos`);
    if (response.ok) {
      const payload = await response.json();
      videoLinks = payload?.data || videoLinks;
    }
  } catch (_error) {
    // keep seeded fallback links
  }

  render();
}

init();
