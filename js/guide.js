(function(){
const ov = document.getElementById('guideOverlay');
const fa = n => toPersianDigits(n);
let d = null, i = 0, left = 0, total = 0, tm = null, paused = false, wake = null, ac = null;

function dur(s){
  const t = toLatinDigits((s.text || '') + ' ' + (s.meta || '')).replace(/٫/g, '.');
  const m = t.match(/(\d+(?:\.\d+)?)(?:\s*(?:تا|–|-)\s*(\d+(?:\.\d+)?))?\s*(?:\([^)]*\)\s*)?(ثانیه|دقیقه|ساعت)/);
  if (!m) return 0;
  const v = parseFloat(m[2] || m[1]);
  const sec = m[3] === 'ثانیه' ? v : m[3] === 'دقیقه' ? v * 60 : v * 3600;
  return sec > 0 && sec <= 3600 ? Math.round(sec) : 0;
}
const mmss = s => fa(String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'));
function beep(){
  if (cpPref('sound', true)) try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    [0, .25, .5].forEach(t => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 880; g.gain.value = .15; o.connect(g); g.connect(ac.destination); o.start(ac.currentTime + t); o.stop(ac.currentTime + t + .15); });
  } catch (e) {}
  if (cpPref('vibe', true)) try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
}
async function lock(){ try { if (cpPref('wake', true) && navigator.wakeLock) wake = await navigator.wakeLock.request('screen'); } catch (e) {} }
function unlock(){ try { wake && wake.release(); } catch (e) {} wake = null; }
function stop(){ clearInterval(tm); tm = null; }
function begin(){
  stop(); const s = d.steps[i]; total = left = dur(s); paused = false; draw();
  if (total) tm = setInterval(() => { if (paused) return; left--; if (left <= 0){ left = 0; stop(); beep(); } paintTimer(); }, 1000);
}
function paintTimer(){
  const el = document.getElementById('gTime'); if (!el) return;
  el.textContent = left > 0 || !total ? mmss(left) : 'تمام شد';
  const f = document.getElementById('gFill'); if (f) f.style.width = (total ? (1 - left / total) * 100 : 0) + '%';
  const p = document.getElementById('gPause'); if (p) p.textContent = paused ? 'ادامه' : 'مکث';
  el.classList.toggle('done', total > 0 && left === 0);
}
function draw(){
  const s = d.steps[i], n = d.steps.length, last = i === n - 1;
  ov.innerHTML = `
    <div class="g-top"><button type="button" class="stamp-btn" id="gClose" aria-label="خروج"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      <div class="g-name">${escapeHtml(splitName(d.title).fa)}</div><div class="g-count">گام ${fa(i + 1)} از ${fa(n)}</div></div>
    <div class="caf-meter"><div class="fill" style="width:${(i + 1) / n * 100}%;background:var(--good)"></div></div>
    <div class="g-body">
      ${s.label ? `<div class="g-label">${escapeHtml(s.label)}</div>` : ''}
      <div class="g-text">${escapeHtml(s.text)}</div>
      ${s.meta ? `<div class="g-meta"><bdi dir="rtl">${escapeHtml(s.meta)}</bdi></div>` : ''}
      ${total ? `<div class="g-timer"><div class="g-time" id="gTime"></div><div class="caf-meter"><div class="fill" id="gFill" style="width:0%;background:var(--rust)"></div></div>
        <div class="g-tbtns"><button type="button" id="gMinus">−۱۵ ثانیه</button><button type="button" id="gPause">مکث</button><button type="button" id="gPlus">+۱۵ ثانیه</button><button type="button" id="gRestart">از اول</button></div></div>` : ''}
    </div>
    <div class="g-nav"><button type="button" class="btn btn-line" id="gPrev"${i ? '' : ' disabled'}>قبلی</button>
      <button type="button" class="btn btn-ink" id="gNext">${last ? 'پایان' : 'گام بعد'}</button></div>`;
  paintTimer();
}
function open(id){
  const e = ITEM_INDEX.get(id); if (!e || !Array.isArray(e.item.steps) || !e.item.steps.length) return;
  d = e.item; i = 0; ov.classList.add('show'); lock(); begin();
}
function close(){ stop(); unlock(); ov.classList.remove('show'); ov.innerHTML = ''; d = null; }
ov.addEventListener('click', ev => {
  const b = ev.target.closest('button'); if (!b) return;
  switch (b.id){
    case 'gClose': close(); break;
    case 'gPrev': if (i > 0){ i--; begin(); } break;
    case 'gNext': if (i < d.steps.length - 1){ i++; begin(); } else { close(); showToast('آفرین! نوشیدنی آماده است'); } break;
    case 'gPause': paused = !paused; paintTimer(); break;
    case 'gMinus': left = Math.max(1, left - 15); paintTimer(); break;
    case 'gPlus': left += 15; total = Math.max(total, left); if (!tm) { tm = setInterval(() => { if (paused) return; left--; if (left <= 0){ left = 0; stop(); beep(); } paintTimer(); }, 1000); } paintTimer(); break;
    case 'gRestart': begin(); break;
  }
});
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && d) lock(); });
document.getElementById('guideStartBtn').addEventListener('click', () => open(state.currentDetailId));
})();
