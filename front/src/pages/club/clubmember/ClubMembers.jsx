import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clubMemberApi, clubApi } from '../../../services/api';
import MemberCard from './components/MemberCard';
import WaitingMemberCard from './components/WaitingMemberCard';
import RoleModal from './components/RoleModal';
import RemoveModal from './components/RemoveModal';
import ApproveModal from './components/ApproveModal';
import RejectModal from './components/RejectModal';
import AlertModal from '../../../components/common/AlertModal';

export default function ClubMembers() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [waitingMembers, setWaitingMembers] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '' });

  // 동호회 접근 권한 확인
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const status = await clubApi.getMyMemberStatus(clubId);

        if (status !== 'APPROVED') {
          setHasAccess(false);
          setAlertModal({
            isOpen: true,
            message: '동호회 회원이 아니거나 접근 권한이 없습니다.',
          });

          setTimeout(() => {
            navigate(`/clubs/${clubId}/detail`);
          }, 2000);
        }
      } catch (error) {
        setHasAccess(false);
        setAlertModal({
          isOpen: true,
          message: '동호회 접근 권한이 없습니다.',
        });

        setTimeout(() => {
          navigate(`/clubs/${clubId}/detail`);
        }, 2000);
      }
    };

    if (clubId) {
      checkAccess();
    }
  }, [clubId, navigate]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const clubs = await clubApi.getJoinedClubs();
      const currentClub = clubs.find((c) => String(c.clubId) === String(clubId));
      if (currentClub) {
        setUserRole(currentClub.role);
      }

      // 승인 멤버: APPROVED 전용 엔드포인트
      const approvedMembers = await clubMemberApi.getClubMembers(clubId);
      setMembers(approvedMembers);

      // 운영진이라면 대기 멤버 별도 호출
      if (currentClub && (currentClub.role === 'LEADER' || currentClub.role === 'MANAGER')) {
        const waiting = await clubMemberApi.getWaitingMembers(clubId);
        setWaitingMembers(waiting);
      } else {
        setWaitingMembers([]);
      }
    } catch (error) {
      console.error('데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    if (clubId && hasAccess) {
      fetchData();
    }
  }, [clubId, hasAccess, fetchData]);

  const isManager = userRole === 'LEADER' || userRole === 'MANAGER';

  const handleRoleChange = (member) => {
    setSelectedMember(member);
    setShowRoleModal(true);
  };

  const handleRemove = (member) => {
    setSelectedMember(member);
    setShowRemoveModal(true);
  };

  const handleApprove = (member) => {
    setSelectedMember(member);
    setShowApproveModal(true);
  };

  const handleReject = (member) => {
    setSelectedMember(member);
    setShowRejectModal(true);
  };

  const closeModals = () => {
    setShowRoleModal(false);
    setShowRemoveModal(false);
    setShowApproveModal(false);
    setShowRejectModal(false);
    setSelectedMember(null);
  };

  // 접근 권한 없음
  if (!hasAccess) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <AlertModal
          isOpen={alertModal.isOpen}
          message={alertModal.message}
          onClose={() => setAlertModal({ isOpen: false, message: '' })}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">멤버 관리</h1>

      {/* 모임장 */}
      <div className="mb-8">
        <h2 className="flex items-center text-lg font-semibold mb-4">
          <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
          모임장
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {members
            .filter((m) => m.role === 'LEADER')
            .map((member) => (
              <MemberCard
                key={member.memberId}
                member={member}
                isManager={isManager}
                onRoleChange={handleRoleChange}
                onRemove={handleRemove}
              />
            ))}
        </div>
      </div>

      {/* 운영진 */}
      <div className="mb-8">
        <h2 className="flex items-center text-lg font-semibold mb-4">
          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
          운영진
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {members
            .filter((m) => m.role === 'MANAGER')
            .map((member) => (
              <MemberCard
                key={member.memberId}
                member={member}
                isManager={isManager}
                onRoleChange={handleRoleChange}
                onRemove={handleRemove}
              />
            ))}
        </div>
      </div>

      {/* 멤버 */}
      <div className="mb-8">
        <h2 className="flex items-center text-lg font-semibold mb-4">
          <span className="w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
          멤버
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {members
            .filter((m) => m.role === 'MEMBER')
            .map((member) => (
              <MemberCard
                key={member.memberId}
                member={member}
                isManager={isManager}
                onRoleChange={handleRoleChange}
                onRemove={handleRemove}
              />
            ))}
        </div>
      </div>

      {/* 멤버 바로 아래: 대기자 */}
      {isManager && waitingMembers.length > 0 && (
        <div className="mb-8">
          <h2 className="flex items-center text-lg font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
            대기자 ({waitingMembers.length})
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {waitingMembers.map((member) => (
              <WaitingMemberCard
                key={member.memberId}
                member={member}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        </div>
      )}

      {/* 모달들 */}
      {showRoleModal && selectedMember && (
        <RoleModal
          member={selectedMember}
          clubId={clubId}
          onClose={closeModals}
          onSuccess={() => {
            closeModals();
            fetchData();
          }}
        />
      )}

      {showRemoveModal && selectedMember && (
        <RemoveModal
          member={selectedMember}
          clubId={clubId}
          onClose={closeModals}
          onSuccess={() => {
            closeModals();
            fetchData();
          }}
        />
      )}

      {showApproveModal && selectedMember && (
        <ApproveModal
          member={selectedMember}
          clubId={clubId}
          onClose={closeModals}
          onSuccess={() => {
            closeModals();
            fetchData();
          }}
        />
      )}

      {showRejectModal && selectedMember && (
        <RejectModal
          member={selectedMember}
          clubId={clubId}
          onClose={closeModals}
          onSuccess={() => {
            closeModals();
            fetchData();
          }}
        />
      )}

      {/* 알림 모달 */}
      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
      />
    </div>
  );
}
