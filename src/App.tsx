import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bell,
  ClipboardPlus,
  LogOut,
  Menu,
  Pill,
  QrCode,
  Search,
  ShieldCheck,
  Stethoscope,
  Store,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { ApiClient, ApiError, createApi } from "./api";
import { demoMedicines, demoNotifications, demoPharmacies, demoPrescriptions } from "./mockData";
import { Medicine, Notification, Prescription, PrescriptionItem, Role, User } from "./types";

type AuthMode = "login" | "doctor" | "patient" | "pharmacist";
type Screen = "dashboard" | "prescriptions" | "create" | "pharmacies" | "inventory" | "admin";

type Session = {
  token: string;
  user: User;
};

const storageKey = "dpcs-session";

const emptyItem: PrescriptionItem = {
  medicineName: "",
  dosage: "",
  frequency: "twice_daily",
  durationDays: 5,
  timing: "after_food",
  quantityToTake: "1 tablet",
  instructions: "",
};

export function App() {
  const [session, setSession] = useState<Session | null>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  });
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <div className="app-shell">
      <Sidebar
        role={session.user.role}
        current={screen}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={(next) => {
          setScreen(next);
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
            <button className="ghost-button" onClick={logout}>
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

        <RoleView api={api} session={session} screen={screen} setScreen={setScreen} notify={notify} />
      </main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function AuthPage({ api, onAuth, notify }: { api: ApiClient; onAuth: (session: Session) => void; notify: (message: string) => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "patient" as Role,
    licenseNumber: "",
    specialization: "General Physician",
    hospitalName: "",
    hospitalAddress: "",
    dateOfBirth: "",
    gender: "male",
    bloodGroup: "O+",
    address: "",
    city: "",
    pincode: "",
    pharmacyId: "",
  });

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const response = await api.post<{ token: string; user: User }>("/auth/login", {
          email: form.email,
          password: form.password,
          role: form.role,
          rememberMe: true,
        });
        onAuth(response);
        return;
      }

      const endpoint = `/auth/register/${mode}`;
      const common = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        phone: form.phone,
      };

      const payload =
        mode === "doctor"
          ? {
              ...common,
              licenseNumber: form.licenseNumber,
              specialization: form.specialization,
              hospitalName: form.hospitalName,
              hospitalAddress: form.hospitalAddress,
              city: form.city,
              pincode: form.pincode,
            }
          : mode === "patient"
            ? {
                ...common,
                dateOfBirth: form.dateOfBirth,
                gender: form.gender,
                bloodGroup: form.bloodGroup,
                address: form.address,
                city: form.city,
                pincode: form.pincode,
              }
            : {
                ...common,
                pharmacyId: form.pharmacyId,
                licenseNumber: form.licenseNumber,
              };

      await api.post(endpoint, payload);
      notify("Registration submitted. You can login after approval if required.");
      setMode("login");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="brand-lockup">
          <div className="brand-mark">
            <Pill size={28} />
          </div>
          <div>
            <p className="eyebrow">DPCS</p>
            <h1>Digital Prescription System</h1>
          </div>
        </div>

        <div className="segmented">
          {(["login", "doctor", "patient", "pharmacist"] as AuthMode[]).map((item) => (
            <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}>
              {item === "login" ? "Login" : item}
            </button>
          ))}
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode !== "login" && (
            <>
              <Field label="Full name" value={form.fullName} onChange={(value) => update("fullName", value)} />
              <Field label="Phone" value={form.phone} onChange={(value) => update("phone", value)} />
            </>
          )}
          <Field label="Email" value={form.email} type="email" onChange={(value) => update("email", value)} />
          <Field label="Password" value={form.password} type="password" onChange={(value) => update("password", value)} />
          {mode !== "login" && <Field label="Confirm password" value={form.confirmPassword} type="password" onChange={(value) => update("confirmPassword", value)} />}

          {mode === "login" && (
            <label className="field">
              <span>Role</span>
              <select value={form.role} onChange={(event) => update("role", event.target.value)}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}

          {mode === "doctor" && (
            <div className="form-grid">
              <Field label="License number" value={form.licenseNumber} onChange={(value) => update("licenseNumber", value)} />
              <Field label="Specialization" value={form.specialization} onChange={(value) => update("specialization", value)} />
              <Field label="Hospital name" value={form.hospitalName} onChange={(value) => update("hospitalName", value)} />
              <Field label="Hospital address" value={form.hospitalAddress} onChange={(value) => update("hospitalAddress", value)} />
              <Field label="City" value={form.city} onChange={(value) => update("city", value)} />
              <Field label="Pincode" value={form.pincode} onChange={(value) => update("pincode", value)} />
            </div>
          )}

          {mode === "patient" && (
            <div className="form-grid">
              <Field label="Date of birth" value={form.dateOfBirth} type="date" onChange={(value) => update("dateOfBirth", value)} />
              <label className="field">
                <span>Gender</span>
                <select value={form.gender} onChange={(event) => update("gender", event.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <Field label="Blood group" value={form.bloodGroup} onChange={(value) => update("bloodGroup", value)} />
              <Field label="Address" value={form.address} onChange={(value) => update("address", value)} />
              <Field label="City" value={form.city} onChange={(value) => update("city", value)} />
              <Field label="Pincode" value={form.pincode} onChange={(value) => update("pincode", value)} />
            </div>
          )}

          {mode === "pharmacist" && (
            <div className="form-grid">
              <Field label="Pharmacy ID" value={form.pharmacyId} onChange={(value) => update("pharmacyId", value)} />
              <Field label="License number" value={form.licenseNumber} onChange={(value) => update("licenseNumber", value)} />
            </div>
          )}

          <button className="primary-button" disabled={busy}>
            {busy ? "Please wait" : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Sidebar({
  role,
  current,
  open,
  onClose,
  onNavigate,
}: {
  role: Role;
  current: Screen;
  open: boolean;
  onClose: () => void;
  onNavigate: (screen: Screen) => void;
}) {
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

function RoleView({
  api,
  session,
  screen,
  setScreen,
  notify,
}: {
  api: ApiClient;
  session: Session;
  screen: Screen;
  setScreen: (screen: Screen) => void;
  notify: (message: string) => void;
}) {
  if (session.user.role === "doctor") {
    return <DoctorPanel api={api} screen={screen} setScreen={setScreen} notify={notify} />;
  }
  if (session.user.role === "patient") {
    return <PatientPanel api={api} screen={screen} notify={notify} />;
  }
  if (session.user.role === "pharmacist") {
    return <PharmacyPanel api={api} screen={screen} notify={notify} />;
  }
  return <AdminPanel api={api} screen={screen} notify={notify} />;
}

function DoctorPanel({ api, screen, setScreen, notify }: { api: ApiClient; screen: Screen; setScreen: (screen: Screen) => void; notify: (message: string) => void }) {
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

function CreatePrescription({ api, notify }: { api: ApiClient; notify: (message: string) => void }) {
  const [patientSearch, setPatientSearch] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [patientId, setPatientId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PrescriptionItem[]>([{ ...emptyItem }]);
  const [medicines, setMedicines] = useState<Medicine[]>(demoMedicines);

  useEffect(() => {
    api.get<{ medicines: Medicine[] }>("/catalog/medicines").then((data) => setMedicines(data.medicines)).catch(() => setMedicines(demoMedicines));
  }, [api]);

  useEffect(() => {
    if (!patientSearch.trim()) return;
    const timer = window.setTimeout(() => {
      api.get<{ patients: any[] }>(`/doctor/patients/search?q=${encodeURIComponent(patientSearch)}`).then((data) => setPatients(data.patients)).catch(() => setPatients([]));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [api, patientSearch]);

  const updateItem = (index: number, key: keyof PrescriptionItem, value: string | number) => {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  };

  const submit = async () => {
    try {
      await api.post("/doctor/prescriptions", {
        patientId,
        notes,
        items: items.map((item) => ({
          ...item,
          durationDays: Number(item.durationDays),
          medicineId: item.medicineId || undefined,
        })),
      });
      notify("Prescription issued with QR code.");
      setItems([{ ...emptyItem }]);
      setNotes("");
      setPatientId("");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "Prescription could not be saved");
    }
  };

  return (
    <div className="content-stack">
      <section className="section-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Step 1</p>
            <h2>Select patient</h2>
          </div>
        </div>
        <div className="search-box">
          <Search size={18} />
          <input value={patientSearch} onChange={(event) => setPatientSearch(event.target.value)} placeholder="Search by patient name or phone" />
        </div>
        <div className="result-list">
          {patients.map((patient) => (
            <button key={patient.id} className={patientId === patient.id ? "selected" : ""} onClick={() => setPatientId(patient.id)}>
              <strong>{patient.user?.fullName}</strong>
              <span>{patient.user?.phone} · {patient.bloodGroup || "Blood group not set"}</span>
            </button>
          ))}
          {!patients.length && <p className="empty-state">Search for an existing patient to continue.</p>}
        </div>
      </section>

      <section className="section-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Step 2</p>
            <h2>Add medicines</h2>
          </div>
          <button className="ghost-button" onClick={() => setItems((current) => [...current, { ...emptyItem }])}>
            <Pill size={17} />
            Add medicine
          </button>
        </div>
        <div className="medicine-stack">
          {items.map((item, index) => (
            <div className="medicine-editor" key={index}>
              <label className="field">
                <span>Medicine</span>
                <input list="medicine-list" value={item.medicineName} onChange={(event) => updateItem(index, "medicineName", event.target.value)} />
              </label>
              <Field label="Dosage" value={item.dosage} onChange={(value) => updateItem(index, "dosage", value)} />
              <label className="field">
                <span>Frequency</span>
                <select value={item.frequency} onChange={(event) => updateItem(index, "frequency", event.target.value)}>
                  <option value="once_daily">Once daily</option>
                  <option value="twice_daily">Twice daily</option>
                  <option value="thrice_daily">Three times daily</option>
                  <option value="as_needed">As needed</option>
                </select>
              </label>
              <Field label="Days" type="number" value={String(item.durationDays)} onChange={(value) => updateItem(index, "durationDays", Number(value))} />
              <label className="field">
                <span>Timing</span>
                <select value={item.timing} onChange={(event) => updateItem(index, "timing", event.target.value)}>
                  <option value="before_food">Before food</option>
                  <option value="after_food">After food</option>
                  <option value="with_food">With food</option>
                  <option value="bedtime">Bedtime</option>
                </select>
              </label>
              <Field label="Instructions" value={item.instructions || ""} onChange={(value) => updateItem(index, "instructions", value)} />
            </div>
          ))}
        </div>
        <datalist id="medicine-list">
          {medicines.map((medicine) => (
            <option key={medicine.id} value={medicine.brandName} />
          ))}
        </datalist>
      </section>

      <section className="section-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Step 3</p>
            <h2>Review and issue</h2>
          </div>
          <button className="primary-button compact" disabled={!patientId || items.some((item) => !item.medicineName || !item.dosage)} onClick={submit}>
            <QrCode size={17} />
            Issue prescription
          </button>
        </div>
        <textarea className="notes-box" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Overall notes or follow-up instructions" />
      </section>
    </div>
  );
}

function PatientPanel({ api, screen, notify }: { api: ApiClient; screen: Screen; notify: (message: string) => void }) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    api.get<{ prescriptions: Prescription[] }>("/patient/prescriptions").then((data) => setPrescriptions(data.prescriptions)).catch(() => setPrescriptions(demoPrescriptions));
  }, [api]);

  if (screen === "pharmacies") return <AvailabilityPanel api={api} />;

  return (
    <div className="content-stack">
      <div className="stats-grid">
        <StatCard icon={ClipboardPlus} label="Active prescriptions" value={prescriptions.filter((item) => item.status === "active").length || 1} />
        <StatCard icon={QrCode} label="QR codes" value={prescriptions.length || 1} />
        <StatCard icon={Store} label="Nearby pharmacies" value={demoPharmacies.length} />
      </div>
      <PrescriptionList
        prescriptions={prescriptions.length ? prescriptions : demoPrescriptions}
        audience="patient"
        onRefill={async (id) => {
          try {
            await api.post(`/patient/prescriptions/${id}/refill-request`);
            notify("Refill request sent to the doctor.");
          } catch (error) {
            notify(error instanceof ApiError ? error.message : "Refill request could not be sent");
          }
        }}
      />
    </div>
  );
}

function PharmacyPanel({ api, screen, notify }: { api: ApiClient; screen: Screen; notify: (message: string) => void }) {
  const [token, setToken] = useState("");
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    api.get<{ inventory: any[] }>("/pharmacy/inventory").then((data) => setInventory(data.inventory)).catch(() => setInventory([]));
  }, [api]);

  if (screen === "inventory") {
    return (
      <section className="section-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Stock control</p>
            <h2>Inventory</h2>
          </div>
        </div>
        <DataTable
          columns={["Medicine", "Quantity", "Batch", "Reorder level"]}
          rows={(inventory.length ? inventory : demoMedicines.map((medicine) => ({ medicineName: medicine.brandName, quantity: 24, batchNumber: "B-2026", reorderLevel: 10 }))).map((item) => [
            item.medicineName,
            item.quantity,
            item.batchNumber || "-",
            item.reorderLevel,
          ])}
        />
      </section>
    );
  }

  const scan = async () => {
    try {
      const response = await api.get<{ prescription: Prescription }>(`/pharmacy/prescriptions/scan/${token}`);
      setPrescription(response.prescription);
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "QR token not found");
      setPrescription(demoPrescriptions[0]);
    }
  };

  const dispense = async () => {
    if (!prescription) return;
    try {
      await api.post(`/pharmacy/prescriptions/${prescription.id}/dispense`, { status: "completed" });
      notify("Prescription marked as dispensed.");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "Dispense failed");
    }
  };

  return (
    <div className="content-stack">
      <section className="section-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Scan and dispense</p>
            <h2>Prescription QR lookup</h2>
          </div>
          <button className="primary-button compact" onClick={scan}>
            <QrCode size={17} />
            Scan
          </button>
        </div>
        <div className="search-box">
          <QrCode size={18} />
          <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Paste scanned QR token" />
        </div>
      </section>
      {prescription && (
        <section className="section-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Verification</p>
              <h2>{prescription.patient?.user?.fullName || "Patient prescription"}</h2>
            </div>
            <button className="primary-button compact" onClick={dispense}>
              <ShieldCheck size={17} />
              Confirm dispense
            </button>
          </div>
          <PrescriptionList prescriptions={[prescription]} audience="pharmacy" />
        </section>
      )}
    </div>
  );
}

function AdminPanel({ api, screen, notify }: { api: ApiClient; screen: Screen; notify: (message: string) => void }) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [medicine, setMedicine] = useState({ brandName: "", genericName: "", category: "", dosageForms: "Tablet", standardStrength: "" });

  useEffect(() => {
    api.get<any>("/admin/dashboard").then(setDashboard).catch(() => setDashboard(null));
    api.get<{ doctors: any[] }>("/admin/doctors").then((data) => setDoctors(data.doctors)).catch(() => setDoctors([]));
    api.get<{ pharmacies: any[] }>("/admin/pharmacies").then((data) => setPharmacies(data.pharmacies)).catch(() => setPharmacies(demoPharmacies));
  }, [api]);

  const approveDoctor = async (id: string) => {
    await api.patch(`/admin/doctors/${id}/approval`, { isApproved: true });
    notify("Doctor approved.");
  };

  const approvePharmacy = async (id: string) => {
    await api.patch(`/admin/pharmacies/${id}/approval`, { isApproved: true });
    notify("Pharmacy approved.");
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
              <button className="table-action" onClick={() => approveDoctor(doctor.id)} disabled={doctor.isApproved}>Approve</button>,
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
            columns={["Name", "City", "Phone", "Status", "Action"]}
            rows={pharmacies.map((pharmacy) => [
              pharmacy.name,
              pharmacy.city,
              pharmacy.phone,
              pharmacy.isApproved ? "Active" : "Pending",
              <button className="table-action" onClick={() => approvePharmacy(pharmacy.id)} disabled={pharmacy.isApproved}>Approve</button>,
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
        <StatCard icon={Stethoscope} label="Doctors" value={dashboard?.totalRegisteredDoctors ?? doctors.length} />
        <StatCard icon={Users} label="Patients" value={dashboard?.totalRegisteredPatients ?? 0} />
        <StatCard icon={Store} label="Active pharmacies" value={dashboard?.activePharmacies ?? pharmacies.filter((item) => item.isApproved).length} />
        <StatCard icon={Activity} label="Prescriptions today" value={dashboard?.totalPrescriptionsToday ?? 0} />
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

function AvailabilityPanel({ api }: { api: ApiClient }) {
  const [medicineId, setMedicineId] = useState("");
  const [city, setCity] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>(demoMedicines);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    api.get<{ medicines: Medicine[] }>("/catalog/medicines").then((data) => setMedicines(data.medicines)).catch(() => setMedicines(demoMedicines));
  }, [api]);

  const search = () => {
    const params = new URLSearchParams();
    if (medicineId) params.set("medicineId", medicineId);
    if (city) params.set("city", city);
    api.get<{ inventory: any[] }>(`/catalog/availability?${params.toString()}`).then((data) => setInventory(data.inventory)).catch(() => setInventory([]));
  };

  return (
    <section className="section-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Medicine stock</p>
          <h2>Nearby pharmacy availability</h2>
        </div>
        <button className="primary-button compact" onClick={search}>
          <Search size={17} />
          Search
        </button>
      </div>
      <div className="filters-row">
        <label className="field">
          <span>Medicine</span>
          <select value={medicineId} onChange={(event) => setMedicineId(event.target.value)}>
            <option value="">All medicines</option>
            {medicines.map((medicine) => (
              <option key={medicine.id} value={medicine.id}>{medicine.brandName}</option>
            ))}
          </select>
        </label>
        <Field label="City" value={city} onChange={setCity} />
      </div>
      <DataTable
        columns={["Pharmacy", "Medicine", "Quantity", "City", "Phone"]}
        rows={(inventory.length ? inventory : demoPharmacies.map((pharmacy, index) => ({ pharmacy, medicine: demoMedicines[index % demoMedicines.length], quantity: 18 + index }))).map((item) => [
          item.pharmacy?.name,
          item.medicine?.brandName || item.medicineName,
          item.quantity,
          item.pharmacy?.city,
          item.pharmacy?.phone,
        ])}
      />
    </section>
  );
}

function NotificationList({ api }: { api: ApiClient }) {
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications);

  useEffect(() => {
    api.get<{ notifications: Notification[] }>("/notifications").then((data) => setNotifications(data.notifications)).catch(() => setNotifications(demoNotifications));
  }, [api]);

  return (
    <div className="notification-list">
      {notifications.map((notification) => (
        <div key={notification.id} className={notification.isRead ? "read" : ""}>
          <Bell size={18} />
          <div>
            <strong>{notification.title}</strong>
            <span>{notification.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PrescriptionList({ prescriptions, audience, onRefill }: { prescriptions: Prescription[]; audience: "doctor" | "patient" | "pharmacy"; onRefill?: (id: string) => void }) {
  return (
    <div className="prescription-grid">
      {prescriptions.map((prescription) => (
        <article className="prescription-card" key={prescription.id}>
          <div className="card-topline">
            <span className={`status ${prescription.status}`}>{prescription.status}</span>
            <span>{new Date(prescription.issuedDate).toLocaleDateString()}</span>
          </div>
          <h3>{audience === "doctor" ? prescription.patient?.user?.fullName || "Patient" : prescription.doctor?.user?.fullName || "Doctor"}</h3>
          <p>{prescription.notes || "No additional notes added."}</p>
          <div className="medicine-list">
            {prescription.items.map((item, index) => (
              <div key={`${item.medicineName}-${index}`}>
                <Pill size={16} />
                <span>{item.medicineName}</span>
                <small>{item.dosage} · {formatEnum(item.frequency)} · {item.durationDays} days</small>
              </div>
            ))}
          </div>
          <div className="card-actions">
            {audience !== "doctor" && (
              <button className="ghost-button compact">
                <QrCode size={16} />
                QR
              </button>
            )}
            {audience === "patient" && (
              <button className="ghost-button compact" onClick={() => onRefill?.(prescription.id)}>
                <Bell size={16} />
                Refill
              </button>
            )}
            <span>Expires {new Date(prescription.expiryDate).toLocaleDateString()}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function DataTable({ columns, rows }: { columns: string[]; rows: (React.ReactNode[])[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => <th key={column}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number | string }) {
  return (
    <article className="stat-card">
      <Icon size={21} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

const navFor = (role: Role): { label: string; screen: Screen; icon: React.ElementType }[] => {
  if (role === "doctor") {
    return [
      { label: "Dashboard", screen: "dashboard", icon: Activity },
      { label: "Create prescription", screen: "create", icon: ClipboardPlus },
      { label: "History", screen: "prescriptions", icon: Pill },
      { label: "Availability", screen: "pharmacies", icon: Store },
    ];
  }
  if (role === "patient") {
    return [
      { label: "My prescriptions", screen: "dashboard", icon: ClipboardPlus },
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
  ];
};

const titleFor = (role: Role, screen: Screen) => {
  const label = navFor(role).find((item) => item.screen === screen)?.label || "Dashboard";
  return label;
};

const formatEnum = (value: string) => value.replaceAll("_", " ");

const labelize = (value: string) => value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
