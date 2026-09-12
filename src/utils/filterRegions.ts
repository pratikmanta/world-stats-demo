import type { Region } from "@/types/regions";
import type { RegionTableFilter } from "@/types/regionTable";

export function filterRegions(
  regions: Region[],
  filter: RegionTableFilter
): Region[] {
  // Return all regions if filter is empty
  if (!filter || Object.keys(filter).length === 0) {
    return [...regions];
  }

  return regions.filter((region) => {
    // Search filter
    if (filter.search) {
      const trimmedSearch = filter.search.trim();
      if (trimmedSearch.length > 0) {
        const regionName = region.name.toLowerCase();
        const searchTerm = trimmedSearch.toLowerCase();
        if (!regionName.includes(searchTerm)) {
          return false;
        }
      }
    }

    // Population filters
    if (filter.populationMin != null) {
      if (region.population == null || region.population < filter.populationMin) {
        return false;
      }
    }

    if (filter.populationMax != null) {
      if (region.population == null || region.population > filter.populationMax) {
        return false;
      }
    }

    // GDP filters
    if (filter.gdpMin != null) {
      if (region.gdp == null || region.gdp < filter.gdpMin) {
        return false;
      }
    }

    if (filter.gdpMax != null) {
      if (region.gdp == null || region.gdp > filter.gdpMax) {
        return false;
      }
    }

    // GDP per capita filters
    if (filter.gdpPerCapitaMin != null) {
      if (region.gdpPerCapita == null || region.gdpPerCapita < filter.gdpPerCapitaMin) {
        return false;
      }
    }

    if (filter.gdpPerCapitaMax != null) {
      if (region.gdpPerCapita == null || region.gdpPerCapita > filter.gdpPerCapitaMax) {
        return false;
      }
    }

    // Life expectancy filters
    if (filter.lifeExpectancyMin != null) {
      if (region.lifeExpectancy == null || region.lifeExpectancy < filter.lifeExpectancyMin) {
        return false;
      }
    }

    if (filter.lifeExpectancyMax != null) {
      if (region.lifeExpectancy == null || region.lifeExpectancy > filter.lifeExpectancyMax) {
        return false;
      }
    }

    return true;
  });
}
