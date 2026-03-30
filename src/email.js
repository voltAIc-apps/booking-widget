// EmailJS integration — sends booking confirmation emails with iCal attachments
// Uses EmailJS REST API directly (no SDK dependency)

const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send'

// Send a single email via EmailJS
async function sendEmail(serviceId, templateId, publicKey, templateParams) {
  try {
    const res = await fetch(EMAILJS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams,
      }),
    })
    return res.ok
  } catch (err) {
    console.warn('[meetly] Email send failed:', err.message)
    return false
  }
}

// Calendar sharing instruction for fallback emails
const CALENDAR_SETUP_NOTE =
  'HINWEIS: Der Kalenderzugriff konnte nicht hergestellt werden. ' +
  'Bitte teilen Sie Ihren Google Kalender mit app2gcal@odoo-calender-166504.iam.gserviceaccount.com ' +
  '(Berechtigung: "Termine aendern"), damit kuenftige Buchungen automatisch eingetragen werden.'

// Send booking emails to both visitor and consultant
// Non-blocking — failures are logged but do not affect the booking flow
export async function sendBookingEmails(state, consultant, icsContent, emailConfig) {
  const serviceId = emailConfig.service || 'service_01zc3pa'
  const publicKey = emailConfig.key || 'jXwGkXBbqbOks2wJI'
  const visitorTemplate = emailConfig.templateVisitor || emailConfig.template || 'template_x7v725t'
  const consultantTemplate = emailConfig.templateConsultant || emailConfig.template || 'template_x7v725t'

  const booking = state.booking || {}
  const consultantName = consultant ? consultant.name : 'Consultant'
  const consultantEmail = consultant ? consultant.email : ''

  // Brand name from context (set via data-brand on script tag)
  const brand = (state.context && state.context.brand) || document.title || ''

  // Shared params
  const sharedParams = {
    brand,
    consultant_name: consultantName,
    consultant_email: consultantEmail,
    visitor_name: state.visitor.name,
    visitor_email: state.visitor.email,
    visitor_company: state.visitor.company || '',
    date: state.selectedDate,
    time: state.selectedTime,
    topic: state.visitor.topic || '',
    meet_link: booking.meet_link || '',
    ics_content: icsContent,
  }

  // Email to visitor (confirmation)
  const visitorOk = await sendEmail(serviceId, visitorTemplate, publicKey, {
    ...sharedParams,
    to_email: state.visitor.email,
    to_name: state.visitor.name,
  })

  // Email to consultant (notification)
  let consultantOk = false
  if (consultantEmail) {
    const isFallback = state.booking && state.booking.fallback
    consultantOk = await sendEmail(serviceId, consultantTemplate, publicKey, {
      ...sharedParams,
      to_email: consultantEmail,
      to_name: consultantName,
      calendar_note: isFallback ? CALENDAR_SETUP_NOTE : '',
    })
  }

  if (!visitorOk) console.warn('[meetly] Visitor confirmation email failed')
  if (!consultantOk && consultantEmail) console.warn('[meetly] Consultant notification email failed')

  return { visitorOk, consultantOk }
}
