/* ===== WEIRD KID — main.js ===== */

/* Where the forms post to. Leave empty while prototyping (success is simulated).
   Before launch, paste your Formspree / Netlify / Klaviyo endpoint URL here. */
const FORM_ENDPOINTS = {
  newsletter: '',   // e.g. 'https://formspree.io/f/xxxxxxxx'
  contact: ''       // e.g. 'https://formspree.io/f/yyyyyyyy'
};

document.addEventListener('DOMContentLoaded', () => {

  /* ── Scroll Reveal ── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('visible'));
    } else {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(el => revealObserver.observe(el));
    }
  }

  /* ── Active Nav Link (desktop + mobile) ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-links a, .mobile-menu a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  /* ── Footer year ── */
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ── Placeholder links (href="#") shouldn't jump to the top ── */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  /* ── Navbar height → mobile menu offset ── */
  const navbar = document.querySelector('.navbar');
  const setNavHeight = () => {
    if (navbar) document.documentElement.style.setProperty('--nav-h', navbar.offsetHeight + 'px');
  };
  setNavHeight();
  window.addEventListener('resize', setNavHeight);

  /* ── Mobile Menu Toggle ── */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    const spans = hamburger.querySelectorAll('span');
    const setMenu = (open) => {
      mobileMenu.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      if (open) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    };
    hamburger.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) { setMenu(false); hamburger.focus(); }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 768) setMenu(false); });
  }

  /* ── Product Filter (collections page, supports ?filter=tops) ── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card[data-category]');

  if (filterBtns.length && productCards.length) {
    const valid = Array.from(filterBtns).map(b => b.dataset.filter);

    const applyFilter = (cat, animate) => {
      filterBtns.forEach(b => {
        const on = b.dataset.filter === cat;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      productCards.forEach(card => {
        const tags = (card.dataset.category || '').split(/\s+/);
        const show = cat === 'all' || tags.includes(cat);
        if (!animate) {
          card.style.display = show ? 'block' : 'none';
          return;
        }
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          card.style.display = show ? 'block' : 'none';
          if (show) {
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.4s, transform 0.4s';
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            });
          }
        }, 200);
      });
    };

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.filter;
        applyFilter(cat, true);
        const url = new URL(window.location.href);
        if (cat === 'all') url.searchParams.delete('filter'); else url.searchParams.set('filter', cat);
        history.replaceState(null, '', url);
      });
    });

    const initial = new URLSearchParams(window.location.search).get('filter');
    applyFilter(valid.includes(initial) ? initial : 'all', false);
  }

  /* ── Form helper: posts to an endpoint, or simulates success while it's empty ── */
  const submitForm = async (form, endpoint) => {
    if (!endpoint) {
      console.warn('[Weird Kid] No form endpoint set in FORM_ENDPOINTS — simulating success.');
      return true;
    }
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  };

  const flashButton = (btn, text, ok, resetText, ms) => {
    const original = { bg: '', border: '', color: '' };
    btn.textContent = text;
    if (ok) {
      btn.style.background = '#76FF03';
      btn.style.borderColor = '#76FF03';
      btn.style.color = '#111';
    } else {
      btn.style.background = '#FF3D00';
      btn.style.borderColor = '#FF3D00';
      btn.style.color = '#fff';
    }
    setTimeout(() => {
      btn.textContent = resetText;
      btn.style.background = original.bg;
      btn.style.borderColor = original.border;
      btn.style.color = original.color;
      btn.disabled = false;
    }, ms);
  };

  /* ── Newsletter Form ── */
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = newsletterForm.querySelector('button');
      const input = newsletterForm.querySelector('input');
      if (!input.value.trim()) return;
      btn.disabled = true;
      const ok = await submitForm(newsletterForm, FORM_ENDPOINTS.newsletter);
      if (ok) input.value = '';
      flashButton(btn, ok ? 'JOINED! ✓' : 'TRY AGAIN', ok, 'JOIN', 3000);
    });
  }

  /* ── Contact Form ── */
  const contactForm = document.querySelector('.contact-form-wrap');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      const ok = await submitForm(contactForm, FORM_ENDPOINTS.contact);
      if (ok) contactForm.reset();
      flashButton(btn, ok ? 'MESSAGE SENT! ✓' : 'COULD NOT SEND — TRY AGAIN', ok, 'SEND MESSAGE', 3500);
    });
  }

  /* ── Navbar Scroll Style ── */
  if (navbar) {
    const onScroll = () => {
      navbar.style.boxShadow = window.scrollY > 50 ? '0 2px 20px rgba(0,0,0,0.08)' : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Hero sticky notes: tilt toward the pointer ── */
  document.querySelectorAll('.hero-note').forEach(note => {
    note.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = note.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      note.style.setProperty('--ry', (x * 14).toFixed(1) + 'deg');
      note.style.setProperty('--rx', (-y * 14).toFixed(1) + 'deg');
    });
    note.addEventListener('pointerleave', () => {
      note.style.setProperty('--rx', '0deg');
      note.style.setProperty('--ry', '0deg');
    });
  });

  /* ── Doodle random delay variance ── */
  document.querySelectorAll('.doodle').forEach((el, i) => {
    el.style.animationDelay = `${(i * 0.4) % 3}s`;
  });

});
