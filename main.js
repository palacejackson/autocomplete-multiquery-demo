import { autocomplete, getAlgoliaResults } from "@algolia/autocomplete-js";
import { createQuerySuggestionsPlugin } from "@algolia/autocomplete-plugin-query-suggestions";
import "@algolia/autocomplete-theme-classic";
import { liteClient as algoliasearch } from "algoliasearch/lite";

const appId = "Z519VQ03VH";
const searchApiKey = "f83dbfd0e04e7b74e598c39c38e4303e";
const indexName =
  "production_emea_libertyltd_demandware_net__liberty__products__default";
const querySuggestionsIndexName =
  "production_emea_libertyltd_demandware_net__liberty__products__default_query_suggestions";

const searchClient = algoliasearch(appId, searchApiKey);

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
              return html`<span class="aa-SourceHeaderTitle"
                >Suggestions</span
              >`;
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
  plugins: querySuggestionsPlugin ? [querySuggestionsPlugin] : [],

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
              return html`<span class="aa-SourceHeaderTitle"
                >Suggested Products</span
              >`;
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
                results[0].userData?.find((data) => data.brands)?.brands ?? []
              );
            },
          });
        },
        templates: {
          header({ html }) {
            return html`<span class="aa-SourceHeaderTitle"
              >Featured brands</span
            >`;
          },
          item({ item, html }) {
            return html`<a class="aa-ItemLink" href=${item.url}
              >${item.name}</a
            >`;
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
                results[0].userData?.find((data) => data.products)?.products ??
                []
              );
            },
          });
        },
        templates: {
          header({ html }) {
            return html`<span class="aa-SourceHeaderTitle"
              >Featured products</span
            >`;
          },
          item({ item, html }) {
            return html`<a class="aa-ItemLink" href=${item.url}
              >${item.name}</a
            >`;
          },
        },
      },
    ];
  },
});
