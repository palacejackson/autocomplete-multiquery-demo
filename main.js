import { autocomplete, getAlgoliaResults } from "@algolia/autocomplete-js";
import { createQuerySuggestionsPlugin } from "@algolia/autocomplete-plugin-query-suggestions";
import "@algolia/autocomplete-theme-classic";
import { liteClient as algoliasearch } from "algoliasearch/lite";

const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
const searchApiKey = import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY;
const indexName = import.meta.env.VITE_ALGOLIA_INDEX_NAME;
const querySuggestionsIndexName =
  import.meta.env.VITE_ALGOLIA_QUERY_SUGGESTIONS_INDEX_NAME;

const searchClient = algoliasearch(appId, searchApiKey)


const querySuggestionsPlugin = searchClient
  ? createQuerySuggestionsPlugin({
    searchClient,
    indexName: querySuggestionsIndexName,
    getSearchParams() {
      return { hitsPerPage: 5 };
    },
    transformSource({ source }) {
      return {
        ...source,
        sourceId: "query-suggestions",
        templates: {
          ...source.templates,
          header({ html }) {
            return html`<span class="aa-SourceHeaderTitle">Suggestions</span>`;
          },
          item({ item, html }) {
            return html`<span>${item.query}</span>`;
          },
        },
      };
    },
  })
  : null;

autocomplete({
  container: "#autocomplete",
  placeholder: "Search for products",
  openOnFocus: true,
  detachedMediaQuery: "none",
  plugins: [querySuggestionsPlugin],

  getSources({ query }) {

    if (query) {
      return [
        {
          sourceId: "products",
          getItems() {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName,
                  query,
                  params: {
                    hitsPerPage: 5,
                  },
                },
              ],
            });
          },
          templates: {
            header({ html }) {
              return html`<span class="aa-SourceHeaderTitle">Suggested Products</span>`;
            },
            item({ item, html }) {
              return html`<span>${item.name}</span>`;
            },
          },
        },
      ];
    }

    return [
      {
        sourceId: "featured-brands",
        getItems() {
          return getAlgoliaResults({
            searchClient,
            queries: [
              {
                indexName,
                query: "",
                params: {
                  ruleContexts: ["featuredBrands"],
                  hitsPerPage: 1,
                },
              },
            ],
            transformResponse({ results }) {
              return (
                results[0].userData
                  ?.find((data) => data.brands)
                  ?.brands ?? []
              );
            },
          });
        },
        templates: {
          header({ html }) {
            return html`<span class="aa-SourceHeaderTitle">Featured brands</span>`;
          },
          item({ item, html }) {
            return html`<a class="aa-ItemLink" href=${item.url}>${item.name}</a>`;
          },
        },
      },
      {
        sourceId: "featured-products",
        getItems() {
          return getAlgoliaResults({
            searchClient,
            queries: [
              {
                indexName,
                query: "",
                params: {
                  ruleContexts: ["featuredProducts"],
                  hitsPerPage: 1,
                },
              },
            ],
            transformResponse({ results }) {
              return (
                results[0].userData
                  ?.find((data) => data.products)
                  ?.products ?? []
              );
            },
          });
        },
        templates: {
          header({ html }) {
            return html`<span class="aa-SourceHeaderTitle">Featured products</span>`;
          },
          item({ item, html }) {
            return html`<a class="aa-ItemLink" href=${item.url}>${item.name}</a>`;
          },
        },
      },
    ];
  },
});
