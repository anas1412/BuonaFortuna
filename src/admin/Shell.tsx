import { useAuthActions } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { NavLink, Outlet } from 'react-router';
import { api } from '../../convex/_generated/api';

export default function Shell() {
  const { signOut } = useAuthActions();
  const stats = useQuery(api.orders.stats);

  return (
    <div className="adm">
      <aside className="adm__side">
        <div className="adm__brand">
          <span className="logo" style={{ fontSize: 20 }}>
            <span className="logo__a">Buona</span>
            <span className="logo__b">Fortuna</span>
          </span>
          <small>ADMIN</small>
        </div>

        <nav className="adm__nav" aria-label="Administration">
          <NavLink to="/" end>
            Tableau de bord
          </NavLink>
          <NavLink to="/commandes">
            Commandes
            {stats && stats.newOrders > 0 && <span className="chip chip--red">{stats.newOrders}</span>}
          </NavLink>
          <NavLink to="/produits">Articles</NavLink>
        </nav>

        <footer>
          <a href="/" target="_blank" rel="noopener">
            Voir la boutique ↗
          </a>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => void signOut()}>
            Se déconnecter
          </button>
        </footer>
      </aside>

      <main className="adm__main">
        <Outlet />
      </main>
    </div>
  );
}
