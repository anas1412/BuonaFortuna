import type { ReactNode } from 'react';
import { Link } from 'react-router';

/**
 * The few building blocks every admin screen shares, so each screen is laid
 * out the same way: a header, optional status tabs, then content or a state.
 */

/** Title, optional back link and subtitle, and the screen's one main action. */
export function PageHead({ title, back, sub, children }: { title: ReactNode; back?: { to: string; label: string }; sub?: ReactNode; children?: ReactNode }) {
  return (
    <header className="phead">
      <div className="phead__text">
        {back && (
          <Link to={back.to} className="phead__back">
            <Icon name="back" /> {back.label}
          </Link>
        )}
        <h1>{title}</h1>
        {sub && <p className="phead__sub">{sub}</p>}
      </div>
      {children && <div className="phead__actions">{children}</div>}
    </header>
  );
}

/** One row of status filters; scrolls sideways on a phone instead of wrapping. */
export function Tabs<K extends string>({ tabs, value, onChange }: { tabs: { key: K; label: string; count?: number }[]; value: K; onChange: (k: K) => void }) {
  return (
    <div className="seg" role="tablist">
      {tabs.map((t) => (
        <button key={t.key} type="button" role="tab" aria-selected={value === t.key} onClick={() => onChange(t.key)}>
          {t.label}
          {t.count ? <span className="seg__n">{t.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

/** Says what will show up here and, when there is one, what to do about it. */
export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <p className="empty__title">{title}</p>
      {children && <p className="empty__text">{children}</p>}
      {action}
    </div>
  );
}

/** Grey bars shaped like a list, instead of a bare « Chargement… ». */
export function Loading({ rows = 4 }: { rows?: number }) {
  return (
    <div className="skel" aria-busy="true" aria-label="Chargement">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skel__row" />
      ))}
    </div>
  );
}

const PATHS = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  orders: 'M6 3h12a1 1 0 0 1 1 1v17l-3.5-2-3.5 2-3.5-2L5 21V4a1 1 0 0 1 1-1zM9 8h6M9 12h6',
  tag: 'M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9zM8 8h.01',
  folder: 'M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
  team: 'M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.2a3.5 3.5 0 0 1 0 6.6',
  back: 'M15 18l-6-6 6-6',
  plus: 'M12 5v14M5 12h14',
  phone: 'M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  chat: 'M4 20l1.3-3.9A8 8 0 1 1 8 19.1z',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  logout: 'M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11',
} as const;

/** One icon set, one stroke width. Decorative: the text next to it carries the meaning. */
export function Icon({ name }: { name: keyof typeof PATHS }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
