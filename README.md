# DPCS Frontend

React frontend for the Digital Prescription and Pharmacy Management System.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- lucide-react icons

## Folder Structure

```text
frontend/
  src/
    components/
      notifications/
      prescriptions/
      qr/
      ui/
    config/
    data/
    layouts/
    pages/
      admin/
      doctor/
      patient/
      pharmacy/
      shared/
    services/
    types/
    utils/
    App.tsx
    main.tsx
    styles.css
```

## Setup

1. Copy `.env.example` to `.env`.
2. Make sure the backend is running on port `4000`.
3. Install dependencies:

```bash
npm install
```

4. Start the frontend:

```bash
npm run dev
```

The app runs at:

```text
http://127.0.0.1:5173
```

## Environment

```env
VITE_API_URL=http://localhost:4000/api
```

## Useful Scripts

```bash
npm run dev
npm run build
npm run preview
```

## Current Features

- Login and role-based routing
- Doctor, patient, pharmacy, and admin dashboards
- Doctor prescription creation
- Patient prescription list and QR preview
- Pharmacy QR token lookup and dispense flow
- Admin approvals and medicine catalogue UI
