'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Connection {
  [key: string]: string;
}

interface ConnectionsChartProps {
  connections: Connection[];
}

export default function ConnectionsChart({ connections }: ConnectionsChartProps) {
  // Process data for monthly connections
  const monthlyData = connections.reduce((acc, conn) => {
    const connectedOn = conn['Connected On'];
    if (connectedOn) {
      const date = new Date(connectedOn);
      if (!isNaN(date.getTime())) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[monthKey] = (acc[monthKey] || 0) + 1;
      }
    }
    return acc;
  }, {} as Record<string, number>);

  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyData).sort();
  
  // Calculate cumulative connections
  let cumulative = 0;
  const cumulativeData = sortedMonths.map(month => {
    cumulative += monthlyData[month];
    return cumulative;
  });

  // Process data for company distribution (top 10)
  const companyData = connections.reduce((acc, conn) => {
    const company = conn['Company'];
    if (company && company.trim()) {
      acc[company] = (acc[company] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topCompanies = Object.entries(companyData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  const lineChartData = {
    labels: sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }),
    datasets: [
      {
        label: 'Cumulative Connections',
        data: cumulativeData,
        borderColor: '#A8E6CF',
        backgroundColor: 'rgba(168, 230, 207, 0.3)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#A8E6CF',
        pointBorderColor: '#7FCDCD',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  // Pastel color palette
  const pastelColors = [
    '#A8E6CF', // Mint green
    '#FFD3A5', // Peach
    '#FFAAA5', // Coral
    '#A8DADC', // Sky blue
    '#F1FAEE', // Cream
    '#E9C46A', // Golden yellow
    '#F4A261', // Orange
    '#E76F51', // Red-orange
    '#9A8C98', // Mauve
    '#C9ADA7', // Rose
    '#B8B8FF', // Lavender
    '#FFB3BA', // Pink
    '#BAFFC9', // Light green
    '#BAE1FF', // Light blue
    '#FFFFBA', // Light yellow
  ];

  const barChartData = {
    labels: topCompanies.map(([company]) => 
      company.length > 20 ? company.substring(0, 20) + '...' : company
    ),
    datasets: [
      {
        label: 'Connections',
        data: topCompanies.map(([, count]) => count),
        backgroundColor: topCompanies.map((_, index) => pastelColors[index % pastelColors.length]),
        borderColor: topCompanies.map((_, index) => pastelColors[index % pastelColors.length]),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#F8F8F8',
          font: {
            size: 12
          }
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#F8F8F8',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(248, 248, 248, 0.1)',
          drawBorder: false,
        },
      },
      y: {
        ticks: {
          color: '#F8F8F8',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(248, 248, 248, 0.1)',
          drawBorder: false,
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Growth Chart */}
      <div className="bg-[#6E6E6E]/5 rounded-lg border border-[#6E6E6E]/20 p-6">
        <h3 className="text-lg font-semibold text-[#F8F8F8] mb-4">
          Cumulative Connections Over Time
        </h3>
        <div className="h-64">
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </div>

      {/* Top Companies Chart */}
      <div className="bg-[#6E6E6E]/5 rounded-lg border border-[#6E6E6E]/20 p-6">
        <h3 className="text-lg font-semibold text-[#F8F8F8] mb-4">
          Top 10 Companies
        </h3>
        <div className="h-64">
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
