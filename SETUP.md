# KabiPay-UI - Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

```bash
cd KabiPay-UI
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

### 4. Run ESLint

```bash
npm run lint
```

## Project Structure

```
KabiPay-UI/
├── public/               # Static assets
├── src/
│   ├── api/              # GraphQL-style API interfaces (future)
│   ├── components/
│   │   ├── common/       # Reusable UI components
│   │   └── layout/       # Layout components
│   ├── contexts/         # React contexts (Theme, Auth, Tenant)
│   ├── hooks/            # Custom hooks (useMockApi)
│   ├── mocks/            # Mock data for all modules
│   ├── modules/          # Feature modules
│   │   ├── admin/        # Admin features
│   │   ├── attendance/   # Attendance & timesheet
│   │   ├── dashboard/    # Dashboard
│   │   ├── expenses/     # Expenses & travel
│   │   ├── leave/        # Leave management
│   │   ├── notifications/# Notifications
│   │   └── payroll/      # Payroll & payslips
│   ├── routes/           # Route configuration
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── .eslintrc.cjs
└── .prettierrc
```

## Features

### Employee Features

1. **Dashboard**
   - Real-time clock with punch in/out
   - Leave balance overview
   - Recent notifications
   - Who's on leave today
   - Upcoming holidays

2. **Attendance & Timesheet**
   - View attendance history
   - Submit timesheet entries
   - Raise correction requests
   - Track work hours

3. **Leave Management**
   - View leave balance
   - Apply for leave
   - Track leave status
   - Leave history

4. **Payroll**
   - View monthly payslips
   - Detailed salary breakdown
   - Tax regime information (Old/New)
   - Historical payslips

5. **Expenses & Travel**
   - Submit expense claims
   - Upload bills (UI only)
   - Create travel requests
   - Track claim status

6. **Notifications**
   - Company-wide announcements
   - Personal notifications
   - System notifications
   - Filter unread/all

### Admin Features

1. **Employee Management**
   - View all employees
   - Add new employees
   - Edit employee details
   - Employee status management

2. **Reports & Analytics**
   - Attendance reports
   - Leave reports
   - Payroll reports
   - Date range filtering
   - Employee-specific reports

## Mock Users

The application comes with pre-configured mock users:

### Employee Account

- **Name:** John Doe
- **Email:** john.doe@techcorp.com
- **Employee ID:** EMP001
- **Department:** Engineering

### Admin Account

- **Name:** Jane Smith
- **Email:** jane.smith@techcorp.com
- **Employee ID:** EMP002
- **Department:** Human Resources

Use the "Switch to Admin/Employee" button in the header to toggle between roles.

## Theme Support

The application supports both light and dark themes:

- Toggle using the theme button in the header
- Theme preference is persisted in localStorage
- Smooth transitions between themes

## Multi-Tenant Architecture (Frontend)

The application simulates multi-tenancy:

- Tenant context maintains active tenant
- All data is filtered by tenantId
- Ready for backend integration

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Context API** - State management
- **Vite** - Build tool

## Responsive Design

The application is fully responsive:

- **Desktop** - Full sidebar with expanded layout
- **Tablet** - Collapsible sidebar
- **Mobile** - Hidden sidebar with hamburger menu

Breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## Code Quality

### ESLint Rules

The project enforces strict ESLint rules:

- Functional components only
- No inline arrow functions in JSX
- Destructuring required
- Prettier formatting
- Maximum function length limits
- Proper prop handling

### Running Linter

```bash
npm run lint
```

Fix auto-fixable issues:

```bash
npm run lint -- --fix
```

## Backend Integration (Future)

The application is designed to integrate with:

- **Backend:** Rust
- **API:** async-graphql
- **Database:** PostgreSQL
- **Authentication:** JWT
- **Architecture:** Multi-tenant

### Mock API Layer

The `useMockApi` hook simulates:

- Loading states
- Error handling
- Configurable delays
- GraphQL-style queries

To replace with real backend:

1. Implement GraphQL client
2. Update `useMockApi` hook
3. Add authentication layer
4. Connect to real API endpoints

## Environment Variables

Create a `.env` file for future backend integration:

```env
VITE_API_URL=http://localhost:8000/graphql
VITE_WS_URL=ws://localhost:8000/subscriptions
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Tips

1. **Hot Module Replacement (HMR)** - Instant updates without page refresh
2. **TypeScript** - Type checking during development
3. **Tailwind IntelliSense** - VSCode extension recommended
4. **React DevTools** - Browser extension for debugging

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process

# Or use a different port:
npm run dev -- --port 3000
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clean build
rm -rf dist
npm run build
```

## Contributing

When adding new features:

1. Follow existing code structure
2. Use TypeScript strictly
3. Follow ESLint rules
4. Add mock data for new features
5. Ensure responsive design
6. Test in both themes

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact the development team.
