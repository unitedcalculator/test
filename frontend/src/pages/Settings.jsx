import { useState, useEffect, useRef } from 'react';
import { domainsAPI, settingsAPI } from '../services/api';

function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [botUserAgents, setBotUserAgents] = useState('');
  const [botIPs, setBotIPs] = useState('');
  const [domains, setDomains] = useState([]);
  const [domainInput, setDomainInput] = useState('');
  const [addingDomain, setAddingDomain] = useState(false);
  const [pollingDomain, setPollingDomain] = useState(null);
  const pollRef = useRef({ timer: null, startedAt: null, domain: null });

  useEffect(() => {
    fetchSettings();
    fetchDomains();
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current.timer) clearInterval(pollRef.current.timer);
    };
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsAPI.getSettings();
      setSettings(res.data);
      setBotUserAgents(res.data.botUserAgents.join('\n'));
      setBotIPs(res.data.botIPs.join('\n'));
    } catch (err) {
      setError('Failed to load settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const normalizeDomain = (value) => {
    let d = (value || '').trim();
    d = d.replace(/^https?:\/\//, '');
    d = d.replace(/\/.*$/, '');
    d = d.replace(/\.$/, '');
    return d.toLowerCase();
  };

  const fetchDomains = async () => {
    try {
      const res = await domainsAPI.list();
      setDomains(res.data || []);
    } catch (err) {
      // Don't block settings page if domain endpoints are unavailable yet
      console.error('Failed to load domains:', err);
    }
  };

  const startPolling = (domain) => {
    const d = normalizeDomain(domain);
    if (!d) return;

    // clear any existing poll
    if (pollRef.current.timer) clearInterval(pollRef.current.timer);

    pollRef.current = { timer: null, startedAt: Date.now(), domain: d };
    setPollingDomain(d);

    const run = async () => {
      const elapsed = Date.now() - pollRef.current.startedAt;
      const maxMs = 10 * 60 * 1000; // 10 minutes
      if (elapsed > maxMs) {
        if (pollRef.current.timer) clearInterval(pollRef.current.timer);
        pollRef.current.timer = null;
        setPollingDomain(null);
        return;
      }

      try {
        await domainsAPI.poll(d);
      } catch (err) {
        // keep polling; DNS can fail intermittently
      } finally {
        fetchDomains();
      }
    };

    // run immediately, then every 30s
    run();
    pollRef.current.timer = setInterval(run, 30000);
  };

  const stopPolling = () => {
    if (pollRef.current.timer) clearInterval(pollRef.current.timer);
    pollRef.current = { timer: null, startedAt: null, domain: null };
    setPollingDomain(null);
  };

  const handleAddDomain = async () => {
    const d = normalizeDomain(domainInput);
    if (!d) {
      setError('Please enter a domain');
      return;
    }

    setAddingDomain(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await domainsAPI.add(d);
      setSuccessMessage(res.data?.message || 'Domain added');
      setDomainInput('');
      await fetchDomains();
      // auto-poll if not verified yet
      if (!res.data?.verified) startPolling(d);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to add domain');
    } finally {
      setAddingDomain(false);
    }
  };

  const handleToggleCloaking = async () => {
    try {
      const res = await settingsAPI.toggleCloaking();
      setSuccessMessage(res.data.message);
      setSettings(prev => ({ ...prev, cloakingEnabled: res.data.cloakingEnabled }));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to toggle cloaking');
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      const botAgents = botUserAgents.split('\n').filter(s => s.trim());
      const botIPList = botIPs.split('\n').filter(s => s.trim());

      const res = await settingsAPI.updateSettings({
        botUserAgents: botAgents,
        botIPs: botIPList,
        ipWhitelist: settings.ipWhitelist,
        ipBlacklist: settings.ipBlacklist,
      });

      setSettings(res.data.settings);
      setSuccessMessage('Settings updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update settings');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Settings</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <div className="whitespace-pre-wrap font-mono text-sm">{error}</div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Global Cloaking Toggle */}
      <div className="card mb-8">
        <h3 className="card-header">Global Cloaking Control</h3>
        <p className="text-gray-600 mb-6">
          {settings.cloakingEnabled ? 'Cloaking is currently ENABLED' : 'Cloaking is currently DISABLED'}
        </p>
        <button
          onClick={handleToggleCloaking}
          className={settings.cloakingEnabled ? 'btn-danger' : 'btn-primary'}
        >
          {settings.cloakingEnabled ? 'Disable Cloaking' : 'Enable Cloaking'}
        </button>
      </div>

      {/* Domain Management (Nameserver verification) */}
      <div className="card mb-8">
        <h3 className="card-header">Domain Management (Nameserver Verification)</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Add your domain, then set its nameservers to the ones shown. We’ll auto-check every 30 seconds for up to 10 minutes.
        </p>

        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            className="input-field flex-1"
            placeholder="clientdomain.com"
          />
          <button
            type="button"
            onClick={handleAddDomain}
            className="btn-primary"
            disabled={addingDomain || !domainInput.trim()}
          >
            {addingDomain ? 'Adding...' : 'Add Domain'}
          </button>
        </div>

        {pollingDomain && (
          <div className="mb-4 flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
            <div className="text-yellow-800">
              Auto-checking <span className="font-mono">{pollingDomain}</span> every 30s (max 10 min)…
            </div>
            <button type="button" onClick={stopPolling} className="btn-secondary text-xs px-3 py-1">
              Stop
            </button>
          </div>
        )}

        {domains.length === 0 ? (
          <div className="text-gray-500 text-sm">No domains added yet.</div>
        ) : (
          <div className="space-y-3">
            {domains.map((d) => (
              <div key={d.id} className="border rounded p-3 bg-white">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-gray-800">{d.domain_name}</div>
                  <div
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      d.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {d.verified ? '✅ Verified' : '⏳ Pending'}
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-700">
                  <div className="font-medium mb-1">Expected nameservers</div>
                  <div className="font-mono text-xs">
                    {(d.nameservers_expected || []).length ? (d.nameservers_expected || []).join(', ') : 'Not configured on server'
                    }
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-700">
                  <div className="font-medium mb-1">Current nameservers</div>
                  <div className="font-mono text-xs">
                    {(d.nameservers_current || []).length ? (d.nameservers_current || []).join(', ') : '—'}
                  </div>
                </div>

                {!d.verified && (
                  <div className="mt-3 flex gap-2">
                    <button type="button" className="btn-primary text-xs px-3 py-2" onClick={() => startPolling(d.domain_name)}>
                      Verify / Poll
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bot Detection Rules */}
      <div className="card mb-8">
        <h3 className="card-header">Bot Detection Configuration</h3>
        <p className="text-gray-600 mb-6 text-sm">
          Edit the User-Agent strings and IP patterns that identify requests as bots.
          One item per line.
        </p>

        <form onSubmit={handleUpdateSettings} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Bot User-Agent Strings</label>
            <textarea
              value={botUserAgents}
              onChange={(e) => setBotUserAgents(e.target.value)}
              className="input-field font-mono text-sm"
              placeholder="Googlebot&#10;Bingbot&#10;Slurp"
              rows="8"
            />
            <small className="text-gray-500 block mt-2">
              These strings are checked against the User-Agent header to detect bots
            </small>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Bot IP Patterns</label>
            <textarea
              value={botIPs}
              onChange={(e) => setBotIPs(e.target.value)}
              className="input-field font-mono text-sm"
              placeholder="66.249&#10;207.241&#10;202.97"
              rows="8"
            />
            <small className="text-gray-500 block mt-2">
              These IP patterns are used to detect bot IPs. Enter partial IPs for ranges (e.g., '66.249' matches 66.249.x.x)
            </small>
          </div>

          <button type="submit" className="btn-primary">
            Save Settings
          </button>
        </form>
      </div>
 
    </div>
  );
}

export default Settings;
