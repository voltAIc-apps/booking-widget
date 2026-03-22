// All fetch calls to app2gcal backend

const TIMEOUT_MS = 10000

function withTimeout(promise, ms) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  return {
    promise: promise(controller.signal).finally(() => clearTimeout(timeout)),
    controller,
  }
}

async function request(url, options = {}) {
  try {
    const { promise } = withTimeout(
      (signal) => fetch(url, { ...options, signal }),
      TIMEOUT_MS
    )
    const res = await promise
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return { ok: false, data: null, error: `HTTP ${res.status}: ${body}` }
    }
    const data = await res.json()
    return { ok: true, data, error: null }
  } catch (err) {
    const msg = err.name === 'AbortError' ? 'Request timed out' : err.message
    return { ok: false, data: null, error: msg }
  }
}

// GET /api/v1/consultants?consultants_url={url}
export function getConsultants(baseUrl, consultantsUrl) {
  const url = `${baseUrl}/api/v1/consultants?consultants_url=${encodeURIComponent(consultantsUrl)}`
  return request(url)
}

// GET /api/v1/availability?consultants_url={url}&consultant_id={id}&date_from={from}&date_to={to}
export function getAvailability(baseUrl, consultantsUrl, consultantId, dateFrom, dateTo) {
  const params = new URLSearchParams({
    consultants_url: consultantsUrl,
    consultant_id: consultantId,
    date_from: dateFrom,
  })
  if (dateTo) params.set('date_to', dateTo)
  const url = `${baseUrl}/api/v1/availability?${params.toString()}`
  return request(url)
}

// POST /api/v1/bookings
export function postBooking(baseUrl, payload, apiKey) {
  const headers = { 'Content-Type': 'application/json' }
  if (apiKey) headers['X-API-Key'] = apiKey
  return request(`${baseUrl}/api/v1/bookings`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
}
