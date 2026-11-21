import{Cr as e,Dr as t,Fr as n,Gi as r,Gr as i,Ja as a,Jn as o,Ka as s,Pi as c,Qn as l,Vn as u,Xr as d,Ya as f,_r as p,ao as m,bi as h,fi as g,io as _,lr as v,or as y,qa as b,ro as x,xi as S,za as C}from"./LevelStorage-JaoBFERB.js";import{_ as w}from"./Trees-BixY43Hv.js";import{t as T}from"./GlobalUniforms-BMXj3q_v.js";function E(e,t,n,r,i){let{width:a,R:o,colliders:s,maxDistance:c,maxDepth:l,maxFlow:u}=e,d=e.surf,f=e.flow,p=e.bed,m=r*i,h=new Float32Array(m).fill(NaN),g=new Float32Array(m),_=new Float32Array(m),v=new Float32Array(m),b=e.depth,x=(e,t)=>e<0||t<0||e>=a||t>=b?NaN:d[t*a+e],S=Math.floor(t/o),C=Math.floor(n/o),w=Math.floor((t+r-1)/o)-S+1,T=Math.floor((n+i-1)/o)-C+1,E=Array(Math.max(0,w*T)).fill(null);for(let e=0;e<s.length;e++){let t=s[e],n=t.type===`circle`,r=n?t.x-t.r:t.minX,i=n?t.x+t.r:t.maxX,a=n?t.z-t.r:t.minZ,o=n?t.z+t.r:t.maxZ;if(!(i>r&&o>a))continue;let c=Math.max(S,Math.floor(r)),l=Math.min(S+w-1,Math.floor(i)),u=Math.max(C,Math.floor(a)),d=Math.min(C+T-1,Math.floor(o));for(let e=u;e<=d;e++)for(let n=c;n<=l;n++){let r=x(n,e);if(r!==r)continue;let i=(e-C)*w+(n-S);(E[i]??=[]).push(t)}}for(let e=0;e<i;e++){let i=n+e,s=Math.floor(i/o),c=(i+.5)/o;for(let n=0;n<r;n++){let i=t+n,l=Math.floor(i/o),u=x(l,s);if(u!==u)continue;let d=(i+.5)/o,m=!1,y=E[(s-C)*w+(l-S)]??D;for(let e=0;e<y.length&&!m;e++){let t=y[e];m=t.type===`circle`?(d-t.x)**2+(c-t.z)**2<t.r*t.r:d>t.minX&&d<t.maxX&&c>t.minZ&&c<t.maxZ}if(m)continue;let b=e*r+n,T=s*a+l;h[b]=u,g[b]=Math.max(0,u-p[T]),_[b]=f[T*2],v[b]=f[T*2+1]}}let k=new Float32Array(m);for(let e=0;e<i;e++)for(let t=0;t<r;t++){let n=e*r+t,a=h[n];if(a!==a){k[n]=0;continue}let o=!1;if(t>0){let e=h[n-1];e===e&&Math.abs(e-a)>.01&&(o=!0)}if(t<r-1){let e=h[n+1];e===e&&Math.abs(e-a)>.01&&(o=!0)}if(e>0){let e=h[n-r];e===e&&Math.abs(e-a)>.01&&(o=!0)}if(e<i-1){let e=h[n+r];e===e&&Math.abs(e-a)>.01&&(o=!0)}k[n]=o?.5:1e9}let A=Math.SQRT2;for(let e=0;e<i;e++)for(let t=0;t<r;t++){let n=e*r+t,i=k[n];i!==0&&(t>0&&(i=Math.min(i,k[n-1]+1)),e>0&&(i=Math.min(i,k[n-r]+1),t>0&&(i=Math.min(i,k[n-r-1]+A)),t<r-1&&(i=Math.min(i,k[n-r+1]+A))),k[n]=i)}for(let e=i-1;e>=0;e--)for(let t=r-1;t>=0;t--){let n=e*r+t,a=k[n];a!==0&&(t<r-1&&(a=Math.min(a,k[n+1]+1)),e<i-1&&(a=Math.min(a,k[n+r]+1),t<r-1&&(a=Math.min(a,k[n+r+1]+A)),t>0&&(a=Math.min(a,k[n+r-1]+A))),k[n]=a)}for(let e=0;e<m;e++)k[e]=Math.min(k[e]/o,c);O(k,r,i,1,2,e=>h[e]===h[e]),O(g,r,i,Math.max(1,o>>1),2,null),O(_,r,i,Math.max(1,o>>1),2,null),O(v,r,i,Math.max(1,o>>1),2,null);let j=new Uint8Array(m*4),M=u;for(let e=0;e<m;e++)j[e*4]=Math.round(y(k[e]/c)*255),j[e*4+1]=Math.round(y(g[e]/l)*255),j[e*4+2]=Math.round(y(_[e]/M*.5+.5)*255),j[e*4+3]=Math.round(y(v[e]/M*.5+.5)*255);return j}var D=[];function O(e,t,n,r,i,a){let o=new Float32Array(e.length);for(let s=0;s<i;s++){for(let i=0;i<n;i++)for(let n=0;n<t;n++){let a=0,s=0;for(let o=-r;o<=r;o++){let r=n+o;r<0||r>=t||(a+=e[i*t+r],s++)}o[i*t+n]=a/s}for(let i=0;i<n;i++)for(let s=0;s<t;s++){let c=i*t+s;if(a&&!a(c))continue;let l=0,u=0;for(let e=-r;e<=r;e++){let r=i+e;r<0||r>=n||(l+=o[r*t+s],u++)}e[c]=l/u}}}var k=u.water.map(e=>o(e)),A=`
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

float lmHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float lmNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(lmHash(i), lmHash(i + vec2(1.0, 0.0)), u.x),
             mix(lmHash(i + vec2(0.0, 1.0)), lmHash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float lmBayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float lmBayer4(vec2 a) { return lmBayer2(0.5 * a) * 0.25 + lmBayer2(a); }
// keep water saturated under strongly coloured light (golden hour / purple dusk fill)
vec3 lmSaturate(vec3 c, float amount) {
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  return max(mix(vec3(l), c, amount), 0.0);
}
// partially neutralise a light colour: water scatters light and keeps more of its own hue
vec3 lmNeutral(vec3 irr, float amount) {
  return mix(irr, vec3(dot(irr, vec3(0.2126, 0.7152, 0.0722))), amount);
}


vec3 lmIrradiance(vec3 nW, vec3 posW, float shadow) {
  vec3 n = normalize((viewMatrix * vec4(nW, 0.0)).xyz);
  vec3 irr = ambientLightColor;
  #if NUM_HEMI_LIGHTS > 0
  for (int i = 0; i < NUM_HEMI_LIGHTS; i++) irr += getHemisphereLightIrradiance(hemisphereLights[i], n);
  #endif
  #if NUM_DIR_LIGHTS > 0
  for (int i = 0; i < NUM_DIR_LIGHTS; i++) irr += directionalLights[i].color * max(dot(n, directionalLights[i].direction), 0.0) * shadow;
  #endif
  #if NUM_POINT_LIGHTS > 0
  vec3 lmVp = (viewMatrix * vec4(posW, 1.0)).xyz;
  IncidentLight lmIl;
  for (int i = 0; i < NUM_POINT_LIGHTS; i++) {
    getPointLightInfo(pointLights[i], lmVp, lmIl);
    irr += lmIl.color * max(dot(n, lmIl.direction), 0.0);
  }
  #endif
  return irr * RECIPROCAL_PI;
}

`,j=`
attribute float aTop;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying float vTop;
#include <common>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
  #include <beginnormal_vertex>
  #include <defaultnormal_vertex>
  #include <begin_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
  vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * objectNormal);
  vTop = aTop;
}
`,M=`
uniform float uTime;
uniform float uNight;
uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform vec3 uFogColor;
uniform sampler2D uShore;
uniform vec4 uShoreRect;
uniform float uMaxDist;
uniform float uMaxDepth;
uniform float uMaxFlow;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uCrest;
uniform vec3 uFoam;
uniform float uOpacity;
uniform float uShallowOpacity;
uniform float uGlint;
uniform float uFoamAmount;
uniform float uBrightness;
uniform float uDeepAt;
uniform float uReflect;
uniform float uSaturation;
uniform float uNeutral;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying float vTop;
${A}

// short horizontal ripple dashes (anisotropic value noise, two octaves)
float lmRipple(vec2 p, float t) {
  vec2 q = vec2(p.x * 1.9, p.y * 5.2);
  float n = lmNoise(q + vec2(t * 0.22, t * 0.08));
  return n * 0.62 + 0.38 * lmNoise(q * 2.3 + vec2(-t * 0.31, t * 0.17) + 17.0);
}

// Two-phase flow map: the pattern is advected along the local flow and restarted every
// PERIOD seconds with a contrast-preserving cross-fade, so it never stretches.
float lmFlowRipple(vec2 p, vec2 flow, float t) {
  const float PERIOD = 3.2;
  float ph0 = fract(t / PERIOD);
  float ph1 = fract(t / PERIOD + 0.5);
  float w0 = 1.0 - abs(2.0 * ph0 - 1.0);
  float r0 = lmRipple(p - flow * (ph0 * PERIOD), t);
  float r1 = lmRipple(p - flow * (ph1 * PERIOD) + vec2(0.37, 0.61), t);
  float r = mix(r1, r0, w0);
  float norm = inversesqrt(w0 * w0 + (1.0 - w0) * (1.0 - w0));
  return clamp((r - 0.5) * norm + 0.5, 0.0, 1.0);
}

void main() {
  #include <logdepthbuf_fragment>
  float t = uTime;
  float shadow = getShadowMask();
  float night = clamp(uNight, 0.0, 1.0);
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 irrUp = lmNeutral(lmIrradiance(vec3(0.0, 1.0, 0.0), vWorldPos, shadow), uNeutral * (1.0 - night)) * uBrightness;
  vec3 sky = uFogColor;
  vec3 col;
  float alpha;

  if (vWorldNormal.y < 0.5) {
    // --- vertical cross-section of the water body (diorama cut / step down) ---
    vec2 axis = vec2(-vWorldNormal.z, vWorldNormal.x);
    float u = dot(vWorldPos.xz, axis);
    vec2 px = floor(vec2(u, vWorldPos.y) * 16.0);
    float below = max(0.0, vTop - (px.y + 0.5) / 16.0);
    float band = 1.6 + clamp(below / 0.3, 0.0, 1.0) * 1.9 + (lmNoise(vec2(px.x * 0.22, px.y * 0.3 + t * 0.4)) - 0.5) * 0.5;
    float q = clamp(floor(band + (lmBayer4(px) - 0.5) * 0.5), 1.0, 3.0);
    vec3 albedo = q < 1.5 ? uC1 : q < 2.5 ? uC2 : uC3;
    float wob = lmNoise(vec2(px.x * 0.35 + t * 0.6, 3.0));
    float rim = step(below, 1.1 / 16.0 + wob * 0.06);
    albedo = mix(albedo, uC1, 0.4 * step(0.78, lmNoise(vec2(px.x * 0.16 - t * 0.25, 1.3))) * (1.0 - rim));
    albedo = mix(albedo, uCrest, rim);
    vec3 irrSide = lmNeutral(lmIrradiance(normalize(vWorldNormal + vec3(0.0, 0.6, 0.0)), vWorldPos, shadow), uNeutral * (1.0 - night)) * uBrightness;
    col = albedo * mix(irrSide, irrUp, rim);
    col = mix(col, sky, 0.04);
    alpha = mix(0.95, 1.0, rim);
  } else {
    // --- surface ---
    vec2 px = floor(vWorldPos.xz * 16.0);
    vec2 pc = (px + 0.5) / 16.0;
    vec4 sh = texture2D(uShore, (pc - uShoreRect.xy) * uShoreRect.zw);
    float dist = sh.r * uMaxDist;
    float depth = min(sh.g * uMaxDepth, dist * 1.3 + 0.03);
    vec2 flow = (sh.ba * 2.0 - 1.0) * uMaxFlow;

    // depth bands: shallow teal rim → deep blue, with large slowly drifting darker patches;
    // ordered dithering only near band edges
    float dN = clamp(depth / uDeepAt, 0.0, 1.0);
    float patchN = lmNoise(pc * 0.42 + vec2(t * 0.03, -t * 0.021)) * 0.75 + lmNoise(pc * 1.3 - t * 0.05) * 0.25;
    float band = dN * 2.3 + smoothstep(0.5, 0.6, patchN) * 0.95 * dN;
    float q = clamp(floor(band + (lmBayer4(px) - 0.5) * 0.5), 0.0, 3.0);
    vec3 albedo = q < 0.5 ? uC0 : q < 1.5 ? uC1 : q < 2.5 ? uC2 : uC3;

    // pixel ripple dashes drifting with the flow
    float rp = lmFlowRipple(pc, flow, t);
    float hi = step(0.69, rp);
    float hi2 = step(0.8, rp);
    float lo = 1.0 - step(0.2, rp);
    albedo = mix(albedo, uC0, hi * (1.0 - hi2) * 0.7);
    albedo = mix(albedo, uCrest, hi2);
    albedo *= 1.0 - lo * 0.18;
    col = albedo * irrUp;

    // sky reflection (fresnel-ish, a touch stronger on crests). Stylised: weaker where the sun
    // is shadowed, so shaded water keeps its deep body colour instead of turning into a flat
    // lavender/grey veil of the (unlit, bright) horizon colour at golden hour / dusk.
    float fres = uReflect * (0.35 + 1.2 * pow(1.0 - clamp(V.y, 0.0, 1.0), 3.0)) * mix(0.4, 1.0, shadow);
    col = mix(col, sky, clamp(fres + hi * 0.06 * mix(0.4, 1.0, shadow), 0.0, 0.6));

    // foam: broken contact rim + lines rolling toward the shore
    float fn = lmNoise(pc * 2.1 + vec2(t * 0.13, -t * 0.09));
    float contact = step(dist, (0.05 + 0.07 * fn) * uFoamAmount);
    float phase = dist * 2.3 + t * 0.3 + fn * 0.35;
    float lineMask = step(0.42, lmNoise(pc * 1.25 + vec2(-t * 0.05, t * 0.04) + 9.0));
    float lines = step(0.86, fract(phase)) * (1.0 - smoothstep(0.12, 0.75 * uFoamAmount, dist)) * lineMask;
    float foam = max(contact, lines * 0.85);
    col = mix(col, uFoam * irrUp, foam);

    // sun / moon glints: 4-point pixel stars in 4x4 px cells, HDR so they bloom
    vec3 L = normalize(uSunDirection);
    vec3 N = normalize(vec3((rp - 0.5) * 0.35, 1.0, (fn - 0.5) * 0.35));
    float spec = pow(max(dot(reflect(-L, N), V), 0.0), 10.0);
    vec2 cell = floor(px / 4.0);
    float ch = lmHash(cell * 1.37 + 3.1);
    float tt = t * (1.8 + ch * 1.6) + ch * 11.0;
    float slot = mod(floor(tt), 4096.0); // wrapped: hash inputs stay small after hours of uptime
    float life = fract(tt);
    float hs = lmHash(cell + slot * vec2(7.13, 3.71));
    vec2 gpos = 1.0 + floor(vec2(lmHash(cell + slot + 0.5), lmHash(cell - slot + 1.7)) * 2.0);
    vec2 lp = abs(px - cell * 4.0 - gpos);
    float manh = lp.x + lp.y;
    float centre = step(manh, 0.5);
    float arms = step(manh, 1.5) * (1.0 - centre) * step(0.28, life) * step(life, 0.72);
    float density = (0.045 + 0.35 * spec) * uGlint * (0.3 + 0.7 * hi);
    float glint = step(1.0 - density, hs) * (centre + arms * 0.5) * (1.0 - foam) * shadow * step(0.02, L.y);
    vec3 gcol = uSunColor * 3.0 * mix(1.0, 1.7, night) + mix(vec3(0.25, 0.22, 0.15), vec3(0.04, 0.07, 0.16), night);
    col += glint * gcol;

    alpha = mix(uShallowOpacity, uOpacity, smoothstep(0.02, 0.35, depth));
    alpha = max(alpha, max(foam, min(1.0, glint)));
  }

  col = lmSaturate(col, mix(uSaturation, 1.0, night));
  gl_FragColor = vec4(col, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`,N=class{constructor(e,t={}){let{level:n,flow:r=[0,.3],resolution:i=8,opacity:o=.9,shallowOpacity:s=.58,glint:c=1,foam:l=1,maxDistance:u=2,maxDepth:d=1.5,brightness:f=1.15,deepAt:h=.34,reflect:g=.1,saturation:_=1.12,neutral:v=.35,deferShore:y=!1}=t;this.tileMap=e,this.level=n??e.waterLevel,this._levelOverride=n,this.flow=new x(r[0]??0,r[1]??0),this.resolution=Math.max(2,i|0),this.maxDistance=u,this.maxDepth=d;let b=e.width,E=e.depth;this._surf=new Float32Array(b*E).fill(NaN),this._flow=new Float32Array(b*E*2),this._bed=new Float64Array(b*E),this.tiles=[],this._readTiles();let D=this.maxFlow;this.uniforms=a.merge([w.lights,w.fog,{uShore:{value:null},uShoreRect:{value:new m(0,0,1/Math.max(1,b),1/Math.max(1,E))},uMaxDist:{value:u},uMaxDepth:{value:d},uMaxFlow:{value:D},uC0:{value:k[4].clone()},uC1:{value:k[3].clone()},uC2:{value:k[2].clone()},uC3:{value:k[1].clone()},uCrest:{value:k[5].clone()},uFoam:{value:k[6].clone().multiplyScalar(1.05)},uOpacity:{value:o},uShallowOpacity:{value:s},uGlint:{value:c},uFoamAmount:{value:l},uBrightness:{value:f},uDeepAt:{value:h},uReflect:{value:g},uSaturation:{value:_},uNeutral:{value:v}}]),this.uniforms.uTime=T.uTime,this.uniforms.uNight=T.uNight,this.uniforms.uSunDirection=T.uSunDirection,this.uniforms.uSunColor=T.uSunColor,this.uniforms.uFogColor=T.uFogColor,this.uniforms.uFogStart=T.uFogStart,this.material=new C({name:`Luminati:Water`,uniforms:this.uniforms,vertexShader:j,fragmentShader:M,fog:!0,lights:!0,transparent:!0,depthWrite:!0}),this.geometry=this._buildGeometry(),this.object=new S(this.geometry,this.material),this.object.name=`Water`,this.object.renderOrder=p.WATER,this.object.receiveShadow=!0,this.object.castShadow=!1,this.object.matrixAutoUpdate=!1,this.object.visible=this.tiles.length>0,this.shoreTexture=null,this._colliderCount=e.colliders.length,this._colliderSig=``,this._worker=void 0,this._shoreJobs=new Map,this._shoreJobId=0,this._shoreGen=0,y||this.refresh()}_readTiles(){let e=this.tileMap,t=e.width,n=this._levelOverride;this._surf.fill(NaN),this._flow.fill(0),this._bed.fill(0),this.tiles=[],e.forEachTile((e,r,i)=>{if(!i.water)return;let a=r*t+e;this._surf[a]=n!=null&&i.waterSource===`global`?n:i.waterSurface,this._bed[a]=i.h;let o=i.type.flow,s=this.flow.x,c=this.flow.y;Array.isArray(o)?(s=o[0]??0,c=o[1]??0):typeof o==`number`&&(s*=o,c*=o),this._flow[a*2]=s,this._flow[a*2+1]=c,this.tiles.push(i)});let r=.05;for(let e=0;e<this._flow.length;e++)r=Math.max(r,Math.abs(this._flow[e]));this.maxFlow=r}refresh(){this._shoreGen++;let e=this._buildShoreTexture();this.shoreTexture?.dispose(),this.shoreTexture=e,this.uniforms.uShore.value=e,this._colliderCount=this.tileMap.colliders.length,this._colliderSig=this._waterColliderSignature()}refreshAsync(){if(typeof Worker!=`function`)return this.refresh(),Promise.resolve();let e=this.tileMap,t=this.resolution,i=Math.max(1,e.width*t),a=Math.max(1,e.depth*t),o=this.shoreInput(!0),s=e.colliders.length,c=this._waterColliderSignature();return new Promise(l=>{let u=this._newShoreWorker();this._bake?.end();let d=()=>{u?.terminate(),this._bake?.worker===u&&(this._bake=null),l()};this._bake={worker:u,end:d};let p=()=>{if(this._disposed){d();return}u?.terminate(),this.refresh(),d()};if(!u){p();return}u.onmessage=o=>{if(this._disposed){d();return}let{out:m,error:h}=o.data??{};if(h||!m||m.length!==i*a*4||i!==e.width*t||a!==e.depth*t){p();return}u.terminate(),this._bake?.worker===u&&(this._bake=null),this._shoreData=m;let g=new n(m,i,a,r,f);this._setupShoreTexture(g),this.shoreTexture?.dispose(),this.shoreTexture=g,this.uniforms.uShore.value=g,this._colliderCount=s,this._colliderSig=c,l()},u.onerror=e=>{e.preventDefault?.(),p()},u.postMessage({id:1,input:o,a0:0,b0:0,W:i,H:a})})}get shoreReach(){return Math.ceil(this.maxDistance)+1}updateTiles(){let e=this.tileMap;if(this._surf.length!==e.width*e.depth)throw Error(`Water.updateTiles: the TileMap size changed`);let t=this.maxFlow;this._readTiles(),this.uniforms.uMaxFlow.value=this.maxFlow;let n=this._buildGeometry(),r=this.geometry;return this.geometry=n,this.object.geometry=n,r.dispose(),this.object.visible=this.tiles.length>0,{flowChanged:t!==this.maxFlow,hasWater:this.tiles.length>0}}rebakeShore(e,{expand:t=!0}={}){if(!this._shoreData||!this.shoreTexture){this.refresh();return}this._updateShoreWindow(e,t),this._colliderCount=this.tileMap.colliders.length,this._colliderSig=this._waterColliderSignature()}rebakeShoreAsync(e,{expand:t=!0}={}){if(!this._shoreData||!this.shoreTexture)return this.refresh(),Promise.resolve();let n=this.shoreJob(e,{expand:t});if(!n)return Promise.resolve();let r=this._shoreWorker();if(!r)return this.rebakeShore(e,{expand:t}),Promise.resolve();this._colliderCount=this.tileMap.colliders.length,this._colliderSig=this._waterColliderSignature();let i=++this._shoreJobId;return new Promise(a=>{this._shoreJobs.set(i,{job:n,rect:e,expand:t,gen:this._shoreGen,resolve:a}),r.postMessage({id:i,input:this.shoreInput(!0),a0:n.a0,b0:n.b0,W:n.W,H:n.H})})}_shoreWorker(){return this._worker===void 0?(this._worker=this._newShoreWorker(),this._worker?(this._worker.onmessage=e=>{let{id:t,out:n,error:r}=e.data??{},i=this._shoreJobs.get(t);i&&(this._shoreJobs.delete(t),i.gen===this._shoreGen&&this.shoreTexture&&(r||!n||!this.applyShore(i.job,n))&&this.rebakeShore(i.rect,{expand:i.expand}),i.resolve())},this._worker.onerror=e=>{e.preventDefault?.(),this._worker?.terminate(),this._worker=null;let t=[...this._shoreJobs.values()];this._shoreJobs.clear();for(let e of t)e.gen===this._shoreGen&&this.shoreTexture&&this.rebakeShore(e.rect,{expand:e.expand}),e.resolve()},this._worker):null):this._worker}_newShoreWorker(){if(typeof Worker!=`function`)return null;try{return new Worker(new URL(new URL(`shoreWorker-CWjE-yRZ.js`,import.meta.url).href,``+import.meta.url),{type:`module`})}catch{return null}}rebuild(e=null){let{flowChanged:t,hasWater:n}=this.updateTiles();return!e||t||!this.shoreTexture||!this._shoreData?this.refresh():this.rebakeShore(e),n}_updateShoreWindow(e,t=!0){let n=this.shoreJob(e,{expand:t});n&&this.applyShore(n,E(this.shoreInput(),n.a0,n.b0,n.W,n.H))}shoreInput(e=!1){let t=this.tileMap,n=t=>e?t.slice():t,r=t.colliders.filter(e=>!e.dynamic);return{width:t.width,depth:t.depth,R:this.resolution,surf:n(this._surf),flow:n(this._flow),bed:n(this._bed),colliders:e?r.map(e=>({...e})):r,maxDistance:this.maxDistance,maxDepth:this.maxDepth,maxFlow:this.maxFlow}}shoreJob(e,{expand:t=!0}={}){let n=this.tileMap,r=this.resolution,i=n.width*r,a=n.depth*r,o=this.shoreReach,s=t?o:0,c=e=>Math.max(0,Math.min(i,e)),l=e=>Math.max(0,Math.min(a,e)),u=c((Math.floor(e.minI)-s)*r),d=c((Math.floor(e.maxI)+1+s)*r),f=l((Math.floor(e.minJ)-s)*r),p=l((Math.floor(e.maxJ)+1+s)*r);if(d<=u||p<=f)return;let m=c(u-o*r),h=c(d+o*r),g=l(f-o*r),_=l(p+o*r);return{a0:m,b0:g,W:h-m,H:_-g,oa0:u,oa1:d,ob0:f,ob1:p,TW:i,TH:a}}applyShore(e,t){let n=this._shoreData;if(!n||!this.shoreTexture||e.TW!==this.tileMap.width*this.resolution||n.length!==e.TW*e.TH*4)return!1;for(let r=e.ob0;r<e.ob1;r++){let i=((r-e.b0)*e.W+(e.oa0-e.a0))*4;n.set(t.subarray(i,i+(e.oa1-e.oa0)*4),(r*e.TW+e.oa0)*4)}return this.shoreTexture.needsUpdate=!0,this._colliderCount=this.tileMap.colliders.length,this._colliderSig=this._waterColliderSignature(),!0}update(e){this.tileMap.colliders.length!==this._colliderCount&&(this._colliderCount=this.tileMap.colliders.length,this._waterColliderSignature()!==this._colliderSig&&this.refresh())}_waterColliderSignature(){if(!this.tiles.length)return``;let e=[];for(let t of this.tileMap.colliders){if(t.dynamic)continue;let n=t.type===`circle`,r=n?t.x-t.r:t.minX,i=n?t.x+t.r:t.maxX,a=n?t.z-t.r:t.minZ,o=n?t.z+t.r:t.maxZ;if(!(i>r&&o>a))continue;let s=!1,c=Math.min(this.tileMap.width-1,Math.floor(i)),l=Math.min(this.tileMap.depth-1,Math.floor(o));for(let e=Math.max(0,Math.floor(a));e<=l&&!s;e++)for(let t=Math.max(0,Math.floor(r));t<=c&&!s;t++)s=this._surfAt(t,e)===this._surfAt(t,e);s&&e.push(`${Math.round(r*64)},${Math.round(i*64)},${Math.round(a*64)},${Math.round(o*64)},${t.type}`)}return e.join(`;`)}_surfAt(e,t){let n=this.tileMap;return e<0||t<0||e>=n.width||t>=n.depth?NaN:this._surf[t*n.width+e]}_buildGeometry(){let t=this.tileMap,n=[],r=[],a=[],o=[],c=0,l=(e,t,i,s,l)=>{for(let o=0;o<4;o++)n.push(e[o*3],e[o*3+1],e[o*3+2]),r.push(t,i,s),a.push(l);o.push(c,c+1,c+2,c,c+2,c+3),c+=4},u=[{dx:0,dz:-1,nx:0,nz:-1},{dx:1,dz:0,nx:1,nz:0},{dx:0,dz:1,nx:0,nz:1},{dx:-1,dz:0,nx:-1,nz:0}];for(let e of this.tiles){let{i:n,j:r}=e,i=this._surfAt(n,r);l([n,i,r,n,i,r+1,n+1,i,r+1,n+1,i,r],0,1,0,i);for(let a of u){let o=t.tileAt(n+a.dx,r+a.dz),s;if(!o)s=e.h;else if(o.water){let t=this._surfAt(n+a.dx,r+a.dz);if(!(t<i-.01))continue;s=Math.max(t,e.h)}else{if(o.h>=i-.01)continue;s=Math.max(o.h,e.h)}if(i-s<.01)continue;let c=a.nz,u=-a.nx,d=n+.5+a.nx*.5,f=r+.5+a.nz*.5,p=d-c*.5,m=f-u*.5,h=d+c*.5,g=f+u*.5;l([p,s,m,h,s,g,h,i,g,p,i,m],a.nx,0,a.nz,i)}}let d=new e;return d.setAttribute(`position`,new i(n,3)),d.setAttribute(`normal`,new i(r,3)),d.setAttribute(`aTop`,new i(a,1)),d.setIndex(c>65535?new b(o,1):new s(o,1)),d.computeBoundingBox(),d.computeBoundingSphere(),d}_buildShoreTexture(){let e=this.tileMap,t=this.resolution,i=Math.max(1,e.width*t),a=Math.max(1,e.depth*t),o=this._bakeShore(0,0,i,a);this._shoreData=o;let s=new n(o,i,a,r,f);return this._setupShoreTexture(s)}_setupShoreTexture(e){return e.name=`Luminati:WaterShore`,e.magFilter=g,e.minFilter=g,e.wrapS=e.wrapT=t,e.colorSpace=``,e.generateMipmaps=!1,e.needsUpdate=!0,e}_bakeShore(e,t,n,r){return E(this.shoreInput(),e,t,n,r)}dispose(){this._disposed=!0,this._bake?.end(),this._worker?.terminate(),this._worker=null;for(let e of this._shoreJobs.values())e.resolve();this._shoreJobs.clear(),this.geometry.dispose(),this.material.dispose(),this.shoreTexture?.dispose(),this.shoreTexture=null,this.object.removeFromParent()}},P=`
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
#include <common>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
  vUv = uv;
  #include <beginnormal_vertex>
  #include <defaultnormal_vertex>
  #include <begin_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
  vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * objectNormal);
}
`,F=`
uniform float uTime;
uniform float uNight;
uniform vec3 uSunColor;
uniform vec3 uFogColor;
uniform float uWidth;
uniform float uLength;
uniform float uLipLength;
uniform float uSeed;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uFoam;
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
${A}
void main() {
  #include <logdepthbuf_fragment>
  float t = uTime;
  float colX = floor(vUv.x * uWidth * 16.0);
  float nCols = floor(uWidth * 16.0 + 0.5);
  float py = floor(vUv.y * 16.0);            // pixel row along the sheet (arc length)
  float fall = max(0.0, vUv.y - uLipLength);  // distance fallen past the lip
  float h1 = lmHash(vec2(colX, uSeed));
  float h2 = lmHash(vec2(floor(colX / 3.0), uSeed + 5.0));
  // water accelerates: streaks scroll faster further down
  float speed = (2.2 + h1 * 1.4) * (0.5 + 0.5 * clamp(fall / 1.0, 0.0, 1.0));
  float s1 = fract(py / 16.0 * (0.55 + 0.35 * h2) - t * speed * 0.5 + h1 * 7.0);
  float s2 = fract(py / 16.0 * 0.3 - t * speed * 0.33 + h2 * 3.0);
  vec3 albedo = mix(uC1, uC0, 0.2 + 0.6 * h2);
  albedo = mix(albedo, uC2, step(0.7, s2) * 0.85);
  albedo = mix(albedo, uC3, step(s1, 0.16));
  albedo = mix(albedo, uFoam, step(0.91, s1));
  // foam where the water bends over the lip and churning at the bottom
  // discrete animation slots are wrapped so hash inputs stay precise after hours of uptime
  float lipFoam = 1.0 - step(0.1 + 0.16 * lmHash(vec2(colX, mod(floor(t * 6.0), 4096.0))), abs(vUv.y - uLipLength));
  float bn = lmNoise(vec2(colX * 0.45, py * 0.4 - t * 5.0));
  float botFoam = step(uLength - vUv.y, 0.2 + 0.42 * bn);
  float foam = max(lipFoam * 0.85, botFoam);
  albedo = mix(albedo, uFoam, foam);
  // lighting (the normal leans up: falling water scatters sky light)
  float shadow = getShadowMask();
  vec3 nW = normalize((gl_FrontFacing ? vWorldNormal : -vWorldNormal) + vec3(0.0, 1.1, 0.0));
  float nightF = clamp(uNight, 0.0, 1.0);
  vec3 col = albedo * lmNeutral(lmIrradiance(nW, vWorldPos, shadow), 0.5 * (1.0 - nightF)) * 1.12;
  col = lmSaturate(mix(col, uFogColor, 0.06), mix(1.12, 1.0, nightF));
  // sparkling droplets (HDR, bloom) in the white water
  float sp = step(0.988, lmHash(vec2(colX, py) + mod(floor(t * 9.0), 4096.0) * vec2(3.1, 7.7)));
  col += sp * (uSunColor * 2.2 + vec3(0.1)) * shadow * (1.0 - 0.8 * clamp(uNight, 0.0, 1.0)) * step(0.5, foam + step(0.9, s1));
  // ragged, splashing side edges and a soft entry from the river surface
  float edgePx = min(colX, nCols - 1.0 - colX);
  float jag = lmHash(vec2(py + mod(floor(t * 10.0), 4096.0) * 3.0, colX + uSeed));
  if (edgePx < 1.0 && jag < 0.55) discard;
  if (edgePx < 2.0 && jag < 0.18) discard;
  float entry = smoothstep(0.0, 0.18, vUv.y);
  if (entry < lmBayer4(vec2(colX, py)) * 0.999) discard;
  gl_FragColor = vec4(col, mix(0.9, 1.0, foam));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`,I=`
uniform float uTime;
uniform float uNight;
uniform vec3 uFogColor;
uniform vec3 uFoam;
uniform vec3 uC0;
uniform vec2 uSize;
uniform float uSeed;
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
${A}
void main() {
  #include <logdepthbuf_fragment>
  float t = uTime;
  vec2 px = floor(vUv * uSize * 16.0);
  vec2 pc = (px + 0.5) / 16.0;
  // distance from the impact line (v = 0 edge, centred across u)
  float across = abs(pc.x - uSize.x * 0.5) / (uSize.x * 0.5);
  float d = pc.y + max(0.0, across - 0.55) * 1.4;
  float churn = lmNoise(pc * 3.2 + vec2(t * 0.7, -t * 2.1) + uSeed);
  float bub = lmNoise(pc * 6.5 - vec2(0.0, t * 1.4) + uSeed * 2.0);
  float ring = step(0.8, fract(d * 2.2 - t * 0.9 + churn * 0.4)) * step(0.45, bub);
  float core = step(d, 0.36 + churn * 0.45);
  float speck = step(0.8, bub) * step(d, 0.95);
  float foam = max(core, max(ring * step(d, 1.05), speck * 0.8));
  foam *= step(across, 1.0 - churn * 0.12);
  if (foam < 0.5) discard;
  vec3 albedo = mix(uC0, uFoam, 0.72 + 0.28 * step(0.6, churn));
  float shadow = getShadowMask();
  float nightF = clamp(uNight, 0.0, 1.0);
  vec3 col = albedo * lmNeutral(lmIrradiance(vec3(0.0, 1.0, 0.0), vWorldPos, shadow), 0.45 * (1.0 - nightF)) * 1.1;
  col = mix(col, uFogColor, 0.05);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`,ee=0,L=Object.freeze({N:Object.freeze([0,-1]),S:Object.freeze([0,1]),E:Object.freeze([1,0]),W:Object.freeze([-1,0])});function R(e){return l(L,e)??L.S}function z({x:t,z:n,width:r=2,top:o,bottom:s,facing:l=`S`,seed:u,pool:f=!0,lip:m=.3}={}){let g=R(l),y=g[0],b=g[1],E=b,D=-y,O=Math.max(.05,o-s),A=u??v(Math.round(t*16),Math.round(n*16),77)*1e3+ ++ee,j=[];j.push([-m,o+.012]),j.push([-m*.35,o+.012]),j.push([0,o+.004]);for(let e=1;e<=14;e++){let t=e/14,n=O*t*t;j.push([.04+.26*Math.sqrt(n)+.05*t,o-n])}let M=[0];for(let e=1;e<j.length;e++)M.push(M[e-1]+Math.hypot(j[e][0]-j[e-1][0],j[e][1]-j[e-1][1]));let N=M[M.length-1],L=M[2],z=Math.max(2,Math.ceil(r*4)),B=[],V=[],H=[];for(let e=0;e<=z;e++){let i=e/z,a=(i-.5)*r;for(let e=0;e<j.length;e++){let[r,o]=j[e];B.push(t+E*a+y*r,o,n+D*a+b*r),V.push(i,M[e])}}let U=j.length;for(let e=0;e<z;e++)for(let t=0;t<U-1;t++){let n=e*U+t,r=(e+1)*U+t;H.push(n,n+1,r+1,n,r+1,r)}let W=new e;W.setAttribute(`position`,new i(B,3)),W.setAttribute(`uv`,new i(V,2)),W.setIndex(H),W.computeVertexNormals(),W.computeBoundingSphere();let G=e=>{let t=a.merge([w.lights,w.fog,e]);return t.uTime=T.uTime,t.uNight=T.uNight,t.uSunColor=T.uSunColor,t.uFogColor=T.uFogColor,t.uFogStart=T.uFogStart,t},K=new C({name:`Luminati:Waterfall`,uniforms:G({uWidth:{value:r},uLength:{value:N},uLipLength:{value:L},uSeed:{value:A%97},uC0:{value:k[4].clone()},uC1:{value:k[3].clone()},uC2:{value:k[2].clone()},uC3:{value:k[5].clone()},uFoam:{value:k[6].clone().multiplyScalar(1.08)}}),vertexShader:P,fragmentShader:F,fog:!0,lights:!0,transparent:!0,depthWrite:!0,side:2}),q=new S(W,K);q.name=`WaterfallSheet`,q.renderOrder=p.WATER+1,q.receiveShadow=!0;let J=new d;J.name=`Waterfall`,J.add(q);let Y=null,X=null,Z=null,Q=j[j.length-1][0];if(f){let e=r+1.1,i=1.25;X=new c(e,i),X.rotateX(-Math.PI/2);let a=new h().makeBasis(new _(E,0,D),new _(0,1,0),new _(-y,0,-b));X.applyMatrix4(a),X.translate(t+y*(Q-.2+i/2),s+.012,n+b*(Q-.2+i/2)),Z=new C({name:`Luminati:WaterfallPool`,uniforms:G({uFoam:{value:k[6].clone().multiplyScalar(1.05)},uC0:{value:k[5].clone()},uSize:{value:new x(e,i)},uSeed:{value:A%53}}),vertexShader:P,fragmentShader:I,fog:!0,lights:!0,transparent:!1,depthWrite:!0,side:2,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-4}),Y=new S(X,Z),Y.name=`WaterfallPool`,Y.renderOrder=p.WATER+2,Y.receiveShadow=!0,J.add(Y)}let $=y!==0,te=[{preset:`mist`,position:new _(t+y*(Q+.3),s+.25,n+b*(Q+.3)),spawnSize:$?[.4,.3,r]:[r,.3,.4],velocity:[y*.45,.35,b*.45],velocityVariance:$?[.35,.3,.45]:[.45,.3,.35],width:r}];return{object:J,sheet:q,pool:Y,emitters:te,update(e){},dispose(){W.dispose(),K.dispose(),X?.dispose(),Z?.dispose(),J.removeFromParent()}}}export{z as n,R as r,N as t};