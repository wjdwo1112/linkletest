import { useState } from 'react';
import { galleryApi } from '../../services/api/galleryApi';
import { fileApi } from '../../services/api/fileApi';

export default function GalleryUploadModal({ joinedClubs, onClose, onSuccess }) {
  const [selectedClubId, setSelectedClubId] = useState('');
  const [scope, setScope] = useState('PUBLIC');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('JPG, PNG 파일만 업로드 가능합니다.');
      return;
    }

    try {
      setIsUploading(true);
      const uploadResponse = await fileApi.uploadImage(file);
      setUploadedFile(uploadResponse);
      setImagePreview(uploadResponse.fileUrl);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedClubId) {
      alert('게시할 동호회를 선택해주세요.');
      return;
    }

    if (!uploadedFile) {
      alert('사진을 선택해주세요.');
      return;
    }

    try {
      const galleryData = {
        clubId: parseInt(selectedClubId),
        fileId: uploadedFile.fileId,
        scope: scope === 'PUBLIC' ? '전체' : '멤버',
      };

      await galleryApi.createGallery(galleryData);
      alert('갤러리가 등록되었습니다.');
      onSuccess();
    } catch (error) {
      console.error('갤러리 등록 실패:', error);
      alert('갤러리 등록에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-xl">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">사진 등록</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">게시할 동호회</label>
            <div className="relative">
              <select
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none cursor-pointer"
              >
                <option value="">동호회를 선택하세요</option>
                {joinedClubs.map((club) => (
                  <option key={club.clubId} value={club.clubId}>
                    {club.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">공개 범위</label>
            <div className="flex gap-2">
              <button
                onClick={() => setScope('PUBLIC')}
                className={`flex-1 px-4 py-2 text-sm rounded-lg ${
                  scope === 'PUBLIC'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setScope('MEMBER')}
                className={`flex-1 px-4 py-2 text-sm rounded-lg ${
                  scope === 'MEMBER'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                멤버
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">파일 선택</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="미리보기"
                    className="w-full h-64 object-contain bg-gray-50 rounded"
                  />
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <div className="text-center text-sm text-blue-500 cursor-pointer hover:text-blue-600">
                      다른 사진 선택
                    </div>
                  </label>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <div className="text-center">
                    <div className="text-6xl mb-3">📤</div>
                    <div className="text-gray-900 font-medium mb-1">사진을 선택하세요</div>
                    <div className="text-sm text-gray-500">
                      JPG, PNG 파일을 업로드할 수 있습니다.
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading || !uploadedFile}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}
