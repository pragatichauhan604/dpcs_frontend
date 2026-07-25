import { useEffect, useState } from "react";
import { QrCode, ShieldCheck } from "lucide-react";
import { PrescriptionList } from "../../components/prescriptions/PrescriptionList";
import { QrModal } from "../../components/qr/QrModal";
import { DataTable } from "../../components/ui/DataTable";
import { demoMedicines, demoPrescriptions } from "../../data/mockData";
import { ApiClient, ApiError } from "../../services/api";
import { Prescription, QrPreview, Screen, ToastFn } from "../../types";

type PharmacyPanelProps = {
  api: ApiClient;
  screen: Screen;
  notify: ToastFn;
};

export function PharmacyPanel({ api, screen, notify }: PharmacyPanelProps) {
  const [token, setToken] = useState("");
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [qrPreview, setQrPreview] = useState<QrPreview | null>(null);

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
      const scannedToken = extractScannedToken(token);
      const response = await api.get<{ prescription: Prescription }>(`/pharmacy/prescriptions/scan/${encodeURIComponent(scannedToken)}`);
      setPrescription(response.prescription);
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "QR token not found");
      setPrescription(null);
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

  const downloadPdf = async (item: Prescription) => {
    try {
      const blob = await api.download(`/pharmacy/prescriptions/${item.id}/pdf`);
      saveBlob(blob, `prescription-${item.id}.pdf`);
      notify("Prescription PDF downloaded.");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "Prescription PDF could not be downloaded");
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
          <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Paste scanned QR token or full QR PDF link" />
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
          <PrescriptionList
            prescriptions={[prescription]}
            audience="pharmacy"
            onShowQr={(item) =>
              setQrPreview({
                title: `Prescription ${item.id}`,
                image: item.qrCode,
                token: item.qrCodeToken,
              })
            }
            onDownloadPdf={downloadPdf}
          />
        </section>
      )}
      {qrPreview && <QrModal qr={qrPreview} onClose={() => setQrPreview(null)} />}
    </div>
  );
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function extractScannedToken(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/\/qr\/([^/]+)\/pdf/i);
  return match?.[1] || trimmed;
}
