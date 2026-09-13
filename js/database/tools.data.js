/* ===================================================================
   Coffee Pedia (دانشنامه قهوه) — Tools data
   Timer presets · Ratio guide · Temperature/Roast/Grind guides ·
   Caffeine table · nav & option lists · the new Flavor Wheel dataset
   =================================================================== */

const FEATURED_IDS = [24, 38, 62, 85, 96, 97];
const NAV_TABS = ['home','encyclopedia','tools','favorites'];
const UNIT_OPTIONS = ['متریک (ml, g)', 'امپریال (oz, lb)'];
const LANGUAGE_OPTIONS = ['فارسی', 'English', 'العربية'];

const TIMER_PRESETS = [
  {label:'اسپرسو', seconds:25}, {label:'۱ دقیقه', seconds:60},
  {label:'۳ دقیقه', seconds:180}, {label:'۴ دقیقه', seconds:240},
];

const RATIOS = [
  {r:15, desc:'قوی: غلیظ و پرقدرت، برای دوست‌داران قهوه‌ی تلخ و پرقدرت'},
  {r:16, desc:'استاندارد: متعادل و کامل، عالی برای بیشتر روش‌های دم‌آوری'},
  {r:17, desc:'ملایم: سبک‌تر و لطیف‌تر، مناسب دانه‌های تیره‌برشته'},
  {r:18, desc:'بسیار ملایم: سبک‌ترین حالت، برای طعم‌های ظریف و اسیدیته‌ی بالا'},
];

/* icon: a key from js/icons.js (was: a hard-coded ☕ emoji repeated on every row) */
const TEMP_GUIDE = [
  {name:'اسپرسو', c:'۹۰-۹۶°C', f:'۱۹۵-۲۰۵°F', color:'var(--ink)', icon:'thermometer'},
  {name:'پوراوور', c:'۹۲-۹۶°C', f:'۱۹۸-۲۰۵°F', color:'var(--rust)', icon:'thermometer'},
  {name:'فرنچ پرس', c:'۹۳-۹۴°C', f:'۲۰۰-۲۰۲°F', color:'#8B5A2B', icon:'thermometer'},
  {name:'کلد برو', c:'دمای اتاق', f:'دمای اتاق', color:'#4A7FB5', icon:'thermometer'},
];

/* icon: 'bean' for all three — a roasted coffee bean, at increasing "darkness"
   via the badge background color, replaces the sun/cloud/moon emoji trio
   which didn't really describe roast level (light roast is not "sunny weather"). */
const ROAST_GUIDE = [
  {name:'روشن (Light Roast)', desc:'میوه‌ای، گلی، اسیدیته‌ی درخشان', temp:'۹۰-۹۴°C / ۱۹۴-۲۰۲°F', best:'پوراوور، ایروپرس، کمکس', bg:'var(--mustard-soft)', ink:'var(--rust-deep)', icon:'bean'},
  {name:'متوسط (Medium Roast)', desc:'متعادل، طعم کارامل، شیرینی مغزدار', temp:'۹۳-۹۶°C / ۲۰۰-۲۰۵°F', best:'دریپ، فرنچ پرس، فلت وایت', bg:'var(--rust)', ink:'#fff', icon:'bean'},
  {name:'تیره (Dark Roast)', desc:'شکلاتی، دودی، بدنه‌ی قوی', temp:'۹۵-۹۶°C / ۲۰۳-۲۰۵°F', best:'اسپرسو، موکاپات، کلد برو', bg:'var(--ink)', ink:'var(--paper)', icon:'bean'},
];

const GRIND_GUIDE = [
  {name:'خیلی درشت', dots:7, like:'مثل نمک دریا', used:'کلد برو، قهوه کابویی'},
  {name:'درشت', dots:6, like:'مثل نمک درشت', used:'فرنچ پرس، پرکولاتور'},
  {name:'متوسط-درشت', dots:5, like:'مثل شن خشن', used:'کمکس، کلور دریپر'},
  {name:'متوسط', dots:4, like:'مثل شن ساحلی', used:'قهوه‌ساز قطره‌ای، پوراوور'},
  {name:'متوسط-ریز', dots:3, like:'مثل نمک سفره', used:'ایروپرس، سایفون'},
  {name:'ریز', dots:2, like:'مثل شکر', used:'اسپرسو، موکاپات'},
  {name:'خیلی ریز', dots:1, like:'مثل آرد', used:'قهوه ترک'},
];

const CAFFEINE_TABLE = [
  {name:'اسپرسو (۳۰ml)', mg:63},
  {name:'آمریکانو (۲۵۰ml)', mg:95},
  {name:'دم‌آوری فیلتری/پوراوور (۲۵۰ml)', mg:150},
  {name:'فرنچ پرس (۲۵۰ml)', mg:130},
  {name:'کلد برو (۲۵۰ml)', mg:185},
  {name:'قهوه فوری (۲۵۰ml)', mg:65},
  {name:'موکاپات (۶۰ml)', mg:80},
  {name:'قهوه ترک (۶۰ml)', mg:80},
  {name:'قهوه بدون کافئین (۲۵۰ml)', mg:3},
];
const CAFFEINE_DAILY_LIMIT = 400;

/* ---------------------------------------------------------------
   NEW — Coffee Flavor Wheel tool
   ---------------------------------------------------------------
   The 9 primary categories below are the standard top-level
   vocabulary used across the specialty-coffee industry for
   describing flavor in cupping (the same 9 families anchor the
   SCA/WCR Coffee Taster's Flavor Wheel). This is an original
   illustration drawn by this app (see js/app.js → renderFlavorWheel)
   using that public vocabulary — it is not a reproduction of any
   copyrighted flavor-wheel artwork.
   ------------------------------------------------------------- */
const FLAVOR_WHEEL = [
  {key:'fruity',   fa:'میوه‌ای',            en:'Fruity',              color:'#C1553F', example:'توت‌فرنگی، مرکبات، سیب، آلبالو'},
  {key:'floral',   fa:'گلی',                en:'Floral',              color:'#D98BB0', example:'یاس، بابونه، گل رز'},
  {key:'sweet',    fa:'شیرین',              en:'Sweet',               color:'#E8B95C', example:'وانیل، عسل، کارامل، شکلات شیری'},
  {key:'nutty',    fa:'آجیلی و کاکائویی',   en:'Nutty / Cocoa',       color:'#8C5A3C', example:'بادام، فندق، کاکائو تلخ'},
  {key:'spices',   fa:'ادویه‌ای',           en:'Spices',              color:'#B5502F', example:'دارچین، فلفل سیاه، هل'},
  {key:'roasted',  fa:'برشته',              en:'Roasted',             color:'#4A2E1E', example:'دودی، تست‌نان، غلات برشته'},
  {key:'green',    fa:'سبز و گیاهی',        en:'Green / Vegetative',  color:'#6E9E5B', example:'علف تازه، سبزیجات، هسته‌ی سبز'},
  {key:'sour',     fa:'ترش و تخمیری',       en:'Sour / Fermented',    color:'#D9A441', example:'سرکه، ماست، شراب'},
  {key:'other',    fa:'سایر (نامطلوب)',     en:'Other / Papery / Chemical', color:'#8A7360', example:'کاغذی، کپک‌زده، دارویی — نشانه‌ی معمول عیب در دانه یا دم‌آوری'},
];
