import { useEffect, useState } from "react";
import { Stethoscope } from "lucide-react";
import { ApiClient } from "../../services/api";

type DoctorListPanelProps = {
  api: ApiClient;
};

export function DoctorListPanel({ api }: DoctorListPanelProps) {
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    api.get<{ doctors: any[] }>("/patient/doctors").then((data) => setDoctors(data.doctors)).catch(() => setDoctors([]));
  }, [api]);

  return (
    <section className="section-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Doctors</p>
          <h2>Available doctors</h2>
        </div>
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
              <span>{doctor.hospitalName}</span>
              <span>{doctor.city}</span>
            </div>
          </article>
        ))}
        {!doctors.length && <p className="empty-state">No approved doctors are available yet.</p>}
      </div>
    </section>
  );
}
