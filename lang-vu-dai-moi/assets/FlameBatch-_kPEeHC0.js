import{Ja as e,Or as t,Pi as n,Ri as r,Ua as i,Xn as a,Xr as o,_r as s,bi as c,br as l,dr as u,ei as d,io as f,or as p,pr as m,ti as h,xi as g,za as _}from"./LevelStorage-JaoBFERB.js";import{_ as v,o as y,s as b,u as x}from"./Trees-BixY43Hv.js";import{t as S}from"./GlobalUniforms-BMXj3q_v.js";import{f as C,t as w}from"./SmallProps-C5k08o7A.js";import{n as T}from"./ThawField-DUWC1gaN.js";var E=(e=.5,t=.62)=>(n,r)=>t+(1-t)*m(-.05,e,r),D=(e,t,n,r)=>p(Number.isFinite(e)?e:t,n,r),O=[`spire`,`mesa`,`arch`,`pillar`,`boulders`,`hoodoo`];function k(e,t,n,r,i,a){let o=r.length,s=e.mat(t.side),c=e.mat(t.top),l=e.units(s),u=e.units(c);for(let t=0;t<n.length;t++){let d=n[t],f=n[t+1],p=d.taper??1,m=r.map(e=>e*(1+(a()-.5)*.08)),h=(e,t)=>m.map((n,r)=>{let i=r/o*Math.PI*2;return[d.cx+Math.cos(i)*d.rx*n*t,e,d.cz+Math.sin(i)*d.rz*n*t]}),g=h(d.y0,1),_=h(d.y1,p),v=f&&f.rx>d.rx*p*1.02,y=d.dark??1,b=0;for(let t=0;t<o;t++){let n=(t+1)%o,r=g[t],c=g[n],u=_[n],f=_[t],p=Math.hypot(c[0]-r[0],c[2]-r[2]),m=(.9+.14*a())*y,h=m*(v?.72:1);e.quad(s,[r,f,u,c],[[b/l[0],(i+d.y0)/l[1]],[b/l[0],(i+d.y1)/l[1]],[(b+p)/l[0],(i+d.y1)/l[1]],[(b+p)/l[0],(i+d.y0)/l[1]]],{colors:[[m,m,m],[h,h,h],[h,h,h],[m,m,m]]}),b+=p}if(d.cap!==!1){let t=[d.cx,d.y1,d.cz],n=e=>[e[0]/u[0],-e[2]/u[1]],r=1.06*y;for(let i=0;i<o;i++){let a=(i+1)%o;e.tri(c,t,_[a],_[i],n(t),n(_[a]),n(_[i]),{normal:[0,1,0],color:[r,r,r]})}}if(d.under){let t=[d.cx,d.y0,d.cz],n=e=>[e[0]/u[0],e[2]/u[1]];for(let r=0;r<o;r++){let i=(r+1)%o;e.tri(c,t,g[r],g[i],n(t),n(g[r]),n(g[i]),{normal:[0,-1,0],color:[.55,.55,.55]})}}}}function A(e,t,n){let r=Array.from({length:t},()=>1+e.range(-n,n));return r.map((e,n)=>(r[(n+t-1)%t]+e*2+r[(n+1)%t])/4)}function j(e,t,n){let r=t.slice();for(let t=0;t<n;t++)r[e.int(0,r.length-1)]*=e.range(.62,.75);return r}function M(e,t,{thin:n=.45,unit:r=1}={}){let i=[0],a=0;for(;a<t-.01;){let o=e.chance(n)?.5*r:r;a=Math.min(t,a+o),t-a<.3&&(a=t),i.push(a)}return i}function N(e,t,n,r,i={}){let o=O.includes(i.kind)?i.kind:`spire`,s=i.stone===`ice`,c=s?I(e):w[a(w,i.stone)?i.stone:`sandstone`],l=D(i.height,6,1,24),d=D(i.width,2.5,.8,14),m=e.rng(`crag`,t,r,i.seed),h=()=>m.next(),g=e.builder(E(p(l*.25,.5,2.2),.66)),_=[];switch(o){case`mesa`:{let e=A(m,p(Math.round(8+d*.9),9,18),.16),t=m.range(.72,1),r=d/2,i=M(m,l,s?{thin:.35,unit:2}:{thin:.35}),a=[{y0:-.2,y1:Math.min(.5,l*.2),cx:0,cz:0,rx:r*1.12,rz:r*1.12*t,taper:.93}];for(let e=0;e<i.length-1;e++){if(i[e+1]<=a[0].y1)continue;let n=m.chance(.4),o=r*(n?1.02:m.range(.9,.97))*(1-.06*(i[e]/l));a.push({y0:Math.max(i[e],a[0].y1),y1:i[e+1],cx:0,cz:0,rx:o,rz:o*t,taper:n?1:.97})}if(l>3&&d>4&&m.chance(.45)){let e=r*m.range(.32,.45),n=m.range(-.25,.25)*r,i=m.range(-.25,.25)*r*t,o=p(l*m.range(.25,.4),1,4),s=l;for(let r of M(m,o))r>0&&(a.push({y0:s,y1:l+r,cx:n,cz:i,rx:e*(1-r/o*.1),rz:e*t*(1-r/o*.1),taper:.97}),s=l+r)}k(g,c,a,e,n,h);let o=r*t,u=r-o,f=u>.25?Math.max(2,Math.ceil(u/Math.max(.5,o*.8))+1):1;for(let e=0;e<f;e++)_.push([f===1?0:-u+2*u*e/(f-1),0,o*1.1]);let v=m.int(2,4);for(let e=0;e<v;e++){let e=m.range(0,Math.PI*2),n=m.range(.28,.5)*Math.min(1.6,d/4);C(g,Math.cos(e)*r*1.12,0,Math.sin(e)*r*1.12*t,[n,n*.7,n*.9],m,{top:c.top,side:c.side,detail:0,yaw:e})}break}case`arch`:P(g,c,d,l,n,m,_);break;case`boulders`:{let e=m.int(4,6),t=d/2;for(let n=0;n<e;n++){let r=n===0,i=n/e*Math.PI*2+m.range(-.4,.4),a=r?m.range(0,.15)*t:t*m.range(.45,.7),o=(r?.5:m.range(.24,.36))*d*.6,s=Math.min(r?l*.95:l*m.range(.35,.6),o*2.4),u=Math.cos(i)*a,f=Math.sin(i)*a;C(g,u,r?0:m.range(0,.15),f,[o,s/1.22,o*m.range(.8,1)],m,{top:c.top,side:c.side,detail:1,yaw:m.range(0,6.28),flatTop:m.range(.1,.3),rough:.25}),_.push([u,f,o*.92])}for(let e=0;e<4;e++){let e=m.range(0,Math.PI*2),n=m.range(.12,.22)*Math.min(2,d/2.5);C(g,Math.cos(e)*t*1.05,0,Math.sin(e)*t*1.05,[n,n*.7,n*.9],m,{top:c.top,side:c.side,detail:0})}break}case`hoodoo`:{let e=j(m,A(m,9,.2),1),t=p(l*.16,.5,1.6),r=l-t,i=M(m,r,{thin:.75}),a=[],o=d*.27,s=m.range(2.2,3.4),f=m.range(0,6.28),v=0,y=0;for(let e=0;e<i.length-1;e++){let t=i[e]/r,n=1+.16*Math.sin(t*Math.PI*s+f),c=1+.45*(1-t)**4,l=o*u(1.05,.62,t)*n*c;a.push({y0:e===0?-.2:i[e],y1:i[e+1],cx:v,cz:y,rx:l,rz:l*m.range(.88,1),taper:.95}),v+=m.range(-.05,.05)*o,y+=m.range(-.05,.05)*o}let b=d*m.range(.4,.5),x=A(m,9,.24),S=v+m.range(-.1,.1)*b,C=y+m.range(-.1,.1)*b;k(g,c,a,e,n,h),k(g,c,[{y0:r,y1:r+t*.55,cx:S,cz:C,rx:b,rz:b*m.range(.82,1),taper:1.02,under:!0,dark:.78},{y0:r+t*.55,y1:l,cx:S+m.range(-.08,.08),cz:C,rx:b*.92,rz:b*.8,taper:.8,dark:.82}],x,n,h),_.push([0,0,o*1.25]);break}case`pillar`:{let e=c.side===`basalt_cliff`,t=A(m,e?6:10,e?.04:.12),r=M(m,l,s?{thin:.4,unit:2}:{thin:.4}),i=d*.42,a=r.slice(0,-1).map((e,t)=>{let n=m.chance(.35),a=i*(n?1.04:m.range(.92,.98))*(1-e/l*.08);return{y0:e,y1:r[t+1],cx:0,cz:0,rx:a,rz:a,taper:n?1:.97}});a[0].y0=-.2,k(g,c,a,t,n,h),_.push([0,0,i*1]);break}default:{let e=j(m,A(m,s?p(Math.round(5+d*.5),6,8):p(Math.round(7+d),8,12),s?.3:.24),m.int(1,2)),t=M(m,l,s?{thin:.15,unit:2.4}:{thin:.55}),r=d/2,i=[m.range(-.05,.05),m.range(-.05,.05)],a=m.range(1.5,2.6),o=m.range(0,6.28),u=[],f=0,v=0,y=m.int(1,3);for(let e=0;e<t.length-1;e++){let n=t[e]/l,c=e===y;c&&(y+=m.int(2,4));let d=r*(1-(s?.8:.74)*n)**(s?1.1:.85)*(1+.1*Math.sin(n*Math.PI*a+o))*(c?s?1.04:1.1:m.range(.9,.97));u.push({y0:e===0?-.2:t[e],y1:t[e+1],cx:f,cz:v,rx:d,rz:d*m.range(.86,1),taper:c?.97:s?.84:.92}),f+=(i[0]+m.range(-.04,.04))*Math.min(1,t[e+1]-t[e])*r,v+=(i[1]+m.range(-.04,.04))*Math.min(1,t[e+1]-t[e])*r}let b=u[u.length-1],x=s?p(l*.22,.8,3.2):p(l*.1,.4,1.2);u.push({y0:l,y1:l+x,cx:b.cx+m.range(-.15,.15)*r,cz:b.cz+m.range(-.15,.15)*r,rx:b.rx*(s?.9:.62),rz:b.rz*(s?.8:.5),taper:s?.08:.5}),k(g,c,u,e,n,h);let S=m.range(0,6.28),w=b.rx*.3;C(g,b.cx+Math.cos(S)*b.rx*.6,l-.05,b.cz+Math.sin(S)*b.rx*.6,[w,w*.8,w*.9],m,{top:c.top,side:c.side,detail:0,sink:.1}),_.push([0,0,r*.95])}}s&&o!==`arch`&&L(g,c,m,d*.55,4);let v=e.finish(g,`crag:${o}`,t,n,r,Number.isFinite(i.rotation)?i.rotation:m.range(0,Math.PI*2)),y=_.map(([t,n,r])=>{let i=e.world(v,new f(t,0,n));return{type:`circle`,x:i.x,z:i.z,r}});return e.result(v,{colliders:y})}function P(e,t,n,r,i,a,o){let s=e.mat(t.side),c=e.mat(t.top),l=e.units(s),d=e.units(c),f=n/2,h=p(n*.19,.5,2.6),g=f-h,_=r*a.range(.32,.42),v=r*a.range(.66,.74),y=[];for(let e=0;e<=18;e++){let t=-f+e/18*n,i=Math.abs(t)/f,o=Math.abs(t)<g,s=o?_+(v-_)*Math.sqrt(Math.max(0,1-(t/g)**2)):0,c=r*(1-.1*i*i)+a.range(-.1,.1),l=o?0:m(g,f,Math.abs(t))**.5,d=(o?u(h*.95,h*1.35,Math.abs(t)/g):h*(1.4+.25*l))*a.range(.92,1.08),p=a.range(-.06,.06);y.push({x:t,bottom:s,top:c,zf:p+d/2,zb:p-d/2,ch:Math.min(.32,d*.22,(c-s)*.2)})}let b=e=>{let{zf:t,zb:n,top:r,bottom:i,ch:a}=e;return[[t,i+a],[t,r-a],[t-a,r],[n+a,r],[n,r-a],[n,i+a],[n+a,i],[t-a,i]]},x=[`f`,`c`,`t`,`c`,`k`,`c`,`u`,`c`],S=[.98,1.02,1.06,.96,.9,.72,.6,.72],w=e=>(i+e)/l[1];for(let t=0;t<18;t++){let n=y[t],r=y[t+1],i=b(n),o=b(r),u=.92+.12*a.next();for(let t=0;t<8;t++){let a=x[t];if(a===`u`&&n.bottom<.01&&r.bottom<.01)continue;let f=(t+1)%8,p=[n.x,i[t][1],i[t][0]],m=[[n.x,i[f][1],i[f][0]],p,[r.x,o[t][1],o[t][0]],[r.x,o[f][1],o[f][0]]],h=u*S[t],g=[h,h,h];if(a===`t`)e.quad(c,m,m.map(e=>[e[0]/d[0],-e[2]/d[1]]),{color:g});else if(a===`u`)e.quad(s,m,m.map(e=>[e[0]/l[0],e[2]/l[1]]),{color:g});else{let n=a===`k`||a===`c`&&t>=3&&t<=5?-1:1;e.quad(s,m,m.map(e=>[n*e[0]/l[0],w(e[1])]),{color:g})}}}for(let t of[-1,1]){let n=y[t<0?0:18],r=b(n),i=[n.x,(n.top+n.bottom)/2,(n.zf+n.zb)/2];for(let a=0;a<8;a++){let o=[n.x,r[a][1],r[a][0]],c=[n.x,r[(a+1)%8][1],r[(a+1)%8][0]],u=t<0?[i,o,c]:[i,c,o];e.tri(s,u[0],u[1],u[2],...u.map(e=>[e[2]/l[0],w(e[1])]),{normal:[t,0,0],color:[.94,.94,.94]})}}for(let n of[-1,1]){o.push([n*(f-h/2),0,h*.7]);for(let r=0;r<3;r++){let r=a.range(.16,.3)*Math.min(1.8,h*1.5);C(e,n*(f+a.range(-.3,.35)),0,a.range(-1,1)*h*.8,[r,r*.7,r*.9],a,{top:t.top,side:t.side,detail:0,yaw:a.range(0,6.28)})}}}var F=`#5fd8f0`;function I(e){return{top:e.textures.material(`ice_crag_top`,{vertexColors:!0}),side:e.textures.material(`ice_crag`,{vertexColors:!0,emissive:new t(F),emissiveIntensity:1})}}function L(e,t,n,i,a){let o=new f(0,1,0);for(let s=0;s<a;s++){let a=n.range(0,Math.PI*2),s=i*n.range(.85,1.15),c=n.range(.6,1.5),l=n.range(.1,.22),u=new f(Math.cos(a)*n.range(.2,.5),1,Math.sin(a)*n.range(.2,.5)).normalize();e.push([Math.cos(a)*s,-.1,Math.sin(a)*s],new r().setFromUnitVectors(o,u)),e.lathe(t.side,[{y:0,r:l},{y:c*.7,r:l*.85},{y:c,r:.01}],{segments:5,phase:n.range(0,3),smooth:!1}),e.pop()}}var R=(e=.4,t=.8)=>(n,r)=>t+(1-t)*m(-.05,e,r);function z(e,t,n,r,i={}){let a=p(Number.isFinite(i.size)?Number(i.size):1,.3,2.5),s=Number.isFinite(i.rotation)?Number(i.rotation):null;if(i.stone===`snow`){let c=e.rng(`rock:snow`,t,r,i.seed),l=e.builder(R()),u=e.textures.material(`snow_drift`,{vertexColors:!0}),d=1.25*a*c.range(.85,1.15),f=.38*a*c.range(.8,1.15),p=.9*a*c.range(.85,1.15);C(l,0,0,0,[d,f,p],c,{top:u,side:u,detail:2,rough:.1,flatTop:.25,sink:.35,tint:[.96,.97,1]}),C(l,d*.7,0,p*c.range(-.4,.4),[d*.55,f*.7,p*.6],c,{top:u,side:u,detail:1,rough:.1,flatTop:.2,sink:.35});let m=l.build(`rock:snow`,{castShadow:!1});e.track(m.geometries);let h=m.group;h.userData.dynamic=!0,h.rotation.y=s??c.range(0,Math.PI*2);let g=new o;g.name=`rock:snow`,g.position.set(t,n,r),g.add(h),g.updateMatrixWorld(!0);let _=-1;return e.result(g,{update:e=>{let n=T.at(t,r)>=.5?0:1;_<0?_=n:_!==n&&(_=n>_?Math.min(1,_+e/2):Math.max(0,_-e/2.5));let i=_*_*(3-2*_);h.visible=i>.002,h.scale.set(.8+.2*i,i,.8+.2*i)}})}let c=e.rng(`rock:ice`,t,r,i.seed),l=I(e),u=e.builder(R(.4*a,.7)),d=.72*a*c.range(.85,1.15),f=.66*a*c.range(.85,1.15),m=.62*a*c.range(.85,1.15);C(u,0,0,0,[d,f,m],c,{top:l.top,side:l.side,detail:+(a>.55),rough:.4,flatTop:i.flat?.3:.05}),a>=.8&&L(u,l,c,Math.max(d,m)*.9,2);let h=e.finish(u,`rock:ice`,t,n,r,s??c.range(0,Math.PI*2)),g=[{type:`circle`,x:t,z:r,r:Math.max(d,m)*.95}];return e.result(h,{colliders:g})}var B=new n(1,1).translate(0,.5,0),V=new n(1,1),H=`
uniform float uCameraYaw;
attribute vec3 iCenter;
attribute vec2 iSize;
attribute vec4 iParam;
varying vec2 vUv;
flat varying float vSeed;
flat varying float vIntensity;
flat varying float vSpeed;
flat varying vec2 vPx;
#include <common>
#include <fog_pars_vertex>
void main() {
  vUv = uv;
  vSeed = iParam.x;
  vIntensity = iParam.y;
  vSpeed = iParam.z;
  // the pixel grid of the quad (Flame.js createFlameMaterial: max(4, round(size * PPU)))
  vPx = max( vec2( 4.0 ), floor( iSize * ${16 .toFixed(1)} + 0.5 ) );
  vec3 wCenter = ( modelMatrix * vec4( iCenter, 1.0 ) ).xyz;
  vec3 right = vec3( cos( uCameraYaw ), 0.0, - sin( uCameraYaw ) );
  vec3 toCam = vec3( sin( uCameraYaw ), 0.0, cos( uCameraYaw ) );
  vec3 wPos = wCenter + right * position.x * iSize.x + vec3( 0.0, 1.0, 0.0 ) * position.y * iSize.y + toCam * iParam.w;
  vec4 mvPosition = viewMatrix * vec4( wPos, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`,U=`
uniform float uTime;
uniform vec3 uFire[ 6 ];
varying vec2 vUv;
flat varying float vSeed;
flat varying float vIntensity;
flat varying float vSpeed;
flat varying vec2 vPx;
#define uSeed vSeed
#define uIntensity vIntensity
#define uSpeed vSpeed
#define uPx vPx
${y}`,W=`
uniform float uCameraYaw;
attribute vec3 iCenter;
attribute vec2 iSize;
attribute vec4 iParam;
varying vec2 vUv;
flat varying float vSeed;
flat varying float vIntensity;
flat varying float vBaseV;
#include <common>
#include <fog_pars_vertex>
void main() {
  vUv = uv;
  vSeed = iParam.x;
  vIntensity = iParam.y;
  // iSize: (card size, flame height); the card is centred 0.4 of the flame up (Flame.js createFlame)
  float gs = max( iSize.x, 1e-3 );
  vBaseV = 0.5 - ( iSize.y * 0.4 ) / gs;
  vec3 wCenter = ( modelMatrix * vec4( iCenter + vec3( 0.0, iSize.y * 0.4, 0.0 ), 1.0 ) ).xyz;
  vec3 right = vec3( cos( uCameraYaw ), 0.0, - sin( uCameraYaw ) );
  vec3 toCam = vec3( sin( uCameraYaw ), 0.0, cos( uCameraYaw ) );
  vec3 wPos = wCenter + ( right * position.x + vec3( 0.0, 1.0, 0.0 ) * position.y ) * iSize.x - toCam * 0.05;
  vec4 mvPosition = viewMatrix * vec4( wPos, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`,G=`
uniform float uTime;
uniform float uNight;
uniform float uDay;
uniform vec3 uColor;
varying vec2 vUv;
flat varying float vSeed;
flat varying float vIntensity;
flat varying float vBaseV;
#define uSeed vSeed
#define uIntensity vIntensity
#define uBaseV vBaseV
${b}`,K=`
uniform float uTime;
uniform vec2 uWind;
uniform float uWindStrength;
attribute vec3 iCenter;
attribute vec2 iSize;
attribute vec4 iParam;
varying float vHeat;
flat varying float vTw;
#include <common>
#include <fog_pars_vertex>
float sh( float n ) { return fract( sin( n * 12.9898 + 4.1414 ) * 43758.5453 ); }
void main() {
  float seed = fract( iParam.x * 0.0137 ) * 97.0;
  // (time wrapped: the hash and the phase keep their precision in a long session)
  float t = fract( mod( uTime, 600.0 ) * iParam.y * ( 0.65 + 0.7 * sh( seed + 0.3 ) ) + sh( seed ) );
  float a = sh( seed + 1.7 ) * 6.2831853;
  float r = sqrt( sh( seed + 3.1 ) ) * iSize.x;
  vec3 p = iCenter + vec3( cos( a ) * r, 0.0, sin( a ) * r );
  float rise = iSize.y * ( 0.55 + 0.45 * sh( seed + 5.3 ) );
  p.y += rise * ( t + 0.4 * t * t );
  p.xz += uWind * uWindStrength * ( 0.35 * t * rise );
  p.x += sin( t * 9.0 + seed * 3.0 ) * 0.2 * t;
  p.z += cos( t * 7.0 + seed * 5.0 ) * 0.2 * t;
  float size = iParam.z * ( 1.0 - 0.5 * t ) * step( 1e-4, iSize.y );
  vec4 mvPosition = viewMatrix * ( modelMatrix * vec4( p, 1.0 ) );
  mvPosition.xy += position.xy * size;
  gl_Position = projectionMatrix * mvPosition;
  vHeat = 1.0 - t;
  vTw = sh( seed + 9.1 );
  #include <fog_vertex>
}
`,q=`
uniform float uTime;
uniform vec3 uFire[ 6 ];
varying float vHeat;
flat varying float vTw;
#include <common>
#include <fog_pars_fragment>
void main() {
  // cooling: white-gold, gold, orange, red; fading out at the end; a twinkle
  vec3 col = vHeat > 0.8 ? uFire[ 4 ] * 1.6 : vHeat > 0.5 ? uFire[ 3 ] * 1.9 : vHeat > 0.22 ? uFire[ 2 ] * 2.0 : uFire[ 1 ] * 2.0;
  float tw = 0.7 + 0.3 * step( 0.5, fract( uTime * 7.0 + vTw * 13.0 ) );
  float k = smoothstep( 0.0, 0.18, vHeat ) * tw;
  if ( k < 0.01 ) discard;
  gl_FragColor = vec4( col * k, 1.0 );
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #ifdef USE_FOG
    // additive: fade the contribution out with fog instead of tinting toward the fog colour
    #ifdef FOG_EXP2
      float fogF = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
    #else
      float fogF = smoothstep( fogNear, fogFar, vFogDepth );
    #endif
    gl_FragColor.rgb *= 1.0 - fogF;
  #endif
}
`,J={flame:{base:B,reach:.6,order:0},glow:{base:V,reach:.6,order:s.PARTICLES+5},spark:{base:V,reach:1.2,order:s.PARTICLES+4}};function Y(n){return{flame:n._cachedMaterial(`siege:flame`,()=>{let t=e.merge([v.fog,{uFire:{value:x()}}]);return t.uTime=S.uTime,t.uCameraYaw=S.uCameraYaw,t.uFogStart=S.uFogStart,new _({name:`luminati:flameBatch`,uniforms:t,vertexShader:H,fragmentShader:U,fog:!0,side:2})}),glow:n._cachedMaterial(`siege:glow`,()=>{let n=e.merge([v.fog,{uDay:{value:.25},uColor:{value:new t(16747066)}}]);return n.uTime=S.uTime,n.uCameraYaw=S.uCameraYaw,n.uNight=S.uNight,n.uFogStart=S.uFogStart,new _({name:`luminati:flameBatchGlow`,uniforms:n,vertexShader:W,fragmentShader:G,fog:!0,transparent:!0,depthWrite:!1,blending:2,side:2})}),spark:n._cachedMaterial(`siege:spark`,()=>{let t=e.merge([v.fog,{uFire:{value:x()}}]);return t.uTime=S.uTime,t.uWind=S.uWind,t.uWindStrength=S.uWindStrength,t.uFogStart=S.uFogStart,new _({name:`luminati:flameBatchSparks`,uniforms:t,vertexShader:K,fragmentShader:q,fog:!0,transparent:!0,depthWrite:!1,blending:2,side:2})})}}function X(e,t,n,r,a,o){let s=new h;s.setIndex(e.index.clone()),s.setAttribute(`position`,e.attributes.position.clone()),s.setAttribute(`uv`,e.attributes.uv.clone()),s.setAttribute(`iCenter`,new d(t,3)),s.setAttribute(`iSize`,new d(n,2)),s.setAttribute(`iParam`,new d(r,4)),s.instanceCount=a;let c=new l,u=new f;for(let e=0;e<a;e++){let r=Math.max(n[e*2],n[e*2+1])*o;u.fromArray(t,e*3),c.expandByPoint(u.set(u.x-r,u.y-.1,u.z-r)),u.fromArray(t,e*3),c.expandByPoint(u.set(u.x+r,u.y+r*2,u.z+r))}return s.boundingBox=c,s.boundingSphere=c.getBoundingSphere(new i),s}function Z(e,t,n,r,i,a,o){let s=J[e],c=new g(X(s.base,n,r,i,a,s.reach),t);return c.name=o,c.userData.flameBatch=e,c.renderOrder=s.order,c.castShadow=!1,c.receiveShadow=!1,c}var Q=class{constructor(){this.flames=[],this.sparks=[]}add(e){return this.flames.push(e),this}spark(e){return e.count>0&&this.sparks.push(e),this}get count(){return this.flames.length}build(e){let t=this.flames.filter(e=>(e.glow??0)>0),n=0;for(let e of this.sparks)n+=Math.round(e.count);if(!this.flames.length&&!n)return null;let r=Y(e),i=new o;i.name=`flames`;let a=[],s=e=>{i.add(e),a.push(e.geometry)};if(this.flames.length){let e=this.flames.length,t=new Float32Array(e*3),n=new Float32Array(e*2),i=new Float32Array(e*4);this.flames.forEach((e,r)=>{t.set([e.x,e.y,e.z],r*3),n.set([e.width,e.height],r*2),i.set([e.seed??0,e.intensity??1,e.speed??1,.02],r*4)}),s(Z(`flame`,r.flame,t,n,i,e,`flames:body`))}if(t.length){let e=t.length,n=new Float32Array(e*3),i=new Float32Array(e*2),a=new Float32Array(e*4);t.forEach((e,t)=>{n.set([e.x,e.y,e.z],t*3),i.set([Math.max(e.width,e.height)*(e.glow??0),e.height],t*2),a.set([e.seed??0,e.glowIntensity??.55,0,0],t*4)}),s(Z(`glow`,r.glow,n,i,a,e,`flames:glow`))}if(n){let e=new Float32Array(n*3),t=new Float32Array(n*2),i=new Float32Array(n*4),a=0;for(let n of this.sparks){let r=Math.max(.3,n.life??2.2);for(let o=0;o<Math.round(n.count);o++,a++)e.set([n.x,n.y,n.z],a*3),t.set([n.spread,n.height],a*2),i.set([(n.seed??0)*31.7+o*7.13,1/r,n.size??.08,0],a*4)}s(Z(`spark`,r.spark,e,t,i,n,`flames:sparks`))}return e.track(a),i}},$=new c,ee=new f;function te(e,t,{name:n=`flames:merged`}={}){let r=new Map;for(let e of t){let t=e?.object??e;if(!t?.isObject3D)continue;let n=null;t.traverse(e=>{let i=e;if(!i.isMesh||!i.userData.flameBatch)return;n||=(t.updateWorldMatrix(!0,!0),t.parent?new c().copy(t.parent.matrixWorld).invert():null);let a=i.material,o=r.get(a);o||r.set(a,o={kind:i.userData.flameBatch,src:[]}),o.src.push({mesh:i,owner:t,rel:n})})}if(!r.size)return null;let i=new o;i.name=n;let a=[],s=[],l=new Map,u=0,d=0;for(let[t,o]of r){let r=0;for(let e of o.src)r+=e.mesh.geometry.instanceCount;let c=new Float32Array(r*3),f=new Float32Array(r*2),p=new Float32Array(r*4),m=[],h=0;for(let t of o.src){let n=t.mesh.geometry,r=n.getAttribute(`iCenter`).array,i=n.getAttribute(`iSize`).array,a=n.getAttribute(`iParam`).array;$.copy(t.mesh.matrixWorld),t.rel&&$.premultiply(t.rel);for(let e=0;e<n.instanceCount;e++){ee.fromArray(r,e*3).applyMatrix4($).toArray(c,(h+e)*3),f[(h+e)*2]=i[e*2],f[(h+e)*2+1]=i[e*2+1];for(let t=0;t<4;t++)p[(h+e)*4+t]=a[e*4+t]}m.push({owner:t.owner,start:h,count:n.instanceCount}),h+=n.instanceCount,t.mesh.removeFromParent(),n.dispose(),e._geometries.delete(n)}let g=Z(o.kind,t,c,f,p,r,`${n}:${o.kind}`);g.matrixAutoUpdate=!1,delete g.userData.flameBatch,o.kind===`flame`?u+=r:o.kind===`spark`&&(d+=r);let _=g.geometry.getAttribute(`iSize`);for(let e of m){let t=l.get(e.owner);t||(t={owner:e.owner,visible:!0,ranges:[]},l.set(e.owner,t),s.push(t)),t.ranges.push({attr:_,start:e.start,count:e.count,sizes:f.slice(e.start*2,(e.start+e.count)*2)})}a.push(g),i.add(g)}let f=()=>{for(let e of s){let t=e.owner.visible;if(t!==e.visible){e.visible=t;for(let n of e.ranges){let e=n.attr.array;t?e.set(n.sizes,n.start*2):e.fill(0,n.start*2,(n.start+n.count)*2),n.attr.addUpdateRange(n.start*2,n.count*2),n.attr.needsUpdate=!0}}}};f();for(let e of a)e.onBeforeRender=f;return{object:i,meshes:a,count:u,sparks:d,dispose:()=>{for(let e of a)e.geometry.dispose();i.removeFromParent()}}}export{z as a,N as i,Y as n,te as r,Q as t};