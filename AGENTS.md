# Agent instructions

## Reading order

Read these files before changing the project:

1. `docs/PROJECT_CONTEXT.md`
2. `docs/DECISIONS.md`
3. `TODO.md`
4. `README.md` (Portuguese user-facing setup and deploy notes)

## Verified commands

Serve the static site from `dist` (required so `fetch("lineups.json")` works):

```powershell
python -m http.server 8000 --directory dist
```

Verified 2026-09-23: local `python -m http.server` against `dist/` returned 200 for `/`, `/lineups.json` (31 items), `/app.js`, and `/styles.css`. Dust2 own captures (Portas v1/v2, Domínio Fundo, Porta B, Meio B; flashes Redomínio Fundo, Rush Fundo, Meio, Varanda, Domínio Varanda), side filter, and lightbox zoom/pan were exercised in Playwright (desktop and mobile).
Two-finger pinch, one-finger pan, and zoom reset were exercised with simulated touch in Chrome at 390×844; physical-device behavior remains to be checked.

There is no package manager, build step, linter, or test suite in this repository.

## Repository conventions

- Shipable assets live only under `dist/`. Edit `index.html`, `styles.css`, `app.js`, `lineups.json`, and `images/` there.
- UI copy is Portuguese (`lang="pt-BR"`). Keep Portuguese for user-facing strings; keep English for agent memory docs.
- Favorites persist in `localStorage` under `cs2-lineups-favorites`, keyed by each lineup’s `source` value (URL or local id).
- A lineup may use `image` or `images` in `lineups.json`; multiple captures render as a labeled split.
- Capture clicks open `#lightbox`; wheel or two-finger pinch zooms `#lightbox-images` (~1×–4×), drag pans when zoomed, open/close resets transform; Esc/×/backdrop close and focus trap stay required.
- Optional `captureCredit` overrides the default `CS2NADES` credit shown on the card. Own captures (`PRÓPRIA`) show no video link or internal ID in the footer; preserve `source` on replacements to keep favorites.
- Escape all lineup fields before injecting into HTML (`esc` in `app.js`).
- Static hosting root is `dist`. Live host is here.now (`deep-essence-hjmw`); `.openai/hosting.json` is legacy. Ignore `.herenow/` and never commit API keys. On this Windows host, republish with PowerShell against the here.now API (bash/`jq` unavailable).

## Context maintenance

Update existing memory documents when their content changes: current work in `TODO.md`, durable decisions in `docs/DECISIONS.md`, and stable product facts in `docs/PROJECT_CONTEXT.md`. Update this file only for recurring, verified instructions. Remove duplication and stale history while preserving active constraints and explicit backlog items; retain necessary detail even when a document is long.
