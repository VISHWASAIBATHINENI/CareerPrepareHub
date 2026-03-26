const spokenLanguageSelect = document.getElementById('spokenLanguage');
const watchButtons = document.querySelectorAll('.watch-btn');
const API_BASE_URL = 'http://localhost:5000/api';

// Add your YouTube links below.
// Example:
// c: { english: 'https://youtube.com/...', telugu: 'https://youtube.com/...', hindi: 'https://youtube.com/...', tamil: 'https://youtube.com/...' }
let videoLinks = {
  c: {
    english: 'https://www.youtube.com/watch?v=KJgsSFOSQv0',
    hindi: 'https://www.youtube.com/watch?v=ZSPZob_1TOk',
    telugu: 'https://www.youtube.com/watch?v=y42IRO-_pNA',
    tamil: 'https://www.youtube.com/watch?v=poo0BXryffI',
  },
  cpp: {
    english: 'https://www.youtube.com/watch?v=8jLOx1hD3_o',
    hindi: 'https://www.youtube.com/watch?v=yGB9jhsEsr8',
    telugu: 'https://www.youtube.com/watch?v=1v_4dL8lq3I',
    tamil: 'https://www.youtube.com/watch?v=Rub-JsjMhWY',
  },
  java: {
    english: 'https://www.youtube.com/watch?v=GoXwIVyNvX0',
    hindi: 'https://www.youtube.com/watch?v=UmnCZ7-9yDY',
    telugu: 'https://www.youtube.com/watch?v=grEKMHGYyns',
    tamil: 'https://www.youtube.com/watch?v=kGxSyqKbzsc',
  },
  python: {
    english: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    hindi: 'https://www.youtube.com/watch?v=gfDE2a7MKjA',
    telugu: 'https://www.youtube.com/watch?v=V7AZhYv5qN4',
    tamil: 'https://www.youtube.com/watch?v=YfO28Ihehbk',
  },
  javascript: {
    english: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
    hindi: 'https://www.youtube.com/watch?v=ER9SspLe4Hg',
    telugu: 'https://www.youtube.com/watch?v=lfmg-EJ8gm4',
    tamil: 'https://www.youtube.com/watch?v=PmA1GnY8f70',
  },
  typescript: {
    english: 'https://www.youtube.com/watch?v=30LWjhZzg50',
    hindi: 'https://www.youtube.com/watch?v=30LWjhZzg50',
    telugu: 'https://www.youtube.com/watch?v=30LWjhZzg50',
    tamil: 'https://www.youtube.com/watch?v=30LWjhZzg50',
  },
  go: {
    english: 'https://www.youtube.com/watch?v=YS4e4q9oBaU',
    hindi: 'https://www.youtube.com/watch?v=YS4e4q9oBaU',
    telugu: 'https://www.youtube.com/watch?v=YS4e4q9oBaU',
    tamil: 'https://www.youtube.com/watch?v=YS4e4q9oBaU',
  },
  rust: {
    english: 'https://www.youtube.com/watch?v=BpPEoZW5IiY',
    hindi: 'https://www.youtube.com/watch?v=BpPEoZW5IiY',
    telugu: 'https://www.youtube.com/watch?v=BpPEoZW5IiY',
    tamil: 'https://www.youtube.com/watch?v=BpPEoZW5IiY',
  },
  kotlin: {
    english: 'https://www.youtube.com/watch?v=F9UC9DY-vIU',
    hindi: 'https://www.youtube.com/watch?v=F9UC9DY-vIU',
    telugu: 'https://www.youtube.com/watch?v=F9UC9DY-vIU',
    tamil: 'https://www.youtube.com/watch?v=F9UC9DY-vIU',
  },
  swift: {
    english: 'https://www.youtube.com/watch?v=comQ1-x2a1Q',
    hindi: 'https://www.youtube.com/watch?v=comQ1-x2a1Q',
    telugu: 'https://www.youtube.com/watch?v=comQ1-x2a1Q',
    tamil: 'https://www.youtube.com/watch?v=comQ1-x2a1Q',
  },
  dart: {
    english: 'https://www.youtube.com/watch?v=Ej_Pcr4uC2Q',
    hindi: 'https://www.youtube.com/watch?v=Ej_Pcr4uC2Q',
    telugu: 'https://www.youtube.com/watch?v=Ej_Pcr4uC2Q',
    tamil: 'https://www.youtube.com/watch?v=Ej_Pcr4uC2Q',
  },
};

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function updateCardsBySpokenLanguage() {
  const selectedSpokenLanguage = spokenLanguageSelect.value;

  watchButtons.forEach((button) => {
    const languageKey = button.dataset.langKey;
    const linkForSelection = videoLinks[languageKey]?.[selectedSpokenLanguage] || '#';

    button.href = linkForSelection;
    button.textContent = `Open ${capitalize(selectedSpokenLanguage)} Video`;
  });
}

spokenLanguageSelect.addEventListener('change', updateCardsBySpokenLanguage);

async function init() {
  try {
    const response = await fetch(`${API_BASE_URL}/content/programming-languages-videos`);
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
