/* TeamFlow Roadmap Visualizer — loads packages/roadmap-data via docs/data sync */
(function () {
  'use strict';

  const DATA_URL = 'data/roadmap.json';
  const SCHEMA_VERSION = '1.0';
  const STATUSES = new Set(['completed', 'in-progress', 'planned', 'blocked', 'deferred', 'cancelled']);
  const NODE_TYPES = new Set(['phase', 'module', 'feature', 'milestone']);

  let roadmapData = null;
  let network = null;
  let nodesDataset = null;
  let edgesDataset = null;
  let filteredNodeIds = new Set();
  let selectedNodeId = null;
  let viewMode = 'auto'; // auto | graph | list
  let layoutPositions = {};

  const statusColorMap = {
    light: {
      completed: '#22c55e',
      'in-progress': '#f59e0b',
      planned: '#3b82f6',
      blocked: '#ef4444',
      deferred: '#8b5cf6',
      cancelled: '#6b7280',
    },
    dark: {
      completed: '#86efac',
      'in-progress': '#fbbf24',
      planned: '#93c5fd',
      blocked: '#fca5a5',
      deferred: '#d8b4fe',
      cancelled: '#d1d5db',
    },
  };

  const typeShapeMap = {
    phase: 'box',
    module: 'box',
    feature: 'ellipse',
    milestone: 'diamond',
  };

  const statusLabel = {
    completed: 'Completed',
    'in-progress': 'In progress',
    planned: 'Planned',
    blocked: 'Blocked',
    deferred: 'Deferred',
    cancelled: 'Cancelled',
  };

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showError(msg) {
    const errorEl = document.getElementById('roadmap-error');
    const loadingEl = document.getElementById('roadmap-loading');
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
  }

  function hideLoading() {
    const loadingEl = document.getElementById('roadmap-loading');
    if (loadingEl) loadingEl.style.display = 'none';
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
      if (!STATUSES.has(p.status)) throw new Error('Invalid phase status for ' + p.id);
      if (typeof p.progress !== 'number' || p.progress < 0 || p.progress > 100) {
        throw new Error('Invalid phase progress for ' + p.id);
      }
      for (const id of p.children || []) {
        if (!nodeIds.has(id)) throw new Error('Phase ' + p.id + ' references missing child ' + id);
      }
    }
    for (const n of input.nodes) {
      if (!phaseIds.has(n.phaseId)) throw new Error('Node ' + n.id + ' references missing phase ' + n.phaseId);
      if (!STATUSES.has(n.status)) throw new Error('Invalid node status for ' + n.id);
      if (!NODE_TYPES.has(n.type)) throw new Error('Invalid node type for ' + n.id);
      if (n.progress != null && (n.progress < 0 || n.progress > 100)) {
        throw new Error('Invalid progress for ' + n.id);
      }
      for (const id of [...(n.dependsOn || []), ...(n.children || [])]) {
        if (!nodeIds.has(id)) throw new Error('Node ' + n.id + ' references missing node ' + id);
      }
      if (n.status === 'blocked' && !n.blockerReason) {
        throw new Error('Blocked node ' + n.id + ' requires blockerReason');
      }
    }
  }

  function buildNodeMap() {
    const nodeMap = {};
    roadmapData.nodes.forEach((n) => {
      nodeMap[n.id] = n;
    });
    return nodeMap;
  }

  function buildPhaseMap() {
    const phaseMap = {};
    roadmapData.phases.forEach((p) => {
      phaseMap[p.id] = p;
    });
    return phaseMap;
  }

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  function getStatusColor(status) {
    const theme = getTheme();
    return statusColorMap[theme]?.[status] || statusColorMap.light[status] || '#94a3b8';
  }

  function getEdgeColor() {
    return getTheme() === 'dark' ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.22)';
  }

  function nodeLabel(entity, type) {
    const title = entity.shortTitle || entity.title;
    const status = statusLabel[entity.status] || entity.status;
    const progress =
      entity.progress != null && entity.progress !== '' ? ' · ' + entity.progress + '%' : '';
    return title + '\n' + (type || entity.type || 'phase') + ' · ' + status + progress;
  }

  function computeDagreLayout() {
    if (typeof dagre === 'undefined' || !dagre.graphlib) {
      throw new Error('dagre library failed to load.');
    }

    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: 'TB',
      nodesep: 48,
      ranksep: 90,
      marginx: 24,
      marginy: 24,
    });
    g.setDefaultEdgeLabel(function () {
      return {};
    });

    const widths = { phase: 200, module: 180, feature: 160, milestone: 150 };

    roadmapData.phases.forEach((phase) => {
      g.setNode(phase.id, { width: widths.phase, height: 64 });
    });
    roadmapData.nodes.forEach((node) => {
      g.setNode(node.id, {
        width: widths[node.type] || 160,
        height: node.type === 'milestone' ? 70 : 56,
      });
    });

    // Phase spine (order)
    const phases = [...roadmapData.phases].sort((a, b) => a.order - b.order);
    for (let i = 0; i < phases.length - 1; i++) {
      g.setEdge(phases[i].id, phases[i + 1].id);
    }

    // Phase → first-wave children (containment)
    roadmapData.phases.forEach((phase) => {
      (phase.children || []).forEach((childId) => {
        if (g.hasNode(childId)) g.setEdge(phase.id, childId);
      });
    });

    // Feature dependency edges
    roadmapData.nodes.forEach((node) => {
      (node.dependsOn || []).forEach((depId) => {
        if (g.hasNode(depId) && g.hasNode(node.id)) g.setEdge(depId, node.id);
      });
    });

    dagre.layout(g);

    const positions = {};
    g.nodes().forEach((id) => {
      const n = g.node(id);
      if (n) positions[id] = { x: n.x, y: n.y };
    });
    return positions;
  }

  function buildVisNodes() {
    const visNodes = [];

    roadmapData.phases.forEach((phase) => {
      const color = getStatusColor(phase.status);
      const pos = layoutPositions[phase.id] || { x: 0, y: phase.order * 120 };
      visNodes.push({
        id: phase.id,
        label: nodeLabel(phase, 'phase'),
        title: phase.title + ' — ' + (statusLabel[phase.status] || phase.status),
        shape: 'box',
        x: pos.x,
        y: pos.y,
        fixed: { x: true, y: true },
        color: {
          background: color,
          border: color,
          highlight: { background: color, border: '#111827' },
        },
        font: { size: 12, face: 'Inter, system-ui, sans-serif', multi: true, align: 'center' },
        margin: 12,
        widthConstraint: { maximum: 200 },
        borderWidth: 2,
      });
    });

    roadmapData.nodes.forEach((node) => {
      const color = getStatusColor(node.status);
      const shape = typeShapeMap[node.type] || 'ellipse';
      const pos = layoutPositions[node.id] || { x: 0, y: 0 };
      visNodes.push({
        id: node.id,
        label: nodeLabel(node),
        title: node.title + ' — ' + (statusLabel[node.status] || node.status),
        shape: shape,
        x: pos.x,
        y: pos.y,
        fixed: { x: true, y: true },
        color: {
          background: color,
          border: color,
          highlight: { background: color, border: '#111827' },
        },
        font: {
          size: node.type === 'milestone' ? 11 : 10,
          face: 'Inter, system-ui, sans-serif',
          multi: true,
          align: 'center',
        },
        margin: 8,
        widthConstraint: { maximum: 170 },
        borderWidth: 2,
      });
    });

    return visNodes;
  }

  function buildVisEdges() {
    const edges = [];
    const edgeColor = getEdgeColor();
    let edgeId = 0;

    const phases = [...roadmapData.phases].sort((a, b) => a.order - b.order);
    for (let i = 0; i < phases.length - 1; i++) {
      edges.push({
        id: 'spine-' + edgeId++,
        from: phases[i].id,
        to: phases[i + 1].id,
        arrows: 'to',
        dashes: true,
        color: { color: edgeColor, highlight: '#0066ff' },
        width: 1.25,
        smooth: { type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.4 },
      });
    }

    roadmapData.nodes.forEach((node) => {
      (node.dependsOn || []).forEach((depId) => {
        edges.push({
          id: 'dep-' + edgeId++,
          from: depId,
          to: node.id,
          arrows: 'to',
          color: { color: edgeColor, highlight: '#0066ff' },
          width: 1.5,
          smooth: { type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.45 },
        });
      });
    });

    return edges;
  }

  function refreshNodeColors() {
    if (!nodesDataset || !edgesDataset) return;
    const updates = [];
    roadmapData.phases.forEach((phase) => {
      const color = getStatusColor(phase.status);
      updates.push({
        id: phase.id,
        color: {
          background: color,
          border: color,
          highlight: { background: color, border: '#111827' },
        },
      });
    });
    roadmapData.nodes.forEach((node) => {
      const color = getStatusColor(node.status);
      updates.push({
        id: node.id,
        color: {
          background: color,
          border: color,
          highlight: { background: color, border: '#111827' },
        },
      });
    });
    nodesDataset.update(updates);

    const edgeColor = getEdgeColor();
    const edgeUpdates = edgesDataset.getIds().map((id) => ({
      id: id,
      color: { color: edgeColor, highlight: '#0066ff' },
    }));
    edgesDataset.update(edgeUpdates);
  }

  function initGraph() {
    const container = document.getElementById('roadmap-graph');
    if (!container) return;
    if (typeof vis === 'undefined' || !vis.Network) {
      throw new Error('vis-network library failed to load.');
    }

    layoutPositions = computeDagreLayout();
    nodesDataset = new vis.DataSet(buildVisNodes());
    edgesDataset = new vis.DataSet(buildVisEdges());

    const options = {
      physics: { enabled: false },
      layout: { hierarchical: { enabled: false } },
      interaction: {
        navigationButtons: false,
        keyboard: { enabled: true, bindToWindow: false },
        hover: true,
        multiselect: false,
        tooltipDelay: 200,
      },
      nodes: { borderWidth: 2, chosen: true },
      edges: { selectionWidth: 2 },
    };

    if (network) {
      network.destroy();
      network = null;
    }

    network = new vis.Network(container, { nodes: nodesDataset, edges: edgesDataset }, options);

    network.on('click', (params) => {
      if (params.nodes.length > 0) selectNode(params.nodes[0]);
      else closeDetails();
    });

    network.once('stabilizationIterationsDone', () => {
      network.fit({ animation: false, padding: 40 });
    });

    // Immediate fit for fixed-position graphs
    requestAnimationFrame(() => {
      if (network) network.fit({ animation: false, padding: 40 });
    });
  }

  function selectNode(nodeId) {
    selectedNodeId = nodeId;
    showDetails(nodeId);
    if (network) network.setSelection({ nodes: [nodeId], edges: [] });
    writeUrlState();
  }

  function closeDetails() {
    selectedNodeId = null;
    const detailsEl = document.getElementById('roadmap-details');
    if (detailsEl) detailsEl.style.display = 'none';
    if (network) network.setSelection({ nodes: [], edges: [] });
    writeUrlState();
  }

  function showDetails(nodeId) {
    const nodeMap = buildNodeMap();
    const phaseMap = buildPhaseMap();
    const node = nodeMap[nodeId] || roadmapData.phases.find((p) => p.id === nodeId);
    if (!node) return;

    const detailsEl = document.getElementById('roadmap-details');
    if (!detailsEl) return;

    document.getElementById('details-title').textContent = node.title;
    document.getElementById('details-description').textContent = node.description || '';

    const statusBadge = document.getElementById('details-status');
    statusBadge.className = 'status-badge ' + node.status;
    statusBadge.innerHTML =
      '<span class="status-dot ' +
      escapeHtml(node.status) +
      '"></span> ' +
      escapeHtml(statusLabel[node.status] || node.status);

    if (node.progress != null) {
      document.getElementById('details-progress-section').style.display = 'block';
      document.getElementById('details-progress-fill').style.width = node.progress + '%';
      document.getElementById('details-progress-text').textContent = node.progress + '% complete';
    } else {
      document.getElementById('details-progress-section').style.display = 'none';
    }

    if (node.phaseId) {
      const phase = phaseMap[node.phaseId];
      document.getElementById('details-phase-section').style.display = 'block';
      document.getElementById('details-phase').textContent = phase?.title || node.phaseId;
    } else {
      document.getElementById('details-phase-section').style.display = 'none';
    }

    if (node.owner) {
      document.getElementById('details-owner-section').style.display = 'block';
      document.getElementById('details-owner').textContent = node.owner;
    } else {
      document.getElementById('details-owner-section').style.display = 'none';
    }

    if (node.priority) {
      document.getElementById('details-priority-section').style.display = 'block';
      document.getElementById('details-priority').textContent =
        node.priority.charAt(0).toUpperCase() + node.priority.slice(1);
    } else {
      document.getElementById('details-priority-section').style.display = 'none';
    }

    if (node.blockerReason) {
      document.getElementById('details-blocker-section').style.display = 'block';
      document.getElementById('details-blocker').textContent = node.blockerReason;
    } else {
      document.getElementById('details-blocker-section').style.display = 'none';
    }

    if (node.acceptanceCriteria && node.acceptanceCriteria.length > 0) {
      document.getElementById('details-criteria-section').style.display = 'block';
      const criteriaList = document.getElementById('details-criteria');
      criteriaList.innerHTML = node.acceptanceCriteria
        .map((c) => '<li>' + escapeHtml(c) + '</li>')
        .join('');
    } else {
      document.getElementById('details-criteria-section').style.display = 'none';
    }

    if (node.dependsOn && node.dependsOn.length > 0) {
      document.getElementById('details-dependencies-section').style.display = 'block';
      const depList = document.getElementById('details-dependencies');
      depList.innerHTML = node.dependsOn
        .map((id) => {
          const dep = nodeMap[id] || roadmapData.phases.find((p) => p.id === id);
          return (
            '<li><button type="button" class="linkish" data-jump="' +
            escapeHtml(id) +
            '">' +
            escapeHtml(dep?.title || id) +
            '</button></li>'
          );
        })
        .join('');
      depList.querySelectorAll('[data-jump]').forEach((btn) => {
        btn.addEventListener('click', () => selectNode(btn.getAttribute('data-jump')));
      });
    } else {
      document.getElementById('details-dependencies-section').style.display = 'none';
    }

    if (node.children && node.children.length > 0) {
      document.getElementById('details-children-section').style.display = 'block';
      const childList = document.getElementById('details-children');
      childList.innerHTML = node.children
        .map((id) => {
          const child = nodeMap[id] || roadmapData.phases.find((p) => p.id === id);
          return (
            '<li><button type="button" class="linkish" data-jump="' +
            escapeHtml(id) +
            '">' +
            escapeHtml(child?.title || id) +
            '</button></li>'
          );
        })
        .join('');
      childList.querySelectorAll('[data-jump]').forEach((btn) => {
        btn.addEventListener('click', () => selectNode(btn.getAttribute('data-jump')));
      });
    } else {
      document.getElementById('details-children-section').style.display = 'none';
    }

    if (node.documentationUrl) {
      document.getElementById('details-docs-section').style.display = 'block';
      const link = document.getElementById('details-docs-link');
      link.href = resolveDocUrl(node.documentationUrl);
    } else {
      document.getElementById('details-docs-section').style.display = 'none';
    }

    detailsEl.style.display = 'block';
  }

  function resolveDocUrl(url) {
    if (!url) return '#';
    if (/^https?:\/\//i.test(url)) return url;
    // Site is served from docs/; strip leading /docs/ and map / to index
    if (url === '/' || url === '/index.html') return 'index.html';
    if (url.startsWith('/docs/')) return url.replace(/^\/docs\//, '');
    if (url.startsWith('/')) return url.slice(1);
    return url;
  }

  function updateSummary() {
    const nodeMap = buildNodeMap();
    const counts = { completed: 0, 'in-progress': 0, planned: 0, blocked: 0 };

    filteredNodeIds.forEach((id) => {
      const node = nodeMap[id];
      if (node && counts[node.status] !== undefined) counts[node.status]++;
    });

    document.getElementById('metric-completed').textContent = counts.completed;
    document.getElementById('metric-in-progress').textContent = counts['in-progress'];
    document.getElementById('metric-planned').textContent = counts.planned;
    document.getElementById('metric-blocked').textContent = counts.blocked;

    const current = roadmapData.phases.find((p) => p.id === roadmapData.currentPhaseId);
    const currentEl = document.getElementById('metric-current-phase');
    if (currentEl) currentEl.textContent = current ? current.title : '—';
  }

  function applyFilters(options) {
    const opts = options || {};
    const nodeMap = buildNodeMap();
    const search = (document.getElementById('roadmap-search')?.value || '').toLowerCase().trim();
    const phaseFilter = document.getElementById('filter-phase')?.value || '';
    const statusFilter = document.getElementById('filter-status')?.value || '';
    const typeFilter = document.getElementById('filter-type')?.value || '';
    const ownerFilter = document.getElementById('filter-owner')?.value || '';

    filteredNodeIds.clear();

    roadmapData.nodes.forEach((node) => {
      const matchSearch =
        !search ||
        node.title.toLowerCase().includes(search) ||
        (node.description && node.description.toLowerCase().includes(search)) ||
        (node.tags && node.tags.some((t) => t.toLowerCase().includes(search)));
      const matchPhase = !phaseFilter || node.phaseId === phaseFilter;
      const matchStatus = !statusFilter || node.status === statusFilter;
      const matchType = !typeFilter || node.type === typeFilter;
      const matchOwner = !ownerFilter || node.owner === ownerFilter;

      if (matchSearch && matchPhase && matchStatus && matchType && matchOwner) {
        filteredNodeIds.add(node.id);
      }
    });

    roadmapData.phases.forEach((phase) => {
      const hasVisibleChild = (phase.children || []).some((id) => filteredNodeIds.has(id));
      const matchSearch =
        !search ||
        phase.title.toLowerCase().includes(search) ||
        (phase.description && phase.description.toLowerCase().includes(search));
      const matchStatus = !statusFilter || phase.status === statusFilter;
      const matchType = !typeFilter || typeFilter === 'phase';
      const matchOwner = !ownerFilter; // phases have no owner
      const matchPhase = !phaseFilter || phase.id === phaseFilter;

      if (
        (hasVisibleChild && !search && !statusFilter && !typeFilter && !ownerFilter) ||
        (matchSearch && matchStatus && matchType && matchOwner && matchPhase)
      ) {
        filteredNodeIds.add(phase.id);
      }
      if (hasVisibleChild) filteredNodeIds.add(phase.id);
    });

    if (nodesDataset) {
      const updates = nodesDataset.getIds().map((id) => ({
        id: id,
        hidden: !filteredNodeIds.has(id),
      }));
      nodesDataset.update(updates);
    }

    if (edgesDataset) {
      const edgeUpdates = edgesDataset.get().map((edge) => ({
        id: edge.id,
        hidden: !(filteredNodeIds.has(edge.from) && filteredNodeIds.has(edge.to)),
      }));
      edgesDataset.update(edgeUpdates);
    }

    updateListView();
    updateSummary();
    if (!opts.skipUrl) writeUrlState();

    if (network && !opts.skipFit) {
      requestAnimationFrame(() => {
        if (network) network.fit({ animation: { duration: 250, easingFunction: 'easeInOutQuad' }, padding: 40 });
      });
    }
  }

  function updateListView() {
    const nodeMap = buildNodeMap();
    const listEl = document.getElementById('roadmap-list');
    if (!listEl) return;

    let html = '';
    let visibleCount = 0;

    roadmapData.phases
      .slice()
      .sort((a, b) => a.order - b.order)
      .forEach((phase) => {
        const childHtml = (phase.children || [])
          .map((childId) => {
            if (!filteredNodeIds.has(childId)) return '';
            const node = nodeMap[childId];
            if (!node) return '';
            visibleCount++;
            return (
              '<button type="button" class="list-item" data-node-id="' +
              escapeHtml(node.id) +
              '">' +
              '<div class="list-item-title">' +
              escapeHtml(node.title) +
              '</div>' +
              '<div class="list-item-meta">' +
              '<span class="list-item-type">' +
              escapeHtml(node.type) +
              '</span>' +
              '<span class="list-item-status">' +
              '<span class="status-dot ' +
              escapeHtml(node.status) +
              '"></span> ' +
              escapeHtml(statusLabel[node.status] || node.status) +
              '</span>' +
              (node.owner
                ? '<span class="list-item-owner">' + escapeHtml(node.owner) + '</span>'
                : '') +
              '</div></button>'
            );
          })
          .join('');

        if (!childHtml && !filteredNodeIds.has(phase.id)) return;

        html +=
          '<div class="list-group">' +
          '<div class="list-group-title">' +
          escapeHtml(phase.title) +
          ' <span class="list-group-status">' +
          escapeHtml(statusLabel[phase.status] || phase.status) +
          '</span></div>' +
          childHtml +
          '</div>';
      });

    if (!html) {
      html = '<p class="roadmap-empty">No roadmap nodes match the current filters.</p>';
    }

    listEl.innerHTML = html;
    listEl.querySelectorAll('.list-item').forEach((item) => {
      item.addEventListener('click', () => selectNode(item.dataset.nodeId));
    });

    const emptyNote = document.getElementById('filter-result-count');
    if (emptyNote) emptyNote.textContent = visibleCount + ' features shown';
  }

  function writeUrlState() {
    const params = new URLSearchParams();
    const search = document.getElementById('roadmap-search')?.value.trim();
    const phase = document.getElementById('filter-phase')?.value;
    const status = document.getElementById('filter-status')?.value;
    const type = document.getElementById('filter-type')?.value;
    const owner = document.getElementById('filter-owner')?.value;
    if (search) params.set('q', search);
    if (phase) params.set('phase', phase);
    if (status) params.set('status', status);
    if (type) params.set('type', type);
    if (owner) params.set('owner', owner);
    if (selectedNodeId) params.set('node', selectedNodeId);
    if (viewMode === 'list' || viewMode === 'graph') params.set('view', viewMode);

    const qs = params.toString();
    const url = qs ? window.location.pathname + '?' + qs : window.location.pathname;
    window.history.replaceState({}, '', url);
  }

  function readUrlState() {
    const params = new URLSearchParams(window.location.search);
    const searchEl = document.getElementById('roadmap-search');
    const phaseEl = document.getElementById('filter-phase');
    const statusEl = document.getElementById('filter-status');
    const typeEl = document.getElementById('filter-type');
    const ownerEl = document.getElementById('filter-owner');

    if (searchEl && params.has('q')) searchEl.value = params.get('q') || '';
    if (phaseEl && params.has('phase')) phaseEl.value = params.get('phase') || '';
    if (statusEl && params.has('status')) statusEl.value = params.get('status') || '';
    if (typeEl && params.has('type')) typeEl.value = params.get('type') || '';
    if (ownerEl && params.has('owner')) ownerEl.value = params.get('owner') || '';
    if (params.get('view') === 'list' || params.get('view') === 'graph') {
      viewMode = params.get('view');
    }
    return params.get('node');
  }

  function setView(mode) {
    viewMode = mode;
    const graphWrapper = document.getElementById('roadmap-graph')?.parentElement;
    const listEl = document.getElementById('roadmap-list');
    const showList = mode === 'list' || (mode === 'auto' && isMobileView());
    if (graphWrapper) graphWrapper.style.display = showList ? 'none' : 'block';
    if (listEl) listEl.style.display = showList ? 'block' : 'none';
    if (showList) updateListView();
    else if (network) {
      requestAnimationFrame(() => network.fit({ animation: false, padding: 40 }));
    }
    writeUrlState();
  }

  function initFilters() {
    const phaseSelect = document.getElementById('filter-phase');
    if (phaseSelect) {
      [...roadmapData.phases]
        .sort((a, b) => a.order - b.order)
        .forEach((phase) => {
          const opt = document.createElement('option');
          opt.value = phase.id;
          opt.textContent = phase.title;
          phaseSelect.appendChild(opt);
        });
      phaseSelect.addEventListener('change', () => applyFilters());
    }

    const ownerSelect = document.getElementById('filter-owner');
    if (ownerSelect) {
      const owners = [
        ...new Set(roadmapData.nodes.map((n) => n.owner).filter(Boolean)),
      ].sort();
      owners.forEach((owner) => {
        const opt = document.createElement('option');
        opt.value = owner;
        opt.textContent = owner;
        ownerSelect.appendChild(opt);
      });
      ownerSelect.addEventListener('change', () => applyFilters());
    }

    document.getElementById('filter-status')?.addEventListener('change', () => applyFilters());
    document.getElementById('filter-type')?.addEventListener('change', () => applyFilters());
    document.getElementById('roadmap-search')?.addEventListener('input', () => applyFilters());

    document.getElementById('btn-reset')?.addEventListener('click', () => {
      if (phaseSelect) phaseSelect.value = '';
      const status = document.getElementById('filter-status');
      const type = document.getElementById('filter-type');
      const owner = document.getElementById('filter-owner');
      const search = document.getElementById('roadmap-search');
      if (status) status.value = '';
      if (type) type.value = '';
      if (owner) owner.value = '';
      if (search) search.value = '';
      closeDetails();
      applyFilters();
    });

    document.getElementById('btn-fit-view')?.addEventListener('click', () => {
      if (network) network.fit({ animation: { duration: 300 }, padding: 40 });
    });

    document.getElementById('btn-toggle-view')?.addEventListener('click', () => {
      const graphWrapper = document.getElementById('roadmap-graph')?.parentElement;
      const showingGraph = graphWrapper && graphWrapper.style.display !== 'none';
      setView(showingGraph ? 'list' : 'graph');
    });

    document.getElementById('btn-close-details')?.addEventListener('click', closeDetails);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDetails();
    });
  }

  function isMobileView() {
    return window.innerWidth <= 768;
  }

  function watchTheme() {
    const observer = new MutationObserver(() => refreshNodeColors());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  async function loadRoadmap() {
    const response = await fetch(DATA_URL, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(
        'Failed to load roadmap data (' +
          response.status +
          '). Run `make sync-roadmap` so docs/data/roadmap.json exists.'
      );
    }
    const data = await response.json();
    validateRoadmap(data);
    return data;
  }

  async function initializeRoadmap() {
    try {
      roadmapData = await loadRoadmap();
      hideLoading();

      filteredNodeIds.clear();
      roadmapData.nodes.forEach((n) => filteredNodeIds.add(n.id));
      roadmapData.phases.forEach((p) => filteredNodeIds.add(p.id));

      initFilters();
      const selectedFromUrl = readUrlState();
      initGraph();
      watchTheme();
      applyFilters({ skipUrl: true, skipFit: false });

      const contentEl = document.getElementById('roadmap-content');
      const toolbarEl = document.getElementById('roadmap-toolbar');
      const summaryEl = document.getElementById('roadmap-summary');
      const legendEl = document.getElementById('roadmap-legend');

      if (contentEl) contentEl.style.display = 'flex';
      if (toolbarEl) toolbarEl.style.display = 'flex';
      if (summaryEl) summaryEl.style.display = 'grid';
      if (legendEl) legendEl.style.display = 'flex';

      if (viewMode === 'list' || viewMode === 'graph') setView(viewMode);
      else setView('auto');

      if (selectedFromUrl) selectNode(selectedFromUrl);
    } catch (err) {
      console.error('Roadmap initialization error:', err);
      showError(err.message || String(err));
    }
  }

  document.addEventListener('DOMContentLoaded', initializeRoadmap);

  window.addEventListener('resize', () => {
    if (viewMode !== 'auto') return;
    setView('auto');
  });
})();
