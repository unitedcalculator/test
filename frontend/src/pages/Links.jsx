import { useState, useEffect } from 'react';
import { Trash2, Edit2, Copy, Plus } from 'lucide-react';
import { linksAPI, settingsAPI } from '../services/api';

function Links() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [formData, setFormData] = useState({
    slug: '',
    botUrl: '',
    userUrl: '',
    title: '',
    description: '',
  });

  useEffect(() => {
    fetchSettings();
    fetchLinks();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsAPI.getSettings();
      setCustomDomain(res.data.customDomain || '');
    } catch (err) {
      console.error('Error fetching settings:', err);
      // Continue without custom domain
    }
  };

  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expired. Please login again.');
        return;
      }

      const res = await linksAPI.getAllLinks();
      setLinks(res.data);
    } catch (err) {
      console.error('Fetch links error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setTimeout(() => window.location.href = '/', 1000);
      } else {
        setError(err.response?.data?.error || 'Failed to load links');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSlug) {
        await linksAPI.updateLink(editingSlug, formData);
      } else {
        await linksAPI.createLink(formData);
      }
      setShowForm(false);
      setEditingSlug(null);
      setFormData({ slug: '', botUrl: '', userUrl: '', title: '', description: '' });
      fetchLinks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save link');
    }
  };

  const handleEdit = (link) => {
    setFormData(link);
    setEditingSlug(link.slug);
    setShowForm(true);
  };

  const handleDelete = async (slug) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;
    try {
      await linksAPI.deleteLink(slug);
      fetchLinks();
    } catch (err) {
      setError('Failed to delete link');
    }
  };

  const handleCopyLink = (slug) => {
    const baseUrl = customDomain || (import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    const url = `${baseUrl}/go/${slug}`;
    navigator.clipboard.writeText(url);
    alert(`Link copied: ${url}`);
  };

  const getCloakingUrl = (slug) => {
    const baseUrl = customDomain || (import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    return `${baseUrl}/go/${slug}`;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Cloaked Links</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingSlug(null);
            setFormData({ slug: '', botUrl: '', userUrl: '', title: '', description: '' });
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Create Link
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="card mb-8">
          <h3 className="card-header">{editingSlug ? 'Edit Link' : 'Create New Link'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="product-name"
                  disabled={!!editingSlug}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Link title"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Bot URL (SEO Content)</label>
              <input
                type="url"
                name="botUrl"
                value={formData.botUrl}
                onChange={handleInputChange}
                className="input-field"
                placeholder="https://example.com/seo-content"
                required
              />
              <small className="text-gray-500">URL served to search engine bots</small>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">User URL (Redirect)</label>
              <input
                type="url"
                name="userUrl"
                value={formData.userUrl}
                onChange={handleInputChange}
                className="input-field"
                placeholder="https://redirect.com"
                required
              />
              <small className="text-gray-500">URL users are redirected to</small>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Link description"
                rows="3"
              />
            </div>

            <div className="flex gap-4">
              <button type="submit" className="btn-primary">
                {editingSlug ? 'Update Link' : 'Create Link'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingSlug(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Links Table */}
      <div className="card overflow-x-auto">
        {links.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No links created yet</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Slug</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Clicks</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Bot/User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map(link => (
                <tr key={link._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <a 
                      href={getCloakingUrl(link.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-100 px-2 py-1 rounded text-sm text-blue-600 hover:text-blue-800 hover:bg-gray-200 cursor-pointer inline-block"
                      title="Open cloaking link in new tab"
                    >
                      <code>{link.slug}</code>
                    </a>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold">{link.title}</p>
                      <p className="text-xs text-gray-500 mt-1">Bot: {link.botUrl}</p>
                      <p className="text-xs text-gray-500">User: {link.userUrl}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-blue-600">{link.clicks}</span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className="text-red-600 font-semibold">{link.botClicks}</span>
                    <span className="text-gray-400"> / </span>
                    <span className="text-green-600 font-semibold">{link.userClicks}</span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button
                      onClick={() => handleCopyLink(link.slug)}
                      title="Copy link"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded"
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(link)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(link.slug)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm mb-3">
          <strong>💾 Your Cloaking Links:</strong>
          {customDomain && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Using custom domain: {customDomain}
            </span>
          )}
        </p>
        {links.length === 0 ? (
          <p className="text-yellow-700 text-sm">No links created yet. Create one above to get started!</p>
        ) : (
          <div className="space-y-2">
            {links.map(link => (
              <div key={link._id} className="flex items-center justify-between bg-white p-2 rounded border border-yellow-200">
                <code className="text-sm text-blue-600 break-all">
                  {getCloakingUrl(link.slug)}
                </code>
                <button
                  onClick={() => handleCopyLink(link.slug)}
                  className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Links;
