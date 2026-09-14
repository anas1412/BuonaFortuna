import { useQuery } from 'convex/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { api } from '../../../convex/_generated/api';
import { PRODUCT_STATUS_LABEL, formatPrice, type ProductStatus } from '../../lib/shop';

const TABS: { key: ProductStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'available', label: 'En vente' },
  { key: 'reserved', label: 'Réservés' },
  { key: 'sold', label: 'Vendus' },
];

export default function Products() {
  const [tab, setTab] = useState<ProductStatus | 'all'>('all');
  const [q, setQ] = useState('');
  const products = useQuery(api.products.adminList, tab === 'all' ? {} : { status: tab });
  const navigate = useNavigate();

  const needle = q.trim().toLowerCase();
  const shown = products?.filter(
    (p) => !needle || p.name.toLowerCase().includes(needle) || p.brand.toLowerCase().includes(needle),
  );

  return (
    <>
      <div className="adm__head">
        <h1>Articles</h1>
        <Link to="/produits/nouveau" className="btn btn--primary btn--sm">
          + Ajouter un article
        </Link>
      </div>

      <div className="adm__head">
        <div className="tabs" role="tablist" style={{ marginBottom: 0 }}>
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
        <input
          type="search"
          className="input"
          style={{ maxWidth: 280, minHeight: 40 }}
          placeholder="Nom ou marque…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Rechercher un article"
        />
      </div>

      {!shown ? (
        <div className="loading">Chargement…</div>
      ) : shown.length === 0 ? (
        <div className="empty">Aucun article ici.</div>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 60 }}></th>
              <th>Article</th>
              <th className="hide-sm">Catégorie</th>
              <th className="hide-sm">Taille</th>
              <th className="num">Prix</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p._id} className="is-link" onClick={() => navigate(`/produits/${p._id}`)}>
                <td>
                  <img src={p.images[0]?.url} alt="" className="tbl__thumb" />
                </td>
                <td>
                  <span className="tbl__name">{p.name}</span>
                  <span className="tbl__sub">
                    {p.brand} · {p.condition}
                  </span>
                </td>
                <td className="hide-sm">{p.category?.name}</td>
                <td className="hide-sm">{p.size}</td>
                <td className="num">{formatPrice(p.price)}</td>
                <td>
                  <span className={`st st--${p.status}`}>{PRODUCT_STATUS_LABEL[p.status]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
