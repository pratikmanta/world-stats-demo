"use client";

import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { useAppStore } from "@/store/useAppStore";

const waitForCountryRegions = (
  countryName: string,
  timeout = 10000
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const state = useAppStore.getState();
      const currentCountry = state.country;

      const isCorrectCountry =
        currentCountry?.name?.toLowerCase() ===
        countryName.toLowerCase();

      const hasRegions =
        currentCountry?.regions &&
        Object.keys(currentCountry.regions).length > 0;

      if (isCorrectCountry && hasRegions) {
        resolve();
        return;
      }

      if (Date.now() - startTime >= timeout) {
        reject(
          new Error(
            `Timed out waiting for regions to load for ${countryName}`
          )
        );
        return;
      }

      setTimeout(check, 100);
    };

    check();
  });
};

export function CopilotActions() {
  const loadCountry = useAppStore((s) => s.loadCountry);
  const setSelectedLocation = useAppStore(
    (s) => s.setSelectedLocation
  );
  const setRegionTableFilter = useAppStore(
    (s) => s.setRegionTableFilter
  );
  const clearRegionTableFilter = useAppStore(
    (s) => s.clearRegionTableFilter
  );

  useFrontendTool(
    {
      name: "show_region_info",

       description: `
Select and display a specific geographic region in the World Bank Data Copilot.

Use this tool whenever the user asks to:

- show a state
- show a province
- show a region
- show a city
- show population for a specific state, province, region, or city
- show income for a specific state, province, region, or city
- show GDP for a specific state, province, region, or city
- show GDP per capita for a specific state, province, region, or city
- show information about a specific state, province, region, or city
- navigate the map to a specific state, province, region, or city

IMPORTANT:
- This tool is ONLY for a specific region or city.
- Do NOT use this tool when the user asks to show or explore an entire country.
- For country-only requests such as "Show me Spain" or "Show India", use filterRegionTable with the country parameter.
- When a state/province/region is explicitly mentioned, select that region using this tool.
- When a city is mentioned, resolve it to its containing first-level administrative region.

Examples:

- "Show me Bihar"
- "Show me Delhi"
- "Show Maharashtra"
- "Show me information about California"
- "Show Las Vegas"
- "Show me information about Las Vegas"
- "Show population of New York"

City examples:

- "Show Las Vegas"
  -> countryIso: US
  -> regionName: Nevada
  -> cityName: Las Vegas

- "Show Delhi"
  -> countryIso: IN
  -> regionName: Delhi
  -> cityName: Delhi

The country must be an ISO 3166-1 alpha-2 country code.

The regionName must be a state, province, or first-level administrative region.
`,
      parameters: z.object({
        countryIso: z
          .string()
          .length(2)
          .describe(
            "ISO 3166-1 alpha-2 country code, e.g. IN for India or US for United States"
          ),

        regionName: z
          .string()
          .describe(
            "State, province, or first-level administrative region to select"
          ),

        cityName: z
          .string()
          .optional()
          .describe(
            "Optional city mentioned by the user, e.g. Delhi or Las Vegas"
          ),
      }),

      handler: async ({
        countryIso,
        regionName,
        cityName,
      }) => {
        const iso = countryIso.trim().toUpperCase();

        /*
         * 1. Make sure the requested country is loaded.
         */
        const currentCountry =
          useAppStore.getState().country;

        if (
          !currentCountry ||
          currentCountry.iso !== iso
        ) {
          await loadCountry(iso);
        }

        /*
         * 2. Get the freshly loaded country.
         */
        const country =
          useAppStore.getState().country;

        if (!country) {
          throw new Error(
            `Unable to load country ${iso}`
          );
        }

        /*
         * 3. Normalize names so that:
         *
         * "New York"
         * "new york"
         * "NEW YORK"
         *
         * can all match.
         */
        const normalize = (value: string) =>
          value
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/[.'’]/g, "")
            .replace(/\s+/g, " ")
            .trim();

        const requestedRegion =
          normalize(regionName);

        /*
         * 4. Try exact region match first.
         */
        let regionEntry =
          Object.entries(country.regions).find(
            ([, region]) =>
              normalize(region.name) ===
              requestedRegion
          );

        /*
         * 5. Try partial matching.
         *
         * Example:
         *
         * "Delhi"
         *
         * can match:
         *
         * "National Capital Territory of Delhi"
         */
        if (!regionEntry) {
          regionEntry =
            Object.entries(country.regions).find(
              ([, region]) => {
                const name =
                  normalize(region.name);

                return (
                  name.includes(requestedRegion) ||
                  requestedRegion.includes(name)
                );
              }
            );
        }

        /*
         * 6. Region could not be found.
         */
        if (!regionEntry) {
          const availableRegions =
            Object.values(country.regions)
              .map((region) => region.name)
              .join(", ");

          throw new Error(
            `Could not find "${regionName}" in ${country.name}. ` +
              `Available regions include: ${availableRegions}`
          );
        }

        /*
         * 7. Extract region ID and region object.
         */
        const [regionId, region] =
          regionEntry;

        /*
         * 8. THIS is the important part.
         *
         * Your Zustand store expects:
         *
         * SelectedLocation {
         *   id
         *   name
         *   level
         *   countryIso
         * }
         */
        setSelectedLocation({
          id: regionId,
          name: region.name,
          level: "region",
          countryIso: iso,
        });

        /*
         * 9. Return the information to Copilot.
         */
        return {
          status: "success",

          country: country.name,

          countryIso: iso,

          regionId,

          region: region.name,

          city: cityName ?? null,

          population:
            region.population ?? null,

          gdp:
            region.gdp ?? null,

          gdpPerCapita:
            region.gdpPerCapita ?? null,

          lifeExpectancy:
            region.lifeExpectancy ?? null,

          message: cityName
            ? `Selected ${region.name} in ${country.name} for ${cityName}`
            : `Selected ${region.name} in ${country.name}`,
        };
      },
    },

    [loadCountry, setSelectedLocation]
  );

  useFrontendTool(
  {
    name: "filterRegionTable",

    description: `
Filter regional data and optionally select a country before applying the filter.

Use this tool whenever the user asks to:
- filter regions by population
- filter regions by GDP
- filter regions by GDP per capita
- filter regions by life expectancy
- search for a region by name
- show regions within a specific country
- filter regions within a specific country

If the user explicitly mentions a country, use the country parameter.
Do NOT put the country name into the search parameter.

The country parameter selects the active country using the application's
existing country-selection mechanism.

Search matches region names case-insensitively.

Numeric filters support minimum and maximum values.

Multiple numeric filters are combined with AND semantics.

Convert natural-language numbers to their absolute numeric values.
For example:
- "4 million" = 4000000
- "20 thousand" = 20000
- "5 million" = 5000000

Examples:
- "Show regions with population above 5 million"
- "Show regions with GDP per capita above 20,000"
- "Show regions with life expectancy above 70"
- "Show regions with population between 5 million and 10 million"
- "Show Karnataka"
- "Show regions in Japan with GDP per capita above 4 million"
- "Show regions in India with population above 5 million"
`,

    parameters: z.object({
      country: z
        .string()
        .optional()
        .describe(
          "Country to make active before applying regional filters. Use this when the user explicitly mentions a country."
        ),

      search: z
        .string()
        .optional()
        .describe(
          "Search for regions by name using a case-insensitive partial match. Do not use this for country names."
        ),

      populationMin: z
        .number()
        .optional()
        .describe("Minimum population threshold"),

      populationMax: z
        .number()
        .optional()
        .describe("Maximum population threshold"),

      gdpMin: z
        .number()
        .optional()
        .describe("Minimum GDP threshold"),

      gdpMax: z
        .number()
        .optional()
        .describe("Maximum GDP threshold"),

      gdpPerCapitaMin: z
        .number()
        .optional()
        .describe(
          "Minimum GDP per capita threshold. '4 million' means 4000000."
        ),

      gdpPerCapitaMax: z
        .number()
        .optional()
        .describe(
          "Maximum GDP per capita threshold."
        ),

      lifeExpectancyMin: z
        .number()
        .optional()
        .describe("Minimum life expectancy threshold"),

      lifeExpectancyMax: z
        .number()
        .optional()
        .describe("Maximum life expectancy threshold"),
    }),

    handler: async ({
  country,
  ...filter
}) => {
  /*
   * If a country is provided, make sure that country is loaded
   * before applying the regional filter.
   */
  if (country) {
    const requestedCountry = country;

    const currentCountry = useAppStore.getState().country;

    /*
     * Only load the country if it isn't already the active country.
     */
    if (
      !currentCountry ||
      currentCountry.name.toLowerCase() !==
        requestedCountry.toLowerCase()
    ) {
      await loadCountry(requestedCountry);
    }

    /*
     * loadCountry may update the country first and populate the
     * region data asynchronously afterwards.
     *
     * Wait until the requested country's regions are actually
     * available before applying the filter.
     */
    await waitForCountryRegions(requestedCountry);
  }

  /*
   * Apply the regional filter only after the correct country's
   * regions are available.
   */
  setRegionTableFilter(filter);

  return {
    status: "success",
    message: country
      ? `Selected ${country} and applied region filter`
      : "Region table filter applied",
    country: country ?? null,
    filter,
  };
},
  },

  [
    setRegionTableFilter,
    loadCountry,
  ]
);

  useFrontendTool(
    {
      name: "clearRegionTableFilter",

      description: `
Clear all filters currently applied to the RegionTable in the World Bank Data Copilot.

Use this tool whenever the user asks to:
- clear the filters
- show all regions again
- reset the region table
- remove all filters
- show unfiltered results
`,

      parameters: z.object({}),

      handler: async () => {
        clearRegionTableFilter();

        return {
          status: "success",
          message: "Region table filters cleared",
        };
      },
    },

    [clearRegionTableFilter]
  );

  return null;
}