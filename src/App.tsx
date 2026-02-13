import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { DataStoreProvider } from './store/DataStoreContext';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <TenantProvider>
          <AuthProvider>
            <DataStoreProvider>
              <AppRoutes />
            </DataStoreProvider>
          </AuthProvider>
        </TenantProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
