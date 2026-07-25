import { useEffect, useState } from "react";
import { Activity, Pill, Stethoscope, Store, Users } from "lucide-react";
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
  const [medicine, setMedicine] = useState({ brandName: "", genericName: "", category: "", dosageForms: "Tablet", standardStrength: "" });

  useEffect(() => {
    api.get<any>("/admin/dashboard").then(setDashboard).catch(() => setDashboard(null));
    api.get<{ doctors: any[] }>("/admin/doctors").then((data) => setDoctors(data.doctors)).catch(() => setDoctors([]));
    api.get<{ pharmacies: any[] }>("/admin/pharmacies").then((data) => setPharmacies(data.pharmacies)).catch(() => setPharmacies(demoPharmacies));
    api.get<{ pharmacists: any[] }>("/admin/pharmacists").then((data) => setPharmacists(data.pharmacists)).catch(() => setPharmacists([]));
  }, [api]);

  const approveDoctor = async (id: string) => {
    try {
      await api.patch(`/admin/doctors/${id}/approval`, { isApproved: true });
      setDoctors((current) => current.map((doctor) => (doctor.id === id ? { ...doctor, isApproved: true } : doctor)));
      notify("Doctor approved.");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "Doctor approval failed");
    }
  };

  const approvePharmacy = async (id: string) => {
    try {
      await api.patch(`/admin/pharmacies/${id}/approval`, { isApproved: true });
      setPharmacies((current) => current.map((pharmacy) => (pharmacy.id === id ? { ...pharmacy, isApproved: true } : pharmacy)));
      notify("Pharmacy approved.");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "Pharmacy approval failed");
    }
  };

  const approvePharmacist = async (id: string) => {
    try {
      await api.patch(`/admin/pharmacists/${id}/approval`, { isApproved: true });
      setPharmacists((current) => current.map((pharmacist) => (pharmacist.id === id ? { ...pharmacist, isApproved: true } : pharmacist)));
      notify("Pharmacist approved.");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "Pharmacist approval failed");
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
              <button className="table-action" onClick={() => approveDoctor(doctor.id)} disabled={doctor.isApproved}>
                Approve
              </button>,
            ])}
          />
        </section>
        <section className="section-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Approvals</p>
              <h2>Pharmacies</h2>
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
              <button className="table-action" onClick={() => approvePharmacy(pharmacy.id)} disabled={pharmacy.isApproved}>
                Approve
              </button>,
            ])}
          />
        </section>
        <section className="section-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Approvals</p>
              <h2>Pharmacists</h2>
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
              <button className="table-action" onClick={() => approvePharmacist(pharmacist.id)} disabled={pharmacist.isApproved}>
                Approve
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
