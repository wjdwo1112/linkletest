import { Link, useLocation } from 'react-router-dom';

const MyPageSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      label: '프로필',
      path: '/mypage/profile',
      isActive: location.pathname === '/mypage/profile',
    },
    {
      label: '나의 동호회',
      path: '/mypage/clubs',
      isActive: location.pathname === '/mypage/clubs',
    },
    {
      label: '나의 활동',
      path: '/mypage/activities',
      isActive: location.pathname === '/mypage/activities',
    },
    {
      label: '회원 탈퇴',
      path: '/mypage/withdrawal',
      isActive: location.pathname === '/mypage/withdrawal',
    },
  ];

  return (
    <aside className="w-64">
      <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
        <h2 className="text-xl font-bold text-gray-900 mb-6">마이페이지</h2>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                block px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${item.isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-primary'}
              `}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default MyPageSidebar;
