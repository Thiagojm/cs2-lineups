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

Verified 2026-09-23: `http://localhost:8765/` returned 200 for `/`, `/lineups.json` (14 items), `/app.js`, and `/styles.css`.

There is no package manager, build step, linter, or test suite in this repository.

## Repository conventions

- Shipable assets live only under `dist/`. Edit `index.html`, `styles.css`, `app.js`, `lineups.json`, and `images/` there.
- UI copy is Portuguese (`lang="pt-BR"`). Keep Portuguese for user-facing strings; keep English for agent memory docs.
- Favorites persist in `localStorage` under `cs2-lineups-favorites`, keyed by each lineup’s `source` URL.
- Escape all lineup fields before injecting into HTML (`esc` in `app.js`).
- Static hosting root is `dist`. OpenAI Sites config is `.openai/hosting.json`.

## Context maintenance

Update existing memory documents when their content changes: current work in `TODO.md`, durable decisions in `docs/DECISIONS.md`, and stable product facts in `docs/PROJECT_CONTEXT.md`. Update this file only for recurring, verified instructions. Remove duplication and stale history while preserving active constraints and explicit backlog items; retain necessary detail even when a document is long.
