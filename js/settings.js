(function(){
const K_SET = 'cp_settings', K_FAV = 'cp_favs';
const DATA_KEYS = ['cp_lab','cp_quiz','cp_journal','cp_gear','cp_cart','cp_wrench', K_SET, K_FAV];
const SHAPE = { cp_lab:'o', cp_quiz:'o', cp_journal:'a', cp_gear:'a', cp_cart:'o', cp_wrench:'o', cp_settings:'o', cp_favs:'a' };
const SIZES = [
  { id:'s',  label:'کوچک',       z:0.9  },
  { id:'m',  label:'معمولی',     z:1    },
  { id:'l',  label:'بزرگ',       z:1.12 },
  { id:'xl', label:'خیلی بزرگ',  z:1.25 }
];
const fa = n => toPersianDigits(n);
const rd = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const wr = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
const rm = k => { try { localStorage.removeItem(k); } catch (e) {} };
const parse = s => { try { return JSON.parse(s); } catch (e) { return undefined; } };

let cfg = parse(rd(K_SET)); if (!cfg || typeof cfg !== 'object' || Array.isArray(cfg)) cfg = {};

function saveCfg(){
  cfg.theme = state.theme; cfg.themeMode = mode(); cfg.unit = state.unit; cfg.language = state.language;
  wr(K_SET, JSON.stringify(cfg));
}
function saveFavs(){ wr(K_FAV, JSON.stringify([...state.favorites])); }

function size(){ return SIZES.find(s => s.id === cfg.font) || SIZES[1]; }
function applyFont(){
  const s = size();
  document.documentElement.style.setProperty('--ui-zoom', String(s.z));
  const l = document.getElementById('fontSizeRowLabel'); if (l) l.textContent = s.label;
}

/* ترجیح‌ها */
const PREF_DEFAULT = { bigText:false, calm:false, wake:true, sound:true, vibe:true, remind:false };
window.cpPref = (k, d) => (cfg[k] === undefined ? (d !== undefined ? d : PREF_DEFAULT[k]) : cfg[k]);
const dq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
const MODES = [ { id:'light', label:'روشن' }, { id:'dark', label:'تیره' }, { id:'auto', label:'خودکار (طبق دستگاه)' } ];
function mode(){ return ['light','dark','auto'].includes(cfg.themeMode) ? cfg.themeMode : (cfg.theme === 'dark' ? 'dark' : 'light'); }
function resolveTheme(){ const m = mode(); return m === 'auto' ? (dq && dq.matches ? 'dark' : 'light') : m; }
function applyPrefs(){
  const r = document.documentElement.classList;
  r.toggle('recipe-big', !!cpPref('bigText'));
  r.toggle('calm', !!cpPref('calm'));
  document.querySelectorAll('[data-pref]').forEach(el => {
    const on = !!cpPref(el.dataset.pref);
    const sw = el.querySelector('.switch'); if (sw){ sw.classList.toggle('on', on); sw.setAttribute('aria-checked', on ? 'true' : 'false'); }
  });
}
function setTheme(){
  state.theme = resolveTheme();
  applyTheme();
  const l = document.getElementById('themeModeLabel'); if (l) l.textContent = (MODES.find(m => m.id === mode()) || MODES[0]).label;
}

/* بارگذاری مقدارهای ذخیره‌شده */
if (typeof cfg.unit === 'string' && UNIT_OPTIONS.includes(cfg.unit)) state.unit = cfg.unit;
if (typeof cfg.language === 'string' && LANGUAGE_OPTIONS.includes(cfg.language)) state.language = cfg.language;
const favs = parse(rd(K_FAV));
if (Array.isArray(favs)) favs.forEach(id => { if (ALL_DRINKS.some(d => d.id === Number(id))) state.favorites.add(Number(id)); });
function refreshUI(){
  setTheme(); applyFont(); applyPrefs();
  const u = document.getElementById('unitsLabel'); if (u) u.textContent = state.unit;
  const g = document.getElementById('languageLabel'); if (g) g.textContent = state.language;
  renderGrid(); renderFavorites(); renderDashboardStats();
}
refreshUI();
if (dq && dq.addEventListener) dq.addEventListener('change', () => { if (mode() === 'auto') setTheme(); });

/* ذخیره‌ی خودکار */
const _toggle = window.toggleFavorite;
window.toggleFavorite = function(id){ _toggle(id); saveFavs(); };
document.addEventListener('click', e => {
  if (e.target.closest('[data-unit],[data-lang]')) setTimeout(saveCfg, 0);
});

/* حالت نمایش */
document.getElementById('themeToggleRow').addEventListener('click', () => {
  const draw = () => openModal(`<h3>حالت نمایش</h3>${MODES.map(m => `
      <div class="option-row ${m.id === mode() ? 'selected' : ''}" data-tm="${m.id}">
        <span>${m.label}</span><span class="radio"></span>
      </div>`).join('')}`);
  const wire = () => document.querySelectorAll('[data-tm]').forEach(el => el.addEventListener('click', () => {
    cfg.themeMode = el.dataset.tm; saveCfg(); setTheme(); closeModal();
  }));
  draw(); wire();
});

/* کلیدهای روشن/خاموش */
document.querySelectorAll('[data-pref]').forEach(el => el.addEventListener('click', () => {
  const k = el.dataset.pref; cfg[k] = !cpPref(k); saveCfg(); applyPrefs();
  if (k === 'remind' && cfg[k]) { if (!cfg.lastBackup) cfg.lastBackup = Date.now(); saveCfg(); showToast('یادآوری ماهانه روشن شد'); }
}));

/* اندازه‌ی فونت */
document.getElementById('fontSizeRow').addEventListener('click', () => {
  const draw = () => openModal(`<h3>اندازه‌ی فونت</h3>${SIZES.map(s => `
      <div class="option-row ${s.id === size().id ? 'selected' : ''}" data-fs="${s.id}">
        <span>${s.label}</span><span class="radio"></span>
      </div>`).join('')}
    <p class="fs-sample">نمونه: قهوه‌ی خوب با دقت و حوصله دم می‌شود.</p>`);
  const wire = () => document.querySelectorAll('[data-fs]').forEach(el => el.addEventListener('click', () => {
    cfg.font = el.dataset.fs; saveCfg(); applyFont(); draw(); wire();
  }));
  draw(); wire();
});

/* پشتیبان‌گیری */
function snapshot(){
  const data = {};
  DATA_KEYS.forEach(k => { const v = parse(rd(k)); if (v !== undefined && v !== null) data[k] = v; });
  data[K_SET] = Object.assign({}, cfg, { theme: state.theme, themeMode: mode(), unit: state.unit, language: state.language });
  data[K_FAV] = [...state.favorites];
  return { app: 'coffee-pedia', format: 1, exported: new Date().toISOString(), data };
}
document.getElementById('backupRow').addEventListener('click', () => {
  const snap = snapshot();
  const blob = new Blob([JSON.stringify(snap, null, 1)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'coffee-pedia-backup-' + snap.exported.slice(0, 10) + '.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  cfg.lastBackup = Date.now(); saveCfg();
  showToast('فایل پشتیبان ساخته شد');
});

/* بازیابی */
function check(obj){
  if (!obj || obj.app !== 'coffee-pedia' || !obj.data || typeof obj.data !== 'object' || Array.isArray(obj.data)) return null;
  const out = {};
  for (const k of DATA_KEYS){
    if (!(k in obj.data)) continue;
    const v = obj.data[k];
    if (SHAPE[k] === 'a' ? !Array.isArray(v) : (!v || typeof v !== 'object' || Array.isArray(v))) return null;
    out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}
function summary(d, when){
  const rows = [];
  if (d.cp_journal) rows.push(fa(d.cp_journal.length) + ' یادداشت دفترچه');
  if (d.cp_favs) rows.push(fa(d.cp_favs.length) + ' علاقه‌مندی');
  if (d.cp_gear) rows.push(fa(d.cp_gear.length) + ' وسیله در «تجهیزات من»');
  if (d.cp_lab) rows.push('پیشرفت آزمایشگاه');
  if (d.cp_quiz) rows.push('نتیجه‌ی آزمون');
  if (d.cp_cart) rows.push('لیست خرید');
  if (d.cp_wrench) rows.push('ثبت‌های دست به آچار');
  if (d.cp_settings) rows.push('تنظیمات');
  let date = '';
  try { date = new Date(when).toLocaleDateString('fa-IR'); } catch (e) {}
  return (date ? `<p class="fs-sample" style="margin-top:0">تاریخ پشتیبان: ${escapeHtml(date)}</p>` : '') +
    `<ul class="rs-list">${rows.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>`;
}
const fileInput = document.getElementById('restoreFile');
document.getElementById('restoreRow').addEventListener('click', () => { fileInput.value = ''; fileInput.click(); });
fileInput.addEventListener('change', () => {
  const f = fileInput.files && fileInput.files[0]; if (!f) return;
  if (f.size > 5 * 1024 * 1024) { showToast('این فایل پشتیبان معتبر نیست'); return; }
  const r = new FileReader();
  r.onerror = () => showToast('خواندن فایل ممکن نشد');
  r.onload = () => {
    const obj = parse(String(r.result));
    const d = check(obj);
    if (!d){ showToast('این فایل پشتیبان معتبر نیست'); return; }
    openModal(`<h3>بازیابی اطلاعات</h3>
      <p class="about-text" style="margin-top:0">داده‌های فعلی این دستگاه با محتوای زیر جایگزین می‌شود:</p>
      ${summary(d, obj.exported)}
      <div class="modal-actions">
        <button class="btn btn-line" id="rsCancel" type="button">انصراف</button>
        <button class="btn btn-ink" id="rsGo" type="button">جایگزین کن</button>
      </div>`);
    document.getElementById('rsCancel').addEventListener('click', closeModal);
    document.getElementById('rsGo').addEventListener('click', () => {
      DATA_KEYS.forEach(rm);
      let ok = true;
      Object.keys(d).forEach(k => { if (!wr(k, JSON.stringify(d[k]))) ok = false; });
      closeModal();
      if (!ok){ showToast('ذخیره‌ی داده‌ها در مرورگر ممکن نشد'); return; }
      showToast('اطلاعات بازیابی شد');
      setTimeout(() => location.reload(), 700);
    });
  };
  r.readAsText(f);
});

/* خروجی‌ها */
function saveText(name, text, type){
  const blob = new Blob([text], { type: type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
const day = () => new Date().toISOString().slice(0, 10);
document.getElementById('csvRow').addEventListener('click', () => {
  const j = parse(rd('cp_journal'));
  if (!Array.isArray(j) || !j.length){ showToast('دفترچه خالی است'); return; }
  const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const head = ['تاریخ','نوشیدنی','دوز (گرم)','آب (گرم)','دما (درجه)','زمان (ثانیه)','آسیاب','امتیاز','یادداشت'];
  const rows = j.map(e => [new Date(e.t || 0).toISOString().slice(0, 16).replace('T', ' '), e.name, e.dose || '', e.water || '', e.temp || '', e.time || '', e.grind, e.rating, e.note].map(q).join(','));
  saveText('coffee-pedia-journal-' + day() + '.csv', '\ufeff' + [head.map(q).join(','), ...rows].join('\r\n'), 'text/csv;charset=utf-8');
  showToast('فایل CSV ساخته شد');
});
document.getElementById('cartTxtRow').addEventListener('click', () => {
  const c = parse(rd('cp_cart')) || {};
  const ids = Object.keys(c).filter(k => c[k] > 0);
  if (!ids.length){ showToast('لیست خرید خالی است'); return; }
  const names = ids.map(id => { const d = ALL_DRINKS.find(x => String(x.id) === id); return d ? '• ' + splitName(d.title).fa + ' × ' + fa(c[id]) : null; }).filter(Boolean);
  const box = document.querySelector('#studioBody .cart-total, #studioBody .cart-list');
  let text = 'لیست خرید Coffee Pedia\n\nنوشیدنی‌ها:\n' + names.join('\n');
  if (typeof window.cpCartText === 'function') text += '\n\nمواد لازم:\n' + window.cpCartText();
  saveText('coffee-pedia-shopping-' + day() + '.txt', text, 'text/plain;charset=utf-8');
  showToast('فایل متنی ساخته شد');
});

/* پاک‌کردن حافظه‌ی آفلاین */
document.getElementById('cacheRow').addEventListener('click', () => {
  openModal(`<h3>پاک‌کردن حافظه‌ی آفلاین</h3>
    <p class="about-text" style="margin-top:0">نسخه‌ی ذخیره‌شده‌ی اپ پاک می‌شود و صفحه از نو بارگذاری می‌شود (به اینترنت نیاز است). پیشرفت و تنظیمات شما دست نمی‌خورد.</p>
    <div class="modal-actions">
      <button class="btn btn-line" id="ccCancel" type="button">انصراف</button>
      <button class="btn btn-ink" id="ccGo" type="button">پاک کن</button>
    </div>`);
  document.getElementById('ccCancel').addEventListener('click', closeModal);
  document.getElementById('ccGo').addEventListener('click', async () => {
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations){ const rs = await navigator.serviceWorker.getRegistrations(); await Promise.all(rs.map(r => r.unregister())); }
      if (window.caches){ const ks = await caches.keys(); await Promise.all(ks.map(k => caches.delete(k))); }
    } catch (e) {}
    closeModal(); showToast('حافظه‌ی آفلاین پاک شد');
    setTimeout(() => location.reload(), 600);
  });
});

/* یادآوری پشتیبان ماهانه */
(function(){
  if (!cpPref('remind')) return;
  const last = Number(cfg.lastBackup) || 0, now = Date.now();
  if (now - last < 30 * 86400000) return;
  if (cfg.lastRemind && now - cfg.lastRemind < 86400000) return;
  cfg.lastRemind = now; saveCfg();
  setTimeout(() => showToast('یک ماه از آخرین پشتیبان گذشته است؛ از تنظیمات پشتیبان بگیرید'), 1500);
})();
})();
