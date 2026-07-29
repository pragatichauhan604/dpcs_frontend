import { Medicine, Notification, Pharmacy, Prescription } from "../types";

export const demoMedicines: Medicine[] = [
  {
    id: "demo-medicine-1",
    brandName: "Dolo 650",
    genericName: "Paracetamol",
    category: "Painkiller",
    dosageForms: "Tablet",
    standardStrength: "650mg",
    isActive: true,
  },
  {
    id: "demo-medicine-2",
    brandName: "Augmentin",
    genericName: "Amoxicillin + Clavulanic Acid",
    category: "Antibiotic",
    dosageForms: "Tablet",
    standardStrength: "625mg",
    isActive: true,
  },
  {
    id: "demo-medicine-3",
    brandName: "Pantocid",
    genericName: "Pantoprazole",
    category: "Antacid",
    dosageForms: "Tablet",
    standardStrength: "40mg",
    isActive: true,
  },
];

export const demoPharmacies: Pharmacy[] = [
  {
    id: "demo-pharmacy-1",
    name: "CityCare Pharmacy",
    address: "Sector 12 Main Road",
    city: "Noida",
    pincode: "201301",
    phone: "9876543210",
    isApproved: true,
    isActive: true,
  },
  {
    id: "demo-pharmacy-2",
    name: "MediQuick Store",
    address: "Near Civil Hospital",
    city: "Noida",
    pincode: "201301",
    phone: "9876501234",
    isApproved: true,
    isActive: true,
  },
];

export const demoPrescriptions: Prescription[] = [
  {
    id: "RX-DEMO-1024",
    status: "active",
    qrCodeToken: "demo-token-1024",
    issuedDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 28 * 86400000).toISOString(),
    disease: "Fever",
    notes: "Hydration and rest advised. Review if fever persists.",
    doctor: {
      user: {
        id: "d1",
        fullName: "Dr. Kavya Sharma",
        email: "",
        phone: "",
        role: "doctor",
        isActive: true,
        isVerified: true,
      },
      hospitalName: "Metro Clinic",
      specialization: "General Physician",
    },
    patient: {
      user: {
        id: "p1",
        fullName: "Aarav Mehta",
        email: "",
        phone: "9876543210",
        role: "patient",
        isActive: true,
        isVerified: true,
      },
      bloodGroup: "O+",
      city: "Noida",
    },
    items: [
      {
        medicineName: "Dolo 650",
        dosage: "650mg",
        frequency: "twice_daily",
        durationDays: 3,
        timing: "after_food",
        quantityToTake: "1 tablet",
      },
      {
        medicineName: "Pantocid",
        dosage: "40mg",
        frequency: "once_daily",
        durationDays: 5,
        timing: "before_food",
        quantityToTake: "1 tablet",
      },
    ],
  },
];

export const demoNotifications: Notification[] = [
  {
    id: "n1",
    title: "Refill alert",
    message: "One prescription expires in 3 days.",
    type: "refill",
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "n2",
    title: "Pharmacy approval",
    message: "CityCare Pharmacy is active.",
    type: "system",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];
