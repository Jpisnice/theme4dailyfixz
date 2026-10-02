// Product page progressive enhancement: option buttons drive the native
// variant <select> (the no-JS source of truth), the gallery switches on
// thumbnail click and the add-to-cart form posts via fetch so the header
// cart count updates without a reload. Everything degrades to a working
// native form when this module does not run.

const root = document.querySelector('.product');
if (root) {
  const form = root.querySelector('#ProductForm');
  const select = root.querySelector('[data-variant-select]');
  const optionsWrap = root.querySelector('[data-variant-options]');
  const priceTarget = root.querySelector('[data-price-target]');
  const addButton = root.querySelector('[data-add-to-cart]');
  const addLabel = root.querySelector('[data-add-label]');
  const addStatus = root.querySelector('[data-add-status]');
  const skuEl = root.querySelector('[data-sku]');

  let variants = [];
  const json = root.querySelector('[data-variant-json]');
  if (json) {
    try { variants = JSON.parse(json.textContent); } catch (e) { variants = []; }
  }

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

  const t = {
    add: addLabel ? addLabel.textContent.trim() : 'Add to cart',
    soldOut: (addButton && addButton.dataset.soldOut) || 'Sold out',
  };

  // --- Gallery ---------------------------------------------------------
  const slides = Array.from(root.querySelectorAll('[data-gallery-slide]'));
  const thumbs = Array.from(root.querySelectorAll('[data-gallery-thumb]'));
  const showMedia = (mediaId) => {
    if (!mediaId) return;
    slides.forEach((s) => s.classList.toggle('is-active', s.dataset.mediaId === String(mediaId)));
    thumbs.forEach((b) => b.classList.toggle('is-active', b.dataset.mediaId === String(mediaId)));
  };
  thumbs.forEach((btn) => btn.addEventListener('click', () => showMedia(btn.dataset.mediaId)));

  // --- Variant selection ----------------------------------------------
  const selectedOptions = () =>
    Array.from(optionsWrap ? optionsWrap.querySelectorAll('[data-option-input]:checked') : [])
      .sort((a, b) => Number(a.dataset.optionPosition) - Number(b.dataset.optionPosition))
      .map((input) => input.value);

  const findVariant = () => {
    const chosen = selectedOptions();
    if (!chosen.length) return null;
    return variants.find((v) => chosen.every((val, i) => v.options[i] === val)) || null;
  };

  const renderPrice = (variant) => {
    if (!priceTarget) return;
    const onSale = variant.compare_at_price && variant.compare_at_price > variant.price;
    let html = '<div class="price' + (onSale ? ' price--on-sale' : '') + '">';
    if (onSale) {
      html += '<s class="price__compare">' + money(variant.compare_at_price) + '</s>';
      html += '<span class="price__current price__current--sale">' + money(variant.price) + '</span>';
    } else {
      html += '<span class="price__current">' + money(variant.price) + '</span>';
    }
    html += '</div>';
    priceTarget.innerHTML = html;
  };

  const updateForVariant = (variant) => {
    if (!variant) {
      if (addButton) { addButton.disabled = true; }
      if (addLabel) { addLabel.textContent = t.soldOut; }
      return;
    }
    if (select) { select.value = variant.id; }
    renderPrice(variant);
    if (addButton) { addButton.disabled = !variant.available; }
    if (addLabel) { addLabel.textContent = variant.available ? t.add : t.soldOut; }
    if (variant.featured_media) { showMedia(variant.featured_media.id); }
    if (skuEl && variant.sku) { skuEl.textContent = skuEl.textContent.replace(/:.*/, ': ' + variant.sku); }
    const url = new URL(window.location.href);
    url.searchParams.set('variant', variant.id);
    window.history.replaceState({}, '', url);
  };

  if (optionsWrap) {
    optionsWrap.addEventListener('change', () => updateForVariant(findVariant()));
  }
  if (select) {
    select.addEventListener('change', () => {
      const variant = variants.find((v) => String(v.id) === select.value);
      updateForVariant(variant);
    });
  }

  // --- AJAX add to cart ------------------------------------------------
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (addButton) { addButton.disabled = true; }
      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        });
        if (!res.ok) throw new Error('add failed');
        document.dispatchEvent(new CustomEvent('cart:updated'));
        if (addStatus) {
          addStatus.textContent = addStatus.dataset.added || 'Added to cart';
        }
      } catch (e) {
        form.submit();
      } finally {
        if (addButton) { addButton.disabled = false; }
      }
    });
  }
}
