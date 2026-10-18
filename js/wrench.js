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
function detail(p){
  return p
    ? `<h3>${esc(p.n)} <small class="lab-count">${esc(p.en)}</small></h3>
        <p class="wr-d">${esc(p.d)}</p>${p.tip ? `<div class="lab-block">${esc(p.tip)}</div>` : ''}`
    : '<h3>قطعه‌ها</h3><p class="lab-muted">یک عدد روی تصویر یا یکی از نام‌های زیر آن را لمس کنید تا کارش و نکته‌ی نگهداری‌اش را ببینید.</p>';
}
function careFoot(c, i, dn){
  if (c.when === 'هرگز') return '';
  return `<div class="wr-care-foot"><span>آخرین بار: ${ago(dn[i])}</span><span>${dn[i] ? `<button type="button" class="j-del" data-undo="${i}">لغو</button>` : ''}<button type="button" class="j-del" data-done="${i}">انجام شد</button></span></div>`;
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
    <div class="tool-card" id="wrDetail">${detail(p)}</div>
    <div class="tool-card">
      <h3>نگهداری و تمیزکاری</h3>
      <p class="lab-muted">پیش از هر کاری دفترچه‌ی دستگاه خودتان را ببینید؛ روش دقیق بسته به مدل فرق می‌کند. با «انجام شد» زمان آخرین بار را روی همین دستگاه ثبت کنید.</p>
      ${w.care.map((c, i) => `
        <div class="wr-care">
          <div class="wr-care-top"><b>${esc(c.t)}</b><span class="wr-when">${esc(c.when)}</span></div>
          <div class="wr-care-d">${esc(c.d)}</div>
          <div class="wr-care-slot" data-care="${i}">${careFoot(c, i, dn)}</div>
        </div>`).join('')}
    </div>`;
  if (keep) document.getElementById('appBody').scrollTop = y;
}
function select(id){
  sel = sel === id ? null : id;
  const w = WRENCH[dev];
  body.querySelectorAll('[data-part]').forEach(el => el.classList.toggle('on', !!sel && el.dataset.part === sel));
  const box = document.getElementById('wrDetail');
  if (box){
    box.innerHTML = detail(sel ? w.parts.find(x => x.id === sel) : null);
    softSwap(box);
    if (sel && box.scrollIntoView) box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}
function refreshCare(i){
  const w = WRENCH[dev], dn = done[w.id] || {};
  const slot = body.querySelector(`[data-care="${i}"]`);
  if (slot){ slot.innerHTML = careFoot(w.care[i], i, dn); softSwap(slot); }
}
body.addEventListener('click', e => {
  const part = e.target.closest('[data-part]');
  if (part){ select(part.dataset.part); return; }
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.dev){ dev = Number(b.dataset.dev); sel = null; render(true); softSwap(body); return; }
  if (b.dataset.done){
    const id = WRENCH[dev].id; (done[id] = done[id] || {})[b.dataset.done] = Date.now(); save(); refreshCare(b.dataset.done); showToast('ثبت شد'); return;
  }
  if (b.dataset.undo){
    const id = WRENCH[dev].id; if (done[id]){ delete done[id][b.dataset.undo]; save(); refreshCare(b.dataset.undo); showToast('ثبت لغو شد'); }
  }
});
window.openWrench = (i) => {
  if (typeof i === 'number' && WRENCH[i]){ dev = i; sel = null; }
  showView('wrench');
  try { render(); softSwap(body); } catch (err) { body.innerHTML = '<div class="tool-card"><p class="lab-muted">بارگذاری این بخش ناقص بود؛ صفحه را یک‌بار تازه‌سازی کنید.</p></div>'; }
};
document.getElementById('wrenchBackBtn').addEventListener('click', () => showView(state.currentTab));
window.addEventListener('cp-reset', () => { done = {}; sel = null; render(); });
try { render(); } catch (err) {}
})();
