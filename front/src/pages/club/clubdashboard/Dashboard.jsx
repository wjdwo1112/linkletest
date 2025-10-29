import { useParams } from 'react-router-dom';
import useUserStore from '../../../store/useUserStore';
import MonthlyAttendanceChart from './components/MonthlyAttendanceChart';
import AgeDistributionChart from './components/AgeDistributionChart';
import GenderRatioChart from './components/GenderRatioChart';
import QuarterlyJoinChart from './components/QuarterlyJoinChart';
import ClubInfo from './components/ClubInfo';
import NoticeList from './components/NoticeList';
import UpcomingSchedules from './components/UpcomingSchedules';
import ClubMembers from './components/ClubMembers';

const Dashboard = () => {
  const { clubId } = useParams();
  const { currentClubRole } = useUserStore();

  const isManager = currentClubRole === 'LEADER' || currentClubRole === 'MANAGER';

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">대시보드</h1>

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
          <ClubInfo clubId={clubId} />
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
    </div>
  );
};

export default Dashboard;
