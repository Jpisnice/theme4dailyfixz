/**
 * Product gallery behaviour (progressive enhancement). The markup is a native
 * scroll-snap track that works by swiping or scrolling without this file.
 *
 * - Keeps the counter, dots and thumbnails in sync with the visible slide.
 * - Thumbnail, dot and arrow clicks scroll the track.
 * - Lightbox <dialog>: full-size image, arrows, Esc, focus return.
 * - Listens for `gallery:show` ({ detail: { mediaId } }) so variant changes can
 *   bring the variant's image into view.
 * - Announces view_product_image and play_product_video events.
 */
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

function track(name, data) {
  document.dispatchEvent(new CustomEvent('dfx:track', { detail: { name, data } }));
}

function initGallery(gallery) {
  const trackEl = gallery.querySelector('[data-gallery-track]');
  const slides = Array.from(gallery.querySelectorAll('[data-gallery-slide]'));
  if (!trackEl || slides.length === 0) return;

  const controls = Array.from(gallery.querySelectorAll('[data-gallery-thumb]'));
  const counter = gallery.querySelector('[data-gallery-counter]');
  const counterTemplate = gallery.dataset.labelCounter || '__I__ / __T__';
  const prev = gallery.querySelector('[data-gallery-prev]');
  const next = gallery.querySelector('[data-gallery-next]');
  let active = 0;
  let announcedFirst = false;

  function mark(index) {
    active = index;
    const mediaId = slides[index].dataset.mediaId;
    controls.forEach((control) => {
      const on = control.dataset.mediaId === mediaId;
      control.classList.toggle('is-active', on);
      if (on) control.setAttribute('aria-current', 'true');
      else control.removeAttribute('aria-current');
    });
    if (counter) counter.textContent = counterTemplate.replace('__I__', String(index + 1)).replace('__T__', String(slides.length));
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === slides.length - 1;
  }

  function goTo(index, { announce = true } = {}) {
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    trackEl.scrollTo({ left: slides[clamped].offsetLeft - trackEl.offsetLeft, behavior: REDUCED.matches ? 'auto' : 'smooth' });
    mark(clamped);
    if (announce && clamped > 0) track('view_product_image', { index: clamped + 1 });
  }

  let frame = 0;
  trackEl.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const stride = (slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : slides[0].offsetWidth) || 1;
      const atEnd = trackEl.scrollLeft + trackEl.clientWidth >= trackEl.scrollWidth - 2;
      const index = atEnd ? slides.length - 1 : Math.round(trackEl.scrollLeft / stride);
      if (index !== active && index >= 0 && index < slides.length) {
        mark(index);
        if (index > 0 || announcedFirst) track('view_product_image', { index: index + 1 });
        announcedFirst = true;
      }
    });
  }, { passive: true });

  controls.forEach((control) => {
    control.addEventListener('click', () => {
      const index = slides.findIndex((slide) => slide.dataset.mediaId === control.dataset.mediaId);
      if (index >= 0) goTo(index);
    });
  });
  if (prev) prev.addEventListener('click', () => goTo(active - 1));
  if (next) next.addEventListener('click', () => goTo(active + 1));

  trackEl.addEventListener('play', (event) => {
    if (event.target instanceof HTMLVideoElement) track('play_product_video', { index: active + 1 });
  }, true);

  document.addEventListener('gallery:show', (event) => {
    const mediaId = String((event.detail && event.detail.mediaId) || '');
    const index = slides.findIndex((slide) => slide.dataset.mediaId === mediaId);
    if (index >= 0 && index !== active) goTo(index, { announce: false });
  });

  initLightbox(gallery, slides, (index) => goTo(index, { announce: false }));
  const featured = slides.findIndex((slide) => slide.dataset.mediaId === gallery.dataset.featured);
  if (featured > 0) {
    trackEl.scrollTo({ left: slides[featured].offsetLeft - trackEl.offsetLeft, behavior: 'auto' });
    mark(featured);
  } else {
    mark(0);
  }
}

function initLightbox(gallery, slides, sync) {
  const dialog = gallery.querySelector('[data-lightbox]');
  const image = gallery.querySelector('[data-lightbox-image]');
  if (!dialog || !image || typeof dialog.showModal !== 'function') return;

  const imageSlides = slides.filter((slide) => slide.querySelector('[data-gallery-open]'));
  if (imageSlides.length === 0) return;
  const prev = dialog.querySelector('[data-lightbox-prev]');
  const next = dialog.querySelector('[data-lightbox-next]');
  let position = 0;
  let opener = null;

  function show(index) {
    position = (index + imageSlides.length) % imageSlides.length;
    const trigger = imageSlides[position].querySelector('[data-gallery-open]');
    image.src = trigger.dataset.zoomSrc;
    image.alt = trigger.dataset.zoomAlt || '';
    sync(slides.indexOf(imageSlides[position]));
  }

  gallery.querySelectorAll('[data-gallery-open]').forEach((button) => {
    button.addEventListener('click', () => {
      opener = button;
      const slide = button.closest('[data-gallery-slide]');
      show(imageSlides.indexOf(slide));
      dialog.showModal();
      track('view_product_image', { zoom: true });
    });
  });

  if (imageSlides.length < 2) {
    if (prev) prev.hidden = true;
    if (next) next.hidden = true;
  }
  if (prev) prev.addEventListener('click', () => show(position - 1));
  if (next) next.addEventListener('click', () => show(position + 1));
  dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target.classList.contains('lightbox__inner')) dialog.close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(position - 1);
    if (event.key === 'ArrowRight') show(position + 1);
  });
  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    if (opener) opener.focus();
  });
}

document.querySelectorAll('[data-gallery]').forEach(initGallery);
