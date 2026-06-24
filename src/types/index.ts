export type Role = "doctor" | "patient" | "pharmacist" | "admin";

export type Screen = "dashboard" | "prescriptions" | "create" | "doctors" | "pharmacies" | "inventory" | "admin";

export type AuthMode = "login" | "doctor" | "patient" | "pharmacist" | "admin";

export type Session = {
  token: string;
  user: User;
};

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  isActive: boolean;
  isVerified: boolean;
  doctor?: DoctorProfile;
  patient?: PatientProfile;
  pharmacist?: PharmacistProfile;
};

export type DoctorProfile = {
  id: string;
  specialization: string;
  hospitalName: string;
  city: string;
  pincode: string;
  isApproved: boolean;
};

export type PatientProfile = {
  id: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  address: string;
  city: string;
  pincode: string;
};

export type PharmacistProfile = {
  id: string;
  pharmacyId: string;
  isApproved: boolean;
  pharmacy?: Pharmacy;
};

export type Medicine = {
  id: string;
  brandName: string;
  genericName: string;
  category: string;
  dosageForms: string;
  standardStrength?: string;
  isActive: boolean;
};

export type Pharmacy = {
  id: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  isApproved: boolean;
  isActive: boolean;
};

export type PrescriptionItem = {
  id?: string;
  medicineId?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  timing?: string;
  quantityToTake?: string;
  instructions?: string;
};

export type Prescription = {
  id: string;
  status: "active" | "dispensed" | "expired" | "cancelled";
  qrCode?: string;
  qrCodeToken?: string;
  issuedDate: string;
  expiryDate: string;
  disease?: string;
  notes?: string;
  items: PrescriptionItem[];
  doctor?: { user?: User; hospitalName?: string; specialization?: string };
  patient?: { user?: User; bloodGroup?: string; city?: string };
  dispensedRecord?: { dispensedAt: string; pharmacy?: Pharmacy; status: string };
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export type ToastFn = (message: string) => void;

export type QrPreview = {
  title: string;
  image?: string;
  token?: string;
};
