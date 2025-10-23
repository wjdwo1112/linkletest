import { useState } from 'react';
import { clubMemberApi } from '../../../../services/api';

export default function RemoveModal({ member, onClose, onSuccess, clubId }) {
  const [reason, setReason] = useState('');
  const [allowRejoin, setAllowRejoin] = useState(true);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return;
    }

    try {
      await clubMemberApi.removeMember(clubId, {
        clubId: parseInt(clubId),
        memberId: member.memberId,
        reason,
        allowRejoin,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('강제 탈퇴 실패:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">회원 강제 탈퇴</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            대상 회원
            <br />
            {member.nickname}
          </p>

          <label className="block text-sm font-medium mb-2">거절 사유(필수)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="예) 모임 운영 및 맞지 않아 이런에게 결정하지 못합니다."
            className="w-full border rounded px-3 py-2 h-24 resize-none"
          />

          <label className="block text-sm font-medium mb-2 mt-4">재가입 여부</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={allowRejoin === true}
                onChange={() => setAllowRejoin(true)}
                className="mr-2"
              />
              허용
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={allowRejoin === false}
                onChange={() => setAllowRejoin(false)}
                className="mr-2"
              />
              불가
            </label>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim()}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
          >
            탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}
