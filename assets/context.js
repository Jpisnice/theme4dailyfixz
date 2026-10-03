/**
 * Visitor context for analytics and future personalization. It only records
 * and exposes data; nothing here changes what a visitor sees.
 *
 * window.DFX.context = { source, medium, campaign, visitor, viewed }
 *  - source/medium/campaign: UTM parameters or the referrer host, kept for the session.
 *  - visitor: "new" on the first visit, "returning" afterwards.
 *  - viewed: product handles viewed recently, newest first (max 12).
 * Storage is wrapped in try/catch: private windows and blocked storage must
 * never break the page.
 */
const VIEWED_KEY = 'dfx:viewed';
const VISITOR_KEY = 'dfx:visitor';
const SOURCE_KEY = 'dfx:source';

function read(storage, key) {
  try {
    return storage.getItem(key);
  } catch (error) {
    return null;
  }
}

function write(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch (error) {
    // Ignore: context is best effort.
  }
}

function sourceFromPage() {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source');
  if (source) {
    return { source, medium: params.get('utm_medium') || '', campaign: params.get('utm_campaign') || '' };
  }
  try {
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      if (host && host !== window.location.hostname) return { source: host, medium: 'referral', campaign: '' };
    }
  } catch (error) {
    // Malformed referrer.
  }
  return null;
}

let source = null;
const stored = read(window.sessionStorage, SOURCE_KEY);
if (stored) {
  try { source = JSON.parse(stored); } catch (error) { source = null; }
}
const fresh = sourceFromPage();
if (fresh) {
  source = fresh;
  write(window.sessionStorage, SOURCE_KEY, JSON.stringify(fresh));
}
if (!source) source = { source: 'direct', medium: 'none', campaign: '' };

const visitor = read(window.localStorage, VISITOR_KEY) ? 'returning' : 'new';
write(window.localStorage, VISITOR_KEY, '1');

let viewed = [];
try { viewed = JSON.parse(read(window.localStorage, VIEWED_KEY) || '[]'); } catch (error) { viewed = []; }
if (!Array.isArray(viewed)) viewed = [];

function remember(handle) {
  if (!handle) return;
  viewed = [handle].concat(viewed.filter((item) => item !== handle)).slice(0, 12);
  write(window.localStorage, VIEWED_KEY, JSON.stringify(viewed));
}

const productRoot = document.querySelector('[data-product][data-analytics]');
if (productRoot) {
  try { remember(JSON.parse(productRoot.dataset.analytics).handle); } catch (error) { /* ignore */ }
}

const context = { source: source.source, medium: source.medium, campaign: source.campaign, visitor, viewed };
document.documentElement.dataset.visitor = visitor;
window.DFX = Object.assign(window.DFX || {}, { context, rememberViewed: remember });
