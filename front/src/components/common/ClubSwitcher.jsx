// src/components/common/ClubSwitcher.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clubApi } from '../../services/api/clubApi';

export default function ClubSwitcher() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [clubs, setClubs] = useState([]);
  const btnRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await clubApi.getJoinedClubs();
        setClubs(data || []);
      } catch (e) {
        setClubs([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!btnRef.current) return;
      if (!btnRef.current.parentNode.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  const goClub = (clubId) => {
    setOpen(false);
    navigate(`/clubs/${clubId}/notice`);
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="text-gray-700 hover:text-primary font-medium transition-colors"
      >
        동호회+
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
          <div className="p-2 max-h-80 overflow-y-auto">
            {clubs.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">가입한 동호회가 없습니다.</div>
            ) : (
              clubs.map((c) => (
                <button
                  key={c.clubId}
                  onClick={() => goClub(c.clubId)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50"
                >
                  <div className="text-sm font-medium text-gray-900">{c.name}</div>
                  {c.description && (
                    <div className="text-xs text-gray-500 line-clamp-1">{c.description}</div>
                  )}
                </button>
              ))
            )}
          </div>
          <div className="border-t border-gray-100 p-2">
            <button
              onClick={() => {
                setOpen(false);
                navigate('/club/create');
              }}
              className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
            >
              새 동호회 만들기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
