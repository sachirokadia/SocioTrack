# SocioTrack - Residential Society Management System

A full-stack MERN application for managing residential society complaints, notices, and notifications.

## 🚀 Features

### For Residents
- Create and track complaints (plumbing, electrical, cleaning, etc.)
- View complaint status and timeline
- Submit feedback on resolved complaints
- View society notices and alerts
- Receive real-time notifications
- Member dashboard: last bill amount, last payment, advance and outstanding
- Maintenance bills, Pay Online, payment history, ledger and AGM/EAGM — modelled on the SocietyNow Smart Society App screens

### For Admins
- Dashboard with analytics (complaint stats, user counts, category breakdown)
- Assign complaints to technicians
- Create and manage notices/alerts
- View all users (residents & technicians)
- Monitor complaint resolution rates
- Raise maintenance bills, verify cheque/RTGS/NEFT payment intimations, schedule AGM/EAGM meetings

### For Technicians
- Dashboard with assigned complaints grouped by status
- Update complaint status (Assigned → In Progress → Resolved)
- Add resolution notes
- View complaint history and feedback

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- React Router v6
- Axios for API calls
- Tailwind CSS v4 (entry is `@import "tailwindcss"` in `src/index.css` — the old v3 `@tailwind` directives only emitted a fraction of the utilities under v4 and left every page unstyled; fixed 2026-10-24)
- Vite

**UI theme:** SocietyNow-style visual language — cyan-to-magenta gradient login with serif "Smart Society App" title and city skyline, teal member-dashboard header with summary rows and icon tiles, and a teal Society Payments intimation screen. SocioTrack keeps its own name and demo accounts; only the look is borrowed.

**Backend:**
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- bcrypt for password hashing

## 📋 Prerequisites

- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Git

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd SocioTrack
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Seed demo data
npm run seed

# Start backend server
npm start
```

Backend runs on: http://localhost:5000

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start frontend dev server
npm run dev
```

Frontend runs on: http://localhost:3000

## 🔐 Demo Accounts

**Admin:**
- Email: admin@sociotrack.com
- Password: Admin@123

**Resident:**
- Email: john@sociotrack.com
- Password: Resident@123

**Technician:**
- Email: mike@sociotrack.com
- Password: Tech@123

## 📂 Project Structure

```
SocioTrack/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, error handling, rate limiting
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Helper functions
│   │   └── server.ts       # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Auth)
│   │   ├── layouts/        # Page layouts (Resident/Admin/Technician)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   └── package.json
│
└── README.md
```

## 🔄 Complete Demo Flow

1. **Resident creates a complaint**
   - Login as john@sociotrack.com
   - Navigate to "My Complaints" → "New Complaint"
   - Fill in details with high priority
   - Submit

2. **Admin assigns technician**
   - Logout → Login as admin@sociotrack.com
   - Navigate to "Complaints"
   - Find the complaint → Click "Assign"
   - Select technician (Mike Wilson)

3. **Technician resolves complaint**
   - Logout → Login as mike@sociotrack.com
   - Dashboard shows assigned complaint
   - Click complaint → "Progress to In Progress"
   - Later: "Progress to Resolved" (requires resolution note)
   - Enter resolution details → Submit

4. **Resident submits feedback**
   - Logout → Login as john@sociotrack.com
   - Navigate to complaint details
   - Feedback form appears (5-star rating + comment)
   - Submit feedback

5. **Admin creates alert**
   - Login as admin@sociotrack.com
   - Navigate to "Notices" → "Create Notice"
   - Select Type: "Alert", Priority: "Urgent"
   - Submit (triggers notifications to all residents)

6. **Resident receives alert**
   - Login as john@sociotrack.com
   - Alert popup appears on dashboard
   - Notification bell shows unread count

## 🌐 API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get current user

### Complaints
- GET `/api/complaints` - List complaints (role-filtered)
- POST `/api/complaints` - Create complaint
- GET `/api/complaints/:id` - Get complaint details
- PUT `/api/complaints/:id/assign` - Assign technician (admin)
- PUT `/api/complaints/:id/status` - Update status (technician)
- PUT `/api/complaints/:id/feedback` - Submit feedback (resident)
- GET `/api/complaints/technicians` - List technicians
- GET `/api/complaints/dashboard/technician` - Technician dashboard

### Notices
- GET `/api/notices` - List notices
- POST `/api/notices` - Create notice/alert (admin)
- DELETE `/api/notices/:id` - Delete notice (admin)

### Notifications
- GET `/api/notifications` - List notifications
- PUT `/api/notifications/:id/read` - Mark as read
- PUT `/api/notifications/read-all` - Mark all as read

### Admin
- GET `/api/admin/analytics` - Dashboard analytics
- GET `/api/admin/users` - List users, optionally filtered by `?role=` (admin only)

### Billing (maintenance bills, payments, ledger)
- GET `/api/billing/summary` - Member dashboard summary (last bill, last payment, advance, outstanding)
- GET `/api/billing/ledger` - Ledger: bills as debits, verified payments as credits, running balance
- POST `/api/billing/bills` - Raise a bill (admin)
- GET `/api/billing/bills` - List bills (residents see only their own)
- GET `/api/billing/bills/:id` - Bill details with its payments
- POST `/api/billing/payments` - Pay online (verified immediately) or submit a cheque/RTGS/NEFT intimation (pending until verified)
- GET `/api/billing/payments` - Payment history
- PUT `/api/billing/payments/:id/verify` - Verify or reject an intimation (admin; verifying applies it to the bill)

### Meetings (AGM / EAGM)
- GET `/api/meetings` - List meetings, optionally filtered by `?type=agm|eagm|general`
- POST `/api/meetings` - Schedule a meeting (admin)
- DELETE `/api/meetings/:id` - Delete a meeting (admin)

## 🧪 Testing

```bash
# Backend tests (if implemented)
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test
```

## 📝 Known Issues

1. **Alert Popup Persistence:** Dismissed alerts (via "Close All") reappear on page refresh. Workaround: Click individual "Dismiss" buttons to mark as read.

2. **Fixed:** `/api/admin/users` is now mounted (the controller already existed) — the Admin Users page works.

## 🚀 Deployment

### Backend (Example: Heroku)
```bash
cd backend
heroku create sociotrack-api
heroku addons:create mongolab
git push heroku main
```

### Frontend (Example: Vercel)
```bash
cd frontend
vercel --prod
```

Update `frontend/.env` with production API URL.

## 📄 License

MIT License - see LICENSE file

## 👥 Contributors

- Built as a college project for residential society management

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Version:** 1.0.0  
**Last Updated:** September 13, 2026
