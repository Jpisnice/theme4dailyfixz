/**
 * Delivery promise and PIN-code checker (progressive enhancement). The facts
 * are server-rendered; this adds an upfront estimated delivery range, an
 * optional "order within X to dispatch today" countdown and the PIN check.
 * Everything is rule-based from the block settings in data-* attributes:
 * serviceable PIN prefixes (blank = all), fast-lane prefixes, dispatch and
 * transit day ranges, a same-day dispatch cutoff hour (0 = off) and an
 * optional weekly off day. Times use the shop's UTC offset, not the visitor's.
 * The ETA is labelled "Estimated" and is not carrier data. Only the first
 * three PIN digits are sent to analytics.
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

// A Date whose local fields read as the shop's wall clock, from a "+0530" offset.
function shopNow(offset) {
  const match = /^([+-])(\d{2})(\d{2})$/.exec(offset || '');
  if (!match) return new Date();
  const minutes = (match[1] === '-' ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3]));
  const shifted = new Date(Date.now() + minutes * 60000);
  return new Date(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate(), shifted.getUTCHours(), shifted.getUTCMinutes());
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
  const options = { day: 'numeric', month: 'short', weekday: 'short' };
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
  const promise = root.querySelector('[data-delivery-promise]');
  const etaLine = root.querySelector('[data-delivery-eta]');
  const cutoffLine = root.querySelector('[data-delivery-cutoff]');

  const d = root.dataset;
  const serviceable = list(d.serviceable);
  const fast = list(d.fast);
  const offDay = num(d.offDay);
  const cutoffHour = num(d.cutoffHour) || 0;
  const dispatch = [num(d.dispatchMin), num(d.dispatchMax)];
  const transit = [num(d.transitMin), num(d.transitMax)];
  const fastTransit = [num(d.fastMin), num(d.fastMax)];
  let checkedPin = '';

  // Before the cutoff on a working day, orders leave today. After it they
  // follow the dispatch range, or the next business day when none is set.
  function timing() {
    const now = shopNow(d.shopOffset);
    const working = offDay === null || now.getDay() !== offDay;
    const minutesLeft = cutoffHour * 60 - (now.getHours() * 60 + now.getMinutes());
    const beforeCutoff = cutoffHour > 0 && working && minutesLeft > 0;
    let days = dispatch;
    if (beforeCutoff) days = [0, 0];
    else if (cutoffHour > 0 && dispatch[1] === null) days = [1, 1];
    return { now, beforeCutoff, minutesLeft, days };
  }

  function estimate(lane, { now, days } = timing()) {
    if (days[1] === null || lane[1] === null) return '';
    const earliest = addBusinessDays(now, (days[0] ?? days[1]) + (lane[0] ?? lane[1]), offDay);
    const latest = addBusinessDays(now, days[1] + lane[1], offDay);
    return d.labelEstimate.replace('__DATES__', formatRange(earliest, latest));
  }

  function renderPromise() {
    if (!promise || !etaLine || !cutoffLine) return;
    const moment = timing();
    const { beforeCutoff, minutesLeft } = moment;
    etaLine.textContent = checkedPin ? '' : estimate(transit, moment);
    etaLine.hidden = etaLine.textContent === '';
    cutoffLine.hidden = !beforeCutoff;
    if (beforeCutoff) {
      const hours = Math.floor(minutesLeft / 60);
      const minutes = minutesLeft % 60;
      let time = d.labelMinutes.replace('__M__', String(minutes));
      if (hours > 0) {
        time = minutes > 0
          ? d.labelHoursMinutes.replace('__H__', String(hours)).replace('__M__', String(minutes))
          : d.labelHours.replace('__H__', String(hours));
      }
      cutoffLine.textContent = d.labelCutoff.replace('__TIME__', time);
    }
    promise.hidden = etaLine.hidden && cutoffLine.hidden;
  }

  function show(message, state) {
    // Skip identical text so the minute refresh does not re-announce the live region.
    if (result.textContent === message && result.dataset.state === state) return;
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
      checkedPin = '';
      show(d.labelUnavailable.replace('__PIN__', pin), 'error');
      renderPromise();
      return;
    }
    savePin(pin);
    const isFast = fast.some((prefix) => pin.startsWith(prefix)) && fastTransit[1] !== null;
    const eta = estimate(isFast ? fastTransit : transit);
    const lines = [d.labelAvailable.replace('__PIN__', pin)];
    if (eta) lines.push(eta);
    if (d.cod === 'true') lines.push(d.labelCod);
    // The PIN result carries its own estimate, so the generic one steps aside.
    checkedPin = eta ? pin : '';
    show(lines.join('\n'), 'ok');
    renderPromise();
  }

  renderPromise();
  window.setInterval(() => {
    renderPromise();
    if (checkedPin && input) check(checkedPin, true);
  }, 60000);

  if (!form || !input || !result) return;

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
