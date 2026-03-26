import { createBrowserRouter } from 'react-router';
import { Layout } from './Layout';
import { AdminLayout } from './components/AdminLayout';
import { Home } from './pages/Home';
import { Cosmetiques } from './pages/Cosmetiques';
import { Accessoires } from './pages/Accessoires';
import { Materiels } from './pages/Materiels';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProducts } from './pages/AdminProducts';
import { AdminOrders } from './pages/AdminOrders';
import { AdminProductForm } from './pages/AdminProductForm';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'cosmetiques', Component: Cosmetiques },
      { path: 'accessoires', Component: Accessoires },
      { path: 'materiels', Component: Materiels },
      { path: 'produit/:id', Component: ProductDetail },
      { path: 'panier', Component: Cart },
      { path: 'commander', Component: Checkout },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      {
        path: 'login',
        Component: AdminLogin,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'products',
        element: (
          <ProtectedRoute>
            <AdminProducts />
          </ProtectedRoute>
        ),
      },
      {
        path: 'products/new',
        element: (
          <ProtectedRoute>
            <AdminProductForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'products/edit/:id',
        element: (
          <ProtectedRoute>
            <AdminProductForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <AdminOrders />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
