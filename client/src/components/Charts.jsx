import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import usePreferences from '../hooks/usePreferences';
import { formatCurrency } from '../services/preferences';

ChartJS.register(ArcElement, Tooltip, Legend);

const Charts = ({ summary }) => {
  const { preferences } = usePreferences();

  if (!summary || !summary.categoryBreakdown || Object.keys(summary.categoryBreakdown).length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        No data to display chart.
      </div>
    );
  }

  const labels = Object.keys(summary.categoryBreakdown);
  const dataValues = labels.map(label => summary.categoryBreakdown[label].total);
  
  // Tailwind colors equivalent for chart
  const backgroundColors = [
    'rgba(59, 130, 246, 0.8)',   // blue-500
    'rgba(16, 185, 129, 0.8)',  // emerald-500
    'rgba(245, 158, 11, 0.8)',  // amber-500
    'rgba(239, 68, 68, 0.8)',   // red-500
    'rgba(139, 92, 246, 0.8)',  // violet-500
    'rgba(236, 72, 153, 0.8)',  // pink-500
    'rgba(100, 116, 139, 0.8)', // slate-500
  ];

  const borderColors = [
    'rgb(59, 130, 246)',
    'rgb(16, 185, 129)',
    'rgb(245, 158, 11)',
    'rgb(239, 68, 68)',
    'rgb(139, 92, 246)',
    'rgb(236, 72, 153)',
    'rgb(100, 116, 139)',
  ];

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: backgroundColors.slice(0, labels.length),
        borderColor: borderColors.slice(0, labels.length),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: preferences.showChartLegend,
        position: 'right',
        labels: {
          color: '#cbd5e1', // slate-300
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)', // slate-800
        titleColor: '#f8fafc', // slate-50
        bodyColor: '#cbd5e1', // slate-300
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
      <Pie data={data} options={options} />
    </div>
  );
};

export default Charts;
