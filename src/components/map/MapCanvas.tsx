"use client";

import Map, { Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { useAppStore } from "@/store/useAppStore";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function MapCanvas() {
  const country = useAppStore((s) => s.country);

  const selectedLocation = useAppStore(
    (s) => s.selectedLocation
  );

  const setSelectedLocation = useAppStore(
    (s) => s.setSelectedLocation
  );

  const loading = useAppStore((s) => s.loading);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (!country) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading country data...
      </div>
    );
  }

  if (
    !country.boundaries ||
    !country.boundaries.features ||
    country.boundaries.features.length === 0
  ) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-sm text-muted-foreground">
        <p>
          No boundary data available for {country.name}
        </p>

        <p className="mt-2 text-xs">
          Try selecting a different country
        </p>
      </div>
    );
  }

  const mapboxToken =
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local to
        render the map
      </div>
    );
  }

  const isCountrySelected =
    selectedLocation?.level === "country" &&
    selectedLocation.countryIso === country.iso;

  const selectedLocationId =
    selectedLocation?.countryIso === country.iso
      ? selectedLocation.id
      : "";

  /*
   * Extract the region ID from a GeoJSON feature.
   *
   * Your boundaries API normalizes these properties,
   * so region_id and region_name should normally exist.
   */
  const getRegionId = (feature: any): string | null => {
    const properties = feature?.properties ?? {};

    const id =
      properties.region_id ??
      properties.shapeISO ??
      properties.shapeID ??
      properties.gid ??
      feature?.id;

    return id != null ? String(id) : null;
  };

  /*
   * Extract the region name from a GeoJSON feature.
   */
  const getRegionName = (
    feature: any
  ): string => {
    const properties = feature?.properties ?? {};

    return (
      properties.region_name ??
      properties.shapeName ??
      properties.name ??
      properties.NAME_1 ??
      "Unknown region"
    );
  };

  return (
    <div className="relative h-full w-full">
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={country.viewport}
        mapStyle="mapbox://styles/mapbox/light-v11"

        /*
         * Only our GeoJSON ADM1 layer is interactive.
         */
        interactiveLayerIds={[
          "country-fill",
        ]}

        onClick={(event) => {
          const feature =
            event.features?.find(
              (item) =>
                item.layer?.id ===
                "country-fill"
            );

          /*
           * IMPORTANT:
           *
           * Do NOT automatically select the current
           * country when clicking empty map space.
           *
           * Otherwise, after loading India, clicking
           * somewhere else will appear to "select India".
           */
          if (!feature) {
            return;
          }

          const regionId =
            getRegionId(feature);

          const regionName =
            getRegionName(feature);

          if (!regionId) {
            return;
          }

          setSelectedLocation({
            id: regionId,
            name: regionName,
            level: "region",
            countryIso: country.iso,
          });
        }}
      >
        <Source
          id="country"
          type="geojson"
          data={country.boundaries}
        >
          <Layer
            id="country-fill"
            type="fill"
            paint={{
              "fill-color": "#7F77DD",

              "fill-opacity": isCountrySelected
                ? 0.65
                : [
                  "case",
                  [
                    "==",
                    [
                      "coalesce",
                      ["get", "region_id"],
                      ["get", "shapeISO"],
                      ["get", "shapeID"],
                      ["id"],
                    ],
                    selectedLocationId,
                  ],
                  0.65,
                  0.25,
                ],
            }}
          />

          <Layer
            id="country-outline"
            type="line"
            paint={{
              "line-color": "#3C3489",
              "line-width": 1.5,
            }}
          />
        </Source>
      </Map>

      <Badge
        variant="secondary"
        data-testid="map-country-label"
        className="absolute left-2 top-2 shadow-sm"
      >
        {selectedLocation?.countryIso ===
          country.iso &&
          selectedLocation.level ===
          "region"
          ? selectedLocation.name
          : country.name}
      </Badge>
    </div>
  );
}