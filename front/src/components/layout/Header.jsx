import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import useUserStore from '../../store/useUserStore';
import { authApi, clubApi } from '../../services/api';
import logo from '../../assets/images/logo.png';
import defaultProfile from '../../assets/images/default-profile.png';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, clearUser } = useUserStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    authApi.logout();
    clearUser();
    setIsDropdownOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const profileImage = user?.profileImageUrl || defaultProfile;

  // 내 동호회로 이동 (최신 가입 동호회)
  const handleMyClubs = async () => {
    try {
      setIsDropdownOpen(false);
      const clubs = await clubApi.getJoinedClubs();

      if (clubs && clubs.length > 0) {
        // 첫 번째 동호회(최신 가입)로 이동
        navigate(`/clubs/${clubs[0].clubId}/notice`);
      } else {
        alert('가입한 동호회가 없습니다.');
        navigate('/');
      }
    } catch (error) {
      console.error('동호회 목록 조회 실패:', error);
      alert('동호회 정보를 불러올 수 없습니다.');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/">
              <img
                src={logo}
                alt="Linkle 로고"
                className="h-6 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
              />
            </Link>

            <nav className="flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                동호회
              </Link>
              <Link
                to="/community"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                커뮤니티
              </Link>
              <Link
                to="/gallery"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                갤러리
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/club/create"
                  className="text-gray-700 hover:text-primary font-medium transition-colors"
                >
                  동호회+
                </Link>

                <button
                  className="relative text-gray-700 hover:text-primary transition-colors"
                  aria-label="알림"
                >
                  <BellIcon className="w-6 h-6" />
                </button>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-11 h-11 rounded-full overflow-hidden hover:opacity-80 transition-opacity translate-y-1"
                    aria-label="프로필 메뉴"
                  >
                    <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                      <button
                        onClick={handleMyClubs}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        내 동호회
                      </button>
                      <Link
                        to="/mypage/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        내 정보
                      </Link>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary font-medium transition-colors"
                >
                  동호회+
                </Link>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary font-medium transition-colors"
                >
                  로그인
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
