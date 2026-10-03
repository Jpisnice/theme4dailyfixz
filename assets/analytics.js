/**
 * Thin analytics dispatcher. Components announce events with
 *   document.dispatchEvent(new CustomEvent('dfx:track', { detail: { name, data } }))
 * or window.DFX.track(name, data). Each event is published to, in order:
 * Shopify.analytics.publish (web pixels), window.dataLayer, and a
 * `theme:analytics` DOM event. Context (traffic source, visitor type) comes
 * from context.js. No personal data is sent: delivery events carry only the
 * first three digits of a PIN code.
 */
function context() {
  const dfx = window.DFX || {};
  return dfx.context || {};
}

function track(name, data) {
  const payload = Object.assign({ event: name }, context(), data || {});
  try {
    if (window.Shopify && window.Shopify.analytics && typeof window.Shopify.analytics.publish === 'function') {
      window.Shopify.analytics.publish(name, payload);
    }
  } catch (error) {
    // Analytics must never break the page.
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  document.dispatchEvent(new CustomEvent('theme:analytics', { detail: payload }));
}

document.addEventListener('dfx:track', (event) => {
  const detail = event.detail || {};
  if (detail.name) track(detail.name, detail.data);
});

window.DFX = Object.assign(window.DFX || {}, { track });
