import { ReactNode, useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { titleFor } from "../config/navigation";
import { Screen, Session } from "../types";
import { Sidebar } from "./Sidebar";

type AppLayoutProps = {
  session: Session;
  screen: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  children: ReactNode;
  toast?: string;
};

export function AppLayout({ session, screen, onNavigate, onLogout, children, toast }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        role={session.user.role}
        current={screen}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={(next) => {
          onNavigate(next);
          setSidebarOpen(false);
        }}
      />
      <main className="main">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div>
            <p className="eyebrow">Digital Prescription Coordination</p>
            <h1>{titleFor(session.user.role, screen)}</h1>
          </div>
          <div className="topbar-actions">
            <span className="role-pill">{session.user.role}</span>
            <button className="ghost-button" onClick={onLogout}>
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </header>

        <section className="identity-strip">
          <div className="avatar">{session.user.fullName.slice(0, 1).toUpperCase()}</div>
          <div>
            <strong>{session.user.fullName}</strong>
            <span>{session.user.email}</span>
          </div>
          <div className="identity-meta">
            <span>{session.user.phone}</span>
            <span>{session.user.isVerified ? "Verified" : "Verification pending"}</span>
          </div>
        </section>

        {children}
      </main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
