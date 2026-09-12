"use client";

import { useAppStore } from "@/store/useAppStore";
import { Skeleton } from "@/components/ui/skeleton";
import { IndicatorCard } from "./IndicatorCard";
import { formatNumber, formatCurrency, formatDecimal } from "@/lib/utils";

export function IndicatorGrid() {
  const country = useAppStore((s) => s.country);
  const selectedLocation = useAppStore((s) => s.selectedLocation);
  const loading = useAppStore((s) => s.loading);

  if (loading) {
    return (
      <div  data-testid="indicator-loading-state" className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (!country) return null;

  const selectedRegion =
    selectedLocation?.level === "region"
      ? country.regions[selectedLocation.id]
      : null;

  const region =
    selectedRegion
      ? country.regions[selectedRegion.id]
      : null;

  const scope = region ?? country;

  const isCountrySelected = selectedLocation?.level === "country";
  const locationName = isCountrySelected ? country.name : (region?.name ?? "");

  const getLabel = (baseLabel: string) => {
    if (baseLabel === "GDP") return baseLabel;
    
    if (!selectedRegion?.id) {
      return `Total ${baseLabel} of ${country.name}`;
    }
    
    return `${baseLabel} of ${locationName}`;
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <IndicatorCard
        label={getLabel("Population")}
        value={formatNumber(scope.population)}
        testId="indicator-population"
      />

      <IndicatorCard
        label={`Total GDP of ${country.name}`}
        value={formatCurrency(scope.gdp)}
        testId="indicator-gdp"
      />

      <IndicatorCard
        label={getLabel("GDP per capita")}
        value={formatCurrency(scope.gdpPerCapita)}
        testId="indicator-gdp-per-capita"
      />

      <IndicatorCard
        label={getLabel("Life expectancy")}
        value={
          scope.lifeExpectancy != null
            ? `${formatDecimal(scope.lifeExpectancy)} years`
            : "N/A"
        }
        testId="indicator-life-expectancy"
      />
    </div>
  );
}