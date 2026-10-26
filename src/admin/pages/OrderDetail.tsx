import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import ConfirmButton from '../ConfirmButton';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { ORDER_STATUS_LABEL, formatPrice, whatsappLink, type OrderStatus } from '../../lib/shop';
import { Empty, Icon, Loading, PageHead } from '../ui';
import { errorMessage, fmtDate } from '../util';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const order = useQuery(api.orders.get, id ? { id: id as Id<'orders'> } : 'skip');
  const setStatus = useMutation(api.orders.setStatus);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (order === undefined) return <Loading rows={3} />;
  if (order === null) return <Empty title="Commande introuvable" />;

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
      <PageHead
        back={{ to: '/commandes', label: 'Commandes' }}
        title={
          <>
            {order.number}
            <span className={`st st--${order.status}`}>{ORDER_STATUS_LABEL[order.status]}</span>
          </>
        }
        sub={`Passée le ${fmtDate(order.createdAt)}`}
      />

      {error && (
        <p className="aform__error" role="alert">
          {error}
        </p>
      )}

      <div className="detail">
        <div className="aform__col">
          <section className="aform__card">
            <h3>Client</h3>
            <div className="contact">
              <a href={`tel:+216${order.customer.phone}`} className="btn btn--outline btn--sm">
                <Icon name="phone" /> Appeler
              </a>
              {wa && (
                <a href={wa} target="_blank" rel="noopener" className="btn btn--outline btn--sm">
                  <Icon name="chat" /> WhatsApp
                </a>
              )}
            </div>
            <dl className="kv">
              <div>
                <dt>Nom</dt>
                <dd>{order.customer.name}</dd>
              </div>
              <div>
                <dt>Téléphone</dt>
                <dd>{order.customer.phone}</dd>
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
              <div className="item">
                {item.image && <img src={item.image} alt="" className="tbl__thumb" />}
                <div>
                  <Link to={`/produits/${item.productId}`} className="tbl__name">
                    {item.name}
                  </Link>
                  <span className="tbl__sub">{formatPrice(item.price)}</span>
                </div>
              </div>
            )}
            <dl className="kv kv--total">
              <div>
                <dt>Livraison</dt>
                <dd>{formatPrice(order.deliveryFee)}</dd>
              </div>
              <div>
                <dt>À encaisser</dt>
                <dd className="kv__strong">{formatPrice(total)}</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="aform__card statusbar">
          <h3>Que faire ?</h3>
          {order.status === 'new' && (
            <>
              <p className="small muted">Appelez le client pour vérifier l'adresse, puis confirmez.</p>
              <button type="button" className="btn btn--primary" disabled={busy} onClick={() => move('confirmed')}>
                Client appelé : confirmer
              </button>
            </>
          )}
          {order.status === 'confirmed' && (
            <>
              <p className="small muted">Une fois le colis livré et l'argent reçu :</p>
              <button type="button" className="btn btn--primary" disabled={busy} onClick={() => move('delivered')}>
                Livrée et payée
              </button>
            </>
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
          {order.status === 'delivered' && <p className="small muted">Terminée. L'article est marqué vendu.</p>}
          {order.status === 'cancelled' && (
            <>
              <p className="small muted">Annulée. L'article est de nouveau en vente.</p>
              <button type="button" className="btn btn--outline" disabled={busy} onClick={() => move('new')}>
                Rouvrir la commande
              </button>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
