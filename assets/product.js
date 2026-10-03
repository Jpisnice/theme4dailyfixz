// Product page progressive enhancement. The native form is the no-JS source of
// truth: a variant <select name="id" form="ProductForm"> and a normal add-to-cart
// POST. With JavaScript:
//  - option buttons drive the select, sold-out values are marked,
//  - variant-specific regions (price, saving, availability, button state, sticky
//    bar) are refreshed from the Section Rendering API so formatting is always
//    the store's own,
//  - the quantity stepper respects min, max and step,
//  - Add to Cart posts with fetch, opens the "Added to cart" sheet (cart-added
//    section + recommendations) and updates the header count via `cart:updated`,
//  - offer codes can be copied or applied to the cart session (/discount/CODE),
//  - the mobile sticky bar shows whenever the main buy block is off screen.

const root = document.querySelector('[data-product]');

function track(name, data) {
  document.dispatchEvent(new CustomEvent('dfx:track', { detail: { name, data } }));
}

if (root) {
  const form = document.getElementById('ProductForm');
  const select = root.querySelector('[data-variant-select]');
  const optionsWrap = root.querySelector('[data-variant-options]');
  const addButtons = Array.from(root.querySelectorAll('[data-add-to-cart], [data-sticky-add]'));
  const status = root.querySelector('[data-add-status]');
  const sectionId = root.dataset.sectionId;
  const productUrl = root.dataset.productUrl;
  const labels = {
    added: root.dataset.labelAdded || 'Added to cart',
    error: root.dataset.labelAddError || 'Could not add to cart.',
    add: root.dataset.labelAdd || 'Add to cart',
  };

  let base = {};
  try { base = JSON.parse(root.dataset.analytics || '{}'); } catch (error) { base = {}; }

  let variants = [];
  const json = root.querySelector('[data-variant-json]');
  if (json) {
    try { variants = JSON.parse(json.textContent); } catch (error) { variants = []; }
  }
  const variantById = (id) => variants.find((variant) => String(variant.id) === String(id));
  const currentVariant = () => (select ? variantById(select.value) : null);

  function context(extra) {
    const variant = currentVariant();
    return Object.assign({}, base, variant ? { variant_id: String(variant.id), price: variant.price / 100 } : {}, extra || {});
  }

  track('view_product', context());

  // --- Variant selection -------------------------------------------------
  const fieldsets = Array.from(root.querySelectorAll('.variant-option'));

  function selectedValues() {
    return fieldsets.map((fieldset) => {
      const checked = fieldset.querySelector('[data-option-input]:checked');
      return checked ? checked.value : null;
    });
  }

  function refreshOptionStates() {
    const chosen = selectedValues();
    fieldsets.forEach((fieldset, position) => {
      fieldset.querySelectorAll('[data-option-input]').forEach((input) => {
        const matching = variants.filter((variant) => variant.options[position] === input.value
          && chosen.slice(0, position).every((value, index) => variant.options[index] === value));
        const soldOut = !matching.some((variant) => variant.available);
        const label = input.nextElementSibling;
        if (label) label.classList.toggle('is-sold-out', soldOut);
      });
      const selected = fieldset.querySelector('[data-option-selected]');
      if (selected) selected.textContent = chosen[position] || '';
    });
  }

  function findVariant() {
    const chosen = selectedValues();
    if (chosen.some((value) => value === null)) return null;
    return variants.find((variant) => chosen.every((value, index) => variant.options[index] === value)) || null;
  }

  const cache = new Map();
  let requestId = 0;

  async function fetchRegions(id) {
    if (cache.has(id)) return cache.get(id);
    const response = await fetch(`${productUrl}?variant=${id}&section_id=${encodeURIComponent(sectionId)}`);
    if (!response.ok) throw new Error(String(response.status));
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    cache.set(id, doc);
    return doc;
  }

  function applyRegions(doc) {
    root.querySelectorAll('[data-variant-region]').forEach((region) => {
      const fresh = doc.querySelector(`[data-variant-region="${region.dataset.variantRegion}"]`);
      if (fresh) region.innerHTML = fresh.innerHTML;
    });
    const freshButton = doc.querySelector('[data-add-to-cart]');
    if (freshButton) addButtons.forEach((button) => { button.disabled = freshButton.disabled; });
    const freshQty = doc.querySelector('[data-qty-input]');
    const qty = root.querySelector('[data-qty-input]');
    if (freshQty && qty) {
      ['min', 'max', 'step'].forEach((attr) => {
        if (freshQty.hasAttribute(attr)) qty.setAttribute(attr, freshQty.getAttribute(attr));
        else qty.removeAttribute(attr);
      });
      const min = Number(qty.min) || 1;
      if (Number(qty.value) < min) qty.value = String(min);
    }
  }

  async function updateForVariant(variant) {
    if (!variant || !select) return;
    select.value = String(variant.id);
    select.dispatchEvent(new Event('change', { bubbles: true }));
    refreshOptionStates();
    if (variant.featured_media) {
      document.dispatchEvent(new CustomEvent('gallery:show', { detail: { mediaId: variant.featured_media.id } }));
    }
    const url = new URL(window.location.href);
    url.searchParams.set('variant', variant.id);
    window.history.replaceState({}, '', url);
    track('select_variant', context());

    const current = ++requestId;
    root.classList.add('is-updating');
    try {
      const doc = await fetchRegions(variant.id);
      if (current === requestId) applyRegions(doc);
    } catch (error) {
      // Keep the previous values; the select is still correct for checkout.
    } finally {
      if (current === requestId) root.classList.remove('is-updating');
    }
  }

  if (optionsWrap) {
    optionsWrap.addEventListener('change', () => {
      refreshOptionStates();
      updateForVariant(findVariant());
    });
    refreshOptionStates();
  }
  if (select) {
    select.addEventListener('change', (event) => {
      if (!event.isTrusted) return;
      updateForVariant(variantById(select.value));
    });
  }

  // --- Quantity stepper ------------------------------------------------
  root.querySelectorAll('[data-qty]').forEach((qty) => {
    const input = qty.querySelector('[data-qty-input]');
    if (!input) return;
    qty.querySelectorAll('[data-qty-step]').forEach((button) => {
      button.addEventListener('click', () => {
        const step = Number(input.step) || 1;
        const min = Number(input.min) || 1;
        const max = input.max === '' ? Infinity : Number(input.max);
        const next = Number(input.value || min) + Number(button.dataset.qtyStep) * step;
        input.value = String(Math.min(max, Math.max(min, next)));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  });

  // --- Added-to-cart sheet ----------------------------------------------
  const sheet = root.querySelector('[data-cart-sheet]');
  const sheetBody = sheet && sheet.querySelector('[data-cart-sheet-body]');
  const sheetRecs = sheet && sheet.querySelector('[data-cart-sheet-recs]');
  let sheetOpener = null;
  let recsLoaded = false;

  async function loadSheetRecs() {
    if (!sheetRecs || recsLoaded || !root.dataset.recsUrl) return;
    recsLoaded = true;
    for (const intent of ['complementary', 'related']) {
      try {
        const url = `${root.dataset.recsUrl}?section_id=product-recommendations&product_id=${root.dataset.productId}&limit=4&intent=${intent}`;
        const response = await fetch(url);
        if (!response.ok) continue;
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        const list = doc.querySelector('.product-recs__list');
        if (list && list.querySelector('[data-rec-id]')) {
          sheetRecs.innerHTML = '';
          const heading = doc.querySelector('.section-heading__title');
          if (heading) {
            const title = document.createElement('p');
            title.className = 'cart-sheet__recs-title';
            title.textContent = heading.textContent;
            sheetRecs.append(title);
          }
          sheetRecs.append(list);
          sheetRecs.hidden = false;
          return;
        }
      } catch (error) {
        // Try the next intent; recommendations are optional.
      }
    }
  }

  function openSheet(html, key, opener) {
    if (!sheet || typeof sheet.showModal !== 'function' || !html) return false;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const content = doc.querySelector('.cart-added');
    if (!content) return false;
    const line = Array.from(content.querySelectorAll('[data-line-key]')).find((item) => item.dataset.lineKey === key);
    if (line) line.hidden = false;
    sheetBody.replaceChildren(content);
    sheetOpener = opener;
    sheet.showModal();
    loadSheetRecs();
    return true;
  }

  if (sheet) {
    sheet.querySelector('[data-cart-sheet-close]').addEventListener('click', () => sheet.close());
    sheet.addEventListener('click', (event) => {
      if (event.target === sheet) sheet.close();
      const rec = event.target.closest('[data-rec-id]');
      if (rec && event.target.closest('a, button')) track('click_related_product', context({ related_id: rec.dataset.recId, source: 'sheet' }));
    });
    sheet.addEventListener('close', () => {
      if (sheetOpener && document.contains(sheetOpener)) sheetOpener.focus();
    });
  }

  // --- Add to cart -----------------------------------------------------
  let busy = false;
  let resetTimer = 0;

  function setLabel(text) {
    root.querySelectorAll('[data-add-label], [data-add-label-sticky]').forEach((label) => {
      label.textContent = text;
    });
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (busy) return;
      busy = true;
      const opener = (event.submitter instanceof HTMLElement && event.submitter) || addButtons[0];
      addButtons.forEach((button) => button.setAttribute('aria-busy', 'true'));
      if (status) status.textContent = '';
      try {
        const body = new FormData(form);
        body.append('sections', 'cart-added');
        body.append('sections_url', productUrl);
        const response = await fetch(`${form.getAttribute('action')}.js`, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body,
        });
        const result = await response.json().catch(() => null);
        if (!response.ok) throw new Error((result && result.description) || labels.error);
        document.dispatchEvent(new CustomEvent('cart:updated'));
        const quantity = Number((form.querySelector('[data-qty-input]') || {}).value) || 1;
        track('add_to_cart', context({ quantity }));
        const shown = openSheet(result && result.sections && result.sections['cart-added'], result && result.key, opener);
        if (status) status.textContent = shown ? '' : labels.added;
        if (!shown) {
          setLabel(labels.added);
          window.clearTimeout(resetTimer);
          resetTimer = window.setTimeout(() => setLabel(labels.add), 2200);
        }
      } catch (error) {
        if (status) status.textContent = error.message || labels.error;
      } finally {
        busy = false;
        addButtons.forEach((button) => button.removeAttribute('aria-busy'));
      }
    });
  }

  // --- Offers: copy and apply --------------------------------------------
  const offers = root.querySelector('[data-offers]');
  if (offers) {
    let offerSeen = false;
    if ('IntersectionObserver' in window) {
      const seen = new IntersectionObserver((entries) => {
        if (!offerSeen && entries.some((entry) => entry.isIntersecting)) {
          offerSeen = true;
          seen.disconnect();
          track('view_offer', context({ codes: Array.from(offers.querySelectorAll('[data-offer]')).map((offer) => offer.dataset.code) }));
        }
      }, { threshold: 0.5 });
      seen.observe(offers);
    }

    const say = (offer, text, state) => {
      const region = offer.querySelector('[data-offer-status]');
      if (!region) return;
      region.textContent = '';
      region.dataset.state = state || '';
      window.setTimeout(() => { region.textContent = text; }, 30);
    };

    offers.addEventListener('click', async (event) => {
      const offer = event.target.closest('[data-offer]');
      if (!offer) return;
      const code = offer.dataset.code;

      if (event.target.closest('[data-offer-copy]')) {
        try {
          await navigator.clipboard.writeText(code);
          say(offer, root.dataset.labelCopied || 'Copied', 'ok');
          offer.classList.add('is-copied');
          window.setTimeout(() => offer.classList.remove('is-copied'), 1600);
        } catch (error) {
          const range = document.createRange();
          range.selectNodeContents(offer.querySelector('.offer__code'));
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
        track('copy_offer', context({ code }));
        return;
      }

      const apply = event.target.closest('[data-offer-apply]');
      if (apply) {
        event.preventDefault();
        if (offer.classList.contains('is-applied')) return;
        apply.setAttribute('aria-busy', 'true');
        try {
          const response = await fetch(`/discount/${encodeURIComponent(code)}?redirect=/cart.js`, { headers: { Accept: 'application/json' } });
          if (!response.ok) throw new Error(String(response.status));
          offers.querySelectorAll('[data-offer]').forEach((other) => other.classList.remove('is-applied'));
          offer.classList.add('is-applied');
          say(offer, root.dataset.labelApplied || 'Applied', 'ok');
          track('apply_offer', context({ code }));
        } catch (error) {
          say(offer, root.dataset.labelApplyError || '', 'error');
        } finally {
          apply.removeAttribute('aria-busy');
        }
      }
    });
  }

  root.querySelectorAll('[data-checkout-link]').forEach((link) => {
    link.addEventListener('click', () => track('begin_checkout', context()));
  });

  const buyNow = root.querySelector('[data-buy-now]');
  if (buyNow) {
    buyNow.addEventListener('click', (event) => {
      if (event.target.closest('button, a, [role="button"], shopify-accelerated-checkout')) track('buy_now', context());
    });
  }

  const ratingLink = root.querySelector('[data-rating-link]');
  if (ratingLink) {
    ratingLink.addEventListener('click', () => track('view_reviews', context()));
  }

  // --- Sticky add to cart (mobile) --------------------------------------
  const bar = root.querySelector('[data-sticky-bar]');
  const buyBlock = root.querySelector('[data-buy-block]');
  if (bar && buyBlock && 'IntersectionObserver' in window) {
    // Shown whenever the inline buy block is off screen, above or below, so the
    // CTA is one tap away from first paint on small screens.
    let inView = true;
    let typing = false;
    const sync = () => { bar.hidden = inView || typing; };
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }).observe(buyBlock);
    document.addEventListener('focusin', (event) => {
      typing = event.target.matches('input, textarea, select') && !bar.contains(event.target);
      sync();
    });
    document.addEventListener('focusout', () => { typing = false; sync(); });

    root.addEventListener('click', (event) => {
      if (!event.target.closest('[data-sticky-variant]')) return;
      const picker = root.querySelector('[data-variant-picker]');
      if (picker) picker.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}
