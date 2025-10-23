import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function ViewModal({
  open,
  onClose,
  title,
  children,
  width = 720,
  heightVh = 80,
  showClose = true,
  footer = null, // <Buttons/> 등
  closeOnBackdrop = true,
}) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onEsc);
    // 스크롤 락
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => closeOnBackdrop && onClose?.()}
      />
      {/* Panel */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   bg-white rounded-2xl shadow-xl border border-gray-200
                    flex flex-col"
        style={{
          width,
          maxWidth: '90vw',
          height: `${heightVh}vh`,
          maxHeight: '90vh',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-300/60">
          <h3 id="modal-title" className="font-semibold">
            {title}
          </h3>
          {showClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100"
              aria-label="닫기"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5 overflow-auto grow">{children}</div>

        {/* Footer (optional) */}
        {footer && <div className="px-5 py-3 border-t">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
