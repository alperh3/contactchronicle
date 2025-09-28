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
        borderColor: '#F8F8F8',
        backgroundColor: 'rgba(248, 248, 248, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: topCompanies.map(([company]) => 
      company.length > 20 ? company.substring(0, 20) + '...' : company
    ),
    datasets: [
      {
        label: 'Connections',
        data: topCompanies.map(([, count]) => count),
        backgroundColor: 'rgba(248, 248, 248, 0.8)',
        borderColor: '#F8F8F8',
        borderWidth: 1,
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
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#F8F8F8',
        },
        grid: {
          color: 'rgba(248, 248, 248, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#F8F8F8',
        },
        grid: {
          color: 'rgba(248, 248, 248, 0.1)',
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
