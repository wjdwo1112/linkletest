import { Link, useNavigate } from 'react-router-dom';
import useUserStore from '../../store/useUserStore';
import { authApi } from '../../services/api';
import logo from '../../assets/images/logo.png';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, clearUser } = useUserStore();

  const handleLogout = () => {
    authApi.logout();
    clearUser();
    navigate('/');
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

          <div className="flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link
                  to="/club/create"
                  className="text-gray-700 hover:text-primary font-medium transition-colors"
                >
                  동호회+
                </Link>
                <Link
                  to="/mypage/profile"
                  className="text-gray-700 hover:text-primary font-medium transition-colors"
                >
                  {user?.name || user?.nickname || '사용자'}님
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-primary font-medium transition-colors"
                >
                  로그아웃
                </button>
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
