import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { clubMemberApi, clubApi } from '../../../services/api';
import MemberCard from '../../club/clubmember/components/MemberCard';
import WaitingMemberCard from '../../club/clubmember/components/WaitingMemberCard';
import RoleModal from '../../club/clubmember/components/RoleModal';
import RemoveModal from '../../club/clubmember/components/RemoveModal';
import ApproveModal from '../../club/clubmember/components/ApproveModal';
import RejectModal from '../../club/clubmember/components/RejectModal';

export default function ClubMembers() {
  const { clubId } = useParams();
  const [members, setMembers] = useState([]);
  const [waitingMembers, setWaitingMembers] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const clubs = await clubApi.getJoinedClubs();
      const currentClub = clubs.find((c) => String(c.clubId) === String(clubId));
      if (currentClub) {
        setUserRole(currentClub.role);
      }

      const membersData = await clubMemberApi.getClubMembers(clubId);
      setMembers(membersData);

      if (currentClub && (currentClub.role === 'LEADER' || currentClub.role === 'MANAGER')) {
        const waitingData = await clubMemberApi.getWaitingMembers(clubId);
        setWaitingMembers(waitingData);
      }
    } catch (error) {
      console.error('데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  if (loading) {
    return <div className="bg-white p-8 text-center text-gray-500">로딩 중...</div>;
  }

  return (
    <div className="bg-white p-8">
      <h1 className="text-2xl font-bold mb-8">가입 멤버</h1>

      <div className="mb-8">
        <h2 className="flex items-center text-lg font-semibold mb-4">
          <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
          동호회장
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

      {isManager && waitingMembers.length > 0 && (
        <div className="mb-8">
          <h2 className="flex items-center text-lg font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
            승인 대기
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

      {showRoleModal && (
        <RoleModal
          member={selectedMember}
          onClose={() => setShowRoleModal(false)}
          onSuccess={fetchData}
          clubId={clubId}
        />
      )}

      {showRemoveModal && (
        <RemoveModal
          member={selectedMember}
          onClose={() => setShowRemoveModal(false)}
          onSuccess={fetchData}
          clubId={clubId}
        />
      )}

      {showApproveModal && (
        <ApproveModal
          member={selectedMember}
          onClose={() => setShowApproveModal(false)}
          onSuccess={fetchData}
          clubId={clubId}
        />
      )}

      {showRejectModal && (
        <RejectModal
          member={selectedMember}
          onClose={() => setShowRejectModal(false)}
          onSuccess={fetchData}
          clubId={clubId}
        />
      )}
    </div>
  );
}
