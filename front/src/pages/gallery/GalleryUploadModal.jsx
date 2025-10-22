import { useState, useEffect } from 'react';
import { galleryApi } from '../../services/api/galleryApi';
import { fileApi } from '../../services/api/fileApi';

export default function GalleryUploadModal({ joinedClubs, onClose, onSuccess, preSelectedClubId }) {
  const [selectedClubId, setSelectedClubId] = useState('');
  const [scope, setScope] = useState('PUBLIC');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (preSelectedClubId) {
      setSelectedClubId(String(preSelectedClubId));
    }
  }, [preSelectedClubId]);

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
        scope: scope === 'PUBLIC' ? 'ALL' : 'ALL',
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
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">사진 등록</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">게시할 동호회</label>
            <div className="relative">
              <select
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                disabled={!!preSelectedClubId}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-700"
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
                  className="w-5 h-5 text-gray-400"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">공개 범위</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value="PUBLIC"
                  checked={scope === 'PUBLIC'}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">전체</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value="MEMBER"
                  checked={scope === 'MEMBER'}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">멤버</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">파일 선택</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="미리보기"
                    className="w-full h-64 object-contain bg-gray-50"
                  />
                  <label className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <div className="text-center text-sm text-white font-medium">다른 사진 선택</div>
                  </label>
                </div>
              ) : (
                <label className="block cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center py-12">
                    <svg
                      className="w-12 h-12 text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    <div className="text-gray-700 font-medium mb-1">사진을 선택하세요</div>
                    <div className="text-sm text-gray-500">
                      JPG, PNG 파일을 업로드할 수 있습니다.
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading || !uploadedFile}
            className="flex-1 px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}
