import { useEffect, useState } from "react";
import { ClipboardPlus, QrCode, Store } from "lucide-react";
import { PrescriptionList } from "../../components/prescriptions/PrescriptionList";
import { QrModal } from "../../components/qr/QrModal";
import { StatCard } from "../../components/ui/StatCard";
import { demoPharmacies, demoPrescriptions } from "../../data/mockData";
import { ApiClient, ApiError } from "../../services/api";
import { Prescription, QrPreview, Screen, ToastFn } from "../../types";
import { AvailabilityPanel } from "../shared/AvailabilityPanel";

type PatientPanelProps = {
  api: ApiClient;
  screen: Screen;
  notify: ToastFn;
};

export function PatientPanel({ api, screen, notify }: PatientPanelProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [qrPreview, setQrPreview] = useState<QrPreview | null>(null);

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
        onShowQr={async (prescription) => {
          try {
            const response = await api.get<{ prescription: Prescription }>(`/patient/prescriptions/${prescription.id}/qr`);
            setQrPreview({
              title: `Prescription ${response.prescription.id}`,
              image: response.prescription.qrCode,
              token: response.prescription.qrCodeToken,
            });
          } catch (error) {
            notify(error instanceof ApiError ? error.message : "QR code could not be opened");
          }
        }}
        onRefill={async (id) => {
          try {
            await api.post(`/patient/prescriptions/${id}/refill-request`);
            notify("Refill request sent to the doctor.");
          } catch (error) {
            notify(error instanceof ApiError ? error.message : "Refill request could not be sent");
          }
        }}
      />
      {qrPreview && <QrModal qr={qrPreview} onClose={() => setQrPreview(null)} />}
    </div>
  );
}
