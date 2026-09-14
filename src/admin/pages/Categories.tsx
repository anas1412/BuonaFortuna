import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { errorMessage } from '../util';

type Node = {
  _id: Id<'categories'>;
  name: string;
  path: string;
  level: number;
  parentId?: Id<'categories'>;
  count: number;
  intro?: string;
};

/**
 * The category tree: Département › Rayon › Type. Add a node under any parent
 * (three levels max), rename in place, delete when empty. Nodes with no stock
 * are shown here but hidden on the site.
 */
export default function Categories() {
  const tree = useQuery(api.categories.tree);
  const create = useMutation(api.categories.create);
  const rename = useMutation(api.categories.update);
  const remove = useMutation(api.categories.remove);
  const [error, setError] = useState<string | null>(null);

  if (!tree) return <div className="loading">Chargement…</div>;

  const childrenOf = (id: Id<'categories'> | undefined) =>
    tree.filter((c) => c.parentId === id).sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  async function onAdd(parentId: Id<'categories'> | undefined, name: string) {
    setError(null);
    try {
      await create({ name, parentId });
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  async function onRename(node: Node) {
    const name = window.prompt('Nouveau nom', node.name);
    if (!name || name.trim() === node.name) return;
    setError(null);
    try {
      await rename({ id: node._id, name });
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  async function onIntro(node: Node) {
    const intro = window.prompt('Texte d’introduction de la page (vide pour aucun)', node.intro ?? '');
    if (intro === null) return;
    setError(null);
    try {
      await rename({ id: node._id, intro });
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  async function onRemove(node: Node) {
    if (!window.confirm(`Supprimer « ${node.name} » ?`)) return;
    setError(null);
    try {
      await remove({ id: node._id });
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  const departments = childrenOf(undefined);
  const stocked = tree.filter((c) => c.level === 3 && c.count > 0).length;

  return (
    <>
      <div className="adm__head">
        <h1>Catégories</h1>
        <span className="muted small">
          {tree.length} catégories · {stocked} avec du stock
        </span>
      </div>

      {error && (
        <p className="aform__error" role="alert" style={{ marginBottom: 16 }}>
          {error}
        </p>
      )}

      <div className="ctree">
        {departments.map((d) => (
          <details key={d._id} className="ctree__dept" open={d.count > 0}>
            <summary className="ctree__row ctree__row--l1">
              <span className="ctree__name">{d.name}</span>
              <span className="ctree__n">{d.count}</span>
              <RowTools node={d} onRename={onRename} onIntro={onIntro} onRemove={onRemove} />
            </summary>
            <div className="ctree__children">
              {childrenOf(d._id).map((r) => (
                <details key={r._id} className="ctree__rayon" open={r.count > 0}>
                  <summary className="ctree__row ctree__row--l2">
                    <span className="ctree__name">{r.name}</span>
                    <span className="ctree__n">{r.count}</span>
                    <RowTools node={r} onRename={onRename} onIntro={onIntro} onRemove={onRemove} />
                  </summary>
                  <ul className="ctree__leaves">
                    {childrenOf(r._id).map((t) => (
                      <li key={t._id} className={`ctree__row ctree__row--l3${t.count ? '' : ' is-empty'}`}>
                        <span className="ctree__name">{t.name}</span>
                        <span className="ctree__n">{t.count}</span>
                        <RowTools node={t} onRename={onRename} onRemove={onRemove} />
                      </li>
                    ))}
                    <li>
                      <AddForm placeholder="Nouveau type…" onAdd={(name) => onAdd(r._id, name)} />
                    </li>
                  </ul>
                </details>
              ))}
              <AddForm placeholder={`Nouveau rayon dans ${d.name}…`} onAdd={(name) => onAdd(d._id, name)} />
            </div>
          </details>
        ))}
        <AddForm placeholder="Nouveau département…" onAdd={(name) => onAdd(undefined, name)} />
      </div>
    </>
  );
}

function RowTools({
  node,
  onRename,
  onIntro,
  onRemove,
}: {
  node: Node;
  onRename: (n: Node) => void;
  onIntro?: (n: Node) => void;
  onRemove: (n: Node) => void;
}) {
  return (
    <span className="ctree__tools" onClick={(e) => e.preventDefault()}>
      <button type="button" title="Renommer" onClick={() => onRename(node)}>
        Renommer
      </button>
      {onIntro && (
        <button type="button" title="Texte de la page" onClick={() => onIntro(node)}>
          Texte
        </button>
      )}
      {node.count === 0 && (
        <button type="button" className="is-danger" title="Supprimer" onClick={() => onRemove(node)}>
          Supprimer
        </button>
      )}
    </span>
  );
}

function AddForm({ placeholder, onAdd }: { placeholder: string; onAdd: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <form
      className="ctree__add"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAdd(name.trim());
        setName('');
      }}
    >
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
      <button type="submit" className="btn btn--outline btn--sm" disabled={!name.trim()}>
        Ajouter
      </button>
    </form>
  );
}
