import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import usePreferences from '../hooks/usePreferences';
import { formatCurrency } from '../services/preferences';

ChartJS.register(ArcElement, Tooltip, Legend);

const Charts = ({ summary }) => {
  const { preferences } = usePreferences();

  if (!summary || !summary.categoryBreakdown || Object.keys(summary.categoryBreakdown).length === 0) {
    return (
      <div className="flex h-full items-center justify-center app-muted">
        No data to display chart.
      </div>
    );
  }

  const labels = Object.keys(summary.categoryBreakdown);
  const dataValues = labels.map(label => summary.categoryBreakdown[label].total);
  
  const backgroundColors = [
    'rgba(59, 130, 246, 0.78)',
    'rgba(16, 185, 129, 0.78)',
    'rgba(245, 158, 11, 0.78)',
    'rgba(244, 63, 94, 0.78)',
    'rgba(20, 184, 166, 0.78)',
    'rgba(100, 116, 139, 0.78)',
  ];

  const borderColors = [
    'rgb(59, 130, 246)',
    'rgb(16, 185, 129)',
    'rgb(245, 158, 11)',
    'rgb(239, 68, 68)',
    'rgb(20, 184, 166)',
    'rgb(100, 116, 139)',
  ];

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: backgroundColors.slice(0, labels.length),
        borderColor: borderColors.slice(0, labels.length),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '64%',
    plugins: {
      legend: {
        display: preferences.showChartLegend,
        position: 'right',
        labels: {
          color: '#94a3b8',
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += formatCurrency(context.parsed, preferences);
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center p-4">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default Charts;
