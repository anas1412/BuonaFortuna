import { useQuery } from 'convex/react';
import { Link, useNavigate } from 'react-router';
import { api } from '../../../convex/_generated/api';
import { ORDER_STATUS_LABEL, formatPrice } from '../../lib/shop';
import { fmtDate } from '../util';

export default function Dashboard() {
  const stats = useQuery(api.orders.stats);
  const navigate = useNavigate();

  if (!stats) return <div className="loading">Chargement…</div>;

  return (
    <>
      <div className="adm__head">
        <h1>Tableau de bord</h1>
        <Link to="/produits/nouveau" className="btn btn--primary btn--sm">
          + Ajouter un article
        </Link>
      </div>

      <div className="tiles">
        <div className={`tile${stats.newOrders ? ' tile--hot' : ''}`}>
          <span className="tile__n">{stats.newOrders}</span>
          <span className="tile__l">Nouvelles commandes à appeler</span>
        </div>
        <div className="tile">
          <span className="tile__n">{stats.available}</span>
          <span className="tile__l">Articles en vente</span>
        </div>
        <div className="tile">
          <span className="tile__n">{stats.reserved}</span>
          <span className="tile__l">Réservés</span>
        </div>
        <div className="tile">
          <span className="tile__n">{stats.sold}</span>
          <span className="tile__l">Vendus</span>
        </div>
      </div>

      <div className="adm__head">
        <h2 style={{ fontSize: 20 }}>Dernières commandes</h2>
        <Link to="/commandes" className="btn btn--ghost btn--sm">
          Toutes les commandes
        </Link>
      </div>

      {stats.recent.length === 0 ? (
        <div className="empty">Aucune commande pour le moment. Elles apparaîtront ici en direct.</div>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>N°</th>
              <th>Client</th>
              <th className="hide-sm">Article</th>
              <th className="num">Total</th>
              <th>Statut</th>
              <th className="hide-sm">Date</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent.map((o) => (
              <tr key={o._id} className="is-link" onClick={() => navigate(`/commandes/${o._id}`)}>
                <td className="tbl__name">{o.number}</td>
                <td>
                  {o.customer.name}
                  <span className="tbl__sub">{o.customer.city}</span>
                </td>
                <td className="hide-sm">{o.items[0]?.name}</td>
                <td className="num">{formatPrice(o.items.reduce((s, i) => s + i.price, 0) + o.deliveryFee)}</td>
                <td>
                  <span className={`st st--${o.status}`}>{ORDER_STATUS_LABEL[o.status]}</span>
                </td>
                <td className="hide-sm">{fmtDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
