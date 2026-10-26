import { Link } from 'react-router';
import type { Doc } from '../../convex/_generated/dataModel';
import { ORDER_STATUS_LABEL, formatPrice } from '../lib/shop';
import { fmtDate } from './util';

/** The one order list: dashboard and Commandes. A table on desktop, cards on a phone. */
export default function OrderList({ orders, phone = false }: { orders: Doc<'orders'>[]; phone?: boolean }) {
  return (
    <table className="tbl">
      <thead>
        <tr>
          <th>Commande</th>
          <th>Client</th>
          {phone && <th className="hide-sm">Téléphone</th>}
          <th className="hide-sm">Article</th>
          <th className="num">Total</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o._id}>
            <td>
              <Link to={`/commandes/${o._id}`} className="tbl__name tbl__link">
                {o.number}
              </Link>
              <span className="tbl__sub">{fmtDate(o.createdAt)}</span>
            </td>
            <td>
              {o.customer.name}
              <span className="tbl__sub">{o.customer.city}</span>
            </td>
            {phone && <td className="hide-sm">{o.customer.phone}</td>}
            <td className="hide-sm">{o.items[0]?.name}</td>
            <td className="num">{formatPrice(o.items.reduce((s, i) => s + i.price, 0) + o.deliveryFee)}</td>
            <td className="tbl__status">
              <span className={`st st--${o.status}`}>{ORDER_STATUS_LABEL[o.status]}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
