/* Web Audio: one song per chapter (SONGS), drums/kèn synth and small sound effects. */
/* ---------- audio ---------- */
const AU = (() => {
  let c = null, amb = null, master, music, sfx, echo, base = .75, ducked = false, next = 0, step = 0, quiet = false, key = 0, song = 0, muteDr = false;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  // Chương I: rước dâu rộn ràng (trống cái, chũm chọe, kèn); Chương II: khúc đố chậm rãi (trống con, mõ, kèn trầm, nhịp lẻ)
  const seq = list => list.flatMap(([m, n]) => [m, ...new Array(n - 1).fill(null)]);   // [[note, steps]…] → one entry a step
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
    // Chợ Làng Chuột (chương IV): a lively market tune, kèn over drum and woodblock, easy to hear for a long while
    { bpm: 104, hold: 3, mel: [72,null,74,null,76,79,76,null,74,null,72,null,69,null,null,null,72,null,74,76,79,null,81,null,79,76,74,null,76,null,null,null,81,null,79,null,76,null,74,76,79,null,76,null,74,null,72,null,69,null,72,null,74,76,74,72,69,null,67,null,69,null,null,null],
      drum: [.7, 0, 0, .25, .5, 0, .3, 0, .6, 0, 0, .25, .5, 0, .3, .2], perc: s => (s % 4 === 2 ? 'mo' : s === 7 ? 'mo2' : null), vol: .09, oct: 0 },
    // Chương VI · Tìm Chuột: an easy, thinking tune in the five-note scale, slow wooden knocks
    { bpm: 92, hold: 3, mel: [62,null,64,null,67,null,null,69,67,null,64,null,62,null,null,null,64,null,67,null,69,null,74,null,71,null,69,null,67,null,null,null,69,null,71,null,74,null,null,71,69,null,67,null,64,null,null,null,62,null,64,67,64,null,62,null,59,null,62,null,null,null,null,null],
      drum: [.6, 0, 0, 0, .3, 0, .2, 0, .5, 0, 0, 0, .3, 0, 0, .2], perc: s => (s % 8 === 4 ? 'mo' : s === 14 ? 'mo2' : null), vol: .085, oct: 0 },
    // Chương I tranh 5 · Tấm Cám: the owner's score, bars 20–27 (G | B | C | D7 | G | B | C Am7 | Cm), on the trumpet over
    // the drum, round and round the whole tranh. One step is a sixteenth (bpm 168 = a crotchet of 84), triplets rounded
    { bpm: 168, hold: 16, vol: .1, oct: 0,
      mel: [79,null,79,79,null,null,74,null,74,null,null,null,71,71,79,null,78,null,78,78,null,null,75,null,74,null,null,null,71,71,78,null,76,null,76,76,null,null,71,null,71,null,null,null,69,71,74,null,74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,79,null,79,79,null,74,null,74,null,71,71,null,71,71,79,null,78,null,78,78,null,null,75,null,74,null,null,null,71,71,78,null,76,null,null,null,76,78,78,79,81,null,null,null,null,null,79,null,76,null,null,null,null,null,null,null,75,null,null,null,null,null,null,null],
      drum: [.8, 0, 0, 0, .35, 0, 0, 0, .65, 0, 0, 0, .35, 0, .25, 0], perc: s => (s === 4 || s === 12 ? 'mo' : null) },
    // Chương VII · Ai Ăn Vụng?: a quiet mystery to think over for a long while — đàn bầu bending into each long note,
    // a low đàn tranh walking under it, a soft hum, an echo; D with the odd E♭ for the hush; no drums (128 steps, about a minute)
    { bpm: 66, hold: 8, inst: 'bau', echo: true, drone: 50, vol: .075, oct: 0, drum: new Array(16).fill(0), perc: () => null,
      mel: seq([[62,4],[65,2],[67,2],[69,8],[67,2],[65,2],[63,4],[62,8],  [69,4],[72,2],[69,2],[67,8],[65,2],[67,2],[69,4],[57,8],
                [74,6],[72,2],[69,4],[67,4],[69,2],[67,2],[65,4],[63,8],  [62,4],[null,4],[65,2],[63,2],[62,4],[57,8],[null,8]]),
      arp: seq([[50,6],[57,4],[62,6], [50,6],[57,4],[60,6], [48,6],[55,4],[60,6], [45,6],[57,4],[63,6]]) },
    // Chương III tranh 5 · Đánh Đu: a village festival (owner) — a bright five-note kèn tune, quick, over a rolling drum,
    // cymbal on the bar and woodblocks on every off-beat (64 quavers)
    { bpm: 132, hold: 2, vol: .11, oct: 0,
      mel: seq([[67,1],[69,1],[71,2],[74,2],[71,1],[69,1],  [67,2],[64,1],[67,1],[69,4],  [71,1],[74,1],[76,2],[74,1],[71,1],[69,2],  [67,1],[69,1],[71,1],[69,1],[67,4],
                [74,2],[76,1],[79,1],[76,2],[74,2],  [71,1],[74,1],[71,1],[69,1],[67,4],  [64,1],[67,1],[69,1],[71,1],[74,1],[76,1],[74,2],  [71,1],[69,1],[67,2],[null,2],[67,1],[67,1]]),
      drum: [1, 0, .4, .3, .8, 0, .5, .3, 1, 0, .4, .3, .8, .4, .6, .5], perc: s => (s === 0 ? 'cym' : s % 2 === 1 ? 'mo' : null) },
  ];
  const cur = () => SONGS[song] || SONGS[0];
  const SP = () => 60 / cur().bpm / 2;
  function init() {
    if (c) { if (c.state !== 'running') c.resume(); blip(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    c = new AC(); master = c.createGain(); master.gain.value = .8;
    const comp = c.createDynamicsCompressor(); master.connect(comp); comp.connect(c.destination);
    music = c.createGain(); music.gain.value = .75; music.connect(master);
    sfx = c.createGain(); sfx.gain.value = 1; sfx.connect(master);
    echo = c.createDelay(1); echo.delayTime.value = .42; const fb = c.createGain(), lp = c.createBiquadFilter(), wet = c.createGain();   // a soft echo for the songs that ask for it
    fb.gain.value = .38; lp.type = 'lowpass'; lp.frequency.value = 1600; wet.gain.value = .55; echo.connect(lp); lp.connect(fb); fb.connect(echo); lp.connect(wet); wet.connect(music);
    next = c.currentTime + .1; blip();
  }
  // iOS keeps a context silent until a sound starts inside a tap, even when it says it is running: start an empty one on every tap
  function blip() { try { const s = c.createBufferSource(); s.buffer = c.createBuffer(1, 1, 22050); s.connect(c.destination); s.start(0); } catch (e) {} }
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
  // đàn bầu: one string, the note bent up into from below, a slow vibrato that grows, a long fading tail
  function bau(t, m, dur, dest = music, vol = .08) {
    const f0 = mtof(m), g = c.createGain(), lp = c.createBiquadFilter(), lfo = c.createOscillator(), lg = c.createGain();
    lp.type = 'lowpass'; lp.frequency.value = 1800; lp.Q.value = .5;
    lfo.frequency.value = 4.6; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f0 * .014, t + Math.min(1.2, dur * .7)); lfo.connect(lg);
    for (const [k, v] of [[1, 1], [2, .22], [3, .06]]) { const o = c.createOscillator(), og = c.createGain(); o.type = 'sine';
      o.frequency.setValueAtTime(f0 * k * .94, t); o.frequency.exponentialRampToValueAtTime(f0 * k, t + .16); lg.connect(o.frequency); og.gain.value = v; o.connect(og); og.connect(lp); o.start(t); o.stop(t + dur + .05); }
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .05); g.gain.linearRampToValueAtTime(vol * .55, t + dur * .5); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    lp.connect(g); g.connect(dest); if (echo) g.connect(echo); lfo.start(t); lfo.stop(t + dur + .05);
  }
  // đàn tranh, low: a soft plucked string that rings and fades
  function tranh(t, m, vol = .045) {
    const o = c.createOscillator(), o2 = c.createOscillator(), lp = c.createBiquadFilter(), g2 = c.createGain(); o.type = 'triangle'; o.frequency.value = mtof(m); o2.type = 'sine'; o2.frequency.value = mtof(m) * 2; g2.gain.value = .3;
    lp.type = 'lowpass'; lp.frequency.value = 1400; o.connect(lp); o2.connect(g2); g2.connect(lp);
    const g = env(lp, t, .004, vol, 1.8); g.connect(music); if (echo) g.connect(echo); o.start(t); o2.start(t); o.stop(t + 1.85); o2.stop(t + 1.85);
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
          const ML = MEL.length, m = MEL[step % ML]; if (m) { let d = 1; const H = so.hold || 3; while (!MEL[(step + d) % ML] && d < H) d++; (so.inst === 'sao' ? sao : so.inst === 'bau' ? bau : ken)(next, m + key + so.oct, sp * d * .95, music, so.vol); }
          if (so.arp) { const a = so.arp[step % so.arp.length]; if (a) tranh(next, a + key); }
          if (so.drone && step % 16 === 0) drone(next, so.drone + key, sp * 16);
        }
        next += sp; step++;
      }
    },
    setKey(k) { key = k; },
    muteDrums(v) { muteDr = !!v; },
    songPos() { if (!c || c.state !== 'running') return null; return { step: step - (next - c.currentTime) / SP() }; },
    drumPattern() { return cur().drum; },
    setSong(i) { if (i === song) return; song = i; step = 0; base = .75; if (c) next = c.currentTime + .15; },
    setQuiet(q) { if (q === quiet || !c) return; quiet = q; music.gain.setTargetAtTime(q ? 0 : base, c.currentTime, .05); },
    // how loud the song plays when it plays (tranh 5 keeps it low, lower still by a scene); melody() ducks under it
    musicLevel(v) { if (Math.abs(v - base) < .005 || !c) { base = v; return; } base = v; if (!quiet && !ducked) music.gain.setTargetAtTime(base, c.currentTime, .4); },
    drumOne: on(() => drum(c.currentTime, 1.4, sfx)),
    kenNote: on(m => ken(c.currentTime, m, .3, sfx, .22)),
    // a melody on the bamboo flute over soft held chords (tranh 5's rainbow); the song underneath goes quiet meanwhile
    melody: on((notes, chords, bpm = 60, inst = 'sao') => {
      const b = 60 / bpm, t0 = c.currentTime + .15; let t = t0;
      for (const [m, n] of notes) { if (m) (inst === 'ken' ? ken : sao)(t, m, n * b * .96 + .06, sfx, inst === 'ken' ? .13 : .14); t += n * b; }
      let tc = t0;
      for (const [ns, n] of chords) {
        for (const m of ns) { const o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.value = mtof(m); g.gain.setValueAtTime(0, tc); g.gain.linearRampToValueAtTime(.035, tc + .5); g.gain.setValueAtTime(.03, tc + n * b - .3); g.gain.linearRampToValueAtTime(0, tc + n * b + .2); o.connect(g); g.connect(sfx); o.start(tc); o.stop(tc + n * b + .25); }
        tc += n * b;
      }
      const len = t - c.currentTime; ducked = true; music.gain.setTargetAtTime(0, c.currentTime, .3); setTimeout(() => { ducked = false; if (!quiet) music.gain.setTargetAtTime(base, c.currentTime, .6); }, len * 1000 + 400);
      return len;
    }),
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
    // chương IV's soundscape: three looping beds (crowd murmur, rain, wind) set by level, and small one-shots
    ambient: on(lv => {
      if (!amb) {
        const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        const bed = (type, freq, q) => { const s = c.createBufferSource(); s.buffer = buf; s.loop = true; s.playbackRate.value = .9 + Math.random() * .2; const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = c.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(sfx); s.start(); return { g, f }; };
        amb = { crowd: bed('bandpass', 700, .7), rain: bed('highpass', 2200, .3), wind: bed('bandpass', 420, 1.2) };
        const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = .13; lg.gain.value = 180; lfo.connect(lg); lg.connect(amb.wind.f.frequency); lfo.start();   // the wind rises and falls
      }
      const k = [lv.crowd || 0, lv.rain || 0, lv.wind || 0], L = amb.last || [];
      if (L.length && k.every((v, i) => Math.abs(v - L[i]) < .03)) return;   // called every frame: only move when the level really changes
      amb.last = k;
      const t = c.currentTime;
      amb.crowd.g.gain.setTargetAtTime(.05 * (lv.crowd || 0), t, .6); amb.rain.g.gain.setTargetAtTime(.07 * (lv.rain || 0), t, .8); amb.wind.g.gain.setTargetAtTime(.09 * (lv.wind || 0), t, 1.2);
    }),
    chatter: on(() => { const t = c.currentTime, f0 = 150 + Math.random() * 140; for (let i = 0, n = 2 + (Math.random() * 3 | 0); i < n; i++) sweep('sawtooth', f0 * (1 + Math.random() * .3), f0 * (.8 + Math.random() * .3), .09 + Math.random() * .08, 700 + Math.random() * 900, .025, t + i * (.1 + Math.random() * .08)); }),
    step: on(() => { const t = c.currentTime, n = noise(.06), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500 + Math.random() * 300; n.connect(f); env(f, t, .004, .05, .06).connect(sfx); n.start(t); n.stop(t + .06); }),
    gurgle: on(() => { const t = c.currentTime; for (let i = 0; i < 14; i++) sweep('sine', 320 + Math.random() * 80, 170, .07, 300, .09, t + i * .085);   // the water in the pipe bubbling
      const n = noise(1.1), f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; n.connect(f); env(f, t + 1.3, .2, .05, 1.1).connect(sfx); n.start(t + 1.3); n.stop(t + 2.4); }),   // then the long breath out
    knock: on((n = 3) => { const t = c.currentTime; for (let i = 0; i < n; i++) { const o = c.createOscillator(), f = c.createBiquadFilter(); o.type = 'triangle'; o.frequency.setValueAtTime(1000, t + i * .32); o.frequency.exponentialRampToValueAtTime(720, t + i * .32 + .05); f.type = 'bandpass'; f.frequency.value = 980; f.Q.value = 6; o.connect(f); env(f, t + i * .32, .002, .3, .1).connect(sfx); o.start(t + i * .32); o.stop(t + i * .32 + .12); } }),
    buzz: on(() => { const t = c.currentTime; sweep('sawtooth', 190 + Math.random() * 40, 230 + Math.random() * 40, .6 + Math.random() * .5, 480, .035, t); }),
    shout: on(() => { const t = c.currentTime, f0 = 260 + Math.random() * 120; sweep('sawtooth', f0, f0 * 1.3, .14, 1100, .12, t); sweep('sawtooth', f0 * 1.3, f0 * .8, .26, 1000, .12, t + .14); }),
    tension: on(() => { const t = c.currentTime, o = c.createOscillator(); o.frequency.value = mtof(38); const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .3); g.gain.linearRampToValueAtTime(0, t + 2.2); o.connect(g); g.connect(sfx); o.start(t); o.stop(t + 2.3); }),
  };
})();
