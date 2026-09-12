import { test, expect } from "@playwright/test";
import { mockCountryApis } from "./test-data";

test.describe("Indicators and formatting", () => {

  test.beforeEach(async ({ page }) => {
    await mockCountryApis(page);
    await page.goto("/");
  });

  async function selectMaharashtra(page: any) {
    await expect(
      page.getByRole("columnheader", { name: "Region" })
    ).toBeVisible({
      timeout: 15000,
    });

    const row = page
      .locator("tbody tr")
      .filter({
        hasText: /^Maharashtra/i,
      })
      .first();

    await expect(row).toBeVisible({
      timeout: 15000,
    });

    await row.click();

    await expect(
      page.getByTestId("indicator-population")
    ).toBeVisible();
  }

  test("population is displayed with number formatting", async ({
    page,
  }) => {
    await page.goto("/");

    await selectMaharashtra(page);

    const population = page.getByTestId("indicator-population");

    const text = await population.textContent();

    expect(text).toBeTruthy();
    expect(text).toMatch(/[\d,]+/);
    expect(text).not.toContain("N/A");
  });

  test("GDP is displayed as currency", async ({ page }) => {
    await page.goto("/");

    await selectMaharashtra(page);

    const gdp = page.getByTestId("indicator-gdp");

    await expect(gdp).toBeVisible();

    const text = await gdp.textContent();

    expect(text).toBeTruthy();
    expect(text).toMatch(/\$[\d,]+/);
    expect(text).not.toContain("N/A");
  });

  test("GDP per capita is displayed as currency", async ({ page }) => {
    await page.goto("/");

    await selectMaharashtra(page);

    const gdpPerCapita = page.getByTestId(
      "indicator-gdp-per-capita"
    );

    await expect(gdpPerCapita).toBeVisible();

    const text = await gdpPerCapita.textContent();

    expect(text).toBeTruthy();
    expect(text).toMatch(/\$[\d,]+/);
    expect(text).not.toContain("N/A");
  });

  test("life expectancy is displayed with years suffix", async ({
    page,
  }) => {
    await page.goto("/");

    await selectMaharashtra(page);

    const lifeExpectancy = page.getByTestId(
      "indicator-life-expectancy"
    );

    await expect(lifeExpectancy).toBeVisible();

    await expect(lifeExpectancy).toContainText("years");
  });

  test("all indicator cards are populated after region selection", async ({
    page,
  }) => {
    await page.goto("/");

    await selectMaharashtra(page);

    const indicators = [
      "indicator-population",
      "indicator-gdp",
      "indicator-gdp-per-capita",
      "indicator-life-expectancy",
    ];

    for (const testId of indicators) {
      const indicator = page.getByTestId(testId);

      await expect(indicator).toBeVisible();

      const text = await indicator.textContent();

      expect(text?.trim()).toBeTruthy();
      expect(text).not.toContain("N/A");
    }
  });

  test("GDP and GDP per capita use dollar formatting", async ({
    page,
  }) => {
    await page.goto("/");

    await selectMaharashtra(page);

    await expect(
      page.getByTestId("indicator-gdp")
    ).toContainText(/\$/);

    await expect(
      page.getByTestId("indicator-gdp-per-capita")
    ).toContainText(/\$/);
  });
});
