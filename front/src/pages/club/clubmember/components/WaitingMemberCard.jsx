import DEFAULT_PROFILE from '../../../../assets/images/default-profile.png';

export default function WaitingMemberCard({ member, onApprove, onReject }) {
  const getProfileSrc = (fileLink) => {
    if (!fileLink || fileLink.trim() === '' || fileLink === 'null') {
      return DEFAULT_PROFILE;
    }
    return fileLink;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center mb-3">
        <img
          src={getProfileSrc(member.fileLink)}
          alt="프로필"
          className="w-12 h-12 rounded-full overflow-hidden mr-3 transition-opacity translate-y-1"
        />
        <div>
          <p className="font-semibold">{member.nickname}</p>
          <p className="text-xs text-gray-500">신청일 {formatDate(member.joinedAt)}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onApprove(member)}
          className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
        >
          승인
        </button>
        <button
          onClick={() => onReject(member)}
          className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
        >
          거절
        </button>
      </div>
    </div>
  );
}
