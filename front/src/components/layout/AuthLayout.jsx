const AuthLayout = ({ children }) => {
  // 전체 폭은 넉넉하게, 가운데 정렬 + 2열 그리드
  return (
    <div className="min-h-screen bg-gray-50 flex items-center">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 px-8">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
