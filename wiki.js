(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const input = $('#wiki-search');
  const results = $('#search-results');
  const items = window.WIKI_SEARCH || [];
  function closeSearch() {
    results.hidden = true;
    input.setAttribute('aria-expanded', 'false');
  }
  function search() {
    const query = normalize(input.value.trim());
    if (!query) { closeSearch(); return; }
    const tokens = query.split(/\s+/);
    const matches = items.filter((item) => tokens.every((token) => normalize(`${item.title} ${item.keywords} ${item.kind}`).includes(token)))
      .sort((a, b) => Number(normalize(b.title).startsWith(query)) - Number(normalize(a.title).startsWith(query))).slice(0, 8);
    results.replaceChildren();
    if (!matches.length) {
      const message = document.createElement('p');
      message.textContent = 'Nessuna corrispondenza nell’enciclopedia. Prova un altro nome o consulta l’indice A–Z.';
      results.append(message);
    }
    for (const item of matches) {
      const link = document.createElement('a');
      link.href = item.url;
      const kind = document.createElement('small');
      kind.textContent = item.kind;
      const title = document.createElement('span');
      title.textContent = item.title;
      link.append(kind, title);
      results.append(link);
    }
    results.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }
  input.addEventListener('input', search);
  input.addEventListener('focus', () => { if (input.value) search(); });
  $('.search').addEventListener('submit', (event) => {
    event.preventDefault();
    const first = results.querySelector('a');
    if (first) first.click();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); results.querySelector('a')?.focus(); }
    if (event.key === 'Escape') closeSearch();
  });
  results.addEventListener('keydown', (event) => {
    const links = [...results.querySelectorAll('a')];
    const position = links.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') { event.preventDefault(); links[Math.min(position + 1, links.length - 1)]?.focus(); }
    if (event.key === 'ArrowUp') { event.preventDefault(); position > 0 ? links[position - 1].focus() : input.focus(); }
    if (event.key === 'Escape') { closeSearch(); input.focus(); }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.search-wrap')) closeSearch();
  });

  const sidebar = $('#wiki-sidebar');
  const menuToggle = $('.menu-toggle');
  function closeMenu() { sidebar.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); }
  menuToggle.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    if (open) $('.sidebar-close').focus();
  });
  $('.sidebar-close').addEventListener('click', () => { closeMenu(); menuToggle.focus(); });
  sidebar.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('click', (event) => {
    if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });

  const dialog = $('.lightbox');
  const dialogImage = $('#lightbox-image');
  const dialogCaption = $('.lightbox-caption');
  let gallery = [];
  let position = 0;
  let opener = null;
  function showImage(index) {
    position = (index + gallery.length) % gallery.length;
    const button = gallery[position];
    dialogImage.src = button.dataset.lightbox;
    dialogImage.alt = button.dataset.caption;
    dialogCaption.textContent = button.dataset.caption;
    $('#lightbox-title').textContent = gallery.length > 1 ? `Galleria · ${position + 1} / ${gallery.length}` : 'Immagine';
    $('.lightbox-prev').hidden = gallery.length < 2;
    $('.lightbox-next').hidden = gallery.length < 2;
  }
  $$('[data-lightbox]').forEach((button) => {
    button.addEventListener('click', () => {
      opener = button;
      gallery = $$('[data-lightbox]').filter((other) => other.dataset.gallery === button.dataset.gallery);
      showImage(gallery.indexOf(button));
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      $('.lightbox-close').focus();
    });
  });
  function closeLightbox() { if (dialog.open) dialog.close(); }
  $('.lightbox-close').addEventListener('click', closeLightbox);
  $('.lightbox-next').addEventListener('click', () => showImage(position + 1));
  $('.lightbox-prev').addEventListener('click', () => showImage(position - 1));
  dialog.addEventListener('click', (event) => { if (event.target === dialog) closeLightbox(); });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    opener?.focus();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); showImage(position + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(position - 1); }
  });
  $$('[data-portrait]').forEach((button) => {
    button.addEventListener('click', () => {
      $$('[data-portrait]').forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
      const source = `assets/${button.dataset.portrait}`;
      $('#profile-portrait').src = source;
      $('#profile-portrait').alt = button.dataset.caption;
      $('#profile-caption').textContent = button.dataset.caption;
      const expand = $('#profile-portrait').closest('[data-lightbox]');
      expand.dataset.lightbox = source;
      expand.dataset.caption = button.dataset.caption;
    });
  });
  $('.top-button').addEventListener('click', () => {
    window.scrollTo({top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
  function updateTopButton() { $('.top-button').hidden = window.scrollY < 600; }
  window.addEventListener('scroll', updateTopButton, {passive: true});
  updateTopButton();
  const headings = $$('h2[id],h3[id],#panoramica');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((observations) => {
      const visible = observations.filter((entry) => entry.isIntersecting);
      if (!visible.length) return;
      const id = visible[0].target.id;
      $$('[data-toc]').forEach((link) => link.classList.toggle('active', link.dataset.toc === id));
    }, {rootMargin: '-75px 0px -70% 0px'});
    headings.forEach((heading) => observer.observe(heading));
  }
  document.addEventListener('keydown', (event) => {
    const editing = /input|textarea|select/i.test(document.activeElement.tagName);
    if (event.key === '/' && !editing && !dialog.open) { event.preventDefault(); input.focus(); }
    if (event.key === 'Escape') { closeSearch(); closeMenu(); }
  });
})();
