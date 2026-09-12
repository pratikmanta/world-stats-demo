"use client";

import { useEffect } from "react";
import { MapCanvas } from "./map/MapCanvas";
import { IndicatorGrid } from "./indicators/IndicatorGrid";
import { SubRegionChart } from "./charts/SubRegionChart";
import { RegionTable } from "./regions/RegionTable";
import { CopilotDock } from "./copilot/CopilotDock";
import { CopilotActions } from "./copilot/CopilotActions";
import { useAppStore } from "@/store/useAppStore";


export function Dashboard() {
  const country = useAppStore((s) => s.country);
  const loadCountry = useAppStore((s) => s.loadCountry);

  // Load initial country India data when component mounts
  useEffect(() => {
    if (!country) {
      loadCountry("IN").catch((error) => {
        console.error("Failed to load default country:", error);
      });
    }
  }, [country, loadCountry]);

  console.log(
    "Dashboard country:",
    useAppStore.getState().country
  );

  return (
    <div className="p-4">
      <CopilotActions />
      <main className="mx-auto max-w-5xl space-y-4">
        <>
          <div className="h-[350px] overflow-hidden rounded-lg border">
            <MapCanvas />
          </div>
          <IndicatorGrid />
        </>
        <SubRegionChart />
        <RegionTable />
      </main>
      <CopilotDock />
    </div>
  );
}
