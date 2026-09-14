import { useEffect, useState } from 'react';

/**
 * A destructive action in two clicks, in place. First click turns the button
 * into "Oui, … / Annuler"; it snaps back on its own after a few seconds. No
 * dialogs, so it looks like the rest of the interface and can't be misclicked.
 */
export default function ConfirmButton({
  label,
  confirmLabel,
  hint,
  onConfirm,
  className = 'btn btn--danger btn--sm',
  disabled,
}: {
  label: string;
  confirmLabel: string;
  hint?: string;
  onConfirm: () => void | Promise<void>;
  className?: string;
  disabled?: boolean;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 5000);
    return () => clearTimeout(t);
  }, [armed]);

  if (!armed) {
    return (
      <button type="button" className={className} disabled={disabled} onClick={() => setArmed(true)}>
        {label}
      </button>
    );
  }

  return (
    <span className="confirm" role="group" aria-label={label}>
      {hint && <span className="confirm__hint">{hint}</span>}
      <button
        type="button"
        className="btn btn--primary btn--sm confirm__yes"
        disabled={disabled}
        onClick={() => {
          setArmed(false);
          void onConfirm();
        }}
      >
        {confirmLabel}
      </button>
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setArmed(false)}>
        Annuler
      </button>
    </span>
  );
}
