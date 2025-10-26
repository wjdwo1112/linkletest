import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { clubApi } from '../../services/api/clubApi';
import { scheduleApi } from '../../services/api/scheduleApi';
import {
  LightBulbIcon,
  UserGroupIcon,
  StarIcon,
  MapPinIcon,
  ChevronRightIcon,
  CalendarIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import defaultProfile from '../../assets/images/default-profile.png';
import ViewModal from '../../components/common/ViewModal';
import JoinSuccessModal from '../../components/common/JoinSuccessModal';
import defaultClubProfile from '../../assets/images/default-club-profile.png';
export default function ClubDetailNew() {
  const { clubId } = useParams();
  const [club, setClub] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [myStatus, setMyStatus] = useState(null); // null, 'APPROVED', 'WAITING', 'BLOCKED'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [resultModal, setResultModal] = useState({
    open: false,
    variant: 'success',
    message: '',
  });

  const handleRequestJoin = async () => {
    if (joinSubmitting || myStatus) return;

    try {
      setJoinSubmitting(true);
      await clubApi.requestJoin(clubId);

      // 성공 시 상태 업데이트
      setMyStatus('WAITING');

      setResultModal({
        open: true,
        variant: 'success',
        message: '신청이 완료되었습니다',
      });
    } catch (e) {
      const msg = e?.response?.data?.message || '가입 신청 중 오류가 발생했습니다.';
      setResultModal({
        open: true,
        variant: 'error',
        message: msg,
      });
    } finally {
      setJoinSubmitting(false);
    }
  };

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
  };

  useEffect(() => {
    (async () => {
      try {
        // 기본 데이터 로딩
        const [clubDetail, count, mems, sch] = await Promise.all([
          clubApi.getClubDetail(clubId),
          clubApi.getClubMemberCount(clubId),
          clubApi.getClubMembers(clubId),
          scheduleApi.getSchedulesByClubId(clubId),
        ]);

        setClub(clubDetail);
        setMemberCount(count);
        setMembers(mems);
        setSchedules(sch);

        // 로그인 상태 확인: API 호출 시도
        try {
          const status = await clubApi.getMyMemberStatus(clubId);
          // 성공하면 로그인됨
          setIsLoggedIn(true);
          setMyStatus(status);
        } catch {
          // 401 에러 = 로그인 안 함
          setIsLoggedIn(false);
          setMyStatus(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [clubId]);

  const admins = members.filter((m) => m.role === 'LEADER' || m.role === 'MANAGER');
  const visibleAdmins = admins.slice(0, 6);
  const visibleMembers = members.slice(0, 6);

  // 버튼 표시 여부 결정
  const shouldShowButton = () => {
    // 로그인 안 함 → 버튼 숨김
    if (!isLoggedIn) return false;

    // 회원인 경우 → 버튼 숨김
    if (myStatus === 'APPROVED') return false;

    // 승인 대기중, 차단됨, 미가입 → 버튼 표시
    return true;
  };

  // 버튼 텍스트 및 상태 결정
  const getButtonConfig = () => {
    if (myStatus === 'WAITING') {
      return {
        text: '승인대기중',
        disabled: true,
        className: 'bg-orange-400 cursor-not-allowed',
      };
    }
    if (myStatus === 'BLOCKED') {
      return {
        text: '가입불가',
        disabled: true,
        className: 'bg-red-400 cursor-not-allowed',
      };
    }

    // 미가입 (myStatus === null)
    return {
      text: '가입하기',
      disabled: false,
      className: 'bg-[#4CA8FF] hover:bg-sky-600 active:bg-sky-700',
    };
  };

  const buttonConfig = getButtonConfig();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">로딩 중…</div>
    );
  }
  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        동호회 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 커버 */}
      <div className="mb-6 rounded-2xl overflow-hidden border border-blue-200 shadow-sm">
        <img
          src={club.fileLink || defaultClubProfile}
          alt="cover"
          className="w-full h-48 object-cover"
        />
      </div>

      <div className="flex gap-8">
        {/* 왼쪽 */}
        <div className="flex-1">
          {/* 제목 & 태그 */}
          <div className="flex items-start gap-4 mb-4">
            <img
              src={club.fileLink || defaultClubProfile}
              alt="logo"
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{club.clubName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                  {club.categoryName || '카테고리'}
                </span>
                {club.region && (
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                    {club.region}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                  멤버 {memberCount}
                </span>
              </div>
            </div>
          </div>

          {/* 모임 소개 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <LightBulbIcon className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">모임 소개</span>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {club.description || '소개가 없습니다.'}
            </div>
          </div>

          {/* 운영진 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-gray-800" />
                <span className="font-semibold">운영진</span>
              </div>
              <button
                onClick={() => openModal('admins')}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50
                          rounded-md px-2 py-1 cursor-pointer transition-colors"
              >
                더보기 <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-6 gap-4">
              {visibleAdmins.map((m) => (
                <div
                  key={m.memberId}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 p-3 flex flex-col items-center shadow-sm"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden">
                    <img
                      src={m.fileLink || defaultProfile}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-2 text-[12px] truncate w-full text-center">
                    {m.nickname || m.name}
                  </div>
                  <div
                    className={
                      'mt-1 text-[11px] px-1.5 py-0.5 rounded-full flex items-center gap-1 ' +
                      (m.role === 'LEADER'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-blue-50 text-blue-600')
                    }
                    title={m.role === 'LEADER' ? '모임장' : '운영진'}
                  >
                    {m.role === 'LEADER' ? (
                      <>
                        <StarIcon className="w-3.5 h-3.5 text-amber-500" />
                        모임장
                      </>
                    ) : (
                      <>
                        <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-500" />
                        운영진
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 모임 멤버 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-gray-800" />
                <span className="font-semibold">모임 멤버 {memberCount}</span>
              </div>
              <button
                onClick={() => openModal('members')}
                className="flex items-center gap-1 text-sm text-gray-500  hover:text-gray-700 hover:bg-gray-50
                            rounded-md px-2 py-1 cursor-pointer transition-colors"
              >
                더보기 <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-6 gap-x-6 gap-y-6">
              {visibleMembers.map((m) => (
                <div key={m.memberId} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={m.fileLink || defaultProfile}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-2 text-[12px] truncate w-full text-center">
                    {m.nickname || m.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽 사이드 */}
        <aside className="w-80 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
            <div className="font-semibold mb-1">{club.clubName}</div>
            <div className="text-sm text-gray-700 mb-3">{club.categoryName}</div>
            <div className="space-y-2 text-sm text-gray-600">
              {club.region && (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{club.region}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                <span>멤버 {memberCount}명</span>
              </div>
            </div>

            {/* 조건부 버튼 표시 */}
            {shouldShowButton() && (
              <button
                onClick={handleRequestJoin}
                disabled={buttonConfig.disabled}
                className={`w-full mt-4 py-2.5 rounded-lg text-white font-medium transition-colors
                          ${buttonConfig.className}`}
              >
                {buttonConfig.text}
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="font-semibold mb-4">정보 일정</div>
            {schedules.length === 0 ? (
              <div className="text-sm text-gray-500 py-8 text-center">예정된 일정이 없습니다</div>
            ) : (
              <div className="space-y-3">
                {schedules.map((s) => {
                  const d = new Date(s.scheduleStartDate);
                  const month = d.getMonth() + 1;
                  const day = d.getDate();
                  const hh = String(d.getHours()).padStart(2, '0');
                  const mm = String(d.getMinutes()).padStart(2, '0');
                  return (
                    <div key={s.scheduleId} className="flex items-start gap-3 p-3 rounded-xl">
                      <div className="w-12 h-12 rounded-lg bg-sky-500 text-white flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px]">{month}월</span>
                        <span className="text-lg leading-none font-bold">{day}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{s.title}</div>
                        <div className="mt-1 text-xs text-gray-600 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="w-4 h-4" /> {hh}:{mm}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPinIcon className="w-4 h-4" /> {s.address}
                          </div>
                          <div className="text-xs">
                            👥 {s.attendeeCount || 0}/{s.maxAttendees}명
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ===== 모달 ===== */}
      <ViewModal
        open={isModalOpen}
        onClose={closeModal}
        title={modalType === 'admins' ? '운영진 소개' : '멤버 소개'}
        width={500}
        heightVh={60}
      >
        <div className="divide-y divide-gray-100">
          {(modalType === 'admins' ? admins : members).map((m) => (
            <div key={m.memberId} className="flex items-center justify-between gap-4 py-4 px-2">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={m.fileLink || defaultProfile}
                    alt={m.nickname || m.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-900 truncate max-w-[160px]">
                      {m.nickname || m.name}
                    </span>
                    {m.role === 'LEADER' && (
                      <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-md">
                        모임장
                      </span>
                    )}
                    {m.role === 'MANAGER' && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md">
                        운영진
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 truncate max-w-[400px]">
                    {m.description || '아직 소개가 없습니다.'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ViewModal>

      {/* 가입 신청 결과 모달 */}
      <JoinSuccessModal
        open={resultModal.open}
        onClose={() => setResultModal((s) => ({ ...s, open: false }))}
        variant={resultModal.variant}
        message={resultModal.message}
      />
    </div>
  );
}
