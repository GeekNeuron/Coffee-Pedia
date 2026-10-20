const ENCYCLOPEDIA_BROWSABLE = ENCYCLOPEDIA;
const ITEM_INDEX = new Map();
ENCYCLOPEDIA.forEach(cat => cat.items.forEach(it => ITEM_INDEX.set(it.id, {cat, item: it})));

const ALL_DRINKS = RECIPE_GROUPS.flatMap(g => g.items);
RECIPE_GROUPS.forEach(g => g.items.forEach(it =>
  ITEM_INDEX.set(it.id, {cat: {id: g.id, title: g.title, icon: g.icon, hero: g.hero}, item: it})));

const DRINK_ICON = new Map();
RECIPE_GROUPS.forEach(g => g.items.forEach(it => DRINK_ICON.set(it.id, g.icon || 'coffee')));

function pickFeatured(count){
  const shuffle = arr => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  let prev = [];
  try { prev = JSON.parse(localStorage.getItem('cp_featured_prev') || '[]'); } catch (e) {}
  const picks = [];
  shuffle(RECIPE_GROUPS.filter(g => g.items.length)).slice(0, count).forEach(g => {
    const fresh = g.items.filter(d => !prev.includes(d.id));
    picks.push(shuffle(fresh.length ? fresh : g.items)[0]);
  });
  try { localStorage.setItem('cp_featured_prev', JSON.stringify(picks.map(d => d.id))); } catch (e) {}
  return picks.length ? picks : FEATURED_IDS.map(id => ITEM_INDEX.get(id)?.item).filter(Boolean);
}
const FEATURED = pickFeatured(4);

function splitName(title){
  const m = title.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  if (m) return { fa: m[1].trim(), en: m[2].trim() };
  return { fa: title, en: '' };
}

const state = {
  theme: 'light',
  unit: 'متریک (میلی‌لیتر، گرم)',
  language: 'فارسی',
  favorites: new Set(),
  selectedGroup: 'all',
  currentDetailId: null,
  currentTab: 'home',
  caffeineLog: [], // {name, mg}
};


/* زبان و تاریخ */
const LOCALES = { 'فارسی': 'fa-IR', 'English': 'en-GB', 'العربية': 'ar-EG' };
function cpLocale(){ return LOCALES[state.language] || 'fa-IR'; }
function cpDate(ts, withTime){
  try {
    const o = { year: 'numeric', month: '2-digit', day: '2-digit' };
    if (withTime){ o.hour = '2-digit'; o.minute = '2-digit'; o.hour12 = false; }
    return new Intl.DateTimeFormat(cpLocale(), o).format(new Date(ts));
  } catch (e) { return new Date(ts).toLocaleString(); }
}
/* انیمیشن نرم هنگام عوض‌شدن محتوا */
function softSwap(el){
  if (!el) return;
  el.classList.remove('soft-swap'); void el.offsetWidth; el.classList.add('soft-swap');
}

const heartOutlineSVG = (color) => `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M12 20C7 16.5 3.5 13.5 3.5 9.5A4.5 4.5 0 0 1 12 7.5a4.5 4.5 0 0 1 8.5 2C20.5 13.5 17 16.5 12 20z"/></svg>`;
const heartFilledSVG = (color) => `<svg viewBox="0 0 24 24" fill="${color}"><path d="M12 20C7 16.5 3.5 13.5 3.5 9.5A4.5 4.5 0 0 1 12 7.5a4.5 4.5 0 0 1 8.5 2C20.5 13.5 17 16.5 12 20z"/></svg>`;

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
      <div class="feature-tagline">★ پیشنهاد امروز</div>
    </div>`;
  }).join('');
  dots.innerHTML = FEATURED.map((_, i) => `<span class="${i===0?'active':''}"></span>`).join('');

  track.querySelectorAll('[data-open]').forEach(el =>
    el.addEventListener('click', () => openDetail(Number(el.dataset.open))));
  track.addEventListener('scroll', () => {
    const idx = Math.round(Math.abs(track.scrollLeft) / (track.firstElementChild.offsetWidth + 13));
    [...dots.children].forEach((d, i) => d.classList.toggle('active', i === idx));
  });
}

let featTimer = null, featPauseUntil = 0, featAnim = 0;
function featGo(track, i, ms){
  const card = track.children[i]; if (!card) return;
  const tr = track.getBoundingClientRect(), cr = card.getBoundingClientRect();
  const rtl = getComputedStyle(track).direction === 'rtl';
  const delta = rtl ? cr.right - (tr.right - 22) : cr.left - (tr.left + 22);
  const from = track.scrollLeft, t0 = performance.now(), id = ++featAnim;
  track.style.scrollSnapType = 'none';
  const ease = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2;
  (function step(now){
    if (id !== featAnim) return;
    const p = Math.min(1, (now - t0) / ms);
    track.scrollLeft = from + delta * ease(p);
    if (p < 1) requestAnimationFrame(step); else track.style.scrollSnapType = '';
  })(t0);
}
function startFeaturedLoop(){
  const track = document.getElementById('featuredCarousel');
  if (featTimer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const pause = () => { featPauseUntil = Date.now() + 6000; featAnim++; track.style.scrollSnapType = ''; };
  ['pointerdown', 'touchstart', 'wheel'].forEach(ev => track.addEventListener(ev, pause, {passive:true}));
  let cur = 0;
  featTimer = setInterval(() => {
    if (document.hidden || Date.now() < featPauseUntil) return;
    if (!document.getElementById('view-home').classList.contains('active')) return;
    if (track.scrollWidth <= track.clientWidth + 4) return;
    const n = track.children.length;
    const near = Math.round(Math.abs(track.scrollLeft) / (track.firstElementChild.offsetWidth + 13));
    cur = near + 1;
    if (cur >= n) featGo(track, 0, 380); else featGo(track, cur, 900);
  }, 3200);
}
function renderChips(){
  const row = document.getElementById('categoryChips');
  const all = [{id:'all', icon:'gridDots', title:'همه'}, ...RECIPE_GROUPS, {id:'alcohol', icon:'gridDots', title:'مشروب‌دار'}];
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

const ALCOHOL_RE = /براندی|ویسکی|کنیاک|لیکور|شراب|کالوادوس|گراپا|سامبوکا|جنور|ودکا|تکیلا|آنیسِت|گالیانو|راکسی|مشروب|بوربن|(^|[\s(،])رام($|[\s)،])/;
function isAlcoholic(d){
  return ALCOHOL_RE.test(d.title.split('(')[0]) || d.ingredients.some(i => ALCOHOL_RE.test(i.name));
}
function recipesForGroup(groupId){
  if (groupId === 'all') return ALL_DRINKS;
  if (groupId === 'alcohol') return ALL_DRINKS.filter(isAlcoholic);
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
        <span class="check-circle" role="checkbox" aria-checked="false">${Icons.render('check', {strokeWidth:'3'})}</span>
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
        ${s.meta ? `<div class="step-meta"><bdi dir="rtl">${escapeHtml(s.meta)}</bdi></div>` : ''}
      </div>
      <span class="check-circle" role="checkbox" aria-checked="false">${Icons.render('check', {strokeWidth:'3'})}</span>
    </div>`).join('');
}

function renderInfoTab(d, entry){
  const equipList = (d.equipment && d.equipment.length) ? d.equipment : (GROUP_EQUIPMENT[entry.cat.id] || []);
  document.getElementById('equipmentBlock').style.display = equipList.length ? 'block' : 'none';
  document.getElementById('equipmentList').innerHTML = equipList.map(eq =>
    `<span class="equipment-chip">${Icons.render('check')}${escapeHtml(eq)}</span>`).join('');

  const rows = [];
  if (d.origin) rows.push(`<div class="origin-row">${Icons.render('culture')}<span class="lbl">خاستگاه</span><span class="val">${escapeHtml(d.origin)}</span></div>`);
  document.getElementById('originInfoCard').innerHTML = rows.join('');
  document.getElementById('originInfoCard').style.display = rows.length ? '' : 'none';

  const histBlock = document.getElementById('historyBlock');
  if (d.history){
    histBlock.style.display = 'block';
    document.getElementById('historyText').innerHTML = String(d.history).split(/\n\n+/).map(p => `<p>${escapeHtml(p)}</p>`).join('');
  } else histBlock.style.display = 'none';

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
  document.getElementById('detailPhoto').innerHTML = photoHtml((Array.isArray(d.steps) ? 'drink-' : 'enc-') + id + '.png', 'photo-detail');

  const isRecipe = Array.isArray(d.steps) && Array.isArray(d.ingredients);
  document.getElementById('detailBadges').style.display = isRecipe ? 'flex' : 'none';
  document.getElementById('detailTabs').style.display = isRecipe ? 'flex' : 'none';
  document.getElementById('panelIngredients').style.display = isRecipe ? '' : 'none';
  document.getElementById('panelSteps').style.display = isRecipe ? '' : 'none';
  document.getElementById('panelInfo').style.display = isRecipe ? '' : 'none';
  document.getElementById('detailBodyWrap').style.display = isRecipe ? 'none' : 'block';

  if (isRecipe){
    document.getElementById('detailDifficultyBadge').style.display = 'none';
    document.getElementById('detailTimeBadge').style.display = 'none';
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

function renderCategoryList(filterText){
  const wrap = document.getElementById('categoryList');
  const emptyEl = document.getElementById('encyclopediaSearchEmpty');
  const term = (filterText || '').trim().toLowerCase();

  if (!term){
    wrap.style.display = 'block';
    emptyEl.style.display = 'none';
    wrap.innerHTML = `
      <div class="cat-card" id="eventsCard">
        <div class="icon">${Icons.render('history')}</div>
        <div class="txt"><h4>رویدادهای قهوه</h4><span>خط زمانی · ${toPersianDigits(EVENTS.reduce((a,g)=>a+g.items.length,0))} رویداد</span></div>
        <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--ink-soft)"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>
      </div>` + ENCYCLOPEDIA_BROWSABLE.map(c => `
      <div class="cat-card" data-cat="${c.id}">
        <div class="icon">${Icons.render(c.icon)}</div>
        <div class="txt"><h4>${escapeHtml(c.title)}</h4><span>${toPersianDigits(c.items.length)} بخش</span></div>
        <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--ink-soft)"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>
      </div>`).join('');
    wrap.querySelectorAll('[data-cat]').forEach(el =>
      el.addEventListener('click', () => openCategory(el.dataset.cat)));
    document.getElementById('eventsCard').addEventListener('click', () => { if (window.matchMedia('(min-width:860px)').matches) openEventsPanel(); else showView('events'); });
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
  if (it.kind === 'note') return `<div class="enc-note"><strong>${escapeHtml(it.title)}</strong><div class="rich"><div class="rich-inner">${photoHtml('enc-' + it.id + '.png', 'photo-enc')}${it.body}</div></div></div>`;
  return `<details class="enc-item"><summary>${escapeHtml(it.title)}</summary><div class="rich"><div class="rich-inner">${it.body}</div></div></details>`;
}

function openCategory(catId){
  const cat = ENCYCLOPEDIA_BROWSABLE.find(c => c.id === catId);
  if (!cat) return;
  document.getElementById('categoryIcon').innerHTML = Icons.render(cat.icon);
  document.getElementById('categoryTitle').textContent = cat.title;
  document.getElementById('categoryCount').textContent = `${toPersianDigits(cat.items.length)} بخش`;
  document.getElementById('categoryItemsWrap').innerHTML = photoHtml('enc-cat-' + cat.id + '.png', 'photo-enc') + cat.items.map(renderEncItem).join('');
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

function openEventsPanel(){
  const total = EVENTS.reduce((a,g) => a + g.items.length, 0);
  document.getElementById('categoryIcon').innerHTML = Icons.render('history');
  document.getElementById('categoryTitle').textContent = 'رویدادهای قهوه';
  document.getElementById('categoryCount').textContent = `${toPersianDigits(total)} رویداد`;
  document.getElementById('categoryItemsWrap').innerHTML = document.getElementById('eventsList').innerHTML;
  document.getElementById('categoryListPanel').classList.add('is-hidden-mobile');
  document.getElementById('categoryDetailPanel').classList.remove('is-hidden');
  document.getElementById('categoryDetailPanel').classList.add('has-selection');
  document.querySelectorAll('#categoryList .cat-card').forEach(el => el.classList.toggle('active', el.id === 'eventsCard'));
  document.getElementById('appBody').scrollTop = 0;
}
function updateNavIndicator(tab, animate){
  const idx = NAV_TABS.indexOf(tab);
  if (idx === -1) return;
  const items = document.querySelectorAll('.nav-track .nav-item');
  const target = items[idx];
  const indicator = document.getElementById('navIndicator');
  if (animate === false) indicator.classList.add('no-anim');
  indicator.style.width = target.offsetWidth + 'px';
  indicator.style.height = target.offsetHeight + 'px';
  indicator.style.transform = `translate(${target.offsetLeft}px, ${target.offsetTop}px)`;
  if (animate === false){ void indicator.offsetWidth; indicator.classList.remove('no-anim'); }
  items.forEach((it, i) => {
    it.classList.toggle('active', i === idx);
    it.setAttribute('aria-selected', i === idx ? 'true' : 'false');
  });
}

function showView(name){
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  const isMainTab = NAV_TABS.includes(name);
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
document.getElementById('openFavBtn').addEventListener('click', () => showView('favorites'));
document.getElementById('favBackBtn').addEventListener('click', () => showView(state.currentTab));
document.getElementById('searchBtn').addEventListener('click', () => { showView('search'); document.getElementById('globalSearchInput').focus(); });
document.querySelector('[data-see-all]').addEventListener('click', () => {
  state.selectedGroup = 'all';
  renderChips();
  renderGrid();
});
window.addEventListener('resize', () => updateNavIndicator(state.currentTab, false));
if (document.fonts && document.fonts.ready){
  document.fonts.ready.then(() => updateNavIndicator(state.currentTab, false));
}
if (window.ResizeObserver){
  new ResizeObserver(() => updateNavIndicator(state.currentTab, false)).observe(document.querySelector('.nav-track'));
}

let toastTimer = null;
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function applyTheme(){
  document.documentElement.setAttribute('data-theme', state.theme);
  document.getElementById('themeModeLabel').textContent = state.theme === 'dark' ? 'حالت تیره' : 'حالت روشن';
}
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

document.getElementById('aboutRow').addEventListener('click', () => {
  const drinks = toPersianDigits(ALL_DRINKS.length);
  const groups = toPersianDigits(RECIPE_GROUPS.length);
  const articles = toPersianDigits(ENCYCLOPEDIA.reduce((sum, c) => sum + c.items.length, 0));
  const version = escapeHtml(document.querySelector('.pkg-tag').textContent.trim());
  openModal(`<div class="about-wrap"><h3>درباره ما</h3>
    <div class="about-hero">
      <div class="seal">${Icons.render('coffee')}</div>
      <div>
        <div class="lz about-name">Coffee Pedia</div>
        <div class="about-sub">دانشنامه‌ی قهوه — هر فنجان یک داستان دارد</div>
      </div>
    </div>
    <p class="about-text">کافی‌پدیا دانشنامه‌ی فارسی قهوه است: تاریخ، علم و فرهنگ، دستور نوشیدنی‌ها و ابزارهای دم‌آوری، بدون نیاز به اینترنت. حاصل تلاش یک‌نفره.</p>
    <div class="about-stats">
      <div class="about-stat"><b>${drinks}</b><span>نوشیدنی</span></div>
      <div class="about-stat"><b>${groups}</b><span>دسته‌بندی</span></div>
      <div class="about-stat"><b>${articles}</b><span>مقاله</span></div>
    </div>
    <h4 class="about-h">منابع و اعتبارها</h4>
    <ul class="about-credits">
      <li><b>فونت‌ها:</b> وزیرمتن (Vazirmatn) و لاله‌زار (Lalezar) با مجوز SIL OFL</li>
      <li><b>آیکون‌ها:</b> مجموعه‌ی اختصاصی پروژه (طراحی و کدنویسی داخلی)</li>
      <li><b>تصاویر:</b> تصویرسازی با هوش مصنوعی به سبک نقاشی دیجیتال</li>
      <li><b>داده‌ی امتیاز کاپینگ:</b> پایگاه Coffee Quality Institute</li>
    </ul>
    <p class="about-version">${version}</p>
    <div class="modal-actions">
      <button class="btn btn-line" id="aboutFeedback" type="button">ارسال بازخورد</button>
      <button class="btn btn-ink" id="aboutClose" type="button">بستن</button>
    </div></div>`);
  document.getElementById('aboutClose').addEventListener('click', closeModal);
  document.getElementById('aboutFeedback').addEventListener('click', () => {
    closeModal();
    document.getElementById('feedbackRow').click();
  });
});

document.getElementById('buyMeCoffeeBtn').addEventListener('click', () => {
  try {
    const win = window.open('https://www.buymeacoffee.com/coffeepedia', '_blank', 'noopener,noreferrer');
    if (!win) showToast('باز کردن لینک ممکن نشد. بعداً دوباره امتحان کنید.');
  } catch (err) {
    showToast('باز کردن لینک ممکن نشد. بعداً دوباره امتحان کنید.');
  }
});

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
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 4.5v15L19 12z"/></svg>شروع';
}
function updateTimerDisplay(){
  const total = TIMER_PRESETS[timerState.presetIndex].seconds;
  const m = toPersianDigits(String(Math.floor(timerState.remaining / 60)).padStart(2, '0'));
  const s = toPersianDigits(String(timerState.remaining % 60).padStart(2, '0'));
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
    '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>توقف';
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

let selectedRatio = 16;
function renderRatioPresets(){
  const wrap = document.getElementById('ratioPresets');
  wrap.innerHTML = RATIOS.map(({r}) => {
    const selected = r === selectedRatio;
    return `<button class="pill-choice ${selected?'active':''}" data-ratio="${r}">${selected?Icons.render('check',{strokeWidth:'3'}):''}۱:${toPersianDigits(r)}</button>`;
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

function renderTempGuide(){
  document.getElementById('tempGuideHeading').innerHTML = Icons.render('thermometer') + 'راهنمای دمای دم‌آوری';
  document.getElementById('tempGuideList').innerHTML = TEMP_GUIDE.map(t => `
    <details class="guide-details">
      <summary class="guide-row">
        <div class="guide-badge" style="background:${t.color}; color:#fff;">${Icons.render(t.icon || 'thermometer', {fill:'none'})}</div>
        <div class="guide-text"><h5>${t.name}</h5><span class="meta"><bdi dir="auto">${t.c}</bdi> • <bdi dir="auto">${t.f}</bdi></span></div>
      </summary>
      <ul class="guide-more">${(t.more||[]).map(x => `<li>${x}</li>`).join('')}</ul>
    </details>`).join('');
}

function renderRoastGuide(){
  document.getElementById('roastGuideList').innerHTML = ROAST_GUIDE.map(r => `
    <details class="guide-details">
      <summary class="guide-row" style="align-items:flex-start;">
        <div class="guide-badge" style="background:${r.bg}; color:${r.ink};">${Icons.render(r.icon || 'bean', {fill:'currentColor'})}</div>
        <div class="guide-text">
          <h5>${r.name}</h5><p style="font-style:italic;">${r.desc}</p>
          <span class="meta">دمای دانه در پایان: <bdi dir="ltr">${r.temp}</bdi></span>
        </div>
      </summary>${photoHtml('roast-' + (ROAST_GUIDE.indexOf(r) + 1) + '.png', 'photo-eq photo-roast')}
      <div class="guide-more">
        <table class="guide-table">${r.rows.map(x => `<tr><th>${x[0]}</th><td>${x[1]}</td></tr>`).join('')}</table>
        <p class="guide-names"><b>نام‌های رایج:</b> <bdi dir="ltr">${r.names}</bdi></p>
        ${r.tip ? `<p class="guide-tip">${r.tip}</p>` : ''}
      </div>
    </details>`).join('') +
    `<ul class="guide-facts">${ROAST_FACTS.map(x => `<li>${x}</li>`).join('')}</ul>`;
}

const GRIND_MAP = [
  ['کلد برو','قهوه کابویی'],
  ['فرنچ پرس','پرکولاتور'],
  ['کمکس'],
  ['قهوه\u200cساز قطره\u200cای','وی\u200cشصت (V60) / پوراوور'],
  ['ایروپرس'],
  ['اسپرسو','موکاپات'],
  ['قهوه ترک / جذوه']
];
const GRIND_SOURCES = [
  ['I\'m Not a Barista — Grind size chart','https://notabarista.org/grind-size-chart/'],
  ['Beans & Barista — Grind size chart: what has actually been measured','https://beansandbarista.com/blog/coffee-grind-size-chart/'],
  ['Wikipedia — Coffee grinder','https://en.wikipedia.org/wiki/Coffee_grinder'],
  ['Wikipedia — Coffee preparation','https://en.wikipedia.org/wiki/Coffee_preparation'],
  ['Wikipedia — Turkish coffee','https://en.wikipedia.org/wiki/Turkish_coffee'],
  ['Wikipedia — Percolator','https://en.wikipedia.org/wiki/Percolator'],
];
function renderGrindGuide(){
  document.getElementById('grindGuideList').innerHTML = GRIND_GUIDE.map((g, gi) => {
    const rows = (GRIND_MAP[gi] || []).map(n => GRIND_CHART.find(c => c.m === n)).filter(Boolean);
    const full = rows.map(c => `
      <div class="grind-full-row">
        <h6>${c.m}</h6>
        <div class="grind-meta"><b><bdi dir="rtl">${c.mic}</bdi></b> — ${c.like}</div>
        ${c.time ? `<div class="grind-meta">زمان: <bdi dir="rtl">${c.time}</bdi></div>` : ''}
        <div class="grind-warn"><span>${c.bad_fine}</span><span>${c.bad_coarse}</span></div>
        <div class="grind-note">${c.note}</div>
      </div>`).join('');
    return `
    <details class="grind-block grind-more">
      <summary>
        <div class="grind-head"><h5>${g.name}</h5><div class="grind-dots">${Array.from({length:7}, (_,i) => `<span class="${i<g.dots?'filled':''}"></span>`).join('')}</div></div>
        <div class="grind-bar"><div class="fill" style="width:${(g.dots/7*100).toFixed(0)}%;"></div></div>
        <div class="grind-meta"><b>${g.like}</b> — ${g.used}</div>
      </summary>${photoHtml('grind-' + (gi + 1) + '.png', 'photo-eq')}
      <div class="grind-full">${full}</div>
    </details>`;
  }).join('') + '<p class="grind-hint" style="margin-top:10px;">اعداد میکرونی تقریبی‌اند؛ بازه‌ی هر روش را «نقطه‌ی شروع» بدانید.</p>';
}

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
      if (f) showToast(f.example ? `${f.fa} (${f.en}) — مثل: ${f.example}` : `${f.fa} (${f.en})`);
    }));
}

function renderCafSelect(){
  const sel = document.getElementById('cafDrinkSelect');
  sel.innerHTML = CAFFEINE_TABLE.map((d, i) => `<option value="${i}">${d.name} — ${toPersianDigits(d.mg)} میلی‌گرم</option>`).join('');
}
function renderCafLog(){
  const list = document.getElementById('cafLogList');
  list.innerHTML = state.caffeineLog.map((entry, i) => `
    <div class="caf-log-row">
      <span class="nm">${entry.name}</span>
      <span style="display:flex; align-items:center; gap:10px;">
        <span class="mg">${toPersianDigits(entry.mg)} میلی‌گرم</span>
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

function renderDashboardStats(){
  const el = (id) => document.getElementById(id);
  el('statDrinks').textContent = toPersianDigits(ALL_DRINKS.length);
  el('statCategories').textContent = toPersianDigits(RECIPE_GROUPS.length);
  el('statEncyclopedia').textContent = toPersianDigits(ENCYCLOPEDIA.reduce((s, c) => s + c.items.length, 0));
  el('statFavorites').textContent = toPersianDigits(state.favorites.size);
}

let glossLimit = 60;
function renderGlossary(resetLimit){
  if (resetLimit !== false && resetLimit !== 'more') glossLimit = 60;
  const q = (document.getElementById('glossarySearch').value || '').trim().toLowerCase();
  const cat = state.glossCat || 'all';
  const list = GLOSSARY.filter(t => (cat==='all' || t.cat===cat) &&
    (!q || (t.fa+' '+t.en+' '+t.d).toLowerCase().includes(q)))
    .sort((a,b) => a.en.localeCompare(b.en));
  const total = GLOSSARY.length.toLocaleString('fa') + ' اصطلاح';
  document.getElementById('glossaryCount').textContent = (q || cat!=='all') ? `${list.length.toLocaleString('fa')} نتیجه از ${total}` : total;
  const shown = list.slice(0, glossLimit);
  document.getElementById('glossaryList').innerHTML = shown.map(t => `
    <article class="gl-item">
      <div class="gl-head"><h3>${escapeHtml(t.fa)}</h3><span class="gl-en" dir="ltr">${escapeHtml(t.en)}</span></div>
      <p>${escapeHtml(t.d)}</p>
      <span class="gl-tag">${GLOSSARY_CATS[t.cat]}</span>
    </article>`).join('') + (list.length > glossLimit ? `<button type="button" class="btn gl-more" id="glossaryMore">نمایش بیشتر (${(list.length-glossLimit).toLocaleString('fa')} مورد دیگر)</button>` : '');
  const more = document.getElementById('glossaryMore');
  if (more) more.addEventListener('click', () => { glossLimit += 80; renderGlossary('more'); });
  document.getElementById('glossaryEmpty').style.display = list.length ? 'none' : '';
}
function renderGlossaryChips(){
  const cats = [['all','همه'], ...Object.entries(GLOSSARY_CATS)];
  const box = document.getElementById('glossaryChips');
  box.innerHTML = cats.map(([k,v]) => `<button type="button" class="stub${(state.glossCat||'all')===k?' active':''}" data-gc="${k}">${v}</button>`).join('');
  box.querySelectorAll('[data-gc]').forEach(b => b.addEventListener('click', () => {
    state.glossCat = b.dataset.gc; renderGlossaryChips(); renderGlossary();
  }));
}
function renderEquipment(){
  document.getElementById('eqCount').textContent = ' ('+EQUIPMENT.length.toLocaleString('fa')+')';
  document.getElementById('eqGuideList').innerHTML = EQUIPMENT.map(e => `
    <details class="eq-card">
      <summary><span class="eq-ico">${Icons.render(e.icon)}</span><span class="eq-title"><b>${e.name}</b><small dir="ltr">${e.en}</small></span></summary>
      ${photoHtml('eq-' + e.id + '.png', 'photo-eq')}<p class="eq-sum">${e.sum}</p>
      <ol class="eq-steps">${e.steps.map(s => `<li><b>${s.t}</b><span>${s.d}</span></li>`).join('')}</ol>
      ${e.mistakes && e.mistakes.length ? `<div class="eq-mist"><h4>نکته‌ی هشدار</h4><ul>${e.mistakes.map(m => `<li>${m}</li>`).join('')}</ul></div>` : ''}
      ${e.tip ? `<div class="eq-tip"><b>نکته:</b> ${e.tip}</div>` : ''}
    </details>`).join('');
}
document.getElementById('glossarySearch').addEventListener('input', () => renderGlossary());

function renderEvents(){
  const total = EVENTS.reduce((a,g) => a + g.items.length, 0);
  document.getElementById('eventsSub').textContent = `${toPersianDigits(total)} رویداد`;
  document.getElementById('eventsList').innerHTML =
    EVENTS.map((g, gi) => `<div class="ev-era"><h3>${escapeHtml(g.era)}</h3>${photoHtml('event-era-' + (gi + 1) + '.png', 'photo-enc')}` +
      g.items.map(e => `<div class="ev-item"><div class="ev-year">${escapeHtml(toPersianDigits(e.y))}</div><div class="ev-body"><b>${escapeHtml(e.t)}</b><p>${escapeHtml(toPersianDigits(e.d))}</p></div></div>`).join('') + `</div>`).join('');
}
document.getElementById('eventsBackBtn').addEventListener('click', () => showView('encyclopedia'));

function runGlobalSearch(){
  const q = document.getElementById('globalSearchInput').value.trim().toLowerCase();
  const box = document.getElementById('globalSearchResults');
  if (q.length < 2){ box.innerHTML = '<p class="src-intro">حداقل دو حرف بنویسید.</p>'; return; }
  const has = (...t) => t.join(' ').toLowerCase().includes(q);
  const recipes = ALL_DRINKS.filter(d => has(d.title, d.description, d.origin || '')).slice(0, 12);
  const terms = GLOSSARY.filter(t => has(t.fa, t.en, t.d)).slice(0, 12);
  const arts = [];
  ENCYCLOPEDIA_BROWSABLE.forEach(c => c.items.forEach(it => { if (it.kind !== 'divider' && has(it.title, stripTags(it.body))) arts.push({c, it}); }));
  const evs = EVENTS.flatMap(g => g.items).filter(e => has(e.t, e.d, e.y)).slice(0, 12);
  const sec = (title, n, html) => n ? `<div class="ev-era"><h3>${title} <small>(${toPersianDigits(n)})</small></h3>${html}</div>` : '';
  const row = (attrs, t, sub) => `<div class="ev-item gs-row" ${attrs}><div class="ev-body"><b>${escapeHtml(t)}</b>${sub ? `<p>${escapeHtml(sub)}</p>` : ''}</div></div>`;
  box.innerHTML =
    sec('دستورها', recipes.length, recipes.map(d => row(`data-gs="r" data-id="${d.id}"`, d.title, d.description.slice(0, 90))).join('')) +
    sec('واژه‌نامه', terms.length, terms.map(t => row(`data-gs="g" data-q="${escapeHtml(t.en)}"`, `${t.fa} — ${t.en}`, t.d.slice(0, 90))).join('')) +
    sec('دانشنامه', arts.length, arts.slice(0, 12).map(a => row(`data-gs="a" data-cat="${a.c.id}" data-title="${escapeHtml(a.it.title)}"`, a.it.title, a.c.title)).join('')) +
    sec('رویدادها', evs.length, evs.map(e => row('data-gs="e"', `${toPersianDigits(e.y)} — ${e.t}`, '')).join('')) ||
    '';
  if (!box.innerHTML.trim()) box.innerHTML = '<div class="empty-note"><h3>نتیجه‌ای یافت نشد</h3></div>';
  box.querySelectorAll('[data-gs]').forEach(el => el.addEventListener('click', () => {
    const k = el.dataset.gs;
    if (k === 'r') openDetail(Number(el.dataset.id));
    else if (k === 'g'){ showView('glossary'); document.getElementById('glossarySearch').value = el.dataset.q; renderGlossary(); }
    else if (k === 'a'){
      showView('encyclopedia'); openCategory(el.dataset.cat);
      const d = [...document.querySelectorAll('#categoryItemsWrap details.enc-item')].find(x => x.querySelector('summary').textContent === el.dataset.title);
      if (d){ d.open = true; d.scrollIntoView({block:'start'}); }
    }
    else showView('events');
  }));
}
document.getElementById('globalSearchInput').addEventListener('input', runGlobalSearch);
document.getElementById('searchBackBtn').addEventListener('click', () => showView(state.currentTab));

function sourceSections(){
  const uniq = (pairs) => { const seen = new Set(); return pairs.filter(p => p && p[1] && !seen.has(p[1]) && seen.add(p[1])); };
  const fromItems = (items) => uniq(items.flatMap(it => it.src || []));
  const sections = [];
  sections.push({title:'دانشنامه', groups: ENCYCLOPEDIA.map(c => ({title: c.title, links: fromItems(c.items)})).filter(g => g.links.length)});
  sections.push({title:'واژه‌نامه', groups:[{links: uniq(GLOSSARY.flatMap(t => t.s || []))}]});
  sections.push({title:'دستورهای نوشیدنی', groups: RECIPE_GROUPS.map(g => ({title: g.title, links: fromItems(g.items)})).filter(g => g.links.length)});
  if (Object.keys(PHOTO_CREDITS).length) sections.push({title:'تصاویر', groups:[{links: Object.entries(PHOTO_CREDITS).map(([f, c]) => [`${f} — ${c[0]} (${c[1]})`, c[2]])}]});
  sections.push({title:'رویدادها', groups:[{links: uniq(EVENT_SOURCES)}]});
  sections.push({title:'ابزار', groups:[
    {title:'راهنمای دما', links: uniq(TEMP_SOURCES)},
    {title:'درجه‌ی برشته‌کاری', links: uniq(ROAST_SOURCES)},
    {title:'درشتی آسیاب', links: uniq(GRIND_SOURCES)},
    {title:'عیب‌یاب طعم', links: uniq(TROUBLE_SOURCES)},
    {title:'نسبت دم‌آوری', links: uniq(RATIO_SOURCES)},
    {title:'چرخ طعم', links: uniq(FLAVOR_SOURCES)},
    {title:'جدول کافئین', links: uniq(CAFFEINE_SOURCES)},
    {title:'راهنمای تجهیزات', links: uniq(EQUIPMENT.flatMap(e => e.src || []))},
    {title:'دست به آچار', links: uniq(WRENCH_SOURCES)},
  ].filter(g => g.links.length)});
  return sections.filter(s => s.groups.length);
}
function renderSources(){
  const sections = sourceSections();
  const all = new Set();
  sections.forEach(s => s.groups.forEach(g => g.links.forEach(l => all.add(l[1]))));
  document.getElementById('sourcesSub').textContent = `${toPersianDigits(all.size)} صفحه‌ی مرجع`;
  const linksHtml = (links) => `<ul class="src-links">${links.map(l => `<li><a href="${escapeHtml(l[1])}" target="_blank" rel="noopener noreferrer">${escapeHtml(l[0])}</a></li>`).join('')}</ul>`;
  document.getElementById('sourcesList').innerHTML =
    `<p class="src-intro">محتوای اپ از صفحه‌های زیر گرفته شده است. برای نگه‌داشتن صفحه‌ها تمیز، لینک‌ها فقط این‌جا جمع شده‌اند.</p>` +
    sections.map(sec => {
      const cnt = new Set(); sec.groups.forEach(g => g.links.forEach(l => cnt.add(l[1])));
      return `<details class="src-sec"><summary><b>${sec.title}</b><small>${toPersianDigits(cnt.size)} منبع</small></summary>` +
        sec.groups.map(g => g.title
          ? `<details class="src-grp"><summary>${escapeHtml(g.title)}<small>${toPersianDigits(g.links.length)}</small></summary>${linksHtml(g.links)}</details>`
          : linksHtml(g.links)).join('') + `</details>`;
    }).join('');
}
document.getElementById('sourcesRow').addEventListener('click', () => showView('sources'));
document.getElementById('sourcesBackBtn').addEventListener('click', () => showView(state.currentTab));

function init(){
  renderGlossaryChips();
  renderGlossary();
  renderEquipment();
  renderSources();
  renderEvents();
  renderFeatured();
  startFeaturedLoop();
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
  updateNavIndicator('home', false);
}
init();
