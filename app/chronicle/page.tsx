'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Papa from 'papaparse';
import ConnectionMap from '../components/ConnectionMap';
import ConnectionDetails from '../components/ConnectionDetails';

// Dynamically import the map component to avoid SSR issues
const DynamicMap = dynamic(() => import('../components/ConnectionMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-[#6E6E6E]/10 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F8F8F8] mx-auto mb-4"></div>
        <p className="text-[#F8F8F8]/70">Loading map...</p>
      </div>
    </div>
  )
});

interface Connection {
  [key: string]: string;
}

interface ConnectionWithLocation extends Connection {
  latitude?: number;
  longitude?: number;
  location?: string;
  [key: string]: any;
}

export default function ChroniclePage() {
  const [connections, setConnections] = useState<ConnectionWithLocation[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<ConnectionWithLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState<'world' | 'clusters'>('world');

  useEffect(() => {
    // Load connections data
    fetch('/data/linkedin_connections.csv')
      .then(response => response.text())
      .then(csvText => {
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

            // Add mock location data for demo purposes
            // In a real app, this would be scraped from LinkedIn profiles
            const connectionsWithLocation = filteredData.map((conn: any, index: number) => ({
              ...conn,
              latitude: 40.7128 + (Math.random() - 0.5) * 10, // Random around NYC
              longitude: -74.0060 + (Math.random() - 0.5) * 10,
              location: `Location ${index + 1}` // Mock location
            }));

            setConnections(connectionsWithLocation);
            setLoading(false);
          },
          error: (error: any) => {
            console.error('Error parsing CSV:', error);
            setLoading(false);
          }
        });
      })
      .catch(error => {
        console.error('Error loading connections:', error);
        setLoading(false);
      });
  }, []);

  const connectionsWithLocation = connections.filter(conn => 
    conn.latitude && conn.longitude
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F8F8F8] mx-auto mb-4"></div>
          <p className="text-[#F8F8F8]/70">Loading your network chronicle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04090F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F8F8F8] mb-2">View Chronicle</h1>
          <p className="text-[#F8F8F8]/70">
            Explore your professional network across the globe
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#6E6E6E]/5 rounded-lg border border-[#6E6E6E]/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#F8F8F8]/70 text-sm font-medium mb-1">Total Connections</p>
                <p className="text-2xl font-bold text-[#F8F8F8]">{connections.length}</p>
              </div>
              <div className="text-3xl opacity-80">👥</div>
            </div>
          </div>
          
          <div className="bg-[#6E6E6E]/5 rounded-lg border border-[#6E6E6E]/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#F8F8F8]/70 text-sm font-medium mb-1">With Location</p>
                <p className="text-2xl font-bold text-[#F8F8F8]">{connectionsWithLocation.length}</p>
              </div>
              <div className="text-3xl opacity-80">📍</div>
            </div>
          </div>
          
          <div className="bg-[#6E6E6E]/5 rounded-lg border border-[#6E6E6E]/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#F8F8F8]/70 text-sm font-medium mb-1">Coverage</p>
                <p className="text-2xl font-bold text-[#F8F8F8]">
                  {Math.round((connectionsWithLocation.length / connections.length) * 100)}%
                </p>
              </div>
              <div className="text-3xl opacity-80">🌍</div>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setMapView('world')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mapView === 'world'
                  ? 'bg-[#F8F8F8] text-[#04090F]'
                  : 'bg-[#6E6E6E]/10 text-[#F8F8F8] hover:bg-[#6E6E6E]/20'
              }`}
            >
              World View
            </button>
            <button
              onClick={() => setMapView('clusters')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mapView === 'clusters'
                  ? 'bg-[#F8F8F8] text-[#04090F]'
                  : 'bg-[#6E6E6E]/10 text-[#F8F8F8] hover:bg-[#6E6E6E]/20'
              }`}
            >
              Clusters
            </button>
          </div>
          
          <div className="text-sm text-[#F8F8F8]/70">
            Click on markers to view connection details
          </div>
        </div>

        {/* Map and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-[#6E6E6E]/5 rounded-lg border border-[#6E6E6E]/20 p-6">
              <h2 className="text-xl font-semibold text-[#F8F8F8] mb-4">
                Network Map
              </h2>
              <div className="h-96">
                <DynamicMap
                  connections={connectionsWithLocation}
                  onConnectionSelect={setSelectedConnection}
                  viewMode={mapView}
                />
              </div>
            </div>
          </div>

          {/* Connection Details */}
          <div className="lg:col-span-1">
            <div className="bg-[#6E6E6E]/5 rounded-lg border border-[#6E6E6E]/20 p-6">
              <h2 className="text-xl font-semibold text-[#F8F8F8] mb-4">
                Connection Details
              </h2>
              {selectedConnection ? (
                <ConnectionDetails connection={selectedConnection} />
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4 opacity-50">👆</div>
                  <p className="text-[#F8F8F8]/70">
                    Select a connection on the map to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connection List */}
        <div className="mt-8 bg-[#6E6E6E]/5 rounded-lg border border-[#6E6E6E]/20 p-6">
          <h2 className="text-xl font-semibold text-[#F8F8F8] mb-4">
            All Connections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectionsWithLocation.slice(0, 12).map((connection, index) => (
              <div
                key={index}
                onClick={() => setSelectedConnection(connection)}
                className="p-4 bg-[#6E6E6E]/10 rounded-lg border border-[#6E6E6E]/20 cursor-pointer hover:bg-[#6E6E6E]/20 transition-colors"
              >
                <div className="font-medium text-[#F8F8F8]">
                  {connection['First Name']} {connection['Last Name']}
                </div>
                <div className="text-sm text-[#F8F8F8]/70 mt-1">
                  {connection['Company'] || 'N/A'}
                </div>
                <div className="text-sm text-[#F8F8F8]/70">
                  {connection['Position'] || 'N/A'}
                </div>
                <div className="text-xs text-[#F8F8F8]/50 mt-2">
                  📍 {connection.location}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
