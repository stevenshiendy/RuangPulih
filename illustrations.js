// ===== RUANG PULIH — ILLUSTRATIONS =====
// Hand-built flat SVG scenes in the brand palette (pebbles, forest, sand, amber).
// No stock photos: every scene reuses the pebble motif so the app feels like one world.

const INK = '#1D2620';
const PAPER = '#FFFDF8';
const FOREST = '#2F5A3C';
const CLAY = '#CF4F3B';
const AMBER = '#EFB34A';
const SAGE = '#9DC08B';
const MOSS = '#6F9A70';

const svg = (vb, body, cls = 'illo', extra = '') => `<svg class="${cls}" viewBox="${vb}" ${extra} aria-hidden="true">${body}</svg>`;
const sparkle = (x, y, s = 1, fill = PAPER) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0-7C1-2 2-1 7 0 2 1 1 2 0 7-1 2-2 1-7 0-2-1-1-2 0-7z" fill="${fill}"/>`;
const face = (x, y, mood = 'smile', gap = 12) => {
  const l = x - gap / 2, r = x + gap / 2;
  const eyes = mood === 'calm'
    ? `<path d="M${l - 2.5} ${y}q2.5 2.2 5 0M${r - 2.5} ${y}q2.5 2.2 5 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`
    : `<circle cx="${l}" cy="${y}" r="2.1" fill="${INK}"/><circle cx="${r}" cy="${y}" r="2.1" fill="${INK}"/>`;
  const mouth = mood === 'flat' ? `M${x - 4} ${y + 9}h8` : `M${x - 4.5} ${y + 7.5}q4.5 3.6 9 0`;
  return `${eyes}<path d="${mouth}" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
};

const ILLO = {
  // Welcome: a cairn of balanced pebbles with a sprout — steadiness, growing back.
  cairn: () => svg('0 0 240 250', `
    <circle cx="178" cy="62" r="34" fill="${AMBER}" opacity=".9"/>
    ${sparkle(46, 54, 1.1, AMBER)}${sparkle(206, 128, .8)}${sparkle(30, 150, .7)}
    <ellipse cx="120" cy="240" rx="96" ry="8" fill="#000" opacity=".16"/>
    <path d="M30 210c0-22 36-36 88-36s92 14 92 36-40 30-90 30-90-8-90-30z" fill="var(--m2)"/>
    ${face(120, 206, 'calm', 26)}
    <path d="M56 166c0-18 28-31 64-31s66 12 66 30-28 24-64 24-66-5-66-23z" fill="var(--m4)"/>
    ${face(120, 160, 'smile', 22)}
    <path d="M78 124c0-15 19-26 43-26s45 11 45 25-20 21-44 21-44-5-44-20z" fill="var(--m3)"/>
    ${face(121, 120, 'calm', 18)}
    <path d="M98 87c0-13 12-22 26-22s26 9 26 22-12 18-26 18-26-5-26-18z" fill="var(--m5)"/>
    ${face(124, 84, 'smile', 14)}
    <path d="M124 66c0-10-1-16 2-28" stroke="${SAGE}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M126 44c8-10 20-11 25-6-6 9-17 11-25 6z" fill="${SAGE}"/>
    <path d="M125 53c-8-8-18-8-22-4 6 8 15 9 22 4z" fill="${MOSS}"/>`, 'illo welcome-art'),

  // Home greeting: the sky changes with the time of day.
  daytime: () => {
    const h = new Date().getHours();
    const t = h < 11 ? 'pagi' : h < 15 ? 'siang' : h < 18 ? 'sore' : 'malam';
    const sky = { pagi: '#F8E3BD', siang: '#D5E6EE', sore: '#F3CDB0', malam: '#2E3A52' }[t];
    const celestial = {
      pagi: `<circle cx="50" cy="60" r="17" fill="${AMBER}"/>`,
      siang: `<circle cx="64" cy="28" r="12" fill="${AMBER}"/><g fill="${PAPER}"><circle cx="24" cy="34" r="7"/><circle cx="33" cy="31" r="9"/><circle cx="42" cy="35" r="6"/><rect x="20" y="34" width="26" height="7" rx="3.5"/></g>`,
      sore: `<circle cx="34" cy="52" r="15" fill="#E58B4C"/><path d="M58 30h18M64 38h12" stroke="${PAPER}" stroke-width="3" stroke-linecap="round" opacity=".7"/>`,
      malam: `<circle cx="62" cy="30" r="12" fill="#F3E3B5"/><circle cx="68" cy="25" r="10.5" fill="${sky}"/>${sparkle(26, 24, .6)}${sparkle(40, 42, .4)}${sparkle(80, 50, .45)}`,
    }[t];
    return `<span class="daytime" title="Selamat ${t}">${svg('0 0 96 96', `
      <rect width="96" height="96" fill="${sky}"/>${celestial}
      <path d="M0 68c16-12 34-14 52-6s32 4 44-2v36H0z" fill="${t === 'malam' ? '#5C7A5E' : SAGE}"/>
      <path d="M0 80c20-8 40-6 58 2s30 6 38 2v12H0z" fill="${t === 'malam' ? '#3F5A44' : MOSS}"/>
      <rect x="69" y="60" width="3" height="12" rx="1.5" fill="#4A3A2C"/><circle cx="70.5" cy="57" r="8" fill="${FOREST}"/>`)}</span>`;
  },

  // Covers for articles and practices (160×120 scenes on the card's pastel colour).
  cover: {
    'thought-record': `
      <circle cx="124" cy="34" r="30" fill="#fff" opacity=".35"/>
      <g transform="rotate(-6 80 74)">
        <rect x="34" y="47" width="92" height="58" rx="8" fill="${FOREST}"/>
        <rect x="38" y="43" width="42" height="57" rx="5" fill="${PAPER}"/><rect x="80" y="43" width="42" height="57" rx="5" fill="${PAPER}"/>
        <path d="M46 57h26M46 65h20M46 73h26M46 81h16M88 57h26M88 65h18" stroke="${INK}" stroke-opacity=".22" stroke-width="3" stroke-linecap="round"/>
        <path d="M89 80l5 5 10-10" stroke="${FOREST}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <g transform="rotate(35 120 84)"><rect x="115" y="62" width="9" height="40" rx="2" fill="${AMBER}"/><rect x="115" y="62" width="9" height="7" rx="2" fill="${CLAY}"/><path d="M115 102l4.5 9 4.5-9z" fill="#F3D9B1"/><path d="M118 108l1.5 3.5 1.5-3.5z" fill="${INK}"/></g>
      <g fill="${PAPER}"><circle cx="38" cy="24" r="10"/><circle cx="52" cy="19" r="13"/><circle cx="67" cy="25" r="9"/><rect x="31" y="22" width="42" height="12" rx="6"/><circle cx="40" cy="40" r="3.2"/></g>
      <g fill="${INK}" opacity=".45"><circle cx="44" cy="26" r="2.2"/><circle cx="52" cy="26" r="2.2"/><circle cx="60" cy="26" r="2.2"/></g>`,
    'therapy-myths': `
      <circle cx="26" cy="100" r="28" fill="#fff" opacity=".3"/>
      <path d="M22 22h62a10 10 0 0 1 10 10v26a10 10 0 0 1-10 10H48l-13 11V68H22a10 10 0 0 1-10-10V32a10 10 0 0 1 10-10z" fill="${PAPER}"/>
      <path d="M44 38c0-5 4-8 9-8s9 3 9 8c0 6-9 6-9 12" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="53" cy="58" r="2.6" fill="${INK}"/>
      <circle cx="90" cy="24" r="9" fill="${CLAY}"/><path d="M86.5 20.5l7 7M93.5 20.5l-7 7" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M80 60h52a10 10 0 0 1 10 10v20a10 10 0 0 1-10 10h-6v11l-13-11H80a10 10 0 0 1-10-10V70a10 10 0 0 1 10-10z" fill="${FOREST}"/>
      <path d="M95 80l7 7 15-15" stroke="${PAPER}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${sparkle(140, 34, .8)}`,
    boundary: `
      <circle cx="30" cy="28" r="14" fill="${AMBER}" opacity=".8"/>
      <ellipse cx="80" cy="104" rx="66" ry="10" fill="#fff" opacity=".35"/>
      <g fill="${PAPER}"><rect x="118" y="62" width="7" height="40" rx="3"/><rect x="131" y="58" width="7" height="44" rx="3"/><rect x="144" y="62" width="7" height="40" rx="3"/><rect x="114" y="70" width="40" height="5" rx="2.5"/><rect x="114" y="84" width="40" height="5" rx="2.5"/></g>
      <ellipse cx="68" cy="92" rx="44" ry="15" fill="none" stroke="${FOREST}" stroke-width="3" stroke-dasharray="6 6"/>
      <path d="M46 90c0-18 10-32 24-32s24 14 24 32c0 6-10 9-24 9s-24-3-24-9z" fill="${SAGE}"/>
      ${face(70, 74, 'smile', 12)}
      <path d="M92 76q9-3 11-14" stroke="${SAGE}" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="104" cy="58" r="6" fill="${SAGE}"/>
      <path d="M24 98V84" stroke="${FOREST}" stroke-width="2.5" stroke-linecap="round"/><path d="M24 88c-6-1-9-6-9-10 6 0 9 4 9 10zM24 85c6-1 9-6 9-10-6 0-9 4-9 10z" fill="${MOSS}"/>`,
    burnout: `
      <circle cx="126" cy="30" r="14" fill="${PAPER}"/><circle cx="132" cy="25" r="12" fill="var(--m5)"/>
      <path d="M86 24h8l-8 9h8M100 12h5l-5 6h5" stroke="${INK}" stroke-opacity=".5" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="78" cy="104" rx="56" ry="8" fill="#000" opacity=".1"/>
      <rect x="36" y="52" width="78" height="44" rx="11" fill="${PAPER}"/><rect x="114" y="65" width="8" height="18" rx="3" fill="${PAPER}"/>
      <rect x="43" y="59" width="15" height="30" rx="5" fill="${CLAY}"/>
      <path d="M74 52c0-8 0-13 2-20" stroke="${FOREST}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M76 36c6-8 15-9 19-6-4 8-13 10-19 6z" fill="${FOREST}"/><path d="M75 43c-6-6-14-6-17-3 4 7 12 8 17 3z" fill="${MOSS}"/>`,
    breath: `
      <circle cx="80" cy="60" r="52" fill="#fff" opacity=".16"/><circle cx="80" cy="60" r="38" fill="#fff" opacity=".24"/><circle cx="80" cy="60" r="25" fill="#fff" opacity=".4"/>
      <path d="M65 64c0-10 7-17 15-17s15 7 15 17-7 13-15 13-15-3-15-13z" fill="${PAPER}"/>
      ${face(80, 62, 'calm', 11)}
      <path d="M8 42h30c9 0 9-11 2-11M120 84h30c9 0 9 11 2 11M10 78h20M130 40h22" stroke="${PAPER}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    'body-scan': `
      <circle cx="130" cy="26" r="16" fill="#fff" opacity=".35"/>
      <ellipse cx="80" cy="96" rx="40" ry="11" fill="${PAPER}"/>
      <path d="M64 88c0-20 7-34 16-34s16 14 16 34z" fill="${PAPER}"/>
      <path d="M67 66q-15 10-11 24M93 66q15 10 11 24" stroke="${PAPER}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <circle cx="80" cy="40" r="11" fill="${PAPER}"/>${face(80, 39, 'calm', 8)}
      <rect x="22" y="58" width="116" height="10" rx="5" fill="${AMBER}" opacity=".25"/>
      <path d="M24 63h112" stroke="${AMBER}" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>
      ${sparkle(30, 30, .7)}`,
    kindness: `
      ${sparkle(34, 30, .9)}${sparkle(128, 24, .7)}${sparkle(140, 62, .5)}
      <path d="M80 86c-22-14-30-26-30-38 0-9 7-15 15-15 7 0 12 4 15 9 3-5 8-9 15-9 8 0 15 6 15 15 0 12-8 24-30 38z" fill="${CLAY}"/>
      <path d="M72 46c-3-4-7-5-10-3" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/>
      <path d="M20 80c14 0 30 6 42 18 4 5 0 11-6 9-12-4-24-6-36-6z" fill="${PAPER}"/>
      <path d="M140 80c-14 0-30 6-42 18-4 5 0 11 6 9 12-4 24-6 36-6z" fill="${PAPER}"/>`,
    gratitude: `
      <circle cx="128" cy="28" r="18" fill="#fff" opacity=".4"/>
      ${sparkle(40, 30, .9, AMBER)}${sparkle(116, 58, .6, AMBER)}${sparkle(52, 56, .5, AMBER)}
      <path d="M80 76V44" stroke="${FOREST}" stroke-width="4" stroke-linecap="round"/>
      <path d="M80 58c-13-2-21-10-21-21 13 0 21 8 21 21z" fill="${MOSS}"/><path d="M80 51c13-2 21-10 21-21-13 0-21 8-21 21z" fill="${FOREST}"/>
      <rect x="54" y="74" width="52" height="10" rx="4" fill="#B5643F"/><path d="M58 84h44l-6 26H64z" fill="#C9774F"/>`,
  },

  // Learn feature: a tangled thought becoming clear.
  untangle: () => svg('0 0 170 160', `
    <path d="M28 52c10-22 32 8 20 20s-32-10-10-26 36 6 24 22-32 2-14-14 32-4 26 12" stroke="${INK}" stroke-opacity=".55" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M96 50h20m-6-6 6 6-6 6" stroke="${FOREST}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="140" cy="50" r="15" fill="${PAPER}"/><path d="M133 50l5 5 9-9" stroke="${FOREST}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="68" cy="96" r="3.5" fill="${PAPER}"/><circle cx="58" cy="84" r="5" fill="${PAPER}"/>
    <path d="M52 152c0-26 17-44 38-44s38 18 38 44c0 6-17 8-38 8s-38-2-38-8z" fill="var(--m3)"/>
    <circle cx="80" cy="128" r="2.6" fill="${INK}"/><circle cx="98" cy="128" r="2.6" fill="${INK}"/><path d="M84 140h10" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`, 'illo feature-art'),

  // Teman Pulih banner: two pebbles keeping each other company.
  together: () => svg('0 0 150 110', `
    <path d="M12 104c0-22 12-37 29-37s29 15 29 37c0 4-13 6-29 6s-29-2-29-6z" fill="var(--m4)"/>${face(41, 86, 'smile', 12)}
    <path d="M66 104c0-26 15-43 34-43s34 17 34 43c0 4-15 6-34 6s-34-2-34-6z" fill="var(--m5)"/>${face(100, 82, 'calm', 13)}
    <path d="M70 90q-8 4-15 1" stroke="var(--m5)" stroke-width="7" fill="none" stroke-linecap="round"/>
    <circle cx="124" cy="30" r="17" fill="${PAPER}"/><path d="M110 44l4-8 6 5z" fill="${PAPER}"/>
    <path d="M124 38c-7-4-10-8-10-12 0-3 2-5 5-5 2 0 4 1 5 3 1-2 3-3 5-3 3 0 5 2 5 5 0 4-3 8-10 12z" fill="${CLAY}"/>`, 'illo banner-art'),

  // Empty notes state.
  notes: () => svg('0 0 140 96', `
    <ellipse cx="70" cy="90" rx="52" ry="5" fill="#000" opacity=".08"/>
    <rect x="34" y="14" width="64" height="74" rx="8" fill="${PAPER}" stroke="var(--line)"/>
    <path d="M46 32h40M46 42h32M46 52h36" stroke="${INK}" stroke-opacity=".18" stroke-width="3" stroke-linecap="round"/>
    <path d="M86 88c0-14 8-24 18-24s18 10 18 24z" fill="var(--m4)"/>${face(104, 76, 'smile', 9)}
    <g transform="rotate(30 40 70)"><rect x="36" y="50" width="7" height="30" rx="2" fill="${AMBER}"/><path d="M36 80l3.5 7 3.5-7z" fill="#F3D9B1"/></g>`, 'illo empty-art'),

  // App mark used on the sign-in approval screen.
  appMark: () => svg('0 0 48 48', `
    <path d="M10 38c0-5 6-8 14-8s14 3 14 8-6 6-14 6-14-1-14-6z" fill="var(--m2)"/>
    <path d="M14 29c0-4 4-7 10-7s10 3 10 7-4 5-10 5-10-1-10-5z" fill="var(--m4)"/>
    <path d="M18 19c0-4 3-6 6-6s6 2 6 6-3 4-6 4-6-1-6-4z" fill="var(--m5)"/>
    <path d="M24 13c0-3 0-5 1-8" stroke="${SAGE}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M25 7c2-3 5-3 7-2-2 3-5 3-7 2z" fill="${SAGE}"/>`, 'illo'),
};

// Cover art for a card; 'meet' keeps the whole scene visible on any card shape.
function coverArt(key, fit = 'meet') {
  const body = ILLO.cover[key];
  return body ? svg('0 0 160 120', body, 'illo cover-art', `preserveAspectRatio="xMidYMid ${fit}"`) : '';
}

// ---------- Illustrated portraits for Teman Pulih & psychologists ----------
const PEOPLE = {
  dian: { skin: '#E2B48E', hair: '#2B211C', style: 'long', top: FOREST, glasses: true },
  fajar: { skin: '#C68B62', hair: '#1E1A17', style: 'short', top: '#5F7896' },
  siti: { skin: '#D9A57E', hijab: '#B7796B', top: '#B7796B' },
  rudi: { skin: '#C99068', hair: '#2A221D', style: 'short', top: '#B9822A', glasses: true, beard: true },
  'tp-nadia': { skin: '#E2B48E', hijab: '#E9A73C', top: '#E9A73C' },
  'tp-raka': { skin: '#B97E57', hair: '#2B211C', style: 'wavy', top: CLAY },
  'tp-sekar': { skin: '#D9A57E', hair: '#3A2A20', style: 'bun', top: '#7A8AA6' },
};
function portrait(id) {
  const p = typeof id === 'string' ? PEOPLE[id] : id;
  if (!p) return '';
  const body = `<path d="M7 50c0-11 7-18 17-18s17 7 17 18z" fill="${p.top}"/>`;
  const features = `
    <circle cx="20.6" cy="20.5" r="1.15" fill="${INK}"/><circle cx="27.4" cy="20.5" r="1.15" fill="${INK}"/>
    <path d="M21.6 25q2.4 1.8 4.8 0" stroke="${INK}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <circle cx="18.6" cy="23.6" r="1.6" fill="${CLAY}" opacity=".18"/><circle cx="29.4" cy="23.6" r="1.6" fill="${CLAY}" opacity=".18"/>
    ${p.glasses ? `<g stroke="${INK}" stroke-width=".9" fill="none" opacity=".8"><circle cx="20.6" cy="20.6" r="2.7"/><circle cx="27.4" cy="20.6" r="2.7"/><path d="M23.3 20.6h1.4"/></g>` : ''}
    ${p.beard ? `<path d="M17.5 23.5c1 5 3.6 7 6.5 7s5.5-2 6.5-7c-1.6 1.6-3.6 2.4-6.5 2.4s-4.9-.8-6.5-2.4z" fill="${p.hair}" opacity=".85"/>` : ''}`;
  if (p.hijab) {
    return svg('0 0 48 48', `
      <path d="M11 50l3-16c-2-3-3-7-3-11 0-9 6-16 13-16s13 7 13 16c0 4-1 8-3 11l3 16z" fill="${p.hijab}"/>
      <path d="M14 26c3 7 6 9 10 9s7-2 10-9" fill="#000" opacity=".08"/>
      <ellipse cx="24" cy="21.5" rx="7.4" ry="8.6" fill="${p.skin}"/>
      <path d="M16.4 17c1.6-4.4 4.4-6.4 7.6-6.4s6 2 7.6 6.4c-2.4-1.6-5-2.2-7.6-2.2s-5.2.6-7.6 2.2z" fill="${p.hijab}"/>
      ${features}`, 'portrait');
  }
  const back = { long: `<path d="M13 21c0-9 5-14 11-14s11 5 11 14v13c-4 2-18 2-22 0z" fill="${p.hair}"/>`,
    bun: `<circle cx="24" cy="6.5" r="5" fill="${p.hair}"/>` }[p.style] || '';
  const front = {
    short: `<path d="M14.6 19c0-7 4.2-11 9.4-11s9.4 4 9.4 11c-2-3.4-5.4-5-9.4-5s-7.4 1.6-9.4 5z" fill="${p.hair}"/>`,
    wavy: `<path d="M14.4 20c-1-8 4-12.6 9.6-12.6S34.6 12 33.6 20c-1.4-2.6-3-3.4-4.6-3.4-1.4 1.4-3 1.8-5 .6-2 1.2-3.6.8-5-.6-1.6 0-3.2.8-4.6 3.4z" fill="${p.hair}"/>`,
    long: `<path d="M15 19c1.2-6 4.8-9.4 9-9.4s7.8 3.4 9 9.4c-2.6-3.2-5.6-4.6-9-4.6s-6.4 1.4-9 4.6z" fill="${p.hair}"/>`,
    bun: `<path d="M15 19c1.2-6 4.8-9.4 9-9.4s7.8 3.4 9 9.4c-2.6-3.2-5.6-4.6-9-4.6s-6.4 1.4-9 4.6z" fill="${p.hair}"/>`,
  }[p.style];
  return svg('0 0 48 48', `
    ${back}${body}
    <rect x="21" y="27" width="6" height="7" rx="2" fill="${p.skin}"/>
    <ellipse cx="24" cy="21" rx="8.4" ry="9.6" fill="${p.skin}"/>
    ${front}${features}`, 'portrait');
}

// Avatar markup with portrait inside; the face layer clips, so the online dot can sit outside.
function avatarHTML(p, cls = '', style = '') {
  return `<span class="avatar ${cls}" style="--c:${p.c};${style}"><span class="avatar-face">${portrait(p.id) || p.initials}</span></span>`;
}

// ---------- Animated tool art (Alat bantu cards + tool covers) ----------
// Elements carry .a-* classes; the motion lives in styles.css and stops for reduced-motion users.
const origin = (x, y) => `style="transform-origin:${x}px ${y}px"`;
const TOOL_ART = {
  breath: () => svg('0 0 160 120', `
    <g class="a-breathe" ${origin(80, 62)}>
      <circle cx="80" cy="62" r="50" fill="#fff" opacity=".16"/><circle cx="80" cy="62" r="37" fill="#fff" opacity=".24"/><circle cx="80" cy="62" r="25" fill="#fff" opacity=".4"/>
    </g>
    <g class="a-bob" ${origin(80, 64)}>
      <path d="M65 66c0-10 7-17 15-17s15 7 15 17-7 13-15 13-15-3-15-13z" fill="${PAPER}"/>${face(80, 64, 'calm', 11)}
    </g>
    <path class="a-drift" d="M10 40h30c9 0 9-11 2-11" stroke="${PAPER}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path class="a-drift d2" d="M118 88h30c9 0 9 11 2 11" stroke="${PAPER}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path class="a-drift d3" d="M12 82h20M128 36h20" stroke="${PAPER}" stroke-width="3" fill="none" stroke-linecap="round"/>`, 'illo tool-svg'),

  meditate: () => svg('0 0 160 120', `
    <circle class="a-ring" ${origin(80, 66)} cx="80" cy="66" r="40" fill="none" stroke="#fff" stroke-width="2"/>
    <circle class="a-ring d2" ${origin(80, 66)} cx="80" cy="66" r="40" fill="none" stroke="#fff" stroke-width="2"/>
    <circle cx="80" cy="66" r="34" fill="#fff" opacity=".22"/>
    <g class="a-float">
      <ellipse cx="80" cy="96" rx="34" ry="9" fill="${PAPER}"/>
      <path d="M66 90c0-18 6-30 14-30s14 12 14 30z" fill="${PAPER}"/>
      <path d="M68 70q-13 9-9 21M92 70q13 9 9 21" stroke="${PAPER}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="80" cy="48" r="10" fill="${PAPER}"/>${face(80, 47, 'calm', 7)}
    </g>
    <g class="a-twinkle">${sparkle(30, 34, .8)}</g><g class="a-twinkle d2">${sparkle(132, 30, .65)}</g><g class="a-twinkle d3">${sparkle(136, 84, .5)}</g>`, 'illo tool-svg'),

  gratitude: () => svg('0 0 160 120', `
    <circle class="a-glow" ${origin(128, 28)} cx="128" cy="28" r="17" fill="#fff" opacity=".5"/>
    <g class="a-twinkle">${sparkle(36, 30, .9, PAPER)}</g><g class="a-twinkle d2">${sparkle(118, 66, .6, PAPER)}</g>
    <path class="a-rise" d="M44 70c-2.5-1.6-4-3.2-4-5 0-1.4 1-2.4 2.3-2.4 1 0 1.8.5 2.2 1.3.4-.8 1.2-1.3 2.2-1.3 1.3 0 2.3 1 2.3 2.4 0 1.8-1.5 3.4-5 5z" fill="${CLAY}"/>
    <path class="a-rise d2" d="M114 52c-2.5-1.6-4-3.2-4-5 0-1.4 1-2.4 2.3-2.4 1 0 1.8.5 2.2 1.3.4-.8 1.2-1.3 2.2-1.3 1.3 0 2.3 1 2.3 2.4 0 1.8-1.5 3.4-5 5z" fill="${CLAY}"/>
    <path d="M80 78V40" stroke="${FOREST}" stroke-width="4" stroke-linecap="round"/>
    <path class="leaf l1 a-sway" ${origin(80, 62)} d="M80 62c-13-2-21-10-21-21 13 0 21 8 21 21z" fill="${MOSS}"/>
    <path class="leaf l2 a-sway d2" ${origin(80, 55)} d="M80 55c13-2 21-10 21-21-13 0-21 8-21 21z" fill="${FOREST}"/>
    <path class="leaf l3 a-sway d3" ${origin(80, 42)} d="M80 42c-6-4-8-11-5-17 7 3 8 10 5 17z" fill="${SAGE}"/>
    <rect x="54" y="76" width="52" height="10" rx="4" fill="#B5643F"/><path d="M58 86h44l-6 26H64z" fill="#C9774F"/>
    <path d="M70 98q10 5 20 0" stroke="#fff" stroke-opacity=".35" stroke-width="2.4" fill="none" stroke-linecap="round"/>`, 'illo tool-svg'),

  check: () => svg('0 0 160 120', `
    <path class="a-line" d="M4 108h34l6-10 8 18 6-10h98" stroke="${CLAY}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
    <g class="a-bob">
      <rect x="48" y="16" width="62" height="84" rx="9" fill="${PAPER}"/>
      <rect x="66" y="10" width="26" height="12" rx="5" fill="${FOREST}"/>
      ${[38, 56, 74].map((y, i) => `
        <rect x="58" y="${y - 6}" width="12" height="12" rx="3.5" fill="none" stroke="${INK}" stroke-opacity=".3" stroke-width="2"/>
        <path d="M76 ${y}h24" stroke="${INK}" stroke-opacity=".2" stroke-width="3" stroke-linecap="round"/>
        <path class="a-draw d${i + 1}" d="M60.5 ${y}l3 3 5.5-6" stroke="${FOREST}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
    </g>
    <g class="a-peek" ${origin(124, 104)}>
      <path d="M108 104c0-13 7-22 16-22s16 9 16 22z" fill="var(--m4)"/>${face(124, 93, 'smile', 9)}
    </g>
    <g class="a-twinkle">${sparkle(30, 30, .7)}</g>`, 'illo tool-svg'),
};

// ---------- User profile pictures ----------
// Illustrated only (no photo upload) so users stay recognisable to counsellors without exposing their face.
const USER_AVATARS = [
  { id: 'u1', name: 'Rambut panjang', skin: '#E2B48E', hair: '#2B211C', style: 'long', top: FOREST },
  { id: 'u2', name: 'Rambut pendek', skin: '#C68B62', hair: '#1E1A17', style: 'short', top: '#5F7896' },
  { id: 'u3', name: 'Hijab hijau', skin: '#D9A57E', hijab: MOSS, top: MOSS },
  { id: 'u4', name: 'Rambut ikal', skin: '#B97E57', hair: '#2B211C', style: 'wavy', top: CLAY },
  { id: 'u5', name: 'Cepol', skin: '#E9C29F', hair: '#3A2A20', style: 'bun', top: '#7A8AA6' },
  { id: 'u6', name: 'Kacamata', skin: '#A8704B', hair: '#1E1A17', style: 'short', top: '#B9822A', glasses: true },
  { id: 'u7', name: 'Hijab biru', skin: '#E2B48E', hijab: '#7A8AA6', top: '#7A8AA6', glasses: true },
  { id: 'u8', name: 'Rambut cokelat', skin: '#C99068', hair: '#5A3A26', style: 'long', top: '#E9A73C' },
  { id: 'u9', name: 'Ikal berkacamata', skin: '#D9A57E', hair: '#2A221D', style: 'wavy', top: FOREST, glasses: true },
  { id: 'u10', name: 'Hijab merah', skin: '#C68B62', hijab: CLAY, top: CLAY },
  { id: 'p5', name: 'Pebble cerah', pebble: 5 },
  { id: 'p4', name: 'Pebble tenang', pebble: 4 },
];
const AVATAR_BGS = ['var(--m4)', 'var(--m2)', 'var(--m3)', 'var(--m5)', 'var(--m1)', 'var(--forest-tint)'];
const avatarSpec = id => USER_AVATARS.find(a => a.id === id) || USER_AVATARS.find(a => a.id === 'p4');
function avatarArt(spec) {
  return spec.pebble ? pebble(spec.pebble).replace('class="pebble"', 'class="pebble" style="width:78%;height:78%"') : portrait(spec);
}
// The signed-in user's picture, framed exactly like counsellor avatars.
function userAvatarHTML(size = 68, extraCls = '') {
  const a = state.avatar || {};
  const r = Math.round(size * .34);
  return `<span class="avatar ${extraCls}" style="--c:${a.bg || 'var(--m4)'};width:${size}px;height:${size}px;border-radius:${r}px"><span class="avatar-face">${avatarArt(avatarSpec(a.id))}</span></span>`;
}
