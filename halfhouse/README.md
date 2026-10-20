# HALF HOUSE website — November 2026

Public site: https://f45luke-source.github.io/nuttypresso-cake/halfhouse/
Only this directory changes. The NUTTY PRESSO root website is independent.

## Customer journeys

Space and brunch → store directions. Panini and bakery → bulk inquiry. Gifts → gifts inquiry. Whole cake → cake inquiry. Real event cases → venue, group, or popup inquiry.
`inquiry.html?service=bulk&product=panini#contact` preselects the relevant type and product. Service keys: venue, bulk, gifts, popup, group, cake. Only known product/occasion values are accepted.

The form is a **consultation request**, not a confirmed booking, order, or payment. A valid HH receipt is required before showing success. Staff must confirm availability, composition, price, fulfilment and cancellation conditions.

## Inquiry operation

Supabase project: hpexprhlyikznqaptqww (Seoul). Table: public.halfhouse_inquiries.
Administrator dashboard: https://supabase.com/dashboard/project/hpexprhlyikznqaptqww/editor/17662
This requires the project administrator's existing account. It is not a public customer listing.

Sort created_at descending. Use status new → contacted → quoted → confirmed; close or mark spam where appropriate. Keep receipt and staff_note with the corresponding internal order record. No payment processor or revenue amount integration is installed.
**Automatic email/SMS notifications are not configured. Staff need to check the dashboard.**

Server protections remain unchanged: explicit consent, server validation, honeypot, body limits, hashed rate-limit identifiers, atomic idempotency and allowed origins. Direct anonymous table access is denied. Only a publishable key is shipped in JavaScript. Inquiry retention is 90 days, with the existing hourly cleanup job. Do not weaken RLS or publish any service-role key.

## Campaign attribution

Use utm_source, utm_medium, utm_campaign, utm_content, utm_term. A first-party session entry (2-hour TTL) preserves the campaign across the homepage and inquiry page, and UTM values also travel in internal inquiry links. Attribution is sent with an inquiry only after consent. No names, phone numbers or message text enter tracking events.

Local dataLayer events provide an integration point, **not an installed analytics service**. There is no Meta Pixel, GA4 ID or GTM container configured. A click is not a sale; generate_lead fires only after a confirmed API receipt. Actual sales must be reconciled to the internal order record.

## Publication basis

Real space, bakery and event photographs are supplied by HALF HOUSE in its Drive archive. New WebP assets have 640px and up-to-1600px variants, with metadata removed. Event labels are based on the actual corresponding source folders and images. Do not substitute an unrelated event picture or a generated product image.

Toss and F45 cases show original event photographs. TOLAGEL and FRESH SQUEEZE use text case records and the brand's Instagram link: their specific photo folders were empty at this update. Review links go to Naver/Google Maps to find the business's reviews; **no review text, stars or count was verifiable for republishing**, and none is invented.

Brand artwork and the existing Josefin font remain in place; the Korean Happiness webfont is loaded from the existing public CDN with system fallbacks. The bakery character is an illustration, not a cake photo.

November campaign values follow the owner's latest instructions: Nov 1–30 store stamp event; 10,000 KRW per stamp; rewards at 10/20/30 are a choice of three baguettes / HALF HOUSE BAG / whole Basque cake. Do not imply combined or popup stamp redemption conditions that were not confirmed.
Pangyo popup: Nov 6–26; daily 11:00 first 100 purchasing customers receive one chocolate mochi, while supply lasts. Prices in its accordion are **Pangyo popup prices only**, not main-store prices. Precise popup counter location is not claimed. The homepage hides expired November promotion links after Nov 30 KST.
Cake 10% prebooking discount is still described as planned, not currently guaranteed.

## Validation

Release validation covers responsive widths, local image integrity, menu and gallery keyboard interaction, homepage→inquiry attribution, six conditional form types, consent, receipt-only success and failure handling. Live endpoint health and a clearly marked synthetic inquiry are checked separately from mocked UI tests; test fixtures must be removed afterward.


## Release — 2026-10-20 (customer-first menu & popup conversion)

- Kept the authentic HALF HOUSE blue visual identity, original logo, Josefin/Happiness fonts and verified space/event photos.
- Updated in-store product lineup to the latest requested representative ranges: five sourdough paninis, two salt breads, three baguettes (chocolate, pistachio, chestnut), two campagnes (chocolate, red bean & mochi), Basque + matcha Basque, blueberry cheese scone cake.
- Added a concise "what to choose" guide by visit intent, and rewrote the same-building B2 bakery story in consumer-benefit language.
- Added an event-season Pangyo entry banner (automatically hidden from 2026-11-27 KST) and explicit pop-up-only panini + soup set prices.
- Added a truthful prior Chuseok gift-box sales proof point (300 sets, owner-provided).
- Product-specific cutaway photographs are not in this repository yet; do NOT substitute generic venue/event pictures as specific product photos. Integrate approved genuine product images when supplied.
- Existing inquiry API and Supabase consent/security rules were not changed. This release does not add a shopping cart, online payment, or automated staff notifications.
