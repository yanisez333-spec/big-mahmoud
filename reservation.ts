import './main'
import { db }          from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { t }           from './i18n'

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('res-submit-btn')
  btn?.addEventListener('click', () => void submitForm())

  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.form-input').forEach(el => {
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !(el instanceof HTMLTextAreaElement)) void submitForm()
    })
  })

  const newBtn = document.getElementById('res-new-btn')
  newBtn?.addEventListener('click', resetForm)
})

async function submitForm(): Promise<void> {
  const name   = (document.getElementById('f_name')   as HTMLInputElement)?.value.trim()
  const phone  = (document.getElementById('f_phone')  as HTMLInputElement)?.value.trim()
  const date   = (document.getElementById('f_date')   as HTMLInputElement)?.value
  const guests = (document.getElementById('f_guests') as HTMLSelectElement)?.value
  const note   = (document.getElementById('f_note')   as HTMLTextAreaElement)?.value.trim()

  if (!name || !phone || !date) {
    showError(t('res.error'))
    return
  }

  const btn = document.getElementById('res-submit-btn') as HTMLButtonElement
  btn.disabled = true
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'

  try {
    await addDoc(collection(db, 'reservations'), {
      name, phone, date, guests, note: note || '',
      status:    'pending',
      createdAt: serverTimestamp(),
    })

    // ✅ No WhatsApp redirect — just show success
    showSuccess()
  } catch (err) {
    console.error(err)
    showError(t('res.err.save'))
    btn.disabled = false
    btn.textContent = t('res.submit')
  }
}

function showSuccess(): void {
  const formContainer = document.getElementById('form-container')
  const formSuccess   = document.getElementById('form-success')
  if (formContainer) formContainer.style.display = 'none'
  if (formSuccess)   formSuccess.style.display   = 'flex'
}

function resetForm(): void {
  const formContainer = document.getElementById('form-container')
  const formSuccess   = document.getElementById('form-success')
  if (formContainer) formContainer.style.display = 'block'
  if (formSuccess)   formSuccess.style.display   = 'none'
  ;['f_name', 'f_phone', 'f_date', 'f_note'].forEach(id => {
    const el = document.getElementById(id) as HTMLInputElement | null
    if (el) el.value = ''
  })
  const btn = document.getElementById('res-submit-btn') as HTMLButtonElement | null
  if (btn) { btn.disabled = false; btn.textContent = t('res.submit') }
}

function showError(msg: string): void {
  const err = document.getElementById('form-error')
  if (!err) { alert(msg); return }
  err.textContent = msg
  err.style.display = 'block'
  setTimeout(() => { err.style.display = 'none' }, 4000)
}
