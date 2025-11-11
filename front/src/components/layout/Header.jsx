import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import useUserStore from '../../store/useUserStore';
import { authApi, fileApi } from '../../services/api';
import logo from '../../assets/images/logo.png';
import defaultProfile from '../../assets/images/default-profile.png';
import NotificationDropdown from '../layout/NotificationDropdown';
import ClubCreateModal from './ClubCreateModal';
import AlertModal from '../common/AlertModal';
import { useAlert } from '../../hooks/useAlert';

const Header = () => {
  const navigate = useNavigate();
  const { user, setUser, isAuthenticated, clearUser, currentClubId, setCurrentClub } =
    useUserStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isClubModalOpen, setIsClubModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(defaultProfile);
  const dropdownRef = useRef(null);
  const { alertState, showAlert, closeAlert } = useAlert();

  //프로필 이미지 로드
  useEffect(() => {
    const loadProfileImage = async () => {
      if (user?.profileImageUrl) {
        setProfileImage(user.profileImageUrl);
      } else if (user?.fileId) {
        try {
          const fileData = await fileApi.getFile(user.fileId);
          const imageUrl = fileData.fileLink || defaultProfile;
          setProfileImage(imageUrl);

          // Store에 URL 저장
          setUser({
            ...user,
            profileImageUrl: imageUrl,
          });
        } catch (error) {
          console.error('프로필 이미지 조회 실패:', error);
          setProfileImage(defaultProfile);
        }
      } else {
        setProfileImage(defaultProfile);
      }
    };

    if (isAuthenticated && user) {
      loadProfileImage();
    } else {
      setProfileImage(defaultProfile);
    }
  }, [user?.fileId, user?.profileImageUrl, isAuthenticated]);

  const handleLogout = () => {
    authApi.logout();
    clearUser();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleClubCreateClick = () => {
    if (isAuthenticated) {
      setIsClubModalOpen(true);
    } else {
      navigate('/login');
    }
  };

  const handleClubCreateSuccess = (club) => {
    console.log('동호회 생성 완료:', club);
    setCurrentClub(club.clubId, 'LEADER');
    navigate(`/clubs/${club.clubId}/dashboard`);
  };

  const handleMyClubClick = async () => {
    setIsDropdownOpen(false);

    if (currentClubId) {
      navigate(`/clubs/${currentClubId}/dashboard`);
    } else {
      showAlert('가입된 동호회가 없습니다.\n동호회에 먼저 가입해주세요.');
    }
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

  // const profileImage = user?.profileImageUrl || defaultProfile;

  return (
    <>
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        confirmText={alertState.confirmText}
      />
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
                  className="text-gray-700 text-lg hover:text-primary font-semibold transition-colors"
                >
                  동호회
                </Link>
                <Link
                  to="/community"
                  className="text-gray-700 text-lg hover:text-primary font-semibold transition-colors"
                >
                  커뮤니티
                </Link>
                <Link
                  to="/gallery"
                  className="text-gray-700 text-lg hover:text-primary font-semibold transition-colors"
                >
                  갤러리
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={handleClubCreateClick}
                    className="text-gray-700 text-lg hover:text-primary font-semibold transition-colors"
                  >
                    동호회+
                  </button>

                  <NotificationDropdown memberId={user?.id} />

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
                          onClick={handleMyClubClick}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
                  <button
                    onClick={handleClubCreateClick}
                    className="text-gray-700 text-lg hover:text-primary font-semibold transition-colors"
                  >
                    동호회+
                  </button>
                  <Link
                    to="/login"
                    className="text-gray-700 text-lg hover:text-primary font-semibold transition-colors"
                  >
                    로그인
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <ClubCreateModal
        isOpen={isClubModalOpen}
        onClose={() => setIsClubModalOpen(false)}
        onSuccess={handleClubCreateSuccess}
      />
    </>
  );
};

export default Header;
