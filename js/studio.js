(function(){
const K_J = 'cp_journal', K_G = 'cp_gear', K_C = 'cp_cart';
const fa = n => toPersianDigits(n);
const esc = s => escapeHtml(String(s));
const ld = (k, def) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } };
const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

let journal = ld(K_J, []); if (!Array.isArray(journal)) journal = [];
let gear = ld(K_G, []); if (!Array.isArray(gear)) gear = [];
let cart = ld(K_C, {}); if (!cart || typeof cart !== 'object' || Array.isArray(cart)) cart = {};
let tab = 'journal', form = {rating: 0}, trouble = {m: 'espresso', s: 'sour'}, cartQ = '', delArm = null;
const body = document.getElementById('studioBody');

/* ---------- تجهیزات ---------- */
const groupOf = new Map();
RECIPE_GROUPS.forEach(g => g.items.forEach(d => groupOf.set(d.id, g.id)));
function gearKeys(part){ for (const [re, k] of GEAR_PATTERNS) if (re.test(part)) return k; return null; }
function needs(d){
  let eq = Array.isArray(d.equipment) ? d.equipment : [];
  if (!eq.length){ const g = groupOf.get(d.id); if (g && g.indexOf('espresso') === 0 && GROUP_EQUIPMENT[g]) eq = GROUP_EQUIPMENT[g]; }
  return eq.map(s => s.split(/\s+یا\s+|\//).map(gearKeys));
}
const NEEDS = new Map(ALL_DRINKS.map(d => [d.id, needs(d)]));
function missing(d, own){
  const miss = [];
  for (const alts of NEEDS.get(d.id)){
    if (alts.some(k => k === null || own.has(k))) continue;
    miss.push(alts.find(k => k) );
  }
  return [...new Set(miss)];
}
const gearName = k => (GEAR.find(g => g.key === k) || {fa: k}).fa;

function gearView(){
  const own = new Set(gear);
  let ok = [], one = {};
  ALL_DRINKS.forEach(d => {
    const m = missing(d, own);
    if (!m.length) ok.push(d);
    else if (m.length === 1) (one[m[0]] = one[m[0]] || []).push(d);
  });
  const hint = Object.entries(one).sort((a, b) => b[1].length - a[1].length).slice(0, 4);
  return `
    <div class="tool-card">
      <h3>تجهیزات من</h3>
      <p class="lab-muted">وسایلی را که دارید لمس کنید تا فقط نوشیدنی‌هایی که با آن‌ها قابل‌تهیه‌اند ببینید. ظرف‌ها، یخ و فیلتر کاغذی همیشه در دسترس فرض می‌شوند.</p>
      <div class="gear-chips">${GEAR.map(g => `<button type="button" class="pill-choice${own.has(g.key) ? ' active' : ''}" data-gear="${g.key}">${esc(g.fa)}</button>`).join('')}</div>
    </div>
    <div class="tool-card">
      <h3>قابل‌تهیه با وسایل شما <span class="lab-count">${fa(ok.length)} از ${fa(ALL_DRINKS.length)}</span></h3>
      ${hint.length && gear.length ? `<p class="lab-muted">${hint.map(([k, a]) => `با ${esc(gearName(k))}: ${fa(a.length)} نوشیدنی دیگر`).join(' • ')}</p>` : ''}
      <div class="card-grid" id="gearGrid">${ok.map(drinkCardHtml).join('') || '<p class="lab-muted">با این وسایل نوشیدنی‌ای پیدا نشد.</p>'}</div>
    </div>`;
}

/* ---------- دفترچه ---------- */
function ratioText(dose, water){ const r = water / dose; return isFinite(r) && r > 0 ? '۱:' + fa((Math.round(r * 10) / 10).toString().replace('.', '٫')) : '—'; }
function bestFor(id){
  const l = journal.filter(e => e.drink === id && e.rating >= 4);
  l.sort((a, b) => b.rating - a.rating || b.t - a.t);
  return l[0] || null;
}
function entryLine(e){
  const bits = [];
  if (e.dose) bits.push(fa(e.dose) + ' گرم قهوه');
  if (e.water) bits.push(fa(e.water) + ' میل آب');
  if (e.dose && e.water) bits.push('نسبت ' + ratioText(e.dose, e.water));
  if (e.grind) bits.push('آسیاب ' + e.grind);
  if (e.temp) bits.push(fa(e.temp) + ' درجه‌ی سانتی‌گراد');
  if (e.time) bits.push(fa(e.time) + ' ثانیه');
  return bits.join(' • ');
}
const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
function journalView(){
  const avg = journal.length ? journal.reduce((s, e) => s + e.rating, 0) / journal.length : 0;
  const best = journal.slice().sort((a, b) => b.rating - a.rating || b.t - a.t)[0];
  const sel = form.drink || '';
  const b = sel ? bestFor(Number(sel)) : null;
  return `
    <div class="lab-stats"><div><b>${fa(journal.length)}</b><span>دم‌آوری ثبت‌شده</span></div>
      <div><b>${journal.length ? fa(avg.toFixed(1).replace('.', '٫')) : '—'}</b><span>میانگین امتیاز</span></div>
      <div><b>${best ? fa(best.rating) + '★' : '—'}</b><span>بهترین امتیاز</span></div></div>
    <div class="tool-card">
      <h3>ثبت دم‌آوری تازه</h3>
      <label class="field-label">نوشیدنی</label>
      <select id="jDrink" class="studio-in"><option value="">— دلخواه —</option>${ALL_DRINKS.map(d => `<option value="${d.id}"${String(d.id) === String(sel) ? ' selected' : ''}>${esc(splitName(d.title).fa)}</option>`).join('')}</select>
      ${b ? `<div class="lab-block" style="margin-top:10px">بهترین ثبت قبلی شما (${stars(b.rating)}): ${esc(entryLine(b))}<br><button type="button" class="btn btn-ink" id="jUse" style="margin-top:8px">استفاده از این تنظیم</button></div>` : ''}
      <div class="studio-grid">
        <div><label class="field-label">قهوه (گرم)</label><input id="jDose" class="studio-in" type="number" inputmode="decimal" min="0" step="0.1" value="${form.dose || ''}"></div>
        <div><label class="field-label">آب (میلی‌لیتر)</label><input id="jWater" class="studio-in" type="number" inputmode="decimal" min="0" step="1" value="${form.water || ''}"></div>
        <div><label class="field-label">دما (درجه‌ی سانتی‌گراد)</label><input id="jTemp" class="studio-in" type="number" inputmode="decimal" min="0" step="1" value="${form.temp || ''}"></div>
        <div><label class="field-label">زمان (ثانیه)</label><input id="jTime" class="studio-in" type="number" inputmode="decimal" min="0" step="1" value="${form.time || ''}"></div>
      </div>
      <label class="field-label">اندازه‌ی آسیاب</label>
      <div class="gear-chips">${GRIND_OPTIONS.map(g => `<button type="button" class="pill-choice${form.grind === g ? ' active' : ''}" data-jgrind="${g}">${g}</button>`).join('')}</div>
      <label class="field-label" style="margin-top:12px">امتیاز طعم</label>
      <div class="star-row">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="star${form.rating >= n ? ' on' : ''}" data-star="${n}" aria-label="${n}">★</button>`).join('')}</div>
      <label class="field-label" style="margin-top:12px">یادداشت</label>
      <input id="jNote" class="studio-in" type="text" maxlength="160" value="${esc(form.note || '')}" placeholder="مثلاً کمی ترش بود">
      <button type="button" class="btn btn-ink" id="jSave" style="margin-top:14px;width:100%">ذخیره در دفترچه</button>
    </div>
    <div class="tool-card">
      <h3>دفترچه‌ی من</h3>
      ${journal.length ? journal.map(e => `
        <div class="j-entry">
          <div class="j-top"><b>${esc(e.name || 'دم‌آوری دلخواه')}</b><span class="j-stars">${stars(e.rating)}</span></div>
          <div class="j-meta">${esc(entryLine(e)) || '—'}</div>
          ${e.note ? `<div class="j-note">${esc(e.note)}</div>` : ''}
          <div class="j-foot"><span>${esc(cpDate(e.t))}</span>
            <span><button type="button" class="j-del" data-jrep="${e.t}">تکرار</button><button type="button" class="j-del${delArm === e.t ? ' armed' : ''}" data-jdel="${e.t}">${delArm === e.t ? 'مطمئنید؟' : 'حذف'}</button></span></div>
        </div>`).join('') : '<p class="lab-muted">هنوز چیزی ثبت نکرده‌اید. بعد از هر دم‌آوری مقادیر و امتیازتان را اینجا بنویسید تا دفعه‌ی بعد بهترین تنظیم را پیدا کنید.</p>'}
    </div>`;
}
function readForm(){
  const g = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  form.drink = g('jDrink'); form.dose = g('jDose'); form.water = g('jWater'); form.temp = g('jTemp'); form.time = g('jTime'); form.note = g('jNote');
}
function saveEntry(){
  readForm();
  if (!form.rating){ showToast('یک امتیاز بدهید'); return; }
  const num = v => { const n = parseFloat(v); return isFinite(n) && n > 0 ? n : 0; };
  const d = form.drink ? ALL_DRINKS.find(x => String(x.id) === String(form.drink)) : null;
  journal.unshift({t: Date.now(), drink: d ? d.id : null, name: d ? splitName(d.title).fa : '',
    dose: num(form.dose), water: num(form.water), temp: num(form.temp), time: num(form.time),
    grind: form.grind || '', rating: form.rating, note: (form.note || '').trim()});
  journal = journal.slice(0, 200); sv(K_J, journal);
  form = {rating: 0, drink: form.drink};
  render(); showToast('در دفترچه ذخیره شد');
}

/* ---------- عیب‌یاب ---------- */
function troubleView(){
  const t = TROUBLE[trouble.s];
  const mm = TROUBLE_METHODS.find(m => m.key === trouble.m);
  return `
    <div class="tool-card">
      <h3>عیب‌یاب طعم</h3>
      <label class="field-label">روش دم‌آوری</label>
      <div class="gear-chips">${TROUBLE_METHODS.map(m => `<button type="button" class="pill-choice${trouble.m === m.key ? ' active' : ''}" data-tm="${m.key}">${m.fa}</button>`).join('')}</div>
      <label class="field-label" style="margin-top:12px">مشکل فنجان شما</label>
      <div class="gear-chips">${TROUBLE_SYMPTOMS.map(s => `<button type="button" class="pill-choice${trouble.s === s.key ? ' active' : ''}" data-ts="${s.key}">${s.fa}</button>`).join('')}</div>
    </div>
    <div class="tool-card">
      <h3>علت احتمالی</h3>
      <p class="lab-q" style="font-weight:600;font-size:13.5px">${esc(t.why)}</p>
      <h3 style="margin-top:14px">چه کنیم (${esc(mm.fa)})</h3>
      <ol class="trouble-list">${t.all.concat(t[trouble.m] || []).map(x => `<li>${esc(x)}</li>`).join('')}</ol>
    </div>`;
}

/* ---------- لیست خرید ---------- */
function parseAmt(a){
  let s = toLatinDigits(String(a)).replace(/٫/g, '.').replace(/\([^)]*\)/g, '').replace('½', '0.5').trim();
  if (/^\d+\/\d+$/.test(s)){ const [x, y] = s.split('/'); return [x / y, x / y]; }
  let m = s.match(/^(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)$/); if (m) return [parseFloat(m[1]), parseFloat(m[2])];
  m = s.match(/^(\d+(?:\.\d+)?)\s*\+?$/); if (m) return [parseFloat(m[1]), parseFloat(m[1])];
  return null;
}
const fmt = n => fa((Math.round(n * 10) / 10).toString().replace('.', '٫'));
function totals(){
  const map = new Map();
  Object.keys(cart).forEach(id => {
    const d = ALL_DRINKS.find(x => String(x.id) === id), n = cart[id];
    if (!d || !n) return;
    (d.ingredients || []).forEach(ing => {
      const key = ing.name + '|' + (ing.unit || '');
      const r = map.get(key) || {name: ing.name, unit: ing.unit || '', lo: 0, hi: 0, num: false, other: 0};
      const p = parseAmt(ing.amount);
      if (p){ r.lo += p[0] * n; r.hi += p[1] * n; r.num = true; } else r.other += n;
      map.set(key, r);
    });
  });
  return [...map.values()];
}
function cartText(){
  return totals().map(r => '• ' + r.name + (r.num ? ': ' + (r.lo === r.hi ? fmt(r.lo) : fmt(r.lo) + '–' + fmt(r.hi)) + (r.unit ? ' ' + r.unit : '') : '') ).join('\n');
}
window.cpCartText = cartText;
function cartView(){
  const ids = Object.keys(cart).filter(k => cart[k] > 0);
  const q = cartQ.trim().toLowerCase();
  const list = ALL_DRINKS.filter(d => !q || d.title.toLowerCase().includes(q)).slice(0, 30);
  const tot = totals();
  return `
    <div class="tool-card">
      <h3>انتخاب نوشیدنی‌ها <span class="lab-count">${fa(ids.reduce((s, k) => s + cart[k], 0))} فنجان</span></h3>
      <input id="cQ" class="studio-in" type="search" placeholder="جست‌وجوی نوشیدنی…" value="${esc(cartQ)}">
      <div class="cart-list">${list.map(d => `
        <div class="cart-row"><span>${esc(splitName(d.title).fa)}</span>
          <span class="stepper"><button type="button" data-cdec="${d.id}" aria-label="کم">−</button><b>${fa(cart[d.id] || 0)}</b><button type="button" data-cinc="${d.id}" aria-label="زیاد">+</button></span></div>`).join('')}</div>
    </div>
    <div class="tool-card">
      <h3>مجموع مواد لازم</h3>
      ${tot.length ? `<div class="cart-tot">${tot.map(r => `<div class="cart-row"><span>${esc(r.name)}</span><b>${r.num ? (r.lo === r.hi ? fmt(r.lo) : fmt(r.lo) + '–' + fmt(r.hi)) + (r.unit ? ' ' + esc(r.unit) : '') : '—'}</b></div>`).join('')}</div>
        <p class="lab-muted" style="margin-top:10px">مقدارها از دستورهای هر نوشیدنی جمع شده‌اند؛ بازه‌ها به‌صورت کمینه تا بیشینه آمده‌اند.</p>
        <div style="display:flex;gap:8px"><button type="button" class="btn btn-ink" id="cCopy">کپی لیست</button><button type="button" class="btn btn-line" id="cClear">پاک‌کردن</button></div>`
        : '<p class="lab-muted">چند نوشیدنی انتخاب کنید تا مجموع مواد را ببینید.</p>'}
    </div>`;
}

/* ---------- نمایش ---------- */
function render(keep){
  const y = document.getElementById('appBody').scrollTop;
  document.querySelectorAll('[data-studiotab]').forEach(b => b.classList.toggle('active', b.dataset.studiotab === tab));
  body.innerHTML = ({journal: journalView, trouble: troubleView, gear: gearView, cart: cartView})[tab]();
  if (tab === 'gear') wireCardEvents(body);
  document.getElementById('studioSub').textContent = ({journal: 'تنظیم‌هایتان را ثبت کنید', trouble: 'علت طعم بد را پیدا کنید', gear: 'با وسایلتان چه می‌شود ساخت', cart: 'مواد لازم برای چند فنجان'})[tab];
  if (keep) document.getElementById('appBody').scrollTop = y;
}
body.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.gear){ const i = gear.indexOf(t.dataset.gear); if (i < 0) gear.push(t.dataset.gear); else gear.splice(i, 1); sv(K_G, gear); render(true); return; }
  if (t.dataset.tm){ trouble.m = t.dataset.tm; render(true); return; }
  if (t.dataset.ts){ trouble.s = t.dataset.ts; render(true); return; }
  if (t.dataset.jgrind){ readForm(); form.grind = form.grind === t.dataset.jgrind ? '' : t.dataset.jgrind; render(true); return; }
  if (t.dataset.star){ readForm(); form.rating = Number(t.dataset.star); render(true); return; }
  if (t.id === 'jSave'){ saveEntry(); return; }
  if (t.id === 'jUse'){ readForm(); const b = bestFor(Number(form.drink)); if (b){ form.dose = b.dose || ''; form.water = b.water || ''; form.temp = b.temp || ''; form.time = b.time || ''; form.grind = b.grind || ''; render(true); } return; }
  if (t.dataset.jrep){
    const e0 = journal.find(x => x.t === Number(t.dataset.jrep));
    if (e0){ form = {rating: 0, drink: e0.drink || '', dose: e0.dose || '', water: e0.water || '', temp: e0.temp || '', time: e0.time || '', grind: e0.grind || '', note: ''}; render(); softSwap(body); showToast('تنظیم‌ها در فرم گذاشته شد'); }
    return;
  }
  if (t.dataset.jdel){
    const id = Number(t.dataset.jdel);
    if (delArm !== id){ delArm = id; render(true); setTimeout(() => { if (delArm === id){ delArm = null; if (tab === 'journal') render(true); } }, 3000); return; }
    journal = journal.filter(x => x.t !== id); sv(K_J, journal); delArm = null; render(true); return;
  }
  if (t.dataset.cinc || t.dataset.cdec){
    const id = t.dataset.cinc || t.dataset.cdec; cart[id] = Math.max(0, Math.min(20, (cart[id] || 0) + (t.dataset.cinc ? 1 : -1)));
    if (!cart[id]) delete cart[id]; sv(K_C, cart); render(true); return;
  }
  if (t.id === 'cClear'){ cart = {}; sv(K_C, cart); render(true); return; }
  if (t.id === 'cCopy'){
    const txt = cartText();
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => showToast('لیست کپی شد')).catch(() => showToast('کپی نشد'));
  }
});
body.addEventListener('input', e => {
  if (e.target.id === 'cQ'){ cartQ = e.target.value; const pos = e.target.selectionStart; render(true); const el = document.getElementById('cQ'); if (el){ el.focus(); try { el.setSelectionRange(pos, pos); } catch (x) {} } }
});
body.addEventListener('change', e => { if (e.target.id === 'jDrink'){ readForm(); render(true); } });
document.querySelectorAll('[data-studiotab]').forEach(b => b.addEventListener('click', () => { tab = b.dataset.studiotab; render(); softSwap(body); }));
document.getElementById('openStudioBtn').addEventListener('click', () => { render(); showView('studio'); softSwap(body); });
document.getElementById('studioBackBtn').addEventListener('click', () => showView(state.currentTab));
window.addEventListener('cp-reset', () => { journal = []; gear = []; cart = {}; form = {rating: 0}; render(); });
render();
})();
