import { useEffect, useState } from "react";
import { Bell, ClipboardPlus, Users } from "lucide-react";
import { PrescriptionList } from "../../components/prescriptions/PrescriptionList";
import { StatCard } from "../../components/ui/StatCard";
import { demoPrescriptions } from "../../data/mockData";
import { ApiClient } from "../../services/api";
import { Prescription, Screen, ToastFn } from "../../types";
import { AvailabilityPanel } from "../shared/AvailabilityPanel";
import { CreatePrescription } from "./CreatePrescription";

type DoctorPanelProps = {
  api: ApiClient;
  screen: Screen;
  setScreen: (screen: Screen) => void;
  notify: ToastFn;
};

export function DoctorPanel({ api, screen, setScreen, notify }: DoctorPanelProps) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    api.get<any>("/doctor/dashboard").then(setDashboard).catch(() => setDashboard(null));
    api.get<{ prescriptions: Prescription[] }>("/doctor/prescriptions").then((data) => setPrescriptions(data.prescriptions)).catch(() => setPrescriptions(demoPrescriptions));
  }, [api]);

  if (screen === "create") return <CreatePrescription api={api} notify={notify} />;
  if (screen === "prescriptions") return <PrescriptionList prescriptions={prescriptions.length ? prescriptions : demoPrescriptions} audience="doctor" />;
  if (screen === "pharmacies") return <AvailabilityPanel api={api} />;

  return (
    <div className="content-stack">
      <div className="stats-grid">
        <StatCard icon={ClipboardPlus} label="Prescriptions today" value={dashboard?.totalPrescriptionsToday ?? 0} />
        <StatCard icon={Users} label="Active patients" value={dashboard?.totalActivePatients ?? 0} />
        <StatCard icon={Bell} label="Pending refills" value={dashboard?.pendingRefillAlerts ?? 0} />
      </div>
      <section className="section-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Doctor workflow</p>
            <h2>Recent prescriptions</h2>
          </div>
          <button className="primary-button compact" onClick={() => setScreen("create")}>
            <ClipboardPlus size={17} />
            New prescription
          </button>
        </div>
        <PrescriptionList prescriptions={dashboard?.recentPrescriptions?.length ? dashboard.recentPrescriptions : demoPrescriptions} audience="doctor" />
      </section>
    </div>
  );
}
