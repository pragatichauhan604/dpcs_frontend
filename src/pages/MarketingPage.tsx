import { Activity, ClipboardCheck, LockKeyhole, Pill, QrCode, ShieldCheck, Stethoscope, Store, UserPlus, Users } from "lucide-react";

type MarketingPageProps = {
  onNavigate: (path: string) => void;
};

export function MarketingPage({ onNavigate }: MarketingPageProps) {
  return (
    <main className="marketing-page">
      <nav className="marketing-nav">
        <div className="marketing-brand">
          <div className="brand-mark small">
            <Pill size={22} />
          </div>
          <strong>DPCS</strong>
        </div>
        <div className="marketing-actions">
          <button className="ghost-button compact" onClick={() => onNavigate("/register/patient")}>
            <UserPlus size={17} />
            Register
          </button>
          <button className="primary-button compact" onClick={() => onNavigate("/login")}>
            <LockKeyhole size={17} />
            Login
          </button>
        </div>
      </nav>

      <section className="marketing-hero">
        <div className="hero-copy">
          <p className="eyebrow">Digital healthcare workflow</p>
          <h1>Digital Prescription and Pharmacy Coordination System</h1>
          <p>
            Create verified prescriptions, generate QR codes, let patients view treatment details, and help pharmacies
            dispense medicine with confidence.
          </p>
          <div className="hero-buttons">
            <button className="primary-button" onClick={() => onNavigate("/register/patient")}>
              <UserPlus size={18} />
              Register
            </button>
            <button className="ghost-button" onClick={() => onNavigate("/login")}>
              <LockKeyhole size={18} />
              Login
            </button>
          </div>
        </div>

        <div className="product-preview" aria-label="DPCS product preview">
          <div className="preview-toolbar">
            <span />
            <span />
            <span />
          </div>
          <div className="preview-grid">
            <div className="preview-card wide">
              <div>
                <p className="eyebrow">Prescription</p>
                <strong>Fever treatment</strong>
                <span>Dr. Kavya Sharma</span>
              </div>
              <QrCode size={54} />
            </div>
            <div className="preview-card">
              <Stethoscope size={24} />
              <strong>Doctor</strong>
              <span>Create Rx</span>
            </div>
            <div className="preview-card">
              <Store size={24} />
              <strong>Pharmacy</strong>
              <span>Verify QR</span>
            </div>
            <div className="preview-card wide accent">
              <Activity size={24} />
              <div>
                <strong>Medicine availability</strong>
                <span>Find stock by city and pharmacy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="register-band">
        <div className="section-head">
          <div>
            <p className="eyebrow">Create account</p>
            <h2>Register by role</h2>
          </div>
        </div>
        <div className="register-grid">
          {[
            { label: "Doctor", path: "/register/doctor", icon: Stethoscope },
            { label: "Patient", path: "/register/patient", icon: Users },
            { label: "Pharmacist", path: "/register/pharmacist", icon: Store },
            { label: "Admin", path: "/register/admin", icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button className="register-option" key={item.path} onClick={() => onNavigate(item.path)}>
                <Icon size={24} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="feature-band">
        {[
          { icon: ClipboardCheck, title: "Digital prescriptions", text: "Doctors issue structured prescriptions with medicines, dosage, disease, and QR token." },
          { icon: QrCode, title: "QR verification", text: "Patients and pharmacies can access prescription QR details securely." },
          { icon: ShieldCheck, title: "Admin approval", text: "Doctors and pharmacies are controlled through admin approval before full access." },
        ].map((feature) => {
          const Icon = feature.icon;
          return (
            <article className="feature-item" key={feature.title}>
              <Icon size={24} />
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          );
        })}
      </section>
    </main>
  );
}
