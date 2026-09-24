# Side filter implementation plan

## Goal

Visitors can switch between TR and CT lineups; TR is selected on load, and the 25 current TR entries remain visible.

## Out of scope

New CT lineups or captures, changes to `dist/lineups.json`, persistent side selection, deployment, and commits.

## Prerequisites

- Approved design: `docs/specs/2026-09-23-side-filter-design.md`.
- Serve the site from `dist/` over HTTP for browser checks. No dependencies or build step are required.

## Ordered steps

1. **Add the control.** In `dist/index.html`, add a `LADO` filter group with a `side-filters` container near the existing map and grenade rows. In `dist/styles.css`, reuse chip styling and make only the layout adjustment needed to show all three groups at desktop and mobile widths. The two choices must be keyboard-operable and expose their pressed state.
2. **Wire the filter.** In `dist/app.js`, initialize the selected side to `TR`, render `TR` and `CT` chips, handle clicks through the existing delegated listener, and add side matching to the existing combined card filter. Keep map, grenade, search, favorites, card rendering, and favorite storage semantics intact.
3. **Explain the empty state.** In `dist/app.js`, show a CT-specific empty message only when CT is selected and the loaded catalog contains no CT entries. Use the existing generic no-results message for other zero-result combinations and after CT entries exist. Preserve the fetch-error message when catalog loading fails.
4. **Update project docs.** In `README.md`, include side filtering in the user-facing feature list. In `docs/PROJECT_CONTEXT.md` and the client catalog section of `docs/DECISIONS.md`, record the stable side-filter behavior. In `TODO.md`, mark the filter delivered while leaving CT content in the backlog. Do not edit unrelated in-progress work.

## Verification

- Confirm `dist/lineups.json` still parses to 25 entries and all have `side: "TR"`; its diff must remain empty.
- Run `node --check dist/app.js` if Node is available, and `git diff --check`.
- Run `python -m http.server 8000 --directory dist`; in a browser, confirm initial TR count 25, CT count 0 and its empty message, and TR restores 25.
- Exercise side selection together with a map, grenade, search, and favorites; confirm keyboard focus and `aria-pressed` on both side buttons at desktop and mobile widths.
- For the future-data edge case, temporarily serve or inject one CT entry without changing committed catalog data; confirm CT displays it and a nonmatching combination uses the generic empty message. Remove the temporary fixture afterward.

## Risk and safeguard

An empty CT catalog could look like a broken filter. The CT-specific message explains the state, while the generic message remains correct once CT data exists. Keep the user-owned untracked `__pycache__` directory untouched.
