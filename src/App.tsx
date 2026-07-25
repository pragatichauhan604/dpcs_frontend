import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "./layouts/AppLayout";
import { AuthPage } from "./pages/AuthPage";
import { AdminPanel } from "./pages/admin/AdminPanel";
import { DoctorPanel } from "./pages/doctor/DoctorPanel";
import { MarketingPage } from "./pages/MarketingPage";
import { PatientPanel } from "./pages/patient/PatientPanel";
import { PharmacyPanel } from "./pages/pharmacy/PharmacyPanel";
import { createApi } from "./services/api";
import { Screen, Session } from "./types";
import { authModeFromPath, pathForScreen, screenFromPath } from "./utils/routes";

const storageKey = "dpcs-session";

export function App() {
  const [session, setSession] = useState<Session | null>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  });
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [screen, setScreenState] = useState<Screen>(() => (session ? screenFromPath(session.user.role) : "dashboard"));
  const [toast, setToast] = useState("");

  const setScreen = (next: Screen) => {
    setScreenState(next);
    if (session) {
      const path = pathForScreen(session.user.role, next);
      if (window.location.pathname !== path) {
        window.history.pushState({}, "", path);
        setPathname(path);
      }
    }
  };

  const api = useMemo(() => createApi(() => session?.token || null), [session?.token]);

  const saveSession = (next: Session) => {
    setSession(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    const nextScreen = screenFromPath(next.user.role);
    const nextPath = pathForScreen(next.user.role, nextScreen);
    setScreenState(nextScreen);
    window.history.pushState({}, "", nextPath);
    setPathname(nextPath);
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(storageKey);
    setScreenState("dashboard");
    window.history.pushState({}, "", "/login");
    setPathname("/login");
  };

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };

  const navigatePublic = (path: string) => {
    window.history.pushState({}, "", path);
    setPathname(path);
  };

  useEffect(() => {
    const onPopState = () => {
      setPathname(window.location.pathname);
      setScreenState(session ? screenFromPath(session.user.role) : "dashboard");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [session]);

  if (!session) {
    if (pathname === "/") {
      return <MarketingPage onNavigate={navigatePublic} />;
    }

    return <AuthPage api={api} initialMode={authModeFromPath(pathname)} onAuth={saveSession} notify={notify} />;
  }

  return (
    <AppLayout session={session} screen={screen} onNavigate={setScreen} onLogout={logout} toast={toast}>
      {session.user.role === "doctor" && <DoctorPanel api={api} screen={screen} setScreen={setScreen} notify={notify} />}
      {session.user.role === "patient" && <PatientPanel api={api} screen={screen} setScreen={setScreen} notify={notify} />}
      {session.user.role === "pharmacist" && <PharmacyPanel api={api} screen={screen} notify={notify} />}
      {session.user.role === "admin" && <AdminPanel api={api} screen={screen} setScreen={setScreen} notify={notify} />}
    </AppLayout>
  );
}
