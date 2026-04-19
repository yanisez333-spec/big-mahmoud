import { db, auth } from './firebase'
import {
  collection, doc, onSnapshot, query as _query, orderBy as _orderBy,
  updateDoc, deleteDoc, serverTimestamp, setDoc, getDoc,
} from 'firebase/firestore'
import {
  signInWithEmailAndPassword, signOut,
  updatePassword, reauthenticateWithCredential, EmailAuthProvider,
} from 'firebase/auth'

/* ═══════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════ */
interface Reservation {
  id:        string
  name?:     string
  phone?:    string
  date?:     string
  guests?:   string
  note?:     string
  status?:   'pending' | 'confirmed' | 'cancelled'
  createdAt?: { toDate: () => Date }
}

interface SiteContent {
  heroTitle?:    string
  heroSub?:      string
  heroHours?:    string
  heroImageUrl?: string
  phone?:        string
  sections?:     string[]
}

/* ═══════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════ */
let allReservations: Reservation[] = []
let currentFilter   = 'all'
let pendingAction:  (() => Promise<void>) | null = null
let unsubRes:       (() => void) | null = null

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initTabs()
  initClock()

  auth.onAuthStateChanged(user => {
    if (user) {
      hide('login-screen')
      show('app')
      const emailEl = document.getElementById('user-email')
      if (emailEl) emailEl.textContent = user.email ?? ''
      startListening()
      loadCMSContent()
    } else {
      show('login-screen')
      hide('app')
      if (unsubRes) { unsubRes(); unsubRes = null }
    }
  })

  /* Login */
  document.getElementById('login-btn-el')?.addEventListener('click', () => void tryLogin())
  ;['email-input', 'pwd-input'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') void tryLogin()
    })
  })

  /* Logout */
  document.getElementById('logout-btn')?.addEventListener('click', () => void signOut(auth))

  /* Back to public */
  document.getElementById('back-public-btn')?.addEventListener('click', () => {
    window.location.href = 'index.html'
  })

  /* Filters */
  document.getElementById('search-input')?.addEventListener('input', renderTable)

  /* Modal */
  document.getElementById('modal-confirm-btn')?.addEventListener('click', () => void runModal())
  document.getElementById('modal-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal()
  })

  /* CMS Save */
  document.getElementById('cms-save-btn')?.addEventListener('click', () => void saveCMS())

  /* Password change */
  document.getElementById('pwd-save-btn')?.addEventListener('click', () => void changePassword())

  /* Filter buttons */
  document.querySelectorAll<HTMLElement>('.filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset['filter'] ?? 'all'
      document.querySelectorAll<HTMLElement>('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      renderTable()
    })
  })

  /* Bottom CMS save button */
  document.getElementById('cms-save-btn-bottom')?.addEventListener('click', () => void saveCMS())

  /* Modal cancel */
  document.getElementById('modal-cancel-btn')?.addEventListener('click', closeModal)
})

/* ═══════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════ */
async function tryLogin(): Promise<void> {
  const email = (document.getElementById('email-input') as HTMLInputElement)?.value.trim()
  const pwd   = (document.getElementById('pwd-input')   as HTMLInputElement)?.value
  const err   = document.getElementById('login-error')
  const btn   = document.getElementById('login-btn-el') as HTMLButtonElement

  if (!email || !pwd) {
    setError(err, 'Remplis email et mot de passe')
    return
  }
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...'
  btn.disabled  = true

  try {
    await signInWithEmailAndPassword(auth, email, pwd)
  } catch (e: unknown) {
    const code = (e as { code?: string }).code ?? ''
    const msg =
      code === 'auth/wrong-password' || code === 'auth/invalid-credential' ? 'Mot de passe incorrect' :
      code === 'auth/user-not-found'  ? 'Email introuvable' :
      code === 'auth/too-many-requests' ? 'Trop de tentatives, réessaie plus tard' :
      'Erreur de connexion'
    setError(err, msg)
  } finally {
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> &nbsp; Accéder'
    btn.disabled  = false
  }
}

/* ═══════════════════════════════════════════════
   RESERVATIONS
═══════════════════════════════════════════════ */
function startListening(): void {
  const { query, orderBy } = { query: _query, orderBy: _orderBy }
  const ordered = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'))
  unsubRes = onSnapshot(ordered, snap => {
    allReservations = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Reservation)
    updateStats()
    renderTable()
  }, err => {
    console.error(err)
    const inner = document.getElementById('table-inner')
    if (inner) inner.innerHTML = `<div class="empty-state"><i class="fas fa-wifi-slash"></i><p>Erreur Firebase.<br>Vérifie les règles Firestore.</p></div>`
  })
}

function updateStats(): void {
  const todayStr = new Date().toISOString().slice(0, 10)
  setText('stat-total',     String(allReservations.length))
  setText('stat-pending',   String(allReservations.filter(r => r.status === 'pending').length))
  setText('stat-confirmed', String(allReservations.filter(r => r.status === 'confirmed').length))
  setText('stat-cancelled', String(allReservations.filter(r => r.status === 'cancelled').length))
  setText('stat-today',     String(allReservations.filter(r => r.date === todayStr).length))
}

function renderTable(): void {
  const inner = document.getElementById('table-inner')
  if (!inner) return
  const q = (document.getElementById('search-input') as HTMLInputElement)?.value.toLowerCase() ?? ''
  let data = allReservations
  if (currentFilter !== 'all') data = data.filter(r => r.status === currentFilter)
  if (q) data = data.filter(r =>
    (r.name  ?? '').toLowerCase().includes(q) ||
    (r.phone ?? '').toLowerCase().includes(q) ||
    (r.date  ?? '').includes(q)
  )

  if (!data.length) {
    inner.innerHTML = `<div class="empty-state"><i class="fas fa-calendar-xmark"></i><p>Aucune réservation trouvée.</p></div>`
    return
  }

  const rows = data.map(r => {
    const badge = r.status === 'confirmed' ? 'badge-confirmed' : r.status === 'cancelled' ? 'badge-cancelled' : 'badge-pending'
    const label = r.status === 'confirmed' ? 'Confirmée'       : r.status === 'cancelled' ? 'Annulée'        : 'En attente'
    const ts = r.createdAt?.toDate
      ? r.createdAt.toDate().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
      : '—'
    const note = r.note ? `<span class="res-note" title="${r.note}">${r.note}</span>` : '<span style="color:var(--muted);font-size:.78rem">—</span>'
    const id = r.id, name = r.name ?? '—', phone = r.phone ?? ''
    return `<tr>
      <td><div class="res-name">${name}</div><div class="res-phone">${phone}</div></td>
      <td><span class="res-date">${formatDate(r.date)}</span></td>
      <td><span class="res-guests"><i class="fas fa-users" style="font-size:.7rem"></i>${r.guests ?? '—'}</span></td>
      <td>${note}</td>
      <td><span class="badge ${badge}">${label}</span></td>
      <td><span class="res-time">${ts}</span></td>
      <td><div class="actions">
        ${r.status !== 'confirmed' ? `<button class="action-btn confirm" title="Confirmer" data-action="confirm" data-id="${id}" data-name="${name}"><i class="fas fa-check"></i></button>` : ''}
        ${r.status !== 'cancelled' ? `<button class="action-btn cancel"  title="Annuler"   data-action="cancel"  data-id="${id}" data-name="${name}"><i class="fas fa-xmark"></i></button>` : ''}
        <button class="action-btn del" title="Supprimer" data-action="delete" data-id="${id}" data-name="${name}"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`
  }).join('')

  inner.innerHTML = `<table class="res-table">
    <thead><tr>
      <th>Client</th><th>Date</th><th>Personnes</th><th>Note</th><th>Statut</th><th>Reçue le</th><th>Actions</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`

  // Bind action buttons
  inner.querySelectorAll<HTMLElement>('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { action, id, name } = btn.dataset
      if (action === 'confirm') confirmRes(id!, name!)
      else if (action === 'cancel') cancelRes(id!, name!)
      else if (action === 'delete') deleteRes(id!, name!)
    })
  })
}

function formatDate(d?: string): string {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function confirmRes(id: string, name: string): void {
  openModal('Confirmer la réservation', `Confirmer la réservation de <strong>${name}</strong> ?`, async () => {
    await updateDoc(doc(db, 'reservations', id), { status: 'confirmed' })
    toast('Réservation confirmée ✓', 'success')
  })
}
function cancelRes(id: string, name: string): void {
  openModal('Annuler la réservation', `Annuler la réservation de <strong>${name}</strong> ?`, async () => {
    await updateDoc(doc(db, 'reservations', id), { status: 'cancelled' })
    toast('Réservation annulée', 'error')
  })
}
function deleteRes(id: string, name: string): void {
  openModal('Supprimer la réservation', `Supprimer définitivement la réservation de <strong>${name}</strong> ? Action irréversible.`, async () => {
    await deleteDoc(doc(db, 'reservations', id))
    toast('Réservation supprimée', 'error')
  })
}



/* ═══════════════════════════════════════════════
   CMS — CONTENU DU SITE
═══════════════════════════════════════════════ */
async function loadCMSContent(): Promise<void> {
  const snap = await getDoc(doc(db, 'public_content', 'home'))
  const data: SiteContent = snap.exists() ? (snap.data() as SiteContent) : {}

  setValue('cms-hero-title',    data.heroTitle    ?? 'BIG MAHMOUD')
  setValue('cms-hero-sub',      data.heroSub      ?? 'Café · Restaurant · Chicha · Visite 3D')
  setValue('cms-hero-hours',    data.heroHours    ?? 'Ouvert 24h/24 · 7j/7')
  setValue('cms-hero-image',    data.heroImageUrl ?? '')
  setValue('cms-phone',         data.phone        ?? '+216 26 740 303')

  // Section order
  const sections = data.sections ?? ['hero', 'features', 'menu', 'events', 'gallery', 'contact']
  renderSectionOrder(sections)
}

async function saveCMS(): Promise<void> {
  const btn = document.getElementById('cms-save-btn') as HTMLButtonElement
  btn.disabled = true
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sauvegarde...'

  try {
    await setDoc(doc(db, 'public_content', 'home'), {
      heroTitle:    getValue('cms-hero-title'),
      heroSub:      getValue('cms-hero-sub'),
      heroHours:    getValue('cms-hero-hours'),
      heroImageUrl: getValue('cms-hero-image'),
      phone:        getValue('cms-phone'),
      sections:     getSectionOrder(),
    }, { merge: true })
    toast('Contenu sauvegardé ✓', 'success')
  } catch (e) {
    console.error(e)
    toast('Erreur lors de la sauvegarde', 'error')
  } finally {
    btn.disabled = false
    btn.innerHTML = '<i class="fas fa-save"></i> Sauvegarder'
  }
}

const SECTION_LABELS: Record<string, string> = {
  hero:     '🏠 Hero (accueil)',
  features: '✨ Features (café, food...)',
  menu:     '🍽️ Menu',
  events:   '🎉 Événements',
  gallery:  '🖼️ Galerie',
  contact:  '📍 Contact & Carte',
}

function renderSectionOrder(sections: string[]): void {
  const container = document.getElementById('section-order')
  if (!container) return
  container.innerHTML = sections.map((s, i) => `
    <div class="section-item" data-section="${s}">
      <span class="section-drag-handle"><i class="fas fa-grip-vertical"></i></span>
      <span class="section-label">${SECTION_LABELS[s] ?? s}</span>
      <div class="section-arrows">
        ${i > 0                  ? `<button class="arrow-btn" data-dir="up"   data-idx="${i}"><i class="fas fa-chevron-up"></i></button>` : ''}
        ${i < sections.length-1  ? `<button class="arrow-btn" data-dir="down" data-idx="${i}"><i class="fas fa-chevron-down"></i></button>` : ''}
      </div>
    </div>
  `).join('')

  container.querySelectorAll<HTMLElement>('.arrow-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset['idx']!)
      const dir = btn.dataset['dir']
      const items = [...container.querySelectorAll<HTMLElement>('.section-item')]
      const current = getSectionOrder()
      if (dir === 'up' && idx > 0) {
        ;[current[idx - 1], current[idx]] = [current[idx]!, current[idx - 1]!]
      } else if (dir === 'down' && idx < current.length - 1) {
        ;[current[idx], current[idx + 1]] = [current[idx + 1]!, current[idx]!]
      }
      renderSectionOrder(current)
    })
  })
}

function getSectionOrder(): string[] {
  const container = document.getElementById('section-order')
  if (!container) return []
  return [...container.querySelectorAll<HTMLElement>('.section-item')].map(el => el.dataset['section'] ?? '')
}

/* ═══════════════════════════════════════════════
   CHANGE PASSWORD
═══════════════════════════════════════════════ */
async function changePassword(): Promise<void> {
  const currentPwd = (document.getElementById('pwd-current') as HTMLInputElement)?.value
  const newPwd     = (document.getElementById('pwd-new')     as HTMLInputElement)?.value
  const confirmPwd = (document.getElementById('pwd-confirm') as HTMLInputElement)?.value
  const errEl      = document.getElementById('pwd-error')
  const btn        = document.getElementById('pwd-save-btn') as HTMLButtonElement

  if (!currentPwd || !newPwd || !confirmPwd) {
    setError(errEl, 'Remplis tous les champs')
    return
  }
  if (newPwd !== confirmPwd) {
    setError(errEl, 'Les nouveaux mots de passe ne correspondent pas')
    return
  }
  if (newPwd.length < 6) {
    setError(errEl, 'Le nouveau mot de passe doit faire au moins 6 caractères')
    return
  }

  btn.disabled = true
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'

  try {
    const user = auth.currentUser!
    const cred = EmailAuthProvider.credential(user.email!, currentPwd)
    await reauthenticateWithCredential(user, cred)
    await updatePassword(user, newPwd)
    toast('Mot de passe modifié ✓', 'success')
    ;['pwd-current', 'pwd-new', 'pwd-confirm'].forEach(id => {
      const el = document.getElementById(id) as HTMLInputElement | null
      if (el) el.value = ''
    })
  } catch (e: unknown) {
    const code = (e as { code?: string }).code ?? ''
    const msg =
      code === 'auth/wrong-password' || code === 'auth/invalid-credential' ? 'Mot de passe actuel incorrect' :
      code === 'auth/too-many-requests' ? 'Trop de tentatives, réessaie plus tard' :
      'Erreur lors du changement'
    setError(errEl, msg)
  } finally {
    btn.disabled = false
    btn.innerHTML = '<i class="fas fa-key"></i> Changer le mot de passe'
  }
}

/* ═══════════════════════════════════════════════
   TABS
═══════════════════════════════════════════════ */
function initTabs(): void {
  document.querySelectorAll<HTMLElement>('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset['tab']
      document.querySelectorAll<HTMLElement>('.admin-tab-btn').forEach(b => b.classList.remove('active'))
      document.querySelectorAll<HTMLElement>('.admin-tab-content').forEach(c => c.classList.remove('active'))
      btn.classList.add('active')
      document.getElementById(`tab-${tab}`)?.classList.add('active')
    })
  })
}

/* ═══════════════════════════════════════════════
   CLOCK
═══════════════════════════════════════════════ */
function initClock(): void {
  const el = document.getElementById('clock')
  if (!el) return
  const tick = () => {
    el.textContent = new Date().toLocaleString('fr-FR', {
      weekday: 'short', day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  }
  tick(); setInterval(tick, 1000)
}

/* ═══════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════ */
function openModal(title: string, body: string, action: () => Promise<void>): void {
  const titleEl = document.getElementById('modal-title')
  const bodyEl  = document.getElementById('modal-body')
  if (titleEl) titleEl.innerHTML = title
  if (bodyEl)  bodyEl.innerHTML  = body
  document.getElementById('modal-overlay')?.classList.add('open')
  pendingAction = action
}
function closeModal(): void {
  document.getElementById('modal-overlay')?.classList.remove('open')
  pendingAction = null
}
async function runModal(): Promise<void> {
  if (pendingAction) { await pendingAction(); closeModal() }
}

/* ═══════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════ */
function toast(msg: string, type: 'success' | 'error' = 'success'): void {
  const wrap = document.getElementById('toast-wrap')
  if (!wrap) return
  const el = document.createElement('div')
  el.className = `toast ${type}`
  el.innerHTML = `<i class="fas fa-${type === 'success' ? 'circle-check' : 'circle-xmark'}"></i> ${msg}`
  wrap.appendChild(el)
  setTimeout(() => el.remove(), 3500)
}

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function show(id: string): void { const el = document.getElementById(id); if (el) el.style.display = 'block' }
function hide(id: string): void { const el = document.getElementById(id); if (el) el.style.display = 'none'  }
function setText(id: string, val: string): void { const el = document.getElementById(id); if (el) el.textContent = val }
function setValue(id: string, val: string): void {
  const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null
  if (el) el.value = val
}
function getValue(id: string): string {
  const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null
  return el?.value.trim() ?? ''
}
function setError(el: HTMLElement | null, msg: string): void {
  if (!el) return
  el.innerHTML = `<i class="fas fa-circle-exclamation"></i> ${msg}`
  setTimeout(() => { if (el) el.innerHTML = '' }, 4000)
}
