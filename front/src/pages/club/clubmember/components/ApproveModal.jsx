import { clubMemberApi } from '../../../../services/api';

export default function ApproveModal({ member, onClose, onSuccess, clubId }) {
  const handleSubmit = async () => {
    try {
      await clubMemberApi.approveMember(clubId, {
        clubId: parseInt(clubId),
        memberId: member.memberId,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('승인 실패:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">가입 승인</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <p className="mb-4">{member.nickname}님의 가입을 승인하시겠습니까?</p>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            승인
          </button>
        </div>
      </div>
    </div>
  );
}
