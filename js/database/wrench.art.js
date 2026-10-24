/* تصویر قطعه‌های «دست به آچار»: هر دستگاه یک نقشه‌ی برش‌خورده‌ی جزئیات‌دار (art) و ناحیه‌های قابل‌لمس قطعه‌ها (hits) دارد.
   متن قطعه‌ها در wrench.data.js است؛ این فایل فقط شکل و جای شماره‌ها را مشخص می‌کند. */
const WRENCH_DEFS = `<defs>
<linearGradient id="wgSteel" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#6f7378"/><stop offset=".28" stop-color="#eceef0"/><stop offset=".55" stop-color="#b5b8bc"/><stop offset="1" stop-color="#5f6368"/></linearGradient>
<linearGradient id="wgAlu" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#9a9da1"/><stop offset=".3" stop-color="#f1f2f3"/><stop offset=".6" stop-color="#c4c7ca"/><stop offset="1" stop-color="#85888c"/></linearGradient>
<linearGradient id="wgDark" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#1c1411"/><stop offset=".35" stop-color="#52423a"/><stop offset="1" stop-color="#1c1411"/></linearGradient>
<linearGradient id="wgCopper" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#8a4a22"/><stop offset=".35" stop-color="#f0b27a"/><stop offset=".7" stop-color="#c0703a"/><stop offset="1" stop-color="#7a3f1b"/></linearGradient>
<linearGradient id="wgGlass" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".25" stop-color="#ffffff" stop-opacity=".12"/><stop offset=".8" stop-color="#ffffff" stop-opacity=".1"/><stop offset="1" stop-color="#ffffff" stop-opacity=".5"/></linearGradient>
<linearGradient id="wgCoffee" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8a5a3c"/><stop offset="1" stop-color="#3b2216"/></linearGradient>
<linearGradient id="wgBrew" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#c47a3a" stop-opacity=".85"/><stop offset="1" stop-color="#5a2e14" stop-opacity=".95"/></linearGradient>
<linearGradient id="wgWater" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#bfe0ee" stop-opacity=".9"/><stop offset="1" stop-color="#5f9fba" stop-opacity=".9"/></linearGradient>
<linearGradient id="wgBrass" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f1d27a"/><stop offset="1" stop-color="#9a7020"/></linearGradient>
<linearGradient id="wgRubber" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4a4a4a"/><stop offset="1" stop-color="#151515"/></linearGradient>
<radialGradient id="wgBean" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#9a6a46"/><stop offset="1" stop-color="#3e2418"/></radialGradient>
</defs>`;

const WRENCH_ART = {

/* ───────── موکاپات ───────── */
moka: {
  order: ['upper', 'lower', 'funnel', 'disc', 'gasket', 'spout', 'valve'],
  art: `
  <ellipse cx="160" cy="244" rx="86" ry="7" fill="#000" opacity=".16"/>
  <path class="ol" d="M104 240 L216 240 L202 160 L118 160 Z" fill="url(#wgAlu)"/>
  <path d="M121 160 L131 240 M140 160 L144 240 M160 160 L160 240 M180 160 L176 240 M199 160 L189 240" stroke="#6b6e72" stroke-width=".8" opacity=".55" fill="none"/>
  <path d="M124 236 L196 236 L190 168 L130 168 Z" fill="#2a1f19"/>
  <path d="M126 236 L194 236 L192 204 L128 204 Z" fill="url(#wgWater)"/>
  <path d="M128 204 q8 -4 16 0 t16 0 t16 0 t16 0" stroke="#ffffff" stroke-width="1.2" fill="none" opacity=".7"/>
  <path d="M133 224 h8 M150 230 h6 M170 222 h9" stroke="#ffffff" stroke-width="1" opacity=".5"/>
  <circle cx="146" cy="214" r="2" fill="#fff" opacity=".7"/><circle cx="172" cy="226" r="1.6" fill="#fff" opacity=".7"/><circle cx="160" cy="231" r="1.4" fill="#fff" opacity=".7"/>
  <path class="ol" d="M126 163 H194 L168 192 L166 224 H154 L152 192 Z" fill="url(#wgSteel)"/>
  <path d="M131 165 H189 L166 189 H154 Z" fill="url(#wgCoffee)"/>
  <g fill="#1d120b" opacity=".7"><circle cx="146" cy="172" r="1.2"/><circle cx="160" cy="175" r="1.2"/><circle cx="173" cy="171" r="1.2"/><circle cx="154" cy="182" r="1.1"/><circle cx="167" cy="180" r="1.1"/></g>
  <path class="ol" d="M114 160 L206 160 L204 152 L116 152 Z" fill="url(#wgSteel)"/>
  <rect class="ol" x="121" y="152" width="78" height="8" rx="2.5" fill="url(#wgRubber)"/>
  <path d="M126 154.5 H194" stroke="#fff" stroke-width="1" opacity=".25"/>
  <rect class="ol" x="124" y="145" width="72" height="7" rx="2" fill="url(#wgSteel)"/>
  <g fill="#2a1f19"><circle cx="134" cy="148.5" r="1.1"/><circle cx="142" cy="148.5" r="1.1"/><circle cx="150" cy="148.5" r="1.1"/><circle cx="170" cy="148.5" r="1.1"/><circle cx="178" cy="148.5" r="1.1"/><circle cx="186" cy="148.5" r="1.1"/></g>
  <path class="ol" d="M112 146 L208 146 L226 64 L94 64 Z" fill="url(#wgAlu)"/>
  <path d="M130 146 L120 64 M160 146 L160 64 M190 146 L200 64" stroke="#6b6e72" stroke-width=".8" opacity=".5" fill="none"/>
  <path d="M123 145 L197 145 L210 74 L110 74 Z" fill="#2a1f19"/>
  <path d="M125 145 L195 145 L198 126 L122 126 Z" fill="url(#wgBrew)"/>
  <path d="M123 126 q9 -5 18 0 t18 0 t18 0 t18 0" stroke="#e7b27a" stroke-width="1.2" fill="none" opacity=".8"/>
  <ellipse class="ol" cx="160" cy="65" rx="66" ry="6.5" fill="#1f1612"/>
  <path class="ol" d="M94 64 L80 57 L96 71 Z" fill="url(#wgAlu)"/>
  <rect class="ol" x="154" y="88" width="12" height="58" rx="2" fill="url(#wgSteel)"/>
  <ellipse class="ol" cx="160" cy="88" rx="8" ry="4" fill="url(#wgSteel)"/>
  <circle cx="160" cy="88" r="1.6" fill="#2a1f19"/>
  <path d="M160 80 q-3 -8 0 -14 q4 6 0 14" fill="url(#wgBrew)" opacity=".9"/>
  <path d="M222 76 C268 70 274 134 214 144" stroke="#1d1410" stroke-width="11" stroke-linecap="round" fill="none"/>
  <path d="M224 76 C262 72 268 128 216 140" stroke="#6a574c" stroke-width="2" stroke-linecap="round" fill="none" opacity=".7"/>
  <rect x="216" y="70" width="12" height="9" rx="2" fill="url(#wgSteel)" class="ol"/><rect x="209" y="136" width="12" height="9" rx="2" fill="url(#wgSteel)" class="ol"/>
  <circle class="ol" cx="206" cy="196" r="8" fill="url(#wgBrass)"/>
  <path class="ol" d="M206 190 l5.2 3 v6 l-5.2 3 l-5.2 -3 v-6 z" fill="url(#wgBrass)"/>
  <circle cx="206" cy="196" r="2" fill="#4b3510"/>
  <path d="M104 240 H216" stroke="#4d5054" stroke-width="2"/>
  `,
  hits: {
    upper:  {shape:'<path class="pt" d="M112 146 L208 146 L226 64 L94 64 Z"/>', mx:272, my:46,  tx:206, ty:92},
    spout:  {shape:'<rect class="pt" x="152" y="84" width="16" height="62" rx="3"/>', mx:160, my:24, tx:160, ty:84},
    disc:   {shape:'<rect class="pt" x="122" y="144" width="76" height="9" rx="2"/>', mx:46, my:120, tx:122, ty:148},
    gasket: {shape:'<rect class="pt" x="119" y="152" width="82" height="9" rx="3"/>', mx:276, my:170, tx:201, ty:156},
    funnel: {shape:'<path class="pt" d="M126 163 H194 L168 192 L166 224 H154 L152 192 Z"/>', mx:46, my:176, tx:127, ty:170},
    lower:  {shape:'<path class="pt" d="M104 240 L216 240 L202 160 L118 160 Z"/>', mx:46, my:226, tx:108, ty:228},
    valve:  {shape:'<circle class="pt" cx="206" cy="196" r="10"/>', mx:276, my:214, tx:214, ty:200}
  }
},

/* ───────── دستگاه اسپرسو ───────── */
espresso: {
  order: ['tank', 'boiler', 'pump', 'group', 'gasket', 'pf', 'basket', 'wand'],
  art: `
  <ellipse cx="150" cy="248" rx="120" ry="6" fill="#000" opacity=".14"/>
  <rect class="ol" x="70" y="30" width="170" height="184" rx="12" fill="url(#wgAlu)"/>
  <rect x="70" y="30" width="170" height="14" rx="12" fill="#2b2220" opacity=".9"/>
  <rect x="84" y="24" width="142" height="8" rx="3" class="ol" fill="url(#wgSteel)"/>
  <path d="M92 28 H218" stroke="#c9ccd0" stroke-width="1" stroke-dasharray="3 4" opacity=".8"/>
  <rect x="80" y="52" width="150" height="152" rx="8" fill="#2a1f19"/>
  <rect x="80" y="52" width="150" height="152" rx="8" fill="none" stroke="#6b6e72" stroke-width="1"/>
  <rect class="ol" x="28" y="48" width="52" height="128" rx="7" fill="url(#wgGlass)"/>
  <path d="M30 86 H78 V170 q0 4 -4 4 H34 q-4 0 -4 -4 Z" fill="url(#wgWater)" opacity=".92"/>
  <path d="M30 86 q6 -4 12 0 t12 0 t12 0 t12 0" stroke="#fff" stroke-width="1.3" fill="none" opacity=".8"/>
  <path d="M34 60 v100" stroke="#fff" stroke-width="2" opacity=".35"/>
  <path d="M70 66 h8 M70 80 h8 M70 94 h8 M70 108 h8" stroke="#4a6f84" stroke-width="1"/>
  <rect class="ol" x="26" y="42" width="56" height="8" rx="3" fill="url(#wgDark)"/>
  <path d="M80 160 H98 V150" stroke="#78b0c8" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  <path d="M138 142 H158 V112 H128" stroke="#78b0c8" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  <path d="M152 88 H184 V112" stroke="#ef9a5a" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  <rect class="ol" x="94" y="62" width="62" height="52" rx="6" fill="url(#wgCopper)"/>
  <ellipse class="ol" cx="94" cy="88" rx="6" ry="26" fill="#a85f2c"/>
  <ellipse class="ol" cx="156" cy="88" rx="6" ry="26" fill="#d58a4c"/>
  <path d="M104 70 H146 M104 106 H146" stroke="#fff" stroke-width="1" opacity=".35"/>
  <g stroke="#7a3f1b" stroke-width="1.4"><path d="M108 78 h30 M108 88 h30 M108 98 h30" opacity=".6"/></g>
  <circle class="ol" cx="125" cy="62" r="5" fill="url(#wgBrass)"/>
  <path d="M120 50 q-4 -6 0 -10 M127 50 q-4 -6 0 -10" stroke="#e9e3da" stroke-width="1.4" fill="none" opacity=".6"/>
  <rect class="ol" x="94" y="124" width="52" height="38" rx="5" fill="url(#wgDark)"/>
  <rect class="ol" x="146" y="134" width="14" height="18" rx="3" fill="url(#wgSteel)"/>
  <g stroke="#a89488" stroke-width="1.4"><path d="M104 132 v22 M112 132 v22 M120 132 v22 M128 132 v22 M136 132 v22"/></g>
  <circle cx="100" cy="158" r="2" fill="#aaa"/><circle cx="140" cy="158" r="2" fill="#aaa"/>
  <rect class="ol" x="172" y="98" width="56" height="36" rx="6" fill="url(#wgSteel)"/>
  <rect class="ol" x="180" y="88" width="40" height="12" rx="3" fill="url(#wgDark)"/>
  <path d="M178 112 H222" stroke="#7b7e82" stroke-width="1"/>
  <circle cx="200" cy="120" r="7" fill="none" stroke="#7b7e82" stroke-width="1"/>
  <rect class="ol" x="172" y="133" width="56" height="7" rx="2.5" fill="url(#wgRubber)"/>
  <path class="ol" d="M176 140 H224 V154 H176 Z" fill="url(#wgSteel)"/>
  <path class="ol" d="M222 144 L268 166 q5 3 2 8 q-3 4 -8 2 L222 156 Z" fill="url(#wgDark)"/>
  <path d="M230 150 L262 165" stroke="#8a7a70" stroke-width="1.4" opacity=".7"/>
  <path class="ol" d="M182 140 H218 L214 156 H186 Z" fill="url(#wgAlu)"/>
  <path d="M188 142 H212" stroke="#2a1f19" stroke-width="2" stroke-dasharray="1.6 2.6"/>
  <path d="M190 148 H210" stroke="#2a1f19" stroke-width="1.6" stroke-dasharray="1.6 2.6"/>
  <path class="ol" d="M192 156 v8 M208 156 v8" stroke-width="3"/>
  <path d="M192 164 v12 M208 164 v12" stroke="#a9622c" stroke-width="2" opacity=".9"/>
  <path class="ol" d="M178 176 H222 L216 208 H184 Z" fill="url(#wgGlass)"/>
  <path d="M180 190 H220 L216 208 H184 Z" fill="url(#wgBrew)"/>
  <path d="M181 190 q6 -3 10 0 t10 0 t10 0" stroke="#e7b27a" stroke-width="1.4" fill="none"/>
  <rect class="ol" x="60" y="212" width="190" height="14" rx="4" fill="url(#wgDark)"/>
  <g stroke="#8a7a70" stroke-width="1.2"><path d="M72 219 H238" stroke-dasharray="6 5"/></g>
  <path d="M236 96 q18 4 18 36 L258 184" stroke="url(#wgSteel)" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M258 184 L259 198" stroke="#2f3236" stroke-width="5" stroke-linecap="round"/>
  <path d="M262 200 q4 4 2 9 M268 198 q5 5 3 11" stroke="#e9e3da" stroke-width="1.4" fill="none" opacity=".7"/>
  <circle class="ol" cx="236" cy="96" r="5" fill="url(#wgBrass)"/>
  <rect class="ol" x="240" y="62" width="14" height="14" rx="7" fill="url(#wgDark)"/>
  `,
  hits: {
    tank:   {shape:'<rect class="pt" x="26" y="42" width="56" height="136" rx="7"/>', mx:30, my:22, tx:46, ty:50},
    boiler: {shape:'<rect class="pt" x="88" y="60" width="74" height="58" rx="8"/>', mx:118, my:22, tx:118, ty:60},
    pump:   {shape:'<rect class="pt" x="92" y="122" width="70" height="42" rx="6"/>', mx:30, my:204, tx:96, ty:156},
    group:  {shape:'<rect class="pt" x="172" y="86" width="56" height="48" rx="6"/>', mx:200, my:26, tx:200, ty:88},
    gasket: {shape:'<rect class="pt" x="170" y="132" width="60" height="9" rx="3"/>', mx:288, my:130, tx:230, ty:136},
    pf:     {shape:'<path class="pt" d="M174 140 H224 L266 160 q8 4 4 12 q-4 6 -10 4 L222 158 H174 Z"/>', mx:288, my:92, tx:262, ty:158},
    basket: {shape:'<path class="pt" d="M180 140 H220 L215 157 H185 Z"/>', mx:130, my:238, tx:196, ty:150},
    wand:   {shape:'<path class="pt-s" d="M236 96 q18 4 18 36 L258 184 L259 198" fill="none"/>', mx:290, my:210, tx:264, ty:196}
  }
},

/* ───────── آسیاب برقی ───────── */
grinder: {
  order: ['hopper', 'motor', 'lowerburr', 'upperburr', 'chute', 'bin'],
  art: `
  <ellipse cx="160" cy="246" rx="116" ry="6" fill="#000" opacity=".16"/>
  <path class="ol" d="M88 100 H192 V232 q0 6 -6 6 H94 q-6 0 -6 -6 Z" fill="url(#wgDark)"/>
  <rect x="88" y="232" width="104" height="8" rx="3" fill="#0f0a08"/>
  <path d="M100 100 V232" stroke="#fff" stroke-width="1.2" opacity=".14"/>
  <rect x="98" y="106" width="84" height="106" rx="6" fill="#2a1f19"/>
  <rect x="98" y="106" width="84" height="106" rx="6" fill="none" stroke="#6b6e72" stroke-width=".9"/>
  <path class="ol" d="M82 20 H198 L170 100 H110 Z" fill="url(#wgGlass)"/>
  <path d="M90 70 H190 L172 100 H108 Z" fill="#5b3a29" opacity=".15"/>
  <g>
    <ellipse cx="108" cy="82" rx="7" ry="4.6" transform="rotate(-24 108 82)" fill="url(#wgBean)"/>
    <ellipse cx="126" cy="86" rx="7" ry="4.6" transform="rotate(18 126 86)" fill="url(#wgBean)"/>
    <ellipse cx="146" cy="84" rx="7" ry="4.6" transform="rotate(-8 146 84)" fill="url(#wgBean)"/>
    <ellipse cx="164" cy="87" rx="7" ry="4.6" transform="rotate(30 164 87)" fill="url(#wgBean)"/>
    <ellipse cx="118" cy="70" rx="7" ry="4.6" transform="rotate(10 118 70)" fill="url(#wgBean)"/>
    <ellipse cx="138" cy="68" rx="7" ry="4.6" transform="rotate(-30 138 68)" fill="url(#wgBean)"/>
    <ellipse cx="158" cy="70" rx="7" ry="4.6" transform="rotate(14 158 70)" fill="url(#wgBean)"/>
    <ellipse cx="176" cy="74" rx="6" ry="4" transform="rotate(-18 176 74)" fill="url(#wgBean)"/>
    <ellipse cx="130" cy="52" rx="7" ry="4.6" transform="rotate(20 130 52)" fill="url(#wgBean)"/>
    <ellipse cx="152" cy="54" rx="7" ry="4.6" transform="rotate(-12 152 54)" fill="url(#wgBean)"/>
    <ellipse cx="141" cy="40" rx="7" ry="4.6" transform="rotate(8 141 40)" fill="url(#wgBean)"/>
  </g>
  <path d="M90 28 L110 94" stroke="#fff" stroke-width="2" opacity=".35"/>
  <rect class="ol" x="78" y="12" width="124" height="10" rx="4" fill="url(#wgDark)"/>
  <rect class="ol" x="132" y="6" width="16" height="8" rx="3" fill="url(#wgDark)"/>
  <path class="ol" d="M108 108 H172 L166 124 H114 Z" fill="url(#wgSteel)"/>
  <path d="M114 124 l4 5 l4 -5 l4 5 l4 -5 l4 5 l4 -5 l4 5 l4 -5 l4 5 l4 -5 l4 5 l4 -5 l4 5 l4 -5" fill="none" stroke="#4d5054" stroke-width="1.2"/>
  <path class="ol" d="M114 134 H166 L172 150 H108 Z" fill="url(#wgSteel)"/>
  <path d="M114 134 l4 -5 l4 5 l4 -5 l4 5 l4 -5 l4 5 l4 -5 l4 5 l4 -5 l4 5 l4 -5 l4 5 l4 -5" fill="none" stroke="#4d5054" stroke-width="1.2"/>
  <g fill="#7a4a2c" opacity=".9"><circle cx="124" cy="131" r="1.1"/><circle cx="142" cy="131.4" r="1.1"/><circle cx="158" cy="131" r="1.1"/></g>
  <rect class="ol" x="136" y="150" width="8" height="20" fill="url(#wgSteel)"/>
  <rect class="ol" x="106" y="168" width="68" height="40" rx="6" fill="url(#wgCopper)"/>
  <g stroke="#7a3f1b" stroke-width="1.6" opacity=".7"><path d="M116 172 v32 M124 172 v32 M132 172 v32 M140 172 v32 M148 172 v32 M156 172 v32 M164 172 v32"/></g>
  <circle class="ol" cx="140" cy="188" r="8" fill="url(#wgSteel)"/><circle cx="140" cy="188" r="2.6" fill="#33363a"/>
  <path class="ol" d="M172 146 L206 170 L198 182 L166 158 Z" fill="url(#wgAlu)"/>
  <path d="M176 150 L202 170" stroke="#fff" stroke-width="1.4" opacity=".5"/>
  <path d="M200 178 l4 8" stroke="#b07a52" stroke-width="2.4" stroke-dasharray="1.6 3" stroke-linecap="round"/>
  <path class="ol" d="M186 190 H266 L262 236 H190 Z" fill="url(#wgGlass)"/>
  <path d="M190.6 216 q16 -8 34 -2 t36 -2 L262 236 H190 Z" fill="url(#wgCoffee)"/>
  <g fill="#c79a74" opacity=".6"><circle cx="212" cy="224" r="1"/><circle cx="232" cy="226" r="1"/><circle cx="246" cy="222" r="1"/></g>
  <path d="M192 196 V232" stroke="#fff" stroke-width="2" opacity=".35"/>
  <rect class="ol" x="182" y="184" width="88" height="8" rx="3" fill="url(#wgDark)"/>
  <circle class="ol" cx="108" cy="224" r="4" fill="url(#wgBrass)"/><rect x="152" y="220" width="30" height="8" rx="4" fill="#52423a"/>
  `,
  hits: {
    hopper:    {shape:'<path class="pt" d="M82 20 H198 L170 100 H110 Z"/>', mx:44, my:46, tx:90, ty:50},
    upperburr: {shape:'<path class="pt" d="M108 108 H172 L166 126 H114 Z"/>', mx:44, my:104, tx:108, ty:116},
    lowerburr: {shape:'<path class="pt" d="M114 132 H166 L172 152 H108 Z"/>', mx:44, my:152, tx:109, ty:142},
    motor:     {shape:'<rect class="pt" x="104" y="166" width="72" height="44" rx="7"/>', mx:44, my:200, tx:106, ty:190},
    chute:     {shape:'<path class="pt" d="M172 146 L206 170 L198 182 L166 158 Z"/>', mx:284, my:132, tx:198, ty:160},
    bin:       {shape:'<path class="pt" d="M184 188 H268 L264 238 H188 Z"/>', mx:288, my:214, tx:266, ty:214}
  }
},

/* ───────── فرنچ پرس ───────── */
press: {
  order: ['beaker', 'space', 'mesh', 'plunger', 'lid'],
  art: `
  <ellipse cx="158" cy="246" rx="96" ry="6" fill="#000" opacity=".16"/>
  <path d="M96 70 V224 M212 70 V224" stroke="#8d9094" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M96 70 V224 M212 70 V224" stroke="#e6e8ea" stroke-width="2" fill="none" opacity=".7"/>
  <path class="ol" d="M104 76 H204 V220 q0 6 -6 6 H110 q-6 0 -6 -6 Z" fill="url(#wgGlass)"/>
  <path d="M106 96 H202 V220 q0 4 -4 4 H110 q-4 0 -4 -4 Z" fill="url(#wgBrew)"/>
  <path d="M106 96 q12 -5 24 0 t24 0 t24 0 t24 0" stroke="#e7b27a" stroke-width="1.4" fill="none" opacity=".85"/>
  <path d="M106 196 q24 -8 48 -2 t48 -2 V220 q0 4 -4 4 H110 q-4 0 -4 -4 Z" fill="url(#wgCoffee)"/>
  <g fill="#1d120b" opacity=".7"><circle cx="120" cy="208" r="1.4"/><circle cx="140" cy="214" r="1.4"/><circle cx="160" cy="206" r="1.4"/><circle cx="182" cy="212" r="1.4"/><circle cx="194" cy="204" r="1.4"/><circle cx="128" cy="218" r="1.2"/><circle cx="172" cy="219" r="1.2"/></g>
  <path d="M110 84 V214" stroke="#fff" stroke-width="2.4" opacity=".4"/>
  <path d="M196 84 V150" stroke="#fff" stroke-width="1.6" opacity=".25"/>
  <path class="ol" d="M94 226 H214 L224 240 H84 Z" fill="url(#wgSteel)"/>
  <path d="M94 226 H214" stroke="#fff" stroke-width="1.4" opacity=".6"/>
  <rect class="ol" x="155" y="34" width="10" height="116" rx="2" fill="url(#wgSteel)"/>
  <rect class="ol" x="106" y="146" width="96" height="10" rx="4" fill="url(#wgSteel)"/>
  <path d="M108 151 H200" stroke="#3a3d41" stroke-width="2.6" stroke-dasharray="1.4 1.8" opacity=".85"/>
  <rect class="ol" x="148" y="140" width="24" height="8" rx="3" fill="url(#wgSteel)"/>
  <path class="ol" d="M96 64 H212 Q212 76 204 78 H104 Q96 76 96 64 Z" fill="url(#wgSteel)"/>
  <path d="M102 67 H206" stroke="#fff" stroke-width="1.4" opacity=".6"/>
  <path class="ol" d="M96 64 L86 58 L98 72 Z" fill="url(#wgSteel)"/>
  <ellipse class="ol" cx="160" cy="28" rx="15" ry="13" fill="url(#wgDark)"/>
  <path d="M150 22 q6 -6 12 -3" stroke="#fff" stroke-width="2" opacity=".35" fill="none" stroke-linecap="round"/>
  <rect class="ol" x="154" y="38" width="12" height="8" rx="2" fill="url(#wgDark)"/>
  <path d="M212 96 C262 100 266 168 210 196" stroke="#1d1410" stroke-width="13" fill="none" stroke-linecap="round"/>
  <path d="M214 96 C256 102 260 162 212 190" stroke="#7a675b" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round"/>
  <rect class="ol" x="206" y="90" width="12" height="12" rx="3" fill="url(#wgSteel)"/><rect class="ol" x="204" y="190" width="12" height="12" rx="3" fill="url(#wgSteel)"/>
  <path d="M148 60 q-6 -10 0 -18 M172 60 q6 -10 0 -18" stroke="#e9e3da" stroke-width="1.4" fill="none" opacity=".55"/>
  `,
  hits: {
    beaker: {shape:'<path class="pt" d="M104 76 H204 V220 q0 6 -6 6 H110 q-6 0 -6 -6 Z"/>', mx:46, my:112, tx:104, ty:112},
    plunger:{shape:'<rect class="pt" x="154" y="34" width="12" height="108" rx="3"/><ellipse class="pt" cx="160" cy="28" rx="16" ry="14"/>', mx:274, my:34, tx:176, ty:30},
    lid:    {shape:'<path class="pt" d="M96 64 H212 Q212 76 204 78 H104 Q96 76 96 64 Z"/>', mx:46, my:66, tx:96, ty:68},
    mesh:   {shape:'<rect class="pt" x="104" y="144" width="100" height="14" rx="4"/>', mx:46, my:152, tx:104, ty:151},
    space:  {shape:'<rect class="pt" x="108" y="160" width="92" height="62" rx="4"/>', mx:46, my:200, tx:108, ty:200}
  }
},

/* ───────── ایروپرس ───────── */
aero: {
  order: ['chamber', 'plunger', 'seal', 'cap', 'filter'],
  art: `
  <ellipse cx="160" cy="248" rx="110" ry="6" fill="#000" opacity=".16"/>
  <rect class="ol" x="136" y="30" width="48" height="76" rx="4" fill="url(#wgGlass)"/>
  <path d="M142 34 V100 M178 34 V100" stroke="#fff" stroke-width="1.6" opacity=".4"/>
  <rect class="ol" x="126" y="20" width="68" height="12" rx="5" fill="url(#wgDark)"/>
  <path d="M132 24 H188" stroke="#fff" stroke-width="1.2" opacity=".3"/>
  <path class="ol" d="M122 82 H198 V170 H122 Z" fill="url(#wgGlass)"/>
  <path d="M123 126 H197 V169 H123 Z" fill="url(#wgBrew)"/>
  <path d="M123 126 q9 -4 18 0 t18 0 t18 0 t18 0" stroke="#e7b27a" stroke-width="1.3" fill="none" opacity=".9"/>
  <g fill="#e9c9a4" opacity=".6"><circle cx="140" cy="140" r="1.3"/><circle cx="166" cy="150" r="1.1"/><circle cx="182" cy="136" r="1.2"/></g>
  <path d="M126 84 V166" stroke="#fff" stroke-width="2.4" opacity=".4"/>
  <g stroke="#3a3d41" stroke-width="1.2" opacity=".75"><path d="M186 102 h10 M186 116 h10 M186 130 h10 M186 144 h10"/></g>
  <rect class="ol" x="134" y="96" width="52" height="14" rx="4" fill="url(#wgRubber)"/>
  <path d="M138 100 H182" stroke="#fff" stroke-width="1.2" opacity=".3"/>
  <rect class="ol" x="110" y="166" width="100" height="10" rx="4" fill="url(#wgDark)"/>
  <path class="ol" d="M116 176 H204 L200 198 H120 Z" fill="url(#wgDark)"/>
  <g stroke="#8a7a70" stroke-width="1.2" opacity=".8"><path d="M130 180 V196 M140 180 V196 M150 180 V196 M160 180 V196 M170 180 V196 M180 180 V196 M190 180 V196"/></g>
  <rect class="ol" x="126" y="198" width="68" height="5" rx="2" fill="#f4ecdd"/>
  <path d="M130 200.5 H190" stroke="#c9b697" stroke-width="1" stroke-dasharray="2 2"/>
  <path d="M148 206 q2 6 0 10 M166 206 q2 8 0 14 M180 206 q2 5 0 9" stroke="#9a5a2c" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <path class="ol" d="M102 204 H218 L212 246 H108 Z" fill="url(#wgGlass)"/>
  <path d="M110 230 H210 L208 244 q0 2 -3 2 H113 q-3 0 -3 -2 Z" fill="url(#wgBrew)"/>
  <path d="M110 230 q10 -4 20 0 t20 0 t20 0 t20 0 t10 0" stroke="#e7b27a" stroke-width="1.3" fill="none" opacity=".9"/>
  <path d="M218 214 C252 214 252 240 214 240" stroke="#ffffff" stroke-width="9" fill="none" opacity=".35" stroke-linecap="round"/>
  <path d="M218 214 C252 214 252 240 214 240" class="ol" stroke-width="1.2" fill="none"/>
  <path d="M112 208 V240" stroke="#fff" stroke-width="2.4" opacity=".4"/>
  <path d="M148 62 q-6 -9 0 -16 M172 62 q6 -9 0 -16" stroke="#e9e3da" stroke-width="1.3" fill="none" opacity=".5"/>
  `,
  hits: {
    plunger: {shape:'<rect class="pt" x="124" y="18" width="72" height="80" rx="5"/>', mx:44, my:48, tx:126, ty:54},
    seal:    {shape:'<rect class="pt" x="132" y="94" width="56" height="18" rx="5"/>', mx:44, my:100, tx:132, ty:103},
    chamber: {shape:'<rect class="pt" x="120" y="112" width="80" height="58"/>', mx:44, my:146, tx:120, ty:144},
    cap:     {shape:'<path class="pt" d="M108 165 H212 V176 H204 L200 199 H120 L116 176 H108 Z"/>', mx:284, my:176, tx:206, ty:182},
    filter:  {shape:'<rect class="pt" x="124" y="197" width="72" height="8" rx="2"/>', mx:44, my:206, tx:124, ty:201}
  }
}
};

/* ادغام: شکل قطعه‌ها از اینجا می‌آید، متن از wrench.data.js */
WRENCH.forEach(w => {
  const a = WRENCH_ART[w.id];
  if (!a) return;
  w.art = a.art;
  w.order = a.order;
  w.parts.forEach(p => { const h = a.hits[p.id]; if (h) Object.assign(p, h); });
});
