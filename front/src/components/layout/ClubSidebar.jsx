import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { clubApi } from '../../services/api';
import useUserStore from '@/store/useUserStore';

const ClubSidebar = () => {
  const { clubId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { setCurrentClub } = useUserStore();

  const [clubs, setClubs] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const fetchClubs = async () => {
    try {
      const data = await clubApi.getJoinedClubs();
      setClubs(data || []);
    } catch (error) {
      console.error('동호회 목록 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    const handleClubUpdate = () => {
      fetchClubs();
    };

    window.addEventListener('clubUpdated', handleClubUpdate);
    return () => window.removeEventListener('clubUpdated', handleClubUpdate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const currentClub = clubs.find((c) => String(c.clubId) === String(clubId));

  const handleClubChange = (id) => {
    const selectedClub = clubs.find((c) => c.clubId === id);
    if (selectedClub) {
      setCurrentClub(selectedClub.clubId, selectedClub.role);
    }
    setOpen(false);
    navigate(`/clubs/${id}/dashboard`);
  };

  const menuItems = [
    { label: '대시보드', path: `/clubs/${clubId}/dashboard` },
    { label: '공지사항', path: `/clubs/${clubId}/notice` },
    { label: '일정', path: `/clubs/${clubId}/schedule` },
    { label: '멤버', path: `/clubs/${clubId}/members` },
    // { label: '채팅', path: `/clubs/${clubId}/chat` },
  ];

  const leaderMenuItems = [{ label: '동호회 관리', path: `/clubs/${clubId}/manage` }];

  const isLeader = currentClub?.role === 'LEADER';

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="w-64">
      <div className="bg-white rounded-lg shadow-sm sticky top-24 overflow-hidden">
        <div ref={wrapRef} className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-200"
            type="button"
          >
            <span className="text-lg font-bold text-gray-900">{currentClub?.name || '동호회'}</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {open && (
            <div className="absolute left-2 right-2 top-[calc(100%-8px)] z-50 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
              {clubs.map((club) => (
                <button
                  key={club.clubId}
                  onClick={() => handleClubChange(club.clubId)}
                  className={`w-full px-6 py-3 text-left transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-lg last:rounded-b-lg ${
                    String(club.clubId) === String(clubId)
                      ? 'bg-primary text-white font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {club.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="p-4 pt-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                block px-4 py-3 mb-1 rounded-lg text-sm font-medium transition-all
                ${
                  isActive(item.path)
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {item.label}
            </Link>
          ))}

          {isLeader && (
            <>
              <div className="my-4 border-t border-gray-200"></div>
              {leaderMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    block px-4 py-3 mb-1 rounded-lg text-sm font-medium transition-all
                    ${
                      isActive(item.path)
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default ClubSidebar;
