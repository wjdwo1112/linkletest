import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { clubApi } from '../../../../services/api/clubApi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MonthlyAttendanceChart = ({ clubId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await clubApi.getMonthlyAttendance(clubId);
        setData(result);
      } catch (error) {
        console.error('월별 참여율 조회 실패:', error);
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
    labels: data.map((member) => member.nickname),
    datasets: [
      {
        label: '참여율',
        data: data.map((member) => member.avgAttendanceRate),
        backgroundColor: ['#6366F1', '#14B8A6', '#F59E0B', '#8B5CF6', '#EC4899'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + '%',
        },
      },
      y: {
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">동호회 회원별 참여율</h2>
        <span className="text-sm text-gray-500">(최근 6개월 기준)</span>
      </div>
      <div style={{ height: '250px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MonthlyAttendanceChart;
