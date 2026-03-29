# EmailJS Setup

Widget sends booking emails via EmailJS REST API. Two templates needed.

## Template: Visitor Confirmation

Template variables:
- `{{to_email}}` - visitor email
- `{{to_name}}` - visitor name
- `{{consultant_name}}` - consultant name
- `{{date}}` - booking date (YYYY-MM-DD)
- `{{time}}` - booking time (HH:MM)
- `{{topic}}` - selected topic
- `{{meet_link}}` - Google Meet URL
- `{{ics_content}}` - iCal file content (for attachment)

## Template: Consultant Notification

Template variables (same as above plus):
- `{{visitor_email}}` - visitor email
- `{{visitor_company}}` - visitor company

## Credentials

- Service ID: `service_01zc3pa`
- Public Key: `jXwGkXBbqbOks2wJI`
- Forwarding: `steam@simplify-erp.de`

Override per brand via data attributes on the script tag.

## Rate limits

EmailJS free tier: 200 emails/month (2 emails per booking = ~100 bookings/month).
