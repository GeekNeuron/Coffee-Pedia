# Coffee Pedia (دانشنامه قهوه)

A full rebuild of the single-file "کتاب قهوه" app into a proper multi-file
project — same content and same visual identity, but restructured, bug-fixed,
reviewed for accuracy, and extended. Everything below is what changed and why.

**Open `index.html` in any browser — no server, no build step, no install.**
It works offline and from disk (`file://`), on mobile and now on desktop too.

---

## 1. Project structure

```
coffee-pedia/
├── index.html              ← markup only; no inline <style>/<script> anymore
├── css/
│   ├── variables.css       ← color tokens, light/dark theme
│   ├── base.css            ← reset, app shell, the icon-stroke bugfix, a11y helpers
│   ├── layout.css           ← masthead, section labels, bottom nav / side rail
│   ├── components.css      ← buttons, cards, chips, modal, toast
│   ├── views.css           ← per-view styles (tools, settings, encyclopedia, detail)
│   └── desktop.css         ← NEW — the actual desktop layout (see §4)
├── js/
│   ├── icons.js             ← the icon library (see §3)
│   ├── app.js               ← all app logic, bug-fixed (see §2)
│   └── database/
│       ├── encyclopedia.data.js  ← same content as database/encyclopedia.json,
│       ├── recipes.data.js       ← wrapped as `const X = [...]` so it loads
│       └── tools.data.js         ← with a plain <script> tag — see database/README.md
├── database/
│   ├── encyclopedia.json   ← canonical data export (17 categories, 196 entries)
│   ├── recipes.json        ← canonical data export (12 groups, 84 drinks)
│   └── README.md           ← full schema + content-change log + data sources
├── fonts/
│   ├── fonts.css           ← local @font-face (replaces the old CDN links)
│   ├── vazirmatn/          ← Vazirmatn, variable weight 100–900, + OFL.txt
│   └── lalezar/            ← Lalezar (wordmark/display face), + OFL.txt
└── assets/
    ├── icons/              ← LICENSE + README for the icon set
    └── images/             ← 12 original SVG illustrations (one per recipe group)
```

Nothing is a placeholder — every file above is real and wired up.

---

## 2. Bugs you reported — root cause + fix

### "The cup shape and the checkmark are crooked" (tools section)

**Root cause:** every icon in the app is a hand-written
`<svg viewBox="0 0 24 24" stroke="currentColor">`, and **not one of them**
sets `stroke-linecap` / `stroke-linejoin` (the only place those properties
appeared anywhere in the original CSS was the timer's progress ring). Left
at the browser default (`butt` / `miter`), every joint — the mug handle
meeting the cup body, the sharp point of the "done" ✓, the gear teeth —
renders as a jagged spike instead of the smooth rounded stroke that every
Feather/Lucide-style icon set assumes.

**Fix:** one rule, `css/base.css`:
```css
svg{ stroke-linecap:round; stroke-linejoin:round; }
```
`stroke-linecap`/`stroke-linejoin` are inherited SVG properties, so this
single line fixes it for all ~50 icons in the app at once — not just the cup
and the checkmark. No per-icon or per-`viewBox` change was needed (the
`viewBox`s themselves were fine; the report's guess at the mechanism was
close but the fix lives one property away, at the stroke rendering, not the
coordinate system).

### Bottom navigation bug

Two independent problems were stacked here:

1. `updateNavIndicator()` only ever computed a *horizontal* offset
   (`translateX`). That's fine for a row of tabs, but it can't express a
   *column* of tabs — which matters the moment you want a desktop side rail
   (see §4). **Fix:** it now measures both axes with
   `getBoundingClientRect()` and applies `translate(dx, dy)` with a matching
   `width`/`height`, so the exact same code drives a horizontal pill on
   mobile and a vertical one on desktop.

2. The indicator's position was computed **once**, synchronously, on load —
   before the Vazirmatn/Lalezar web fonts had finished swapping in. The
   fallback system font and the real font don't measure identically, so the
   tab labels' widths shift slightly right after the swap, and only a
   `window.resize` listener existed to recompute — which a font swap does
   not trigger. **Fix:** added
   `document.fonts.ready.then(() => updateNavIndicator(state.currentTab))`.

3. A related bug found while fixing #1: `showView()` was setting
   `navWrap.style.display = 'block'` directly in JS. An inline style always
   wins over a stylesheet rule, so `css/desktop.css`'s
   `#navWrap{ display:flex }` (required to lay the rail out as a column)
   could never actually take effect. Fixed by toggling a `.is-hidden` class
   instead and letting CSS own the display value.

### A third icon bug, found while fixing the first one

The "Brewing Temperature Guide" tool card was using the *exact same*
clock/stopwatch icon as the Brew Timer tool right above it — clearly a
copy-paste leftover, since a stopwatch has nothing to do with temperature.
It now uses a real thermometer glyph (`js/icons.js` → `thermometer`).

---

## 3. Icons — professional, per-section

Every emoji in the app (📜🌱🔥⚗️🧭🔧💧🍰👅🧠💰🌍🎭🔮💬⚠️🚀 …) has been replaced
with a proper SVG icon:

- The icons that were **already** hand-drawn SVG in the original app (home,
  book, heart, gear, search, timer, calculator, coffee mug, …) are kept
  exactly as they were — they were already good and already consistent.
- **27 new icons**, one per encyclopedia category and per recipe group, come
  from [Lucide](https://lucide.dev) (ISC license, free for any use) — the
  same visual language (24×24, 2px stroke) the app already used, so nothing
  looks bolted-on. Full mapping and rationale in `database/README.md` →
  "Icons" and `js/icons.js`'s file header.
- Every drink card now shows an icon that matches **its own group**
  (espresso, pour-over, cold, traditional, …) instead of a single ☕ repeated
  on all 84 cards regardless of what the drink actually was.
- The detail page's icon badge is now set dynamically from the item's
  category/group — previously it was hard-coded to ☕ and never updated, so
  it showed the same coffee cup whether you opened a cold brew or a page
  about coffee history.

See `assets/icons/README.md` and `assets/icons/LICENSE` for attribution.

---

## 4. Desktop mode (new)

Previously the entire app was one fixed 410px-wide "journal" card, centered
in the page — true at every viewport size, including a 27" monitor. There
was no desktop layout at all.

`css/desktop.css` (loaded only above `860px`, phones are untouched) turns
the same markup into an actual desktop app:

- The shell widens to a real desktop canvas (up to ~1280px) instead of
  staying phone-width.
- The bottom tab bar becomes a **persistent left side rail** — same nav
  items, same sliding indicator, just vertical (this is what needed the
  `updateNavIndicator` translate(dx,dy) fix above).
- Each view's content is centered in a readable ~760px column inside the
  wider shell (magazine-style), rather than stretching every paragraph
  edge-to-edge — long lines of Persian body text at 1280px would be much
  harder to read, not "more desktop."
- Drink-card grids pick up a 3rd and (above 1300px) 4th column.
- The settings bottom-sheet becomes a centered dialog instead of sliding up
  from a "bottom" that no longer makes sense on a wide screen.
- Cards/buttons get a subtle hover state, since there's a mouse now.

## 5. Small accessibility pass

Not requested, but found while going through the whole project as asked:

- The 4 bottom-nav items and the 4 settings rows were plain `<div>`s with
  `onclick` — keyboard/screen-reader users couldn't reach them by tabbing.
  Converted to real `<button>` elements (everything else in the app already
  used `<button>` correctly).
- Added a "skip to content" link for keyboard users, visible `:focus-visible`
  outlines on every interactive element, and a `prefers-reduced-motion` rule
  that turns off animation/transition durations for people who've asked
  their OS for that.

---

## 6. Content review

Read every one of the 279 entries; ran automated checks for HTML validity,
duplicate IDs, and duplicate titles across both datasets (all clean — this
was already a carefully built dataset). Found and fixed:

- **A real factual error:** entry #613, "Coffee Sobia," was labeled a
  *"Thai street drink."* It isn't — Sobia (سوبيا) is a traditional Hejazi /
  Saudi Arabian drink, especially popular during Ramadan, confirmed against
  Arabic-language sources. Fixed, with the correction stated directly in the
  entry rather than silently deleted.
- **9 one-line trivia stubs** (613, 616, 618, 619, 622, 623, 625–628) that
  didn't match the step-by-step quality of the other 75 recipes. Expanded
  each to match, including a verified history for Mazagran (documented as
  the oldest iced-coffee drink, 1840s French Algeria), an explicit safety
  note on the flaming-coffee recipe (open flame), a health caution on
  licorice-root coffee (raises blood pressure), and — since three entries
  describe coffee processed by caged or farmed animals (civets, elephants) —
  a plain-language animal-welfare note. Leaving that out would have made the
  encyclopedia read as an uncritical endorsement of a practice that's
  genuinely controversial.
- **Titles:** 66 of 84 recipe titles had "روش درست کردن " ("the method of
  making…") baked into the title field itself, so it appeared everywhere —
  home cards, the detail page, favorites, search results — not just on the
  home screen. Stripped at the source, so every drink now reads as a name
  ("اسپرسو نرمال (Espresso Normale)"), not an instruction.

Full before/after detail for every change is in `database/README.md`.

---

## 7. Open data used

Added a new, properly-sourced encyclopedia entry (#700, under "اقتصاد،
بازاریابی و صنعت قهوه"): average cupping scores by country of origin and by
processing method, computed directly from the **Coffee Quality Institute**
cupping database, mirrored as open data on GitHub at
[`jldbc/coffee-quality-database`](https://github.com/jldbc/coffee-quality-database)
(~1,300 real Arabica cupping records). Downloaded and aggregated in this
session — the aggregation method (mean score, ≥20-sample threshold per
group) is documented in the entry itself, not just asserted.

Also researched but not wired in (documented as ideas, not fabricated
integrations):

- **Open Food Facts** (ODbL) — a much better fit for a future "scan a bag"
  feature than anything hand-entered.
- The SCA/WCR **flavor-wheel vocabulary** (public, industry-standard
  terminology) — used as the basis for the new in-app Flavor Wheel below;
  this is an original drawing, not a reproduction of any copyrighted chart.

---

## 8. New features added

- **Coffee Flavor Wheel** (Tools tab) — an interactive 9-segment wheel
  covering the standard flavor families used in professional cupping
  (fruity, floral, sweet, nutty/cocoa, spices, roasted, green/vegetative,
  sour/fermented, other). Tap a segment for example tasting notes. Drawn at
  runtime from data (`js/database/tools.data.js` → `FLAVOR_WHEEL`), not a
  static image.
- **12 original hero illustrations** (`assets/images/`), one per brewing
  family (espresso, milk drinks, pour-over, immersion, cold, traditional,
  rare beans, …), shown on the detail page for that group's drinks. Drawn
  specifically to match the app's existing paper/rust/mustard palette
  rather than dropped-in stock photography, which wouldn't have matched the
  hand-illustrated "journal" aesthetic and would have raised real licensing
  questions (see note below).
- Detail-page icon badge is now dynamic (see §3).
- Drink cards show a group-specific icon instead of a repeated ☕ (see §3).

**On images generally:** you asked for real photographs to be found and
added where the encyclopedia/recipes needed them. I looked into this
directly and want to be transparent about the constraint I ran into:
sourcing real photos requires pulling from image hosts (Unsplash, Pexels,
Wikimedia) that this environment's network access doesn't reach — only
GitHub/npm/PyPI-style package registries are reachable here, and pulling
arbitrary photos from a place I *can* reach (e.g. random files in GitHub
repos) would mean uncertain licensing, which I didn't think you'd want
built into a project you're going to share. The 12 original illustrations
above are the responsible substitute: zero licensing risk, and honestly a
better visual match for this app's hand-drawn aesthetic than photography
would have been. If you do want real photography later, Open Food Facts and
Wikimedia Commons (both openly licensed) are the right places to pull from
once this runs somewhere with normal internet access.

---

## 9. Suggested features (not built — for you to prioritize)

Based on what similar coffee apps (brew-guide apps like Brewfather-adjacent
tools, and specialty-coffee education apps) typically offer beyond what
this app already does well:

1. **Bean/roast journal** — let the user log a specific bag (roaster,
   origin, roast date) and track how their brew ratio/grind changed as the
   beans aged past their peak — the data model (RATIOS, GRIND_GUIDE) is
   already there, this would just add a user-log layer.
2. **"What's actually different" comparison view** — pick 2 drinks from the
   encyclopedia (e.g. Cortado vs. Flat White) and see their defining traits
   side by side; with 84 similarly-shaped drink entries already in the same
   schema, this is mostly a UI feature away.
3. **Timer presets tied to the actual recipe you're viewing** — right now
   the Brew Timer's 4 presets are generic; if you open a specific recipe
   with a stated brew time, a "start timer for this recipe" button on the
   detail page would connect two features that already exist but aren't
   linked.
4. **Grind-adjustment assistant** — "my last cup was sour/bitter" → suggests
   which direction to adjust grind/time, using GRIND_GUIDE + a small
   decision table. A common feature in Barista Hustle/James Hoffmann-style
   brew apps that this content is already 90% of the way toward supporting.
5. **Printable/shareable recipe card** — a lot of the appeal of a "journal"
   aesthetic app is wanting to physically pin a recipe to your kitchen wall;
   a `window.print()`-friendly single-recipe view would fit the vintage
   postcard theme unusually well.

---

## 10. Fonts

Both fonts are now bundled locally (no CDN dependency, works fully offline):

- **Vazirmatn** — variable font, weights 100–900 — `fonts/vazirmatn/`.
  Source: [rastikerdar/vazirmatn](https://github.com/rastikerdar/vazirmatn)
  v33.0.3 (via npm). SIL OFL 1.1 — see `fonts/vazirmatn/OFL.txt`.
- **Lalezar** — the display face used for the "Coffee Pedia" wordmark —
  `fonts/lalezar/`. Source: Google Fonts' repository
  (`google/fonts/ofl/lalezar`), original upstream
  [BornaIz/Lalezar](https://github.com/BornaIz/Lalezar). SIL OFL 1.1 — see
  `fonts/lalezar/OFL.txt`.

---

## 11. Naming

Renamed from "کتاب قهوه" to **Coffee Pedia** (شناسه: `com.coffeepedia.app`),
with **دانشنامه‌ی قهوه** as its Persian identity — shown together on the home
screen (English wordmark + Persian subtitle), everywhere else referred to
by whichever fits the context. Both names you suggested are represented
rather than picking just one.

Version bumped to `v3.0.0` in the footer tag, given the scope of this pass.
