/* Render a markdown file into .docs-content for AI-layer pages */
(function () {
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function inlineFormat(text) {
    let s = escapeHtml(text);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    return s;
  }

  function renderMarkdown(md) {
    const lines = md.replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let i = 0;
    let inCode = false;
    let codeLang = '';
    let codeBuf = [];
    let listType = null;
    let para = [];

    const flushPara = () => {
      if (!para.length) return;
      out.push('<p>' + inlineFormat(para.join(' ')) + '</p>');
      para = [];
    };
    const flushList = () => {
      if (!listType) return;
      out.push(listType === 'ul' ? '</ul>' : '</ol>');
      listType = null;
    };

    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith('```')) {
        flushPara();
        flushList();
        if (!inCode) {
          inCode = true;
          codeLang = line.slice(3).trim();
          codeBuf = [];
        } else {
          out.push(
            '<pre><code class="language-' +
              escapeHtml(codeLang) +
              '">' +
              escapeHtml(codeBuf.join('\n')) +
              '</code></pre>'
          );
          inCode = false;
          codeBuf = [];
        }
        i += 1;
        continue;
      }
      if (inCode) {
        codeBuf.push(line);
        i += 1;
        continue;
      }

      if (/^\s*$/.test(line)) {
        flushPara();
        flushList();
        i += 1;
        continue;
      }

      if (/^---+$/.test(line.trim())) {
        flushPara();
        flushList();
        out.push('<hr>');
        i += 1;
        continue;
      }

      const heading = /^(#{1,6})\s+(.+)$/.exec(line);
      if (heading) {
        flushPara();
        flushList();
        const level = heading[1].length;
        out.push('<h' + level + '>' + inlineFormat(heading[2]) + '</h' + level + '>');
        i += 1;
        continue;
      }

      if (/^>\s?/.test(line)) {
        flushPara();
        flushList();
        const quote = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          quote.push(lines[i].replace(/^>\s?/, ''));
          i += 1;
        }
        out.push('<blockquote><p>' + inlineFormat(quote.join(' ')) + '</p></blockquote>');
        continue;
      }

      if (/^\|/.test(line) && i + 1 < lines.length && /^\|?\s*-+/.test(lines[i + 1])) {
        flushPara();
        flushList();
        const rows = [];
        while (i < lines.length && /^\|/.test(lines[i])) {
          const cells = lines[i]
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map((c) => c.trim());
          rows.push(cells);
          i += 1;
          if (i < lines.length && /^\|?\s*-+/.test(lines[i])) i += 1;
        }
        if (rows.length) {
          const head = rows[0];
          const body = rows.slice(1);
          out.push('<div class="table-wrap"><table><thead><tr>');
          head.forEach((c) => out.push('<th>' + inlineFormat(c) + '</th>'));
          out.push('</tr></thead><tbody>');
          body.forEach((row) => {
            out.push('<tr>');
            row.forEach((c) => out.push('<td>' + inlineFormat(c) + '</td>'));
            out.push('</tr>');
          });
          out.push('</tbody></table></div>');
        }
        continue;
      }

      const ul = /^[-*]\s+(.+)$/.exec(line);
      if (ul) {
        flushPara();
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
          out.push('<ul>');
        }
        out.push('<li>' + inlineFormat(ul[1]) + '</li>');
        i += 1;
        continue;
      }

      const ol = /^(\d+)\.\s+(.+)$/.exec(line);
      if (ol) {
        flushPara();
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
          out.push('<ol>');
        }
        out.push('<li>' + inlineFormat(ol[2]) + '</li>');
        i += 1;
        continue;
      }

      flushList();
      para.push(line.trim());
      i += 1;
    }

    flushPara();
    flushList();
    if (inCode) {
      out.push('<pre><code>' + escapeHtml(codeBuf.join('\n')) + '</code></pre>');
    }
    return out.join('\n');
  }

  async function boot() {
    const host = document.querySelector('[data-md-src]');
    if (!host) return;
    const src = host.getAttribute('data-md-src');
    const eyebrow = host.getAttribute('data-md-eyebrow') || 'AI Layer';
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const md = await res.text();
      const html = renderMarkdown(md);
      const titleMatch = /^#\s+(.+)$/m.exec(md);
      const title = titleMatch ? titleMatch[1] : 'AI Layer';
      host.innerHTML =
        '<div class="page-eyebrow">' +
        escapeHtml(eyebrow) +
        '</div><div class="page-header"><h1>' +
        escapeHtml(title) +
        '</h1></div>' +
        html.replace(/^<h1>[\s\S]*?<\/h1>\s*/i, '');
      if (window.TeamFlowDocs && typeof window.TeamFlowDocs.refreshToc === 'function') {
        window.TeamFlowDocs.refreshToc();
      } else {
        document.dispatchEvent(new CustomEvent('tf:content-ready'));
      }
    } catch (err) {
      host.innerHTML =
        '<div class="page-eyebrow">AI Layer</div><div class="page-header"><h1>Could not load document</h1></div>' +
        '<p class="roadmap-error">Failed to load <code>' +
        escapeHtml(src) +
        '</code>. ' +
        escapeHtml(String(err.message || err)) +
        '</p>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
