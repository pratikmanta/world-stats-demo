import {
  test,
  expect,
} from "@playwright/test";

import { mockCountryApis } from "./test-data";

test.describe("Application", () => {
  test.beforeEach(async ({ page }) => {
    await mockCountryApis(page);

    await page.goto("/");
  });

  test("loads the default India dataset", async ({
    page,
  }) => {
    await expect(
      page.getByRole("columnheader", {
        name: "Region",
      })
    ).toBeVisible({
      timeout: 10000,
    });
  });

  test("displays multiple regions", async ({
    page,
  }) => {
    const rows = page.locator("tbody tr");

    await expect(rows.first()).toBeVisible({
      timeout: 10000,
    });

    await expect(rows).toHaveCount(3);
  });

 test("displays correct table headers", async ({ page }) => {
  const table = page.getByTestId("region-table");

  await expect(table).toBeVisible({
    timeout: 10000,
  });

    await expect(
    table.getByRole("columnheader")
    ).toHaveText([
    "Region",
    "Population",
    "GDP",
    "GDP per capita",
    "Life expectancy",
    ]);
});

  test("displays the expected regions", async ({
    page,
  }) => {
    await expect(
      page.getByText("Maharashtra", {
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByText("Karnataka", {
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByText("Delhi", {
        exact: true,
      })
    ).toBeVisible();
  });

  test("displays the regional information message", async ({
    page,
  }) => {
    await expect(
      page.getByText(
        /Regional estimates based on World Bank data/i
      )
    ).toBeVisible();
  });
});

