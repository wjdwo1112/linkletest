import { useState, useEffect } from 'react';
import { galleryApi } from '../../services/api/galleryApi';

import useUserStore from '../../store/useUserStore';

export default function GalleryDetailModal({ gallery, onClose, onDelete }) {
  const { user } = useUserStore();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetchLikeStatus();
  }, []);

  const fetchLikeStatus = async () => {
    try {
      const status = await galleryApi.getGalleryLikeStatus(gallery.galleryId);
      setLiked(status.liked);
      setLikeCount(status.likeCount);
    } catch (error) {
      console.error('좋아요 상태 조회 실패:', error);
    }
  };

  const handleLikeToggle = async () => {
    try {
      const result = await galleryApi.toggleGalleryLike(gallery.galleryId);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('이 갤러리를 삭제하시겠습니까?')) return;

    try {
      await galleryApi.deleteGallery(gallery.galleryId);
      alert('갤러리가 삭제되었습니다.');
      onDelete();
    } catch (error) {
      console.error('갤러리 삭제 실패:', error);
      alert('갤러리 삭제에 실패했습니다.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const isOwner = user && gallery.createdBy === user.memberId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">사진 등록</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={gallery.fileUrl}
                  alt={gallery.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="w-80 space-y-4">
              <div>
                <div className="font-semibold text-gray-900 mb-2">{gallery.clubName}</div>
                <div className="text-sm text-gray-500">{formatDate(gallery.createdAt)}</div>
              </div>

              {gallery.title && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">제목</div>
                  <div className="text-gray-900">{gallery.title}</div>
                </div>
              )}

              {gallery.content && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">설명</div>
                  <div className="text-gray-600 text-sm">{gallery.content}</div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t">
                <button
                  onClick={handleLikeToggle}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                    liked ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{liked ? '❤️' : '🤍'}</span>
                  <span className="text-sm font-medium">{likeCount}</span>
                </button>

                {isOwner && (
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
