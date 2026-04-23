import Domain from '../models/Domain.js';
import {
  getExpectedNameserversFromEnv,
  normalizeDomainNameForStorage,
  verifyDomainNameservers,
} from '../utils/nameserverVerification.js';

function apiShape(result) {
  return {
    verified: !!result.verified,
    expected: result.expected || [],
    current: result.current || [],
    message: result.message || '',
    domain: result.domain,
  };
}

export async function addDomain(req, res) {
  const { domain } = req.body || {};
  const userId = req.userId;

  if (!domain) return res.status(400).json({ error: 'Domain is required' });
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const domainName = normalizeDomainNameForStorage(domain);
  const expected = getExpectedNameserversFromEnv();

  try {
    const verification = await verifyDomainNameservers(domainName, { expectedNameservers: expected, timeoutMs: 8000 });

    const doc = await Domain.findOneAndUpdate(
      { userId, domainName: verification.domain },
      {
        $setOnInsert: { userId, domainName: verification.domain },
        $set: {
          verified: !!verification.verified,
          nameserversExpected: verification.expected,
          nameserversCurrent: verification.current,
        },
      },
      { new: true, upsert: true }
    );

    return res.status(201).json({
      ...apiShape(verification),
      id: doc._id,
      instructions: `Set your domain nameservers to: ${verification.expected.join(', ')}`,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add domain', details: err?.message || String(err) });
  }
}

export async function listDomains(req, res) {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const domains = await Domain.find({ userId }).sort({ updated_at: -1, created_at: -1 });
  res.json(
    domains.map((d) => ({
      id: d._id,
      domain_name: d.domainName,
      verified: d.verified,
      nameservers_expected: d.nameserversExpected,
      nameservers_current: d.nameserversCurrent,
      created_at: d.created_at,
      updated_at: d.updated_at,
    }))
  );
}

export async function verifyDomain(req, res) {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const domainParam = req.params.domain;
  const domainName = normalizeDomainNameForStorage(domainParam);
  const expected = getExpectedNameserversFromEnv();

  const existing = await Domain.findOne({ userId, domainName });
  if (!existing) return res.status(404).json({ error: 'Domain not found' });

  const verification = await verifyDomainNameservers(domainName, { expectedNameservers: expected, timeoutMs: 8000 });

  existing.verified = !!verification.verified;
  existing.nameserversExpected = verification.expected;
  existing.nameserversCurrent = verification.current;
  await existing.save();

  // Graceful errors are 200 with verified=false (so frontend polling is simpler).
  return res.json(apiShape(verification));
}

// Alias for polling (same behavior)
export async function pollDomain(req, res) {
  return verifyDomain(req, res);
}

