/* Makes the levels of chương VI · Tìm Chuột: run `node tools/gen-mice-levels.js` → js/ch6/levels.js.
   For each size: random fields (a placement, plots grown from each mouse, then nudged until only one answer is left),
   kept only if a logic solver (no guessing) finishes them; graded by the hardest rule needed and how often. */
const fs = require('fs');
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function count(N, reg, cap=2){ let n=0; const uc=new Array(N).fill(false), ur=new Array(N).fill(false);
  (function rec(r,prev){ if(n>=cap) return; if(r===N){n++;return;} for(let c=0;c<N;c++){ if(uc[c]||(prev>=0&&Math.abs(c-prev)<=1)) continue; const g=reg[r*N+c]; if(ur[g]) continue; uc[c]=ur[g]=true; rec(r+1,c); uc[c]=ur[g]=false; } })(0,-1); return n; }
function anySolution(N, reg){ let sol=null; const uc=new Array(N).fill(false), ur=new Array(N).fill(false), q=[];
  (function rec(r,prev){ if(sol) return; if(r===N){sol=q.slice();return;} for(let c=0;c<N;c++){ if(uc[c]||(prev>=0&&Math.abs(c-prev)<=1)) continue; const g=reg[r*N+c]; if(ur[g]) continue; uc[c]=ur[g]=true; q.push(c); rec(r+1,c); q.pop(); uc[c]=ur[g]=false; } })(0,-1); return sol; }
// the logic solver: returns { solved, score, maxRule }
function logic(N, reg){
  const cand=new Uint8Array(N*N).fill(1), placed=[]; let score=0, maxRule=0;
  const R=i=>(i/N)|0, C=i=>i%N;
  const groups=[]; for(let r=0;r<N;r++) groups.push([...Array(N).keys()].map(c=>r*N+c)); for(let c=0;c<N;c++) groups.push([...Array(N).keys()].map(r=>r*N+c));
  for(let g=0;g<N;g++) groups.push([...Array(N*N).keys()].filter(i=>reg[i]===g));
  const place=i=>{ placed.push(i); for(let j=0;j<N*N;j++) if(j!==i&&cand[j]&&(R(j)===R(i)||C(j)===C(i)||reg[j]===reg[i]||(Math.abs(R(j)-R(i))<=1&&Math.abs(C(j)-C(i))<=1))) cand[j]=0; cand[i]=2; };
  const live=gr=>gr.filter(i=>cand[i]===1), done=gr=>gr.some(i=>cand[i]===2);
  const use=(k,w)=>{ score+=w; if(k>maxRule) maxRule=k; };
  for(let guard=0;guard<500;guard++){
    if(placed.length===N) return {solved:true,score,maxRule};
    let moved=false;
    // 1: a group with one place left
    for(const gr of groups){ if(done(gr)) continue; const l=live(gr); if(l.length===0) return {solved:false}; if(l.length===1){ place(l[0]); use(1,1); moved=true; break; } }
    if(moved) continue;
    // 2: a group whose places all lie in one row / column / plot clears the rest of that line or plot
    for(const gr of groups){ if(done(gr)) continue; const l=live(gr); for(const key of [R,C,i=>reg[i]]){ const k0=key(l[0]); if(!l.every(i=>key(i)===k0)) continue;
        const other=groups.find(g2=>g2!==gr&&g2.every(i=>key(i)===k0)&&g2.length===N); if(!other) continue;
        const kill=live(other).filter(i=>!l.includes(i)); if(kill.length){ for(const i of kill) cand[i]=0; use(2,2); moved=true; break; } } if(moved) break; }
    if(moved) continue;
    // 3: a place that would leave some group empty (one step of what-if)
    for(let i=0;i<N*N&&!moved;i++){ if(cand[i]!==1) continue; const keep=cand.slice(); place(i); const dead=groups.some(gr=>!done(gr)&&live(gr).length===0); cand.set(keep); placed.pop(); if(dead){ cand[i]=0; use(3,4); moved=true; } }
    if(moved) continue;
    // 4: k plots confined to k rows (or columns) clear those rows of everything else (k = 2, 3)
    for(const key of [R,C]) { if(moved) break; const regs=groups.slice(2*N).filter(g=>!done(g));
      for(const k of [2,3]){ if(moved) break; const combos=[]; (function pick(s,acc){ if(acc.length===k){combos.push(acc.slice());return;} for(let j=s;j<regs.length;j++){acc.push(regs[j]);pick(j+1,acc);acc.pop();} })(0,[]);
        for(const cb of combos){ const lines=new Set(); for(const g of cb) for(const i of live(g)) lines.add(key(i)); if(lines.size!==k) continue;
          const inside=new Set(cb.flat()); const kill=[]; for(let i=0;i<N*N;i++) if(cand[i]===1&&lines.has(key(i))&&!inside.has(i)) kill.push(i);
          if(kill.length){ for(const i of kill) cand[i]=0; use(4,6+k); moved=true; break; } } } }
    if(!moved) return {solved:false};
  }
  return {solved:false};
}
function make(N, rnd){
  for(let tries=0;tries<400;tries++){
    let p=null; for(let k=0;k<200&&!p;k++){ const q=[],used=new Set(); let ok=true; for(let r=0;r<N&&ok;r++){ const o=[...Array(N).keys()].filter(c=>!used.has(c)&&(r===0||Math.abs(c-q[r-1])>1)); if(!o.length){ok=false;break;} const c=o[(rnd()*o.length)|0]; q.push(c); used.add(c);} if(ok) p=q; }
    if(!p) continue;
    const reg=new Array(N*N).fill(-1), fr=[]; for(let r=0;r<N;r++){ reg[r*N+p[r]]=r; fr.push(r*N+p[r]); }
    let left=N*N-N; while(left>0){ const i=fr[(rnd()*fr.length)|0], r=(i/N)|0, c=i%N; const nb=[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([a,b])=>a>=0&&b>=0&&a<N&&b<N&&reg[a*N+b]<0); if(!nb.length){ fr.splice(fr.indexOf(i),1); continue; } const [a,b]=nb[(rnd()*nb.length)|0]; reg[a*N+b]=reg[i]; fr.push(a*N+b); left--; }
    // nudge plot borders (keeping the planted answer and every plot in one piece) until the answer is the only one
    const conn=g=>{ const cells=reg.map((v,i)=>v===g?i:-1).filter(i=>i>=0); if(!cells.length) return false; const seen=new Set([cells[0]]), st=[cells[0]]; while(st.length){ const i=st.pop(), r=(i/N)|0, c=i%N; for(const [a,b] of [[r-1,c],[r+1,c],[r,c-1],[r,c+1]]) if(a>=0&&b>=0&&a<N&&b<N&&reg[a*N+b]===g&&!seen.has(a*N+b)){ seen.add(a*N+b); st.push(a*N+b);} } return seen.size===cells.length; };
    const isMouse=i=>p[(i/N)|0]===i%N;
    for(let k=0;k<3000&&count(N,reg)>1;k++){
      const i=(rnd()*N*N)|0; if(isMouse(i)) continue; const r=(i/N)|0, c=i%N; const nb=[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([a,b])=>a>=0&&b>=0&&a<N&&b<N).map(([a,b])=>reg[a*N+b]).filter(g=>g!==reg[i]);
      if(!nb.length) continue; const old=reg[i], g=nb[(rnd()*nb.length)|0]; reg[i]=g; if(!conn(old)) reg[i]=old;
    }
    if(count(N,reg)!==1) continue;
    const L=logic(N,reg); if(!L.solved) continue;
    return { reg, sol:p, ...L };
  }
  return null;
}
module.exports = { make, logic, count, anySolution, mulberry };
if (require.main === module) {
  // node tools/gen-mice-levels.js [sizes…]: makes the given sizes (each into tools/mice-cache/N.json), then writes
  // js/ch6/levels.js from every cached size. With no sizes it only rewrites levels.js.
  const PLAN = { 5: 9, 6: 12, 7: 15, 8: 15, 9: 14, 10: 12 }, dir = __dirname + '/mice-cache';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  for (const N of process.argv.slice(2).map(Number)) {
    const want = PLAN[N], pool = [], t0 = Date.now();
    for (let s = 1; pool.length < want * 3 && s < 4000; s++) { const f = make(N, mulberry(N * 100000 + s)); if (f) pool.push(f); if (Date.now() - t0 > 400000) break; }
    pool.sort((a, b) => a.maxRule - b.maxRule || a.score - b.score);
    // spread across the pool, easiest to hardest
    const pickd = []; for (let k = 0; k < want && pool.length; k++) pickd.push(pool[Math.min(pool.length - 1, Math.round(k * (pool.length - 1) / Math.max(1, want - 1)))]);
    console.error(N, 'pool', pool.length, 's', ((Date.now() - t0) / 1000) | 0, 'rules', pickd.map(f => f.maxRule + ':' + f.score).join(' '));
    fs.writeFileSync(dir + '/' + N + '.json', JSON.stringify(pickd.map(f => ({ N, reg: f.reg.map(v => v.toString(36)).join(''), sol: f.sol.map(v => v.toString(36)).join(''), d: f.maxRule }))));
  }
  const out = [];
  for (const N of Object.keys(PLAN)) { const p = dir + '/' + N + '.json'; if (fs.existsSync(p)) out.push(...JSON.parse(fs.readFileSync(p, 'utf8'))); }
  const head = '/* Chương VI · Tìm Chuột: the levels, made by tools/gen-mice-levels.js (do not edit by hand). reg: the plot of each\n' +
    '   cell, row by row, base 36; sol: the column of the mouse in each row; d: the hardest rule needed (1 easiest … 4). */\n';
  const rows = out.map(l => "  { N: " + l.N + ", reg: '" + l.reg + "', sol: '" + l.sol + "', d: " + l.d + " },");
  fs.writeFileSync(__dirname + '/../js/ch6/levels.js', head + 'const C6_LEVELS = [\n' + rows.join('\n') + '\n];\n');
  console.error('levels', out.length);
}
