
import type { Metadata } from "next";

import "@copilotkit/react-core/v2/styles.css";
import './globals.css';

export const metadata: Metadata = {
  title: "World Bank Data Copilot",
  description: "Explore World Bank indicators with a map and an AI copilot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
