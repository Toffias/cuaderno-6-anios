(async function () {
  let DATA = window.ALBUM_DATA;
  try {
    const res = await fetch('/api/album', { cache: 'no-store' });
    if (res.ok) {
      const liveData = await res.json();
      if (liveData && liveData.meta && Array.isArray(liveData.chapters)) {
        DATA = liveData;
      }
    }
  } catch {
    // Fallback automático a album-data.js si se abre como archivo local sin servidor
  }

  // =========================================================================
  // 1. FALLBACK ILLUSTRATED SCENES (used while user hasn't set imageSrc)
  // =========================================================================
  const SCENES = {
    coffee: `<svg viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sc1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f6d5b0"/><stop offset="100%" stop-color="#d4957a"/></linearGradient></defs><rect width="320" height="240" fill="url(#sc1)"/><circle cx="255" cy="54" r="36" fill="#fff3d6" opacity="0.55"/><ellipse cx="160" cy="195" rx="130" ry="30" fill="#8b5a42" opacity="0.32"/><rect x="75" y="130" width="62" height="52" rx="12" fill="#fffaf2"/><path d="M137 142 q16 0 16 14 t-16 14" fill="none" stroke="#fffaf2" stroke-width="6"/><rect x="176" y="138" width="58" height="46" rx="12" fill="#f7e3d4"/><path d="M234 148 q14 0 14 12 t-14 12" fill="none" stroke="#f7e3d4" stroke-width="6"/><path d="M160 88 c-6-10 -20-6 -20 4 c0 10 20 20 20 20 s20-10 20-20 c0-10 -14-14 -20-4z" fill="#c45c50" opacity="0.82"/></svg>`,
    beach: `<svg viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sc2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e89a78"/><stop offset="56%" stop-color="#f7c896"/><stop offset="100%" stop-color="#f4e0b9"/></linearGradient></defs><rect width="320" height="240" fill="url(#sc2)"/><circle cx="160" cy="128" r="38" fill="#fff4d2"/><rect y="140" width="320" height="52" fill="#5e879c" opacity="0.78"/><ellipse cx="160" cy="154" rx="50" ry="6" fill="#ffe6b5" opacity="0.7"/><path d="M0 190 Q90 178 180 192 T320 186 L320 240 L0 240 Z" fill="#e2be96"/><circle cx="145" cy="168" r="7" fill="#3a2d28"/><rect x="139" y="176" width="12" height="28" rx="5" fill="#3a2d28"/><circle cx="166" cy="171" r="6.5" fill="#3a2d28"/><rect x="160" y="178" width="12" height="26" rx="5" fill="#3a2d28"/></svg>`,
    mountains: `<svg viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sc3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#202a44"/><stop offset="65%" stop-color="#4c4f7a"/><stop offset="100%" stop-color="#b68a91"/></linearGradient></defs><rect width="320" height="240" fill="url(#sc3)"/><circle cx="66" cy="48" r="18" fill="#fff4d6" opacity="0.9"/><circle cx="135" cy="36" r="2" fill="#fff"/><circle cx="215" cy="52" r="2.2" fill="#fff"/><circle cx="268" cy="32" r="1.8" fill="#fff"/><polygon points="0,200 95,95 190,200" fill="#2e3552"/><polygon points="115,205 225,82 320,205" fill="#212842"/><polygon points="225,82 200,112 222,106 238,116 250,110" fill="#f7f1e8" opacity="0.85"/><rect y="196" width="320" height="44" fill="#182033"/><polygon points="142,202 162,175 182,202" fill="#f3b668"/><circle cx="162" cy="196" r="14" fill="#ffdf9e" opacity="0.35"/></svg>`,
    home: `<svg viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sc4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#453643"/><stop offset="100%" stop-color="#261f29"/></linearGradient></defs><rect width="320" height="240" fill="url(#sc4)"/><rect x="64" y="42" width="192" height="122" rx="10" fill="#1d2233" stroke="#d8c3a5" stroke-width="6"/><line x1="160" y1="42" x2="160" y2="164" stroke="#d8c3a5" stroke-width="4"/><path d="M25 22 Q160 72 295 22" fill="none" stroke="#f7d794" stroke-width="1.5" opacity="0.7"/><circle cx="72" cy="37" r="5" fill="#ffdf8e"/><circle cx="120" cy="46" r="5" fill="#ffdf8e"/><circle cx="165" cy="48" r="5" fill="#ffdf8e"/><circle cx="212" cy="44" r="5" fill="#ffdf8e"/><circle cx="255" cy="34" r="5" fill="#ffdf8e"/><rect x="92" y="176" width="136" height="48" rx="14" fill="#c47a6d"/></svg>`,
    dinner: `<svg viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sc5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2a1d28"/><stop offset="100%" stop-color="#613640"/></linearGradient></defs><rect width="320" height="240" fill="url(#sc5)"/><circle cx="160" cy="120" r="78" fill="#ffb870" opacity="0.16"/><rect x="153" y="122" width="14" height="50" rx="3" fill="#fff7e6"/><ellipse cx="160" cy="112" rx="6" ry="11" fill="#ffcf6e"/><path d="M98 178 L112 135 L126 178" fill="none" stroke="#fff3e2" stroke-width="2.5"/><ellipse cx="112" cy="135" rx="14" ry="8" fill="#a8324a" opacity="0.85"/><path d="M194 178 L208 135 L222 178" fill="none" stroke="#fff3e2" stroke-width="2.5"/><ellipse cx="208" cy="135" rx="14" ry="8" fill="#a8324a" opacity="0.85"/><rect y="182" width="320" height="58" fill="#3b2027"/></svg>`,
    autumn: `<svg viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sc6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f3c694"/><stop offset="100%" stop-color="#c97156"/></linearGradient></defs><rect width="320" height="240" fill="url(#sc6)"/><circle cx="220" cy="74" r="36" fill="#fff0cc" opacity="0.65"/><path d="M122 240 L150 142 L170 142 L198 240 Z" fill="#8b4d3b"/><circle cx="78" cy="120" r="48" fill="#d96b43" opacity="0.86"/><circle cx="246" cy="116" r="52" fill="#b84a39" opacity="0.86"/></svg>`,
    roadtrip: `<svg viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sc7" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e59a7a"/><stop offset="60%" stop-color="#f5ce9b"/><stop offset="100%" stop-color="#c49a76"/></linearGradient></defs><rect width="320" height="240" fill="url(#sc7)"/><circle cx="160" cy="112" r="34" fill="#fff6d6"/><path d="M0 155 Q110 120 200 148 T320 138 L320 240 L0 240 Z" fill="#8e6c5a"/><path d="M115 240 L152 146 L168 146 L205 240 Z" fill="#3e3536"/><line x1="160" y1="152" x2="160" y2="236" stroke="#f7df9e" stroke-width="3" stroke-dasharray="10 10"/></svg>`
  };

  // =========================================================================
  // 1B. SCRAPBOOK STUDIO CATALOG (Recortes, Dibujos, Stickers & Guirnaldas)
  // =========================================================================
  const DECOR_CATALOG = [
    // ---------- RECORTES DE DIARIOS, REVISTAS Y FOLLETOS ----------
    {
      type: 'news-clip',
      name: 'Recorte de diario',
      cat: 'recortes',
      width: 196,
      editableKind: 'news',
      defaultText: 'EDICIÓN ESPECIAL: 6 AÑOS DE AMOR',
      svg: `<svg viewBox="0 0 180 86" xmlns="http://www.w3.org/2000/svg">
        <polygon points="4,4 176,2 174,82 2,84" fill="#ede6d6" stroke="#c8bba5" stroke-width="1.5"/>
        <line x1="16" y1="18" x2="164" y2="18" stroke="#6f6357" stroke-width="1.5"/>
        <text x="90" y="38" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="700" fill="#2c241f">EDICIÓN ESPECIAL</text>
        <text x="90" y="54" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#4f433a">6 Años de Amor</text>
        <line x1="22" y1="66" x2="158" y2="66" stroke="#9e9182" stroke-width="2" stroke-dasharray="18 6"/>
        <line x1="28" y1="74" x2="150" y2="74" stroke="#b5a898" stroke-width="2" stroke-dasharray="22 8"/>
      </svg>`
    },
    {
      type: 'mag-juntos',
      name: 'Revista "JUNTOS"',
      cat: 'recortes',
      width: 175,
      svg: `<svg viewBox="0 0 198 54" xmlns="http://www.w3.org/2000/svg">
        <g font-weight="800" text-anchor="middle">
          <rect x="4" y="8" width="28" height="36" fill="#d46457" transform="rotate(-5 18 26)"/><text x="18" y="34" font-family="Georgia,serif" font-size="22" fill="#fff8ef" transform="rotate(-5 18 26)">J</text>
          <rect x="35" y="10" width="28" height="34" fill="#2b2421" transform="rotate(4 49 27)"/><text x="49" y="34" font-family="sans-serif" font-size="21" fill="#f7e3bc" transform="rotate(4 49 27)">U</text>
          <rect x="66" y="7" width="30" height="38" fill="#ebd6ad" transform="rotate(-3 81 26)"/><text x="81" y="34" font-family="Georgia,serif" font-size="22" fill="#3b261d" transform="rotate(-3 81 26)">N</text>
          <rect x="99" y="10" width="27" height="34" fill="#7d9a7b" transform="rotate(5 112 27)"/><text x="112" y="34" font-family="sans-serif" font-size="21" fill="#fff" transform="rotate(5 112 27)">T</text>
          <rect x="129" y="8" width="29" height="36" fill="#e6a6ae" transform="rotate(-4 143 26)"/><text x="143" y="34" font-family="Georgia,serif" font-size="22" fill="#461e24" transform="rotate(-4 143 26)">O</text>
          <rect x="161" y="10" width="28" height="34" fill="#433742" transform="rotate(3 175 27)"/><text x="175" y="34" font-family="sans-serif" font-size="21" fill="#ffd991" transform="rotate(3 175 27)">S</text>
        </g>
      </svg>`
    },
    {
      type: 'mag-siempre',
      name: 'Revista "SIEMPRE"',
      cat: 'recortes',
      width: 192,
      svg: `<svg viewBox="0 0 222 52" xmlns="http://www.w3.org/2000/svg">
        <g font-weight="800" text-anchor="middle">
          <rect x="4" y="8" width="27" height="34" fill="#402d2a" transform="rotate(-4 17 25)"/><text x="17" y="32" font-family="Georgia,serif" font-size="20" fill="#fce7c2" transform="rotate(-4 17 25)">S</text>
          <rect x="33" y="10" width="22" height="32" fill="#e6a593" transform="rotate(5 44 26)"/><text x="44" y="33" font-family="sans-serif" font-size="20" fill="#381d18" transform="rotate(5 44 26)">I</text>
          <rect x="57" y="7" width="28" height="36" fill="#f3e4c6" transform="rotate(-2 71 25)"/><text x="71" y="33" font-family="Georgia,serif" font-size="20" fill="#8f3f34" transform="rotate(-2 71 25)">E</text>
          <rect x="87" y="9" width="32" height="34" fill="#c45c50" transform="rotate(3 103 26)"/><text x="103" y="33" font-family="sans-serif" font-size="19" fill="#fff" transform="rotate(3 103 26)">M</text>
          <rect x="121" y="7" width="28" height="35" fill="#8ea68d" transform="rotate(-4 135 25)"/><text x="135" y="32" font-family="Georgia,serif" font-size="20" fill="#fffdf8" transform="rotate(-4 135 25)">P</text>
          <rect x="151" y="10" width="29" height="33" fill="#2c2427" transform="rotate(4 165 26)"/><text x="165" y="33" font-family="sans-serif" font-size="20" fill="#f4cb80" transform="rotate(4 165 26)">R</text>
          <rect x="182" y="8" width="29" height="35" fill="#e8bcc2" transform="rotate(-3 196 25)"/><text x="196" y="33" font-family="Georgia,serif" font-size="20" fill="#4a2028" transform="rotate(-3 196 25)">E</text>
        </g>
      </svg>`
    },
    {
      type: 'mag-teamo',
      name: 'Revista "TE AMO"',
      cat: 'recortes',
      width: 174,
      svg: `<svg viewBox="0 0 194 52" xmlns="http://www.w3.org/2000/svg">
        <g font-weight="800" text-anchor="middle">
          <rect x="4" y="8" width="27" height="35" fill="#c45c50" transform="rotate(-4 17 25)"/><text x="17" y="33" font-family="Georgia,serif" font-size="21" fill="#fff" transform="rotate(-4 17 25)">T</text>
          <rect x="33" y="9" width="27" height="34" fill="#f3dfc0" transform="rotate(4 46 26)"/><text x="46" y="33" font-family="sans-serif" font-size="20" fill="#452820" transform="rotate(4 46 26)">E</text>
          <rect x="74" y="7" width="29" height="36" fill="#2e2427" transform="rotate(-3 88 25)"/><text x="88" y="33" font-family="Georgia,serif" font-size="21" fill="#f7d694" transform="rotate(-3 88 25)">A</text>
          <rect x="106" y="9" width="33" height="34" fill="#e8a6ae" transform="rotate(3 122 26)"/><text x="122" y="33" font-family="sans-serif" font-size="19" fill="#4a1f28" transform="rotate(3 122 26)">M</text>
          <rect x="142" y="8" width="29" height="35" fill="#829e7e" transform="rotate(-5 156 25)"/><text x="156" y="33" font-family="Georgia,serif" font-size="21" fill="#fff" transform="rotate(-5 156 25)">O</text>
        </g>
      </svg>`
    },
    {
      type: 'boarding-pass',
      name: 'Folleto / Pasaje',
      cat: 'recortes',
      width: 178,
      svg: `<svg viewBox="0 0 210 86" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="204" height="78" rx="8" fill="#fbf5e9" stroke="#bfa88c" stroke-width="2"/>
        <rect x="3" y="4" width="204" height="20" rx="8" fill="#c46455"/>
        <text x="16" y="18" font-family="sans-serif" font-size="9" font-weight="700" letter-spacing="1.5" fill="#fff">BOARDING PASS · NUESTRO VIAJE</text>
        <line x1="152" y1="26" x2="152" y2="80" stroke="#c8b69e" stroke-width="1.5" stroke-dasharray="4 3"/>
        <text x="16" y="46" font-family="Georgia,serif" font-size="16" font-weight="700" fill="#362822">2020 ✈ 2026</text>
        <text x="16" y="64" font-family="sans-serif" font-size="9.5" fill="#7a6458">DESTINO: SIEMPRE CON VOS</text>
        <text x="180" y="52" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-weight="700" fill="#c46455">06</text>
        <text x="180" y="66" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#7a6458">AÑOS</text>
      </svg>`
    },
    {
      type: 'ticket',
      name: 'Entrada de cine',
      cat: 'recortes',
      width: 146,
      svg: `<svg viewBox="0 0 164 74" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 8 H154 V27 A10 10 0 0 0 154 47 V66 H10 V47 A10 10 0 0 0 10 27 Z" fill="#f5dfb9" stroke="#b98a52" stroke-width="2"/>
        <line x1="38" y1="12" x2="38" y2="62" stroke="#b98a52" stroke-width="1.5" stroke-dasharray="4 3"/>
        <text x="96" y="33" text-anchor="middle" font-family="Georgia,serif" font-size="12.5" font-weight="700" fill="#5e3e27">ADMIT TWO</text>
        <text x="96" y="50" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="700" fill="#b84f42">NUESTRA PELI ♥</text>
        <text x="24" y="41" text-anchor="middle" font-family="monospace" font-size="10" fill="#7d5a3b">06</text>
      </svg>`
    },
    {
      type: 'kraft-note',
      name: 'Papel Kraft rasgado',
      cat: 'recortes',
      width: 175,
      editableKind: 'kraft',
      defaultText: 'Un recorte lindo para escribir o poner atrás de una foto ♥',
      svg: `<svg viewBox="0 0 150 90" xmlns="http://www.w3.org/2000/svg">
        <polygon points="8,6 142,4 146,35 141,84 85,86 12,83 5,45" fill="#cba67d" stroke="#b08b62" stroke-width="1.5"/>
        <line x1="24" y1="32" x2="124" y2="32" stroke="#6f5034" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
        <line x1="24" y1="48" x2="110" y2="48" stroke="#6f5034" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
        <line x1="24" y1="64" x2="90" y2="64" stroke="#6f5034" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
      </svg>`
    },
    {
      type: 'lined-scrap',
      name: 'Hoja arrancada',
      cat: 'recortes',
      width: 186,
      editableKind: 'lined',
      defaultText: 'Anotación secreta de este capítulo...',
      svg: `<svg viewBox="0 0 150 90" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="6" width="134" height="78" rx="3" fill="#fffdf6" stroke="#d8cbb8" stroke-width="1.5"/>
        <line x1="26" y1="6" x2="26" y2="84" stroke="#d67872" stroke-width="1.5" opacity="0.6"/>
        <line x1="8" y1="26" x2="142" y2="26" stroke="#8fb3d4" stroke-width="1" opacity="0.55"/>
        <line x1="8" y1="44" x2="142" y2="44" stroke="#8fb3d4" stroke-width="1" opacity="0.55"/>
        <line x1="8" y1="62" x2="142" y2="62" stroke="#8fb3d4" stroke-width="1" opacity="0.55"/>
      </svg>`
    },
    {
      type: 'stamp-6',
      name: 'Sello 6 Años',
      cat: 'recortes',
      width: 102,
      svg: `<svg viewBox="0 0 116 96" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="104" height="84" rx="4" fill="#fff8ec" stroke="#c46455" stroke-width="3" stroke-dasharray="6 4"/>
        <rect x="14" y="14" width="88" height="68" fill="#faebd9" stroke="#c46455" stroke-width="1.2"/>
        <text x="58" y="47" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#a84438">6 AÑOS</text>
        <text x="58" y="67" text-anchor="middle" font-family="sans-serif" font-size="11" letter-spacing="2" fill="#c46455">♥ JUNTOS ♥</text>
      </svg>`
    },

    // ---------- ANIMALITOS TIERNOS ----------
    {
      type: 'animal-cat',
      name: 'Gatito tierno',
      cat: 'animalitos',
      width: 92,
      svg: `<svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 44 L20 16 L44 30 Z" fill="#f4d7b7" stroke="#4d3b32" stroke-width="2.6" stroke-linejoin="round"/>
        <path d="M86 44 L90 16 L66 30 Z" fill="#f4d7b7" stroke="#4d3b32" stroke-width="2.6" stroke-linejoin="round"/>
        <path d="M26 37 L24 23 L38 31 Z" fill="#ebaba8"/><path d="M84 37 L86 23 L72 31 Z" fill="#ebaba8"/>
        <ellipse cx="55" cy="60" rx="35" ry="30" fill="#f8e3ca" stroke="#4d3b32" stroke-width="2.6"/>
        <circle cx="42" cy="56" r="3.4" fill="#3a2a23"/><circle cx="68" cy="56" r="3.4" fill="#3a2a23"/>
        <ellipse cx="34" cy="64" rx="5" ry="3" fill="#e89a95" opacity="0.65"/><ellipse cx="76" cy="64" rx="5" ry="3" fill="#e89a95" opacity="0.65"/>
        <polygon points="55,61 51,66 59,66" fill="#d97b74"/>
        <path d="M47 70 Q51 74 55 70 Q59 74 63 70" fill="none" stroke="#4d3b32" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M12 58 L28 60 M14 66 L28 65 M82 60 L98 58 M82 65 L96 66" stroke="#4d3b32" stroke-width="1.8" stroke-linecap="round"/>
      </svg>`
    },
    {
      type: 'animal-dog',
      name: 'Perrito feliz',
      cat: 'animalitos',
      width: 96,
      svg: `<svg viewBox="0 0 114 108" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="56" rx="13" ry="24" fill="#c99368" stroke="#4a372c" stroke-width="2.6" transform="rotate(14 22 56)"/>
        <ellipse cx="92" cy="56" rx="13" ry="24" fill="#c99368" stroke="#4a372c" stroke-width="2.6" transform="rotate(-14 92 56)"/>
        <ellipse cx="57" cy="58" rx="34" ry="31" fill="#e7be95" stroke="#4a372c" stroke-width="2.6"/>
        <ellipse cx="57" cy="68" rx="17" ry="13" fill="#fbf0e2"/>
        <circle cx="43" cy="52" r="3.6" fill="#35261f"/><circle cx="71" cy="52" r="3.6" fill="#35261f"/>
        <ellipse cx="57" cy="63" rx="6" ry="4.5" fill="#4a372c"/>
        <path d="M49 72 Q57 79 65 72" fill="none" stroke="#4a372c" stroke-width="2.3" stroke-linecap="round"/>
        <ellipse cx="57" cy="77" rx="4.5" ry="5" fill="#e07c76"/>
      </svg>`
    },
    {
      type: 'animal-bunny',
      name: 'Conejito',
      cat: 'animalitos',
      width: 84,
      svg: `<svg viewBox="0 0 100 124" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="36" cy="34" rx="10" ry="28" fill="#fffaf2" stroke="#53423a" stroke-width="2.5" transform="rotate(-8 36 34)"/>
        <ellipse cx="64" cy="34" rx="10" ry="28" fill="#fffaf2" stroke="#53423a" stroke-width="2.5" transform="rotate(8 64 34)"/>
        <ellipse cx="36" cy="35" rx="5" ry="18" fill="#f2b8b6" transform="rotate(-8 36 35)"/>
        <ellipse cx="64" cy="35" rx="5" ry="18" fill="#f2b8b6" transform="rotate(8 64 35)"/>
        <ellipse cx="50" cy="80" rx="32" ry="28" fill="#fffaf2" stroke="#53423a" stroke-width="2.5"/>
        <circle cx="38" cy="76" r="3.2" fill="#3c2d26"/><circle cx="62" cy="76" r="3.2" fill="#3c2d26"/>
        <ellipse cx="30" cy="84" rx="5" ry="3" fill="#f0a6a4" opacity="0.7"/><ellipse cx="70" cy="84" rx="5" ry="3" fill="#f0a6a4" opacity="0.7"/>
        <path d="M46 84 Q50 88 54 84" fill="none" stroke="#53423a" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="50" cy="81" r="2.6" fill="#d97b74"/>
      </svg>`
    },
    {
      type: 'animal-bear',
      name: 'Osito con corazón',
      cat: 'animalitos',
      width: 92,
      svg: `<svg viewBox="0 0 110 116" xmlns="http://www.w3.org/2000/svg">
        <circle cx="28" cy="28" r="13" fill="#be8c67" stroke="#4d372a" stroke-width="2.5"/>
        <circle cx="82" cy="28" r="13" fill="#be8c67" stroke="#4d372a" stroke-width="2.5"/>
        <circle cx="28" cy="28" r="6" fill="#e5c1a3"/><circle cx="82" cy="28" r="6" fill="#e5c1a3"/>
        <ellipse cx="55" cy="54" rx="33" ry="30" fill="#ca9a75" stroke="#4d372a" stroke-width="2.5"/>
        <ellipse cx="55" cy="62" rx="14" ry="10" fill="#f3dfc9"/>
        <circle cx="43" cy="49" r="3.2" fill="#36251c"/><circle cx="67" cy="49" r="3.2" fill="#36251c"/>
        <ellipse cx="55" cy="59" rx="4.5" ry="3.2" fill="#4d372a"/>
        <path d="M55 86 c-6-10 -20-6 -20 4 c0 10 20 20 20 20 s20-10 20-20 c0-10 -14-14 -20-4z" fill="#d45e53" stroke="#4d372a" stroke-width="2"/>
      </svg>`
    },
    {
      type: 'animal-birds',
      name: 'Pajaritos enamorados',
      cat: 'animalitos',
      width: 118,
      svg: `<svg viewBox="0 0 140 90" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 74 Q70 68 128 74" fill="none" stroke="#6f5343" stroke-width="3.5" stroke-linecap="round"/>
        <ellipse cx="44" cy="52" rx="20" ry="15" fill="#9eb9c4" stroke="#44352e" stroke-width="2.2"/>
        <polygon points="62,48 70,51 62,55" fill="#e5a654"/>
        <circle cx="52" cy="47" r="2.2" fill="#2c221d"/>
        <ellipse cx="96" cy="52" rx="20" ry="15" fill="#e6a6a1" stroke="#44352e" stroke-width="2.2"/>
        <polygon points="78,48 70,51 78,55" fill="#e5a654"/>
        <circle cx="88" cy="47" r="2.2" fill="#2c221d"/>
        <path d="M70 20 c-4-7 -13-4 -13 3 c0 7 13 13 13 13 s13-6 13-13 c0-7 -9-10 -13-3z" fill="#d15f55"/>
      </svg>`
    },
    {
      type: 'doodle-butterfly',
      name: 'Mariposa tinta',
      cat: 'animalitos',
      width: 92,
      svg: `<svg viewBox="0 0 116 90" xmlns="http://www.w3.org/2000/svg">
        <path d="M58 42 C42 12 10 14 16 42 C20 56 42 54 58 46" fill="#f2cbbd" stroke="#4c3930" stroke-width="2.4"/>
        <path d="M58 42 C74 12 106 14 100 42 C96 56 74 54 58 46" fill="#f2cbbd" stroke="#4c3930" stroke-width="2.4"/>
        <path d="M58 48 C44 52 24 64 34 76 C44 84 56 68 58 54" fill="#f6dfb8" stroke="#4c3930" stroke-width="2.4"/>
        <path d="M58 48 C72 52 92 64 82 76 C72 84 60 68 58 54" fill="#f6dfb8" stroke="#4c3930" stroke-width="2.4"/>
        <line x1="58" y1="28" x2="58" y2="66" stroke="#4c3930" stroke-width="3" stroke-linecap="round"/>
        <path d="M58 28 Q50 16 44 18 M58 28 Q66 16 72 18" fill="none" stroke="#4c3930" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    },
    {
      type: 'animal-bee',
      name: 'Abejita tierna',
      cat: 'animalitos',
      width: 102,
      svg: `<svg viewBox="0 0 124 84" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 62 Q28 42 42 56 T68 48" fill="none" stroke="#856e62" stroke-width="2" stroke-dasharray="4 4"/>
        <ellipse cx="86" cy="28" rx="10" ry="14" fill="#eef6fa" stroke="#4b3a30" stroke-width="2" transform="rotate(-18 86 28)"/>
        <ellipse cx="96" cy="30" rx="9" ry="13" fill="#eef6fa" stroke="#4b3a30" stroke-width="2" transform="rotate(14 96 30)"/>
        <ellipse cx="90" cy="48" rx="22" ry="15" fill="#f4cb5e" stroke="#4b3a30" stroke-width="2.4"/>
        <line x1="82" y1="34" x2="82" y2="62" stroke="#4b3a30" stroke-width="4.5"/>
        <line x1="94" y1="34" x2="94" y2="62" stroke="#4b3a30" stroke-width="4.5"/>
        <circle cx="104" cy="45" r="2.3" fill="#2c211b"/>
      </svg>`
    },

    // ---------- SEÑALES, FLECHAS Y MARCADORES ----------
    {
      type: 'doodle-arrow',
      name: 'Flecha curva',
      cat: 'senales',
      width: 108,
      svg: `<svg viewBox="0 0 130 72" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 52 Q52 8 112 34" fill="none" stroke="#46352e" stroke-width="3" stroke-linecap="round"/>
        <path d="M98 20 L114 35 L95 44" fill="none" stroke="#46352e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    {
      type: 'sign-arrow-heart',
      name: 'Flecha con corazón',
      cat: 'senales',
      width: 126,
      svg: `<svg viewBox="0 0 150 56" xmlns="http://www.w3.org/2000/svg">
        <line x1="16" y1="28" x2="128" y2="28" stroke="#c45c50" stroke-width="3" stroke-linecap="round"/>
        <path d="M10 18 L24 28 L10 38 M22 18 L36 28 L22 38" fill="none" stroke="#c45c50" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M128 20 c-4-6 -12-4 -12 3 c0 6 12 13 12 13 s12-7 12-13 c0-7 -8-9 -12-3z" fill="#c45c50"/>
      </svg>`
    },
    {
      type: 'sign-pin',
      name: 'Pin de mapa ♥',
      cat: 'senales',
      width: 68,
      svg: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 94 C40 94 70 60 70 38 A30 30 0 1 0 10 38 C10 60 40 94 40 94 Z" fill="#c96052" stroke="#532620" stroke-width="2.6"/>
        <circle cx="40" cy="37" r="15" fill="#fff7ec"/>
        <path d="M40 33 c-2.5-4.5 -8.5-2.5 -8.5 2 c0 4.5 8.5 9.5 8.5 9.5 s8.5-5 8.5-9.5 c0-4.5 -6-6.5 -8.5-2z" fill="#c96052"/>
      </svg>`
    },
    {
      type: 'sign-here',
      name: 'Cartel "AQUÍ ♥"',
      cat: 'senales',
      width: 112,
      svg: `<svg viewBox="0 0 134 62" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 10 H102 L124 31 L102 52 H8 Z" fill="#f4dcb0" stroke="#7d5938" stroke-width="2.4" stroke-linejoin="round"/>
        <circle cx="22" cy="31" r="4" fill="#c46455"/>
        <text x="64" y="37" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="800" letter-spacing="1.5" fill="#4f3524">AQUÍ ♥</text>
      </svg>`
    },
    {
      type: 'sign-fav',
      name: 'Sello FAVORITO',
      cat: 'senales',
      width: 114,
      svg: `<svg viewBox="0 0 132 54" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="124" height="46" rx="8" fill="#fff6e6" stroke="#c99546" stroke-width="2.6"/>
        <rect x="9" y="9" width="114" height="36" rx="5" fill="none" stroke="#c99546" stroke-width="1.2" stroke-dasharray="4 3"/>
        <text x="66" y="32" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="800" letter-spacing="1.4" fill="#9c641f">★ FAVORITO ★</text>
      </svg>`
    },
    {
      type: 'sign-secret',
      name: 'Sello TOP SECRET',
      cat: 'senales',
      width: 120,
      svg: `<svg viewBox="0 0 144 54" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="136" height="46" rx="6" fill="none" stroke="#b8423a" stroke-width="3"/>
        <rect x="9" y="9" width="126" height="36" rx="3" fill="rgba(184,66,58,0.08)" stroke="#b8423a" stroke-width="1"/>
        <text x="72" y="33" text-anchor="middle" font-family="monospace" font-size="15" font-weight="800" letter-spacing="1.8" fill="#b8423a">TOP SECRET</text>
      </svg>`
    },
    {
      type: 'sign-road',
      name: 'Señal de ruta 06',
      cat: 'senales',
      width: 82,
      svg: `<svg viewBox="0 0 94 98" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 14 Q47 4 82 14 V56 Q82 82 47 92 Q12 82 12 56 Z" fill="#fffaf0" stroke="#3b302b" stroke-width="3.2"/>
        <line x1="14" y1="34" x2="80" y2="34" stroke="#3b302b" stroke-width="2.4"/>
        <text x="47" y="27" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="800" letter-spacing="1.5" fill="#c45c50">RUTA</text>
        <text x="47" y="70" text-anchor="middle" font-family="Georgia,serif" font-size="32" font-weight="700" fill="#3b302b">06</text>
      </svg>`
    },

    // ---------- DIBUJOS HECHOS A MANO ----------
    {
      type: 'doodle-camera',
      name: 'Cámara dibujada',
      cat: 'dibujos',
      width: 96,
      svg: `<svg viewBox="0 0 110 94" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="24" width="86" height="58" rx="12" fill="#fdf6eb" stroke="#4a3931" stroke-width="3"/>
        <path d="M32 24 L40 12 H70 L78 24" fill="#f4dfc8" stroke="#4a3931" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="55" cy="53" r="18" fill="#f7e8d8" stroke="#4a3931" stroke-width="3"/>
        <circle cx="55" cy="53" r="9" fill="#d47264" opacity="0.8"/>
        <circle cx="82" cy="36" r="4" fill="#e2b45a"/>
      </svg>`
    },
    {
      type: 'doodle-flower',
      name: 'Flor a trazo',
      cat: 'dibujos',
      width: 88,
      svg: `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 112 Q46 76 52 44" fill="none" stroke="#4d3d35" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M49 82 Q28 74 26 60 Q42 62 49 78" fill="none" stroke="#4d3d35" stroke-width="2.2"/>
        <path d="M50 72 Q72 64 74 50 Q58 54 50 68" fill="none" stroke="#4d3d35" stroke-width="2.2"/>
        <g fill="#f6ddd4" stroke="#4d3d35" stroke-width="2.2">
          <ellipse cx="52" cy="24" rx="9" ry="13"/>
          <ellipse cx="36" cy="34" rx="12" ry="8" transform="rotate(-22 36 34)"/>
          <ellipse cx="68" cy="34" rx="12" ry="8" transform="rotate(22 68 34)"/>
          <ellipse cx="42" cy="48" rx="10" ry="8" transform="rotate(25 42 48)"/>
          <ellipse cx="62" cy="48" rx="10" ry="8" transform="rotate(-25 62 48)"/>
        </g>
        <circle cx="52" cy="37" r="6" fill="#e5b867" stroke="#4d3d35" stroke-width="2"/>
      </svg>`
    },
    {
      type: 'doodle-coffee',
      name: 'Tacita dibujada',
      cat: 'dibujos',
      width: 90,
      svg: `<svg viewBox="0 0 110 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 24 q-6 -10 3 -16 M56 22 q6 -10 -2 -16" fill="none" stroke="#856b5e" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M22 36 H76 V64 C76 78 64 86 49 86 C34 86 22 78 22 64 Z" fill="#fff7ec" stroke="#4a3830" stroke-width="3" stroke-linejoin="round"/>
        <path d="M76 44 C90 44 92 66 76 66" fill="none" stroke="#4a3830" stroke-width="3" stroke-linecap="round"/>
        <path d="M49 54 c-3-5 -10-3 -10 2 c0 5 10 10 10 10 s10-5 10-10 c0-5 -7-7 -10-2z" fill="#c96254"/>
      </svg>`
    },
    {
      type: 'doodle-mate',
      name: 'Matecito ♥',
      cat: 'dibujos',
      width: 82,
      svg: `<svg viewBox="0 0 100 116" xmlns="http://www.w3.org/2000/svg">
        <line x1="62" y1="42" x2="82" y2="12" stroke="#8c99a0" stroke-width="4.5" stroke-linecap="round"/>
        <ellipse cx="83" cy="11" rx="5" ry="2.6" fill="#b4bfc4" transform="rotate(-45 83 11)"/>
        <path d="M24 44 C18 68 24 94 50 96 C76 94 82 68 76 44 Z" fill="#b87c54" stroke="#4b3426" stroke-width="2.8" stroke-linejoin="round"/>
        <ellipse cx="50" cy="44" rx="26" ry="8" fill="#7c9c6b" stroke="#4b3426" stroke-width="2.6"/>
        <path d="M32 96 L28 106 H72 L68 96" fill="#8f5d3e" stroke="#4b3426" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M50 65 c-3-4.5 -9-2.5 -9 2 c0 4.5 9 9 9 9 s9-4.5 9-9 c0-4.5 -6-6.5 -9-2z" fill="#f7e6ce"/>
      </svg>`
    },
    {
      type: 'doodle-sunmoon',
      name: 'Sol & Luna',
      cat: 'dibujos',
      width: 102,
      svg: `<svg viewBox="0 0 120 82" xmlns="http://www.w3.org/2000/svg">
        <circle cx="38" cy="42" r="15" fill="#f5cc78" stroke="#4c3a30" stroke-width="2.4"/>
        <g stroke="#4c3a30" stroke-width="2.2" stroke-linecap="round">
          <line x1="38" y1="16" x2="38" y2="22"/><line x1="38" y1="62" x2="38" y2="68"/>
          <line x1="12" y1="42" x2="18" y2="42"/><line x1="58" y1="42" x2="64" y2="42"/>
          <line x1="20" y1="24" x2="24" y2="28"/><line x1="52" y1="56" x2="56" y2="60"/>
        </g>
        <path d="M92 22 A18 18 0 1 0 98 58 A14 14 0 1 1 92 22 Z" fill="#e8d6b3" stroke="#4c3a30" stroke-width="2.4" stroke-linejoin="round"/>
        <circle cx="104" cy="30" r="2.2" fill="#d9a54c"/>
      </svg>`
    },
    {
      type: 'doodle-vinyl',
      name: 'Disco de vinilo',
      cat: 'dibujos',
      width: 90,
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="44" fill="#2d2525" stroke="#181212" stroke-width="2"/>
        <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1.4"/>
        <circle cx="50" cy="50" r="26" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.2"/>
        <circle cx="50" cy="50" r="16" fill="#d4685c"/>
        <circle cx="50" cy="50" r="4.5" fill="#faf4e8"/>
      </svg>`
    },
    {
      type: 'doodle-plane',
      name: 'Avioncito de papel',
      cat: 'dibujos',
      width: 112,
      svg: `<svg viewBox="0 0 134 78" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 66 Q38 66 56 48" fill="none" stroke="#8c7568" stroke-width="2" stroke-dasharray="4 4"/>
        <polygon points="48,36 122,12 96,64 76,46" fill="#fffaf2" stroke="#4b3a30" stroke-width="2.4" stroke-linejoin="round"/>
        <polygon points="76,46 122,12 86,52" fill="#e9dcc8" stroke="#4b3a30" stroke-width="2" stroke-linejoin="round"/>
      </svg>`
    },

    // ---------- STICKERS & GUIRNALDAS ----------
    {
      type: 'fairy-lights',
      name: 'Guirnalda de luces',
      cat: 'stickers',
      width: 245,
      isGarland: true,
      svg: `<svg viewBox="0 0 260 66" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 12 Q70 46 130 22 T254 14" fill="none" stroke="#6c5649" stroke-width="2.2" stroke-linecap="round"/>
        <g>
          <circle cx="38" cy="28" r="11" fill="#ffd97d" opacity="0.32"/><circle cx="38" cy="28" r="5" fill="#fff0b3" stroke="#d9a148" stroke-width="1"/>
          <circle cx="82" cy="34" r="12" fill="#ffd97d" opacity="0.35"/><circle cx="82" cy="34" r="5.5" fill="#fff3c4" stroke="#d9a148" stroke-width="1"/>
          <circle cx="130" cy="24" r="11" fill="#ffcf70" opacity="0.34"/><circle cx="130" cy="24" r="5" fill="#fff0b3" stroke="#d9a148" stroke-width="1"/>
          <circle cx="178" cy="18" r="12" fill="#ffd97d" opacity="0.35"/><circle cx="178" cy="18" r="5.5" fill="#fff3c4" stroke="#d9a148" stroke-width="1"/>
          <circle cx="222" cy="22" r="11" fill="#ffd97d" opacity="0.32"/><circle cx="222" cy="22" r="5" fill="#fff0b3" stroke="#d9a148" stroke-width="1"/>
        </g>
      </svg>`
    },
    {
      type: 'bunting',
      name: 'Guirnalda banderines',
      cat: 'stickers',
      width: 235,
      isGarland: true,
      svg: `<svg viewBox="0 0 240 68" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 10 Q120 44 234 10" fill="none" stroke="#856b5d" stroke-width="2"/>
        <polygon points="24,15 50,22 33,44" fill="#e59887"/>
        <polygon points="58,23 86,28 69,50" fill="#f1d39a"/>
        <polygon points="94,29 122,31 108,55" fill="#a8c2a6"/>
        <polygon points="128,31 156,28 144,53" fill="#e8b4bc"/>
        <polygon points="164,26 192,20 181,46" fill="#d9a373"/>
        <polygon points="198,19 224,12 214,38" fill="#c97265"/>
      </svg>`
    },
    {
      type: 'heart-garland',
      name: 'Guirnalda corazones',
      cat: 'stickers',
      width: 230,
      isGarland: true,
      svg: `<svg viewBox="0 0 240 66" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 14 Q120 42 232 14" fill="none" stroke="#99776a" stroke-width="1.8" stroke-dasharray="4 3"/>
        <g transform="translate(38,24) scale(0.75)"><path d="M12 6 C9 0 0 2 0 9 C0 16 12 23 12 23 C12 23 24 16 24 9 C24 2 15 0 12 6 Z" fill="#d4685c"/></g>
        <g transform="translate(82,31) scale(0.8)"><path d="M12 6 C9 0 0 2 0 9 C0 16 12 23 12 23 C12 23 24 16 24 9 C24 2 15 0 12 6 Z" fill="#e89a9e"/></g>
        <g transform="translate(126,32) scale(0.85)"><path d="M12 6 C9 0 0 2 0 9 C0 16 12 23 12 23 C12 23 24 16 24 9 C24 2 15 0 12 6 Z" fill="#c4514b"/></g>
        <g transform="translate(172,26) scale(0.76)"><path d="M12 6 C9 0 0 2 0 9 C0 16 12 23 12 23 C12 23 24 16 24 9 C24 2 15 0 12 6 Z" fill="#e89a9e"/></g>
      </svg>`
    },
    {
      type: 'hearts-trio',
      name: 'Corazoncitos',
      cat: 'stickers',
      width: 92,
      svg: `<svg viewBox="0 0 110 92" xmlns="http://www.w3.org/2000/svg">
        <path d="M44 30 C37 16 18 20 18 35 C18 50 44 65 44 65 C44 65 70 50 70 35 C70 20 51 16 44 30 Z" fill="#d16055" transform="rotate(-10 44 44)"/>
        <path d="M80 22 C76 14 66 16 66 24 C66 32 80 40 80 40 C80 40 94 32 94 24 C94 16 84 14 80 22 Z" fill="#eb9aa0" transform="rotate(14 80 28)"/>
        <path d="M74 60 C71 54 64 56 64 62 C64 68 74 74 74 74 C74 74 84 68 84 62 C84 56 77 54 74 60 Z" fill="#e6b873" transform="rotate(-8 74 65)"/>
      </svg>`
    },
    {
      type: 'stars',
      name: 'Estrellitas doradas',
      cat: 'stickers',
      width: 98,
      svg: `<svg viewBox="0 0 120 88" xmlns="http://www.w3.org/2000/svg">
        <path d="M36 10 L41 28 L59 33 L41 38 L36 56 L31 38 L13 33 L31 28 Z" fill="#e2b45a"/>
        <path d="M84 20 L87 31 L98 34 L87 37 L84 48 L81 37 L70 34 L81 31 Z" fill="#f0c975"/>
        <path d="M64 52 L66 60 L74 62 L66 64 L64 72 L62 64 L54 62 L62 60 Z" fill="#d99a5b"/>
      </svg>`
    },
    {
      type: 'flower',
      name: 'Ramita prensada',
      cat: 'stickers',
      width: 90,
      svg: `<svg viewBox="0 0 100 124" xmlns="http://www.w3.org/2000/svg">
        <path d="M46 116 Q54 70 48 16" fill="none" stroke="#6f8769" stroke-width="2.6" stroke-linecap="round"/>
        <ellipse cx="36" cy="86" rx="12" ry="5" fill="#89a382" transform="rotate(-28 36 86)"/>
        <ellipse cx="62" cy="72" rx="12" ry="5" fill="#7c9675" transform="rotate(24 62 72)"/>
        <ellipse cx="36" cy="54" rx="11" ry="4.5" fill="#89a382" transform="rotate(-30 36 54)"/>
        <circle cx="48" cy="18" r="7" fill="#e39a8e"/><circle cx="38" cy="30" r="6" fill="#f0b6ab"/>
        <circle cx="58" cy="32" r="6" fill="#e6a69b"/><circle cx="49" cy="40" r="5.5" fill="#f5d19c"/>
      </svg>`
    },
    {
      type: 'washi-strip',
      name: 'Washi lunares',
      cat: 'stickers',
      width: 112,
      svg: `<svg viewBox="0 0 140 38" xmlns="http://www.w3.org/2000/svg">
        <polygon points="5,4 135,2 132,12 137,20 133,34 4,35 8,22 2,13" fill="#e0a594" opacity="0.84"/>
        <g fill="#fff8ef" opacity="0.6">
          <circle cx="24" cy="18" r="3"/><circle cx="48" cy="14" r="2.5"/><circle cx="72" cy="22" r="3"/>
          <circle cx="96" cy="16" r="2.5"/><circle cx="118" cy="21" r="3"/>
        </g>
      </svg>`
    },
    {
      type: 'washi-check',
      name: 'Washi cuadros',
      cat: 'stickers',
      width: 116,
      svg: `<svg viewBox="0 0 140 36" xmlns="http://www.w3.org/2000/svg">
        <polygon points="4,4 136,3 132,18 136,33 4,34 8,18" fill="#a8c0a6" opacity="0.82"/>
        <g fill="#fff8ef" opacity="0.45">
          <rect x="16" y="4" width="14" height="14"/><rect x="44" y="4" width="14" height="14"/><rect x="72" y="4" width="14" height="14"/><rect x="100" y="4" width="14" height="14"/>
          <rect x="30" y="18" width="14" height="14"/><rect x="58" y="18" width="14" height="14"/><rect x="86" y="18" width="14" height="14"/><rect x="114" y="18" width="14" height="14"/>
        </g>
      </svg>`
    },
    {
      type: 'paperclip',
      name: 'Clip dorado',
      cat: 'stickers',
      width: 44,
      svg: `<svg viewBox="0 0 56 110" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 32 V82 A14 14 0 0 0 46 82 V24 A10 10 0 0 0 26 24 V74 A5 5 0 0 0 36 74 V34" fill="none" stroke="#c99b49" stroke-width="5" stroke-linecap="round"/>
      </svg>`
    },
    {
      type: 'pushpin',
      name: 'Chincheta roja',
      cat: 'stickers',
      width: 46,
      svg: `<svg viewBox="0 0 64 78" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="34" cy="68" rx="8" ry="4" fill="rgba(45,30,22,0.28)"/>
        <path d="M32 42 L32 66" stroke="#8c9499" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="32" cy="28" r="18" fill="#cf564c" stroke="#6b2520" stroke-width="2.2"/>
        <circle cx="26" cy="22" r="5" fill="#fff" opacity="0.4"/>
      </svg>`
    },
    {
      type: 'bow-ribbon',
      name: 'Moñito cinta',
      cat: 'stickers',
      width: 96,
      svg: `<svg viewBox="0 0 120 82" xmlns="http://www.w3.org/2000/svg">
        <path d="M56 38 L34 74 L48 68 L60 44" fill="#e5979d" stroke="#7a3b42" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M64 38 L86 74 L72 68 L60 44" fill="#e5979d" stroke="#7a3b42" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M56 36 C32 10 8 18 14 40 C20 56 44 48 56 40" fill="#f0adb3" stroke="#7a3b42" stroke-width="2.2"/>
        <path d="M64 36 C88 10 112 18 106 40 C100 56 76 48 64 40" fill="#f0adb3" stroke="#7a3b42" stroke-width="2.2"/>
        <circle cx="60" cy="38" r="8" fill="#d97b84" stroke="#7a3b42" stroke-width="2.2"/>
      </svg>`
    },
    {
      type: 'sticky-note',
      name: 'Post-it editable',
      cat: 'stickers',
      width: 148,
      editableKind: 'sticky',
      defaultText: 'Notita linda ♥',
      svg: `<svg viewBox="0 0 110 92" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="12" width="82" height="72" rx="4" fill="#fae589" stroke="#dfc35d" stroke-width="1.5"/>
        <rect x="38" y="6" width="34" height="10" fill="#fff" opacity="0.6"/>
        <line x1="26" y1="36" x2="82" y2="36" stroke="#b99c43" stroke-width="2" stroke-linecap="round"/>
        <line x1="26" y1="50" x2="74" y2="50" stroke="#b99c43" stroke-width="2" stroke-linecap="round"/>
        <line x1="26" y1="64" x2="62" y2="64" stroke="#b99c43" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    }
  ];

  // =========================================================================
  // 2. STATE & PERSISTENCE
  // =========================================================================
  let currentSpread = 0; // 0 = Front cover, 1 = Intro/Index, 2..7 = Chapters 1..6, 8 = Back cover
  let isTransitioning = false;
  let topZ = 24;
  const customPositions = JSON.parse(localStorage.getItem('album_custom_positions_v1') || '{}');
  const customPolaroids = JSON.parse(localStorage.getItem('album_custom_polaroids_v1') || '{}');

  // Clock offset against server so scheduled unlocks stay accurate across devices
  const serverClockOffsetMs = DATA.serverNow ? (Date.parse(DATA.serverNow) - Date.now()) : 0;
  function getSyncedNow() {
    return Date.now() + serverClockOffsetMs;
  }
  function isChapterLocked(ch) {
    if (!ch) return false;
    if (ch.unlockAt) {
      const ts = Date.parse(ch.unlockAt);
      if (!Number.isNaN(ts)) return getSyncedNow() < ts;
    }
    return Boolean(ch.locked);
  }
  function formatUnlockDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('es-AR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Version-aware unlocked envelopes (so resetting a gift in /admin locks it across ALL devices!)
  const unlockedEnvelopeVersions = (() => {
    try {
      const raw = JSON.parse(localStorage.getItem('album_unlocked_envs_v2') || 'null');
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw;
      // Migrate legacy v1 array cleanly
      const legacy = JSON.parse(localStorage.getItem('album_unlocked_envs') || '[]');
      const migrated = {};
      if (Array.isArray(legacy)) legacy.forEach(id => { migrated[id] = 0; });
      localStorage.setItem('album_unlocked_envs_v2', JSON.stringify(migrated));
      return migrated;
    } catch {
      return {};
    }
  })();

  function isEnvelopeUnlocked(env) {
    if (!env || env.lockedByChapter) return false;
    const expectedVer = Number(env.resetVersion || 0);
    return unlockedEnvelopeVersions[env.id] === expectedVer;
  }
  function markEnvelopeUnlocked(env) {
    unlockedEnvelopeVersions[env.id] = Number(env.resetVersion || 0);
    localStorage.setItem('album_unlocked_envs_v2', JSON.stringify(unlockedEnvelopeVersions));
  }

  function savePositions() {
    localStorage.setItem('album_custom_positions_v1', JSON.stringify(customPositions));
  }
  function saveCustomPolaroids() {
    try {
      localStorage.setItem('album_custom_polaroids_v1', JSON.stringify(customPolaroids));
    } catch (err) {
      alert('El almacenamiento local está casi lleno. Probá borrar alguna Polaroid vieja antes de sumar otra.');
    }
  }
  function getChapterPolaroids(chapter) {
    return [...(chapter.polaroids || []), ...(customPolaroids[chapter.id] || [])];
  }

  // Placed decorations per chapter id (merges defaults from album-data.js + localStorage)
  const storedDecors = JSON.parse(localStorage.getItem('album_decorations_v1') || '{}');
  function getChapterDecors(chapter) {
    if (!storedDecors[chapter.id]) {
      storedDecors[chapter.id] = (chapter.decorations || []).map(d => ({ ...d }));
    }
    return storedDecors[chapter.id];
  }
  function saveDecors() {
    localStorage.setItem('album_decorations_v1', JSON.stringify(storedDecors));
  }

  // DOM refs
  const cameraStage = document.getElementById('cameraStage');
  const bookShell = document.getElementById('bookShell');
  const bookEl = document.getElementById('book');
  const chapterTabsEl = document.getElementById('chapterTabs');
  const interactiveLayer = document.getElementById('interactiveLayer');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const spreadChapterEl = document.getElementById('spreadChapter');
  const spreadPagesEl = document.getElementById('spreadPages');
  const resetLayoutBtn = document.getElementById('resetLayoutBtn');
  const hudTitle = document.getElementById('hudTitle');
  const giftTrackerBtn = document.getElementById('giftTracker');
  const giftProgressText = document.getElementById('giftProgressText');

  hudTitle.textContent = `${DATA.meta.anniversaryNumber} Años · ${DATA.meta.datesLabel}`;

  // Collect all envelopes across chapters for gift progress tracker
  const allEnvelopes = DATA.chapters.flatMap(ch => ch.envelopes || []);

  function updateGiftProgressUI() {
    const total = allEnvelopes.length;
    const unlockedCount = allEnvelopes.filter(e => isEnvelopeUnlocked(e)).length;
    giftProgressText.textContent = unlockedCount === total
      ? `¡${unlockedCount} / ${total} regalos encontrados! ✨`
      : `${unlockedCount} / ${total} regalos`;
    giftTrackerBtn.classList.toggle('complete', unlockedCount === total && total > 0);

    // Sync badges inside the Index page
    bookEl.querySelectorAll('.idx-gift-badge').forEach(badge => {
      const chId = badge.dataset.chId;
      const ch = DATA.chapters.find(c => c.id === chId);
      const envId = badge.dataset.envId;
      const num = badge.dataset.giftNum;
      const env = allEnvelopes.find(e => e.id === envId);

      if (ch && isChapterLocked(ch)) {
        badge.classList.remove('unlocked');
        badge.classList.add('scheduled');
        badge.textContent = `⏳ ${formatUnlockDate(ch.unlockAt)}`;
      } else {
        badge.classList.remove('scheduled');
        const isOpen = isEnvelopeUnlocked(env);
        badge.classList.toggle('unlocked', isOpen);
        badge.textContent = isOpen ? `🎁 #${num} ✓` : `🔒 Regalo #${num}`;
      }
    });
  }

  giftTrackerBtn.addEventListener('click', () => jumpToSpread(1));

  // =========================================================================
  // 3. BUILD SHEETS (Front cover -> Intro/Index -> 6 Chapters -> Back cover)
  // =========================================================================
  function renderHiddenNotesHTML(notes) {
    if (!notes || !notes.length) return '';
    return notes.map(n => `
      <div class="hidden-note" style="left:${n.left}; top:${n.top};">
        <span class="secret-tag">${n.tag}</span>
        ${n.text}
      </div>
    `).join('');
  }

  function buildIntroLeftHTML() {
    const start = new Date(DATA.meta.startDate);
    const days = Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000));
    const hours = days * 24;
    return `
      <div class="face back paper-face">
        <div class="page-header">
          <span class="chapter-kicker">Dedicatoria</span>
          <span class="page-number">p. 01</span>
        </div>
        <h2 class="page-heading">${DATA.dedication.title}</h2>
        <div style="display:grid; gap:14px; margin-top:10px;">
          ${DATA.dedication.paragraphs.map(p => `<p style="font-family:'Caveat',cursive; font-size:1.42rem; line-height:1.35; color:#4a3831;">${p}</p>`).join('')}
          <p style="font-family:'Caveat',cursive; font-size:1.38rem; color:var(--accent); text-align:right; margin-top:6px;">${DATA.dedication.signature}</p>
        </div>
        <div class="live-counter-strip">
          <div class="c-box"><b>${DATA.meta.anniversaryNumber}</b><small>Años</small></div>
          <div class="c-box"><b id="liveDays">${days.toLocaleString('es-AR')}</b><small>Días</small></div>
          <div class="c-box"><b>${hours.toLocaleString('es-AR')}</b><small>Horas</small></div>
        </div>
      </div>
    `;
  }

  function buildIndexRightHTML() {
    return `
      <div class="face front paper-face">
        <div class="page-header">
          <span class="chapter-kicker">Capítulos</span>
          <span class="page-number">p. 02</span>
        </div>
        <h2 class="page-heading">Seis años, seis capítulos</h2>
        <p class="page-story">Elegí un año para saltar directo o pasá las hojas una por una.</p>
        <ul class="index-list">
          ${DATA.chapters.map((ch, i) => {
            const env = (ch.envelopes || [])[0];
            const giftBadge = env
              ? `<span class="idx-gift-badge" data-ch-id="${ch.id}" data-env-id="${env.id}" data-gift-num="${env.giftNumber || (i + 1)}">🔒 Regalo #${env.giftNumber || (i + 1)}</span>`
              : '';
            return `
            <li class="index-item" data-jump-spread="${i + 2}">
              <strong>${ch.tabLabel} — ${ch.shortTitle}</strong>
              <div class="idx-right">
                ${giftBadge}
                <span>Ir →</span>
              </div>
            </li>
          `;
          }).join('')}
        </ul>
      </div>
    `;
  }

  function buildChapterSideHTML(ch, side, pageNum) {
    const cfg = side === 'left' ? ch.leftPage : ch.rightPage;
    const faceClass = side === 'left' ? 'back' : 'front';

    if (isChapterLocked(ch)) {
      if (side === 'left') {
        return `
          <div class="face ${faceClass} paper-face" data-locked-chapter="${ch.id}">
            <div class="page-header">
              <span class="chapter-kicker">${ch.yearLabel}</span>
              <span class="page-number">p. ${String(pageNum).padStart(2, '0')}</span>
            </div>
            <div class="locked-chapter-box">
              <div class="locked-seal-icon">⏳</div>
              <h2 class="page-heading" style="margin:0;">Capítulo sellado</h2>
              <p class="page-story" style="max-width:340px;">
                Este capítulo todavía guarda sus recuerdos y la pista de tu regalo… ¡volvé cuando termine la cuenta regresiva!
              </p>
              <span class="locked-date-pill">📅 Se habilita el ${formatUnlockDate(ch.unlockAt)}</span>
            </div>
          </div>
        `;
      }
      return `
        <div class="face ${faceClass} paper-face" data-locked-chapter="${ch.id}">
          <div class="page-header">
            <span class="chapter-kicker">${ch.yearLabel}</span>
            <span class="page-number">p. ${String(pageNum).padStart(2, '0')}</span>
          </div>
          <div class="locked-chapter-box">
            <div style="font-size:0.74rem; letter-spacing:0.16em; text-transform:uppercase; color:var(--accent); font-weight:700;">Cuenta regresiva</div>
            <h2 class="page-heading" style="margin:0;">Falta poquito... ♥</h2>
            <div class="countdown-grid" data-countdown-for="${ch.id}" data-unlock-at="${ch.unlockAt}">
              <div class="cd-cell"><b data-cd="d">--</b><small>Días</small></div>
              <div class="cd-cell"><b data-cd="h">--</b><small>Horas</small></div>
              <div class="cd-cell"><b data-cd="m">--</b><small>Min</small></div>
              <div class="cd-cell"><b data-cd="s">--</b><small>Seg</small></div>
            </div>
            <p style="font-family:'Caveat',cursive; font-size:1.35rem; color:#6a5248; margin-top:4px;">
              Apenas llegue a cero, este capítulo se abre solo ✨
            </p>
          </div>
        </div>
      `;
    }

    return `
      <div class="face ${faceClass} paper-face">
        <div class="page-header">
          <span class="chapter-kicker">${ch.yearLabel}</span>
          <span class="page-number">p. ${String(pageNum).padStart(2, '0')}</span>
        </div>
        <h2 class="page-heading">${cfg.title}</h2>
        <p class="page-story">${cfg.story}</p>
        ${renderHiddenNotesHTML(cfg.hiddenNotes)}
      </div>
    `;
  }

  // Construct physical sheets array
  const sheetDefinitions = [];

  // Sheet 0: Front cover / Dedication (left of spread 1)
  sheetDefinitions.push({
    front: `
      <div class="face front cover-face" id="frontCoverFace">
        <div class="cover-frame">
          <div class="cover-dates">${DATA.meta.datesLabel}</div>
          <div class="cover-medal">${DATA.meta.anniversaryNumber}</div>
          <div>
            <h1 class="cover-title">${DATA.meta.coverTitle}</h1>
            <p class="cover-subtitle">${DATA.meta.coverSubtitle}</p>
          </div>
          <div class="cover-cta">Tocá para abrir el cuaderno →</div>
        </div>
      </div>
    `,
    back: buildIntroLeftHTML()
  });

  // Sheet 1: Index (right of spread 1) / Chapter 1 Left (left of spread 2)
  sheetDefinitions.push({
    front: buildIndexRightHTML(),
    back: buildChapterSideHTML(DATA.chapters[0], 'left', 3)
  });

  // Sheets 2..6: Chapter i Right / Chapter i+1 Left
  for (let i = 0; i < DATA.chapters.length - 1; i++) {
    sheetDefinitions.push({
      front: buildChapterSideHTML(DATA.chapters[i], 'right', 4 + i * 2),
      back: buildChapterSideHTML(DATA.chapters[i + 1], 'left', 5 + i * 2)
    });
  }

  // Last Sheet: Last Chapter Right / Back Cover
  const lastIdx = DATA.chapters.length - 1;
  sheetDefinitions.push({
    front: buildChapterSideHTML(DATA.chapters[lastIdx], 'right', 4 + lastIdx * 2),
    back: `
      <div class="face back cover-face" id="backCoverFace">
        <div class="cover-frame">
          <div class="cover-dates">Fin del Volumen I</div>
          <div class="cover-medal" style="font-size:3rem;">∞</div>
          <div>
            <h1 class="cover-title">${DATA.meta.backTitle}</h1>
            <p class="cover-subtitle">${DATA.meta.backSubtitle}</p>
          </div>
          <div class="cover-cta">← Volver a abrir</div>
        </div>
      </div>
    `
  });

  const TOTAL_SPREADS = sheetDefinitions.length; // 0..8

  const sheetEls = sheetDefinitions.map((def, idx) => {
    const el = document.createElement('div');
    el.className = 'sheet';
    el.style.zIndex = sheetDefinitions.length - idx;
    el.innerHTML = def.front + def.back;
    bookEl.appendChild(el);
    return el;
  });

  // Front & back cover click handlers
  bookEl.querySelector('#frontCoverFace').addEventListener('click', () => jumpToSpread(1));
  bookEl.querySelector('#backCoverFace').addEventListener('click', () => jumpToSpread(TOTAL_SPREADS - 1));

  // Build chapter bookmark tabs
  const tabsData = [
    { label: 'Índice', spread: 1, color: '#f2e6cf', locked: false },
    ...DATA.chapters.map((ch, i) => ({
      label: isChapterLocked(ch) ? `🔒 ${ch.tabLabel}` : ch.tabLabel,
      spread: i + 2,
      color: ch.tabColor,
      locked: isChapterLocked(ch)
    }))
  ];

  tabsData.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'chapter-tab' + (t.locked ? ' locked-tab' : '');
    btn.textContent = t.label;
    btn.style.background = t.color;
    btn.dataset.spread = t.spread;
    btn.addEventListener('click', () => jumpToSpread(t.spread));
    chapterTabsEl.appendChild(btn);
  });

  // =========================================================================
  // 4. INTERACTIVE SPREAD LAYER (Draggable Polaroids, 3D Flip, Videos, Envelopes)
  // =========================================================================
  function getMediaHTML(item) {
    if (item.type === 'video') {
      const thumb = item.posterSrc
        ? `<img src="${item.posterSrc}" alt="${item.caption}" />`
        : item.videoSrc
          ? `<video src="${item.videoSrc}#t=0.1" muted playsinline preload="metadata"></video>`
          : SCENES[item.scene] || SCENES.coffee;
      return `
        ${thumb}
        <span class="video-pill"><span class="rec-dot"></span>VIDEO${item.duration ? ' · ' + item.duration : ''}</span>
        <div class="play-overlay"><div class="play-circle">▶</div></div>
      `;
    }
    return item.imageSrc
      ? `<img src="${item.imageSrc}" alt="${item.caption}" />`
      : SCENES[item.scene] || SCENES.coffee;
  }

  function renderInteractiveSpread() {
    interactiveLayer.innerHTML = '';

    // Cover states have no interactive overlay items
    if (currentSpread === 0 || currentSpread === TOTAL_SPREADS) {
      resetLayoutBtn.style.opacity = '0.35';
      resetLayoutBtn.disabled = true;
      return;
    }

    // Spread 1 = Index page (wire up clickable chapter rows)
    if (currentSpread === 1) {
      resetLayoutBtn.style.opacity = '0.35';
      resetLayoutBtn.disabled = true;
      // Add transparent clickable links matching index items
      bookEl.querySelectorAll('.index-item').forEach(li => {
        li.onclick = () => jumpToSpread(Number(li.dataset.jumpSpread));
      });
      return;
    }

    const chapter = DATA.chapters[currentSpread - 2];
    if (!chapter) return;

    if (isChapterLocked(chapter)) {
      resetLayoutBtn.style.opacity = '0.35';
      resetLayoutBtn.disabled = true;
      return;
    }

    resetLayoutBtn.style.opacity = '1';
    resetLayoutBtn.disabled = false;

    // Render Draggable Polaroids (default + user-added custom Polaroids)
    getChapterPolaroids(chapter).forEach(item => {
      const pos = customPositions[item.id] || { x: item.x, y: item.y, rot: item.rot };
      const el = document.createElement('div');
      el.className = 'polaroid-item';
      el.dataset.id = item.id;
      el.style.left = pos.x + '%';
      el.style.top = pos.y + '%';
      el.style.transform = `rotate(${pos.rot}deg)`;

      const tapeClass = item.tape && item.tape !== 'default' ? item.tape : '';
      const delCustomHTML = item.isCustom
        ? `<button type="button" class="pol-del-btn" data-del-custom="1" title="Eliminar esta Polaroid">🗑</button>`
        : '';

      el.innerHTML = `
        <div class="polaroid-inner">
          <div class="polaroid-front">
            <div class="washi ${tapeClass}"></div>
            <div class="media-frame">${getMediaHTML(item)}</div>
            <div class="polaroid-footer">
              <span class="pol-caption">${item.caption}</span>
              <button type="button" class="pol-action-btn" data-flip="1" title="Dar vuelta y leer mensaje">↻ Nota</button>
            </div>
            ${item.moveHint && !customPositions[item.id] ? `<div class="move-hint-tag">${item.moveHint}</div>` : ''}
          </div>
          <div class="polaroid-back">
            <div class="back-date">${item.date || 'Recuerdo ♥'}</div>
            <p class="back-note">${item.backNote || 'Un momento guardado con amor.'}</p>
            <div class="polaroid-footer" style="justify-content:center; gap:8px;">
              <button type="button" class="pol-action-btn" data-flip="1">↻ Volver</button>
              ${delCustomHTML}
            </div>
          </div>
        </div>
      `;

      // Delete custom-added Polaroid button
      const delBtn = el.querySelector('[data-del-custom="1"]');
      if (delBtn) {
        delBtn.addEventListener('pointerdown', e => e.stopPropagation());
        delBtn.addEventListener('click', e => {
          e.stopPropagation();
          const list = customPolaroids[chapter.id] || [];
          customPolaroids[chapter.id] = list.filter(p => p.id !== item.id);
          delete customPositions[item.id];
          saveCustomPolaroids();
          savePositions();
          renderInteractiveSpread();
        });
      }

      // Flip buttons inside Polaroid
      el.querySelectorAll('[data-flip="1"]').forEach(btn => {
        btn.addEventListener('pointerdown', e => e.stopPropagation());
        btn.addEventListener('click', e => {
          e.stopPropagation();
          el.classList.toggle('flipped');
        });
      });

      setupDraggable(el, item.id, pos.rot, () => {
        // Executed when tapped/clicked WITHOUT dragging:
        if (el.classList.contains('flipped')) {
          el.classList.remove('flipped');
          return;
        }
        if (item.type === 'video') {
          const mediaFrame = el.querySelector('.media-frame');
          openVideoDiveIn(item, chapter, mediaFrame);
        } else {
          el.classList.toggle('flipped');
        }
      });

      interactiveLayer.appendChild(el);
    });

    // Render Draggable Secret Envelopes
    (chapter.envelopes || []).forEach(env => {
      const isUnlocked = isEnvelopeUnlocked(env);
      const pos = customPositions[env.id] || { x: env.x, y: env.y, rot: env.rot };
      const el = document.createElement('div');
      el.className = 'secret-envelope-item' + (isUnlocked ? ' unlocked' : '');
      el.style.left = pos.x + '%';
      el.style.top = pos.y + '%';
      el.style.transform = `rotate(${pos.rot}deg)`;
      el.innerHTML = `
        <div class="env-seal-mini">${isUnlocked ? '🔓' : '🔒'}</div>
        <div class="env-title">${env.title}</div>
        <div class="env-sub">${isUnlocked ? 'Desbloqueado · Leer carta' : 'Requiere código secreto'}</div>
        <button type="button" class="env-open-btn">${isUnlocked ? 'Abrir carta ♥' : 'Ingresar código'}</button>
      `;

      const openBtn = el.querySelector('.env-open-btn');
      openBtn.addEventListener('pointerdown', e => e.stopPropagation());
      openBtn.addEventListener('click', e => {
        e.stopPropagation();
        openEnvelopeModal(env);
      });

      setupDraggable(el, env.id, pos.rot, () => openEnvelopeModal(env));
      interactiveLayer.appendChild(el);
    });

    // Render Placed Scrapbook Decorations (garlands, hearts, flowers, editable post-its...)
    renderChapterDecorations(chapter);
  }

  function renderChapterDecorations(chapter) {
    interactiveLayer.querySelectorAll('.decor-placed').forEach(n => n.remove());
    const decors = getChapterDecors(chapter);

    decors.forEach(d => {
      const def = DECOR_CATALOG.find(c => c.type === d.type);
      if (!def) return;

      const el = document.createElement('div');
      el.className = 'decor-placed';
      el.dataset.decorId = d.id;
      el.style.left = d.x + '%';
      el.style.top = d.y + '%';
      el.style.width = (def.width * (d.scale || 1)) + 'px';
      el.style.transform = `rotate(${d.rot || 0}deg)`;
      el.style.zIndex = d.z || 16;

      let visualHTML = `<span class="decor-visual">${def.svg}</span>`;
      if (def.editableKind === 'sticky') {
        visualHTML = `<div class="decor-sticky-box"><div class="decor-sticky-text" contenteditable="true" spellcheck="false">${d.text || def.defaultText}</div></div>`;
      } else if (def.editableKind === 'news') {
        visualHTML = `
          <div class="decor-news-clip">
            <div class="decor-news-kicker">EL DIARIO DE NOSOTROS</div>
            <div class="decor-news-headline" contenteditable="true" spellcheck="false">${d.text || def.defaultText}</div>
            <div class="decor-news-lines"></div>
          </div>`;
      } else if (def.editableKind === 'kraft') {
        visualHTML = `<div class="decor-kraft-note"><div class="decor-sticky-text" contenteditable="true" spellcheck="false">${d.text || def.defaultText}</div></div>`;
      } else if (def.editableKind === 'lined') {
        visualHTML = `<div class="decor-lined-scrap"><div class="decor-sticky-text" contenteditable="true" spellcheck="false">${d.text || def.defaultText}</div></div>`;
      }

      el.innerHTML = `
        <div class="decor-toolbar">
          <button type="button" class="decor-tbtn" data-act="rotL" title="Girar izquierda">⟲</button>
          <button type="button" class="decor-tbtn" data-act="rotR" title="Girar derecha">⟳</button>
          <button type="button" class="decor-tbtn" data-act="smaller" title="Achicar">−</button>
          <button type="button" class="decor-tbtn" data-act="bigger" title="Agrandar">+</button>
          <button type="button" class="decor-tbtn" data-act="back" title="Enviar detrás de las fotos">⬇</button>
          <button type="button" class="decor-tbtn" data-act="front" title="Traer al frente">⬆</button>
          <button type="button" class="decor-tbtn del" data-act="delete" title="Eliminar">✕</button>
        </div>
        ${visualHTML}
      `;

      // Toolbar actions
      el.querySelectorAll('.decor-tbtn').forEach(btn => {
        btn.addEventListener('pointerdown', e => e.stopPropagation());
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const act = btn.dataset.act;
          if (act === 'rotL') d.rot = (d.rot || 0) - 12;
          if (act === 'rotR') d.rot = (d.rot || 0) + 12;
          if (act === 'smaller') d.scale = Math.max(0.55, +((d.scale || 1) - 0.15).toFixed(2));
          if (act === 'bigger') d.scale = Math.min(2.0, +((d.scale || 1) + 0.15).toFixed(2));
          if (act === 'back') { d.z = 4; el.style.zIndex = 4; }
          if (act === 'front') { d.z = ++topZ; el.style.zIndex = d.z; }
          if (act === 'delete') {
            const arr = getChapterDecors(chapter);
            const idx = arr.findIndex(x => x.id === d.id);
            if (idx >= 0) arr.splice(idx, 1);
            saveDecors();
            renderChapterDecorations(chapter);
            return;
          }
          el.style.width = (def.width * (d.scale || 1)) + 'px';
          el.style.transform = `rotate(${d.rot || 0}deg)`;
          saveDecors();
        });
      });

      // Editable text persistence (post-its, newspaper headline, kraft paper, lined scrap)
      const editableNode = el.querySelector('[contenteditable="true"]');
      if (editableNode) {
        editableNode.addEventListener('pointerdown', e => e.stopPropagation());
        editableNode.addEventListener('input', () => {
          d.text = editableNode.innerText;
          saveDecors();
        });
      }

      // Draggable across the open spread
      setupDecorDraggable(el, d);
      interactiveLayer.appendChild(el);
    });
  }

  function setupDecorDraggable(el, d) {
    let startX = 0, startY = 0, origLeftPx = 0, origTopPx = 0;
    let active = false, moved = false;

    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      active = true;
      moved = false;
      el.setPointerCapture(e.pointerId);
      d.z = ++topZ;
      el.style.zIndex = d.z;

      interactiveLayer.querySelectorAll('.decor-placed.selected').forEach(n => n.classList.remove('selected'));
      el.classList.add('selected');

      const parentRect = interactiveLayer.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      origLeftPx = elRect.left - parentRect.left;
      origTopPx = elRect.top - parentRect.top;
    });

    el.addEventListener('pointermove', (e) => {
      if (!active) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!moved && Math.hypot(dx, dy) > 4) {
        moved = true;
        el.classList.add('dragging');
      }
      if (!moved) return;

      const parentRect = interactiveLayer.getBoundingClientRect();
      const nextX = Math.max(-20, Math.min(parentRect.width - 30, origLeftPx + dx));
      const nextY = Math.max(-10, Math.min(parentRect.height - 30, origTopPx + dy));
      d.x = +((nextX / parentRect.width) * 100).toFixed(2);
      d.y = +((nextY / parentRect.height) * 100).toFixed(2);
      el.style.left = d.x + '%';
      el.style.top = d.y + '%';
    });

    el.addEventListener('pointerup', () => {
      if (!active) return;
      active = false;
      el.classList.remove('dragging');
      if (moved) saveDecors();
    });
  }

  // Smooth Drag-and-Drop helper (cleanly separates Drag vs Click)
  function setupDraggable(el, id, baseRot, onClick) {
    let startX = 0, startY = 0, origLeftPx = 0, origTopPx = 0;
    let pointerActive = false, moved = false;

    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      pointerActive = true;
      moved = false;
      el.setPointerCapture(e.pointerId);
      el.style.zIndex = ++topZ;

      const parentRect = interactiveLayer.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      origLeftPx = elRect.left - parentRect.left;
      origTopPx = elRect.top - parentRect.top;
    });

    el.addEventListener('pointermove', (e) => {
      if (!pointerActive) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!moved && Math.hypot(dx, dy) > 6) {
        moved = true;
        el.classList.add('dragging');
        const hint = el.querySelector('.move-hint-tag');
        if (hint) hint.remove();
      }
      if (!moved) return;

      const parentRect = interactiveLayer.getBoundingClientRect();
      const maxX = parentRect.width - el.offsetWidth - 8;
      const maxY = parentRect.height - el.offsetHeight - 8;
      const nextX = Math.max(8, Math.min(maxX, origLeftPx + dx));
      const nextY = Math.max(8, Math.min(maxY, origTopPx + dy));

      const pctX = (nextX / parentRect.width) * 100;
      const pctY = (nextY / parentRect.height) * 100;
      el.style.left = pctX + '%';
      el.style.top = pctY + '%';
      el.style.transform = `rotate(${baseRot * 0.35}deg) scale(1.04)`;
      customPositions[id] = { x: pctX, y: pctY, rot: baseRot };
    });

    el.addEventListener('pointerup', (e) => {
      if (!pointerActive) return;
      pointerActive = false;
      el.classList.remove('dragging');
      el.style.transform = `rotate(${baseRot}deg)`;
      if (moved) {
        savePositions();
      } else if (typeof onClick === 'function') {
        onClick();
      }
    });
  }

  // Reset layout button for current chapter
  resetLayoutBtn.addEventListener('click', () => {
    const ch = DATA.chapters[currentSpread - 2];
    if (!ch) return;
    getChapterPolaroids(ch).forEach(p => delete customPositions[p.id]);
    (ch.envelopes || []).forEach(e => delete customPositions[e.id]);
    savePositions();
    renderInteractiveSpread();
  });

  // =========================================================================
  // 5. BOOK NAVIGATION & CASCADE CHAPTER JUMP
  // =========================================================================
  function updateBookVisuals() {
    sheetEls.forEach((sheet, idx) => {
      if (idx < currentSpread) {
        sheet.classList.add('flipped');
        sheet.style.zIndex = idx + 1;
      } else {
        sheet.classList.remove('flipped');
        sheet.style.zIndex = sheetEls.length - idx;
      }
    });

    bookShell.classList.toggle('closed-front', currentSpread === 0);
    bookShell.classList.toggle('closed-back', currentSpread === TOTAL_SPREADS);

    prevBtn.disabled = currentSpread === 0;
    nextBtn.disabled = currentSpread === TOTAL_SPREADS;

    // Update active bookmark tab
    chapterTabsEl.querySelectorAll('.chapter-tab').forEach(tab => {
      tab.classList.toggle('active', Number(tab.dataset.spread) === currentSpread);
    });

    // Update bottom spread status
    if (currentSpread === 0) {
      spreadChapterEl.textContent = 'Portada';
      spreadPagesEl.textContent = 'Tocá el cuaderno o "Pasar hoja" para abrir';
    } else if (currentSpread === 1) {
      spreadChapterEl.textContent = 'Dedicatoria & Índice';
      spreadPagesEl.textContent = 'Páginas 01 — 02';
    } else if (currentSpread === TOTAL_SPREADS) {
      spreadChapterEl.textContent = 'Contratapa';
      spreadPagesEl.textContent = 'Fin del Volumen I';
    } else {
      const ch = DATA.chapters[currentSpread - 2];
      const pL = 3 + (currentSpread - 2) * 2;
      spreadChapterEl.textContent = `${ch.tabLabel} · ${ch.shortTitle}`;
      spreadPagesEl.textContent = `Páginas ${String(pL).padStart(2, '0')} — ${String(pL + 1).padStart(2, '0')}`;
    }
  }

  let flipTimer = null;
  function jumpToSpread(target) {
    const clamped = Math.max(0, Math.min(TOTAL_SPREADS, target));
    if (clamped === currentSpread) return;

    // Hide interactive layer while 3D sheets turn so nothing floats weirdly mid-flip
    interactiveLayer.classList.add('hidden');
    clearTimeout(flipTimer);

    const stepDir = clamped > currentSpread ? 1 : -1;
    const distance = Math.abs(clamped - currentSpread);

    if (distance === 1) {
      currentSpread = clamped;
      updateBookVisuals();
      flipTimer = setTimeout(() => {
        renderInteractiveSpread();
        interactiveLayer.classList.remove('hidden');
      }, 480);
    } else {
      // Cascade animation when jumping across chapters via bookmark tabs!
      isTransitioning = true;
      function stepNext() {
        currentSpread += stepDir;
        updateBookVisuals();
        if (currentSpread !== clamped) {
          flipTimer = setTimeout(stepNext, 130);
        } else {
          flipTimer = setTimeout(() => {
            isTransitioning = false;
            renderInteractiveSpread();
            interactiveLayer.classList.remove('hidden');
          }, 520);
        }
      }
      stepNext();
    }
  }

  prevBtn.addEventListener('click', () => jumpToSpread(currentSpread - 1));
  nextBtn.addEventListener('click', () => jumpToSpread(currentSpread + 1));

  window.addEventListener('keydown', (e) => {
    if (videoPortal.classList.contains('active')) {
      if (e.key === 'Escape') closeVideoDiveIn();
      return;
    }
    if (addPolaroidModal.classList.contains('open')) {
      if (e.key === 'Escape') closeCustomPolaroidModalFn();
      return;
    }
    if (envelopeModal.classList.contains('open')) {
      if (e.key === 'Escape') closeEnvelopeModal();
      return;
    }
    if (e.key === 'ArrowRight') jumpToSpread(currentSpread + 1);
    if (e.key === 'ArrowLeft') jumpToSpread(currentSpread - 1);
  });

  // =========================================================================
  // 6. SECRET ENVELOPE PASSCODE MODAL
  // =========================================================================
  const envelopeModal = document.getElementById('envelopeModal');
  const envelopeModalContent = document.getElementById('envelopeModalContent');
  document.getElementById('closeEnvelopeModal').addEventListener('click', closeEnvelopeModal);
  envelopeModal.addEventListener('click', (e) => { if (e.target === envelopeModal) closeEnvelopeModal(); });

  function closeEnvelopeModal() {
    envelopeModal.classList.remove('open');
    envelopeModal.setAttribute('aria-hidden', 'true');
  }

  function spawnSparkles(x, y) {
    const icons = ['✨', '💛', '🤍', '♥', '🌸'];
    for (let i = 0; i < 20; i++) {
      const s = document.createElement('div');
      s.className = 'sparkle';
      s.textContent = icons[i % icons.length];
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      const angle = (Math.PI * 2 * i) / 20 + Math.random() * 0.4;
      const dist = 70 + Math.random() * 140;
      s.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      s.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1400);
    }
  }

  function renderUnlockedLetter(env) {
    const clueHTML = env.giftClue
      ? `
        <div class="gift-clue-box">
          <div class="gift-clue-label">🎁 Pista de dónde está escondido tu regalo</div>
          <div class="gift-clue-text">${env.giftClue}</div>
        </div>
      `
      : '';

    envelopeModalContent.innerHTML = `
      <div class="wax-big" style="background:radial-gradient(circle at 35% 30%, #7bc491, #3c7d52);">🎁</div>
      <div style="font-size:0.74rem; letter-spacing:0.15em; text-transform:uppercase; color:#3c7d52; font-weight:700;">Sobre Desbloqueado</div>
      <h2 style="font-family:'Cormorant Garamond',serif; font-size:1.85rem; margin-top:4px;">${env.secretTitle}</h2>
      <div class="secret-letter-paper">${env.secretMessage}</div>
      ${clueHTML}
      <button class="unlock-btn" style="margin-top:16px;" id="doneSecretBtn">¡A buscar el regalo! ♥</button>
    `;
    document.getElementById('doneSecretBtn').onclick = closeEnvelopeModal;
  }

  function openEnvelopeModal(env) {
    if (isEnvelopeUnlocked(env)) {
      renderUnlockedLetter(env);
      envelopeModal.classList.add('open');
      envelopeModal.setAttribute('aria-hidden', 'false');
      return;
    }

    envelopeModalContent.innerHTML = `
      <div class="wax-big">🔒</div>
      <div style="font-size:0.74rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--accent); font-weight:700;">Mensaje Privado</div>
      <h2 style="font-family:'Cormorant Garamond',serif; font-size:1.9rem; margin-top:4px;">${env.title}</h2>
      <p style="font-size:0.88rem; color:var(--muted); margin-top:8px; line-height:1.5;">${env.hint}</p>
      <form id="codeForm">
        <input class="code-input" id="codeInput" autocomplete="off" placeholder="CÓDIGO" />
        <div id="codeError" style="font-size:0.8rem; color:var(--accent); min-height:20px; margin-top:6px;"></div>
        <button type="submit" class="unlock-btn">Romper sello y abrir</button>
      </form>
    `;
    envelopeModal.classList.add('open');
    envelopeModal.setAttribute('aria-hidden', 'false');
    const input = document.getElementById('codeInput');
    setTimeout(() => input.focus(), 80);

    document.getElementById('codeForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = input.value.trim().toUpperCase();
      const expected = String(env.code).trim().toUpperCase();
      if (entered === expected || (expected === '6' && entered === '06')) {
        markEnvelopeUnlocked(env);
        spawnSparkles(window.innerWidth / 2, window.innerHeight / 2);
        updateGiftProgressUI();
        if (allEnvelopes.every(x => isEnvelopeUnlocked(x))) {
          setTimeout(() => spawnSparkles(window.innerWidth * 0.35, window.innerHeight * 0.4), 220);
          setTimeout(() => spawnSparkles(window.innerWidth * 0.65, window.innerHeight * 0.4), 420);
        }
        renderUnlockedLetter(env);
        renderInteractiveSpread();
      } else {
        document.getElementById('codeError').textContent = 'Mmm, ese no es… mirá la pista 😉';
        input.select();
      }
    });
  }

  // =========================================================================
  // 7. CINEMATIC VIDEO "CAMERA DIVE-IN" PORTAL
  // =========================================================================
  const videoPortal = document.getElementById('videoPortal');
  const videoPortalFrame = document.getElementById('videoPortalFrame');
  const realVideo = document.getElementById('realVideo');
  const demoCanvas = document.getElementById('demoVideoCanvas');
  const demoHud = document.getElementById('demoVideoHud');
  const demoPlayToggle = document.getElementById('demoPlayToggle');
  const demoProgressBar = document.getElementById('demoProgressBar');
  const demoTimeEl = document.getElementById('demoTime');
  const closeVideoBtn = document.getElementById('closeVideoBtn');

  let activeVideoOriginRect = null;
  let demoAnimId = null;
  let demoPlaying = true;
  let demoElapsed = 0;
  let demoLastTs = 0;
  let demoItem = null;

  function openVideoDiveIn(item, chapter, sourceFrameEl) {
    const rect = sourceFrameEl.getBoundingClientRect();
    activeVideoOriginRect = rect;

    document.getElementById('videoYearBadge').textContent = chapter.yearLabel;
    document.getElementById('videoTitle').textContent = item.caption;
    document.getElementById('videoSubtitle').textContent = item.videoDesc || item.backNote;

    // 1. Place portal frame EXACTLY over the clicked Polaroid image
    videoPortalFrame.style.transition = 'none';
    videoPortalFrame.style.top = rect.top + 'px';
    videoPortalFrame.style.left = rect.left + 'px';
    videoPortalFrame.style.width = rect.width + 'px';
    videoPortalFrame.style.height = rect.height + 'px';
    videoPortalFrame.style.borderRadius = '4px';

    // Setup real <video> vs animated romantic demo canvas
    if (item.videoSrc) {
      realVideo.src = item.videoSrc;
      realVideo.style.display = 'block';
      demoCanvas.style.display = 'none';
      demoHud.style.display = 'none';
    } else {
      realVideo.style.display = 'none';
      realVideo.removeAttribute('src');
      demoCanvas.style.display = 'block';
      demoHud.style.display = 'flex';
      startDemoFilm(item);
    }

    videoPortal.classList.add('active');
    videoPortal.setAttribute('aria-hidden', 'false');
    // Force reflow before animating
    void videoPortalFrame.offsetWidth;

    // 2. Camera dive-in: zoom the entire notebook directly into the center of the Polaroid!
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    cameraStage.style.transformOrigin = `${cx}px ${cy}px`;
    cameraStage.classList.add('diving');
    cameraStage.style.transform = 'scale(3.6)';

    // 3. Expand portal frame smoothly to fullscreen
    videoPortalFrame.style.transition = '';
    requestAnimationFrame(() => {
      videoPortal.classList.add('expanded');
      videoPortalFrame.style.top = '0px';
      videoPortalFrame.style.left = '0px';
      videoPortalFrame.style.width = '100vw';
      videoPortalFrame.style.height = '100vh';
      videoPortalFrame.style.borderRadius = '0px';

      if (item.videoSrc) {
        realVideo.play().catch(() => {});
      }
    });
  }

  function closeVideoDiveIn() {
    if (!videoPortal.classList.contains('active')) return;
    realVideo.pause();
    stopDemoFilm();

    // Reverse camera pull-out: shrink video back into the exact Polaroid & zoom notebook back to 1
    videoPortal.classList.remove('expanded');
    if (activeVideoOriginRect) {
      videoPortalFrame.style.top = activeVideoOriginRect.top + 'px';
      videoPortalFrame.style.left = activeVideoOriginRect.left + 'px';
      videoPortalFrame.style.width = activeVideoOriginRect.width + 'px';
      videoPortalFrame.style.height = activeVideoOriginRect.height + 'px';
      videoPortalFrame.style.borderRadius = '4px';
    }

    cameraStage.style.transform = 'scale(1)';
    cameraStage.classList.remove('diving');

    setTimeout(() => {
      videoPortal.classList.remove('active');
      videoPortal.setAttribute('aria-hidden', 'true');
      cameraStage.style.transform = '';
    }, 690);
  }

  closeVideoBtn.addEventListener('click', closeVideoDiveIn);
  document.getElementById('videoBackdrop').addEventListener('click', closeVideoDiveIn);

  // Romantic Animated Film Reel Demo (runs inside <canvas> until user links real .mp4)
  const PALETTES = {
    autumn: ['#2e1915', '#b5563c', '#f3c189'],
    beach: ['#1d2838', '#d97e5e', '#fce0aa'],
    mountains: ['#11182c', '#3c456e', '#d6a49d'],
    home: ['#1c141d', '#543547', '#f7cf86'],
    dinner: ['#1a0f16', '#692a3b', '#ffbe78'],
    coffee: ['#2b1b15', '#9c5c43', '#f5d4ae']
  };
  const bokehDots = Array.from({ length: 34 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 12 + Math.random() * 44,
    vx: (Math.random() - 0.5) * 0.015,
    vy: -0.008 - Math.random() * 0.018,
    alpha: 0.1 + Math.random() * 0.28
  }));

  function startDemoFilm(item) {
    stopDemoFilm();
    demoItem = item;
    demoPlaying = true;
    demoElapsed = 0;
    demoLastTs = performance.now();
    demoPlayToggle.textContent = '❚❚';
    demoAnimId = requestAnimationFrame(renderDemoFrame);
  }

  function stopDemoFilm() {
    if (demoAnimId) cancelAnimationFrame(demoAnimId);
    demoAnimId = null;
  }

  demoPlayToggle.addEventListener('click', () => {
    demoPlaying = !demoPlaying;
    demoPlayToggle.textContent = demoPlaying ? '❚❚' : '▶';
    demoLastTs = performance.now();
  });

  function renderDemoFrame(ts) {
    const dt = (ts - demoLastTs) / 1000;
    demoLastTs = ts;
    const totalDur = 18;
    if (demoPlaying) {
      demoElapsed = (demoElapsed + dt) % totalDur;
    }

    const ctx = demoCanvas.getContext('2d');
    const W = demoCanvas.width;
    const H = demoCanvas.height;
    const pal = PALETTES[demoItem?.scene] || PALETTES.dinner;

    // Warm animated cinema sky gradient
    const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
    g.addColorStop(0, pal[0]);
    g.addColorStop(0.55, pal[1]);
    g.addColorStop(1, pal[2]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Floating warm bokeh lights
    bokehDots.forEach(d => {
      if (demoPlaying) {
        d.x = (d.x + d.vx * dt + 1) % 1;
        d.y = (d.y + d.vy * dt + 1) % 1;
      }
      ctx.beginPath();
      ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 236, 196, ${d.alpha})`;
      ctx.fill();
    });

    // Subtle vintage Super-8 film frame & vignette
    const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, W * 0.65);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.62)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // Center romantic title card on the film
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 246, 232, 0.94)';
    ctx.font = 'italic 600 54px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(demoItem?.caption || 'Nuestro recuerdo', W / 2, H / 2 - 14);

    ctx.fillStyle = 'rgba(255, 232, 198, 0.78)';
    ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(demoItem?.date || '', W / 2, H / 2 + 34);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
    ctx.font = '400 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Acá se reproducirá tu video real (.mp4) cuando lo cargues en album-data.js', W / 2, H / 2 + 78);

    // Update scrubber UI
    demoProgressBar.style.width = ((demoElapsed / totalDur) * 100) + '%';
    const sec = Math.floor(demoElapsed);
    demoTimeEl.textContent = `0:${String(sec).padStart(2, '0')} / 0:${totalDur}`;

    demoAnimId = requestAnimationFrame(renderDemoFrame);
  }

  // =========================================================================
  // 8. BACKGROUND MUSIC (Custom MP3 OR gentle offline music-box synth)
  // =========================================================================
  const musicBtn = document.getElementById('musicBtn');
  const musicLabel = document.getElementById('musicLabel');
  const bgAudio = document.getElementById('bgAudio');
  let audioCtx = null, synthTimer = null, musicPlaying = false, noteStep = 0;
  const melody = [261.63, 329.63, 392.00, 493.88, 440.00, 392.00, 329.63, 293.66];

  function playSynthNote() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = melody[noteStep % melody.length];
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.04, audioCtx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.4);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.5);
    noteStep++;
  }

  musicBtn.addEventListener('click', () => {
    if (!musicPlaying) {
      musicPlaying = true;
      musicBtn.classList.add('playing');
      musicLabel.textContent = 'Sonando';
      if (DATA.meta.musicSrc) {
        bgAudio.src = DATA.meta.musicSrc;
        bgAudio.volume = 0.45;
        bgAudio.play().catch(() => {});
      } else {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        playSynthNote();
        synthTimer = setInterval(playSynthNote, 960);
      }
    } else {
      musicPlaying = false;
      musicBtn.classList.remove('playing');
      musicLabel.textContent = 'Música';
      bgAudio.pause();
      clearInterval(synthTimer);
    }
  });

  // =========================================================================
  // 9. FLOATING DECORATION STUDIO (Drag from palette directly onto the page!)
  // =========================================================================
  const decorBtn = document.getElementById('decorBtn');
  const decorPalette = document.getElementById('decorPalette');
  const closeDecorBtn = document.getElementById('closeDecorBtn');
  const decorGrid = document.getElementById('decorGrid');
  const decorCats = document.getElementById('decorCats');
  const clearDecorBtn = document.getElementById('clearDecorBtn');
  const exportDecorBtn = document.getElementById('exportDecorBtn');
  const decorToast = document.getElementById('decorToast');

  let activeDecorCat = 'all';

  function showDecorToast(msg) {
    decorToast.textContent = msg;
    clearTimeout(showDecorToast._t);
    showDecorToast._t = setTimeout(() => { decorToast.textContent = ''; }, 2800);
  }

  function toggleDecorPalette(forceOpen) {
    const willOpen = typeof forceOpen === 'boolean' ? forceOpen : !decorPalette.classList.contains('open');
    decorPalette.classList.toggle('open', willOpen);
    decorPalette.setAttribute('aria-hidden', String(!willOpen));
    decorBtn.classList.toggle('open', willOpen);

    // If user opens Decorate while still on Cover/Index, jump smoothly to Año 1 so they can decorate right away!
    if (willOpen && (currentSpread < 2 || currentSpread >= TOTAL_SPREADS)) {
      jumpToSpread(2);
      showDecorToast('Abriendo Año 1 para que decores ✨');
    }
  }

  decorBtn.addEventListener('click', () => toggleDecorPalette());
  closeDecorBtn.addEventListener('click', () => toggleDecorPalette(false));

  function addDecorationToCurrentChapter(def, xPct, yPct) {
    if (currentSpread < 2 || currentSpread >= TOTAL_SPREADS) {
      showDecorToast('Abrí un capítulo (Año 1 a 6) para pegar adornos 📖');
      return;
    }
    const ch = DATA.chapters[currentSpread - 2];
    if (isChapterLocked(ch)) {
      showDecorToast('Este capítulo todavía está sellado ⏳');
      return;
    }
    const arr = getChapterDecors(ch);
    arr.push({
      id: 'dec-' + Date.now() + '-' + Math.floor(Math.random() * 999),
      type: def.type,
      x: +xPct.toFixed(2),
      y: +yPct.toFixed(2),
      rot: def.isGarland ? 0 : Math.round((Math.random() - 0.5) * 14),
      scale: 1,
      z: ++topZ,
      text: def.defaultText || undefined
    });
    saveDecors();
    renderChapterDecorations(ch);
  }

  function renderDecorPalette() {
    const items = activeDecorCat === 'all'
      ? DECOR_CATALOG
      : DECOR_CATALOG.filter(c => c.cat === activeDecorCat);

    decorGrid.innerHTML = items.map(def => `
      <div class="decor-tile" data-type="${def.type}">
        <div class="decor-tile-preview">${def.svg}</div>
        <span class="decor-tile-name">${def.name}</span>
      </div>
    `).join('');

    decorGrid.querySelectorAll('.decor-tile').forEach(tile => {
      const def = DECOR_CATALOG.find(c => c.type === tile.dataset.type);
      let startX = 0, startY = 0, dragging = false, ghost = null;

      tile.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        tile.setPointerCapture(e.pointerId);
        startX = e.clientX;
        startY = e.clientY;
        dragging = false;
      });

      tile.addEventListener('pointermove', (e) => {
        if (!tile.hasPointerCapture(e.pointerId)) return;
        if (!dragging && Math.hypot(e.clientX - startX, e.clientY - startY) > 6) {
          dragging = true;
          ghost = document.createElement('div');
          ghost.className = 'decor-drag-ghost';
          ghost.style.width = def.width + 'px';
          ghost.innerHTML = def.svg;
          document.body.appendChild(ghost);
          interactiveLayer.classList.add('drop-target');
        }
        if (dragging && ghost) {
          ghost.style.left = e.clientX + 'px';
          ghost.style.top = e.clientY + 'px';
        }
      });

      tile.addEventListener('pointerup', (e) => {
        if (tile.hasPointerCapture(e.pointerId)) {
          tile.releasePointerCapture(e.pointerId);
        }
        interactiveLayer.classList.remove('drop-target');
        if (ghost) { ghost.remove(); ghost = null; }

        if (dragging) {
          const rect = interactiveLayer.getBoundingClientRect();
          const inside =
            e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom;
          if (inside) {
            const xPct = ((e.clientX - rect.left - def.width / 2) / rect.width) * 100;
            const yPct = ((e.clientY - rect.top - 30) / rect.height) * 100;
            addDecorationToCurrentChapter(def, Math.max(1, Math.min(86, xPct)), Math.max(1, Math.min(84, yPct)));
            showDecorToast(`¡${def.name} pegado! ✨`);
          }
        } else {
          // Simple click drops it cleanly on the open page
          const randX = def.isGarland ? (Math.random() > 0.5 ? 54 : 8) : (16 + Math.random() * 58);
          const randY = def.isGarland ? 4 : (22 + Math.random() * 44);
          addDecorationToCurrentChapter(def, randX, randY);
          showDecorToast(`¡${def.name} agregado! Arrastralo donde quieras`);
        }
        dragging = false;
      });
    });
  }

  decorCats.addEventListener('click', (e) => {
    if (!e.target.matches('.decor-cat')) return;
    decorCats.querySelectorAll('.decor-cat').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    activeDecorCat = e.target.dataset.cat;
    renderDecorPalette();
  });

  clearDecorBtn.addEventListener('click', () => {
    if (currentSpread < 2 || currentSpread >= TOTAL_SPREADS) return;
    const ch = DATA.chapters[currentSpread - 2];
    storedDecors[ch.id] = [];
    saveDecors();
    renderChapterDecorations(ch);
    showDecorToast('Adornos de esta hoja limpiados');
  });

  exportDecorBtn.addEventListener('click', () => {
    if (currentSpread < 2 || currentSpread >= TOTAL_SPREADS) return;
    const ch = DATA.chapters[currentSpread - 2];
    const decors = getChapterDecors(ch);
    const snippet = `decorations: ${JSON.stringify(decors, null, 2)}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(snippet).then(
        () => showDecorToast('¡Copiado! Pegalo en este capítulo en album-data.js 📋'),
        () => showDecorToast('Copiado en consola (F12)')
      );
    } else {
      showDecorToast('Revisá la consola (F12) para copiar el JSON');
    }
    console.log(`[${ch.id}] ${snippet}`);
  });

  // Deselect decoration toolbar when clicking empty background
  document.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.decor-placed')) {
      interactiveLayer.querySelectorAll('.decor-placed.selected').forEach(n => n.classList.remove('selected'));
    }
  });

  // =========================================================================
  // 10. CUSTOM PHOTO POLAROID CREATOR (Upload photo -> compress -> paste!)
  // =========================================================================
  const openAddPolaroidBtn = document.getElementById('openAddPolaroidBtn');
  const addPolaroidModal = document.getElementById('addPolaroidModal');
  const closeAddPolaroidModal = document.getElementById('closeAddPolaroidModal');
  const addPolaroidForm = document.getElementById('addPolaroidForm');
  const polFileInput = document.getElementById('polFileInput');
  const photoDropzone = document.getElementById('photoDropzone');
  const polPreviewImg = document.getElementById('polPreviewImg');
  const polCaptionInput = document.getElementById('polCaptionInput');
  const polDateInput = document.getElementById('polDateInput');
  const polBackNoteInput = document.getElementById('polBackNoteInput');
  const polFormError = document.getElementById('polFormError');

  let pendingPolaroidDataUrl = '';

  function openCustomPolaroidModal() {
    if (currentSpread < 2 || currentSpread >= TOTAL_SPREADS) {
      jumpToSpread(2);
    }
    const ch = DATA.chapters[currentSpread - 2];
    if (ch && isChapterLocked(ch)) {
      showDecorToast('Este capítulo todavía está sellado ⏳');
      return;
    }
    pendingPolaroidDataUrl = '';
    addPolaroidForm.reset();
    photoDropzone.classList.remove('has-img');
    polPreviewImg.removeAttribute('src');
    polFormError.textContent = '';
    addPolaroidModal.classList.add('open');
    addPolaroidModal.setAttribute('aria-hidden', 'false');
  }

  function closeCustomPolaroidModalFn() {
    addPolaroidModal.classList.remove('open');
    addPolaroidModal.setAttribute('aria-hidden', 'true');
  }

  openAddPolaroidBtn.addEventListener('click', openCustomPolaroidModal);
  closeAddPolaroidModal.addEventListener('click', closeCustomPolaroidModalFn);
  addPolaroidModal.addEventListener('click', (e) => {
    if (e.target === addPolaroidModal) closeCustomPolaroidModalFn();
  });

  // Resize & compress uploaded image cleanly so localStorage can store many photos
  function compressImageFile(file, maxSize = 680) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  polFileInput.addEventListener('change', async () => {
    const file = polFileInput.files && polFileInput.files[0];
    if (!file) return;
    polFormError.textContent = '';
    try {
      pendingPolaroidDataUrl = await compressImageFile(file);
      polPreviewImg.src = pendingPolaroidDataUrl;
      photoDropzone.classList.add('has-img');
    } catch {
      polFormError.textContent = 'No pudimos leer esa imagen. Probá con JPG o PNG.';
    }
  });

  addPolaroidForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!pendingPolaroidDataUrl) {
      polFormError.textContent = 'Elegí una foto primero 📷';
      return;
    }
    const ch = DATA.chapters[currentSpread - 2];
    if (!ch) return;

    const tape = (addPolaroidForm.querySelector('input[name="polTape"]:checked') || {}).value || 'default';
    const newPol = {
      id: 'custom-pol-' + Date.now(),
      type: 'photo',
      isCustom: true,
      imageSrc: pendingPolaroidDataUrl,
      caption: polCaptionInput.value.trim() || 'Nuestro recuerdo ♥',
      date: polDateInput.value.trim() || ch.tabLabel,
      backNote: polBackNoteInput.value.trim() || 'Agregada al álbum con amor ♥',
      tape,
      x: 24 + Math.round(Math.random() * 28),
      y: 26 + Math.round(Math.random() * 20),
      rot: Math.round((Math.random() - 0.5) * 10)
    };

    if (!customPolaroids[ch.id]) customPolaroids[ch.id] = [];
    customPolaroids[ch.id].push(newPol);
    saveCustomPolaroids();
    closeCustomPolaroidModalFn();
    renderInteractiveSpread();
    spawnSparkles(window.innerWidth / 2, window.innerHeight / 2);
    showDecorToast('¡Nueva Polaroid pegada en la hoja! 📸');
  });

  renderDecorPalette();

  // Live countdown ticker for scheduled chapters (auto-reloads cleanly when a chapter unlocks!)
  let unlockReloadTriggered = false;
  function tickScheduledCountdowns() {
    const grids = bookEl.querySelectorAll('.countdown-grid[data-unlock-at]');
    if (!grids.length) return;
    const now = getSyncedNow();
    grids.forEach(grid => {
      const targetTs = Date.parse(grid.dataset.unlockAt);
      if (Number.isNaN(targetTs)) return;
      const diff = targetTs - now;
      if (diff <= 0) {
        grid.querySelector('[data-cd="d"]').textContent = '00';
        grid.querySelector('[data-cd="h"]').textContent = '00';
        grid.querySelector('[data-cd="m"]').textContent = '00';
        grid.querySelector('[data-cd="s"]').textContent = '00';
        if (!unlockReloadTriggered) {
          unlockReloadTriggered = true;
          spawnSparkles(window.innerWidth / 2, window.innerHeight / 2);
          setTimeout(() => window.location.reload(), 1200);
        }
        return;
      }
      const totalSec = Math.floor(diff / 1000);
      const d = Math.floor(totalSec / 86400);
      const h = Math.floor((totalSec % 86400) / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      grid.querySelector('[data-cd="d"]').textContent = String(d).padStart(2, '0');
      grid.querySelector('[data-cd="h"]').textContent = String(h).padStart(2, '0');
      grid.querySelector('[data-cd="m"]').textContent = String(m).padStart(2, '0');
      grid.querySelector('[data-cd="s"]').textContent = String(s).padStart(2, '0');
    });
  }
  tickScheduledCountdowns();
  setInterval(tickScheduledCountdowns, 1000);

  // Init
  updateGiftProgressUI();
  updateBookVisuals();
  renderInteractiveSpread();
})();
