import { lazy, Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";

const FinanceSection = lazy(() => import("@/sections/FinanceSection").then((m) => ({ default: m.FinanceSection })));
const MacroSection = lazy(() => import("@/sections/MacroSection").then((m) => ({ default: m.MacroSection })));
const GeopoliticsSection = lazy(() => import("@/sections/GeopoliticsSection").then((m) => ({ default: m.GeopoliticsSection })));
const AflSection = lazy(() => import("@/sections/AflSection").then((m) => ({ default: m.AflSection })));
const NewsSection = lazy(() => import("@/sections/NewsSection").then((m) => ({ default: m.NewsSection })));

function SectionFallback() {
  return (
    <div className="rounded-lg border border-terminal-border bg-terminal-panel/80 px-4 py-8 text-center font-mono text-xs text-terminal-muted shadow-panel">
      Loading section…
    </div>
  );
}

export function App() {
  return (
    <AppShell>
      <div className="space-y-16">
        <Suspense fallback={<SectionFallback />}>
          <FinanceSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <MacroSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <GeopoliticsSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <AflSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <NewsSection />
        </Suspense>
      </div>
    </AppShell>
  );
}
