import { useEffect, useState } from "react";
import { Activity, BarChart3, ClipboardCheck, Pill, Stethoscope, Store, Users } from "lucide-react";
import { NotificationList } from "../../components/notifications/NotificationList";
import { DataTable } from "../../components/ui/DataTable";
import { Field } from "../../components/ui/Field";
import { StatCard } from "../../components/ui/StatCard";
import { demoPharmacies } from "../../data/mockData";
import { ApiClient, ApiError } from "../../services/api";
import { Screen, ToastFn } from "../../types";
import { labelize } from "../../utils/format";

type AdminPanelProps = {
  api: ApiClient;
  screen: Screen;
  setScreen: (screen: Screen) => void;
  notify: ToastFn;
};

export function AdminPanel({ api, screen, setScreen, notify }: AdminPanelProps) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [pharmacists, setPharmacists] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [medicine, setMedicine] = useState({ brandName: "", genericName: "", category: "", dosageForms: "Tablet", standardStrength: "" });

  useEffect(() => {
    api.get<any>("/admin/dashboard").then(setDashboard).catch(() => setDashboard(null));
    api.get<{ doctors: any[] }>("/admin/doctors").then((data) => setDoctors(data.doctors)).catch(() => setDoctors([]));
    api.get<{ pharmacies: any[] }>("/admin/pharmacies").then((data) => setPharmacies(data.pharmacies)).catch(() => setPharmacies(demoPharmacies));
    api.get<{ pharmacists: any[] }>("/admin/pharmacists").then((data) => setPharmacists(data.pharmacists)).catch(() => setPharmacists([]));
    api.get<any>("/admin/reports/summary").then(setReports).catch(() => setReports(null));
  }, [api]);

  const setDoctorApproval = async (id: string, isApproved: boolean) => {
    try {
      await api.patch(`/admin/doctors/${id}/approval`, { isApproved });
      setDoctors((current) => current.map((doctor) => (doctor.id === id ? { ...doctor, isApproved } : doctor)));
      notify(isApproved ? "Doctor approved." : "Doctor deactivated.");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "Doctor status update failed");
    }
  };

  const setPharmacyApproval = async (id: string, isApproved: boolean) => {
    try {
      await api.patch(`/admin/pharmacies/${id}/approval`, { isApproved });
      setPharmacies((current) => current.map((pharmacy) => (pharmacy.id === id ? { ...pharmacy, isApproved, isActive: isApproved } : pharmacy)));
      notify(isApproved ? "Pharmacy approved." : "Pharmacy deactivated.");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "Pharmacy status update failed");
    }
  };

  const setPharmacistApproval = async (id: string, isApproved: boolean) => {
    try {
      await api.patch(`/admin/pharmacists/${id}/approval`, { isApproved });
      setPharmacists((current) => current.map((pharmacist) => (pharmacist.id === id ? { ...pharmacist, isApproved } : pharmacist)));
      notify(isApproved ? "Pharmacist approved." : "Pharmacist deactivated.");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "Pharmacist status update failed");
    }
  };

  const addMedicine = async () => {
    try {
      await api.post("/admin/medicines", { ...medicine, requiresPrescription: true, isActive: true });
      notify("Medicine added to master list.");
      setMedicine({ brandName: "", genericName: "", category: "", dosageForms: "Tablet", standardStrength: "" });
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "Medicine could not be added");
    }
  };

  if (screen === "admin") {
    return (
      <div className="content-stack">
        <section className="section-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Approvals</p>
              <h2>Doctors</h2>
            </div>
          </div>
          <DataTable
            columns={["Name", "License", "Hospital", "Status", "Action"]}
            rows={doctors.map((doctor) => [
              doctor.user?.fullName,
              doctor.licenseNumber,
              doctor.hospitalName,
              doctor.isApproved ? "Active" : "Pending",
              <button className="table-action" onClick={() => setDoctorApproval(doctor.id, !doctor.isApproved)}>
                {doctor.isApproved ? "Deactivate" : "Approve"}
              </button>,
            ])}
          />
        </section>
        <section className="section-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Approvals</p>
              <h2>Pharmacies</h2>
              <p className="empty-state">Pharmacy means the medical store/chemist shop location that stores and dispenses medicines.</p>
            </div>
          </div>
          <DataTable
            columns={["Pharmacy ID", "Name", "City", "Phone", "Status", "Action"]}
            rows={pharmacies.map((pharmacy) => [
              pharmacy.id,
              pharmacy.name,
              pharmacy.city,
              pharmacy.phone,
              pharmacy.isApproved ? "Active" : "Pending",
              <button className="table-action" onClick={() => setPharmacyApproval(pharmacy.id, !pharmacy.isApproved)}>
                {pharmacy.isApproved ? "Deactivate" : "Approve"}
              </button>,
            ])}
          />
        </section>
        <section className="section-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Approvals</p>
              <h2>Pharmacists</h2>
              <p className="empty-state">Pharmacist means the person/user account working under a pharmacy who can scan QR and dispense medicine.</p>
            </div>
          </div>
          <DataTable
            columns={["Name", "Email", "License", "Pharmacy", "Status", "Action"]}
            rows={pharmacists.map((pharmacist) => [
              pharmacist.user?.fullName,
              pharmacist.user?.email,
              pharmacist.licenseNumber,
              pharmacist.pharmacy?.name || pharmacist.pharmacyId,
              pharmacist.isApproved ? "Active" : "Pending",
              <button className="table-action" onClick={() => setPharmacistApproval(pharmacist.id, !pharmacist.isApproved)}>
                {pharmacist.isApproved ? "Deactivate" : "Approve"}
              </button>,
            ])}
          />
        </section>
      </div>
    );
  }

  if (screen === "inventory") {
    return (
      <section className="section-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Medicine catalogue</p>
            <h2>Add medicine</h2>
          </div>
          <button className="primary-button compact" onClick={addMedicine}>
            <Pill size={17} />
            Save
          </button>
        </div>
        <div className="medicine-editor">
          {Object.entries(medicine).map(([key, value]) => (
            <Field key={key} label={labelize(key)} value={value} onChange={(next) => setMedicine((current) => ({ ...current, [key]: next }))} />
          ))}
        </div>
      </section>
    );
  }

  if (screen === "reports") {
    return (
      <div className="content-stack">
        <div className="stats-grid">
          <StatCard icon={ClipboardCheck} label="Prescriptions today" value={reports?.cards?.prescriptionsToday ?? 0} />
          <StatCard icon={Activity} label="Monthly prescriptions" value={reports?.cards?.prescriptionsThisMonth ?? 0} />
          <StatCard icon={Store} label="Monthly dispensed" value={reports?.cards?.dispensedThisMonth ?? 0} />
          <StatCard icon={Pill} label="Low stock items" value={reports?.cards?.lowStockCount ?? 0} />
        </div>

        <div className="report-grid">
          <ReportPanel title="Top medicines" eyebrow="Usage" items={(reports?.topMedicines || []).map((item: any) => ({ label: item.medicineName, value: item.count }))} />
          <ReportPanel title="Doctor prescription count" eyebrow="Performance" items={(reports?.prescriptionsByDoctor || []).map((item: any) => ({ label: item.doctorName, value: item.count }))} />
          <ReportPanel title="Patients by city" eyebrow="Coverage" items={(reports?.cityWisePatients || []).map((item: any) => ({ label: item.city, value: item.count }))} />
          <ReportPanel title="Appointments" eyebrow="Lifecycle" items={(reports?.appointmentSummary || []).map((item: any) => ({ label: labelize(item.status), value: item.count }))} />
        </div>

        <section className="section-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Recent</p>
              <h2>Latest prescriptions</h2>
            </div>
          </div>
          <DataTable
            columns={["Patient", "Doctor", "Disease", "Status", "Date"]}
            rows={(reports?.recentPrescriptions || []).map((prescription: any) => [
              prescription.patient?.user?.fullName,
              prescription.doctor?.user?.fullName,
              prescription.disease || "General",
              labelize(prescription.status),
              new Date(prescription.createdAt).toLocaleDateString("en-IN"),
            ])}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="content-stack">
      <div className="stats-grid">
        <StatCard icon={Stethoscope} label="Doctors" value={dashboard?.totalRegisteredDoctors ?? doctors.length} onClick={() => setScreen("admin")} />
        <StatCard icon={Users} label="Patients" value={dashboard?.totalRegisteredPatients ?? 0} />
        <StatCard icon={Store} label="Active pharmacies" value={dashboard?.activePharmacies ?? pharmacies.filter((item) => item.isApproved).length} onClick={() => setScreen("admin")} />
        <StatCard icon={Activity} label="Prescriptions today" value={dashboard?.totalPrescriptionsToday ?? 0} onClick={() => setScreen("inventory")} />
      </div>
      <section className="section-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">System activity</p>
            <h2>Notifications</h2>
          </div>
        </div>
        <NotificationList api={api} />
      </section>
    </div>
  );
}

function ReportPanel({ eyebrow, title, items }: { eyebrow: string; title: string; items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <section className="section-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <BarChart3 size={20} />
      </div>
      <div className="report-bars">
        {items.length ? (
          items.map((item) => (
            <div className="report-bar" key={item.label}>
              <div>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
              <div className="bar-track">
                <span style={{ width: `${Math.max(8, (item.value / max) * 100)}%` }} />
              </div>
            </div>
          ))
        ) : (
          <p className="empty-state">No report data yet.</p>
        )}
      </div>
    </section>
  );
}
