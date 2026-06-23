import { Bell, Pill, QrCode } from "lucide-react";
import { Prescription } from "../../types";
import { formatCode } from "../../utils/format";

type PrescriptionListProps = {
  prescriptions: Prescription[];
  audience: "doctor" | "patient" | "pharmacy";
  onRefill?: (id: string) => void;
  onShowQr?: (prescription: Prescription) => void;
};

export function PrescriptionList({ prescriptions, audience, onRefill, onShowQr }: PrescriptionListProps) {
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
                <small>
                  {item.dosage} · {formatCode(item.frequency)} · {item.durationDays} days
                </small>
              </div>
            ))}
          </div>
          <div className="card-actions">
            {audience !== "doctor" && (
              <button className="ghost-button compact" onClick={() => onShowQr?.(prescription)}>
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
