// Reviews filtering and "show more" over the server-rendered list. Filters
// (stars or "with photos") come from the chips and the distribution bars; the
// live region reports "Showing N of M". Announces view_reviews and
// filter_reviews.

function track(name, data) {
  document.dispatchEvent(new CustomEvent('dfx:track', { detail: { name, data } }));
}

function initReviews(section) {
  const items = Array.from(section.querySelectorAll('[data-review]'));
  const chips = Array.from(section.querySelectorAll('.reviews__chip'));
  const more = section.querySelector('[data-review-more]');
  const count = section.querySelector('[data-review-count]');
  const batch = Number(section.dataset.batch) || 6;
  const template = section.dataset.labelCount || '__SHOWN__ / __TOTAL__';
  let filter = 'all';
  let limit = batch;

  const matches = (item) => {
    if (filter === 'all') return true;
    if (filter === 'photos') return item.dataset.photos === 'true';
    return item.dataset.rating === filter;
  };

  function render() {
    const matching = items.filter(matches);
    items.forEach((item) => { item.hidden = true; });
    matching.slice(0, limit).forEach((item) => { item.hidden = false; });
    const shown = Math.min(limit, matching.length);
    if (count) count.textContent = template.replace('__SHOWN__', String(shown)).replace('__TOTAL__', String(matching.length));
    if (more) more.hidden = matching.length <= limit;
    chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.reviewFilter === filter)));
  }

  section.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-review-filter]');
    if (trigger) {
      const next = trigger.dataset.reviewFilter;
      filter = filter === next && next !== 'all' ? 'all' : next;
      limit = batch;
      render();
      track('filter_reviews', { filter });
      return;
    }
    if (event.target.closest('[data-review-more]')) {
      const firstHidden = items.filter(matches)[limit];
      limit += batch;
      render();
      if (firstHidden) {
        firstHidden.setAttribute('tabindex', '-1');
        firstHidden.focus({ preventScroll: true });
      }
    }
  });

  if ('IntersectionObserver' in window) {
    const seen = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        seen.disconnect();
        track('view_reviews', { source: 'scroll' });
      }
    }, { threshold: 0.25 });
    seen.observe(section);
  }

  render();
}

document.querySelectorAll('[data-reviews]').forEach(initReviews);
