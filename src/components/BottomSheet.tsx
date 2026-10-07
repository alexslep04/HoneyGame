import { useEffect, useId, useRef, type ReactNode } from "react";
import { Flower2, X } from "lucide-react";

export function BottomSheet({
  open,
  title,
  subtitle,
  notice,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  notice?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const swipeStart = useRef<number | null>(null);
  useEffect(() => {
    const element = dialog.current!;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className="game-sheet"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientY < bounds.top ||
            event.clientX < bounds.left ||
            event.clientX > bounds.right
          )
            event.currentTarget.close();
        }
      }}
    >
      <header
        className="sheet-header"
        onPointerDown={(event) => {
          swipeStart.current = event.clientY;
        }}
        onPointerUp={(event) => {
          if (
            swipeStart.current !== null &&
            event.clientY - swipeStart.current > 60
          )
            dialog.current?.close();
          swipeStart.current = null;
        }}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
      >
        <span className="sheet-handle" aria-hidden="true" />
        <div>
          {subtitle && <span className="eyebrow">{subtitle}</span>}
          <h2 id={titleId}>{title}</h2>
        </div>
        <button
          className="icon-button close-sheet"
          aria-label={`Close ${title}`}
          onClick={() => dialog.current?.close()}
          autoFocus
        >
          <X size={23} />
        </button>
      </header>
      <div className="sheet-content">{open && children}</div>
      {open && notice && (
        <div className="sheet-notice" role="status">
          <Flower2 size={19} />
          <span>{notice}</span>
        </div>
      )}
    </dialog>
  );
}
