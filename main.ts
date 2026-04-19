import { initLangSwitcher } from './i18n'
import { CONFIG }           from './config'
import { db }               from './firebase'
import { doc, onSnapshot }  from 'firebase/firestore'

/* ════ BOOT ════ */
document.addEventListener('DOMContentLoaded', () => {
  initLangSwitcher()
  initLoader()
  initStars()
  initCursor()
  initActiveNav()
  initNavScroll()
  initHamburger()
  initReveal()
  initParallax()
  initMenuTabs()
  initCountdown()
  initTourTabs()
  initRipple()
  initLazyLoad()
  initScrollSmooth()
  initCounters()
  initMagneticButtons()
  initCardTilt()
  initScrollIndicator()
  initPhoneLinks()
  initFirebaseCMS()
})

/* ── Firebase CMS (lecture publique) ── */
function initFirebaseCMS(): void {
  onSnapshot(doc(db, 'public_content', 'home'), snap => {
    if (!snap.exists()) return
    const data = snap.data() as Record<string, string>

    if (data['heroHours']) {
      document.querySelectorAll<HTMLElement>("[data-firebase='heroHours']")
        .forEach(el => { el.textContent = data['heroHours']! })
    }
    if (data['heroImageUrl']) {
      const heroBg = document.getElementById('heroBg')
      if (heroBg) heroBg.style.backgroundImage = `url('${data['heroImageUrl']}')`
    }
    if (data['heroTitle']) {
      document.querySelectorAll<HTMLElement>("[data-firebase='heroTitle']")
        .forEach(el => { el.textContent = data['heroTitle']! })
    }
  })
}

/* ── Phone links ── */
function initPhoneLinks(): void {
  document.querySelectorAll<HTMLAnchorElement>('[data-phone]').forEach(a => {
    a.href = `tel:${CONFIG.PHONE_NUMBER}`
    if (!a.textContent?.trim()) a.textContent = CONFIG.PHONE_DISPLAY
  })
  document.querySelectorAll<HTMLAnchorElement>('[data-wa]').forEach(a => {
    a.href = `https://wa.me/${CONFIG.WA_NUMBER}`
  })
}

/* ── LOADER ── */
function initLoader(): void {
  const loader = document.getElementById('loader')
  if (!loader) return
  setTimeout(() => loader.classList.add('hidden'), 1500)
}

/* ── STARS ── */
function initStars(): void {
  const container = document.getElementById('stars-bg')
  if (!container) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const frag = document.createDocumentFragment()
  for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
    const s = document.createElement('div')
    s.className = 'star'
    const size = Math.random() * 2.2 + 0.5
    s.style.cssText = `
      width:${size}px;height:${size}px;
      left:${Math.random() * 100}%;top:${Math.random() * 100}%;
      opacity:${Math.random() * 0.2 + 0.05};
      animation-delay:${Math.random() * 6}s;
      animation-duration:${3 + Math.random() * 6}s;
      ${reduced ? 'animation:none;' : ''}
    `
    frag.appendChild(s)
  }
  container.appendChild(frag)
}

/* ── CURSOR ── */
function initCursor(): void {
  if (!window.matchMedia('(pointer: fine)').matches) return
  const dot   = getOrCreate('cursor-dot')
  const ring  = getOrCreate('cursor-ring')
  const label = getOrCreate('cursor-label')
  ;[dot, ring, label].forEach(el => el.setAttribute('aria-hidden', 'true'))

  let mouseX = 0, mouseY = 0
  let ringX = 0, ringY = 0
  let labelX = 0, labelY = 0
  let lastTrail = 0

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY
    dot.style.transform = `translate(${mouseX - 2.5}px, ${mouseY - 2.5}px)`
    const now = Date.now()
    if (now - lastTrail > 60) { lastTrail = now; spawnTrail(mouseX, mouseY) }
  })

  function spawnTrail(x: number, y: number) {
    const t = document.createElement('div')
    t.className = 'cursor-trail'
    t.style.cssText = `left:${x - 2}px;top:${y - 2}px;`
    document.body.appendChild(t)
    setTimeout(() => t.remove(), 600)
  }

  const lerp = (a: number, b: number, n: number) => a + (b - a) * n
  const animRing = () => {
    ringX = lerp(ringX, mouseX - 16, 0.12); ringY = lerp(ringY, mouseY - 16, 0.12)
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`
    labelX = lerp(labelX, mouseX + 22, 0.1); labelY = lerp(labelY, mouseY - 10, 0.1)
    label.style.transform = `translate(${labelX}px, ${labelY}px)`
    requestAnimationFrame(animRing)
  }
  animRing()

  document.querySelectorAll('a, button, [role=button], .hero-feat, .menu-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'))
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'))
  })
  document.addEventListener('mousedown', () => ring.classList.add('click'))
  document.addEventListener('mouseup',   () => ring.classList.remove('click'))

  document.querySelectorAll<HTMLElement>('.tour-frame').forEach(frame => {
    frame.addEventListener('mouseenter', () => {
      ring.classList.add('iframe-zone')
      label.textContent = 'Explorer'
      label.classList.add('visible')
    })
    frame.addEventListener('mouseleave', () => {
      ring.classList.remove('iframe-zone')
      label.classList.remove('visible')
    })
  })
}

function getOrCreate(id: string): HTMLElement {
  let el = document.getElementById(id)
  if (!el) { el = document.createElement('div'); el.id = id; document.body.appendChild(el) }
  return el
}

/* ── SCROLL INDICATOR ── */
function initScrollIndicator(): void {
  const el = document.getElementById('scroll-indicator')
  if (!el) return
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    el.style.width = (window.scrollY / max * 100) + '%'
  }, { passive: true })
}

/* ── ACTIVE NAV ── */
function initActiveNav(): void {
  const current = location.pathname.split('/').pop() || 'index.html'
  document.querySelectorAll<HTMLAnchorElement>('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href')
    if (href === current || (current === '' && href === 'index.html')) a.classList.add('active')
  })
}

/* ── NAV SCROLL ── */
function initNavScroll(): void {
  const nav       = document.getElementById('navbar')
  const callFloat = document.getElementById('call-float')
  const backTop   = document.getElementById('back-top')
  const onScroll  = () => {
    const y = window.scrollY
    nav?.classList.toggle('scrolled', y > 40)
    callFloat?.classList.toggle('visible', y > 300)
    backTop?.classList.toggle('visible', y > 400)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
}

/* ── HAMBURGER ── */
function initHamburger(): void {
  const btn   = document.getElementById('hamburger')
  const menu  = document.getElementById('mobileMenu')
  const close = document.getElementById('mobClose')
  if (!btn || !menu) return
  const toggle = (open: boolean) => {
    menu.classList.toggle('open', open)
    btn.classList.toggle('is-open', open)
    btn.setAttribute('aria-expanded', String(open))
    menu.setAttribute('aria-hidden',  String(!open))
    document.body.classList.toggle('menu-open', open)
  }
  btn.addEventListener('click', () => toggle(true))
  close?.addEventListener('click', () => toggle(false))
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)))
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false) })
}

/* ── REVEAL ── */
function initReveal(): void {
  const items = document.querySelectorAll<HTMLElement>('.reveal, .reveal-stagger')
  if (!items.length) return
  const io = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => (entry.target as HTMLElement).classList.add('visible'), i * 60)
        io.unobserve(entry.target)
      }
    })
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
  items.forEach(el => io.observe(el))
}

/* ── PARALLAX ── */
function initParallax(): void {
  const bg = document.getElementById('heroBg')
  if (!bg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  let ticking = false
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        bg.style.transform = `translateY(${window.scrollY * 0.28}px)`
        ticking = false
      })
      ticking = true
    }
  }, { passive: true })
}

/* ── MENU TABS ── */
function initMenuTabs(): void {
  const tabs  = document.querySelectorAll<HTMLElement>('.tab-btn')
  const cards = document.querySelectorAll<HTMLElement>('.menu-card')
  if (!tabs.length) return
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'))
      tab.classList.add('active')
      const cat = tab.dataset.cat
      cards.forEach(c => {
        const show = cat === 'all' || c.dataset.cat === cat
        c.classList.toggle('hidden', !show)
        if (show) { c.style.animation = 'none'; c.offsetHeight; c.style.animation = 'fadeUp .4s ease both' }
      })
    })
  })
}

/* ── COUNTDOWN ── */
function initCountdown(): void {
  const eventDate = new Date('2025-12-31T23:59:59')
  const ids = ['cd-days', 'cd-hours', 'cd-mins', 'cd-secs']
  const els = ids.map(id => document.getElementById(id))
  if (!els[0]) return
  const pad = (n: number) => String(n).padStart(2, '0')
  const tick = () => {
    const diff = eventDate.getTime() - Date.now()
    if (diff <= 0) { els.forEach(e => e && (e.textContent = '00')); return }
    const vals = [
      Math.floor(diff / 86400000),
      Math.floor((diff % 86400000) / 3600000),
      Math.floor((diff % 3600000) / 60000),
      Math.floor((diff % 60000) / 1000),
    ]
    els.forEach((el, i) => { if (el) el.textContent = pad(vals[i]!) })
  }
  tick(); setInterval(tick, 1000)
}

/* ── TOUR TABS ── */
function initTourTabs(): void {
  const tabs   = document.querySelectorAll<HTMLElement>('.tour-tab')
  const iframe = document.getElementById('tourIframe') as HTMLIFrameElement | null
  if (!tabs.length || !iframe) return
  const tours: Record<string, string> = {
    cafe: 'https://realsee.ai/49kkWzLj',
    jeux: 'https://realsee.ai/jeux',
  }
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'))
      tab.classList.add('active')
      const src = tours[tab.dataset.tour ?? '']
      if (src) {
        iframe.style.opacity = '0'
        setTimeout(() => { iframe.src = src; iframe.style.opacity = '1' }, 350)
      }
    })
  })
}

/* ── RIPPLE ── */
function initRipple(): void {
  const container = document.getElementById('ripple-container')
  if (!container) return
  document.addEventListener('pointerdown', e => {
    const r = document.createElement('div')
    r.className = 'ripple-el'
    const s = 28
    r.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - s / 2}px;top:${e.clientY - s / 2}px`
    container.appendChild(r)
    setTimeout(() => r.remove(), 600)
  })
}

/* ── LAZY LOAD ── */
function initLazyLoad(): void {
  const imgs = document.querySelectorAll<HTMLImageElement>("img[loading='lazy'], img[data-src]")
  if (!imgs.length || !('IntersectionObserver' in window)) return
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        if (img.dataset['src']) { img.src = img.dataset['src']; delete img.dataset['src'] }
        io.unobserve(img)
      }
    })
  }, { rootMargin: '200px' })
  imgs.forEach(img => io.observe(img))
}

/* ── SMOOTH SCROLL ── */
function initScrollSmooth(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href')!)
      if (!target) return
      e.preventDefault()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  })
}

/* ── ANIMATED COUNTERS ── */
function initCounters(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-counter]')
  if (!els.length) return
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      const el  = entry.target as HTMLElement
      const end = parseInt(el.dataset['counter']!, 10)
      const dur = 1600; const start = Date.now()
      const suffix = el.dataset['suffix'] ?? ''
      const raf = () => {
        const progress = Math.min((Date.now() - start) / dur, 1)
        const ease = 1 - Math.pow(1 - progress, 3)
        el.textContent = Math.round(ease * end) + suffix
        if (progress < 1) requestAnimationFrame(raf)
      }
      requestAnimationFrame(raf)
      io.unobserve(el)
    })
  }, { threshold: 0.5 })
  els.forEach(el => io.observe(el))
}

/* ── MAGNETIC BUTTONS ── */
function initMagneticButtons(): void {
  if (!window.matchMedia('(pointer: fine)').matches) return
  document.querySelectorAll<HTMLElement>('.btn-primary, .btn-secondary, .btn-reserve-nav, .mob-reserve').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect()
      const dx = (e.clientX - rect.left - rect.width / 2) * 0.18
      const dy = (e.clientY - rect.top  - rect.height / 2) * 0.18
      btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-4px)`
    })
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = ''
      btn.style.transition = 'transform 0.4s var(--ease-spring)'
      setTimeout(() => { btn.style.transition = '' }, 400)
    })
  })
}

/* ── CARD TILT ── */
function initCardTilt(): void {
  if (!window.matchMedia('(pointer: fine)').matches) return
  document.querySelectorAll<HTMLElement>('.hero-feat, .menu-card, .review-card, .event-card, .stat-box').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width  - 0.5
      const y = (e.clientY - rect.top)  / rect.height - 0.5
      card.style.transform = `perspective(600px) rotateX(${y * -8}deg) rotateY(${x * 8}deg) translateY(-6px) scale(1.02)`
    })
    card.addEventListener('mouseleave', () => {
      card.style.transform = ''
      card.style.transition = 'transform 0.5s var(--ease-spring)'
      setTimeout(() => { card.style.transition = '' }, 500)
    })
  })
}

/* ── TOAST ── */
export function showToast(msg: string, type: 'info' | 'success' | 'error' = 'info', duration = 3500): void {
  const container = document.getElementById('toast-container')
  if (!container) return
  const el = document.createElement('div')
  el.className = `toast toast-${type}`
  el.textContent = msg
  container.appendChild(el)
  setTimeout(() => {
    el.classList.add('toast-hiding')
    setTimeout(() => el.remove(), 350)
  }, duration)
}

window.showToast   = showToast
window.showCookies = () => showToast('Politique des cookies — page en cours de rédaction.')
window.showLegal   = () => showToast('Mentions légales — page en cours de rédaction.')
