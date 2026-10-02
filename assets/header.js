/**
 * Header behaviour (progressive enhancement). The markup works without this
 * file: the menu is server-rendered and expanded. Configuration comes from
 * data-* attributes on the header element.
 *
 * - Mobile drawer: open and close, focus trap, Escape, focus return, scroll lock.
 * - Submenu accordion inside the drawer.
 * - Desktop dropdown: Escape dismisses an open dropdown.
 * - Cart count refresh on a `cart:updated` CustomEvent on document.
 */
const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
const DESKTOP = window.matchMedia('(min-width: 48em)');

function initDrawer(header) {
  const toggle = header.querySelector('[data-menu-toggle]');
  const drawer = header.querySelector('[data-menu-drawer]');
  const backdrop = header.querySelector('[data-menu-backdrop]');
  if (!toggle || !drawer) return;

  const closeButton = drawer.querySelector('[data-menu-close]');
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  const nav = drawer.querySelector('nav');
  drawer.setAttribute('aria-label', (nav && nav.getAttribute('aria-label')) || toggle.textContent.trim());

  const isOpen = () => drawer.classList.contains('is-open');

  function open() {
    if (isOpen() || DESKTOP.matches) return;
    drawer.classList.add('is-open');
    if (backdrop) backdrop.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('menu-open');
    const first = closeButton || drawer.querySelector(FOCUSABLE);
    if (first) first.focus();
  }

  function close({ returnFocus = true } = {}) {
    if (!isOpen()) return;
    drawer.classList.remove('is-open');
    if (backdrop) backdrop.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('menu-open');
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => (isOpen() ? close() : open()));
  if (closeButton) closeButton.addEventListener('click', () => close());
  if (backdrop) backdrop.addEventListener('click', () => close());

  drawer.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = Array.from(drawer.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Leaving mobile width while open: reset without stealing focus.
  DESKTOP.addEventListener('change', (event) => {
    if (event.matches) close({ returnFocus: false });
  });
}

function initSubmenus(header) {
  header.querySelectorAll('[data-submenu-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.menu__item');
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      if (item) item.classList.toggle('is-open', !expanded);
    });
  });

  // Desktop dropdowns open on :hover and :focus-within in CSS. Escape dismisses
  // the open one; it re-arms when the pointer or focus leaves the item.
  header.querySelectorAll('.menu__item.has-children').forEach((item) => {
    const rearm = () => item.classList.remove('is-dismissed');
    item.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !DESKTOP.matches) return;
      item.classList.add('is-dismissed');
      const link = item.querySelector('.menu__link');
      if (link) link.focus();
    });
    item.addEventListener('mouseleave', rearm);
    item.addEventListener('focusout', (event) => {
      if (!item.contains(event.relatedTarget)) rearm();
    });
  });
}

function initCart(header) {
  const link = header.querySelector('[data-cart-link]');
  if (!link) return;
  const label = link.querySelector('[data-cart-label]');
  const badge = link.querySelector('[data-cart-count]');
  const cartUrl = header.dataset.cartUrl;
  if (!cartUrl) return;

  function render(count) {
    if (badge) {
      badge.textContent = String(count);
      badge.hidden = count < 1;
    }
    if (label) {
      label.textContent =
        count === 1
          ? link.dataset.labelOne
          : String(link.dataset.labelOther || '').replace('99999', String(count));
    }
  }

  async function refresh() {
    try {
      const response = await fetch(`${cartUrl}.js`, { headers: { Accept: 'application/json' } });
      if (!response.ok) return;
      const cart = await response.json();
      render(Number(cart.item_count) || 0);
    } catch (error) {
      // Leave the server-rendered count in place.
    }
  }

  document.addEventListener('cart:updated', refresh);
}

document.querySelectorAll('[data-header]').forEach((header) => {
  initDrawer(header);
  initSubmenus(header);
  initCart(header);
});
