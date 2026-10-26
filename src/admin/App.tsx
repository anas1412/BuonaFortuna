import { ConvexAuthProvider, useAuthActions, useConvexAuth } from '@convex-dev/auth/react';
import { ConvexReactClient } from 'convex/react';
import { useMemo } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router';
import Categories from './pages/Categories';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import OrderDetail from './pages/OrderDetail';
import Orders from './pages/Orders';
import ProductForm from './pages/ProductForm';
import Products from './pages/Products';
import Team from './pages/Team';
import Shell from './Shell';
import { useIsAdmin, useMe } from './util';

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
            <Route path="commandes" element={<Orders />} />
            <Route path="commandes/:id" element={<OrderDetail />} />
            <Route element={<AdminOnly />}>
              <Route path="categories" element={<Categories />} />
              <Route path="equipe" element={<Team />} />
            </Route>
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
  return <StaffOnly />;
}

/** Signed in isn't enough: the account must still be on the team. */
function StaffOnly() {
  const me = useMe();
  const { signOut } = useAuthActions();
  if (me === undefined) return <div className="loading">Chargement…</div>;
  if (me === null)
    return (
      <div className="loading">
        <p>Votre accès à l'administration a été retiré.</p>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => void signOut()}>
          Se déconnecter
        </button>
      </div>
    );
  return <Shell />;
}

function AdminOnly() {
  return useIsAdmin() ? <Outlet /> : <Navigate to="/" replace />;
}
