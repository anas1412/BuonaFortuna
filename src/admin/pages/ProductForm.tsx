import { useMutation, useQuery } from 'convex/react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { KNOWN_TAGS } from '../../lib/collections';
import { CONDITIONS, PRODUCT_STATUS_LABEL, isSecondHand, type Condition, type ProductStatus } from '../../lib/shop';
import { dinarsToMillimes, errorMessage, millimesToDinars } from '../util';

type Image = { url: string; storageId?: Id<'_storage'> };

type Draft = {
  name: string;
  brand: string;
  size: string;
  condition: Condition;
  categoryId: string;
  price: string;
  compareAtPrice: string;
  description: string;
  tag: string;
  status: ProductStatus;
  images: Image[];
};

const EMPTY: Draft = {
  name: '',
  brand: '',
  size: '',
  condition: 'Très bon état',
  categoryId: '',
  price: '',
  compareAtPrice: '',
  description: '',
  tag: '',
  status: 'available',
  images: [],
};

/** Add and edit share one form; the route decides which. */
export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const tree = useQuery(api.categories.tree);
  const existing = useQuery(api.products.adminGet, isEdit ? { id: id as Id<'products'> } : 'skip');
  const create = useMutation(api.products.create);
  const update = useMutation(api.products.update);
  const remove = useMutation(api.products.remove);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const imageFromUpload = useMutation(api.products.imageFromUpload);

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [loaded, setLoaded] = useState(!isEdit);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isEdit && existing && !loaded) {
      setDraft({
        name: existing.name,
        brand: existing.brand,
        size: existing.size,
        condition: existing.condition,
        categoryId: existing.categoryId,
        price: millimesToDinars(existing.price),
        compareAtPrice: millimesToDinars(existing.compareAtPrice),
        description: existing.description,
        tag: existing.tag ?? '',
        status: existing.status,
        images: existing.images,
      });
      setLoaded(true);
    }
  }, [isEdit, existing, loaded]);

  // Three-step picker state, derived from the chosen leaf when editing.
  const [dept, setDept] = useState<string>('');
  const [rayon, setRayon] = useState<string>('');
  const byId = useMemo(() => new Map((tree ?? []).map((c) => [c._id as string, c])), [tree]);
  useEffect(() => {
    if (!tree || !draft.categoryId || dept) return;
    const leaf = byId.get(draft.categoryId);
    const r = leaf?.parentId ? byId.get(leaf.parentId) : undefined;
    const d = r?.parentId ? byId.get(r.parentId) : undefined;
    if (r) setRayon(r._id);
    if (d) setDept(d._id);
  }, [tree, draft.categoryId, dept, byId]);
  const departments = (tree ?? []).filter((c) => c.level === 1);
  const rayons = (tree ?? []).filter((c) => c.parentId === dept);
  const types = (tree ?? []).filter((c) => c.parentId === rayon);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploading((n) => n + files.length);
    try {
      for (const file of Array.from(files)) {
        const url = await generateUploadUrl();
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
        if (!res.ok) throw new Error(`Envoi de ${file.name} refusé.`);
        const { storageId } = (await res.json()) as { storageId: Id<'_storage'> };
        const img = await imageFromUpload({ storageId });
        setDraft((d) => ({ ...d, images: [...d.images, img] }));
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setUploading((n) => Math.max(0, n - files.length));
    }
  }

  function moveToFront(i: number) {
    setDraft((d) => {
      const imgs = [...d.images];
      const [img] = imgs.splice(i, 1);
      return { ...d, images: [img, ...imgs] };
    });
  }
  function removeImage(i: number) {
    setDraft((d) => ({ ...d, images: d.images.filter((_, j) => j !== i) }));
  }

  const onSubmit: React.ComponentProps<'form'>['onSubmit'] = async (e) => {
    e.preventDefault();
    setError(null);
    const price = dinarsToMillimes(draft.price);
    const compareAt = draft.compareAtPrice.trim() ? dinarsToMillimes(draft.compareAtPrice) : undefined;
    if (price === null) return setError('Le prix doit être un nombre en dinars.');
    if (compareAt === null) return setError("Le prix d'origine doit être un nombre en dinars.");
    if (!draft.categoryId) return setError('Choisissez une catégorie.');
    if (!draft.images.length) return setError('Ajoutez au moins une photo.');

    const payload = {
      name: draft.name.trim(),
      brand: draft.brand.trim(),
      size: draft.size.trim(),
      condition: draft.condition,
      categoryId: draft.categoryId as Id<'categories'>,
      price,
      compareAtPrice: compareAt ?? undefined,
      description: draft.description.trim(),
      images: draft.images,
      status: draft.status,
      tag: draft.tag.trim() || undefined,
    };

    setBusy(true);
    try {
      if (isEdit) await update({ id: id as Id<'products'>, ...payload });
      else await create(payload);
      navigate('/produits');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  async function onDelete() {
    if (!window.confirm('Supprimer définitivement cet article et ses photos ?')) return;
    setBusy(true);
    try {
      await remove({ id: id as Id<'products'> });
      navigate('/produits');
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  if (isEdit && existing === undefined) return <div className="loading">Chargement…</div>;
  if (isEdit && existing === null) return <div className="empty">Article introuvable.</div>;

  return (
    <>
      <p className="adm__crumb">
        <Link to="/produits">Articles</Link> / {isEdit ? existing?.name : 'Nouvel article'}
      </p>
      <div className="adm__head">
        <h1>{isEdit ? "Modifier l'article" : 'Nouvel article'}</h1>
        {isEdit && existing && (
          <a href={`/p/${existing.slug}`} target="_blank" rel="noopener" className="btn btn--ghost btn--sm">
            Voir la fiche ↗
          </a>
        )}
      </div>

      <form className="aform" onSubmit={onSubmit}>
        <div className="aform__col">
          {error && (
            <p className="aform__error" role="alert">
              {error}
            </p>
          )}

          <section className="aform__card">
            <div className="aform__row">
              <div className="field">
                <label htmlFor="name">Nom de l'article</label>
                <input id="name" className="input" required value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="Trench beige" />
              </div>
              <div className="field">
                <label htmlFor="brand">Marque</label>
                <input id="brand" className="input" required value={draft.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Sandro" />
              </div>
            </div>
            <div className="aform__row">
              <div className="field">
                <label htmlFor="size">{isSecondHand(draft.condition) ? 'Taille' : 'Format'}</label>
                <input id="size" className="input" required value={draft.size} onChange={(e) => set('size', e.target.value)} placeholder={isSecondHand(draft.condition) ? '38, M, 42, Taille unique…' : '50 ml, Teinte 02, 100 g…'} />
              </div>
              <div className="field">
                <label htmlFor="condition">État</label>
                <select id="condition" className="input" value={draft.condition} onChange={(e) => set('condition', e.target.value as Condition)}>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label>Rangement</label>
              <div className="aform__row aform__row--3">
                <select className="input" required value={dept} aria-label="Département" onChange={(e) => { setDept(e.target.value); setRayon(''); set('categoryId', ''); }}>
                  <option value="">Département…</option>
                  {departments.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <select className="input" required value={rayon} aria-label="Rayon" disabled={!dept} onChange={(e) => { setRayon(e.target.value); set('categoryId', ''); }}>
                  <option value="">Rayon…</option>
                  {rayons.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <select className="input" required value={draft.categoryId} aria-label="Type" disabled={!rayon} onChange={(e) => set('categoryId', e.target.value)}>
                  <option value="">Type…</option>
                  {types.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <p className="small muted">Un type manque ? Ajoutez-le dans <Link to="/categories">Catégories</Link>.</p>
            </div>
            <div className="field">
              <label htmlFor="tag">Étiquette <span className="muted">(facultatif)</span></label>
              <input id="tag" className="input" list="tag-options" value={draft.tag} onChange={(e) => set('tag', e.target.value)} placeholder="Coup de cœur, Vintage, Meilleure vente…" />
              <datalist id="tag-options">
                {KNOWN_TAGS.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              <p className="small muted">« Meilleure vente » et « Dernière pièce » alimentent les pages Bonnes affaires du même nom.</p>
            </div>
            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea id="description" className="input" required rows={5} value={draft.description} onChange={(e) => set('description', e.target.value)} placeholder="Matière, coupe, détails, et tout défaut visible." />
            </div>
          </section>

          <section className="aform__card">
            <div className="aform__row">
              <div className="field">
                <label htmlFor="price">Prix (DT)</label>
                <input id="price" className="input" required inputMode="decimal" value={draft.price} onChange={(e) => set('price', e.target.value)} placeholder="68" />
              </div>
              <div className="field">
                <label htmlFor="compare">Prix d'origine (DT) <span className="muted">(facultatif)</span></label>
                <input id="compare" className="input" inputMode="decimal" value={draft.compareAtPrice} onChange={(e) => set('compareAtPrice', e.target.value)} placeholder="240" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="status">Statut</label>
              <select id="status" className="input" value={draft.status} onChange={(e) => set('status', e.target.value as ProductStatus)}>
                {(Object.keys(PRODUCT_STATUS_LABEL) as ProductStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {PRODUCT_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              <p className="small muted">Une commande passe l'article en « Réservé » toute seule. Changez-le à la main seulement pour corriger.</p>
            </div>
          </section>

          <div className="aform__actions">
            <button type="submit" className="btn btn--primary" disabled={busy || uploading > 0}>
              {busy ? 'Enregistrement…' : isEdit ? 'Enregistrer' : "Publier l'article"}
            </button>
            <Link to="/produits" className="btn btn--ghost">
              Annuler
            </Link>
            {isEdit && (
              <button type="button" className="btn btn--danger btn--sm" style={{ marginLeft: 'auto' }} disabled={busy} onClick={onDelete}>
                Supprimer
              </button>
            )}
          </div>
        </div>

        <aside className="aform__card">
          <h3>Photos</h3>
          <p className="small muted">La première est la photo de couverture. Format portrait conseillé.</p>
          <div className="photos">
            {draft.images.map((img, i) => (
              <div key={img.url} className="photo">
                <img src={img.url} alt="" />
                {i === 0 && <span className="chip chip--ink photo__cover">Couverture</span>}
                <div className="photo__tools">
                  {i > 0 && (
                    <button type="button" title="Mettre en couverture" onClick={() => moveToFront(i)}>
                      ★
                    </button>
                  )}
                  <button type="button" title="Retirer" onClick={() => removeImage(i)}>
                    ×
                  </button>
                </div>
              </div>
            ))}
            <label className={`photo photo--add${uploading ? ' photo--busy' : ''}`}>
              <input type="file" accept="image/*" multiple onChange={(e) => void onFiles(e.target.files)} disabled={uploading > 0} />
              {uploading ? `Envoi (${uploading})…` : '+ Ajouter des photos'}
            </label>
          </div>
        </aside>
      </form>
    </>
  );
}
