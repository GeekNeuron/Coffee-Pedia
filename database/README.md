# Coffee Pedia — Database

This folder is the canonical, framework-agnostic copy of the app's content.
The app itself does **not** fetch these `.json` files at runtime — see
"Why two copies?" below — but they're kept here as the source of truth for
review, reuse, translation, or importing into a real backend/CMS later.

## Files

| File                 | Contents                                             |
|----------------------|-------------------------------------------------------|
| `encyclopedia.json`  | 17 categories, 196 entries — history, botany, roasting, chemistry, technique, equipment, additives, food pairings, sensory/cupping, health, economics, culture, art, folklore, vocabulary, safety, and future/innovation. |
| `recipes.json`       | 12 groups, 84 drinks — every brewing method and drink recipe. |

## Schema

```jsonc
// encyclopedia.json — array of categories
{
  "id": "C1",            // stable id, referenced nowhere else
  "icon": "botany",       // a key into js/icons.js (see "Icons" below)
  "title": "گیاه‌شناسی و رشد قهوه",
  "items": [
    {
      "id": 1,             // GLOBALLY unique across both files — used for
                            // favorites, deep-linking (openDetail), and search
      "title": "...",
      "kind": "item",       // "item" | "note" | "divider" — controls rendering
      "body": "<p>...</p>"  // sanitized-by-hand HTML: p, ul/li, h4, table, div.note-box
    }
  ]
}
```

`recipes.json` has the same shape (`RECIPE_GROUPS`), except every leaf is a
drink instead of an encyclopedia article, and titles are the drink's own
name — see "Content changes" below for why that matters.

## Why two copies of the data?

- `database/*.json` — plain JSON, no comments, easy to diff/import/translate.
- `js/database/*.data.js` — the **exact same data**, wrapped as
  `const ENCYCLOPEDIA = [...]` so the running app can load it with a plain
  `<script src="...">` tag. This means Coffee Pedia works with **zero
  setup**, including opened directly from disk (`file://…/index.html`) with
  no local server — a `fetch()` of a local JSON file is blocked by the
  browser's CORS rules in that case, but a classic script is not.

If you regenerate one, regenerate the other (or just re-run
`transform.js` — ask your dev to keep it, it's a ~120-line Node script).

## Icons

Every category/group `icon` field is a string key into the registry in
`js/icons.js`, not raw text. Previously these were emoji (📜 🌱 🔥 ⚗️ 🧭 🔧
💧 🍰 👅 🧠 💰 🌍 🎭 🔮 💬 ⚠️ 🚀 …) baked directly into the data and printed
as-is. They're now semantic keys (`history`, `botany`, `roast`,
`chemistry`, `technique`, `equipment`, `additive`, `dessert`, `sensory`,
`health`, `economics`, `culture`, `art`, `folklore`, `vocabulary`,
`safety`, `future`, `coffee`, `droplet`, `milk`, `sparkle`, `pourover`,
`immersion`, `autodrip`, `cold`, `traditional`, `unusual`, `rarebeans`) so
the same icon renders consistently (and now scalably/crisply as SVG,
recolorable via CSS `currentColor`) everywhere it's used, instead of
relying on whatever emoji font happens to be installed on the reader's OS.

## Content changes made in this pass

Full detail is in the top-level `README.md`; in short:

1. **Titles**: 66 recipe titles had "روش درست کردن " (lit. "the method of
   making") baked into the *name itself* — e.g. the drink's title was
   literally "روش درست کردن اسپرسو نرمال (Espresso Normale)". That prefix
   is now stripped at the source, so every title is just the drink's name
   ("اسپرسو نرمال (Espresso Normale)") everywhere it's displayed — home
   cards, the detail page, favorites, and search.
2. **Factual fix**: entry #613 ("Coffee Sobia") was labeled a Thai street
   drink. It is not — Sobia is a traditional Hejazi/Saudi Arabian Ramadan
   drink (confirmed against Arabic-language sources). Fixed, and the
   drink's history note now says so explicitly instead of repeating the
   error.
3. **Content depth**: 9 recipes (613, 616, 618, 619, 622, 623, 625, 626,
   627, 628) were one-sentence trivia stubs instead of real step-by-step
   recipes like the other 75. They've been expanded to match — with a real
   citation-checked history for Mazagran (verified against multiple
   sources; it's the oldest documented iced-coffee drink, invented in
   1840s French-colonial Algeria), a safety note on the flaming-coffee
   recipe (open flame), a health caution on licorice-root coffee (raises
   blood pressure), and — since three of them involve coffee processed by
   caged/farmed animals (civets, elephants) — a plain-language animal
   welfare note, because a coffee encyclopedia describing those methods
   without mentioning that concern would be an incomplete, uncritical
   account.
4. **New content, from a real open dataset**: item #700 (in category
   C10, economics) is new — average cupping scores by country of origin
   and by processing method. See "Open-source data used" below.

## Open-source data used

**[Coffee Quality Institute](https://www.coffeeinstitute.org/) cupping
database**, mirrored as open data on GitHub:
[`jldbc/coffee-quality-database`](https://github.com/jldbc/coffee-quality-database)
(~1,300 Arabica cupping records). Downloaded directly from that repository
and aggregated (mean cupping score, grouped by `Country.of.Origin` and by
`Processing.Method`, dropping any group with fewer than 20 samples so a
single unusual lot can't skew an average) into encyclopedia entry #700.
The raw aggregation script and its output are reproducible; the numbers
are not hand-typed guesses.

**Other open coffee projects found during research**, not currently wired
in but worth knowing about if this project grows a real backend:

- [`Open Food Facts`](https://world.openfoodfacts.org/) — huge, ODbL-licensed
  product database; has thousands of packaged-coffee products with
  ingredients/origin/certifications. Would suit a future "scan a bag"
  feature far better than typing data in by hand.
- SCA/WCR **Coffee Taster's Flavor Wheel** vocabulary — the 9 top-level
  flavor families are industry-standard, publicly documented terminology
  (not proprietary artwork); Coffee Pedia's new in-app Flavor Wheel tool
  (`js/database/tools.data.js` → `FLAVOR_WHEEL`, rendered by
  `js/app.js` → `renderFlavorWheel()`) is an **original SVG drawing** built
  from that public vocabulary, not a reproduction of any copyrighted chart.
