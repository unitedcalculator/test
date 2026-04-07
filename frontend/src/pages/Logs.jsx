import { useState, useEffect } from 'react';
import { Trash2, Download } from 'lucide-react';
import { logsAPI } from '../services/api';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    slug: '',
    startDate: '',
    endDate: '',
    limit: 50,
    skip: 0,
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (newFilters = null) => {
    try {
      setLoading(true);
      setError('');
      
      // Debug: Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }
      
      const params = newFilters || filters;
      const res = await logsAPI.getLogs({
        ...params,
        limit: params.limit,
        skip: params.skip,
      });
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Fetch logs error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setTimeout(() => window.location.href = '/', 1000);
      } else {
        setError(err.response?.data?.error || 'Failed to load logs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, skip: 0 }));
  };

  const handleApplyFilters = () => {
    fetchLogs();
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all logs? This cannot be undone.')) return;
    try {
      await logsAPI.clearLogs();
      setLogs([]);
      setTotal(0);
      setError('');
    } catch (err) {
      setError('Failed to clear logs');
    }
  };

  const handleDownload = () => {
    const csv = 'IP Address,User-Agent,Type,Bot Name,Timestamp\n' + logs.map(log =>
      `"${log.ipAddress}","${log.userAgent}","${log.detectedType}","${log.botName || '-'}","${new Date(log.timestamp).toISOString()}"`
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logs.csv';
    a.click();
  };

  if (loading && logs.length === 0) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Request Logs</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-8">
        <h3 className="card-header">Filter Logs</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All</option>
              <option value="bot">Bots Only</option>
              <option value="user">Users Only</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">Slug</label>
            <input
              type="text"
              name="slug"
              value={filters.slug}
              onChange={handleFilterChange}
              className="input-field"
              placeholder="Filter by slug"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">From Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">To Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>

          <div className="flex items-end gap-2">
            <button onClick={handleApplyFilters} className="btn-primary flex-1">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Showing {logs.length} of {total} logs
        </p>
        <div className="flex gap-2">
          <button onClick={handleDownload} className="btn-secondary flex items-center gap-2">
            <Download size={18} /> Export CSV
          </button>
          <button onClick={handleClearLogs} className="btn-danger flex items-center gap-2">
            <Trash2 size={18} /> Clear All
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-x-auto">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No logs found</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">IP Address</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Slug</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Bot Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">User-Agent</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs">{log.ipAddress}</td>
                  <td className="py-3 px-4">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">{log.slug}</code>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      log.detectedType === 'bot' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {log.detectedType.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs">{log.botName || '-'}</td>
                  <td className="py-3 px-4 text-xs max-w-xs truncate" title={log.userAgent}>
                    {log.userAgent.substring(0, 50)}...
                  </td>
                  <td className="py-3 px-4 text-xs whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> Each request to your cloaked links is logged here.
          This helps you understand who is accessing your content (bots vs real users).
        </p>
      </div>
    </div>
  );
}

export default Logs;
