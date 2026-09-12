"use client";

import { useAppStore } from "@/store/useAppStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  DataTableColumn,
} from "@/components/ui/data-table";
import { filterRegions } from "@/utils/filterRegions";
import {
  formatNumber,
  formatCurrency,
  formatDecimal,
} from "@/lib/utils";

export function RegionTable() {
  const country = useAppStore((s) => s.country);
  const selectedLocation = useAppStore((s) => s.selectedLocation);
  const setSelectedLocation = useAppStore(
    (s) => s.setSelectedLocation
  );
  const loading = useAppStore((s) => s.loading);
  const regionTableFilter = useAppStore(
    (s) => s.regionTableFilter
  );
  const clearRegionTableFilter = useAppStore(
    (s) => s.clearRegionTableFilter
  );

  if (loading) {
    return (
      <div
        data-testid="region-table-loading"
        className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm"
      >
        <DataTable
          data={[]}
          columns={[
            {
              key: "location",
              header: "Location",
              cell: () => null,
            },
            {
              key: "population",
              header: "Population",
              cell: () => null,
            },
            {
              key: "gdp",
              header: "GDP",
              cell: () => null,
            },
            {
              key: "gdpPerCapita",
              header: "GDP per capita",
              cell: () => null,
            },
            {
              key: "lifeExpectancy",
              header: "Life expectancy",
              cell: () => null,
            },
          ]}
          getRowKey={() => ""}
          loading
          skeletonRows={3}
          renderSkeleton={() => (
            <>
              <td className="p-4">
                <Skeleton className="h-4 w-28" />
              </td>
              <td className="p-4">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="p-4">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="p-4">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="p-4">
                <Skeleton className="h-4 w-20" />
              </td>
            </>
          )}
        />
      </div>
    );
  }

  if (!country) {
    return null;
  }

  const rows = Object.values(country.regions);

  const filteredRows = filterRegions(
    rows,
    regionTableFilter
  );

  /*
   * Country-level fallback
   */
  if (rows.length === 0) {
    const countryColumns: DataTableColumn<
      typeof country
    >[] = [
      {
        key: "name",
        header: "Country",
        cell: (country) => (
          <span className="font-medium">
            {country.name}
          </span>
        ),
      },
      {
        key: "population",
        header: "Population",
        cell: (country) =>
          formatNumber(country.population),
      },
      {
        key: "gdp",
        header: "GDP",
        cell: (country) =>
          formatCurrency(country.gdp),
      },
      {
        key: "gdpPerCapita",
        header: "GDP per capita",
        cell: (country) =>
          formatCurrency(country.gdpPerCapita),
      },
      {
        key: "lifeExpectancy",
        header: "Life expectancy",
        cell: (country) =>
          country.lifeExpectancy != null
            ? `${formatDecimal(
                country.lifeExpectancy
              )} years`
            : "N/A",
      },
    ];

    return (
      <div
        data-testid="region-table"
        className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm"
      >
        <div className="flex items-center gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            ℹ️
          </Badge>

          <span>
            {country.name}
            {country.year ? ` · ${country.year}` : ""}{" "}
            World Bank Data.
          </span>
        </div>

        <DataTable
          data={[country]}
          columns={countryColumns}
          getRowKey={(country) => country.iso}
          data-testid="region-table-content"
          getRowState={(country) =>
            selectedLocation?.id === country.iso
              ? "selected"
              : undefined
          }
          onRowClick={(country) =>
            setSelectedLocation({
              id: country.iso,
              name: country.name,
              level: "country",
              countryIso: country.iso,
            })
          }
        />
      </div>
    );
  }

  const hasActiveFilter =
    Object.keys(regionTableFilter).length > 0;

  const columns: DataTableColumn<
    typeof rows[number]
  >[] = [
    {
      key: "name",
      header: "Region",
      cell: (region) => (
        <span className="font-medium">
          {region.name}
        </span>
      ),
    },
    {
      key: "population",
      header: "Population",
      cell: (region) =>
        region.population != null
          ? formatNumber(region.population)
          : "N/A",
    },
    {
      key: "gdp",
      header: "GDP",
      cell: (region) =>
        formatCurrency(region.gdp),
    },
    {
      key: "gdpPerCapita",
      header: "GDP per capita",
      cell: (region) =>
        formatCurrency(region.gdpPerCapita),
    },
    {
      key: "lifeExpectancy",
      header: "Life expectancy",
      cell: (region) =>
        region.lifeExpectancy != null
          ? `${formatDecimal(
              region.lifeExpectancy
            )} years`
          : "N/A",
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="text-xs">
          ℹ️
        </Badge>

        <span>
          {country.name}
          {country.year ? ` · ${country.year}` : ""} ·
          Regional estimates based on World Bank data
          and may not be accurate.
        </span>
      </div>

      {hasActiveFilter && (
        <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
          <span>
            Showing {filteredRows.length} of{" "}
            {rows.length} regions
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={clearRegionTableFilter}
            className="h-6 text-xs"
          >
            Clear filters
          </Button>
        </div>
      )}

      <DataTable
        data={filteredRows}
        columns={columns}
        getRowKey={(region) => region.id}
        data-testid="region-table"
        getRowState={(region) =>
          selectedLocation?.id === region.id
            ? "selected"
            : undefined
        }
        onRowClick={(region) =>
          setSelectedLocation({
            id: region.id,
            name: region.name,
            level: "region",
            countryIso: country.iso,
          })
        }
        emptyMessage="No regions match the current filters."
      />
    </div>
  );
}