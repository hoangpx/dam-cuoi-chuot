/* Web Audio: one song per chapter (SONGS), drums/kèn synth and small sound effects. */
/* ---------- audio ---------- */
const AU = (() => {
  let c = null, master, music, sfx, next = 0, step = 0, quiet = false, key = 0, song = 0, muteDr = false;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  // Chương I: rước dâu rộn ràng (trống cái, chũm chọe, kèn); Chương II: khúc đố chậm rãi (trống con, mõ, kèn trầm, nhịp lẻ)
  const SONGS = [
    { bpm: 112, mel: [74, null, 76, 78, 81, null, 78, 76, 74, null, 71, 74, 76, null, 74, null, 78, null, 81, 83, 81, null, 78, 76, 74, 76, 78, null, 74, null, null, null],
      drum: [1, 0, 0, 0, .7, 0, .4, 0, .7, 0, 0, 0, .7, 0, .4, 0], perc: s => s === 8 ? 'cym' : null, vol: .14, oct: 0 },
    { bpm: 86, mel: [69, null, null, 72, 74, null, 72, null, 69, null, 67, null, 69, null, null, null, 76, null, 74, 72, 74, null, null, 76, 79, null, 76, 74, 72, null, 69, null],
      drum: [.9, 0, 0, .35, 0, 0, .55, 0, 0, 0, .35, 0, .6, 0, 0, 0], perc: s => (s % 4 === 2 ? 'mo' : s === 11 ? 'mo2' : null), vol: .12, oct: -12 },
    // Chương III: bài hát do chủ dự án tự sáng tác (2/4, 16 ô nhịp): Fa Fa Đô Đô Rê Rê Đô · ×2 · Đô Đô Rê Mi Fa – Fa – · ×2
    // one step = a quaver; hold 4 lets the minims ring for a whole bar; an octave up so it sounds bright for children
    { bpm: 108, hold: 4, mel: [65,null,65,null,60,null,60,null,62,null,62,null,60,null,null,null,65,null,65,null,60,null,60,null,62,null,62,null,60,null,null,null,60,null,60,null,62,null,64,null,65,null,null,null,65,null,null,null,60,null,60,null,62,null,64,null,65,null,null,null,65,null,null,null],
      drum: [.8, 0, 0, 0, .4, 0, 0, 0, .6, 0, 0, 0, .4, 0, 0, 0], perc: s => (s % 4 === 2 ? 'mo2' : null), vol: .12, oct: 12 },
    // Hứng Dừa (chương III tranh 2): a skipping tune in the five-note scale, kèn over a bouncy drum and woodblock
    { bpm: 118, hold: 4, mel: [67,null,69,67,64,null,62,null,64,67,69,null,67,null,null,null,69,72,69,null,67,null,64,null,62,64,67,64,62,null,null,null,67,null,69,67,64,null,62,null,64,67,69,72,74,null,null,null,72,null,69,67,69,null,67,null,64,62,64,67,60,null,null,null],
      drum: [.8, 0, .25, 0, .55, 0, .25, .2, .7, 0, .25, 0, .55, .2, .3, 0], perc: s => (s % 2 === 1 ? (s % 4 === 3 ? 'mo2' : 'mo') : null), vol: .12, oct: 12 },
    // Chăn Trâu (chương III tranh 3): tense and driving, a minor five-note run hammered over a pounding drum
    { bpm: 150, hold: 2, mel: [69,69,null,72,69,null,67,null,69,69,null,72,74,null,72,null,69,69,null,72,69,null,67,64,62,null,64,null,67,null,null,null,76,null,74,72,74,null,72,69,72,null,69,67,69,null,null,null,76,76,74,76,79,null,76,74,72,69,72,74,76,null,null,null],
      drum: [1, 0, .5, 0, .8, .35, .5, 0, 1, 0, .5, .35, .8, .35, .6, .45], perc: s => (s % 2 === 1 ? 'mo' : s === 12 ? 'cym' : null), vol: .12, oct: 0 },
    // Thả Diều (chương III tranh 4): slow and easy, a bamboo flute over the hum of the kite's own flute, a soft drum now and then
    { bpm: 76, hold: 8, inst: 'sao', drone: 55, mel: [74,null,null,null,76,null,79,null,81,null,null,null,null,null,null,null,79,null,null,76,74,null,null,null,71,null,null,null,null,null,null,null,74,null,null,null,76,null,79,null,83,null,81,null,79,null,null,null,76,null,null,74,76,null,null,null,74,null,null,null,null,null,null,null],
      drum: [.35, 0, 0, 0, 0, 0, 0, 0, .2, 0, 0, 0, 0, 0, 0, 0], perc: s => (s === 6 || s === 14 ? 'mo' : null), vol: .1, oct: 0 },
  ];
  const cur = () => SONGS[song] || SONGS[0];
  const SP = () => 60 / cur().bpm / 2;
  function init() {
    if (c) { if (c.state === 'suspended') c.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    c = new AC(); master = c.createGain(); master.gain.value = .8;
    const comp = c.createDynamicsCompressor(); master.connect(comp); comp.connect(c.destination);
    music = c.createGain(); music.gain.value = .75; music.connect(master);
    sfx = c.createGain(); sfx.gain.value = 1; sfx.connect(master);
    next = c.currentTime + .1;
  }
  function noise(dur) { const b = c.createBuffer(1, Math.max(1, c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = c.createBufferSource(); s.buffer = b; return s; }
  function env(node, t, a, peak, d) { const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.001, t + d); node.connect(g); return g; }
  function drum(t, v = 1, dest = music) {
    const o = c.createOscillator(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(58, t + .18);
    env(o, t, .005, .55 * v, .3).connect(dest); o.start(t); o.stop(t + .32);
    const n = noise(.08), f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; n.connect(f);
    env(f, t, .002, .25 * v, .07).connect(dest); n.start(t); n.stop(t + .08);
  }
  function mo(t, hi) {
    const o = c.createOscillator(), f = c.createBiquadFilter(); o.type = 'triangle'; o.frequency.setValueAtTime(hi ? 1250 : 950, t); o.frequency.exponentialRampToValueAtTime(hi ? 900 : 700, t + .05);
    f.type = 'bandpass'; f.frequency.value = hi ? 1300 : 1000; f.Q.value = 6; o.connect(f); env(f, t, .002, .35, .09).connect(music); o.start(t); o.stop(t + .1);
  }
  function cymbal(t) { const n = noise(.5), f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 5000; n.connect(f); env(f, t, .002, .1, .45).connect(music); n.start(t); n.stop(t + .5); }
  function ken(t, m, dur, dest = music, vol = .14) {
    const o = c.createOscillator(), f = c.createBiquadFilter(), lfo = c.createOscillator(), lg = c.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(mtof(m) * .985, t); o.frequency.linearRampToValueAtTime(mtof(m), t + .05);
    lfo.frequency.value = 6; lg.gain.value = 7; lfo.connect(lg); lg.connect(o.frequency);
    f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 1.6; o.connect(f);
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .03); g.gain.setValueAtTime(vol * .85, t + dur * .7); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    f.connect(g); g.connect(dest); o.start(t); lfo.start(t); o.stop(t + dur + .02); lfo.stop(t + dur + .02);
  }
  // sáo trúc: a soft sine with breath and a vibrato that comes in late
  function sao(t, m, dur, dest = music, vol = .12) {
    const o = c.createOscillator(), o2 = c.createOscillator(), lfo = c.createOscillator(), lg = c.createGain(), g = c.createGain(), g2 = c.createGain();
    o.type = 'sine'; o.frequency.value = mtof(m); o2.type = 'triangle'; o2.frequency.value = mtof(m) * 2; g2.gain.value = .12;
    lfo.frequency.value = 5.2; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(mtof(m) * .012, t + Math.min(.5, dur * .6)); lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .09); g.gain.setValueAtTime(vol * .8, t + dur * .75); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(dest);
    const n = noise(.12), f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = mtof(m) * 2; f.Q.value = 3; n.connect(f); env(f, t, .01, vol * .5, .12).connect(dest); n.start(t); n.stop(t + .12);
    for (const x of [o, o2, lfo]) { x.start(t); x.stop(t + dur + .02); }
  }
  // sáo diều: the hollow hum of the flute on a kite, swelling and fading with the wind
  function drone(t, m, dur, dest = music) {
    const g = c.createGain(), trem = c.createOscillator(), tg = c.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + dur * .3); g.gain.linearRampToValueAtTime(.035, t + dur * .7); g.gain.linearRampToValueAtTime(0, t + dur);
    trem.frequency.value = .8; tg.gain.value = .018; trem.connect(tg); tg.connect(g.gain);
    for (const [k, v] of [[1, 1], [1.5, .45], [2, .25]]) { const o = c.createOscillator(), og = c.createGain(); o.type = 'sine'; o.frequency.value = mtof(m) * k; og.gain.value = v; o.connect(og); og.connect(g); o.start(t); o.stop(t + dur + .02); }
    g.connect(dest); trem.start(t); trem.stop(t + dur + .02);
  }
  function sweep(type, f0, f1, dur, filt, vol, t = c.currentTime) {
    const o = c.createOscillator(), f = c.createBiquadFilter(); o.type = type;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    f.type = 'bandpass'; f.frequency.value = filt; f.Q.value = 2.5; o.connect(f);
    env(f, t, .03, vol, dur).connect(sfx); o.start(t); o.stop(t + dur + .02);
  }
  const on = fn => (...a) => { if (c) fn(...a); };
  return {
    init,
    update() {
      if (!c || c.state !== 'running') return;
      while (next < c.currentTime + .12) {
        const so = cur(), sp = SP();
        if (!quiet) {
          const s = step % 16, MEL = so.mel;
          if (so.drum[s] && !muteDr) drum(next, so.drum[s]);
          const p = so.perc(s); if (p === 'cym') cymbal(next); else if (p === 'mo') mo(next, false); else if (p === 'mo2') mo(next, true);
          const ML = MEL.length, m = MEL[step % ML]; if (m) { let d = 1; const H = so.hold || 3; while (!MEL[(step + d) % ML] && d < H) d++; (so.inst === 'sao' ? sao : ken)(next, m + key + so.oct, sp * d * .95, music, so.vol); }
          if (so.drone && step % 16 === 0) drone(next, so.drone + key, sp * 16);
        }
        next += sp; step++;
      }
    },
    setKey(k) { key = k; },
    muteDrums(v) { muteDr = !!v; },
    songPos() { if (!c || c.state !== 'running') return null; return { step: step - (next - c.currentTime) / SP() }; },
    drumPattern() { return cur().drum; },
    setSong(i) { if (i === song) return; song = i; step = 0; if (c) next = c.currentTime + .15; },
    setQuiet(q) { if (q === quiet || !c) return; quiet = q; music.gain.setTargetAtTime(q ? 0 : .75, c.currentTime, .05); },
    drumOne: on(() => drum(c.currentTime, 1.4, sfx)),
    kenNote: on(m => ken(c.currentTime, m, .3, sfx, .22)),
    tune: on(seq => { const t = c.currentTime + .1; seq.forEach(([k, , m], i) => { if (k === 'K') ken(t + i * .34, m, .3, sfx, .16); else drum(t + i * .34, 1.1, sfx); }); }),
    snort: on(() => { const t = c.currentTime, o = c.createOscillator(), f = c.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(90, t); o.frequency.linearRampToValueAtTime(70, t + .5); f.type = 'lowpass'; f.frequency.value = 400; o.connect(f); env(f, t, .05, .35, .6).connect(sfx); o.start(t); o.stop(t + .62); }),
    drumHit: on(() => { const t = c.currentTime; drum(t, 1.5, sfx); drum(t + .22, 1.3, sfx); drum(t + .36, 1.6, sfx); }),
    kenCall: on(() => { const t = c.currentTime; [81, 83, 86, 88, 86, 93].forEach((m, i) => ken(t + i * .16, m, .2, sfx, .2)); }),
    meow: on(() => sweep('sawtooth', 520, 300, .7, 1200, .35)),
    crow: on(() => { const t = c.currentTime; sweep('sawtooth', 600, 900, .25, 1500, .3, t); sweep('sawtooth', 900, 820, .5, 1600, .3, t + .25); sweep('sawtooth', 820, 420, .45, 1300, .25, t + .75); }),
    quack: on(() => { const t = c.currentTime; for (let i = 0; i < 4; i++) sweep('square', 340, 220, .14, 1100, .18, t + i * .22); }),
    screech: on(() => sweep('sawtooth', 2000, 1300, .8, 2600, .22)),
    moo: on(() => { const t = c.currentTime, o = c.createOscillator(), f = c.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(120, t); o.frequency.linearRampToValueAtTime(95, t + 1.3); f.type = 'lowpass'; f.frequency.value = 500; o.connect(f); env(f, t, .2, .4, 1.4).connect(sfx); o.start(t); o.stop(t + 1.45); }),
    plop: on(() => { const t = c.currentTime; drum(t, 1.2, sfx); const n = noise(.4), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(1600, t); f.frequency.exponentialRampToValueAtTime(200, t + .35); n.connect(f); env(f, t, .01, .35, .4).connect(sfx); n.start(t); n.stop(t + .4); }),
    chirp: on(() => { const t = c.currentTime; for (let i = 0; i < 3; i++) sweep('sine', 3800, 5200, .08, 4500, .12, t + i * .1); }),
    thump: on(() => { const t = c.currentTime; drum(t, 1.4, sfx); }),
    pluck: on((m = 86) => { const t = c.currentTime, o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(m); env(o, t, .005, .25, .5).connect(sfx); o.start(t); o.stop(t + .52); }),
    bark: on(() => { const t = c.currentTime; sweep('square', 420, 260, .12, 1400, .3, t); sweep('square', 380, 220, .14, 1400, .3, t + .2); }),
    snore: on(() => sweep('sawtooth', 90, 70, .9, 300, .14)),
    creak: on(() => { const t = c.currentTime; sweep('sawtooth', 180, 90, .7, 700, .2, t); const n = noise(.6), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400; n.connect(f); env(f, t, .05, .15, .6).connect(sfx); n.start(t); n.stop(t + .6); }),
    click: on(() => { const t = c.currentTime; drum(t, .5, sfx); sweep('triangle', 900, 600, .08, 1200, .15, t); }),
    swoosh: on(() => { const t = c.currentTime, n = noise(.5), f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = .8; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(3200, t + .4); n.connect(f); env(f, t, .05, .3, .5).connect(sfx); n.start(t); n.stop(t + .5); }),
    ribbit: on(() => { const t = c.currentTime; sweep('sawtooth', 140, 90, .16, 500, .3, t); sweep('sawtooth', 150, 95, .16, 500, .3, t + .22); }),
    oink: on(() => { const t = c.currentTime; sweep('sawtooth', 260, 150, .35, 800, .3, t); sweep('sawtooth', 230, 140, .3, 800, .25, t + .4); }),
    tap: on(() => sweep('triangle', 700, 520, .05, 900, .08)),
    caw: on(() => { const t = c.currentTime; sweep('sawtooth', 760, 430, .22, 1300, .22, t); sweep('sawtooth', 700, 400, .26, 1200, .2, t + .3); }),
    stamp: on(() => { drum(c.currentTime, 1.6, sfx); }),
    cluck: on(() => { const t = c.currentTime; for (let i = 0; i < 3; i++) sweep('sawtooth', 520, 380, .09, 1100, .24, t + i * .13); sweep('sawtooth', 640, 430, .28, 1200, .26, t + .42); }),
    cheep: on(() => { const t = c.currentTime + Math.random() * .05; sweep('sine', 2500, 3500, .07, 3200, .1, t); sweep('sine', 2700, 3700, .06, 3400, .08, t + .1); }),
    tension: on(() => { const t = c.currentTime, o = c.createOscillator(); o.frequency.value = mtof(38); const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .3); g.gain.linearRampToValueAtTime(0, t + 2.2); o.connect(g); g.connect(sfx); o.start(t); o.stop(t + 2.3); }),
  };
})();
