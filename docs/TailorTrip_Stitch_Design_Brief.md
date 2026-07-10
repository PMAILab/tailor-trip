# TailorTrip, Stitch Design Brief

A build ready set of prompts for Google Stitch. TailorTrip is a **responsive website** (works on desktop and mobile, designed mobile first) with **login**. Discovery is open to everyone. Saving, comparing, and generating an itinerary require an account.

The look we are after: a quiet, premium, editorial website. Think a high end boutique travel brand, not a booking portal. Restraint over decoration. Lots of white space, a near monochrome palette with one calm accent, a refined serif paired with a clean sans, hairline rules instead of heavy shadows, and slow, subtle motion. It should feel expensive and effortless.

How to use this: paste the **Base prompt** first so Stitch locks the theme. Then generate the screens one at a time using each screen prompt. If a screen feels busy, add "more negative space, fewer elements, one primary action, thinner lines" and regenerate.

---

## Base prompt (paste first)

Design a responsive web app called **TailorTrip**, an AI powered smart travel optimizer for young Indian professionals. Its job is to take a stressed, time poor user from a mood to a confident travel decision in under five minutes. The aesthetic is quiet luxury: minimal, editorial, and premium, like a refined boutique travel brand. Calm, spacious, and confident. One clear decision per screen and nothing on screen that does not earn its place.

Design language:
- Minimalism first. Generous white space, wide margins, and a strong, disciplined grid. Let the layout breathe.
- Near monochrome palette. Warm bone white background, deep ink text, soft warm greys for secondary text and hairlines, and a single restrained accent used sparingly.
- Editorial typography. A high contrast serif for display headings and a clean neutral sans for body and interface. Small labels in uppercase with wide letter spacing. Large, calm headlines.
- Structure with hairlines, not boxes. Use thin 1px dividers and subtle borders instead of heavy shadows or loud cards. Flat surfaces, gentle depth only where it helps.
- Restrained motion. Slow fades and quiet hover reveals on desktop. No bounce, no flashy transitions.
- Photography as the color. Let large, beautiful travel images carry the warmth while the interface stays neutral and understated.

Palette:
- Background bone white #F7F5F0
- Ink text #17160F
- Secondary text warm grey #6B6A61
- Hairlines and borders #E4E0D6
- Single accent, deep green #2C3A31, used only for primary actions and key highlights
- Best value highlight, a soft muted sage tint, never a bright green

Typography:
- Display and headings: a high contrast editorial serif such as Fraunces or Canela. Large and confident.
- Body and interface: a clean neutral sans such as Inter or Neue Haas Grotesk.
- Prices and numbers use tabular figures with the rupee symbol.
- Micro labels (badges, section eyebrows) in uppercase, 12px, wide letter spacing, warm grey.

Components:
- Buttons: one solid ink or deep green primary button with a small radius, plus a quiet outline or text secondary. Understated, never glossy.
- Cards: flat with a 1px hairline border and a large image, small radius around 10px, lots of internal padding. No drop shadow unless it is very soft.
- Badges: thin outline pills, not filled blocks.
- Inputs: minimal, underline or hairline bordered fields with calm focus states.

Responsive rules:
- Mobile first. On desktop, center content in a max width of about 1200px with wide, calm margins.
- Desktop uses a slim, mostly transparent top navigation bar with the wordmark on the left and Home, Explore, Shortlist, and a small profile avatar on the right. The bar sits on white space, separated by a hairline.
- Mobile uses a minimal bottom tab bar with Home, Explore, Shortlist, Profile.
- Card feeds show three per row on desktop, two on tablet, one column on mobile, with comfortable gutters.

Consistency:
- Every card, list, and AI surface needs three quiet states: a loading skeleton, an empty state, and a gentle error state. Keep them as understated as the rest of the design.

---

## 1. Landing page (public)

A public editorial landing page. A large, calm hero, mostly white space, with a serif headline "Don't just book. Optimize." set large, and a short subline in the clean sans explaining that TailorTrip takes you from a mood to a confident trip in five minutes. One solid primary button "Start with a mood" and a quiet text link "Log in". A single beautiful full width travel image below the fold, edge to edge. Then three minimal value rows separated by hairlines: Start with a feeling, See the real cost and best time, Decide with confidence, each a short line of text with a small serif number. A restrained footer with a hairline top border. Museum quiet, editorial, spacious. Hero stacks gracefully on mobile.

## 2. Login and Sign up (auth)

A calm, centered authentication screen on the bone background. On desktop, a split layout: a full height travel image on the left, and a minimal form on the right with wide margins. On mobile, a single centered column. A serif title "Welcome to TailorTrip". A "Continue with Google" button, a thin hairline divider with a small "or", then underline style email and password fields, and a solid primary "Continue" button. A quiet text toggle to switch between Log in and Create account. Understated and trustworthy, no clutter.

## 3. Home, mood selection (public)

The main entry screen. A large serif greeting with lots of space above it, for a logged out user "Where is your head at today?" and for a logged in user "Where is your head at today, Riya?". Below, a refined grid of 6 to 8 mood options. Each mood is a minimal tile with a small serif label and a single quiet icon or a soft muted image, separated by hairlines and generous gutters, not loud gradient cards. Moods include Need a reset, Adventure mode, Workation vibe, Romantic escape, Budget explorer, Culture and food. Under the grid, a slim underline style budget range control and a quiet toggle for Cheapest versus Least crowded. Calm, editorial, one obvious next step.

## 4. Explore, destination cards feed (public)

A gallery of Smart Destination Cards after a mood is picked, laid out on a disciplined grid. Each card is flat with a hairline border and a large image on top. Below the image: destination name and state in the serif, a bold total estimated cost in rupees with tabular figures, two thin outline badges such as "Cheapest in March" and "Low crowd", and a single quiet line of AI reasoning "why this fits your mood" in warm grey. A small outline heart to save. Three per row on desktop, one column on mobile, with a minimal filter row of hairline chips at the top. Include an understated skeleton loading state and a calm no results state.

## 5. Trip details, decision dashboard (public to view, save needs login)

A destination detail page that helps the user decide, laid out like an editorial spread. A large hero image, then the destination name in the serif and the total estimated cost. A cost breakdown showing Stay, Travel, and Food as a clean, thin horizontal bar with labels, not a chunky chart. A Timing section with a quiet toggle between Cheapest month and Least crowded month that updates a minimal line chart. A Budget fit row showing the trip as a percentage of monthly income with a slim progress line. On desktop, a two column layout with the image and headline facts on the left and the breakdown and timing on the right, separated by a hairline. A calm sticky action row with Save and "Book this trip". If a logged out user taps Save, show the sign in prompt.

## 6. Sign in prompt (auth gate)

A small, centered modal on a soft dimmed background, appearing when a logged out user tries to save, compare, or generate an itinerary. A short serif line "Keep your trips in one place". A "Continue with Google" button, a quiet email option, and a "Maybe later" text link. Minimal, low pressure, generous padding, hairline border, no hard wall.

## 7. Shortlist (auth)

The user's saved trips, shown as a quiet gallery on desktop and a single column on mobile, using the same flat hairline cards. Each has cost and thin badges and a small remove action. A restrained "Compare" button becomes active when two or more trips are saved. A calm, editorial empty state when nothing is saved yet, a single serif line and a gentle nudge to explore moods.

## 8. Compare (auth)

A side by side comparison of two or three saved destinations, laid out as a clean table with plenty of air. Destinations as columns, dimensions as rows separated by hairlines: hero image and name, total cost, cost breakdown, cheapest month, crowd level, weather, duration, and AI match score. The best value in each row is marked with a soft muted sage tint and a small label, never a loud color. At the bottom, an AI Recommendation panel in the serif that says in two or three plain sentences which trip to pick and why. Columns scroll horizontally on mobile. Each column has a quiet "Book this trip" action.

## 9. Itinerary builder, guided form (auth)

A short, elegant multi step form. One question group per view with lots of space: destination, number of days, pace (relaxed, balanced, packed), interests as minimal outline chips (food, nature, culture, nightlife, shopping), and budget. A thin progress line at the top and a single solid "Generate my itinerary" button. Underline style inputs, calm and low effort. Centered on desktop, full width on mobile.

## 10. Itinerary result (auth, the key screen)

A generated day by day itinerary presented like a beautiful printed guide. A serif header with the destination and trip length over white space. A clean vertical timeline grouped by Day 1, Day 2, and so on, each day separated by a hairline, each activity showing a small time, a serif name, and a short note in warm grey. A calm sticky action row to "Save itinerary" and "Share", plus a quiet "Book this trip" link. This is the moment of value, so it should feel considered and rewarding, not busy. Include a quiet generating state with a slow, minimal loading indicator.

## 11. Profile and account (auth)

A minimal account page. The user name in the serif and a small avatar, a saved trips count, budget preference, and travel style tags shown as thin outline chips. Account controls for email, connected Google account, and log out, listed simply and separated by hairlines. Two column on desktop, stacked on mobile. Restrained and tidy.

---

## Build notes for whoever codes it

- Keep the rupee symbol and Indian destinations so it feels authentic to the market.
- Hold the discipline: hairlines over shadows, one accent, tabular figures for prices, uppercase micro labels, and a serif for display with a clean sans for interface.
- Every card, list, and AI surface needs three states: loading skeleton, empty, and error, all in the same understated style.
- Reuse one card component everywhere (Explore, Shortlist, Compare header) so the build stays consistent.
- The auth gate is a modal, not a route, so browsing is never interrupted for logged out users until they act.
- Match the routes already in the app: Home, Explore, Trip details, Shortlist, Compare, Profile, plus new Login and Itinerary routes.
