# SocioTrack Frontend

React + TypeScript frontend for SocioTrack - Residential Society Complaint, Notice, and Alert Management System.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. Start development server:
   ```bash
   npm start
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components grouped by role
│   ├── auth/           # Authentication pages
│   ├── resident/       # Resident dashboard & pages
│   ├── admin/          # Admin dashboard & pages
│   └── technician/     # Technician dashboard & pages
├── layouts/            # Layout components
├── context/            # React Context providers
├── services/           # API service layer
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Development Guidelines

- Use TypeScript strictly
- Follow React functional components with hooks
- State management: React Context + useState/useEffect only
- API calls: Use axios service layer
- Routing: React Router DOM v6
- No Redux or other state management libraries
- Keep components simple and focused