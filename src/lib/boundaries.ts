import type { CountryData } from "@/types/regions";

const EMPTY_FEATURE_COLLECTION: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export async function fetchCountryBoundaries(
  iso: string
): Promise<CountryData["boundaries"]> {
  try {
    const normalizedIso = iso
      .trim()
      .toUpperCase();

    const response = await fetch(
      `/api/boundaries/${normalizedIso}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch boundaries for ${normalizedIso}:`,
        response.status,
        response.statusText
      );

      return EMPTY_FEATURE_COLLECTION;
    }

    const data =
      (await response.json()) as GeoJSON.FeatureCollection;

    if (
      data.type !== "FeatureCollection" ||
      !Array.isArray(data.features)
    ) {
      console.error(
        `Invalid boundary data for ${normalizedIso}`
      );

      return EMPTY_FEATURE_COLLECTION;
    }

    return data;
  } catch (error) {
    console.error(
      `Error fetching boundaries for ${iso}:`,
      error
    );

    return EMPTY_FEATURE_COLLECTION;
  }
}