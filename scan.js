// ==========================================================================
// CYBERNEXA — URL Risk Scanner
//
// A real, rule-based heuristic engine that inspects a URL's structure for
// known phishing / malicious-link red flags. This runs entirely in the
// browser (no external service, no API key) and is the same category of
// checks real browser "safe browsing" warnings use as a first pass:
// IP-based hosts, @ tricks, lookalike brand domains, punycode/homograph
// characters, excessive subdomains, missing HTTPS, known shortener domains,
// suspicious keywords, and overall structural risk.
//
// This is a heuristic signal, not a guarantee — it cannot detect every
// threat and can flag unusual-but-safe URLs. Treat results as "worth a
// second look," not an absolute verdict.
// ==========================================================================

const KNOWN_BRANDS = [
  'google', 'facebook', 'instagram', 'whatsapp', 'apple', 'microsoft',
  'paypal', 'amazon', 'netflix', 'bankofamerica', 'chase', 'wellsfargo',
  'ebay', 'linkedin', 'twitter', 'binance', 'coinbase', 'steam',
  'spotify', 'adobe', 'dropbox', 'outlook', 'yahoo'
];

const URL_SHORTENERS = [
  'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly',
  'rebrand.ly', 'cutt.ly', 'shorte.st', 'adf.ly'
];

const SUSPICIOUS_KEYWORDS = [
  'login', 'verify', 'secure', 'account', 'update', 'confirm', 'suspend',
  'unlock', 'signin', 'banking', 'password', 'wallet', 'recover'
];

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function isIpHost(host) {
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  const hex = /^0x[0-9a-f]+$/i;
  return ipv4.test(host) || hex.test(host) || /^\d+$/.test(host);
}

function hasHomoglyphs(str) {
  // Non-ASCII letters mixed into what looks like a Latin domain —
  // a classic homograph / IDN-spoofing technique.
  return /[^\x00-\x7F]/.test(str);
}

function scanUrl(rawInput) {
  const findings = [];
  let score = 0; // 0 = safe-looking, higher = riskier
  let input = rawInput.trim();

  if (!input) {
    return { error: 'Please enter a URL to scan.' };
  }

  // Normalize: add protocol if missing, so URL() can parse it.
  let hadProtocol = /^https?:\/\//i.test(input);
  let testInput = hadProtocol ? input : 'http://' + input;

  let parsed;
  try {
    parsed = new URL(testInput);
  } catch {
    return { error: 'That doesn\'t look like a valid URL. Double-check the format (e.g. example.com or https://example.com/page).' };
  }

  const host = parsed.hostname.toLowerCase();
  const full = input.toLowerCase();

  // 1. Protocol check
  if (hadProtocol && parsed.protocol !== 'https:') {
    findings.push({ level: 'warn', text: 'Uses HTTP instead of HTTPS — data sent to this site is not encrypted in transit.' });
    score += 2;
  } else if (!hadProtocol) {
    findings.push({ level: 'info', text: 'No protocol specified — assumed HTTP for analysis. Always confirm whether a link uses HTTPS before entering data.' });
    score += 1;
  }

  // 2. IP-based host
  if (isIpHost(host)) {
    findings.push({ level: 'danger', text: 'The address uses a raw IP instead of a domain name — a common technique to hide the real destination.' });
    score += 4;
  }

  // 3. @ symbol trick (browsers ignore everything before @ as "userinfo")
  if (parsed.username || parsed.password) {
    findings.push({ level: 'danger', text: 'Contains an "@" symbol — attackers use this to make a fake address look like a trusted one before redirecting elsewhere.' });
    score += 4;
  }

  // 4. Punycode / homograph characters
  if (hasHomoglyphs(host) || host.startsWith('xn--')) {
    findings.push({ level: 'danger', text: 'The domain contains non-standard or encoded characters — possibly a lookalike using foreign letters that resemble Latin ones.' });
    score += 4;
  }

  // 5. Excessive subdomains
  const hostParts = host.split('.');
  if (hostParts.length > 4) {
    findings.push({ level: 'warn', text: `Unusually deep subdomain structure (${hostParts.length} parts) — sometimes used to bury the real domain.` });
    score += 2;
  }

  // 6. Known URL shortener
  if (URL_SHORTENERS.some(s => host === s || host.endsWith('.' + s))) {
    findings.push({ level: 'warn', text: 'This is a link-shortener domain — the real destination is hidden until you click. Expand it with a preview tool before visiting.' });
    score += 2;
  }

  // 7. Brand lookalike / typosquatting
  const SLD = ['co', 'com', 'org', 'net', 'gov', 'edu', 'ac'];
  const n = hostParts.length;
  const rootDomain = (n >= 3 && hostParts[n - 1].length === 2 && SLD.includes(hostParts[n - 2]))
    ? hostParts[n - 3]
    : (n >= 2 ? hostParts[n - 2] : host);
  for (const brand of KNOWN_BRANDS) {
    if (rootDomain === brand || rootDomain.length < 4) continue; // exact match = legitimate-looking, not flagged here
    const distance = levenshtein(rootDomain, brand);
    if (distance > 0 && distance <= 2 && rootDomain.length >= brand.length - 2) {
      findings.push({ level: 'danger', text: `Domain "${rootDomain}" closely resembles the brand "${brand}" — a possible typosquatting / lookalike attempt.` });
      score += 5;
      break;
    }
  }

  // 8. Suspicious keywords combined with non-brand domain
  const keywordHits = SUSPICIOUS_KEYWORDS.filter(k => full.includes(k));
  if (keywordHits.length >= 2) {
    findings.push({ level: 'warn', text: `Multiple account/security-related keywords in the URL (${keywordHits.slice(0, 3).join(', ')}) — common in phishing links impersonating login pages.` });
    score += 2;
  }

  // 9. Excessive length
  if (full.length > 100) {
    findings.push({ level: 'info', text: 'This is a very long URL — long strings are sometimes used to obscure the true destination or embed tracking/redirect payloads.' });
    score += 1;
  }

  // 10. Non-standard port
  if (parsed.port && !['80', '443', ''].includes(parsed.port)) {
    findings.push({ level: 'info', text: `Uses a non-standard port (${parsed.port}) — unusual for typical consumer-facing websites.` });
    score += 1;
  }

  if (findings.length === 0) {
    findings.push({ level: 'ok', text: 'No common red flags detected in the URL structure.' });
  }

  let verdict, verdictLevel;
  if (score >= 7) {
    verdict = 'High Risk';
    verdictLevel = 'danger';
  } else if (score >= 3) {
    verdict = 'Use Caution';
    verdictLevel = 'warn';
  } else {
    verdict = 'Low Risk';
    verdictLevel = 'ok';
  }

  return {
    input,
    host,
    protocol: parsed.protocol.replace(':', '').toUpperCase(),
    score,
    verdict,
    verdictLevel,
    findings,
  };
}
