'use client';

import { useState } from 'react';

interface Connection {
  [key: string]: string;
}

interface ConnectionsTableProps {
  connections: Connection[];
}

export default function ConnectionsTable({ connections }: ConnectionsTableProps) {
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedConnections = [...connections].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const totalPages = Math.ceil(sortedConnections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConnections = sortedConnections.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return <span className="text-[#F8F8F8]/30">↕</span>;
    }
    return sortDirection === 'asc' ? 
      <span className="text-[#F8F8F8]">↑</span> : 
      <span className="text-[#F8F8F8]">↓</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#6E6E6E]/20">
            <th 
              className="text-left py-3 px-4 font-medium text-[#F8F8F8] cursor-pointer hover:bg-[#6E6E6E]/10 transition-colors"
              onClick={() => handleSort('First Name')}
            >
              <div className="flex items-center gap-2">
                Name
                <SortIcon field="First Name" />
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 font-medium text-[#F8F8F8] cursor-pointer hover:bg-[#6E6E6E]/10 transition-colors"
              onClick={() => handleSort('Company')}
            >
              <div className="flex items-center gap-2">
                Company
                <SortIcon field="Company" />
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 font-medium text-[#F8F8F8] cursor-pointer hover:bg-[#6E6E6E]/10 transition-colors"
              onClick={() => handleSort('Position')}
            >
              <div className="flex items-center gap-2">
                Position
                <SortIcon field="Position" />
              </div>
            </th>
            <th 
              className="text-left py-3 px-4 font-medium text-[#F8F8F8] cursor-pointer hover:bg-[#6E6E6E]/10 transition-colors"
              onClick={() => handleSort('Connected On')}
            >
              <div className="flex items-center gap-2">
                Connected On
                <SortIcon field="Connected On" />
              </div>
            </th>
            <th className="text-left py-3 px-4 font-medium text-[#F8F8F8]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedConnections.map((connection, index) => (
            <tr 
              key={index} 
              className="border-b border-[#6E6E6E]/10 hover:bg-[#6E6E6E]/5 transition-colors"
            >
              <td className="py-3 px-4 text-[#F8F8F8]">
                <div>
                  <div className="font-medium">
                    {connection['First Name']} {connection['Last Name']}
                  </div>
                  {connection['Email Address'] && (
                    <div className="text-sm text-[#F8F8F8]/70">
                      {connection['Email Address']}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-[#F8F8F8]">
                {connection['Company'] || 'N/A'}
              </td>
              <td className="py-3 px-4 text-[#F8F8F8]">
                {connection['Position'] || 'N/A'}
              </td>
              <td className="py-3 px-4 text-[#F8F8F8]">
                {formatDate(connection['Connected On'])}
              </td>
              <td className="py-3 px-4">
                {connection['URL'] && (
                  <a
                    href={connection['URL']}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#F8F8F8]/70 hover:text-[#F8F8F8] transition-colors"
                  >
                    View Profile
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-[#F8F8F8]/70">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedConnections.length)} of {sortedConnections.length} connections
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-[#6E6E6E]/10 border border-[#6E6E6E]/20 rounded text-[#F8F8F8] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#6E6E6E]/20 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-[#F8F8F8]/70">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-[#6E6E6E]/10 border border-[#6E6E6E]/20 rounded text-[#F8F8F8] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#6E6E6E]/20 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
