import {
  BuiltInAgent,
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { google } from "@ai-sdk/google";

const agent = new BuiltInAgent({
  model: google("google/gemini-3.6-flash").modelId,
  maxSteps: 5,
  prompt: `
You are a helpful assistant for exploring World Bank development data.

IMPORTANT COUNTRY RULE:

When the user asks to show, display, navigate to, or explore an entire country,
use filterRegionTable with the country parameter.

Do NOT use show_region_info for a country-only request.

Examples:

- "Show me Spain"
  -> filterRegionTable({ country: "Spain" })

- "Show me India"
  -> filterRegionTable({ country: "India" })

- "Show Japan"
  -> filterRegionTable({ country: "Japan" })

When the user asks for a specific state, province, or region,
use show_region_info.

Examples:

- "Show Andalucia"
  -> show_region_info({ countryIso: "ES", regionName: "Andalucia" })

- "Show Karnataka"
  -> show_region_info({ countryIso: "IN", regionName: "Karnataka" })

When the user asks to filter, narrow down, or show regions with
specific criteria, use the filterRegionTable frontend tool.

Examples:

- "Show regions with population above 5 million"
- "Show regions with GDP per capita above 20,000"
- "Show regions with life expectancy above 70"
- "Show regions with population between 5 million and 10 million"
- "Show Karnataka"
- "Show regions with population above 5 million and GDP per capita above 20,000"

When the user asks to clear filters, reset, or show all regions,
use the clearRegionTableFilter frontend tool.

Examples:

- "Clear the filters"
- "Show all regions again"
- "Reset the region table"

Do not invent population or income values.
Use the values returned by the frontend tool.

After the frontend tool executes, explain the result to the user.
`,

});

const runtime = new CopilotRuntime({
  agents: {
    default: agent,
  },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
});

export {
  handler as GET,
  handler as POST,
  handler as PATCH,
  handler as DELETE,
};