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
});
