// "Frequently bought together" (progressive enhancement; the section is hidden
// without JavaScript). Loads complementary recommendations when the merchant
// has not set custom.fbt, keeps a running total in the store's money format,
// follows the main variant picker, and adds every checked item in one
// /cart/add.js request.

import { formatMoney } from './money.js';

function track(name, data) {
  document.dispatchEvent(new CustomEvent('dfx:track', { detail: { name, data } }));
}

function initBundle(bundle) {
  const list = bundle.querySelector('[data-bundle-list]');
  const total = bundle.querySelector('[data-bundle-total]');
  const addButton = bundle.querySelector('[data-bundle-add]');
  const addLabel = bundle.querySelector('[data-bundle-add-label]');
  const status = bundle.querySelector('[data-bundle-status]');
  const rows = () => Array.from(list.querySelectorAll('[data-bundle-item]'));
  const checked = () => rows().filter((row) => {
    const box = row.querySelector('[data-bundle-check]');
    return box && box.checked && !box.disabled;
  });

  function refresh() {
    const picked = checked();
    total.textContent = formatMoney(picked.reduce((sum, row) => sum + Number(row.dataset.price || 0), 0));
    const count = picked.length;
    addLabel.textContent = count === 1
      ? bundle.dataset.labelAddOne
      : (bundle.dataset.labelAddOther || '').replace('__COUNT__', String(count));
    addButton.disabled = count === 0;
    bundle.hidden = rows().length < 2;
  }

  list.addEventListener('change', (event) => {
    if (event.target.matches('[data-bundle-check]')) refresh();
  });

  list.addEventListener('click', (event) => {
    const link = event.target.closest('.bundle-item__link');
    if (link) track('click_bundle', { action: 'view', product_id: link.closest('[data-bundle-item]').dataset.productId });
  });

  // Follow the main variant picker so the "This item" row matches the form.
  const variantJson = document.querySelector('[data-variant-json]');
  let variants = [];
  try { variants = variantJson ? JSON.parse(variantJson.textContent) : []; } catch (error) { variants = []; }
  document.addEventListener('change', (event) => {
    if (!event.target.matches('[data-variant-select]')) return;
    const variant = variants.find((item) => String(item.id) === String(event.target.value));
    const row = list.querySelector('[data-bundle-current]');
    if (!variant || !row) return;
    row.dataset.variantId = String(variant.id);
    row.dataset.price = String(variant.price);
    const name = row.querySelector('[data-bundle-variant]');
    if (name) name.textContent = variant.title;
    const price = row.querySelector('[data-bundle-price] .price__current');
    if (price) price.textContent = formatMoney(variant.price);
    const compare = row.querySelector('[data-bundle-price] .price__compare');
    if (compare) compare.hidden = !(variant.compare_at_price > variant.price);
    const box = row.querySelector('[data-bundle-check]');
    box.disabled = !variant.available;
    if (!variant.available) box.checked = false;
    refresh();
  });

  addButton.addEventListener('click', async () => {
    const picked = checked();
    if (picked.length === 0 || addButton.getAttribute('aria-busy') === 'true') return;
    addButton.setAttribute('aria-busy', 'true');
    status.textContent = '';
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: picked.map((row) => ({ id: Number(row.dataset.variantId), quantity: 1 })) }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error((result && result.description) || bundle.dataset.labelError);
      document.dispatchEvent(new CustomEvent('cart:updated'));
      status.dataset.state = 'ok';
      status.textContent = bundle.dataset.labelAdded;
      track('click_bundle', { action: 'add', items: picked.map((row) => row.dataset.variantId) });
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = error.message || bundle.dataset.labelError;
    } finally {
      addButton.removeAttribute('aria-busy');
    }
  });

  async function loadRecommendations() {
    const url = bundle.dataset.recsUrl;
    if (!url) return;
    try {
      const response = await fetch(url);
      if (!response.ok) return;
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      const limit = Number(bundle.dataset.limit) || 2;
      const current = list.querySelector('[data-bundle-current]');
      const currentProduct = current ? current.dataset.productId : '';
      Array.from(doc.querySelectorAll('[data-bundle-item]'))
        .filter((row) => row.dataset.productId !== currentProduct)
        .slice(0, limit)
        .forEach((row) => list.append(document.importNode(row, true)));
      refresh();
    } catch (error) {
      // No recommendations: the section stays hidden.
    }
  }

  refresh();
  // The section sits right below the buy box and stays hidden until it has
  // picks, so there is nothing to observe; fetch straight away.
  loadRecommendations();
}

document.querySelectorAll('[data-bundle]').forEach(initBundle);
