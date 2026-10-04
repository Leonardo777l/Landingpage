document.addEventListener('DOMContentLoaded', () => {

  // 1. Fondo de la navegación al hacer scroll
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('is-scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 2. Video del hero: se detiene si la persona prefiere menos movimiento
  const heroVideo = document.getElementById('hero-video');
  if (heroVideo && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroVideo.removeAttribute('autoplay');
    heroVideo.pause();
  }

  // 3. Selector de películas
  const player = document.getElementById('main-video');
  const films = document.querySelectorAll('.film');

  films.forEach(film => {
    film.addEventListener('click', () => {
      films.forEach(f => {
        f.classList.remove('is-active');
        f.setAttribute('aria-pressed', 'false');
      });
      film.classList.add('is-active');
      film.setAttribute('aria-pressed', 'true');

      player.src = film.dataset.src;
      player.load();
      player.play().catch(() => { /* el navegador bloqueó la reproducción automática */ });
    });
  });

  // 4. Barra fija: aparece cuando la persona ya vio las colecciones
  const bar = document.getElementById('sticky-bar');
  const closeBar = document.getElementById('close-bar');
  const packages = document.getElementById('packages');
  const contact = document.getElementById('contact');
  let dismissed = false;
  let pastPackages = false;
  let atContact = false;

  const showBar = (show) => {
    if (show && !dismissed) {
      bar.hidden = false;
      requestAnimationFrame(() => bar.classList.add('is-visible'));
    } else {
      bar.classList.remove('is-visible');
    }
  };
  const updateBar = () => showBar(pastPackages && !atContact);

  if (bar && packages) {
    new IntersectionObserver(([entry]) => {
      pastPackages = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      updateBar();
    }).observe(packages);

    if (contact) {
      new IntersectionObserver(([entry]) => {
        atContact = entry.isIntersecting;
        updateBar();
      }, { threshold: 0.3 }).observe(contact);
    }

    closeBar.addEventListener('click', () => {
      dismissed = true;
      showBar(false);
    });
  }

  // 5. Manifiesto: las palabras se iluminan conforme avanza el scroll
  const manifesto = document.querySelector('[data-words]');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (manifesto && !calm) {
    const words = manifesto.textContent.trim().split(/\s+/);
    manifesto.textContent = '';
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.textContent = word;
      manifesto.append(span, i < words.length - 1 ? ' ' : '');
    });
    manifesto.classList.add('js-words');
    const spans = manifesto.querySelectorAll('span');

    const light = () => {
      const rect = manifesto.getBoundingClientRect();
      const vh = window.innerHeight;
      // Empieza cuando el texto entra por abajo y termina cuando queda centrado en pantalla
      const progress = (vh * 0.9 - rect.top) / (vh * 0.55 + rect.height * 0.5);
      const lit = Math.round(Math.min(1, Math.max(0, progress)) * spans.length);
      spans.forEach((s, i) => s.classList.toggle('is-lit', i < lit));
    };
    window.addEventListener('scroll', light, { passive: true });
    window.addEventListener('resize', light);
    light();
  }

  // 6. Carruseles de la galería
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('.track');
    const buttons = carousel.querySelectorAll('[data-dir]');
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      buttons.forEach(b => {
        b.disabled = b.dataset.dir === '-1' ? track.scrollLeft <= 2 : track.scrollLeft >= max;
      });
    };
    buttons.forEach(b => b.addEventListener('click', () => {
      track.scrollBy({ left: Number(b.dataset.dir) * track.clientWidth * 0.8, behavior: calm ? 'auto' : 'smooth' });
    }));
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });
});
