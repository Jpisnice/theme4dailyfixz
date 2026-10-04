/**
 * Formats prices in JavaScript the way Liquid's `money` filter does, so text
 * patched in after an AJAX update matches the server-rendered prices.
 *
 * theme.liquid puts the store's money format (for example "Rs. {{amount}}")
 * and currency on <html>. When the shopper sees the store currency, that
 * format is used. In any other presentment currency the store format would
 * carry the wrong symbol, so it falls back to Intl.NumberFormat.
 */
function group(value, decimals, thousands, separator) {
  const [whole, fraction] = value.toFixed(decimals).split('.');
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, thousands) + (fraction ? separator + fraction : '');
}

export function applyFormat(cents, format) {
  const value = Number(cents) / 100;
  return (format || '{{amount}}').replace(/\{\{\s*(\w+)\s*\}\}/, (match, key) => {
    switch (key) {
      case 'amount_no_decimals': return group(value, 0, ',', '.');
      case 'amount_with_comma_separator': return group(value, 2, '.', ',');
      case 'amount_no_decimals_with_comma_separator': return group(value, 0, '.', ',');
      case 'amount_with_apostrophe_separator': return group(value, 2, "'", '.');
      default: return group(value, 2, ',', '.');
    }
  });
}

export function formatMoney(cents) {
  const { moneyFormat, shopCurrency } = document.documentElement.dataset;
  const active = window.Shopify && window.Shopify.currency && window.Shopify.currency.active;
  if (moneyFormat && (!active || active === shopCurrency)) return applyFormat(cents, moneyFormat);
  try {
    return new Intl.NumberFormat(document.documentElement.lang || undefined, {
      style: 'currency',
      currency: active || shopCurrency || 'USD',
    }).format(Number(cents) / 100);
  } catch (error) {
    return (Number(cents) / 100).toFixed(2);
  }
}
