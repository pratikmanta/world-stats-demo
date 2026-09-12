// types/regions.ts

export type RegionId = string;


export interface Region {
  id: RegionId;
  name: string;

  population: number | null;
  gdp: number | null;
  gdpPerCapita: number | null;
  lifeExpectancy: number | null;

  year?: number;

  subregions: Region[];
}

export interface CountryData {
  iso: string;
  name: string;

  viewport: {
    latitude: number;
    longitude: number;
    zoom: number;
  };

  boundaries: GeoJSON.FeatureCollection;

  population: number | null;
  gdp: number | null;
  gdpPerCapita: number | null;
  lifeExpectancy: number | null;

  year?: number;

  regions: Record<RegionId, Region>;
}