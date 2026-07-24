/* TeamFlow docs — shared navigation, TOC, search, theme */
(function () {
  const DOC_PAGES = [
    { title: 'Home', section: 'Get started', href: 'index.html', path: '/' },
    { title: 'Product Vision', section: 'Overview', href: 'html/vision.html' },
    { title: 'Problem Statement', section: 'Overview', href: 'html/problem-statement.html' },
    { title: 'MVP Scope', section: 'Getting Started', href: 'html/mvp-scope.html' },
    { title: 'User Roles', section: 'Getting Started', href: 'html/user-roles.html' },
    { title: 'Requirement Workflow', section: 'Core Workflows', href: 'html/requirement-workflow.html' },
    { title: 'Change Request Workflow', section: 'Core Workflows', href: 'html/change-request-workflow.html' },
    { title: 'Functional Requirements', section: 'Requirements', href: 'html/functional-requirements.html' },
    { title: 'Non-Functional Requirements', section: 'Requirements', href: 'html/non-functional-requirements.html' },
    { title: 'API Contract', section: 'Requirements', href: 'html/api-contract.html' },
    { title: 'Data Model', section: 'Requirements', href: 'html/data-model.html' },
    { title: 'Development Roadmap', section: 'Planning & Execution', href: 'html/development-roadmap.html' },
    { title: 'Demo Scenario', section: 'Planning & Execution', href: 'html/demo-scenario.html' },
    { title: 'Security Model', section: 'Quality & Security', href: 'html/security-model.html' },
    { title: 'Test Strategy', section: 'Quality & Security', href: 'html/test-strategy.html' },
    { title: 'CTO Proposal', section: 'Executive', href: 'html/cto-proposal.html' },
  ];

  function isNested() {
    return /\/html\//.test(window.location.pathname) || document.body.dataset.root === 'nested';
  }

  function resolveHref(href) {
    if (!isNested()) return href;
    if (href === 'index.html') return '../index.html';
    return href.replace(/^html\//, '');
  }

  function currentFile() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'index.html';
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  /* Theme */
  function initTheme() {
    const stored = localStorage.getItem('tf-theme');
    const theme = stored || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('tf-theme', next);
      btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  /* Sidebar mobile */
  function initSidebar() {
    const toggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!toggle || !sidebar) return;

    const close = () => {
      sidebar.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
    };
    const open = () => {
      sidebar.classList.add('active');
      if (overlay) overlay.classList.add('active');
    };

    toggle.addEventListener('click', () => {
      if (sidebar.classList.contains('active')) close();
      else open();
    });
    if (overlay) overlay.addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  /* Active nav + subnav */
  function initActiveNav() {
    const file = currentFile();
    document.querySelectorAll('.nav-list a').forEach((link) => {
      const href = link.getAttribute('href') || '';
      const target = href.split('/').pop();
      const isHome =
        (file === 'index.html' || file === '' || file === 'docs') &&
        (target === 'index.html' || href.endsWith('../index.html'));
      const match = target === file || isHome;
      link.classList.toggle('active', match);
    });

    const subnav = document.querySelectorAll('.header-subnav a');
    let matched = false;
    subnav.forEach((link) => {
      const target = (link.getAttribute('href') || '').split('/').pop();
      const active = target === file;
      link.classList.toggle('active', active);
      if (active) matched = true;
    });
    if (!matched) {
      subnav.forEach((link) => {
        const target = (link.getAttribute('href') || '').split('/').pop();
        if (target === 'index.html') link.classList.add('active');
      });
    }
  }

  /* TOC from h2 */
  function initToc() {
    const tocList = document.getElementById('toc-list');
    const content = document.querySelector('.docs-content');
    if (!tocList || !content) return;

    const headings = content.querySelectorAll('h2');
    if (!headings.length) {
      const toc = document.querySelector('.docs-toc');
      const shell = document.querySelector('.docs-shell');
      if (toc) toc.hidden = true;
      if (shell) shell.classList.add('no-toc');
      return;
    }

    const ids = new Set();
    headings.forEach((h) => {
      if (!h.id) {
        let id = slugify(h.textContent || 'section');
        let n = 1;
        while (ids.has(id)) {
          id = `${slugify(h.textContent || 'section')}-${n++}`;
        }
        h.id = id;
      }
      ids.add(h.id);
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${h.id}`;
      a.textContent = h.textContent;
      li.appendChild(a);
      tocList.appendChild(li);
    });

    const links = tocList.querySelectorAll('a');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((l) => l.classList.remove('active'));
          const active = tocList.querySelector(`a[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    headings.forEach((h) => observer.observe(h));
    if (links[0]) links[0].classList.add('active');
  }

  /* Search */
  function initSearch() {
    const input = document.getElementById('docs-search');
    const results = document.getElementById('search-results');
    if (!input || !results) return;

    const pages = DOC_PAGES.map((p) => ({ ...p, href: resolveHref(p.href) }));

    function render(query) {
      const q = query.trim().toLowerCase();
      if (!q) {
        results.classList.remove('open');
        results.innerHTML = '';
        return;
      }
      const matches = pages.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.section.toLowerCase().includes(q)
      );
      if (!matches.length) {
        results.innerHTML = '<div class="search-empty">No matching pages</div>';
        results.classList.add('open');
        return;
      }
      results.innerHTML = matches
        .map(
          (p) =>
            `<a href="${p.href}"><span class="result-section">${p.section}</span>${p.title}</a>`
        )
        .join('');
      results.classList.add('open');
    }

    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        input.blur();
        results.classList.remove('open');
      }
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-search')) {
        results.classList.remove('open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });
  }

  /* Copy page */
  function initCopy() {
    const btn = document.getElementById('copy-page');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const content = document.querySelector('.docs-content');
      const text = content ? content.innerText : document.title;
      try {
        await navigator.clipboard.writeText(text);
        const label = btn.querySelector('span');
        if (label) {
          const prev = label.textContent;
          label.textContent = 'Copied';
          setTimeout(() => {
            label.textContent = prev;
          }, 1500);
        }
      } catch (_) {
        /* ignore */
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidebar();
    initActiveNav();
    initToc();
    initSearch();
    initCopy();
  });
})();
