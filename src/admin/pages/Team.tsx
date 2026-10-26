import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { api } from '../../../convex/_generated/api';
import ConfirmButton from '../ConfirmButton';
import { Loading, PageHead } from '../ui';
import { ROLE_LABEL, errorMessage, useMe } from '../util';

type Role = keyof typeof ROLE_LABEL;
const ROLES = Object.keys(ROLE_LABEL) as Role[];

/**
 * Who can open the back office. Adding an address doesn't send anything: the
 * person opens /admin/connexion and creates their account with it. Owners
 * (ADMIN_EMAIL) are listed but locked.
 */
export default function Team() {
  const team = useQuery(api.team.list);
  const me = useMe();
  const add = useMutation(api.team.add);
  const setRole = useMutation(api.team.setRole);
  const remove = useMutation(api.team.remove);
  const [email, setEmail] = useState('');
  const [role, setNewRole] = useState<Role>('manager');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
      return true;
    } catch (e) {
      setError(errorMessage(e));
      return false;
    }
  };

  const onAdd: React.ComponentProps<'form'>['onSubmit'] = async (e) => {
    e.preventDefault();
    setBusy(true);
    if (await run(() => add({ email, role }))) setEmail('');
    setBusy(false);
  };

  if (!team) return <Loading rows={2} />;

  return (
    <>
      <PageHead title="Équipe" sub="Les personnes qui peuvent ouvrir cette administration, et ce qu'elles ont le droit de faire." />

      {error && (
        <p className="aform__error" role="alert">
          {error}
        </p>
      )}

      <form className="aform__card team__add" onSubmit={onAdd}>
        <h3>Ajouter une personne</h3>
        <div className="aform__row">
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom@exemple.com" />
          </div>
          <div className="field">
            <label htmlFor="role">Rôle</label>
            <select id="role" className="input" value={role} onChange={(e) => setNewRole(e.target.value as Role)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="small muted">
          Aucun e-mail n'est envoyé : la personne ouvre <strong>/admin</strong> et crée son compte avec cette adresse.
          Un gestionnaire gère les articles et les commandes ; il ne peut ni supprimer un article, ni toucher aux catégories ou à l'équipe.
        </p>
        <div>
          <button type="submit" className="btn btn--primary btn--sm" disabled={busy}>
            {busy ? 'Ajout…' : 'Ajouter'}
          </button>
        </div>
      </form>

      <table className="tbl">
        <thead>
          <tr>
            <th>Personne</th>
            <th>Rôle</th>
            <th className="tbl__end">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {team.map((m) => {
            const self = m.email === me?.email;
            return (
              <tr key={m.email}>
                <td>
                  <span className="tbl__name">{m.email}{self && ' (vous)'}</span>
                  <span className="tbl__sub">
                    {m.owner ? 'Propriétaire' : m.joined ? 'Compte créé' : 'Pas encore de compte'}
                  </span>
                </td>
                <td>
                  {m.id === null || self ? (
                    ROLE_LABEL[m.role]
                  ) : (
                    <select className="input" value={m.role} aria-label={`Rôle de ${m.email}`} onChange={(e) => void run(() => setRole({ id: m.id!, role: e.target.value as Role }))}>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="tbl__end">
                  {m.id !== null && !self && (
                    <ConfirmButton label="Retirer" confirmLabel="Oui, retirer" hint="L'accès s'arrête immédiatement." onConfirm={() => void run(() => remove({ id: m.id! }))} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
