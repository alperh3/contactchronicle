interface Connection {
  [key: string]: any;
  latitude?: number;
  longitude?: number;
  location?: string;
}

interface ConnectionDetailsProps {
  connection: Connection;
}

// Utility function to mask names for privacy
const maskName = (name: string): string => {
  if (!name || name.trim() === '') return '';
  const trimmed = name.trim();
  if (trimmed.length <= 1) return trimmed;
  return trimmed[0] + '*'.repeat(trimmed.length - 1);
};

export default function ConnectionDetails({ connection }: ConnectionDetailsProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (firstName: string | null | undefined, lastName: string | null | undefined) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-[#F8F8F8] to-[#6E6E6E] rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-[#04090F]">
            {getInitials(connection.first_name, connection.last_name)}
          </span>
        </div>
        <h3 className="text-xl font-bold text-[#F8F8F8]">
          {maskName(connection.first_name)} {maskName(connection.last_name)}
        </h3>
        {connection.position && (
          <p className="text-[#F8F8F8]/70 mt-1">{connection.position}</p>
        )}
        {connection.company && (
          <p className="text-[#F8F8F8]/70">{connection.company}</p>
        )}
      </div>

      {/* Connection Info */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-[#F8F8F8]/70 mb-2">Connection Details</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[#F8F8F8]/70">Connected:</span>
              <span className="text-[#F8F8F8]">
                {formatDate(connection.connected_on)}
              </span>
            </div>
            {connection.location && (
              <div className="flex justify-between">
                <span className="text-[#F8F8F8]/70">Location:</span>
                <span className="text-[#F8F8F8]">{connection.location}</span>
              </div>
            )}
            {connection.latitude && connection.longitude && (
              <div className="flex justify-between">
                <span className="text-[#F8F8F8]/70">Coordinates:</span>
                <span className="text-[#F8F8F8] text-xs">
                  {connection.latitude.toFixed(4)}, {connection.longitude.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        {(connection.email_address || connection.url) && (
          <div>
            <h4 className="text-sm font-medium text-[#F8F8F8]/70 mb-2">Contact Information</h4>
            <div className="space-y-2">
              {connection.email_address && (
                <div className="flex items-center gap-2">
                  <span className="text-[#F8F8F8]/70">📧</span>
                  <a
                    href={`mailto:${connection.email_address}`}
                    className="text-[#F8F8F8] hover:text-[#F8F8F8]/70 transition-colors text-sm"
                  >
                    {connection.email_address}
                  </a>
                </div>
              )}
              {connection.url && (
                <div className="flex items-center gap-2">
                  <span className="text-[#F8F8F8]/70">🔗</span>
                  <a
                    href={connection.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#F8F8F8] hover:text-[#F8F8F8]/70 transition-colors text-sm"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Professional Summary */}
        <div>
          <h4 className="text-sm font-medium text-[#F8F8F8]/70 mb-2">Professional Summary</h4>
          <div className="bg-[#6E6E6E]/10 rounded-lg p-3">
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-[#F8F8F8]/70">Company:</span>
                <span className="text-[#F8F8F8] ml-2">
                  {connection.company || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-[#F8F8F8]/70">Position:</span>
                <span className="text-[#F8F8F8] ml-2">
                  {connection.position || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-[#F8F8F8]/70">Connection Date:</span>
                <span className="text-[#F8F8F8] ml-2">
                  {formatDate(connection.connected_on)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-[#6E6E6E]/20">
          <div className="flex gap-2">
            {connection.url && (
              <a
                href={connection.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-[#F8F8F8] text-[#04090F] rounded-lg text-center font-medium hover:bg-[#F8F8F8]/90 transition-colors"
              >
                View LinkedIn
              </a>
            )}
            {connection.email_address && (
              <a
                href={`mailto:${connection.email_address}`}
                className="flex-1 px-4 py-2 bg-[#6E6E6E]/20 text-[#F8F8F8] rounded-lg text-center font-medium hover:bg-[#6E6E6E]/30 transition-colors"
              >
                Send Email
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
