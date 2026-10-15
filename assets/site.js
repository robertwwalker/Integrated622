// Integrated 622 course site: shared behavior. No data leaves the browser.
(function () {
  // day / night toggle (remembered on this device)
  const root = document.documentElement;
  try { const t = localStorage.getItem('i622-theme'); if (t) root.setAttribute('data-theme', t); } catch (e) {}
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('.theme-toggle');
    const isDark = () => root.getAttribute('data-theme') === 'dark';
    const label = () => { if (btn) btn.textContent = isDark() ? 'Day' : 'Night'; };
    label();
    if (btn) btn.addEventListener('click', () => {
      const next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('i622-theme', next); } catch (e) {}
      label();
    });

    // copy buttons on prompts copy only the prompt text
    document.querySelectorAll('.prompt .copy').forEach(b => b.addEventListener('click', () => {
      const text = b.parentElement.childNodes[0].textContent.trim();
      const done = () => { b.textContent = 'Copied'; setTimeout(() => (b.textContent = 'Copy'), 1400); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => {});
    }));

    // prompt builders: <div class="prompt" data-template="... {concept} ... {org} ..."> with inputs #concept, #org
    document.querySelectorAll('.prompt[data-template]').forEach(p => {
      const ins = document.querySelectorAll('.builder input[data-key]');
      const fill = () => {
        let t = p.getAttribute('data-template');
        ins.forEach(i => { t = t.replace('{' + i.dataset.key + '}', i.value.trim() || i.dataset.blank); });
        p.childNodes[0].textContent = t;
      };
      ins.forEach(i => i.addEventListener('input', fill));
      fill();
    });

    // checklists remembered on this device only
    document.querySelectorAll('.check input[id]').forEach(cb => {
      const k = 'i622-' + location.pathname + '-' + cb.id;
      try { cb.checked = localStorage.getItem(k) === '1'; } catch (e) {}
      cb.addEventListener('change', () => { try { localStorage.setItem(k, cb.checked ? '1' : '0'); } catch (e) {} });
    });


    // asides: a term with a note; click or tap toggles, Escape or an outside click closes, and the note stays inside the window
    const asides = Array.from(document.querySelectorAll('.aside'));
    const place = a => {   // keep the note inside its card (and the window)
      const n = a.querySelector('.aside-note'); n.style.left = '0px'; n.style.width = '';
      const box = (a.closest('.card') || document.body).getBoundingClientRect(), m = 12;
      const lo = Math.max(box.left, 0) + m, hi = Math.min(box.right, window.innerWidth) - m;
      if (hi - lo < n.offsetWidth) n.style.width = (hi - lo) + 'px';
      const r = n.getBoundingClientRect();
      if (r.right > hi) n.style.left = (hi - r.right) + 'px';
      const r2 = n.getBoundingClientRect();
      if (r2.left < lo) n.style.left = (parseFloat(n.style.left) + lo - r2.left) + 'px';
    };
    const close = a => { a.classList.remove('open'); const b = a.querySelector('.aside-term'); if (b) b.setAttribute('aria-expanded', 'false'); };
    asides.forEach(a => {
      const b = a.querySelector('.aside-term');
      b.addEventListener('click', e => {
        e.stopPropagation();
        const wasOpen = a.classList.contains('open');
        asides.forEach(close);
        if (!wasOpen) { a.classList.add('open'); b.setAttribute('aria-expanded', 'true'); place(a); }
      });
      a.addEventListener('mouseenter', () => place(a));
      b.addEventListener('keydown', e => { if (e.key === 'Escape') { close(a); } });
    });
    document.addEventListener('click', e => { asides.forEach(a => { if (!a.contains(e.target)) close(a); }); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') asides.forEach(close); });

    // tabs
    document.querySelectorAll('.tabs').forEach(tabs => tabs.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => {
      const scope = tabs.parentElement;
      scope.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
      scope.querySelectorAll('.tab-pane').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      scope.querySelector('#' + b.dataset.tab).classList.add('active');
    })));

    // home page: highlight the next session in the calendar (dates embedded at build time);
    // fill the optional "this week" cards if the page has that block
    const tw = document.getElementById('this-week');
    const data = document.getElementById('sessions-data');
    if (data) {
      const S = JSON.parse(data.textContent);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const last = s => new Date(Math.max(...Object.values(s.dates).map(d => Date.parse(d + 'T00:00:00'))));
      const upcoming = S.filter(s => last(s) >= today);
      const pick = upcoming.slice(0, 2);
      if (tw && pick.length) {
        tw.innerHTML = pick.map(s => `<a class="tile" href="${s.href}"><span class="muted">${s.when}</span><h3>${s.title}</h3>` +
          `<p>${s.topics}</p>${s.due.length ? `<p class="muted"><strong>Due:</strong> ${s.due.join('; ')}</p>` : ''}</a>`).join('');
      } else if (tw) {
        tw.innerHTML = '<p>The course has finished. Thank you, and keep the puzzles coming.</p>';
      }
      document.querySelectorAll('tr[data-id]').forEach(tr => { if (pick[0] && tr.dataset.id === pick[0].id) tr.classList.add('now'); });
    }
  });
})();
