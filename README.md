# EHCP — Electronic Health Coordination Platform

EHCP is a production-grade, fully responsive, and mobile-friendly web application for healthcare coordination and clinical workflow management. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

---

## 📸 Project Showcase

<div align="center">
  <img src="screen_shots/Screenshot 2026-03-08 132319.png" width="45%" alt="Dashboard" />
  <img src="screen_shots/Screenshot 2026-03-08 132353.png" width="45%" alt="Patient List" />
</div>

<div align="center">
  <img src="screen_shots/Screenshot 2026-03-08 132413.png" width="45%" alt="Patient Details" />
  <img src="screen_shots/Screenshot 2026-03-08 132521.png" width="45%" alt="3D Body Map" />
</div>

<div align="center">
  <img src="screen_shots/Screenshot 2026-03-08 132609.png" width="45%" alt="Medical Timeline" />
  <img src="screen_shots/Screenshot 2026-03-08 132639.png" width="45%" alt="Triage Queue" />
</div>

<div align="center">
  <img src="screen_shots/Screenshot 2026-03-08 132659.png" width="45%" alt="Appointments" />
  <img src="screen_shots/Screenshot 2026-03-08 132719.png" width="45%" alt="Treatment Plans" />
</div>

<div align="center">
  <img src="screen_shots/Screenshot 2026-03-08 132732.png" width="45%" alt="Invoicing" />
  <img src="screen_shots/Screenshot 2026-03-08 132754.png" width="45%" alt="Compliance Audit" />
</div>

<div align="center">
  <img src="screen_shots/Screenshot 2026-03-08 132834.png" width="45%" alt="Lab Results" />
  <img src="screen_shots/Screenshot 2026-03-08 132925.png" width="45%" alt="Telemedicine" />
</div>

---

## 🚀 Features by Category

### 🔐 Authentication & Security
- **Role-Based Access Control (RBAC):** Specialized dashboards for Doctors, Nurses, Admins, and Billing staff.
- **Secure Authentication:** Powered by Supabase Auth with Row Level Security (RLS) policies.
- **Audit Logging:** Automated tracking of every clinical and financial action for compliance.

### 🏥 Clinical Workflow
- **Patient Management:** Comprehensive EMR with intake forms, clinical history, and demographic data.
- **Interactive 3D Body Map:** Visualize patient conditions, surgical sites, and critical areas using an interactive Three.js model.
- **Triage System:** Real-time priority-based queue for nurses and doctors to manage patient flow efficiently.
- **Genomic & Allergy Layer:** Advanced tracking of genetic markers, pharmacogenomic flags, and multi-severity allergies.

### 📅 Coordination & Telemedicine
- **Appointment Scheduling:** Intelligent booking system with doctor availability checks.
- **Telemedicine Integration:** Built-in video consultation capabilities via Daily.co for remote care.
- **Notification System:** Real-time alerts for lab results, new assignments, and system updates.

### 🧪 Labs & Diagnostics
- **Lab Order Management:** Streamlined workflow for ordering tests and uploading results.
- **SLA Tracking:** Visual indicators for lab turnaround times and overdue results.

### 💳 Billing & Compliance
- **Invoicing System:** Generate itemized patient invoices with real-time total calculations.
- **Compliance Dashboard:** Dedicated interface for admins to monitor system-wide audit logs and anomalies.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components:** Radix UI, Shadcn/UI, Lucide React
- **State Management:** Zustand, React Query (TanStack Query)
- **3D Rendering:** Three.js, @react-three/fiber, @react-three/drei
- **Backend:** Supabase (Auth, DB, Realtime, Storage)
- **Communication:** Daily.co SDK for Telemedicine

---

## 🏁 Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd new_hp
```

### 2. Install dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DAILY_DOMAIN=your_daily_domain
```

### 4. Database Setup
Run the migration scripts located in `supabase/migrations` in your Supabase SQL Editor to set up the schema, functions, and RLS policies.

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
