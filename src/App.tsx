import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { DataStoreProvider } from './store/DataStoreContext';
import { CommandPaletteProvider } from './components/layout/CommandPaletteContext';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <TenantProvider>
            <DataStoreProvider>
              <CommandPaletteProvider>
                <AppRoutes />
              </CommandPaletteProvider>
            </DataStoreProvider>
          </TenantProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
