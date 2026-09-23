# Project context

## Purpose

Fast Portuguese reference for CS2 grenade lineups on the seven Premier competitive maps (September 2026 pool). Players filter by map or grenade, read throw instructions with a capture of position/aim/result, open the original CS2Nades source/video, and star favorites in the browser.

## Main flows

1. Open the static page → client loads `lineups.json` → cards and filter chips render.
2. Narrow results with map chips, grenade chips, text search (`/` focuses search; Escape clears), or favorites-only toggle.
3. Open a capture full-size, read throw meta, or follow `source` for the full video.
4. Toggle ♥ on a card → id stored in `localStorage` by `source` URL.

## Domain terms

| Term | Meaning in this project |
| --- | --- |
| Lineup | One grenade throw with map, side, area, from→to, throw keys, description, image, and source URL |
| Pool / Premier | Active competitive map set; as of Sept 2026 includes Cache instead of Overpass |
| Captura | Composite screenshot showing stand position, crosshair, and landing result |
| Throw | Input combo (mouse buttons + movement/keys) needed for the lineup |
| Side | `TR` (Terrorist) or CT; current catalog is TR-focused |

Maps in filter order: Mirage, Dust2, Inferno, Nuke, Ancient, Anubis, Cache. Grenade types supported in UI: Smoke, Flash, Molotov, HE.

## Stable constraints

- Static site only: HTML, CSS, vanilla JS, JSON. No framework, bundler, or backend.
- Must be served over HTTP(S); opening `index.html` as a file breaks `fetch("lineups.json")`.
- Content and images are researched from [CS2Nades](https://cs2nades.gg/); patches can invalidate throws—copy tells users to verify in a practice match.
- Publish `dist` as the static hosting root with no build command. Live site: https://deep-essence-hjmw.here.now/ (here.now). OpenAI Sites config is legacy only.
- Current catalog size: 21 lineups (smokes, one Flash per map, one Anubis molotov). Capture clicks open an in-page lightbox.
