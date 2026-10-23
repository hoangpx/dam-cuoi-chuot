// the couple's altar room: the drawing is the branch's own design sheet (docs/thiet-ke/nha-the-ky-17.html), lifted whole —
// the same carved cửa võng, the same gilded đỉnh and hạc, the same thirteen things, each of them shown in the room only
// once it has been sắm sanh. Nothing here is redrawn.
const C4_NHA_W = 680, C4_NHA_H = 470;
// the carved pieces the things are built from (đỉnh, nến, hạc, lục bình…), kept out of the room and only used by reference
const C4_NHA_DEFS = `<defs>
<linearGradient id="hxBz" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a3a0e"/><stop offset=".22" stop-color="#b9862a"/><stop offset=".42" stop-color="#fff0b0"/><stop offset=".55" stop-color="#e2b13a"/><stop offset=".8" stop-color="#9a6a1c"/><stop offset="1" stop-color="#4a2e0a"/></linearGradient>
<linearGradient id="hxBr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b4a08"/><stop offset=".18" stop-color="#c99a1c"/><stop offset=".38" stop-color="#ffe680"/><stop offset=".48" stop-color="#fffbe0"/><stop offset=".62" stop-color="#f0c62e"/><stop offset=".85" stop-color="#a87810"/><stop offset="1" stop-color="#5e4006"/></linearGradient>
<linearGradient id="hxBrV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4b8"/><stop offset=".35" stop-color="#f0c62e"/><stop offset=".8" stop-color="#a87810"/><stop offset="1" stop-color="#6b4a08"/></linearGradient>
<linearGradient id="hxGd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c8"/><stop offset=".25" stop-color="#f2c640"/><stop offset=".55" stop-color="#d49a22"/><stop offset=".8" stop-color="#9a6a10"/><stop offset="1" stop-color="#f0c95a"/></linearGradient>
<linearGradient id="hxAg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6f777c"/><stop offset=".35" stop-color="#e9edf0"/><stop offset=".5" stop-color="#ffffff"/><stop offset=".7" stop-color="#b9c0c4"/><stop offset="1" stop-color="#5f676c"/></linearGradient>
<linearGradient id="hxPo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d8d3c6"/><stop offset=".3" stop-color="#fbfaf6"/><stop offset=".45" stop-color="#ffffff"/><stop offset=".8" stop-color="#ece8de"/><stop offset="1" stop-color="#c9c3b4"/></linearGradient>
<linearGradient id="hxPc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fb6cf"/><stop offset=".5" stop-color="#4f6f94"/><stop offset="1" stop-color="#2b4366"/></linearGradient>
<linearGradient id="hxWd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a2c1c"/><stop offset="1" stop-color="#5e1a10"/></linearGradient>
<g id="hxDinh">
<g fill="url(#hxBr)" stroke="#3a2804" stroke-width=".9"><path d="M-34 -4 q-4 -2 -2 -6 h4 q2 4 -2 6 z"/><path d="M34 -4 q4 -2 2 -6 h-4 q-2 4 2 6 z"/><path d="M-12 -2 q-2 -4 2 -6 h20 q4 2 2 6 z"/></g>
<path d="M-36 -8 q0 -6 4 -8 h64 q4 2 4 8 z" fill="url(#hxBr)" stroke="#3a2804" stroke-width="1"/>
<g fill="none" stroke="#6b4a08" stroke-width=".7"><path d="M-30 -11 q3 -3 6 0 q3 3 6 0 q3 -3 6 0 q3 3 6 0 q3 -3 6 0 q3 3 6 0 q3 -3 6 0 q3 3 6 0 q3 -3 6 0 q3 3 6 0"/><circle cx="-24" cy="-12" r="1.2"/><circle cx="0" cy="-12" r="1.2"/><circle cx="24" cy="-12" r="1.2"/></g>
<path d="M-30 -16 q0 -4 3 -5 h54 q3 1 3 5 z" fill="url(#hxBr)" stroke="#3a2804" stroke-width=".9"/>
<ellipse cx="0" cy="-21" rx="27" ry="3.6" fill="url(#hxBrV)" stroke="#3a2804" stroke-width=".9"/>
<g fill="url(#hxBr)" stroke="#3a2804" stroke-width=".9"><path d="M-24 -22 q-6 -8 -2 -16 q4 -6 10 -4 q4 4 2 10 q-2 6 -4 10 z"/><path d="M24 -22 q6 -8 2 -16 q-4 -6 -10 -4 q-4 4 -2 10 q2 6 4 10 z"/><path d="M-7 -22 q-3 -10 1 -16 q6 -4 12 0 q4 6 1 16 z"/></g>
<g fill="url(#hxBrV)" stroke="#3a2804" stroke-width=".8"><circle cx="-19" cy="-38" r="5.4"/><circle cx="19" cy="-38" r="5.4"/><circle cx="0" cy="-39" r="6"/></g>
<g fill="#6b4a08"><circle cx="-21" cy="-39" r=".9"/><circle cx="-17" cy="-39" r=".9"/><circle cx="17" cy="-39" r=".9"/><circle cx="21" cy="-39" r=".9"/><circle cx="-2.4" cy="-40" r="1"/><circle cx="2.4" cy="-40" r="1"/></g>
<g fill="none" stroke="#6b4a08" stroke-width=".7"><path d="M-22 -35 q3 2 6 0 M16 -35 q3 2 6 0 M-3 -35 q3 2 6 0"/><path d="M-24 -40 q-2 -4 1 -6 M24 -40 q2 -4 -1 -6 M-6 -42 q-2 -4 2 -5 M6 -42 q2 -4 -2 -5"/></g>
<path d="M-31 -64 q-1 22 31 28 q32 -6 31 -28 z" fill="url(#hxBr)" stroke="#3a2804" stroke-width="1.1"/>
<path d="M-28 -48 q28 12 56 0" fill="none" stroke="#6b4a08" stroke-width=".8"/>
<g fill="none" stroke="#6b4a08" stroke-width=".8"><path d="M-22 -58 q4 -4 8 0 q4 4 0 7 q-6 2 -8 -3 z"/><path d="M-6 -59 q6 -6 12 0 q4 5 -1 8 q-5 2 -10 0 q-4 -3 -1 -8 z"/><path d="M14 -58 q4 -4 8 0 q2 5 -2 7 q-6 0 -6 -7 z"/><path d="M-14 -56 q2 -6 8 -6 M6 -62 q6 0 8 6"/></g>
<g fill="#6b4a08"><circle cx="0" cy="-55" r="1.4"/><circle cx="-18" cy="-55" r="1"/><circle cx="18" cy="-55" r="1"/></g>
<g fill="none" stroke="#6b4a08" stroke-width=".6"><path d="M-24 -44 q4 4 8 4 q4 0 8 -4 M-8 -42 q4 4 8 4 q4 0 8 -4 M8 -44 q4 4 8 4"/></g>
<path d="M-18 -58 q2 12 10 18" fill="none" stroke="#fffbe0" stroke-width="1.6" opacity=".9" stroke-linecap="round"/>
<rect x="-33" y="-69" width="66" height="6" rx="1.5" fill="url(#hxBr)" stroke="#3a2804" stroke-width=".9"/>
<g fill="none" stroke="#6b4a08" stroke-width=".6"><path d="M-30 -67 h4 v2 h-2 M-22 -67 h4 v2 h-2 M-14 -67 h4 v2 h-2 M-6 -67 h4 v2 h-2 M2 -67 h4 v2 h-2 M10 -67 h4 v2 h-2 M18 -67 h4 v2 h-2 M26 -67 h4 v2 h-2"/></g>
<path d="M-22 -69 v-4 h44 v4 z" fill="url(#hxBr)" stroke="#3a2804" stroke-width=".8"/>
<g fill="none" stroke="#3a2804" stroke-width="5" stroke-linecap="round"><path d="M-31 -56 q-12 -6 -10 -18 q2 -10 -6 -16 q-4 -6 2 -12"/><path d="M31 -56 q12 -6 10 -18 q-2 -10 6 -16 q4 -6 -2 -12"/></g>
<g fill="none" stroke="#e8bd2a" stroke-width="3.4" stroke-linecap="round"><path d="M-31 -56 q-12 -6 -10 -18 q2 -10 -6 -16 q-4 -6 2 -12"/><path d="M31 -56 q12 -6 10 -18 q-2 -10 6 -16 q4 -6 -2 -12"/></g>
<g fill="none" stroke="#fff4b8" stroke-width="1" stroke-linecap="round"><path d="M-36 -66 q-4 -6 -2 -10"/><path d="M36 -66 q4 -6 2 -10"/></g>
<g fill="url(#hxBrV)" stroke="#3a2804" stroke-width=".8"><path d="M-46 -102 q-6 -4 -2 -10 q6 -2 8 4 q2 4 -2 8 q-2 2 -4 -2 z"/><path d="M46 -102 q6 -4 2 -10 q-6 -2 -8 4 q-2 4 2 8 q2 2 4 -2 z"/></g>
<g fill="none" stroke="#3a2804" stroke-width=".8"><path d="M-46 -110 l-4 -6 M-43 -111 l1 -6"/><path d="M46 -110 l4 -6 M43 -111 l-1 -6"/></g>
<g fill="url(#hxBr)" stroke="#3a2804" stroke-width=".7"><path d="M-36 -84 q-6 0 -8 4 l4 0 z M-38 -96 q-6 0 -7 4 l4 0 z"/><path d="M36 -84 q6 0 8 4 l-4 0 z M38 -96 q6 0 7 4 l-4 0 z"/></g>
<path d="M-24 -73 q2 -20 24 -22 q22 2 24 22 z" fill="url(#hxBr)" stroke="#3a2804" stroke-width="1"/>
<g fill="#4a3006"><path d="M-17 -77 q2 -4 5 -1 q-2 3 -5 1 z"/><path d="M-8 -79 q3 -5 6 -1 q-3 3 -6 1 z"/><path d="M3 -79 q3 -5 6 -1 q-3 3 -6 1 z"/><path d="M12 -77 q3 -4 5 -1 q-2 3 -5 1 z"/><path d="M-12 -86 q2 -4 5 -1 q-2 3 -5 1 z"/><path d="M-2 -88 q2 -4 4 -1 q-2 3 -4 1 z"/><path d="M7 -86 q2 -4 5 -1 q-2 3 -5 1 z"/></g>
<path d="M-10 -82 q4 -8 10 -10" fill="none" stroke="#fffbe0" stroke-width="1.4" opacity=".9" stroke-linecap="round"/>
<ellipse cx="0" cy="-95" rx="8" ry="2.2" fill="url(#hxBrV)" stroke="#3a2804" stroke-width=".8"/>
<path d="M-6 -96 q-2 -8 2 -12 q4 -2 6 2 l2 -4 q4 2 2 8 q-2 6 -6 6 z" fill="url(#hxBr)" stroke="#3a2804" stroke-width=".9"/>
<circle cx="-1" cy="-110" r="6" fill="url(#hxBrV)" stroke="#3a2804" stroke-width=".9"/>
<g fill="none" stroke="#6b4a08" stroke-width=".7"><path d="M-6 -113 q-2 -4 1 -6 M-2 -116 q0 -4 3 -4 M3 -114 q3 -3 4 0"/></g>
<g fill="#3a2804"><circle cx="-3" cy="-111" r=".9"/><circle cx="1.5" cy="-111" r=".9"/></g>
<circle cx="5" cy="-99" r="2.2" fill="url(#hxBrV)" stroke="#3a2804" stroke-width=".7"/>
</g>
<g id="hxNen">
<path d="M-20 0 q0 -5 4 -7 q4 -9 16 -10 q12 1 16 10 q4 2 4 7 z" fill="url(#hxBr)" stroke="#3a2804" stroke-width=".9"/>
<g fill="none" stroke="#6b4a08" stroke-width=".6"><path d="M-15 -6 q3 -3 6 0 q3 3 6 0 q3 -3 6 0 q3 3 6 0 q3 -3 6 0"/><path d="M-10 -12 q10 -4 20 0"/></g>
<ellipse cx="0" cy="-17" rx="7" ry="2" fill="url(#hxBrV)" stroke="#3a2804" stroke-width=".7"/>
<path d="M-4 -18 q-5 -5 0 -10 q-4 -4 0 -8 h8 q4 4 0 8 q5 5 0 10 z" fill="url(#hxBr)" stroke="#3a2804" stroke-width=".8"/>
<ellipse cx="0" cy="-37" rx="5" ry="1.6" fill="url(#hxBrV)" stroke="#3a2804" stroke-width=".6"/>
<path d="M-3 -38 q-4 -4 0 -8 h6 q4 4 0 8 z" fill="url(#hxBr)" stroke="#3a2804" stroke-width=".7"/>
<ellipse cx="0" cy="-50" rx="26" ry="4" fill="url(#hxBr)" stroke="#3a2804" stroke-width=".9"/>
<path d="M-26 -50 q0 3 26 4 q26 -1 26 -4" fill="none" stroke="#3a2804" stroke-width=".8"/>
<ellipse cx="0" cy="-50.6" rx="20" ry="2.6" fill="none" stroke="#6b4a08" stroke-width=".6"/>
<path d="M-3 -52 q-3 -3 0 -6 q-4 -4 0 -9 h6 q4 5 0 9 q3 3 0 6 z" fill="url(#hxBr)" stroke="#3a2804" stroke-width=".7"/>
<ellipse cx="0" cy="-68" rx="4.4" ry="1.4" fill="url(#hxBrV)" stroke="#3a2804" stroke-width=".6"/>
<path d="M-3 -69 q-4 -5 0 -10 h6 q4 5 0 10 z" fill="url(#hxBr)" stroke="#3a2804" stroke-width=".7"/>
<ellipse cx="0" cy="-80" rx="4" ry="1.3" fill="url(#hxBrV)" stroke="#3a2804" stroke-width=".6"/>
<path d="M-6 -81 q-1 -8 -1 -12 h14 q0 4 -1 12 z" fill="url(#hxBr)" stroke="#3a2804" stroke-width=".8"/>
<g fill="none" stroke="#6b4a08" stroke-width=".55"><path d="M-5 -86 q2 -2 4 0 q2 2 4 0 q2 -2 2 0"/><path d="M-5 -90 h10"/></g>
<ellipse cx="0" cy="-93" rx="7.4" ry="1.8" fill="url(#hxBrV)" stroke="#3a2804" stroke-width=".7"/>
<ellipse cx="0" cy="-93" rx="4.4" ry=".9" fill="#4a3006"/>
</g>
<g id="hxCrane">
<ellipse cx="0" cy="-2" rx="25" ry="6" fill="#4a1d10"/>
<path d="M-24 -4 v-7 a24 6 0 0 0 48 0 v7 a24 6 0 0 1 -48 0 z" fill="#a3332a" stroke="#1d1915" stroke-width="1"/>
<ellipse cx="0" cy="-11" rx="24" ry="6" fill="#c0392b" stroke="#1d1915" stroke-width="1"/>
<ellipse cx="0" cy="-11" rx="21" ry="4.6" fill="none" stroke="#f2c640" stroke-width=".9"/>
<g fill="#3a3a3a"><circle cx="-17" cy="0" r="2.4"/><circle cx="17" cy="0" r="2.4"/></g>
<path d="M-19 -13 q2 -15 19 -15 q17 0 19 15 z" fill="url(#hxGd)" stroke="#1d1915" stroke-width="1"/>
<g fill="none" stroke="#7a5414" stroke-width=".7"><path d="M-6 -24 l4 -3 h4 l4 3 l-4 3 h-4 z"/><path d="M-15 -17 l3 -3 l4 1 l1 3 z M8 -17 l3 -2 l4 2 l-1 3 z"/></g>
<path d="M18 -16 q6 -6 12 -4 q3 2 1 5 q-4 2 -8 1 z" fill="url(#hxGd)" stroke="#1d1915" stroke-width=".9"/>
<g fill="none" stroke="#1d1915" stroke-width="3.6" stroke-linecap="round"><path d="M-5 -28 l-2 -22 l3 -20"/><path d="M5 -28 l1 -22 l-2 -20"/></g>
<g fill="none" stroke="#e2b13a" stroke-width="2.2" stroke-linecap="round"><path d="M-5 -28 l-2 -22 l3 -20"/><path d="M5 -28 l1 -22 l-2 -20"/></g>
<path d="M-18 -78 q-6 -26 12 -34 q18 -4 22 14 q4 18 -10 26 q-14 6 -24 -6 z" fill="url(#hxGd)" stroke="#1d1915" stroke-width="1.1"/>
<g fill="none" stroke="#9a6a10" stroke-width=".8"><path d="M-6 -104 q4 3 8 0 q4 3 8 0"/><path d="M-10 -96 q4 3 8 0 q4 3 8 0 q4 3 8 0"/><path d="M-12 -88 q4 3 8 0 q4 3 8 0 q4 3 8 0"/></g>
<path d="M-12 -98 q-22 0 -32 22 q10 -4 16 -2 q-12 6 -14 18 q8 -2 12 -6 q-4 8 -2 16 q14 -10 22 -26 q4 -10 -2 -22 z" fill="url(#hxGd)" stroke="#1d1915" stroke-width="1"/>
<g fill="none" stroke="#7a5414" stroke-width=".8"><path d="M-40 -74 q10 -14 26 -18"/><path d="M-36 -60 q12 -12 24 -24"/><path d="M-34 -46 q10 -12 18 -30"/></g>
<g fill="none" stroke="#fff6c8" stroke-width="1.2" opacity=".9"><path d="M-8 -108 q8 -4 16 2"/><path d="M-34 -78 q8 -10 18 -14"/></g>
<path d="M6 -108 Q18 -124 8 -138 Q2 -148 10 -158" fill="none" stroke="#1d1915" stroke-width="6" stroke-linecap="round"/>
<path d="M6 -108 Q18 -124 8 -138 Q2 -148 10 -158" fill="none" stroke="#e2b13a" stroke-width="4.2" stroke-linecap="round"/>
<path d="M9 -112 Q17 -124 9 -136" fill="none" stroke="#fff6c8" stroke-width="1.3" stroke-linecap="round"/>
<path d="M6 -158 q3 -8 11 -6 q4 2 2 6 z" fill="url(#hxGd)" stroke="#1d1915" stroke-width="1"/>
<path d="M18 -161 l14 -9 l-12 11 z" fill="#c9952e" stroke="#1d1915" stroke-width=".8"/>
<circle cx="13" cy="-160" r="1" fill="#1d1915"/>
</g>
<g id="hxVase">
<path d="M-30 0 h60 l-3 -4 q-6 -2 -6 -6 h-42 q0 4 -6 6 z" fill="#4a1d10" stroke="#1d1915" stroke-width="1"/>
<rect x="-23" y="-13" width="46" height="4" rx="1.5" fill="#5e2414" stroke="#1d1915" stroke-width=".9"/>
<path d="M-15 -13 Q-20 -25 -26 -42 Q-33 -66 -28 -94 Q-25 -110 -18 -121 Q-12 -129 -12 -139 Q-12 -154 -24 -171 L-27 -176 L27 -176 L24 -171 Q12 -154 12 -139 Q12 -129 18 -121 Q25 -110 28 -94 Q33 -66 26 -42 Q20 -25 15 -13 Z" fill="url(#hxPo)" stroke="#1d1915" stroke-width="1.3"/>
<ellipse cx="0" cy="-176" rx="27" ry="3.4" fill="#f4f1ea" stroke="#1d1915" stroke-width="1"/>
<path d="M-27 -176 q27 6 54 0" fill="none" stroke="#d9a630" stroke-width="1.6"/>
<g fill="none" stroke="#2f5f8f" stroke-width="1.4"><path d="M-15 -17 q3 -5 6 0 q3 -5 6 0 q3 -5 6 0 q3 -5 6 0 q3 -5 6 0"/><path d="M-19 -24 q3.5 -6 7 0 q3.5 -6 7 0 q3.5 -6 7 0 q3.5 -6 7 0 q3.5 -6 7 0 q3 -5 5 0"/></g>
<g fill="#2f5f8f" opacity=".85"><path d="M-24 -46 q-6 -8 2 -14 q6 2 6 10 q-2 6 -8 4 z"/><path d="M22 -50 q8 -6 4 -14 q-8 0 -8 8 q0 6 4 6 z"/></g>
<path d="M-6 -74 q-14 -10 -6 -22 q6 2 8 10 q4 -12 12 -8 q2 10 -6 16 q10 0 8 10 q-10 4 -16 -6 z" fill="#5e86b8" stroke="#2f5f8f" stroke-width=".8"/>
<g fill="url(#hxBz)" stroke="#6b4a10" stroke-width=".7"><path d="M0 -58 q-12 -2 -14 -10 q8 -6 14 0 q6 -6 14 0 q-2 8 -14 10 z"/><path d="M0 -62 q-9 -4 -9 -11 q6 -3 9 3 q3 -6 9 -3 q0 7 -9 11 z"/></g>
<path d="M-17 -103 q-4 -4 0 -8 q4 0 5 2 q3 -4 7 -2 q2 -3 5 -3 q3 0 5 3 q4 -2 7 2 q1 -2 5 -2 q4 4 0 8 q4 4 0 8 q-4 0 -5 -2 q-3 4 -7 2 q-2 3 -5 3 q-3 0 -5 -3 q-4 2 -7 -2 q-1 2 -5 2 q-4 -4 0 -8 z" fill="url(#hxBz)" stroke="#6b4a10" stroke-width=".8"/>
<path d="M-13 -103 q-2 -3 0 -5 h26 q2 2 0 5 q2 3 0 5 h-26 q-2 -2 0 -5 z" fill="#fbf8f0" stroke="#a87a28" stroke-width=".6"/>
<path d="M-9 -103 q4 -3 8 0 q4 3 8 0" fill="none" stroke="#2f5f8f" stroke-width=".9"/>
<g fill="url(#hxBz)" stroke="#6b4a10" stroke-width=".6"><circle cx="-22" cy="-117" r="3"/><circle cx="-14" cy="-121" r="3.4"/><circle cx="-5" cy="-123" r="2.8"/><circle cx="5" cy="-123" r="3"/><circle cx="14" cy="-121" r="3.4"/><circle cx="22" cy="-117" r="3"/></g>
<path d="M4 -122 q10 6 16 22 q4 14 0 30 q-6 -10 -10 -24 q-4 -14 -6 -28 z" fill="url(#hxPc)" stroke="#1d3f66" stroke-width=".8"/>
<g stroke="#1d3f66" stroke-width=".5"><circle cx="16" cy="-96" r="2.6" fill="#e2b13a"/><circle cx="16" cy="-96" r="1.3" fill="#2f5f8f"/><circle cx="19" cy="-84" r="2.6" fill="#e2b13a"/><circle cx="19" cy="-84" r="1.3" fill="#2f5f8f"/></g>
<path d="M-2 -126 q-4 -10 4 -16 q8 -2 10 6 q2 8 -4 12 q-6 3 -10 -2 z" fill="url(#hxPc)" stroke="#1d3f66" stroke-width=".9"/>
<path d="M2 -140 q-4 -6 -2 -12 q4 -3 6 0 q0 6 -2 12" fill="url(#hxPc)" stroke="#1d3f66" stroke-width=".8"/>
<path d="M-20 -150 q2 40 -4 100" fill="none" stroke="#ffffff" stroke-width="2.4" opacity=".75" stroke-linecap="round"/>
</g>
</defs>`
  + `<defs></defs>`;
const C4_NHA_BASE = `<rect x="0" y="0" width="680" height="470" fill="#d8bf8a"/>
<rect x="0" y="0" width="680" height="62" fill="#3a2418"/>
<g stroke="#24160e" stroke-width="4"><line x1="20" y1="0" x2="20" y2="60"/><line x1="70" y1="0" x2="70" y2="60"/><line x1="120" y1="0" x2="120" y2="60"/><line x1="170" y1="0" x2="170" y2="60"/><line x1="220" y1="0" x2="220" y2="60"/><line x1="270" y1="0" x2="270" y2="60"/><line x1="320" y1="0" x2="320" y2="60"/><line x1="370" y1="0" x2="370" y2="60"/><line x1="420" y1="0" x2="420" y2="60"/><line x1="470" y1="0" x2="470" y2="60"/><line x1="520" y1="0" x2="520" y2="60"/><line x1="570" y1="0" x2="570" y2="60"/><line x1="620" y1="0" x2="620" y2="60"/><line x1="670" y1="0" x2="670" y2="60"/></g>
<rect x="200" y="118" width="280" height="222" fill="#c9aa70"/>
<g stroke="#b3935a" stroke-width="1.5"><line x1="215" y1="140" x2="215" y2="338"/><line x1="235" y1="140" x2="235" y2="338"/><line x1="445" y1="140" x2="445" y2="338"/><line x1="465" y1="140" x2="465" y2="338"/><line x1="200" y1="200" x2="480" y2="200"/></g>
<rect x="0" y="338" width="680" height="132" fill="#b9653d"/>
<g stroke="#8a4527" stroke-width="1.2"><line x1="0" y1="358" x2="680" y2="358"/><line x1="0" y1="384" x2="680" y2="384"/><line x1="0" y1="416" x2="680" y2="416"/><line x1="0" y1="452" x2="680" y2="452"/><line x1="100" y1="338" x2="-90" y2="470"/><line x1="160" y1="338" x2="30" y2="470"/><line x1="220" y1="338" x2="150" y2="470"/><line x1="280" y1="338" x2="270" y2="470"/><line x1="340" y1="338" x2="340" y2="470"/><line x1="400" y1="338" x2="410" y2="470"/><line x1="460" y1="338" x2="530" y2="470"/><line x1="520" y1="338" x2="650" y2="470"/><line x1="580" y1="338" x2="770" y2="470"/></g>
<rect x="0" y="56" width="680" height="16" fill="#5b2f1f" stroke="#1d1915" stroke-width="1.5"/>
<g stroke="#1d1915" stroke-width="1.5"><rect x="180" y="62" width="24" height="276" fill="#6b2e1c"/><rect x="476" y="62" width="24" height="276" fill="#6b2e1c"/><path d="M172 346 h40 v-6 q-4 -8 -20 -8 q-16 0 -20 8 z" fill="#8d8574"/><path d="M468 346 h40 v-6 q-4 -8 -20 -8 q-16 0 -20 8 z" fill="#8d8574"/></g>
<g stroke="#1d1915" stroke-width="1.5"><rect x="14" y="0" width="38" height="470" fill="#6b2e1c"/><rect x="628" y="0" width="38" height="470" fill="#6b2e1c"/></g>`;
const C4_NHA_ITEMS = {
  'tranh': `<g id="hx-tranh">
<g fill="none" stroke="#1d1915" stroke-width="1"><path d="M104 90 L120 80 L136 90"/><path d="M544 90 L560 80 L576 90"/></g>
<g fill="#c9a24a" stroke="#1d1915" stroke-width="1"><rect x="74" y="95" width="92" height="143"/><rect x="514" y="95" width="92" height="143"/></g>
<rect x="82" y="104" width="76" height="124" fill="#f4e7c6"/><rect x="522" y="104" width="76" height="124" fill="#f4e7c6"/>
<image href="img/ch3/chan-trau.png" x="82" y="104" width="76" height="124" preserveAspectRatio="xMidYMid slice"/>
<image href="img/ch3/tha-dieu.jpg" x="522" y="104" width="76" height="124" preserveAspectRatio="xMidYMid slice"/>
<g fill="none" stroke="#5b2f1f" stroke-width="1.2"><rect x="82" y="104" width="76" height="124"/><rect x="522" y="104" width="76" height="124"/></g>
<g fill="#3a170e" stroke="#1d1915" stroke-width="1.1"><rect x="72" y="89" width="96" height="7" rx="3.5"/><rect x="512" y="89" width="96" height="7" rx="3.5"/><rect x="70" y="236" width="100" height="8" rx="4"/><rect x="510" y="236" width="100" height="8" rx="4"/></g>
<g fill="url(#hxBz)" stroke="#1d1915" stroke-width=".9"><circle cx="70" cy="92.5" r="3.8"/><circle cx="170" cy="92.5" r="3.8"/><circle cx="510" cy="92.5" r="3.8"/><circle cx="610" cy="92.5" r="3.8"/><circle cx="67" cy="240" r="4.6"/><circle cx="173" cy="240" r="4.6"/><circle cx="507" cy="240" r="4.6"/><circle cx="613" cy="240" r="4.6"/></g>
</g>`,
  'cuavong': `<g id="hx-cuavong">
<path d="M204 72 H476 V98 Q462 98 454 112 Q442 134 420 128 Q400 142 380 130 Q360 144 340 132 Q320 144 300 130 Q280 142 260 128 Q238 134 226 112 Q218 98 204 98 Z" fill="#8f2a1e" stroke="#1d1915" stroke-width="1.5"/>
<path d="M208 75 H472 V95 Q458 96 450 110 Q440 128 420 124 Q400 136 380 126 Q360 138 340 128 Q320 138 300 126 Q280 136 260 124 Q240 128 230 110 Q222 96 208 95 Z" fill="none" stroke="#d9a630" stroke-width="1.6"/>
<g fill="none" stroke="#f2c640" stroke-width="2" stroke-linecap="round"><path d="M236 104 Q246 90 262 96 Q276 102 284 112 Q292 122 306 118"/><path d="M444 104 Q434 90 418 96 Q404 102 396 112 Q388 122 374 118"/></g>
<g fill="#d9a630" stroke="#1d1915" stroke-width="1"><path d="M220 122 q6 -4 12 0 q2 8 -6 12 q-8 -4 -6 -12 z"/><path d="M448 122 q6 -4 12 0 q2 8 -6 12 q-8 -4 -6 -12 z"/></g>
</g>`,
  'hoanhphi': `<g id="hx-hoanhphi">
<path d="M266 92 q-10 -2 -12 8 q-2 10 8 14 q-6 6 0 12 q8 2 12 -4 h132 q4 6 12 4 q6 -6 0 -12 q10 -4 8 -14 q-2 -10 -12 -8 q-8 -14 -24 -16 q-14 -16 -34 -12 q-10 -10 -24 -10 q-14 0 -24 10 q-20 -4 -34 12 q-16 2 -24 16 z" fill="url(#hxGd)" stroke="#1d1915" stroke-width="1.4"/>
<path d="M326 72 q6 -12 14 -12 q8 0 14 12 q-6 -4 -14 -4 q-8 0 -14 4 z" fill="url(#hxGd)" stroke="#1d1915" stroke-width="1"/>
<rect x="276" y="90" width="128" height="30" rx="2" fill="#1d1915" stroke="#9a6a10" stroke-width="1.4"/>
<rect x="279.5" y="93.5" width="121" height="23" fill="none" stroke="#d9a630" stroke-width=".8"/>
<text x="340" y="111" text-anchor="middle" style="fill:#f2c640;font-size:16px;font-family:Georgia,serif">積 善 堂</text>
</g>`,
  'caudoi': `<g id="hx-caudoi">
<g fill="#1d1915" stroke="#9a6a10" stroke-width="1.4"><rect x="182" y="152" width="20" height="150" rx="2"/><rect x="478" y="152" width="20" height="150" rx="2"/></g>
<g fill="url(#hxGd)" stroke="#1d1915" stroke-width=".8"><path d="M182 152 q10 -10 20 0 z"/><path d="M478 152 q10 -10 20 0 z"/><path d="M182 302 q10 8 20 0 z"/><path d="M478 302 q10 8 20 0 z"/></g>
<text x="192" y="176" text-anchor="middle" style="fill:#f2c640;font-size:13px;font-family:Georgia,serif"><tspan x="192">福</tspan><tspan x="192" dy="33">如</tspan><tspan x="192" dy="33">東</tspan><tspan x="192" dy="33">海</tspan></text>
<text x="488" y="176" text-anchor="middle" style="fill:#f2c640;font-size:13px;font-family:Georgia,serif"><tspan x="488">壽</tspan><tspan x="488" dy="33">比</tspan><tspan x="488" dy="33">南</tspan><tspan x="488" dy="33">山</tspan></text>
</g>`,
  'denlong': `<g id="hx-denlong">
<g stroke="#1d1915" stroke-width="1"><line x1="226" y1="72" x2="226" y2="96"/><line x1="454" y1="72" x2="454" y2="96"/></g>
<g fill="url(#hxBz)" stroke="#1d1915" stroke-width="1"><path d="M218 100 l2 -4 h12 l2 4 l-3 3 h-10 z"/><path d="M446 100 l2 -4 h12 l2 4 l-3 3 h-10 z"/><path d="M218 136 l3 -3 h10 l3 3 l-2 4 h-12 z"/><path d="M446 136 l3 -3 h10 l3 3 l-2 4 h-12 z"/></g>
<g stroke="#1d1915" stroke-width="1.4"><path d="M216 104 Q209 118 216 133 H236 Q243 118 236 104 Z" fill="#c0392b"/><path d="M444 104 Q437 118 444 133 H464 Q471 118 464 104 Z" fill="#c0392b"/></g>
<text x="226" y="123" text-anchor="middle" style="fill:#f2c640;font-size:11px;font-family:Georgia,serif">福</text>
<text x="454" y="123" text-anchor="middle" style="fill:#f2c640;font-size:11px;font-family:Georgia,serif">壽</text>
</g>`,
  'anthờ': `<g id="hx-anthờ">
<path d="M254 212 h172 v-5 q0 -3 -3 -3 h-166 q-3 0 -3 3 z" fill="url(#hxWd)" stroke="#1d1915" stroke-width="1.3"/>
<rect x="260" y="212" width="160" height="24" fill="#6b1f14" stroke="#1d1915" stroke-width="1.2"/>
<g fill="none" stroke="#a8432c" stroke-width="1.6"><path d="M266 216 h10 v8 h-6 v-4 h6 M284 216 h10 v8 h-6 v-4 h6 M302 216 h10 v8 h-6 v-4 h6 M320 216 h10 v8 h-6 v-4 h6 M338 216 h10 v8 h-6 v-4 h6 M356 216 h10 v8 h-6 v-4 h6 M374 216 h10 v8 h-6 v-4 h6 M392 216 h10 v8 h-6 v-4 h6"/><path d="M264 230 h152"/></g>
<g fill="url(#hxWd)" stroke="#1d1915" stroke-width="1.2"><rect x="262" y="236" width="10" height="102"/><rect x="408" y="236" width="10" height="102"/></g>
<g fill="none" stroke="#6b1f14" stroke-width="2.6"><path d="M272 238 h16 v8 h-8 v8 h-8"/><path d="M408 238 h-16 v8 h8 v8 h8"/></g>
<rect x="272" y="320" width="136" height="5" fill="#6b1f14" stroke="#1d1915" stroke-width="1"/>
<path d="M286 290 h108 v-4 q0 -3 -3 -3 h-102 q-3 0 -3 3 z" fill="url(#hxWd)" stroke="#1d1915" stroke-width="1.2"/>
<rect x="290" y="290" width="100" height="14" fill="#6b1f14" stroke="#1d1915" stroke-width="1"/>
<g fill="none" stroke="#a8432c" stroke-width="1.3"><path d="M294 294 h8 v6 h-5 v-3 h5 M308 294 h8 v6 h-5 v-3 h5 M322 294 h8 v6 h-5 v-3 h5 M350 294 h8 v6 h-5 v-3 h5 M364 294 h8 v6 h-5 v-3 h5 M378 294 h8 v6 h-5 v-3 h5"/><circle cx="340" cy="297" r="3.4"/></g>
<g fill="url(#hxWd)" stroke="#1d1915" stroke-width="1.1"><rect x="292" y="304" width="8" height="48"/><rect x="380" y="304" width="8" height="48"/></g>
<path d="M300 340 h80" stroke="#6b1f14" stroke-width="2.2"/>
<path d="M330 289 q-2 -10 10 -11 q12 1 10 11 z" fill="url(#hxPo)" stroke="#1d1915" stroke-width="1"/>
<path d="M331 284 q9 4 18 0" fill="none" stroke="#2f5f8f" stroke-width="1.2"/>
<g stroke="#a3332a" stroke-width="1"><line x1="337" y1="279" x2="336" y2="266"/><line x1="340" y1="279" x2="340" y2="264"/><line x1="343" y1="279" x2="344" y2="266"/></g>
<g fill="url(#hxBz)" stroke="#1d1915" stroke-width=".9"><ellipse cx="306" cy="287" rx="12" ry="2.6"/><ellipse cx="374" cy="287" rx="12" ry="2.6"/></g>
<g fill="#e38b2c" stroke="#7a3d10" stroke-width=".6"><circle cx="301" cy="283" r="3.6"/><circle cx="308" cy="282" r="3.8"/><circle cx="304.5" cy="278" r="3.4"/><circle cx="369" cy="283" r="3.6"/><circle cx="376" cy="282" r="3.8"/><circle cx="372.5" cy="278" r="3.4"/></g>
</g>`,
  'luhuong': `<g id="hx-luhuong">
<use href="#hxDinh" transform="translate(340 204) scale(.54)"/>
<use href="#hxCrane" transform="translate(310 204) scale(.22)"/>
<use href="#hxCrane" transform="translate(370 204) scale(-.22 .22)"/>
<g fill="url(#hxBr)" stroke="#3a2804" stroke-width=".9"><path d="M262 204 q-4 -6 0 -12 q-3 -6 1 -10 l-2 -3 h10 l-2 3 q4 4 1 10 q4 6 0 12 z"/><path d="M412 204 q-4 -6 0 -12 q-3 -6 1 -10 l-2 -3 h10 l-2 3 q4 4 1 10 q4 6 0 12 z"/></g>
</g>`,
  'channen': `<g id="hx-channen">
<use href="#hxNen" transform="translate(286 204) scale(.5)"/>
<use href="#hxNen" transform="translate(394 204) scale(.5)"/>
</g>`,
  'hac': `<g id="hx-hac">
<use href="#hxCrane" transform="translate(234 354) scale(.86)"/>
<use href="#hxCrane" transform="translate(446 354) scale(-.86 .86)"/>
</g>`,
  'tuche': `<g id="hx-tuche">
<path d="M58 256 h120 l-4 6 h-112 z" fill="#5b2f1f" stroke="#1d1915" stroke-width="1.3"/>
<rect x="64" y="262" width="108" height="70" fill="#4a2014" stroke="#1d1915" stroke-width="1.3"/>
<g fill="none" stroke="#2a120a" stroke-width="1.4"><rect x="70" y="268" width="30" height="58" rx="1"/><rect x="103" y="268" width="30" height="58" rx="1"/><rect x="136" y="268" width="30" height="58" rx="1"/></g>
<g fill="none" stroke="#e8e0d0" stroke-width=".9"><path d="M74 320 q4 -14 12 -18 q8 -4 8 -14 q0 -8 -6 -12"/><path d="M107 320 q12 -10 8 -24 q-2 -10 8 -20"/><path d="M162 320 q-4 -14 -12 -18 q-8 -4 -8 -14 q0 -8 6 -12"/></g>
<ellipse cx="84" cy="236" rx="12" ry="15" fill="#f6f2e8" stroke="#1d1915" stroke-width="1.1"/>
<circle cx="84" cy="236" r="5" fill="none" stroke="#2f5f8f" stroke-width="1.3"/>
<path d="M110 256 q-6 -12 6 -18 q14 -4 20 6 l9 -6 q2 2 -1 4 l-6 8 q-4 6 -14 6 z" fill="#f6f2e8" stroke="#1d1915" stroke-width="1.1"/>
<path d="M148 256 q-6 -8 -1 -16 q-2 -4 1 -7 h7 q3 3 1 7 q5 8 -1 16 z" fill="#f6f2e8" stroke="#1d1915" stroke-width="1"/>
</g>`,
  'sap': `<g id="hx-sap">
<rect x="502" y="286" width="116" height="8" rx="1.5" fill="#4a2014" stroke="#1d1915" stroke-width="1.3"/>
<path d="M508 298 h104 v12 q-12 -2 -16 6 h-72 q-4 -8 -16 -6 z" fill="#3a170e" stroke="#1d1915" stroke-width="1.2"/>
<rect x="504" y="294" width="112" height="4" fill="#3a170e" stroke="#1d1915" stroke-width=".8"/>
<g fill="#3a170e" stroke="#1d1915" stroke-width="1.2"><path d="M510 298 h10 v8 q0 16 -6 24 q-4 6 -10 6 q-2 -4 2 -6 q6 -8 4 -18 z"/><path d="M610 298 h-10 v8 q0 16 6 24 q4 6 10 6 q2 -4 -2 -6 q-6 -8 -4 -18 z"/></g>
<path d="M519 283 v-11 q12 -4 24 0 v11 z" fill="url(#hxAg)" stroke="#1d1915" stroke-width="1.1"/>
<path d="M517 272 q14 -12 28 0 z" fill="url(#hxAg)" stroke="#1d1915" stroke-width="1.1"/>
<ellipse cx="588" cy="285" rx="24" ry="4.5" fill="#6b2e1c" stroke="#1d1915" stroke-width="1.1"/>
<path d="M580 283 q-5 -12 8 -13 q11 0 10 10 l7 -5 q1 2 -1 3 l-5 7 z" fill="#f6f2e8" stroke="#1d1915" stroke-width="1"/>
</g>`,
  'chieu': `<g id="hx-chieu">
<path d="M246 352 L434 352 L476 426 L204 426 Z" fill="#7d2416" stroke="#1d1915" stroke-width="1.4"/>
<path d="M250 355 L430 355 L470 423 L210 423 Z" fill="#f2c640"/>
<path d="M253 357.5 L427 357.5 L465 421 L215 421 Z" fill="#2f6a4c"/>
<path d="M256 360 L424 360 L460 418.5 L220 418.5 Z" fill="#c4473a"/>
<path d="M262 366 L418 366 L450 413 L230 413 Z" fill="none" stroke="#f2e3c0" stroke-width="1"/>
<ellipse cx="340" cy="390" rx="30" ry="14" fill="#f2c640" stroke="#7d2416" stroke-width="1.2"/>
<text x="340" y="396" text-anchor="middle" style="fill:#a3332a;font-size:17px;font-family:Georgia,serif">囍</text>
</g>`,
  'lucbinh': `<g id="hx-lucbinh">
<use href="#hxVase" transform="translate(100 466) scale(.98)"/>
<use href="#hxVase" transform="translate(580 466) scale(-.98 .98)"/>
</g>`,
};
// the room as the tab shows it: everything the sheet draws, with the things not yet bought left out
function c4NhaSvg(bought) {
  const has = id => bought.includes(id);
  return `<svg viewBox="0 0 ${C4_NHA_W} ${C4_NHA_H}" width="100%" style="max-width:520px;display:block;margin:4px auto" role="img" aria-label="Gian thờ nhà riêng">`
    + C4_NHA_DEFS + C4_NHA_BASE
    + Object.entries(C4_NHA_ITEMS).map(([k, g]) => g.replace(/^<g\b/, `<g ${has(k) ? '' : 'display="none"'}`)).join('')
    + '</svg>';
}
