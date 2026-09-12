import {
  test,
  expect,
  type Page,
} from "@playwright/test";

import { mockCountryApis } from "./test-data";

async function selectRegion(
  page: Page,
  regionName: string
) {
  const row = page
    .locator("tbody tr")
    .filter({
      hasText: new RegExp(
        `^${regionName}`,
        "i"
      ),
    })
    .first();

  await expect(row).toBeVisible({
    timeout: 10000,
  });

  await row.click();

  return row;
}

test.describe("Region selection", () => {
  test.beforeEach(async ({ page }) => {
    await mockCountryApis(page);

    await page.goto("/");

    await expect(
      page.getByRole("columnheader", {
        name: "Region",
      })
    ).toBeVisible({
      timeout: 10000,
    });
  });

  test("selecting Maharashtra selects the row", async ({
    page,
  }) => {
    const row = await selectRegion(
      page,
      "Maharashtra"
    );

    await expect(row).toHaveAttribute(
      "data-state",
      "selected"
    );
  });

  test("selecting Maharashtra updates the indicators", async ({
    page,
  }) => {
    await selectRegion(
      page,
      "Maharashtra"
    );

    await expect(
      page.getByTestId("indicator-population")
    ).toBeVisible();

    await expect(
      page.getByTestId("indicator-gdp")
    ).toBeVisible();

    await expect(
      page.getByTestId(
        "indicator-gdp-per-capita"
      )
    ).toBeVisible();

    await expect(
      page.getByTestId(
        "indicator-life-expectancy"
      )
    ).toBeVisible();
  });

  test("switching regions updates the selected row", async ({
    page,
  }) => {
    const maharashtra =
      await selectRegion(
        page,
        "Maharashtra"
      );

    await expect(
      maharashtra
    ).toHaveAttribute(
      "data-state",
      "selected"
    );

    const karnataka =
      await selectRegion(
        page,
        "Karnataka"
      );

    await expect(
      karnataka
    ).toHaveAttribute(
      "data-state",
      "selected"
    );

    await expect(
      maharashtra
    ).not.toHaveAttribute(
      "data-state",
      "selected"
    );
  });

  test("selecting Maharashtra displays its chart", async ({
    page,
  }) => {
    await selectRegion(
      page,
      "Maharashtra"
    );

    await expect(
      page.getByTestId(
        "subregion-chart"
      )
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        level: 4,
        name:
          /Population & GDP \(Maharashtra\)/i,
      })
    ).toBeVisible();
  });

  test("selecting Karnataka displays Karnataka chart", async ({
    page,
  }) => {
    await selectRegion(
      page,
      "Karnataka"
    );

    await expect(
      page.getByRole("heading", {
        level: 4,
        name:
          /Population & GDP \(Karnataka\)/i,
      })
    ).toBeVisible();
  });
});

