// Client-side availability computation from consultant schedule JSON
// Falls back to backend verification for already-booked slots

const DAY_MAP = { 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat' }

// Parse time range "09:00-12:00" into start/end minutes
function parseRange(range) {
  const [start, end] = range.split('-')
  return { start, end }
}

// Generate slots from a time range at given interval (minutes)
function slotsFromRange(startStr, endStr, intervalMin) {
  const slots = []
  const [sh, sm] = startStr.split(':').map(Number)
  const [eh, em] = endStr.split(':').map(Number)
  let current = sh * 60 + sm
  const endMin = eh * 60 + em - intervalMin // last slot must end before range end
  while (current <= endMin) {
    const h = String(Math.floor(current / 60)).padStart(2, '0')
    const m = String(current % 60).padStart(2, '0')
    slots.push(`${h}:${m}`)
    current += intervalMin
  }
  return slots
}

// Compute available slots from consultant schedule for a given date
// Returns [{time: "09:00", available: true}, ...]
export function computeScheduleSlots(consultant, dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const dayKey = DAY_MAP[d.getDay()]
  const interval = consultant.slotDuration || 30

  // Check exceptions first (overrides weekly schedule)
  if (consultant.exceptions && consultant.exceptions[dateStr] !== undefined) {
    const exRanges = consultant.exceptions[dateStr]
    // Empty array = fully blocked day
    if (!exRanges || exRanges.length === 0) return []
    const times = []
    for (const range of exRanges) {
      const { start, end } = parseRange(range)
      times.push(...slotsFromRange(start, end, interval))
    }
    return times.map(time => ({ time, available: true }))
  }

  // Weekly schedule
  const schedule = consultant.schedule || {}
  const ranges = schedule[dayKey]
  if (!ranges || ranges.length === 0) return []

  const times = []
  for (const range of ranges) {
    const { start, end } = parseRange(range)
    times.push(...slotsFromRange(start, end, interval))
  }
  return times.map(time => ({ time, available: true }))
}

// Merge schedule slots with backend availability data
// Backend slots mark already-booked times as unavailable
export function mergeWithBackend(scheduleSlots, backendSlots) {
  if (!backendSlots || backendSlots.length === 0) return scheduleSlots

  // Build set of unavailable times from backend
  const unavailable = new Set()
  for (const bs of backendSlots) {
    if (!bs.available) unavailable.add(bs.time)
  }

  return scheduleSlots.map(slot => ({
    time: slot.time,
    available: slot.available && !unavailable.has(slot.time),
  }))
}
