import { useMemo, useState } from "react";
import { AppLayout } from "./layouts/AppLayout";
import { AuthPage } from "./pages/AuthPage";
import { AdminPanel } from "./pages/admin/AdminPanel";
import { DoctorPanel } from "./pages/doctor/DoctorPanel";
import { PatientPanel } from "./pages/patient/PatientPanel";
import { PharmacyPanel } from "./pages/pharmacy/PharmacyPanel";
import { createApi } from "./services/api";
import { Screen, Session } from "./types";

const storageKey = "dpcs-session";

export function App() {
  const [session, setSession] = useState<Session | null>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  });
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [toast, setToast] = useState("");

  const api = useMemo(() => createApi(() => session?.token || null), [session?.token]);

  const saveSession = (next: Session) => {
    setSession(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(storageKey);
    setScreen("dashboard");
  };

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };

  if (!session) {
    return <AuthPage api={api} onAuth={saveSession} notify={notify} />;
  }

  return (
    <AppLayout session={session} screen={screen} onNavigate={setScreen} onLogout={logout} toast={toast}>
      {session.user.role === "doctor" && <DoctorPanel api={api} screen={screen} setScreen={setScreen} notify={notify} />}
      {session.user.role === "patient" && <PatientPanel api={api} screen={screen} notify={notify} />}
      {session.user.role === "pharmacist" && <PharmacyPanel api={api} screen={screen} notify={notify} />}
      {session.user.role === "admin" && <AdminPanel api={api} screen={screen} notify={notify} />}
    </AppLayout>
  );
}
