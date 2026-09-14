import { useMutation, useQuery } from 'convex/react';
import { useEffect, useRef, useState } from 'react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import ConfirmButton from '../ConfirmButton';
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
 * The category tree: Département › Rayon › Type. Everything edits in place —
 * click « Renommer » and the name becomes a field; « Texte » opens the page
 * paragraph under the row; deleting asks once, inline. Nodes with no stock
 * are listed here but hidden on the site.
 */
export default function Categories() {
  const tree = useQuery(api.categories.tree);
  const create = useMutation(api.categories.create);
  const update = useMutation(api.categories.update);
  const remove = useMutation(api.categories.remove);
  const [error, setError] = useState<string | null>(null);

  if (!tree) return <div className="loading">Chargement…</div>;

  const childrenOf = (id: Id<'categories'> | undefined) =>
    tree.filter((c) => c.parentId === id).sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const actions = {
    add: (parentId: Id<'categories'> | undefined, name: string) => run(() => create({ name, parentId })),
    rename: (node: Node, name: string) => run(() => update({ id: node._id, name })),
    intro: (node: Node, intro: string) => run(() => update({ id: node._id, intro })),
    remove: (node: Node) => run(() => remove({ id: node._id })),
  };

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
            <Row node={d} level={1} actions={actions} as="summary" />
            <div className="ctree__children">
              {childrenOf(d._id).map((r) => (
                <details key={r._id} className="ctree__rayon" open={r.count > 0}>
                  <Row node={r} level={2} actions={actions} as="summary" />
                  <ul className="ctree__leaves">
                    {childrenOf(r._id).map((t) => (
                      <Row key={t._id} node={t} level={3} actions={actions} as="li" />
                    ))}
                    <li>
                      <AddForm placeholder="Nouveau type…" onAdd={(name) => actions.add(r._id, name)} />
                    </li>
                  </ul>
                </details>
              ))}
              <AddForm placeholder={`Nouveau rayon dans ${d.name}…`} onAdd={(name) => actions.add(d._id, name)} />
            </div>
          </details>
        ))}
        <AddForm placeholder="Nouveau département…" onAdd={(name) => actions.add(undefined, name)} />
      </div>
    </>
  );
}

type Actions = {
  rename: (node: Node, name: string) => Promise<void>;
  intro: (node: Node, intro: string) => Promise<void>;
  remove: (node: Node) => Promise<void>;
};

/** One line of the tree, with its in-place editors. */
function Row({ node, level, actions, as }: { node: Node; level: 1 | 2 | 3; actions: Actions; as: 'summary' | 'li' }) {
  const [mode, setMode] = useState<'view' | 'rename' | 'intro'>('view');
  const stop = (e: React.SyntheticEvent) => {
    // Inside a <summary>, clicks and keys would toggle the <details>.
    e.stopPropagation();
    if (e.type === 'click') e.preventDefault();
  };

  const tools = (
    <span className="ctree__tools" onClick={stop}>
      <button type="button" onClick={() => setMode('rename')}>
        Renommer
      </button>
      {level < 3 && (
        <button type="button" onClick={() => setMode(mode === 'intro' ? 'view' : 'intro')}>
          Texte
        </button>
      )}
      {node.count === 0 && (
        <ConfirmButton
          label="Supprimer"
          confirmLabel="Oui, supprimer"
          className="ctree__delete"
          onConfirm={() => actions.remove(node)}
        />
      )}
    </span>
  );

  const name =
    mode === 'rename' ? (
      <InlineInput
        initial={node.name}
        onCancel={() => setMode('view')}
        onSave={async (v) => {
          if (v && v !== node.name) await actions.rename(node, v);
          setMode('view');
        }}
        onClick={stop}
      />
    ) : (
      <span className="ctree__name">{node.name}</span>
    );

  const introEditor = mode === 'intro' && (
    <IntroEditor
      initial={node.intro ?? ''}
      onCancel={() => setMode('view')}
      onSave={async (v) => {
        await actions.intro(node, v);
        setMode('view');
      }}
    />
  );

  const rowClass = `ctree__row ctree__row--l${level}${node.count === 0 && level === 3 ? ' is-empty' : ''}`;

  if (as === 'summary') {
    return (
      <>
        <summary className={rowClass}>
          {name}
          <span className="ctree__n">{node.count}</span>
          {tools}
        </summary>
        {introEditor && <div className="ctree__introWrap">{introEditor}</div>}
      </>
    );
  }
  return (
    <li className={rowClass}>
      {name}
      <span className="ctree__n">{node.count}</span>
      {tools}
    </li>
  );
}

/** Text field that replaces a label: Enter saves, Escape cancels, leaving saves. */
function InlineInput({
  initial,
  onSave,
  onCancel,
  onClick,
}: {
  initial: string;
  onSave: (v: string) => void | Promise<void>;
  onCancel: () => void;
  onClick?: (e: React.SyntheticEvent) => void;
}) {
  const [v, setV] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  return (
    <input
      ref={ref}
      className="input ctree__inline"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onClick={onClick}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Enter') void onSave(v.trim());
        if (e.key === 'Escape') onCancel();
      }}
      onBlur={() => void onSave(v.trim())}
      aria-label="Nouveau nom"
    />
  );
}

/** The paragraph shown at the top of a department or rayon page. */
function IntroEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: string;
  onSave: (v: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [v, setV] = useState(initial);
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="ctree__intro">
      <label className="small muted" htmlFor="intro-editor">
        Texte d’introduction de la page — vide pour aucun
      </label>
      <textarea
        id="intro-editor"
        ref={ref}
        className="input"
        rows={3}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel();
        }}
      />
      <div className="aform__actions">
        <button type="button" className="btn btn--primary btn--sm" onClick={() => void onSave(v.trim())}>
          Enregistrer
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </div>
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
