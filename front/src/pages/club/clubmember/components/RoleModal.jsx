import { useState } from 'react';
import { clubMemberApi } from '../../../../services/api';

export default function RoleModal({ member, onClose, onSuccess, clubId }) {
  const [selectedRole, setSelectedRole] = useState(member.role);

  const handleSubmit = async () => {
    try {
      await clubMemberApi.updateMemberRole(clubId, {
        clubId: parseInt(clubId),
        memberId: member.memberId,
        role: selectedRole,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('권한 변경 실패:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">권한 설정</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">회원</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="MEMBER">회원</option>
            <option value="MANAGER">운영진</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
