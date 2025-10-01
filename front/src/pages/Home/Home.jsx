// React import 제거 (React 19에서는 불필요)
const Home = () => {
  // 카테고리 아이콘 데이터
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

  // 동호회 카드 컴포넌트
  const ClubCard = ({ title, description, category, location, members }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className="w-full h-48 bg-gray-300"></div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex space-x-2">
            <span className="bg-gray-100 px-2 py-1 rounded">{category}</span>
            <span className="bg-gray-100 px-2 py-1 rounded">{location}</span>
          </div>
          <span>멤버 {members}</span>
        </div>
      </div>
    </div>
  );

  // 섹션 헤더 컴포넌트
  const SectionHeader = ({ title }) => (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <a href="/clubs" className="text-gray-500 hover:text-primary-600 transition-colors">
        더보기 &gt;
      </a>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메인 콘텐츠 - Header는 레이아웃에서 처리하므로 제거 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 검색바 */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <input type="text" placeholder="관심사를 입력해 주세요" className="w-full px-6 py-4 text-lg border border-blue-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-blue-500 hover:text-blue-600">🔍</button>
          </div>
        </div>

        {/* 카테고리 */}
        <div className="mb-16">
          <div className="flex justify-center space-x-8">
            {categories.map((category, index) => (
              <a key={index} href={`/clubs?category=${category.name}`} className="flex flex-col items-center group cursor-pointer">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2 group-hover:bg-gray-300 transition-colors">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{category.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* 최근 생성된 동호회 */}
        <section className="mb-16">
          <SectionHeader title="최근 생성된 동호회" />
          <div className="grid grid-cols-3 gap-6">
            <ClubCard title="싸커풋볼" description="동호회소개 동호회소개동호회소개 동호회소개" category="스포츠리업" location="구로구" members="30" />
            <ClubCard title="싸커풋볼" description="동호회소개 동호회소개동호회소개 동호회소개" category="스포츠리업" location="구로구" members="30" />
            <ClubCard title="독서모임" description="동호회소개 동호회소개동호회소개 동호회소개" category="독서" location="구로구" members="30" />
          </div>
        </section>

        {/* 활동 활발한 동호회 */}
        <section className="mb-16">
          <SectionHeader title="활동 활발한 동호회" />
          <div className="grid grid-cols-3 gap-6">
            <ClubCard title="싸커풋볼" description="동호회소개 동호회소개동호회소개 동호회소개" category="스포츠리업" location="구로구" members="30" />
            <ClubCard title="싸커풋볼" description="동호회소개 동호회소개동호회소개 동호회소개" category="스포츠리업" location="구로구" members="30" />
            <ClubCard title="싸커풋볼" description="동호회소개 동호회소개동호회소개 동호회소개" category="스포츠리업" location="구로구" members="30" />
          </div>
        </section>

        {/* 추천 동호회 */}
        <section className="mb-16">
          <SectionHeader title="추천 동호회" />
          <div className="grid grid-cols-3 gap-6">
            <ClubCard title="독서모임" description="동호회소개 동호회소개동호회소개 동호회소개" category="독서" location="구로구" members="30" />
            <ClubCard title="보드게임" description="동호회소개 동호회소개동호회소개 동호회소개" category="게임" location="구로구" members="30" />
            <ClubCard title="야구관람" description="동호회소개 동호회소개동호회소개 동호회소개" category="스포츠리업" location="구로구" members="30" />
          </div>
        </section>
      </main>

      {/* 채팅 버튼 */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-colors">💬</button>
      </div>
    </div>
  );
};

export default Home;
