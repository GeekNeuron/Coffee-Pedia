const FEATURED_IDS = [24, 38, 62, 85, 96, 97];
const NAV_TABS = ['tools','encyclopedia','home','glossary','settings'];
const UNIT_OPTIONS = ['متریک (ml, g)', 'امپریال (oz, lb)'];
const LANGUAGE_OPTIONS = ['فارسی', 'English', 'العربية'];

const TIMER_PRESETS = [
  {label:'اسپرسو', seconds:25}, {label:'۱ دقیقه', seconds:60},
  {label:'۳ دقیقه', seconds:180}, {label:'۴ دقیقه', seconds:240},
];

const RATIOS = [
  {r:15, desc:'۱ به ۱۵: نسبت رایج در کافه‌ها (۱ به ۱۵ تا ۱ به ۱۷)؛ فنجان غلیظ‌تر از استاندارد SCA'},
  {r:16, desc:'۱ به ۱۶: در بازه‌ی رایج کافه‌ها و قهوه‌ساز قطره‌ای (۱ به ۱۶ تا ۱ به ۱۸)'},
  {r:17, desc:'۱ به ۱۷: نزدیک به بازه‌ی استاندارد SCA (۵۰ تا ۶۰ گرم در لیتر، یعنی حدود ۱ به ۱۶٫۷ تا ۱ به ۲۰)'},
  {r:18, desc:'۱ به ۱۸: نسبت استاندارد SCA (حدود ۵۵ گرم قهوه در هر لیتر آب)'},
];

const TEMP_GUIDE = [
  {name:'اسپرسو', c:'۹۱–۹۵°C', f:'۱۹۶–۲۰۳°F', color:'var(--ink)', icon:'thermometer',
   more:['استاندارد مؤسسه‌ی ملی اسپرسوی ایتالیا: دمای خروج آب ۸۸ ± ۲°C و فشار ۹ ± ۱ بار.','زمان عصاره‌گیری ۲۵ ± ۵ ثانیه.']},
  {name:'پوراوور / فیلتری', c:'۹۲–۹۶°C', f:'۱۹۸–۲۰۵°F', color:'var(--rust)', icon:'thermometer',
   more:['روغن‌های معطر نزدیک ۹۶°C آزاد می‌شوند و اسیدهای تلخ در نقطه‌ی جوش؛ پس آب را «کمی کمتر از جوش» بگیرید.','قهوه‌ساز برقی: دمای واقعی به قدرت المنت بستگی دارد (منبع عدد مشخصی نداده).']},
  {name:'فرنچ پرس', c:'۹۳–۹۶°C', f:'۲۰۰–۲۰۵°F', color:'#8B5A2B', icon:'thermometer',
   more:['آب «کمی کمتر از جوش»؛ زمان تماس حدود ۴ دقیقه (تا ۷ دقیقه در منبعی دیگر).']},
  {name:'ایروپرس', c:'۸۰–۹۲°C', f:'۱۷۶–۱۹۸°F', color:'#B5502F', icon:'thermometer',
   more:['بازه‌ی دز مسابقه‌ای ۸۰ تا ۹۲°C؛ برای شروع یک راهنمای مستقل ۹۰°C و ۲ دقیقه با آسیاب حدود ۵۵۰ میکرون پیشنهاد می‌کند.']},
  {name:'سایفون', c:'کمی کمتر از ۱۰۰°C', f:'کمی کمتر از ۲۱۲°F', color:'#6E4B2A', icon:'thermometer',
   more:['بخار فشار آب را از محفظه‌ی پایین به بالا می‌راند؛ با برداشتن حرارت، قهوه‌ی دم‌شده به پایین کشیده می‌شود.']},
  {name:'قهوه‌ی ترک', c:'تا نقطه‌ی جوش', f:'تا نقطه‌ی جوش', color:'#7A3E1D', icon:'thermometer',
   more:['در جذوه به محض کف‌کردن برداشته می‌شود و معمولاً دو بار دیگر به جوش نزدیک می‌شود.']},
  {name:'کلد برو', c:'دمای اتاق', f:'دمای اتاق', color:'#4A7FB5', icon:'thermometer',
   more:['خیساندن ۱۲ تا ۲۴ ساعت در دمای اتاق یا آب سرد؛ کلد دریپ حدود ۲ ساعت.']},
];
const TEMP_SOURCES = [
  ['Wikipedia — Coffee preparation','https://en.wikipedia.org/wiki/Coffee_preparation'],
  ['Wikipedia — Espresso','https://en.wikipedia.org/wiki/Espresso'],
  ['Wikipedia — AeroPress','https://en.wikipedia.org/wiki/AeroPress'],
  ['Wikipedia — Siphon coffee','https://en.wikipedia.org/wiki/Siphon_coffee'],
  ['Wikipedia — Turkish coffee','https://en.wikipedia.org/wiki/Turkish_coffee'],
  ['I\'m Not a Barista — Grind size chart','https://notabarista.org/grind-size-chart/'],
];

const ROAST_GUIDE = [
  {name:'روشن (Light Roast)', temp:'۱۹۶–۲۰۵°C', bg:'var(--mustard-soft)', ink:'var(--rust-deep)', icon:'bean',
   desc:'بدون طعم برشته‌کاری مشخص؛ گاهی علفی یا میوه‌ای و با کل شخصیت خاستگاه',
   names:'Cinnamon, American, New England, Half City, Moderate-Light',
   rows:[['اسیدیته','بیشتر'],['بدنه','سبک‌تر'],['روغن سطح','خشک'],['رنگ','قهوه‌ای بسیار روشن تا متوسط‌روشن']],
   tip:'برای V60 دانه‌ی روشن را ریزتر آسیاب کنید (حدود ۴۰۰–۶۵۰ میکرون).'},
  {name:'متوسط (Medium Roast)', temp:'۲۱۰–۲۱۹°C', bg:'var(--rust)', ink:'#fff', icon:'bean',
   desc:'شکر کاراملی با کمی طعم برشته‌کاری؛ شخصیت خاستگاه تا حدی حفظ می‌شود',
   names:'City, City+, Full City',
   rows:[['اسیدیته','ملایم‌تر'],['بدنه','بیشتر'],['روغن سطح','خشک'],['رنگ','قهوه‌ای متوسط‌روشن تا متوسط']],
   tip:''},
  {name:'تیره (Dark Roast)', temp:'۲۲۵–۲۴۵°C', bg:'var(--ink)', ink:'var(--paper)', icon:'bean',
   desc:'طعم تلخ‌شیرین و کاراملی غالب؛ شخصیت خاستگاه کم می‌ماند',
   names:'Full City+, Italian, Vienna, French, Columbian',
   rows:[['اسیدیته','کم تا تقریباً حذف‌شده'],['بدنه','پر؛ در تیره‌ترین سطوح نازک'],['روغن سطح','براق (هرچه از کرک دوم بیشتر بگذرد بیشتر)'],['رنگ','قهوه‌ای متوسط‌تیره تا تیره؛ ایتالیایی تقریباً سیاه']],
   tip:'برای V60 دانه‌ی تیره را درشت‌تر آسیاب کنید (حدود ۷۰۰–۹۵۰ میکرون).'},
];
const ROAST_FACTS = [
  'کرک اول حدود ۱۹۶°C (آغاز برشته‌ی بسیار روشن) و کرک دوم حدود ۲۲۴°C (آغاز برشته‌های تیره) رخ می‌دهد.',
  'کافئین با سطح برشته‌کاری به‌طور معناداری تغییر نمی‌کند؛ اما چون دانه‌ی روشن چگال‌تر است، در حجم برابر کافئین بیشتری دارد.',
  'کافئین تا حدود ۲۰۰°C پایدار است و نزدیک ۲۸۵°C کاملاً تجزیه می‌شود.',
  'در برشته‌کاری حدود ۱۵ تا ۱۸ درصد جرم دانه کم می‌شود.',
];
const ROAST_SOURCES = [
  ['Wikipedia — Coffee roasting','https://en.wikipedia.org/wiki/Coffee_roasting'],
  ['I\'m Not a Barista — Grind size chart','https://notabarista.org/grind-size-chart/'],
];

const GRIND_GUIDE = [
  {name:'خیلی درشت', dots:7, like:'مثل نمک دریا', used:'کلد برو، قهوه کابویی'},
  {name:'درشت', dots:6, like:'مثل نمک درشت', used:'فرنچ پرس، پرکولاتور'},
  {name:'متوسط-درشت', dots:5, like:'مثل شن خشن', used:'کمکس'},
  {name:'متوسط', dots:4, like:'مثل شن ساحلی', used:'قهوه‌ساز قطره‌ای، پوراوور (V60)'},
  {name:'متوسط-ریز', dots:3, like:'مثل نمک سفره', used:'ایروپرس'},
  {name:'ریز', dots:2, like:'مثل شکر', used:'اسپرسو، موکاپات'},
  {name:'خیلی ریز', dots:1, like:'مثل آرد', used:'قهوه ترک'},
];


const CAFFEINE_TABLE = [
  // Mayo Clinic (مقدار دقیق)
  {name:'اسپرسو (۳۰ml)', mg:63},
  {name:'آمریکانو (یک شات اسپرسو + آب؛ محاسبه از اسپرسوی Mayo)', mg:63},
  {name:'قهوه‌ی دم‌شده (۲۳۷ml)', mg:96},
  {name:'قهوه فوری (۲۳۷ml)', mg:62},
  {name:'اسپرسو بدون کافئین (۳۰ml)', mg:1},
  {name:'قهوه‌ی دم‌شده بدون کافئین (۲۳۷ml)', mg:1},
  {name:'قهوه فوری بدون کافئین (۲۳۷ml)', mg:2},
  // Wikipedia — Caffeine (بازه؛ میانگین بازه)
  {name:'قهوه‌ی دم‌شده‌ی قطره‌ای (۲۰۷ml؛ بازه ۱۱۵–۱۷۵)', mg:145},
  {name:'قهوه‌ی پرکولاتور (۲۰۷ml؛ بازه ۸۰–۱۳۵)', mg:108},
  // Foods 2020, 9(12):1746 — کلد برو ۰٫۷۴–۰٫۸ mg/mL (۷ گرم قهوه در ۱۰۰ml آب، ۹ ساعت در ۴°C)؛ محاسبه برای ۲۳۷ml ≈ ۱۷۵–۱۹۰ → میانگین
  {name:'کلد برو (۲۳۷ml؛ محاسبه از ۰٫۷۴–۰٫۸ mg/mL)', mg:182},
  // PubMed 29230816 — قهوه‌ی ترک ۱۱۲ mg در یک فنجان (حجم فنجان در چکیده ذکر نشده)
  {name:'قهوه ترک (یک فنجان؛ پژوهش PubMed)', mg:112},
  // Wikipedia — Moka pot: ۱۲۸–۵۳۹٫۹ mg/100mL؛ برای ۵۰ml ≈ ۶۴–۲۷۰ (بازه بسیار وسیع)
  {name:'موکاپات (۵۰ml؛ بازه‌ی بسیار وسیع ۶۴–۲۷۰)', mg:167},
];
const CAFFEINE_SOURCES = [['Mayo Clinic — Caffeine content','https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/caffeine/art-20049372'],['Wikipedia — Caffeine','https://en.wikipedia.org/wiki/Caffeine'],['Foods 2020 — Cold brew coffee analysis','https://www.mdpi.com/2304-8158/9/12/1746'],['PubMed — Espresso, American, Turkish coffee','https://pubmed.ncbi.nlm.nih.gov/29230816/'],['Wikipedia — Moka pot','https://en.wikipedia.org/wiki/Moka_pot'],['Wikipedia — Caffè americano','https://en.wikipedia.org/wiki/Caff%C3%A8_americano']];
const CAFFEINE_DAILY_LIMIT = 400;

const FLAVOR_WHEEL = [
  {key:'fruity',   fa:'میوه‌ای',            en:'Fruity',              color:'#C1553F', example:'توت‌ها، میوه‌ی خشک، مرکبات (گریپ‌فروت، پرتقال، لیمو)'},
  {key:'floral',   fa:'گلی',                en:'Floral',              color:'#D98BB0', example:''},
  {key:'sweet',    fa:'شیرین',              en:'Sweet',               color:'#E8B95C', example:''},
  {key:'nutty',    fa:'آجیلی و کاکائویی',   en:'Nutty / Cocoa',       color:'#8C5A3C', example:''},
  {key:'spices',   fa:'ادویه‌ای',           en:'Spices',              color:'#B5502F', example:''},
  {key:'roasted',  fa:'برشته',              en:'Roasted',             color:'#4A2E1E', example:''},
  {key:'green',    fa:'سبز و گیاهی',        en:'Green / Vegetative',  color:'#6E9E5B', example:''},
  {key:'sour',     fa:'ترش و تخمیری',       en:'Sour / Fermented',    color:'#D9A441', example:''},
  {key:'other',    fa:'سایر',     en:'Other / Papery / Chemical', color:'#8A7360', example:''},
];

const GROUP_EQUIPMENT = {
  espresso_pure:    ['دستگاه اسپرسو', 'آسیاب قهوه'],
  espresso_diluted: ['دستگاه اسپرسو', 'آسیاب قهوه', 'کتری'],
  espresso_milk:    ['دستگاه اسپرسو', 'آسیاب قهوه', 'فرندر بخار شیر'],
  espresso_extra:   ['دستگاه اسپرسو', 'آسیاب قهوه'],
  pour_over:        ['دریپر', 'فیلتر کاغذی', 'کتری قوی‌گردن', 'ترازو', 'آسیاب قهوه'],
  drip:             ['قهوه‌ساز قطره‌ای', 'فیلتر کاغذی', 'آسیاب قهوه'],
};

const DIFFICULTY_LABEL = {beginner:'مبتدی', intermediate:'متوسط', advanced:'پیشرفته'};

const UNIT_CONVERT = {
  'گرم': {factor: 0.035274, imperialUnit: 'oz'},
  'میلی‌لیتر': {factor: 0.033814, imperialUnit: 'fl oz'},
};

const TROUBLE_SOURCES = [['Open Exam Prep — SCA Brewing Control Chart','https://open-exam-prep.com/study-guides/sca-q-grader/brewing-science-water-chemistry/brewing-control-chart'],['Atlas Coffee Club — The Brewing Control Chart','https://www.atlascoffee.com/encyclopedia/extraction-fundamentals-3-the-brewing-control-chart/'],['Wanderlust Coffee — Coffee to Water Ratio','https://wanderlust.coffee/coffee-to-water-ratio/']];
const RATIO_SOURCES = [['Wanderlust Coffee — Coffee to Water Ratio','https://wanderlust.coffee/coffee-to-water-ratio/'],['Open Exam Prep — SCA Brewing Control Chart','https://open-exam-prep.com/study-guides/sca-q-grader/brewing-science-water-chemistry/brewing-control-chart']];
const FLAVOR_SOURCES = [['SCA — How to Use the Coffee Taster’s Flavor Wheel','https://sca.coffee/sca-news/how-to-use-the-flavor-wheel-in-eight-steps'],['SCA article — The Coffee Taster’s Flavor Wheel','https://roastercup.com/pages/sca-article-1-the-coffee-tasters-flavor-wheel']];
