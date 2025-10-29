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

const QuarterlyJoinChart = ({ clubId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await clubApi.getQuarterlyJoinStats(clubId);
        setData(result);
      } catch (error) {
        console.error('분기별 가입자 수 조회 실패:', error);
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
    labels: data.map((item) => item.label),
    datasets: [
      {
        label: '가입자 수',
        data: data.map((item) => item.count),
        backgroundColor: '#4CA8FF',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">동호회 기간별 가입자 수</h2>
        <span className="text-sm text-gray-500">(최근 18개월 기준)</span>
      </div>
      <div style={{ height: '250px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default QuarterlyJoinChart;
