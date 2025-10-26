// src/components/common/JoinSuccessModal.jsx
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function JoinSuccessModal({
  open,
  onClose,
  variant = 'success', // 'success' | 'error'
  message = '신청이 완료되었습니다',
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

  const isSuccess = variant === 'success';
  const Icon = isSuccess ? CheckCircleIcon : ExclamationTriangleIcon;
  const iconColor = isSuccess ? 'text-green-500' : 'text-red-500';

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={(e) => e.target === backdropRef.current && onClose?.()}
    >
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/30" />

      {/* 모달 */}
      <div className="relative bg-white w-[400px] rounded-2xl shadow-xl p-8">
        {/* 닫기 버튼 */}
        <button
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={onClose}
          aria-label="닫기"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* 아이콘 + 메시지 */}
        <div className="flex flex-col items-center text-center pt-4">
          <Icon className={`w-16 h-16 ${iconColor} mb-4`} />
          <p className="text-lg font-medium text-gray-900">{message}</p>
        </div>

        {/* 확인 버튼 */}
        <div className="mt-8 flex justify-center">
          <button
            ref={closeRef}
            className="px-8 py-2.5 rounded-lg bg-[#4CA8FF] text-white font-medium 
                     hover:bg-sky-600 active:bg-sky-700 transition-colors"
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
