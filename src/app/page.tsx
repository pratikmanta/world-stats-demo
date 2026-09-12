import { CopilotProvider } from "@/components/copilot/CopilotProvider";
import { Dashboard } from "@/components/Dashboard";

export default function HomePage() {
  return (
    <CopilotProvider>
      <Dashboard />
    </CopilotProvider>
  );
}
