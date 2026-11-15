import type { World } from './contracts'

const colors = {
  earth: ['#1c3247', '#c48666', '#956c63', '#49565b', '#253a37', '#d9ae78'],
  moon: ['#101d37', '#7d86a8', '#9aa5ba', '#54667f', '#333f55', '#c9d6e6'],
  mars: ['#29192e', '#ac6453', '#b97862', '#77505b', '#442d41', '#edb88c']
} as const

export function sceneArt(world: World, chapter: string) {
  const [sky, horizon, far, mid, near, light] = colors[world]
  const feature = world === 'earth'
    ? '<path fill="#263b36" d="m91 307 3-72-29 3-20-13 6-15 49-10 43 9 15 14-14 11-36 2-9 72Zm382-21 6-41-22 2-15-10 2-12 35-7 26 7 9 10-7 9-22 2-4 43Z"/>'
    : world === 'moon'
      ? '<g fill="#263148" stroke="#9ba9c0" stroke-opacity=".45"><path d="M40 312q30-42 103-34 56 5 70 32-80 27-173 2Z"/><path d="M444 277q26-28 73-24 39 5 53 24-63 13-126 0Z"/></g>'
      : '<g fill="#583646"><path d="m0 291 77-79 79 14 88 62Z"/><path d="m444 268 42-56 62 4 62 56Z"/></g>'
  const encounter = chapter === 'earth'
    ? `<path d="M319 273c18 11 38 11 45 1 15-20 39-10 39 4 0 9-21 16-39 8 45 24 72 3 62-14-5-10-24-12-40-12" fill="none" stroke="#172e2c" stroke-width="9" stroke-linecap="round"/><path d="M386 261l14-8 9 7-10 6Z" fill="#26473e" stroke="${light}" stroke-opacity=".65"/>`
    : chapter === 'moon'
      ? `<g fill="#d1b49c"><path d="M375 251q9-8 14 0l-1 12 7 17h-24l6-17Z"/><path d="M405 246q7-8 13 0l-2 11 7 15h-21l5-15Z"/></g>
        <g class="lemures" fill="#212b44" stroke="#b2b7d3" stroke-opacity=".66" opacity=".81"><path d="M380 284q-4-20 4-35-4-16 6-26 13-7 21 5 6 9 4 21 22 10 20 30-12-5-21 0-13-18-34 5Z"/><path d="M423 275q1-12 2-24-12-17 2-28 15-7 24 11-2 13 3 18 16 6 17 19-13-4-22 3-16-13-26 1Z"/></g>`
      : chapter === 'mars'
        ? `<path d="m362 282 6-93 21-22h78l21 22 11 93Z" fill="#48313d" stroke="#b47a63" stroke-width="3"/><path d="M398 278v-85q29-22 59 0v85Z" fill="#f2ba88" opacity=".92"/><path d="M414 278q3-24 6-46-3-4-3-12 0-10 9-12 9-1 11 9 2 9-1 14l12 20v27Z" fill="#3b3e59" stroke="#fff0cc" stroke-width="2"/><path d="M435 232l19 7 8-5" fill="none" stroke="#fff0cc" stroke-width="2"/>`
        : ''

  return `<svg viewBox="0 0 600 380" aria-hidden="true" class="scene-art" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="scene-sky" x2=".15" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${horizon}"/></linearGradient>
      <radialGradient id="scene-light"><stop stop-color="${light}"/><stop offset="1" stop-color="${light}" stop-opacity=".28"/></radialGradient>
    </defs>
    <path fill="url(#scene-sky)" d="M0 0h600v380H0Z"/>
    <circle cx="436" cy="112" r="65" fill="url(#scene-light)" opacity=".86"/>
    <ellipse cx="436" cy="112" rx="115" ry="30" transform="rotate(-23 436 112)" fill="none" stroke="${light}" opacity=".37"/>
    <g fill="${light}" opacity=".75"><circle cx="60" cy="61" r="1.5"/><circle cx="88" cy="111" r="1"/><circle cx="174" cy="65" r="2"/><circle cx="238" cy="128" r="1.5"/><circle cx="318" cy="82" r="1.6"/><circle cx="544" cy="60" r="2"/><circle cx="573" cy="145" r="1.4"/></g>
    <path fill="${far}" d="M0 226 67 179l61 42 85-57 45 32 27-24 55 47 62-37 34 14 76-43 88 43v184H0Z"/>
    <path fill="${mid}" d="m0 239 40-22 88 19 79-12 61 21 92-45 71 23 103-21 66 23v155H0Z"/>
    <path fill="${near}" d="m0 284 106-33 82 15 76-34 85 22 93-12 158 26v112H0Z"/>
    ${feature}
    <path fill="${light}" opacity=".38" d="m177 380 48-65 53-16 37-37 40-9-48 51-44 25-27 51Z"/>
    <path fill="#181e30" opacity=".9" d="m0 331 76-26 43 5 17 32-39 38H0Zm600 49H427l48-48 72-28 53 14Z"/>
    ${encounter}
    <g transform="translate(301 264)" fill="#18212f"><circle cy="-14" r="6"/><path d="m-5-8 11 2 3 9 10 1v5L7 8l3 17H5L0 11l-2 14h-6l2-19 1-14Z"/><path d="m-5-7 11 5 3 9-6 1-9-9Z" fill="${light}"/></g>
  </svg>`
}
