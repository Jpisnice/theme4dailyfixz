// Lazy-loads the product-recommendations section through the Product
// Recommendations endpoint once it nears the viewport, and announces
// click_related_product. Renders nothing when Shopify has no recommendations.

function track(name, data) {
  document.dispatchEvent(new CustomEvent('dfx:track', { detail: { name, data } }));
}

async function load(container) {
  const url = container.dataset.url;
  if (!url || container.dataset.loaded) return;
  container.dataset.loaded = 'true';
  try {
    const response = await fetch(url);
    if (!response.ok) return;
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    const fresh = doc.querySelector('[data-product-recs]');
    if (fresh && fresh.querySelector('[data-rec-id]')) container.innerHTML = fresh.innerHTML;
  } catch (error) {
    // Recommendations are optional; leave the section empty.
  }
}

document.querySelectorAll('[data-product-recs]').forEach((container) => {
  container.addEventListener('click', (event) => {
    const item = event.target.closest('[data-rec-id]');
    if (item && event.target.closest('a')) track('click_related_product', { product_id: item.dataset.recId, source: 'page' });
  });
  if (!('IntersectionObserver' in window)) {
    load(container);
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer.disconnect();
      load(container);
    }
  }, { rootMargin: '600px 0px' });
  observer.observe(container);
});
