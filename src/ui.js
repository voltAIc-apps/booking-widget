// DOM construction for each of the 5 steps
import { t, strings } from './i18n.js'
import { computeScheduleSlots } from './availability.js'

// --- DOM helper ---
// el('div', { id: 'foo', class: 'bar', onclick: fn }, [child1, 'text', child2])
export function el(tag, attrs, children) {
  const node = document.createElement(tag)
  if (attrs) {
    for (const [key, val] of Object.entries(attrs)) {
      if (key.startsWith('on') && typeof val === 'function') {
        node.addEventListener(key.slice(2), val)
      } else if (key === 'checked' || key === 'disabled' || key === 'required') {
        node[key] = val
      } else if (val != null) {
        node.setAttribute(key, val)
      }
    }
  }
  if (children) {
    if (!Array.isArray(children)) children = [children]
    for (const child of children) {
      if (child == null) continue
      if (typeof child === 'string' || typeof child === 'number') {
        node.appendChild(document.createTextNode(String(child)))
      } else {
        node.appendChild(child)
      }
    }
  }
  return node
}

// --- SVG icons ---
function svgArrowLeft() {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  s.setAttribute('viewBox', '0 0 24 24')
  s.setAttribute('fill', 'none')
  s.setAttribute('stroke', 'currentColor')
  s.setAttribute('stroke-width', '2')
  s.setAttribute('stroke-linecap', 'round')
  s.setAttribute('stroke-linejoin', 'round')
  s.innerHTML = '<polyline points="15 18 9 12 15 6"></polyline>'
  return s
}

function svgClose() {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  s.setAttribute('viewBox', '0 0 24 24')
  s.setAttribute('fill', 'none')
  s.setAttribute('stroke', 'currentColor')
  s.setAttribute('stroke-width', '2')
  s.setAttribute('stroke-linecap', 'round')
  s.setAttribute('stroke-linejoin', 'round')
  const l1 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  l1.setAttribute('x1', '18'); l1.setAttribute('y1', '6'); l1.setAttribute('x2', '6'); l1.setAttribute('y2', '18')
  const l2 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  l2.setAttribute('x1', '6'); l2.setAttribute('y1', '6'); l2.setAttribute('x2', '18'); l2.setAttribute('y2', '18')
  s.appendChild(l1); s.appendChild(l2)
  return s
}

function svgCheck() {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  s.setAttribute('viewBox', '0 0 24 24')
  s.setAttribute('fill', 'none')
  s.setAttribute('stroke', 'currentColor')
  s.setAttribute('stroke-width', '3')
  s.setAttribute('stroke-linecap', 'round')
  s.setAttribute('stroke-linejoin', 'round')
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
  p.setAttribute('points', '20 6 9 17 4 12')
  s.appendChild(p)
  return s
}

function svgCalendar() {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  s.setAttribute('viewBox', '0 0 24 24')
  s.setAttribute('fill', 'none')
  s.setAttribute('stroke', 'currentColor')
  s.setAttribute('stroke-width', '2')
  s.setAttribute('stroke-linecap', 'round')
  s.setAttribute('stroke-linejoin', 'round')
  const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  r.setAttribute('x', '3'); r.setAttribute('y', '4'); r.setAttribute('width', '18')
  r.setAttribute('height', '18'); r.setAttribute('rx', '2'); r.setAttribute('ry', '2')
  const l1 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  l1.setAttribute('x1', '16'); l1.setAttribute('y1', '2'); l1.setAttribute('x2', '16'); l1.setAttribute('y2', '6')
  const l2 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  l2.setAttribute('x1', '8'); l2.setAttribute('y1', '2'); l2.setAttribute('x2', '8'); l2.setAttribute('y2', '6')
  const l3 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  l3.setAttribute('x1', '3'); l3.setAttribute('y1', '10'); l3.setAttribute('x2', '21'); l3.setAttribute('y2', '10')
  s.appendChild(r); s.appendChild(l1); s.appendChild(l2); s.appendChild(l3)
  return s
}

function svgVideo() {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  s.setAttribute('width', '18'); s.setAttribute('height', '18')
  s.setAttribute('viewBox', '0 0 24 24')
  s.setAttribute('fill', 'none')
  s.setAttribute('stroke', 'currentColor')
  s.setAttribute('stroke-width', '2')
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
  p.setAttribute('points', '23 7 16 12 23 17 23 7')
  const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  r.setAttribute('x', '1'); r.setAttribute('y', '5'); r.setAttribute('width', '15')
  r.setAttribute('height', '14'); r.setAttribute('rx', '2'); r.setAttribute('ry', '2')
  s.appendChild(p); s.appendChild(r)
  return s
}

// --- Initials from name ---
function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// --- Progress bar ---
export function renderProgressBar(currentStep, totalSteps) {
  const dots = []
  for (let i = 1; i <= totalSteps; i++) {
    let cls = 'sb-progress-dot'
    if (i === currentStep) cls += ' sb-active'
    else if (i < currentStep) cls += ' sb-done'
    dots.push(el('div', { id: `sb-progress-dot-${i}`, class: cls }))
  }
  return el('div', { id: 'sb-progress', class: 'sb-progress' }, dots)
}

// --- Header ---
export function renderHeader(title, step, callbacks) {
  const leftParts = []
  if (step > 1 && step < 5) {
    leftParts.push(el('button', {
      id: 'sb-btn-back',
      class: 'sb-btn-back',
      type: 'button',
      'aria-label': 'Back',
      onclick: callbacks.onBack,
    }, [svgArrowLeft()]))
  }
  leftParts.push(el('span', { id: 'sb-header-title', class: 'sb-header-title' }, [title]))

  return el('div', { id: 'sb-header', class: 'sb-header' }, [
    el('div', { id: 'sb-header-left', class: 'sb-header-left' }, leftParts),
    el('button', {
      id: 'sb-btn-close',
      class: 'sb-btn-close',
      type: 'button',
      'aria-label': 'Close',
      onclick: callbacks.onClose,
    }, [svgClose()]),
  ])
}

// --- Loading ---
export function renderLoading(message) {
  return el('div', { id: 'sb-loading', class: 'sb-loading' }, [
    el('div', { id: 'sb-spinner', class: 'sb-spinner' }),
    el('span', { id: 'sb-loading-text' }, [message || '']),
  ])
}

// --- Error ---
export function renderError(message, retryFn) {
  const children = [
    el('div', { id: 'sb-error-message', class: 'sb-error-message' }, [message]),
  ]
  if (retryFn) {
    children.push(el('button', {
      id: 'sb-btn-retry',
      class: 'sb-btn sb-btn-primary',
      type: 'button',
      onclick: retryFn,
    }, [t(window.__sbLang || 'de', 'common.retry')]))
  }
  return el('div', { id: 'sb-error-state', class: 'sb-error-state' }, children)
}

// --- Step 1: Choose consultant ---
export function renderStep1(state, callbacks) {
  const lang = state.lang
  const container = el('div', { id: 'sb-step1', class: 'sb-consultants' })

  // "Best match" card
  const bestMatchCard = el('div', {
    id: 'sb-step1-card-best',
    class: `sb-consultant-card${state.selectedConsultant === '__best__' ? ' sb-selected' : ''}`,
    onclick: () => callbacks.onSelectConsultant('__best__'),
  }, [
    el('div', {
      id: 'sb-step1-avatar-best',
      class: 'sb-consultant-avatar sb-best-match',
    }, ['?']),
    el('div', { id: 'sb-step1-info-best', class: 'sb-consultant-info' }, [
      el('div', { id: 'sb-step1-name-best', class: 'sb-consultant-name' }, [t(lang, 'step1.bestMatch')]),
      el('div', { id: 'sb-step1-role-best', class: 'sb-consultant-role' }, [t(lang, 'step1.bestMatchDesc')]),
    ]),
  ])
  container.appendChild(bestMatchCard)

  // Consultant cards
  state.consultants.forEach((c, i) => {
    // Profile photo or initials fallback
    const avatar = c.photo
      ? el('img', {
          id: `sb-step1-avatar-${i}`,
          class: 'sb-consultant-avatar sb-consultant-photo',
          src: c.photo,
          alt: c.name,
        })
      : el('div', {
          id: `sb-step1-avatar-${i}`,
          class: 'sb-consultant-avatar',
        }, [getInitials(c.name)])

    const card = el('div', {
      id: `sb-step1-card-${i}`,
      class: `sb-consultant-card${state.selectedConsultant === c.id ? ' sb-selected' : ''}`,
      onclick: () => callbacks.onSelectConsultant(c.id),
    }, [
      avatar,
      el('div', { id: `sb-step1-info-${i}`, class: 'sb-consultant-info' }, [
        el('div', { id: `sb-step1-name-${i}`, class: 'sb-consultant-name' }, [c.name]),
        el('div', { id: `sb-step1-role-${i}`, class: 'sb-consultant-role' }, [c.role || '']),
        ...(c.bio ? [el('div', { id: `sb-step1-bio-${i}`, class: 'sb-consultant-bio' }, [c.bio])] : []),
      ]),
    ])
    container.appendChild(card)
  })

  return container
}

// --- Step 2: Choose date (month grid with prev/next navigation) ---
export function renderStep2(state, callbacks) {
  const lang = state.lang
  const weekdays = t(lang, 'step2.weekdays')
  const months = t(lang, 'step2.months')

  // Determine displayed month from state (default: current month)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Calendar month offset stored in state (0 = current month)
  if (state._calendarMonth === undefined) state._calendarMonth = 0

  const viewDate = new Date(today.getFullYear(), today.getMonth() + state._calendarMonth, 1)
  const viewYear = viewDate.getFullYear()
  const viewMonth = viewDate.getMonth()

  // Boundaries: current month to +3 months
  const minMonth = today.getFullYear() * 12 + today.getMonth()
  const maxMonth = minMonth + 3
  const curMonth = viewYear * 12 + viewMonth
  const canPrev = curMonth > minMonth
  const canNext = curMonth < maxMonth

  // Build working days set for this month (Mon-Fri, from tomorrow onward, within 3 months)
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 4, 0) // last day of +3 month
  const workingDaysSet = new Set()
  const d = new Date(tomorrow)
  while (d <= maxDate) {
    const dow = d.getDay()
    if (dow >= 1 && dow <= 5) {
      workingDaysSet.add(formatDateISO(d))
    }
    d.setDate(d.getDate() + 1)
  }

  // Month header with navigation arrows
  const monthLabel = months[viewMonth] + ' ' + viewYear
  const header = el('div', { id: 'sb-step2-header', class: 'sb-cal-header' }, [
    el('button', {
      id: 'sb-step2-prev',
      class: 'sb-cal-nav' + (canPrev ? '' : ' sb-disabled'),
      type: 'button',
      onclick: canPrev ? () => { state._calendarMonth--; callbacks.onRenderStep2() } : null,
    }, ['\u2039']),
    el('div', { id: 'sb-step2-month-label', class: 'sb-cal-month-label' }, [monthLabel]),
    el('button', {
      id: 'sb-step2-next',
      class: 'sb-cal-nav' + (canNext ? '' : ' sb-disabled'),
      type: 'button',
      onclick: canNext ? () => { state._calendarMonth++; callbacks.onRenderStep2() } : null,
    }, ['\u203A']),
  ])

  // Weekday row (Mon-Sun)
  const weekdayRow = el('div', { id: 'sb-step2-weekday-row', class: 'sb-cal-grid sb-cal-weekdays' })
  weekdays.forEach((wd, i) => {
    weekdayRow.appendChild(el('div', { id: `sb-step2-wd-${i}`, class: 'sb-cal-wd' }, [wd]))
  })

  // Day grid
  const grid = el('div', { id: 'sb-step2-grid', class: 'sb-cal-grid' })

  // First day of month and offset (Mon=0)
  const firstDay = new Date(viewYear, viewMonth, 1)
  const startDow = (firstDay.getDay() + 6) % 7 // convert Sun=0 to Mon=0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  // Empty cells before first day
  for (let i = 0; i < startDow; i++) {
    grid.appendChild(el('div', { class: 'sb-cal-cell sb-cal-empty' }))
  }

  // Find selected consultant for schedule-based availability check
  const consultantId = state.selectedConsultant === '__best__' ? '' : state.selectedConsultant
  const consultant = state.consultants.find(c => c.id === consultantId)

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(viewYear, viewMonth, day)
    const dateStr = formatDateISO(cellDate)
    const isWorkingDay = workingDaysSet.has(dateStr)
    const isSelected = state.selectedDate === dateStr
    const isToday = dateStr === formatDateISO(today)

    // Check if consultant has any available slots on this day
    let isFull = false
    if (isWorkingDay && consultant && consultant.schedule) {
      const daySlots = computeScheduleSlots(consultant, dateStr)
      const availableCount = daySlots.filter(s => s.available).length
      if (availableCount === 0) isFull = true
    }

    let cls = 'sb-cal-cell'
    if (!isWorkingDay) cls += ' sb-cal-disabled'
    if (isFull) cls += ' sb-cal-full'
    if (isSelected) cls += ' sb-selected'
    if (isToday) cls += ' sb-cal-today'

    grid.appendChild(el('div', {
      id: `sb-step2-day-${day}`,
      class: cls,
      onclick: (isWorkingDay && !isFull) ? () => callbacks.onSelectDate(dateStr) : null,
    }, [String(day)]))
  }

  return el('div', { id: 'sb-step2', class: 'sb-calendar' }, [header, weekdayRow, grid])
}

// --- Step 3: Choose time ---
export function renderStep3(state, callbacks) {
  const lang = state.lang
  const slots = state.availableSlots || []
  const morning = slots.filter(s => {
    const h = parseInt(s.time.split(':')[0], 10)
    return h < 12
  })
  const afternoon = slots.filter(s => {
    const h = parseInt(s.time.split(':')[0], 10)
    return h >= 12
  })

  function renderGroup(label, groupSlots, prefix) {
    if (groupSlots.length === 0) return null
    const slotEls = groupSlots.map((s, i) => {
      let cls = 'sb-slot'
      if (!s.available) cls += ' sb-unavailable'
      if (state.selectedTime === s.time) cls += ' sb-selected'
      return el('button', {
        id: `sb-step3-slot-${prefix}-${i}`,
        class: cls,
        type: 'button',
        disabled: !s.available,
        onclick: s.available ? () => callbacks.onSelectTime(s.time) : null,
      }, [s.time])
    })
    return el('div', { id: `sb-step3-group-${prefix}`, class: 'sb-slots-group' }, [
      el('div', { id: `sb-step3-label-${prefix}`, class: 'sb-slots-label' }, [label]),
      el('div', { id: `sb-step3-slots-${prefix}`, class: 'sb-slots' }, slotEls),
    ])
  }

  const morningGroup = renderGroup(t(lang, 'step3.morning'), morning, 'am')
  const afternoonGroup = renderGroup(t(lang, 'step3.afternoon'), afternoon, 'pm')

  // 2-column layout: morning left, afternoon right
  const grid = el('div', { id: 'sb-step3', class: 'sb-step3-grid' })
  if (morningGroup) grid.appendChild(morningGroup)
  if (afternoonGroup) grid.appendChild(afternoonGroup)

  if (slots.length === 0) {
    grid.appendChild(el('div', { id: 'sb-step3-empty', class: 'sb-loading' }, [
      t(lang, 'step3.unavailable'),
    ]))
  }

  return grid
}

// --- Step 4: Your details ---
export function renderStep4(state, callbacks) {
  const lang = state.lang
  const s = strings[lang] || strings.de

  function field(fieldId, label, type, placeholder, value, required) {
    const labelNode = el('label', {
      id: `sb-step4-label-${fieldId}`,
      class: 'sb-label',
      for: `sb-step4-input-${fieldId}`,
    }, [label])
    if (required) {
      labelNode.appendChild(document.createTextNode(' '))
      labelNode.appendChild(el('span', { class: 'sb-required' }, ['*']))
    }
    return el('div', { id: `sb-step4-field-${fieldId}`, class: 'sb-field' }, [
      labelNode,
      el('input', {
        id: `sb-step4-input-${fieldId}`,
        class: 'sb-input',
        type: type,
        name: fieldId,
        placeholder: placeholder,
        value: value || '',
        required: required,
        oninput: (e) => callbacks.onFieldChange(fieldId, e.target.value),
      }),
    ])
  }

  // Multi-select: topic is a comma-separated string of selected values
  const selectedTopics = (state.visitor.topic || '').split(',').map(s => s.trim()).filter(Boolean)
  const topicChips = (s.topics || []).map((topic, i) => {
    const isSelected = selectedTopics.includes(topic)
    return el('button', {
      id: `sb-step4-topic-${i}`,
      class: `sb-topic-chip${isSelected ? ' sb-selected' : ''}`,
      type: 'button',
      onclick: () => {
        // Toggle this topic in the comma-separated list
        const current = (state.visitor.topic || '').split(',').map(s => s.trim()).filter(Boolean)
        const idx = current.indexOf(topic)
        if (idx >= 0) {
          current.splice(idx, 1)
        } else {
          current.push(topic)
        }
        callbacks.onFieldChange('topic', current.join(', '))
      },
    }, [topic])
  })

  const topicLabel = el('label', {
    id: 'sb-step4-label-topic',
    class: 'sb-label',
  }, [s.step4.topic, ' ', el('span', { class: 'sb-required' }, ['*'])])

  // GDPR label with link built via DOM
  const gdprLabel = el('label', { id: 'sb-step4-gdpr', class: 'sb-gdpr' }, [
    el('input', {
      id: 'sb-step4-input-gdpr',
      type: 'checkbox',
      checked: state.gdprConsent,
      onchange: (e) => callbacks.onFieldChange('gdprConsent', e.target.checked),
    }),
    el('span', { id: 'sb-step4-gdpr-text' }, [
      lang === 'de'
        ? 'Ich stimme der Verarbeitung meiner Daten gemaess der '
        : 'I consent to the processing of my data in accordance with the ',
      el('a', { href: '/datenschutz', target: '_blank' }, [
        lang === 'de' ? 'Datenschutzerklaerung' : 'Privacy Policy',
      ]),
      ' zu.',
    ]),
  ])

  const form = el('div', { id: 'sb-step4-form', class: 'sb-form' }, [
    field('name', s.step4.name, 'text', s.step4.namePlaceholder, state.visitor.name, true),
    field('email', s.step4.email, 'email', s.step4.emailPlaceholder, state.visitor.email, true),
    field('company', s.step4.company, 'text', s.step4.companyPlaceholder, state.visitor.company, true),

    // Topic chips (full width)
    el('div', { id: 'sb-step4-field-topic', class: 'sb-field sb-field-full' }, [
      topicLabel,
      el('div', { id: 'sb-step4-topics', class: 'sb-topics' }, topicChips),
    ]),

    // Additional attendees (full width)
    el('div', { id: 'sb-step4-field-attendees-wrap', class: 'sb-field-full' }, [
      field('attendees', s.step4.attendees, 'text', s.step4.attendeesPlaceholder, state.additionalAttendees, false),
    ]),

    // Honeypot — off-screen, plausible name
    el('div', { id: 'sb-step4-hp-wrap', class: 'sb-honeypot sb-field-full' }, [
      el('input', {
        id: 'sb-step4-input-website',
        type: 'text',
        name: 'website',
        tabindex: '-1',
        autocomplete: 'off',
        'aria-hidden': 'true',
        value: state.honeypot || '',
        oninput: (e) => callbacks.onFieldChange('honeypot', e.target.value),
      }),
    ]),

    // GDPR (full width)
    el('div', { id: 'sb-step4-gdpr-wrap', class: 'sb-field-full' }, [gdprLabel]),
  ])

  return form
}

// --- Step 5: Confirmation ---
export function renderStep5(state, callbacks) {
  const lang = state.lang
  const booking = state.booking || {}
  const consultant = state.consultants.find(c => c.id === state.selectedConsultant)
  const consultantName = consultant ? consultant.name : t(lang, 'step1.bestMatch')

  const summaryRows = [
    [t(lang, 'step5.consultant'), consultantName],
    [t(lang, 'step5.date'), formatDateHuman(state.selectedDate, lang)],
    [t(lang, 'step5.time'), state.selectedTime],
    [t(lang, 'step5.topicLabel'), state.visitor.topic],
  ]

  const summaryEls = summaryRows.map((r, i) =>
    el('div', { id: `sb-step5-row-${i}`, class: 'sb-summary-row' }, [
      el('span', { id: `sb-step5-label-${i}`, class: 'sb-summary-label' }, [r[0]]),
      el('span', { id: `sb-step5-value-${i}`, class: 'sb-summary-value' }, [r[1]]),
    ])
  )

  const actions = []
  const meetLink = booking.meet_link
  if (meetLink) {
    actions.push(el('a', {
      id: 'sb-step5-meet-link',
      class: 'sb-meet-link',
      href: meetLink,
      target: '_blank',
      rel: 'noopener',
    }, [svgVideo(), ' ', t(lang, 'step5.meetLink')]))
  }
  actions.push(el('button', {
    id: 'sb-step5-btn-ics',
    class: 'sb-btn sb-btn-secondary',
    type: 'button',
    onclick: () => callbacks.onDownloadIcs(),
  }, [svgCalendar(), ' ', t(lang, 'step5.downloadIcs')]))

  return el('div', { id: 'sb-step5', class: 'sb-confirmation' }, [
    el('div', { id: 'sb-step5-left', class: 'sb-confirmation-left' }, [
      el('div', { id: 'sb-step5-check', class: 'sb-check-icon' }, [svgCheck()]),
      el('div', { id: 'sb-step5-title', class: 'sb-confirmation-title' }, [t(lang, 'step5.title')]),
      el('div', { id: 'sb-step5-text', class: 'sb-confirmation-text' }, [
        booking.fallback ? t(lang, 'step5.confirmedFallback') : t(lang, 'step5.confirmed')
      ]),
    ]),
    el('div', { id: 'sb-step5-right', class: 'sb-confirmation-right' }, [
      el('div', { id: 'sb-step5-summary', class: 'sb-summary' }, summaryEls),
      el('div', { id: 'sb-step5-actions', class: 'sb-confirmation-actions' }, actions),
    ]),
  ])
}

// --- Utility: get next N working days (Mon-Fri) ---
function getWorkingDays(count) {
  const days = []
  const d = new Date()
  d.setDate(d.getDate() + 1) // start from tomorrow
  d.setHours(0, 0, 0, 0)
  while (days.length < count) {
    const dow = d.getDay()
    if (dow >= 1 && dow <= 5) {
      days.push(new Date(d))
    }
    d.setDate(d.getDate() + 1)
  }
  return days
}

// --- Utility: format date as YYYY-MM-DD ---
function formatDateISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// --- Utility: format date human-readable ---
function formatDateHuman(dateStr, lang) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const weekdays = t(lang, 'step2.weekdaysFull')
  const months = t(lang, 'step2.months')
  const dow = d.getDay() === 0 ? 6 : d.getDay() - 1
  return `${weekdays[dow]}, ${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`
}

// --- Utility: generate ICS content ---
// Compatible with Google Calendar, Outlook, Apple Calendar
export function generateIcs(state) {
  const booking = state.booking || {}
  const consultant = state.consultants.find(c => c.id === state.selectedConsultant)
  const consultantName = consultant ? consultant.name : 'Consultant'
  const consultantEmail = (consultant && consultant.email) || ''
  const dateStr = state.selectedDate.replace(/-/g, '')
  const timeParts = state.selectedTime.split(':')
  const startH = timeParts[0]
  const startM = timeParts[1]
  const duration = (consultant && consultant.slotDuration) || 30
  const totalMin = parseInt(startH, 10) * 60 + parseInt(startM, 10) + duration
  const endH = String(Math.floor(totalMin / 60)).padStart(2, '0')
  const endM = String(totalMin % 60).padStart(2, '0')

  const uid = booking.booking_id || `sb-${Date.now()}`
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BookingWidget//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    // VTIMEZONE for Europe/Berlin (CET/CEST)
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Berlin',
    'BEGIN:STANDARD',
    'DTSTART:19701025T030000',
    'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0100',
    'TZNAME:CET',
    'END:STANDARD',
    'BEGIN:DAYLIGHT',
    'DTSTART:19700329T020000',
    'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0200',
    'TZNAME:CEST',
    'END:DAYLIGHT',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=Europe/Berlin:${dateStr}T${startH}${startM}00`,
    `DTEND;TZID=Europe/Berlin:${dateStr}T${endH}${endM}00`,
    `SUMMARY:Meeting with ${consultantName}`,
    `DESCRIPTION:Booked via website. Topic: ${state.visitor.topic || ''}`,
  ]

  if (booking.meet_link) lines.push(`URL:${booking.meet_link}`)
  if (consultantEmail) lines.push(`ORGANIZER;CN=${consultantName}:mailto:${consultantEmail}`)
  if (state.visitor.email) lines.push(`ATTENDEE;CN=${state.visitor.name};RSVP=TRUE:mailto:${state.visitor.email}`)

  lines.push('END:VEVENT')
  lines.push('END:VCALENDAR')

  return lines.join('\r\n')
}
