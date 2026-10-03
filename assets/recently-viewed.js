// Recently viewed products. Handles come from context.js (window.DFX.context
// .viewed, newest first), falling back to the same localStorage key. Each card
// is rendered by the product-card-item section through the Section Rendering
// API, so prices use the store's own formatting. Hidden when there is nothing
// to show.

function viewedHandles() {
  const fromContext = window.DFX && window.DFX.context && window.DFX.context.viewed;
  if (Array.isArray(fromContext)) return fromContext;
  try {
    const stored = JSON.parse(window.localStorage.getItem('dfx:viewed') || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    return [];
  }
}

async function cardFor(root, handle) {
  try {
    const response = await fetch(`${root}products/${encodeURIComponent(handle)}?section_id=product-card-item`);
    if (!response.ok) return null;
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    return doc.querySelector('.product-card');
  } catch (error) {
    return null;
  }
}

async function init(section) {
  const list = section.querySelector('[data-rv-list]');
  const limit = Number(section.dataset.limit) || 6;
  const root = (section.dataset.root || '/').replace(/\/?$/, '/');
  const handles = viewedHandles().filter((handle) => handle && handle !== section.dataset.current).slice(0, limit);
  if (!list || handles.length === 0) return;

  const cards = await Promise.all(handles.map((handle) => cardFor(root, handle)));
  cards.forEach((card) => {
    if (!card) return;
    const item = document.createElement('li');
    item.className = 'product-recs__item';
    item.append(document.importNode(card, true));
    list.append(item);
  });
  section.hidden = list.children.length === 0;
}

document.querySelectorAll('[data-recently-viewed]').forEach(init);
