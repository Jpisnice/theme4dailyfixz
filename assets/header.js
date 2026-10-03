/**
 * Header behaviour (progressive enhancement). The markup works without this
 * file: the menu is server-rendered and the search is a plain GET form.
 *
 * - Desktop dropdown: Escape dismisses an open dropdown.
 * - Cart count refresh on a `cart:updated` CustomEvent on document.
 */
const DESKTOP = window.matchMedia('(min-width: 48em)');

function initDropdowns(header) {
  // Dropdowns open on :hover and :focus-within in CSS. Escape dismisses the
  // open one; it re-arms when the pointer or focus leaves the item.
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
  initDropdowns(header);
  initCart(header);
});
