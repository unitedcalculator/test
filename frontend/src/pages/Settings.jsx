import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [botUserAgents, setBotUserAgents] = useState('');
  const [botIPs, setBotIPs] = useState('');
  const [verifyingDomain, setVerifyingDomain] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsAPI.getSettings();
      setSettings(res.data);
      setCustomDomain(res.data.customDomain || '');
      setBotUserAgents(res.data.botUserAgents.join('\n'));
      setBotIPs(res.data.botIPs.join('\n'));
    } catch (err) {
      setError('Failed to load settings');
      console.error(err);
    } finally {
      setLoading(false);
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
        customDomain: customDomain.trim(),
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

  const handleVerifyDomain = async () => {
    if (!customDomain.trim()) {
      setError('Please enter a domain first');
      return;
    }

    setVerifyingDomain(true);
    setError('');
    try {
      // Extract domain from URL if it has protocol
      let domainToVerify = customDomain.trim();
      if (domainToVerify.startsWith('https://')) {
        domainToVerify = domainToVerify.replace('https://', '');
      } else if (domainToVerify.startsWith('http://')) {
        domainToVerify = domainToVerify.replace('http://', '');
      }
      // Remove trailing slash if present
      domainToVerify = domainToVerify.replace(/\/$/, '');

      const res = await settingsAPI.verifyDomain(domainToVerify);
      setSettings(prev => ({
        ...prev,
        domainVerificationStatus: res.data.domainVerificationStatus,
        domainVerifiedAt: res.data.domainVerifiedAt,
      }));
      setSuccessMessage('Domain verified successfully! ✓');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorData = err.response?.data;
      setSettings(prev => ({
        ...prev,
        domainVerificationStatus: errorData?.domainVerificationStatus || 'failed',
      }));
      
      // Show detailed error with instructions
      if (errorData?.instructions) {
        setError(errorData.instructions);
      } else {
        setError(errorData?.error || 'Failed to verify domain');
      }
    } finally {
      setVerifyingDomain(false);
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

      {/* Custom Domain Settings */}
      <div className="card mb-8">
        <h3 className="card-header">Custom Domain for Cloaking Links</h3>
        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            const res = await settingsAPI.updateSettings({
              customDomain: customDomain.trim(),
              botUserAgents: settings.botUserAgents,
              botIPs: settings.botIPs,
              ipWhitelist: settings.ipWhitelist,
              ipBlacklist: settings.ipBlacklist,
            });
            setSettings(res.data.settings);
            setSuccessMessage('Custom domain updated successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
          } catch (err) {
            setError(err.response?.data?.error || 'Failed to update domain');
          }
        }} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-700 font-medium">Custom Domain</label>
              {settings?.domainVerificationStatus && (
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  settings.domainVerificationStatus === 'verified' 
                    ? 'bg-green-100 text-green-800' 
                    : settings.domainVerificationStatus === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {settings.domainVerificationStatus === 'verified' && '✓ Verified'}
                  {settings.domainVerificationStatus === 'failed' && '✗ Failed'}
                  {settings.domainVerificationStatus === 'pending' && '⏳ Pending'}
                </span>
              )}
            </div>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="input-field"
              placeholder="yourdomain.com or links.yourdomain.com"
              required
            />
            <small className="text-gray-500 block mt-2">
              Enter your domain <strong>without https://</strong>. Example: <code className="bg-gray-100 px-1">yourdomain.com</code> or <code className="bg-gray-100 px-1">links.yourdomain.com</code>
              <br/><br/>
              Your cloaking links will be accessible at: <code className="bg-gray-100 px-1">{(customDomain.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'yourdomain.com')}/go/slug</code>
            </small>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">
              Save Domain
            </button>
            <button
              type="button"
              onClick={handleVerifyDomain}
              disabled={verifyingDomain || !customDomain.trim()}
              className={`flex-1 px-4 py-2 rounded font-medium transition ${
                verifyingDomain || !customDomain.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {verifyingDomain ? '⏳ Verifying...' : '✓ Verify Domain'}
            </button>
          </div>

          {settings?.domainVerificationStatus === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              <strong>❌ Domain verification failed.</strong>
              <p className="mt-2 mb-3">Please add a TXT verification record to your domain registrar (GoDaddy, Namecheap, etc.):</p>
              <div className="bg-white p-3 rounded border border-red-300 font-mono text-xs mb-3">
                <div><strong>Name/Host:</strong> {customDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')}</div>
                <div><strong>Type:</strong> TXT</div>
                <div><strong>Value:</strong> clk-verify-{localStorage.getItem('userId')}</div>
              </div>
              <p className="text-xs">⏱️ After adding the TXT record, wait 5-10 minutes for DNS propagation, then click "Verify Domain" again.</p>
            </div>
          )}

          {settings?.domainVerificationStatus === 'verified' && (
            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-700">
              <strong>✓ Domain verified!</strong> Your cloaking links are now active on your custom domain.
            </div>
          )}
        </form>
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
