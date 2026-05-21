/* ===================================================
   ARCO DESIGN — B&B Arco Gentile 2026
=================================================== */

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
window.addEventListener('load', () => window.scrollTo(0, 0));
window.addEventListener('beforeunload', () => window.scrollTo(0, 0));

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- PRELOADER ---------- */
  const preloader = document.getElementById('preloader');
  const preloaderFill = document.getElementById('preloaderFill');
  if (preloader && preloaderFill) {
    let fillProgress = 0;
    const fillInterval = setInterval(() => {
      fillProgress += Math.random() * 18;
      if (fillProgress >= 100) fillProgress = 100;
      preloaderFill.style.width = fillProgress + '%';
      if (fillProgress >= 100) clearInterval(fillInterval);
    }, 80);

    document.body.style.overflow = 'hidden';
    window.addEventListener('load', () => {
      preloaderFill.style.width = '100%';
      setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.style.overflow = '';
      }, 400);
    });
  }

  /* ---------- SCROLL PROGRESS BAR ---------- */
  const scrollProgress = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  }, { passive: true });

  /* ---------- HERO SLIDER ---------- */
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots = document.querySelectorAll('.hero-dot');
  let heroIndex = 0;
  let heroTimer;

  function goToSlide(index) {
    heroSlides[heroIndex].classList.remove('active');
    heroDots[heroIndex].classList.remove('active');
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides[heroIndex].classList.add('active');
    heroDots[heroIndex].classList.add('active');
  }

  function nextSlide() { goToSlide(heroIndex + 1); }

  function startSlider() {
    heroTimer = setInterval(nextSlide, 6000);
  }

  heroDots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(heroTimer);
      goToSlide(parseInt(dot.dataset.index));
      startSlider();
    });
  });

  startSlider();

  /* ---------- NAVBAR scroll ---------- */
  const navbar = document.getElementById('navbar');
  const stickyBar = document.getElementById('stickyCheckinBar');

  function adjustNavbarTop() {
    const stickyH = stickyBar ? stickyBar.offsetHeight : 0;
    navbar.style.top = stickyH + 'px';
  }
  adjustNavbarTop();
  window.addEventListener('resize', adjustNavbarTop);

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  /* ---------- MOBILE MENU ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });

  /* ---------- DARK MODE ---------- */
  const darkToggle = document.getElementById('darkToggle');
  const darkIcon = document.getElementById('darkIcon');
  const saved = localStorage.getItem('arco-theme');
  if (saved === 'dark') applyDark(true);

  darkToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyDark(!isDark);
  });

  function applyDark(on) {
    document.documentElement.setAttribute('data-theme', on ? 'dark' : 'light');
    darkIcon.className = on ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    localStorage.setItem('arco-theme', on ? 'dark' : 'light');
  }

  /* ---------- BOOKING BAR ---------- */
  const MONTHS_IT = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
  const DAYS_IT   = ['Lu','Ma','Me','Gi','Ve','Sa','Do'];

  let bbCheckIn   = null; // 'YYYY-MM-DD'
  let bbCheckOut  = null;
  let bbGuests    = 2;
  let bbRooms     = 1;
  let calOffset   = 0;
  let selecting   = 'in';

  const calOverlay   = document.getElementById('calOverlay');
  const calTitles    = document.getElementById('calTitles');
  const calPanelGrids= document.getElementById('calPanelGrids');
  const calNights    = document.getElementById('calNights');
  const calPrev      = document.getElementById('calPrev');
  const calNext      = document.getElementById('calNext');
  const calConfirm   = document.getElementById('calConfirm');
  const bbArrivoVal  = document.getElementById('bbArrivoVal');
  const bbPartenzaVal= document.getElementById('bbPartenzaVal');
  const guestsVal    = document.getElementById('guestsVal');
  const guestsMinus  = document.getElementById('guestsMinus');
  const guestsPlus   = document.getElementById('guestsPlus');
  const roomsVal     = document.getElementById('roomsVal');
  const roomsMinus   = document.getElementById('roomsMinus');
  const roomsPlus    = document.getElementById('roomsPlus');
  const bookingBtn   = document.getElementById('bookingBtn');

  function toYMD(d) {
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function parseYMD(s) { const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d); }
  function fmtDate(ymd) {
    const d = parseYMD(ymd);
    return d.getDate() + ' ' + MONTHS_IT[d.getMonth()].slice(0,3);
  }

  function buildGrid(base) {
    const today = new Date(); today.setHours(0,0,0,0);
    const grid = document.createElement('div');
    grid.className = 'cal-grid';
    DAYS_IT.forEach(d => {
      const el = document.createElement('div');
      el.className = 'cal-dow'; el.textContent = d; grid.appendChild(el);
    });
    const firstDay = (base.getDay() + 6) % 7;
    for (let i = 0; i < firstDay; i++) {
      const el = document.createElement('div'); el.className = 'cal-day cal-day-empty'; grid.appendChild(el);
    }
    const daysInMonth = new Date(base.getFullYear(), base.getMonth()+1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(base.getFullYear(), base.getMonth(), d);
      const ymd  = toYMD(date);
      const el   = document.createElement('div');
      el.className = 'cal-day';
      el.textContent = d;
      el.dataset.ymd = ymd;
      if (date < today) {
        el.classList.add('cal-day-disabled');
      } else {
        el.addEventListener('click', () => onDayClick(ymd));
        el.addEventListener('mouseenter', () => onDayHover(ymd));
      }
      grid.appendChild(el);
    }
    return grid;
  }

  function applyRangeClasses(hoverYmd) {
    const endYmd = bbCheckOut || hoverYmd || null;
    calPanelGrids.querySelectorAll('.cal-day[data-ymd]').forEach(el => {
      const ymd  = el.dataset.ymd;
      const date = parseYMD(ymd);
      el.classList.remove('cal-day-start','cal-day-end','cal-day-in-range');
      if (ymd === bbCheckIn) el.classList.add('cal-day-start');
      if (endYmd && ymd === endYmd && ymd !== bbCheckIn) el.classList.add('cal-day-end');
      if (bbCheckIn && endYmd && date > parseYMD(bbCheckIn) && date < parseYMD(endYmd)) el.classList.add('cal-day-in-range');
    });
    updateNights(hoverYmd);
  }

  function renderCalendar() {
    const today = new Date(); today.setHours(0,0,0,0);
    const base0 = new Date(today.getFullYear(), today.getMonth() + calOffset, 1);
    const base1 = new Date(today.getFullYear(), today.getMonth() + calOffset + 1, 1);
    calTitles.innerHTML = `<div class="cal-month-title">${MONTHS_IT[base0.getMonth()]} ${base0.getFullYear()}</div><div class="cal-month-title">${MONTHS_IT[base1.getMonth()]} ${base1.getFullYear()}</div>`;
    calPanelGrids.innerHTML = '';
    calPanelGrids.appendChild(buildGrid(base0));
    calPanelGrids.appendChild(buildGrid(base1));
    calPrev.disabled = calOffset <= 0;
    applyRangeClasses();
  }

  function onDayClick(ymd) {
    if (selecting === 'in' || (bbCheckIn && ymd <= bbCheckIn)) {
      bbCheckIn = ymd; bbCheckOut = null; selecting = 'out';
      applyRangeClasses();
      updateDateFields();
    } else {
      bbCheckOut = ymd; selecting = 'in';
      applyRangeClasses();
      updateDateFields();
      closeCal();
    }
  }

  function onDayHover(ymd) {
    if (selecting !== 'out' || !bbCheckIn || ymd <= bbCheckIn) return;
    applyRangeClasses(ymd);
  }

  function updateNights(hoverYmd) {
    const end = bbCheckOut || hoverYmd;
    if (bbCheckIn && end && end > bbCheckIn) {
      const diff = (parseYMD(end) - parseYMD(bbCheckIn)) / 86400000;
      calNights.textContent = diff + (diff === 1 ? ' notte' : ' notti');
    } else { calNights.textContent = selecting === 'out' && bbCheckIn ? 'Seleziona partenza' : ''; }
  }

  function updateDateFields() {
    bbArrivoVal.textContent  = bbCheckIn  ? fmtDate(bbCheckIn)  : 'Scegli data';
    bbPartenzaVal.textContent= bbCheckOut ? fmtDate(bbCheckOut) : 'Scegli data';
    document.getElementById('bbArrivo').classList.toggle('active', !!bbCheckIn);
    document.getElementById('bbPartenza').classList.toggle('active', !!bbCheckOut);
  }

  function openCal() {
    calOverlay.classList.add('open');
    renderCalendar();
  }
  function closeCal() { calOverlay.classList.remove('open'); }

  document.getElementById('bbArrivo').addEventListener('click', e => { e.stopPropagation(); selecting = 'in'; openCal(); });
  document.getElementById('bbPartenza').addEventListener('click', e => { e.stopPropagation(); selecting = bbCheckIn ? 'out' : 'in'; openCal(); });
  calPrev.addEventListener('click', e => { e.stopPropagation(); if (calOffset > 0) { calOffset--; renderCalendar(); } });
  calNext.addEventListener('click', e => { e.stopPropagation(); calOffset++; renderCalendar(); });
  calConfirm.addEventListener('click', e => { e.stopPropagation(); closeCal(); updateDateFields(); });
  document.getElementById('calPanel').addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', () => closeCal());

  /* Contatori ospiti/camere */
  function updateCounters() {
    guestsVal.textContent = bbGuests;
    guestsMinus.disabled  = bbGuests <= 1;
    guestsPlus.disabled   = bbGuests >= 20;
    roomsVal.textContent  = bbRooms;
    roomsMinus.disabled   = bbRooms <= 1;
    roomsPlus.disabled    = bbRooms >= 3;
  }
  guestsMinus.addEventListener('click', e => { e.stopPropagation(); if (bbGuests > 1)  { bbGuests--; updateCounters(); } });
  guestsPlus.addEventListener('click',  e => { e.stopPropagation(); if (bbGuests < 20) { bbGuests++; updateCounters(); } });
  roomsMinus.addEventListener('click',  e => { e.stopPropagation(); if (bbRooms > 1)   { bbRooms--;  updateCounters(); } });
  roomsPlus.addEventListener('click',   e => { e.stopPropagation(); if (bbRooms < 3)   { bbRooms++;  updateCounters(); } });
  updateCounters();

  /* Booking button */
  bookingBtn.addEventListener('click', () => {
    const base   = 'https://arco-gentile.kross.travel/book/step1';
    const params = new URLSearchParams({
      adults: bbGuests, children: '0', rooms: bbRooms,
      guests: bbGuests, n_guests: bbGuests,
      'guests_rooms': bbGuests + ',0;', kross_lang: 'it'
    });
    if (bbCheckIn)  params.set('from', bbCheckIn);
    if (bbCheckOut) params.set('to',   bbCheckOut);
    window.open(base + '?' + params.toString(), '_blank');
  });

  /* ---------- CAROUSEL RECENSIONI ---------- */
  const recCarousel = document.getElementById('recensioniCarousel');
  const recPrev = document.getElementById('recPrev');
  const recNext = document.getElementById('recNext');
  const recDotsEl = document.getElementById('recDots');

  if (recCarousel) {
    const cards = Array.from(recCarousel.querySelectorAll('.recensione-card'));
    let current = 0;

    function buildDots() {
      recDotsEl.innerHTML = '';
      cards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'rec-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        recDotsEl.appendChild(dot);
      });
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, cards.length - 1));
      cards[current].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      cards.forEach((c, i) => c.classList.toggle('active', i === current));
      recDotsEl.querySelectorAll('.rec-dot').forEach((d, i) => d.classList.toggle('active', i === current));
      recPrev.disabled = false;
      recNext.disabled = false;
    }

    recPrev.addEventListener('click', () => goTo(current - 1));
    recNext.addEventListener('click', () => goTo(current + 1));

    buildDots();
    goTo(0);

    /* Separatore + expand button su ogni card */
    cards.forEach(card => {
      const rating = card.querySelector('.rec-rating');
      const text = card.querySelector('.rec-text');
      if (text) {
        const btn = document.createElement('button');
        btn.className = 'rec-expand-btn';
        btn.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
        text.after(btn);
        if (text.classList.contains('rec-no-comment')) {
          btn.classList.add('hidden-btn');
        } else {
          /* Mostra il bottone solo se il testo supera 4 righe */
          requestAnimationFrame(() => {
            if (text.scrollHeight <= text.clientHeight + 4) {
              btn.classList.add('hidden-btn');
            }
          });
          btn.addEventListener('click', () => {
            text.classList.toggle('expanded');
            btn.classList.toggle('open');
          });
        }
      }
    });
  }

  /* ---------- GALLERIA COLLAGE (observer dedicato) ---------- */
  const photoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        photoObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.collage-grid .gallery-item').forEach((el, i) => {
    el.classList.add('anim-scale');
    el.style.transitionDelay = (i * 0.055) + 's';
    el.style.transitionDuration = '0.7s';
    photoObserver.observe(el);
  });

  /* ---------- SERVIZI ACCORDION ---------- */
  const serviziCats = document.querySelectorAll('.servizi-cat');
  serviziCats.forEach(cat => {
    cat.querySelector('.servizi-cat-head').addEventListener('click', () => {
      cat.classList.toggle('open');
    });
  });

  /* ---------- GALLERY FILTER ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden', !match);
      });
    });
  });

  /* ---------- LIGHTBOX ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentIndex = 0;
  let visibleItems = [];

  function openLightbox(index) {
    visibleItems = [...galleryItems].filter(i => !i.classList.contains('hidden'));
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function updateLightbox() {
    const item = visibleItems[currentIndex];
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-overlay span');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = caption ? caption.textContent : '';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => {
      visibleItems = [...galleryItems].filter(it => !it.classList.contains('hidden'));
      const visibleIndex = visibleItems.indexOf(item);
      openLightbox(visibleIndex);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    updateLightbox();
  });

  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % visibleItems.length;
    updateLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') { currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length; updateLightbox(); }
    if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % visibleItems.length; updateLightbox(); }
  });

  /* Touch swipe lightbox */
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 40) return;
    if (diff > 0) { currentIndex = (currentIndex + 1) % visibleItems.length; }
    else { currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length; }
    updateLightbox();
  }, { passive: true });

  /* ---------- CONTACT FORM (Web3Forms) ---------- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalBtnHTML = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      try {
        const scriptUrl = contactForm.action;
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: new FormData(contactForm)
        });
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Inviato!';
        btn.style.background = '#2e7d5e';
        contactForm.reset();
        setTimeout(() => {
          btn.innerHTML = originalBtnHTML;
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      } catch {
        btn.innerHTML = '<i class="fa-solid fa-xmark"></i> Errore, riprova';
        btn.style.background = '#c0392b';
        setTimeout(() => {
          btn.innerHTML = originalBtnHTML;
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      }
    });
  }

  /* ---------- NEWSLETTER FORM ---------- */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      if (input.value) {
        input.value = '';
        input.placeholder = 'Grazie per l\'iscrizione!';
        setTimeout(() => { input.placeholder = 'La tua email'; }, 3000);
      }
    });
  }

  /* ---------- SCROLL TO TOP (legacy removed) ---------- */

  /* ---------- SCROLL ANIMATIONS ---------- */
  const observerOptions = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translate(0, 0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.mappa-container').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-40px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    observer.observe(el);
  });

  document.querySelectorAll('.dove-siamo-info').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(40px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    observer.observe(el);
  });

  document.querySelectorAll('.contatti-info').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-40px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    observer.observe(el);
  });

  document.querySelectorAll('.contatti-form').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(40px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    observer.observe(el);
  });

  document.querySelectorAll('.camera-card, .servizio-card, .recensione-card, .contatto-item, .contatti-intro, .section-subtitle').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  document.querySelectorAll('.section-text').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-40px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    observer.observe(el);
  });

  document.querySelectorAll('.section-image').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(40px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    observer.observe(el);
  });

  document.querySelectorAll('.servizi-cat').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
    observer.observe(el);
  });

  document.querySelectorAll('.section-title, .section-tag').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 0.5s ease ${i % 2 * 0.1}s, transform 0.5s ease ${i % 2 * 0.1}s`;
    observer.observe(el);
  });

  // Chi siamo stats
  document.querySelectorAll('.chi-siamo-stat').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
    observer.observe(el);
  });

  // Info-card con delay progressivo per riga
  document.querySelectorAll('.info-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity 0.55s ease ${(i % 3) * 0.1}s, transform 0.55s ease ${(i % 3) * 0.1}s`;
    observer.observe(el);
  });

  // Info-extra-col con delay progressivo
  document.querySelectorAll('.info-extra-col').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.5s ease ${(i % 3) * 0.08}s, transform 0.5s ease ${(i % 3) * 0.08}s`;
    observer.observe(el);
  });

  /* ---------- ACTIVE NAV LINK ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => navObserver.observe(s));

  /* ---------- BACK TO TOP ---------- */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- LINGUA / i18n ---------- */
  const i18n = {
    it: {
      'nav.chisiamo': 'Chi Siamo', 'nav.camere': 'Camere', 'nav.servizi': 'Servizi',
      'nav.galleria': 'Galleria', 'nav.doveputsiamo': 'Dove Siamo', 'nav.recensioni': 'Recensioni', 'nav.contatti': 'Contatti',
      'sticky.label': 'Hai già una prenotazione?', 'sticky.checkin': 'Check-in Online', 'sticky.manage': 'Gestisci Prenotazione',
      'hero.tag': 'Centro Cittadino', 'hero.title': 'Il tuo spazio di relax nel centro di Bitonto.',
      'hero.desc': 'Una struttura moderna in una corte privata e silenziosa. A pochi passi da Piazza Aldo Moro, alle porte del centro storico.',
      'booking.arrivo': 'Arrivo', 'booking.partenza': 'Partenza', 'booking.ospiti': 'Ospiti', 'booking.camere': 'Camere', 'booking.scegli': 'Scegli data',
      'booking.btn': 'Verifica disponibilità', 'booking.reassurance': 'Miglior tariffa garantita sul nostro sito \u00a0•\u00a0 Colazione inclusa \u00a0•\u00a0 Wi-Fi Premium gratuito',
      'chisiamo.tag': 'L\'Ospitalità', 'chisiamo.title': 'Comfort moderno e tranquillità nel cuore della città.',
      'about.p1': 'Il B&B Arco Gentile è una struttura moderna nata per offrire ai propri ospiti un soggiorno all\'insegna del relax e dell\'autonomia. Ci troviamo in Vico Don Eustachio Gentile, all\'interno di una corte riservata nel pieno centro urbano di Bitonto.',
      'about.p2': 'Questa posizione strategica, a ridosso di Piazza Aldo Moro, permette di ripararsi dal rumore del traffico pur restando alle porte del centro storico e di Piazza Cavour.',
      'about.p3': 'Gli ambienti, completamente rinnovati e curati nei dettagli, dispongono di ingressi indipendenti per garantirti la massima libertà.',
      'camere.tag': 'Le Sistemazioni', 'camere.title': 'Tre camere, un\'unica cura.',
      'cam1.title': 'Camera Matrimoniale Standard', 'cam1.desc': 'Una soluzione accogliente, confortevole e funzionale, ideale per chi cerca praticità e un riposo rigenerante. Dotata di tecnologie moderne tra cui una Smart TV.',
      'cam2.title': 'Camera Matrimoniale con Balcone Privato', 'cam2.desc': 'Stanza spaziosa e luminosa. Il balcone privato si affaccia sulla corte interna, garantendoti un risveglio rilassante e silenzioso nel centro della città.',
      'cam3.title': 'Suite Familiare con Cucina', 'cam3.desc': 'Progettata per offrire il massimo comfort e la giusta privacy a nuclei familiari o piccoli gruppi. Ambienti ampi e separati con cucina privata interamente attrezzata.',
      'cam.night': 'notte', 'cam.book': 'Prenota',
      'cam.guests4': 'Fino a 4 Ospiti', 'cam.guests6': 'Fino a 6 Ospiti', 'cam.ac': 'Aria condizionata',
      'cam.wifi': 'Wi-Fi ad alta velocità', 'cam.entry': 'Ingresso indipendente',
      'cam2.badge': 'Balcone Privato', 'cam2.balcone': 'Balcone e vista corte',
      'cam3.badge': 'Suite', 'cam3.kitchen': 'Cucina attrezzata', 'cam3.rooms': 'Ambienti divisi', 'cam3.indep': 'Massima indipendenza',
      'servizi.tag': 'Il Comfort', 'servizi.title': 'Servizi per il tuo soggiorno.',
      'srv1.title': 'Check-in Flessibile', 'srv1.desc': 'Orari di arrivo e partenza concordabili direttamente con noi, per adattarsi ai tuoi impegni.',
      'srv2.title': 'Parcheggio Vicino', 'srv2.desc': 'Zone di sosta comode e raggiungibili a pochi passi dalla struttura, nel centro di Bitonto.',
      'srv3.title': 'Wi-Fi Premium', 'srv3.desc': 'Connessione wireless stabile e veloce, disponibile gratuitamente in tutta la struttura.',
      'srv4.title': 'Autonomia Completa', 'srv4.desc': 'Gli ingressi indipendenti ti permettono di gestire gli orari di arrivo e partenza in totale libertà.',
      'srv5.title': 'Aria Condizionata', 'srv5.desc': 'Clima perfetto in ogni stagione per un riposo sempre confortevole.',
      'srv6.title': 'Info Turistiche', 'srv6.desc': 'Consigli su itinerari, ristoranti e attrazioni della Puglia su richiesta.',
      'galleria.tag': 'La Struttura', 'galleria.title': 'Scopri gli spazi.',
      'doveputsiamo.tag': 'La Posizione', 'doveputsiamo.title': 'Nel cuore di Bitonto.',
      'recensioni.tag': 'Le Opinioni', 'recensioni.title': 'Cosa dicono i nostri ospiti.',
      'dasapere.tag': 'Informazioni Pratiche', 'dasapere.title': 'Da sapere prima di arrivare.',
      'info.checkin.title': 'Check-in', 'info.checkout.title': 'Check-out',
      'info.checkin.note': 'Per orari diversi contattaci in anticipo',
      'info.col.title': 'Colazione', 'info.col.desc': 'Convenzionata con il bar più vicino alla struttura.',
      'info.online.title': 'Check-in Online', 'info.online.desc': 'Completa il check-in prima di arrivare e risparmia tempo all\'arrivo.',
      'info.access.title': 'Accesso', 'info.access.desc': 'Ingresso indipendente per ogni camera. Totale autonomia. Self check-in disponibile.',
      'info.docs.title': 'Documenti', 'info.docs.desc': 'Al check-in è richiesto un documento d\'identità valido per tutti gli ospiti.',
      'info.cancel.title': 'Cancellazione', 'info.cancel.desc': 'Le condizioni variano a seconda della tipologia di alloggio. Verifica le condizioni applicabili prima di prenotare.',
      'info.bambini.title': 'Bambini', 'info.bambini.desc': 'I bambini di tutte le età sono i benvenuti. Culla gratuita (0–1 anni) su richiesta. Letto extra €15/notte (2+ anni) su richiesta.',
      'info.animali.title': 'Animali', 'info.pets.desc': 'Animali ammessi su richiesta. Potrebbe essere richiesto un supplemento.',
      'info.pagamento.title': 'Pagamento', 'info.pagamento.desc': 'Visa · Mastercard · Maestro · CartaSì · Bancomat · PayPal · Contanti',
      'info.fumatori.title': 'Fumatori', 'info.smoke.desc': 'Fumare non è consentito in tutta la struttura.',
      'info.feste.title': 'Feste', 'info.party.desc': 'Non è permesso organizzare feste o eventi in struttura.',
      'cat.bagno': 'Bagno', 'cat.camera': 'Camera da letto', 'cat.cucina': 'Cucina', 'cat.media': 'Media e tecnologia',
      'cat.soggiorno': 'Area soggiorno', 'cat.esterno': 'Spazi all\'aperto', 'cat.animali': 'Animali', 'cat.altri': 'Altri servizi', 'cat.sicurezza': 'Sicurezza e generali',
      'dove.subtitle': 'Vico Don Eustachio Gentile, 11 — Corte privata a ridosso di Piazza Aldo Moro, alle porte del centro storico. A circa 15 minuti dall’Aeroporto di Bari.',
      'dove.addr': 'Indirizzo', 'dove.centro': 'Centro Storico', 'dove.centro.desc': 'A pochi passi da Piazza Aldo Moro e Piazza Cavour',
      'dove.aero': 'Aeroporto di Bari', 'dove.aero.desc': 'A circa 15 minuti in auto',
      'dove.stazione': 'Stazione di Bitonto', 'dove.stazione.desc': 'A 5 minuti a piedi — linea Bari–Barletta',
      'dove.auto': 'Autostrada A14', 'dove.auto.desc': 'Uscita Bitonto Nord, a circa 10 minuti in auto',
      'dove.naviga': 'Naviga verso di noi',
      'contact.h3': 'Siamo qui per te', 'contact.intro': 'Scrivici o chiamaci, risponderemo al più presto. Puoi anche raggiungerci direttamente in struttura.',
      'form.nome': 'Nome', 'form.nome.ph': 'Il tuo nome', 'form.email': 'Email', 'form.email.ph': 'La tua email',
      'form.oggetto': 'Oggetto', 'form.oggetto.ph': 'Oggetto del messaggio',
      'form.messaggio': 'Messaggio', 'form.messaggio.ph': 'Scrivi il tuo messaggio...',
      'form.submit': 'Invia messaggio', 'form.note': 'Risponderemo entro 24 ore. In alternativa contattaci su <a href="https://wa.me/393278161054" target="_blank">WhatsApp</a>.',
      'footer.nav': 'Navigazione', 'footer.book': 'Prenotazioni', 'footer.prenota': 'Prenota Ora',
      'footer.brand.desc': 'B&B Moderno nel cuore di Bitonto. Una corte riservata, ambienti rinnovati e ospitalità autentica.',
      'cookie.text': 'Questo sito utilizza cookie tecnici necessari al funzionamento. Per maggiori informazioni consulta la nostra <a href="privacy.html" target="_blank">Privacy Policy</a> e la <a href="cookie.html" target="_blank">Cookie Policy</a>.',
      'cookie.accept': 'Accetto', 'cookie.more': 'Maggiori info',
      'contatti.tag': 'Scrivici', 'contatti.title': 'Contatti.',
    },
    en: {
      'nav.chisiamo': 'About Us', 'nav.camere': 'Rooms', 'nav.servizi': 'Services',
      'nav.galleria': 'Gallery', 'nav.doveputsiamo': 'Location', 'nav.recensioni': 'Reviews', 'nav.contatti': 'Contact',
      'sticky.label': 'Already have a booking?', 'sticky.checkin': 'Online Check-in', 'sticky.manage': 'Manage Booking',
      'hero.tag': 'City Centre', 'hero.title': 'Your relaxation space in the heart of Bitonto.',
      'hero.desc': 'A modern property in a private, quiet courtyard. Steps from Piazza Aldo Moro, at the gates of the old town.',
      'booking.arrivo': 'Check-in', 'booking.partenza': 'Check-out', 'booking.ospiti': 'Guests', 'booking.camere': 'Rooms', 'booking.scegli': 'Select date',
      'booking.btn': 'Check availability', 'booking.reassurance': 'Best rate guaranteed on our site \u00a0•\u00a0 Breakfast included \u00a0•\u00a0 Free Premium Wi-Fi',
      'chisiamo.tag': 'Hospitality', 'chisiamo.title': 'Modern comfort and tranquility in the heart of the city.',
      'about.p1': 'B&B Arco Gentile is a modern property created to offer guests a stay focused on relaxation and independence. We are located in Vico Don Eustachio Gentile, inside a private courtyard in the heart of Bitonto.',
      'about.p2': 'This strategic location, near Piazza Aldo Moro, shields you from city traffic while keeping you steps from the historic centre and Piazza Cavour.',
      'about.p3': 'The fully renovated, detail-oriented spaces feature independent entrances to ensure maximum freedom.',
      'camere.tag': 'Accommodations', 'camere.title': 'Three rooms, one care.',
      'cam1.title': 'Double Room Standard', 'cam1.desc': 'A welcoming, comfortable and functional solution, ideal for those seeking practicality and a regenerating rest. Equipped with modern technology including a Smart TV.',
      'cam2.title': 'Double Room with Private Balcony', 'cam2.desc': 'Spacious and bright room. The private balcony overlooks the inner courtyard, ensuring a relaxing and quiet awakening in the city centre.',
      'cam3.title': 'Family Suite with Kitchen', 'cam3.desc': 'Designed to offer maximum comfort and privacy for families or small groups. Large separate rooms with a fully equipped private kitchen.',
      'cam.night': 'night', 'cam.book': 'Book',
      'cam.guests4': 'Up to 4 Guests', 'cam.guests6': 'Up to 6 Guests', 'cam.ac': 'Air conditioning',
      'cam.wifi': 'High-speed Wi-Fi', 'cam.entry': 'Independent entrance',
      'cam2.badge': 'Private Balcony', 'cam2.balcone': 'Balcony and courtyard view',
      'cam3.badge': 'Suite', 'cam3.kitchen': 'Equipped kitchen', 'cam3.rooms': 'Separate rooms', 'cam3.indep': 'Full independence',
      'servizi.tag': 'Comfort', 'servizi.title': 'Services for your stay.',
      'srv1.title': 'Flexible Check-in', 'srv1.desc': 'Arrival and departure times can be arranged directly with us, to fit your schedule.',
      'srv2.title': 'Nearby Parking', 'srv2.desc': 'Convenient parking areas just steps from the property, in the centre of Bitonto.',
      'srv3.title': 'Premium Wi-Fi', 'srv3.desc': 'Fast and stable wireless connection, available free of charge throughout the property.',
      'srv4.title': 'Full Autonomy', 'srv4.desc': 'Independent entrances allow you to manage arrival and departure times with total freedom.',
      'srv5.title': 'Air Conditioning', 'srv5.desc': 'Perfect climate in every season for a consistently comfortable rest.',
      'srv6.title': 'Tourist Info', 'srv6.desc': 'Tips on itineraries, restaurants and attractions in Puglia on request.',
      'galleria.tag': 'The Property', 'galleria.title': 'Discover the spaces.',
      'doveputsiamo.tag': 'Location', 'doveputsiamo.title': 'In the heart of Bitonto.',
      'recensioni.tag': 'Reviews', 'recensioni.title': 'What our guests say.',
      'dasapere.tag': 'Practical Info', 'dasapere.title': 'What to know before you arrive.',
      'info.checkin.title': 'Check-in', 'info.checkout.title': 'Check-out',
      'info.checkin.note': 'For different times, please contact us in advance',
      'info.col.title': 'Breakfast', 'info.col.desc': 'Served at the nearest bar to the property.',
      'info.online.title': 'Online Check-in', 'info.online.desc': 'Complete check-in before you arrive and save time on arrival.',
      'info.access.title': 'Access', 'info.access.desc': 'Independent entrance for each room. Full autonomy. Self check-in available.',
      'info.docs.title': 'Documents', 'info.docs.desc': 'A valid ID is required at check-in for all guests.',
      'info.cancel.title': 'Cancellation', 'info.cancel.desc': 'Conditions vary depending on the type of accommodation. Check applicable conditions before booking.',
      'info.bambini.title': 'Children', 'info.bambini.desc': 'Children of all ages are welcome. Free cot (0–1 years) on request. Extra bed €15/night (2+ years) on request.',
      'info.animali.title': 'Pets', 'info.pets.desc': 'Pets allowed on request. A supplement may be required.',
      'info.pagamento.title': 'Payment', 'info.pagamento.desc': 'Visa · Mastercard · Maestro · CartaSì · Bancomat · PayPal · Cash',
      'info.fumatori.title': 'Smoking', 'info.smoke.desc': 'Smoking is not permitted anywhere in the property.',
      'info.feste.title': 'Parties', 'info.party.desc': 'Organising parties or events on the premises is not permitted.',
      'cat.bagno': 'Bathroom', 'cat.camera': 'Bedroom', 'cat.cucina': 'Kitchen', 'cat.media': 'Media & Technology',
      'cat.soggiorno': 'Living Area', 'cat.esterno': 'Outdoor Spaces', 'cat.animali': 'Pets', 'cat.altri': 'Other Services', 'cat.sicurezza': 'Security & General',
      'dove.subtitle': 'Vico Don Eustachio Gentile, 11 — Private courtyard near Piazza Aldo Moro, at the gates of the historic centre. About 15 minutes from Bari Airport.',
      'dove.addr': 'Address', 'dove.centro': 'Historic Centre', 'dove.centro.desc': 'Steps from Piazza Aldo Moro and Piazza Cavour',
      'dove.aero': 'Bari Airport', 'dove.aero.desc': 'About 15 minutes by car',
      'dove.stazione': 'Bitonto Station', 'dove.stazione.desc': '5 minutes on foot — Bari–Barletta line',
      'dove.auto': 'A14 Motorway', 'dove.auto.desc': 'Bitonto Nord exit, about 10 minutes by car',
      'dove.naviga': 'Navigate to us',
      'contact.h3': 'We are here for you', 'contact.intro': 'Write or call us, we will reply as soon as possible. You can also reach us directly at the property.',
      'form.nome': 'Name', 'form.nome.ph': 'Your name', 'form.email': 'Email', 'form.email.ph': 'Your email',
      'form.oggetto': 'Subject', 'form.oggetto.ph': 'Message subject',
      'form.messaggio': 'Message', 'form.messaggio.ph': 'Write your message...',
      'form.submit': 'Send message', 'form.note': 'We will reply within 24 hours. Alternatively contact us on <a href="https://wa.me/393278161054" target="_blank">WhatsApp</a>.',
      'footer.nav': 'Navigation', 'footer.book': 'Bookings', 'footer.prenota': 'Book Now',
      'footer.brand.desc': 'Modern B&B in the heart of Bitonto. A private courtyard, renovated spaces and authentic hospitality.',
      'cookie.text': 'This site uses technical cookies necessary for its operation. For more information see our <a href="privacy.html" target="_blank">Privacy Policy</a> and <a href="cookie.html" target="_blank">Cookie Policy</a>.',
      'cookie.accept': 'Accept', 'cookie.more': 'More info',
      'contatti.tag': 'Contact Us', 'contatti.title': 'Contacts.',
    },
    es: {
      'nav.chisiamo': 'Quiénes Somos', 'nav.camere': 'Habitaciones', 'nav.servizi': 'Servicios',
      'nav.galleria': 'Galería', 'nav.doveputsiamo': 'Ubicación', 'nav.recensioni': 'Opiniones', 'nav.contatti': 'Contacto',
      'sticky.label': '¿Ya tienes una reserva?', 'sticky.checkin': 'Check-in Online', 'sticky.manage': 'Gestionar Reserva',
      'hero.tag': 'Centro Ciudad', 'hero.title': 'Tu espacio de relax en el corazón de Bitonto.',
      'hero.desc': 'Un alojamiento moderno en un patio privado y tranquilo. A pocos pasos de Piazza Aldo Moro, a las puertas del centro histórico.',
      'booking.arrivo': 'Llegada', 'booking.partenza': 'Salida', 'booking.ospiti': 'Huéspedes', 'booking.camere': 'Habitaciones', 'booking.scegli': 'Seleccionar fecha',
      'booking.btn': 'Verificar disponibilidad', 'booking.reassurance': 'Mejor tarifa garantizada en nuestro sitio \u00a0•\u00a0 Desayuno incluido \u00a0•\u00a0 Wi-Fi Premium gratuito',
      'chisiamo.tag': 'Hospitalidad', 'chisiamo.title': 'Confort moderno y tranquilidad en el corazón de la ciudad.',
      'about.p1': 'B&B Arco Gentile es un alojamiento moderno creado para ofrecer a los huéspedes una estancia de relax y autonomía. Estamos en Vico Don Eustachio Gentile, dentro de un patio privado en el centro de Bitonto.',
      'about.p2': 'Esta ubicación estratégica, cerca de Piazza Aldo Moro, te protege del ruido del tráfico mientras permaneces a las puertas del centro histórico y Piazza Cavour.',
      'about.p3': 'Los espacios completamente renovados cuentan con entradas independientes para garantizarte la máxima libertad.',
      'camere.tag': 'Alojamientos', 'camere.title': 'Tres habitaciones, un solo cuidado.',
      'cam1.title': 'Habitación Doble Estándar', 'cam1.desc': 'Una solución acogedora, confortable y funcional, ideal para quienes buscan comodidad y un descanso reparador. Equipada con tecnología moderna incluyendo Smart TV.',
      'cam2.title': 'Habitación Doble con Balcón Privado', 'cam2.desc': 'Habitación amplia y luminosa. El balcón privado da al patio interior, garantizando un despertar relajante y tranquilo en el centro de la ciudad.',
      'cam3.title': 'Suite Familiar con Cocina', 'cam3.desc': 'Diseñada para ofrecer el máximo confort y privacidad a familias o grupos pequeños. Ambientes amplios y separados con cocina privada totalmente equipada.',
      'cam.night': 'noche', 'cam.book': 'Reservar',
      'cam.guests4': 'Hasta 4 Huéspedes', 'cam.guests6': 'Hasta 6 Huéspedes', 'cam.ac': 'Aire acondicionado',
      'cam.wifi': 'Wi-Fi de alta velocidad', 'cam.entry': 'Entrada independiente',
      'cam2.badge': 'Balcón Privado', 'cam2.balcone': 'Balcón y vista al patio',
      'cam3.badge': 'Suite', 'cam3.kitchen': 'Cocina equipada', 'cam3.rooms': 'Ambientes separados', 'cam3.indep': 'Máxima independencia',
      'servizi.tag': 'Confort', 'servizi.title': 'Servicios para tu estancia.',
      'srv1.title': 'Check-in Flexible', 'srv1.desc': 'Horarios de llegada y salida acordables directamente con nosotros, para adaptarse a tu agenda.',
      'srv2.title': 'Aparcamiento Cercano', 'srv2.desc': 'Zonas de aparcamiento cómodas a pocos pasos del alojamiento, en el centro de Bitonto.',
      'srv3.title': 'Wi-Fi Premium', 'srv3.desc': 'Conexión inalámbrica rápida y estable, disponible gratuitamente en todo el alojamiento.',
      'srv4.title': 'Autonomía Total', 'srv4.desc': 'Las entradas independientes te permiten gestionar los horarios de llegada y salida con total libertad.',
      'srv5.title': 'Aire Acondicionado', 'srv5.desc': 'Clima perfecto en cada estación para un descanso siempre confortable.',
      'srv6.title': 'Info Turística', 'srv6.desc': 'Consejos sobre itinerarios, restaurantes y atracciones de Puglia bajo petición.',
      'galleria.tag': 'El Alojamiento', 'galleria.title': 'Descubre los espacios.',
      'doveputsiamo.tag': 'Ubicación', 'doveputsiamo.title': 'En el corazón de Bitonto.',
      'recensioni.tag': 'Opiniones', 'recensioni.title': 'Lo que dicen nuestros huéspedes.',
      'dasapere.tag': 'Info Práctica', 'dasapere.title': 'Lo que debes saber antes de llegar.',
      'info.checkin.title': 'Check-in', 'info.checkout.title': 'Check-out',
      'info.checkin.note': 'Para horarios diferentes, contáctanos con antelación',
      'info.col.title': 'Desayuno', 'info.col.desc': 'Servido en el bar más cercano al alojamiento.',
      'info.online.title': 'Check-in Online', 'info.online.desc': 'Completa el check-in antes de llegar y ahorra tiempo a tu llegada.',
      'info.access.title': 'Acceso', 'info.access.desc': 'Entrada independiente para cada habitación. Total autonomía. Self check-in disponible.',
      'info.docs.title': 'Documentos', 'info.docs.desc': 'Se requiere un documento de identidad válido en el check-in para todos los huéspedes.',
      'info.cancel.title': 'Cancelación', 'info.cancel.desc': 'Las condiciones varían según el tipo de alojamiento. Verifica las condiciones aplicables antes de reservar.',
      'info.bambini.title': 'Niños', 'info.bambini.desc': 'Los niños de todas las edades son bienvenidos. Cuna gratuita (0–1 años) bajo petición. Cama extra €15/noche (2+ años) bajo petición.',
      'info.animali.title': 'Mascotas', 'info.pets.desc': 'Animales permitidos bajo petición. Puede requerirse un suplemento.',
      'info.pagamento.title': 'Pago', 'info.pagamento.desc': 'Visa · Mastercard · Maestro · CartaSì · Bancomat · PayPal · Efectivo',
      'info.fumatori.title': 'Fumadores', 'info.smoke.desc': 'Está prohibido fumar en todo el alojamiento.',
      'info.feste.title': 'Fiestas', 'info.party.desc': 'No está permitido organizar fiestas o eventos en el alojamiento.',
      'cat.bagno': 'Baño', 'cat.camera': 'Dormitorio', 'cat.cucina': 'Cocina', 'cat.media': 'Medios y tecnología',
      'cat.soggiorno': 'Sala de estar', 'cat.esterno': 'Espacios exteriores', 'cat.animali': 'Mascotas', 'cat.altri': 'Otros servicios', 'cat.sicurezza': 'Seguridad y general',
      'dove.subtitle': 'Vico Don Eustachio Gentile, 11 — Patio privado cerca de Piazza Aldo Moro, a las puertas del centro histórico. A unos 15 minutos del aeropuerto de Bari.',
      'dove.addr': 'Dirección', 'dove.centro': 'Centro Histórico', 'dove.centro.desc': 'A pocos pasos de Piazza Aldo Moro y Piazza Cavour',
      'dove.aero': 'Aeropuerto de Bari', 'dove.aero.desc': 'A unos 15 minutos en coche',
      'dove.stazione': 'Estación de Bitonto', 'dove.stazione.desc': 'A 5 minutos a pie — línea Bari–Barletta',
      'dove.auto': 'Autopista A14', 'dove.auto.desc': 'Salida Bitonto Norte, a unos 10 minutos en coche',
      'dove.naviga': 'Cómo llegar',
      'contact.h3': 'Estamos aquí para ti', 'contact.intro': 'Escíbenos o llámanos, responderemos lo antes posible. También puedes visitarnos directamente.',
      'form.nome': 'Nombre', 'form.nome.ph': 'Tu nombre', 'form.email': 'Email', 'form.email.ph': 'Tu email',
      'form.oggetto': 'Asunto', 'form.oggetto.ph': 'Asunto del mensaje',
      'form.messaggio': 'Mensaje', 'form.messaggio.ph': 'Escribe tu mensaje...',
      'form.submit': 'Enviar mensaje', 'form.note': 'Responderemos en 24 horas. También puedes contactarnos por <a href="https://wa.me/393278161054" target="_blank">WhatsApp</a>.',
      'footer.nav': 'Navegación', 'footer.book': 'Reservas', 'footer.prenota': 'Reservar Ahora',
      'footer.brand.desc': 'B&B moderno en el corazón de Bitonto. Un patio privado, ambientes renovados y hospitalidad auténtica.',
      'cookie.text': 'Este sitio utiliza cookies técnicas necesarias para su funcionamiento. Para más información consulta nuestra <a href="privacy.html" target="_blank">Política de Privacidad</a> y la <a href="cookie.html" target="_blank">Política de Cookies</a>.',
      'cookie.accept': 'Acepto', 'cookie.more': 'Más info',
      'contatti.tag': 'Contáctanos', 'contatti.title': 'Contactos.',
    },
    fr: {
      'nav.chisiamo': 'À propos', 'nav.camere': 'Chambres', 'nav.servizi': 'Services',
      'nav.galleria': 'Galerie', 'nav.doveputsiamo': 'Localisation', 'nav.recensioni': 'Avis', 'nav.contatti': 'Contact',
      'sticky.label': 'Vous avez déjà une réservation ?', 'sticky.checkin': 'Check-in en ligne', 'sticky.manage': 'Gérer la réservation',
      'hero.tag': 'Centre-Ville', 'hero.title': 'Votre espace de détente au cœur de Bitonto.',
      'hero.desc': 'Un logement moderne dans une cour privée et silencieuse. À deux pas de Piazza Aldo Moro, aux portes du centre historique.',
      'booking.arrivo': 'Arrivée', 'booking.partenza': 'Départ', 'booking.ospiti': 'Voyageurs', 'booking.camere': 'Chambres', 'booking.scegli': 'Choisir une date',
      'booking.btn': 'Vérifier les disponibilités', 'booking.reassurance': 'Meilleur tarif garanti sur notre site \u00a0•\u00a0 Petit-déjeuner inclus \u00a0•\u00a0 Wi-Fi Premium gratuit',
      'chisiamo.tag': 'L\'Hospitalité', 'chisiamo.title': 'Confort moderne et tranquillité au cœur de la ville.',
      'about.p1': 'Le B&B Arco Gentile est un logement moderne créé pour offrir aux hôtes un séjour axé sur la détente et l\'autonomie. Nous sommes situés dans le Vico Don Eustachio Gentile, dans une cour privée au cœur de Bitonto.',
      'about.p2': 'Cette position stratégique, à proximité de la Piazza Aldo Moro, vous protège du bruit de la circulation tout en restant aux portes du centre historique et de la Piazza Cavour.',
      'about.p3': 'Les espaces entièrement rénovés disposent d\'entrées indépendantes pour vous garantir une liberté maximale.',
      'camere.tag': 'Les Hébergements', 'camere.title': 'Trois chambres, un seul soin.',
      'cam1.title': 'Chambre Double Standard', 'cam1.desc': 'Une solution accueillante, confortable et fonctionnelle, idéale pour ceux qui recherchent praticité et repos régénérant. Équipée de technologies modernes dont une Smart TV.',
      'cam2.title': 'Chambre Double avec Balcon Privé', 'cam2.desc': 'Chambre spacieuse et lumineuse. Le balcon privé donne sur la cour intérieure, vous garantissant un réveil relaxant et silencieux au centre-ville.',
      'cam3.title': 'Suite Familiale avec Cuisine', 'cam3.desc': 'Conçue pour offrir le maximum de confort et d\'intimité aux familles ou petits groupes. Grands espaces séparés avec cuisine privée entièrement équipée.',
      'cam.night': 'nuit', 'cam.book': 'Réserver',
      'cam.guests4': 'Jusqu’à 4 hôtes', 'cam.guests6': 'Jusqu’à 6 hôtes', 'cam.ac': 'Climatisation',
      'cam.wifi': 'Wi-Fi haut débit', 'cam.entry': 'Entrée indépendante',
      'cam2.badge': 'Balcon Privé', 'cam2.balcone': 'Balcon et vue sur la cour',
      'cam3.badge': 'Suite', 'cam3.kitchen': 'Cuisine équipée', 'cam3.rooms': 'Espaces séparés', 'cam3.indep': 'Indépendance totale',
      'servizi.tag': 'Le Confort', 'servizi.title': 'Services pour votre séjour.',
      'srv1.title': 'Check-in Flexible', 'srv1.desc': 'Horaires d\'arrivée et de départ négociables directement avec nous, pour s\'adapter à vos contraintes.',
      'srv2.title': 'Parking à Proximité', 'srv2.desc': 'Des zones de stationnement pratiques à quelques pas du logement, au centre de Bitonto.',
      'srv3.title': 'Wi-Fi Premium', 'srv3.desc': 'Connexion sans fil rapide et stable, disponible gratuitement dans tout le logement.',
      'srv4.title': 'Autonomie Complète', 'srv4.desc': 'Les entrées indépendantes vous permettent de gérer vos horaires d\'arrivée et de départ en toute liberté.',
      'srv5.title': 'Climatisation', 'srv5.desc': 'Climat parfait en toute saison pour un repos toujours confortable.',
      'srv6.title': 'Infos Touristiques', 'srv6.desc': 'Conseils sur les itinéraires, restaurants et attractions des Pouilles sur demande.',
      'galleria.tag': 'La Structure', 'galleria.title': 'Découvrez les espaces.',
      'doveputsiamo.tag': 'La Position', 'doveputsiamo.title': 'Au cœur de Bitonto.',
      'recensioni.tag': 'Les Avis', 'recensioni.title': 'Ce que disent nos hôtes.',
      'dasapere.tag': 'Infos Pratiques', 'dasapere.title': 'À savoir avant d\'arriver.',
      'info.checkin.title': 'Check-in', 'info.checkout.title': 'Check-out',
      'info.checkin.note': 'Pour des horaires différents, contactez-nous à l\'avance',
      'info.col.title': 'Petit-déjeuner', 'info.col.desc': 'Servi au bar le plus proche du logement.',
      'info.online.title': 'Check-in en ligne', 'info.online.desc': 'Effectuez le check-in avant d\'arriver et gagnez du temps à votre arrivée.',
      'info.access.title': 'Accès', 'info.access.desc': 'Entrée indépendante pour chaque chambre. Autonomie totale. Self check-in disponible.',
      'info.docs.title': 'Documents', 'info.docs.desc': 'Une pièce d\'identité valide est requise au check-in pour tous les hôtes.',
      'info.cancel.title': 'Annulation', 'info.cancel.desc': 'Les conditions varient selon le type de logement. Vérifiez les conditions applicables avant de réserver.',
      'info.bambini.title': 'Enfants', 'info.bambini.desc': 'Les enfants de tout âge sont les bienvenus. Lit bébé gratuit (0–1 an) sur demande. Lit supplémentaire €15/nuit (2+ ans) sur demande.',
      'info.animali.title': 'Animaux', 'info.pets.desc': 'Animaux acceptés sur demande. Un supplément peut être demandé.',
      'info.pagamento.title': 'Paiement', 'info.pagamento.desc': 'Visa · Mastercard · Maestro · CartaSì · Bancomat · PayPal · Espèces',
      'info.fumatori.title': 'Fumeurs', 'info.smoke.desc': 'Il est interdit de fumer dans tout le logement.',
      'info.feste.title': 'Fêtes', 'info.party.desc': 'Il n\'est pas permis d\'organiser des fêtes ou événements dans le logement.',
      'cat.bagno': 'Salle de bain', 'cat.camera': 'Chambre', 'cat.cucina': 'Cuisine', 'cat.media': 'Médias et technologie',
      'cat.soggiorno': 'Salon', 'cat.esterno': 'Espaces extérieurs', 'cat.animali': 'Animaux', 'cat.altri': 'Autres services', 'cat.sicurezza': 'Sécurité et général',
      'dove.subtitle': 'Vico Don Eustachio Gentile, 11 — Cour privée près de la Piazza Aldo Moro, aux portes du centre historique. À environ 15 minutes de l’aéroport de Bari.',
      'dove.addr': 'Adresse', 'dove.centro': 'Centre Historique', 'dove.centro.desc': 'À deux pas de la Piazza Aldo Moro et Piazza Cavour',
      'dove.aero': 'Aéroport de Bari', 'dove.aero.desc': 'À environ 15 minutes en voiture',
      'dove.stazione': 'Gare de Bitonto', 'dove.stazione.desc': 'À 5 minutes à pied — ligne Bari–Barletta',
      'dove.auto': 'Autoroute A14', 'dove.auto.desc': 'Sortie Bitonto Nord, à environ 10 minutes en voiture',
      'dove.naviga': 'Nous trouver',
      'contact.h3': 'Nous sommes là pour vous', 'contact.intro': 'Écrivez-nous ou appelez-nous, nous répondrons au plus vite. Vous pouvez aussi nous rejoindre directement.',
      'form.nome': 'Prénom', 'form.nome.ph': 'Votre prénom', 'form.email': 'Email', 'form.email.ph': 'Votre email',
      'form.oggetto': 'Objet', 'form.oggetto.ph': 'Objet du message',
      'form.messaggio': 'Message', 'form.messaggio.ph': 'Écrivez votre message...',
      'form.submit': 'Envoyer le message', 'form.note': 'Nous répondrons dans les 24 heures. Vous pouvez aussi nous contacter sur <a href="https://wa.me/393278161054" target="_blank">WhatsApp</a>.',
      'footer.nav': 'Navigation', 'footer.book': 'Réservations', 'footer.prenota': 'Réserver Maintenant',
      'footer.brand.desc': 'B&B moderne au cœur de Bitonto. Une cour privée, des espaces rénovés et une hospitalité authentique.',
      'cookie.text': 'Ce site utilise des cookies techniques nécessaires à son fonctionnement. Pour plus d’informations consultez notre <a href="privacy.html" target="_blank">Politique de confidentialité</a> et la <a href="cookie.html" target="_blank">Politique des cookies</a>.',
      'cookie.accept': 'Accepter', 'cookie.more': 'Plus d’infos',
      'contatti.tag': 'Nous Écrire', 'contatti.title': 'Contacts.',
    }
  };

  function applyLang(lang) {
    const t = i18n[lang];
    if (!t) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (!t[key]) return;
      if (/<[a-z][\s\S]*>/i.test(t[key])) {
        el.innerHTML = t[key];
      } else {
        el.textContent = t[key];
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (t[key]) el.placeholder = t[key];
    });
    document.querySelectorAll('[data-i18n-tag]').forEach(el => {
      const key = el.dataset.i18nTag;
      const icon = el.dataset.i18nIcon;
      if (t[key]) el.innerHTML = `<i class="fa-solid ${icon}"></i> ${t[key]}`;
    });
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    localStorage.setItem('lang', lang);
  }

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  const savedLang = localStorage.getItem('lang');
  if (savedLang && savedLang !== 'it') applyLang(savedLang);

  /* ---------- COOKIE BANNER ---------- */
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieAccept = document.getElementById('cookieAccept');
  if (cookieBanner) {
    if (localStorage.getItem('cookieAccepted')) {
      cookieBanner.style.display = 'none';
    }
    if (cookieAccept) {
      cookieAccept.addEventListener('click', () => {
        localStorage.setItem('cookieAccepted', '1');
        cookieBanner.style.opacity = '0';
        cookieBanner.style.transform = 'translateY(20px)';
        setTimeout(() => { cookieBanner.style.display = 'none'; }, 300);
      });
    }
  }

});
