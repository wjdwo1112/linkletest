import { useState, useEffect, useRef } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import DEFAULT_PROFILE from '../../../../assets/images/default-profile.png';

export default function MemberCard({ member, isManager, onRoleChange, onRemove }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

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

  const getRoleLabel = (role) => {
    if (role === 'LEADER') return '동호회장';
    if (role === 'MANAGER') return '운영진';
    return '회원';
  };

  const getRoleBadgeClass = (role) => {
    if (role === 'LEADER') return 'bg-yellow-100 text-yellow-800';
    if (role === 'MANAGER') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="border rounded-lg p-4 relative">
      {isManager && member.role !== 'LEADER' && (
        <div className="absolute top-4 right-4" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 hover:bg-gray-100 rounded">
            <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 w-32 bg-white border rounded-md shadow-lg z-10">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onRoleChange(member);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                권한 설정
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onRemove(member);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
              >
                강제 탈퇴
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center mb-2">
        <img
          src={getProfileSrc(member.fileLink)}
          alt="프로필"
          className="w-12 h-12 rounded-full overflow-hidden mr-3 transition-opacity translate-y-1"
        />
        <div>
          <p className="font-semibold">{member.nickname}</p>
          <span className={`text-xs px-2 py-1 rounded ${getRoleBadgeClass(member.role)}`}>
            {getRoleLabel(member.role)}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-500">가입일 {formatDate(member.joinedAt)}</p>
    </div>
  );
}
