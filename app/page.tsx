'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { supabase, Connection } from '../lib/supabase';
import ConnectionsTable from './components/ConnectionsTable';
import ConnectionsChart from './components/ConnectionsChart';
import StatsCards from './components/StatsCards';

// Using Connection type from supabase.ts

export default function Dashboard() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ company: '', position: '' });

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10000); // Increase limit to fetch all connections

      if (error) {
        console.error('Error loading connections:', error);
        // Fallback to CSV if database is empty
        loadFromCSV();
        return;
      }

      if (data && data.length > 0) {
        setConnections(data);
      } else {
        // Fallback to CSV if database is empty
        loadFromCSV();
      }
    } catch (error) {
      console.error('Error loading connections:', error);
      // Fallback to CSV
      loadFromCSV();
    } finally {
      setLoading(false);
    }
  };

  const loadFromCSV = async () => {
    try {
      const response = await fetch('/data/linkedin_connections.csv');
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        delimiter: ',',
        quoteChar: '"',
        escapeChar: '"',
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('CSV parsing errors:', results.errors);
          }
          
          // Filter out empty rows and rows with all empty values
          const filteredData = results.data.filter((row: any) => {
            // Check if row has any non-empty values
            const hasContent = Object.values(row).some(value => 
              value && typeof value === 'string' && value.trim() !== ''
            );
            return hasContent && row['First Name'] && row['Last Name'];
          });

          // Transform CSV data to match Connection interface
          const transformedData: Connection[] = filteredData.map((row: any) => ({
            id: Math.random(), // Temporary ID for CSV data
            first_name: row['First Name'] || '',
            last_name: row['Last Name'] || '',
            url: row['URL'] || null,
            email_address: row['Email Address'] || null,
            company: row['Company'] || null,
            position: row['Position'] || null,
            connected_on: row['Connected On'] || null,
            location: null,
            latitude: null,
            longitude: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

          setConnections(transformedData);
          setLoading(false);
        },
        error: (error: any) => {
          console.error('Error parsing CSV:', error);
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Error loading CSV:', error);
      setLoading(false);
    }
  };

  const filteredConnections = connections.filter(conn => {
    const companyMatch = !filter.company || 
      conn.company?.toLowerCase().includes(filter.company.toLowerCase());
    const positionMatch = !filter.position || 
      conn.position?.toLowerCase().includes(filter.position.toLowerCase());
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
