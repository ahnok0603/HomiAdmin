import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartContainer = ({ title, labels, data, type = 'line' }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data,
        borderColor: '#8B5E3C',
        backgroundColor: 'rgba(139, 94, 60, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#8B5E3C',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: true,
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
      tooltip: {
        backgroundColor: '#1C1A17',
        titleFont: { family: 'Outfit', size: 13 },
        bodyFont: { family: 'Outfit', size: 14, weight: 'bold' },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => ` $${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#8F8375',
          font: { family: 'Outfit', size: 12 },
        },
      },
      y: {
        grid: {
          color: 'rgba(139, 94, 60, 0.08)',
        },
        ticks: {
          color: '#8F8375',
          font: { family: 'Outfit', size: 12 },
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  return (
    <div className="chart-card card">
      <div className="chart-header">
        <h3>{title}</h3>
      </div>
      <div className="chart-body">
        {type === 'bar' ? (
          <Bar data={chartData} options={options} />
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>

      <style>{`
        .chart-card {
          padding: 24px;
          height: 350px;
          display: flex;
          flex-direction: column;
        }
        .chart-header {
          margin-bottom: 16px;
        }
        .chart-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .chart-body {
          flex-grow: 1;
          position: relative;
          height: 100%;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default ChartContainer;
