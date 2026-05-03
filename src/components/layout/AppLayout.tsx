import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DialogProvider } from '../../contexts/DialogContext';
import { useIdleLogout } from '../../hooks/useIdleLogout';
import Sidebar from './Sidebar';
import Header from './Header';
import CommandPalette from './CommandPalette';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useIdleLogout({
    enabled: isAuthenticated,
    timeoutMs: IDLE_TIMEOUT_MS,
    onIdle: () => {
      void logout().finally(() => {
        navigate('/login', { replace: true });
      });
    },
  });

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onToggleSidebar={handleToggleSidebar} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-7 lg:px-8">
            <DialogProvider>
              <Outlet />
            </DialogProvider>
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
};

export default AppLayout;
