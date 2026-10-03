/**
 * Live results on the search page (progressive enhancement). Typing in the page
 * search box re-renders the results region through the Section Rendering API,
 * so the full product cards update before the visitor presses Search. Changing
 * the sort does the same. Without this file everything is a normal GET form.
 */
const MIN_CHARS = 2;
const DEBOUNCE_MS = 250;

function initLiveSearch(root) {
  const form = root.querySelector('[data-live-search-form]');
  const input = root.querySelector('[data-live-search-input]');
  const region = root.querySelector('[data-live-search-region]');
  const status = root.querySelector('[data-live-search-status]');
  const sectionId = root.dataset.sectionId;
  const baseUrl = root.dataset.searchUrl;
  if (!form || !input || !region || !sectionId || !baseUrl) return;

  let timer = 0;
  let controller = null;

  async function load(params) {
    if (controller) controller.abort();
    controller = new AbortController();
    region.setAttribute('aria-busy', 'true');
    const query = new URLSearchParams(params);
    const pageUrl = `${baseUrl}?${query}`;
    query.set('section_id', sectionId);
    try {
      const response = await fetch(`${baseUrl}?${query}`, { signal: controller.signal });
      if (!response.ok) throw new Error(String(response.status));
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      const next = doc.querySelector('[data-live-search-region]');
      if (!next) throw new Error('missing region');
      region.innerHTML = next.innerHTML;
      window.history.replaceState({}, '', pageUrl);
      if (status) {
        const meta = region.querySelector('.content-search__meta, .content-search__empty-title');
        status.textContent = meta ? meta.textContent.trim() : '';
      }
    } catch (error) {
      if (error.name !== 'AbortError') window.location.assign(pageUrl);
    } finally {
      region.removeAttribute('aria-busy');
    }
  }

  function currentParams() {
    const params = new URLSearchParams();
    new FormData(form).forEach((value, key) => {
      if (typeof value === 'string' && value !== '') params.append(key, value);
    });
    return params;
  }

  input.addEventListener('input', () => {
    window.clearTimeout(timer);
    const terms = input.value.trim();
    if (terms.length !== 0 && terms.length < MIN_CHARS) return;
    timer = window.setTimeout(() => load(currentParams()), DEBOUNCE_MS);
  });

  // The sort control is re-rendered with the region, so listen on the root.
  root.addEventListener('change', (event) => {
    const select = event.target.closest('[data-live-search-sort]');
    if (!select) return;
    const params = new URLSearchParams();
    new FormData(select.form).forEach((value, key) => params.append(key, String(value)));
    load(params);
  });
}

document.querySelectorAll('[data-live-search]').forEach(initLiveSearch);
