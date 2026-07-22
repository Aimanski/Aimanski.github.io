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

  /* ---------- chatbot ---------- */
  const chatbot = document.getElementById('chatbot');
  const chatbotToggle = document.getElementById('chatbotToggle');
  const chatbotMessages = document.getElementById('chatbotMessages');
  const chatbotForm = document.getElementById('chatbotForm');
  const chatbotInput = document.getElementById('chatbotInput');

  const CHATBOT_ENDPOINT = "https://portfolio-chatbot.aiman-dev.workers.dev";

  if (chatbot && chatbotToggle && chatbotForm) {

    chatbotToggle.addEventListener('click', () => {
      const isOpen = chatbot.classList.toggle('is-open');
      chatbotToggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) chatbotInput.focus();
    });

    const fallbackReply = "I'm having trouble reaching my AI brain right now — please try again in a moment, or reach out directly at aimanumparabalang@gmail.com.";

    const chatbotSendBtn = chatbotForm.querySelector('.chatbot-send');
    const COOLDOWN_SECONDS = 10;
    let cooldownActive = false;

    const startCooldown = () => {
      cooldownActive = true;
      chatbotInput.disabled = true;
      chatbotSendBtn.disabled = true;
      chatbotSendBtn.classList.add('is-cooldown');

      let remaining = COOLDOWN_SECONDS;
      chatbotSendBtn.textContent = remaining;

      const tick = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(tick);
          cooldownActive = false;
          chatbotInput.disabled = false;
          chatbotSendBtn.disabled = false;
          chatbotSendBtn.classList.remove('is-cooldown');
          chatbotSendBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>';
          chatbotInput.focus();
        } else {
          chatbotSendBtn.textContent = remaining;
        }
      }, 1000);
    };

    const addMessage = (text, sender) => {
      const msg = document.createElement('div');
      msg.className = `chatbot-msg chatbot-msg-${sender}`;
      msg.textContent = text;
      chatbotMessages.appendChild(msg);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      return msg;
    };

    const addTypingIndicator = () => {
      const msg = document.createElement('div');
      msg.className = 'chatbot-msg chatbot-msg-bot chatbot-msg-typing';
      msg.innerHTML = '<span></span><span></span><span></span>';
      chatbotMessages.appendChild(msg);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      return msg;
    };

    const askAI = async (text) => {
      const res = await fetch(CHATBOT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      if (!res.ok) throw new Error('Request failed: ' + res.status);
      const data = await res.json();
      if (!data.reply) throw new Error('No reply in response');
      return data.reply;
    };

    const handleUserText = async (text) => {
      const trimmed = text.trim();
      if (!trimmed || cooldownActive) return;
      addMessage(trimmed, 'user');
      startCooldown();

      const typingEl = addTypingIndicator();

      try {
        const reply = await askAI(trimmed);
        typingEl.remove();
        addMessage(reply, 'bot');
      } catch (err) {
        typingEl.remove();
        addMessage(fallbackReply, 'bot');
      }
    };

    chatbotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (cooldownActive) return;
      handleUserText(chatbotInput.value);
      chatbotInput.value = '';
    });
  }

  /* ---------- resume modal ---------- */
  const resumeModal = document.getElementById('resumeModal');
  const viewResumeBtn = document.getElementById('viewResumeBtn');
  const closeResumeModal = document.getElementById('closeResumeModal');

  if (resumeModal && viewResumeBtn && closeResumeModal) {
    const openModal = () => {
      resumeModal.style.display = 'flex';
      resumeModal.classList.add('show');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      resumeModal.classList.remove('show');
      setTimeout(() => {
        resumeModal.style.display = 'none';
        document.body.style.overflow = '';
      }, 300);
    };

    viewResumeBtn.addEventListener('click', openModal);

    closeResumeModal.addEventListener('click', closeModal);

    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) {
        closeModal();
      }
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && resumeModal.classList.contains('show')) {
        closeModal();
      }
    });
  }

});