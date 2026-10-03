/**
 * Quick-add for product cards (progressive enhancement). Without JavaScript the
 * card's form posts to /cart/add and lands on the cart page. With it, the item
 * is added in place, the header count refreshes via `cart:updated`, and the
 * result is announced in the [data-quick-add-status] live region.
 */
const STATUS = '[data-quick-add-status]';

function announce(message) {
  const region = document.querySelector(STATUS);
  if (!region) return;
  region.textContent = '';
  window.setTimeout(() => {
    region.textContent = message;
  }, 50);
}

async function quickAdd(form) {
  const button = form.querySelector('.product-card__add');
  if (!button || button.getAttribute('aria-busy') === 'true') return;
  button.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch(`${form.getAttribute('action')}.js`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    });
    if (!response.ok) throw new Error(String(response.status));
    document.dispatchEvent(new CustomEvent('cart:updated'));
    button.classList.add('is-added');
    window.setTimeout(() => button.classList.remove('is-added'), 1200);
    announce(form.dataset.addedMessage || '');
  } catch (error) {
    announce(form.dataset.failedMessage || '');
  } finally {
    button.removeAttribute('aria-busy');
  }
}

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.hasAttribute('data-quick-add')) return;
  event.preventDefault();
  quickAdd(form);
});
