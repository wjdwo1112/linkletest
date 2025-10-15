import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { clubApi } from '../../services/api';

const ClubSidebar = () => {
  const { clubId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [clubs, setClubs] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // 내 동호회 목록 불러오기
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const data = await clubApi.getJoinedClubs();
        setClubs(data || []);

        // clubId가 없거나 undefined인 경우, 첫 번째 동호회로 이동
        if ((!clubId || clubId === 'undefined') && data?.length) {
          navigate(`/clubs/${data[0].clubId}/notice`, { replace: true });
        }
      } catch (error) {
        console.error('동호회 목록 조회 실패:', error);
        setClubs([]);
      }
    };

    fetchClubs();
  }, [clubId, navigate]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // 현재 선택된 동호회
  const currentClub = clubs.find((c) => String(c.clubId) === String(clubId));

  // 동호회 변경
  const handleClubChange = (id) => {
    setOpen(false);
    navigate(`/clubs/${id}/notice`);
  };

  // 메뉴 아이템
  const menuItems = [
    { label: '대시보드', path: `/clubs/${clubId}/dashboard` },
    { label: '공지사항', path: `/clubs/${clubId}/notice` },
    { label: '일정', path: `/clubs/${clubId}/schedule` },
    { label: '멤버', path: `/clubs/${clubId}/members` },
    { label: '채팅', path: `/clubs/${clubId}/chat` },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="w-64">
      <div ref={wrapRef} className="bg-white rounded-lg shadow-sm sticky top-24">
        {/* 동호회 선택 드롭다운 */}
        <div className="px-4 py-3 border-b border-gray-100">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center justify-between w-full text-left"
            type="button"
          >
            <span className="text-[15px] font-semibold text-gray-900">
              {currentClub?.name || '동호회'}
            </span>
            <span className="text-gray-500 text-sm">▾</span>
          </button>

          {/* 드롭다운 메뉴 */}
          {open && (
            <div className="absolute z-50 mt-2 w-60 bg-white border border-gray-200 rounded-md shadow-lg">
              <ul className="max-h-72 overflow-y-auto py-1">
                {clubs.map((club) => (
                  <li key={club.clubId}>
                    <button
                      onClick={() => handleClubChange(club.clubId)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        String(club.clubId) === String(clubId)
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      {club.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 메뉴 리스트 */}
        <nav className="py-1">
          {menuItems.map((item, index) => (
            <div key={item.path}>
              <Link
                to={item.path}
                className={`block px-5 py-3 text-sm transition-colors ${
                  isActive(item.path)
                    ? 'text-gray-900 font-medium bg-gray-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
              {index !== menuItems.length - 1 && <div className="border-t border-gray-100" />}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default ClubSidebar;
