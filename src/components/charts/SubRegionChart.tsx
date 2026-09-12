"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAppStore } from "@/store/useAppStore";

function formatNumber(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "N/A";
  }

  return value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

function formatCurrency(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "N/A";
  }

  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function formatDecimal(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "N/A";
  }

  return value.toFixed(1);
}

export function SubRegionChart() {
  const country = useAppStore((s) => s.country);
  const selectedLocation = useAppStore(
    (s) => s.selectedLocation
  );

  /*
   * Nothing selected.
   */
  if (!country || !selectedLocation) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-card text-sm text-muted-foreground">
        Select a region to see regional statistics
      </div>
    );
  }

  /*
   * Country selected.
   *
   * If the user selects the country itself, visualize
   * country-level World Bank data.
   */
  const isCountry =
    selectedLocation.level === "country";

  /*
   * Resolve the selected region from Zustand.
   */
  const region = !isCountry
    ? country.regions[selectedLocation.id]
    : null;

  /*
   * It is possible for a selected map feature to exist
   * but not have a matching entry in country.regions.
   */
  if (!isCountry && !region) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-card text-sm text-muted-foreground">
        No data available for {selectedLocation.name}
      </div>
    );
  }

  /*
   * Determine which values should be displayed.
   *
   * Country:
   *   country.population
   *   country.gdp
   *   country.gdpPerCapita
   *   country.lifeExpectancy
   *
   * Region:
   *   region.population
   *   region.gdp
   *   region.gdpPerCapita
   *   region.lifeExpectancy
   */
  const population = isCountry
    ? country.population
    : region?.population;

  const gdp = isCountry
    ? country.gdp
    : region?.gdp;

  const gdpPerCapita = isCountry
    ? country.gdpPerCapita
    : region?.gdpPerCapita;

  const lifeExpectancy = isCountry
    ? country.lifeExpectancy
    : region?.lifeExpectancy;

  const locationName = isCountry
    ? country.name
    : region?.name ?? selectedLocation.name;

  /*
   * Chart data for population + GDP.
   *
   * GDP is normalized to billions so that both values
   * remain visually manageable.
   */
  const economicData = [
    {
      name: "Population",
      value:
        population != null
          ? population
          : 0,
      displayValue: formatNumber(population),
    },
    {
      name: "GDP ($B)",
      value:
        gdp != null
          ? gdp / 1_000_000_000
          : 0,
      displayValue:
        gdp != null
          ? `$${(gdp / 1_000_000_000).toFixed(1)}B`
          : "N/A",
    },
  ];

  /*
   * Per-capita + life expectancy chart.
   *
   * These metrics have completely different units,
   * so they are displayed as separate bars.
   */
  const developmentData = [
    {
      name: "GDP / capita",
      value:
        gdpPerCapita != null
          ? gdpPerCapita
          : 0,
      displayValue: formatCurrency(gdpPerCapita),
    },
    {
      name: "Life expectancy",
      value:
        lifeExpectancy != null
          ? lifeExpectancy
          : 0,
      displayValue:
        lifeExpectancy != null
          ? `${formatDecimal(lifeExpectancy)} years`
          : "N/A",
    },
  ];

  /*
   * Data availability.
   */
  const hasPopulation =
    population != null;

  const hasGDP =
    gdp != null;

  const hasGDPPerCapita =
    gdpPerCapita != null;

  const hasLifeExpectancy =
    lifeExpectancy != null;

  const hasAnyData =
    hasPopulation ||
    hasGDP ||
    hasGDPPerCapita ||
    hasLifeExpectancy;

  if (!hasAnyData) {
    return (
      <div
        data-testid="subregion-chart"
        className="flex h-64 items-center justify-center rounded-lg border bg-card text-sm text-muted-foreground"
      >
        No World Bank indicators available for{" "}
        {locationName}
      </div>
    );
  }

  return (
    <div
      data-testid="subregion-chart"
      className="flex space-x-4"
    >

      {/* Population + GDP */}
      <div className="rounded-lg border bg-card p-4 w-full">
        <h4 data-testid="chart-region-label" className="mb-3 text-sm font-medium">
          Population & GDP ({locationName})
        </h4>

        <div className="h-56">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={economicData}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.3}
              />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
              />

              <YAxis
                tick={{ fontSize: 11 }}
              />

              <Tooltip
                formatter={(value: any, _name: any, item: any) => [
                  item?.payload?.displayValue ??
                    formatNumber(value),
                  "",
                ]}
              />

              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
              >
                <Cell fill="#7F77DD" />
                <Cell fill="#5B8DEF" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GDP per capita + life expectancy */}
      <div className="rounded-lg border bg-card p-4 w-full">
        <h4 data-testid="development-chart-label" className="mb-3 text-sm font-medium">
          Development indicators ({locationName})
        </h4>

        <div className="h-56">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={developmentData}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.3}
              />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
              />

              <YAxis
                tick={{ fontSize: 11 }}
              />

              <Tooltip
                formatter={(value: any, _name: any, item: any) => [
                  item?.payload?.displayValue ??
                    formatNumber(value),
                  "",
                ]}
              />

              <Bar
                dataKey="value"
                fill="#2FA36B"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}