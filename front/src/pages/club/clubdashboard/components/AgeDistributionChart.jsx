import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { clubApi } from '../../../../services/api/clubApi';

ChartJS.register(ArcElement, Tooltip, Legend);

const AgeDistributionChart = ({ clubId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await clubApi.getAgeDistribution(clubId);
        setData(result);
      } catch (error) {
        console.error('나이대 분포 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clubId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  const chartData = {
    labels: data.map((item) => item.ageGroup),
    datasets: [
      {
        data: data.map((item) => item.count),
        backgroundColor: ['#4CA8FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">동호회 나이대</h2>
      <div style={{ height: '250px' }}>
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default AgeDistributionChart;
