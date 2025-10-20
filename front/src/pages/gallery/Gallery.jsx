import { useState, useEffect } from 'react';
import { galleryApi } from '../../services/api/galleryApi';
import { clubApi } from '../../services/api/clubApi';
import GalleryDetailModal from '../../pages/gallery/GalleryDetailModal';
import GalleryUploadModal from '../../pages/gallery/GalleryUploadModal';

export default function Gallery() {
  const [galleries, setGalleries] = useState([]);
  const [filteredGalleries, setFilteredGalleries] = useState([]);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedGallery, setSelectedGallery] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClubId) {
      const filtered = galleries.filter((g) => g.clubId === selectedClubId);
      setFilteredGalleries(filtered);
    } else {
      setFilteredGalleries(galleries);
    }
  }, [selectedClubId, galleries]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [galleriesData, clubsData] = await Promise.all([
        galleryApi.getGalleryList(),
        clubApi.getJoinedClubs(),
      ]);
      setGalleries(galleriesData || []);
      setFilteredGalleries(galleriesData || []);
      setJoinedClubs(clubsData || []);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (gallery) => {
    setSelectedGallery(gallery);
    setIsDetailOpen(true);
  };

  const handleUploadSuccess = () => {
    fetchData();
    setIsUploadOpen(false);
  };

  const handleDeleteSuccess = () => {
    fetchData();
    setIsDetailOpen(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">갤러리</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600"
          >
            등록
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => setSelectedClubId(null)}
          className={`px-4 py-2 text-sm rounded-lg ${
            selectedClubId === null
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          전체
        </button>
        {joinedClubs.map((club) => (
          <button
            key={club.clubId}
            onClick={() => setSelectedClubId(club.clubId)}
            className={`px-4 py-2 text-sm rounded-lg ${
              selectedClubId === club.clubId
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {club.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filteredGalleries.length === 0 ? (
          <div className="col-span-3 text-center py-20 text-gray-500">
            등록된 갤러리가 없습니다.
          </div>
        ) : (
          filteredGalleries.map((gallery) => (
            <div
              key={gallery.galleryId}
              onClick={() => handleImageClick(gallery)}
              className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                src={gallery.fileUrl}
                alt={gallery.title}
                className="w-full h-full object-cover"
              />
            </div>
          ))
        )}
      </div>

      {isDetailOpen && selectedGallery && (
        <GalleryDetailModal
          gallery={selectedGallery}
          onClose={() => setIsDetailOpen(false)}
          onDelete={handleDeleteSuccess}
        />
      )}

      {isUploadOpen && (
        <GalleryUploadModal
          joinedClubs={joinedClubs}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
