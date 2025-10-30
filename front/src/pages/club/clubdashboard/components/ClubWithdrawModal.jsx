import React from 'react';

const ClubWithdrawModal = ({ isOpen, onClose, onConfirm, clubName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">동호회 탈퇴</h2>

        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            <span className="font-semibold text-gray-900">{clubName}</span> 동호회를
            탈퇴하시겠습니까?
          </p>
          <p className="text-sm text-gray-500">
            탈퇴 시 동호회의 모든 활동 내역이 삭제되며, 복구할 수 없습니다.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            탈퇴하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubWithdrawModal;
