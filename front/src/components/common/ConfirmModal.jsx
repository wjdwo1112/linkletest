// front/src/components/common/ConfirmModal.jsx

/**
 * 확인/취소 모달 컴포넌트
 *
 * @param {boolean} isOpen - 모달 열림 상태
 * @param {function} onClose - 닫기 핸들러
 * @param {function} onConfirm - 확인 핸들러
 * @param {string} title - 모달 제목 (기본값: '확인')
 * @param {string} message - 모달 메시지 (기본값: '정말 삭제하시겠습니까?')
 * @param {string} confirmText - 확인 버튼 텍스트 (기본값: '확인')
 * @param {string} cancelText - 취소 버튼 텍스트 (기본값: '취소')
 * @param {string} confirmButtonStyle - 확인 버튼 스타일 (기본값: 'danger' - 빨간색)
 *
 */

import { XMarkIcon } from '@heroicons/react/24/outline';
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '확인',
  message = '정말 삭제하시겠습니까?',
  confirmText = '확인',
  cancelText = '취소',
  confirmButtonStyle = 'danger', // 'danger' | 'primary'
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const confirmButtonClass =
    confirmButtonStyle === 'danger'
      ? 'bg-red-500 hover:bg-red-600 text-white'
      : 'bg-blue-500 hover:bg-blue-600 text-white';

  return (
    <div
      className="fixed inset-0 bg-black/80 bg-opacity-30 flex items-center justify-center z-[60]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-auto"
            aria-label="닫기"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 본문 */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600">{message}</p>
        </div>

        {/* 버튼 */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
