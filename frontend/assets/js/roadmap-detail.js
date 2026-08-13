document.addEventListener('DOMContentLoaded', async () => {
  const API_BASE_URL = typeof AUTH_API_BASE_URL !== 'undefined' ? AUTH_API_BASE_URL : (window.API_BASE_URL || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5000' ? 'http://localhost:5000/api' : '/api'));


  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug') || 'full-stack-developer';
  const token = localStorage.getItem('authToken');

  const headerEl = document.getElementById('detailHeaderCard');
  const breadcrumbTitleEl = document.getElementById('breadcrumbRoadmapTitle');
  const timelineEl = document.getElementById('timelineContainer');

  // Modal elements
  const modalEl = document.getElementById('topicDetailModal');
  const closeModalBtn = document.getElementById('closeTopicModalBtn');
  const modalTitleEl = document.getElementById('modalTopicTitle');
  const modalDifficultyEl = document.getElementById('modalTopicDifficulty');
  const modalTimeEl = document.getElementById('modalTopicTime');
  const modalDescEl = document.getElementById('modalTopicDescription');
  const modalObjectivesEl = document.getElementById('modalTopicObjectives');
  const modalResourcesEl = document.getElementById('modalTopicResources');
  const modalCodingEl = document.getElementById('modalTopicCoding');
  const toggleCompleteBtn = document.getElementById('toggleCompleteBtn');
  const modalStatusText = document.getElementById('modalStatusText');

  let roadmap = null;
  let stagesWithTopics = [];
  let userProgress = { completedTopics: [], percentage: 0, currentTopicId: null };
  let currentModalTopic = null;
  let codingQuestionsMap = {}; // Cache for matching coding questions

  // 1. Fetch data
  const loadData = async () => {
    try {
      // Fetch roadmap by slug
      const rRes = await fetch(`${API_BASE_URL}/roadmaps/${slug}`);
      if (!rRes.ok) throw new Error('Roadmap not found');
      const rData = await rRes.json();
      roadmap = rData.data;

      if (breadcrumbTitleEl) breadcrumbTitleEl.textContent = roadmap.title;

      // Fetch topics grouped by stage
      const tRes = await fetch(`${API_BASE_URL}/roadmaps/${roadmap._id}/topics`);
      if (tRes.ok) {
        const tData = await tRes.json();
        stagesWithTopics = tData.data || [];
      }

      // Fetch user progress if logged in
      if (token) {
        const pRes = await fetch(`${API_BASE_URL}/roadmaps/${roadmap._id}/progress`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (pRes.ok) {
          const pData = await pRes.json();
          userProgress = pData.data || userProgress;
        }
      }

      renderHeader();
      renderTimeline();
    } catch (err) {
      console.error('Error loading roadmap detail:', err);
      if (headerEl) {
        headerEl.innerHTML = `
          <div style="text-align: center; color: #ef4444; padding: 20px;">
            <i class="fa-solid fa-triangle-exclamation fa-2x"></i>
            <p style="margin-top: 8px;">Unable to load roadmap details. Please try again later.</p>
            <a href="roadmap.html" class="view-roadmap-btn" style="display: inline-block; width: auto; margin-top: 12px;">Back to Roadmaps</a>
          </div>
        `;
      }
    }
  };

  // Calculate stats
  const getStats = () => {
    let totalTopics = 0;
    const completedSet = new Set(userProgress.completedTopics || []);
    let completedCount = 0;

    stagesWithTopics.forEach(stage => {
      (stage.topics || []).forEach(t => {
        totalTopics++;
        if (completedSet.has(t._id)) completedCount++;
      });
    });

    const percentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

    // Find current stage
    let currentStageTitle = 'Not Started';
    for (const stage of stagesWithTopics) {
      const stageTopics = stage.topics || [];
      const isAllDone = stageTopics.length > 0 && stageTopics.every(t => completedSet.has(t._id));
      if (!isAllDone) {
        currentStageTitle = stage.title;
        break;
      }
    }
    if (percentage === 100) currentStageTitle = 'Completed!';

    return { totalTopics, completedCount, percentage, currentStageTitle };
  };

  // 2. Render Header Card
  const renderHeader = () => {
    if (!headerEl || !roadmap) return;

    const { totalTopics, completedCount, percentage, currentStageTitle } = getStats();

    headerEl.innerHTML = `
      <div class="detail-header-top">
        <div class="detail-title-group">
          <h1>${roadmap.title}</h1>
          <p class="detail-subtext">${roadmap.description}</p>
        </div>
      </div>

      <div class="overall-progress-container">
        <div class="progress-header-row">
          <span class="progress-title-text">
            <i class="fa-solid fa-chart-line" style="color: var(--primary);"></i> Overall Roadmap Progress
          </span>
          <span class="progress-percentage">${percentage}%</span>
        </div>
        <div class="overall-progress-bar-bg">
          <div class="overall-progress-bar-fill" style="width: ${percentage}%;"></div>
        </div>

        <div class="detail-stats-grid">
          <div class="stat-pill">
            <span class="label">Completed Topics</span>
            <span class="value">${completedCount} / ${totalTopics}</span>
          </div>
          <div class="stat-pill">
            <span class="label">Current Stage</span>
            <span class="value">${currentStageTitle}</span>
          </div>
          <div class="stat-pill">
            <span class="label">Est. Duration</span>
            <span class="value">${roadmap.estimatedDuration || '6 Months'}</span>
          </div>
          <div class="stat-pill">
            <span class="label">Difficulty</span>
            <span class="value">${roadmap.difficulty || 'Intermediate'}</span>
          </div>
        </div>
      </div>
    `;
  };

  // 3. Render Timeline
  const renderTimeline = () => {
    if (!timelineEl) return;

    if (!stagesWithTopics.length) {
      timelineEl.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <p>No stages available for this roadmap.</p>
        </div>
      `;
      return;
    }

    const completedSet = new Set(userProgress.completedTopics || []);
    let activeStageFound = false;

    timelineEl.innerHTML = stagesWithTopics.map((stage, idx) => {
      const topics = stage.topics || [];
      const stageTopicCount = topics.length;
      let stageCompletedCount = 0;

      topics.forEach(t => {
        if (completedSet.has(t._id)) stageCompletedCount++;
      });

      const isStageCompleted = stageTopicCount > 0 && stageCompletedCount === stageTopicCount;
      const stagePct = stageTopicCount > 0 ? Math.round((stageCompletedCount / stageTopicCount) * 100) : 0;

      let stageStatus = 'NOT_STARTED';
      if (isStageCompleted) {
        stageStatus = 'COMPLETED';
      } else if (!activeStageFound) {
        stageStatus = 'CURRENT';
        activeStageFound = true;
      }

      // Automatically expand the current active stage or the first stage
      const isDefaultExpanded = stageStatus === 'CURRENT' || (idx === 0 && !activeStageFound);

      return `
        <div class="stage-item ${stageStatus.toLowerCase()}">
          <div class="stage-node">
            ${isStageCompleted ? '<i class="fa-solid fa-check"></i>' : (idx + 1)}
          </div>

          <div class="stage-card ${isDefaultExpanded ? 'expanded' : ''}" data-stage-id="${stage._id}">
            <div class="stage-header">
              <div class="stage-header-left">
                <span class="stage-badge status-${stageStatus.toLowerCase()}">${stageStatus.replace('_', ' ')}</span>
                <h3 class="stage-title">Stage ${idx + 1}: ${stage.title}</h3>
              </div>
              <div class="stage-header-right">
                <div class="stage-progress-mini">
                  <div class="mini-bar">
                    <div class="mini-fill" style="width: ${stagePct}%;"></div>
                  </div>
                  <span>${stageCompletedCount}/${stageTopicCount}</span>
                </div>
                <i class="fa-solid fa-chevron-down expand-icon"></i>
              </div>
            </div>

            <div class="stage-body">
              ${stage.description ? `<p class="stage-desc">${stage.description}</p>` : ''}
              <div class="topics-list">
                ${topics.map(topic => {
                  const isDone = completedSet.has(topic._id);
                  let topicState = isDone ? 'completed' : 'not_started';

                  return `
                    <div class="topic-row ${topicState}" data-topic-id="${topic._id}">
                      <div class="topic-left">
                        <div class="topic-icon">
                          <i class="fa-solid ${isDone ? 'fa-check' : 'fa-play'}"></i>
                        </div>
                        <span class="topic-title">${topic.title}</span>
                      </div>
                      <div class="topic-meta">
                        <span class="topic-time-badge"><i class="fa-regular fa-clock"></i> ${topic.estimatedTime || '2h'}</span>
                        <i class="fa-solid fa-chevron-right" style="color: #cbd5e1;"></i>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    wireTimelineEvents();
  };

  // Wire click events for stages and topics
  const wireTimelineEvents = () => {
    // Stage expand / collapse
    document.querySelectorAll('.stage-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const card = header.closest('.stage-card');
        if (card) card.classList.toggle('expanded');
      });
    });

    // Topic row click -> Open modal
    document.querySelectorAll('.topic-row').forEach(row => {
      row.addEventListener('click', (e) => {
        const topicId = row.dataset.topicId;
        openTopicModal(topicId);
      });
    });
  };

  // 4. Open Topic Modal
  const openTopicModal = async (topicId) => {
    // Find topic object
    let foundTopic = null;
    for (const stage of stagesWithTopics) {
      const match = (stage.topics || []).find(t => String(t._id) === String(topicId));
      if (match) {
        foundTopic = match;
        break;
      }
    }
    if (!foundTopic) return;

    currentModalTopic = foundTopic;
    const completedSet = new Set(userProgress.completedTopics || []);
    const isCompleted = completedSet.has(foundTopic._id);

    modalTitleEl.textContent = foundTopic.title;
    modalDifficultyEl.textContent = foundTopic.difficulty || 'Beginner';
    modalTimeEl.innerHTML = `<i class="fa-regular fa-clock"></i> ${foundTopic.estimatedTime || '2 hours'}`;
    modalDescEl.textContent = foundTopic.description || 'Learn core concepts and practical techniques.';

    // Objectives
    const objectives = foundTopic.learningObjectives || [];
    if (objectives.length) {
      modalObjectivesEl.innerHTML = objectives.map(obj => `
        <li><i class="fa-solid fa-circle-check"></i> ${obj}</li>
      `).join('');
    } else {
      modalObjectivesEl.innerHTML = `<li><i class="fa-solid fa-circle-check"></i> Master ${foundTopic.title} core principles.</li>`;
    }

    // Resources
    const resources = foundTopic.resources || [];
    if (resources.length) {
      modalResourcesEl.innerHTML = resources.map(res => {
        let icon = 'fa-file-lines';
        if (res.type === 'video') icon = 'fa-video';
        if (res.type === 'documentation') icon = 'fa-book';
        if (res.type === 'article') icon = 'fa-newspaper';

        return `
          <a href="${res.url || '#'}" target="_blank" rel="noopener" class="resource-card-link">
            <i class="fa-solid ${icon}"></i>
            <span>${res.label}</span>
          </a>
        `;
      }).join('');
    } else {
      modalResourcesEl.innerHTML = `
        <a href="https://developer.mozilla.org" target="_blank" rel="noopener" class="resource-card-link">
          <i class="fa-solid fa-book"></i>
          <span>Official Documentation</span>
        </a>
      `;
    }

    // Render context-aware practice section (or hide if not applicable)
    renderPracticeSection(foundTopic);

    // Toggle button state
    updateModalButtonState(isCompleted);

    if (modalEl) modalEl.classList.add('active');
  };

  // Render Context-Specific Practice Section
  const renderPracticeSection = async (topic) => {
    const practiceBlock = document.getElementById('modalPracticeSectionBlock');
    const practiceHeader = document.getElementById('modalPracticeHeader');
    if (!practiceBlock || !modalCodingEl) return;

    const type = topic.practiceType || 'none';

    // Hide practice block completely if topic has no practice type
    if (type === 'none') {
      practiceBlock.style.display = 'none';
      modalCodingEl.innerHTML = '';
      return;
    }

    practiceBlock.style.display = 'block';

    const practiceConfig = {
      coding: {
        title: 'Coding Practice',
        icon: 'fa-code',
        defaultLink: 'coding-questions.html',
        btnText: 'Start Coding Practice'
      },
      sql: {
        title: 'SQL Practice',
        icon: 'fa-database',
        defaultLink: 'coding-questions.html?topic=SQL',
        btnText: 'Practice SQL Queries'
      },
      excel: {
        title: 'Excel Exercises',
        icon: 'fa-file-excel',
        defaultLink: 'domains.html',
        btnText: 'Open Excel Practice Exercises'
      },
      statistics: {
        title: 'Statistics Practice',
        icon: 'fa-chart-pie',
        defaultLink: 'aptitude.html',
        btnText: 'Practice Statistics & Analytics'
      },
      python: {
        title: 'Python Practice',
        icon: 'fa-brands fa-python',
        defaultLink: 'coding-questions.html?language=python',
        btnText: 'Practice Python Coding'
      },
      aptitude: {
        title: 'Aptitude Practice',
        icon: 'fa-brain',
        defaultLink: 'aptitude.html',
        btnText: 'Solve Aptitude Questions'
      },
      interview: {
        title: 'Interview Preparation',
        icon: 'fa-comments',
        defaultLink: 'tech-skills.html',
        btnText: 'Practice Interview Questions'
      },
      project: {
        title: 'Portfolio Projects',
        icon: 'fa-folder-open',
        defaultLink: 'project-explorer.html',
        btnText: 'Explore Related Projects'
      }
    };

    const config = practiceConfig[type] || practiceConfig.coding;

    if (practiceHeader) {
      practiceHeader.innerHTML = `<i class="fa-solid ${config.icon}"></i> ${config.title}`;
    }

    const targetLink = topic.practiceLink || config.defaultLink;

    if (type === 'coding' && (topic.codingTopicTags || []).length) {
      const tagQuery = topic.codingTopicTags[0];
      try {
        if (!codingQuestionsMap[tagQuery]) {
          const res = await fetch(`${API_BASE_URL}/coding?topic=${encodeURIComponent(tagQuery)}&limit=3`);
          if (res.ok) {
            const data = await res.json();
            codingQuestionsMap[tagQuery] = data.data || [];
          }
        }

        const questions = codingQuestionsMap[tagQuery] || [];
        if (questions.length) {
          modalCodingEl.innerHTML = questions.map(q => `
            <a href="coding-questions.html?id=${q._id}" class="practice-question-item">
              <span><i class="fa-solid fa-code" style="color: var(--primary); margin-right: 8px;"></i> ${q.title}</span>
              <span class="diff-tag diff-${(q.difficulty || 'easy').toLowerCase()}">${q.difficulty || 'Easy'}</span>
            </a>
          `).join('');
          return;
        }
      } catch (err) {
        console.warn('Could not fetch tagged coding questions:', err);
      }
    }

    // Default single practice item link
    modalCodingEl.innerHTML = `
      <a href="${targetLink}" class="practice-question-item">
        <span><i class="fa-solid ${config.icon}" style="color: var(--primary); margin-right: 8px;"></i> ${config.btnText}</span>
        <span class="diff-tag diff-easy">Practice</span>
      </a>
    `;
  };

  const updateModalButtonState = (isCompleted) => {
    if (!toggleCompleteBtn) return;

    if (isCompleted) {
      toggleCompleteBtn.className = 'toggle-complete-btn mark-incomplete';
      toggleCompleteBtn.innerHTML = `<i class="fa-solid fa-rotate-left"></i> <span>Mark as Incomplete</span>`;
      if (modalStatusText) modalStatusText.textContent = 'Topic completed! Click below to undo.';
    } else {
      toggleCompleteBtn.className = 'toggle-complete-btn mark-complete';
      toggleCompleteBtn.innerHTML = `<i class="fa-solid fa-check"></i> <span>Mark as Complete</span>`;
      if (modalStatusText) modalStatusText.textContent = 'Mark topic complete to track your journey.';
    }
  };

  // Close modal handler
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (modalEl) modalEl.classList.remove('active');
    });
  }
  if (modalEl) {
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) modalEl.classList.remove('active');
    });
  }

  // Toggle Mark Complete / Incomplete API Call
  if (toggleCompleteBtn) {
    toggleCompleteBtn.addEventListener('click', async () => {
      if (!currentModalTopic || !roadmap) return;

      if (!token) {
        alert('Please log in to track your roadmap progress.');
        window.location.href = `login.html?next=${encodeURIComponent(window.location.href)}`;
        return;
      }

      const completedSet = new Set(userProgress.completedTopics || []);
      const isCurrentlyCompleted = completedSet.has(currentModalTopic._id);
      const action = isCurrentlyCompleted ? 'uncomplete' : 'complete';

      try {
        const res = await fetch(`${API_BASE_URL}/roadmaps/${roadmap._id}/topics/${currentModalTopic._id}/${action}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) throw new Error(`Failed to update topic status`);
        const data = await res.json();

        // Update local progress state
        if (isCurrentlyCompleted) {
          userProgress.completedTopics = (userProgress.completedTopics || []).filter(id => id !== currentModalTopic._id);
        } else {
          userProgress.completedTopics = [...(userProgress.completedTopics || []), currentModalTopic._id];
        }

        updateModalButtonState(!isCurrentlyCompleted);

        // Re-render Header and Timeline with new progress
        renderHeader();
        renderTimeline();
      } catch (err) {
        console.error('Error updating progress:', err);
        alert('Could not update topic progress. Please try again.');
      }
    });
  }

  // Initial Load
  loadData();
});
