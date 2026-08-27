/**
 * Specsavers federated autocomplete
 * Implementation of "Specsavers Autocomplete.dc.html" — option 1a,
 * two-panel: suggestions rail + rich results.
 *
 * One Autocomplete instance with five federated sources — query
 * suggestions, glasses, contact lenses, stores, articles — plus an
 * empty state (recent searches, popular queries, quick links).
 * A custom `render` lays the sources out in the two-column panel
 * instead of the default single stacked column.
 *
 * Items come from the local catalogue below, mirroring the design doc's
 * mock data. To point a section at a live index, swap its `getItems` for
 * `getAlgoliaResults({ searchClient, queries: [...] })` — the templates
 * and layout stay as they are.
 */
import { autocomplete } from "@algolia/autocomplete-js";

/* Design doc props (Content section) -------------------------------- */
const CONFIG = {
  showOfferBadges: true,
  showRecentSearches: true,
  showStoreServices: true,
};

const MAX_RECENTS = 4;

/* Catalogue ---------------------------------------------------------- */
const DATA = {
  suggestions: [
    "london",
    "prescription sunglasses",
    "multifocal contact lenses",
    "book eye test",
    "varifocal glasses",
    "ray-ban sunglasses",
    "contact lenses offers",
    "designer glasses",
    "2 for 1 glasses",
    "reading glasses",
    "hearing test",
  ],
  frames: [
    {
      brand: "Liberty London",
      model: "LL 17",
      price: "£130",
      offer: "2 for 1 from £70",
      color: "#a9c2b1",
      kw: "liberty london fashion designer glasses",
    },
    {
      brand: "Liberty London",
      model: "LL 14",
      price: "£130",
      offer: "2 for 1 from £70",
      color: "#d8a7a1",
      kw: "liberty london fashion designer glasses",
    },
    {
      brand: "Ray-Ban",
      model: "RB3025 Aviator",
      price: "£145",
      offer: "",
      color: "#d4af37",
      kw: "ray-ban aviator prescription sunglasses designer",
    },
    {
      brand: "Osiris",
      model: "Sunny",
      price: "£99",
      offer: "2 for 1 from £70",
      color: "#7a5c3e",
      kw: "prescription sunglasses",
    },
    {
      brand: "Specsavers",
      model: "Aurora",
      price: "£89",
      offer: "",
      color: "#2b2b2b",
      kw: "everyday glasses reading",
    },
    {
      brand: "Love Moschino",
      model: "LM 099",
      price: "£145",
      offer: "",
      color: "#8a5a3b",
      kw: "designer glasses fashion",
    },
  ],
  lenses: [
    {
      name: "easyvision Freshlook Multifocal",
      pack: "30 lenses · monthly",
      price: "£24.50",
      kw: "multifocal contact lenses monthly",
    },
    {
      name: "ACUVUE OASYS Multifocal",
      pack: "6 lenses · fortnightly",
      price: "£32.00",
      kw: "multifocal contact lenses acuvue",
    },
    {
      name: "easyvision Comfil Daily",
      pack: "30 lenses · daily",
      price: "£19.00",
      kw: "daily contact lenses",
    },
  ],
  stores: [
    {
      name: "London – Walworth",
      address: "226 Walworth Road, London, SE17 1JE",
      services: ["Eye health services", "Hearing services"],
      kw: "london walworth store",
    },
    {
      name: "London – Moorgate",
      address: "50 London Wall, London, EC2M 5TE",
      services: ["Eye health services", "Hearing services"],
      kw: "london moorgate store",
    },
    {
      name: "London – Tottenham Court Road",
      address: "245–246 Tottenham Court Road, London, W1T 7QP",
      services: ["Eye health services"],
      kw: "london tottenham store",
    },
  ],
  articles: [
    {
      title: "Find an optician near you in London",
      snippet:
        "With over 100 stores available, find your nearest Specsavers in London.",
      kw: "london optician store",
    },
    {
      title: "London Fashion Week SS25 trends",
      snippet:
        "Discover the glasses trends for SS25, from Dopamine Brights to Brit Prints.",
      kw: "london fashion glasses",
    },
    {
      title: "What are multifocal contact lenses?",
      snippet:
        "A simple guide to how multifocal lenses correct near and far vision.",
      kw: "multifocal contact lenses guide",
    },
    {
      title: "How to prepare for your eye test",
      snippet: "Everything to know before you book an eye test at Specsavers.",
      kw: "book eye test appointment",
    },
  ],
  popular: [
    "2 for 1 glasses",
    "prescription sunglasses",
    "eye test",
    "multifocal contacts",
    "designer frames",
    "hearing test",
  ],
  quickLinks: [
    { label: "Find a store", icon: "pin" },
    { label: "Book an eye test", icon: "calendar" },
    { label: "Our offers", icon: "tag" },
  ],
};

/* Icons -------------------------------------------------------------- */
const ICONS = {
  search:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  cross:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  arrowUpRight:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>',
  trend:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m23 6-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  calendar:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4 12 22l-9-9V3h10z"/><circle cx="8" cy="8" r="1.4"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
  lens: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3"/></svg>',
  glasses:
    '<svg viewBox="0 0 72 30" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="17" cy="15" r="12"/><circle cx="55" cy="15" r="12"/><path d="M29 13c3-2 11-2 14 0" stroke-linecap="round"/><path d="M5 12 1 9M67 12l4-3" stroke-linecap="round"/></svg>',
};

/* Helpers ------------------------------------------------------------ */
function Icon({ html, name, className = "" }) {
  return html`<span
    class=${`ss-icon ${className}`.trim()}
    dangerouslySetInnerHTML=${{ __html: ICONS[name] }}
  />`;
}

/**
 * Selecting an item runs Autocomplete's internal `onInput` with
 * `isOpen: false` first, so both handlers below reopen the panel — this
 * demo has nowhere to navigate to, the dropdown *is* the demo.
 */
function selectQuery({ item, setQuery, setIsOpen, refresh }) {
  recentSearches.add(item.label);
  setQuery(item.label);
  setIsOpen(true);
  refresh();
}

/** Record sources (products, stores, articles) keep the panel on screen. */
function keepPanelOpen({ setIsOpen }) {
  setIsOpen(true);
}

/** Splits a suggestion around the typed query so it can be emphasised. */
function Highlight({ html, text, query }) {
  const index = text.toLowerCase().indexOf(query.toLowerCase());

  if (!query || index < 0) {
    return html`<span class="ss-suggestion-text">${text}</span>`;
  }

  return html`<span class="ss-suggestion-text"
    >${text.slice(0, index)}<mark class="ss-mark"
      >${text.slice(index, index + query.length)}</mark
    >${text.slice(index + query.length)}</span
  >`;
}

/** Every word of the query has to appear somewhere in the record. */
function matchesAllWords(haystack, words) {
  const lower = haystack.toLowerCase();
  return words.every((word) => lower.includes(word));
}

function countItems(state, sourceId) {
  const collection = state.collections.find(
    (entry) => entry.source.sourceId === sourceId
  );
  return collection ? collection.items.length : 0;
}

/* Recent searches (localStorage-backed) ------------------------------ */
const RECENTS_KEY = "specsavers-autocomplete:recents";
const SEED_RECENTS = ["varifocals", "hearing test near me", "ray-ban aviator"];

const recentSearches = {
  labels: readRecents(),
  persist() {
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(this.labels));
    } catch {
      // Private browsing / storage disabled — recents stay in memory only.
    }
  },
  add(label) {
    this.labels = [label, ...this.labels.filter((item) => item !== label)].slice(
      0,
      MAX_RECENTS
    );
    this.persist();
  },
  remove(label) {
    this.labels = this.labels.filter((item) => item !== label);
    this.persist();
  },
};

function readRecents() {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENTS_KEY));
    return Array.isArray(stored) ? stored : [...SEED_RECENTS];
  } catch {
    return [...SEED_RECENTS];
  }
}

/* Sources ------------------------------------------------------------ */
/**
 * Empty state: recent searches, popular queries, quick links.
 * `refresh` comes from `getSources` — item templates are only handed
 * `{ item, state, html, ... }`, so the removal button closes over it.
 */
function getEmptyStateSources(refresh) {
  const sources = [];

  if (CONFIG.showRecentSearches && recentSearches.labels.length > 0) {
    sources.push({
      sourceId: "recents",
      getItemInputValue: ({ item }) => item.label,
      getItems: () =>
        recentSearches.labels.map((label) => ({ label, objectID: label })),
      onSelect: selectQuery,
      templates: {
        header: ({ html }) =>
          html`<span class="ss-eyebrow">Recent searches</span>`,
        item: ({ item, html }) => html`
          <div class="ss-recent">
            ${Icon({ html, name: "clock", className: "ss-icon--muted" })}
            <span class="ss-recent-label">${item.label}</span>
            <button
              type="button"
              class="ss-recent-remove"
              aria-label=${`Remove ${item.label} from recent searches`}
              onClick=${(event) => {
                event.preventDefault();
                event.stopPropagation();
                recentSearches.remove(item.label);
                refresh();
              }}
            >
              ${Icon({ html, name: "cross" })}
            </button>
          </div>
        `,
      },
    });
  }

  sources.push(
    {
      sourceId: "popular",
      getItemInputValue: ({ item }) => item.label,
      getItems: () =>
        DATA.popular.map((label) => ({ label, objectID: label })),
      onSelect: selectQuery,
      templates: {
        header: ({ html }) =>
          html`<span class="ss-eyebrow">Popular right now</span>`,
        item: ({ item, html }) => html`
          <span class="ss-chip">
            ${Icon({ html, name: "trend", className: "ss-icon--brand" })}
            ${item.label}
          </span>
        `,
      },
    },
    {
      sourceId: "quicklinks",
      getItems: () =>
        DATA.quickLinks.map((link) => ({ ...link, objectID: link.label })),
      templates: {
        header: ({ html }) => html`<span class="ss-eyebrow">Quick links</span>`,
        item: ({ item, html }) => html`
          <div class="ss-quicklink">
            <span class="ss-quicklink-icon">
              ${Icon({ html, name: item.icon })}
            </span>
            <span class="ss-quicklink-label">${item.label}</span>
          </div>
        `,
      },
    }
  );

  return sources;
}

/** Results state: the five federated result sources. */
function getResultSources(query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);

  return [
    {
      sourceId: "suggestions",
      getItemInputValue: ({ item }) => item.label,
      getItems: () =>
        DATA.suggestions
          .filter(
            (suggestion) =>
              suggestion.includes(query.toLowerCase()) &&
              suggestion !== query.toLowerCase()
          )
          .slice(0, 6)
          .map((label) => ({ label, objectID: label })),
      onSelect: selectQuery,
      templates: {
        header: ({ html }) => html`<span class="ss-eyebrow">Suggestions</span>`,
        item: ({ item, html, state }) => html`
          <div class="ss-suggestion">
            ${Icon({ html, name: "search", className: "ss-icon--muted" })}
            ${Highlight({ html, text: item.label, query: state.query.trim() })}
            ${Icon({ html, name: "arrowUpRight", className: "ss-icon--faint" })}
          </div>
        `,
      },
    },
    {
      sourceId: "articles",
      getItems: () =>
        DATA.articles
          .filter((article) =>
            matchesAllWords(`${article.title} ${article.kw}`, words)
          )
          .slice(0, 3)
          .map((article) => ({ ...article, objectID: article.title })),
      onSelect: keepPanelOpen,
      templates: {
        header: ({ items, html }) =>
          html`<span class="ss-eyebrow">Articles · ${items.length}</span>`,
        item: ({ item, html }) => html`
          <div class="ss-article">
            ${Icon({ html, name: "doc", className: "ss-icon--muted" })}
            <span class="ss-article-title">${item.title}</span>
          </div>
        `,
      },
    },
    {
      sourceId: "frames",
      getItems: () =>
        DATA.frames
          .filter((frame) =>
            matchesAllWords(`${frame.brand} ${frame.model} ${frame.kw}`, words)
          )
          .slice(0, 6)
          .map((frame) => ({
            ...frame,
            objectID: `${frame.brand} ${frame.model}`,
            showBadge: CONFIG.showOfferBadges && Boolean(frame.offer),
          })),
      onSelect: keepPanelOpen,
      templates: {
        header: ({ items, html }) => html`
          <div class="ss-section-head">
            <span class="ss-section-title"
              >Glasses <span class="ss-count">· ${items.length}</span></span
            >
            <a
              class="ss-view-all"
              href="#"
              onClick=${(event) => event.preventDefault()}
              >View all →</a
            >
          </div>
        `,
        item: ({ item, html }) => html`
          <div class="ss-frame">
            <div class="ss-frame-media">
              ${Icon({ html, name: "glasses", className: "ss-icon--glasses" })}
              <span
                class="ss-frame-swatch"
                style=${{ background: item.color }}
              ></span>
              ${item.showBadge &&
              html`<span class="ss-frame-badge">${item.offer}</span>`}
            </div>
            <div class="ss-frame-body">
              <div class="ss-frame-brand">${item.brand}</div>
              <div class="ss-frame-model">${item.model}</div>
              <div class="ss-frame-price">${item.price}</div>
            </div>
          </div>
        `,
      },
    },
    {
      sourceId: "lenses",
      getItems: () =>
        DATA.lenses
          .filter((lens) => matchesAllWords(`${lens.name} ${lens.kw}`, words))
          .slice(0, 3)
          .map((lens) => ({ ...lens, objectID: lens.name })),
      onSelect: keepPanelOpen,
      templates: {
        header: ({ items, html }) =>
          html`<div class="ss-section-head">
            <span class="ss-section-title"
              >Contact lenses
              <span class="ss-count">· ${items.length}</span></span
            >
          </div>`,
        item: ({ item, html }) => html`
          <div class="ss-lens">
            <span class="ss-lens-icon">${Icon({ html, name: "lens" })}</span>
            <div class="ss-lens-body">
              <div class="ss-lens-name">${item.name}</div>
              <div class="ss-lens-pack">${item.pack}</div>
            </div>
            <div class="ss-lens-price">${item.price}</div>
          </div>
        `,
      },
    },
    {
      sourceId: "stores",
      getItems: () =>
        DATA.stores
          .filter((store) => matchesAllWords(`${store.name} ${store.kw}`, words))
          .slice(0, 3)
          .map((store) => ({ ...store, objectID: store.name })),
      onSelect: keepPanelOpen,
      templates: {
        header: ({ items, html }) =>
          html`<div class="ss-section-head">
            <span class="ss-section-title"
              >Stores <span class="ss-count">· ${items.length}</span></span
            >
          </div>`,
        item: ({ item, html }) => html`
          <div class="ss-store">
            ${Icon({ html, name: "pin", className: "ss-icon--brand" })}
            <div class="ss-store-body">
              <div class="ss-store-name">${item.name}</div>
              ${CONFIG.showStoreServices &&
              html`<div class="ss-store-services">
                ${item.services.map(
                  (service) =>
                    html`<span class="ss-service">${service}</span>`
                )}
              </div>`}
              <div class="ss-store-address">${item.address}</div>
            </div>
          </div>
        `,
      },
    },
  ];
}

/* Instance ----------------------------------------------------------- */
const initialQuery = new URLSearchParams(window.location.search).get("q") ?? "";

const search = autocomplete({
  container: "#autocomplete",
  panelContainer: "#autocomplete-panel",
  placeholder: "Search glasses, lenses, stores…",
  openOnFocus: true,
  detachedMediaQuery: "none",
  initialState: { query: initialQuery },

  getSources({ query, refresh }) {
    const trimmed = query.trim();
    return trimmed ? getResultSources(trimmed) : getEmptyStateSources(refresh);
  },

  // Two-column panel: suggestions rail on the left, rich results on the right.
  render({ elements, state, html, render }, root) {
    const query = state.query.trim();
    const {
      recents,
      popular,
      quicklinks,
      suggestions,
      articles,
      frames,
      lenses,
      stores,
    } = elements;

    if (!query) {
      render(
        html`<div class="ss-panel-body">
          <div class="ss-panel-grid">
            <div class="ss-rail">${recents}</div>
            <div class="ss-rich">${popular}${quicklinks}</div>
          </div>
        </div>`,
        root
      );
      return;
    }

    const total =
      countItems(state, "frames") +
      countItems(state, "lenses") +
      countItems(state, "stores") +
      countItems(state, "articles");

    render(
      html`<div class="ss-panel-body">
        <div class="ss-panel-grid">
          <div class="ss-rail ss-rail--results">${suggestions}${articles}</div>
          <div class="ss-rich ss-rich--results">${frames}${lenses}${stores}</div>
        </div>
        ${total > 0 &&
        html`<a
          class="ss-see-all"
          href="#"
          onClick=${(event) => event.preventDefault()}
          >See all ${total} results for "${query}" →</a
        >`}
      </div>`,
      root
    );
  },

  renderNoResults({ state, html, render }, root) {
    render(
      html`<div class="ss-no-results">
        <div class="ss-no-results-title">
          No results for "${state.query.trim()}"
        </div>
        <div class="ss-no-results-hint">
          Try a store, a brand, or a service like "eye test".
        </div>
      </div>`,
      root
    );
  },
});

// ?q=london opens the panel on load — handy for screenshots and demo links.
if (initialQuery) {
  search.setIsOpen(true);
  search.refresh();
}
