import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertModal from '../../components/common/AlertModal';
import { memberApi } from '../../services/api';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
  });

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onCloseCallback: null,
  });

  const closeAlert = () => {
    const callback = alertModal.onCloseCallback;
    setAlertModal({
      isOpen: false,
      title: '',
      message: '',
      onCloseCallback: null,
    });

    if (callback) {
      callback();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요.';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    } else if (!/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/.test(formData.newPassword)) {
      newErrors.newPassword = '비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '새 비밀번호 확인을 입력해주세요.';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // ConfirmModal 열기
    setConfirmModal({
      isOpen: true,
      title: '비밀번호 변경',
      message: '비밀번호를 변경하시겠습니까?',
    });
  };

  // 실제 비밀번호 변경 처리 함수 (새로 추가)
  const handleConfirmChange = async () => {
    setIsLoading(true);

    try {
      await memberApi.updatePassword(formData.currentPassword, formData.newPassword);
      setAlertModal({
        isOpen: true,
        title: '완료',
        message: '비밀번호가 변경되었습니다.',
        onCloseCallback: () => {
          navigate('/mypage/profile');
        },
      });
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: '비밀번호 변경에 실패했습니다.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/mypage/profile');
  };

  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">비밀번호 변경</h2>
        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
            {errors.general}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">현재 비밀번호</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="현재 비밀번호를 입력하세요"
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.currentPassword ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="새 비밀번호를 입력하세요"
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.newPassword ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
            )}
            {!errors.newPassword && formData.newPassword && (
              <p className="mt-1 text-sm text-gray-500">8자 이상, 영문과 숫자 포함</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="새 비밀번호를 입력하세요"
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '처리중...' : '수정'}
          </button>
        </div>
      </form>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleConfirmChange}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="변경"
        cancelText="취소"
        confirmButtonStyle="primary"
      />
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
      />
    </div>
  );
}
