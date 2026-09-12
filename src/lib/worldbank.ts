import type { CountryData, Region } from "@/types/regions";
import { fetchCountryBoundaries } from "@/lib/boundaries";
import { estimateRegionalIndicators } from "./regionalEstimates";

export const WORLD_BANK_API_BASE =
  process.env.WORLD_BANK_API_BASE ??
  "https://api.worldbank.org/v2";

const INDICATORS = [
  {
    code: "SP.POP.TOTL",
    key: "population",
  },
  {
    code: "NY.GDP.MKTP.CD",
    key: "gdp",
  },
  {
    code: "NY.GDP.PCAP.CD",
    key: "gdpPerCapita",
  },
  {
    code: "SP.DYN.LE00.IN",
    key: "lifeExpectancy",
  },
] as const;

type IndicatorKey = (typeof INDICATORS)[number]["key"];

interface WorldBankRecord {
  value: number | null;
  date: string;
}

interface IndicatorResult {
  value: number | null;
  year: number | null;
}

interface WorldBankCountry {
  name: string;
  latitude: string;
  longitude: string;
}

/**
 * Fetch country-level indicators from World Bank.
 */
export async function fetchCountryIndicators(
  iso: string
): Promise<Record<IndicatorKey, IndicatorResult>> {
  const entries = await Promise.all(
    INDICATORS.map(async ({ code, key }) => {
      try {
        const url =
          `${WORLD_BANK_API_BASE}/country/${iso}/indicator/${code}` +
          `?format=json&per_page=20`;

        const res = await fetch(url, {
          next: {
            revalidate: 86400,
          },
        });

        if (!res.ok) {
          return {
            key,
            value: null,
            year: null,
          };
        }

        const json = await res.json();

        const records: WorldBankRecord[] = Array.isArray(json?.[1])
          ? json[1]
          : [];

        // Find the most recent non-null observation.
        const record = records.find(
          (item) => item.value !== null
        );

        return {
          key,
          value: record?.value ?? null,
          year: record?.date ? Number(record.date) : null,
        };
      } catch (error) {
        console.error(
          `Failed to fetch ${code} for ${iso}`,
          error
        );

        return {
          key,
          value: null,
          year: null,
        };
      }
    })
  );

  return Object.fromEntries(
    entries.map(({ key, value, year }) => [
      key,
      {
        value,
        year,
      },
    ])
  ) as Record<IndicatorKey, IndicatorResult>;
}

/**
 * Fetch basic country information.
 */
export async function fetchCountryInfo(
  iso: string
): Promise<{
  name: string;
  latitude: number;
  longitude: number;
}> {
  try {
    const url =
      `${WORLD_BANK_API_BASE}/country/${iso}` +
      `?format=json&per_page=1`;

    const res = await fetch(url);

    if (!res.ok) {
      return {
        name: iso,
        latitude: 0,
        longitude: 0,
      };
    }

    const json = (await res.json()) as [
      unknown,
      WorldBankCountry[]
    ];

    const country = Array.isArray(json[1])
      ? json[1][0]
      : undefined;

    if (!country) {
      return {
        name: iso,
        latitude: 0,
        longitude: 0,
      };
    }

    return {
      name: country.name,
      latitude: parseFloat(country.latitude) || 0,
      longitude: parseFloat(country.longitude) || 0,
    };
  } catch (error) {
    console.error(
      `Error fetching country info for ${iso}:`,
      error
    );

    return {
      name: iso,
      latitude: 0,
      longitude: 0,
    };
  }
}

/**
 * A lightweight definition extracted from the ADM1 GeoJSON.
 *
 * This is intentionally NOT a Region yet.
 * The regional estimation step will add population,
 * GDP, GDP per capita, life expectancy, etc.
 */
interface RegionDefinition {
  id: string;
  name: string;
}

/**
 * Convert boundary features into application region definitions.
 */
function buildRegionDefinitions(
  boundaries: GeoJSON.FeatureCollection
): RegionDefinition[] {
  return boundaries.features
    .map((feature): RegionDefinition | null => {
      const properties = feature.properties ?? {};

      const regionId =
        properties.region_id ??
        properties.shapeISO ??
        properties.shapeID ??
        properties.gid;

      const regionName =
        properties.region_name ??
        properties.shapeName ??
        properties.name;

      if (!regionId || !regionName) {
        return null;
      }

      return {
        id: String(regionId),
        name: String(regionName),
      };
    })
    .filter(
      (region): region is RegionDefinition =>
        region !== null
    );
}

/**
 * Fetch complete country data.
 *
 * Flow:
 *
 * geoBoundaries
 *      +
 * World Bank country indicators
 *      ↓
 * regional estimates
 *      ↓
 * CountryData
 */
export async function fetchCompleteCountryData(
  iso: string
): Promise<CountryData | null> {
  try {
    const normalizedIso = iso.trim().toUpperCase();

    const [
      boundaries,
      countryInfo,
      indicators,
    ] = await Promise.all([
      fetchCountryBoundaries(normalizedIso),
      fetchCountryInfo(normalizedIso),
      fetchCountryIndicators(normalizedIso),
    ]);

    console.log("Country:", normalizedIso);

    console.log(
      "Boundary features:",
      boundaries.features.length
    );

    console.log(
      "Boundary names:",
      boundaries.features.map(
        (feature) =>
          feature.properties?.region_name ??
          feature.properties?.shapeName ??
          feature.properties?.name
      )
    );

    if (
      !boundaries.features ||
      boundaries.features.length === 0
    ) {
      console.warn(
        `No ADM1 boundaries found for ${normalizedIso}`
      );

      return null;
    }

    /**
     * Step 1:
     * Extract ADM1 regions from GeoJSON.
     */
    const regionDefinitions =
      buildRegionDefinitions(boundaries);

    console.log(
      `Created ${regionDefinitions.length} region definitions`
    );

    /**
     * Step 2:
     * Generate approximate regional indicators.
     *
     * estimateRegionalIndicators should return:
     *
     * Record<string, Region>
     */
    const regions: Record<string, Region> =
      estimateRegionalIndicators(
        regionDefinitions,
        {
          population:
            indicators.population.value,

          gdp:
            indicators.gdp.value,

          gdpPerCapita:
            indicators.gdpPerCapita.value,

          lifeExpectancy:
            indicators.lifeExpectancy.value,

          year:
            indicators.population.year ??
            indicators.gdp.year ??
            indicators.gdpPerCapita.year ??
            indicators.lifeExpectancy.year ??
            undefined,
        }
      );

    /**
     * Pick a common year for the country-level data.
     */
    const countryYear =
      indicators.population.year ??
      indicators.gdp.year ??
      indicators.gdpPerCapita.year ??
      indicators.lifeExpectancy.year ??
      undefined;

    return {
      iso: normalizedIso,

      name: countryInfo.name,

      viewport: {
        latitude: countryInfo.latitude,
        longitude: countryInfo.longitude,
        zoom: 4,
      },

      boundaries,

      population:
        indicators.population.value,

      gdp:
        indicators.gdp.value,

      gdpPerCapita:
        indicators.gdpPerCapita.value,

      lifeExpectancy:
        indicators.lifeExpectancy.value,

      year: countryYear,

      regions,
    };
  } catch (error) {
    console.error(
      `Error fetching complete country data for ${iso}:`,
      error
    );

    return null;
  }
}