import { useState, useEffect } from 'react';
import { scheduleApi } from '../../../services/api/scheduleApi';

const ScheduleCreateModal = ({ clubId, selectedDate, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    address: '',
    addressDetail: '',
    startDate: selectedDate || '',
    startTime: '14:00',
    endDate: selectedDate || '',
    endTime: '16:00',
    maxAttendees: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [clubMemberCount, setClubMemberCount] = useState(0);

  useEffect(() => {
    // 동호회 회원 수 조회
    const fetchMemberCount = async () => {
      try {
        const count = await scheduleApi.getClubMemberCount(clubId);
        setClubMemberCount(count);
      } catch (error) {
        console.error('회원 수 조회 실패:', error);
      }
    };
    fetchMemberCount();
  }, [clubId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 에러 초기화
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    }

    if (!formData.startDate) {
      newErrors.startDate = '시작일을 선택해주세요';
    }

    if (!formData.endDate) {
      newErrors.endDate = '종료일을 선택해주세요';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.endTime}`);
      if (start >= end) {
        newErrors.endDate = '종료 시간은 시작 시간 이후여야 합니다';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const scheduleData = {
        clubId: parseInt(clubId),
        title: formData.title,
        content: formData.content || null,
        address: formData.address || null,
        addressDetail: formData.addressDetail || null,
        latitude: null,
        longitude: null,
        scheduleStartDate: `${formData.startDate}T${formData.startTime}:00`,
        scheduleEndDate: `${formData.endDate}T${formData.endTime}:00`,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : clubMemberCount,
      };

      await scheduleApi.createSchedule(scheduleData);
      onSuccess();
    } catch (error) {
      console.error('일정 생성 실패:', error);
      setErrors({ submit: error.message || '일정 생성에 실패했습니다' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">일정 등록</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">제목</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="일정 제목을 입력하세요"
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">시작일</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">종료일</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">시작 시간</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">종료 시간</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">장소</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="장소를 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">모집 정원</label>
            <input
              type="number"
              name="maxAttendees"
              value={formData.maxAttendees}
              onChange={handleChange}
              placeholder={`입력하지 않으면 동호회 전체 인원(${clubMemberCount}명)으로 설정됩니다`}
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">참여 가능한 최대 인원을 입력하세요</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">상세 설명</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="일정에 대한 상세한 설명을 입력하세요&#10;예시:&#10;- 준비물&#10;- 참석 시 주의사항&#10;- 일정 상황 공유 및 다음 주 계획 수립"
              rows={5}
              maxLength={1000}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400">{formData.content.length}/1000자</p>
            </div>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            닫기
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? '등록 중입니다' : '등록'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCreateModal;
