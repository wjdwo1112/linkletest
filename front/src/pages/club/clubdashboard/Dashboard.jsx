import { useParams, useNavigate } from 'react-router-dom';
import useUserStore from '../../../store/useUserStore';
import MonthlyAttendanceChart from './components/MonthlyAttendanceChart';
import AgeDistributionChart from './components/AgeDistributionChart';
import GenderRatioChart from './components/GenderRatioChart';
import QuarterlyJoinChart from './components/QuarterlyJoinChart';
import ClubInfo from './components/ClubInfo';
import NoticeList from './components/NoticeList';
import UpcomingSchedules from './components/UpcomingSchedules';
import ClubMembers from './components/ClubMembers';
import ClubWithdrawModal from './components/ClubWithdrawModal';
import AlertModal from '../../../components/common/AlertModal';
import { clubApi } from '../../../services/api/clubApi';
import { useState } from 'react';
const Dashboard = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { currentClubRole, setCurrentClub } = useUserStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '' });
  const isManager = currentClubRole === 'LEADER' || currentClubRole === 'MANAGER';
  const [clubName, setClubName] = useState('');

  // 리더가 아닐 경우만 오버플로우 메뉴 표시
  const showMenu = currentClubRole !== 'LEADER';

  // 탈퇴 버튼 클릭 핸들러
  const handleWithdrawClick = () => {
    setIsMenuOpen(false);
    setIsWithdrawModalOpen(true);
  };

  // 탈퇴 확인 핸들러
  const handleWithdrawConfirm = async () => {
    try {
      await clubApi.withdrawFromClub(clubId);
      setIsWithdrawModalOpen(false);

      window.dispatchEvent(new Event('clubUpdated'));
      setCurrentClub(null, null);

      setAlertModal({
        isOpen: true,
        message: '동호회에서 탈퇴되었습니다.',
      });
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      setIsWithdrawModalOpen(false);
      const errorMessage = error.response?.data?.message || '탈퇴 처리 중 오류가 발생했습니다.';
      setAlertModal({
        isOpen: true,
        message: errorMessage,
      });
    }
  };

  const handleClubDataLoad = (data) => {
    if (data && data.clubName) {
      setClubName(data.clubName);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 헤더 - 대시보드 타이틀과 오버플로우 메뉴 */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>

        {/* 오버플로우 메뉴 (리더가 아닐 경우만 표시) */}
        {showMenu && (
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="메뉴 열기"
            >
              <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {isMenuOpen && (
              <>
                {/* 오버레이 (메뉴 닫기용) */}
                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />

                {/* 드롭다운 메뉴 */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <button
                    onClick={handleWithdrawClick}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-red-500 font-medium rounded-lg"
                  >
                    동호회 탈퇴
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {isManager && (
        <div className="space-y-6 mb-8">
          <MonthlyAttendanceChart clubId={clubId} />
          <div className="grid grid-cols-2 gap-6">
            <AgeDistributionChart clubId={clubId} />
            <GenderRatioChart clubId={clubId} />
          </div>
          <QuarterlyJoinChart clubId={clubId} />
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-6">
          <ClubInfo clubId={clubId} onDataLoad={handleClubDataLoad} />
          <div className="col-span-2">
            <NoticeList clubId={clubId} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <UpcomingSchedules clubId={clubId} />
          </div>
          <ClubMembers clubId={clubId} />
        </div>
      </div>
      {/* 탈퇴 확인 모달 */}
      <ClubWithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onConfirm={handleWithdrawConfirm}
        clubName={clubName}
      />

      {/* 알림 모달 */}
      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
      />
    </div>
  );
};

export default Dashboard;
