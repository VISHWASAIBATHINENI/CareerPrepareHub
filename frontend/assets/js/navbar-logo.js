(function () {
  'use strict';

  function initNavbarLogo(logoRoot) {
    const framePath = logoRoot.querySelector('.cph-frame-path');
    const textMain = logoRoot.querySelector('.cph-text-main');
    const textHub = logoRoot.querySelector('.cph-text-hub');

    if (!framePath || !textMain || !textHub) {
      return;
    }

    const pathLength = framePath.getTotalLength();
    framePath.style.setProperty('--cph-perimeter', `${pathLength}px`);
    framePath.style.strokeDasharray = `${pathLength}px`;
    framePath.style.strokeDashoffset = `${pathLength}px`;

    const replayButton = document.querySelector('[data-cph-logo-replay]');
    if (!replayButton) {
      return;
    }

    replayButton.addEventListener('click', function () {
      [framePath, textMain, textHub].forEach((el) => {
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = '';
      });
    });
  }

  window.addEventListener('DOMContentLoaded', function () {
    const logoRoot = document.querySelector('[data-cph-logo]');
    if (!logoRoot) {
      return;
    }
    initNavbarLogo(logoRoot);
  });
})();