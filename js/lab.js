(function(){
const KEY_LAB = 'cp_lab', KEY_QUIZ = 'cp_quiz';
const PASS = 0.7, QUIZ_LEN = 10;
const fa = n => toPersianDigits(n);
const esc = s => escapeHtml(String(s));

function load(key, def){
  try { const v = JSON.parse(localStorage.getItem(key)); return (v && typeof v === 'object') ? v : def; }
  catch (e) { return def; }
}
function save(key, v){ try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }

let labData = load(KEY_LAB, { done: {} });
let quizData = load(KEY_QUIZ, { rounds: 0, best: 0, correct: 0, answered: 0, wrong: [] });
if (!Array.isArray(quizData.wrong)) quizData.wrong = [];
let quizMode = 'mixed';
if (!labData.done) labData.done = {};
let tab = 'lab';
let run = null;

function shuffle(a){
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function prepare(q){
  const idx = shuffle(q.opts.map((_, i) => i));
  return { key: q.key, q: q.q, multi: q.multi, why: q.why, block: q.block,
    opts: idx.map(i => q.opts[i]), ans: q.ans.map(a => idx.indexOf(a)) };
}

function allDrinks(){ return LAB.flatMap(l => l.drinks.map(d => ({ level: l, drink: d }))); }
function passed(d){
  const r = labData.done[d.id];
  return !!r && r.best / r.total >= PASS;
}
function rankInfo(){
  const all = allDrinks();
  const n = all.filter(x => passed(x.drink)).length;
  let title = 'تازه‌وارد';
  for (const l of LAB){ if (l.drinks.every(passed)) title = l.rank || l.title; else break; }
  return { n, total: all.length, title };
}

function homeLab(){
  const r = rankInfo();
  const pct = Math.round(r.n / r.total * 100);
  let h = `<div class="tool-card lab-rank">
    <div class="lab-rank-row"><span class="lab-rank-label">رتبه‌ی شما</span><b class="lab-rank-title">${esc(r.title)}</b></div>
    <div class="caf-meter"><div class="fill" style="width:${pct}%; background:var(--good);"></div></div>
    <p class="lab-muted">${fa(r.n)} از ${fa(r.total)} نوشیدنی را گذرانده‌اید (حداقل ${fa(Math.round(PASS * 100))}٪ پاسخ درست).</p>
  </div>`;
  h += '<div class="lab-levels">';
  LAB.forEach(l => {
    const done = l.drinks.filter(passed).length;
    h += `<div class="tool-card"><h3>${esc(l.title)}<small class="lab-count">${fa(done)} / ${fa(l.drinks.length)}</small></h3>
      <p class="lab-muted" style="margin-top:-8px;">${esc(l.desc)}</p><div class="lab-list">`;
    l.drinks.forEach(d => {
      const rec = labData.done[d.id];
      const st = rec ? `${fa(rec.best)}/${fa(rec.total)}` : '—';
      h += `<button class="lab-drink${passed(d) ? ' is-pass' : ''}" type="button" data-drink="${d.id}">
        <span class="lab-drink-name">${esc(d.name)}</span><span class="lab-drink-st">${passed(d) ? '✓ ' : ''}${st}</span></button>`;
    });
    h += '</div></div>';
  });
  h += '</div>';
  return h;
}

function homeQuiz(){
  const acc = quizData.answered ? Math.round(quizData.correct / quizData.answered * 100) : 0;
  const wrongN = quizData.wrong.filter(k => GLOSSARY.some(g => g.en === k)).length;
  let chips = `<button class="pill-choice${quizMode === 'mixed' ? ' active' : ''}" data-qmode="mixed" type="button">ترکیبی</button>`;
  Object.keys(GLOSSARY_CATS).forEach(c => {
    if (GLOSSARY.filter(g => g.cat === c).length < 6) return;
    chips += `<button class="pill-choice${quizMode === c ? ' active' : ''}" data-qmode="${c}" type="button">${esc(GLOSSARY_CATS[c])}</button>`;
  });
  chips += `<button class="pill-choice${quizMode === 'review' ? ' active' : ''}" data-qmode="review" type="button">مرور اشتباه‌ها (${fa(wrongN)})</button>`;
  const dis = quizMode === 'review' && wrongN < 1;
  return `<div class="tool-card"><h3>آزمون واژه‌نامه</h3>
    <p class="lab-muted" style="margin-top:-6px;">هر دور ${fa(QUIZ_LEN)} سؤال دارد: پیدا کردن اصطلاح از روی توضیح، پیدا کردن توضیح یک اصطلاح، و معادل فارسی و انگلیسی. سؤال‌ها از واژه‌نامه‌ی همین اپ ساخته می‌شوند و هر دور فرق دارد. اصطلاح‌هایی که اشتباه جواب بدهید در «مرور اشتباه‌ها» جمع می‌شوند.</p>
    <div class="lab-stats">
      <div><b>${fa(quizData.rounds)}</b><span>دور انجام‌شده</span></div>
      <div><b>${fa(quizData.best)}/${fa(QUIZ_LEN)}</b><span>بهترین نتیجه</span></div>
      <div><b>${fa(acc)}٪</b><span>دقت کلی</span></div>
    </div>
    <p class="field-label">بخش آزمون</p>
    <div class="pill-choice-row">${chips}</div>
    <button class="btn btn-ink" id="quizStartBtn" type="button"${dis ? ' disabled' : ''}>${dis ? 'اشتباهی برای مرور نیست' : 'شروع دور تازه'}</button></div>`;
}

const short = d => d.length <= 150;
function pickOthers(g, pool, n, key){
  const same = shuffle(pool.filter(x => x !== g && x.cat === g.cat && x[key] !== g[key]));
  const rest = shuffle(pool.filter(x => x !== g && x.cat !== g.cat && x[key] !== g[key]));
  const seen = new Set([g[key]]), out = [];
  for (const x of same.concat(rest)){ if (!seen.has(x[key])){ seen.add(x[key]); out.push(x); } if (out.length === n) break; }
  return out;
}
function makeQuestion(g, type){
  const coreFa = g.fa.replace(/\(.*?\)/g, '').trim();
  if (type === 'def'){
    const dis = pickOthers(g, GLOSSARY, 3, 'fa').map(x => x.fa);
    return prepare({ key: g.en, q: 'این توضیح مربوط به کدام اصطلاح است؟', block: g.d, opts: [g.fa].concat(dis), ans: [0],
      why: `«${g.fa}» (${g.en}) — ${g.d}` });
  }
  if (type === 'term'){
    const dis = pickOthers(g, GLOSSARY.filter(x => short(x.d)), 3, 'd').map(x => x.d);
    return prepare({ key: g.en, q: `کدام توضیح مربوط به «${g.fa}» (${g.en}) است؟`, opts: [g.d].concat(dis), ans: [0],
      why: `«${g.fa}» (${g.en}) — ${g.d}` });
  }
  if (type === 'en2fa'){
    const dis = pickOthers(g, GLOSSARY, 3, 'fa').map(x => x.fa);
    return prepare({ key: g.en, q: `معادل فارسی «${g.en}» در واژه‌نامه‌ی این اپ کدام است؟`, opts: [g.fa].concat(dis), ans: [0],
      why: `«${g.en}» ← ${g.fa}. ${g.d}` });
  }
  const dis = pickOthers(g, GLOSSARY, 3, 'en').map(x => x.en);
  return prepare({ key: g.en, q: `معادل انگلیسی «${coreFa}» کدام است؟`, opts: [g.en].concat(dis), ans: [0],
    why: `«${g.fa}» ← ${g.en}. ${g.d}` });
}
function quizQuestions(){
  let pool = GLOSSARY;
  if (quizMode === 'review') pool = GLOSSARY.filter(g => quizData.wrong.includes(g.en));
  else if (quizMode !== 'mixed') pool = GLOSSARY.filter(g => g.cat === quizMode);
  const picks = shuffle(pool).slice(0, QUIZ_LEN);
  return picks.map(g => {
    const core = g.fa.replace(/\(.*?\)/g, '').trim();
    const en = g.en.split(/[\s(/]/)[0].toLowerCase();
    const leaks = g.d.includes(core) || (en.length > 3 && g.d.toLowerCase().includes(en));
    const types = ['term', 'en2fa', 'fa2en'];
    if (!leaks && g.d.length <= 230) types.push('def', 'def');
    if (!short(g.d)) types.splice(types.indexOf('term'), 1);
    return makeQuestion(g, types[Math.floor(Math.random() * types.length)]);
  });
}

function startDrink(id){
  const hit = allDrinks().find(x => x.drink.id === id);
  if (!hit) return;
  run = { kind: 'drink', id, title: hit.drink.name, qs: hit.drink.qs.map(prepare), i: 0, score: 0, picked: [], answered: false };
  render();
}
function startQuiz(){
  run = { kind: 'quiz', title: 'آزمون واژه‌نامه', qs: quizQuestions(), i: 0, score: 0, picked: [], answered: false };
  render();
}

function renderQuestion(){
  const q = run.qs[run.i];
  const n = run.qs.length;
  const sel = new Set(run.picked);
  const ans = new Set(q.ans);
  let h = `<div class="tool-card lab-run">
    <div class="lab-run-top"><b>${esc(run.title)}</b><span>${fa(run.i + 1)} از ${fa(n)}</span></div>
    <div class="caf-meter"><div class="fill grow" style="width:${(run.i) / n * 100}%; --from:${Math.max(0, run.i - 1) / n * 100}%; background:var(--rust);"></div></div>
    <p class="lab-q">${esc(q.q)}</p>${q.block ? `<blockquote class="lab-block">${esc(q.block)}</blockquote>` : ''}
    ${q.multi ? '<p class="lab-muted">همه‌ی گزینه‌های درست را انتخاب کنید.</p>' : ''}
    <div class="lab-opts">`;
  q.opts.forEach((o, i) => {
    let cls = 'lab-opt';
    if (run.answered){
      if (ans.has(i)) cls += ' ok'; else if (sel.has(i)) cls += ' bad'; else cls += ' dim';
    } else if (sel.has(i)) cls += ' on';
    h += `<button type="button" class="${cls}" data-opt="${i}"${run.answered ? ' disabled' : ''}>${esc(o)}</button>`;
  });
  h += '</div>';
  if (run.answered){
    const good = run.lastOk;
    h += `<div class="info-box lab-fb ${good ? 'is-good' : 'is-bad'}"><p><b>${good ? 'درست بود.' : 'نادرست بود.'}</b> ${esc(q.why)}</p></div>
      <div class="btn-row" style="margin-top:14px;"><button class="btn btn-ink" id="labNextBtn" type="button">${run.i + 1 < n ? 'بعدی' : 'دیدن نتیجه'}</button></div>`;
  } else if (q.multi){
    h += `<div class="btn-row" style="margin-top:14px;"><button class="btn btn-ink" id="labSubmitBtn" type="button"${sel.size ? '' : ' disabled'}>ثبت پاسخ</button></div>`;
  }
  h += `<div class="btn-row" style="margin-top:10px;"><button class="btn btn-line" id="labQuitBtn" type="button">خروج</button></div></div>`;
  return h;
}

function renderResult(){
  const n = run.qs.length;
  const ratio = run.score / n;
  let msg = ratio === 1 ? 'عالی بود؛ همه‌ی پاسخ‌ها درست.' : ratio >= PASS ? 'خوب بود؛ این مرحله را گذراندید.' : 'هنوز جای کار دارد؛ پاسخ‌های درست را مرور کنید و دوباره تلاش کنید.';
  let h = `<div class="tool-card lab-run"><h3>${esc(run.title)}</h3>
    <div class="lab-score">${fa(run.score)} <small>از ${fa(n)}</small></div>
    <p class="lab-muted" style="text-align:center;">${msg}</p>
    <div class="btn-row" style="margin-top:14px; flex-wrap:wrap;">
      <button class="btn btn-ink" id="labAgainBtn" type="button">تلاش دوباره</button>
      <button class="btn btn-line" id="labQuitBtn" type="button">بازگشت</button>
    </div>`;
  if (run.kind === 'drink') h += `<div class="btn-row" style="margin-top:10px;"><button class="btn btn-line" id="labRecipeBtn" type="button">${run.id >= 9000 ? 'دیدن دستگاه' : 'دیدن دستور'}</button></div>`;
  return h + '</div>';
}

function finish(){
  const n = run.qs.length;
  if (run.kind === 'drink'){
    const prev = labData.done[run.id];
    labData.done[run.id] = { best: Math.max(prev ? prev.best : 0, run.score), total: n };
    save(KEY_LAB, labData);
  } else {
    quizData.rounds++;
    quizData.best = Math.max(quizData.best, run.score);
    quizData.correct += run.score;
    quizData.answered += n;
    save(KEY_QUIZ, quizData);
  }
  run.finished = true;
}

function submit(){
  const q = run.qs[run.i];
  const a = q.ans.slice().sort().join(), p = run.picked.slice().sort().join();
  run.lastOk = a === p;
  if (run.lastOk) run.score++;
  if (run.kind === 'quiz' && q.key){
    const w = quizData.wrong.filter(k => k !== q.key);
    if (!run.lastOk) w.push(q.key);
    quizData.wrong = w;
    save(KEY_QUIZ, quizData);
  }
  run.answered = true;
  render(true);
}

function render(keepScroll){
  const body = document.getElementById('labBody');
  const sub = document.getElementById('labSub');
  document.querySelectorAll('[data-labtab]').forEach(b => b.classList.toggle('active', b.dataset.labtab === tab));
  document.querySelector('.lab-tabs').style.display = run ? 'none' : '';
  if (run){
    sub.textContent = run.kind === 'drink' ? 'ترکیب را انتخاب کنید' : 'اصطلاح درست را پیدا کنید';
    body.innerHTML = run.finished ? renderResult() : renderQuestion();
  } else {
    sub.textContent = tab === 'lab' ? 'ساخت نوشیدنی با بازخورد' : 'سنجش دانش شما از واژه‌نامه';
    body.innerHTML = tab === 'lab' ? homeLab() : homeQuiz();
  }
  if (!keepScroll){ document.getElementById('appBody').scrollTop = 0; softSwap(body); }
}

document.getElementById('labBody').addEventListener('click', e => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.drink){ startDrink(Number(t.dataset.drink)); return; }
  if (t.dataset.qmode){ quizMode = t.dataset.qmode; render(true); return; }
  if (t.id === 'quizStartBtn'){ startQuiz(); return; }
  if (t.id === 'labQuitBtn'){ run = null; render(); return; }
  if (t.id === 'labAgainBtn'){ run.kind === 'drink' ? startDrink(run.id) : startQuiz(); return; }
  if (t.id === 'labRecipeBtn'){ if (run.id >= 9000 && window.openWrench){ window.openWrench(run.id - 9001); } else openDetail(run.id); return; }
  if (t.id === 'labSubmitBtn'){ submit(); return; }
  if (t.id === 'labNextBtn'){
    if (run.i + 1 < run.qs.length){ run.i++; run.picked = []; run.answered = false; render(); }
    else { finish(); render(); }
    return;
  }
  if (t.dataset.opt !== undefined && run && !run.answered){
    const i = Number(t.dataset.opt);
    const q = run.qs[run.i];
    if (q.multi){
      run.picked = run.picked.includes(i) ? run.picked.filter(x => x !== i) : run.picked.concat(i);
      render(true);
    } else {
      run.picked = [i];
      submit();
    }
  }
});
document.querySelectorAll('[data-labtab]').forEach(b => b.addEventListener('click', () => { tab = b.dataset.labtab; render(); }));
document.getElementById('openLabBtn').addEventListener('click', () => { run = null; render(); showView('lab'); });
document.getElementById('labBackBtn').addEventListener('click', () => { run = null; showView(state.currentTab); });

let resetTimer = null, armed = false;
const resetRow = document.getElementById('resetDataRow');
function disarm(){
  armed = false;
  document.getElementById('resetDataTitle').textContent = 'بازنشانی پیشرفت';
  document.getElementById('resetDataSub').textContent = 'پیشرفت آزمایشگاه، آزمون و داده‌های کارگاه پاک می‌شود';
  resetRow.classList.remove('is-armed');
}
resetRow.addEventListener('click', () => {
  if (!armed){
    armed = true;
    document.getElementById('resetDataTitle').textContent = 'مطمئنید؟ دوباره لمس کنید';
    document.getElementById('resetDataSub').textContent = 'این کار برگشت‌پذیر نیست';
    resetRow.classList.add('is-armed');
    clearTimeout(resetTimer);
    resetTimer = setTimeout(disarm, 4000);
    return;
  }
  clearTimeout(resetTimer);
  disarm();
  ['cp_journal','cp_gear','cp_cart','cp_wrench',KEY_LAB, KEY_QUIZ].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
  labData = { done: {} };
  quizData = { rounds: 0, best: 0, correct: 0, answered: 0, wrong: [] };
  quizMode = 'mixed';
  run = null;
  render(true);
  window.dispatchEvent(new Event('cp-reset'));
  showToast('پیشرفت بازنشانی شد');
});

render(true);
})();
