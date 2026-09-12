"use client";

import { CopilotSidebar } from "@copilotkit/react-core/v2";
export function CopilotDock() {
  return (
    <CopilotSidebar
      labels={{
        modalHeaderTitle: "Data Copilot",
        welcomeMessageText:
          "Ask me to show a country or region, e.g. 'Show me Delhi'.",
        chatInputPlaceholder: "Show me Delhi…",
      }}
      defaultOpen={true}
    />
  );
}
