document.addEventListener('DOMContentLoaded', async () => {
  const API_BASE_URL = 'http://localhost:5000/api';
  const grid = document.getElementById('topicGrid');
  const status = document.getElementById('topicsStatus');

  const descriptions = {
    'Percentages': 'Foundation topic used in profit, loss, SI/CI, data interpretation, and quick comparisons.',
    'Profit and Loss': 'Learn marked price, discount, cost-price relationships, and shortcut-based calculations.',
    'Ratio and Proportion': 'Understand ratio balancing, direct variation, and proportional reasoning for word problems.',
    'Simple & Compound Interest': 'Cover principal, rate, time, amount, and efficient CI growth pattern methods.',
    'Averages': 'Solve weighted and replacement averages quickly for mixed-value datasets.',
    'Time and Work': 'Use efficiency and work-rate methods for individual and combined workforce problems.',
    'Time, Speed and Distance': 'Master relative speed, trains, boats-streams, and journey-based scenarios.',
    'Number System': 'Practice divisibility, remainders, factors, and base properties for objective exams.',
    'LCM and HCF': 'Build number relationship logic useful in synchronization and grouping questions.',
    'Simplification & Approximation': 'Improve speed with BODMAS shortcuts, rounding logic, and quick expression solving.',
    'Mixtures and Alligations': 'Learn ratio-based mixing techniques and alligation rule for concentration problems.',
    'Permutation and Combination': 'Count arrangements and selections with restriction-based and position-based rules.',
    'Probability': 'Understand favorable outcomes, conditional cases, and event-based reasoning.',
    'Mensuration': 'Revise 2D/3D area-volume formulas and geometry-driven aptitude applications.',
    'Quadratic Equations': 'Solve roots and comparisons using factorization and discriminant methods.',
    'Progressions (AP, GP)': 'Handle sequence patterns, nth term, and sum formulas in arithmetic/geometric series.',
    'Coding-Decoding': 'Decode symbol, number, and alphabet patterns through transformation logic.',
    'Blood Relations': 'Build family-tree understanding for relation mapping and statement-based puzzles.',
    'Direction Sense': 'Practice orientation, turns, and displacement problems with diagram shortcuts.',
    'Syllogisms': 'Evaluate logical conclusions from statements using Venn and elimination techniques.',
    'Number/Alphabet Series': 'Identify recurring patterns and missing terms in sequence-based reasoning questions.',
    'Seating Arrangement & Puzzles': 'Develop structured solving for linear/circular arrangements and constraint puzzles.',
    'Data Interpretation (Bar, Pie, Line, Table)': 'Interpret charts and compute ratios, trends, and comparative metrics under time pressure.',
    'Verbal Ability (RC, Grammar, Para Jumbles)': 'Strengthen reading comprehension, grammar accuracy, and sentence ordering skills.'
  };

  function setStatus(message = '') {
    status.textContent = message;
    status.classList.toggle('hidden', !message);
  }

  function topicImage(topic) {
    const esc = (value) => String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const short = topic.length > 28 ? `${topic.slice(0, 28)}…` : topic;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 480'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='#1d4ed8'/>
          <stop offset='100%' stop-color='#38bdf8'/>
        </linearGradient>
      </defs>
      <rect width='900' height='480' fill='url(#g)'/>
      <circle cx='760' cy='110' r='180' fill='rgba(255,255,255,0.12)'/>
      <circle cx='120' cy='420' r='170' fill='rgba(255,255,255,0.1)'/>
      <text x='50%' y='50%' fill='white' font-family='Inter,Arial,sans-serif' font-size='44' text-anchor='middle' dominant-baseline='middle'>${esc(short)}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  function buildLanguageLinks(langData = {}) {
    const order = ['Telugu', 'Hindi', 'Tamil'];
    return order.map((language) => {
      const item = langData[language];
      if (!item) return '';
      const href = item.link || item.search || '#';
      const channel = item.channel ? `<span class="channel">${item.channel}</span>` : '';
      return `
        <a class="lang-link" href="${href}" target="_blank" rel="noopener noreferrer">
          <strong>${language}</strong>
          ${channel}
        </a>
      `;
    }).join('');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/content/aptitude-topics-links`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const data = payload?.data || {};
    const entries = Object.entries(data || {});

    if (!entries.length) {
      setStatus('No topic links found.');
      return;
    }

    grid.innerHTML = entries.map(([topic, langData]) => {
      const desc = descriptions[topic] || 'Topic resources available in Telugu, Hindi, and Tamil.';
      return `
        <article class="topic-card">
          <img class="topic-image" src="${topicImage(topic)}" alt="${topic} aptitude topic" loading="lazy">
          <div class="topic-body">
            <h3>${topic}</h3>
            <p>${desc}</p>
            <div class="topic-links">
              ${buildLanguageLinks(langData)}
            </div>
          </div>
        </article>
      `;
    }).join('');
  } catch (error) {
    setStatus(`Unable to load aptitude topic links. ${error.message}`);
  }
});
