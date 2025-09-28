'use client';

import { useState, useEffect } from 'react';
import ConnectionsTable from './components/ConnectionsTable';
import ConnectionsChart from './components/ConnectionsChart';
import StatsCards from './components/StatsCards';

interface Connection {
  firstName: string;
  lastName: string;
  url: string;
  emailAddress: string;
  company: string;
  position: string;
  connectedOn: string;
}

export default function Dashboard() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ company: '', position: '' });

  useEffect(() => {
    // Load connections data
    fetch('/data/linkedin_connections.csv')
      .then(response => response.text())
      .then(csvText => {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const data = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const connection: any = {};
            headers.forEach((header, index) => {
              connection[header] = values[index] || '';
            });
            return connection;
          })
          .filter(conn => conn['First Name'] && conn['Last Name']); // Filter out empty rows

        setConnections(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading connections:', error);
        setLoading(false);
      });
  }, []);

  const filteredConnections = connections.filter(conn => {
    const companyMatch = !filter.company || 
      conn['Company']?.toLowerCase().includes(filter.company.toLowerCase());
    const positionMatch = !filter.position || 
      conn['Position']?.toLowerCase().includes(filter.position.toLowerCase());
    return companyMatch && positionMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F8F8F8] mx-auto mb-4"></div>
          <p className="text-[#F8F8F8]/70">Loading your connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04090F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F8F8F8] mb-2">Dashboard</h1>
          <p className="text-[#F8F8F8]/70">
            Transform Your LinkedIn Connections Into Insights
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards connections={connections} />

        {/* Charts Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#F8F8F8] mb-4">Network Growth</h2>
          <ConnectionsChart connections={connections} />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Filter by company..."
              value={filter.company}
              onChange={(e) => setFilter(prev => ({ ...prev, company: e.target.value }))}
              className="w-full px-4 py-2 bg-[#6E6E6E]/10 border border-[#6E6E6E]/20 rounded-lg text-[#F8F8F8] placeholder-[#F8F8F8]/50 focus:outline-none focus:ring-2 focus:ring-[#6E6E6E]/50"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Filter by position..."
              value={filter.position}
              onChange={(e) => setFilter(prev => ({ ...prev, position: e.target.value }))}
              className="w-full px-4 py-2 bg-[#6E6E6E]/10 border border-[#6E6E6E]/20 rounded-lg text-[#F8F8F8] placeholder-[#F8F8F8]/50 focus:outline-none focus:ring-2 focus:ring-[#6E6E6E]/50"
            />
          </div>
        </div>

        {/* Connections Table */}
        <div className="bg-[#6E6E6E]/5 rounded-lg border border-[#6E6E6E]/20">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#F8F8F8] mb-4">
              Connections ({filteredConnections.length})
            </h2>
            <ConnectionsTable connections={filteredConnections} />
          </div>
        </div>
      </div>
    </div>
  );
}
