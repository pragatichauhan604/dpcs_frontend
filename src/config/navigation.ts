import { ElementType } from "react";
import { Activity, BarChart3, Bell, CalendarCheck, ClipboardPlus, Pill, QrCode, ShieldCheck, Store, Stethoscope } from "lucide-react";
import { Role, Screen } from "../types";

export type NavItem = {
  label: string;
  screen: Screen;
  icon: ElementType;
};

export const navFor = (role: Role): NavItem[] => {
  if (role === "doctor") {
    return [
      { label: "Dashboard", screen: "dashboard", icon: Activity },
      { label: "Appointments", screen: "appointments", icon: CalendarCheck },
      { label: "Refill requests", screen: "refills", icon: Bell },
      { label: "Create prescription", screen: "create", icon: ClipboardPlus },
      { label: "History", screen: "prescriptions", icon: Pill },
      { label: "Availability", screen: "pharmacies", icon: Store },
    ];
  }

  if (role === "patient") {
    return [
      { label: "My prescriptions", screen: "dashboard", icon: ClipboardPlus },
      { label: "Find doctors", screen: "doctors", icon: Stethoscope },
      { label: "Find pharmacy", screen: "pharmacies", icon: Store },
    ];
  }

  if (role === "pharmacist") {
    return [
      { label: "Scan", screen: "dashboard", icon: QrCode },
      { label: "Inventory", screen: "inventory", icon: Pill },
    ];
  }

  return [
    { label: "Dashboard", screen: "dashboard", icon: Activity },
    { label: "Approvals", screen: "admin", icon: ShieldCheck },
    { label: "Medicines", screen: "inventory", icon: Pill },
    { label: "Reports", screen: "reports", icon: BarChart3 },
  ];
};

export const titleFor = (role: Role, screen: Screen) =>
  navFor(role).find((item) => item.screen === screen)?.label || "Dashboard";
