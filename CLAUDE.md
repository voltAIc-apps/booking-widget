# booking-widget

Embeddable vanilla JS booking widget. See `booking-widget-spec.md` for full spec.

## Commands

```bash
npm install      # install deps
npm run build    # production bundle -> dist/widget.js
npm run dev      # watch mode
```

## Rules

- Vanilla JS only. No frameworks, no runtime deps.
- All CSS classes prefixed with `sb-`.
- All user-visible strings in `src/i18n.js` (de + en).
- Every HTML element gets a unique `id` attribute.
- Build produces single `dist/widget.js` with CSS inlined.
