# Side filter design

## Context and problem

The static catalog has 25 lineups. Every entry already has `side: "TR"`, and cards display that value, but visitors can filter only by map, grenade type, search, and favorites. The user wants to select lineups by TR or CT. This delivery adds the selection only; CT lineups and captures will be added separately.

## Goals and boundaries

- Add a visible, accessible side filter with `TR` and `CT` choices.
- Select `TR` on initial page load so the current catalog remains visible.
- Combine the selected side with all existing filters and search.
- Keep all 25 existing entries, their `side` values, `source` identifiers, and favorite keys unchanged.
- Do not add CT content, change the catalog schema, or publish the site in this work.

## Chosen approach

Add a `LADO` chip row to the existing filter area in `dist/index.html`, using the same button and `aria-pressed` pattern as the map and grenade rows. `dist/app.js` holds `selectedSide = "TR"`, renders the two chips, handles clicks, and includes `item.side === selectedSide` in the existing card filter. The side selection is page state only, matching the map and grenade filters; it is not stored in `localStorage`. `dist/styles.css` adjusts the filter layout only as needed for the third row on desktop and mobile.

When `CT` is selected while the catalog has no CT entries, the result count is zero and the empty state explains that CT lineups have not yet been added. If CT entries are added later but other filters or search produce zero matches, the normal no-results message appears. Existing favorites continue to be keyed by `source` and are filtered by side along with the cards.

## Alternatives considered

- A three-way `Todos` / `TR` / `CT` filter would add an unrequested mixed-side view. The two requested choices keep the control small.
- A new `side` field or migration is unnecessary because every current entry already has `side: "TR"`.
- A dropdown would be less consistent with the existing chip filters for only two choices.

## Acceptance criteria and validation

1. Initial load shows `TR` pressed and all 25 current entries, subject to the other default filters.
2. Choosing `CT` shows zero cards, a zero result count, and a clear CT empty-state message with the current catalog.
3. Switching back to `TR` restores the current list without changing favorites.
4. Side selection combines correctly with map, grenade, search, and favorites; a zero-result combination does not display a misleading CT catalog message once CT data exists.
5. The side buttons work with mouse and keyboard, expose their pressed state, and fit on mobile without hiding existing controls.
6. Parse the catalog and verify all current `side` values remain `TR`; serve `dist/` locally and exercise the filter on desktop and mobile. The repository has no build, lint, or test suite.

## Decisions and assumptions

The user confirmed filter-only scope and a default of `TR`. CT data will be a separate content task. A side value is explicit on every current lineup; no fallback is needed. The new filter follows the existing Portuguese UI and vanilla JavaScript patterns.
