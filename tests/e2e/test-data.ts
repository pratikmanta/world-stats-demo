import type { Page } from "@playwright/test";

export const mockCountryInfo = {
  name: "India",
  latitude: "20.5937",
  longitude: "78.9629",
};

export const mockBoundaries = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        shapeISO: "IN-MH",
        shapeName: "Maharashtra",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [72, 18],
            [75, 18],
            [75, 21],
            [72, 21],
            [72, 18],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        shapeISO: "IN-KA",
        shapeName: "Karnataka",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [74, 12],
            [77, 12],
            [77, 16],
            [74, 16],
            [74, 12],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        shapeISO: "IN-DL",
        shapeName: "Delhi",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [77, 28],
            [78, 28],
            [78, 29],
            [77, 29],
            [77, 28],
          ],
        ],
      },
    },
  ],
};

const indicatorValues: Record<string, number> = {
  "SP.POP.TOTL": 1_400_000_000,
  "NY.GDP.MKTP.CD": 3_500_000_000_000,
  "NY.GDP.PCAP.CD": 2_500,
  "SP.DYN.LE00.IN": 67.7,
  "EN.ATM.CO2E.PC": 1.9,
};

export async function mockCountryApis(page: Page) {
  // Mock application boundary API
  await page.route(
    "**/api/boundaries/IN",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockBoundaries),
      });
    }
  );

  // Mock World Bank APIs
  await page.route(
    "https://api.worldbank.org/v2/**",
    async (route) => {
      const url = route.request().url();

      // Indicator request
      const indicatorMatch = url.match(
        /\/indicator\/([^?]+)/
      );

      if (indicatorMatch) {
        const indicatorCode = indicatorMatch[1];

        const value =
          indicatorValues[indicatorCode] ?? null;

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              page: 1,
              pages: 1,
            },
            [
              {
                value,
                date: "2024",
              },
            ],
          ]),
        });

        return;
      }

      // Country information request
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            page: 1,
            pages: 1,
          },
          [mockCountryInfo],
        ]),
      });
    }
  );
  
}
