/**
 * Suggested and predictive search for the header search form (progressive
 * enhancement). Without this file the form is a plain GET to the search page.
 *
 * - Focus with an empty field: shows the merchant's suggested terms (server-rendered).
 * - Typing: fetches /search/suggest.json and lists queries, products and collections.
 * - Combobox keyboard support: Arrow keys, Enter, Escape. Results are announced
 *   in the [data-search-status] live region.
 */
import { formatMoney } from './money.js';

const MIN_CHARS = 2;
const DEBOUNCE_MS = 200;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

// Suggest API prices are decimal strings in the presentment currency.
function formatPrice(value) {
  const number = Number(value);
  if (value === undefined || value === null || value === '' || Number.isNaN(number)) return '';
  return formatMoney(Math.round(number * 100));
}

function initSearch(form) {
  const input = form.querySelector('[data-search-input]');
  const panel = form.querySelector('[data-search-panel]');
  const suggested = form.querySelector('[data-search-suggested]');
  const results = form.querySelector('[data-search-results]');
  const status = form.querySelector('[data-search-status]');
  const endpoint = form.dataset.predictiveUrl;
  if (!input || !panel || !results || !endpoint) return;

  const labels = form.dataset;
  let timer = 0;
  let controller = null;
  let active = -1;

  const options = () => Array.from(panel.querySelectorAll('[role="option"]'));

  function setActive(index) {
    const items = options();
    items.forEach((item) => item.removeAttribute('aria-selected'));
    active = index;
    if (index < 0 || !items[index]) {
      input.removeAttribute('aria-activedescendant');
      return;
    }
    items[index].setAttribute('aria-selected', 'true');
    input.setAttribute('aria-activedescendant', items[index].id);
    items[index].scrollIntoView({ block: 'nearest' });
  }

  function open() {
    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function close() {
    panel.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    setActive(-1);
  }

  function showSuggested() {
    results.hidden = true;
    results.replaceChildren();
    if (suggested && suggested.children.length > 0) {
      suggested.hidden = false;
      open();
    } else {
      close();
    }
  }

  let counter = 0;
  function group(title, items) {
    const section = el('div', 'site-search__group');
    section.append(el('p', 'site-search__group-title', title));
    items.forEach((item) => {
      counter += 1;
      item.id = `SearchOption${counter}`;
      item.setAttribute('role', 'option');
      section.append(item);
    });
    return section;
  }

  function render(data, terms) {
    counter = 0;
    results.replaceChildren();
    const found = (data && data.resources && data.resources.results) || {};
    const queries = found.queries || [];
    const products = found.products || [];
    const collections = found.collections || [];

    if (queries.length) {
      results.append(group(labels.labelSuggestions, queries.map((query) => {
        const link = el('a', 'site-search__option', query.text);
        link.href = query.url;
        return link;
      })));
    }
    if (products.length) {
      results.append(group(labels.labelProducts, products.map((product) => {
        const link = el('a', 'site-search__option site-search__option--product');
        link.href = product.url;
        if (product.image) {
          const img = el('img', 'site-search__thumb');
          img.src = product.image;
          img.alt = '';
          img.width = 44;
          img.height = 44;
          img.loading = 'lazy';
          link.append(img);
        }
        const text = el('span', 'site-search__option-text');
        text.append(el('span', 'site-search__option-title', product.title));
        const price = formatPrice(product.price);
        if (price) text.append(el('span', 'site-search__option-meta', price));
        link.append(text);
        return link;
      })));
    }
    if (collections.length) {
      results.append(group(labels.labelCollections, collections.map((collection) => {
        const link = el('a', 'site-search__option', collection.title);
        link.href = collection.url;
        return link;
      })));
    }

    const total = queries.length + products.length + collections.length;
    if (total === 0) {
      results.append(el('p', 'site-search__empty', (labels.labelEmpty || '').replace('__TERMS__', terms)));
    }
    const all = el('a', 'site-search__all', (labels.labelAll || '').replace('__TERMS__', terms));
    all.href = `${form.action}?q=${encodeURIComponent(terms)}&options%5Bprefix%5D=last`;
    all.id = `SearchOption${counter + 1}`;
    all.setAttribute('role', 'option');
    results.append(all);

    if (suggested) suggested.hidden = true;
    results.hidden = false;
    open();
    setActive(-1);
    if (status) status.textContent = (labels.labelCount || '').replace('__COUNT__', String(total));
  }

  async function search(terms) {
    if (controller) controller.abort();
    controller = new AbortController();
    const params = new URLSearchParams({
      q: terms,
      'resources[type]': 'query,product,collection',
      'resources[limit]': '4',
      'resources[options][unavailable_products]': 'last',
    });
    try {
      const response = await fetch(`${endpoint}.json?${params}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(String(response.status));
      render(await response.json(), terms);
    } catch (error) {
      if (error.name !== 'AbortError') close();
    }
  }

  function onInput() {
    window.clearTimeout(timer);
    const terms = input.value.trim();
    if (terms.length === 0) {
      if (controller) controller.abort();
      showSuggested();
      return;
    }
    if (terms.length < MIN_CHARS) return;
    timer = window.setTimeout(() => search(terms), DEBOUNCE_MS);
  }

  input.addEventListener('input', onInput);
  input.addEventListener('focus', () => {
    if (input.value.trim().length === 0) showSuggested();
    else if (!results.hidden) open();
  });

  input.addEventListener('keydown', (event) => {
    if (panel.hidden) return;
    const items = options();
    if (event.key === 'Escape') {
      close();
    } else if (event.key === 'ArrowDown' && items.length) {
      event.preventDefault();
      setActive((active + 1) % items.length);
    } else if (event.key === 'ArrowUp' && items.length) {
      event.preventDefault();
      setActive(active <= 0 ? items.length - 1 : active - 1);
    } else if (event.key === 'Enter' && active >= 0 && items[active]) {
      event.preventDefault();
      items[active].click();
    }
  });

  form.addEventListener('focusout', (event) => {
    if (!form.contains(event.relatedTarget)) close();
  });
  document.addEventListener('pointerdown', (event) => {
    if (!form.contains(event.target)) close();
  });
}

document.querySelectorAll('[data-predictive-search]').forEach(initSearch);
