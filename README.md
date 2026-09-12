# World Stats Demo

Explore World Bank development indicators with a map and an AI copilot.

The core idea: **components read the store, actions write the store, nothing
else talks to anything else directly.** A map click and a copilot command both
call the same `setSelectedRegion` / `setCountry` setters, so they always
produce identical state.

## Stack

- **Next.js 14** (App Router, TypeScript, `src/` directory)
- **Tailwind CSS** + **shadcn/ui** for styling and components
- **Mapbox GL** via `react-map-gl` for the choropleth map
- **CopilotKit** for the chat assistant
- **Zustand** for the single shared store
- **Recharts** for charts
- **Playwright** for end-to-end tests

## Folder structure

```
src/
  app/
    api/
      worldbank/[iso]/route.ts   # proxies + caches World Bank indicator calls
      boundaries/[iso]/route.ts  # serves/proxies country boundary GeoJSON
      copilotkit/route.ts        # CopilotKit runtime endpoint
    layout.tsx
    page.tsx                     # wraps <Dashboard /> in <CopilotProvider />
  components/
    ui/                          # shadcn/ui primitives (Card, Button, Input, Table, Badge, Skeleton)
    map/MapCanvas.tsx            # Mapbox wrapper (reads/writes the store)
    indicators/                  # IndicatorCard + IndicatorGrid
    charts/SubRegionChart.tsx    # Recharts bar chart
    tables/RegionTable.tsx       # sortable-by-click region table
    copilot/                     # provider, dock, and actions
    Dashboard.tsx                # composes the panels
  store/useAppStore.ts           # single Zustand store — the source of truth
  data/sampleCountries.ts        # bundled sample data (India, Kenya)
  lib/                           # worldbank, boundaries, name resolver, etc.
  types/regions.ts               # shared domain types
tests/e2e/                       # Playwright specs
```

## Setup

1. **Install Node.js 20+** (not installed on the machine where this was written).

2. **Install dependencies**

   ```bash
   npm install
   npx playwright install
   ```

3. **Configure environment** — copy `.env.example` to `.env.local` and fill in:

   - `NEXT_PUBLIC_MAPBOX_TOKEN` — required to render the map (the rest of the
     app works without it).
   - `OPENAI_API_KEY` — required for the copilot.

4. **Run**

   ```bash
   npm run dev
   ```

5. **Test**

   ```bash
   npm run test:e2e
   ```

   The map/table interaction test runs offline. The copilot tests skip
   automatically unless `OPENAI_API_KEY` is set.

## What's sample vs. real

This scaffold ships with **bundled sample data** (`src/data/sampleCountries.ts`)
for India and Kenya so it runs end-to-end with zero external setup. The real
data path is already stubbed out and wired:

- `src/lib/worldbank.ts` + `/api/worldbank/[iso]` fetch and cache live World
  Bank indicators (public API, no key).
- `src/lib/boundaries.ts` + `/api/boundaries/[iso]` are where you drop GADM /
  Natural Earth GeoJSON files.

To go live, replace the demo lookup in `CopilotActions.tsx` with the real
`fetchCountryBoundaries` + `fetchCountryIndicators` calls (see the comment in
that file).

## Adding things

| To add… | Touch these files only |
|---|---|
| A new country | `data/sampleCountries.ts`, `lib/countryCodes.ts` |
| A new indicator | `lib/worldbank.ts`, `indicators/IndicatorGrid.tsx` |
| A new copilot capability | one new `useCopilotAction` in `components/copilot/` |
| A new visualization | one new component that reads the store in `components/charts/` |
| A new page | compose existing components in `app/<page>/page.tsx` |

## shadcn/ui

The project is configured for shadcn/ui (`components.json`, `src/lib/utils.ts`,
theme tokens in `globals.css`, and the color/radius mapping in
`tailwind.config.ts`). Add more components any time with:

```bash
npx shadcn@latest add tabs
```

The `ui/` folder already ships `Card`, `Button`, `Input`, `Table`, `Badge`,
and `Skeleton`.

## Notes on CopilotKit versions

The CopilotKit packages are declared as `^1.0.0`, so `npm install` resolves the
latest 1.x (currently `@copilotkit/runtime@1.70.1`). CopilotKit's v1 runtime SDK
is deprecated since 1.68.2 in favor of `@copilotkit/runtime/v2`; this project
uses the still-functional v1 `copilotRuntimeNextJSAppRouterEndpoint` helper so
the client and runtime stay on the same major. To migrate later, follow
CopilotKit's migration guide.
