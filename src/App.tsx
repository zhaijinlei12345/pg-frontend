import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import AuditLogsPage from './pages/AuditLogsPage';
import DictPage from './pages/DictPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import { ROUTES } from './routes';

function RequireAuth() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return (
    <ErrorBoundary>
      <Layout>
        <Outlet />
      </Layout>
    </ErrorBoundary>
  );
}

const router = createBrowserRouter([
  { path: ROUTES.LOGIN, element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: ROUTES.USERS, element: <UsersPage /> },
      { path: ROUTES.PRODUCTS, element: <ProductsPage /> },
      { path: ROUTES.ORDERS, element: <OrdersPage /> },
      { path: ROUTES.AUDIT_LOGS, element: <AuditLogsPage /> },
      { path: ROUTES.DICT, element: <DictPage /> },
      { path: ROUTES.PROFILE, element: <ProfilePage /> },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.DASHBOARD} replace /> },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
