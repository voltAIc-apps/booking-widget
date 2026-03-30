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
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">

  <div style="background: #0077b5; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Meeting Request</h1>
  </div>

  <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">

    <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
      <tr>
        <td style="padding: 10px 12px; font-weight: 600; color: #6b7280; width: 140px; vertical-align: top;">Date</td>
        <td style="padding: 10px 12px;">{{date}}</td>
      </tr>
      <tr style="background: #ffffff;">
        <td style="padding: 10px 12px; font-weight: 600; color: #6b7280; vertical-align: top;">Time</td>
        <td style="padding: 10px 12px;">{{time}} (Europe/Berlin)</td>
      </tr>
      <tr>
        <td style="padding: 10px 12px; font-weight: 600; color: #6b7280; vertical-align: top;">Topic</td>
        <td style="padding: 10px 12px;">{{topic}}</td>
      </tr>
      <tr style="background: #ffffff;">
        <td style="padding: 10px 12px; font-weight: 600; color: #6b7280; vertical-align: top;">Consultant</td>
        <td style="padding: 10px 12px;">{{consultant_name}}</td>
      </tr>
    </table>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

    <h3 style="margin: 0 0 12px; font-size: 16px; color: #0077b5;">Visitor Details</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
      <tr>
        <td style="padding: 8px 12px; font-weight: 600; color: #6b7280; width: 140px;">Name</td>
        <td style="padding: 8px 12px;">{{visitor_name}}</td>
      </tr>
      <tr style="background: #ffffff;">
        <td style="padding: 8px 12px; font-weight: 600; color: #6b7280;">Email</td>
        <td style="padding: 8px 12px;"><a href="mailto:{{visitor_email}}" style="color: #0077b5;">{{visitor_email}}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; font-weight: 600; color: #6b7280;">Company</td>
        <td style="padding: 8px 12px;">{{visitor_company}}</td>
      </tr>
    </table>

    {{#meet_link}}
    <div style="margin: 24px 0; text-align: center;">
      <a href="{{meet_link}}" style="display: inline-block; padding: 12px 28px; background: #0077b5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Join Google Meet</a>
    </div>
    {{/meet_link}}

  </div>

  <div style="padding: 16px 24px; text-align: center; font-size: 12px; color: #9ca3af; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    This meeting was requested via the online booking widget.<br>
    Please confirm or reschedule at your earliest convenience.
  </div>

</div>
```

---

## Template Variables Reference

| Variable | Source | Example |
|----------|--------|---------|
| `{{to_email}}` | Recipient (visitor or consultant) | `john@example.com` |
| `{{to_name}}` | Recipient name | `John Doe` |
| `{{visitor_name}}` | Booking form | `John Doe` |
| `{{visitor_email}}` | Booking form | `john@example.com` |
| `{{visitor_company}}` | Booking form | `Acme GmbH` |
| `{{consultant_name}}` | consultants.json | `Ashant Chalasani` |
| `{{date}}` | Selected date | `2026-04-02` |
| `{{time}}` | Selected time | `10:00` |
| `{{topic}}` | Selected topic(s) | `ERP Implementation, Data Migration` |
| `{{meet_link}}` | Google Calendar (when available) | `https://meet.google.com/abc-defg-hij` |
| `{{ics_content}}` | Generated ICS (for attachment) | `BEGIN:VCALENDAR...` |

## Setup Steps

1. Go to https://dashboard.emailjs.com/admin/templates
2. Create new template (or edit existing `template_x7v725t`)
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
