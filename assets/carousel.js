/**
 * Scroll-snap carousel (progressive enhancement). Without this file the track
 * is a horizontally scrollable, snapping row. With it: pagination dots, optional
 * autoplay (off under reduced motion, paused on hover/focus, with a pause
 * button), and theme-editor support (selecting a slide block scrolls to it).
 * Configuration comes from data-* attributes on the [data-carousel] element.
 */
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

function initCarousel(root) {
  const track = root.querySelector('[data-carousel-track]');
  if (!track) return;
  const slides = Array.from(track.children);
  if (slides.length < 2) return;

  let active = 0;
  let timer = null;
  let paused = false;
  let hovering = false;
  const seconds = Number(root.dataset.autoplay) || 0;

  const dots = document.createElement('div');
  dots.className = 'carousel__dots';
  const buttons = slides.map((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'carousel__dot';
    button.setAttribute('aria-label', `${root.dataset.labelSlide || 'Go to slide'} ${index + 1}`);
    button.addEventListener('click', () => goTo(index));
    dots.append(button);
    return button;
  });

  function mark(index) {
    active = index;
    buttons.forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  }

  function goTo(index) {
    const target = slides[(index + slides.length) % slides.length];
    track.scrollTo({
      left: target.offsetLeft - track.offsetLeft,
      behavior: REDUCED.matches ? 'auto' : 'smooth',
    });
  }

  function onScroll() {
    const slideWidth = slides[0].getBoundingClientRect().width || 1;
    const index = Math.round(track.scrollLeft / (slideWidth + parseFloat(getComputedStyle(track).columnGap || '0')));
    if (index !== active && index >= 0 && index < slides.length) mark(index);
  }

  let frame = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(onScroll);
  }, { passive: true });

  root.append(dots);
  mark(0);

  function stop() {
    window.clearInterval(timer);
    timer = null;
  }
  function start() {
    stop();
    if (!seconds || paused || hovering || REDUCED.matches || document.hidden) return;
    timer = window.setInterval(() => goTo(active + 1), seconds * 1000);
  }

  if (seconds && !REDUCED.matches) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'carousel__toggle';
    toggle.textContent = root.dataset.labelPause || 'Pause';
    toggle.addEventListener('click', () => {
      paused = !paused;
      toggle.textContent = paused ? root.dataset.labelPlay || 'Play' : root.dataset.labelPause || 'Pause';
      start();
    });
    dots.append(toggle);

    root.addEventListener('pointerenter', () => { hovering = true; start(); });
    root.addEventListener('pointerleave', () => { hovering = false; start(); });
    root.addEventListener('focusin', () => { hovering = true; start(); });
    root.addEventListener('focusout', () => { hovering = false; start(); });
    document.addEventListener('visibilitychange', start);
    start();
  }

  // Theme editor: bring a selected slide into view.
  root.addEventListener('shopify:block:select', (event) => {
    const index = slides.indexOf(event.target.closest('.promo__slide') || event.target);
    if (index >= 0) goTo(index);
  });
}

document.querySelectorAll('[data-carousel]').forEach(initCarousel);
