import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";

const FinancePage = lazy(() => import("@/pages/FinancePage").then((m) => ({ default: m.FinancePage })));
const MacroPage = lazy(() => import("@/pages/MacroPage").then((m) => ({ default: m.MacroPage })));
const GeopoliticsPage = lazy(() => import("@/pages/GeopoliticsPage").then((m) => ({ default: m.GeopoliticsPage })));
const AflPage = lazy(() => import("@/pages/AflPage").then((m) => ({ default: m.AflPage })));
const NewsPage = lazy(() => import("@/pages/NewsPage").then((m) => ({ default: m.NewsPage })));

function PageFallback() {
  return (
    <div className="rounded-lg border border-terminal-border bg-terminal-panel/80 px-4 py-12 text-center font-mono text-xs text-terminal-muted shadow-panel">
      Loading page…
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="finance" replace />} />
        <Route
          path="finance"
          element={
            <Suspense fallback={<PageFallback />}>
              <FinancePage />
            </Suspense>
          }
        />
        <Route
          path="macro"
          element={
            <Suspense fallback={<PageFallback />}>
              <MacroPage />
            </Suspense>
          }
        />
        <Route
          path="geopolitics"
          element={
            <Suspense fallback={<PageFallback />}>
              <GeopoliticsPage />
            </Suspense>
          }
        />
        <Route
          path="afl"
          element={
            <Suspense fallback={<PageFallback />}>
              <AflPage />
            </Suspense>
          }
        />
        <Route
          path="news"
          element={
            <Suspense fallback={<PageFallback />}>
              <NewsPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="finance" replace />} />
      </Route>
    </Routes>
  );
}
