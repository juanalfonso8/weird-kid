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


  /* ── Shop dropdown (hover handled in CSS; click/keyboard here) ── */
  const hasMenu = document.querySelector('.has-menu');
  if (hasMenu) {
    const caret = hasMenu.querySelector('.nav-caret');
    const setMega = (open) => { hasMenu.classList.toggle('open', open); caret.setAttribute('aria-expanded', String(open)); };
    caret.addEventListener('click', (e) => { e.stopPropagation(); setMega(!hasMenu.classList.contains('open')); });
    document.addEventListener('click', (e) => { if (!hasMenu.contains(e.target)) setMega(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMega(false); });
  }

  /* ── Mobile Shop accordion ── */
  document.querySelectorAll('.mm-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.mm-group');
      const open = !group.classList.contains('open');
      group.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.querySelector('span').textContent = open ? '\u2212' : '+';
    });
  });

  /* ── Account modal (demo only: nothing is sent anywhere yet) ── */
  const overlay = document.getElementById('acct-overlay');
  if (overlay) {
    const form = overlay.querySelector('#acct-form');
    const heading = overlay.querySelector('.acct-heading');
    const nameField = overlay.querySelector('.acct-name');
    const nameInput = overlay.querySelector('#acct-name');
    const errorEl = overlay.querySelector('.acct-error');
    const submitBtn = overlay.querySelector('.acct-submit');
    const done = overlay.querySelector('.acct-done');
    const doneMsg = overlay.querySelector('.acct-done-msg');
    const tabsEl = overlay.querySelector('.acct-tabs');
    const labelEls = document.querySelectorAll('.nav-account-label');
    let mode = 'signin', lastFocus = null;
    const store = {
      get() { try { return localStorage.getItem('wk-user'); } catch (e) { return null; } },
      set(v) { try { v ? localStorage.setItem('wk-user', v) : localStorage.removeItem('wk-user'); } catch (e) {} }
    };
    const setTab = (m) => {
      mode = m;
      overlay.querySelectorAll('.acct-tab').forEach(t => {
        const on = t.dataset.tab === m; t.classList.toggle('active', on); t.setAttribute('aria-selected', String(on));
      });
      nameField.hidden = m !== 'signup';
      heading.textContent = m === 'signup' ? 'Join the weirdos.' : 'Welcome back, weirdo.';
      submitBtn.textContent = m === 'signup' ? 'Create account' : 'Sign in';
      errorEl.hidden = true;
    };
    const refreshLabel = () => {
      const u = store.get();
      labelEls.forEach(l => { l.textContent = u ? 'Hi, ' + u.split(' ')[0] : 'Account'; });
    };
    const showDone = (name) => {
      form.hidden = true; tabsEl.hidden = true; heading.textContent = 'You\u2019re in.';
      doneMsg.textContent = 'Hey ' + name.split(' ')[0] + ' \u2726';
      done.hidden = false;
    };
    const open = () => {
      lastFocus = document.activeElement;
      overlay.hidden = false; document.body.style.overflow = 'hidden';
      const u = store.get();
      if (u) { showDone(u); } else { form.hidden = false; tabsEl.hidden = false; done.hidden = true; setTab(mode); }
      const first = overlay.querySelector('input:not([hidden]), .acct-continue');
      setTimeout(() => (u ? overlay.querySelector('.acct-continue') : form.querySelector('input:not([type=hidden])')).focus(), 30);
    };
    const close = () => {
      overlay.hidden = true; document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    document.querySelectorAll('[data-account-open]').forEach(b => b.addEventListener('click', () => {
      if (mobileMenu && mobileMenu.classList.contains('open')) hamburger.click();
      open();
    }));
    overlay.querySelector('.acct-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) close(); });
    overlay.querySelectorAll('.acct-tab').forEach(t => t.addEventListener('click', () => setTab(t.dataset.tab)));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.email.value.trim(), pass = form.password.value;
      if (!/^\S+@\S+\.\S+$/.test(email)) { errorEl.textContent = 'Enter a valid email.'; errorEl.hidden = false; form.email.focus(); return; }
      if (pass.length < 6) { errorEl.textContent = 'Password needs at least 6 characters.'; errorEl.hidden = false; form.password.focus(); return; }
      const name = (mode === 'signup' && nameInput.value.trim()) || email.split('@')[0];
      store.set(name); refreshLabel(); showDone(name); form.reset();
    });
    overlay.querySelector('.acct-continue').addEventListener('click', close);
    overlay.querySelector('.acct-signout').addEventListener('click', () => { store.set(''); refreshLabel(); close(); });
    refreshLabel();
  }
});
