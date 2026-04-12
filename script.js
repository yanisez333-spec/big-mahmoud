/* ── CONFIG ── */
const CONFIG = {
  WHATSAPP_NUMBER: "21621006219",
  EVENT_DATE: "2026-04-15T19:00:00"
};

/* ── ACTIVE NAV ── */
function initActiveNav() {
  const file = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const isActive = href === file || (file === '' && href === 'index.html');
    a.classList.toggle('active', isActive);
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  // Hide loader quickly — fixes "page charges mais ne s'ouvre pas"
  setTimeout(() => document.getElementById('loader')?.classList.add('hidden'), 250);

  initActiveNav();
  initStars(22);
  initNavScrolled();
  initHamburger();
  initReveal();
  initMenuTabs();
  initCountdown();
  initTourTabs();
});

/* ── STARS (accueil only) ── */
function initStars(count) {
  const container = document.getElementById('stars-bg');
  if (!container) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2 + 0.8;
    const delay = Math.random() * 4;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      opacity:${Math.random()*0.25+0.08};
      animation-delay:${delay}s;
      ${reduced ? 'animation:none;' : ''}
    `;
    container.appendChild(s);
  }
}

/* ── NAVBAR SCROLL EFFECT ── */
function initNavScrolled() {
  const navbar   = document.getElementById('navbar');
  const scrollInd = document.getElementById('scroll-indicator');
  const backTop   = document.getElementById('back-top');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    const y   = window.scrollY;
    const max = document.body.scrollHeight - window.innerHeight;
    if (scrollInd && max > 0) scrollInd.style.width = ((y / max) * 100) + '%';
    navbar.classList.toggle('scrolled', y > 60);
    if (backTop) backTop.classList.toggle('visible', y > 300);
  }, { passive: true });
}

/* ── HAMBURGER ── */
function initHamburger() {
  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('mobileMenu');
  if (!ham || !mob) return;
  ham.addEventListener('click', () => {
    mob.classList.toggle('open');
    document.body.style.overflow = mob.classList.contains('open') ? 'hidden' : '';
  });
  // Close on link click
  mob.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mob.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ── REVEAL ANIMATIONS ── */
function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ── MENU TABS ── */
function initMenuTabs() {
  const tabs  = document.querySelectorAll('.tab-btn');
  const items = document.querySelectorAll('.menu-card');
  if (!tabs.length) return;

  const activate = (category) => {
    items.forEach(item => {
      item.classList.toggle('hidden', category !== 'all' && item.dataset.category !== category);
    });
  };

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activate(btn.dataset.tab);
    });
  });
  activate('all');
}

/* ── COUNTDOWN ── */
function initCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;
  const target = new Date(CONFIG.EVENT_DATE).getTime();

  const update = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      el.innerHTML = '<p style="color:var(--gold);font-family:\'Playfair Display\',serif;font-size:1.2rem;">Événement en cours !</p>';
      return;
    }
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    const secs  = Math.floor((diff % 60000) / 1000);
    el.innerHTML = `
      <div class="countdown-item"><span class="countdown-num">${days}</span><span>Jours</span></div>
      <div class="countdown-item"><span class="countdown-num">${hours}</span><span>Heures</span></div>
      <div class="countdown-item"><span class="countdown-num">${mins}</span><span>Minutes</span></div>
      <div class="countdown-item"><span class="countdown-num">${secs}</span><span>Secondes</span></div>
    `;
  };
  update();
  setInterval(update, 1000);
}

/* ── TOUR TABS ── */
function initTourTabs() {
  const tabs   = document.querySelectorAll('.tour-tab');
  const iframe = document.getElementById('tourIframe');
  if (!tabs.length || !iframe) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      iframe.src = tab.dataset.tour === 'cafe'
        ? 'https://realsee.ai/49kkWzLj'
        : 'https://realsee.ai/ByNN9LMK';
    });
  });
}

/* ── LIGHTBOX ── */
function openLightbox(item) {
  const img = item.querySelector('img');
  if (!img) return;
  document.getElementById('lightbox-img').src = img.src;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
}
window.openLightbox  = openLightbox;
window.closeLightbox = closeLightbox;
document.addEventListener('DOMContentLoaded', () => {
  const lb = document.getElementById('lightbox');
  if (lb) lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* ── FAQ ── */
function toggleFaq(el) {
  const item    = el.parentElement;
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}
window.toggleFaq = toggleFaq;

/* ── RESERVATION FORM ── */
function submitForm() {
  const name   = document.getElementById('f_name').value.trim();
  const phone  = document.getElementById('f_phone').value.trim();
  const date   = document.getElementById('f_date').value;
  const guests = document.getElementById('f_guests').value;
  const note   = document.getElementById('f_note').value.trim();

  if (!name || !phone) {
    alert('Veuillez remplir votre nom et votre numéro de téléphone.');
    return;
  }
  const msg = `Nouvelle réservation Big Mahmoud :\nNom : ${name}\nTéléphone : ${phone}\nDate : ${date || 'non précisée'}\nPersonnes : ${guests}\nNote : ${note || 'aucune'}`;
  const waLink = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

  if (confirm(`Envoyer cette réservation sur WhatsApp au +216 21 006 219 ?`)) {
    window.open(waLink, '_blank');
    document.getElementById('form-container').style.display = 'none';
    document.getElementById('form-success').style.display   = 'block';
  }
}
window.submitForm = submitForm;

function resetForm() {
  document.getElementById('form-container').style.display = 'block';
  document.getElementById('form-success').style.display   = 'none';
  ['f_name','f_phone','f_date','f_note'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}
window.resetForm = resetForm;

/* ── LEGAL / COOKIES ── */
function showLegal() {
  alert('Big Mahmoud — SARL au capital de X DT. Adresse : Av. Hedi Chaker, El Jem 5160. Responsable : M. Mahmoud.');
}
function showCookies() {
  alert("Ce site utilise des cookies essentiels. Aucune donnée personnelle n'est revendue.");
}
window.showLegal   = showLegal;
window.showCookies = showCookies;
