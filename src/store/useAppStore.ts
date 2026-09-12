import { create } from "zustand";
import type { CountryData } from "@/types/regions";
import type { RegionTableFilter } from "@/types/regionTable";
import { fetchCompleteCountryData } from "@/lib/worldbank";
import { resolveCountryIso } from "@/lib/utils";

interface SelectedLocation {
  id: string;
  name: string;
  level: "country" | "region" | "subregion";
  countryIso: string;
}

interface AppState {
  country: CountryData | null;
  selectedLocation: SelectedLocation | null;
  loading: boolean;
  regionTableFilter: RegionTableFilter;

  setCountry: (country: CountryData) => void;

  setSelectedLocation: (
    selectedLocation: SelectedLocation | null
  ) => void;

  setLoading: (loading: boolean) => void;

  loadCountry: (countryOrIso: string) => Promise<void>;

  setRegionTableFilter: (filter: RegionTableFilter) => void;

  clearRegionTableFilter: () => void;
}


// The single source of truth. Map clicks and copilot actions both call the
// same setters, so there is exactly one way to change what is on screen.
export const useAppStore = create<AppState>((set) => ({
  // Start with null - real data will be loaded via API
  country: null,
  selectedLocation: null,
  loading: false,
  regionTableFilter: {},
  setCountry: (country) => set({ country, selectedLocation: null }),
  setSelectedLocation: (selectedLocation) => set({ selectedLocation }),
  setLoading: (loading) => set({ loading }),
  setRegionTableFilter: (filter) => set({ regionTableFilter: filter }),
  clearRegionTableFilter: () => set({ regionTableFilter: {} }),

  // Load country data directly from World Bank API
  loadCountry: async (countryOrIso: string) => {
  set({ loading: true });

  try {

    const iso = resolveCountryIso(countryOrIso) as string;

    console.log(
      `Loading country: ${iso}`
    );

    const country = await fetchCompleteCountryData(iso);

    if (!country) {
      throw new Error(
        `Failed to load country data for ${countryOrIso}`
      );
    }

    set({
      country,
      selectedLocation: null,
      loading: false,
    });
  } catch (error) {
    console.error("Error loading country:", error);

    set({ loading: false });

    throw error;
  }
},
}));
