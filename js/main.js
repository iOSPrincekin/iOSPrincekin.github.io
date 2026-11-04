(() => {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const searchPanel = document.querySelector('[data-search-panel]');
  const searchInput = document.querySelector('[data-search-input]');
  const searchResults = document.querySelector('[data-search-results]');
  let searchData = null;

  const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);

  window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 24), { passive: true });

  navToggle?.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => document.body.classList.remove('nav-open')));

  const openSearch = async () => {
    searchPanel?.classList.add('open');
    searchPanel?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => searchInput?.focus(), 80);
    if (!searchData) {
      try {
        const response = await fetch(`${window.ARES_ROOT || '/'}search.json`);
        searchData = await response.json();
      } catch (_) {
        searchResults.innerHTML = '<p class="search-hint">搜索索引暂时无法建立。</p>';
      }
    }
  };
  const closeSearch = () => {
    searchPanel?.classList.remove('open');
    searchPanel?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };
  document.querySelectorAll('[data-search-open]').forEach(button => button.addEventListener('click', openSearch));
  document.querySelectorAll('[data-search-close]').forEach(button => button.addEventListener('click', closeSearch));
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); }
    if (event.key === 'Escape') closeSearch();
  });
  searchInput?.addEventListener('input', event => {
    const query = event.target.value.trim().toLowerCase();
    if (!query) { searchResults.innerHTML = '<p class="search-hint">输入关键词，检索全部探索日志。</p>'; return; }
    const matches = (searchData || []).filter(post => [post.title, post.text, ...post.categories, ...post.tags].join(' ').toLowerCase().includes(query)).slice(0, 8);
    searchResults.innerHTML = matches.length ? matches.map(post => `
      <a class="search-result" href="${escapeHtml(post.url)}">
        <span>${escapeHtml(post.date)} · ${escapeHtml(post.categories.join(' / ') || '探索日志')}</span>
        <strong>${escapeHtml(post.title)}</strong>
        <p>${escapeHtml(post.text.slice(0, 110))}…</p>
      </a>`).join('') : '<p class="search-hint">没有找到相关日志，换一个关键词试试。</p>';
  });

  const toc = document.querySelector('[data-toc-list]');
  if (toc) {
    const headings = [...document.querySelectorAll('.article-content h2, .article-content h3')];
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `section-${index + 1}`;
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      if (heading.tagName === 'H3') link.className = 'sub';
      toc.appendChild(link);
    });
    if (!headings.length) document.querySelector('[data-toc]')?.remove();
  }

  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
})();

