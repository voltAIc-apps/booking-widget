# booking-widget

Embeddable meeting booking widget. Vanilla JS, multi-brand, no dependencies.

## Embed

```html
<script src="https://booking.simplify-erp.de/widget.js"
        data-api="https://cal.google.wapsol.de"
        data-consultants-url="https://simplify-erp.de/data/consultants.json"
        data-lang="de"
        data-brand="Simplify ERP"
        data-context-product="ERP Cloud"
        data-context-plan="Enterprise">
</script>
```

## JS API

```js
// Open widget
SimplifyBooking.open({
  consultant: 'anna-becker',   // optional, pre-select consultant
  topic: 'ERP rollout',        // optional, pre-select topic
  context: {                   // optional, merged with auto-collected
    product: 'ERP Cloud',
    plan: 'Enterprise',
  }
})

// Close widget
SimplifyBooking.close()

// Check readiness
SimplifyBooking.ready  // boolean

// Subscribe to events
SimplifyBooking.on('booking:confirmed', ({ bookingId, consultant, date, time, meetLink, visitor, context }) => {
  console.log('Booking confirmed:', bookingId)
})

SimplifyBooking.on('booking:started', ({ consultant, context }) => {
  console.log('Booking started')
})

SimplifyBooking.on('widget:closed', () => {
  console.log('Widget closed')
})
```

## Events

| Event | Payload | When |
|---|---|---|
| `booking:confirmed` | `{ bookingId, consultant, date, time, meetLink, visitor, context }` | Booking created |
| `booking:started` | `{ consultant?, context }` | Widget opened |
| `widget:closed` | `{}` | Widget dismissed |

## Data attributes

| Attribute | Required | Description |
|---|---|---|
| `data-api` | yes | app2gcal backend URL |
| `data-consultants-url` | yes | URL to brand's consultants.json |
| `data-lang` | no | `de` (default) or `en` |
| `data-brand` | no | Brand name for context |
| `data-consultant` | no | Pre-select consultant ID |
| `data-api-key` | no | API key for bookings endpoint |
| `data-context-*` | no | Custom context fields |

## Build

```bash
npm install
npm run build    # -> dist/widget.js
npm run dev      # watch mode
```

## Deploy

K8s manifests in `k8s/`. Serves `dist/widget.js` via nginx:alpine.
