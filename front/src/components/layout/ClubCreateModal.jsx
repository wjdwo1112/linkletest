import { useState, useEffect } from 'react';
import {
  CameraIcon,
  MapPinIcon,
  HeartIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { categoryApi } from '../../services/api';
import axios from 'axios';

const ClubCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    sido: '',
    sigungu: '',
    description: '',
    maxMembers: '',
    fileId: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getCategoriesHierarchy();
      setCategories(data);
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: '이미지 파일만 업로드 가능합니다.' }));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/file/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        },
      );

      const imageUrl = response.data;
      setImagePreview(imageUrl);

      setFormData((prev) => ({ ...prev, fileId: null }));
      setErrors((prev) => ({ ...prev, image: '' }));
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      setErrors((prev) => ({ ...prev, image: '이미지 업로드에 실패했습니다.' }));
    }
  };

  const openAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setFormData((prev) => ({
          ...prev,
          sido: data.sido,
          sigungu: data.sigungu,
        }));
        setErrors((prev) => ({ ...prev, address: '' }));
      },
    }).open();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '동호회 이름을 입력해주세요.';
    } else if (formData.name.length > 30) {
      newErrors.name = '동호회 이름은 30자 이내로 입력해주세요.';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = '관심사를 선택해주세요.';
    }

    if (!formData.sido || !formData.sigungu) {
      newErrors.address = '지역을 선택해주세요.';
    }

    if (formData.description && formData.description.length > 300) {
      newErrors.description = '동호회 설명은 300자 이내로 입력해주세요.';
    }

    if (!formData.maxMembers) {
      newErrors.maxMembers = '모집 정원을 입력해주세요.';
    } else {
      const maxMembers = parseInt(formData.maxMembers);
      if (isNaN(maxMembers) || maxMembers < 2) {
        newErrors.maxMembers = '최소 2명 이상이어야 합니다.';
      } else if (maxMembers > 999) {
        newErrors.maxMembers = '최대 999명까지 가능합니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/clubs`,
        {
          ...formData,
          maxMembers: parseInt(formData.maxMembers),
          categoryId: parseInt(formData.categoryId),
        },
        { withCredentials: true },
      );

      onSuccess(response.data);
      handleClose();
    } catch (error) {
      console.error('동호회 생성 실패:', error);
      setErrors((prev) => ({
        ...prev,
        submit: error.response?.data?.message || '동호회 생성에 실패했습니다.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      categoryId: '',
      sido: '',
      sigungu: '',
      description: '',
      maxMembers: '',
      fileId: null,
    });
    setImagePreview(null);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">동호회 만들기</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="space-y-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                <CameraIcon className="w-5 h-5 mr-2 text-gray-600" />
                프로필 사진
              </label>
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
                  ) : (
                    <CameraIcon className="w-12 h-12 text-gray-300" />
                  )}
                </div>
                <label className="px-4 py-2 bg-primary text-white text-sm rounded-lg cursor-pointer hover:brightness-110 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                  사진 업로드
                </label>
              </div>
              {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image}</p>}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                <MapPinIcon className="w-5 h-5 mr-2 text-gray-600" />
                지역 선택
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={
                    formData.sido && formData.sigungu ? `${formData.sido} ${formData.sigungu}` : ''
                  }
                  placeholder="지역을 선택해주세요"
                  readOnly
                  onClick={openAddressSearch}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={openAddressSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  disabled={isLoading}
                >
                  ▼
                </button>
              </div>
              {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                <HeartIcon className="w-5 h-5 mr-2 text-gray-600" />
                관심사
              </label>
              <div className="relative">
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                >
                  <option value="">관심사를 선택해주세요.</option>
                  {categories.map((parent) => (
                    <optgroup key={parent.categoryId} label={parent.name}>
                      {parent.children?.map((child) => (
                        <option key={child.categoryId} value={child.categoryId}>
                          {child.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  ▼
                </span>
              </div>
              {errors.categoryId && (
                <p className="text-sm text-red-500 mt-1">{errors.categoryId}</p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-600" />
                동호회 이름
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="예: 서울 맛집 탐방 모임"
                maxLength={30}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                <p className="text-xs text-gray-400 ml-auto">{formData.name.length}/30자</p>
              </div>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                <PencilSquareIcon className="w-5 h-5 mr-2 text-gray-600" />
                동호회 설명
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="어떤 동호회인지 자세히 설명해주세요. 동호회의 목적, 활동 내용, 만날 주기 등을 포함하면 좋습니다"
                rows={5}
                maxLength={300}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                <p className="text-xs text-gray-400 ml-auto">{formData.description.length}/300자</p>
              </div>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                <UsersIcon className="w-5 h-5 mr-2 text-gray-600" />
                모집 정원
              </label>
              <input
                type="number"
                name="maxMembers"
                value={formData.maxMembers}
                onChange={handleChange}
                placeholder="최대 몇 명까지 모집하시나요?"
                min={2}
                max={999}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              {errors.maxMembers && (
                <p className="text-sm text-red-500 mt-1">{errors.maxMembers}</p>
              )}
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? '생성 중...' : '생성'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubCreateModal;
