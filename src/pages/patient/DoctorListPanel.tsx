import { useEffect, useState } from "react";
import { CalendarCheck, Search, Stethoscope } from "lucide-react";
import { Field } from "../../components/ui/Field";
import { ApiClient, ApiError } from "../../services/api";
import { ToastFn } from "../../types";

type DoctorListPanelProps = {
  api: ApiClient;
  notify: ToastFn;
};

export function DoctorListPanel({ api, notify }: DoctorListPanelProps) {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [bookingDoctorId, setBookingDoctorId] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [reason, setReason] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const query = doctorSearch.trim() ? `?q=${encodeURIComponent(doctorSearch.trim())}` : "";
      api.get<{ doctors: any[] }>(`/patient/doctors${query}`).then((data) => setDoctors(data.doctors)).catch(() => setDoctors([]));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [api, doctorSearch]);

  const bookAppointment = async () => {
    if (!bookingDoctorId || !preferredDate || reason.trim().length < 3) {
      notify("Choose date and enter appointment reason.");
      return;
    }

    try {
      await api.post("/patient/appointments", {
        doctorId: bookingDoctorId,
        preferredDate,
        reason,
      });
      notify("Appointment request sent to doctor.");
      setBookingDoctorId("");
      setPreferredDate("");
      setReason("");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "Appointment could not be booked");
    }
  };

  return (
    <section className="section-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Doctors</p>
          <h2>Available doctors</h2>
        </div>
      </div>
      <div className="search-box doctor-search">
        <Search size={18} />
        <input value={doctorSearch} onChange={(event) => setDoctorSearch(event.target.value)} placeholder="Search by disease, doctor, specialization, hospital, or city" />
      </div>
      <div className="doctor-grid">
        {doctors.map((doctor) => (
          <article className="doctor-card" key={doctor.id}>
            {doctor.user?.profilePhoto ? (
              <img src={doctor.user.profilePhoto} alt={doctor.user.fullName} />
            ) : (
              <div className="doctor-avatar">
                <Stethoscope size={22} />
              </div>
            )}
            <div>
              <h3>{doctor.user?.fullName}</h3>
              <p>{doctor.specialization}</p>
              <span>
                {[doctor.hospitalName, doctor.city].filter(Boolean).join(", ")}
              </span>
              {doctor.prescriptions?.length > 0 && (
                <div className="disease-tags">
                  {doctor.prescriptions.map((prescription: any, index: number) => (
                    <small key={`${doctor.id}-${prescription.disease}-${index}`}>{prescription.disease}</small>
                  ))}
                </div>
              )}
              <button className="ghost-button compact doctor-book-button" onClick={() => setBookingDoctorId(doctor.id)}>
                <CalendarCheck size={16} />
                Book appointment
              </button>
            </div>
          </article>
        ))}
        {!doctors.length && <p className="empty-state">No approved doctors are available yet.</p>}
      </div>
      {bookingDoctorId && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Book doctor appointment">
          <section className="qr-modal appointment-modal">
            <div className="section-head">
              <div>
                <p className="eyebrow">Appointment</p>
                <h2>Book doctor appointment</h2>
              </div>
              <button className="icon-button" onClick={() => setBookingDoctorId("")} aria-label="Close appointment form">
                X
              </button>
            </div>
            <div className="auth-form">
              <Field label="Preferred date" type="date" value={preferredDate} onChange={setPreferredDate} />
              <Field label="Reason" value={reason} onChange={setReason} />
              <button className="primary-button" onClick={bookAppointment}>
                <CalendarCheck size={17} />
                Send request
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
