import { useQuery } from 'convex/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../../../convex/_generated/api';
import { ORDER_STATUS_LABEL, formatPrice, type OrderStatus } from '../../lib/shop';
import { fmtDate } from '../util';

const TABS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'new', label: 'Nouvelles' },
  { key: 'confirmed', label: 'Confirmées' },
  { key: 'delivered', label: 'Livrées' },
  { key: 'cancelled', label: 'Annulées' },
  { key: 'all', label: 'Toutes' },
];

export default function Orders() {
  const [tab, setTab] = useState<OrderStatus | 'all'>('new');
  const orders = useQuery(api.orders.list, tab === 'all' ? {} : { status: tab });
  const navigate = useNavigate();

  return (
    <>
      <div className="adm__head">
        <h1>Commandes</h1>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={tab === t.key ? 'active' : ''}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!orders ? (
        <div className="loading">Chargement…</div>
      ) : orders.length === 0 ? (
        <div className="empty">Rien dans cette liste.</div>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>N°</th>
              <th>Client</th>
              <th className="hide-sm">Téléphone</th>
              <th className="hide-sm">Article</th>
              <th className="num">Total</th>
              <th>Statut</th>
              <th className="hide-sm">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="is-link" onClick={() => navigate(`/commandes/${o._id}`)}>
                <td className="tbl__name">{o.number}</td>
                <td>
                  {o.customer.name}
                  <span className="tbl__sub">{o.customer.city}</span>
                </td>
                <td className="hide-sm">{o.customer.phone}</td>
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
