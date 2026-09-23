---
name: cs2-lineup-captures
description: Turn supplied CS2 lineup screenshots and throw details into the site's labeled capture and catalog entry. Use for new or replacement lineups in this project.
---

# CS2 lineup captures

Use this skill in `D:\Projetos\cs2-lineups`. Read the repository instructions and inspect the relevant existing lineup before editing. The user supplies screenshots plus map, place, grenade, effect, and how to throw; extract the catalog fields from that description. Ask only for details that cannot be determined reliably, especially an exact aim point, throw keys, or a stable source URL. Never infer a precise lineup from a screenshot alone.

## Capture

- Prefer the original three-panel composite used by the first site cards. Identify which screenshot shows the player's standing position, the crosshair/aim point, and the grenade's visible result. Do not invent or retouch game geometry, crosshair placement, or the result. If a view is absent, request it; use the site's separate-image format only when the user prefers it or the three-panel crop cannot show the essential detail.
- Run `python .agents/skills/cs2-lineup-captures/scripts/compose.py --position <file> --aim <file> --result <file> --from-label <place> --to-label <target> --throw-label <keys> --output dist/images/<unique-slug>.jpg` (requires Pillow). The script makes the original 1080×1080 layout: standing position on top, aim and result below, amber dividers, rounded amber labels with dark text. Use `--position-focus`, `--aim-focus`, or `--result-focus` (`x,y` from 0 to 1) if the default center crop hides the standing landmark, crosshair, or grenade effect. Keep labels short and correct for this throw, rather than copying another card's labels.
- Inspect the full-size output and the site card. The position landmark, crosshair, effect, and every label must be readable. If cropping cannot retain a critical detail, adjust the focus or use the separate-image layout instead. Keep the supplied originals outside `dist/`; only the finished site assets belong in `dist/images/`.
- Credit only the actual screenshot source. Add `--credit CS2NADES` only for CS2Nades captures; do not put that credit on the user's own gameplay screenshots.

## Catalog

- Add or update one object in `dist/lineups.json` with the correct `map`, `grenade`, `side`, `area`, `from`, `to`, `title`, `throw`, `description`, image path, and `source`. Use Portuguese player-facing text and describe the actual effect and timing supplied by the user. For the composite use `image`; for separate captures use `images` in position then aim order where those are the supplied views.
- Keep an existing `source` unchanged when replacing that lineup's captures, because it is the favorite ID. For a new lineup, obtain a stable source URL from the user; do not fabricate a CS2Nades link or silently reuse another lineup's source. If screenshots are user-owned and there is no external source, adapt the site's source/attribution presentation for that entry so it does not claim CS2Nades ownership, and choose an explicit stable ID before publishing.
- Check map and grenade filters, card, lightbox, image loading, and attribution through a local HTTP server rooted at `dist`. Do not publish, commit, or push as part of this skill unless the user has authorized that action. Update `TODO.md` or the project context documents only when the corresponding project state or durable decision changes.
