document.addEventListener('DOMContentLoaded', () => {

  /* ---------- footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- dark mode toggle ---------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  const setTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  };

  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(current);
  });

  /* keep in sync with OS-level changes if the person hasn't chosen manually */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });

  /* ---------- nav scroll state ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  const closeMenu = () => {
    navToggle.classList.remove('is-open');
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* ---------- active link on scroll ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const linkMap = new Map();
  navLinks.querySelectorAll('a').forEach(a => {
    linkMap.set(a.getAttribute('href').slice(1), a);
  });

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = linkMap.get(entry.target.id);
      if (!link) return;
      if (entry.isIntersecting) {
        linkMap.forEach(l => l.classList.remove('is-active'));
        link.classList.add('is-active');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  sections.forEach(section => sectionObserver.observe(section));

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => revealObserver.observe(el));

});