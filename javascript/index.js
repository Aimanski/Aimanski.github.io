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
  const chatbotSuggestions = document.getElementById('chatbotSuggestions');

  // Replace with your deployed Cloudflare Worker URL, e.g.
  // "https://portfolio-chatbot.your-subdomain.workers.dev"
  const CHATBOT_ENDPOINT = "https://portfolio-chatbot.your-subdomain.workers.dev";

  if (chatbot && chatbotToggle && chatbotForm) {

    chatbotToggle.addEventListener('click', () => {
      const isOpen = chatbot.classList.toggle('is-open');
      chatbotToggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) chatbotInput.focus();
    });

    // local fallback knowledge base — used only if the AI endpoint is
    // unreachable (not yet deployed, offline, rate-limited, etc.)
    const knowledgeBase = [
      {
        keywords: ['project', 'projects', 'work', 'built', 'build', 'weighapp'],
        reply: "Aiman's featured project is WeighApp — a mobile app for meal planning and daily calorie tracking, built with TypeScript, React Native, and Supabase. A few more projects are on the way — check the Projects section above!"
      },
      {
        keywords: ['stack', 'tech', 'technology', 'technologies', 'language', 'languages', 'framework', 'tools', 'skills'],
        reply: "Aiman works with TypeScript, JavaScript, Java, PHP, MySQL, and C++, using frameworks like React Native, React, Bootstrap, and Vue. Daily tools include VS Code, GitHub, Expo Go, and Claude."
      },
      {
        keywords: ['about', 'who', 'background', 'study', 'studying', 'school', 'college', 'location', 'from', 'live'],
        reply: "Aiman Balang is a 4th year Information Systems student at La Concepcion College, based in Caloocan City, Metro Manila, Philippines. He's focused on software development and aiming to become a professional Software Engineer."
      },
      {
        keywords: ['experience', 'years', 'long', 'programming since'],
        reply: "Aiman has been programming for almost 4 years, building websites, mobile apps, and other software projects along the way."
      },
      {
        keywords: ['contact', 'email', 'reach', 'hire', 'freelance', 'available', 'gmail'],
        reply: "You can reach Aiman at aimanumparabalang@gmail.com, or use the Facebook and GitHub links in the Contact section below. He's currently open to freelance opportunities!"
      },
      {
        keywords: ['github', 'facebook', 'social'],
        reply: "You'll find Aiman's GitHub and Facebook links in the nav's social icons and down in the Contact section."
      },
      {
        keywords: ['interest', 'interests', 'hobby', 'hobbies', 'anime', 'gaming', 'movies'],
        reply: "Outside of code, Aiman's into programming side-projects, movies, gaming, and anime."
      },
      {
        keywords: ['hello', 'hi', 'hey', 'sup'],
        reply: "Hey there! Ask me about Aiman's projects, tech stack, background, or how to get in touch."
      },
      {
        keywords: ['thanks', 'thank you', 'thx'],
        reply: "You're welcome! Let me know if there's anything else you'd like to know."
      }
    ];

    const fallbackReply = "I'm having trouble reaching my AI brain right now, but here's what I know: try asking about Aiman's projects, tech stack, background, or how to contact him.";

    const findLocalReply = (text) => {
      const lower = text.toLowerCase();
      for (const entry of knowledgeBase) {
        if (entry.keywords.some(kw => lower.includes(kw))) {
          return entry.reply;
        }
      }
      return fallbackReply;
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
      if (!trimmed) return;
      addMessage(trimmed, 'user');

      const typingEl = addTypingIndicator();

      try {
        const reply = await askAI(trimmed);
        typingEl.remove();
        addMessage(reply, 'bot');
      } catch (err) {
        typingEl.remove();
        addMessage(findLocalReply(trimmed), 'bot');
      }
    };

    chatbotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleUserText(chatbotInput.value);
      chatbotInput.value = '';
    });

    if (chatbotSuggestions) {
      chatbotSuggestions.querySelectorAll('.chatbot-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const q = chip.getAttribute('data-q');
          const labels = { projects: 'Tell me about the projects', stack: 'What tech stack does Aiman use?', about: 'Tell me about Aiman', contact: 'How can I contact Aiman?' };
          handleUserText(labels[q] || q);
        });
      });
    }
  }

});