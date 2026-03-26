const spokenLanguageSelect = document.getElementById('spokenLanguage');
const watchButtons = document.querySelectorAll('.watch-btn');
const API_BASE_URL = 'http://localhost:5000/api';

// Add your own YouTube links below for each domain and spoken language.
let videoLinks = {
  webDevelopment: {
    english: 'https://www.youtube.com/watch?v=zJSY8tbf_ys',
  },
  mobileDevelopment: {
    english: 'https://www.youtube.com/watch?v=fis26HvvDII',
  },
  artificialIntelligence: {
    english: 'https://www.youtube.com/watch?v=EHBNe31y65s',
  },
  machineLearning: {
    english: 'https://www.youtube.com/watch?v=GwIo3gDZCVQ',
  },
  dataScience: {
    english: 'https://www.youtube.com/watch?v=ua-CiDNNj30',
  },
  cloudComputing: {
    english: 'https://www.youtube.com/watch?v=2LaAJq1lB1Q',
  },
  cyberSecurity: {
    english: 'https://www.youtube.com/watch?v=Gg_cwHFy9h0',
  },
  devOps: {
    english: 'https://www.youtube.com/watch?v=j5Zsa_eOXeY',
  },
  iot: {
    english: 'https://www.youtube.com/watch?v=QSIPNhOiMoE',
  },
  blockchain: {
    english: 'https://www.youtube.com/watch?v=gyMwXuJrbJQ',
  },
  gameDevelopment: {
    english: 'https://www.youtube.com/watch?v=gB1F9G0JXOo',
  },
};

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function updateCardsBySpokenLanguage() {
  const selectedSpokenLanguage = spokenLanguageSelect.value;

  watchButtons.forEach((button) => {
    const domainKey = button.dataset.domainKey;
    const linkForSelection = videoLinks[domainKey]?.[selectedSpokenLanguage] || '#';

    button.href = linkForSelection;
    button.textContent = `Open ${capitalize(selectedSpokenLanguage)} Video`;
  });
}

spokenLanguageSelect.addEventListener('change', updateCardsBySpokenLanguage);

async function init() {
  try {
    const response = await fetch(`${API_BASE_URL}/content/domain-videos`);
    if (response.ok) {
      const payload = await response.json();
      videoLinks = payload?.data || videoLinks;
    }
  } catch (_error) {
    // keep seeded fallback links
  }

  updateCardsBySpokenLanguage();
}

init();
