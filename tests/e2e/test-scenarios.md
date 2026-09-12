<!-- 
Note : This E2E test suite uses Playwright to 
- validate core application functionality and user interactions, including application loading, regional data display, indicator formatting, region selection, and dynamic updates to indicators and charts. 
- API responses are mocked to ensure deterministic and reliable test execution. 
-->

## E2E Test Coverage

### `application.spec.ts`

**Purpose:** Covers core application loading and regional data display.

**Scenarios:**

* Default India dataset loads successfully
* Multiple regions are displayed
* Regional table headers are displayed correctly
* Expected regions are displayed
* Regional data information message is displayed

### `indicators.spec.ts`

**Purpose:** Covers indicator display and data formatting.

**Scenarios:**

* Population is displayed with number formatting
* GDP is displayed with dollar formatting
* GDP per capita is displayed with dollar formatting
* Life expectancy is displayed with `years`
* All indicators are populated after region selection

### `region-selection.spec.ts`

**Purpose:** Covers region selection and updates to region-specific data.

**Scenarios:**

* Region can be selected from the table
* Selected region is highlighted
* Selecting a region updates the indicators
* Switching between regions updates the selected state
* Selected region displays its corresponding chart
* Different regions display their respective charts
