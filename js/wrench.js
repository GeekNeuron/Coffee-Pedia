(function(){
const KEY = 'cp_wrench';
const fa = n => toPersianDigits(n);
const esc = s => escapeHtml(String(s));
const ld = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } };
let done = ld(), dev = 0, sel = null;
const body = document.getElementById('wrenchBody');
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {} };

function ago(ts){
  if (!ts) return 'ثبت نشده';
  const d = Math.floor((Date.now() - ts) / 86400000);
  return d <= 0 ? 'امروز' : fa(d) + ' روز پیش';
}
function svg(w){
  const tgt = sel ? w.parts.find(p => p.id === sel) : null;
  const lines = w.parts.map(p => `<line class="ld" x1="${p.mx}" y1="${p.my}" x2="${p.tx}" y2="${p.ty}"/>`).join('');
  const marks = w.parts.map((p, i) => `<g class="mk${sel === p.id ? ' on' : ''}" data-part="${p.id}"><circle cx="${p.mx}" cy="${p.my}" r="11"/><text x="${p.mx}" y="${p.my + 4}" text-anchor="middle">${fa(i + 1)}</text></g>`).join('');
  const shapes = w.parts.map(p => p.shape.replace(/<(\w+) class="(pt|pt-s)"/g, (m, t, c) => `<${t} class="${c}${sel === p.id ? ' on' : ''}" data-part="${p.id}"`)).join('');
  return `<svg class="wr-svg" viewBox="0 0 320 260" role="img" aria-label="${esc(w.name)}">${w.deco}${shapes}${lines}${marks}</svg>`;
}
function render(keep){
  const y = document.getElementById('appBody').scrollTop;
  const w = WRENCH[dev];
  const p = sel ? w.parts.find(x => x.id === sel) : null;
  const dn = done[w.id] || {};
  body.innerHTML = `
    <div class="gear-chips wr-chips">${WRENCH.map((x, i) => `<button type="button" class="pill-choice${i === dev ? ' active' : ''}" data-dev="${i}">${esc(x.name)}</button>`).join('')}</div>
    <div class="tool-card">
      <h3>${esc(w.name)} <small class="lab-count">${esc(w.en)}</small></h3>
      ${svg(w)}
      <div class="wr-legend">${w.parts.map((x, i) => `<button type="button" class="wr-leg${sel === x.id ? ' on' : ''}" data-part="${x.id}"><b>${fa(i + 1)}</b>${esc(x.n)}</button>`).join('')}</div>
      ${typeof photoHtml === 'function' ? photoHtml('wrench-' + w.id + '.png', 'photo-eq') : ''}
    </div>
    <div class="tool-card">
      ${p ? `<h3>${esc(p.n)} <small class="lab-count">${esc(p.en)}</small></h3>
        <p class="wr-d">${esc(p.d)}</p>${p.tip ? `<div class="lab-block">${esc(p.tip)}</div>` : ''}`
        : '<h3>قطعه‌ها</h3><p class="lab-muted">یک عدد روی تصویر یا یکی از نام‌های زیر آن را لمس کنید تا کارش و نکته‌ی نگهداری‌اش را ببینید.</p>'}
    </div>
    <div class="tool-card">
      <h3>نگهداری و تمیزکاری</h3>
      <p class="lab-muted">پیش از هر کاری دفترچه‌ی دستگاه خودتان را ببینید؛ روش دقیق بسته به مدل فرق می‌کند. با «انجام شد» زمان آخرین بار را روی همین دستگاه ثبت کنید.</p>
      ${w.care.map((c, i) => `
        <div class="wr-care">
          <div class="wr-care-top"><b>${esc(c.t)}</b><span class="wr-when">${esc(c.when)}</span></div>
          <div class="wr-care-d">${esc(c.d)}</div>
          ${c.when === 'هرگز' ? '' : `<div class="wr-care-foot"><span>آخرین بار: ${ago(dn[i])}</span><button type="button" class="j-del" data-done="${i}">انجام شد</button></div>`}
        </div>`).join('')}
    </div>`;
  if (keep) document.getElementById('appBody').scrollTop = y;
}
body.addEventListener('click', e => {
  const part = e.target.closest('[data-part]');
  if (part){ sel = sel === part.dataset.part ? null : part.dataset.part; render(true);
    if (sel){ const c = body.querySelectorAll('.tool-card')[1]; if (c && c.scrollIntoView) c.scrollIntoView({block:'nearest', behavior:'smooth'}); }
    return; }
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.dev){ dev = Number(b.dataset.dev); sel = null; render(true); return; }
  if (b.dataset.done){
    const id = WRENCH[dev].id; (done[id] = done[id] || {})[b.dataset.done] = Date.now(); save(); render(true); showToast('ثبت شد');
  }
});
window.openWrench = () => {
  showView('wrench');
  try { render(); } catch (err) { body.innerHTML = '<div class="tool-card"><p class="lab-muted">بارگذاری این بخش ناقص بود؛ صفحه را یک‌بار تازه‌سازی کنید.</p></div>'; }
};
document.getElementById('wrenchBackBtn').addEventListener('click', () => showView(state.currentTab));
window.addEventListener('cp-reset', () => { done = {}; sel = null; render(); });
try { render(); } catch (err) {}
})();
