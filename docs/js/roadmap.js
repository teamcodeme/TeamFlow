/* TeamFlow roadmap — horizontal Gantt timeline (list / timeline / board) */
(function () {
  'use strict';

  const DATA_URL = 'data/roadmap.json';
  const SCHEMA_VERSION = '1.0';
  const DAY_MS = 86400000;
  const PX_PER_DAY = 10;
  const ROW_H = 40;
  const STATUSES = ['completed', 'in-progress', 'planned', 'blocked', 'deferred', 'cancelled'];
  const STATUS_LABEL = {
    completed: 'Completed',
    'in-progress': 'In progress',
    planned: 'Planned',
    blocked: 'Blocked',
    deferred: 'Deferred',
    cancelled: 'Cancelled',
  };

  let roadmap = null;
  let nodeMap = {};
  let phaseMap = {};
  let viewMode = 'timeline';
  let selectedId = null;
  let collapsed = new Set();
  let filteredIds = new Set();
  let rangeStart = null;
  let rangeEnd = null;
  let visibleRows = [];

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showError(msg) {
    const err = $('roadmap-error');
    const loading = $('roadmap-loading');
    if (loading) loading.style.display = 'none';
    if (err) {
      err.textContent = msg;
      err.style.display = 'block';
    }
  }

  function parseISO(s) {
    if (!s) return null;
    const d = new Date(s + 'T00:00:00Z');
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function daysBetween(a, b) {
    return Math.round((b.getTime() - a.getTime()) / DAY_MS);
  }

  function addDays(d, n) {
    return new Date(d.getTime() + n * DAY_MS);
  }

  function formatShort(d) {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  }

  function formatMonth(d) {
    return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric', timeZone: 'UTC' });
  }

  function validateRoadmap(input) {
    if (!input || typeof input !== 'object') throw new Error('Roadmap must be an object.');
    if (input.schemaVersion !== SCHEMA_VERSION) {
      throw new Error('Unsupported schemaVersion: ' + String(input.schemaVersion));
    }
    if (!Array.isArray(input.phases) || !Array.isArray(input.nodes)) {
      throw new Error('Roadmap phases and nodes must be arrays.');
    }
    const phaseIds = new Set(input.phases.map((p) => p.id));
    const nodeIds = new Set(input.nodes.map((n) => n.id));
    if (phaseIds.size !== input.phases.length) throw new Error('Duplicate phase IDs found.');
    if (nodeIds.size !== input.nodes.length) throw new Error('Duplicate node IDs found.');
    if (!phaseIds.has(input.currentPhaseId)) {
      throw new Error('currentPhaseId references missing phase ' + input.currentPhaseId);
    }
    for (const p of input.phases) {
      for (const id of p.children || []) {
        if (!nodeIds.has(id)) throw new Error('Phase ' + p.id + ' references missing child ' + id);
      }
    }
    for (const n of input.nodes) {
      if (!phaseIds.has(n.phaseId)) throw new Error('Node ' + n.id + ' references missing phase ' + n.phaseId);
      for (const id of [...(n.dependsOn || []), ...(n.children || [])]) {
        if (!nodeIds.has(id)) throw new Error('Node ' + n.id + ' references missing node ' + id);
      }
      if (n.status === 'blocked' && !n.blockerReason) {
        throw new Error('Blocked node ' + n.id + ' requires blockerReason');
      }
    }
  }

  function itemDates(item) {
    if (item.type === 'milestone' || (!item.type && item.milestoneDate)) {
      const m = parseISO(item.milestoneDate || item.endDate || item.startDate);
      return m ? { start: m, end: m } : null;
    }
    const start = parseISO(item.startDate);
    const end = parseISO(item.endDate || item.startDate);
    if (!start || !end) return null;
    return { start, end };
  }

  function computeRange() {
    let min = null;
    let max = null;
    const consider = (item) => {
      const d = itemDates(item);
      if (!d) return;
      if (!min || d.start < min) min = d.start;
      if (!max || d.end > max) max = d.end;
    };
    roadmap.phases.forEach(consider);
    roadmap.nodes.forEach(consider);
    if (!min || !max) {
      min = new Date('2026-01-01T00:00:00Z');
      max = new Date('2026-12-31T00:00:00Z');
    }
    rangeStart = addDays(min, -3);
    rangeEnd = addDays(max, 10);
  }

  function xForDate(d) {
    return daysBetween(rangeStart, d) * PX_PER_DAY;
  }

  function totalWidth() {
    return Math.max(800, daysBetween(rangeStart, rangeEnd) * PX_PER_DAY);
  }

  function buildMaps() {
    nodeMap = {};
    phaseMap = {};
    roadmap.nodes.forEach((n) => {
      nodeMap[n.id] = n;
    });
    roadmap.phases.forEach((p) => {
      phaseMap[p.id] = p;
    });
  }

  function applyFilters(opts) {
    const options = opts || {};
    const q = ($('roadmap-search')?.value || '').trim().toLowerCase();
    const phase = $('filter-phase')?.value || '';
    const status = $('filter-status')?.value || '';
    const type = $('filter-type')?.value || '';
    const owner = $('filter-owner')?.value || '';

    filteredIds = new Set();

    roadmap.nodes.forEach((n) => {
      const hay = [n.title, n.description, ...(n.tags || [])].join(' ').toLowerCase();
      const okQ = !q || hay.includes(q);
      const okP = !phase || n.phaseId === phase;
      const okS = !status || n.status === status;
      const okT = !type || n.type === type;
      const okO = !owner || n.owner === owner || n.assignee === owner;
      if (okQ && okP && okS && okT && okO) filteredIds.add(n.id);
    });

    roadmap.phases.forEach((p) => {
      const hasChild = (p.children || []).some((id) => filteredIds.has(id));
      const hay = [p.title, p.description].join(' ').toLowerCase();
      const okQ = !q || hay.includes(q);
      const okS = !status || p.status === status;
      const okT = !type || type === 'phase';
      const okP = !phase || p.id === phase;
      if (hasChild || (okQ && okS && okT && okP && !owner)) filteredIds.add(p.id);
      if (hasChild) filteredIds.add(p.id);
    });

    updateSummary();
    renderActiveView();
    if (!options.skipUrl) writeUrl();
  }

  function updateSummary() {
    const counts = { completed: 0, 'in-progress': 0, planned: 0, blocked: 0 };
    filteredIds.forEach((id) => {
      const n = nodeMap[id];
      if (n && counts[n.status] != null) counts[n.status]++;
    });
    $('metric-completed').textContent = counts.completed;
    $('metric-in-progress').textContent = counts['in-progress'];
    $('metric-planned').textContent = counts.planned;
    $('metric-blocked').textContent = counts.blocked;
    const cur = phaseMap[roadmap.currentPhaseId];
    const el = $('metric-current-phase');
    if (el) el.textContent = cur ? cur.title : '—';
    const countEl = $('filter-result-count');
    if (countEl) {
      const n = [...filteredIds].filter((id) => nodeMap[id]).length;
      countEl.textContent = n + ' items';
    }
  }

  function buildVisibleRows() {
    const rows = [];
    [...roadmap.phases]
      .sort((a, b) => a.order - b.order)
      .forEach((phase) => {
        if (!filteredIds.has(phase.id) && !(phase.children || []).some((c) => filteredIds.has(c))) {
          return;
        }
        rows.push({ kind: 'phase', item: phase, depth: 0 });
        if (collapsed.has(phase.id)) return;

        const children = (phase.children || [])
          .map((id) => nodeMap[id])
          .filter(Boolean)
          .filter((n) => filteredIds.has(n.id))
          .sort((a, b) => a.order - b.order);

        children.forEach((node) => {
          rows.push({ kind: 'node', item: node, depth: node.type === 'feature' || node.type === 'milestone' ? 2 : 1 });
        });
      });
    visibleRows = rows;
    return rows;
  }

  function renderTimeline() {
    const host = $('view-timeline');
    if (!host) return;
    const rows = buildVisibleRows();
    const width = totalWidth();

    // Month headers
    const months = [];
    let cursor = new Date(Date.UTC(rangeStart.getUTCFullYear(), rangeStart.getUTCMonth(), 1));
    while (cursor <= rangeEnd) {
      const next = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
      const left = Math.max(0, xForDate(cursor));
      const right = Math.min(width, xForDate(next));
      months.push({ label: formatMonth(cursor), left, width: Math.max(0, right - left) });
      cursor = next;
    }

    const treeRows = rows
      .map((row) => {
        const item = row.item;
        const isPhase = row.kind === 'phase';
        const hasKids = isPhase && (item.children || []).some((id) => filteredIds.has(id));
        const expanded = !collapsed.has(item.id);
        return (
          '<div class="rm-row' +
          (isPhase ? ' is-phase' : '') +
          (selectedId === item.id ? ' is-selected' : '') +
          '" data-id="' +
          escapeHtml(item.id) +
          '" role="button" tabindex="0">' +
          '<button type="button" class="rm-toggle' +
          (hasKids ? '' : ' is-leaf') +
          '" data-toggle="' +
          escapeHtml(item.id) +
          '" aria-expanded="' +
          (expanded ? 'true' : 'false') +
          '" aria-label="Toggle ' +
          escapeHtml(item.title) +
          '">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>' +
          '</button>' +
          '<div class="rm-row-main rm-indent-' +
          row.depth +
          '">' +
          '<div class="rm-row-title">' +
          escapeHtml(item.title) +
          '</div>' +
          '<div class="rm-row-meta">' +
          '<span class="rm-type-chip">' +
          escapeHtml(isPhase ? 'phase' : item.type) +
          '</span>' +
          '<span><span class="status-dot ' +
          escapeHtml(item.status) +
          '"></span> ' +
          escapeHtml(STATUS_LABEL[item.status] || item.status) +
          '</span>' +
          (item.progress != null ? '<span>' + item.progress + '%</span>' : '') +
          '</div></div></div>'
        );
      })
      .join('');

    const trackRows = rows
      .map((row) => {
        const item = row.item;
        const dates = itemDates(item);
        if (!dates) {
          return '<div class="rm-track-row" data-id="' + escapeHtml(item.id) + '"></div>';
        }
        const isMilestone = !item.children && item.type === 'milestone';
        if (isMilestone) {
          const x = xForDate(dates.start);
          return (
            '<div class="rm-track-row" data-id="' +
            escapeHtml(item.id) +
            '">' +
            '<button type="button" class="rm-milestone status-' +
            escapeHtml(item.status) +
            '" style="left:' +
            x +
            'px" title="' +
            escapeHtml(item.title) +
            '" data-select="' +
            escapeHtml(item.id) +
            '" aria-label="' +
            escapeHtml(item.title) +
            '"></button></div>'
          );
        }
        const left = xForDate(dates.start);
        const w = Math.max(6, (daysBetween(dates.start, dates.end) + 1) * PX_PER_DAY);
        const progress = item.progress != null ? Math.max(0, Math.min(100, item.progress)) : null;
        return (
          '<div class="rm-track-row" data-id="' +
          escapeHtml(item.id) +
          '">' +
          '<button type="button" class="rm-bar status-' +
          escapeHtml(item.status) +
          (row.kind === 'phase' ? ' is-phase' : '') +
          '" style="left:' +
          left +
          'px;width:' +
          w +
          'px" data-select="' +
          escapeHtml(item.id) +
          '" title="' +
          escapeHtml(item.title) +
          '">' +
          (progress != null ? '<span class="rm-bar-progress" style="width:' + progress + '%"></span>' : '') +
          '<span class="rm-bar-label">' +
          escapeHtml(item.shortTitle || item.title) +
          '</span></button></div>'
        );
      })
      .join('');

    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const todayX =
      todayUTC >= rangeStart && todayUTC <= rangeEnd ? xForDate(todayUTC) : null;

    host.innerHTML =
      '<div class="rm-gantt" style="--rm-day-px:' +
      PX_PER_DAY +
      'px">' +
      '<div class="rm-tree" id="rm-tree">' +
      '<div class="rm-tree-head">Work item</div>' +
      treeRows +
      '</div>' +
      '<div class="rm-timeline-scroll" id="rm-timeline-scroll">' +
      '<div class="rm-timeline-canvas" style="width:' +
      width +
      'px">' +
      '<div class="rm-timeline-head-inner">' +
      months
        .map(
          (m) =>
            '<div class="rm-month" style="width:' +
            m.width +
            'px">' +
            escapeHtml(m.label) +
            '</div>'
        )
        .join('') +
      '</div>' +
      '<svg class="rm-deps" id="rm-deps" width="' +
      width +
      '" height="' +
      rows.length * ROW_H +
      '"></svg>' +
      (todayX != null ? '<div class="rm-today" style="left:' + todayX + 'px" title="Today"></div>' : '') +
      trackRows +
      '</div></div></div>';

    wireTimelineEvents(host);
    requestAnimationFrame(() => drawDependencies());
  }

  function wireTimelineEvents(host) {
    host.querySelectorAll('.rm-row').forEach((row) => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('[data-toggle]')) return;
        selectItem(row.getAttribute('data-id'));
      });
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectItem(row.getAttribute('data-id'));
        }
      });
    });
    host.querySelectorAll('[data-toggle]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-toggle');
        if (collapsed.has(id)) collapsed.delete(id);
        else collapsed.add(id);
        renderTimeline();
      });
    });
    host.querySelectorAll('[data-select]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectItem(el.getAttribute('data-select'));
      });
    });

  }

  function drawDependencies() {
    const svg = $('rm-deps');
    if (!svg) return;
    const index = new Map();
    visibleRows.forEach((row, i) => index.set(row.item.id, i));

    const paths = [];
    visibleRows.forEach((row) => {
      if (row.kind !== 'node') return;
      const node = row.item;
      (node.dependsOn || []).forEach((depId) => {
        if (!index.has(depId) || !index.has(node.id)) return;
        const fromItem = nodeMap[depId];
        const toItem = node;
        const fromDates = itemDates(fromItem);
        const toDates = itemDates(toItem);
        if (!fromDates || !toDates) return;
        const y1 = index.get(depId) * ROW_H + ROW_H / 2;
        const y2 = index.get(node.id) * ROW_H + ROW_H / 2;
        const x1 =
          fromItem.type === 'milestone'
            ? xForDate(fromDates.start)
            : xForDate(fromDates.end) + PX_PER_DAY;
        const x2 =
          toItem.type === 'milestone' ? xForDate(toDates.start) : xForDate(toDates.start);
        const mid = (x1 + x2) / 2;
        paths.push(
          '<path d="M' +
            x1 +
            ' ' +
            y1 +
            ' C' +
            mid +
            ' ' +
            y1 +
            ', ' +
            mid +
            ' ' +
            y2 +
            ', ' +
            x2 +
            ' ' +
            y2 +
            '" />'
        );
      });
    });
    svg.innerHTML = paths.join('');
  }

  function renderList() {
    const host = $('view-list');
    if (!host) return;
    let html = '';
    let count = 0;
    [...roadmap.phases]
      .sort((a, b) => a.order - b.order)
      .forEach((phase) => {
        const kids = (phase.children || [])
          .map((id) => nodeMap[id])
          .filter((n) => n && filteredIds.has(n.id));
        if (!kids.length && !filteredIds.has(phase.id)) return;
        html +=
          '<section class="rm-list-group"><h3 class="rm-list-group-title">' +
          escapeHtml(phase.title) +
          '</h3>';
        kids.forEach((n) => {
          count++;
          const dates = itemDates(n);
          html +=
            '<button type="button" class="rm-list-item" data-id="' +
            escapeHtml(n.id) +
            '"><div><div class="rm-list-item-title">' +
            escapeHtml(n.title) +
            '</div><div class="rm-list-item-meta">' +
            '<span>' +
            escapeHtml(n.type) +
            '</span>' +
            '<span><span class="status-dot ' +
            escapeHtml(n.status) +
            '"></span> ' +
            escapeHtml(STATUS_LABEL[n.status] || n.status) +
            '</span>' +
            (dates
              ? '<span>' + formatShort(dates.start) + ' → ' + formatShort(dates.end) + '</span>'
              : '') +
            (n.owner || n.assignee
              ? '<span>' + escapeHtml(n.assignee || n.owner) + '</span>'
              : '') +
            '</div></div></button>';
        });
        html += '</section>';
      });
    host.innerHTML = html || '<p class="roadmap-empty">No items match the current filters.</p>';
    host.querySelectorAll('.rm-list-item').forEach((btn) => {
      btn.addEventListener('click', () => selectItem(btn.getAttribute('data-id')));
    });
    const countEl = $('filter-result-count');
    if (countEl) countEl.textContent = count + ' items';
  }

  function renderBoard() {
    const host = $('view-board');
    if (!host) return;
    const columns = STATUSES.map((status) => {
      const cards = roadmap.nodes.filter((n) => filteredIds.has(n.id) && n.status === status);
      return { status, cards };
    }).filter((c) => c.cards.length || ['completed', 'in-progress', 'planned', 'blocked'].includes(c.status));

    host.innerHTML = columns
      .map((col) => {
        return (
          '<div class="rm-board-col">' +
          '<div class="rm-board-col-title"><span>' +
          escapeHtml(STATUS_LABEL[col.status]) +
          '</span><span>' +
          col.cards.length +
          '</span></div>' +
          col.cards
            .map((n) => {
              const dates = itemDates(n);
              return (
                '<button type="button" class="rm-board-card" data-id="' +
                escapeHtml(n.id) +
                '"><div class="rm-board-card-title">' +
                escapeHtml(n.title) +
                '</div><div class="rm-board-card-meta">' +
                escapeHtml(n.type) +
                (dates ? ' · ' + formatShort(dates.end) : '') +
                (n.owner ? ' · ' + escapeHtml(n.owner) : '') +
                '</div></button>'
              );
            })
            .join('') +
          '</div>'
        );
      })
      .join('');

    host.querySelectorAll('.rm-board-card').forEach((btn) => {
      btn.addEventListener('click', () => selectItem(btn.getAttribute('data-id')));
    });
  }

  function renderActiveView() {
    const timeline = $('view-timeline');
    const list = $('view-list');
    const board = $('view-board');
    if (timeline) timeline.hidden = viewMode !== 'timeline';
    if (list) list.hidden = viewMode !== 'list';
    if (board) board.hidden = viewMode !== 'board';

    document.querySelectorAll('.view-switch button').forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.dataset.view === viewMode ? 'true' : 'false');
    });

    if (viewMode === 'timeline') renderTimeline();
    else if (viewMode === 'list') renderList();
    else renderBoard();
  }

  function selectItem(id) {
    selectedId = id;
    showDetails(id);
    document.querySelectorAll('.rm-row').forEach((row) => {
      row.classList.toggle('is-selected', row.getAttribute('data-id') === id);
    });
    writeUrl();
  }

  function closeDetails() {
    selectedId = null;
    const panel = $('roadmap-details');
    if (panel) panel.style.display = 'none';
    document.querySelectorAll('.rm-row.is-selected').forEach((r) => r.classList.remove('is-selected'));
    writeUrl();
  }

  function showDetails(id) {
    const item = nodeMap[id] || phaseMap[id];
    const panel = $('roadmap-details');
    if (!item || !panel) return;

    $('details-title').textContent = item.title;
    $('details-description').textContent = item.description || '';

    const badge = $('details-status');
    badge.className = 'status-badge ' + item.status;
    badge.innerHTML =
      '<span class="status-dot ' +
      escapeHtml(item.status) +
      '"></span> ' +
      escapeHtml(STATUS_LABEL[item.status] || item.status);

    const dates = itemDates(item);
    const datesSection = $('details-dates-section');
    if (datesSection) {
      if (dates) {
        datesSection.style.display = 'block';
        $('details-dates').textContent =
          item.type === 'milestone'
            ? formatShort(dates.start)
            : formatShort(dates.start) + ' → ' + formatShort(dates.end) +
              (item.durationDays != null ? ' · ' + item.durationDays + ' days' : '');
      } else {
        datesSection.style.display = 'none';
      }
    }

    if (item.progress != null) {
      $('details-progress-section').style.display = 'block';
      $('details-progress-fill').style.width = item.progress + '%';
      $('details-progress-text').textContent = item.progress + '% complete';
    } else {
      $('details-progress-section').style.display = 'none';
    }

    const phaseSection = $('details-phase-section');
    if (item.phaseId && phaseMap[item.phaseId]) {
      phaseSection.style.display = 'block';
      $('details-phase').textContent = phaseMap[item.phaseId].title;
    } else {
      phaseSection.style.display = 'none';
    }

    const ownerVal = item.assignee || item.owner;
    if (ownerVal) {
      $('details-owner-section').style.display = 'block';
      $('details-owner').textContent = ownerVal;
    } else {
      $('details-owner-section').style.display = 'none';
    }

    if (item.priority) {
      $('details-priority-section').style.display = 'block';
      $('details-priority').textContent =
        item.priority.charAt(0).toUpperCase() + item.priority.slice(1);
    } else {
      $('details-priority-section').style.display = 'none';
    }

    if (item.targetRelease) {
      const tr = $('details-release-section');
      if (tr) {
        tr.style.display = 'block';
        $('details-release').textContent = item.targetRelease;
      }
    } else if ($('details-release-section')) {
      $('details-release-section').style.display = 'none';
    }

    if (item.blockerReason) {
      $('details-blocker-section').style.display = 'block';
      $('details-blocker').textContent = item.blockerReason;
    } else {
      $('details-blocker-section').style.display = 'none';
    }

    if (item.acceptanceCriteria && item.acceptanceCriteria.length) {
      $('details-criteria-section').style.display = 'block';
      $('details-criteria').innerHTML = item.acceptanceCriteria
        .map((c) => '<li>' + escapeHtml(c) + '</li>')
        .join('');
    } else {
      $('details-criteria-section').style.display = 'none';
    }

    if (item.dependsOn && item.dependsOn.length) {
      $('details-dependencies-section').style.display = 'block';
      $('details-dependencies').innerHTML = item.dependsOn
        .map((depId) => {
          const dep = nodeMap[depId] || phaseMap[depId];
          return (
            '<li><button type="button" class="linkish" data-jump="' +
            escapeHtml(depId) +
            '">' +
            escapeHtml(dep?.title || depId) +
            '</button></li>'
          );
        })
        .join('');
      $('details-dependencies').querySelectorAll('[data-jump]').forEach((btn) => {
        btn.addEventListener('click', () => selectItem(btn.getAttribute('data-jump')));
      });
    } else {
      $('details-dependencies-section').style.display = 'none';
    }

    if (item.children && item.children.length) {
      $('details-children-section').style.display = 'block';
      $('details-children').innerHTML = item.children
        .map((cid) => {
          const child = nodeMap[cid] || phaseMap[cid];
          return (
            '<li><button type="button" class="linkish" data-jump="' +
            escapeHtml(cid) +
            '">' +
            escapeHtml(child?.title || cid) +
            '</button></li>'
          );
        })
        .join('');
      $('details-children').querySelectorAll('[data-jump]').forEach((btn) => {
        btn.addEventListener('click', () => selectItem(btn.getAttribute('data-jump')));
      });
    } else {
      $('details-children-section').style.display = 'none';
    }

    if (item.documentationUrl) {
      $('details-docs-section').style.display = 'block';
      $('details-docs-link').href = resolveDocUrl(item.documentationUrl);
    } else {
      $('details-docs-section').style.display = 'none';
    }

    panel.style.display = 'flex';
  }

  function resolveDocUrl(url) {
    if (!url) return '#';
    if (/^https?:\/\//i.test(url)) return url;
    if (url === '/' || url === '/index.html') return 'html/introduction.html';
    if (url.startsWith('/docs/')) return url.replace(/^\/docs\//, '');
    if (url.startsWith('/')) return url.slice(1);
    return url;
  }

  function writeUrl() {
    const params = new URLSearchParams();
    const q = $('roadmap-search')?.value.trim();
    const phase = $('filter-phase')?.value;
    const status = $('filter-status')?.value;
    const type = $('filter-type')?.value;
    const owner = $('filter-owner')?.value;
    if (q) params.set('q', q);
    if (phase) params.set('phase', phase);
    if (status) params.set('status', status);
    if (type) params.set('type', type);
    if (owner) params.set('owner', owner);
    if (viewMode !== 'timeline') params.set('view', viewMode);
    if (selectedId) params.set('node', selectedId);
    const qs = params.toString();
    history.replaceState({}, '', location.pathname + (qs ? '?' + qs : ''));
  }

  function readUrl() {
    const params = new URLSearchParams(location.search);
    if (params.has('q') && $('roadmap-search')) $('roadmap-search').value = params.get('q') || '';
    if (params.has('phase') && $('filter-phase')) $('filter-phase').value = params.get('phase') || '';
    if (params.has('status') && $('filter-status')) $('filter-status').value = params.get('status') || '';
    if (params.has('type') && $('filter-type')) $('filter-type').value = params.get('type') || '';
    if (params.has('owner') && $('filter-owner')) $('filter-owner').value = params.get('owner') || '';
    const view = params.get('view');
    if (view === 'list' || view === 'board' || view === 'timeline') viewMode = view;
    return params.get('node');
  }

  function initControls() {
    const phaseSelect = $('filter-phase');
    [...roadmap.phases]
      .sort((a, b) => a.order - b.order)
      .forEach((p) => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.title;
        phaseSelect.appendChild(opt);
      });

    const owners = [
      ...new Set(
        roadmap.nodes.flatMap((n) => [n.owner, n.assignee].filter(Boolean))
      ),
    ].sort();
    const ownerSelect = $('filter-owner');
    owners.forEach((o) => {
      const opt = document.createElement('option');
      opt.value = o;
      opt.textContent = o;
      ownerSelect.appendChild(opt);
    });

    ['filter-phase', 'filter-status', 'filter-type', 'filter-owner'].forEach((id) => {
      $(id)?.addEventListener('change', () => applyFilters());
    });
    $('roadmap-search')?.addEventListener('input', () => applyFilters());

    $('btn-reset')?.addEventListener('click', () => {
      if (phaseSelect) phaseSelect.value = '';
      ['filter-status', 'filter-type', 'filter-owner', 'roadmap-search'].forEach((id) => {
        if ($(id)) $(id).value = '';
      });
      closeDetails();
      applyFilters();
    });

    document.querySelectorAll('.view-switch button').forEach((btn) => {
      btn.addEventListener('click', () => {
        viewMode = btn.dataset.view;
        renderActiveView();
        writeUrl();
      });
    });

    $('btn-fit-view')?.addEventListener('click', () => {
      const scroll = $('rm-timeline-scroll');
      if (!scroll) return;
      const today = new Date();
      const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      const x = Math.max(0, xForDate(todayUTC) - scroll.clientWidth / 3);
      scroll.scrollTo({ left: x, behavior: 'smooth' });
    });

    $('btn-close-details')?.addEventListener('click', closeDetails);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDetails();
    });

    // Default: collapse later phases for a cleaner first view
    roadmap.phases.forEach((p) => {
      if (p.order > 1) collapsed.add(p.id);
    });
  }

  async function load() {
    const res = await fetch(DATA_URL, { cache: 'no-cache' });
    if (!res.ok) {
      throw new Error(
        'Failed to load roadmap data (' +
          res.status +
          '). Run `make sync-roadmap` so docs/data/roadmap.json exists.'
      );
    }
    const data = await res.json();
    validateRoadmap(data);
    return data;
  }

  async function boot() {
    try {
      roadmap = await load();
      buildMaps();
      computeRange();
      $('roadmap-loading').style.display = 'none';
      ['roadmap-summary', 'roadmap-toolbar', 'roadmap-legend', 'roadmap-content'].forEach((id) => {
        const el = $(id);
        if (el) el.style.display = id === 'roadmap-content' ? 'flex' : id === 'roadmap-summary' ? 'grid' : 'flex';
      });
      const legend = $('roadmap-legend');
      if (legend) legend.style.display = 'flex';

      initControls();
      const nodeFromUrl = readUrl();
      applyFilters({ skipUrl: true });
      if (nodeFromUrl) selectItem(nodeFromUrl);
    } catch (err) {
      console.error(err);
      showError(err.message || String(err));
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
