import { Suspense, lazy, type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { GeneratorPage } from "./pages/GeneratorPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AuthProvider, useAuth } from "./hooks/useAuth";

const History = lazy(() => import("./components/history/History").then((m) => ({ default: m.History })));
const Terms = lazy(() => import("./pages/Terms").then((m) => ({ default: m.Terms })));
const Privacy = lazy(() => import("./pages/Privacy").then((m) => ({ default: m.Privacy })));
const Cookies = lazy(() => import("./pages/Cookies").then((m) => ({ default: m.Cookies })));
const FAQ = lazy(() => import("./pages/FAQ").then((m) => ({ default: m.FAQ })));
const About = lazy(() => import("./pages/About").then((m) => ({ default: m.About })));
const Donations = lazy(() => import("./pages/Donations").then((m) => ({ default: m.Donations })));

function Protected({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  if (authed === null) {
    return <div className="min-h-[50vh] flex items-center justify-center text-gray-500">Cargando…</div>;
  }
  if (authed === false) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function Shell() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <main id="main-content">
        <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-gray-500" aria-live="polite">Cargando…</div>}>
          <Routes>
            <Route path="/" element={<Protected><Navigate to="/generador-qr/url" replace /></Protected>} />
            <Route
              path="/generador-qr/:type"
              element={
                <Protected>
                  <GeneratorPage />
                </Protected>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Protected>
                  <DashboardPage />
                </Protected>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/history" element={<History />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<About />} />
            <Route path="/donaciones" element={<Donations />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
