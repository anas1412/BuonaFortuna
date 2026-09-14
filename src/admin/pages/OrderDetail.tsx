import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import ConfirmButton from '../ConfirmButton';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { ORDER_STATUS_LABEL, formatPrice, whatsappLink, type OrderStatus } from '../../lib/shop';
import { errorMessage, fmtDate } from '../util';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const order = useQuery(api.orders.get, id ? { id: id as Id<'orders'> } : 'skip');
  const setStatus = useMutation(api.orders.setStatus);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (order === undefined) return <div className="loading">Chargement…</div>;
  if (order === null) return <div className="empty">Commande introuvable.</div>;

  const item = order.items[0];
  const total = order.items.reduce((s, i) => s + i.price, 0) + order.deliveryFee;
  const wa = whatsappLink(
    order.customer.phone,
    `Bonjour ${order.customer.name.split(' ')[0]}, c'est BuonaFortuna au sujet de votre commande ${order.number} (${item?.name}).`,
  );

  async function move(status: OrderStatus) {
    setError(null);
    setBusy(true);
    try {
      await setStatus({ id: order!._id, status });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <p className="adm__crumb">
        <Link to="/commandes">Commandes</Link> / {order.number}
      </p>
      <div className="adm__head">
        <h1>
          Commande {order.number}{' '}
          <span className={`st st--${order.status}`} style={{ verticalAlign: 'middle', marginLeft: 8 }}>
            {ORDER_STATUS_LABEL[order.status]}
          </span>
        </h1>
        <span className="muted small">{fmtDate(order.createdAt)}</span>
      </div>

      {error && (
        <p className="aform__error" role="alert" style={{ marginBottom: 16 }}>
          {error}
        </p>
      )}

      <div className="detail">
        <div className="aform__col">
          <section className="aform__card">
            <h3>Client</h3>
            <dl className="kv">
              <div>
                <dt>Nom</dt>
                <dd>{order.customer.name}</dd>
              </div>
              <div>
                <dt>Téléphone</dt>
                <dd>
                  <a href={`tel:+216${order.customer.phone}`}>{order.customer.phone}</a>
                  {wa && (
                    <>
                      {' · '}
                      <a href={wa} target="_blank" rel="noopener">
                        WhatsApp
                      </a>
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt>Gouvernorat</dt>
                <dd>{order.customer.city}</dd>
              </div>
              <div>
                <dt>Adresse</dt>
                <dd>{order.customer.address}</dd>
              </div>
              {order.note && (
                <div>
                  <dt>Remarque</dt>
                  <dd>{order.note}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="aform__card">
            <h3>Article</h3>
            {item && (
              <div className="tbl__row" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                {item.image && <img src={item.image} alt="" className="tbl__thumb" style={{ width: 64, height: 80 }} />}
                <div>
                  <p className="tbl__name">
                    <Link to={`/produits/${item.productId}`}>{item.name}</Link>
                  </p>
                  <span className="tbl__sub">{formatPrice(item.price)}</span>
                </div>
              </div>
            )}
            <dl className="kv" style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
              <div>
                <dt>Livraison</dt>
                <dd>{formatPrice(order.deliveryFee)}</dd>
              </div>
              <div>
                <dt>À encaisser</dt>
                <dd style={{ fontWeight: 700, color: 'var(--red)' }}>{formatPrice(total)}</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="aform__card statusbar">
          <h3>Suivi</h3>
          {order.status === 'new' && (
            <button type="button" className="btn btn--primary" disabled={busy} onClick={() => move('confirmed')}>
              Client appelé — confirmer
            </button>
          )}
          {order.status === 'confirmed' && (
            <button type="button" className="btn btn--primary" disabled={busy} onClick={() => move('delivered')}>
              Livrée et payée
            </button>
          )}
          {(order.status === 'new' || order.status === 'confirmed') && (
            <ConfirmButton
              label="Annuler la commande"
              confirmLabel="Oui, annuler"
              hint="L'article redevient disponible à la vente."
              className="btn btn--danger"
              disabled={busy}
              onConfirm={() => move('cancelled')}
            />
          )}
          {order.status === 'delivered' && <p className="muted small">Terminée. L'article est marqué vendu.</p>}
          {order.status === 'cancelled' && (
            <>
              <p className="muted small">Annulée. L'article est de nouveau en vente.</p>
              <button type="button" className="btn btn--outline btn--sm" disabled={busy} onClick={() => move('new')}>
                Rouvrir la commande
              </button>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
