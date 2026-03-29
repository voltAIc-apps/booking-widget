// Auto-detect host page styles and map to --sb-* CSS variables
// Priority: explicit --sb-* vars (host page) > detected styles > CSS defaults

// Check if a color is near black, white, or gray (not useful for branding)
function isNeutral(color) {
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return true
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!m) return true
  const [r, g, b] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])]
  // Near black or near white
  if (r < 30 && g < 30 && b < 30) return true
  if (r > 230 && g > 230 && b > 230) return true
  // Gray: all channels within 20 of each other
  const spread = Math.max(r, g, b) - Math.min(r, g, b)
  if (spread < 20 && r > 50 && r < 210) return true
  return false
}

function isTransparent(color) {
  if (!color) return true
  return color === 'transparent' || color === 'rgba(0, 0, 0, 0)'
}

// Darken an rgb color by a percentage for hover states
function darken(color, amount) {
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!m) return color
  const factor = 1 - amount
  const r = Math.round(parseInt(m[1]) * factor)
  const g = Math.round(parseInt(m[2]) * factor)
  const b = Math.round(parseInt(m[3]) * factor)
  return `rgb(${r}, ${g}, ${b})`
}

// Probe host page and return detected --sb-* overrides
export function detectHostStyles() {
  const vars = {}

  // If host page already set --sb-primary explicitly, skip auto-detection
  try {
    const rootVal = getComputedStyle(document.documentElement).getPropertyValue('--sb-primary').trim()
    if (rootVal) return vars
  } catch (_) { /* proceed with detection */ }

  // Font family from body
  try {
    const bodyFont = getComputedStyle(document.body).fontFamily
    if (bodyFont && bodyFont !== 'none') {
      vars['--sb-font'] = bodyFont
    }
  } catch (_) { /* skip */ }

  // Primary color from headings
  try {
    const heading = document.querySelector('h1, h2, h3')
    if (heading) {
      const color = getComputedStyle(heading).color
      if (!isNeutral(color)) {
        vars['--sb-primary'] = color
        vars['--sb-primary-hover'] = darken(color, 0.15)
        vars['--sb-border-focus'] = color
      }
    }
  } catch (_) { /* skip */ }

  // CTA color from buttons
  try {
    const btn = document.querySelector('button, .btn, [class*="button"], input[type="submit"]')
    if (btn) {
      const bg = getComputedStyle(btn).backgroundColor
      if (!isNeutral(bg) && !isTransparent(bg)) {
        vars['--sb-cta'] = bg
        vars['--sb-cta-hover'] = darken(bg, 0.15)
      }
      // Border radius from buttons
      const radius = getComputedStyle(btn).borderRadius
      if (radius && radius !== '0px') {
        vars['--sb-radius'] = radius
      }
    }
  } catch (_) { /* skip */ }

  // Fallback: link color for primary if no heading color found
  if (!vars['--sb-primary']) {
    try {
      const link = document.querySelector('a[href]')
      if (link) {
        const color = getComputedStyle(link).color
        if (!isNeutral(color)) {
          vars['--sb-primary'] = color
          vars['--sb-primary-hover'] = darken(color, 0.15)
          vars['--sb-border-focus'] = color
        }
      }
    } catch (_) { /* skip */ }
  }

  return vars
}
