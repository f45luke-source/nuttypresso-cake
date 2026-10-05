# HALF HOUSE official website

Public site: https://f45luke-source.github.io/nuttypresso-cake/halfhouse/

This directory is independent of the existing NUTTY PRESSO root website.

## Inquiry management

Supabase project: hpexprhlyikznqaptqww (Seoul)
Table: public.halfhouse_inquiries
Dashboard: https://supabase.com/dashboard/project/hpexprhlyikznqaptqww/editor/17662
Sign in with the existing project administrator account. This link is not a public customer listing.

service: venue (대관), bulk (단체주문), gifts (선물세트), popup (팝업·협업), group (단체예약), cake (홀케이크).
status: new (신규), contacted (연락완료), quoted (견적전달), confirmed (확정), closed (종료), spam (스팸).
Use staff_note for staff notes. Sort created_at descending to see latest requests.

A successful form response includes an HH receipt. An inquiry is NOT a confirmed booking or payment. Contact the customer to confirm schedule, items, price and cancellation conditions. Automatic SMS/email alerts are not configured; check the dashboard for new inquiries.

## Advertisement links

Append ?service=venue, ?service=bulk or ?service=gifts to preselect the inquiry type. UTM fields utm_source, utm_medium, utm_campaign, utm_content and utm_term are saved with the inquiry. Add #contact to land directly on the form.

The page emits inquiry_cta_click and generate_lead into a local dataLayer. No Meta Pixel, GA4 ID, GTM container or paid advertising campaign is installed. The generate_lead event occurs only after the server confirms a receipt. Do not send customer names, phone numbers or message bodies into ad analytics.

## Backend and safeguards

Public Edge Function: halfhouse-inquiry. The frontend contains only a publishable key, never a service-role key. Server-side validation, explicit consent, body length limits, a honeypot, hashed rate-limit identifiers, atomic idempotency and a restrictive CORS allowlist are enabled. Anonymous/authenticated clients cannot read or directly insert into the inquiries table. The Edge Function uses its environment service key for the restricted database function.

An hourly retention job removes inquiry records older than 90 days and rate-limit records older than 24 hours. Changing the displayed retention policy requires changing that job too. A new custom domain must be added to the Edge Function CORS allowlist before accepting submissions from it.

## Brand and editorial notes

The wordmark and bakery characters are vectorized from the owner's supplied HALF HOUSE artwork. Illustrations are not product photographs. Colors: indigo #332de5, cyan #2dfffe, warm off-white. English type: Josefin Sans via Google Fonts. Korean type: Happiness Sans via a public webfont CDN. This page uses Hyundai Department Store's Happiness Sans typeface. Typeface ownership remains with its respective creators; no font binaries are distributed in this repository.

Cake prebooking 10% discount is displayed as PLANNED. No start date, final price or payment integration is implied. November 2026 Hyundai Pangyo popup is shown as upcoming, with exact dates to follow through the brand's official channel. That notice hides automatically from December 2026 onward.

## Tests performed

Local in-memory browser tests: desktop 1440px; mobile 390px and 360px; no horizontal overflow; six conditional inquiry types; invalid phone rejection; failure and retry handling; same retry token; receipt display; conversion emitted only after success; reset clears consent. These are local UI tests, not a live full-browser network test.

Production endpoint tests: health response, bulk and cake submissions stored successfully, consent rejection, duplicate submission returns the original receipt, anonymous table read denied, RLS and direct read/write privilege restrictions checked. Test fixtures are removed before handover.
