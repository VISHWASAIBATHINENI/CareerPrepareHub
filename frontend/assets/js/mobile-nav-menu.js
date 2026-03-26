document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-dots-btn');
  const navLinks = document.querySelector('.nav-links');

  if (!menuButton || !navLinks) return;

  menuButton.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = navLinks.classList.toggle('menu-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (event) => {
    if (!navLinks.contains(event.target) && !menuButton.contains(event.target)) {
      navLinks.classList.remove('menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 700) {
      navLinks.classList.remove('menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
  });
});
