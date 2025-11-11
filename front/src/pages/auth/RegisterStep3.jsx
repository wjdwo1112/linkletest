import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi, categoryApi } from '../../services/api';

export default function RegisterStep3() {
  const navigate = useNavigate();
  const location = useLocation();
  const memberId = location.state?.memberId;

  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [error, setError] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!memberId) {
      alert('잘못된 접근입니다.');
      navigate('/signup');
      return;
    }

    setMemberEmail(location.state?.email || '');
    fetchCategories();
  }, [memberId, navigate, location.state]);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getCategoriesHierarchy();
      setCategories(data);
    } catch (error) {
      console.error('카테고리 조회 에러:', error);
      alert('카테고리를 불러오는데 실패했습니다.');
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        if (prev.length >= 5) {
          setError('관심사는 최대 5개까지 선택 가능합니다.');
          return prev;
        }
        setError('');
        return [...prev, categoryId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedCategories.length < 3) {
      setError('관심사를 최소 3개 선택해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.registerStep3(memberId, selectedCategories);
      navigate('/signup/complete', { state: { email: memberEmail } });
    } catch (error) {
      console.error('3단계 에러:', error);
      alert(error.message || '관심사 등록에 실패했습니다.');
    } finally {
      setIsLoading(false); // 추가
    }
  };

  const handlePrevious = () => {
    navigate('/signup/step2', { state: { memberId } });
  };

  return (
    <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 relative">
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
            1
          </div>
          <div className="w-12 h-0.5 bg-primary mx-2"></div>
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
            2
          </div>
          <div className="w-12 h-0.5 bg-primary mx-2"></div>
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
            3
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">관심사를 선택해 주세요</h1>

        {selectedCategories.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              선택된 관심사:{' '}
              <span className="font-semibold text-primary">{selectedCategories.length}개</span>
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {selectedCategories.map((id) => {
                const category = categories
                  .flatMap((parent) => parent.children || [])
                  .find((cat) => cat.categoryId === id);
                return category ? (
                  <span key={id} className="px-3 py-1 bg-primary text-white text-sm rounded-full">
                    {category.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-y-auto mb-6" style={{ maxHeight: '400px' }}>
          <div className="space-y-6 pr-2">
            {categories.map((parent) => (
              <div key={parent.categoryId}>
                <h3 className="text-sm font-medium text-gray-700 mb-3">{parent.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {parent.children &&
                    parent.children.map((child) => (
                      <button
                        key={child.categoryId}
                        type="button"
                        onClick={() => handleCategoryClick(child.categoryId)}
                        className={`px-4 py-2 rounded-full text-sm transition-colors ${
                          selectedCategories.includes(child.categoryId)
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {child.name}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isLoading}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <button
            type="submit"
            disabled={isLoading || selectedCategories.length < 3}
            className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '처리중...' : '완료'}
          </button>
        </div>
      </form>
    </div>
  );
}
