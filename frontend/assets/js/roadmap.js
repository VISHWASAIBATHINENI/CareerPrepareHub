document.addEventListener('DOMContentLoaded', async () => {
  const API_BASE_URL = typeof AUTH_API_BASE_URL !== 'undefined' ? AUTH_API_BASE_URL : (window.API_BASE_URL || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5000' ? 'http://localhost:5000/api' : '/api'));
  const gridEl = document.getElementById('careerCardsGrid');
  const searchInput = document.getElementById('roadmapSearchInput');
  const token = localStorage.getItem('authToken');

  let allRoadmaps = [];
  let userProgressMap = {};

  const getCareerIcon = (slug) => {
    switch (slug) {
      case 'full-stack-developer': return 'fa-code';
      case 'java-developer': return 'fa-java';
      case 'data-analyst': return 'fa-chart-pie';
      default: return 'fa-laptop-code';
    }
  };

  const fetchRoadmaps = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/roadmaps`);
      if (!res.ok) throw new Error('Failed to fetch roadmaps');
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      console.error('Error fetching roadmaps:', err);
      return [];
    }
  };

  const fetchUserProgress = async () => {
    if (!token) return {};
    try {
      const res = await fetch(`${API_BASE_URL}/roadmaps/my-progress`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return {};
      const data = await res.json();
      const progressArray = data.data || [];
      const map = {};
      progressArray.forEach(p => {
        map[p.roadmapId] = p;
      });
      return map;
    } catch (err) {
      console.error('Error fetching user progress:', err);
      return {};
    }
  };

  const renderCards = (roadmaps) => {
    if (!gridEl) return;

    if (!roadmaps.length) {
      gridEl.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <i class="fa-solid fa-compass fa-3x" style="color: #cbd5e1; margin-bottom: 16px;"></i>
          <h3>No roadmaps found</h3>
          <p>Try refining your search query.</p>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = roadmaps.map(roadmap => {
      const userProgress = userProgressMap[roadmap._id];
      const hasStarted = Boolean(userProgress);
      const percentage = userProgress ? userProgress.percentage : 0;
      const iconClass = getCareerIcon(roadmap.slug);

      return `
        <article class="career-card">
          <div>
            <div class="career-card-header">
              <div class="career-icon-wrapper">
                <i class="fa-solid ${iconClass}"></i>
              </div>
              <span class="career-badge">${roadmap.difficulty || 'Intermediate'}</span>
            </div>

            <h3>${roadmap.title}</h3>
            <p class="description">${roadmap.description}</p>

            <div class="career-meta-grid">
              <div class="meta-item">
                <i class="fa-regular fa-clock"></i>
                <span>Duration: <strong>${roadmap.estimatedDuration || '6 Months'}</strong></span>
              </div>
              <div class="meta-item">
                <i class="fa-solid fa-layer-group"></i>
                <span>Stages: <strong>${roadmap.totalStages || 0}</strong></span>
              </div>
              <div class="meta-item">
                <i class="fa-solid fa-list-check"></i>
                <span>Topics: <strong>${roadmap.totalTopics || 0}</strong></span>
              </div>
              <div class="meta-item">
                <i class="fa-solid fa-graduation-cap"></i>
                <span>Status: <strong>${hasStarted ? (percentage === 100 ? 'Completed' : 'In Progress') : 'Not Started'}</strong></span>
              </div>
            </div>

            ${hasStarted ? `
              <div class="user-progress-box">
                <div class="progress-info">
                  <span>Your Progress</span>
                  <span class="pct">${percentage}%</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: ${percentage}%"></div>
                </div>
              </div>
            ` : ''}
          </div>

          <a href="roadmap-detail.html?slug=${roadmap.slug}" class="view-roadmap-btn">
            <span>${hasStarted ? 'Continue Roadmap' : 'View Roadmap'}</span>
            <i class="fa-solid fa-arrow-right"></i>
          </a>
        </article>
      `;
    }).join('');
  };

  // Initial load
  const [roadmaps, progressMap] = await Promise.all([fetchRoadmaps(), fetchUserProgress()]);
  allRoadmaps = roadmaps;
  userProgressMap = progressMap;

  renderCards(allRoadmaps);

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        renderCards(allRoadmaps);
        return;
      }

      const filtered = allRoadmaps.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.career.toLowerCase().includes(q) ||
        (r.tags && r.tags.some(t => t.toLowerCase().includes(q)))
      );
      renderCards(filtered);
    });
  }
});
