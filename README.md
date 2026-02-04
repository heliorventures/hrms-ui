# KabiPay-UI

A modern, UI-first KabiPay application built with React, TypeScript, and Tailwind CSS.

## Features

- **Employee Dashboard** - Punch in/out, leave balance, notifications
- **Attendance & Timesheet** - Track attendance, submit timesheets, correction requests
- **Leave Management** - Apply for leave, view balance, track status
- **Payroll** - View payslips, salary breakdown, tax calculations
- **Expenses & Travel** - Submit expense claims, travel requests
- **Notifications** - Company and personal notifications
- **Admin Panel** - Employee management, reports, analytics

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Context API for state management
- Mock API layer (GraphQL-ready)
- Multi-tenant architecture (frontend)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── api/              # GraphQL-style API interfaces
├── components/       # Reusable UI components
│   ├── common/       # Common components (buttons, inputs, etc.)
│   ├── layout/       # Layout components (sidebar, header, etc.)
│   ├── dashboard/    # Dashboard-specific components
│   └── forms/        # Form components
├── modules/          # Feature modules
│   ├── attendance/   # Attendance & timesheet
│   ├── leave/        # Leave management
│   ├── payroll/      # Payroll
│   ├── expenses/     # Expenses & travel
│   ├── notifications/# Notifications
│   └── admin/        # Admin panel
├── hooks/            # Custom React hooks
├── mocks/            # Mock data and API
├── routes/           # Route configuration
├── theme/            # Theme configuration
├── utils/            # Utility functions
└── contexts/         # React contexts

```

## Architecture

### Mock API Layer

The application uses a mock API layer that mimics GraphQL queries and mutations. This allows for:
- Simulated loading states
- Error handling
- Configurable delays
- Easy transition to real GraphQL backend

### Multi-Tenant Model

- All data is tenant-aware
- Tenant context maintains active tenant
- All API calls filtered by tenantId
- User can switch tenants (mock)

### Role-Based Access

- Two roles: Employee and Admin
- Role-based routing and component rendering
- Admin routes hidden from employees
- Mock role switching for demo

## Backend Integration (Future)

This frontend is designed to integrate with:
- Rust backend
- async-graphql
- PostgreSQL database
- Multi-tenant architecture
- JWT authentication

## License

Proprietary
