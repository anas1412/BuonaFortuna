import { useAuthActions, useConvexAuth } from '@convex-dev/auth/react';
import { useState } from 'react';
import { Navigate } from 'react-router';
import { errorMessage } from '../util';

/**
 * Sign in — or, the very first time, create the account. Both go through the
 * same allowlist on the server, so an unknown email is refused either way.
 */
export default function Login() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit: React.ComponentProps<'form'>['onSubmit'] = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const data = new FormData(e.currentTarget);
    data.set('flow', flow);
    try {
      await signIn('password', data);
    } catch (err) {
      const msg = errorMessage(err, '');
      setError(
        msg && !/InvalidSecret|Invalid password|InvalidAccountId/i.test(msg)
          ? msg
          : flow === 'signIn'
            ? 'Email ou mot de passe incorrect.'
            : "Impossible de créer le compte avec ces informations.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <form className="login__card" onSubmit={onSubmit}>
        <div>
          <span className="logo" style={{ fontSize: 22 }}>
            <span className="logo__a">Buona</span>
            <span className="logo__b">Fortuna</span>
          </span>
        </div>
        <h1>{flow === 'signIn' ? 'Connexion' : 'Créer le compte administrateur'}</h1>

        {error && (
          <p className="aform__error" role="alert">
            {error}
          </p>
        )}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" required autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            required
            minLength={8}
            autoComplete={flow === 'signIn' ? 'current-password' : 'new-password'}
          />
        </div>

        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Un instant…' : flow === 'signIn' ? 'Se connecter' : 'Créer le compte'}
        </button>

        <button type="button" className="login__switch" onClick={() => setFlow(flow === 'signIn' ? 'signUp' : 'signIn')}>
          {flow === 'signIn' ? 'Première connexion ? Créer le compte' : "J'ai déjà un compte"}
        </button>
      </form>
    </div>
  );
}
