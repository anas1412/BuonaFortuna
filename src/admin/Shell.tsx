import { useAuthActions } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { api } from '../../convex/_generated/api';
import { Icon } from './ui';
import { ROLE_LABEL, useMe } from './util';

/**
 * Desktop: a sidebar. Phone: the same markup becomes a slim top bar (logo +
 * account) and a tab bar fixed to the bottom, within thumb reach.
 */
export default function Shell() {
  const { signOut } = useAuthActions();
  const stats = useQuery(api.orders.stats);
  const me = useMe();
  const isAdmin = me?.role === 'admin';
  const acct = useRef<HTMLDetailsElement>(null);
  const { pathname } = useLocation();

  // The account menu is a native <details>: close it on navigation and on a tap elsewhere.
  useEffect(() => acct.current?.removeAttribute('open'), [pathname]);
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!acct.current?.contains(e.target as Node)) acct.current?.removeAttribute('open');
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  return (
    <div className="adm">
      <aside className="adm__side">
        <div className="adm__brand">
          <span className="logo">
            <span className="logo__a">Buona</span>
            <span className="logo__b">Fortuna</span>
          </span>
        </div>

        <nav className="adm__nav" aria-label="Administration">
          <NavLink to="/" end>
            <Icon name="home" />
            <span>Accueil</span>
          </NavLink>
          <NavLink to="/commandes">
            <Icon name="orders" />
            <span>Commandes</span>
            {stats && stats.newOrders > 0 && <span className="adm__badge">{stats.newOrders}</span>}
          </NavLink>
          <NavLink to="/produits">
            <Icon name="tag" />
            <span>Articles</span>
          </NavLink>
          {isAdmin && (
            <NavLink to="/categories">
              <Icon name="folder" />
              <span>Catégories</span>
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/equipe">
              <Icon name="team" />
              <span>Équipe</span>
            </NavLink>
          )}
        </nav>

        {me && (
          <details className="acct" ref={acct}>
            <summary aria-label="Mon compte">
              <span className="acct__avatar" aria-hidden="true">{me.email[0].toUpperCase()}</span>
              <span className="acct__who">
                <span className="acct__email">{me.email}</span>
                <span className="acct__role">{ROLE_LABEL[me.role]}</span>
              </span>
            </summary>
            <div className="acct__menu">
              <p className="acct__menuWho">
                {me.email}
                <span>{ROLE_LABEL[me.role]}</span>
              </p>
              <a href="/" target="_blank" rel="noopener">
                <Icon name="external" /> Voir la boutique
              </a>
              <button type="button" onClick={() => void signOut()}>
                <Icon name="logout" /> Se déconnecter
              </button>
            </div>
          </details>
        )}
      </aside>

      <main className="adm__main">
        <Outlet />
      </main>
    </div>
  );
}
