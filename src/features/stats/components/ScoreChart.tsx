import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ScoreChartProps {
  data: {
    date: string;
    relativeScore: number;
  }[];
}

export function ScoreChart({ data }: ScoreChartProps) {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Find min and max scores for y-axis
  const scores = sortedData.map(d => d.relativeScore);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const padding = Math.max(2, Math.ceil((maxScore - minScore) * 0.1)); // At least 2, or 10% of range

  // Handle padding for few data points
  const needsPadding = sortedData.length < 5;
  const paddedData = needsPadding ? [
    ...Array(Math.floor((5 - sortedData.length) / 2)).fill(null),
    ...sortedData.map(d => d.relativeScore),
    ...Array(Math.ceil((5 - sortedData.length) / 2)).fill(null)
  ] : sortedData.map(d => d.relativeScore);

  // Create labels with padding
  const dateLabels = sortedData.map(d => format(new Date(d.date), 'MMM d'));
  const paddedLabels = needsPadding ? [
    ...Array(Math.floor((5 - dateLabels.length) / 2)).fill(''),
    ...dateLabels,
    ...Array(Math.ceil((5 - dateLabels.length) / 2)).fill('')
  ] : dateLabels;

  const chartData = {
    labels: paddedLabels,
    datasets: [
      {
        label: 'Relative Score',
        data: paddedData,
        borderColor: '#3B82F6', // accent color
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const score = context.parsed.y;
            if (score === null) return null;
            return score === 0 ? 'Even' : score > 0 ? `+${score}` : `${score}`;
          },
        },
        filter: (tooltipItem) => tooltipItem.raw !== null,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          callback: (_, index) => {
            // Only show labels for actual data points
            const actualDataStartIndex = needsPadding 
              ? Math.floor((5 - sortedData.length) / 2)
              : 0;
            const isActualDataPoint = index >= actualDataStartIndex && 
              index < actualDataStartIndex + sortedData.length;
            return isActualDataPoint ? paddedLabels[index] : '';
          },
        },
      },
      y: {
        min: Math.floor(minScore - padding),
        max: Math.ceil(maxScore + padding),
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value) => {
            const score = value as number;
            return score === 0 ? 'E' : score > 0 ? `+${score}` : `${score}`;
          },
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Progression</h3>
      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}