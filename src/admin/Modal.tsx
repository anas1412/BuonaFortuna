import { useEffect, useRef } from 'react';

/**
 * A modal on the native <dialog> element: real focus trap, Escape closes,
 * backdrop dims the page, no library. Styled like the rest of the back office.
 */
export default function Modal({
  open,
  title,
  onClose,
  children,
  actions,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  actions: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="modal"
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop lands on the <dialog> itself, not its content.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal__card">
        <h2 className="modal__title">{title}</h2>
        <div className="modal__body">{children}</div>
        <div className="modal__actions">{actions}</div>
      </div>
    </dialog>
  );
}
