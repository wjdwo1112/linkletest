import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberApi, fileApi } from '../../services/api';
import useUserStore from '../../store/useUserStore';
import ProfileImageModal from './ProfileImageModal';
import AlertModal from '../../components/common/AlertModal';
import defaultProfile from '../../assets/images/default-profile.png';
import ConfirmModal from '../../components/common/ConfirmModal';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [imagePreview, setImagePreview] = useState(defaultProfile);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    sido: '',
    sigungu: '',
    description: '',
    fileId: null,
  });

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onCloseCallback: null,
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await memberApi.getProfile();
      setProfile(data);
      setFormData({
        nickname: data.nickname || '',
        sido: data.sido || '',
        sigungu: data.sigungu || '',
        description: data.description || '',
        fileId: data.fileId || null,
      });

      // 프로필 이미지가 있으면 표시
      if (data.fileId) {
        try {
          const fileData = await fileApi.getFile(data.fileId);
          setImagePreview(fileData.fileLink);
        } catch (error) {
          console.error('프로필 이미지 조회 실패:', error);
          setImagePreview(defaultProfile);
        }
      }
    } catch (error) {
      console.error('프로필 조회 실패:', error);
      setAlertModal({
        isOpen: true,
        title: '오류',
        message: '프로필을 불러올 수 없습니다.',
        onCloseCallback: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
  };

  const openAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setFormData((prev) => ({
          ...prev,
          sido: data.sido,
          sigungu: data.sigungu,
        }));
      },
    }).open();
  };

  const handleImageConfirm = (fileId, fileUrl) => {
    setFormData((prev) => ({
      ...prev,
      fileId: fileId,
    }));
    setImagePreview(fileUrl);
    setIsImageModalOpen(false);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); // ← 모달에서 호출 시 e가 없을 수 있음

    if (!formData.nickname.trim()) {
      setAlertModal({
        isOpen: true,
        title: '입력 오류',
        message: '닉네임을 입력해주세요.',
        onCloseCallback: null,
      });
      return;
    }

    if (!formData.sido.trim() || !formData.sigungu.trim()) {
      setAlertModal({
        isOpen: true,
        title: '입력 오류',
        message: '주소를 입력해주세요.',
        onCloseCallback: null,
      });
      return;
    }

    try {
      await memberApi.updateProfile(formData);

      if (user) {
        setUser({
          ...user,
          fileId: formData.fileId,
          profileImageUrl: imagePreview !== defaultProfile ? imagePreview : null,
        });
      }

      setAlertModal({
        isOpen: true,
        title: '완료',
        message: '프로필이 수정되었습니다.',
        onCloseCallback: () => {
          navigate('/mypage/profile');
        },
      });
    } catch (error) {
      console.error('프로필 수정 실패:', error);
      setAlertModal({
        isOpen: true,
        title: '오류',
        message: error.message || '프로필 수정에 실패했습니다.',
        onCloseCallback: null,
      });
    }
  };

  const handleCancel = () => {
    navigate('/mypage/profile');
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">로딩중...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">프로필을 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
      <h1 className="text-2xl font-bold mb-8 ml-8">프로필 수정</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl ml-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이미지</label>
            <div className="flex items-center gap-4">
              {imagePreview !== defaultProfile ? (
                <img
                  src={imagePreview}
                  alt="프로필 이미지"
                  className="w-32 h-32 rounded-full object-cover bg-gray-300"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-300"></div>
              )}
              <button
                type="button"
                onClick={() => setIsImageModalOpen(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                이미지 변경
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <div className="text-gray-900">{profile.email}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
            <div className="text-gray-900">{profile.name}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">닉네임</label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA8FF]"
              placeholder="닉네임"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
            <div className="text-gray-900">{profile.gender === 'M' ? '남' : '여'}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={
                  formData.sido && formData.sigungu ? `${formData.sido} ${formData.sigungu}` : ''
                }
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="주소를 선택해주세요"
              />
              <button
                type="button"
                onClick={openAddressSearch}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                주소 검색
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">소개</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA8FF] resize-none"
              placeholder="소개글을 입력해주세요"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() =>
              setConfirmModal({
                isOpen: true,
                title: '수정 확인',
                message: '프로필을 수정하시겠습니까?',
              })
            }
            className="flex-1 px-6 py-3 bg-[#4CA8FF] text-white rounded-lg hover:bg-[#4CA8FF]/90 transition-colors"
          >
            수정
          </button>
        </div>
      </form>

      {isImageModalOpen && (
        <ProfileImageModal
          currentImage={imagePreview}
          onClose={() => setIsImageModalOpen(false)}
          onConfirm={handleImageConfirm}
        />
      )}

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, title: '', message: '' })}
        onConfirm={() => handleSubmit()} // ✅ 기존 이름 유지해서 호출
        title={confirmModal.title || '수정 확인'}
        message={confirmModal.message || '프로필을 수정하시겠습니까?'}
        confirmText="수정"
        cancelText="취소"
        confirmButtonStyle="primary"
      />
    </div>
  );
};

export default ProfileEdit;
