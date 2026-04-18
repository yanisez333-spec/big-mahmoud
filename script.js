"use strict";
/* ════════════════════════════════════════════════════════════
   BIG MAHMOUD — script.js  v4.0 LUXURY EDITION
   ════════════════════════════════════════════════════════════ */

const CONFIG = {
  WHATSAPP_NUMBER: "21621006219",
  PHONE_DISPLAY: "+216 21 006 219",
  STAR_COUNT: 28,
};

const TRANSLATIONS = {
  fr: {
    "nav.home":"Accueil","nav.menu":"Menu","nav.events":"Événements",
    "nav.reservation":"Réservation","nav.contact":"Contact",
    "nav.visit3d":"Visite 3D","nav.reserve":"Réserver",
    "hero.pre":"✦ El Jem — Tunisie ✦","hero.sub":"Café · Restaurant · Chicha · Visite 3D",
    "hero.cta":"Réserver","hero.menu":"Menu",
    "hero.hours":"Ouvert 24h/24 · 7j/7",
    "hero.discover":"Découvrir",
    "feat.coffee":"Café & Boissons","feat.coffee.sub":"Arabica, lattes, jus...",
    "feat.food":"Cuisine Salée","feat.food.sub":"Pizzas, pâtes, grillades...",
    "feat.pastry":"Pâtisseries","feat.pastry.sub":"Crêpes, gaufres, desserts...",
    "feat.chicha":"Chicha","feat.chicha.sub":"Love, Cheikh, Menthe...",
    "feat.3d":"Visite 3D","feat.3d.sub":"Explorez en immersion",
    "footer.tagline":"Café & Restaurant premium à El Jem, Tunisie.",
    "footer.nav":"Navigation","footer.info":"Informations",
    "footer.cookies":"Politique des cookies","footer.legal":"Mentions légales",
    "footer.copy":"© 2026 BIG MAHMOUD — El Jem, Tunisie","wa.label":"Réserver",
  },
  ar: {
    "nav.home":"الرئيسية","nav.menu":"القائمة","nav.events":"الفعاليات",
    "nav.reservation":"الحجز","nav.contact":"اتصل بنا",
    "nav.visit3d":"جولة 3D","nav.reserve":"احجز",
    "hero.pre":"✦ الجم — تونس ✦","hero.sub":"مقهى · مطعم · شيشة · جولة ثلاثية الأبعاد",
    "hero.cta":"احجز طاولة","hero.menu":"القائمة",
    "hero.hours":"مفتوح 24 ساعة · 7 أيام في الأسبوع",
    "hero.discover":"اكتشف",
    "feat.coffee":"قهوة ومشروبات","feat.coffee.sub":"أرابيكا، لاتيه، عصائر...",
    "feat.food":"أكلات مالحة","feat.food.sub":"بيتزا، مكرونة، مشاوي...",
    "feat.pastry":"حلويات","feat.pastry.sub":"كريب، غوفر، ديسير...",
    "feat.chicha":"شيشة","feat.chicha.sub":"لوف، شيخ، نعناع...",
    "feat.3d":"جولة ثلاثية الأبعاد","feat.3d.sub":"استكشف بشكل غامر",
    "footer.tagline":"مقهى ومطعم فاخر في الجم، تونس.",
    "footer.nav":"التصفح","footer.info":"معلومات",
    "footer.cookies":"سياسة الكوكيز","footer.legal":"الإشعار القانوني",
    "footer.copy":"© 2026 بيغ محمود — الجم، تونس","wa.label":"احجز",
  },
};

let currentLang = localStorage.getItem("bm_lang") ?? "fr";
function t(key) { return TRANSLATIONS[currentLang][key] ?? key; }

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem("bm_lang", lang);
  const html = document.documentElement;
  html.setAttribute("lang", lang);
  html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.placeholder = val;
    else el.textContent = val;
  });
  document.querySelectorAll(".lang-btn").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.lang === lang)
  );
}
window.switchLang = (lang) => applyLang(lang);

/* ── BOOT ── */
document.addEventListener("DOMContentLoaded", () => {
  applyLang(currentLang);
  initLoader();
  initStars();
  initCursor();
  initActiveNav();
  initNavScroll();
  initHamburger();
  initReveal();
  initParallax();
  initMenuTabs();
  initCountdown();
  initTourTabs();
  initRipple();
  initLazyLoad();
  initScrollSmooth();
  initCounters();
  initMagneticButtons();
  initCardTilt();
  initScrollIndicator();
});

/* ── LOADER ── */
function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  setTimeout(() => loader.classList.add("hidden"), 1500);
}

/* ── STARS ── */
function initStars() {
  const container = document.getElementById("stars-bg");
  if (!container) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
    const s = document.createElement("div");
    s.className = "star";
    const size = Math.random() * 2.2 + 0.5;
    s.style.cssText = `
      width:${size}px;height:${size}px;
      left:${Math.random()*100}%;top:${Math.random()*100}%;
      opacity:${Math.random()*0.2+0.05};
      animation-delay:${Math.random()*6}s;
      animation-duration:${3+Math.random()*6}s;
      ${reduced?"animation:none;":""}
    `;
    frag.appendChild(s);
  }
  container.appendChild(frag);
}

/* ── CURSOR (avec trail & iframe-zone) ── */
function initCursor() {
  if (!window.matchMedia("(pointer: fine)").matches) return;

  let dot = document.getElementById("cursor-dot");
  let ring = document.getElementById("cursor-ring");
  let label = document.getElementById("cursor-label");

  if (!dot) {
    dot = document.createElement("div"); dot.id = "cursor-dot";
    dot.setAttribute("aria-hidden","true"); document.body.appendChild(dot);
  }
  if (!ring) {
    ring = document.createElement("div"); ring.id = "cursor-ring";
    ring.setAttribute("aria-hidden","true"); document.body.appendChild(ring);
  }
  if (!label) {
    label = document.createElement("div"); label.id = "cursor-label";
    label.setAttribute("aria-hidden","true"); document.body.appendChild(label);
  }

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let labelX = 0, labelY = 0;
  let raf;
  let trailTimer = 0;
  let lastTrail = 0;

  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX - 2.5}px, ${mouseY - 2.5}px)`;

    // Cursor trail — spawn a dot every 60ms
    const now = Date.now();
    if (now - lastTrail > 60) {
      lastTrail = now;
      spawnTrail(mouseX, mouseY);
    }
  });

  function spawnTrail(x, y) {
    const t = document.createElement("div");
    t.className = "cursor-trail";
    t.style.cssText = `left:${x - 2}px;top:${y - 2}px;`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 600);
  }

  function lerp(a, b, n) { return a + (b - a) * n; }

  function animRing() {
    ringX = lerp(ringX, mouseX - 16, 0.12);
    ringY = lerp(ringY, mouseY - 16, 0.12);
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;

    labelX = lerp(labelX, mouseX + 22, 0.1);
    labelY = lerp(labelY, mouseY - 10, 0.1);
    label.style.transform = `translate(${labelX}px, ${labelY}px)`;
    raf = requestAnimationFrame(animRing);
  }
  animRing();

  // Hover state on interactive elements
  const hoverTargets = "a, button, [role='button'], .hero-feat, .menu-card, .review-card, .event-card, .tab-btn, .tour-tab, .lang-btn";
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener("mouseenter", () => ring.classList.add("hover"));
    el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
  });

  // Click state
  document.addEventListener("mousedown", () => ring.classList.add("click"));
  document.addEventListener("mouseup",   () => ring.classList.remove("click"));

  // iframe zone — detect when mouse is over .tour-frame iframe area
  const tourFrames = document.querySelectorAll(".tour-frame");
  tourFrames.forEach(frame => {
    const zone = frame.querySelector(".tour-cursor-zone") || frame;
    frame.addEventListener("mouseenter", () => {
      ring.classList.add("iframe-zone");
      label.textContent = "Explorer";
      label.classList.add("visible");
    });
    frame.addEventListener("mouseleave", () => {
      ring.classList.remove("iframe-zone");
      label.classList.remove("visible");
    });
  });
}

/* ── SCROLL INDICATOR ── */
function initScrollIndicator() {
  const el = document.getElementById("scroll-indicator");
  if (!el) return;
  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    el.style.width = (window.scrollY / max * 100) + "%";
  }
  window.addEventListener("scroll", update, { passive: true });
}

/* ── ACTIVE NAV ── */
function initActiveNav() {
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .mobile-menu a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === current || (current === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });
}

/* ── NAV SCROLL ── */
function initNavScroll() {
  const nav = document.getElementById("navbar");
  const callFloat = document.getElementById("call-float");
  const backTop = document.getElementById("back-top");
  function onScroll() {
    const y = window.scrollY;
    nav?.classList.toggle("scrolled", y > 40);
    callFloat?.classList.toggle("visible", y > 300);
    backTop?.classList.toggle("visible", y > 400);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ── HAMBURGER ── */
function initHamburger() {
  const btn = document.getElementById("hamburger");
  const menu = document.getElementById("mobileMenu");
  const close = document.getElementById("mobClose");
  if (!btn || !menu) return;
  const toggle = (open) => {
    menu.classList.toggle("open", open);
    btn.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
  };
  btn.addEventListener("click",  () => toggle(true));
  close?.addEventListener("click", () => toggle(false));
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => toggle(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") toggle(false); });
}

/* ── REVEAL (IntersectionObserver) ── */
function initReveal() {
  const items = document.querySelectorAll(".reveal, .reveal-stagger");
  if (!items.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        setTimeout(() => el.classList.add("visible"), i * 60);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  items.forEach(el => io.observe(el));
}

/* ── PARALLAX ── */
function initParallax() {
  const bg = document.getElementById("heroBg");
  if (!bg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        bg.style.transform = `translateY(${window.scrollY * 0.28}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ── MENU TABS ── */
function initMenuTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  const cards = document.querySelectorAll(".menu-card");
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const cat = tab.dataset.cat;
      cards.forEach(c => {
        const show = cat === "all" || c.dataset.cat === cat;
        c.classList.toggle("hidden", !show);
        if (show) {
          c.style.animation = "none";
          c.offsetHeight;
          c.style.animation = "fadeUp .4s ease both";
        }
      });
    });
  });
}

/* ── COUNTDOWN ── */
function initCountdown() {
  const eventDate = new Date("2025-12-31T23:59:59");
  const els = {
    d: document.getElementById("cd-days"),
    h: document.getElementById("cd-hours"),
    m: document.getElementById("cd-mins"),
    s: document.getElementById("cd-secs"),
  };
  if (!els.d) return;
  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    const diff = eventDate - Date.now();
    if (diff <= 0) { Object.values(els).forEach(e => e && (e.textContent = "00")); return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (els.d) els.d.textContent = pad(d);
    if (els.h) els.h.textContent = pad(h);
    if (els.m) els.m.textContent = pad(m);
    if (els.s) els.s.textContent = pad(s);
  }
  tick(); setInterval(tick, 1000);
}

/* ── TOUR TABS ── */
function initTourTabs() {
  const tabs = document.querySelectorAll(".tour-tab");
  const iframe = document.getElementById("tourIframe");
  if (!tabs.length || !iframe) return;
  const tours = {
    cafe: "https://realsee.ai/49kkWzLj",
    jeux: "https://realsee.ai/jeux",
  };
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const src = tours[tab.dataset.tour];
      if (src) {
        iframe.style.opacity = "0";
        iframe.style.transition = "opacity 0.35s ease";
        setTimeout(() => {
          iframe.src = src;
          iframe.style.opacity = "1";
        }, 350);
      }
    });
  });
}

/* ── RIPPLE ── */
function initRipple() {
  const container = document.getElementById("ripple-container");
  if (!container) return;
  document.addEventListener("pointerdown", e => {
    const r = document.createElement("div");
    r.className = "ripple-el";
    const s = 28;
    r.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - s/2}px;top:${e.clientY - s/2}px`;
    container.appendChild(r);
    setTimeout(() => r.remove(), 600);
  });
}

/* ── LAZY LOAD ── */
function initLazyLoad() {
  const imgs = document.querySelectorAll("img[loading='lazy'], img[data-src]");
  if (!imgs.length) return;
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
          io.unobserve(img);
        }
      });
    }, { rootMargin: "200px" });
    imgs.forEach(img => io.observe(img));
  }
}

/* ── SMOOTH SCROLL ── */
function initScrollSmooth() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* ── ANIMATED COUNTERS ── */
function initCounters() {
  const els = document.querySelectorAll("[data-counter]");
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = parseInt(el.dataset.counter, 10);
      const dur = 1600;
      const start = Date.now();
      const suffix = el.dataset.suffix || "";
      const raf = () => {
        const progress = Math.min((Date.now() - start) / dur, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(ease * end) + suffix;
        if (progress < 1) requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
}

/* ── MAGNETIC BUTTONS ── */
function initMagneticButtons() {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  const btns = document.querySelectorAll(".btn-primary, .btn-secondary, .btn-reserve-nav, .mob-reserve, .btn-wa-hero");
  btns.forEach(btn => {
    btn.addEventListener("mousemove", e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.18;
      const dy = (e.clientY - cy) * 0.18;
      btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-4px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
      btn.style.transition = "transform 0.4s var(--ease-spring)";
      setTimeout(() => btn.style.transition = "", 400);
    });
  });
}

/* ── CARD TILT ── */
function initCardTilt() {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  const cards = document.querySelectorAll(".hero-feat, .menu-card, .review-card, .event-card, .stat-box");
  cards.forEach(card => {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      const tiltX = y * -8;
      const tiltY = x *  8;
      card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px) scale(1.02)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.transition = "transform 0.5s var(--ease-spring)";
      setTimeout(() => card.style.transition = "", 500);
    });
  });
}

/* ── LEGAL / COOKIES MODALS (stubs) ── */
window.showCookies = () => showToast("Politique des cookies — page en cours de rédaction.");
window.showLegal   = () => showToast("Mentions légales — page en cours de rédaction.");

/* ── TOAST ── */
function showToast(msg, type = "info", duration = 3500) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add("toast-hiding");
    setTimeout(() => el.remove(), 350);
  }, duration);
}
window.showToast = showToast;
