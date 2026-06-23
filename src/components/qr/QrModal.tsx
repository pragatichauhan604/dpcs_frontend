import { QrCode, X } from "lucide-react";
import { QrPreview } from "../../types";

type QrModalProps = {
  qr: QrPreview;
  onClose: () => void;
};

export function QrModal({ qr, onClose }: QrModalProps) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Prescription QR code">
      <section className="qr-modal">
        <div className="section-head">
          <div>
            <p className="eyebrow">QR Code</p>
            <h2>{qr.title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close QR preview">
            <X size={18} />
          </button>
        </div>
        {qr.image ? (
          <img className="qr-image" src={qr.image} alt="Prescription QR code" />
        ) : (
          <div className="qr-empty">
            <QrCode size={46} />
            <strong>QR image is not available for this record.</strong>
          </div>
        )}
        {qr.token && (
          <div className="qr-token">
            <span>Token</span>
            <code>{qr.token}</code>
          </div>
        )}
      </section>
    </div>
  );
}
