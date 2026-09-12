import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <Globe2 className="h-5 w-5" />
            <span>World Data Stats</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
            <Globe2 className="h-4 w-4" />
            Explore global data
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Explore the world through
            <span className="block text-primary">
              data and statistics
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            World Data Stats lets you explore countries and their
            regions through key indicators such as population,
            GDP, GDP per capita, and life expectancy — all in one
            interactive dashboard.
          </p>

          <div className="mt-10 flex justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Explore country-level and regional statistics on an
            interactive map.
          </p>
        </div>
      </section>
    </main>
  );
}

