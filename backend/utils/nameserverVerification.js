import dns from 'dns';
import { promisify } from 'util';

const resolveNs = promisify(dns.resolveNs);

function normalizeNs(ns) {
  return String(ns || '').trim().toLowerCase().replace(/\.$/, '');
}

function normalizeDomain(input) {
  let domain = String(input || '').trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//, '');
  domain = domain.replace(/\/.*$/, '');
  domain = domain.replace(/\.$/, '');
  return domain;
}

function isProbablyValidDomain(domain) {
  if (!domain || domain.length > 253) return false;
  if (domain.includes('..')) return false;
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain);
}

function withTimeout(promise, timeoutMs) {
  if (!timeoutMs || timeoutMs <= 0) return promise;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const err = new Error('DNS lookup timed out');
      err.code = 'DNS_TIMEOUT';
      setTimeout(() => reject(err), timeoutMs);
    }),
  ]);
}

export function getExpectedNameserversFromEnv() {
  const ns1 = process.env.MY_NAMESERVER_1;
  const ns2 = process.env.MY_NAMESERVER_2;
  const expected = [ns1, ns2].map(normalizeNs).filter(Boolean);
  return expected;
}

/**
 * Verify that `domain` has ALL expected nameservers.
 * Returns structured result used by API + persistence.
 */
export async function verifyDomainNameservers(domainInput, options = {}) {
  const domain = normalizeDomain(domainInput);
  const timeoutMs = Number(options.timeoutMs ?? 8000);
  const expected = (options.expectedNameservers || getExpectedNameserversFromEnv()).map(normalizeNs).filter(Boolean);

  if (!expected.length) {
    return {
      verified: false,
      domain,
      expected,
      current: [],
      message: 'Server nameservers are not configured (MY_NAMESERVER_1 / MY_NAMESERVER_2 missing)',
      error: { code: 'SERVER_NS_NOT_CONFIGURED' },
    };
  }

  if (!isProbablyValidDomain(domain)) {
    return {
      verified: false,
      domain,
      expected,
      current: [],
      message: 'Invalid domain name',
      error: { code: 'INVALID_DOMAIN' },
    };
  }

  try {
    const nsRecords = await withTimeout(resolveNs(domain), timeoutMs);
    const current = Array.isArray(nsRecords) ? nsRecords.map(normalizeNs).filter(Boolean) : [];
    const verified = expected.every((reqNs) => current.includes(reqNs));

    return {
      verified,
      domain,
      expected,
      current,
      message: verified
        ? 'Nameservers verified'
        : `Nameservers not verified. Point your domain to: ${expected.join(', ')}`,
    };
  } catch (err) {
    const code = err?.code || 'DNS_ERROR';
    const message =
      code === 'ENOTFOUND'
        ? 'Domain not found (DNS ENOTFOUND)'
        : code === 'ENODATA'
        ? 'No nameserver records found'
        : code === 'DNS_TIMEOUT'
        ? 'DNS lookup timed out'
        : 'DNS lookup failed';

    return {
      verified: false,
      domain,
      expected,
      current: [],
      message,
      error: { code, details: err?.message || String(err) },
    };
  }
}

export function normalizeDomainNameForStorage(domainInput) {
  return normalizeDomain(domainInput);
}

