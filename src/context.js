// Auto-collects page URL, referrer, UTM params, data-context-* attrs, timestamp

export function collectContext(scriptEl) {
  const ctx = {}

  // page_url
  try { ctx.page_url = window.location.href } catch (_) { /* omit */ }

  // page_title
  try { ctx.page_title = document.title } catch (_) { /* omit */ }

  // referrer
  try { ctx.referrer = document.referrer || '' } catch (_) { /* omit */ }

  // UTM params from current URL
  try {
    const params = new URLSearchParams(window.location.search)
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
    for (const key of utmKeys) {
      const val = params.get(key)
      if (val) ctx[key] = val
    }
  } catch (_) { /* omit */ }

  // browser language
  try { ctx.lang = navigator.language || 'de' } catch (_) { ctx.lang = 'de' }

  // timestamp
  try { ctx.timestamp = new Date().toISOString() } catch (_) { /* omit */ }

  // brand from data-brand attribute
  try {
    if (scriptEl && scriptEl.dataset && scriptEl.dataset.brand) {
      ctx.brand = scriptEl.dataset.brand
    }
  } catch (_) { /* omit */ }

  // data-context-* attributes -> custom.*
  try {
    if (scriptEl && scriptEl.dataset) {
      const custom = {}
      for (const [key, val] of Object.entries(scriptEl.dataset)) {
        if (key.startsWith('context') && key.length > 7) {
          // data-context-product -> dataset.contextProduct -> key 'product'
          const fieldName = key.charAt(7).toLowerCase() + key.slice(8)
          custom[fieldName] = val
        }
      }
      if (Object.keys(custom).length > 0) {
        ctx.custom = custom
      }
    }
  } catch (_) { /* omit */ }

  return ctx
}

// Merge contexts: auto-collected + additional. Additional wins on conflicts.
export function mergeContext(auto, additional) {
  if (!additional) return { ...auto }
  const merged = { ...auto }
  for (const [key, val] of Object.entries(additional)) {
    if (key === 'custom' && typeof val === 'object') {
      merged.custom = { ...(merged.custom || {}), ...val }
    } else {
      merged[key] = val
    }
  }
  return merged
}
