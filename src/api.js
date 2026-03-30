// API calls — per-brand consultant JSON fetching + app2gcal backend

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

// Fetch individual consultant JSON files from brand website
// baseUrl: e.g. "https://simplify-erp.de/data/consultants"
// ids: e.g. ["C001", "C002", "C003"]
export async function fetchConsultantsByIds(baseUrl, ids) {
  const trimmedBase = baseUrl.replace(/\/$/, '')
  const fetches = ids.map(id => request(`${trimmedBase}/${id}.json`))
  const results = await Promise.allSettled(fetches)

  const consultants = []
  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value.ok) {
      consultants.push(result.value.data)
    } else {
      console.warn(`[meetly] Failed to load consultant ${ids[i]}`)
    }
  })

  if (consultants.length === 0) {
    return { ok: false, data: null, error: 'No consultants could be loaded' }
  }
  return { ok: true, data: consultants, error: null }
}

// Legacy: GET /api/v1/consultants?consultants_url={url}
export function getConsultants(baseUrl, consultantsUrl) {
  const url = `${baseUrl}/api/v1/consultants?consultants_url=${encodeURIComponent(consultantsUrl)}`
  return request(url)
}

// GET /api/v1/availability?consultants_url={url}&consultant_id={id}&date_from={from}&date_to={to}
// Used to verify schedule-computed slots against already-booked times
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
