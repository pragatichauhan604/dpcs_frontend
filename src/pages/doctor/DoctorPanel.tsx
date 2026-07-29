import { useEffect, useState } from "react";
import { Bell, CalendarCheck, ClipboardPlus, Users } from "lucide-react";
import { PrescriptionList } from "../../components/prescriptions/PrescriptionList";
import { QrModal } from "../../components/qr/QrModal";
import { StatCard } from "../../components/ui/StatCard";
import { demoPrescriptions } from "../../data/mockData";
import { ApiClient } from "../../services/api";
import { AppointmentRequest, Prescription, QrPreview, Screen, ToastFn } from "../../types";
import { AvailabilityPanel } from "../shared/AvailabilityPanel";
import { CreatePrescription } from "./CreatePrescription";

type DoctorPanelProps = {
  api: ApiClient;
  screen: Screen;
  setScreen: (screen: Screen) => void;
  notify: ToastFn;
};

export function DoctorPanel({ api, screen, setScreen, notify }: DoctorPanelProps) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [qrPreview, setQrPreview] = useState<QrPreview | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRequest | null>(null);
  const [prescriptionPatient, setPrescriptionPatient] = useState<AppointmentRequest | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [doctorNote, setDoctorNote] = useState("");

  useEffect(() => {
    api.get<any>("/doctor/dashboard").then(setDashboard).catch(() => setDashboard(null));
    api
      .get<{ prescriptions: Prescription[] }>("/doctor/prescriptions")
      .then((data) => setPrescriptions(data.prescriptions))
      .catch(() => setPrescriptions(demoPrescriptions));
  }, [api]);

  const appointmentRequests: AppointmentRequest[] = dashboard?.appointmentRequests || [];

  function showQr(prescription: Prescription) {
    setQrPreview({
      title: `Prescription ${prescription.id}`,
      image: prescription.qrCode,
      token: prescription.qrCodeToken,
    });
  }

  function openAppointment(request: AppointmentRequest) {
    if (request.status === "completed") {
      notify("Prescription already created for this appointment.");
      return;
    }

    if (request.status === "scheduled") {
      openPrescriptionForAppointment(request);
      return;
    }

    setSelectedAppointment(request);
    setScheduledAt(toDateTimeInputValue(request.scheduledAt || request.requestedDate));
    setDoctorNote(request.doctorNote || "");
  }

  function openPrescriptionForAppointment(request: AppointmentRequest) {
    setPrescriptionPatient(request);
    setSelectedAppointment(null);
    setScreen("create");
  }

  function markAppointmentCompleted(appointmentId?: string) {
    if (appointmentId) {
      setDashboard((current: any) => {
        if (!current) return current;
        return {
          ...current,
          appointmentRequests: (current.appointmentRequests || []).map((item: AppointmentRequest) =>
            item.id === appointmentId ? { ...item, status: "completed" } : item,
          ),
        };
      });
    }

    setPrescriptionPatient(null);
    setScreen("dashboard");
  }

  async function scheduleAppointment() {
    if (!selectedAppointment || !scheduledAt) {
      notify("Choose appointment date and time.");
      return;
    }

    try {
      const response = await api.post<{ appointment: AppointmentRequest }>(
        `/doctor/appointments/${selectedAppointment.id}/schedule`,
        { scheduledAt, doctorNote },
      );

      setDashboard((current: any) => {
        if (!current) return current;
        const nextAppointments = (current.appointmentRequests || []).map((item: AppointmentRequest) =>
          item.id === response.appointment.id ? response.appointment : item,
        );

        return {
          ...current,
          appointmentRequests: nextAppointments,
          pendingAppointmentRequests: nextAppointments.filter((item: AppointmentRequest) => item.status === "requested").length,
        };
      });

      setSelectedAppointment(null);
      notify("Appointment scheduled and sent to patient.");
    } catch {
      notify("Could not schedule appointment.");
    }
  }

  const appointmentModal = selectedAppointment ? (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Schedule appointment">
      <section className="qr-modal appointment-modal">
        <div className="section-head">
          <div>
            <p className="eyebrow">Appointment</p>
            <h2>{selectedAppointment.status === "scheduled" ? "Appointment details" : "Give appointment"}</h2>
          </div>
          <button className="icon-button" onClick={() => setSelectedAppointment(null)} aria-label="Close appointment form">
            x
          </button>
        </div>
        <div className="auth-form">
          <div className="identity-strip">
            <div className="avatar">{selectedAppointment.patientName.slice(0, 1)}</div>
            <div>
              <strong>{selectedAppointment.patientName}</strong>
              <span>
                {selectedAppointment.patientPhone} | {selectedAppointment.patientEmail}
              </span>
            </div>
          </div>
          <p className="empty-state">Patient requested: {formatDateTime(selectedAppointment.requestedDate)}</p>
          {selectedAppointment.status === "scheduled" && (
            <p className="empty-state">Current appointment: {formatDateTime(selectedAppointment.scheduledAt)}</p>
          )}
          <p>{selectedAppointment.reason}</p>
          <label className="field">
            <span>Appointment date and time</span>
            <input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} />
          </label>
          <label className="field">
            <span>Doctor note</span>
            <textarea value={doctorNote} onChange={(event) => setDoctorNote(event.target.value)} placeholder="Room number, instruction, or timing note" />
          </label>
          <button className="primary-button" onClick={scheduleAppointment}>
            <CalendarCheck size={17} />
            {selectedAppointment.status === "scheduled" ? "Update appointment" : "Send appointment"}
          </button>
        </div>
      </section>
    </div>
  ) : null;

  if (screen === "create") {
    return (
      <CreatePrescription
        api={api}
        notify={notify}
        initialPatient={
          prescriptionPatient
            ? {
                id: prescriptionPatient.patientId,
                appointmentId: prescriptionPatient.id,
                name: prescriptionPatient.patientName,
                phone: prescriptionPatient.patientPhone,
                email: prescriptionPatient.patientEmail,
                reason: prescriptionPatient.reason,
                scheduledAt: prescriptionPatient.scheduledAt,
                doctorNote: prescriptionPatient.doctorNote,
              }
            : null
        }
        onPrescriptionCreated={markAppointmentCompleted}
      />
    );
  }
  if (screen === "pharmacies") return <AvailabilityPanel api={api} />;

  if (screen === "prescriptions") {
    return (
      <>
        <PrescriptionList prescriptions={prescriptions.length ? prescriptions : demoPrescriptions} audience="doctor" onShowQr={showQr} />
        {qrPreview && <QrModal qr={qrPreview} onClose={() => setQrPreview(null)} />}
      </>
    );
  }

  if (screen === "appointments") {
    return (
      <div className="content-stack">
        <section className="section-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Appointments</p>
              <h2>Patient appointment requests</h2>
            </div>
          </div>
          {appointmentRequests.length ? (
            <div className="notification-list">
              {appointmentRequests.map((request) => (
                <button type="button" key={request.id} className={request.status !== "requested" ? "read" : ""} onClick={() => openAppointment(request)}>
                  <CalendarCheck size={18} />
                  <div>
                    <strong>{request.patientName}</strong>
                    <span>
                      Requested: {formatDateTime(request.requestedDate)} | {request.reason}
                    </span>
                    {request.status === "scheduled" && <span>Scheduled: {formatDateTime(request.scheduledAt)}</span>}
                  </div>
                  <span className={`status ${request.status === "scheduled" ? "dispensed" : "active"}`}>
                    {request.status === "completed" ? "Completed" : request.status === "scheduled" ? "Open appointment" : "Give appointment"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="empty-state">No appointment requests yet.</p>
          )}
        </section>
        {appointmentModal}
      </div>
    );
  }

  return (
    <div className="content-stack">
      <div className="stats-grid">
        <StatCard icon={ClipboardPlus} label="Prescriptions today" value={dashboard?.totalPrescriptionsToday ?? 0} onClick={() => setScreen("prescriptions")} />
        <StatCard icon={Users} label="Active patients" value={dashboard?.totalActivePatients ?? 0} onClick={() => setScreen("create")} />
        <StatCard icon={Bell} label="Pending refills" value={dashboard?.pendingRefillAlerts ?? 0} onClick={() => setScreen("prescriptions")} />
        <StatCard icon={CalendarCheck} label="Appointment requests" value={appointmentRequests.length} onClick={() => setScreen("appointments")} />
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
        <PrescriptionList prescriptions={dashboard?.recentPrescriptions?.length ? dashboard.recentPrescriptions : demoPrescriptions} audience="doctor" onShowQr={showQr} />
      </section>
      {qrPreview && <QrModal qr={qrPreview} onClose={() => setQrPreview(null)} />}
    </div>
  );
}

function formatDateTime(value?: string | null) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function toDateTimeInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}
