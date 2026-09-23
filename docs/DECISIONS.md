# Decisions

Record only choices that guide future work. Prefer stable thematic contracts over one decision record per implementation detail.

## Delivery and hosting (2026-09-23)

- Status: accepted; hosting destination pending
- Contract:
  - Deliver a zero-build static site from `dist/`.
  - Stop using OpenAI Sites. The existing `.openai/hosting.json` is legacy configuration, not the active deployment target.
  - Choose a different static host before the next publication; use `dist` as the output directory and no build command.
- Rationale: Content is a small JSON-driven catalog; a build toolchain would add cost without product value.
- Impact: Keep site assets under `dist/`; update the README and hosting instructions when the new host is selected. Do not treat GitHub commits as deployment.

## Client catalog model (2026-09-23)

- Status: accepted
- Contract:
  - Lineups live in `dist/lineups.json` as a flat array of objects (`map`, `grenade`, `side`, `area`, `from`, `to`, `title`, `throw`, `description`, `image`, `source`).
  - `app.js` owns filtering, search (`pt-BR` lowercasing), rendering, and favorites; filter chip orders are hardcoded (`mapOrder`, `typeOrder`).
  - Favorite identity is the lineup `source` URL string in `localStorage` key `cs2-lineups-favorites`.
  - Rendered card HTML escapes every dynamic string.
- Rationale: One JSON file keeps content editable without a CMS; source URLs are stable identifiers that also deep-link to CS2Nades.
- Impact: New lineups are data + image additions. Renaming or replacing a `source` orphans existing favorites. Keep Portuguese UI strings in HTML/JS.

## Content and attribution (2026-09-23)

- Status: accepted
- Contract:
  - Cover the seven-map September 2026 Premier pool, including Cache in place of Overpass.
  - Attribute captures and lineup research to CS2Nades; keep per-card source links and footer credit.
  - Warn that map updates can change throws.
- Rationale: Players need the live competitive pool and a path back to the original video for verification.
- Impact: Pool changes require copy updates in `index.html` (intro note, footer date) and catalog edits; do not drop attribution.
