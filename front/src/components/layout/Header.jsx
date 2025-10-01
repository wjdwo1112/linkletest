// src/components/layout/Header.jsx
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-primary-600 transition-colors">
              Linkle
            </Link>
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className="flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              동호회
            </Link>
            <Link to="/community" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              커뮤니티
            </Link>
            <Link to="/gallery" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              갤러리
            </Link>
          </nav>

          {/* 사용자 메뉴 */}
          <div className="flex items-center space-x-4">
            <Link to="/community/create" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              동호회+
            </Link>
            <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
