import { useNavigate } from 'react-router-dom';

const ClubCard = ({ club }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/clubs/${club.clubId}/detail`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* 동호회 이미지 */}
      <div className="w-full h-40 bg-gray-200 overflow-hidden">
        <img
          src={club.fileLink || 'https://via.placeholder.com/300x160/cccccc/666666?text=Club+Image'}
          alt={club.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 동호회 정보 */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 truncate">{club.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">
          {club.description || '동호회 소개가 없습니다.'}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{club.region || '지역 정보 없음'}</span>
        </div>
      </div>
    </div>
  );
};

export default ClubCard;
