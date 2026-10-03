/**
 * In-place updates on the search page (progressive enhancement). The header
 * search box is the only search input; this file swaps the results region
 * through the Section Rendering API when the visitor changes the result type
 * tab or the sort, so the page does not fully reload. Without this file the
 * tabs are plain links and the sort is a normal GET form.
 */
function initLiveSearch(root) {
  const region = root.querySelector('[data-live-search-region]');
  const status = root.querySelector('[data-live-search-status]');
  const sectionId = root.dataset.sectionId;
  const baseUrl = root.dataset.searchUrl;
  if (!region || !sectionId || !baseUrl) return;

  let controller = null;

  async function load(params, focusSelector) {
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
      if (focusSelector) {
        const target = region.querySelector(focusSelector);
        if (target) target.focus();
      }
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

  // Tabs and the sort control are re-rendered with the region, so listen on the root.
  root.addEventListener('click', (event) => {
    const link = event.target.closest('[data-live-search-link]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    load(new URL(link.href, window.location.href).searchParams, '.search-tabs__link[aria-current="true"]');
  });

  root.addEventListener('change', (event) => {
    const select = event.target.closest('[data-live-search-sort]');
    if (!select) return;
    const params = new URLSearchParams();
    new FormData(select.form).forEach((value, key) => params.append(key, String(value)));
    load(params, '[data-live-search-sort]');
  });
}

document.querySelectorAll('[data-live-search]').forEach(initLiveSearch);
