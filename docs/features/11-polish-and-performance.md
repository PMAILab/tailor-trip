# Phase 7: Polish & Performance

Final UI polish, responsive behavior, and remaining page wiring.

---

## Task List

### Layout — `src/components/Layout.tsx` [MODIFY]

- [ ] Make header search box functional (filters destinations by name)
- [ ] Highlight active nav link based on current route
- [ ] Show shortlist count badge on Shortlist nav link

### Compare Page — `src/pages/Compare.tsx` [MODIFY]

- [ ] Keep as "Coming Soon" placeholder
- [ ] Show message: "Side-by-side comparison coming soon"
- [ ] Add subtle illustration or icon

### Profile Page — `src/pages/Profile.tsx` [MODIFY]

- [ ] Wire up to `GET /api/profile` (fetch preferences on mount)
- [ ] Wire up to `POST /api/profile` (save on submit)
- [ ] Functional name input field
- [ ] Preferred budget range selector (dropdown or pills)
- [ ] Travel preference chips (informational for MVP)
- [ ] Verify preferences persist across navigation

### General Polish

- [ ] Add `motion` (Framer Motion) page transitions
- [ ] Add micro-animations on interactive elements
- [ ] Ensure mobile-first responsive behavior
- [ ] Test on Chrome DevTools mobile view (iPhone-sized screens)
- [ ] Add proper `<title>` and `<meta>` tags per page
- [ ] Ensure all interactive elements have unique IDs for testing
- [ ] Review overall UX against PRD design guidelines (intelligent, clean, minimal, data-forward, trustworthy)

---

## Dependencies

- All previous phases and features

## Outputs

- Modified: `Layout.tsx`, `Compare.tsx`, `Profile.tsx`
- General CSS and animation updates across components
