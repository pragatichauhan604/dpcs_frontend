import { useEffect, useState } from "react";
import { ClipboardPlus, Pill, QrCode, Search } from "lucide-react";
import { Field } from "../../components/ui/Field";
import { demoMedicines } from "../../data/mockData";
import { ApiClient, ApiError } from "../../services/api";
import { Medicine, PrescriptionItem, ToastFn } from "../../types";

const emptyItem: PrescriptionItem = {
  medicineName: "",
  dosage: "",
  frequency: "twice_daily",
  durationDays: 5,
  timing: "after_food",
  quantityToTake: "1 tablet",
  instructions: "",
};

type CreatePrescriptionProps = {
  api: ApiClient;
  notify: ToastFn;
};

export function CreatePrescription({ api, notify }: CreatePrescriptionProps) {
  const [patientSearch, setPatientSearch] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [patientId, setPatientId] = useState("");
  const [disease, setDisease] = useState("");
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
        disease: disease || undefined,
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
      setDisease("");
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
        <div className="form-grid" style={{ marginTop: 14 }}>
          <Field label="Disease / diagnosis" value={disease} onChange={setDisease} />
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
