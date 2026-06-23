import { FormEvent, useState } from "react";
import { Pill } from "lucide-react";
import { Field } from "../components/ui/Field";
import { ApiClient, ApiError } from "../services/api";
import { AuthMode, Role, Session, ToastFn, User } from "../types";

type AuthPageProps = {
  api: ApiClient;
  onAuth: (session: Session) => void;
  notify: ToastFn;
};

export function AuthPage({ api, onAuth, notify }: AuthPageProps) {
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

  const submit = async (event: FormEvent) => {
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

      await api.post(`/auth/register/${mode}`, payload);
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
