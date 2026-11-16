'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Overlay({ title, eyebrow, children, onClose, wide = false }: { title: string; eyebrow?: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const dismiss = useRef(onClose);
  dismiss.current = onClose;

  useEffect(() => {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = ref.current;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, []);

  return <dialog ref={ref} className={`dialog ${wide ? 'wide' : ''}`} aria-labelledby="dialog-title" onCancel={event => { event.preventDefault(); dismiss.current(); }} onClick={event => { if (event.target === ref.current) dismiss.current(); }}>
    <div className="dialog-head"><div>{eyebrow && <p className="dialog-eyebrow">{eyebrow}</p>}<h2 id="dialog-title">{title}</h2></div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} /></button></div>
    {children}
  </dialog>;
}
