import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { CommandPaletteProvider } from './components/layout/CommandPaletteContext';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <TenantProvider>
          <AuthProvider>
            <CommandPaletteProvider>
              <AppRoutes />
            </CommandPaletteProvider>
          </AuthProvider>
        </TenantProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
