/* ===================================================================
   Coffee Pedia (دانشنامه قهوه) — App logic
   =================================================================== */

const ENCYCLOPEDIA_BROWSABLE = ENCYCLOPEDIA;
const ITEM_INDEX = new Map();
ENCYCLOPEDIA.forEach(cat => cat.items.forEach(it => ITEM_INDEX.set(it.id, {cat, item: it})));

const ALL_DRINKS = RECIPE_GROUPS.flatMap(g => g.items);
// Recipes live only inside RECIPE_GROUPS (not duplicated into ENCYCLOPEDIA) —
// index them here too so openDetail()/FEATURED lookups by id work regardless
// of where a drink is shown.
RECIPE_GROUPS.forEach(g => g.items.forEach(it =>
  ITEM_INDEX.set(it.id, {cat: {id: g.id, title: g.title, icon: g.icon, hero: g.hero}, item: it})));

// Reverse lookup: drink id -> its group's icon key, so every card/ring shows
// an icon that actually reflects the kind of drink (was: a single hard-coded
// ☕ emoji on literally every card, regardless of whether it was a cold brew,
// a pour-over or an espresso drink).
const DRINK_ICON = new Map();
RECIPE_GROUPS.forEach(g => g.items.forEach(it => DRINK_ICON.set(it.id, g.icon || 'coffee')));

const FEATURED = FEATURED_IDS.map(id => ITEM_INDEX.get(id)?.item).filter(Boolean);

/* ---------------- Name splitting: every drink shows "نام فارسی" + "English Name" ---------------- */
function splitName(title){
  const m = title.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  if (m) return { fa: m[1].trim(), en: m[2].trim() };
  return { fa: title, en: '' };
}

/* ---------------- In-memory app state (no localStorage) ---------------- */
const state = {
  theme: 'light',
  unit: 'متریک (ml, g)',
  language: 'فارسی',
  favorites: new Set(),
  selectedGroup: 'all',
  currentDetailId: null,
  currentTab: 'home',
  caffeineLog: [], // {name, mg}
};

const heartOutlineSVG = (color) => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
const heartFilledSVG = (color) => `<svg viewBox="0 0 24 24" fill="${color}"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;

function toPersianDigits(str){
  const map = {'0':'۰','1':'۱','2':'۲','3':'۳','4':'۴','5':'۵','6':'۶','7':'۷','8':'۸','9':'۹'};
  return String(str).replace(/[0-9]/g, d => map[d]);
}
function toLatinDigits(str){
  const map = {'۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9'};
  return String(str).replace(/[۰-۹]/g, d => map[d]);
}
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function stripTags(html){
  return String(html).replace(/<[^>]*>/g, ' ');
}

/* ---------------- Home: featured + chips + grid ---------------- */
function renderFeatured(){
  const track = document.getElementById('featuredCarousel');
  const dots = document.getElementById('featuredDots');
  track.innerHTML = FEATURED.map(d => {
    const n = splitName(d.title);
    return `
    <div class="feature-card" data-open="${d.id}">
      <div class="feature-ring">${Icons.render(DRINK_ICON.get(d.id))}</div>
      <div class="feature-fa">${escapeHtml(n.fa)}</div>
      <div class="feature-en">${escapeHtml(n.en)}</div>
      <div class="feature-tagline">★ ویژه‌ی این هفته</div>
    </div>`;
  }).join('');
  dots.innerHTML = FEATURED.map((_, i) => `<span class="${i===0?'active':''}"></span>`).join('');

  track.querySelectorAll('[data-open]').forEach(el =>
    el.addEventListener('click', () => openDetail(Number(el.dataset.open))));
  track.addEventListener('scroll', () => {
    const idx = Math.round(track.scrollLeft / (track.firstElementChild.offsetWidth + 13));
    [...dots.children].forEach((d, i) => d.classList.toggle('active', i === idx));
  });
}

function renderChips(){
  const row = document.getElementById('categoryChips');
  const all = [{id:'all', icon:'gridDots', title:'همه'}, ...RECIPE_GROUPS];
  row.innerHTML = all.map(c =>
    `<button class="stub ${c.id===state.selectedGroup?'active':''}" data-group="${c.id}" type="button">${Icons.render(c.icon)} ${escapeHtml(c.title)}</button>`
  ).join('');
  row.querySelectorAll('[data-group]').forEach(el =>
    el.addEventListener('click', () => {
      state.selectedGroup = el.dataset.group;
      renderChips();
      renderGrid();
    }));
}

function recipesForGroup(groupId){
  if (groupId === 'all') return ALL_DRINKS;
  const g = RECIPE_GROUPS.find(g => g.id === groupId);
  return g ? g.items : [];
}

function drinkCardHtml(d){
  const isFav = state.favorites.has(d.id);
  const n = splitName(d.title);
  return `
    <div class="drink-card" data-open="${d.id}">
      <button class="seal-fav" data-fav="${d.id}" aria-label="افزودن به علاقه‌مندی‌ها">
        ${isFav ? heartFilledSVG('var(--rust)') : heartOutlineSVG('var(--ink-soft)')}
      </button>
      <div class="ring">${Icons.render(DRINK_ICON.get(d.id))}</div>
      <h4>${escapeHtml(n.fa)}${n.en ? `<span class="en">${escapeHtml(n.en)}</span>` : ''}</h4>
    </div>`;
}

function wireCardEvents(container){
  container.querySelectorAll('[data-open]').forEach(el =>
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-fav]')) return;
      openDetail(Number(el.dataset.open));
    }));
  container.querySelectorAll('[data-fav]').forEach(el =>
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(Number(el.dataset.fav));
    }));
}

function renderGrid(){
  const grid = document.getElementById('drinkGrid');
  grid.innerHTML = recipesForGroup(state.selectedGroup).map(drinkCardHtml).join('');
  wireCardEvents(grid);
}

function renderFavorites(){
  const grid = document.getElementById('favGrid');
  const empty = document.getElementById('favEmpty');
  const list = ALL_DRINKS.filter(d => state.favorites.has(d.id));
  if (list.length === 0){
    grid.style.display = 'none';
    empty.style.display = 'flex';
    return;
  }
  grid.style.display = 'grid';
  empty.style.display = 'none';
  grid.innerHTML = list.map(drinkCardHtml).join('');
  wireCardEvents(grid);
}

function toggleFavorite(id){
  if (!id) return;
  if (state.favorites.has(id)) state.favorites.delete(id);
  else state.favorites.add(id);
  renderGrid();
  renderFavorites();
  renderDashboardStats();
  if (state.currentDetailId === id) updateDetailFavIcon();
}

/* ---------------- Detail view ---------------- */
function isNumericAmount(str){
  return /^[۰-۹0-9]+([.,][۰-۹0-9]+)?$/.test(String(str).trim());
}

function renderIngredients(ingredients, unitSystem){
  const wrap = document.getElementById('ingredientsList');
  wrap.innerHTML = ingredients.map((ing, i) => {
    let label;
    if (unitSystem === 'imperial' && UNIT_CONVERT[ing.unit] && isNumericAmount(ing.amount)) {
      const num = parseFloat(toLatinDigits(ing.amount));
      const conv = (num * UNIT_CONVERT[ing.unit].factor).toFixed(1);
      label = toPersianDigits(conv) + ' ' + UNIT_CONVERT[ing.unit].imperialUnit;
    } else {
      label = ing.unit ? `${ing.amount} ${ing.unit}` : ing.amount;
    }
    return `
      <div class="ingredient-row" data-ing="${i}">
        <span class="check-circle" role="checkbox" aria-checked="false">${Icons.render('check', {fill:'currentColor'})}</span>
        <span class="ingredient-amount">${escapeHtml(label)}</span>
        <span class="ingredient-name">${escapeHtml(ing.name)}</span>
      </div>`;
  }).join('');
}

function renderSteps(steps){
  document.getElementById('stepsList').innerHTML = steps.map((s, i) => `
    <div class="step-row" data-step="${i}">
      <span class="step-num">${toPersianDigits(i + 1)}</span>
      <div class="step-body">
        ${s.label ? `<div class="step-label">${escapeHtml(s.label)}</div>` : ''}
        <div class="step-text">${escapeHtml(s.text)}</div>
      </div>
      <span class="check-circle" role="checkbox" aria-checked="false">${Icons.render('check', {fill:'currentColor'})}</span>
    </div>`).join('');
}

function renderInfoTab(d, entry){
  const equipList = (d.equipment && d.equipment.length) ? d.equipment : (GROUP_EQUIPMENT[entry.cat.id] || []);
  document.getElementById('equipmentBlock').style.display = equipList.length ? 'block' : 'none';
  document.getElementById('equipmentList').innerHTML = equipList.map(eq =>
    `<span class="equipment-chip">${Icons.render('check')}${escapeHtml(eq)}</span>`).join('');

  const caffeineDots = Array.from({length: 5}, (_, i) =>
    `<span class="${i < (d.caffeineLevel || 0) ? 'filled' : 'empty'}">${Icons.render('coffee', {fill: i < (d.caffeineLevel || 0) ? 'currentColor' : 'none'})}</span>`
  ).join('');

  document.getElementById('originInfoCard').innerHTML = `
    <div class="origin-row">${Icons.render('culture')}<span class="lbl">خاستگاه</span><span class="val">${escapeHtml(d.origin || '—')}</span></div>
    <div class="origin-row">${Icons.render('coffee')}<span class="lbl">سطح کافئین</span><span class="caffeine-cups">${caffeineDots}</span></div>
    <div class="origin-row">${Icons.render('immersion')}<span class="lbl">زمان آماده‌سازی</span><span class="val">${escapeHtml(d.prepTime || '—')}</span></div>
    <div class="origin-row">${Icons.render('clock')}<span class="lbl">زمان کل</span><span class="val">${escapeHtml(d.totalTime || '—')}</span></div>`;

  const tipBlock = document.getElementById('proTipBlock');
  if (d.proTip){ tipBlock.style.display = 'block'; document.getElementById('proTipText').textContent = d.proTip; }
  else tipBlock.style.display = 'none';

  const varBlock = document.getElementById('variationBlock');
  if (d.variation){ varBlock.style.display = 'block'; document.getElementById('variationText').textContent = d.variation; }
  else varBlock.style.display = 'none';
}

let currentUnitSystem = 'metric';
const DETAIL_TAB_PANEL = {ingredients:'panelIngredients', steps:'panelSteps', info:'panelInfo'};

function switchDetailTab(tabKey){
  document.querySelectorAll('.detail-tab').forEach(t => t.classList.toggle('active', t.dataset.detailTab === tabKey));
  document.querySelectorAll('.detail-tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(DETAIL_TAB_PANEL[tabKey]).classList.add('active');
}
document.querySelectorAll('[data-detail-tab]').forEach(btn =>
  btn.addEventListener('click', () => switchDetailTab(btn.dataset.detailTab)));
document.getElementById('ingredientsList').addEventListener('click', (e) => {
  const row = e.target.closest('.ingredient-row');
  if (row){ const on = row.classList.toggle('checked'); row.querySelector('.check-circle').setAttribute('aria-checked', on); }
});
document.getElementById('stepsList').addEventListener('click', (e) => {
  const row = e.target.closest('.step-row');
  if (row){ const on = row.classList.toggle('checked'); row.querySelector('.check-circle').setAttribute('aria-checked', on); }
});
document.getElementById('unitToggle').addEventListener('click', (e) => {
  const btn = e.target.closest('.unit-btn');
  if (!btn) return;
  currentUnitSystem = btn.dataset.unitSys;
  document.querySelectorAll('.unit-btn').forEach(b => b.classList.toggle('active', b === btn));
  const d = ITEM_INDEX.get(state.currentDetailId)?.item;
  if (d && d.ingredients) renderIngredients(d.ingredients, currentUnitSystem);
});

function openDetail(id){
  const entry = ITEM_INDEX.get(id);
  if (!entry){ showToast('یافت نشد'); return; }
  const d = entry.item;
  const n = splitName(d.title);
  state.currentDetailId = id;

  document.getElementById('detailName').textContent = n.fa;
  document.getElementById('detailNameEn').textContent = n.en;
  document.getElementById('detailRing').innerHTML = Icons.render(entry.cat.icon || DRINK_ICON.get(id) || 'coffee');
  updateDetailFavIcon();

  // ---------------------------------------------------------------
  // NEW — recipes (from RECIPE_GROUPS) now render as a proper
  // Ingredients / Steps / Info tabbed page instead of one long prose
  // block. Encyclopedia entries are unaffected — they keep the
  // original rich-text rendering below, since "ingredients/steps"
  // doesn't apply to e.g. a history article.
  // ---------------------------------------------------------------
  const isRecipe = Array.isArray(d.steps) && Array.isArray(d.ingredients);
  document.getElementById('detailBadges').style.display = isRecipe ? 'flex' : 'none';
  document.getElementById('detailTabs').style.display = isRecipe ? 'flex' : 'none';
  document.getElementById('panelIngredients').style.display = isRecipe ? '' : 'none';
  document.getElementById('panelSteps').style.display = isRecipe ? '' : 'none';
  document.getElementById('panelInfo').style.display = isRecipe ? '' : 'none';
  document.getElementById('detailBodyWrap').style.display = isRecipe ? 'none' : 'block';

  if (isRecipe){
    document.getElementById('detailDifficultyBadge').textContent = DIFFICULTY_LABEL[d.difficulty] || d.difficulty || '';
    document.getElementById('detailTimeBadge').innerHTML = Icons.render('immersion') + escapeHtml(d.totalTime || '');
    currentUnitSystem = 'metric';
    document.querySelectorAll('.unit-btn').forEach(b => b.classList.toggle('active', b.dataset.unitSys === 'metric'));
    renderIngredients(d.ingredients, currentUnitSystem);
    renderSteps(d.steps);
    renderInfoTab(d, entry);
    switchDetailTab('ingredients');
    document.getElementById('detailHero').style.display = 'none';
  } else {
    document.getElementById('detailPills').innerHTML =
      `<span class="tag-pill" style="border-color:var(--rust); color:var(--rust-deep);">${escapeHtml(entry.cat.title)}</span>`;
    const heroEl = document.getElementById('detailHero');
    if (entry.cat.hero){ heroEl.style.display = 'block'; heroEl.innerHTML = `<img src="${entry.cat.hero}" alt="" loading="lazy">`; }
    else { heroEl.style.display = 'none'; heroEl.innerHTML = ''; }
    document.getElementById('detailRich').innerHTML = d.body || '<p>محتوایی برای این مورد ثبت نشده است.</p>';
  }

  showView('detail');
  document.getElementById('appBody').scrollTop = 0;
}

function updateDetailFavIcon(){
  const isFav = state.favorites.has(state.currentDetailId);
  document.getElementById('detailFavBtn').innerHTML = isFav
    ? heartFilledSVG('var(--rust)')
    : heartOutlineSVG('var(--ink)');
}
document.getElementById('detailFavBtn').addEventListener('click', () => {
  if (state.currentDetailId) toggleFavorite(state.currentDetailId);
});
document.getElementById('detailBackBtn').addEventListener('click', () => showView(state.currentTab));

/* ---------------- Encyclopedia ---------------- */
function renderCategoryList(filterText){
  const wrap = document.getElementById('categoryList');
  const emptyEl = document.getElementById('encyclopediaSearchEmpty');
  const term = (filterText || '').trim().toLowerCase();

  if (!term){
    wrap.style.display = 'block';
    emptyEl.style.display = 'none';
    wrap.innerHTML = ENCYCLOPEDIA_BROWSABLE.map(c => `
      <div class="cat-card" data-cat="${c.id}">
        <div class="icon">${Icons.render(c.icon)}</div>
        <div class="txt"><h4>${escapeHtml(c.title)}</h4><span>${toPersianDigits(c.items.length)} بخش</span></div>
        <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--ink-soft)"><path d="M9 18l6-6-6-6"/></svg>
      </div>`).join('');
    wrap.querySelectorAll('[data-cat]').forEach(el =>
      el.addEventListener('click', () => openCategory(el.dataset.cat)));
    return;
  }

  let anyMatch = false;
  let html = '';
  ENCYCLOPEDIA_BROWSABLE.forEach(cat => {
    const matches = cat.items.filter(it =>
      it.kind !== 'divider' && (it.title.toLowerCase().includes(term) || stripTags(it.body).toLowerCase().includes(term)));
    if (matches.length === 0) return;
    anyMatch = true;
    html += `<div class="enc-divider" style="margin-top:16px; display:flex; align-items:center; gap:6px;"><span style="width:15px;height:15px;display:inline-flex;">${Icons.render(cat.icon)}</span> ${escapeHtml(cat.title)}</div>`;
    html += matches.map(it => renderEncItem(it)).join('');
  });
  wrap.innerHTML = html;
  wrap.style.display = anyMatch ? 'block' : 'none';
  emptyEl.style.display = anyMatch ? 'none' : 'flex';
}
document.getElementById('encyclopediaSearch').addEventListener('input', (e) => {
  renderCategoryList(e.target.value);
});

function renderEncItem(it){
  if (it.kind === 'divider') return `<div class="enc-divider">${escapeHtml(it.title)}</div>`;
  if (it.kind === 'note') return `<div class="enc-note"><strong>${escapeHtml(it.title)}</strong><div class="rich">${it.body}</div></div>`;
  return `<details class="enc-item"><summary>${escapeHtml(it.title)}</summary><div class="rich">${it.body}</div></details>`;
}

function openCategory(catId){
  const cat = ENCYCLOPEDIA_BROWSABLE.find(c => c.id === catId);
  if (!cat) return;
  document.getElementById('categoryIcon').innerHTML = Icons.render(cat.icon);
  document.getElementById('categoryTitle').textContent = cat.title;
  document.getElementById('categoryCount').textContent = `${toPersianDigits(cat.items.length)} بخش`;
  document.getElementById('categoryItemsWrap').innerHTML = cat.items.map(renderEncItem).join('');
  document.getElementById('categoryListPanel').classList.add('is-hidden-mobile');
  document.getElementById('categoryDetailPanel').classList.remove('is-hidden');
  document.getElementById('categoryDetailPanel').classList.add('has-selection');
  document.querySelectorAll('#categoryList .cat-card').forEach(el =>
    el.classList.toggle('active', el.dataset.cat === catId));
  document.getElementById('appBody').scrollTop = 0;
}
document.getElementById('categoryBackBtn').addEventListener('click', () => {
  document.getElementById('categoryDetailPanel').classList.add('is-hidden');
  document.getElementById('categoryListPanel').classList.remove('is-hidden-mobile');
});

/* ---------------- View / tab switching ---------------- */

/* ---------------------------------------------------------------
   BUGFIX (reported): "bottom nav bug"
   ---------------------------------------------------------------
   Root cause #1 — this function only ever computed a *horizontal*
   offset (translateX) between the active tab and the track. That's
   only correct for a row layout. css/desktop.css turns the nav into
   a vertical side rail on wide screens, and a pure translateX can't
   follow that. Fix: measure both axes and set width AND height, so
   the same code works whether .nav-track is a row (mobile) or a
   column (desktop) — no layout-specific branching needed.

   Root cause #2 — on first load this ran once, synchronously, before
   the Vazirmatn/Lalezar web fonts had finished swapping in. The tab
   label widths change slightly once the real font loads (the
   fallback system font has different metrics), and nothing recomputed
   the indicator afterwards — only a window `resize` listener existed,
   which a font swap does not trigger. Fix: also recompute once
   document.fonts.ready resolves.
   ------------------------------------------------------------- */
function updateNavIndicator(tab){
  const idx = NAV_TABS.indexOf(tab);
  if (idx === -1) return;
  const track = document.querySelector('.nav-track');
  const items = track.querySelectorAll('.nav-item');
  const target = items[idx];
  const indicator = document.getElementById('navIndicator');
  const trackRect = track.getBoundingClientRect();
  const itemRect = target.getBoundingClientRect();
  indicator.style.width = itemRect.width + 'px';
  indicator.style.height = itemRect.height + 'px';
  const dx = itemRect.left - trackRect.left;
  const dy = itemRect.top - trackRect.top;
  indicator.style.transform = `translate(${dx}px, ${dy}px)`;
  items.forEach((it, i) => it.classList.toggle('active', i === idx));
  items.forEach((it, i) => it.setAttribute('aria-selected', i === idx ? 'true' : 'false'));
}

function showView(name){
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  const isMainTab = NAV_TABS.includes(name);
  // was: navWrap.style.display = isMainTab ? 'block' : 'none' — an inline
  // style always wins over a stylesheet rule, so css/desktop.css's
  // `#navWrap{display:flex}` (needed to lay the side-rail out as a column)
  // could never take effect on desktop. A class lets CSS decide the
  // display value for the current layout; JS only decides visibility.
  document.getElementById('navWrap').classList.toggle('is-hidden', !isMainTab);
  if (isMainTab){
    state.currentTab = name;
    document.getElementById('categoryDetailPanel').classList.add('is-hidden');
    document.getElementById('categoryListPanel').classList.remove('is-hidden-mobile');
    updateNavIndicator(name);
  }
  document.getElementById('appBody').scrollTop = 0;
}
document.querySelectorAll('.nav-item').forEach(el =>
  el.addEventListener('click', () => showView(el.dataset.tab)));
document.getElementById('openSettingsBtn').addEventListener('click', () => showView('settings'));
document.getElementById('settingsBackBtn').addEventListener('click', () => showView(state.currentTab));
document.getElementById('searchBtn').addEventListener('click', () => showView('encyclopedia'));
document.querySelector('[data-see-all]').addEventListener('click', () => {
  state.selectedGroup = 'all';
  renderChips();
  renderGrid();
});
window.addEventListener('resize', () => updateNavIndicator(state.currentTab));
if (document.fonts && document.fonts.ready){
  document.fonts.ready.then(() => updateNavIndicator(state.currentTab));
}

/* ---------------- Toast ---------------- */
let toastTimer = null;
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------------- Settings: theme ---------------- */
function applyTheme(){
  document.documentElement.setAttribute('data-theme', state.theme);
  document.getElementById('themeSwitch').classList.toggle('on', state.theme === 'dark');
  document.getElementById('themeSwitch').setAttribute('aria-checked', state.theme === 'dark' ? 'true' : 'false');
  document.getElementById('themeModeLabel').textContent = state.theme === 'dark' ? 'حالت تیره' : 'حالت روشن';
}
document.getElementById('themeToggleRow').addEventListener('click', (e) => {
  if (e.target.closest('.switch')) return;
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
});
document.getElementById('themeSwitch').addEventListener('click', (e) => {
  e.stopPropagation();
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
});

/* ---------------- Settings: pickers & feedback ---------------- */
function openModal(html){
  document.getElementById('modalSheet').innerHTML = html;
  document.getElementById('modalBackdrop').classList.add('show');
}
function closeModal(){ document.getElementById('modalBackdrop').classList.remove('show'); }
document.getElementById('modalBackdrop').addEventListener('click', (e) => {
  if (e.target.id === 'modalBackdrop') closeModal();
});

document.getElementById('unitsRow').addEventListener('click', () => {
  openModal(`<h3>واحدها</h3>${UNIT_OPTIONS.map(u => `
      <div class="option-row ${u===state.unit?'selected':''}" data-unit="${escapeHtml(u)}">
        <span>${escapeHtml(u)}</span><span class="radio"></span>
      </div>`).join('')}`);
  document.querySelectorAll('[data-unit]').forEach(el =>
    el.addEventListener('click', () => {
      state.unit = el.dataset.unit;
      document.getElementById('unitsLabel').textContent = state.unit;
      closeModal();
    }));
});

document.getElementById('languageRow').addEventListener('click', () => {
  openModal(`<h3>زبان</h3>${LANGUAGE_OPTIONS.map(l => `
      <div class="option-row ${l===state.language?'selected':''}" data-lang="${escapeHtml(l)}">
        <span>${escapeHtml(l)}</span><span class="radio"></span>
      </div>`).join('')}
    <p style="font-size:11px; color:var(--ink-soft); margin-top:10px;">در این نسخه، محتوا فقط به فارسی آماده شده است.</p>`);
  document.querySelectorAll('[data-lang]').forEach(el =>
    el.addEventListener('click', () => {
      state.language = el.dataset.lang;
      document.getElementById('languageLabel').textContent = state.language;
      closeModal();
      if (state.language !== 'فارسی') showToast('در این نسخه فقط محتوای فارسی موجود است');
    }));
});

document.getElementById('feedbackRow').addEventListener('click', () => {
  openModal(`<h3>ارسال بازخورد</h3>
    <textarea class="line-field" id="feedbackText" placeholder="چه چیزی را بهتر کنیم؟" style="width:100%; box-sizing:border-box;"></textarea>
    <div class="modal-actions">
      <button class="btn btn-line" id="feedbackCancel">انصراف</button>
      <button class="btn btn-ink" id="feedbackSend">ارسال</button>
    </div>`);
  document.getElementById('feedbackCancel').addEventListener('click', closeModal);
  document.getElementById('feedbackSend').addEventListener('click', () => {
    const val = document.getElementById('feedbackText').value.trim();
    closeModal();
    if (!val) return;
    showToast('بابت بازخوردتان سپاسگزاریم!');
  });
});

/* ---------------- Buy Me a Coffee ---------------- */
document.getElementById('buyMeCoffeeBtn').addEventListener('click', () => {
  try {
    const win = window.open('https://www.buymeacoffee.com/coffeepedia', '_blank', 'noopener,noreferrer');
    if (!win) showToast('باز کردن لینک ممکن نشد. بعداً دوباره امتحان کنید.');
  } catch (err) {
    showToast('باز کردن لینک ممکن نشد. بعداً دوباره امتحان کنید.');
  }
});

/* ---------------- Brew Timer ---------------- */
const timerState = { presetIndex:0, remaining:TIMER_PRESETS[0].seconds, intervalId:null };
const RING_CIRCUMFERENCE = 2 * Math.PI * 86;

function renderTimerPresets(){
  const wrap = document.getElementById('timerPresets');
  wrap.innerHTML = TIMER_PRESETS.map((p, i) =>
    `<button class="pill-choice ${i===timerState.presetIndex?'active':''}" data-preset="${i}">${p.label}</button>`).join('');
  wrap.querySelectorAll('[data-preset]').forEach(el =>
    el.addEventListener('click', () => selectTimerPreset(Number(el.dataset.preset))));
}
function selectTimerPreset(i){
  if (i < 0 || i >= TIMER_PRESETS.length) return;
  stopTimer();
  timerState.presetIndex = i;
  timerState.remaining = TIMER_PRESETS[i].seconds;
  renderTimerPresets();
  updateTimerDisplay();
  resetStartButton();
}
function resetStartButton(){
  document.getElementById('timerStartBtn').innerHTML =
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>شروع';
}
function updateTimerDisplay(){
  const total = TIMER_PRESETS[timerState.presetIndex].seconds;
  const m = String(Math.floor(timerState.remaining / 60)).padStart(2, '0');
  const s = String(timerState.remaining % 60).padStart(2, '0');
  document.getElementById('timerClock').textContent = `${m}:${s}`;
  const progressFrac = total === 0 ? 0 : 1 - (timerState.remaining / total);
  const offset = RING_CIRCUMFERENCE * (1 - progressFrac);
  const ring = document.getElementById('timerProgress');
  ring.setAttribute('stroke-dasharray', RING_CIRCUMFERENCE);
  ring.setAttribute('stroke-dashoffset', offset);
  const isDone = timerState.remaining === 0;
  ring.style.stroke = isDone ? 'var(--good)' : 'var(--rust)';
  document.getElementById('timerIcon').innerHTML = isDone
    ? Icons.registry.check
    : Icons.registry.coffee;
}
function startTimer(){
  if (timerState.intervalId) return;
  if (timerState.remaining <= 0) timerState.remaining = TIMER_PRESETS[timerState.presetIndex].seconds;
  timerState.intervalId = setInterval(() => {
    timerState.remaining = Math.max(0, timerState.remaining - 1);
    updateTimerDisplay();
    if (timerState.remaining === 0){ stopTimer(); showToast('زمان تمام شد!'); }
  }, 1000);
  document.getElementById('timerStartBtn').innerHTML =
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>توقف';
}
function pauseTimer(){ stopTimer(); resetStartButton(); }
function stopTimer(){ if (timerState.intervalId){ clearInterval(timerState.intervalId); timerState.intervalId = null; } }
document.getElementById('timerStartBtn').addEventListener('click', () => { if (timerState.intervalId) pauseTimer(); else startTimer(); });
document.getElementById('timerResetBtn').addEventListener('click', () => {
  stopTimer();
  timerState.remaining = TIMER_PRESETS[timerState.presetIndex].seconds;
  updateTimerDisplay();
  resetStartButton();
});

/* ---------------- Ratio calculator ---------------- */
let selectedRatio = 16;
function renderRatioPresets(){
  const wrap = document.getElementById('ratioPresets');
  wrap.innerHTML = RATIOS.map(({r}) => {
    const selected = r === selectedRatio;
    return `<button class="pill-choice ${selected?'active':''}" data-ratio="${r}">${selected?'✓ ':''}۱:${toPersianDigits(r)}</button>`;
  }).join('');
  wrap.querySelectorAll('[data-ratio]').forEach(el =>
    el.addEventListener('click', () => { selectedRatio = Number(el.dataset.ratio); renderRatioPresets(); updateRatioResult(); }));
}
function updateRatioResult(){
  const input = document.getElementById('coffeeGramsInput');
  const errorEl = document.getElementById('ratioError');
  const resultEl = document.getElementById('waterResultInput');
  const infoEl = document.getElementById('ratioInfoText');
  const raw = parseFloat(toLatinDigits(input.value));
  const entry = RATIOS.find(x => x.r === selectedRatio);
  infoEl.textContent = entry ? entry.desc : '';
  if (!isFinite(raw) || raw <= 0){ resultEl.value = '—'; errorEl.style.display = 'block'; return; }
  errorEl.style.display = 'none';
  resultEl.value = toPersianDigits((raw * selectedRatio).toFixed(0));
}
document.getElementById('coffeeGramsInput').addEventListener('input', updateRatioResult);

/* ---------------- Brew Temperature Guide ---------------- */
function renderTempGuide(){
  document.getElementById('tempGuideHeading').innerHTML = Icons.render('thermometer') + 'راهنمای دمای دم‌آوری';
  document.getElementById('tempGuideList').innerHTML = TEMP_GUIDE.map(t => `
    <div class="guide-row">
      <div class="guide-badge" style="background:${t.color}; color:#fff;">${Icons.render(t.icon || 'thermometer', {fill:'none'})}</div>
      <div class="guide-text"><h5>${t.name}</h5><span class="meta">${t.c} • ${t.f}</span></div>
    </div>`).join('');
}

/* ---------------- Roast Level Guide ---------------- */
function renderRoastGuide(){
  document.getElementById('roastGuideList').innerHTML = ROAST_GUIDE.map(r => `
    <div class="guide-row" style="align-items:flex-start;">
      <div class="guide-badge" style="background:${r.bg}; color:${r.ink};">${Icons.render(r.icon || 'bean', {fill:'currentColor'})}</div>
      <div class="guide-text">
        <h5>${r.name}</h5><p style="font-style:italic;">${r.desc}</p>
        <span class="meta">${r.temp}</span><br><span class="meta" style="direction:rtl;">${r.best}</span>
      </div>
    </div>`).join('');
}

/* ---------------- Grind Size Guide ---------------- */
function renderGrindGuide(){
  document.getElementById('grindGuideList').innerHTML = GRIND_GUIDE.map(g => `
    <div class="grind-block">
      <div class="grind-head"><h5>${g.name}</h5><div class="grind-dots">${Array.from({length:7}, (_,i) => `<span class="${i<g.dots?'filled':''}"></span>`).join('')}</div></div>
      <div class="grind-bar"><div class="fill" style="width:${(g.dots/7*100).toFixed(0)}%;"></div></div>
      <div class="grind-meta"><b>${g.like}</b> — ${g.used}</div>
    </div>`).join('');
}

/* ---------------------------------------------------------------
   NEW — Coffee Flavor Wheel
   ---------------------------------------------------------------
   An original SVG donut chart built at runtime from FLAVOR_WHEEL
   (js/database/tools.data.js). Tapping / clicking a wedge or its
   legend entry shows a toast with a few example flavor notes from
   that family — a small, self-contained reference tool inspired by
   (but not a copy of) the flavor wheels used across the specialty
   coffee industry.
   ------------------------------------------------------------- */
function renderFlavorWheel(){
  const size = 220, cx = size/2, cy = size/2, rOuter = 100, rInner = 44;
  const n = FLAVOR_WHEEL.length;
  const toXY = (angleDeg, r) => {
    const a = (angleDeg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const wedges = FLAVOR_WHEEL.map((f, i) => {
    const a0 = (360 / n) * i;
    const a1 = (360 / n) * (i + 1);
    const [x0o, y0o] = toXY(a0, rOuter), [x1o, y1o] = toXY(a1, rOuter);
    const [x0i, y0i] = toXY(a0, rInner), [x1i, y1i] = toXY(a1, rInner);
    const largeArc = (a1 - a0) > 180 ? 1 : 0;
    const d = [
      `M ${x0i.toFixed(2)} ${y0i.toFixed(2)}`,
      `L ${x0o.toFixed(2)} ${y0o.toFixed(2)}`,
      `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x1o.toFixed(2)} ${y1o.toFixed(2)}`,
      `L ${x1i.toFixed(2)} ${y1i.toFixed(2)}`,
      `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x0i.toFixed(2)} ${y0i.toFixed(2)}`,
      'Z'
    ].join(' ');
    return `<path d="${d}" fill="${f.color}" stroke="var(--paper-card)" stroke-width="2" data-flavor="${f.key}" style="cursor:pointer;"></path>`;
  }).join('');

  document.getElementById('flavorWheel').innerHTML =
    `<svg viewBox="0 0 ${size} ${size}">${wedges}<circle cx="${cx}" cy="${cy}" r="${rInner-4}" fill="var(--paper-card)"/></svg>`;
  document.getElementById('flavorLegend').innerHTML = FLAVOR_WHEEL.map(f =>
    `<div class="tag" data-flavor="${f.key}" style="cursor:pointer;"><span class="dot" style="background:${f.color}"></span>${f.fa}</div>`
  ).join('');

  document.querySelectorAll('[data-flavor]').forEach(el =>
    el.addEventListener('click', () => {
      const f = FLAVOR_WHEEL.find(x => x.key === el.dataset.flavor);
      if (f) showToast(`${f.fa} (${f.en}) — مثل: ${f.example}`);
    }));
}

/* ---------------- Caffeine tracker ---------------- */
function renderCafSelect(){
  const sel = document.getElementById('cafDrinkSelect');
  sel.innerHTML = CAFFEINE_TABLE.map((d, i) => `<option value="${i}">${d.name} — ${toPersianDigits(d.mg)}mg</option>`).join('');
}
function renderCafLog(){
  const list = document.getElementById('cafLogList');
  list.innerHTML = state.caffeineLog.map((entry, i) => `
    <div class="caf-log-row">
      <span class="nm">${entry.name}</span>
      <span style="display:flex; align-items:center; gap:10px;">
        <span class="mg">${toPersianDigits(entry.mg)}mg</span>
        <button data-remove="${i}" aria-label="حذف">×</button>
      </span>
    </div>`).join('');
  list.querySelectorAll('[data-remove]').forEach(el =>
    el.addEventListener('click', () => {
      state.caffeineLog.splice(Number(el.dataset.remove), 1);
      renderCafLog();
    }));

  const total = state.caffeineLog.reduce((s, e) => s + e.mg, 0);
  const pct = Math.min(100, (total / CAFFEINE_DAILY_LIMIT) * 100);
  const fill = document.getElementById('cafMeterFill');
  fill.style.width = pct + '%';
  fill.style.background = total > CAFFEINE_DAILY_LIMIT ? 'var(--warn)' : total > CAFFEINE_DAILY_LIMIT * 0.75 ? 'var(--mustard)' : 'var(--good)';
  document.getElementById('cafTotalLabel').textContent = `${toPersianDigits(total)} میلی‌گرم مصرف‌شده`;
  document.getElementById('cafWarning').style.display = total >= CAFFEINE_DAILY_LIMIT * 0.9 ? 'block' : 'none';
}
document.getElementById('cafAddBtn').addEventListener('click', () => {
  const idx = Number(document.getElementById('cafDrinkSelect').value);
  const drink = CAFFEINE_TABLE[idx];
  if (!drink) return; // defensive: ignore an out-of-range selection
  state.caffeineLog.push({name: drink.name, mg: drink.mg});
  renderCafLog();
});

/* ---------------------------------------------------------------
   NEW — Desktop dashboard quick-stats row (hidden on mobile via CSS,
   see css/desktop.css → .dashboard-stats). Numbers only need to be
   computed once at init, plus whenever favorites change.
   ------------------------------------------------------------- */
function renderDashboardStats(){
  const el = (id) => document.getElementById(id);
  el('statDrinks').textContent = toPersianDigits(ALL_DRINKS.length);
  el('statCategories').textContent = toPersianDigits(RECIPE_GROUPS.length);
  el('statEncyclopedia').textContent = toPersianDigits(ENCYCLOPEDIA.reduce((s, c) => s + c.items.length, 0));
  el('statFavorites').textContent = toPersianDigits(state.favorites.size);
}

/* ---------------- Init ---------------- */
function init(){
  renderFeatured();
  renderChips();
  renderGrid();
  renderFavorites();
  renderCategoryList('');
  renderTimerPresets();
  renderRatioPresets();
  renderTempGuide();
  renderRoastGuide();
  renderGrindGuide();
  renderFlavorWheel();
  renderCafSelect();
  renderCafLog();
  renderDashboardStats();
  updateTimerDisplay();
  updateRatioResult();
  applyTheme();
  updateNavIndicator('home');
}
init();
