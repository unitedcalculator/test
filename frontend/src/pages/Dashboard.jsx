import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { linksAPI, logsAPI } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [logStats, setLogStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Debug: Check for token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expired. Please login again.');
        return;
      }

      const [linksRes, logsRes] = await Promise.all([
        linksAPI.getStats(),
        logsAPI.getStats(),
      ]);

      setStats(linksRes.data);
      setLogStats(logsRes.data);
    } catch (err) {
      console.error('Fetch stats error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setTimeout(() => window.location.href = '/', 1000);
      } else {
        setError(err.response?.data?.error || 'Failed to load statistics');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const pieData = logStats ? [
    { name: 'Bots', value: logStats.bot },
    { name: 'Users', value: logStats.user },
  ] : [];

  const COLORS = ['#FF6B6B', '#4ECDC4'];

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <p className="text-gray-600 text-sm font-medium">Total Clicks</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">{stats?.totalClicks || 0}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm font-medium">Bot Clicks</p>
          <p className="text-4xl font-bold text-red-600 mt-2">{stats?.totalBotClicks || 0}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm font-medium">User Clicks</p>
          <p className="text-4xl font-bold text-green-600 mt-2">{stats?.totalUserClicks || 0}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm font-medium">Total Links</p>
          <p className="text-4xl font-bold text-purple-600 mt-2">{stats?.totalLinks || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bot vs User Distribution */}
        {logStats && (logStats.bot > 0 || logStats.user > 0) && (
          <div className="card">
            <h3 className="card-header">Bot vs User Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Click Statistics */}
        {stats && (
          <div className="card">
            <h3 className="card-header">Click Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[stats]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalBotClicks" stackId="a" fill="#FF6B6B" />
                <Bar dataKey="totalUserClicks" stackId="a" fill="#4ECDC4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div> 
    </div>
  );
}

export default Dashboard;
