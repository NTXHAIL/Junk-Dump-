# Junk & Dump Rental — still to fill in

The public page no longer shows yellow dashed `[confirm]` tags. Anything below was softened or hidden so the site can go live without made-up details. Search this file when you have the real answer, then put it back on the page.

Nothing here was invented. Prices, weight, trailer sizes, and the Destin-to-Panama City Beach service area are unchanged.

The phone number and email address are not shown on the page. Call, Text, and Email buttons still use them (`tel:+14053235062`, `sms:+14053235062`, and `mailto:saltnsun30a@gmail.com`). JSON-LD keeps `telephone` and does not include `email`. The quote form still sends to the address in `QUOTE_EMAIL` in `script.js`.

## Softened on the page (say "call or text" until you have the fact)

| Item | Where it shows now | What to add |
|---|---|---|
| Business hours | Footer: "Call or text for current hours." | Mon–Fri, Saturday, and Sunday hours |
| Extra-day fee | Pricing fine print and FAQ "How much does it cost?" | The extra-day amount or policy |
| Prohibited-item fee | Same fine print, plus FAQ "What if something on the no list ends up in the trailer?" | What you charge, if anything |
| Extra-day policy | FAQ "How long can I keep it?" — "Call or text and ask." | How extra days work |
| Haul-away and re-drop | Storm pricing card: "call or text for details" | How a filled storm trailer is swapped |
| Storm-season dates | Storm tile: "Call or text to check current availability." | The dates you actually offer drop-offs |
| Typical response time | Storm tile and the hurricane FAQ. No number is published. The page says timing depends on roads, safety, and demand. | A typical window, worded as typical, never a guarantee |
| Swap-out process | Storm tile: "Call or text about hauling it away and booking another drop." | How a customer books the next drop |
| Pickup, towing, and return for direct rentals | "How it works" steps 2–3, and the direct-vs-drop FAQ | What the customer does to pick up, tow, and return a direct rental |
| Quote response time | Quote intro: "If it's time-sensitive, call or text." | How soon you usually reply |
| Payment methods | FAQ "How do I pay?": call or text | Card, cash, Venmo, or whatever you accept |
| Storm pricing | Still unpublished. The card says "Call or text for storm pricing." | A number only when you set one |

## Hidden (not on the page)

| Item | What happened |
|---|---|
| Legal business name (LLC / DBA) | Removed from the copyright line. It now reads "Junk & Dump Rental." |
| Facebook, Instagram, and TikTok | Icons removed. The footer column is "Get a quote" until real profile URLs exist. |
| Team photo | The striped "add a photo" box is gone. The section shows the existing logo illustration instead. Save a photo as `assets/team.jpg` and swap it in when you have one. |
| Street address, city, and ZIP | Removed from JSON-LD. Do not add a home address if you don't want it public. City and ZIP still help local search once you choose what to publish. |
| Opening hours in JSON-LD | Removed. Add `openingHours` only after the footer hours are real. |
| Social profile URLs in JSON-LD `sameAs` | Removed. Add them when the links are real. |
| Danielle's last name | JSON-LD lists her as "Danielle" only. Joseph Heidel is unchanged. |

## Loading list (still a draft)

The yes/no lists are the same draft as before, without the internal `[confirm]` tags. A customer note now says: "Not sure about an item? Call or text before you load it."

Please check these against your landfill or transfer station before treating them as final, especially:

- Downed limbs and branches
- Roofing shingles
- Mattresses and other furniture
- Appliances with refrigerant (fridges, A/C units)

## Story

The team paragraph no longer includes the starter draft ("we show up when we say we will…"). It only says you are a husband-and-wife team serving Destin to Panama City Beach, including 30A, and that a call or text reaches you directly. Replace it with your own words when you want.

## Quote form

The form still opens the visitor's email app with a prefilled message to **saltnsun30a@gmail.com**. To receive submissions without that step, create a free Formspree form, then in `script.js` set `USE_FORMSPREE = true` and `FORMSPREE_ENDPOINT` to your form URL.

## Left off on purpose

No reviews, testimonials, license or insurance numbers, years-in-business claims, guaranteed response times, or FEMA/insurance promises were added.

## When you buy a domain

Canonical, Open Graph, and JSON-LD URLs currently point at https://ntxhail.github.io/Junk-Dump-/

Update these together:

- `<link rel="canonical">`
- `og:url` and `og:image` (the image URL must stay absolute)
- JSON-LD `url`, `logo`, and `image`
