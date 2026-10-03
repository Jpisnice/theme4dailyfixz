/**
 * PIN-code delivery checker (progressive enhancement). The facts above the form
 * are server-rendered; this adds the check. Everything is rule-based from the
 * block settings in data-* attributes: serviceable PIN prefixes (blank = all),
 * fast-lane prefixes, dispatch and transit day ranges and an optional weekly
 * off day. The ETA is labelled "Estimated" and is not carrier data. Only the
 * first three PIN digits are sent to analytics.
 */
const PIN_KEY = 'dfx:pin';
const PIN_PATTERN = /^[1-9][0-9]{5}$/;

function list(value) {
  return String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
}

function num(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function addBusinessDays(start, days, offDay) {
  const date = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  let remaining = days;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    if (offDay === null || date.getDay() !== offDay) remaining -= 1;
  }
  return date;
}

function formatRange(from, to) {
  const locale = document.documentElement.lang || undefined;
  const options = { day: 'numeric', month: 'short' };
  try {
    const formatter = new Intl.DateTimeFormat(locale, options);
    if (typeof formatter.formatRange === 'function' && from.getTime() !== to.getTime()) return formatter.formatRange(from, to);
    return from.getTime() === to.getTime() ? formatter.format(from) : `${formatter.format(from)} – ${formatter.format(to)}`;
  } catch (error) {
    return `${from.toDateString()} – ${to.toDateString()}`;
  }
}

function readPin() {
  try { return window.localStorage.getItem(PIN_KEY) || ''; } catch (error) { return ''; }
}

function savePin(pin) {
  try { window.localStorage.setItem(PIN_KEY, pin); } catch (error) { /* ignore */ }
}

function init(root) {
  const form = root.querySelector('[data-delivery-form]');
  const input = root.querySelector('[data-delivery-input]');
  const result = root.querySelector('[data-delivery-result]');
  if (!form || !input || !result) return;

  const d = root.dataset;
  const serviceable = list(d.serviceable);
  const fast = list(d.fast);
  const offRaw = num(d.offDay);
  const offDay = offRaw === null ? null : offRaw;
  const dispatch = [num(d.dispatchMin), num(d.dispatchMax)];
  const transit = [num(d.transitMin), num(d.transitMax)];
  const fastTransit = [num(d.fastMin), num(d.fastMax)];

  function show(message, state) {
    result.textContent = message;
    result.dataset.state = state;
  }

  function check(pin, silent) {
    if (!PIN_PATTERN.test(pin)) {
      show(d.labelInvalid, 'error');
      input.setAttribute('aria-invalid', 'true');
      return;
    }
    input.removeAttribute('aria-invalid');
    const ok = serviceable.length === 0 || serviceable.some((prefix) => pin.startsWith(prefix));
    if (!silent) document.dispatchEvent(new CustomEvent('dfx:track', { detail: { name: 'check_delivery', data: { pin_prefix: pin.slice(0, 3), serviceable: ok } } }));
    if (!ok) {
      show(d.labelUnavailable.replace('__PIN__', pin), 'error');
      return;
    }
    savePin(pin);
    const isFast = fast.some((prefix) => pin.startsWith(prefix)) && fastTransit[1] !== null;
    const lane = isFast ? fastTransit : transit;
    const lines = [d.labelAvailable.replace('__PIN__', pin)];
    if (dispatch[1] !== null && lane[1] !== null) {
      const today = new Date();
      const earliest = addBusinessDays(today, (dispatch[0] ?? dispatch[1]) + (lane[0] ?? lane[1]), offDay);
      const latest = addBusinessDays(today, dispatch[1] + lane[1], offDay);
      lines.push(d.labelEstimate.replace('__DATES__', formatRange(earliest, latest)));
    }
    if (d.cod === 'true') lines.push(d.labelCod);
    show(lines.join('\n'), 'ok');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    check(input.value.trim());
  });
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 6);
  });

  const saved = readPin();
  if (PIN_PATTERN.test(saved)) {
    input.value = saved;
    check(saved, true);
  }
}

document.querySelectorAll('[data-delivery]').forEach(init);
