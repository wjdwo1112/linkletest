const Home = () => {
  const categories = [
    { name: '운동/스포츠', icon: '⚽' },
    { name: '문화/예술', icon: '🎨' },
    { name: '취미', icon: '💛' },
    { name: '자기계발', icon: '📚' },
    { name: '푸드/드링크', icon: '🍺' },
    { name: '여행/아웃도어', icon: '✈️' },
    { name: '게임/오락', icon: '🎮' },
    { name: '외국어', icon: '🌐' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-16 flex justify-center">
          <div className="relative w-full max-w-4xl">
            <input
              type="text"
              placeholder="관심사를 입력해 주세요"
              className="w-full px-6 py-5 text-lg border-2 border-primary rounded-full focus:outline-none bg-white shadow-sm"
            />
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-primary text-xl">
              🔍
            </div>
          </div>
        </div>

        <div className="mb-20 flex justify-center">
          <div className="flex space-x-10">
            {categories.map((category, index) => (
              <div key={index} className="flex flex-col items-center cursor-pointer group">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <span className="text-sm text-gray-700 text-center whitespace-nowrap group-hover:text-gray-900">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">최근 생성된 동호회</h2>
            <button className="text-gray-500 hover:text-primary transition-colors">
              더보기 &gt;
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">이미지</span>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-3 text-gray-900">싸커풋볼 {i}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    동호회 소개 내용입니다.
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex space-x-2">
                      <span className="bg-gray-100 px-3 py-1 rounded-full">스포츠</span>
                      <span className="bg-gray-100 px-3 py-1 rounded-full">구로구</span>
                    </div>
                    <span className="text-gray-500 font-medium">멤버 30</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8">
        <button className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
          💬
        </button>
      </div>
    </div>
  );
};

export default Home;
