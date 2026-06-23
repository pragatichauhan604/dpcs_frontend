import { Pill, X } from "lucide-react";
import { navFor } from "../config/navigation";
import { Role, Screen } from "../types";

type SidebarProps = {
  role: Role;
  current: Screen;
  open: boolean;
  onClose: () => void;
  onNavigate: (screen: Screen) => void;
};

export function Sidebar({ role, current, open, onClose, onNavigate }: SidebarProps) {
  const items = navFor(role);

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-head">
        <div className="brand-mark small">
          <Pill size={21} />
        </div>
        <strong>DPCS</strong>
        <button className="icon-button mobile-only" onClick={onClose} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>
      <nav>
        {items.map((item) => (
          <button key={item.screen} className={current === item.screen ? "active" : ""} onClick={() => onNavigate(item.screen)}>
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
