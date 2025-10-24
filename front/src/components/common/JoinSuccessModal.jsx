// src/components/modal/JoinSuccessModal.jsx
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function JoinSuccessModal({
  open,
  onClose,
  variant = 'success', // 'success' | 'error' | 'info'
  title = '신청이 완료되었습니다',
  desc = '모임장이 확인하면 알림으로 알려드릴게요.',
}) {
  const backdropRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    setTimeout(() => closeRef.current?.focus(), 0);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  // ✔ 아이콘/색 규칙: success=초록 체크, 그 외(에러/정보)=빨간 주의
  const isSuccess = variant === 'success';
  const Icon = isSuccess ? CheckCircleIcon : ExclamationTriangleIcon;
  const color = isSuccess ? 'text-green-500' : 'text-red-500';

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={(e) => e.target === backdropRef.current && onClose?.()}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white w-[360px] rounded-xl shadow-xl p-6">
        <button
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="닫기"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Icon className={`w-6 h-6 ${color}`} />
          <span className="font-semibold">{title}</span>
        </div>

        <div className="text-sm text-gray-600 mb-6">{desc}</div>

        <div className="text-right">
          <button
            ref={closeRef}
            className="px-4 py-2 rounded-lg bg-sky-500 text-white hover:bg-sky-600"
            onClick={onClose}
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
