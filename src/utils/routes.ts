import { Role, Screen } from "../types";

export const rolePath = (role: Role) => (role === "pharmacist" ? "pharmacy" : role);

const validScreens: Record<string, Screen[]> = {
  doctor: ["dashboard", "create", "appointments", "refills", "prescriptions", "pharmacies"],
  patient: ["dashboard", "doctors", "pharmacies"],
  pharmacy: ["dashboard", "inventory"],
  admin: ["dashboard", "admin", "inventory", "reports"],
};

const aliases: Record<string, Screen> = {
  approvals: "admin",
  medicines: "inventory",
  history: "prescriptions",
  availability: "pharmacies",
  "find-doctors": "doctors",
  "find-pharmacy": "pharmacies",
};

export const screenFromPath = (role: Role, pathname = window.location.pathname): Screen => {
  const roleSegment = rolePath(role);
  const [, pathRole, rawScreen] = pathname.split("/");

  if (pathRole !== roleSegment) return "dashboard";

  const screen = (aliases[rawScreen] || rawScreen || "dashboard") as Screen;
  return validScreens[roleSegment]?.includes(screen) ? screen : "dashboard";
};

export const pathForScreen = (role: Role, screen: Screen) => {
  const roleSegment = rolePath(role);
  const pathScreen = screen === "admin" ? "approvals" : screen === "inventory" && role === "admin" ? "medicines" : screen;
  return `/${roleSegment}/${pathScreen}`;
};

export const authModeFromPath = (pathname = window.location.pathname) => {
  const [, action, role] = pathname.split("/");
  if (action === "register" && ["doctor", "patient", "pharmacist", "admin"].includes(role)) {
    return role as "doctor" | "patient" | "pharmacist" | "admin";
  }

  return "login";
};
