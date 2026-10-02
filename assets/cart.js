// Cart page progressive enhancement: quantity steppers and remove links
// update line items through /cart/change.js and patch the totals in place,
// dispatching cart:updated so the header count refreshes. Without JavaScript
// the page is a normal cart form (edit quantities, press Update / Remove).

const root = document.querySelector('[data-cart]');
if (root) {
  root.classList.add('cart--enhanced');

  const subtotalEl = root.querySelector('[data-cart-subtotal]');
  const shipping = root.querySelector('[data-free-shipping]');

  const money = (cents) => {
    try {
      return new Intl.NumberFormat(document.documentElement.lang || 'en', {
        style: 'currency',
        currency: window.Shopify && window.Shopify.currency ? window.Shopify.currency.active : 'USD',
      }).format(cents / 100);
    } catch (e) {
      return (cents / 100).toFixed(2);
    }
  };

  const setBusy = (busy) => root.classList.toggle('is-busy', busy);

  const updateShipping = (cart) => {
    if (!shipping) return;
    const threshold = Number(shipping.dataset.threshold) || 0;
    if (!threshold) return;
    const fill = shipping.querySelector('[data-free-shipping-fill]');
    const text = shipping.querySelector('[data-free-shipping-text]');
    const remaining = threshold - cart.total_price;
    if (fill) fill.style.setProperty('--progress', Math.min(100, (cart.total_price / threshold) * 100) + '%');
    if (text) {
      text.textContent =
        remaining > 0
          ? (text.dataset.progress || 'You are {{ amount }} away from free shipping.').replace('{{ amount }}', money(remaining))
          : text.dataset.reached || 'You have unlocked free shipping.';
    }
  };

  const change = async (key, quantity, row) => {
    setBusy(true);
    try {
      const res = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: key, quantity }),
      });
      if (!res.ok) throw new Error('change failed');
      const cart = await res.json();
      document.dispatchEvent(new CustomEvent('cart:updated'));

      if (cart.item_count === 0) {
        window.location.reload();
        return;
      }
      if (quantity === 0 && row) {
        row.remove();
      } else if (row) {
        const line = cart.items.find((i) => i.key === key);
        const lineTotal = row.querySelector('[data-line-total]');
        if (line && lineTotal) lineTotal.textContent = money(line.final_line_price);
      }
      if (subtotalEl) subtotalEl.textContent = money(cart.total_price);
      updateShipping(cart);
    } catch (e) {
      window.location.reload();
    } finally {
      setBusy(false);
    }
  };

  // Quantity steppers (buttons live inside quantity-input).
  root.querySelectorAll('[data-qty]').forEach((qty) => {
    const key = qty.dataset.lineKey;
    const input = qty.querySelector('[data-qty-input]');
    const row = qty.closest('[data-cart-item]');
    if (!input || !key) return;

    qty.querySelectorAll('[data-qty-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = Math.max(0, Number(input.value) + Number(btn.dataset.qtyStep));
        input.value = next;
        change(key, next, row);
      });
    });
    input.addEventListener('change', () => {
      const next = Math.max(0, Number(input.value) || 0);
      input.value = next;
      change(key, next, row);
    });
  });

  // Remove links.
  root.querySelectorAll('[data-cart-remove]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const row = link.closest('[data-cart-item]');
      change(link.dataset.lineKey, 0, row);
    });
  });
}
