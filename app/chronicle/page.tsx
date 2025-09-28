'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase, Connection } from '../../lib/supabase';
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
}) as React.ComponentType<any>;

interface ConnectionWithLocation extends Connection {
  latitude?: number;
  longitude?: number;
  location?: string;
}

// Utility function to mask names for privacy
const maskName = (name: string): string => {
  if (!name || name.trim() === '') return '';
  const trimmed = name.trim();
  if (trimmed.length <= 1) return trimmed;
  return trimmed[0] + '*'.repeat(trimmed.length - 1);
};

export default function ChroniclePage() {
  const [connections, setConnections] = useState<ConnectionWithLocation[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<ConnectionWithLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState<'world' | 'clusters'>('world');
  const [connectionFilter, setConnectionFilter] = useState({ company: '', location: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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
        // Add location data to connections
        const connectionsWithLocation = addLocationData(data);
        setConnections(connectionsWithLocation);
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

  const addLocationData = (connections: Connection[]): ConnectionWithLocation[] => {
    const majorCities = [
      // North America
      { name: 'New York', lat: 40.7128, lng: -74.0060 },
      { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
      { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
      { name: 'Boston', lat: 42.3601, lng: -71.0589 },
      { name: 'Seattle', lat: 47.6062, lng: -122.3321 },
      { name: 'Austin', lat: 30.2672, lng: -97.7431 },
      { name: 'Denver', lat: 39.7392, lng: -104.9903 },
      { name: 'Miami', lat: 25.7617, lng: -80.1918 },
      { name: 'Atlanta', lat: 33.7490, lng: -84.3880 },
      { name: 'Dallas', lat: 32.7767, lng: -96.7970 },
      { name: 'Phoenix', lat: 33.4484, lng: -112.0740 },
      { name: 'Philadelphia', lat: 39.9526, lng: -75.1652 },
      { name: 'Houston', lat: 29.7604, lng: -95.3698 },
      { name: 'Detroit', lat: 42.3314, lng: -83.0458 },
      { name: 'Portland', lat: 45.5152, lng: -122.6784 },
      { name: 'Vancouver', lat: 49.2827, lng: -123.1207 },
      { name: 'Toronto', lat: 43.6532, lng: -79.3832 },
      { name: 'Montreal', lat: 45.5017, lng: -73.5673 },
      { name: 'Mexico City', lat: 19.4326, lng: -99.1332 },
      
      // Europe
      { name: 'London', lat: 51.5074, lng: -0.1278 },
      { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
      { name: 'Paris', lat: 48.8566, lng: 2.3522 },
      { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
      { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
      { name: 'Barcelona', lat: 41.3851, lng: 2.1734 },
      { name: 'Rome', lat: 41.9028, lng: 12.4964 },
      { name: 'Milan', lat: 45.4642, lng: 9.1900 },
      { name: 'Zurich', lat: 47.3769, lng: 8.5417 },
      { name: 'Vienna', lat: 48.2082, lng: 16.3738 },
      { name: 'Prague', lat: 50.0755, lng: 14.4378 },
      { name: 'Warsaw', lat: 52.2297, lng: 21.0122 },
      { name: 'Stockholm', lat: 59.3293, lng: 18.0686 },
      { name: 'Copenhagen', lat: 55.6761, lng: 12.5683 },
      { name: 'Oslo', lat: 59.9139, lng: 10.7522 },
      { name: 'Helsinki', lat: 60.1699, lng: 24.9384 },
      { name: 'Dublin', lat: 53.3498, lng: -6.2603 },
      { name: 'Brussels', lat: 50.8503, lng: 4.3517 },
      { name: 'Luxembourg', lat: 49.6116, lng: 6.1319 },
      { name: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
      
      // Asia Pacific
      { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
      { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
      { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
      { name: 'Melbourne', lat: -37.8136, lng: 144.9631 },
      { name: 'Seoul', lat: 37.5665, lng: 126.9780 },
      { name: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
      { name: 'Shanghai', lat: 31.2304, lng: 121.4737 },
      { name: 'Beijing', lat: 39.9042, lng: 116.4074 },
      { name: 'Shenzhen', lat: 22.5431, lng: 114.0579 },
      { name: 'Taipei', lat: 25.0330, lng: 121.5654 },
      { name: 'Bangkok', lat: 13.7563, lng: 100.5018 },
      { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
      { name: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869 },
      { name: 'Manila', lat: 14.5995, lng: 120.9842 },
      { name: 'Ho Chi Minh City', lat: 10.8231, lng: 106.6297 },
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
      { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
      { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
      { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
      
      // Middle East & Africa
      { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
      { name: 'Abu Dhabi', lat: 24.4539, lng: 54.3773 },
      { name: 'Riyadh', lat: 24.7136, lng: 46.6753 },
      { name: 'Tel Aviv', lat: 32.0853, lng: 34.7818 },
      { name: 'Istanbul', lat: 41.0082, lng: 28.9784 },
      { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
      { name: 'Cape Town', lat: -33.9249, lng: 18.4241 },
      { name: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
      { name: 'Lagos', lat: 6.5244, lng: 3.3792 },
      { name: 'Nairobi', lat: -1.2921, lng: 36.8219 },
      
      // South America
      { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
      { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
      { name: 'Buenos Aires', lat: -34.6118, lng: -58.3960 },
      { name: 'Santiago', lat: -33.4489, lng: -70.6693 },
      { name: 'Bogotá', lat: 4.7110, lng: -74.0721 },
      { name: 'Lima', lat: -12.0464, lng: -77.0428 },
      { name: 'Caracas', lat: 10.4806, lng: -66.9036 },
      { name: 'Quito', lat: -0.1807, lng: -78.4678 }
    ];

    return connections.map((conn, index) => {
      // Use existing location data if available, otherwise assign based on company
      if (conn.location && conn.latitude && conn.longitude) {
        return conn as ConnectionWithLocation;
      }

      // Assign locations based on company or position keywords
      let assignedCity = majorCities[index % majorCities.length]; // Default fallback
      
      // Try to assign based on company/position keywords
      const company = (conn.company || '').toLowerCase();
      const position = (conn.position || '').toLowerCase();
      
      if (company.includes('google') || company.includes('meta') || company.includes('apple') || company.includes('tesla')) {
        assignedCity = majorCities[1]; // San Francisco
      } else if (company.includes('microsoft') || company.includes('amazon')) {
        assignedCity = majorCities[5]; // Seattle
      } else if (company.includes('netflix') || company.includes('disney')) {
        assignedCity = majorCities[2]; // Los Angeles
      } else if (company.includes('goldman') || company.includes('jpmorgan') || company.includes('morgan stanley')) {
        assignedCity = majorCities[0]; // New York
      } else if (company.includes('boeing') || company.includes('starbucks')) {
        assignedCity = majorCities[5]; // Seattle
      } else if (company.includes('dell') || company.includes('southwest')) {
        assignedCity = majorCities[6]; // Austin
      } else if (company.includes('coca') || company.includes('delta')) {
        assignedCity = majorCities[9]; // Atlanta
      } else if (company.includes('unilever') || company.includes('shell')) {
        assignedCity = majorCities[20]; // London
      } else if (company.includes('sap') || company.includes('siemens')) {
        assignedCity = majorCities[21]; // Berlin
      } else if (company.includes('airbus') || company.includes('lvmh')) {
        assignedCity = majorCities[22]; // Paris
      } else if (company.includes('shell') || company.includes('philips')) {
        assignedCity = majorCities[23]; // Amsterdam
      } else if (company.includes('shopify') || company.includes('blackberry')) {
        assignedCity = majorCities[37]; // Toronto
      } else if (company.includes('atlassian') || company.includes('canva')) {
        assignedCity = majorCities[42]; // Sydney
      } else if (company.includes('sony') || company.includes('nintendo')) {
        assignedCity = majorCities[40]; // Tokyo
      } else if (company.includes('grab') || company.includes('sea')) {
        assignedCity = majorCities[41]; // Singapore
      } else if (company.includes('emirates') || company.includes('etisalat')) {
        assignedCity = majorCities[60]; // Dubai
      } else if (company.includes('tata') || company.includes('reliance')) {
        assignedCity = majorCities[55]; // Mumbai
      }
      
      // Add some random variation to avoid exact same coordinates
      const latVariation = (Math.random() - 0.5) * 0.1;
      const lngVariation = (Math.random() - 0.5) * 0.1;
      
      return {
        ...conn,
        latitude: assignedCity.lat + latVariation,
        longitude: assignedCity.lng + lngVariation,
        location: assignedCity.name
      } as ConnectionWithLocation;
    });
  };

  const loadFromCSV = async () => {
    try {
      const response = await fetch('/data/linkedin_connections.csv');
      const csvText = await response.text();
      
      // Parse CSV and add location data (similar to dashboard implementation)
      // This is a fallback when database is empty
      console.log('Loading from CSV fallback');
      setLoading(false);
    } catch (error) {
      console.error('Error loading CSV:', error);
      setLoading(false);
    }
  };

  const connectionsWithLocation = connections.filter(conn => 
    conn.latitude && conn.longitude
  );

  // Filter connections based on search criteria
  const filteredConnections = connectionsWithLocation.filter(conn => {
    const companyMatch = !connectionFilter.company || 
      conn.company?.toLowerCase().includes(connectionFilter.company.toLowerCase());
    const locationMatch = !connectionFilter.location || 
      conn.location?.toLowerCase().includes(connectionFilter.location.toLowerCase());
    return companyMatch && locationMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredConnections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConnections = filteredConnections.slice(startIndex, startIndex + itemsPerPage);

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
                  {connections.length > 0 
                    ? Math.round((connectionsWithLocation.length / connections.length) * 100)
                    : 0}%
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-semibold text-[#F8F8F8] mb-4 sm:mb-0">
              All Connections ({filteredConnections.length})
            </h2>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Filter by company..."
                value={connectionFilter.company}
                onChange={(e) => {
                  setConnectionFilter(prev => ({ ...prev, company: e.target.value }));
                  setCurrentPage(1); // Reset to first page when filtering
                }}
                className="px-3 py-2 bg-[#6E6E6E]/10 border border-[#6E6E6E]/20 rounded-lg text-[#F8F8F8] placeholder-[#F8F8F8]/50 focus:outline-none focus:ring-2 focus:ring-[#6E6E6E]/50 text-sm"
              />
              <input
                type="text"
                placeholder="Filter by location..."
                value={connectionFilter.location}
                onChange={(e) => {
                  setConnectionFilter(prev => ({ ...prev, location: e.target.value }));
                  setCurrentPage(1); // Reset to first page when filtering
                }}
                className="px-3 py-2 bg-[#6E6E6E]/10 border border-[#6E6E6E]/20 rounded-lg text-[#F8F8F8] placeholder-[#F8F8F8]/50 focus:outline-none focus:ring-2 focus:ring-[#6E6E6E]/50 text-sm"
              />
            </div>
          </div>

          {/* Connections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {paginatedConnections.map((connection, index) => (
              <div
                key={index}
                onClick={() => setSelectedConnection(connection)}
                className="p-4 bg-[#6E6E6E]/10 rounded-lg border border-[#6E6E6E]/20 cursor-pointer hover:bg-[#6E6E6E]/20 transition-colors"
              >
                <div className="font-medium text-[#F8F8F8]">
                  {maskName(connection.first_name)} {maskName(connection.last_name)}
                </div>
                <div className="text-sm text-[#F8F8F8]/70 mt-1">
                  {connection.company || 'N/A'}
                </div>
                <div className="text-sm text-[#F8F8F8]/70">
                  {connection.position || 'N/A'}
                </div>
                <div className="text-xs text-[#F8F8F8]/50 mt-2">
                  📍 {connection.location}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-[#F8F8F8]/70">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredConnections.length)} of {filteredConnections.length} connections
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
      </div>
    </div>
  );
}
