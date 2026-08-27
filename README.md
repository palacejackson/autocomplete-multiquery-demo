# Specsavers Federated Autocomplete Demo

Implementation of the `Specsavers Autocomplete.dc.html` design (option 1a —
two-panel: suggestions rail + rich results) from the Claude Design project
[Specsavers Autocomplete](https://claude.ai/design/p/7d73f03b-53b0-47f5-ae4e-6bb18a0d1e59).

A single `@algolia/autocomplete-js` instance with five federated sources —
query suggestions, glasses, contact lenses, stores, articles — plus an empty
state of recent searches, popular queries and quick links. A custom `render`
lays the sources out in the design's two-column panel instead of the default
single stacked column.

## Running

```bash
npm install
npm start          # http://localhost:3000
```

Dev-only demo. `?q=<query>` opens the panel on load, e.g.
[`/?q=london`](http://localhost:3000/?q=london) — handy for screenshots.

## Panel states

| State      | How to see it                                            |
| ---------- | -------------------------------------------------------- |
| Empty      | Focus the input — recents, popular chips, quick links     |
| Results    | Type `london`, `multifocal`, `designer`, `prescription`   |
| No results | Type something off-catalogue, e.g. `zzzz`                 |

## Data

Items come from the `DATA` catalogue in `main.js`, mirroring the design doc's
mock data — no Algolia credentials required. To point a section at a live
index, swap that source's `getItems` for `getAlgoliaResults`:

```js
getItems() {
  return getAlgoliaResults({
    searchClient,
    queries: [{ indexName, query, params: { hitsPerPage: 6 } }],
  });
}
```

The templates and layout stay as they are. `.env.example` lists the variables
the previous Liberty catalogue build used, if you wire a client back up.

The design doc's three content props are the `CONFIG` object at the top of
`main.js`: `showOfferBadges`, `showRecentSearches`, `showStoreServices`.

## Files

- `index.html` — page shell, site chrome, autocomplete + panel containers
- `main.js` — sources, templates, two-column panel render, recent searches
- `styles.css` — Specsavers palette and Nunito type, mapped onto the `aa-*` DOM
- `public/specsavers-logo.png` — logo asset from the design project
