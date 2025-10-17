import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberApi } from '../../services/api';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    nickname: '',
    sido: '',
    sigungu: '',
    description: '',
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
      });
    } catch (error) {
      console.error('프로필 조회 실패:', error);
      alert('프로필을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    if (!formData.sido.trim() || !formData.sigungu.trim()) {
      alert('주소를 입력해주세요.');
      return;
    }

    try {
      await memberApi.updateProfile(formData);
      alert('프로필이 수정되었습니다.');
      navigate('/mypage/profile');
    } catch (error) {
      console.error('프로필 수정 실패:', error);
      alert(error.message || '프로필 수정에 실패했습니다.');
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
            <div className="w-32 h-32 rounded-full bg-gray-300"></div>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="회원1"
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
                placeholder="주소를 검색해주세요"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer"
                onClick={openAddressSearch}
              />
              <button
                type="button"
                onClick={openAddressSearch}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="소개입니다."
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            수정
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;
