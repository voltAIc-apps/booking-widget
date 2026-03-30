# EmailJS Template for Booking Widget

## Template Settings (in EmailJS dashboard)

**To Email:** `{{to_email}}`
**From Name:** `{{visitor_name}} via Booking Widget`
**Reply To:** `{{visitor_email}}`
**Subject:** `Meeting Request: {{topic}} — {{date}} {{time}}`

---

## Template Body (HTML)

Copy everything below into the EmailJS template Content field:

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #f4f4f5; -webkit-text-size-adjust: none;">
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 32px auto; color: #18181b; line-height: 1.6;">

  <!-- Card -->
  <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);">

    <!-- Header -->
    <div style="padding: 32px 32px 24px; border-bottom: 1px solid #f0f0f0;">
      <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #a1a1aa; margin-bottom: 8px;">{{brand}} &mdash; Meeting Request</div>
      <div style="font-size: 22px; font-weight: 700; color: #18181b;">{{topic}}</div>
    </div>

    <!-- Date & Time block -->
    <div style="padding: 24px 32px; background: #fafafa;">
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
        <tr>
          <td style="width: 50%; vertical-align: top;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #a1a1aa; margin-bottom: 4px;">Date</div>
            <div style="font-size: 18px; font-weight: 600; color: #18181b;">{{date}}</div>
          </td>
          <td style="width: 50%; vertical-align: top;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #a1a1aa; margin-bottom: 4px;">Time</div>
            <div style="font-size: 18px; font-weight: 600; color: #18181b;">{{time}} <span style="font-size: 13px; font-weight: 400; color: #71717a;">CET</span></div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Details -->
    <div style="padding: 24px 32px;">
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #71717a; width: 110px; vertical-align: top;">Consultant</td>
          <td style="padding: 8px 0; font-weight: 500;">{{consultant_name}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a; vertical-align: top;">Requested by</td>
          <td style="padding: 8px 0; font-weight: 500;">{{visitor_name}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a; vertical-align: top;">Email</td>
          <td style="padding: 8px 0;"><a href="mailto:{{visitor_email}}" style="color: #18181b; text-decoration: underline; text-underline-offset: 2px;">{{visitor_email}}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a; vertical-align: top;">Company</td>
          <td style="padding: 8px 0; font-weight: 500;">{{visitor_company}}</td>
        </tr>
      </table>
    </div>

    <!-- Video link button -->
    <div style="padding: 0 32px 28px; text-align: center;">
      <a href="{{meet_link}}" style="display: inline-block; padding: 14px 32px; background: #18181b; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; letter-spacing: 0.01em;">Join Video Conference &#8599;</a>
    </div>

  </div>

  <!-- Footer -->
  <div style="padding: 20px 8px; text-align: center; font-size: 12px; color: #a1a1aa; line-height: 1.5;">
    Requested via {{brand}} online booking &middot; Please confirm or reschedule at your earliest convenience.
  </div>

</div>
</body>
</html>
```

---

## Template Variables Reference

| Variable | Source | Example |
|----------|--------|---------|
| `{{brand}}` | Source website brand (data-brand) | `Simplify ERP` |
| `{{to_email}}` | Recipient (visitor or consultant) | `john@example.com` |
| `{{to_name}}` | Recipient name | `John Doe` |
| `{{visitor_name}}` | Booking form | `John Doe` |
| `{{visitor_email}}` | Booking form | `john@example.com` |
| `{{visitor_company}}` | Booking form | `Acme GmbH` |
| `{{consultant_name}}` | consultants.json | `Ashant Chalasani` |
| `{{date}}` | Selected date | `2026-04-02` |
| `{{time}}` | Selected time | `10:00` |
| `{{topic}}` | Selected topic(s) | `ERP Implementation, Data Migration` |
| `{{meet_link}}` | Private video conf URL | `https://vid.rocket.re-cloud.io/ashant.chalasani` |
| `{{ics_content}}` | Generated ICS (for attachment) | `BEGIN:VCALENDAR...` |

## Setup Steps

1. Go to https://dashboard.emailjs.com/admin/templates
2. Create new template (or edit existing `template_wafmb6q`)
3. Set **To Email** to `{{to_email}}`
4. Set **From Name** to `{{visitor_name}} via Booking Widget`
5. Set **Reply To** to `{{visitor_email}}`
6. Set **Subject** to `Meeting Request: {{topic}} — {{date}} {{time}}`
7. Paste the HTML body above into Content
8. Save

## Multi-site Usage

The widget sends `service_id`, `template_id` and `public_key` per embed. Override defaults via script attributes:

```html
<script src="https://booking.example.com/widget.js"
        data-emailjs-service="service_XXXXX"
        data-emailjs-template="template_XXXXX"
        data-emailjs-key="your_public_key">
</script>
```
