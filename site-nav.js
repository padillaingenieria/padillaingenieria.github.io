(() => {
  const toggle = document.querySelector('.menu-toggle');
  const closeButton = document.querySelector('.menu-close');
  const nav = document.getElementById('site-nav');
  const backdrop = document.querySelector('.menu-backdrop');
  if (!toggle || !closeButton || !nav || !backdrop) return;

  const links = [...nav.querySelectorAll('a[href]')];
  const mobile = window.matchMedia('(max-width: 700px)');
  const close = (restoreFocus = false) => {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    backdrop.hidden = true;
    if (restoreFocus && mobile.matches) toggle.focus();
  };
  const open = () => {
    if (!mobile.matches) return;
    backdrop.hidden = false;
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
    closeButton.focus();
  };

  toggle.addEventListener('click', () => document.body.classList.contains('menu-open') ? close(true) : open());
  closeButton.addEventListener('click', () => close(true));
  backdrop.addEventListener('click', () => close(true));
  document.addEventListener('keydown', event => {
    if (!document.body.classList.contains('menu-open')) return;
    if (event.key === 'Escape') close(true);
    if (event.key === 'Tab') {
      const items = [closeButton, ...links];
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  links.forEach(link => link.addEventListener('click', () => close()));
  mobile.addEventListener('change', () => { if (!mobile.matches) close(); });

  const sections = ['servicios', 'capacidades', 'proyectos', 'vision', 'contacto'];
  const onHome = sections.some(id => document.getElementById(id));
  const setActive = id => {
    links.forEach(link => {
      const destination = new URL(link.href);
      const active = id === 'contacto' ? destination.pathname === '/contacto/' : destination.hash === '#' + id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  if (!onHome) {
    setActive(window.location.pathname.startsWith('/contacto/') ? 'contacto' : 'proyectos');
    return;
  }

  let queued = false;
  const update = () => {
    queued = false;
    const threshold = (document.querySelector('header')?.offsetHeight || 0) + 130;
    let current = '';
    for (const id of sections) {
      const section = document.getElementById(id);
      if (section && section.getBoundingClientRect().top <= threshold) current = id;
    }
    setActive(current);
  };
  const schedule = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', schedule);
  links.forEach(link => link.addEventListener('click', () => {
    const id = new URL(link.href).hash.slice(1);
    if (sections.includes(id)) setActive(id);
  }));
  schedule();
})();