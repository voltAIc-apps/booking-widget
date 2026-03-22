# booking-widget — build spec

This file lives in the `voltAIc-apps/booking-widget` repo root alongside `CLAUDE.md`.
It describes what to build.
For deployment instructions (adding this widget to a brand site), see `SKILL-booking-widget.md`.

---

## What this repo is

A self-contained embeddable meeting booking widget.
Vanilla JS and CSS — no framework, no runtime dependencies in the output bundle.
Configured entirely via data attributes and a config object — no brand-specific logic hardcoded.
A single `<script>` tag drops it onto any page of any website.

The widget talks only to an `app2gcal` backend instance. No API keys or credentials in the browser.

---

## Git repo setup

Create a new GitHub repo under the `voltAIc-apps` organisation:

```
repo:         voltAIc-apps/booking-widget
visibility:   public
description:  Embeddable meeting booking widget — vanilla JS, multi-brand
default branch: main
```

Initialise with:
- This `booking-widget-spec.md` file
- A `CLAUDE.md` pointing at this spec
- A `.gitignore` for Node (`node_modules/`, `dist/`)
- A `README.md` with embed snippet examples and the JS API reference

Do NOT commit `dist/` — it is produced at build time. Add to `.gitignore`.

CI/CD: add `.github/workflows/build.yml` — on push to `main`:
1. Run `npm run build`
2. Rebuild and push the `booking-widget-service` Docker image, or update the K8s ConfigMap
   serving `dist/widget.js`

---

## Repo structure

```
src/
  widget.js     # entry — registers window.SimplifyBooking, bootstraps UI
  api.js        # all fetch calls to app2gcal
  ui.js         # DOM construction for each of the 5 steps
  i18n.js       # all user-visible strings, keyed by lang (de, en)
  context.js    # auto-collects page URL, referrer, UTM params, data-context-* attrs
  styles.css    # all styles, scoped with .sb- prefix
dist/
  widget.js     # built bundle — JS + CSS inlined (gitignored)
k8s/
  deployment.yaml   # nginx serving dist/widget.js
  service.yaml      # ClusterIP: booking-widget-service:80
  ingress.yaml      # https://booking.{brand-domain}/widget.js
build.js        # esbuild build script
package.json
CLAUDE.md
booking-widget-spec.md
README.md
.gitignore
.github/
  workflows/
    build.yml
```

---

## Context inputs — flexible and extensible

The widget is designed to receive rich context from the embedding page and pass it through
to app2gcal (and on to scoopp) so the consultant briefing email and calendar event contain
as much useful information as possible.

### Auto-collected context (`context.js`, runs at widget init)

| Field | Source |
|---|---|
| `page_url` | `window.location.href` |
| `page_title` | `document.title` |
| `referrer` | `document.referrer` |
| `utm_source` | URL param |
| `utm_medium` | URL param |
| `utm_campaign` | URL param |
| `utm_content` | URL param |
| `lang` | `navigator.language` |
| `timestamp` | `new Date().toISOString()` |

### Context via `data-context-*` attributes

Any `data-context-{key}` attribute on the `<script>` tag is collected automatically and
placed under `context.custom.{key}`. No widget code changes needed to pass new fields.

```html
<script src="https://booking.simplify-erp.de/widget.js"
        data-api="https://cal.google.wapsol.de"
        data-mode="floating"
        data-lang="de"
        data-brand="Simplify ERP"
        data-consultants-url="https://simplify-erp.de/data/consultants.json"
        data-context-product="ERP Cloud"
        data-context-plan="Enterprise">
</script>
```

### Context via JS API

```js
SimplifyBooking.open({
  consultant: 'anna-becker',
  topic:      'ERP rollout',
  context: {
    product:  'ERP Cloud',
    plan:     'Enterprise',
    leadScore: 82,
    crmId:    'hs-contact-4471',
    formData: { employees: '50-200', currentSystem: 'SAP B1' }
  }
})
```

The widget merges JS API context with auto-collected context before sending.
JS API context wins on key conflicts.

### Full booking request payload sent to app2gcal

```json
{
  "consultants_url": "https://simplify-erp.de/data/consultants.json",
  "consultant_id":   "anna-becker",
  "date":            "2026-03-25",
  "time":            "14:00",
  "visitor": {
    "name":    "Max Mustermann",
    "email":   "max@musterfirma.de",
    "company": "Musterfirma GmbH",
    "topic":   "ERP rollout"
  },
  "additional_attendees": ["colleague@musterfirma.de"],
  "honeypot": "",
  "context": {
    "page_url":     "https://simplify-erp.de/pricing",
    "page_title":   "Pricing — Simplify ERP",
    "referrer":     "https://google.com",
    "utm_source":   "google",
    "utm_medium":   "cpc",
    "utm_campaign": "erp-q1",
    "lang":         "de-DE",
    "timestamp":    "2026-03-25T13:58:44Z",
    "brand":        "Simplify ERP",
    "custom": {
      "product":  "ERP Cloud",
      "plan":     "Enterprise",
      "leadScore": 82
    }
  }
}
```

---

## Honeypot field

The widget renders a hidden `<input name="honeypot">` in the booking form.

Implementation rules:
- Position it off-screen with CSS (`position: absolute; left: -9999px`).
- Do NOT use `display: none` or `visibility: hidden` — some bots skip those.
- Do NOT label it "honeypot" in the HTML. Use a plausible name like `"website"` or `"phone2"`.
- The field is always included in the request body, always empty for real users.
- app2gcal checks and discards requests where the field is non-empty.

---

## Public JS API (`window.SimplifyBooking`)

These methods are stable — never rename or remove them between versions.

```js
// Open the booking modal
SimplifyBooking.open({
  consultant?: string,   // pre-select by consultant ID — skips step 1
  topic?:      string,   // pre-select topic chip
  context?:    object    // merged with auto-collected context
})

// Close the modal
SimplifyBooking.close()

// Check initialisation
SimplifyBooking.ready  // boolean

// Subscribe to events (for CRM, analytics, or host app integration)
SimplifyBooking.on(event, callback)
```

### Events

| Event | Payload | When |
|---|---|---|
| `booking:confirmed` | `{ bookingId, consultant, date, time, meetLink, visitor, context }` | Booking successfully created |
| `booking:started` | `{ consultant?, context }` | User opens the widget |
| `widget:closed` | `{}` | User dismisses the widget |

**Usage example (from the host React app or any script on the page):**
```js
window.SimplifyBooking.on('booking:confirmed', ({ visitor, context }) => {
  // Push to analytics
  gtag('event', 'booking_confirmed', { company: visitor.company })
  // Push to CRM
  fetch('/api/crm/leads', {
    method: 'POST',
    body: JSON.stringify({ visitor, context })
  })
})
```

---

## Widget flow — 5 steps

**Step 1: Choose consultant**
Load `GET /api/v1/consultants?consultants_url={url}` from app2gcal.
Render one card per consultant. Include a "Best match" option.
If `consultant` is pre-set via `SimplifyBooking.open()` or `data-consultant`, skip to step 2.

**Step 2: Choose date**
Render a date strip of the next 14 working days (Mon–Fri).
No API call here.

**Step 3: Choose time slot**
Load `GET /api/v1/availability?consultants_url={url}&consultant_id={id}&date_from={date}&date_to={date}`.
Render all slots from the consultant's config. Unavailable slots are shown but disabled.

**Step 4: Your details**
Fields: name (required), work email (required), company (required), topic chip (required),
additional attendees (optional — label: "Also invite colleagues", comma-separated emails).
If `topic` is pre-set, skip the chip selection.
Honeypot field (hidden, see above).
GDPR consent checkbox — required, submit disabled until checked.

**Step 5: Confirmation**
Summary card: consultant, date/time, Google Meet link.
ICS download button as fallback.

---

## Implementation rules

- Vanilla JS only. No React, no Vue, no dependencies in the output bundle.
- CSS scoped with `.sb-` prefix on all class names.
- All user-visible strings in `i18n.js`. Provide `de` and `en` at minimum.
- Build: esbuild, single `dist/widget.js`, CSS inlined as injected `<style>` tag.
- Works inside an iframe (Webflow, WordPress, Framer compatibility).
- `context.js` runs transparently at init — the embedding page does nothing special.
- `data-context-*` scanning and JS API context are merged at the point of form submission.
- Additive payload fields (new `context` keys) never break existing behaviour.

---

## Kubernetes

**`k8s/deployment.yaml`**
nginx:alpine, one replica, serves `dist/widget.js` as a static file.
Set response header: `Cache-Control: public, max-age=3600`.

**`k8s/service.yaml`**
ClusterIP, name `booking-widget-service`, port 80.

**`k8s/ingress.yaml`**
Host: `booking.{brand-domain}`, path `/widget.js`.
Follow the ingress pattern in the existing app2gcal `k8s/` manifests.

---

## Error handling

- app2gcal unreachable → show error state in widget. Never show a blank screen.
- Consultants load fails → show error with retry option.
- Availability load fails → show slots as unknown, allow user to proceed (app2gcal validates).
- Booking POST fails → show error state. Do not close the modal.
- Context collection fails (e.g. `document.referrer` blocked) → omit field, continue silently.

---

## Roadmap (out of scope for MVP)

- Cancellation / rescheduling flow
- Multi-language beyond `de`/`en`
- Animated step transitions
- Consultant profile photos
- Context persistence across sessions
