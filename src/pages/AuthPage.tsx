import { FormEvent, useState } from "react";
import { Pill } from "lucide-react";
import { Field } from "../components/ui/Field";
import { FileField } from "../components/ui/FileField";
import { ApiClient, ApiError } from "../services/api";
import { AuthMode, Role, Session, ToastFn, User } from "../types";

const acceptedProfilePhotoTypes = ["image/jpeg", "image/png", "image/webp"];
const maxProfilePhotoSize = 2 * 1024 * 1024;

type AuthPageProps = {
  api: ApiClient;
  initialMode?: AuthMode;
  onAuth: (session: Session) => void;
  notify: ToastFn;
};

export function AuthPage({ api, initialMode = "login", onAuth, notify }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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
    profilePhoto: "",
    dateOfBirth: "",
    gender: "male",
    bloodGroup: "O+",
    address: "",
    city: "",
    pincode: "",
    pharmacyId: "",
  });

  const update = (key: string, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormError("");
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const touch = (key: string) => {
    setTouched((current) => ({ ...current, [key]: true }));
    const message = validateField(key);
    setFieldErrors((current) => {
      const next = { ...current };
      if (message) {
        next[key] = message;
      } else {
        delete next[key];
      }
      return next;
    });
  };

  const changeMode = (next: AuthMode) => {
    setMode(next);
    setFormError("");
    setFieldErrors({});
    setTouched({});
    window.history.pushState({}, "", next === "login" ? "/login" : `/register/${next}`);
  };

  const validateField = (key: string) => {
    const errors: Record<string, string> = {};
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    const passwordOk = form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password);
    const phoneOk = /^[6-9]\d{9}$/.test(form.phone);
    const pincodeOk = /^\d{6}$/.test(form.pincode);
    const profilePhotoOk = !form.profilePhoto || /^data:image\/(png|jpe?g|webp);base64,/i.test(form.profilePhoto);

    if (!emailOk) errors.email = "Enter a valid email address.";
    if (!form.password) errors.password = "Password is required.";

    if (mode !== "login") {
      if (form.fullName.trim().length < 3) errors.fullName = "Full name must be at least 3 characters.";
      if (!phoneOk) errors.phone = "Enter a valid 10-digit Indian mobile number.";
      if (form.password && !passwordOk) errors.password = "Use 8+ characters with one uppercase letter and one number.";
      if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match.";
    }

    if (mode === "doctor") {
      if (form.licenseNumber.trim().length < 3) errors.licenseNumber = "Medical license number is required.";
      if (form.hospitalName.trim().length < 3) errors.hospitalName = "Hospital or clinic name is required.";
      if (form.hospitalAddress.trim().length < 5) errors.hospitalAddress = "Hospital address is required.";
      if (form.city.trim().length < 2) errors.city = "City is required.";
      if (!pincodeOk) errors.pincode = "Enter a valid 6-digit pincode.";
      if (!profilePhotoOk) errors.profilePhoto = "Choose a JPG, PNG, or WebP image.";
    }

    if (mode === "patient") {
      if (!form.dateOfBirth) errors.dateOfBirth = "Date of birth is required.";
      if (form.address.trim().length < 5) errors.address = "Address is required.";
      if (form.city.trim().length < 2) errors.city = "City is required.";
      if (!pincodeOk) errors.pincode = "Enter a valid 6-digit pincode.";
    }

    if (mode === "pharmacist") {
      if (!form.pharmacyId.trim()) errors.pharmacyId = "Pharmacy ID is required.";
      if (form.licenseNumber.trim().length < 3) errors.licenseNumber = "License number is required.";
    }

    return errors[key] || "";
  };

  const validate = () => {
    const keys = activeFieldKeys(mode);
    const errors: Record<string, string> = {};

    for (const key of keys) {
      const message = validateField(key);
      if (message) errors[key] = message;
    }

    return errors;
  };

  const isFormValid = Object.keys(validate()).length === 0;

  const chooseProfilePhoto = (file?: File) => {
    setTouched((current) => ({ ...current, profilePhoto: true }));
    setFormError("");

    if (!file) {
      update("profilePhoto", "");
      return;
    }

    if (!acceptedProfilePhotoTypes.includes(file.type)) {
      update("profilePhoto", "");
      setFieldErrors((current) => ({ ...current, profilePhoto: "Choose a JPG, PNG, or WebP image." }));
      return;
    }

    if (file.size > maxProfilePhotoSize) {
      update("profilePhoto", "");
      setFieldErrors((current) => ({ ...current, profilePhoto: "Profile photo must be 2 MB or smaller." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => update("profilePhoto", String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    setTouched(Object.fromEntries(activeFieldKeys(mode).map((key) => [key, true])));
    const validationErrors = validate();
    const firstValidationMessage = Object.values(validationErrors)[0];
    if (firstValidationMessage) {
      setFieldErrors(validationErrors);
      notify(firstValidationMessage);
      return;
    }

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
              profilePhoto: form.profilePhoto || undefined,
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
            : mode === "pharmacist"
              ? {
                ...common,
                pharmacyId: form.pharmacyId,
                licenseNumber: form.licenseNumber,
              }
              : common;

      await api.post(`/auth/register/${mode}`, payload);
      notify("Registration submitted. You can login after approval if required.");
      setMode("login");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Something went wrong";
      setFormError(message);
      notify(message);
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
          {(["login", "doctor", "patient", "pharmacist", "admin"] as AuthMode[]).map((item) => (
            <button key={item} type="button" className={mode === item ? "active" : ""} onClick={() => changeMode(item)}>
              {item === "login" ? "Login" : item}
            </button>
          ))}
        </div>

        <form className="auth-form" onSubmit={submit}>
          {formError && <div className="form-error">{formError}</div>}

          {mode !== "login" && (
            <>
              <Field label="Full name" value={form.fullName} error={touched.fullName ? fieldErrors.fullName : ""} onBlur={() => touch("fullName")} onChange={(value) => update("fullName", value)} />
              <Field label="Phone" value={form.phone} error={touched.phone ? fieldErrors.phone : ""} onBlur={() => touch("phone")} onChange={(value) => update("phone", value)} />
            </>
          )}
          <Field label="Email" value={form.email} type="email" error={touched.email ? fieldErrors.email : ""} onBlur={() => touch("email")} onChange={(value) => update("email", value)} />
          <Field label="Password" value={form.password} type="password" error={touched.password ? fieldErrors.password : ""} onBlur={() => touch("password")} onChange={(value) => update("password", value)} />
          {mode !== "login" && (
            <Field label="Confirm password" value={form.confirmPassword} type="password" error={touched.confirmPassword ? fieldErrors.confirmPassword : ""} onBlur={() => touch("confirmPassword")} onChange={(value) => update("confirmPassword", value)} />
          )}

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
              <Field label="License number" value={form.licenseNumber} error={touched.licenseNumber ? fieldErrors.licenseNumber : ""} onBlur={() => touch("licenseNumber")} onChange={(value) => update("licenseNumber", value)} />
              <Field label="Specialization" value={form.specialization} onChange={(value) => update("specialization", value)} />
              <Field label="Hospital name" value={form.hospitalName} error={touched.hospitalName ? fieldErrors.hospitalName : ""} onBlur={() => touch("hospitalName")} onChange={(value) => update("hospitalName", value)} />
              <Field label="Hospital address" value={form.hospitalAddress} error={touched.hospitalAddress ? fieldErrors.hospitalAddress : ""} onBlur={() => touch("hospitalAddress")} onChange={(value) => update("hospitalAddress", value)} />
              <FileField label="Profile photo" accept="image/png,image/jpeg,image/webp" preview={form.profilePhoto} error={touched.profilePhoto ? fieldErrors.profilePhoto : ""} onChange={chooseProfilePhoto} />
              <Field label="City" value={form.city} error={touched.city ? fieldErrors.city : ""} onBlur={() => touch("city")} onChange={(value) => update("city", value)} />
              <Field label="Pincode" value={form.pincode} error={touched.pincode ? fieldErrors.pincode : ""} onBlur={() => touch("pincode")} onChange={(value) => update("pincode", value)} />
            </div>
          )}

          {mode === "patient" && (
            <div className="form-grid">
              <Field label="Date of birth" value={form.dateOfBirth} type="date" error={touched.dateOfBirth ? fieldErrors.dateOfBirth : ""} onBlur={() => touch("dateOfBirth")} onChange={(value) => update("dateOfBirth", value)} />
              <label className="field">
                <span>Gender</span>
                <select value={form.gender} onChange={(event) => update("gender", event.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <Field label="Blood group" value={form.bloodGroup} onChange={(value) => update("bloodGroup", value)} />
              <Field label="Address" value={form.address} error={touched.address ? fieldErrors.address : ""} onBlur={() => touch("address")} onChange={(value) => update("address", value)} />
              <Field label="City" value={form.city} error={touched.city ? fieldErrors.city : ""} onBlur={() => touch("city")} onChange={(value) => update("city", value)} />
              <Field label="Pincode" value={form.pincode} error={touched.pincode ? fieldErrors.pincode : ""} onBlur={() => touch("pincode")} onChange={(value) => update("pincode", value)} />
            </div>
          )}

          {mode === "pharmacist" && (
            <div className="form-grid">
              <Field label="Pharmacy ID" value={form.pharmacyId} error={touched.pharmacyId ? fieldErrors.pharmacyId : ""} onBlur={() => touch("pharmacyId")} onChange={(value) => update("pharmacyId", value)} />
              <Field label="License number" value={form.licenseNumber} error={touched.licenseNumber ? fieldErrors.licenseNumber : ""} onBlur={() => touch("licenseNumber")} onChange={(value) => update("licenseNumber", value)} />
            </div>
          )}

          <button className="primary-button" disabled={busy || !isFormValid}>
            {busy ? "Please wait" : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}

function activeFieldKeys(mode: AuthMode) {
  const base = mode === "login" ? ["email", "password"] : ["fullName", "phone", "email", "password", "confirmPassword"];

  if (mode === "doctor") {
    return [...base, "licenseNumber", "hospitalName", "hospitalAddress", "profilePhoto", "city", "pincode"];
  }

  if (mode === "patient") {
    return [...base, "dateOfBirth", "address", "city", "pincode"];
  }

  if (mode === "pharmacist") {
    return [...base, "pharmacyId", "licenseNumber"];
  }

  return base;
}
