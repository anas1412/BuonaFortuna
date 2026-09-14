import { ConvexAuthProvider, useConvexAuth } from '@convex-dev/auth/react';
import { ConvexReactClient } from 'convex/react';
import { useMemo } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router';
import Categories from './pages/Categories';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import OrderDetail from './pages/OrderDetail';
import Orders from './pages/Orders';
import ProductForm from './pages/ProductForm';
import Products from './pages/Products';
import Shell from './Shell';

/**
 * The back office, mounted once under /admin. The reactive Convex client
 * means the order list updates the moment a customer places an order.
 */
export default function App({ convexUrl }: { convexUrl: string }) {
  const client = useMemo(() => new ConvexReactClient(convexUrl), [convexUrl]);

  return (
    <ConvexAuthProvider client={client}>
      <BrowserRouter basename="/admin">
        <Routes>
          <Route path="/connexion" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route index element={<Dashboard />} />
            <Route path="produits" element={<Products />} />
            <Route path="produits/nouveau" element={<ProductForm />} />
            <Route path="produits/:id" element={<ProductForm />} />
            <Route path="categories" element={<Categories />} />
            <Route path="commandes" element={<Orders />} />
            <Route path="commandes/:id" element={<OrderDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConvexAuthProvider>
  );
}

function RequireAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const location = useLocation();
  if (isLoading) return <div className="loading">Chargement…</div>;
  if (!isAuthenticated) return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  return <Shell />;
}
