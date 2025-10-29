import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { clubApi } from '../../../../services/api/clubApi';

ChartJS.register(ArcElement, Tooltip, Legend);

const GenderRatioChart = ({ clubId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await clubApi.getGenderRatio(clubId);
        setData(result);
      } catch (error) {
        console.error('성비 조회 실패:', error);
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
    labels: ['남성', '여성'],
    datasets: [
      {
        data: [data?.maleCount || 0, data?.femaleCount || 0],
        backgroundColor: ['#4CA8FF', '#EC4899'],
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
      <h2 className="text-lg font-bold text-gray-900 mb-4">동호회 회원 성비</h2>
      <div style={{ height: '250px' }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default GenderRatioChart;
