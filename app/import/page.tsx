'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';

interface FieldMapping {
  [key: string]: string;
}

const DEFAULT_FIELDS = [
  'First Name',
  'Last Name', 
  'URL',
  'Email Address',
  'Company',
  'Position',
  'Connected On'
];

export default function ImportPage() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadStatus('idle');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ',',
      quoteChar: '"',
      escapeChar: '"',
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
          setUploadStatus('error');
        } else {
          // Filter out empty rows and rows with all empty values
          const filteredData = results.data.filter((row: any) => {
            // Check if row has any non-empty values
            return Object.values(row).some(value => 
              value && typeof value === 'string' && value.trim() !== ''
            );
          });
          
          setCsvData(filteredData);
          
          // Get headers from the first non-empty row
          const firstRow = filteredData[0];
          if (firstRow) {
            const headers = Object.keys(firstRow);
            setCsvHeaders(headers);
            
            // Auto-map fields based on common patterns
            const autoMapping: FieldMapping = {};
            DEFAULT_FIELDS.forEach(defaultField => {
              const matchingHeader = headers.find(header => 
                header.toLowerCase().includes(defaultField.toLowerCase()) ||
                defaultField.toLowerCase().includes(header.toLowerCase())
              );
              if (matchingHeader) {
                autoMapping[defaultField] = matchingHeader;
              }
            });
            setFieldMapping(autoMapping);
          }
          
          setUploadStatus('success');
        }
        setIsProcessing(false);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setUploadStatus('error');
        setIsProcessing(false);
      }
    });
  };

  const handleFieldMappingChange = (defaultField: string, csvField: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [defaultField]: csvField
    }));
  };

  const handleImport = () => {
    // Here you would typically save the mapped data to your database
    console.log('Importing data with mapping:', fieldMapping);
    console.log('Sample data:', csvData.slice(0, 5));
    
    // For now, just show success message
    alert('Data imported successfully! (This is a demo - data would be saved to database)');
  };

  const resetImport = () => {
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMapping({});
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#04090F]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F8F8F8] mb-2">Import LinkedIn Connections</h1>
          <p className="text-[#F8F8F8]/70">
            Upload your LinkedIn connections CSV file and map the fields correctly
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-[#6E6E6E]/5 rounded-lg border border-[#6E6E6E]/20 p-6 mb-8">
          <h2 className="text-xl font-semibold text-[#F8F8F8] mb-4">Upload CSV File</h2>
          
          <div className="border-2 border-dashed border-[#6E6E6E]/30 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {isProcessing ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F8F8F8] mx-auto mb-4"></div>
                <p className="text-[#F8F8F8]/70">Processing CSV file...</p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-4">📁</div>
                <p className="text-[#F8F8F8] mb-2">Drop your CSV file here or click to browse</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-[#F8F8F8] text-[#04090F] rounded-lg font-medium hover:bg-[#F8F8F8]/90 transition-colors"
                >
                  Choose File
                </button>
              </div>
            )}
          </div>

          {uploadStatus === 'success' && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400">✅ CSV file uploaded successfully! {csvData.length} records found.</p>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400">❌ Error uploading CSV file. Please check the file format and try again.</p>
            </div>
          )}
        </div>

        {/* Field Mapping Section */}
        {csvHeaders.length > 0 && (
          <div className="bg-[#6E6E6E]/5 rounded-lg border border-[#6E6E6E]/20 p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#F8F8F8] mb-4">Map Fields</h2>
            <p className="text-[#F8F8F8]/70 mb-6">
              Map your CSV columns to the expected fields. Unmapped fields will be ignored.
            </p>

            <div className="space-y-4">
              {DEFAULT_FIELDS.map(field => (
                <div key={field} className="flex items-center gap-4">
                  <label className="w-32 text-[#F8F8F8] font-medium">
                    {field}:
                  </label>
                  <select
                    value={fieldMapping[field] || ''}
                    onChange={(e) => handleFieldMappingChange(field, e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#6E6E6E]/10 border border-[#6E6E6E]/20 rounded text-[#F8F8F8] focus:outline-none focus:ring-2 focus:ring-[#6E6E6E]/50"
                  >
                    <option value="">-- Select CSV Column --</option>
                    {csvHeaders.map(header => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Preview */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-[#F8F8F8] mb-4">Preview (First 3 Records)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#6E6E6E]/20">
                      {DEFAULT_FIELDS.map(field => (
                        <th key={field} className="text-left py-2 px-3 text-[#F8F8F8]/70">
                          {field}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 3).map((row, index) => (
                      <tr key={index} className="border-b border-[#6E6E6E]/10">
                        {DEFAULT_FIELDS.map(field => (
                          <td key={field} className="py-2 px-3 text-[#F8F8F8]">
                            {fieldMapping[field] ? row[fieldMapping[field]] || 'N/A' : '--'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {csvHeaders.length > 0 && (
          <div className="flex gap-4">
            <button
              onClick={handleImport}
              className="px-6 py-3 bg-[#F8F8F8] text-[#04090F] rounded-lg font-medium hover:bg-[#F8F8F8]/90 transition-colors"
            >
              Import Data
            </button>
            <button
              onClick={resetImport}
              className="px-6 py-3 bg-[#6E6E6E]/20 text-[#F8F8F8] rounded-lg font-medium hover:bg-[#6E6E6E]/30 transition-colors"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
