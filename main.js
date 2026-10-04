import { FECHAS_OCUPADAS } from './fechas-ocupadas.js';

// WhatsApp de Leo (52 = México). Los botones abren el chat con un mensaje ya escrito.
const WHATSAPP_NUMBER = '524521276339';
const waLink = text => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

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

  // 7. Revisor de disponibilidad: primero la fecha, luego las colecciones
  const form = document.getElementById('avail-form');
  const prices = document.getElementById('prices');
  if (form && prices) {
    const $ = id => document.getElementById(id);
    const dateInput = $('avail-date');
    const cityInput = $('avail-city');
    const errorEl = $('avail-error');
    const status = $('avail-status');
    const line = $('avail-line');
    const bar = $('avail-bar');
    const log = $('avail-log');
    const result = $('avail-result');
    const KEY = 'lv-fecha';

    const pad = n => String(n).padStart(2, '0');
    const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
    const fmt = (d, year) => d.toLocaleDateString('es-MX', {
      weekday: 'long', day: 'numeric', month: 'long', ...(year ? { year: 'numeric' } : {})
    }).replace(',', '');
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const today = parse(iso(new Date()));
    const ocupadas = new Set(FECHAS_OCUPADAS);

    dateInput.min = iso(today);

    // Los botones de WhatsApp llevan la fecha, la ciudad y la colección que eligió
    const updateLinks = (value, city) => {
      const cuando = ` Me caso el ${fmt(parse(value), true)}${city !== 'otra' ? ` en ${city}` : ''}.`;
      document.querySelectorAll('a[data-wa]').forEach(a => {
        const card = a.closest('.card');
        let text;
        if (a.id === 'avail-wa') {
          text = ocupadas.has(value)
            ? `Hola Leo.${cuando} Vi en tu página que ya tienes apartada esa fecha, ¿podemos platicar?`
            : `Hola Leo.${cuando} Vi en tu página que tienes libre la fecha y me gustaría apartarla.`;
        } else if (card) {
          text = `Hola Leo.${cuando} Me interesa la colección ${card.querySelector('h3').textContent.trim()}.`;
        } else {
          text = `Hola Leo, vi tu página y me gustaría platicar de mi boda.${cuando}`;
        }
        a.href = waLink(text);
      });
    };
    prices.classList.add('is-locked');

    const unlock = animate => {
      prices.classList.remove('is-locked');
      if (animate) prices.classList.add('is-revealed');
    };

    const showResult = (value, city) => {
      const date = parse(value);
      const libre = !ocupadas.has(value);
      const donde = city === 'otra' ? '' : ` en ${city}`;
      $('avail-kicker').textContent = libre ? 'Buenas noticias' : 'Qué pena';
      $('avail-title').textContent = libre
        ? `El ${fmt(date, true)} está libre.`
        : `El ${fmt(date, true)} ya lo tengo apartado.`;
      $('avail-text').textContent = libre
        ? `Todavía no tengo boda ese día${donde}. Aquí abajo están las colecciones; cuando quieras, escríbeme y lo apartamos.`
        : 'Ese día ya voy a estar en otra boda. Si tienen otra fecha en mente, revísenla aquí, o escríbeme y vemos qué se puede hacer.';
      $('avail-wa').textContent = libre ? 'Apartar mi fecha por WhatsApp' : 'Escribirme por WhatsApp';
      updateLinks(value, city);
      form.hidden = true;
      status.hidden = true;
      result.hidden = false;
    };

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const value = dateInput.value;
      const city = cityInput.value;
      if (!value || !city) {
        errorEl.textContent = 'Elige el día y la ciudad para poder revisar.';
        errorEl.hidden = false;
        return;
      }
      if (value < dateInput.min) {
        errorEl.textContent = 'Esa fecha ya pasó. Elige una que esté por venir.';
        errorEl.hidden = false;
        return;
      }
      errorEl.hidden = true;

      const date = parse(value);
      const total = calm ? 1200 : 5000;
      const extras = ['Revisando fechas cercanas…', 'Revisando los fines de semana de ese mes…', 'Buscando bodas ya apartadas…']
        .sort(() => Math.random() - 0.5).slice(0, 2);
      const lines = ['Revisando calendario…', ...extras, `Confirmando el ${fmt(date)}…`];

      // Fechas realmente apartadas alrededor de la que eligió (máximo tres)
      const cercanas = FECHAS_OCUPADAS.filter(f => f !== value).map(parse)
        .filter(d => d >= today && Math.abs(d - date) <= 45 * 864e5)
        .sort((a, b) => Math.abs(a - date) - Math.abs(b - date)).slice(0, 3)
        .sort((a, b) => a - b);

      form.hidden = true;
      result.hidden = true;
      status.hidden = false;
      log.textContent = '';
      form.closest('.avail').scrollIntoView({ block: 'center', behavior: calm ? 'auto' : 'smooth' });
      bar.style.transitionDuration = '0ms';
      bar.style.width = '0';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        bar.style.transitionDuration = `${total}ms`;
        bar.style.width = '100%';
      }));

      for (let i = 0; i < lines.length; i++) {
        line.textContent = lines[i];
        if (i > 0 && cercanas[i - 1]) {
          const chip = document.createElement('li');
          chip.textContent = `${fmt(cercanas[i - 1])}, apartado`;
          log.append(chip);
        }
        await wait(total / lines.length);
      }

      showResult(value, city);
      unlock(true);
      $('avail-title').focus({ preventScroll: true });
      try { sessionStorage.setItem(KEY, JSON.stringify({ value, city })); } catch { /* sin almacenamiento */ }
    });

    $('avail-reset').addEventListener('click', () => {
      result.hidden = true;
      form.hidden = false;
      dateInput.focus();
    });

    // Si ya revisó su fecha en esta visita, no se le vuelve a pedir
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY));
      if (saved && saved.value >= dateInput.min) {
        dateInput.value = saved.value;
        cityInput.value = saved.city;
        showResult(saved.value, saved.city);
        unlock(false);
      }
    } catch { /* sin almacenamiento */ }
  }
});
