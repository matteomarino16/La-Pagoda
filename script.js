/* ==========================================================================
   LA PAGODA — Script principale
   --------------------------------------------------------------------------
   1. Configurazione del ristorante (DA COMPILARE)
   2. Applicazione della configurazione alle pagine
   3. Header e navigazione mobile
   4. Animazioni d'ingresso
   5. Parallax leggero del banner
   6. Filtri (menu e galleria)
   7. Lightbox
   8. Pulsante "Torna su" e anno nel footer
   ========================================================================== */

(function () {
  'use strict';

  /* ========================================================================
     1. CONFIGURAZIONE DEL RISTORANTE
     ------------------------------------------------------------------------
     Inserisci qui i dati reali: verranno applicati automaticamente a tutte
     le pagine (header mobile, sezione contatti, footer, mappa).
     I campi lasciati vuoti mostrano i segnaposto presenti nell'HTML
     oppure nascondono il relativo elemento (es. WhatsApp, social).
     ======================================================================== */
  const SITE_CONFIG = {
    name: 'La Pagoda',

    // Indirizzo completo, es. 'Via Roma 1, 00100 Città'
    address: '',

    // Telefono come deve apparire, es. '+39 012 345 6789'
    phone: '',

    // Email, es. 'info@lapagoda.it'
    email: '',

    // Numero WhatsApp in formato internazionale senza '+' e spazi, es. '390123456789'
    whatsapp: '',

    // URL "src" della mappa: Google Maps > Condividi > Incorpora una mappa > copia solo l'URL.
    // Se vuoto ma l'indirizzo è compilato, la mappa viene generata dall'indirizzo.
    mapsEmbedUrl: '',

    // Link ufficiale della scheda Google Maps del ristorante (per "Indicazioni stradali").
    // Se vuoto ma l'indirizzo è compilato, viene generato dall'indirizzo.
    directionsUrl: '',

    // Link a un eventuale sistema di prenotazione online. Se vuoto, "Prenota" usa il telefono.
    bookingUrl: '',

    // Orari di apertura. Lascia l'array vuoto per mostrare il segnaposto.
    // Esempio: { days: 'Martedì – Domenica', time: '12:00–14:30 · 19:00–23:00' }
    hours: [],

    // Profili social: lascia vuoto ciò che non esiste.
    social: {
      instagram: '',
      facebook: '',
      tripadvisor: ''
    }
  };

  const root = document.documentElement;
  root.classList.add('js');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ========================================================================
     2. APPLICAZIONE DELLA CONFIGURAZIONE
     ======================================================================== */
  function applyConfig(cfg) {
    const phoneDigits = cfg.phone.replace(/[^\d+]/g, '');
    const telHref = phoneDigits ? 'tel:' + phoneDigits : '';
    const addressQuery = cfg.address ? encodeURIComponent(cfg.name + ', ' + cfg.address) : '';
    const directions = cfg.directionsUrl ||
      (addressQuery ? 'https://www.google.com/maps/search/?api=1&query=' + addressQuery : '');
    const mapSrc = cfg.mapsEmbedUrl ||
      (addressQuery ? 'https://www.google.com/maps?q=' + addressQuery + '&output=embed' : '');

    const setLink = (el, href, text) => {
      if (href) {
        el.setAttribute('href', href);
        el.removeAttribute('aria-disabled');
        if (text && !el.hasAttribute('data-keep-text')) el.textContent = text;
      } else if (el.tagName === 'A' && el.hasAttribute('data-hide-empty')) {
        el.hidden = true;
      }
    };

    document.querySelectorAll('[data-config]').forEach((el) => {
      switch (el.dataset.config) {
        case 'address':
          if (cfg.address) el.textContent = cfg.address;
          break;
        case 'phone':
          setLink(el, telHref, cfg.phone);
          break;
        case 'email':
          setLink(el, cfg.email ? 'mailto:' + cfg.email : '', cfg.email);
          break;
        case 'whatsapp':
          if (cfg.whatsapp) {
            el.setAttribute('href', 'https://wa.me/' + cfg.whatsapp.replace(/\D/g, ''));
            el.hidden = false;
          } else {
            el.hidden = true;
          }
          break;
        case 'directions':
          if (directions) {
            el.setAttribute('href', directions);
            el.hidden = false;
          } else {
            el.hidden = true;
          }
          break;
        case 'booking':
          // Priorità: sistema di prenotazione > telefono > sezione contatti (href nell'HTML)
          if (cfg.bookingUrl) {
            el.setAttribute('href', cfg.bookingUrl);
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener noreferrer');
          } else if (telHref) {
            el.setAttribute('href', telHref);
          }
          break;
        case 'hours':
          if (cfg.hours.length) {
            el.innerHTML = '';
            cfg.hours.forEach((row) => {
              const li = document.createElement('li');
              const days = document.createElement('span');
              const time = document.createElement('span');
              days.textContent = row.days;
              time.textContent = row.time;
              li.append(days, time);
              el.appendChild(li);
            });
          }
          break;
        default:
          break;
      }
    });

    // Social: mostra solo i profili compilati
    document.querySelectorAll('[data-social]').forEach((list) => {
      let visible = 0;
      list.querySelectorAll('[data-social-link]').forEach((a) => {
        const url = cfg.social[a.dataset.socialLink];
        const li = a.closest('li');
        if (url) {
          a.setAttribute('href', url);
          li.hidden = false;
          visible += 1;
        } else {
          li.hidden = true;
        }
      });
      list.hidden = visible === 0;
    });

    // Mappa: iframe se c'è un URL, altrimenti segnaposto
    document.querySelectorAll('[data-map]').forEach((map) => {
      const iframe = map.querySelector('iframe');
      const placeholder = map.querySelector('.map__placeholder');
      if (mapSrc && iframe) {
        iframe.src = mapSrc;
        iframe.hidden = false;
        if (placeholder) placeholder.hidden = true;
      }
    });
  }

  applyConfig(SITE_CONFIG);

  /* ========================================================================
     3. HEADER E NAVIGAZIONE MOBILE
     ======================================================================== */
  const header = document.querySelector('.site-header');
  const nav = document.getElementById('primary-nav');
  const toggle = document.querySelector('.nav-toggle');
  const overlay = document.querySelector('.nav-overlay');
  const mobileQuery = window.matchMedia('(max-width: 1180px)');
  let lastFocused = null;

  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }

  function getFocusable(container) {
    return Array.from(
      container.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.hidden && el.offsetParent !== null);
  }

  function openNav() {
    if (!nav || !toggle) return;
    lastFocused = document.activeElement;
    nav.classList.add('is-open');
    overlay && overlay.classList.add('is-visible');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Chiudi il menu di navigazione');
    document.body.classList.add('is-locked');
    // Il focus passa al primo link dopo l'avvio della transizione
    window.setTimeout(() => {
      const first = getFocusable(nav)[0];
      first && first.focus();
    }, 60);
  }

  function closeNav(restoreFocus) {
    if (!nav || !toggle || !nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    overlay && overlay.classList.remove('is-visible');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Apri il menu di navigazione');
    document.body.classList.remove('is-locked');
    if (restoreFocus !== false) (lastFocused || toggle).focus();
  }

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      toggle.getAttribute('aria-expanded') === 'true' ? closeNav() : openNav();
    });

    overlay && overlay.addEventListener('click', () => closeNav());

    // Chiusura dopo la selezione di un link
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (mobileQuery.matches) closeNav(false);
      });
    });

    // Escape e focus trap all'interno del drawer
    document.addEventListener('keydown', (e) => {
      if (!nav.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeNav();
        return;
      }
      if (e.key === 'Tab') {
        const items = [toggle].concat(getFocusable(nav));
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // Ritorno al layout desktop: ripristina lo stato
    const onBreakpoint = (e) => {
      if (!e.matches) closeNav(false);
    };
    mobileQuery.addEventListener ? mobileQuery.addEventListener('change', onBreakpoint)
      : mobileQuery.addListener(onBreakpoint);
  }

  /* ========================================================================
     4. ANIMAZIONI D'INGRESSO
     ======================================================================== */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !prefersReducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ========================================================================
     5. PARALLAX LEGGERO DEL BANNER
     Disattivato con prefers-reduced-motion; usa solo transform (GPU).
     ======================================================================== */
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
  let parallaxActive = false;

  function updateParallax() {
    const vh = window.innerHeight;
    parallaxEls.forEach((el) => {
      const section = el.parentElement;
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const progress = (rect.top + rect.height / 2 - vh / 2) / (vh + rect.height);
      el.style.transform = 'translate3d(0,' + (progress * -14).toFixed(2) + '%,0)';
    });
  }

  if (parallaxEls.length && !prefersReducedMotion.matches) {
    parallaxActive = true;
    updateParallax();
  }

  /* Gestione scroll unificata con requestAnimationFrame */
  const toTop = document.querySelector('.to-top');
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      onScrollHeader();
      if (parallaxActive) updateParallax();
      if (toTop) toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8);
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ========================================================================
     6. FILTRI (menu e galleria)
     ------------------------------------------------------------------------
     Struttura HTML:
       <div data-filter-group="nome"> ... <button data-filter="categoria"> ...
       <... data-filter-target="nome"> elementi con data-category="categoria"
     Il valore "all" mostra tutti gli elementi.
     ======================================================================== */
  document.querySelectorAll('[data-filter-group]').forEach((group) => {
    const name = group.dataset.filterGroup;
    const target = document.querySelector('[data-filter-target="' + name + '"]');
    const status = document.querySelector('[data-filter-status="' + name + '"]');
    if (!target) return;

    const buttons = Array.from(group.querySelectorAll('[data-filter]'));
    const items = Array.from(target.querySelectorAll('[data-category]'));

    function applyFilter(value, label) {
      buttons.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.filter === value)));

      let count = 0;
      items.forEach((item) => {
        const match = value === 'all' || item.dataset.category.split(' ').includes(value);
        item.hidden = !match;
        if (match) count += item.matches('[data-count]') ? item.querySelectorAll('[data-count-item]').length : 1;
      });

      if (status) {
        const noun = status.dataset.noun || 'elementi';
        status.textContent = value === 'all'
          ? 'Mostrati tutti: ' + count + ' ' + noun
          : label + ': ' + count + ' ' + noun;
      }
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        applyFilter(btn.dataset.filter, btn.textContent.trim());

        // Sulla pagina menu riporta l'utente all'inizio dell'elenco
        if (target.dataset.filterScroll !== undefined) {
          const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 90;
          if (window.scrollY > top) {
            window.scrollTo({ top: top, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
          }
        }
      });
    });

    // Navigazione con frecce tra i filtri
    group.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const i = buttons.indexOf(document.activeElement);
      if (i === -1) return;
      e.preventDefault();
      const next = e.key === 'ArrowRight' ? (i + 1) % buttons.length : (i - 1 + buttons.length) % buttons.length;
      buttons[next].focus();
      buttons[next].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });

    const initial = buttons.find((b) => b.getAttribute('aria-pressed') === 'true') || buttons[0];
    if (initial) applyFilter(initial.dataset.filter, initial.textContent.trim());
  });

  /* ========================================================================
     7. LIGHTBOX
     ------------------------------------------------------------------------
     Ogni link con classe .js-lightbox apre l'immagine indicata in href.
     Gli elementi con lo stesso data-lightbox formano una sequenza;
     la navigazione considera solo gli elementi visibili (filtri attivi).
     ======================================================================== */
  const triggers = document.querySelectorAll('.js-lightbox');

  if (triggers.length) {
    const icon = {
      close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
      prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
      next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
    };

    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Visualizzatore immagini');
    lb.hidden = true;
    lb.innerHTML =
      '<div class="lightbox__top">' +
        '<p class="lightbox__counter" aria-live="polite"></p>' +
        '<button type="button" class="lightbox__btn lightbox__close" aria-label="Chiudi">' + icon.close + '</button>' +
      '</div>' +
      '<div class="lightbox__stage">' +
        '<button type="button" class="lightbox__btn lightbox__prev" aria-label="Immagine precedente">' + icon.prev + '</button>' +
        '<figure class="lightbox__figure">' +
          '<img class="lightbox__img" src="" alt="">' +
          '<figcaption class="lightbox__caption"></figcaption>' +
        '</figure>' +
        '<button type="button" class="lightbox__btn lightbox__next" aria-label="Immagine successiva">' + icon.next + '</button>' +
      '</div>' +
      '<div aria-hidden="true"></div>';
    document.body.appendChild(lb);

    const lbImg = lb.querySelector('.lightbox__img');
    const lbCaption = lb.querySelector('.lightbox__caption');
    const lbCounter = lb.querySelector('.lightbox__counter');
    const btnClose = lb.querySelector('.lightbox__close');
    const btnPrev = lb.querySelector('.lightbox__prev');
    const btnNext = lb.querySelector('.lightbox__next');
    const stage = lb.querySelector('.lightbox__stage');

    let sequence = [];
    let index = 0;
    let opener = null;

    function visibleSequence(trigger) {
      const groupName = trigger.dataset.lightbox || 'default';
      return Array.from(document.querySelectorAll('.js-lightbox[data-lightbox="' + groupName + '"]'))
        .filter((el) => !el.closest('[hidden]'));
    }

    function show(i) {
      index = (i + sequence.length) % sequence.length;
      const link = sequence[index];
      const thumb = link.querySelector('img');
      const caption = link.dataset.caption || (thumb ? thumb.alt : '');

      lbImg.classList.add('is-loading');
      lbImg.onload = () => lbImg.classList.remove('is-loading');
      lbImg.src = link.getAttribute('href');
      lbImg.alt = thumb ? thumb.alt : caption;
      lbCaption.textContent = caption;
      lbCounter.textContent = (index + 1) + ' / ' + sequence.length;

      const single = sequence.length < 2;
      btnPrev.hidden = single;
      btnNext.hidden = single;
    }

    function openLightbox(trigger) {
      sequence = visibleSequence(trigger);
      opener = trigger;
      lb.hidden = false;
      show(sequence.indexOf(trigger));
      // forza il reflow per avviare la transizione
      void lb.offsetWidth;
      lb.classList.add('is-open');
      document.body.classList.add('is-locked');
      // attende che il dialogo sia visibile prima di spostare il focus
      window.setTimeout(() => btnClose.focus(), 50);
    }

    function closeLightbox() {
      lb.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      const delay = prefersReducedMotion.matches ? 0 : 350;
      window.setTimeout(() => {
        lb.hidden = true;
        lbImg.src = '';
      }, delay);
      opener && opener.focus();
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(trigger);
      });
    });

    btnClose.addEventListener('click', closeLightbox);
    btnPrev.addEventListener('click', () => show(index - 1));
    btnNext.addEventListener('click', () => show(index + 1));

    // Chiusura con clic esterno all'immagine
    lb.addEventListener('click', (e) => {
      if (e.target === lb || e.target === stage || e.target.classList.contains('lightbox__top')) {
        closeLightbox();
      }
    });

    // Tastiera: Escape, frecce, focus trap
    document.addEventListener('keydown', (e) => {
      if (lb.hidden || !lb.classList.contains('is-open')) return;
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          closeLightbox();
          break;
        case 'ArrowLeft':
          if (sequence.length > 1) show(index - 1);
          break;
        case 'ArrowRight':
          if (sequence.length > 1) show(index + 1);
          break;
        case 'Tab': {
          const focusables = [btnClose, btnPrev, btnNext].filter((b) => !b.hidden);
          const pos = focusables.indexOf(document.activeElement);
          e.preventDefault();
          const next = e.shiftKey
            ? (pos <= 0 ? focusables.length - 1 : pos - 1)
            : (pos + 1) % focusables.length;
          focusables[next].focus();
          break;
        }
        default:
          break;
      }
    });

    // Swipe orizzontale su touch
    let touchX = null;
    lb.addEventListener('touchstart', (e) => {
      touchX = e.touches[0].clientX;
    }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (touchX === null || sequence.length < 2) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(dx < 0 ? index + 1 : index - 1);
      touchX = null;
    }, { passive: true });
  }

  /* ========================================================================
     8. PULSANTE "TORNA SU" E ANNO NEL FOOTER
     ======================================================================== */
  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
      const skipTarget = document.getElementById('top') || document.body;
      skipTarget.setAttribute('tabindex', '-1');
      skipTarget.focus({ preventScroll: true });
    });
  }

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
