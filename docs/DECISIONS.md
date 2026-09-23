# Decisions

Record only choices that guide future work. Prefer stable thematic contracts over one decision record per implementation detail.

## Delivery and hosting (2026-09-23)

- Status: accepted
- Contract:
  - Deliver a zero-build static site from `dist/`.
  - Publish on here.now (live slug `deep-essence-hjmw`, URL https://deep-essence-hjmw.here.now/). API key lives in `~/.herenow/credentials`; local publish cache in `.herenow/` (gitignored).
  - Keep `.openai/hosting.json` as legacy only; OpenAI Sites is not the deployment target.
  - GitHub commits do not auto-deploy; republish `dist/` to update the live site.
- Rationale: Content is a small JSON-driven catalog; here.now fits zero-build static hosting with a permanent authenticated site.
- Impact: Keep site assets under `dist/`. After content changes, republish to slug `deep-essence-hjmw`. Never commit credentials or `.herenow/state.json`.

## Client catalog model (2026-09-23)

- Status: accepted
- Contract:
  - Lineups live in `dist/lineups.json` as a flat array of objects (`map`, `grenade`, `side`, `area`, `from`, `to`, `title`, `throw`, `description`, `image` or `images`, optional `captureCredit`, `source`).
  - `app.js` owns filtering, search (`pt-BR` lowercasing), rendering, favorites, and the capture lightbox; filter chip orders are hardcoded (`mapOrder`, `typeOrder`).
  - Smoke/Flash/Molotov chips always appear; HE appears only when catalog data includes HE.
  - Capture clicks open an in-page lightbox; entries with `images` show a labeled split capture. HTTP(S) source links remain `target="_blank"`.
  - Lightbox zoom uses mouse wheel (about 1×–4×, cursor-centered) and pointer drag to pan when zoomed; open/close resets transform. Focus trap and Esc/×/backdrop close stay unchanged.
  - Card capture credit defaults to CS2Nades and can be overridden per lineup with `captureCredit`.
  - Favorite identity is the lineup `source` string in `localStorage` key `cs2-lineups-favorites`. `source` may be an HTTP(S) URL or a stable local id (e.g. `mirage-smoke-l`); non-HTTP sources render `ID · …` in the footer instead of “Ver fonte e vídeo”.
  - Rendered card HTML escapes every dynamic string.
- Rationale: One JSON file keeps content editable without a CMS; source values are stable favorite keys, and HTTP sources also deep-link to CS2Nades. Local ids cover user-owned captures without inventing external URLs. Zoom/pan helps read crosshair detail without leaving the page.
- Impact: New lineups are data + image additions. Renaming or replacing a `source` orphans existing favorites. Keep Portuguese UI strings in HTML/JS. Lightbox zoom state lives only in memory for the open dialog.

## Content and attribution (2026-09-23)

- Status: accepted
- Contract:
  - Cover the seven-map September 2026 Premier pool, including Cache in place of Overpass.
  - Attribute lineup research to CS2Nades when that is the research source; identify each capture's credit on its card (`captureCredit`, default CS2Nades). HTTP sources keep a per-card video link; local-only captures use a stable non-HTTP `source` id and `captureCredit: PRÓPRIA`.
  - When replacing an existing card's screenshots with user-owned captures, keep the existing `source` (favorite id) and set `captureCredit: PRÓPRIA`. New own-capture lineups get a new stable local `source` id.
  - Warn that map updates can change throws.
- Rationale: Players need the live competitive pool and, when available, a path back to the original video for verification. Keeping `source` on replacements preserves starred favorites.
- Impact: Pool changes require copy updates in `index.html` (intro note, footer date) and catalog edits; do not invent CS2Nades links for user-owned captures.
