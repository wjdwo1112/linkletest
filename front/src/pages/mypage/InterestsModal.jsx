import { useState, useEffect } from 'react';
import { memberApi, categoryApi } from '../../services/api';

export default function InterestsModal({ currentInterests, onClose, onUpdate }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(currentInterests);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getCategoriesHierarchy();
      setCategories(data);
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
      alert('카테고리를 불러올 수 없습니다.');
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

  const handleSubmit = async () => {
    if (selectedCategories.length < 3) {
      setError('관심사를 최소 3개 선택해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      await memberApi.updateInterests(selectedCategories);
      // alert('관심사가 수정되었습니다.');
      onUpdate();
    } catch (error) {
      console.error('관심사 수정 실패:', error);
      alert(error.message || '관심사 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">관심사 설정</h2>

        {selectedCategories.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              선택된 관심사:{' '}
              <span className="font-semibold text-primary">{selectedCategories.length}개</span>
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-6 mb-6">
          {categories.map((parent) => (
            <div key={parent.categoryId}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{parent.name}</h3>
              <div className="flex flex-wrap gap-2">
                {parent.children &&
                  parent.children.map((child) => (
                    <button
                      key={child.categoryId}
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

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? '저장중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
