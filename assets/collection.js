/**
 * Collection filters (progressive enhancement). The markup works without
 * this file: filters are an in-flow GET form with an Apply button and the
 * sort form has a <noscript> submit button. This module adds:
 *
 * - Auto-submit when a filter chip or the sort select changes (price inputs
 *   keep the Apply button, so typing a range is never interrupted).
 * - Below 768px: the filters open as a dialog-style drawer from the toolbar
 *   button, with Escape and a close button, focus moved in and returned, a
 *   Tab trap and a scroll lock.
 */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
const DESKTOP = window.matchMedia('(min-width: 48em)');

function initSort() {
  document.querySelectorAll('[data-sort-form]').forEach((form) => {
    const select = form.querySelector('select');
    if (select) select.addEventListener('change', () => form.requestSubmit());
  });
}

function initFilters(root) {
  const panel = root.querySelector('[data-filters-panel]');
  const form = root.querySelector('[data-filters-form]');
  const backdrop = root.querySelector('[data-filters-backdrop]');
  const closeButton = root.querySelector('[data-filters-close]');
  const opener = document.querySelector('[data-filters-open]');
  if (!panel) return;

  if (form) {
    form.addEventListener('change', (event) => {
      const input = event.target;
      if (input instanceof HTMLInputElement && input.type === 'checkbox' && DESKTOP.matches) {
        form.requestSubmit();
      }
    });
  }

  if (!opener) return;
  const isOpen = () => panel.classList.contains('is-open');

  function open() {
    if (isOpen() || DESKTOP.matches) return;
    panel.classList.add('is-open');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    if (backdrop) backdrop.hidden = false;
    opener.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-labelledby', 'CollectionFiltersTitle');
    document.documentElement.classList.add('filters-open');
    document.addEventListener('keydown', onKeydown);
    const first = closeButton || panel.querySelector(FOCUSABLE);
    if (first) first.focus();
  }

  function close({ returnFocus = true } = {}) {
    if (!isOpen()) return;
    panel.classList.remove('is-open');
    panel.removeAttribute('role');
    panel.removeAttribute('aria-modal');
    panel.removeAttribute('aria-labelledby');
    document.removeEventListener('keydown', onKeydown);
    if (backdrop) backdrop.hidden = true;
    opener.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('filters-open');
    if (returnFocus) opener.focus();
  }

  opener.addEventListener('click', () => (isOpen() ? close() : open()));
  if (closeButton) closeButton.addEventListener('click', () => close());
  if (backdrop) backdrop.addEventListener('click', () => close());

  // Attached to the document only while the drawer is open, so Escape and
  // the Tab trap still work if focus has dropped to <body> (for example after
  // a click on blank space inside the panel).
  function onKeydown(event) {
    if (!isOpen()) return;
    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = Array.from(panel.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (!panel.contains(active)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // Growing past the drawer breakpoint while open: reset without stealing focus.
  DESKTOP.addEventListener('change', (event) => {
    if (event.matches) close({ returnFocus: false });
  });
}

initSort();
document.querySelectorAll('[data-collection-filters]').forEach(initFilters);
