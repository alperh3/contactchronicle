import { Connection } from '../../lib/supabase';

interface StatsCardsProps {
  connections: Connection[];
}

export default function StatsCards({ connections }: StatsCardsProps) {
  // Calculate stats
  const totalConnections = connections.length;
  
  // Count unique companies
  const uniqueCompanies = new Set(
    connections
      .map(conn => conn.company)
      .filter(company => company && company.trim())
  ).size;
  
  // Count unique positions
  const uniquePositions = new Set(
    connections
      .map(conn => conn.position)
      .filter(position => position && position.trim())
  ).size;
  
  // Calculate connections by year
  const connectionsByYear = connections.reduce((acc, conn) => {
    const connectedOn = conn.connected_on;
    if (connectedOn) {
      const year = new Date(connectedOn).getFullYear();
      if (!isNaN(year)) {
        acc[year] = (acc[year] || 0) + 1;
      }
    }
    return acc;
  }, {} as Record<number, number>);
  
  const mostActiveYear = Object.entries(connectionsByYear)
    .sort(([,a], [,b]) => b - a)[0];
  
  const mostActiveYearCount = mostActiveYear ? mostActiveYear[1] : 0;
  const mostActiveYearLabel = mostActiveYear ? mostActiveYear[0] : 'N/A';

  const stats = [
    {
      title: 'Total Connections',
      value: totalConnections.toLocaleString(),
      icon: '👥',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Unique Companies',
      value: uniqueCompanies.toLocaleString(),
      icon: '🏢',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Unique Positions',
      value: uniquePositions.toLocaleString(),
      icon: '💼',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: `Most Active Year (${mostActiveYearLabel})`,
      value: mostActiveYearCount.toLocaleString(),
      icon: '📈',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-[#6E6E6E]/5 rounded-lg border border-[#6E6E6E]/20 p-6 hover:bg-[#6E6E6E]/10 transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#F8F8F8]/70 text-sm font-medium mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-[#F8F8F8]">
                {stat.value}
              </p>
            </div>
            <div className="text-3xl opacity-80">
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
