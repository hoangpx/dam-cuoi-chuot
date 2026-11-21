import{Gn as e,Hn as t,Ja as n,Or as r,Pi as i,Qn as a,Ti as o,Ua as s,Un as c,Vn as l,Vr as u,Wn as d,Xr as f,Zn as p,_r as m,ar as h,cr as g,ei as _,fi as v,io as y,ir as b,lr as x,nr as S,or as C,pr as ee,qn as w,ro as T,ti as E,ur as te,xi as D,za as O}from"./LevelStorage-JaoBFERB.js";import{_ as k}from"./Trees-BixY43Hv.js";import{t as A}from"./GlobalUniforms-BMXj3q_v.js";import{a as ne}from"./SetPieceKit-DP35AB17.js";import{_ as re,g as j,h as ie,m as ae,p as M}from"./SmallProps-C5k08o7A.js";import{a as oe}from"./SeasonKit-DYltrdP6.js";var N={dust:{mode:`area`,motion:`drift`,texture:`glow`,blending:`additive`,count:90,life:[5,10],size:[.06,.12],sizeEnd:1,velocity:[0,.05,0],velocityVariance:[.07,.04,.07],windInfluence:.12,turbulence:[.3,.35],color:`#ffe0a0`,hdr:2.4,alpha:.85,fade:[.25,.3],twinkle:1,nightVisibility:-.85,bounds:[14,4,14]},fireflies:{mode:`area`,motion:`drift`,texture:`glow`,blending:`additive`,count:36,life:[7,13],size:[.15,.22],sizeEnd:1,velocity:[0,.02,0],velocityVariance:[.28,.1,.28],windInfluence:.02,turbulence:[1.4,.55],color:`#d4ff4a`,colorEnd:`#f4ff9a`,hdr:4.2,alpha:1,fade:[.2,.25],blink:1,nightVisibility:1,bounds:[10,2.2,10]},embers:{mode:`point`,motion:`emit`,texture:`square`,blending:`additive`,count:34,life:[.9,2.2],size:[.07,.11],sizeEnd:.35,spawnSize:[.6,.15,.6],velocity:[0,1.5,0],velocityVariance:[.3,.55,.3],radial:.12,gravity:.5,drag:.7,windInfluence:.35,turbulence:[.3,5],color:`#ff8a2a`,colorEnd:`#ff3a12`,hdr:2.4,alpha:1,fade:[.04,.35],twinkle:.35},smoke:{mode:`point`,motion:`emit`,texture:`smoke`,blending:`normal`,count:22,life:[3.5,6],size:[.45,.7],sizeEnd:4.2,spawnSize:[.25,.1,.25],velocity:[0,.8,0],velocityVariance:[.1,.15,.1],gravity:.06,drag:.3,windInfluence:.22,turbulence:[.25,1.2],spin:[.1,.4],color:`#d2cdc8`,colorEnd:`#8d8b92`,alpha:.5,fade:[.12,.55],lit:1},leaves:{mode:`area`,motion:`fall`,texture:`leaf`,blending:`cutout`,count:24,size:[.46,.54],velocity:[0,-.75,0],velocityVariance:[0,.3,0],windInfluence:.45,turbulence:[.55,1.6],spin:[1.2,3],tumble:1,colors:[`#e0752f`,`#f2b04a`,`#b8462a`,`#86ad48`],alpha:1,fade:[.06,.12],lit:1,bounds:[10,6,10]},bambooleaves:{mode:`area`,motion:`fall`,texture:`leaf`,blending:`cutout`,count:6,size:[.26,.34],velocity:[0,-.45,0],velocityVariance:[0,.15,0],windInfluence:.35,turbulence:[.5,1.4],spin:[1,2.4],tumble:1,colors:[`#7aa83c`,`#9cc04e`,`#c4c862`,`#6a9030`],alpha:1,fade:[.08,.15],lit:1,bounds:[3,5,3]},petals:{mode:`area`,motion:`fall`,texture:`petal`,blending:`cutout`,count:40,size:[.3,.36],velocity:[0,-.5,0],velocityVariance:[0,.3,0],windInfluence:.8,turbulence:[.75,1.3],spin:[1,2.6],tumble:1,colors:[`#f7b3c7`,`#ffd8e3`,`#fff4f6`,`#f28fb0`],alpha:1,fade:[.06,.12],lit:1,bounds:[10,5,10]},rain:{mode:`area`,motion:`precip`,texture:`streak`,blending:`normal`,followCamera:!0,count:1600,size:[.035,.05],aspect:12,streak:.03,velocity:[0,-15,0],velocityVariance:[0,.12,0],windInfluence:.9,color:`#c4d8f6`,alpha:.5,lit:.6,bounds:[36,16,36]},snow:{mode:`area`,motion:`precip`,texture:`snow`,blending:`normal`,followCamera:!0,count:1100,size:[.08,.13],velocity:[0,-1,0],velocityVariance:[0,.35,0],windInfluence:.45,turbulence:[.35,1.1],spin:[.5,.5],color:`#ffffff`,alpha:.95,lit:.75,bounds:[34,14,34]},mist:{mode:`point`,motion:`emit`,texture:`smoke`,blending:`normal`,count:34,life:[1.6,3],size:[.6,.9],sizeEnd:3.2,spawnSize:[2,.3,.4],velocity:[0,.35,.45],velocityVariance:[.45,.3,.35],radial:.5,gravity:.05,drag:1,windInfluence:.2,turbulence:[.2,1.5],spin:[.1,.5],color:`#eef8ff`,colorEnd:`#d2e6f4`,alpha:.28,fade:[.15,.6],lit:.9},footstep:{mode:`burst`,motion:`emit`,texture:`smoke`,blending:`normal`,count:8,life:[.35,.65],size:[.14,.22],sizeEnd:2.2,spawnSize:[.3,.02,.14],burstSpeed:[.5,1.1],burstUp:[.15,.45],gravity:-.3,drag:5,windInfluence:.1,spin:[.5,2],color:`#d6bf98`,alpha:.7,fade:[.05,.6],lit:1},splash:{mode:`burst`,motion:`emit`,texture:`square`,blending:`normal`,count:16,life:[.45,.8],size:[.07,.12],sizeEnd:.6,spawnSize:[.3,.02,.3],burstSpeed:[.8,2.2],burstUp:[2.2,4.2],gravity:-9.8,drag:.4,ballistic:!0,color:`#e8f6ff`,hdr:1.4,alpha:.95,fade:[0,.3],lit:.5},sparkle:{mode:`burst`,motion:`emit`,texture:`star`,blending:`additive`,count:10,life:[.45,1],size:[.28,.5],sizeEnd:.9,pulse:1,spawnSize:[.8,.8,.8],burstSpeed:[.2,.8],burstUp:[.2,.8],velocity:[0,.12,0],gravity:.2,drag:2,spin:[.5,2],color:`#fff6d0`,hdr:6,alpha:1,fade:[.05,.3],bounds:[4,1,4]},hitSpark:{mode:`burst`,motion:`emit`,texture:`streak`,blending:`additive`,variants:1,lit:0,pulse:0,tumble:0,aspect:4,streak:.04,fade:[0,.3],twinkle:0,blink:0,nightVisibility:0,count:8,life:[.12,.25],size:[.05,.08],sizeEnd:.6,spawnSize:[.1,.1,.1],burstSpeed:[3,7],burstUp:[.5,2],gravity:-8,drag:4,color:`#fff2c0`,colorEnd:`#ff9a3c`,hdr:4,alpha:1},emberBurst:{mode:`burst`,motion:`emit`,texture:`streak`,blending:`additive`,variants:1,lit:0,pulse:0,tumble:0,aspect:4,streak:.04,fade:[0,.3],twinkle:0,blink:0,nightVisibility:0,count:10,life:[.4,.9],size:[.05,.09],sizeEnd:.5,spawnSize:[.4,.2,.4],burstSpeed:[1,3],burstUp:[1,3],gravity:1.5,drag:1,colors:[`#ff8a2a`,`#ff3a12`,`#ffd27a`],hdr:3,alpha:1},deathPoof:{mode:`burst`,motion:`emit`,texture:`smoke`,blending:`normal`,variants:1,lit:1,pulse:0,tumble:0,aspect:1,streak:0,fade:[.05,.6],twinkle:0,blink:0,nightVisibility:0,count:10,life:[.4,.8],size:[.5,.5],sizeEnd:2.2,spawnSize:[.5,.3,.5],burstSpeed:[.6,1.4],burstUp:[.3,.8],drag:4,spin:[.5,2],color:`#d8d0c0`,alpha:.7},gooPoof:{mode:`burst`,motion:`emit`,texture:`smoke`,blending:`normal`,variants:1,lit:1,pulse:0,tumble:0,aspect:1,streak:0,fade:[.05,.6],twinkle:0,blink:0,nightVisibility:0,count:10,life:[.4,.8],size:[.5,.5],sizeEnd:2.2,spawnSize:[.5,.3,.5],burstSpeed:[.6,1.4],burstUp:[.3,.8],drag:4,spin:[.5,2],color:`#5fc7b0`,alpha:.7},healGlow:{mode:`burst`,motion:`emit`,texture:`star`,blending:`additive`,variants:1,lit:0,pulse:1,tumble:0,aspect:1,streak:0,fade:[.05,.3],twinkle:0,blink:0,nightVisibility:0,count:8,life:[.5,1],size:[.2,.35],sizeEnd:.8,spawnSize:[.6,.8,.6],velocity:[0,1.2,0],burstSpeed:[.2,.6],burstUp:[0,.3],drag:1,color:`#bfe58f`,hdr:2.4,alpha:1},magicBurst:{mode:`burst`,motion:`emit`,texture:`star`,blending:`additive`,variants:1,lit:0,pulse:1,tumble:0,aspect:1,streak:0,fade:[.05,.3],twinkle:0,blink:0,nightVisibility:0,count:12,life:[.4,.8],size:[.25,.45],sizeEnd:.7,spawnSize:[.3,.3,.3],burstSpeed:[2,5],burstUp:[-.5,.5],drag:3,colors:[`#8fd0ff`,`#f3cf7a`],hdr:3.5,alpha:1},victoryEmbers:{mode:`burst`,motion:`emit`,texture:`streak`,blending:`additive`,variants:1,lit:0,pulse:0,tumble:0,aspect:4,streak:.04,fade:[0,.3],twinkle:0,blink:0,nightVisibility:0,count:12,life:[.7,1.3],size:[.05,.08],sizeEnd:.5,spawnSize:[1,.8,.6],burstSpeed:[.3,1.1],burstUp:[1.6,3.2],gravity:1.2,drag:1.4,colors:[`#ff8a2a`,`#ff3a12`,`#ffd27a`],hdr:1.5,alpha:1},victorySparkle:{mode:`burst`,motion:`emit`,texture:`star`,blending:`additive`,variants:1,lit:0,pulse:1,tumble:0,aspect:1,streak:0,fade:[.05,.3],twinkle:0,blink:0,nightVisibility:0,count:12,life:[.6,1.1],size:[.16,.3],sizeEnd:.8,spawnSize:[1.4,1,.8],velocity:[0,.5,0],burstSpeed:[.15,.6],burstUp:[.2,.8],gravity:.2,drag:2,spin:[.5,2],color:`#fff0c8`,hdr:1.15,alpha:1},levelSparkle:{mode:`burst`,motion:`emit`,texture:`star`,blending:`additive`,variants:1,lit:0,pulse:1,tumble:0,aspect:1,streak:0,fade:[.05,.3],twinkle:0,blink:0,nightVisibility:0,count:14,life:[.6,1.1],size:[.14,.26],sizeEnd:.8,spawnSize:[1.3,.5,1.3],velocity:[0,.9,0],burstSpeed:[.3,.8],burstUp:[.1,.5],gravity:.2,drag:1.5,spin:[.5,2],color:`#fff0c8`,hdr:1.15,alpha:1}};function P(e){let t=N;for(let[n,r]of Object.entries(e)){if(Object.hasOwn(t,n)){if(t[n]===r)continue;throw Error(`Particles: the preset "${n}" is defined twice`)}t[n]=r}}var F={mode:`point`,motion:`emit`,texture:`glow`,blending:`additive`,count:32,life:[1,2],size:[.1,.1],sizeEnd:1,aspect:1,streak:0,velocity:[0,0,0],velocityVariance:[0,0,0],radial:0,gravity:0,drag:0,windInfluence:0,turbulence:[0,1],spin:[0,0],tumble:0,color:`#ffffff`,colorEnd:null,colors:null,hdr:1,alpha:1,fade:[.1,.3],twinkle:0,blink:0,nightVisibility:0,lit:0,pulse:0,bounds:[6,3,6],spawnSize:[.2,.2,.2],followCamera:!1,followDistance:20,burstSpeed:[.5,1.5],burstUp:[.5,1.5],ballistic:!1,map:null,variants:1},I=`
float lpBayer4( vec2 p ) {
	ivec2 q = ivec2( mod( floor( p ), 4.0 ) );
	const float M[ 16 ] = float[ 16 ]( 0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0 );
	return ( M[ q.y * 4 + q.x ] + 0.5 ) / 16.0;
}
`,L=`
#include <common>
#include <fog_pars_vertex>

uniform float uTime;
uniform float uNight;
uniform vec2 uWind;
uniform float uWindStrength;
uniform vec3 uSunColor;

uniform vec3 uOrigin;
uniform vec3 uBox;
uniform float uSeed;
uniform float uCount;
uniform float uIntensity;
uniform vec2 uLife;
uniform vec2 uSize;
uniform float uSizeEnd;
uniform vec2 uStretch;
uniform vec3 uVel;
uniform vec3 uVelVar;
uniform float uRadial;
uniform float uGravity;
uniform float uDrag;
uniform float uWindInfluence;
uniform vec2 uTurb;
uniform vec2 uSpin;
uniform float uTumble;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uPalette[ 4 ];
uniform float uPaletteSize;
uniform float uAlpha;
uniform vec2 uFade;
uniform float uVariants;
uniform float uTwinkle;
uniform float uBlink;
uniform float uNightVis;
uniform float uLit;
uniform float uPulse;

#ifdef BURST
attribute vec4 aOrigin; // xyz spawn, w birth time
attribute vec4 aVel;    // xyz initial velocity, w life
attribute vec4 aSize;   // x size, y end multiplier, z rotation, w spin
attribute vec4 aColor;  // rgb (linear, HDR), a alpha
attribute vec4 aPhys;   // x gravity, y drag, z wind influence, w seed
#endif

varying vec2 vUv;
varying vec4 vColor;
varying float vVariant;

uvec4 lpPcg4( uvec4 v ) {
	v = v * 1664525u + 1013904223u;
	v.x += v.y * v.w; v.y += v.z * v.x; v.z += v.x * v.y; v.w += v.y * v.z;
	v ^= v >> 16u;
	v.x += v.y * v.w; v.y += v.z * v.x; v.z += v.x * v.y; v.w += v.y * v.z;
	return v;
}

vec4 lpHash( float a, float b, float c ) {
	uvec4 h = lpPcg4( uvec4( uint( a ), uint( b ), uint( c ), 2654435769u ) );
	return vec4( h >> 8u ) / 16777216.0;
}

void main() {

	vec3 wind3 = vec3( uWind.x, 0.0, uWind.y ) * uWindStrength;
	vec3 wpos = vec3( 0.0 );
	vec3 vel = vec3( 0.0, - 1.0, 0.0 );
	float t = 0.5;
	float age = 0.0;
	float size = 0.1;
	float angle = 0.0;
	float tumble = 1.0;
	float gate = 1.0;
	vec3 col = uColor0;
	float alpha = uAlpha;
	vec4 s = vec4( 0.5 );

#ifdef BURST

	age = uTime - aOrigin.w;
	float life = max( aVel.w, 1e-3 );
	t = age / life;
	gate = ( age >= 0.0 && t < 1.0 ) ? 1.0 : 0.0;
	s = fract( vec4( aPhys.w, aPhys.w * 7.31, aPhys.w * 13.17, aPhys.w * 3.73 ) );
	float k = max( aPhys.y, 1e-3 );
	vec3 g = vec3( 0.0, aPhys.x, 0.0 ) + wind3 * aPhys.z;
	float ek = exp( - k * max( age, 0.0 ) );
	float E = ( 1.0 - ek ) / k;
	wpos = aOrigin.xyz + aVel.xyz * E + g / k * ( age - E );
	vel = aVel.xyz * ek + g / k * ( 1.0 - ek );
	size = aSize.x * mix( 1.0, aSize.y, clamp( t, 0.0, 1.0 ) );
	angle = aSize.z + aSize.w * age;
	col = aColor.rgb;
	alpha = aColor.a;
	tumble = mix( 1.0, cos( age * aSize.w * 1.3 + s.y * 6.2831 ), uTumble );

#else

	float id = float( gl_InstanceID );
	s = lpHash( id, 0.0, uSeed );
	gate = clamp( uIntensity * uCount - id, 0.0, 1.0 ) * clamp( uIntensity * 3.0, 0.0, 1.0 );

	#ifdef MOTION_PRECIP

		vec4 r = lpHash( id, 1.0, uSeed );
		vec3 box = max( uBox, vec3( 1e-3 ) );
		float speed = abs( uVel.y ) * mix( 1.0 - uVelVar.y, 1.0 + uVelVar.y, r.w );
		vel = vec3( uVel.x, - speed, uVel.z ) + wind3 * uWindInfluence;
		vec3 p = r.xyz * box + vel * uTime;
		p.x += sin( uTime * uTurb.y + r.x * 43.0 ) * uTurb.x;
		p.z += cos( uTime * uTurb.y * 0.83 + r.z * 37.0 ) * uTurb.x;
		vec3 bmin = uOrigin - box * 0.5;
		vec3 rel = mod( p - bmin, box );
		wpos = bmin + rel;
		vec3 rn = rel / box;
		alpha *= smoothstep( 0.0, 0.05, rn.y ) * ( 1.0 - smoothstep( 0.8, 1.0, rn.y ) )
			* smoothstep( 0.0, 0.12, rn.x ) * ( 1.0 - smoothstep( 0.88, 1.0, rn.x ) )
			* smoothstep( 0.0, 0.12, rn.z ) * ( 1.0 - smoothstep( 0.88, 1.0, rn.z ) );
		size = mix( uSize.x, uSize.y, s.y );
		angle = s.w * 6.2831 + uSpin.x * uTime * ( s.x < 0.5 ? - 1.0 : 1.0 );
		age = uTime;
		t = 0.5;

	#else

		float life = max( mix( uLife.x, uLife.y, s.y ), 0.05 );
		#ifdef MOTION_FALL
			float fallSpeed = max( abs( uVel.y ) * mix( 1.0 - uVelVar.y, 1.0 + uVelVar.y, s.y ), 0.05 );
			life = max( uBox.y / fallSpeed, 0.05 );
		#endif
		float tt = uTime + s.z * life;
		float cycle = floor( tt / life );
		age = tt - cycle * life;
		t = age / life;
		vec4 r = lpHash( id, cycle + 2.0, uSeed + 17.0 );
		vec4 r2 = lpHash( id, cycle + 2.0, uSeed + 91.0 );
		vec3 spawn = uOrigin + ( r.xyz - 0.5 ) * uBox;

		#if defined( MOTION_DRIFT )

			float f = uTurb.y;
			vec3 wob = vec3(
				sin( uTime * f * ( 0.7 + r.w * 0.6 ) + r.x * 6.2831 ),
				sin( uTime * f * ( 0.5 + r2.x * 0.5 ) + r.y * 6.2831 ) * 0.5,
				cos( uTime * f * ( 0.6 + r2.y * 0.5 ) + r.z * 6.2831 ) ) * uTurb.x;
			vel = uVel + ( r2.xyz - 0.5 ) * 2.0 * uVelVar + wind3 * uWindInfluence;
			wpos = spawn + vel * age + wob;

		#elif defined( MOTION_FALL )

			spawn.y = uOrigin.y + uBox.y * 0.5;
			float sf = uTurb.y * ( 0.7 + 0.6 * r.w );
			wpos = spawn + vec3( 0.0, - fallSpeed * age, 0.0 ) + wind3 * uWindInfluence * age
				+ vec3( sin( age * sf + r.x * 6.2831 ), 0.0, cos( age * sf * 0.7 + r.z * 6.2831 ) * 0.6 ) * uTurb.x;
			vel = vec3( 0.0, - fallSpeed, 0.0 );
			tumble = mix( 1.0, cos( age * mix( uSpin.x, uSpin.y, r2.x ) * 1.3 + r2.y * 6.2831 ), uTumble );

		#else

			float ang = r.w * 6.2831;
			vec3 v0 = uVel + ( r2.xyz - 0.5 ) * 2.0 * uVelVar + vec3( cos( ang ), 0.0, sin( ang ) ) * uRadial * ( 0.4 + 0.6 * r2.w );
			float k = max( uDrag, 1e-3 );
			vec3 g = vec3( 0.0, uGravity, 0.0 ) + wind3 * uWindInfluence;
			float ek = exp( - k * age );
			float E = ( 1.0 - ek ) / k;
			wpos = spawn + v0 * E + g / k * ( age - E );
			vel = v0 * ek + g / k * ( 1.0 - ek );
			wpos += vec3( sin( age * uTurb.y + r.x * 6.2831 ), 0.0, cos( age * uTurb.y * 1.3 + r.y * 6.2831 ) ) * uTurb.x * t;
			tumble = mix( 1.0, cos( age * uSpin.y * 1.3 + r2.y * 6.2831 ), uTumble );

		#endif

		size = mix( uSize.x, uSize.y, r2.z ) * mix( 1.0, uSizeEnd, t );
		angle = r2.w * 6.2831 + mix( uSpin.x, uSpin.y, r.w ) * age * ( r2.x < 0.5 ? - 1.0 : 1.0 );
		col = mix( uColor0, uColor1, t );
		if ( uPaletteSize > 0.5 ) {
			int pIdx = int( min( floor( r2.z * uPaletteSize ), uPaletteSize - 1.0 ) );
			col = uPalette[ pIdx ];
		}
		s = r;

	#endif

#endif

	// life envelope
	float fadeIn = smoothstep( 0.0, max( uFade.x, 1e-4 ), t );
	float fadeOut = 1.0 - smoothstep( 1.0 - max( uFade.y, 1e-4 ), 1.0, t );
	alpha *= fadeIn * fadeOut;
	size *= mix( 1.0, sin( PI * clamp( t, 0.0, 1.0 ) ), uPulse );

	if ( uTwinkle > 0.0 ) {
		// max(): GPU sin() may overshoot -1 slightly; pow() of a negative base is NaN, and a NaN in the
		// HDR target spreads through bloom as black/white blocks
		float tw = pow( max( 0.5 + 0.5 * sin( uTime * ( 1.1 + s.x * 2.3 ) + s.z * 6.2831 ), 0.0 ), 14.0 );
		col *= 1.0 + uTwinkle * tw * 3.0;
		size *= 1.0 + uTwinkle * tw * 0.5;
	}
	if ( uBlink > 0.0 ) {
		float bl = smoothstep( 0.1, 0.95, sin( uTime * ( 0.8 + s.y * 1.3 ) + s.w * 6.2831 ) );
		alpha *= mix( 1.0, bl, uBlink );
		size *= mix( 1.0, 0.55 + 0.45 * bl, uBlink );
	}
	if ( uNightVis > 0.0 ) alpha *= smoothstep( 0.3, 0.85, uNight ) * uNightVis;
	else if ( uNightVis < 0.0 ) alpha *= 1.0 - uNight * ( - uNightVis );
	if ( uLit > 0.0 ) {
		vec3 amb = mix( vec3( 0.42, 0.45, 0.52 ), vec3( 0.06, 0.08, 0.15 ), uNight );
		col *= mix( vec3( 1.0 ), amb + uSunColor * 0.75, uLit );
	}
	if ( tumble < 0.0 ) col *= 0.78; // back side of a tumbling leaf
	alpha *= gate;

	vec4 mv = viewMatrix * vec4( wpos, 1.0 );
	vec2 corner = position.xy;
	vUv = uv;

#ifdef STREAK
	vec3 vv = ( viewMatrix * vec4( vel, 0.0 ) ).xyz;
	float vl = length( vv.xy );
	vec2 dir = vl > 1e-4 ? vv.xy / vl : vec2( 0.0, - 1.0 );
	vec2 side = vec2( - dir.y, dir.x );
	float len = size * uStretch.x + vl * uStretch.y;
	mv.xy += side * corner.x * size + dir * corner.y * len;
#else
	float tf = ( tumble >= 0.0 ? 1.0 : - 1.0 ) * max( abs( tumble ), 0.18 );
	corner.x *= tf;
	corner.y *= uStretch.x;
	float ca = cos( angle );
	float sa = sin( angle );
	mv.xy += vec2( corner.x * ca - corner.y * sa, corner.x * sa + corner.y * ca ) * size;
#endif

	gl_Position = projectionMatrix * mv;
	if ( alpha <= 0.002 ) gl_Position = vec4( 0.0, 0.0, 2.0, 1.0 ); // cull dead / hidden particles

	vColor = vec4( col, alpha );
	vVariant = floor( s.x * uVariants );

	#ifdef USE_FOG
		// the standard chunk (vFogDepth = -mvPosition.z), so a game that patches it — e.g. to start
		// the fog some distance in front of the camera — fogs particles like every other material
		vec4 mvPosition = mv;
		#include <fog_vertex>
	#endif
}
`,se=`
#include <common>
#include <fog_pars_fragment>

uniform sampler2D uMap;
uniform float uVariants;

varying vec2 vUv;
varying vec4 vColor;
varying float vVariant;

${I}

void main() {

#ifdef USE_PMAP
	vec4 tex = texture2D( uMap, vec2( ( min( vVariant, uVariants - 1.0 ) + vUv.x ) / uVariants, vUv.y ) );
#else
	float across = 1.0 - abs( vUv.x * 2.0 - 1.0 );
	vec4 tex = vec4( 1.0, 1.0, 1.0, smoothstep( 0.0, 1.0, vUv.y ) * smoothstep( 0.0, 0.7, across ) );
#endif

	vec4 outColor = vec4( vColor.rgb * tex.rgb, vColor.a * tex.a );

#ifdef CUTOUT
	if ( tex.a < 0.5 ) discard;
	if ( vColor.a < 0.999 && vColor.a <= lpBayer4( gl_FragCoord.xy ) ) discard;
	outColor.a = 1.0;
#else
	if ( outColor.a < 0.004 ) discard;
#endif

	gl_FragColor = outColor;

	#include <tonemapping_fragment>
	#include <colorspace_fragment>

	#ifdef USE_FOG
		#ifdef FOG_EXP2
			float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
		#else
			float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
		#endif
		#ifdef ADDITIVE
			gl_FragColor.rgb *= 1.0 - fogFactor;
		#else
			gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
		#endif
	#endif
}
`;function R(e,t,n,r,i){for(let a=0;a<r.length;a++){let o=r[a];for(let r=0;r<o.length;r++){let s=i[o[r]];s&&e.set(t+r,n+a,[s[0]*255,s[0]*255,s[0]*255,s[1]*255])}}}function z(e,n,r,{angle:i,a,b:o,midrib:s,shades:c,stem:l}){let u=r/2-.5,d=r/2-.5,f=Math.cos(i),p=Math.sin(i),m=new t(r,r);for(let e=0;e<r;e++)for(let t=0;t<r;t++){let n=t-u,r=e-d,i=n*f+r*p,l=-n*p+r*f,h=o*(1-Math.max(0,i/a)*.35),g=i*i/(a*a)+l*l/(h*h);if(g>1)continue;let _=l<-.35?c.light:c.mid;g>.62&&l>.2&&(_=c.dark),s&&Math.abs(l)<.45&&i>-a*.8&&i<a*.75&&(_=c.rib),m.set(t,e,[_*255,_*255,_*255,255])}if(l){let e=Math.round(u-f*(a+.6)),t=Math.round(d-p*(a+.6));m.set(e,t,[c.outline*255,c.outline*255,c.outline*255,255])}let h=c.outline*255;m.outline([h,h,h,255]),e.blit(m,n,0)}function ce(e){switch(e){case`glow`:{let e=new t(32,32);for(let t=0;t<32;t++)for(let n=0;n<32;n++){let r=Math.hypot(n+.5-16,t+.5-16)/16,i=C(.8*Math.exp(-r*r*4.5)+.2*Math.exp(-r*r*40)-.009*r,0,1);e.set(n,t,[255,255,255,i*255])}let n=c(e.toCanvas(),{wrap:`clamp`,mipmaps:!0,srgb:!0,name:`particle_glow`});return n.magFilter=v,{texture:n,variants:1}}case`square`:{let e=new t(8,4),n={b:[1,.55],d:[1,1]};return R(e,0,0,[`.bb.`,`bddb`,`bddb`,`.bb.`],n),R(e,4,0,[`....`,`.dd.`,`.dd.`,`....`],n),{texture:c(e.toCanvas(),{wrap:`clamp`,name:`particle_square`}),variants:2}}case`snow`:{let e=new t(8,4),n={a:[1,.4],b:[1,.8],d:[1,1]};return R(e,0,0,[`.aa.`,`abba`,`abda`,`.aa.`],n),R(e,4,0,[`....`,`.bd.`,`.db.`,`....`],n),{texture:c(e.toCanvas(),{wrap:`clamp`,name:`particle_snow`}),variants:2}}case`star`:{let e=new t(18,9),n={a:[1,.3],b:[1,.6],c:[1,.85],d:[1,1]};return R(e,0,0,[`....a....`,`....b....`,`....c....`,`...bdb...`,`abcdddcba`,`...bdb...`,`....c....`,`....b....`,`....a....`],n),R(e,9,0,[`.........`,`.........`,`..a...a..`,`...bcb...`,`...cdc...`,`...bcb...`,`..a...a..`,`.........`,`.........`],n),{texture:c(e.toCanvas(),{wrap:`clamp`,name:`particle_star`}),variants:2}}case`leaf`:{let e=new t(32,8),n={light:1,mid:.8,dark:.62,rib:.66,outline:.3};return z(e,0,8,{angle:-.75,a:3.1,b:1.55,midrib:!0,shades:n,stem:!0}),z(e,8,8,{angle:.6,a:2.7,b:1.7,midrib:!0,shades:n,stem:!0}),z(e,16,8,{angle:-1.35,a:3,b:1.35,midrib:!1,shades:n,stem:!0}),z(e,24,8,{angle:2.3,a:2.6,b:1.9,midrib:!0,shades:n,stem:!1}),{texture:c(e.toCanvas(),{wrap:`clamp`,name:`particle_leaf`}),variants:4}}case`petal`:{let e=new t(32,8),n={light:1,mid:.92,dark:.8,rib:.9,outline:.66};return z(e,0,8,{angle:-.5,a:2.2,b:1.6,midrib:!1,shades:n,stem:!1}),z(e,8,8,{angle:.9,a:2,b:1.4,midrib:!1,shades:n,stem:!1}),z(e,16,8,{angle:2,a:2.4,b:1.3,midrib:!1,shades:n,stem:!1}),z(e,24,8,{angle:-1.8,a:1.8,b:1.5,midrib:!1,shades:n,stem:!1}),{texture:c(e.toCanvas(),{wrap:`clamp`,name:`particle_petal`}),variants:4}}case`smoke`:{let e=new t(128,32);for(let t=0;t<4;t++){let n=t*32;for(let r=0;r<32;r++)for(let i=0;i<32;i++){let a=(i+.5-16)/16,o=(r+.5-16)/16,s=g(i/9+t*7.3,r/9+t*3.1,{octaves:3,seed:71+t}),c=Math.hypot(a,o)*1.08+(s-.5)*.55,l=C((.95-c)/.55,0,1);l=l*l*(3-2*l);let u=C(Math.floor(l*5+h(i,r)-.25),0,5)/5;if(u<=0)continue;let d=C(.5-o*.35-a*.15+(s-.5)*.5,0,1),f=.74+Math.round(d*3)/3*.26;e.set(n+i,r,[f*255,f*255,Math.min(1,f*1.03)*255,u*255])}}return{texture:c(e.toCanvas(),{wrap:`clamp`,mipmaps:!0,name:`particle_smoke`}),variants:4}}default:return null}}function B(e,t){return e==null?t:Array.isArray(e)?[e[0],e.length>1?e[1]:e[0]]:[e,e]}function V(e,t){return e==null?new y().fromArray(t):e.isVector3?e.clone():Array.isArray(e)?new y(e[0],e[1],e[2]):new y(e,e,e)}function H(e,t=1,n=new r){return n.set(p(e,r.NAMES)).multiplyScalar(t)}var U=(e,t)=>t[0]+(t[1]-t[0])*e.next();function le(e,t){let n=a(N,e);if(!n)throw Error(`Particles: unknown preset "${e}"`);let r={...F,...n,...t,preset:e};return Array.isArray(t.color)&&t.color.length===2&&typeof t.color[0]!=`number`?(r.color=t.color[0],r.colorEnd=t.color[1]):t.color!=null&&t.colorEnd===void 0&&(r.colorEnd=null,t.colors===void 0&&(r.colors=null)),r.size=B(r.size,[.1,.1]),r.life=B(r.life,[1,2]),r.spin=B(r.spin,[0,0]),r.fade=B(r.fade,[.1,.3]),r.turbulence=B(r.turbulence,[0,1]),r.burstSpeed=B(r.burstSpeed,[.5,1.5]),r.burstUp=B(r.burstUp,[.5,1.5]),r}function W(e,t){let i=[new r,new r,new r,new r],a=0;if(Array.isArray(e.colors)&&e.colors.length){a=Math.min(4,e.colors.length);for(let t=0;t<4;t++)H(e.colors[Math.min(t,a-1)],e.hdr,i[t])}let o=H(e.color,e.hdr),s=e.colorEnd==null?o.clone():H(e.colorEnd,e.hdr);return{uTime:A.uTime,uNight:A.uNight,uWind:A.uWind,uWindStrength:A.uWindStrength,uSunColor:A.uSunColor,...n.clone(k.fog),uFogStart:A.uFogStart,uMap:{value:t?t.texture:null},uVariants:{value:t?t.variants:1},uOrigin:{value:new y},uBox:{value:new y(1,1,1)},uSeed:{value:1},uCount:{value:1},uIntensity:{value:1},uLife:{value:new T(e.life[0],e.life[1])},uSize:{value:new T(e.size[0],e.size[1])},uSizeEnd:{value:e.sizeEnd},uStretch:{value:new T(e.aspect,e.streak)},uVel:{value:V(e.velocity,[0,0,0])},uVelVar:{value:V(e.velocityVariance,[0,0,0])},uRadial:{value:e.radial},uGravity:{value:e.gravity},uDrag:{value:e.drag},uWindInfluence:{value:e.windInfluence},uTurb:{value:new T(e.turbulence[0],e.turbulence[1])},uSpin:{value:new T(e.spin[0],e.spin[1])},uTumble:{value:e.tumble},uColor0:{value:o},uColor1:{value:s},uPalette:{value:i},uPaletteSize:{value:a},uAlpha:{value:e.alpha},uFade:{value:new T(e.fade[0],e.fade[1])},uTwinkle:{value:e.twinkle},uBlink:{value:e.blink},uNightVis:{value:e.nightVisibility},uLit:{value:typeof e.lit==`boolean`?+!!e.lit:e.lit},uPulse:{value:e.pulse}}}function ue(e,t,n){let r={};r[`MOTION_${String(n?`emit`:e.motion).toUpperCase()}`]=``,n&&(r.BURST=``),e.texture===`streak`&&!e.map?r.STREAK=``:r.USE_PMAP=``,e.blending===`additive`&&(r.ADDITIVE=``),e.blending===`cutout`&&(r.CUTOUT=``);let i=e.blending===`cutout`;return new O({name:`Particles.${e.preset}${n?`.burst`:``}`,uniforms:t,defines:r,vertexShader:L,fragmentShader:se,transparent:!i,depthWrite:i,blending:e.blending===`additive`?2:1,side:2,fog:!0})}function G(){let e=new E,t=new i(1,1);return e.setIndex(t.index),e.setAttribute(`position`,t.getAttribute(`position`)),e.setAttribute(`uv`,t.getAttribute(`uv`)),t.dispose(),e}var K=class{constructor(e,t){let n=le(t.preset,t);this.system=e,this.config=n,this.preset=n.preset,this.followCamera=!!n.followCamera,this.followDistance=n.followDistance;let r=!!t.bounds||n.mode===`area`||n.motion===`precip`;this.mode=r?`area`:`point`;let i=t.bounds?.center??t.position??new y;this.position=i.isVector3?i.clone():Array.isArray(i)?new y().fromArray(i):new y(i.x??0,i.y??0,i.z??0);let a=r?t.bounds?.size??n.bounds:n.spawnSize;this.boxSize=V(a,[1,1,1]);let o=!!t.bounds?.center,c=this.position.y;r&&!o&&t.position&&n.motion!==`precip`&&(this.position.y+=this.boxSize.y*.5),this.followBaseY=o?c-this.boxSize.y*.5:t.position?c:0;let l=n.count;t.rate!=null&&n.motion!==`precip`&&(l=Math.ceil(t.rate*(n.life[0]+n.life[1])*.5)),this.count=Math.max(1,Math.round(l));let u=null;n.map?u={texture:n.map,variants:n.variants||1}:n.texture!==`streak`&&(u=e._texture(n.texture)),this.uniforms=W(n,u),this.uniforms.uOrigin.value=this.position,this.uniforms.uBox.value.copy(this.boxSize),this.uniforms.uSeed.value=t.seed??e._nextSeed(n.preset),this.uniforms.uCount.value=this.count,this.geometry=G(),this.geometry.instanceCount=this.count,this.material=ue(n,this.uniforms,!1),this.object=new D(this.geometry,this.material),this.object.name=`Emitter.${n.preset}`,this.object.renderOrder=m.PARTICLES+(n.blending===`additive`?2:0),this.object.matrixAutoUpdate=!1,this.object.castShadow=!1,this.object.receiveShadow=!1,this.object.frustumCulled=!this.followCamera,this._windKey=this._windStrength(),this.geometry.boundingSphere=new s(this.position.clone(),this._estimateRadius()),this.geometry.boundingBox=null,this._enabled=!0,this._intensity=1,this.enabled=t.enabled??!0,this.intensity=t.intensity??1}_windStrength(){return A.uWind.value.length()*Math.max(1,A.uWindStrength.value)}_estimateRadius(){let e=this.config,t=e.life[1],n=this.uniforms,r=n.uVel.value.length()+n.uVelVar.value.length()+e.radial,i=Math.max(e.drag,.001),a=A.uWind.value.length()*Math.max(1,A.uWindStrength.value)*e.windInfluence,o=Math.abs(e.gravity)+a,s=Math.min(r*t,r/i)+Math.min(.5*o*t*t,o/i*t);this.config.motion===`fall`&&(s=a*(this.boxSize.y/Math.max(.05,Math.abs(n.uVel.value.y)))+e.turbulence[0]),this.config.motion===`drift`&&(s=(r+a)*t+e.turbulence[0]);let c=e.size[1]*Math.max(1,e.sizeEnd)*Math.max(1,e.aspect);return this.boxSize.length()*.5+s+c+.5}get enabled(){return this._enabled}set enabled(e){this._enabled=!!e,this._refresh()}get intensity(){return this._intensity}set intensity(e){this._intensity=Math.max(0,+e||0),this.uniforms.uIntensity.value=this._intensity,this._refresh()}_refresh(){let e=Math.min(this.count,Math.ceil(this.count*Math.min(1,this._intensity)));this.geometry.instanceCount=e,this.object.visible=this._enabled&&e>0}_update(e,t){if(this.followCamera&&e){let e=this.followBaseY,n=this.followDistance;t.fy<-.05&&(n=C((e-t.py)/t.fy,2,120)),this.position.set(t.px+t.fx*n,e+this.boxSize.y*.5,t.pz+t.fz*n)}let n=this.geometry.boundingSphere;if(n.center.copy(this.position),this.object.frustumCulled){let e=this._windStrength();Math.abs(e-this._windKey)>.02*Math.max(1,this._windKey)&&(this._windKey=e,n.radius=this._estimateRadius())}}dispose(){this.object.parent&&this.object.parent.remove(this.object),this.geometry.dispose(),this.material.dispose();let e=this.system.emitters,t=e.indexOf(this);t>=0&&e.splice(t,1)}},de=class{constructor(e,t,n=512){this.capacity=n,this.head=0,this.used=0,this.aliveUntil=-1/0;let r=null;t.map?r={texture:t.map,variants:t.variants||1}:t.texture!==`streak`&&(r=e._texture(t.texture)),this.uniforms=W(t,r);let i=G(),a=()=>{let e=new _(new Float32Array(n*4),4);return e.setUsage(u),e};this.aOrigin=a(),this.aVel=a(),this.aSize=a(),this.aColor=a(),this.aPhys=a();for(let e=0;e<n;e++)this.aOrigin.array[e*4+3]=-1e6;i.setAttribute(`aOrigin`,this.aOrigin),i.setAttribute(`aVel`,this.aVel),i.setAttribute(`aSize`,this.aSize),i.setAttribute(`aColor`,this.aColor),i.setAttribute(`aPhys`,this.aPhys),i.instanceCount=0,this.geometry=i,this.material=ue(t,this.uniforms,!0),this.object=new D(i,this.material),this.object.name=`Particles.burst.${t.texture}.${t.blending}`,this.object.frustumCulled=!1,this.object.matrixAutoUpdate=!1,this.object.renderOrder=m.PARTICLES+(t.blending===`additive`?3:1),this.object.visible=!1,this._dirtyStart=1/0,this._dirtyEnd=-1}write(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y){let b=this.head,x=b*4,S=this.aOrigin.array;S[x]=e,S[x+1]=t,S[x+2]=n,S[x+3]=r,S=this.aVel.array,S[x]=i,S[x+1]=a,S[x+2]=o,S[x+3]=s,S=this.aSize.array,S[x]=c,S[x+1]=l,S[x+2]=u,S[x+3]=d,S=this.aColor.array,S[x]=f,S[x+1]=p,S[x+2]=m,S[x+3]=h,S=this.aPhys.array,S[x]=g,S[x+1]=_,S[x+2]=v,S[x+3]=y,b<this._dirtyStart&&(this._dirtyStart=b),b+1>this._dirtyEnd&&(this._dirtyEnd=b+1),this.head=(b+1)%this.capacity,this.used=Math.max(this.used,b+1),r+s>this.aliveUntil&&(this.aliveUntil=r+s)}flush(){if(this._dirtyEnd<0)return;let e=this._dirtyStart*4,t=(this._dirtyEnd-this._dirtyStart)*4;for(let n of[this.aOrigin,this.aVel,this.aSize,this.aColor,this.aPhys])n.addUpdateRange(e,t),n.needsUpdate=!0;this._dirtyStart=1/0,this._dirtyEnd=-1,this.geometry.instanceCount=this.used,this.object.visible=!0}dispose(){this.object.parent&&this.object.parent.remove(this.object),this.geometry.dispose(),this.material.dispose()}},fe=class{constructor(e){this.scene=e,this.object=new f,this.object.name=`Particles`,e&&e.add(this.object),this.emitters=[],this._pools=new Map,this._poolList=[],this._burstConfigs=new Map,this._textures=new Map,this._rng=new b(20903),this._emitterCounter=0,this._cam={px:0,py:0,pz:0,fx:0,fy:-1,fz:0}}_texture(e){let t=this._textures.get(e);return t===void 0&&(t=ce(e),this._textures.set(e,t)),t}_nextSeed(e){return this._emitterCounter++,(te(e)+this._emitterCounter*7919)%1000003}createEmitter(e){let t=new K(this,e);return this.emitters.push(t),this.object.add(t.object),t}_pool(e){let t=`${e.map?e.map.uuid:e.texture}|${e.variants}|${e.blending}|${+e.lit}|${e.pulse}|${e.tumble}|${e.aspect}|${e.streak}|${e.fade[0]}|${e.fade[1]}|${e.twinkle}|${e.blink}|${e.nightVisibility}`,n=this._pools.get(t);return n||(n=new de(this,e),this._pools.set(t,n),this._poolList.push(n),this.object.add(n.object)),n}_burstConfig(e,t){let n=!1;for(let e in t){n=!0;break}if(!n){let t=this._burstConfigs.get(e);if(t)return t}let r=le(e,t);return r._spawn=V(r.spawnSize,[.2,.2,.2]),r._vel=V(r.velocity,[0,0,0]),r._velVar=V(r.velocityVariance,[0,0,0]),r._color=H(r.color,r.hdr),r._palette=Array.isArray(r.colors)&&r.colors.length?r.colors.map(e=>H(e,r.hdr)):null,r._lit=typeof r.lit==`boolean`?+!!r.lit:r.lit,r._pool=this._pool(r),n||this._burstConfigs.set(e,r),r}burst(e,t,n=12,r={}){let i=this._burstConfig(e,r),a=i._pool,o=this._rng,s=A.uTime.value,c=i._vel,l=i._velVar,u=i._spawn,d=i._palette,f=i._color,p=Math.max(0,Math.min(a.capacity,n|0));for(let e=0;e<p;e++){let e=o.next()*Math.PI*2,n=U(o,i.burstSpeed),r=U(o,i.burstUp),p=Math.cos(e)*n+c.x+(o.next()*2-1)*l.x,m=r+c.y+(o.next()*2-1)*l.y,h=Math.sin(e)*n+c.z+(o.next()*2-1)*l.z,g=U(o,i.life);i.ballistic&&i.gravity<0&&m>0&&(g=Math.min(g,2*m/-i.gravity*.95));let _=d?d[Math.floor(o.next()*d.length)]:f,v=U(o,i.spin)*(o.next()<.5?-1:1);a.write(t.x+(o.next()-.5)*u.x,t.y+(o.next()-.5)*u.y,t.z+(o.next()-.5)*u.z,s,p,m,h,g,U(o,i.size),i.sizeEnd,o.next()*Math.PI*2,v,_.r,_.g,_.b,i.alpha,i.gravity,i.drag,i.windInfluence,o.next())}a.flush()}burstPools(){return this._poolList.slice()}releaseBurstPools(e){let t=new Set(e);if(t.size){for(let[e,n]of this._pools)t.has(n)&&this._pools.delete(e);for(let[e,n]of this._burstConfigs)t.has(n._pool)&&this._burstConfigs.delete(e);for(let e=this._poolList.length-1;e>=0;e--)t.has(this._poolList[e])&&this._poolList.splice(e,1);for(let e of t)e.dispose()}}update(e,t){let n=this._cam;if(t){let e=t.matrixWorld.elements;n.px=e[12],n.py=e[13],n.pz=e[14],n.fx=-e[8],n.fy=-e[9],n.fz=-e[10]}for(let e=0;e<this.emitters.length;e++)this.emitters[e]._update(t,n);let r=A.uTime.value,i=this._poolList;for(let e=0;e<i.length;e++){let t=i[e];t.object.visible&&r>t.aliveUntil+.05&&(t.object.visible=!1)}}dispose(){for(let e of this.emitters.slice())e.dispose();this.emitters.length=0;for(let e of this._poolList)e.dispose();this._pools.clear(),this._poolList.length=0,this._burstConfigs.clear();for(let e of this._textures.values())e&&e.texture.dispose();this._textures.clear(),this.object.parent&&this.object.parent.remove(this.object)}},q=l.outline;function J(t,n,{alpha:r=!1,normalStrength:i=2,wrap:a=!0}={}){let o=t.width,s=t.height,l=c(t.toCanvas(),{wrap:`repeat`,mipmaps:!0,anisotropy:4}),u=e(o,s,(e,t)=>n[t*o+e],{strength:i,wrap:a});return{map:l,normal:c(u.toCanvas(),{wrap:`repeat`,mipmaps:!0,srgb:!1,anisotropy:4}),units:[o/16,s/16],alpha:r}}function pe(e){let n=new b(e),r=new t(16,32);r.wrap=!0;let i=new Float32Array(512).fill(.6),a=[`#9c9a9a`,`#c4c1bb`,`#dedad2`,`#eeebe3`,`#f8f6ef`];for(let t=0;t<32;t++)for(let n=0;n<16;n++){let o=x(n,t>>1,e)*.5+x(n>>1,t>>2,e+3)*.5,s=C(Math.floor(o*3.2+1),0,4);r.set(n,t,a[s]),i[t*16+n]=.55+o*.1}for(let e=0;e<16;e++){let e=n.int(0,31),t=n.int(0,15),a=n.int(2,6);for(let n=0;n<a;n++)r.set(t+n,e,n===0||n===a-1?`#56555f`:`#2b2a33`),r.set(t+n,e+1,`#fbfaf5`),i[(e%32+32)%32*16+(t+n)%16]=.3}for(let e=0;e<2;e++){let e=n.int(0,15),t=n.int(0,31);for(let[n,a]of[[0,0],[1,0],[-1,0],[0,1],[2,1],[-2,1],[1,1],[-1,1],[0,-1]])r.set(e+n,t+a,a===-1?`#3d3c47`:q),i[((t+a)%32+32)%32*16+((e+n)%16+16)%16]=.2}return J(r,i,{normalStrength:2.2})}function me(e){let n=new t(64,16,`#1d1311`),r=new Float32Array(1024).fill(.1);return[{ramp:[`#3a0c14`,`#7a1a22`,`#b8302e`,`#e0584a`,`#f7a37e`],r:2.2,step:4},{ramp:[`#4a1d0c`,`#9c4414`,`#dd7a1f`,`#f5a93a`,`#ffe08a`],r:2.2,step:4},{ramp:[`#0f261c`,`#1f4a2a`,`#3c7a36`,`#68a845`,`#a8d466`],r:3.1,step:6},{ramp:[`#170c24`,`#34194a`,`#5a2d78`,`#8a4aa8`,`#c08ad6`],r:1.3,step:3}].forEach((t,i)=>{let a=new b(e+i*97),o=i*16,s=[];for(let e=-1;e*t.step<16+t.step;e++)for(let n=-1;n*t.step<16+t.step;n++)s.push([n*t.step+(e&1?t.step/2:0)+a.range(-.7,.7)+1.5,e*t.step+a.range(-.7,.7)+1.5]);s.sort((e,t)=>e[1]-t[1]);for(let[c,l]of s){let s=t.r*a.range(.9,1.1);for(let a=Math.floor(l-s-1);a<=Math.ceil(l+s+1);a++)for(let u=Math.floor(c-s-1);u<=Math.ceil(c+s+1);u++){if(u<0||a<0||u>=16||a>=16)continue;let d=u+.5-c,f=a+.5-l,p=Math.hypot(d,f)/(s+.35);if(p>1)continue;let m=C(.62-d*.12-f*.16-p*.35+(i===2?(x(u,a,e)-.5)*.3:0),0,.999),h=t.ramp[Math.floor(m*t.ramp.length)];p>.84&&(h=t.ramp[0]),n.set(o+u,a,h),r[a*64+o+u]=.4+(1-p*p)*.6}let u=Math.round(c-s*.45-.5),d=Math.round(l-s*.45-.5);if(i!==2&&u>=0&&d>=0&&u<16&&d<16&&n.set(o+u,d,t.ramp[4]),i===0&&a.chance(.5)){let e=Math.round(c-.5),t=Math.round(l-s+.2);e>=0&&t>=0&&e<16&&t<16&&n.set(o+e,t,`#4a2a18`)}}}),J(n,r,{normalStrength:2.5,wrap:!1})}function Y(e){let n=new b(e),r=new t(16,48),i=new Float32Array(768).fill(0),a=l.wood,o=[`#8f8170`,`#b8a88e`,`#d6c8aa`,`#ebe1c9`,`#f6efdd`];for(let t=0;t<39;t++)for(let n=1;n<15;n++){let a=Math.sin(n/14*Math.PI*2.2+.4)*.5+.5,s=x(n,t,e),c=C(Math.floor(1+a*2.2+s*.9-(t>34?.8:0)),0,4);r.set(n,t,o[c]),i[t*16+n]=.35+a*.15}let s=n.int(6,24),c=n.int(3,9);r.rect(c,s,3,3,`#c9a77a`),r.strokeRect(c,s,3,3,`#9a7a55`);let u=(e,t,n,a=.9)=>{r.set(e,t,n),e>=0&&t>=0&&e<16&&t<48&&(i[t*16+e]=a)};for(let e=0;e<48;e++)u(0,e,a[1]),u(15,e,a[2]),e>=39&&u(8,e,a[3]);for(let e=0;e<48;e+=5){for(let t=0;t<16;t++)u(t,e,t===0?a[1]:a[3],.85);for(let t=0;t<16;t++)e+1<48&&r.getAlpha(t,e+1)>0&&r.set(t,e+1,w(r.get(t,e+1),-.25))}for(let e=0;e<16;e++)u(e,47,a[2]);return J(r,i,{alpha:!0,normalStrength:2,wrap:!1})}function X(e){let n=new b(e),r=new t(32,32),i=new Float32Array(1024).fill(0),a=l.leavesAutumn;for(let e=0;e<70;e++){let e=n.next()*Math.PI*2,t=Math.sqrt(n.next())*14,o=Math.round(16+Math.cos(e)*t),s=Math.round(16+Math.sin(e)*t*.9),c=a[n.int(1,4)],l=a[Math.min(5,n.int(3,5))];r.set(o,s,c),r.set(o+1,s,n.chance(.5)?c:l),n.chance(.6)&&r.set(o,s+1,w(c,-.2)),n.chance(.3)&&r.set(o-1,s,l),i[C(s,0,31)*32+C(o,0,31)]=1}return J(r,i,{alpha:!0,normalStrength:1,wrap:!1})}function he(e){let n=new t(16,16),r=new Float32Array(256),i=[`#141116`,`#221c20`,`#352c2c`,`#4a3f3b`,`#6b5f58`];for(let t=0;t<16;t++)for(let a=0;a<16;a++){let o=x(a,t,e)*.6+x(a>>1,t>>1,e+1)*.4;n.set(a,t,i[C(Math.floor(o*5),0,4)]),r[t*16+a]=o,x(a,t,e+9)>.93&&n.set(a,t,d(`#ff7a2a`,`#5a1208`,x(t,a,e)))}return J(n,r,{normalStrength:1.5})}function Z(e,n=!1){let r=new b(e),i=new t(32,32);i.wrap=!0;let a=new Float32Array(1024),o=[`#3d4053`,`#4f5468`,`#626a7c`,`#767e8d`,`#8e97a3`],s=[`#1c2f25`,`#2e4a31`,`#4b6b3a`,`#6f8d45`,`#93ad55`];for(let t=0;t<32;t++)for(let n=0;n<32;n++){let r=g(n/8,t/8,{octaves:3,seed:e,period:4}),s=(h(n,t)-.5)*.35,c=C((r-.5)*1.35+.55+s*.5,0,.999);i.set(n,t,o[Math.floor(c*o.length)]),a[t*32+n]=.45+r*.3}for(let e=0;e<3;e++){let e=r.int(0,31),t=r.int(0,31),n=r.int(4,8),o=r.chance(.5)?1:-1;for(let s=0;s<n;s++)i.set(e,t,`#2a2b3a`),i.set(e,t+1,`#9aa3ad`),a[(t%32+32)%32*32+(e%32+32)%32]=.15,e+=o,r.chance(.45)&&(t+=r.chance(.5)?1:-1),r.chance(.15)&&(o=-o)}for(let e=0;e<10;e++){let e=r.int(0,31),t=r.int(0,31);i.set(e,t,r.chance(.5)?`#a9a86a`:`#c8b77a`)}if(n){for(let t=0;t<32;t++)for(let n=0;n<32;n++){let r=g(n/8+11.3,t/8+7.1,{octaves:3,seed:e+5,period:4});if(r<.4)continue;let o=C((r-.4)*3.6+(h(n,t)-.5)*.4,0,.999);i.set(n,t,s[Math.min(4,1+Math.floor(o*4))]),a[t*32+n]=.7+o*.25}let t=i.clone();for(let e=0;e<32;e++)for(let n=0;n<32;n++){let r=t.get(n,e);r[1]>r[2]+8||t.get(n,e-1)[1]>t.get(n,e-1)[2]+8&&i.set(n,e,`#2e3b30`)}}return J(i,a,{normalStrength:2.2})}var ge={birch:pe,produce:me,sail:Y,leaf_litter:X,ash:he,boulder:e=>Z(e,!1),boulder_moss:e=>Z(e,!0)};function _e(e){let t=ge;for(let[n,r]of Object.entries(e)){if(Object.hasOwn(t,n)){if(t[n]===r)continue;throw Error(`PropTextureSet: the texture "${n}" is defined twice`)}t[n]=r}}var ve=Object.freeze({finish:J,OUTLINE:q}),ye=class{constructor(e=42){this.seed=e>>>0,this._tex=new Map,this._mats=new Map}textures(e){let t=this._tex.get(e);if(!t){let n=Object.hasOwn(ge,e)?ge[e]:null;if(!n)throw Error(`PropTextureSet: unknown texture "${e}" (the arid trees' are the set-piece kit's: src/engine/world/SetPieceKit.js)`);t=n(this.seed+(e===`boulder_moss`?`boulder`:e).length*7919),this._tex.set(e,t)}return t}material(e,t={}){let n=`${e}|${JSON.stringify(t)}`,r=this._mats.get(n);if(r)return r;let i=this.textures(e);return r=new o({map:i.map,normalMap:i.normal,normalScale:new T(.6,.6),vertexColors:!0,...i.alpha?{alphaTest:.5,side:2}:{},...t}),r.name=`luminati:prop:${e}`,r.userData.units=i.units,r.userData.texture=null,i.alpha&&(r.userData.alpha=!0),this._mats.set(n,r),r}dispose(){for(let e of this._tex.values())e.map.dispose(),e.normal.dispose();for(let e of this._mats.values())e.dispose();this._tex.clear(),this._mats.clear()}},be={front:{n:[0,1],yaw:0},back:{n:[0,-1],yaw:Math.PI},right:{n:[1,0],yaw:Math.PI/2},left:{n:[-1,0],yaw:-Math.PI/2}},xe={front:`right`,back:`left`,left:`front`,right:`back`},Se=[[.62,.78,1],[.7,.95,.65],[1,.72,.62],[1,1,1]],Ce=new Set([`adobe`,`whitewash`]),we=new Set([`sandstone_brick`,`charred_wall`]),Te=[.3,.26,.25],Ee=[.46,.4,.38],De=[.07,.055,.05];function Q(e,t,n,r,i={}){let o={width:4,depth:3,stories:1,roof:`roof_red`,wall:`timber_frame`,rotation:0,chimney:!0,door:`front`,...i},s=e.textures,c=e.rng(`house`,t,r,o.seed),l=Number.isFinite(o.ruin)?C(Math.round(o.ruin),0,2):0,u=Number.isFinite(o.burning)?C(o.burning,0,1):0,d=o.flatRoof===!0,f=l>0||u>0,p=f||d?e.rng(`house:siege`,t,r,o.seed):null,m=f||d?ne(`a damaged, burning or flat-roofed house`):null,h=!!o.gableFront,g=h?o.depth:o.width,_=h?o.width:o.depth,v=C(Math.round(o.stories),1,2),y=o.plinthHeight??.5,b=o.storyHeight??3,x=v>1?o.upperHeight??2:0,w=v>1?o.jetty??(d||l===2?0:.25):0,T=o.wall,E=o.upperWall??T,te=o.plinth??(T===`charred_wall`?`charred_wall`:Ce.has(T)||we.has(T)?`sandstone_brick`:`stone_brick`),D=y+b+x,O=g/2,k=_/2,A=k+w,j=(o.pitch??c.range(38,45))*S,N=o.overhang??.35,P=A*Math.tan(j),F=o.roofThickness??.22,I=.1,L=e.builder((e,t)=>{let n=.62+.38*ee(-.05,1.1,t);return t>y&&t<D+.01&&(n*=1-.2*ee(D-.9,D,t)),n});h&&L.matrix.makeRotationY(-Math.PI/2);let se=e.windowMaterial(),R=e.glassMaterial(),z=[],ce=[],B=[{material:se,day:0,night:1.6}],V={},H=f?m.siegeDecalMaterial(e):null,U=u>0?m.fireWindowMaterial(e):null;U&&B.push({material:U,...m.FIRE_WINDOW_GLOW});let le=u>0?new m.FlameSet:null,W=[],ue=s.meta(te).units[0];L.box(te,[g+2*I,y,_+2*I],{at:[0,y/2,0],faces:{...ie(g+2*I,_+2*I,ue),ny:!1},cutsT:[y*.5]});let G=null,K=y+b;if(l===2)G=m.brokenWalls(L,s,p,{W:g,D:_,P:y,H1:b,E:D,wall:T,upperWall:E,stories:v,door:Oe(o,h)});else{let e=s.meta(T).units[0];if(L.box(T,[g,b,_],{at:[0,y+b/2,0],faces:{...ie(g,_,e),py:!1,ny:!1},cutsT:[.5,b-.9]}),ke(L,s,T,g,_,y,b,c,{top:v===1&&!d,bottom:!0}),v>1){let e=s.meta(E).units[0];L.box(E,[g,x,_+2*w],{at:[0,K+x/2,0],faces:{...ie(g,_+2*w,e),py:!1,ny:!1},cutsT:[x-.9]}),L.box(M,[g+.14,.24,_+2*w+.14],{at:[0,K+.04,0]});let t=Math.max(2,Math.round(g/.55));for(let e=0;e<t;e++){let n=-O+.25+e*(g-.5)/(t-1);for(let e of[-1,1])L.box(M,[.13,.13,w+.08],{at:[n,K-.13,e*(k+w/2)],faces:{nz:!(e>0),pz:!(e<0)}})}ke(L,s,E,g,_+2*w,K+.16,x-.16,c,{top:!d,bottom:!1})}}let de=o.gable??(E===`brick`||E===`stone_brick`?`wood_planks`:E),fe=v>1?K:y;if(!d){let e=s.meta(de).units,t=de===`wood_planks`||de===`wood_planks_dark`,n=ae(2*A,e[0]);for(let e of[1,-1]){if(G&&e===G.collapseEnd)continue;let r=e*O,i=e>0?[[r,D,A],[r,D,-A],[r,D+P+.02,0]]:[[r,D,-A],[r,D,A],[r,D+P+.02,0]],a=e>0?[0,0,-1]:[0,0,1],o=f?{color:l?Ee:[.8,.74,.72]}:{};L.poly(de,i,t?{uAxis:[0,1,0],vAxis:a,origin:[r,fe,e*A],off:[0,n],...o}:{uAxis:a,vAxis:[0,1,0],origin:[r,fe,e*A],off:[n,0],...o}),l&&L.poly(M,[i[1],i[0],i[2]].map(t=>[t[0]-e*.03,t[1],t[2]]),{uAxis:a,vAxis:[0,1,0],color:Te}),L.box(M,[.1,.16,2*A+.1],{at:[r+e*.05,D+.02,0]}),t||L.box(M,[.1,P*.8,.16],{at:[r+e*.04,D+P*.4,0],rotUV:!0})}}let q=o.roof,J=D+P,pe=Math.cos(j),me=Math.sin(j),Y=J+F/pe,X=[];if(d)m.flatRoofGeom(L,s,p,{W:g,D:_,E:D,wall:T,ruin:l,stories:v,chimney:o.chimney,anchors:V,roofFires:X,decal:H});else if(l>0)m.ruinedRoof(L,s,p,{W:g,hw:O,hs:A,E:D,R:P,O:N,Ts:F,pitch:j,roof:q,ruin:l,collapseEnd:G?.collapseEnd??0,roofFires:X});else{let e=s.meta(q).units[0],t=Math.tan(j),n=g+2*N,r=(A+N)/pe+F*t,i=((A+N)/pe-F*t)/2;for(let t of[1,-1]){let a=[0,J-me*i+pe*F/2,t*(pe*i+me*F/2)];L.push(a,t>0?[j,0,0]:[j,Math.PI,0,`YXZ`]),L.box(q,[n,F,r],{faces:{py:{off:[ae(n,e),0]},ny:{mat:M,color:[.8,.78,.8]},pz:{mat:M},nz:!1,px:{mat:M},nx:{mat:M}}}),L.box(M,[n+.1,F+.16,.09],{at:[0,-.06,r/2+.03],faces:{nz:!1}});for(let e of[-1,1])L.box(M,[.09,F+.16,r+.02],{at:[e*(n/2+.035),-.06,.005],faces:{nz:!1}});L.pop()}if(L.box(o.ridge??q,[n+.14,.3,.3],{at:[0,Y-.05,0],rot:[Math.PI/4,0,0],faces:{px:M,nx:M},color:[.82,.8,.82]}),o.curl===!0){let e=Number.isFinite(o.curlSize)?o.curlSize:1.8,t=J-(A+N)*Math.tan(j)+F*.5,r=A+N,i=n/2,a=o.ridge??q,s=e=>()=>[e,e*.97,e*.95];for(let o of[-1,1]){for(let n of[-1,1]){let c=(a,s,c)=>[o*(i+a*e),t+s*e,n*(r+c*e)],l=[c(-.4,0,-.35),c(.05,.08,.02),c(.32,.3,.22),c(.45,.68,.32),c(.36,1.05,.26)],u=[.2,.17,.13,.08,.025].map(t=>t*e);for(let e=0;e<4;e++)L.tube(a,l[e],l[e+1],u[e],u[e+1],{segments:6,rings:2,colorFn:s(.78+e*.06)})}let c=(t,r)=>[o*(n/2+t*e),Y+r*e,0],l=[c(-.35,0),c(.05,.12),c(.25,.45),c(.12,.78),c(-.15,.85),c(-.3,.7)],u=[.22,.2,.16,.12,.08,.04].map(t=>t*e);for(let e=0;e<5;e++)L.tube(a,l[e],l[e+1],u[e],u[e+1],{segments:6,rings:2,colorFn:s(.82+e*.04)})}L.box(M,[.16*e,.35*e,.16*e],{at:[0,Y+.12*e,0],color:[.9,.7,.4]}),L.box(M,[.42*e,.42*e,.12],{at:[0,Y+.5*e,0],rot:[0,0,Math.PI/4],color:[1.4,1.1,.5]})}if(u>0){let e=1+Math.round(u*2.5);for(let t=0;t<e;t++)X.push({x:(t-(e-1)/2)*(g/Math.max(1,e))+p.range(-.3,.3),y:J-.25,z:p.range(-.3,.3),size:1})}}if(o.chimney&&!d){let e=(o.chimneySide??(c.chance(.5)?1:-1))*Math.max(.2,O-.8),t=c.chance(.6)?-A*.42:A*.3,n=l===2?D+P*.45:Y+.75,r=D-.2,i=.74,a=s.meta(`chimney_stone`).units;G&&Math.sign(e)===G.collapseEnd||(L.box(`chimney_stone`,[i,n-r,i],{at:[e,(n+r)/2,t],faces:{...ie(i,i,a[0],{vOff:r-D}),ny:!1,py:!1},color:f?Ee:void 0}),l<2?(L.box(te,[.94,.16,.94],{at:[e,n+.08,t]}),L.box(`chimney_stone`,[.64,.12,.64],{at:[e,n+.2,t],faces:{py:!1}}),L.box(`chimney_stone`,[.48,.02,.48],{at:[e,n+.255,t],faces:{ny:!1},color:[.1,.08,.08]})):L.box(`chimney_stone`,[.58,.02,.58],{at:[e,n+.005,t],faces:{ny:!1},color:[.1,.08,.08]}),f||(V.smoke=L.point(e,n+.45,t)))}let he=(e,t)=>{let n=be[e],r=e===`front`||e===`back`,i=t?k+w:k;return{L:r?g:t?_+2*w:_,cx:n.n[0]*O,cz:n.n[1]*i,yaw:n.yaw,long:r}},Z=e=>L.push([e.cx,0,e.cz],e.yaw),ge=o.door===`none`||o.door===!1?null:o.door||`front`,_e=ge?h?a(xe,ge):ge:null,ve=o.shutters??c.chance(.6),ye=Se[c.int(0,Se.length-1)],De=o.flowerboxes??!f,Q=0,Fe=()=>U??(l?null:se),Ie=(e,t,n,r)=>!G||G.minTop(e,t,n)>=r;for(let e of[`front`,`back`,`right`,`left`]){let t=he(e,!1);Z(t);let n=e===_e;if(n){let e=t.L/2-1.15,n=t.L>=4&&(t.L<5.5||c.chance(.5));Q=o.doorOffset??(n?c.chance(.5)?-e:e:0)}if(n&&Ie(e,Q-.75,Q+.75,y+2.3)){je(L,s,Q,y,I,te,c,o,f),W.push({side:e,upper:!1,x:Q,y,w:1,h:2.1,door:!0}),V.door=L.point(Q,0,1),V.leafA=L.point(Q-.5,y+1,.02),V.leafB=L.point(Q+.5,y+1,.02);let n=t.L/2-(Q+.7)>=Q-.7+t.L/2?1:-1,r=Q+n*.98;if((o.lantern??!f)&&Math.abs(r)<t.L/2-.15){let e=y+1.95;L.box(`metal`,[.05,.05,.46],{at:[r,e+.36,.23]}),L.box(`metal`,[.04,.04,.32],{at:[r,e+.25,.12],rot:[-.75,0,0]}),L.box(`metal`,[.1,.14,.03],{at:[r,e+.3,.015]}),re(L,R,r,e,.44,{w:.22,h:.28}),B.push({material:R,day:0,night:2.4}),V.lantern=L.point(r,e,.6)}if(o.sign){let e=Q-n*1;Math.abs(e)<t.L/2+.2&&(L.push([e,0,0],-n*Math.PI/4),Ne(L,s,0,y+2.35),L.pop())}}let r=y+1,i=Ae(t.L,n?Q:null,t.long);for(let a of i){if(!n&&!t.long&&c.chance(.25))continue;let i=De&&(e===`front`||c.chance(.3))&&c.chance(.75),o=Math.min(t.L/2-Math.abs(a),n?Math.abs(a-Q)-.75:9),s=c.range(0,1);Ie(e,a-.7,a+.7,r+1.15)&&(Me(L,Fe(),a,r,{shutters:ve&&o>1.12,shutterTint:ye,flowerbox:i,uShift:s,ruin:l,sr:p}),W.push({side:e,upper:!1,x:a,y:r,w:1,h:1}))}if(L.pop(),v>1){let t=he(e,!0);Z(t);let n=Ae(t.L,null,t.long);for(let r of n){if(!t.long&&c.chance(.3))continue;let n=t.L/2-Math.abs(r),i=De&&e===`front`&&c.chance(.5),a=c.range(0,1);Ie(e,r-.7,r+.7,K+1.65)&&(Me(L,Fe(),r,K+.5,{shutters:ve&&n>1.12,shutterTint:ye,flowerbox:i,uShift:a,ruin:l,sr:p}),W.push({side:e,upper:!0,x:r,y:K+.5,w:1,h:1}))}d&&e===`front`&&!f&&p.chance(.75)&&m.balconyGeom(L,p,t.L,K),L.pop()}}if(o.woodpile??c.chance(.55)){let e=c.chance(.5)?`right`:`left`,t=he(e,!1);Z(t),Ie(e,-t.L/2,t.L/2,y+1.5)&&Pe(L,c.range(-.4,.4)*(t.L-2),.38,f?Te:null),L.pop()}if(f&&m.siegeDetails(L,s,p,{W:g,D:_,P:y,E:D,hw:O,hd:k,J:w,stories:v,ruin:l,burning:u,flat:d,gableR:P,broken:G,decal:H,openings:W,faceInfo:he,pushFace:Z,wall:T}),le){m.burnFlames(L,p,le,{burning:u,ruin:l,flat:d,openings:W,faceInfo:he,pushFace:Z,roofFires:X,P:y,E:D,W:g,D:_,broken:G});let e=X.length?X.reduce((e,t)=>e+t.x,0)/X.length:0,t=X.length?X.reduce((e,t)=>e+t.z,0)/X.length:0,n=d?D+.6:l===2?D+.5:Y;V.fireSmoke=L.point(e,n+1.4,t),V.fireLight=L.point(e*.5,Math.max(D+.6,n-.6),t*.5+(h?0:k*.3))}let Le=e.finish(L,`house`,t,n,r,o.rotation);if(le){let t=le.build(e);t&&(Le.add(t),Le.updateMatrixWorld(!0))}let $=t=>e.world(Le,t);V.lantern&&z.push({position:$(V.lantern),color:16757867,intensity:6,distance:7,flicker:.25,nightOnly:!0}),o.windowLights&&V.door&&z.push({position:$(V.door).setY(n+1.6),color:16754266,intensity:3,distance:6,flicker:.1,nightOnly:!0}),V.smoke&&ce.push({preset:`smoke`,position:$(V.smoke),rate:3}),V.fireLight&&(z.push({position:$(V.fireLight),color:16742958,intensity:8+12*u,distance:9+5*u,flicker:.65,nightOnly:!1,fire:!0}),ce.push({preset:`smokeDark`,position:$(V.fireSmoke),rate:1.2+2.4*u}));let Re=e.result(Le,{colliders:h?e.boxColliders(Le,-k-I,k+I,-O-I,O+I):e.boxColliders(Le,-O-I,O+I,-k-I,k+I),lights:z,emissives:B,emitters:ce});return V.door&&(Re.interact={position:$(V.door),radius:1.1,id:o.id??`house`,lookSpan:{a:$(V.leafA),b:$(V.leafB)}}),o.icicles===!0&&!d&&!l&&(Re.update=oe(`icicles`).houseIcicles(e,Le,{W:g,hs:A,O:N,Ts:F,pitch:j,ridgeY:J,gf:h,x:t,z:r,seed:o.seed})),Re}function Oe(e,t){let n=e.door===`none`||e.door===!1?null:e.door||`front`;return n?t?a(xe,n):n:null}function ke(e,t,n,r,i,a,o,s,{top:c=!0,bottom:l=!0}={}){let u=r/2,d=i/2;if(n===`timber_frame`||n===`plaster`){for(let t of[-1,1])for(let n of[-1,1])e.box(M,[.2,o,.2],{at:[t*(u-.06),a+o/2,n*(d-.06)],rotUV:!0,faces:{py:!1,ny:!1}});l&&e.box(M,[r+.08,.16,i+.08],{at:[0,a+.08,0],faces:{ny:!1}})}else if(n===`brick`){let t=Math.floor(o/.5);for(let n=0;n<t;n++){let t=n%2==0;for(let r of[-1,1])for(let i of[-1,1]){let o=t?.62:.34,c=t?.34:.62;e.box(`stone_brick`,[o,.46,c],{at:[r*(u-o/2+.04),a+n*.5+.25,i*(d-c/2+.04)],faces:{ny:!1},off:[s.range(0,1),0]})}}l&&e.box(`stone_brick`,[r+.1,.18,i+.1],{at:[0,a+.09,0],faces:{ny:!1}})}else if(n===`log_wall`){let t=Math.round(o/.5);for(let n=0;n<t;n++){let t=a+n*.5+.25,r=n%2==0;for(let n of[-1,1])for(let i of[-1,1]){let a=n*(u-.05),o=i*(d-.05);r?e.tube(`bark`,[a-n*.12,t,o],[a+n*.32,t,o],.2,.19,{segments:6,capTop:`wood_planks`,twist:.3}):e.tube(`bark`,[a,t,o-i*.12],[a,t,o+i*.32],.2,.19,{segments:6,capTop:`wood_planks`,twist:.3})}}}else if(Ce.has(n)){for(let t of[-1,1])for(let r of[-1,1])e.box(n,[.34,o,.34],{at:[t*(u-.1),a+o/2,r*(d-.1)],faces:{ny:!1,py:!1},off:[t*.3,0]}),e.box(n,[.42,.5,.42],{at:[t*(u-.12),a+.25,r*(d-.12)],faces:{ny:!1},color:[.82,.78,.74]});l&&e.box(n,[r+.04,.42,i+.04],{at:[0,a+.21,0],faces:{ny:!1,py:!1},color:[.8,.76,.72]})}else if(we.has(n)){let t=Math.floor(o/.5);for(let r=0;r<t;r++){let t=r%2==0;for(let i of[-1,1])for(let o of[-1,1]){let c=t?.66:.36,l=t?.36:.66;e.box(n,[c,.46,l],{at:[i*(u-c/2+.04),a+r*.5+.25,o*(d-l/2+.04)],faces:{ny:!1},off:[s.range(0,1),0],color:[1.06,1.04,1.02]})}}}c&&e.box(M,[r+.12,.2,i+.12],{at:[0,a+o-.1,0],faces:{py:!1}})}function Ae(e,t,n){let r=-e/2+.85,i=e/2-.85,a=[];t==null?a.push([r,i]):(t-1.38>=r&&a.push([r,t-1.38]),t+1.38<=i&&a.push([t+1.38,i]));let o=[];for(let[e,t]of a){let r=t-e;if(r<0)continue;let i=Math.floor(r/(n?1.9:2.4))+1;if(n||(i=Math.min(i,1)),i===1)o.push((e+t)/2);else for(let t=0;t<i;t++)o.push(e+t*r/(i-1))}return o}function je(e,t,n,r,i,a,o,s,c=!1){e.quad(`door`,[[n-.5,r,.02],[n+.5,r,.02],[n+.5,r+2,.02],[n-.5,r+2,.02]],[[0,0],[1,0],[1,1],[0,1]],c?{color:Ee}:{});for(let t of[-1,1])e.box(M,[.15,2.16,.18],{at:[n+t*.575,r+1.08,.07],rotUV:!0});if(e.box(M,[1.46,.2,.22],{at:[n,r+2.1,.09]}),e.box(M,[1.2,.05,.16],{at:[n,r+.02,.08],faces:{ny:!1}}),e.box(a,[1.5,.25,.5],{at:[n,.125,i+.25],faces:{ny:!1},off:[.3,0]}),s.doorHood??o.chance(.55)){let t=r+2.45;e.box(s.roof,[1.8,.1,.78],{at:[n,t,.36],rot:[.32,0,0],faces:{ny:M,px:M,nx:M,pz:M}});for(let r of[-1,1])e.box(M,[.08,.08,.62],{at:[n+r*.7,t-.26,.26],rot:[-.7,0,0]})}}function Me(e,t,n,r,{shutters:i,shutterTint:a,flowerbox:o,uShift:s=0,ruin:c=0,sr:l=null}){t?e.quad(t,[[n-.5,r,.02],[n+.5,r,.02],[n+.5,r+1,.02],[n-.5,r+1,.02]],[[0,0],[1,0],[1,1],[0,1]]):(e.quad(M,[[n-.5,r,0],[n+.5,r,0],[n+.5,r+1,0],[n-.5,r+1,0]],[[0,0],[1,0],[1,1],[0,1]],{color:De}),e.tri(`window`,[n-.5,r+1,.02],[n-.5,r+.55,.02],[n-.22,r+1,.02],[0,1],[0,.55],[.28,1],{color:[.5,.5,.55]}),e.tri(`window`,[n+.5,r,.02],[n+.5,r+.32,.02],[n+.18,r,.02],[1,0],[1,.32],[.68,0],{color:[.5,.5,.55]})),e.box(M,[1.16,.08,.1],{at:[n,r+1,.05]});for(let t of[-1,1])e.box(M,[.08,1.02,.1],{at:[n+t*.54,r+.5,.05],rotUV:!0});if(e.box(M,[1.36,.09,.24],{at:[n,r-.045,.11]}),e.box(M,[1.3,.13,.15],{at:[n,r+1.1,.07]}),i)for(let t of[-1,1]){if(c&&l){if(l.chance(.45))continue;if(l.chance(.6)){e.push([n+t*.83,r+.95,.06],[.08,t*.35,t*(.35+l.range(0,.4))]),e.box(`wood_planks`,[.46,1.04,.05],{at:[0,-.5,0],rotUV:!0,color:a.map(e=>e*.55)}),e.pop();continue}}e.box(`wood_planks`,[.46,1.04,.05],{at:[n+t*.83,r+.5,.035],rotUV:!0,color:c?a.map(e=>e*.55):a}),e.box(M,[.4,.06,.02],{at:[n+t*.83,r+.8,.07]}),e.box(M,[.4,.06,.02],{at:[n+t*.83,r+.2,.07]})}o&&j(e,n,r-.09-7/16,.36,1.1,.26,s)}function Ne(e,t,n,r){e.box(`metal`,[.05,.05,1.05],{at:[n,r,.52]}),e.box(`metal`,[.04,.04,.6],{at:[n,r-.2,.25],rot:[.62,0,0]});for(let t of[.3,.9])e.box(`metal`,[.02,.14,.02],{at:[n,r-.08,t]});let i=.52;e.box(`sign_board`,[.06,i,.95],{at:[n,r-.15-i/2,.6],faces:{px:{off:[1.05/2,.48/2]},nx:{off:[1.05/2,.48/2]},py:M,ny:M,pz:M,nz:M}})}function Pe(e,t,n,r=null){for(let[i,a]of[[4,0],[3,.5],[2,1]])for(let o=0;o<i;o++){let s=t+(o-(i-1)/2)*.36,c=.17+a*.62;e.tube(M,[s,c,n+.3],[s,c,n-.25],.17,.17,{segments:6,capTop:`wood_planks`,capBottom:`wood_planks`,twist:o*.7+a,uRepeat:1,...r?{color:r}:{}})}e.box(M,[1.6,.08,.7],{at:[t,.04,n+.02]})}export{De as a,ve as c,fe as d,P as f,Ee as i,_e as l,Te as n,Q as o,be as r,ye as s,we as t,N as u};