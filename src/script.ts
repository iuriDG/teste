// Âmbar — lógica de interface do site (TypeScript)

document.addEventListener('DOMContentLoaded', (): void => {
  initLoader();
  initHeaderScroll();
  initMobileNav();
  initScrollSpy();
  initRevealOnScroll();
  initStatCounters();
  initMenuTabs();
  initTestimonialSlider();
  initGalleryLightbox();
  initReservationForm();
  initBackToTop();
  initFooterYear();
});

/* ---------- Page loader ---------- */
function initLoader(): void {
  const loader = document.getElementById('top-loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    loader.classList.add('is-hidden');
  });
}

/* ---------- Header: solid background on scroll ---------- */
function initHeaderScroll(): void {
  const header = document.getElementById('site-header');
  if (!header) return;

  const applyState = (): void => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };

  applyState();
  window.addEventListener('scroll', applyState, { passive: true });
}

/* ---------- Mobile nav toggle ---------- */
function initMobileNav(): void {
  const toggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (!toggle || !mobileNav) return;

  const close = (): void => {
    toggle.classList.remove('active');
    mobileNav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  mobileNav.querySelectorAll<HTMLAnchorElement>('.mobile-link, .mobile-cta').forEach((link) => {
    link.addEventListener('click', close);
  });
}

/* ---------- Highlight active nav link based on visible section ---------- */
function initScrollSpy(): void {
  const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav-link'));
  if (navLinks.length === 0) return;

  const sections = navLinks
    .map((link) => {
      const id = link.dataset.section;
      return id ? document.getElementById(id) : null;
    })
    .filter((el): el is HTMLElement => el !== null);

  if (sections.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------- Fade/slide elements into view as the user scrolls ---------- */
function initRevealOnScroll(): void {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (items.length === 0) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((item) => observer.observe(item));
}

/* ---------- Animated count-up stats in the "Sobre" section ---------- */
function initStatCounters(): void {
  const numbers = document.querySelectorAll<HTMLElement>('.stat-number');
  if (numbers.length === 0) return;

  const animateCount = (el: HTMLElement): void => {
    const target = Number(el.dataset.target ?? '0');
    const duration = 1400;
    const start = performance.now();

    const tick = (now: number): void => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(eased * target));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target as HTMLElement);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  numbers.forEach((el) => observer.observe(el));
}

/* ---------- Menu category tabs ---------- */
function initMenuTabs(): void {
  const tabs = document.querySelectorAll<HTMLButtonElement>('.menu-tab');
  const items = document.querySelectorAll<HTMLElement>('.menu-item');
  if (tabs.length === 0 || items.length === 0) return;

  const showCategory = (category: string): void => {
    items.forEach((item) => {
      item.classList.toggle('is-visible', item.dataset.category === category);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.category;
      if (!category) return;
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      showCategory(category);
    });
  });

  const initialTab = tabs[0];
  if (initialTab?.dataset.category) {
    showCategory(initialTab.dataset.category);
  }
}

/* ---------- Testimonial slider ---------- */
function initTestimonialSlider(): void {
  const track = document.getElementById('testimonial-track');
  const dotsContainer = document.getElementById('testimonial-dots');
  if (!track || !dotsContainer) return;

  const slides = Array.from(track.children) as HTMLElement[];
  if (slides.length === 0) return;

  let current = 0;
  let timer: number | undefined;

  const dots: HTMLButtonElement[] = slides.map((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Testemunho ${index + 1}`);
    dot.addEventListener('click', () => goTo(index));
    dotsContainer.appendChild(dot);
    return dot;
  });

  const render = (): void => {
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, index) => dot.classList.toggle('active', index === current));
  };

  const goTo = (index: number): void => {
    current = (index + slides.length) % slides.length;
    render();
    restartAutoplay();
  };

  const next = (): void => goTo(current + 1);

  const restartAutoplay = (): void => {
    if (timer !== undefined) window.clearInterval(timer);
    timer = window.setInterval(next, 6000);
  };

  render();
  restartAutoplay();

  const slider = track.closest<HTMLElement>('.testimonial-slider');
  slider?.addEventListener('mouseenter', () => {
    if (timer !== undefined) window.clearInterval(timer);
  });
  slider?.addEventListener('mouseleave', restartAutoplay);
}

/* ---------- Gallery lightbox ---------- */
function initGalleryLightbox(): void {
  const galleryItems = Array.from(document.querySelectorAll<HTMLButtonElement>('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img') as HTMLImageElement | null;
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (galleryItems.length === 0 || !lightbox || !lightboxImg || !closeBtn || !prevBtn || !nextBtn) return;

  const images: string[] = galleryItems.map((item) => item.dataset.full ?? '');
  let current = 0;

  const open = (index: number): void => {
    current = index;
    lightboxImg.src = images[current] ?? '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const close = (): void => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  const show = (delta: number): void => {
    current = (current + delta + images.length) % images.length;
    lightboxImg.src = images[current] ?? '';
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => open(index));
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(-1));
  nextBtn.addEventListener('click', () => show(1));

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) close();
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') show(-1);
    if (event.key === 'ArrowRight') show(1);
  });
}

/* ---------- Reservation form ---------- */
function initReservationForm(): void {
  const form = document.getElementById('reservation-form') as HTMLFormElement | null;
  const success = document.getElementById('form-success');
  if (!form || !success) return;

  const dateInput = form.querySelector<HTMLInputElement>('#date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0] ?? '';
    dateInput.min = today;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const requiredFields = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[required]')
    );

    let isValid = true;
    requiredFields.forEach((field) => {
      const group = field.closest('.form-group');
      const fieldValid = field.checkValidity();
      group?.classList.toggle('invalid', !fieldValid);
      if (!fieldValid) isValid = false;
    });

    if (!isValid) {
      success.hidden = true;
      return;
    }

    // Front-end apenas: sem backend ligado, por isso simula-se a confirmação.
    // Para produção, ligar a um serviço como Formspree ou EmailJS.
    success.hidden = false;
    form.reset();
    requiredFields.forEach((field) => field.closest('.form-group')?.classList.remove('invalid'));
  });

  form.querySelectorAll('[required]').forEach((field) => {
    field.addEventListener('input', () => {
      field.closest('.form-group')?.classList.remove('invalid');
    });
  });
}

/* ---------- Back-to-top button ---------- */
function initBackToTop(): void {
  const button = document.getElementById('back-to-top');
  if (!button) return;

  window.addEventListener(
    'scroll',
    () => {
      button.classList.toggle('visible', window.scrollY > 600);
    },
    { passive: true }
  );

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Footer year ---------- */
function initFooterYear(): void {
  const el = document.getElementById('current-year');
  if (!el) return;
  el.textContent = String(new Date().getFullYear());
}
