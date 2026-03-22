// Entry point — registers window.SimplifyBooking, bootstraps UI
import { t } from './i18n.js'
import { collectContext, mergeContext } from './context.js'
import { getConsultants, getAvailability, postBooking } from './api.js'
import {
  el, renderProgressBar, renderHeader, renderLoading, renderError,
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5,
  generateIcs,
} from './ui.js'
import cssText from './styles.css'

// --- Find own script tag ---
const scriptEl = document.currentScript || document.querySelector('script[src*="widget.js"]')

// --- Read config from data attributes ---
const config = {
  apiUrl: (scriptEl && scriptEl.dataset.api) || '',
  consultantsUrl: (scriptEl && scriptEl.dataset.consultantsUrl) || '',
  lang: (scriptEl && scriptEl.dataset.lang) || 'de',
  brand: (scriptEl && scriptEl.dataset.brand) || '',
  consultant: (scriptEl && scriptEl.dataset.consultant) || '',
  apiKey: (scriptEl && scriptEl.dataset.apiKey) || '',
}

// --- Auto-collected context ---
const autoContext = collectContext(scriptEl)
if (config.brand) autoContext.brand = config.brand

// --- State ---
let state = createFreshState()

function createFreshState() {
  return {
    step: 1,
    lang: config.lang,
    consultants: [],
    selectedConsultant: null,
    selectedDate: null,
    selectedTime: null,
    availableSlots: [],
    visitor: { name: '', email: '', company: '', topic: '' },
    additionalAttendees: '',
    honeypot: '',
    gdprConsent: false,
    context: { ...autoContext },
    booking: null,
    error: null,
    loading: false,
    consultantsUrl: config.consultantsUrl,
    apiUrl: config.apiUrl,
    submitting: false,
  }
}

// Expose lang for error rendering fallback
window.__sbLang = config.lang

// --- Event system ---
const _listeners = {}

function on(event, fn) {
  if (!_listeners[event]) _listeners[event] = []
  _listeners[event].push(fn)
}

function _emit(event, data) {
  const fns = _listeners[event] || []
  for (const fn of fns) {
    try { fn(data) } catch (_) { /* listener error, ignore */ }
  }
}

// --- Inject CSS ---
function injectStyles() {
  if (document.getElementById('sb-styles')) return
  const style = document.createElement('style')
  style.id = 'sb-styles'
  style.textContent = cssText
  document.head.appendChild(style)
}

// --- Build modal shell (once) ---
let backdrop = null
let modalContent = null
let modalHeader = null
let modalProgress = null
let modalFooter = null

function buildModal() {
  if (backdrop) return

  backdrop = el('div', { id: 'sb-backdrop', class: 'sb-backdrop' })

  const modal = el('div', { id: 'sb-modal', class: 'sb-modal' })

  modalHeader = el('div', { id: 'sb-header-container' })
  modalProgress = el('div', { id: 'sb-progress-container' })
  modalContent = el('div', { id: 'sb-content', class: 'sb-content' })
  modalFooter = el('div', { id: 'sb-footer', class: 'sb-footer' })

  modal.appendChild(modalHeader)
  modal.appendChild(modalProgress)
  modal.appendChild(modalContent)
  modal.appendChild(modalFooter)
  backdrop.appendChild(modal)

  // Close on backdrop click
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close()
  })

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('sb-visible')) {
      close()
    }
  })

  document.body.appendChild(backdrop)
}

// --- Render current step ---
function render() {
  if (!backdrop) return

  const lang = state.lang
  const stepTitles = {
    1: t(lang, 'step1.title'),
    2: t(lang, 'step2.title'),
    3: t(lang, 'step3.title'),
    4: t(lang, 'step4.title'),
    5: t(lang, 'step5.title'),
  }

  const callbacks = {
    onBack: () => goToStep(state.step - 1),
    onClose: () => close(),
    onSelectConsultant: (id) => {
      state.selectedConsultant = id
      goToStep(2)
    },
    onSelectDate: (dateStr) => {
      state.selectedDate = dateStr
      state.selectedTime = null
      goToStep(3)
    },
    onSelectTime: (time) => {
      state.selectedTime = time
      render() // re-render to show selection, then user clicks next
    },
    onFieldChange: (field, value) => {
      if (field === 'gdprConsent') {
        state.gdprConsent = value
      } else if (field === 'honeypot') {
        state.honeypot = value
      } else if (field === 'attendees') {
        state.additionalAttendees = value
      } else {
        state.visitor[field] = value
      }
      // Update footer button state
      renderFooterContent()
    },
    onDownloadIcs: () => downloadIcs(),
    onSubmit: () => submitBooking(),
  }

  // Header
  modalHeader.textContent = ''
  modalHeader.appendChild(renderHeader(stepTitles[state.step], state.step, callbacks))

  // Progress
  modalProgress.textContent = ''
  modalProgress.appendChild(renderProgressBar(state.step, 5))

  // Content
  modalContent.textContent = ''

  if (state.loading) {
    modalContent.appendChild(renderLoading(t(lang, 'common.loading')))
  } else if (state.error) {
    modalContent.appendChild(renderError(state.error, () => {
      state.error = null
      retryCurrentStep()
    }))
  } else {
    switch (state.step) {
      case 1: modalContent.appendChild(renderStep1(state, callbacks)); break
      case 2: modalContent.appendChild(renderStep2(state, callbacks)); break
      case 3: modalContent.appendChild(renderStep3(state, callbacks)); break
      case 4: modalContent.appendChild(renderStep4(state, callbacks)); break
      case 5: modalContent.appendChild(renderStep5(state, callbacks)); break
    }
  }

  // Footer
  renderFooterContent()
}

function renderFooterContent() {
  if (!modalFooter) return
  const lang = state.lang
  modalFooter.textContent = ''

  if (state.step === 3 && state.selectedTime) {
    modalFooter.appendChild(el('button', {
      id: 'sb-footer-next',
      class: 'sb-btn sb-btn-primary',
      type: 'button',
      onclick: () => goToStep(4),
    }, [t(lang, 'common.next')]))
  } else if (state.step === 4) {
    const canSubmit = state.visitor.name && state.visitor.email && state.visitor.company
      && state.visitor.topic && state.gdprConsent && !state.submitting
    modalFooter.appendChild(el('button', {
      id: 'sb-footer-submit',
      class: 'sb-btn sb-btn-cta',
      type: 'button',
      disabled: !canSubmit,
      onclick: () => submitBooking(),
    }, [state.submitting ? t(lang, 'common.loading') : t(lang, 'step4.submit')]))
  } else if (state.step === 5) {
    modalFooter.appendChild(el('button', {
      id: 'sb-footer-close',
      class: 'sb-btn sb-btn-secondary',
      type: 'button',
      onclick: () => close(),
    }, [t(lang, 'common.close')]))
  }
  // Steps 1-2: no footer buttons (selection advances automatically)
}

// --- Step navigation ---
async function goToStep(step) {
  if (step < 1 || step > 5) return

  state.step = step
  state.error = null

  if (step === 1) {
    await loadConsultants()
  } else if (step === 3) {
    await loadAvailability()
  } else {
    render()
  }
}

// --- Load consultants ---
async function loadConsultants() {
  if (state.consultants.length > 0) {
    render()
    return
  }
  state.loading = true
  render()

  const result = await getConsultants(state.apiUrl, state.consultantsUrl)
  state.loading = false

  if (result.ok) {
    state.consultants = result.data
  } else {
    state.error = t(state.lang, 'errors.consultantsFailed')
  }
  render()
}

// --- Load availability ---
async function loadAvailability() {
  state.loading = true
  state.availableSlots = []
  render()

  const consultantId = state.selectedConsultant === '__best__' ? '' : state.selectedConsultant
  const result = await getAvailability(
    state.apiUrl, state.consultantsUrl, consultantId, state.selectedDate, state.selectedDate
  )
  state.loading = false

  if (result.ok && result.data && result.data.slots) {
    state.availableSlots = result.data.slots
  } else {
    // Spec: if availability fetch fails, show slots as unknown (all available)
    // Use consultant's configured slots if available, otherwise defaults
    state.availableSlots = getDefaultSlots()
  }
  render()
}

// Default slots when availability API fails
function getDefaultSlots() {
  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']
  return times.map(time => ({ time, available: true }))
}

// --- Submit booking ---
async function submitBooking() {
  if (state.submitting) return
  state.submitting = true
  renderFooterContent()

  // Build context: merge auto-collected with any JS API context
  const finalContext = mergeContext(state.context, state._apiContext || null)

  // Parse additional attendees
  const attendees = state.additionalAttendees
    ? state.additionalAttendees.split(',').map(e => e.trim()).filter(Boolean)
    : []

  const payload = {
    consultants_url: state.consultantsUrl,
    consultant_id: state.selectedConsultant === '__best__' ? '' : state.selectedConsultant,
    date: state.selectedDate,
    time: state.selectedTime,
    visitor: {
      name: state.visitor.name,
      email: state.visitor.email,
      company: state.visitor.company,
      topic: state.visitor.topic,
    },
    additional_attendees: attendees,
    honeypot: state.honeypot,
    context: finalContext,
  }

  const result = await postBooking(state.apiUrl, payload, config.apiKey)
  state.submitting = false

  if (result.ok) {
    state.booking = result.data
    state.step = 5
    state.error = null
    _emit('booking:confirmed', {
      bookingId: result.data.booking_id,
      consultant: state.selectedConsultant,
      date: state.selectedDate,
      time: state.selectedTime,
      meetLink: result.data.meet_link,
      visitor: { ...state.visitor },
      context: finalContext,
    })
  } else {
    state.error = t(state.lang, 'errors.bookingFailed')
  }
  render()
}

// --- Retry current step ---
function retryCurrentStep() {
  goToStep(state.step)
}

// --- Download ICS ---
function downloadIcs() {
  const icsContent = generateIcs(state)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'booking.ics'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// --- Scroll lock ---
let scrollLockCount = 0
let savedOverflow = ''

function lockScroll() {
  if (scrollLockCount === 0) {
    savedOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  scrollLockCount++
}

function unlockScroll() {
  scrollLockCount--
  if (scrollLockCount <= 0) {
    scrollLockCount = 0
    document.body.style.overflow = savedOverflow
  }
}

// --- Public API ---
function open(options) {
  options = options || {}

  injectStyles()
  buildModal()

  // Reset state for fresh session
  state = createFreshState()

  // Apply options
  if (options.consultant) {
    state.selectedConsultant = options.consultant
  }
  if (options.topic) {
    state.visitor.topic = options.topic
  }
  if (options.context) {
    state._apiContext = options.context
  }
  if (options.consultantsUrl) {
    state.consultantsUrl = options.consultantsUrl
  }

  // Show modal
  backdrop.classList.add('sb-visible')
  lockScroll()

  _emit('booking:started', {
    consultant: state.selectedConsultant,
    context: mergeContext(state.context, state._apiContext || null),
  })

  // If consultant pre-selected, skip step 1
  if (state.selectedConsultant) {
    goToStep(2)
  } else {
    goToStep(1)
  }
}

function close() {
  if (backdrop) {
    backdrop.classList.remove('sb-visible')
  }
  unlockScroll()
  _emit('widget:closed', {})
}

// --- Register global API ---
window.SimplifyBooking = {
  open,
  close,
  ready: true,
  on,
}

// Dispatch ready event
document.dispatchEvent(new CustomEvent('simplify-booking:ready'))
