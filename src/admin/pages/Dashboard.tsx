import { useQuery } from 'convex/react';
import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { api } from '../../../convex/_generated/api';
import { formatPrice } from '../../lib/shop';
import OrderList from '../OrderList';
import { Empty, Icon, Loading, PageHead } from '../ui';

const dayLabel = (day: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) =>
  new Intl.DateTimeFormat('fr-FR', { ...opts, timeZone: 'UTC' }).format(new Date(`${day}T12:00:00Z`));
const percent = (r: number) => `${Math.round(r * 100)} %`;

/** « +12 % » against last month, or nothing when there's no base to compare with. */
function Delta({ now, before, points = false }: { now: number | null; before: number | null; points?: boolean }) {
  if (now === null || before === null || (!points && before === 0)) return <span className="kpi__delta">Pas de comparaison</span>;
  const d = points ? Math.round((now - before) * 100) : Math.round(((now - before) / before) * 100);
  if (d === 0) return <span className="kpi__delta">= mois dernier</span>;
  return (
    <span className="kpi__delta">
      {d > 0 ? '▲' : '▼'} {Math.abs(d)} {points ? 'pts' : '%'} vs mois dernier
    </span>
  );
}

export default function Dashboard() {
  const data = useQuery(api.orders.dashboard);
  if (!data) return <Loading rows={5} />;

  const { month, lastMonth, stock } = data;
  const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date());

  return (
    <>
      <PageHead title="Accueil" sub={`Le point sur ${monthName}.`}>
        <Link to="/produits/nouveau" className="btn btn--primary">
          <Icon name="plus" /> Ajouter un article
        </Link>
      </PageHead>

      {(data.toCall > 0 || data.stuck.length > 0 || stock.drafts > 0) && (
        <section className="alerts" aria-label="À traiter">
          {data.toCall > 0 && (
            <Link to="/commandes" className="alert">
              <Icon name="phone" />
              <span>
                <strong>{data.toCall} {data.toCall === 1 ? 'commande à appeler' : 'commandes à appeler'}</strong>
                <span className="alert__sub">Appelez pour confirmer l'adresse avant l'envoi.</span>
              </span>
            </Link>
          )}
          {stock.drafts > 0 && (
            <Link to="/produits" className="alert">
              <Icon name="tag" />
              <span>
                <strong>{stock.drafts} {stock.drafts === 1 ? 'brouillon à terminer' : 'brouillons à terminer'}</strong>
                <span className="alert__sub">Invisibles sur la boutique tant qu'ils ne sont pas publiés (onglet « Brouillons »).</span>
              </span>
            </Link>
          )}
          {data.stuck.map((o) => (
            <Link key={o._id} to={`/commandes/${o._id}`} className="alert">
              <Icon name="orders" />
              <span>
                <strong>{o.number} · {o.name}</strong>
                <span className="alert__sub">Confirmée il y a {o.days} jours, toujours pas livrée. Relancez le livreur.</span>
              </span>
            </Link>
          ))}
        </section>
      )}

      <div className="tiles">
        <div className="tile">
          <span className="tile__l">Ventes encaissées</span>
          <span className="tile__n">{formatPrice(month.revenue)}</span>
          <Delta now={month.revenue} before={lastMonth.revenue} />
        </div>
        <div className="tile">
          <span className="tile__l">Commandes</span>
          <span className="tile__n">{month.orders}</span>
          <Delta now={month.orders} before={lastMonth.orders} />
        </div>
        <div className="tile">
          <span className="tile__l">Panier moyen</span>
          <span className="tile__n">{month.avgBasket === null ? '—' : formatPrice(month.avgBasket)}</span>
          <Delta now={month.avgBasket} before={lastMonth.avgBasket} />
        </div>
        <div className="tile">
          <span className="tile__l">Annulations</span>
          <span className="tile__n">{month.cancelRate === null ? '—' : percent(month.cancelRate)}</span>
          <Delta now={month.cancelRate} before={lastMonth.cancelRate} points />
        </div>
      </div>

      <section className="panel">
        <div className="panel__head">
          <h3>Ventes encaissées, 30 derniers jours</h3>
          <span className="panel__aside">{formatPrice(data.days.reduce((s, d) => s + d.revenue, 0))} au total</span>
        </div>
        <SalesChart days={data.days} />
      </section>

      <div className="cols">
        <section className="panel">
          <h3>Stock</h3>
          <dl className="kv">
            <div>
              <dt>En vente</dt>
              <dd>{stock.available}</dd>
            </div>
            <div>
              <dt>Réservés</dt>
              <dd>{stock.reserved}</dd>
            </div>
            <div>
              <dt>Vendus</dt>
              <dd>{stock.sold}</dd>
            </div>
            <div>
              <dt>Ajoutés ce mois</dt>
              <dd>{stock.addedThisMonth}</dd>
            </div>
            <div>
              <dt>Délai de vente</dt>
              <dd>
                {stock.avgDaysToSell === null
                  ? '—'
                  : stock.avgDaysToSell < 1
                    ? "Moins d'un jour en moyenne"
                    : `${String(stock.avgDaysToSell).replace('.', ',')} jours en moyenne`}
              </dd>
            </div>
          </dl>
        </section>

        <section className="panel">
          <h3>Rayons qui vendent le mieux</h3>
          {data.topRayons.length === 0 ? (
            <p className="small muted">Apparaît après les premières ventes livrées.</p>
          ) : (
            <ol className="rank">
              {data.topRayons.map((r) => (
                <li key={r.path} style={{ '--w': r.sold / data.topRayons[0].sold } as CSSProperties}>
                  <span className="rank__name">{r.name}</span>
                  <span className="rank__n">{r.sold} {r.sold === 1 ? 'vendu' : 'vendus'}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <div className="sect">
        <h2>Dernières commandes</h2>
        {data.recent.length > 0 && <Link to="/commandes">Tout voir</Link>}
      </div>
      {data.recent.length === 0 ? (
        <Empty title="Aucune commande pour l'instant">Elles arrivent ici en direct dès qu'un client commande sur la boutique.</Empty>
      ) : (
        <OrderList orders={data.recent} />
      )}
    </>
  );
}

/** Round up to 1, 2 or 5 × 10ⁿ dinars so the top gridline reads cleanly. */
function niceMax(millimes: number) {
  const dt = Math.max(millimes / 1000, 1);
  const p = 10 ** Math.floor(Math.log10(dt));
  return ([1, 2, 5, 10].find((m) => m * p >= dt) ?? 10) * p * 1000;
}

/** One bar per day. Hover or focus a bar for its value; the table below carries every value too. */
function SalesChart({ days }: { days: { day: string; revenue: number; orders: number }[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...days.map((d) => d.revenue)));
  const empty = days.every((d) => d.revenue === 0);
  const a = active === null ? null : days[active];

  return (
    <figure className="bars">
      <div className="bars__plot" onMouseLeave={() => setActive(null)}>
        <span className="bars__grid bars__grid--top" data-label={empty ? '' : formatPrice(max)} />
        <span className="bars__grid bars__grid--mid" data-label={empty ? '' : formatPrice(max / 2)} />
        <span className="bars__grid bars__grid--base" />
        <div className="bars__cols">
          {days.map((d, i) => (
            <button
              key={d.day}
              type="button"
              className="bars__col"
              aria-label={`${dayLabel(d.day)} : ${formatPrice(d.revenue)}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              {d.revenue > 0 && <span className="bars__bar" style={{ '--h': d.revenue / max } as CSSProperties} />}
            </button>
          ))}
        </div>
        {a && (
          <div className="bars__tip" style={{ '--x': (active! + 0.5) / days.length } as CSSProperties} role="status">
            <strong>{formatPrice(a.revenue)}</strong>
            <span>
              {dayLabel(a.day, { weekday: 'short', day: 'numeric', month: 'short' })} · {a.orders} {a.orders === 1 ? 'commande' : 'commandes'}
            </span>
          </div>
        )}
        {empty && <p className="bars__empty">Le graphique se remplit dès la première commande livrée.</p>}
      </div>
      <figcaption className="bars__x">
        <span>{dayLabel(days[0].day)}</span>
        <span>{dayLabel(days[14].day)}</span>
        <span>Aujourd'hui</span>
      </figcaption>
      {!empty && (
        <details className="bars__table">
          <summary>Voir les chiffres</summary>
          <table className="tbl">
            <thead>
              <tr>
                <th>Jour</th>
                <th>Commandes</th>
                <th className="num">Encaissé</th>
              </tr>
            </thead>
            <tbody>
              {days
                .filter((d) => d.revenue > 0)
                .reverse()
                .map((d) => (
                  <tr key={d.day}>
                    <td>{dayLabel(d.day, { weekday: 'long', day: 'numeric', month: 'long' })}</td>
                    <td>{d.orders}</td>
                    <td className="num">{formatPrice(d.revenue)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </details>
      )}
    </figure>
  );
}
