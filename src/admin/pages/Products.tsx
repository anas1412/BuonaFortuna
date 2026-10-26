import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { Link } from 'react-router';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { PRODUCT_STATUS_LABEL, formatPrice, type ProductStatus } from '../../lib/shop';
import ConfirmButton from '../ConfirmButton';
import { Empty, Icon, Loading, PageHead, Tabs } from '../ui';
import { errorMessage, useIsAdmin } from '../util';

const DISCOUNTS = [10, 20, 30, 50];

type Tab = ProductStatus | 'all';

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'available', label: 'En vente' },
  { key: 'reserved', label: 'Réservés' },
  { key: 'sold', label: 'Vendus' },
  { key: 'draft', label: 'Brouillons' },
];

export default function Products() {
  const [tab, setTab] = useState<Tab>('all');
  const [q, setQ] = useState('');
  const products = useQuery(api.products.adminList, tab === 'all' ? {} : { status: tab });
  const isAdmin = useIsAdmin();
  const bulkStatus = useMutation(api.products.bulkStatus);
  const bulkDiscount = useMutation(api.products.bulkDiscount);
  const bulkRemove = useMutation(api.products.bulkRemove);
  const [picked, setPicked] = useState<Set<Id<'products'>>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const needle = q.trim().toLowerCase();
  const shown = products?.filter(
    (p) => !needle || p.name.toLowerCase().includes(needle) || p.brand.toLowerCase().includes(needle),
  );
  // Only what's on screen can be acted on: changing tab or search narrows the selection.
  const selected = (shown ?? []).filter((p) => picked.has(p._id)).map((p) => p._id);
  const allPicked = !!shown?.length && selected.length === shown.length;
  const toggle = (id: Id<'products'>) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fn();
      setPicked(new Set());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

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

      {error && (
        <p className="aform__error" role="alert">
          {error}
        </p>
      )}

      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}

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
              <th className="tbl__media">
                <input
                  type="checkbox"
                  className="pick"
                  checked={allPicked}
                  onChange={() => setPicked(allPicked ? new Set() : new Set(shown.map((p) => p._id)))}
                  aria-label="Tout sélectionner"
                />
              </th>
              <th>Article</th>
              <th className="hide-sm">Catégorie</th>
              <th className="hide-sm">Taille</th>
              <th className="num">Prix</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p._id} className={picked.has(p._id) ? 'is-picked' : undefined}>
                <td className="tbl__media">
                  <div className="tbl__pickrow">
                    <input type="checkbox" className="pick" checked={picked.has(p._id)} onChange={() => toggle(p._id)} aria-label={`Sélectionner ${p.name}`} />
                    {p.images[0] ? <img src={p.images[0].url} alt="" className="tbl__thumb" /> : <span className="tbl__thumb tbl__thumb--empty" aria-hidden="true" />}
                  </div>
                </td>
                <td>
                  <Link to={`/produits/${p._id}`} className="tbl__name tbl__link">
                    {p.name}
                  </Link>
                  <span className="tbl__sub">{[p.brand, p.size, p.condition].filter(Boolean).join(' · ')}</span>
                </td>
                <td className="hide-sm">{p.category?.name}</td>
                <td className="hide-sm">{p.size}</td>
                <td className="num">{p.price ? formatPrice(p.price) : '—'}</td>
                <td className="tbl__status">
                  <span className={`st st--${p.status}`}>{PRODUCT_STATUS_LABEL[p.status]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected.length > 0 && (
        <div className="batch" role="region" aria-label="Actions sur la sélection">
          <span className="batch__count">
            {selected.length} {selected.length === 1 ? 'article' : 'articles'}
            <button type="button" className="batch__clear" onClick={() => setPicked(new Set())}>
              Désélectionner
            </button>
          </span>
          <select
            className="input"
            value=""
            disabled={busy}
            aria-label="Changer le statut"
            onChange={(e) =>
              void run(async () => {
                const { incomplete } = await bulkStatus({ ids: selected, status: e.target.value as ProductStatus });
                if (incomplete)
                  setNotice(`${incomplete} ${incomplete === 1 ? 'brouillon incomplet est resté' : 'brouillons incomplets sont restés'} en brouillon : il manque une photo, un prix ou une description.`);
              })
            }
          >
            <option value="" disabled>
              Statut…
            </option>
            {(Object.keys(PRODUCT_STATUS_LABEL) as ProductStatus[]).map((s) => (
              <option key={s} value={s}>
                {s === 'available' ? 'Disponible (publier)' : PRODUCT_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <select
            className="input"
            value=""
            disabled={busy}
            aria-label="Appliquer une remise"
            onChange={(e) =>
              void run(async () => {
                const percent = e.target.value === 'none' ? null : Number(e.target.value);
                const { unchanged } = await bulkDiscount({ ids: selected, percent });
                if (unchanged && percent !== null)
                  setNotice(`${unchanged} ${unchanged === 1 ? 'article était déjà moins cher' : 'articles étaient déjà moins chers'} que −${percent} % : prix inchangé.`);
              })
            }
          >
            <option value="" disabled>
              Remise…
            </option>
            {DISCOUNTS.map((d) => (
              <option key={d} value={d}>
                −{d} %
              </option>
            ))}
            <option value="none">Retirer la remise</option>
          </select>
          {isAdmin && (
            <ConfirmButton
              label="Supprimer"
              confirmLabel={`Oui, supprimer ${selected.length}`}
              hint="Définitif, photos comprises."
              disabled={busy}
              onConfirm={() => run(() => bulkRemove({ ids: selected }))}
            />
          )}
        </div>
      )}
    </>
  );
}
