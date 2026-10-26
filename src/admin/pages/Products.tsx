import { useQuery } from 'convex/react';
import { useState } from 'react';
import { Link } from 'react-router';
import { api } from '../../../convex/_generated/api';
import { PRODUCT_STATUS_LABEL, formatPrice, type ProductStatus } from '../../lib/shop';
import { Empty, Icon, Loading, PageHead, Tabs } from '../ui';

type Tab = ProductStatus | 'all';

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'available', label: 'En vente' },
  { key: 'reserved', label: 'Réservés' },
  { key: 'sold', label: 'Vendus' },
];

export default function Products() {
  const [tab, setTab] = useState<Tab>('all');
  const [q, setQ] = useState('');
  const products = useQuery(api.products.adminList, tab === 'all' ? {} : { status: tab });

  const needle = q.trim().toLowerCase();
  const shown = products?.filter(
    (p) => !needle || p.name.toLowerCase().includes(needle) || p.brand.toLowerCase().includes(needle),
  );

  return (
    <>
      <PageHead title="Articles" sub="Chaque pièce est unique : elle passe en « Réservé » dès qu'un client commande.">
        <Link to="/produits/nouveau" className="btn btn--primary">
          <Icon name="plus" /> Ajouter un article
        </Link>
      </PageHead>

      <div className="toolbar">
        <Tabs tabs={TABS} value={tab} onChange={setTab} />
        <input
          type="search"
          className="input"
          placeholder="Rechercher un nom ou une marque"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Rechercher un article"
        />
      </div>

      {!shown ? (
        <Loading />
      ) : shown.length === 0 ? (
        needle ? (
          <Empty title="Aucun résultat">Aucun article ne correspond à « {q.trim()} ».</Empty>
        ) : (
          <Empty
            title="Aucun article ici"
            action={
              <Link to="/produits/nouveau" className="btn btn--primary btn--sm">
                <Icon name="plus" /> Ajouter un article
              </Link>
            }
          >
            Prenez la pièce en photo, puis ajoutez-la : elle sera en ligne tout de suite.
          </Empty>
        )
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th className="tbl__media">Photo</th>
              <th>Article</th>
              <th className="hide-sm">Catégorie</th>
              <th className="hide-sm">Taille</th>
              <th className="num">Prix</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p._id}>
                <td className="tbl__media">
                  <img src={p.images[0]?.url} alt="" className="tbl__thumb" />
                </td>
                <td>
                  <Link to={`/produits/${p._id}`} className="tbl__name tbl__link">
                    {p.name}
                  </Link>
                  <span className="tbl__sub">{[p.brand, p.size, p.condition].filter(Boolean).join(' · ')}</span>
                </td>
                <td className="hide-sm">{p.category?.name}</td>
                <td className="hide-sm">{p.size}</td>
                <td className="num">{formatPrice(p.price)}</td>
                <td className="tbl__status">
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
