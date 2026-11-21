const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./SeasonLook-Drig6J26.js","./LevelStorage-JaoBFERB.js","./GlobalUniforms-BMXj3q_v.js","./minimap-DzJZopcE.js","./ThawField-DUWC1gaN.js","./ThawKit-Cq6Ya5Q1.js","./ThawFx-Bep2d0QK.js"])))=>i.map(i=>d[i]);
import{$ as e,$a as t,$n as n,Br as r,Ci as i,Cr as a,Fi as o,Gi as s,Gr as c,Ia as l,Ii as u,Ja as d,Jr as f,Mi as p,Or as m,Pi as h,Qr as g,Ra as _,Ri as v,Si as y,Sr as b,Ti as x,Tr as S,Ua as C,Un as w,Vr as T,Wa as E,Wi as ee,Xr as D,Yn as O,Yr as te,Zn as k,Zr as A,_r as j,ao as M,bi as N,br as P,cr as F,dr as I,ei as L,fi as R,gt as z,hr as ne,io as B,ir as re,ji as ie,kr as ae,lr as oe,nr as se,or as V,pi as ce,pr as H,qr as le,ri as ue,ro as U,so as de,sr as fe,tr as pe,wa as me,xi as W,xo as he,za as ge,zr as _e}from"./LevelStorage-JaoBFERB.js";import{_ as ve,h as ye,p as be,v as xe}from"./Trees-BixY43Hv.js";import{t as G}from"./GlobalUniforms-BMXj3q_v.js";import{u as Se}from"./SetPieceKit-DP35AB17.js";import{F as Ce,I as we,L as Te,M as Ee,N as De,O as Oe,P as ke,R as Ae,f as je}from"./minimap-DzJZopcE.js";import{n as Me,r as Ne,t as Pe}from"./Water-DvTZ_5MJ.js";import{t as Fe}from"./Props-DuFIOkLn.js";import{o as Ie}from"./SeasonKit-DYltrdP6.js";import{i as Le,o as Re}from"./SkyKit-C76C5Dp1.js";var ze=Object.freeze({up:[`KeyW`,`ArrowUp`],down:[`KeyS`,`ArrowDown`],left:[`KeyA`,`ArrowLeft`],right:[`KeyD`,`ArrowRight`],run:[`ShiftLeft`,`ShiftRight`],confirm:[`Space`,`Enter`,`KeyF`],choose:[`Enter`,`KeyF`],cancel:[`Escape`,`Backspace`],camLeft:[`KeyQ`],camRight:[`KeyE`],zoomIn:[`KeyZ`,`Equal`],zoomOut:[`KeyX`,`Minus`],debug:[`Backquote`,`F1`],time:[`KeyT`],photo:[`KeyP`],help:[`KeyH`],weather:[`KeyR`],music:[`KeyM`],map:[`KeyN`,`Tab`]}),Be=e=>Object.fromEntries(Object.entries(e).map(([e,t])=>[e,[...t]]));function Ve(e){if(!e||e.nodeType!==1)return!1;if(e.isContentEditable)return!0;let t=e.tagName;if(t===`TEXTAREA`||t===`SELECT`)return!0;if(t===`INPUT`){let t=(e.type||`text`).toLowerCase();return![`button`,`checkbox`,`radio`,`submit`,`reset`,`image`,`color`,`file`,`range`].includes(t)}return!1}var He=class{constructor(e=window,t={}){this.target=e,this.enabled=!0,this.bindings=Be(ze),this.wheelIgnoreSelector=t.wheelIgnoreSelector??`.lil-gui, input, textarea, select, [contenteditable], [data-input-ignore]`,this.wheelDelta=0,this.pointer={x:0,y:0,down:!1,buttons:0,inside:!1},this._down=new Set,this._pressed=new Set,this._released=new Set,this._move={x:0,y:0},this._boundCodes=new Set,this._boundCacheKey=``,this.lastDevice=`keyboard`,this._mouseTarget=null,this._mouseDown=new Set,this._onKeyDown=this._onKeyDown.bind(this),this._onKeyUp=this._onKeyUp.bind(this),this._onBlur=this._onBlur.bind(this),this._onVisibility=this._onVisibility.bind(this),this._onWheel=this._onWheel.bind(this),this._onPointerMove=this._onPointerMove.bind(this),this._onPointerDown=this._onPointerDown.bind(this),this._onPointerUp=this._onPointerUp.bind(this),this._onPointerLeave=this._onPointerLeave.bind(this);let n=e;n.addEventListener(`keydown`,this._onKeyDown),n.addEventListener(`keyup`,this._onKeyUp),n.addEventListener(`wheel`,this._onWheel,{passive:!0}),n.addEventListener(`pointermove`,this._onPointerMove,{passive:!0}),n.addEventListener(`pointerdown`,this._onPointerDown,{passive:!0}),n.addEventListener(`pointerup`,this._onPointerUp,{passive:!0}),n.addEventListener(`pointercancel`,this._onPointerUp,{passive:!0}),typeof window<`u`&&(window.addEventListener(`blur`,this._onBlur),document.addEventListener(`visibilitychange`,this._onVisibility),document.documentElement.addEventListener(`pointerleave`,this._onPointerLeave))}isDown(e){return this.enabled&&this._down.has(e)}wasPressed(e){return this.enabled&&this._pressed.has(e)}wasReleased(e){return this.enabled&&this._released.has(e)}anyPressed(){return this.enabled&&this._pressed.size>0}action(e){return this.enabled?this._anyOf(this.bindings[e],this._down):!1}actionPressed(e){return this.enabled?this._anyOf(this.bindings[e],this._pressed):!1}actionReleased(e){return this.enabled?this._anyOf(this.bindings[e],this._released):!1}consumeAction(e){let t=this.actionPressed(e);if(t){let t=this.bindings[e];if(t)for(let e=0;e<t.length;e++)this._pressed.delete(t[e])}return t}_anyOf(e,t){if(!e)return!1;for(let n=0;n<e.length;n++)if(t.has(e[n]))return!0;return!1}getMoveVector(e=this._move){if(e.x=0,e.y=0,!this.enabled)return e;let t=+!!this.action(`right`)-!!this.action(`left`),n=+!!this.action(`up`)-!!this.action(`down`);if(t!==0&&n!==0){t*=Math.SQRT1_2,n*=Math.SQRT1_2;let e=Math.hypot(t,n);e>1&&(t/=e,n/=e)}return e.x=t,e.y=n,e}addBindings(e={}){for(let[t,n]of Object.entries(e??{}))this.bindings[t]=[...n??[]];this._boundCacheKey=``}enableMouseButtons(e){e&&typeof window<`u`&&(this._mouseTarget&&this._disableMouseButtons(),this._mouseTarget=e,this._onMouseDown??=this._mouseDownEdge.bind(this),this._onMouseMove??=this._mouseChord.bind(this),this._onMouseUp??=this._mouseUpEdge.bind(this),this._onContextMenu??=e=>e.preventDefault(),this._onAuxDown??=e=>{e.button===1&&e.preventDefault()},window.addEventListener(`pointerdown`,this._onMouseDown,{capture:!0,passive:!0}),window.addEventListener(`pointermove`,this._onMouseMove,{capture:!0,passive:!0}),window.addEventListener(`pointerup`,this._onMouseUp,{capture:!0,passive:!0}),window.addEventListener(`pointercancel`,this._onMouseUp,{capture:!0,passive:!0}),e.addEventListener(`contextmenu`,this._onContextMenu),e.addEventListener(`mousedown`,this._onAuxDown))}saveBindings(){return{keyboard:Be(this.bindings)}}restoreBindings(e){this.bindings=Be(e.keyboard),this._boundCacheKey=``}disableMouseButtons(){this._disableMouseButtons()}_disableMouseButtons(){let e=this._mouseTarget;if(e){window.removeEventListener(`pointerdown`,this._onMouseDown,{capture:!0}),window.removeEventListener(`pointermove`,this._onMouseMove,{capture:!0}),window.removeEventListener(`pointerup`,this._onMouseUp,{capture:!0}),window.removeEventListener(`pointercancel`,this._onMouseUp,{capture:!0}),e.removeEventListener(`contextmenu`,this._onContextMenu),e.removeEventListener(`mousedown`,this._onAuxDown);for(let e of this._mouseDown)this._releaseCode(e);this._mouseDown.clear(),this._mouseTarget=null}}_mouseDownEdge(e){e.target===this._mouseTarget&&this._pressMouse(e.button)}_mouseChord(e){let t=e.button;if(!(t>=0&&t<=2))return;let n=t===1?4:t===2?2:1;e.buttons&n?e.target===this._mouseTarget&&this._pressMouse(t):this._releaseCode(`Mouse${t}`)}_mouseUpEdge(e){let t=e.button;if(t>=0&&t<=2&&this._releaseCode(`Mouse${t}`),this._mouseDown.size&&typeof e.buttons==`number`)for(let t of this._mouseDown){let n=+t.charAt(5),r=n===1?4:n===2?2:1;e.buttons&r||this._releaseCode(t)}}_pressMouse(e){if(!(e>=0&&e<=2))return;let t=`Mouse${e}`;this._down.has(t)||(this._down.add(t),this._mouseDown.add(t),this._pressed.add(t),this.lastDevice=`mouse`)}_releaseCode(e){this._mouseDown.delete(e),this._down.delete(e)&&this._released.add(e)}endFrame(){this._pressed.size&&this._pressed.clear(),this._released.size&&this._released.clear(),this.wheelDelta=0}reset(){for(let e of this._down)this._released.add(e);this._down.clear(),this._mouseDown.clear(),this.pointer.down=!1,this.pointer.buttons=0,this.wheelDelta=0}dispose(){let e=this.target;e.removeEventListener(`keydown`,this._onKeyDown),e.removeEventListener(`keyup`,this._onKeyUp),e.removeEventListener(`wheel`,this._onWheel),e.removeEventListener(`pointermove`,this._onPointerMove),e.removeEventListener(`pointerdown`,this._onPointerDown),e.removeEventListener(`pointerup`,this._onPointerUp),e.removeEventListener(`pointercancel`,this._onPointerUp),typeof window<`u`&&(window.removeEventListener(`blur`,this._onBlur),document.removeEventListener(`visibilitychange`,this._onVisibility),document.documentElement.removeEventListener(`pointerleave`,this._onPointerLeave),this._disableMouseButtons()),this._down.clear(),this._mouseDown.clear(),this._pressed.clear(),this._released.clear()}_isBound(e){let t=``;for(let e in this.bindings)t+=e+`:`+this.bindings[e].join(`,`)+`;`;if(t!==this._boundCacheKey){this._boundCacheKey=t,this._boundCodes.clear();for(let e in this.bindings)for(let t of this.bindings[e])this._boundCodes.add(t)}return this._boundCodes.has(e)}_onKeyDown(e){let t=e.code;t&&(Ve(e.target)||Ve(typeof document<`u`?document.activeElement:null)||(!e.ctrlKey&&!e.metaKey&&!e.altKey&&this._isBound(t)&&e.preventDefault(),this._down.has(t)||(this._down.add(t),e.repeat||(this._pressed.add(t),this.lastDevice=`keyboard`))))}_onKeyUp(e){let t=e.code;t&&(this._down.has(t)&&(this._down.delete(t),this._released.add(t)),!Ve(e.target)&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&this._isBound(t)&&e.preventDefault())}_onBlur(){this.reset()}_onVisibility(){document.visibilityState===`hidden`&&this.reset()}_onWheel(e){if(!this.enabled)return;let t=e.target;if(t&&t.closest&&this.wheelIgnoreSelector&&t.closest(this.wheelIgnoreSelector))return;let n=e.deltaY;e.deltaMode===1?n*=16:e.deltaMode===2&&(n*=400),this.wheelDelta+=n}_onPointerMove(e){this.pointer.x=e.clientX,this.pointer.y=e.clientY,this.pointer.inside=!0}_onPointerDown(e){this.pointer.x=e.clientX,this.pointer.y=e.clientY,this.pointer.down=!0,this.pointer.buttons=e.buttons,this.pointer.inside=!0}_onPointerUp(e){this.pointer.x=e.clientX,this.pointer.y=e.clientY,this.pointer.buttons=e.buttons??0,this.pointer.down=this.pointer.buttons!==0}_onPointerLeave(){this.pointer.inside=!1}},Ue=1/20,We=class{constructor(e={}){this.opts=e,this.container=e.container??document.body,this.maxPixelRatio=e.maxPixelRatio??1.5,this._renderScale=V(e.renderScale??1,.25,1);let t=new xe({antialias:!1,powerPreference:`high-performance`,stencil:!1,preserveDrawingBuffer:!!e.preserveDrawingBuffer});t.shadowMap.enabled=!0;let n=e.shadowMapType??1;n===2&&(n=1),t.shadowMap.type=n,t.toneMapping=4,t.toneMappingExposure=1,t.outputColorSpace=l,t.setClearColor(e.clearColor??724506,1),this.renderer=t;let r=t.domElement;r.classList.add(`luminati-canvas`),r.style.display=`block`,r.style.width=`100%`,r.style.height=`100%`,r.style.touchAction=`none`,r.style.outline=`none`,this._isFullWindow()&&(r.style.position=`fixed`,r.style.left=`0`,r.style.top=`0`),r.tabIndex=-1,this.container.appendChild(r),this.scene=new _,this.camera=new p(28,1,.5,400),this.camera.position.set(0,12.7,20.4),this.camera.lookAt(0,0,0),this.input=new He(e.inputTarget??window),this.events=new pe,this.time={elapsed:0,delta:0,frame:0,timeScale:1,realDelta:0,realElapsed:0,fps:60},this._systems=[],this._seq=0,this._renderFn=null,this._failed=new WeakMap,this._running=!1,this._manual=!!(e.manualStep??(Ge(`fixedstep`)&&(Ge(`autostart`)||Ge(`debug`)))),this._startedOnce=!1,this._lastNow=-1,this._disposed=!1,this._width=1,this._height=1,this._pixelRatio=1,this.resizeThrottleMs=0,this._lastResizeAt=-1/0,this._resizeTimer=0,this._tick=this._tick.bind(this),this._onWindowResize=()=>this._resize(),this._onContextLost=e=>{e.preventDefault(),console.warn(`[Engine] WebGL context lost`),this.events.emit(`contextlost`)},this._onContextRestored=()=>{console.warn(`[Engine] WebGL context restored`),this.events.emit(`contextrestored`)},r.addEventListener(`webglcontextlost`,this._onContextLost),r.addEventListener(`webglcontextrestored`,this._onContextRestored),this._resizeObserver=null,typeof ResizeObserver<`u`&&!this._isFullWindow()&&(this._resizeObserver=new ResizeObserver(()=>this._resize()),this._resizeObserver.observe(this.container)),window.addEventListener(`resize`,this._onWindowResize),this._resize(!0);let i=e.exposeGlobal;if(i===void 0)try{let e=new URLSearchParams(window.location.search);i=e.has(`debug`)||e.has(`autostart`)}catch{i=!1}i&&(window.__engine=this)}get width(){return this._width}get height(){return this._height}get pixelRatio(){return this._pixelRatio}get aspect(){return this._width/Math.max(1,this._height)}get drawingBufferSize(){return this._dbs??=new U,this.renderer.getDrawingBufferSize(this._dbs)}get canvas(){return this.renderer.domElement}get renderScale(){return this._renderScale}set renderScale(e){let t=V(Number(e)||1,.25,1);t!==this._renderScale&&(this._renderScale=t,this._resize(!0))}_isFullWindow(){return this.container===document.body||this.container===document.documentElement}_measure(){let e,t;if(this._isFullWindow())e=window.innerWidth,t=window.innerHeight;else if(e=this.container.clientWidth,t=this.container.clientHeight,!e||!t){let n=this.container.getBoundingClientRect();e=n.width||window.innerWidth,t=n.height||window.innerHeight}return[Math.max(1,Math.floor(e)),Math.max(1,Math.floor(t))]}_resize(e=!1){if(this._disposed)return;if(!e&&this.resizeThrottleMs>0){let e=(this._lastResizeAt??-1/0)+this.resizeThrottleMs-performance.now();if(e>0){this._resizeTimer||=setTimeout(()=>{this._resizeTimer=0,this._resize()},e);return}}let[t,n]=this._measure(),r=typeof window<`u`&&window.devicePixelRatio||1,i=Math.min(r,this.maxPixelRatio)*this._renderScale;(e||t!==this._width||n!==this._height||i!==this._pixelRatio)&&(this._lastResizeAt=performance.now(),this._width=t,this._height=n,this._pixelRatio=i,this.renderer.getPixelRatio()!==i&&this.renderer.setPixelRatio(i),this.renderer.setSize(t,n,!1),this.camera.aspect=t/n,this.camera.updateProjectionMatrix(),this.events.emit(`resize`,{width:t,height:n,pixelRatio:i}))}resize(){this._resize(!0)}addSystem(e,t=0){if(!e||typeof e!=`object`&&typeof e!=`function`)throw TypeError(`Engine.addSystem: system must be an object`);let n=this._systems.find(t=>t.system===e),r=n?{...n,order:t}:{system:e,order:t,seq:this._seq++,name:e.name||e.constructor?.name||`system`},i=this._systems.filter(t=>t.system!==e);return i.push(r),i.sort((e,t)=>e.order-t.order||e.seq-t.seq),this._systems=i,e}removeSystem(e){let t=this._systems.filter(t=>t.system!==e),n=t.length!==this._systems.length;return this._systems=t,n}get systems(){return this._systems.map(e=>e.system)}setRenderFn(e){this._renderFn=typeof e==`function`?e:null}start(){return this._running||this._disposed?this:(this._running=!0,this._lastNow=-1,this._startedOnce||(this._startedOnce=!0,this._resize(!0)),this._manual||this.renderer.setAnimationLoop(this._tick),this.events.emit(`start`),this)}stop(){return this._running?(this._running=!1,this.renderer.setAnimationLoop(null),this.events.emit(`stop`),this):this}get running(){return this._running}get manualStep(){return this._manual}set manualStep(e){let t=!!e;t===this._manual||this._disposed||(this._manual=t,this._running&&(this._lastNow=-1,this.renderer.setAnimationLoop(t?null:this._tick)))}step(e=1/60,{render:t=!0}={}){this._disposed||this._frame(e,t)}redraw(){this._disposed||this._draw(0,this.time.elapsed)}_tick(e){this._lastNow<0&&(this._lastNow=e);let t=(e-this._lastNow)/1e3;this._lastNow=e,this._frame(t)}_frame(e,t=!0){let n=this.time,r=e>0&&Number.isFinite(e)?e:0,i=(r>Ue?Ue:r)*n.timeScale;n.realDelta=r,n.realElapsed+=r,n.delta=i,n.elapsed+=i,n.frame++,r>0&&(n.fps+=(1/r-n.fps)*.05);let a=n.elapsed,o=this._systems;for(let e=0;e<o.length;e++){let t=o[e].system;if(typeof t.update==`function`)try{t.update(i,a,this)}catch(t){this._report(o[e].system,`update`,`system "${o[e].name}"`,t)}}this._emitSafe(`update`,i,a);for(let e=0;e<o.length;e++){let t=o[e].system;if(typeof t.lateUpdate==`function`)try{t.lateUpdate(i,a,this)}catch(t){this._report(o[e].system,`lateUpdate`,`system "${o[e].name}"`,t)}}this._emitSafe(`lateUpdate`,i,a),!this._disposed&&(G.uTime.value=a,t&&this._draw(i,a),this.input.endFrame())}_draw(e,t){this._emitSafe(`beforeRender`,e,t);try{this._renderFn?this._renderFn(e,t):this.renderer.render(this.scene,this.camera)}catch(e){this._report(this._renderFn??this.renderer,`render`,`render function`,e)}this._emitSafe(`afterRender`,e,t)}_emitSafe(e,t,n){let r=this.events.listeners(e);for(let i=0;i<r.length;i++){let a=r[i];try{a.call(this.events,t,n)}catch(t){this._report(a,e,`'${e}' listener ${a.name?`"${a.name}"`:`(anonymous)`}`,t)}}}_report(e,t,n,r){let i=this._failed.get(e);if(i||(i=new Set,this._failed.set(e,i)),!i.has(t)){i.add(t),console.error(`[Engine] ${n} threw in ${t} (further errors from it are suppressed):`,r);try{this.events.emit(`error`,{label:n,phase:t,error:r})}catch{}}}dispose({disposeScene:e=!0}={}){if(this._disposed)return;this.stop();try{this.events.emit(`dispose`)}catch(e){console.error(`[Engine] 'dispose' listener threw:`,e)}this._disposed=!0;let t=this._systems;for(let e=t.length-1;e>=0;e--){let n=t[e].system;if(typeof n.dispose==`function`)try{n.dispose()}catch(n){console.error(`[Engine] system "${t[e].name}" threw in dispose:`,n)}}this._systems=[],this.input.dispose(),this._resizeObserver?.disconnect(),this._resizeObserver=null,clearTimeout(this._resizeTimer),window.removeEventListener(`resize`,this._onWindowResize),e&&Ke(this.scene),this.scene.clear();let n=this.renderer.domElement;n.removeEventListener(`webglcontextlost`,this._onContextLost),n.removeEventListener(`webglcontextrestored`,this._onContextRestored),this.renderer.renderLists.dispose(),this.renderer.dispose();try{this.renderer.forceContextLoss()}catch{}n.remove(),this.events.clear(),typeof window<`u`&&window.__engine===this&&delete window.__engine}};function Ge(e){try{let t=new URLSearchParams(window.location.search);return t.has(e)&&t.get(e)!==`0`}catch{return!1}}function Ke(e){let t=new Set,n=e=>{e&&!t.has(e)&&typeof e.dispose==`function`&&(t.add(e),e.dispose())},r=e=>{if(e&&!t.has(e)){for(let t of Object.keys(e)){let r=e[t];r&&r.isTexture&&n(r)}if(e.uniforms)for(let t of Object.values(e.uniforms)){let e=t?.value;e&&e.isTexture&&n(e)}n(e)}};e.traverse(e=>{e.geometry&&n(e.geometry);let t=e.material;Array.isArray(t)?t.forEach(r):r(t),e.customDepthMaterial&&r(e.customDepthMaterial),e.customDistanceMaterial&&r(e.customDistanceMaterial),e.isLight&&e.shadow?.map&&e.shadow.dispose(),e.isInstancedMesh&&e.dispose?.()});let i=e.background;i&&i.isTexture&&n(i);let a=e.environment;a&&a.isTexture&&n(a)}var qe=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},Je=new ie(-1,1,1,-1,0,1),Ye=new class extends a{constructor(){super(),this.setAttribute(`position`,new c([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new c([0,2,0,0,2,0],2))}},Xe=class{constructor(e){this._mesh=new W(Ye,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Je)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},Ze={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},Qe={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new m(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},$e=class e extends qe{constructor(e,t=1,n,r){super(),this.strength=t,this.radius=n,this.threshold=r,this.resolution=e===void 0?new U(256,256):new U(e.x,e.y),this.clearColor=new m(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new de(i,a,{type:A,depthBuffer:!1}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new de(i,a,{type:A,depthBuffer:!1});t.texture.name=`UnrealBloomPass.h`+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let n=new de(i,a,{type:A,depthBuffer:!1});n.texture.name=`UnrealBloomPass.v`+e,n.texture.generateMipmaps=!1,this.renderTargetsVertical.push(n),i=Math.round(i/2),a=Math.round(a/2)}let o=Qe;this.highPassUniforms=d.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new ge({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let s=[6,10,14,18,22];i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(s[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new U(1/i,1/a),i=Math.round(i/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new B(1,1,1),new B(1,1,1),new B(1,1,1),new B(1,1,1),new B(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=d.clone(Ze.uniforms),this.blendMaterial=new ge({uniforms:this.copyUniforms,vertexShader:Ze.vertexShader,fragmentShader:Ze.fragmentShader,premultipliedAlpha:!0,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new m,this._oldClearAlpha=1,this._basic=new y,this._fsQuad=new Xe(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,r),this.renderTargetsVertical[e].setSize(n,r),this.separableBlurMaterials[e].uniforms.invSize.value=new U(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(t,n,r,i,a){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),a&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[n]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[n]),t.clear(),this._fsQuad.render(t),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(r),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(n*n))/n);let r=[],i=[];for(let n=1;n<e;n+=2){let a=t[n],o=n+1<e?t[n+1]:0,s=a+o;r.push((n*a+(n+1)*o)/s),i.push(s)}return new ge({defines:{KERNEL_PAIRS:r.length},uniforms:{colorTexture:{value:null},invSize:{value:new U(.5,.5)},direction:{value:new U(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:r},gaussianWeights:{value:i}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new ge({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};$e.BlurDirectionX=new U(1,0),$e.BlurDirectionY=new U(0,1);var et={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`},tt=class extends qe{constructor(){super(),this.isOutputPass=!0,this.uniforms=d.clone(et.uniforms),this.material=new me({name:et.name,uniforms:this.uniforms,vertexShader:et.vertexShader,fragmentShader:et.fragmentShader}),this._fsQuad=new Xe(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},ae.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},K=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,q=`
float pfxLuma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

// Scrub NaN / Inf / negative values coming from the scene (one bad pixel would otherwise poison
// every blur kernel that touches it). Tests the exponent bits instead of isnan(), which D3D's
// fast-math compiler is allowed to optimise away.
bool pfxNonFinite(float x) { return (floatBitsToUint(x) & 0x7f800000u) == 0x7f800000u; }
vec3 pfxSafe(vec3 c) {
  bool bad = pfxNonFinite(c.r) || pfxNonFinite(c.g) || pfxNonFinite(c.b);
  return bad ? vec3(0.0) : clamp(c, vec3(0.0), vec3(6.0e4));
}

// 8×8 Bayer ordered-dither threshold in [0, 1) (recursive closed form).
float pfxBayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float pfxBayer4(vec2 a) { return pfxBayer2(0.5 * a) * 0.25 + pfxBayer2(a); }
float pfxBayer8(vec2 a) { return pfxBayer4(0.5 * a) * 0.25 + pfxBayer2(a); }

// Interleaved gradient noise (Jimenez 2014): cheap, well distributed, in [0, 1).
float pfxIGN(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }

// Integer-ish hash -> [0, 1) (Dave Hoskins, "hash without sine").
float pfxHash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
`,nt={name:`LuminatiCopyShader`,uniforms:{tDiffuse:{value:null}},vertexShader:K,fragmentShader:`
    ${q}
    uniform sampler2D tDiffuse;
    void main() {
      gl_FragColor = vec4(pfxSafe(texelFetch(tDiffuse, ivec2(gl_FragCoord.xy), 0).rgb), 1.0);
    }
  `};function rt(){return{tDepth:{value:null},uCamNear:{value:.5},uCamFar:{value:400},uFocusDistance:{value:24},uFocusRange:{value:5},uNearScale:{value:1.4},uFarScale:{value:1},uMaxBlurPx:{value:10},uTilt:{value:new B(.35,.52,.28)},uTiltFeather:{value:.3},uOrtho:{value:0}}}var it=`
#include <packing>
uniform sampler2D tDepth;
uniform float uCamNear;
uniform float uCamFar;
uniform float uFocusDistance;
uniform float uFocusRange;
uniform float uNearScale;
uniform float uFarScale;
uniform float uMaxBlurPx;
uniform vec3 uTilt; // x = strength, y = centre (uv.y), z = band width (uv)
uniform float uTiltFeather; // uv distance over which the tilt term ramps in
uniform float uOrtho;       // 1 for orthographic cameras

float dofViewDepth(float rawDepth) {
  return uOrtho > 0.5 ? -orthographicDepthToViewZ(rawDepth, uCamNear, uCamFar)
                      : -perspectiveDepthToViewZ(rawDepth, uCamNear, uCamFar);
}

float dofCoC(float rawDepth, float uvY) {
  float z = dofViewDepth(rawDepth);
  float dz = z - uFocusDistance;
  float band = 0.5 * uFocusRange;
  float t = clamp((abs(dz) - band) / max(1.5 * uFocusRange, 1e-3), 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  float coc = dz < 0.0 ? -uNearScale * t : uFarScale * t;
  // screen-space tilt-shift term
  float ty = abs(uvY - uTilt.y) - 0.5 * uTilt.z;
  float tilt = uTilt.x * smoothstep(0.0, max(uTiltFeather, 1e-3), ty);
  if (tilt > abs(coc)) {
    float s = abs(dz) > band ? sign(dz) : (uvY < uTilt.y ? -1.0 : 1.0);
    coc = s * tilt;
  }
  return coc * uMaxBlurPx;
}
`,at={name:`LuminatiDofPrefilter`,glslVersion:te,uniforms:{tColor:{value:null},uFullSize:{value:new U(1,1)},uRatio:{value:new U(2,2)},uScale:{value:.5},uBokehThreshold:{value:1.5},uSprites:{value:1}},vertexShader:K,fragmentShader:`
    ${it}
    ${q}
    uniform sampler2D tColor;
    uniform vec2 uFullSize;
    uniform vec2 uRatio;
    uniform float uScale;
    uniform float uBokehThreshold;
    uniform float uSprites;
    varying vec2 vUv;
    layout(location = 0) out vec4 outColorCoc;
    layout(location = 1) out vec4 outHighlight;

    void main() {
      vec2 fc = gl_FragCoord.xy * uRatio;           // centre of this texel in full-res pixels
      ivec2 p = ivec2(floor(fc - 0.5));
      ivec2 mx = ivec2(uFullSize) - 1;
      ivec2 p0 = clamp(p, ivec2(0), mx);
      ivec2 p1 = clamp(p + ivec2(1, 0), ivec2(0), mx);
      ivec2 p2 = clamp(p + ivec2(0, 1), ivec2(0), mx);
      ivec2 p3 = clamp(p + ivec2(1, 1), ivec2(0), mx);

      vec3 c0 = texelFetch(tColor, p0, 0).rgb;
      vec3 c1 = texelFetch(tColor, p1, 0).rgb;
      vec3 c2 = texelFetch(tColor, p2, 0).rgb;
      vec3 c3 = texelFetch(tColor, p3, 0).rgb;

      float k0 = dofCoC(texelFetch(tDepth, p0, 0).x, vUv.y);
      float k1 = dofCoC(texelFetch(tDepth, p1, 0).x, vUv.y);
      float k2 = dofCoC(texelFetch(tDepth, p2, 0).x, vUv.y);
      float k3 = dofCoC(texelFetch(tDepth, p3, 0).x, vUv.y);

      float kn = min(min(k0, k1), min(k2, k3));
      float kf = max(max(k0, k1), max(k2, k3));
      float kc = (kn < -1.0 || -kn > kf) ? kn : kf;

      // guard against NaN/Inf from the scene (would poison the whole bokeh kernel)
      c0 = pfxSafe(c0);
      c1 = pfxSafe(c1);
      c2 = pfxSafe(c2);
      c3 = pfxSafe(c3);

      float w0 = 1.0 / (1.0 + (k0 - kc) * (k0 - kc));
      float w1 = 1.0 / (1.0 + (k1 - kc) * (k1 - kc));
      float w2 = 1.0 / (1.0 + (k2 - kc) * (k2 - kc));
      float w3 = 1.0 / (1.0 + (k3 - kc) * (k3 - kc));
      float wsum = w0 + w1 + w2 + w3;
      vec3 col = (c0 * w0 + c1 * w1 + c2 * w2 + c3 * w3) / wsum;

      vec4 hl = vec4(0.0);
      // Only highlights the composite actually shows through the blurred layers are scattered:
      // same ramp as its centreA (full-res px). Nearly-focused specks stay in the sharp image;
      // extracting them would double-count them (near pass is added on top of the sharp pixels)
      // or lose them (far discs are clipped to the tiny CoC of their focused surroundings),
      // which made them pulse between 'boosted disc', 'sharp' and 'hollow ring' while panning.
      float spriteGate = smoothstep(2.0, 4.0, abs(kc));
      if (uSprites > 0.5 && spriteGate > 0.0) {
        // highlight energy, decided per full-res pixel (smooth ramp above the threshold)
        float T = uBokehThreshold;
        float l0 = pfxLuma(c0), l1 = pfxLuma(c1), l2 = pfxLuma(c2), l3 = pfxLuma(c3);
        float r0 = smoothstep(T, 2.0 * T, l0), r1 = smoothstep(T, 2.0 * T, l1);
        float r2 = smoothstep(T, 2.0 * T, l2), r3 = smoothstep(T, 2.0 * T, l3);
        if (r0 + r1 + r2 + r3 > 0.0) {
          // isolation: tent-weighted neighbourhood mean (≈14×14 px via 5×5 bilinear 2×2 taps)
          // vs each pixel's OWN luminance. Lone specks → 1 (scattered as boosted discs);
          // extended bright areas → 0 (stay in the normalised gather, which keeps their blurred
          // edges free of dark halos). The 25 taps are re-weighted per pixel so each of the 4
          // pixels gets a tent window centred on itself (pixels sit ±0.25 tap from the block
          // centre, no extra fetches): the result barely depends on how a highlight straddles
          // the reduced-res grid, so boosted bokeh does not pulse while the camera pans (the
          // sprite gain amplifies any jitter here).
          float m0 = 0.0, m1 = 0.0, m2 = 0.0, m3 = 0.0;
          for (int y = -2; y <= 2; y++) {
            float ra = 0.0, rb = 0.0;
            for (int x = -2; x <= 2; x++) {
              float L = pfxLuma(textureLod(tColor, (fc + vec2(x, y) * 2.0) / uFullSize, 0.0).rgb);
              ra += (3.0 - abs(float(x) + 0.25)) * L;
              rb += (3.0 - abs(float(x) - 0.25)) * L;
            }
            float wa = 3.0 - abs(float(y) + 0.25);
            float wb = 3.0 - abs(float(y) - 0.25);
            m0 += wa * ra; m1 += wa * rb; m2 += wb * ra; m3 += wb * rb;
          }
          const float TENT_NORM = 1.0 / 76.5625;         // (Σ weights)² = 8.75²
          float s0 = r0 * (1.0 - smoothstep(0.06, 0.6, m0 * TENT_NORM / max(l0, 1e-4)));
          float s1 = r1 * (1.0 - smoothstep(0.06, 0.6, m1 * TENT_NORM / max(l1, 1e-4)));
          float s2 = r2 * (1.0 - smoothstep(0.06, 0.6, m2 * TENT_NORM / max(l2, 1e-4)));
          float s3 = r3 * (1.0 - smoothstep(0.06, 0.6, m3 * TENT_NORM / max(l3, 1e-4)));
          // Removed from the gather: the amount the layer-aware colour average above holds.
          vec3 eGather = (c0 * (w0 * s0) + c1 * (w1 * s1) + c2 * (w2 * s2) + c3 * (w3 * s3)) / wsum;
          // Scattered as sprites: the footprint's true (box-filtered) energy. The layer-aware
          // weights dilate near-field specks to every texel they touch, so using them here
          // made the scattered energy depend on the grid phase (even/odd flicker when panning).
          vec3 eBox = (c0 * s0 + c1 * s1 + c2 * s2 + c3 * s3) * 0.25;
          vec3 eAll = (c0 * r0 + c1 * r1 + c2 * r2 + c3 * r3) * 0.25;
          float iso = clamp(pfxLuma(eBox) / max(pfxLuma(eAll), 1e-6), 0.0, 1.0);
          col -= eGather * spriteGate;
          hl = vec4(eBox * spriteGate, iso);
        }
      }
      outColorCoc = vec4(max(col, vec3(0.0)), kc * uScale);
      outHighlight = hl;
    }
  `};function ot(e){let t=Math.PI*(3-Math.sqrt(5)),n=new Float32Array(e*3);for(let r=0;r<e;r++){let i=Math.sqrt((r+.5)/e),a=r*t;n[r*3]=i*Math.cos(a),n[r*3+1]=i*Math.sin(a),n[r*3+2]=i}return n}function st(e){let t=ot(e),n=[];for(let r=0;r<e;r++)n.push(`vec2(${t[r*3].toFixed(6)}, ${t[r*3+1].toFixed(6)})`);return`const vec2 SMALL_KERNEL[${e}] = vec2[${e}](${n.join(`, `)});`}function ct(e){let t=ot(e),n=[];for(let r=0;r<e;r++)n.push(`vec3(${t[r*3].toFixed(6)}, ${t[r*3+1].toFixed(6)}, ${t[r*3+2].toFixed(6)})`);return`const vec3 KERNEL[${e}] = vec3[${e}](\n  ${n.join(`,
  `)}\n);`}function lt(e=48){return{name:`LuminatiDofGather${e}`,defines:{TAPS:e},uniforms:{tColorCoc:{value:null},uTexel:{value:new U(1,1)},uRadius:{value:6}},vertexShader:K,fragmentShader:`
      uniform sampler2D tColorCoc;
      uniform vec2 uTexel;
      uniform float uRadius;
      varying vec2 vUv;

      ${ct(e)}

      void main() {
        vec4 centre = textureLod(tColorCoc, vUv, 0.0);
        float coc0 = centre.a;
        const float MARGIN = 1.0;                         // disc edge softness (px)
        // background taps are weighted by the inverse area of the disc they scatter
        // (1/CoC², floored so a focused silhouette cannot dominate its blurred neighbours):
        // a less-blurred object in front of a blurrier background then spreads over it as
        // much as it blends inward, instead of keeping a crisp 'cut-out' silhouette
        const float MIN_AREA = 4.0;                       // (2 px)²
        float norm = uRadius * uRadius / float(TAPS);     // (tap area) / PI

        float c0p = max(coc0, 0.0);
        vec4 bg = vec4(centre.rgb, 1.0) / max(c0p * c0p, MIN_AREA);
        vec4 fg = vec4(0.0);
        float fgA = 0.0;
        float nc0 = -coc0;
        if (nc0 >= 1.0) {
          fg = vec4(centre.rgb, 1.0);
          fgA = norm / max(nc0 * nc0, norm);
        }

        for (int i = 0; i < TAPS; i++) {
          vec3 k = KERNEL[i];
          float d = k.z * uRadius;
          vec4 s = textureLod(tColorCoc, vUv + k.xy * (uRadius * uTexel), 0.0);

          // background / focus layer: limited by the smaller CoC of centre and tap
          float bc = max(min(coc0, s.a), 0.0);
          float bw = clamp((bc - d) / MARGIN + 1.0, 0.0, 1.0) / max(bc * bc, MIN_AREA);
          bg += vec4(s.rgb, 1.0) * bw;

          // near layer: scatter-as-gather with the tap's own CoC
          float nc = -s.a;
          float fw = clamp((nc - d) / MARGIN + 1.0, 0.0, 1.0) * step(1.0, nc);
          fg += vec4(s.rgb, 1.0) * fw;
          fgA += fw * norm / max(nc * nc, norm);
        }

        bg.rgb /= bg.a;
        fg.rgb /= max(fg.a, 1e-4);
        fgA = fg.a > 0.0 ? clamp(fgA, 0.0, 1.0) : 0.0;
        gl_FragColor = vec4(mix(bg.rgb, fg.rgb, fgA), fgA);
      }
    `}}var ut={name:`LuminatiDofTent`,uniforms:{tBlur:{value:null},tColorCoc:{value:null},uSize:{value:new U(1,1)}},vertexShader:K,fragmentShader:`
    uniform sampler2D tBlur;
    uniform sampler2D tColorCoc;
    uniform vec2 uSize;

    void main() {
      ivec2 p = ivec2(gl_FragCoord.xy);
      ivec2 mx = ivec2(uSize) - 1;
      vec4 c = texelFetch(tBlur, p, 0);
      float cc = texelFetch(tColorCoc, p, 0).a;
      float tol = 1.0 + 0.25 * abs(cc);
      vec4 acc = vec4(0.0);
      float wsum = 0.0;
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          ivec2 q = clamp(p + ivec2(x, y), ivec2(0), mx);
          vec4 s = texelFetch(tBlur, q, 0);
          float sc = texelFetch(tColorCoc, q, 0).a;
          float w = float((2 - abs(x)) * (2 - abs(y)));   // 1-2-1 tent
          float dd = (sc - cc) / tol;
          float sim = 1.0 / (1.0 + dd * dd * 4.0);
          // strict only next to (nearly) focused texels; two blurred layers blend freely
          sim = mix(sim, 1.0, smoothstep(1.0, 2.5, min(abs(cc), abs(sc))));
          w *= mix(sim, 1.0, max(s.a, c.a));
          acc += s * w;
          wsum += w;
        }
      }
      gl_FragColor = acc / wsum;
    }
  `},dt={name:`LuminatiDofBokehSprites`,uniforms:{tColorCoc:{value:null},tHighlight:{value:null},tGather:{value:null},uSize:{value:new U(1,1)},uMode:{value:0},uBoost:{value:1.5},uMaxRadius:{value:16},uMaxPointSize:{value:64},uSquash:{value:1}},vertexShader:`
    ${q}
    uniform sampler2D tColorCoc;
    uniform sampler2D tHighlight;
    uniform vec2 uSize;
    uniform float uMode;
    uniform float uBoost;
    uniform float uMaxRadius;
    uniform float uMaxPointSize;
    flat out vec3 vColor;
    flat out float vRadius;
    flat out vec2 vCentre;

    void cull() {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);   // outside the clip volume
      gl_PointSize = 1.0;
      vColor = vec3(0.0); vRadius = 0.0; vCentre = vec2(0.0);
    }

    void main() {
      // one point per 2×2 block of reduced-res texels: energy-weighted merge
      int gw = (int(uSize.x) + 1) / 2;
      ivec2 base = ivec2(gl_VertexID % gw, gl_VertexID / gw) * 2;
      ivec2 mx = ivec2(uSize) - 1;
      vec3 esum = vec3(0.0);
      vec2 eCentre = vec2(0.0);
      float cocSum = 0.0, isoSum = 0.0, lsum = 0.0;
      for (int i = 0; i < 4; i++) {
        ivec2 t = min(base + ivec2(i & 1, i >> 1), mx);
        vec4 hl = texelFetch(tHighlight, t, 0);
        float l = pfxLuma(hl.rgb);
        if (l > 0.0) {
          esum += hl.rgb;
          eCentre += (vec2(t) + 0.5) * l;
          cocSum += texelFetch(tColorCoc, t, 0).a * l;
          isoSum += hl.a * l;
          lsum += l;
        }
      }
      if (lsum < 1e-5) { cull(); return; }
      eCentre /= lsum;
      float coc = cocSum / lsum;
      float iso = isoSum / lsum;
      float wNear = smoothstep(0.75, 1.5, -coc);
      float wm = uMode > 0.5 ? wNear : 1.0 - wNear;
      vec3 e = esum * wm;
      if (pfxLuma(e) < 1e-4) { cull(); return; }
      float r = clamp(abs(coc), 0.5, uMaxRadius);
      float size = min(2.0 * ceil(r + 1.5) + 1.0, uMaxPointSize);
      r = min(r, 0.5 * size - 1.5);
      float area = max(3.14159265 * r * r, 1.0);
      float gain = 1.0 + uBoost * 4.0 * iso * smoothstep(0.5, 3.0, r) * (1.0 + 0.1 * r);
      vColor = e * gain / area;
      vRadius = r;
      vCentre = eCentre;
      // snap the point centre to a pixel centre; the disc itself is evaluated around vCentre
      vec2 pc = floor(eCentre) + 0.5;
      gl_Position = vec4(pc / uSize * 2.0 - 1.0, 0.0, 1.0);
      gl_PointSize = size;
    }
  `,fragmentShader:`
    uniform sampler2D tColorCoc;
    uniform sampler2D tGather;
    uniform float uMode;
    uniform float uSquash;
    flat in vec3 vColor;
    flat in float vRadius;
    flat in vec2 vCentre;

    void main() {
      float d = length((gl_FragCoord.xy - vCentre) * vec2(uSquash, 1.0));
      float r = vRadius;
      float cov;
      if (uMode < 0.5) {
        ivec2 q = ivec2(gl_FragCoord.xy);
        float c0 = abs(texelFetch(tColorCoc, q, 0).a);
        float nearA = texelFetch(tGather, q, 0).a;
        float lim = max(min(c0, r), 0.5);
        cov = clamp(lim - d + 0.5, 0.0, 1.0) * (1.0 - nearA);
      } else {
        cov = clamp(r - d + 0.5, 0.0, 1.0);
      }
      if (cov <= 0.0) discard;
      // lens-like disc: flat body with a slightly brighter rim
      float rim = mix(0.9, 1.18, smoothstep(0.55, 1.0, d / max(r, 1.0)));
      // (an oval covers 1 / uSquash of the disc's area: × uSquash keeps its energy)
      gl_FragColor = vec4(vColor * (cov * rim * uSquash), 0.0);
    }
  `},ft={name:`LuminatiDofComposite`,uniforms:{tColor:{value:null},tBlur:{value:null},tColorCoc:{value:null},tNearBokeh:{value:null},uNearBokeh:{value:1},uHalfSize:{value:new U(1,1)},uHalfRatio:{value:new U(.5,.5)},uScale:{value:.5},uMaxCocPx:{value:10},uFullTexel:{value:new U(1,1)}},vertexShader:K,fragmentShader:`
    ${it}
    ${q}
    uniform sampler2D tColor;
    uniform sampler2D tBlur;
    uniform sampler2D tColorCoc;
    uniform sampler2D tNearBokeh;
    uniform float uNearBokeh;
    uniform vec2 uHalfSize;
    uniform vec2 uHalfRatio;
    uniform float uScale;
    uniform float uMaxCocPx;
    uniform vec2 uFullTexel;
    varying vec2 vUv;

    ${st(12)}

    void main() {
      ivec2 fp = ivec2(gl_FragCoord.xy);
      vec3 sharp = pfxSafe(texelFetch(tColor, fp, 0).rgb);
      float coc = dofCoC(texelFetch(tDepth, fp, 0).x, vUv.y);   // full-res px
      float cocH = coc * uScale;                                   // reduced-res px

      // CoC-aware bilinear upsample of the blurred layer
      vec2 hp = gl_FragCoord.xy * uHalfRatio - 0.5;
      vec2 f = fract(hp);
      ivec2 b = ivec2(floor(hp));
      ivec2 mx = ivec2(uHalfSize) - 1;
      ivec2 q0 = clamp(b, ivec2(0), mx);
      ivec2 q1 = clamp(b + ivec2(1, 0), ivec2(0), mx);
      ivec2 q2 = clamp(b + ivec2(0, 1), ivec2(0), mx);
      ivec2 q3 = clamp(b + ivec2(1, 1), ivec2(0), mx);
      vec4 s0 = texelFetch(tBlur, q0, 0);
      vec4 s1 = texelFetch(tBlur, q1, 0);
      vec4 s2 = texelFetch(tBlur, q2, 0);
      vec4 s3 = texelFetch(tBlur, q3, 0);
      vec4 tcs = vec4(texelFetch(tColorCoc, q0, 0).a, texelFetch(tColorCoc, q1, 0).a,
                      texelFetch(tColorCoc, q2, 0).a, texelFetch(tColorCoc, q3, 0).a);
      float tol = 1.0 + 0.25 * abs(cocH);
      vec4 dc = (tcs - cocH) / tol;
      vec4 sim = 1.0 / (1.0 + dc * dc * 4.0) + 1e-3;
      // CoC rejection only matters next to (nearly) focused texels (it keeps sharp colour from
      // leaking into blurred neighbours). Where both sides are already visibly blurred, plain
      // bilinear blending is right; rejecting there gave blurred mid-ground sprites a crisp,
      // pixel-exact 'cut-out' silhouette against a blurrier background. (Same rule in the tent.)
      sim = mix(sim, vec4(1.0), smoothstep(1.0, 2.5, min(vec4(abs(cocH)), abs(tcs))));
      vec4 bil = vec4((1.0 - f.x) * (1.0 - f.y), f.x * (1.0 - f.y), (1.0 - f.x) * f.y, f.x * f.y);
      vec4 w = bil * mix(sim, vec4(1.0), clamp(vec4(s0.a, s1.a, s2.a, s3.a), 0.0, 1.0));
      vec4 blur = (s0 * w.x + s1 * w.y + s2 * w.z + s3 * w.w) / max(dot(w, vec4(1.0)), 1e-5);

      // small CoCs: a full-resolution disc blur, so the focus falloff is gradual and the
      // half-res layer only takes over once the blur is large enough to hide its resolution
      float ac = abs(coc);
      vec3 base = sharp;
      if (ac > 0.3 && ac < 4.0) {
        // scatter-as-gather: a tap only counts if its own CoC reaches this pixel, so focused
        // silhouettes never smear onto a slightly blurred background next to them
        vec3 acc = sharp;
        float wsum = 1.0;
        ivec2 fmx = ivec2(uHalfSize / uHalfRatio + 0.5) - 1;
        for (int i = 0; i < 12; i++) {
          vec2 o = SMALL_KERNEL[i] * ac;
          vec2 pos = gl_FragCoord.xy + o;
          float tc = abs(dofCoC(texelFetch(tDepth, clamp(ivec2(pos), ivec2(0), fmx), 0).x, pos.y * uFullTexel.y));
          float wt = clamp(tc - length(o) + 1.0, 0.0, 1.0);
          acc += texture2D(tColor, pos * uFullTexel).rgb * wt;
          wsum += wt;
        }
        base = mix(sharp, acc / wsum, smoothstep(0.3, 1.2, ac));
      }
      float centreA = smoothstep(2.0, 4.0, ac);
      float a = 1.0 - (1.0 - centreA) * (1.0 - clamp(blur.a, 0.0, 1.0));
      vec3 nearBokeh = uNearBokeh > 0.5 ? texture2D(tNearBokeh, vUv).rgb : vec3(0.0);

#ifdef DEBUG
      float l = pfxLuma(sharp);
      vec3 dbase = vec3(sqrt(l / (1.0 + l))) * 0.45;
      float n = sqrt(clamp(-coc / uMaxCocPx, 0.0, 1.0));
      float fr = sqrt(clamp(coc / uMaxCocPx, 0.0, 1.0));
      float inFocus = 1.0 - smoothstep(0.25, 0.75, abs(coc));
      vec3 col = dbase;
      col = mix(col, vec3(1.0, 0.55, 0.12), n * 0.8);
      col = mix(col, vec3(0.22, 0.5, 1.0), fr * 0.8);
      col = mix(col, col * 0.5 + vec3(0.12, 0.5, 0.16), inFocus);
      float spill = clamp(blur.a, 0.0, 1.0) * step(-0.5, coc);
      col = mix(col, vec3(0.85, 0.2, 0.75), spill * 0.6);
      gl_FragColor = vec4(col, 1.0);
#else
      gl_FragColor = vec4(mix(base, blur.rgb, a) + nearBokeh, 1.0);
#endif
    }
  `},pt={name:`LuminatiGrade`,uniforms:{tDiffuse:{value:null},uTexel:{value:new U(1,1)},uAspect:{value:16/9},uExposure:{value:1},uContrast:{value:1.08},uSaturation:{value:1.12},uTemperature:{value:.08},uTint:{value:0},uShadowsTint:{value:new B(.02,.04,.08)},uHighlightsTint:{value:new B(.06,.03,-.02)},uHighlightsWarm:{value:0},uVignette:{value:.5},uVignetteSoftness:{value:.55},uVignetteRoundness:{value:.65},uVignetteColor:{value:new B(.05,.025,.04)},uGrain:{value:.035},uGrainSize:{value:1},uGrainSeed:{value:0},uCA:{value:.0015},uSharpen:{value:.15},uDither:{value:1},tStreak:{value:null},uStreaks:{value:0},uTealOrange:{value:0},uFilmCurve:{value:0},uBlack:{value:new B(0,0,0)},uWhite:{value:new B(1,1,1)},uGrainChroma:{value:0}},vertexShader:K,fragmentShader:`
    ${q}
    uniform sampler2D tDiffuse;
    uniform vec2 uTexel;
    uniform float uAspect;
    uniform float uExposure;
    uniform float uContrast;
    uniform float uSaturation;
    uniform float uTemperature;
    uniform float uTint;
    uniform vec3 uShadowsTint;
    uniform vec3 uHighlightsTint;
    uniform float uHighlightsWarm;
    uniform float uVignette;
    uniform float uVignetteSoftness;
    uniform float uVignetteRoundness;
    uniform vec3 uVignetteColor;
    uniform float uGrain;
    uniform float uGrainSize;
    uniform float uGrainSeed;
    uniform float uCA;
    uniform float uSharpen;
    uniform float uDither;
    #ifdef CINEMATIC
    uniform sampler2D tStreak;
    uniform float uStreaks;
    uniform float uTealOrange;
    uniform float uFilmCurve;
    uniform vec3 uBlack;
    uniform vec3 uWhite;
    uniform float uGrainChroma;
    // the orange axis in the (Cb, Cr) plane: orange ≈ rgb(1, 0.55, 0.2); its opposite is steel teal
    const vec2 ORANGE = vec2(-0.7415, 0.6709);
    // vec2 → vec3 hash in [0, 1) (Dave Hoskins, "Hash without Sine")
    vec3 filmHash32(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
      p3 += dot(p3, p3.yxz + 33.33);
      return fract((p3.xxy + p3.yzz) * p3.zyx);
    }
    // value noise in [0, 1): the lattice's hashes, smoothly blended — clumps, not pixels
    float filmNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(pfxHash12(i), pfxHash12(i + vec2(1.0, 0.0)), f.x),
                 mix(pfxHash12(i + vec2(0.0, 1.0)), pfxHash12(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    // three independent value noises at once (the luma clumps and the two colour layers)
    vec3 filmNoise3(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(filmHash32(i), filmHash32(i + vec2(1.0, 0.0)), f.x),
                 mix(filmHash32(i + vec2(0.0, 1.0)), filmHash32(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    #endif
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      // position relative to centre, x scaled toward the true aspect by 'roundness'
      vec2 d = uv - 0.5;
      vec2 dv = d * vec2(mix(1.0, uAspect, uVignetteRoundness), 1.0);
      float cornerLen = length(vec2(0.5 * mix(1.0, uAspect, uVignetteRoundness), 0.5));
      float r = length(dv) / cornerLen;            // 0 centre … 1 corners

      // --- sampling: sharpen + chromatic aberration
      vec3 c = texture2D(tDiffuse, uv).rgb;
      vec3 nb = texture2D(tDiffuse, uv + vec2(uTexel.x, 0.0)).rgb
              + texture2D(tDiffuse, uv - vec2(uTexel.x, 0.0)).rgb
              + texture2D(tDiffuse, uv + vec2(0.0, uTexel.y)).rgb
              + texture2D(tDiffuse, uv - vec2(0.0, uTexel.y)).rgb;
      vec3 detail = clamp((c - nb * 0.25) * uSharpen, vec3(-0.08), vec3(0.08));
      vec3 col = c;
      if (uCA > 0.0) {
        vec2 off = d * (uCA * 2.0 * r * r);       // radial, grows toward the edges
        col.r = texture2D(tDiffuse, uv - off).r;
        col.b = texture2D(tDiffuse, uv + off).b;
      }
      col += detail;
      col = max(col, vec3(0.0));
      #ifdef CINEMATIC
      // --- anamorphic streaks: light added to light (a gamma-2.2 round trip around the add)
      if (uStreaks > 0.0) col = pow(pow(col, vec3(2.2)) + texture2D(tStreak, uv).rgb, vec3(1.0 / 2.2));
      #endif

      // --- exposure (post tone-map multiply)
      col *= uExposure;

      // --- white balance: warm/cool along blue↔amber, tint along green↔magenta, luma preserving
      vec3 wb = vec3(1.0 + 0.30 * uTemperature + 0.10 * uTint,
                     1.0 + 0.02 * uTemperature - 0.25 * uTint,
                     1.0 - 0.34 * uTemperature + 0.10 * uTint);
      wb /= pfxLuma(wb);
      col *= wb;

      // --- contrast around display mid-grey
      col = (col - 0.5) * uContrast + 0.5;
      col = max(col, vec3(0.0));

      // --- saturation
      float l = pfxLuma(col);
      col = max(mix(vec3(l), col, uSaturation), vec3(0.0));

      // --- split toning
      l = clamp(pfxLuma(col), 0.0, 1.0);
      float ws = (1.0 - l) * (1.0 - l);
      float wh = l * l;
      // (a warm, saturated colour — gold — spared the highlights tint by its warmth: uHighlightsWarm;
      // computed only where it is set — a sky level —, so every other level skips it)
      float hw = 1.0;
      if (uHighlightsWarm > 0.0) hw -= uHighlightsWarm * smoothstep(0.15, 0.4, (col.r - col.b) / max(col.r, 1e-4));
      col += uShadowsTint * ws + uHighlightsTint * (wh * hw);

      #ifdef CINEMATIC
      // --- orange & teal: each hue turned toward the nearer end of the axis; chroma along it kept
      // (skin, fire, sky), across it thinned (greens, magentas); luminance kept. The turn fades out
      // toward right angles to the axis, where the nearer end flips: no hue jumps there.
      {
        float y = pfxLuma(col);
        vec2 cc = vec2(col.b - y, col.r - y);    // (Cb, Cr)
        float m = length(cc);
        if (m > 1e-5) {
          vec2 n = cc / m;
          float s = dot(n, ORANGE);
          float turn = uTealOrange * smoothstep(0.0, 0.35, abs(s));
          vec2 nn = normalize(mix(n, s >= 0.0 ? ORANGE : -ORANGE, turn));
          cc = nn * m * mix(1.0, 0.72 + 0.38 * abs(s), uTealOrange);
          col.r = y + cc.y;
          col.b = y + cc.x;
          col.g = (y - 0.2126 * col.r - 0.0722 * col.b) / 0.7152;
          col = max(col, vec3(0.0));
        }
      }
      // --- film print: an S around mid-grey (toe and shoulder), then the print's black and white
      vec3 sc = clamp(col, 0.0, 1.0);
      col = mix(col, sc * sc * (3.0 - 2.0 * sc), uFilmCurve);
      col = uBlack + col * (uWhite - uBlack);
      #endif

      // --- vignette (smooth, elliptical; darkens toward a deep warm brown instead of grey)
      float inner = mix(0.95, 0.05, clamp(uVignetteSoftness, 0.0, 1.0));
      float v = smoothstep(inner, 1.25, r);
      v = v * v * (3.0 - 2.0 * v);
      col = mix(col, uVignetteColor * col, clamp(uVignette * v * 1.35, 0.0, 1.0));

      #ifdef CINEMATIC
      // --- film grain: soft clumps about uGrainSize px across, strongest in the mid-tones (a little
      // more in the shadows than the pixel grain); colour grain: red and blue clumps of their own,
      // green opposite them so that it adds no luminance
      vec2 fp = gl_FragCoord.xy / uGrainSize + uGrainSeed * vec2(37.17, 91.31);
      vec3 n3 = filmNoise3(fp);
      // (two octaves' weighted mean, centred; × 3.2: value noise spreads less than pixel noise)
      float g = ((2.0 * n3.x + filmNoise(fp * 2.17 + 19.3)) / 3.0 - 0.5) * 3.2;
      float cr = n3.y * 2.0 - 1.0;
      float cb = n3.z * 2.0 - 1.0;
      float lg = clamp(pfxLuma(col), 0.0, 1.0);
      float gw = 0.5 + 2.4 * lg * (1.0 - lg);
      col += (vec3(g) + vec3(cr, -(0.2126 * cr + 0.0722 * cb) / 0.7152, cb) * uGrainChroma) * uGrain * gw;
      #else
      // --- film grain: animated, strongest in the mid-tones
      vec2 gp = floor(gl_FragCoord.xy / uGrainSize);
      float g = pfxHash12(gp + uGrainSeed * vec2(113.7, 71.3)) + pfxHash12(gp * 1.37 + uGrainSeed * vec2(37.1, 91.9)) - 1.0;
      float lg = clamp(pfxLuma(col), 0.0, 1.0);
      float gw = 0.35 + 2.6 * lg * (1.0 - lg);
      col += g * uGrain * gw;
      #endif

      // --- ordered dither (±0.5 LSB of 8-bit) against banding
      col += (pfxBayer8(gl_FragCoord.xy) - 0.5) * (uDither / 255.0);

      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `},mt={name:`LuminatiBloomBrightPass`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:.82},smoothWidth:{value:.35},maxBrightness:{value:24}},vertexShader:K,fragmentShader:`
    ${q}
    uniform sampler2D tDiffuse;
    uniform float luminosityThreshold;
    uniform float smoothWidth;
    uniform float maxBrightness;
    varying vec2 vUv;

    void main() {
      vec3 c = pfxSafe(texture2D(tDiffuse, vUv).rgb);
      float br = max(c.r, max(c.g, c.b));
      float knee = max(smoothWidth, 1e-4);
      float soft = clamp(br - luminosityThreshold + knee, 0.0, 2.0 * knee);
      soft = soft * soft / (4.0 * knee);
      float contrib = max(soft, br - luminosityThreshold) / max(br, 1e-4);
      vec3 o = c * contrib;
      float m = max(o.r, max(o.g, o.b));
      o *= min(1.0, maxBrightness / max(m, 1e-4));
      gl_FragColor = vec4(o, 1.0);
    }
  `},ht={name:`LuminatiStreakPrefilter`,uniforms:{tBright:{value:null},uBrightTexel:{value:new U(1,1)},uThreshold:{value:1}},vertexShader:K,fragmentShader:`
    ${q}
    uniform sampler2D tBright;
    uniform vec2 uBrightTexel;
    uniform float uThreshold;

    void main() {
      // one bilinear tap at the shared corner of bright texels 2i, 2i + 1: their exact mean, also
      // where the bright target is not twice this one's size (an odd width or height; its last
      // block clamps to the edge)
      vec2 uv = (2.0 * floor(gl_FragCoord.xy) + 1.0) * uBrightTexel;
      vec3 c = pfxSafe(texture2D(tBright, uv).rgb);
      float br = max(c.r, max(c.g, c.b));
      // a soft knee half the threshold wide (the bright pass already took off the bloom's threshold)
      float knee = 0.5 * uThreshold + 1e-3;
      float soft = clamp(br - uThreshold + knee, 0.0, 2.0 * knee);
      soft = soft * soft / (4.0 * knee);
      gl_FragColor = vec4(c * (max(soft, br - uThreshold) / max(br, 1e-4)), 1.0);
    }
  `},gt={name:`LuminatiStreakBlur`,uniforms:{tSrc:{value:null},uTexel:{value:new U(1,1)},uStep:{value:1}},vertexShader:K,fragmentShader:`
    uniform sampler2D tSrc;
    uniform vec2 uTexel;
    uniform float uStep;
    varying vec2 vUv;

    void main() {
      vec2 o = vec2(uTexel.x * uStep, 0.0);
      vec3 c = texture2D(tSrc, vUv).rgb * 0.25
             + (texture2D(tSrc, vUv + o).rgb + texture2D(tSrc, vUv - o).rgb) * 0.2
             + (texture2D(tSrc, vUv + 2.0 * o).rgb + texture2D(tSrc, vUv - 2.0 * o).rgb) * 0.12
             + (texture2D(tSrc, vUv + 3.0 * o).rgb + texture2D(tSrc, vUv - 3.0 * o).rgb) * 0.055;
      gl_FragColor = vec4(c, 1.0);
    }
  `},_t={name:`LuminatiStreakComposite`,uniforms:{t1:{value:null},t2:{value:null},t3:{value:null},t4:{value:null},uTint:{value:new B(.25,.5,1)},uTintMix:{value:.85},uStrength:{value:1},uExposure:{value:1}},vertexShader:K,fragmentShader:`
    ${q}
    uniform sampler2D t1;
    uniform sampler2D t2;
    uniform sampler2D t3;
    uniform sampler2D t4;
    uniform vec3 uTint;
    uniform float uTintMix;
    uniform float uStrength;
    uniform float uExposure;
    varying vec2 vUv;

    void main() {
      vec3 s = texture2D(t1, vUv).rgb * 0.25 + texture2D(t2, vUv).rgb * 0.6
             + texture2D(t3, vUv).rgb * 1.2 + texture2D(t4, vUv).rgb * 2.4;
      // the lens coating's colour: the streak keeps its luminance, its hue drawn toward the tint
      vec3 tinted = pfxLuma(s) * uTint / max(pfxLuma(uTint), 1e-4);
      gl_FragColor = vec4(mix(s, tinted, uTintMix) * (uStrength * uExposure), 1.0);
    }
  `},vt=[48,64,96];function J(e,t,n={}){return new de(e,t,{type:A,format:s,depthBuffer:!1,stencilBuffer:!1,generateMipmaps:!1,minFilter:R,magFilter:R,...n})}function Y(e,t=null,n=null,r={}){let i=d.clone(e.uniforms);return t&&Object.assign(i,t),new ge({name:e.name,uniforms:i,defines:{...e.defines||{},...n||{}},vertexShader:e.vertexShader,fragmentShader:e.fragmentShader,glslVersion:e.glslVersion??null,depthTest:!1,depthWrite:!1,blending:0,toneMapped:!1,...r})}var yt=class{constructor(e){this.gl=e,this.ext=e.getExtension?e.getExtension(`EXT_disjoint_timer_query_webgl2`):null,this.enabled=!1,this.results={},this.min={},this.window={},this._pending=[],this._free=[],this._active=null}get supported(){return!!this.ext}begin(e){if(!this.enabled||!this.ext)return;this._active&&this.end();let t=this.gl,n=this._free.pop()||{q:t.createQuery(),label:``};n.label=e,t.beginQuery(this.ext.TIME_ELAPSED_EXT,n.q),this._active=n}end(){this._active&&=(this.gl.endQuery(this.ext.TIME_ELAPSED_EXT),this._pending.push(this._active),null)}poll(){if(!this.ext||this._pending.length===0)return;let e=this.gl,t=e.getParameter(this.ext.GPU_DISJOINT_EXT);for(;this._pending.length;){let n=this._pending[0];if(!e.getQueryParameter(n.q,e.QUERY_RESULT_AVAILABLE))break;let r=e.getQueryParameter(n.q,e.QUERY_RESULT);if(!t){let e=r/1e6,t=this.results[n.label];this.results[n.label]=t===void 0?e:t*.9+e*.1,this.min[n.label]=Math.min(this.min[n.label]??1/0,e),this.window[n.label]=Math.min(this.window[n.label]??1/0,e)}this._pending.shift(),this._free.push(n)}}dispose(){let e=this.gl;this._active&&this.end();for(let t of this._pending)e.deleteQuery(t.q);for(let t of this._free)e.deleteQuery(t.q);this._pending.length=0,this._free.length=0}},bt=class{constructor(e,n,r,i={}){this.renderer=e,this.scene=n,this.camera=r,this.samples=Math.max(0,i.samples??4)|0,this.dofScale=V(i.dofScale??.5,.25,1),this.maxTaps=Math.max(48,i.maxTaps??96),this.settings={enabled:!0,dof:{enabled:!0,focusDistance:24,focusRange:5,maxBlur:12,nearScale:1.4,farScale:1,tiltShift:.35,tiltCenter:.52,tiltWidth:.28,bokehBoost:1.5,autoFocus:!0,debug:!1,bokehThreshold:1.5,bokehSprites:!0,tiltFeather:.3,focusSpeed:4},bloom:{enabled:!0,strength:.55,radius:.55,threshold:.82,warmth:.25,knee:.35},grade:{enabled:!0,exposure:1,contrast:1.08,saturation:1.12,temperature:.08,tint:0,shadowsTint:[.02,.04,.08],highlightsTint:[.06,.03,-.02],vignette:.5,vignetteSoftness:.55,grain:.035,chromaticAberration:.0015,sharpen:.15,vignetteRoundness:.65,vignetteColor:[.05,.025,.04],grainSize:1,dither:1,highlightsWarm:0,highlightsLift:1},cinematic:{enabled:!1,streaks:1,streakThreshold:1,streakTint:[.25,.5,1],streakTintMix:.85,bokehSquash:1.6,tealOrange:.3,filmCurve:.25,black:[.025,.035,.045],white:[.97,.955,.92],grainChroma:.3}},this._focusTarget=null,this._time=0,this._w=0,this._h=0,this._hw=0,this._hh=0,this._taps=vt[0],this._v2=new U,this._clearColor=new m,this._bloomWarmth=-1,this._sceneInfo={calls:0,triangles:0,points:0,lines:0},this._depthTexture=new _e(1,1,t),this._sceneRT=J(1,1,{samples:this.samples,depthBuffer:!0,depthTexture:this._depthTexture}),this._prefilterRT=J(1,1,{count:2}),this._gatherRT=J(1,1),this._tentRT=J(1,1),this._nearBokehRT=J(1,1),this._hdrRT=J(1,1),this._ldrRT=J(1,1),this._sceneRT.texture.name=`PostFX.scene`,this._prefilterRT.textures[0].name=`PostFX.dofColorCoc`,this._prefilterRT.textures[1].name=`PostFX.dofHighlights`,this._gatherRT.texture.name=`PostFX.dofGather`,this._tentRT.texture.name=`PostFX.dofBlur`,this._nearBokehRT.texture.name=`PostFX.dofNearBokeh`,this._hdrRT.texture.name=`PostFX.hdr`,this._ldrRT.texture.name=`PostFX.ldr`,this._coc=rt(),this._prefilterMat=Y(at,this._coc),this._gatherMats=new Map,this._tentMat=Y(ut),this._spriteMat=Y(dt,null,null,{blending:5,blendEquation:100,blendSrc:201,blendDst:201,transparent:!0}),this._compositeMat=Y(ft,this._coc),this._debugMat=Y(ft,this._coc,{DEBUG:1}),this._gradeMat=Y(pt),this._copyMat=Y(nt),this._quad=new Xe(null),this._cine=null,this._stage=null,this._spriteGeo=new a,this._spriteCapacity=0,this._sprites=new u(this._spriteGeo,this._spriteMat),this._sprites.frustumCulled=!1,this._spriteCam=new ie(-1,1,1,-1,0,1);let o=e.getContext(),s=o.getParameter(o.ALIASED_POINT_SIZE_RANGE);this._spriteMat.uniforms.uMaxPointSize.value=Math.max(1,Math.min(256,s?s[1]:64));let c=this.settings.bloom;this._bloom=new $e(new U(2,2),c.strength,c.radius,c.threshold);let l=Y(mt);this._bloom.materialHighPassFilter.dispose(),this._bloom.materialHighPassFilter=l,this._bloom.highPassUniforms=l.uniforms,this._output=new tt,this._timer=new yt(o),e.getDrawingBufferSize(this._v2),this._allocate(Math.max(1,this._v2.x),Math.max(1,this._v2.y))}setSize(e,t,n=this.renderer.getPixelRatio()){let r=Math.max(1,Math.floor(e*n)),i=Math.max(1,Math.floor(t*n));(r!==this._w||i!==this._h)&&this._allocate(r,i)}setFocus(e,t=!1){Number.isFinite(e)&&(this._focusTarget=e,t&&this.settings.dof.autoFocus&&(this.settings.dof.focusDistance=e))}setSceneStage(e){this._stage=e}get sceneStage(){return this._stage}get depthTexture(){return this._depthTexture}get sceneTarget(){return this._sceneRT}get size(){return{width:this._w,height:this._h,dofWidth:this._hw,dofHeight:this._hh}}get taps(){return this._taps}get timings(){return this._timer.results}get timingsMin(){return this._timer.min}takeTimingsWindow(){let e=this._timer.window,t=0;for(let n in e)t+=e[n];return this._timer.window={},t}enableTimings(e=!0){return this._timer.enabled=!!e&&this._timer.supported,this._timer.enabled&&(this._timer.min={},this._timer.results={},this._timer.window={}),this._timer.enabled}render(e=1/60){let t=this.renderer,n=this.settings;e=Number.isFinite(e)?Math.min(Math.max(e,0),.25):1/60,this._time+=e;let r=n.dof;if(r.autoFocus&&this._focusTarget!==null&&(r.focusDistance+=(this._focusTarget-r.focusDistance)*fe(r.focusSpeed??4,e)),!n.enabled){t.setRenderTarget(null),this._renderScene();return}t.getDrawingBufferSize(this._v2),(this._v2.x!==this._w||this._v2.y!==this._h)&&this._allocate(this._v2.x,this._v2.y);let i=this._timer;i.poll();let a=this._stage;i.begin(`scene`),a&&a.beforeScene(this),t.setRenderTarget(this._sceneRT),t.autoClear||t.clear(),this._renderScene(),i.end();let o=t.autoClear;t.autoClear=!1;let s=this._sceneRT;a&&(i.begin(a.name),s=a.render(this),i.end());let c=s,l=!!r.debug;if(r.enabled||l){if(i.begin(`dof`),this._renderDof(l,s),i.end(),l){t.autoClear=o;return}c=this._hdrRT}let u=n.grade.enabled,d=n.cinematic.enabled&&u,f=!1;if(n.bloom.enabled&&n.bloom.strength>0&&(i.begin(`bloom`),c===this._sceneRT&&(this._copyMat.uniforms.tDiffuse.value=this._sceneRT.texture,this._blit(this._copyMat,this._hdrRT),c=this._hdrRT),this._updateBloom(),this._bloom.render(t,null,c,e,!1),i.end(),d&&n.cinematic.streaks>0&&(i.begin(`streaks`),this._renderStreaks(),f=!0,i.end())),i.begin(`output`),this._output.renderToScreen=!u,this._output.render(t,this._ldrRT,c),u){let e=d?this._cinematic().grade:this._gradeMat;this._updateGrade(e),d&&(e.uniforms.uStreaks.value=+!!f),e.uniforms.tDiffuse.value=this._ldrRT.texture,this._blit(e,null)}i.end(),t.autoClear=o}warmup(){let e=this.renderer,t=e.getRenderTarget(),n=e.autoClear;e.autoClear=!1;for(let e of vt)e<=this.maxTaps&&this._blit(this._gatherMaterial(e),this._gatherRT);for(let e of[this._prefilterMat,this._tentMat,this._compositeMat,this._debugMat,this._gradeMat,this._copyMat]){let t=e===this._prefilterMat?this._prefilterRT:e===this._gradeMat||e===this._debugMat?null:this._hdrRT;this._blit(e,t)}e.setRenderTarget(this._tentRT),e.render(this._sprites,this._spriteCam),this._updateBloom(),this._bloom.render(e,null,this._hdrRT,0,!1),this._output.renderToScreen=!1,this._output.render(e,this._ldrRT,this._hdrRT),this.settings.cinematic.enabled&&(this._renderStreaks(),this._blit(this._cinematic().grade,null)),this._stage&&this._stage.warmup(this),e.autoClear=n,e.setRenderTarget(t)}get sceneInfo(){return this._sceneInfo}dispose(){for(let e of[this._sceneRT,this._prefilterRT,this._gatherRT,this._tentRT,this._nearBokehRT,this._hdrRT,this._ldrRT])e.dispose();this._depthTexture.dispose(),this._prefilterMat.dispose();for(let e of this._gatherMats.values())e.dispose();this._gatherMats.clear();for(let e of[this._tentMat,this._spriteMat,this._compositeMat,this._debugMat,this._gradeMat,this._copyMat])e.dispose();if(this._cine){let e=this._cine;for(let t of[e.grade,e.prefilter,e.blur,e.composite])t.dispose();for(let t of e.targets)t.dispose();this._cine=null}this._spriteGeo.dispose(),this._quad.dispose(),this._bloom.dispose(),this._output.dispose(),this._timer.dispose()}_allocate(e,t){e=Math.max(1,e|0),t=Math.max(1,t|0),this._w=e,this._h=t;let n=Math.max(1,Math.ceil(e*this.dofScale)),r=Math.max(1,Math.ceil(t*this.dofScale));this._hw=n,this._hh=r,this._sceneRT.setSize(e,t),this._hdrRT.setSize(e,t),this._ldrRT.setSize(e,t);for(let e of[this._prefilterRT,this._gatherRT,this._tentRT,this._nearBokehRT])e.setSize(n,r);this._bloom.setSize(e,t);let i=Math.ceil(n/2)*Math.ceil(r/2);i>this._spriteCapacity&&(this._spriteCapacity=Math.ceil(i*1.25),this._spriteGeo.dispose(),this._spriteGeo.setAttribute(`position`,new b(new Uint8Array(this._spriteCapacity),1)),this._spriteGeo.boundingSphere=new C(new B,1),this._spriteGeo.boundingBox=new P(new B(-1,-1,-1),new B(1,1,1))),this._spriteGeo.setDrawRange(0,i);let a=this._prefilterMat.uniforms;a.uFullSize.value.set(e,t),a.uRatio.value.set(e/n,t/r),a.uScale.value=this.dofScale,this._tentMat.uniforms.uSize.value.set(n,r),this._spriteMat.uniforms.uSize.value.set(n,r);for(let i of[this._compositeMat,this._debugMat])i.uniforms.uHalfSize.value.set(n,r),i.uniforms.uHalfRatio.value.set(n/e,r/t),i.uniforms.uScale.value=this.dofScale,i.uniforms.uFullTexel.value.set(1/e,1/t);this._gradeMat.uniforms.uTexel.value.set(1/e,1/t),this._gradeMat.uniforms.uAspect.value=e/t,this._cine&&this._sizeCinematic()}_cinematic(){if(!this._cine){let e=[];for(let t=0;t<5;t++){let n=J(1,1);n.texture.name=`PostFX.streak${t}`,e.push(n)}this._cine={grade:Y(pt,null,{CINEMATIC:1}),prefilter:Y(ht),blur:Y(gt),composite:Y(_t),targets:e},this._cine.grade.uniforms.tStreak.value=e[0].texture,this._sizeCinematic()}return this._cine}_sizeCinematic(){let e=this._cine,t=this._w,n=this._h,r=Math.max(1,Math.ceil(t/4)),i=Math.max(1,Math.ceil(n/4));for(let t of e.targets)t.setSize(r,i);e.blur.uniforms.uTexel.value.set(1/r,1/i),e.grade.uniforms.uTexel.value.set(1/t,1/n),e.grade.uniforms.uAspect.value=t/n}_renderStreaks(){let e=this.settings.cinematic,t=this._cinematic(),n=t.targets,r=this._bloom.renderTargetBright,i=t.prefilter.uniforms;i.tBright.value=r.texture,i.uBrightTexel.value.set(1/r.width,1/r.height),i.uThreshold.value=Math.max(0,e.streakThreshold??1),this._blit(t.prefilter,n[0]);let a=t.blur.uniforms;for(let e=1;e<5;e++)a.tSrc.value=n[e-1].texture,a.uStep.value=3**(e-1),this._blit(t.blur,n[e]);let o=t.composite.uniforms;o.t1.value=n[1].texture,o.t2.value=n[2].texture,o.t3.value=n[3].texture,o.t4.value=n[4].texture,e.streakTint&&o.uTint.value.fromArray(e.streakTint),o.uTintMix.value=V(e.streakTintMix??.85,0,1),o.uStrength.value=Math.max(0,e.streaks),o.uExposure.value=Math.max(0,this.renderer.toneMappingExposure||1),this._blit(t.composite,n[0])}_renderScene(){let e=this.renderer.info,t=e.render,n=e.autoReset,r=n?0:t.calls,i=n?0:t.triangles,a=n?0:t.points,o=n?0:t.lines;this.renderer.render(this.scene,this.camera);let s=this._sceneInfo;s.calls=t.calls-r,s.triangles=t.triangles-i,s.points=t.points-a,s.lines=t.lines-o}_gatherMaterial(e){let t=this._gatherMats.get(e);return t||(t=Y(lt(e)),this._gatherMats.set(e,t)),t}_blit(e,t){this._quad.material=e,this.renderer.setRenderTarget(t),this._quad.render(this.renderer)}_clear(e){let t=this.renderer;t.getClearColor(this._clearColor);let n=t.getClearAlpha();t.setRenderTarget(e),t.setClearColor(0,0),t.clear(!0,!1,!1),t.setClearColor(this._clearColor,n)}_renderDof(e,t=this._sceneRT){let n=this.settings.dof,r=this.camera,i=this._coc,a=this.renderer,o=Math.max(0,n.maxBlur)*(this._h/1080);i.tDepth.value=this._depthTexture,i.uCamNear.value=r.near,i.uCamFar.value=r.far,i.uFocusDistance.value=n.focusDistance,i.uFocusRange.value=Math.max(.01,n.focusRange),i.uNearScale.value=Math.max(0,n.nearScale),i.uFarScale.value=Math.max(0,n.farScale),i.uMaxBlurPx.value=o,i.uTilt.value.set(Math.max(0,n.tiltShift),n.tiltCenter,Math.max(0,n.tiltWidth)),i.uTiltFeather.value=Math.max(.01,n.tiltFeather??.3),i.uOrtho.value=+!!r.isOrthographicCamera;let s=Math.max(n.nearScale,n.farScale,n.tiltShift,0),c=Math.max(1,o*s*this.dofScale),l=.3*Math.PI*c*c,u=vt[0];for(let e=0;e<vt.length;e++){let t=vt[e];if(t>this.maxTaps||(u=t,t>=l))break}this._taps=u;let d=n.bokehSprites!==!1&&!e,f=Math.max(.001,a.toneMappingExposure||1),p=this._prefilterRT.textures[0],m=this._prefilterRT.textures[1],h=this._prefilterMat.uniforms;h.tColor.value=t.texture,h.uBokehThreshold.value=Math.max(.05,n.bokehThreshold??1.5)/f,h.uSprites.value=+!!d,this._blit(this._prefilterMat,this._prefilterRT);let g=this._gatherMaterial(u);g.uniforms.tColorCoc.value=p,g.uniforms.uTexel.value.set(1/this._hw,1/this._hh),g.uniforms.uRadius.value=c,this._blit(g,this._gatherRT);let _=this._tentMat.uniforms;if(_.tBlur.value=this._gatherRT.texture,_.tColorCoc.value=p,this._blit(this._tentMat,this._tentRT),d){let e=this._spriteMat.uniforms;e.tColorCoc.value=p,e.tHighlight.value=m,e.tGather.value=this._gatherRT.texture,e.uBoost.value=Math.max(0,n.bokehBoost),e.uMaxRadius.value=c;let t=this.settings.cinematic;e.uSquash.value=t.enabled?V(t.bokehSquash??1,1,3):1,e.uMode.value=0,a.setRenderTarget(this._tentRT),a.render(this._sprites,this._spriteCam),e.uMode.value=1,this._clear(this._nearBokehRT),a.render(this._sprites,this._spriteCam)}let v=e?this._debugMat:this._compositeMat;v.uniforms.tColor.value=t.texture,v.uniforms.tBlur.value=this._tentRT.texture,v.uniforms.tColorCoc.value=p,v.uniforms.tNearBokeh.value=this._nearBokehRT.texture,v.uniforms.uNearBokeh.value=+!!d,v.uniforms.uMaxCocPx.value=Math.max(1,o*s),this._blit(v,e?null:this._hdrRT)}_updateBloom(){let e=this.settings.bloom,t=this._bloom;t.strength=e.strength,t.radius=e.radius,t.threshold=e.threshold,t.highPassUniforms.smoothWidth.value=Math.max(.01,e.knee??.35);let n=e.warmth??0;if(n!==this._bloomWarmth){this._bloomWarmth=n;let e=t.bloomTintColors.length;for(let r=0;r<e;r++){let i=V(n*(.35+.65*(r/Math.max(1,e-1))),0,1);t.bloomTintColors[r].set(1+.08*i,1-.1*i,1-.32*i)}}}_updateGrade(e){let t=this.settings.grade,n=e.uniforms;n.uExposure.value=t.exposure,n.uContrast.value=t.contrast,n.uSaturation.value=t.saturation,n.uTemperature.value=t.temperature,n.uTint.value=t.tint,n.uShadowsTint.value.fromArray(t.shadowsTint),n.uHighlightsTint.value.fromArray(t.highlightsTint);let r=t.highlightsLift??1;if(r!==1&&n.uHighlightsTint.value.multiplyScalar(r),n.uHighlightsWarm.value=t.highlightsWarm??0,n.uVignette.value=t.vignette,n.uVignetteSoftness.value=t.vignetteSoftness,n.uVignetteRoundness.value=t.vignetteRoundness??.65,t.vignetteColor&&n.uVignetteColor.value.fromArray(t.vignetteColor),n.uGrain.value=t.grain,n.uGrainSize.value=Math.max(1,t.grainSize??1),n.uGrainSeed.value=Math.floor(this._time*24)%997,n.uCA.value=t.chromaticAberration,n.uSharpen.value=t.sharpen,n.uDither.value=t.dither??1,e===this._gradeMat)return;let i=this.settings.cinematic;n.uTealOrange.value=V(i.tealOrange??0,0,1),n.uFilmCurve.value=V(i.filmCurve??0,0,1),i.black&&n.uBlack.value.fromArray(i.black),i.white&&n.uWhite.value.fromArray(i.white),n.uGrainChroma.value=V(i.grainChroma??0,0,1)}},xt=new Set,St=`
float luminatiBayer4( vec2 p ) {
	ivec2 q = ivec2( mod( floor( p ), 4.0 ) );
	const float M[ 16 ] = float[ 16 ]( 0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0 );
	return ( M[ q.y * 4 + q.x ] + 0.5 ) / 16.0;
}
`,Ct=`
varying vec3 vViewPosition;
uniform float uWrap;

struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};

void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = dot( geometryNormal, directLight.direction );
	float wrapped = saturate( ( dotNL + uWrap ) / ( 1.0 + uWrap ) );
	reflectedLight.directDiffuse += wrapped * directLight.color * BRDF_Lambert( material.diffuseColor );
}

void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}

#define RE_Direct RE_Direct_Lambert
#define RE_IndirectDiffuse RE_IndirectDiffuse_Lambert
`,wt=`
	{
		vec3 lnUp = normalize( ( viewMatrix * vec4( 0.0, 1.0, 0.0, 0.0 ) ).xyz );
		vec3 lnCam = isOrthographic ? vec3( 0.0, 0.0, 1.0 ) : normalize( vViewPosition );
		vec3 lnN = normalize( mix( lnCam, lnUp, uNormalUp ) );
		lnN = normalize( lnN + vec3( ( vQuadUv.x * 2.0 - 1.0 ) * uRoundness, 0.0, 0.0 ) );
		normal = lnN;
		nonPerturbedNormal = lnN;
	}
`,Tt=`
#ifdef USE_SHADOWMAP
	vec4 luminatiSavedWorldPosition = worldPosition;
	{
		vec3 lsH = vec3( uSunDirection.x, 0.0, uSunDirection.z );
		float lsLen = length( lsH );
		vec3 lsN = lsH / max( lsLen, 1e-4 );
		float lsSd = dot( worldPosition.xyz - ( LUMINATI_SHADOW_CENTER ), lsN );
		float lsSkip = max( 0.0, - lsSd ) / max( lsLen, 0.25 ) * uShadowSkip + uShadowSkipBias;
		worldPosition.xyz += uSunDirection * lsSkip;
	}
#endif
#include <shadowmap_vertex>
#ifdef USE_SHADOWMAP
	worldPosition = luminatiSavedWorldPosition;
#endif
`;function Et(e,t,{shadowCenter:n=`modelMatrix[ 3 ].xyz`}={}){Object.assign(e.uniforms,t),e.uniforms.uSunDirection=G.uSunDirection,e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec2 vQuadUv;
uniform vec3 uSunDirection;
uniform float uShadowSkip;
uniform float uShadowSkipBias;
#define LUMINATI_SHADOW_CENTER ${n}`).replace(`#include <uv_vertex>`,`#include <uv_vertex>
	vQuadUv = uv;`).replace(`#include <shadowmap_vertex>`,Tt),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
varying vec2 vQuadUv;
uniform float uNormalUp;
uniform float uRoundness;`).replace(`#include <lights_lambert_pars_fragment>`,Ct).replace(`#include <normal_fragment_maps>`,`#include <normal_fragment_maps>\n${wt}`)}var Dt=`getPointLightInfo( pointLight, geometryPosition, directLight );`;if(!ye.lights_fragment_begin.includes(Dt))throw Error(`Sprite3D: three's lights_fragment_begin changed (the point lights under a hit flash)`);var Ot=ye.lights_fragment_begin.replace(Dt,`${Dt}\n\t\tdirectLight.color *= 1.0 - uFlash.a;`);function kt(e,t){e.uniforms.uFlash=t.uFlash,e.uniforms.uGlow=t.uGlow,e.uniforms.uHighlight=t.uHighlight,e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform vec4 uFlash;
uniform vec4 uGlow;
uniform vec4 uHighlight;`).replace(`#include <lights_fragment_begin>`,Ot).replace(`totalEmissiveRadiance *= diffuseColor.rgb;`,`totalEmissiveRadiance *= diffuseColor.rgb;
	if ( diffuseColor.a < 0.98 ) totalEmissiveRadiance += uGlow.rgb * uGlow.a * diffuseColor.rgb;`).replace(`#include <opaque_fragment>`,`#include <opaque_fragment>
	if ( uHighlight.a > 0.0 ) {
		vec3 hlBase = gl_FragColor.rgb;
		float hlLum = dot( hlBase, vec3( 0.2126, 0.7152, 0.0722 ) );
		gl_FragColor.rgb += ( hlBase * uHighlight.rgb * ( 1.0 - smoothstep( 0.45, 1.2, hlLum ) ) + uHighlight.rgb * 0.035 ) * uHighlight.a;
	}
	gl_FragColor.rgb = mix( gl_FragColor.rgb, uFlash.rgb, uFlash.a );`)}function At(e){let t=e.source.version,n=e.clone();return n.source.version=t,n}var jt=null,Mt=0;function Nt(){if(!jt){let e=document.createElement(`canvas`);e.width=32,e.height=32;let t=e.getContext(`2d`),n=t.createImageData(32,32);for(let e=0;e<32;e++)for(let t=0;t<32;t++){let r=(t+.5)/32*2-1,i=(e+.5)/32*2-1,a=1-Ft(.2,1,Math.sqrt(r*r+i*i)),o=(e*32+t)*4;n.data[o]=n.data[o+1]=n.data[o+2]=255,n.data[o+3]=Math.round(a*255)}t.putImageData(n,0,0);let r=new S(e);r.colorSpace=``,r.generateMipmaps=!0,r.minFilter=ce,r.magFilter=R;let i=new h(1,1);i.rotateX(-Math.PI/2),jt={texture:r,geometry:i}}return Mt++,jt}function Pt(){--Mt<=0&&jt&&(jt.texture.dispose(),jt.geometry.dispose(),jt=null,Mt=0)}function Ft(e,t,n){let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)}var It=/_(down|left|right|up)$/,Lt=new v;function Rt(e){if(!e||e.frameWidth)return e;let t=Math.max(1,e.frames|0||1),n=e.texture&&e.texture.image,r=e.width;t>1&&n&&n.width&&Math.abs(n.width-e.width)<.5&&(r=e.width/t);let i={};if(t>1){let n=[];for(let e=0;e<t;e++)n.push({col:e,row:0});i.idle={frames:n,fps:e.fps||8,loop:!0}}return{texture:e.texture,canvas:e.canvas,frameWidth:r,frameHeight:e.height,columns:t,rows:1,pixelsPerUnit:e.pixelsPerUnit||16,anchor:e.anchor||[.5,0],animations:i}}var zt=class e extends D{constructor(e,t={}){super(),e=Rt(e);let n={billboard:`cylindrical`,tilt:0,castShadow:!0,shadowMode:`sunFacing`,blobShadow:!0,lit:!0,alphaTest:.5,emissive:null,emissiveIntensity:1,scale:1,renderOrder:0,receiveShadow:!0,normalUp:.55,wrap:.6,roundness:.8,ditherMode:`screen`,blobSize:null,blobOpacity:.5,tint:null,animation:null,direction:`down`,combatFx:!1,...t};this.type=`Sprite3D`,this.isSprite3D=!0,this._opts=n,this.sheet=e,this._resolveCache=new Map,this.billboard=n.billboard,this.tilt=n.tilt,this.speed=1,this.playing=!0,this.animation=null,this.direction=ne.includes(n.direction)?n.direction:`down`,this.finished=!1,this.onFrameChange=null,this.onAnimationEnd=null,this._anim=null,this._animKey=null,this._autoFlip=!1,this._flipX=!1,this._frame=0,this._time=0,this._col=0,this._row=0,this._opacity=1,this._bodyOpacity=1,this._shadowMode=n.shadowMode===`billboard`?`billboard`:`sunFacing`;let r=e.pixelsPerUnit||16,i=e.texture.image,a=i&&i.width||e.canvas&&e.canvas.width||e.columns*e.frameWidth,o=i&&i.height||e.canvas&&e.canvas.height||e.rows*e.frameHeight;this._frameU=e.frameWidth/a,this._frameV=e.frameHeight/o,this.texture=At(e.texture),this.texture.matrixAutoUpdate=!0;let[s,c]=e.anchor||[.5,0],l=e.frameWidth/r,u=e.frameHeight/r;this._size=new U(l,u);let d=new h(l,u);if(d.translate(l*(.5-s),u*(.5-c),0),this._uniforms={uNormalUp:{value:n.normalUp},uWrap:{value:n.wrap},uRoundness:{value:n.roundness},uShadowSkip:{value:0},uShadowSkipBias:{value:.04},uDitherOpacity:{value:1},uShadowDither:{value:1},uDitherTexel:{value:+(n.ditherMode===`texel`)},uFrameSize:{value:new U(e.frameWidth,e.frameHeight)}},this._fx=!!(n.combatFx&&n.lit),this._fx&&(this._uniforms.uFlash={value:new M(0,0,0,0)},this._uniforms.uGlow={value:new M(0,0,0,0)},this._uniforms.uHighlight={value:new M(0,0,0,0)}),this.material=n.lit?this._createLitMaterial(n):this._createUnlitMaterial(n),n.tint!=null&&this.material.color.set(n.tint),this.mesh=new W(d,this.material),this.mesh.name=`Sprite3D.mesh`,this.mesh.rotation.order=`YXZ`,this.mesh.renderOrder=n.renderOrder,this.mesh.customDepthMaterial=this._createDepthMaterial(),this.add(this.mesh),this._proxyMaterial=new y({map:this.texture,alphaTest:n.alphaTest,side:2,colorWrite:!1,depthWrite:!1,fog:!1}),this.shadowProxy=new W(d,this._proxyMaterial),this.shadowProxy.name=`Sprite3D.shadowProxy`,this.shadowProxy.castShadow=!0,this.shadowProxy.receiveShadow=!1,this.shadowProxy.customDepthMaterial=this.mesh.customDepthMaterial,this.add(this.shadowProxy),this.blob=null,this._blobOpacity=n.blobOpacity,n.blobShadow){let e=Nt();this._blobMaterial=new y({color:788498,map:e.texture,transparent:!0,opacity:n.blobOpacity,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-4});let t=n.blobSize||[Math.max(.7,l*.52),Math.max(.36,l*.26)];this.blob=new W(e.geometry,this._blobMaterial),this.blob.name=`Sprite3D.blob`,this.blob.scale.set(t[0],1,t[1]),this.blob.position.y=.012,this.blob.renderOrder=j.DECALS,this.blob.castShadow=!1,this.blob.receiveShadow=!1,this.add(this.blob)}this.scale.setScalar(n.scale),this._ready=!0,this.castShadow=n.castShadow,this.receiveShadow=n.receiveShadow;let f=n.animation||(this._resolve(`idle`)?`idle`:null);f&&this._resolve(f)?this.play(f):this._applyFrame()}_createLitMaterial(e){let t=this._uniforms,n=new x({map:this.texture,alphaTest:e.alphaTest,side:2});return e.emissive!=null&&(n.emissive.set(e.emissive),n.emissiveIntensity=e.emissiveIntensity??1),n.onBeforeCompile=e=>{Et(e,t),e.uniforms.uDitherOpacity=t.uDitherOpacity,e.uniforms.uDitherTexel=t.uDitherTexel,e.uniforms.uFrameSize=t.uFrameSize,e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform float uDitherOpacity;
uniform float uDitherTexel;
uniform vec2 uFrameSize;
${St}`).replace(`#include <alphatest_fragment>`,`#include <alphatest_fragment>
	if ( uDitherOpacity < 0.999 ) {
		vec2 ldp = mix( gl_FragCoord.xy, vQuadUv * uFrameSize, uDitherTexel );
		if ( uDitherOpacity <= luminatiBayer4( ldp ) ) discard;
	}`).replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>
	totalEmissiveRadiance *= diffuseColor.rgb;`),t.uFlash&&kt(e,t)},n.customProgramCacheKey=t.uFlash?()=>`luminati-sprite3d-lit-fx-v1`:()=>`luminati-sprite3d-lit-v1`,n}_createUnlitMaterial(e){let t=this._uniforms,n=new y({map:this.texture,alphaTest:e.alphaTest,side:2});return e.emissive!=null&&n.color.set(e.emissive).multiplyScalar(e.emissiveIntensity??1),n.onBeforeCompile=e=>{e.uniforms.uDitherOpacity=t.uDitherOpacity,e.uniforms.uDitherTexel=t.uDitherTexel,e.uniforms.uFrameSize=t.uFrameSize,e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec2 vQuadUv;`).replace(`#include <uv_vertex>`,`#include <uv_vertex>
	vQuadUv = uv;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
varying vec2 vQuadUv;
uniform float uDitherOpacity;
uniform float uDitherTexel;
uniform vec2 uFrameSize;
${St}`).replace(`#include <alphatest_fragment>`,`#include <alphatest_fragment>
	if ( uDitherOpacity < 0.999 ) {
		vec2 ldp = mix( gl_FragCoord.xy, vQuadUv * uFrameSize, uDitherTexel );
		if ( uDitherOpacity <= luminatiBayer4( ldp ) ) discard;
	}`)},n.customProgramCacheKey=()=>`luminati-sprite3d-unlit-v1`,n}_createDepthMaterial(){let e=this._uniforms,t=new i({depthPacking:ee,map:this.texture,alphaTest:this.material.alphaTest,side:2});return t.onBeforeCompile=t=>{t.uniforms.uDitherOpacity=e.uShadowDither,t.fragmentShader=t.fragmentShader.replace(`#include <common>`,`#include <common>\nuniform float uDitherOpacity;\n${St}`).replace(`#include <alphatest_fragment>`,`#include <alphatest_fragment>
	if ( uDitherOpacity < 0.999 && uDitherOpacity <= luminatiBayer4( gl_FragCoord.xy ) ) discard;`)},t.customProgramCacheKey=()=>`luminati-sprite3d-depth-v1`,t}get tint(){return this.material.color}set tint(e){this.material.color.set(e)}get opacity(){return this._opacity}set opacity(e){this._opacity=e<0?0:e>1?1:e,this._applyOpacity()}get bodyOpacity(){return this._bodyOpacity}set bodyOpacity(e){this._bodyOpacity=e<0?0:e>1?1:e,this._applyOpacity()}_applyOpacity(){let e=this._opacity,t=e*this._bodyOpacity;this._uniforms.uDitherOpacity.value=t,this._uniforms.uShadowDither.value=e;let n=e>.001;this.mesh.visible=this._shadowMode===`billboard`?n:t>.001,this.blob&&(this._blobMaterial.opacity=this._blobOpacity*e,this.blob.visible=n),this._applyShadowFlags()}get flipX(){return this._flipX}set flipX(e){e=!!e,e!==this._flipX&&(this._flipX=e,this._applyFrame())}get castShadow(){return!!this._castShadow}set castShadow(e){this._castShadow=!!e,this._ready&&this._applyShadowFlags()}get receiveShadow(){return!!this._receiveShadow}set receiveShadow(e){this._receiveShadow=!!e,this._ready&&this._applyShadowFlags()}get shadowMode(){return this._shadowMode}set shadowMode(e){this._shadowMode=e===`billboard`?`billboard`:`sunFacing`,this._ready&&this._applyOpacity()}get frame(){return this._frame}setFlash(e,t,n,r){return this._fx&&this._uniforms.uFlash.value.set(e,t,n,r),this}setGlow(e,t,n,r){return this._fx&&this._uniforms.uGlow.value.set(e,t,n,r),this}setHighlight(e,t,n,r){return this._fx&&this._uniforms.uHighlight.value.set(e,t,n,r),this}get flash(){return this._fx?this._uniforms.uFlash.value.toArray():[0,0,0,0]}get highlight(){return this._fx?this._uniforms.uHighlight.value.toArray():[0,0,0,0]}get glow(){return this._fx?this._uniforms.uGlow.value.toArray():[0,0,0,0]}get size(){return this._size}_applyShadowFlags(){let e=this._castShadow&&this._opacity>.001,t=this._shadowMode===`sunFacing`;this.shadowProxy.visible=e&&t,this.mesh.castShadow=e&&!t,this.mesh.receiveShadow=!!this._receiveShadow,this._uniforms.uShadowSkip.value=e&&t?1:0}_resolve(e,t=this.direction){let n=this._resolveCache.get(e);n||(n=new Map,this._resolveCache.set(e,n));let r=n.get(t);return r===void 0&&(r=this._resolveUncached(e,t),n.set(t,r)),r}_resolveUncached(e,t){let n=this.sheet.animations||{},r=It.exec(e),i=r?e.slice(0,-r[0].length):e,a=r?r[1]:t;if(!r&&n[e])return{key:e,name:e,base:null,anim:n[e],flip:!1};let o=`${i}_${a}`;if(n[o])return{key:o,name:o,base:i,anim:n[o],flip:!1};let s=a===`left`?`right`:a===`right`?`left`:null;return s&&n[`${i}_${s}`]?{key:`${i}_${s}`,name:o,base:i,anim:n[`${i}_${s}`],flip:!0}:r&&n[e]?{key:e,name:e,base:i,anim:n[e],flip:!1}:null}play(e,t={}){let{restart:r=!1,speed:i,keepPhase:a=!1}=t,o=this._resolve(e);return o?o.name===this.animation&&!r&&!this.finished?(i!==void 0&&(this.speed=i),this.playing=!0,this):(this.speed=i===void 0?1:i,this._setAnimation(o,!a||r||this.finished),this.playing=!0,this):(xt.has(e)||(xt.add(e),console.warn(`Sprite3D: unknown animation "${n(e)}"`)),this)}_setAnimation(e,t){if(this._anim=e.anim,this._animKey=e.key,this._autoFlip=e.flip,this.animation=e.name,e.base!==null){let t=It.exec(e.name);t&&(this.direction=t[1])}let n=Math.max(1,e.anim.frames.length);t?(this._frame=0,this._time=0,this.finished=!1):this._frame%=n;let r=e.anim.frames[this._frame]||e.anim.frames[0];r&&(this._col=r.col,this._row=r.row),this._applyFrame()}setDirection(e){if(e===this.direction||!ne.includes(e))return this;if(this.direction=e,this.animation){let t=It.exec(this.animation);if(t){let n=this._resolve(`${this.animation.slice(0,-t[0].length)}_${e}`,e);n&&this._setAnimation(n,!1)}}return this}faceVector(t,n,r=G.uCameraYaw.value){let i=e.directionFromVector(t,n,r,this.direction);return this.setDirection(i)}setFrame(e,t){return this._col=e,this._row=t,this._autoFlip=!1,this._anim=null,this._animKey=null,this.animation=null,this.finished=!1,this._frame=0,this._time=0,this.playing=!1,this._applyFrame(),this}_applyFrame(){let e=this.texture,t=this._frameU,n=this._frameV,r=this._flipX!==this._autoFlip;e.repeat.set(r?-t:t,n),e.offset.set((this._col+ +!!r)*t,1-(this._row+1)*n)}update(e,t){let n=this._anim;if(this.playing&&n&&n.frames.length>0){let t=n.fps>0?n.fps:8;this._time+=e*this.speed;let r=1/t;if(this._time>=r){let e=Math.floor(this._time/r);this._time-=e*r;let t=n.frames.length,i=this._frame+e;if(i>=t&&(n.loop===!1?(i=t-1,this.playing=!1,this.finished||(this.finished=!0,this.onAnimationEnd&&this.onAnimationEnd(this.animation))):i%=t),i!==this._frame){this._frame=i;let e=n.frames[i];this._col=e.col,this._row=e.row,this._applyFrame(),this.onFrameChange&&this.onFrameChange(i,this.animation)}}}let r=G.uCameraYaw.value,i=this.rotation.y;if(this.billboard===`cylindrical`||this.billboard===`spherical`&&!t){let e=0;if(t&&this.tilt!==0){let n=t.matrixWorld.elements[9];e=Math.asin(n<-1?-1:n>1?1:n)}this.mesh.rotation.set(-e*this.tilt,r-i,0)}else this.billboard===`spherical`&&(Lt.setFromRotationMatrix(t.matrixWorld),this.mesh.quaternion.copy(this.quaternion).invert().multiply(Lt));if(this.shadowProxy.visible){let e=G.uSunDirection.value;e.x*e.x+e.z*e.z>1e-8&&(this.shadowProxy.rotation.y=Math.atan2(e.x,e.z)-i)}this.blob&&(this.blob.rotation.y=r-i)}static directionFromVector(e,t,n=0,r=`down`){let i=Math.cos(n),a=Math.sin(n),o=e*i-t*a,s=e*a+t*i,c=Math.abs(o),l=Math.abs(s);if(c<1e-6&&l<1e-6)return r;let u=r===`left`||r===`right`,d=1.15;return(u?c*d>=l:c>l*d)?o>0?`right`:`left`:s>0?`down`:`up`}clone(){let e=new this.constructor(this.sheet,{...this._opts,animation:null,direction:this.direction});return e.name=this.name,e.visible=this.visible,e.position.copy(this.position),e.quaternion.copy(this.quaternion),e.scale.copy(this.scale),e.billboard=this.billboard,e.tilt=this.tilt,e.tint.copy(this.tint),this.material.emissive&&e.material.emissive&&(e.material.emissive.copy(this.material.emissive),e.material.emissiveIntensity=this.material.emissiveIntensity),e.flipX=this.flipX,e.opacity=this.opacity,e.bodyOpacity=this.bodyOpacity,e.shadowMode=this.shadowMode,e.castShadow=this.castShadow,e.receiveShadow=this.receiveShadow,this._fx&&(e._uniforms.uFlash.value.copy(this._uniforms.uFlash.value),e._uniforms.uGlow.value.copy(this._uniforms.uGlow.value),e._uniforms.uHighlight.value.copy(this._uniforms.uHighlight.value)),this.animation?e.play(this.animation,{speed:this.speed}):e.setFrame(this._col,this._row),e.playing=this.playing,e}dispose(){this.parent&&this.parent.remove(this),this.mesh.geometry.dispose(),this.material.dispose(),this.mesh.customDepthMaterial.dispose(),this._proxyMaterial.dispose(),this.texture.dispose(),this.blob&&(this._blobMaterial.dispose(),this.blob=null,Pt()),this._anim=null,this.onFrameChange=null,this.onAnimationEnd=null}},Bt=class{constructor({capacity:e=256}={}){this.capacity=e,this.mesh=null,this.sprites=[],this._alpha=null}adopt(e){let t=e?.blob;return!t||this.sprites.includes(e)?!1:(this.mesh||this._create(t),t.layers.disable(0),this.sprites.push(e),!0)}release(e){let t=this.sprites.indexOf(e);return t<0?!1:(this.sprites.splice(t,1),e.blob?.layers.enable(0),!0)}update(){let e=this.mesh;if(!e)return;let t=this._alpha.array,n=0;for(let r=0;r<this.sprites.length&&n<this.capacity;r++){let i=this.sprites[r].blob;if(!i||!Vt(i))continue;let a=i.material.opacity;a>.001&&(i.updateWorldMatrix(!0,!1),e.setMatrixAt(n,i.matrixWorld),t[n]=a,n++)}e.count=n,e.instanceMatrix.needsUpdate=!0,this._alpha.needsUpdate=!0}dispose(){for(let e of this.sprites)e.blob?.layers.enable(0);this.sprites.length=0,this.mesh&&=(this.mesh.removeFromParent(),this.mesh.geometry.dispose(),this.mesh.material.dispose(),this.mesh.dispose?.(),null)}_create(e){let t=e.material,n=e.geometry.clone();this._alpha=new L(new Float32Array(this.capacity),1),this._alpha.setUsage(T),n.setAttribute(`aBlobAlpha`,this._alpha);let r=new y({color:t.color.clone(),map:t.map,transparent:!0,opacity:1,depthWrite:!1,polygonOffset:t.polygonOffset,polygonOffsetFactor:t.polygonOffsetFactor,polygonOffsetUnits:t.polygonOffsetUnits,fog:t.fog});r.name=`luminati:blob-batch`,r.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
attribute float aBlobAlpha;
varying float vBlobAlpha;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
	vBlobAlpha = aBlobAlpha;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
varying float vBlobAlpha;`).replace(`#include <alphamap_fragment>`,`#include <alphamap_fragment>
	diffuseColor.a *= vBlobAlpha;`)},r.customProgramCacheKey=()=>`luminati-blob-batch`;let i=new ue(n,r,this.capacity);i.name=`BlobBatch`,i.instanceMatrix.setUsage(T),i.count=0,i.renderOrder=e.renderOrder,i.castShadow=!1,i.receiveShadow=!1,i.frustumCulled=!1,i.matrixAutoUpdate=!1,this.mesh=i}};function Vt(e){for(let t=e;t;t=t.parent){if(!t.visible)return!1;if(t.isScene)return!0}return!1}var Ht=`
uniform float uTime;
uniform float uCameraYaw;
uniform vec2 uWind;
uniform float uWindStrength;
uniform float uFoliageWind;
uniform float uAnchorY;
uniform float uQuadHeight;
uniform float uFrameU;
#ifdef LUMINATI_FACE_SUN
uniform vec3 uSunDirection;
#endif
attribute float aFrame;

float luminatiFoliageYaw() {
#ifdef LUMINATI_FACE_SUN
	vec2 sh = uSunDirection.xz;
	return dot( sh, sh ) > 1e-8 ? atan( sh.x, sh.y ) : uCameraYaw;
#else
	return uCameraYaw;
#endif
}

vec3 luminatiYawRotate( vec3 v, float yaw ) {
	float c = cos( yaw );
	float s = sin( yaw );
	return vec3( v.x * c + v.z * s, v.y, - v.x * s + v.z * c );
}
`,Ut=`
	vec3 transformed = luminatiYawRotate( vec3( position ), luminatiFoliageYaw() );
	{
		vec3 lfPos = vec3( 0.0 );
		float lfScale = 1.0;
		#ifdef USE_INSTANCING
			lfPos = instanceMatrix[ 3 ].xyz;
			lfScale = max( length( instanceMatrix[ 0 ].xyz ), 1e-4 );
		#endif
		float lfW = clamp( ( uv.y - uAnchorY ) / max( 1.0 - uAnchorY, 1e-3 ), 0.0, 1.0 );
		float lfWindLen = length( uWind );
		vec2 lfDir = lfWindLen > 1e-4 ? uWind / lfWindLen : vec2( 1.0, 0.0 );
		float lfHash = fract( sin( dot( lfPos.xz, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );
		float lfWave = dot( lfPos.xz, lfDir ) * 0.42 - uTime * ( 1.25 + lfWindLen * 0.55 );
		float lfGust = 0.5 + 0.5 * sin( lfWave ) + 0.25 * sin( lfWave * 0.37 + 1.7 );
		lfGust = lfGust * lfGust;
		float lfFlutter = sin( uTime * ( 2.1 + lfHash * 1.9 ) + lfHash * 6.2831 );
		float lfAmt = uWindStrength * uFoliageWind * ( 0.03 + 0.06 * lfWindLen ) * uQuadHeight * lfScale;
		vec2 lfSway = lfDir * lfAmt * ( 0.3 + lfGust * 1.1 + lfFlutter * 0.25 )
			+ vec2( - lfDir.y, lfDir.x ) * lfAmt * lfFlutter * 0.3;
		transformed.xz += lfSway * lfW / lfScale;
		transformed.y -= dot( lfSway, lfSway ) * lfW / ( lfScale * max( uQuadHeight * lfScale, 0.2 ) ) * 0.5;
	}
`,Wt=class{constructor(e){let{sprite:t,instances:n,wind:r=1,castShadow:a=!1,receiveShadow:o=!0,alphaTest:s=.5,normalUp:c=.8,wrap:l=.5,roundness:u=.25,rootDarken:d=.35,randomFrames:f=!1,variance:p=.08,seed:g=1,name:_=`Foliage`}=e,v=t.pixelsPerUnit||16,y=Math.max(1,t.frames|0||1),b=t.texture.image,S=t.width;y>1&&b&&b.width&&Math.abs(b.width-t.width)<.5&&(S=t.width/y);let C=t.height,[w,T]=t.anchor||[.5,0],E=S/v,D=C/v,O=n.length,te=new h(E,D);te.translate(E*(.5-w),D*(.5-T),0);let k=new L(new Float32Array(Math.max(1,O)),1);te.setAttribute(`aFrame`,k),this._ownsTexture=y>1,this.texture=y>1?At(t.texture):t.texture,y>1&&(this.texture.repeat.set(1/y,1),this.texture.offset.set(0,0)),this._uniforms={uTime:G.uTime,uCameraYaw:G.uCameraYaw,uWind:G.uWind,uWindStrength:G.uWindStrength,uFoliageWind:{value:r},uAnchorY:{value:T},uQuadHeight:{value:D},uFrameU:{value:1/y},uRootDarken:{value:d},uNormalUp:{value:c},uWrap:{value:l},uRoundness:{value:u},uShadowSkip:{value:+!!a},uShadowSkipBias:{value:a?.03:0}};let A=this._uniforms,j=new x({map:this.texture,alphaTest:s,side:2});j.onBeforeCompile=e=>{Et(e,A,{shadowCenter:`( modelMatrix * vec4( instanceMatrix[ 3 ].xyz, 1.0 ) ).xyz`}),Object.assign(e.uniforms,A),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>\n${Ht}`).replace(`#include <beginnormal_vertex>`,`#include <beginnormal_vertex>
	objectNormal = luminatiYawRotate( objectNormal, luminatiFoliageYaw() );`).replace(`#include <begin_vertex>`,Ut).replace(`#include <uv_vertex>`,`#include <uv_vertex>
#ifdef USE_MAP
	vMapUv.x += aFrame * uFrameU;
#endif`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform float uRootDarken;`).replace(`#include <map_fragment>`,`#include <map_fragment>
	diffuseColor.rgb *= mix( 1.0 - uRootDarken, 1.0, smoothstep( 0.0, 0.6, vQuadUv.y ) );`)},j.customProgramCacheKey=()=>`luminati-foliage-lit-v1`,this.material=j;let M=new i({depthPacking:ee,map:this.texture,alphaTest:s,side:2});M.onBeforeCompile=e=>{Object.assign(e.uniforms,A),e.uniforms.uSunDirection=G.uSunDirection,e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>\n#define LUMINATI_FACE_SUN\n${Ht}`).replace(`#include <begin_vertex>`,Ut).replace(`#include <uv_vertex>`,`#include <uv_vertex>
#ifdef USE_MAP
	vMapUv.x += aFrame * uFrameU;
#endif`)},M.customProgramCacheKey=()=>`luminati-foliage-depth-v1`,this.depthMaterial=M,this.object=new ue(te,j,Math.max(1,O)),this.object.name=_,this.object.count=O,this.object.customDepthMaterial=M,this.object.castShadow=a,this.object.receiveShadow=o;let P=new re(g),F=new N,I=new m,R=0;for(let e=0;e<O;e++){let t=n[e],r=t.scale??1;R=Math.max(R,r),F.makeScale(r,r,r),F.setPosition(t.x,t.y??0,t.z),this.object.setMatrixAt(e,F),t.tint==null?I.setRGB(1,1,1):I.set(t.tint),p>0&&I.multiplyScalar(1+(P.next()*2-1)*p),this.object.setColorAt(e,I);let i=t.frame;i??=f?Math.floor(P.next()*y):0,k.array[e]=Math.min(y-1,Math.max(0,i|0))}this.object.instanceMatrix.needsUpdate=!0,this.object.instanceColor&&(this.object.instanceColor.needsUpdate=!0),k.needsUpdate=!0,O>0&&(this.object.computeBoundingSphere(),this.object.boundingSphere.radius+=Math.hypot(E,D)*Math.max(1,R)+.5),this.count=O}get castShadow(){return this.object.castShadow}set castShadow(e){this.object.castShadow=!!e,this._uniforms.uShadowSkip.value=+!!e,this._uniforms.uShadowSkipBias.value=e?.03:0}get receiveShadow(){return this.object.receiveShadow}set receiveShadow(e){this.object.receiveShadow=!!e}get wind(){return this._uniforms.uFoliageWind.value}set wind(e){this._uniforms.uFoliageWind.value=e}update(){}dispose(){this.object.parent&&this.object.parent.remove(this.object),this.object.geometry.dispose(),this.material.dispose(),this.depthMaterial.dispose(),this._ownsTexture&&this.texture.dispose(),this.object.dispose()}},Gt=`
uniform vec3 uSunDirection;
uniform float uSteepness;
uniform float uUseSun;
uniform vec3 uAxis;
uniform float uLength;
uniform float uWidth;
uniform float uTopWidth;

varying vec2 vUv;
varying vec3 vWorld;
varying float vAxisView;

#include <fog_pars_vertex>

void main() {
  vec3 toLight;
  if (uUseSun > 0.5) {
    vec3 s = normalize(uSunDirection);
    float hl = length(s.xz);
    vec2 hd = hl > 1e-4 ? s.xz / hl : vec2(0.0, 1.0);
    float el = asin(clamp(s.y, -1.0, 1.0));
    el = max(el, 0.12);
    el = mix(el, 1.5707963, uSteepness);
    toLight = vec3(hd.x * cos(el), sin(el), hd.y * cos(el));
  } else {
    toLight = -normalize(uAxis);
  }

  vec3 base = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  float u = position.x;           // -0.5 .. 0.5 across
  float v = position.y;           // 0 (ground) .. 1 (top)
  vec3 c = base + toLight * (v * uLength);
  vec3 view = normalize(cameraPosition - c);
  vec3 side = cross(toLight, view);
  float sl = length(side);
  side = sl > 1e-4 ? side / sl : vec3(1.0, 0.0, 0.0);
  float w = uWidth * mix(1.0, uTopWidth, v);
  vec3 wp = c + side * (u * w);

  vUv = vec2(u * 2.0, v);
  vWorld = wp;
  vAxisView = abs(dot(view, toLight));

  vec4 mvPosition = viewMatrix * vec4(wp, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`,Kt=`
uniform vec3 uSunColor;
uniform vec3 uSunDirection;
uniform vec3 uColor;
uniform float uNight;
uniform float uTime;
uniform float uIntensity;
uniform float uGlobalIntensity;
uniform float uNightStrength;
uniform float uSeed;
uniform float uGroundY;
uniform float uFadeHeight;
uniform float uLength;
uniform vec2 uNearFade;
uniform vec2 uHorizonFade;
uniform float uGain;

varying vec2 vUv;
varying vec3 vWorld;
varying float vAxisView;

#include <fog_pars_fragment>

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  float x = vUv.x;                       // -1 .. 1 across
  float v = vUv.y;                       // 0 bottom .. 1 top
  float across = exp(-x * x * 3.2) - 0.04;
  across = max(across, 0.0) / 0.96;

  float topFade = 1.0 - smoothstep(0.5, 1.0, v);
  float groundFade = smoothstep(uGroundY - 0.2, uGroundY + uFadeHeight, vWorld.y);
  float mid = mix(0.75, 1.0, smoothstep(0.1, 0.55, v));

  // Streaks parallel to the beam, drifting slowly.
  float along = v * uLength;
  float s1 = vnoise(vec2(x * 2.6 + uSeed * 7.1 + uTime * 0.05, along * 0.09 - uTime * 0.12));
  float s2 = vnoise(vec2(x * 6.3 - uSeed * 3.7 - uTime * 0.08, along * 0.16 - uTime * 0.21));
  float streak = 0.3 + 0.7 * smoothstep(0.15, 0.85, s1 * 0.62 + s2 * 0.38);
  // Slow breathing so the scene feels alive.
  float breathe = 0.82 + 0.18 * sin(uTime * 0.35 + uSeed * 6.2831);

  float axisFade = 1.0 - smoothstep(0.82, 0.98, vAxisView);
  float camDist = distance(cameraPosition, vWorld);
  float nearFade = smoothstep(uNearFade.x, uNearFade.y, camDist);

  float sunY = normalize(uSunDirection).y;
  // Strongest with a low sun (golden hour / morning), weaker at noon, gone as the sun sets.
  float lowSun = mix(0.4, 1.0, 1.0 - smoothstep(0.3, 0.8, sunY)) * smoothstep(uHorizonFade.x, uHorizonFade.y, sunY);
  float dayMix = mix(uNightStrength, 1.0, 1.0 - uNight);

  float a = across * topFade * groundFade * mid * streak * breathe * axisFade * nearFade
          * lowSun * dayMix * uIntensity * uGlobalIntensity;

  #ifdef USE_FOG
    #ifdef FOG_EXP2
      float fogF = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
    #else
      float fogF = smoothstep(fogNear, fogFar, vFogDepth);
    #endif
    a *= 1.0 - fogF;
  #endif

  // Slightly desaturated sun colour: beams read as pale warm light, not orange paint.
  vec3 sunCol = mix(vec3(dot(uSunColor, vec3(0.3, 0.59, 0.11))), uSunColor, 0.72);
  vec3 col = sunCol * uColor * (a * uGain);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,X=null,qt=0;function Jt(){return X||(X=new h(1,1,1,6),X.translate(0,.5,0),X.name=`GodRayShaft`),qt++,X}function Yt(){qt--,qt<=0&&X&&(X.dispose(),X=null,qt=0)}var Xt=class{constructor({steepness:e=.45,color:t=16773592,nightStrength:n=0,nearFade:r=[5,13],fadeHeight:i=2.2,gain:a=.28,horizonFade:o=[.19,.27]}={}){this.object=new D,this.object.name=`GodRays`,this.shafts=[],this.fadeHeight=i,this._shared={uTime:{value:0},uGlobalIntensity:{value:1},uSteepness:{value:e},uNightStrength:{value:n},uNearFade:{value:new U(r[0],r[1])},uGain:{value:a},uHorizonFade:{value:new U(o[0],o[1])},uTint:new m(t),fog:d.clone(ve.fog)}}get intensity(){return this._shared.uGlobalIntensity.value}set intensity(e){this._shared.uGlobalIntensity.value=e}get steepness(){return this._shared.uSteepness.value}set steepness(e){this._shared.uSteepness.value=e}addShaft({position:e,direction:t,length:n=14,width:r=3,intensity:i=1,color:a,topWidth:o=.7,seed:s}={}){let c=this._shared,l={uSunDirection:G.uSunDirection,uSunColor:G.uSunColor,uNight:G.uNight,uTime:c.uTime,uGlobalIntensity:c.uGlobalIntensity,uSteepness:c.uSteepness,uNightStrength:c.uNightStrength,uNearFade:c.uNearFade,uGain:c.uGain,uHorizonFade:c.uHorizonFade,fogColor:c.fog.fogColor,fogDensity:c.fog.fogDensity,fogNear:c.fog.fogNear,fogFar:c.fog.fogFar,uFogStart:G.uFogStart,uUseSun:{value:+!t},uAxis:{value:t?new B().copy(t).normalize():new B(0,-1,0)},uLength:{value:n},uWidth:{value:r},uTopWidth:{value:o},uIntensity:{value:i},uColor:{value:a===void 0?c.uTint.clone():new m(a)},uSeed:{value:s??this.shafts.length*.618+.13},uGroundY:{value:e?e.y:0},uFadeHeight:{value:this.fadeHeight}},u=new ge({name:`GodRayMaterial`,uniforms:l,vertexShader:Gt,fragmentShader:Kt,transparent:!0,depthWrite:!1,depthTest:!0,blending:2,side:2,fog:!0});u.forceSinglePass=!0,u.blendEquation=100,u.blendSrc=201,u.blendDst=203;let d=new W(Jt(),u);d.name=`GodRayShaft`;let f=new C;d.frustumCulled=!0,d.intersectsFrustum=function(e){return f.center.setFromMatrixPosition(this.matrixWorld),f.radius=l.uLength.value+l.uWidth.value*.5+.1,typeof e.intersectsSphere!=`function`||e.intersectsSphere(f)},d.renderOrder=j.GODRAYS,d.castShadow=!1,d.receiveShadow=!1,d.onBeforeRender=e=>{u.blending=e.getRenderTarget()===null?5:2},e&&d.position.set(e.x,e.y,e.z),this.object.add(d);let p=this.shafts,h=!1,g={mesh:d,get intensity(){return l.uIntensity.value},set intensity(e){l.uIntensity.value=e},dispose(){if(h)return;h=!0;let e=p.indexOf(g);e>=0&&p.splice(e,1),d.removeFromParent(),u.dispose(),Yt()}};return p.push(g),g}populate(e,t,n=7){let r=new re(n),i=e.maxX-e.minX,a=e.maxZ-e.minZ,o=Math.max(1,Math.round(Math.sqrt(t*i/Math.max(a,.001)))),s=Math.max(1,Math.ceil(t/o)),c=[];for(let e=0;e<s;e++)for(let t=0;t<o;t++)c.push([t,e]);r.shuffle(c);let l=[];for(let n=0;n<t;n++){let[t,u]=c[n%c.length],d=e.minX+(t+r.range(.15,.85))/o*i,f=e.minZ+(u+r.range(.15,.85))/s*a;l.push(this.addShaft({position:new B(d,e.y??0,f),length:r.range(11,17),width:r.range(1.4,3.4),intensity:r.range(.55,1),topWidth:r.range(.55,.85),seed:r.range(0,10)}))}return l}update(e){this._shared.uTime.value+=e}dispose(){for(let e of[...this.shafts])e.dispose();this.object.removeFromParent()}},Zt=`
varying vec3 vDir;

void main() {
  vDir = position;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  // Pin the dome to (just inside) the far plane whatever the camera far plane is: it never clips and,
  // with the depth test on, it only fills pixels no opaque geometry has covered.
  #ifdef USE_REVERSED_DEPTH_BUFFER
    gl_Position.z = gl_Position.w * 1e-5;
  #else
    gl_Position.z = gl_Position.w * 0.99999;
  #endif
}
`,Qt=`
uniform vec3 uTop;
uniform vec3 uHorizon;
uniform vec3 uBottom;
uniform vec3 uSunDir;
uniform vec3 uMoonDir;
uniform vec3 uSunColor;
uniform float uNight;
uniform float uGlow;
uniform float uClouds;
uniform float uLowerClouds;
uniform float uTime;
uniform float uStarDensity;
uniform float uSunSize;
uniform float uMoonSize;
uniform float uSunIntensity;
uniform float uCloudPixel;
uniform vec2 uWind;
uniform float uAurora;
uniform float uHorizonExp;
uniform float uCloudBand;

varying vec3 vDir;

#define TAU 6.28318530718

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm4(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + vec2(17.13, 3.71);
    a *= 0.5;
  }
  return s / 0.9375;
}

vec3 skyGradient(float y) {
  if (y >= 0.0) {
    float h = clamp(y, 0.0, 1.0);
    float t = smoothstep(0.0, 1.0, uHorizonExp == 0.5 ? pow(h, 0.5) : pow(h, uHorizonExp));
    return mix(uHorizon, uTop, t);
  }
  // Below the horizon: a thick band of horizon haze that slowly sinks into the bottom colour.
  float t = clamp(-y / 0.9, 0.0, 1.0);
  return mix(uHorizon, uBottom, smoothstep(0.0, 1.0, pow(t, 0.8)));
}

// Tangent-plane coordinates of direction d around centre c, in units of radius r.
vec2 discCoord(vec3 d, vec3 c, float r) {
  vec3 t1 = cross(c, vec3(0.0, 1.0, 0.0));
  t1 = length(t1) < 1e-4 ? vec3(1.0, 0.0, 0.0) : normalize(t1);
  vec3 t2 = cross(t1, c);
  return vec2(dot(d, t1), dot(d, t2)) / r;
}

// Snap a direction to a lat/long pixel grid with ~square cells (P cells per radian).
vec3 quantDir(float lat, float lon, float P) {
  float latQ = (floor(lat * P) + 0.5) / P;
  float cl = max(cos(latQ), 0.05);
  float lonQ = (floor(lon * P * cl) + 0.5) / (P * cl);
  float c = cos(latQ);
  return vec3(c * cos(lonQ), sin(latQ), c * sin(lonQ));
}

// Stars on a latitude/longitude grid with ~square cells (cells per row follow cos(latitude)).
vec3 stars(float lat, float lon) {
  float N = uStarDensity;
  // Fine 1-px stars
  float row = floor(lat * N);
  float rowLat = (row + 0.5) / N;
  float cells = max(1.0, floor(TAU * N * cos(rowLat)));
  vec2 cell = vec2(floor((lon / TAU + 0.5) * cells), row);
  float h = hash12(cell);
  float star = step(0.9962, h);
  float tw = 0.55 + 0.45 * sin(uTime * (1.2 + 3.5 * fract(h * 37.0)) + h * 91.0);
  // Mostly faint stars with a few bright ones (a uniform spread made every star bloom).
  float mag = fract(h * 113.0);
  float b = star * tw * (0.3 + 1.6 * mag * mag * mag);
  vec3 tint = mix(vec3(0.72, 0.82, 1.0), vec3(1.0, 0.88, 0.72), step(0.6, fract(h * 7.0)));
  vec3 col = tint * b;

  // Coarse cells with a plus-shaped bright star (5x5 px pattern)
  float N2 = N / 5.0;
  float row2 = floor(lat * N2);
  float rowLat2 = (row2 + 0.5) / N2;
  float cells2 = max(1.0, floor(TAU * N2 * cos(rowLat2)));
  float u2 = (lon / TAU + 0.5) * cells2;
  float v2 = lat * N2;
  float h2 = hash12(vec2(floor(u2), row2) + 71.3);
  vec2 f = floor(vec2(fract(u2), fract(v2)) * 5.0);
  float m = abs(f.x - 2.0) + abs(f.y - 2.0);
  float centre = step(m, 0.5);
  float arm = step(m, 1.5) - centre;
  float tw2 = 0.6 + 0.4 * sin(uTime * (0.7 + 1.8 * h2) + h2 * 50.0);
  float big = step(0.991, h2) * (centre * 2.2 + arm * 0.6) * tw2;
  vec3 tint2 = mix(vec3(0.8, 0.88, 1.0), vec3(1.0, 0.92, 0.78), step(0.5, fract(h2 * 13.0)));
  col += tint2 * big;
  return col;
}

vec3 aurora(vec3 q) {
  float u = atan(q.x, -q.z);
  float t = uTime * 0.03;
  float h = (q.y - 0.07 - 0.04 * sin(u * 1.7 + t * 2.0) - 0.025 * sin(u * 4.3 - t * 3.1)) / 0.45;
  if (h < 0.0 || h > 1.0) return vec3(0.0);
  float ray = vnoise(vec2(u * 70.0 + t * 9.0, t * 0.7));
  ray = ray * ray * 1.5 + 0.3 * vnoise(vec2(u * 17.0 - t * 4.0, 2.0));
  float a = smoothstep(0.0, 0.04, h) * exp(-h * 3.0) * ray * (0.35 + 0.65 * smoothstep(-0.4, 0.8, sin(u * 2.3 + t * 1.2)))
    * smoothstep(-0.6, 0.3, cos(u));
  vec3 c = mix(vec3(0.25, 1.0, 0.63), vec3(0.05, 0.75, 0.39), smoothstep(0.0, 0.15, h));
  c = mix(mix(c, vec3(0.2, 0.11, 1.0), smoothstep(0.25, 0.6, h)), vec3(0.58, 0.14, 1.0), smoothstep(0.75, 0.95, h));
  return c * floor(clamp(a, 0.0, 1.0) * 6.0 + 0.5) / 6.0;
}

void main() {
  vec3 d = normalize(vDir);
  float y = d.y;
  vec3 col = skyGradient(y);

  vec3 sunDir = normalize(uSunDir);
  vec3 moonDir = normalize(uMoonDir);
  float lat = asin(clamp(y, -1.0, 1.0));
  float lon = atan(d.z, d.x);

  // ---------------------------------------------------------------- sun glow
  float cs = dot(d, sunDir);
  float cs0 = max(cs, 0.0);
  float sunUp = smoothstep(-0.3, 0.02, sunDir.y);
  float halo = pow(cs0, 8.0) * 0.1 + pow(cs0, 42.0) * 0.28 + pow(cs0, 600.0) * 1.1;
  vec2 dh = d.xz / max(length(d.xz), 1e-4);
  vec2 shz = sunDir.xz / max(length(sunDir.xz), 1e-4);
  float az = dot(dh, shz) * 0.5 + 0.5;
  float lowSun = 1.0 - smoothstep(0.02, 0.6, sunDir.y);
  float band = exp(-abs(y) * 8.0) * pow(az, 3.0) * lowSun;
  vec3 glowCol = uSunColor * uGlow;
  col += glowCol * (halo + band * 0.32) * sunUp;

  // Cloud pixel grid (constant on-screen size), shared by both cloud layers.
  vec3 qd = quantDir(lat, lon, uCloudPixel);

  if (y > 0.0) {
    // ------------------------------------------------------------- stars
    float starMask = uNight * uNight * smoothstep(0.03, 0.35, y);
    if (starMask > 0.002) col += stars(lat, lon) * starMask;
    if (uAurora > 0.001) col += aurora(qd) * uAurora;

    // -------------------------------------- moon (pixel disc, gibbous, halo)
    float cm = dot(d, moonDir);
    float moonVis = smoothstep(0.25, 0.8, uNight) * smoothstep(-0.02, 0.08, moonDir.y);
    if (moonVis > 0.001 && cm > 0.0) {
      vec2 mp = discCoord(d, moonDir, uMoonSize);
      vec2 mcell = floor(mp * 7.0);
      vec2 mq = (mcell + 0.5) / 7.0;
      float inside = step(length(mq), 1.0);
      float mottle = hash12(mcell + 13.0);
      float crater = step(0.78, mottle) * 0.22 + step(0.93, mottle) * 0.12;
      float phase = smoothstep(0.35, 0.95, length(mq - vec2(-0.55, 0.25)));
      // Kept below the bloom-saturation point so the pixel craters and the gibbous phase read.
      vec3 moonCol = vec3(0.84, 0.9, 1.0) * (0.95 - crater * 1.3) * mix(0.22, 1.0, phase);
      col = mix(col, moonCol, inside * moonVis);
      float cm0 = max(cm, 0.0);
      col += vec3(0.45, 0.58, 1.0) * (pow(cm0, 2500.0) * 0.3 + pow(cm0, 200.0) * 0.08 + pow(cm0, 12.0) * 0.025) * moonVis;
    }

    // ------------------------------------ sun disc (pixel-crisp, HDR bloom)
    if (cs > 0.0) {
      vec2 sp = discCoord(d, sunDir, uSunSize);
      vec2 sq = (floor(sp * 6.0) + 0.5) / 6.0;
      float r = length(sq);
      float sIn = step(r, 1.0);
      float rim = step(0.8, r);
      col += uSunColor * sIn * mix(1.0, 0.55, rim) * uSunIntensity * sunUp * smoothstep(-0.005, 0.01, y);
    }

    // --------------------------- clouds (plane overhead, lit from the sun side)
    if (uClouds > 0.001) {
      vec2 cp = qd.xz / (max(qd.y, 0.0) + 0.15) * 2.4 + uWind * uTime;
      float n = fbm4(cp * 1.2);
      float cov = uClouds;
      if (uCloudBand > 0.0) cov += uCloudBand * (1.0 - uNight) * 0.14 * smoothstep(0.1, 0.2, y) * (1.0 - smoothstep(0.45, 0.7, y));
      float c = smoothstep(1.0 - cov - 0.08, 1.0 - cov + 0.2, n);
      float n2 = fbm4((cp + shz * 0.16) * 1.2);
      float lit = clamp(0.55 + (n - n2) * 5.0, 0.0, 1.0);
      c = floor(c * 3.0 + 0.5) / 3.0;
      lit = floor(lit * 3.0 + 0.5) / 3.0;
      float moonLit = pow(max(dot(d, moonDir), 0.0), 6.0) * smoothstep(0.3, 0.9, uNight);
      vec3 shade = mix(mix(uTop, uHorizon, 0.5) * 0.95, uTop * 0.8, uNight);
      vec3 litCol = mix(uHorizon * 1.12, mix(uTop, uHorizon, 0.55) + vec3(0.05, 0.07, 0.12) * moonLit, uNight)
                  + glowCol * (0.12 + pow(cs0, 4.0) * 0.8) * sunUp;
      float fade = smoothstep(0.0, 0.22, y);
      float a = mix(0.9, 0.55, uNight);
      if (uCloudBand > 0.0) {
        float k = uCloudBand * (1.0 - uNight) * smoothstep(0.45, 0.72, sunDir.y);
        float hl = dot(uHorizon, vec3(0.2126, 0.7152, 0.0722));
        litCol = mix(litCol, vec3(hl * 1.3) + glowCol * (0.12 + pow(cs0, 4.0) * 0.8) * sunUp, k * 0.8);
        shade = mix(shade, mix(uHorizon, vec3(hl), 0.5) * 0.92, k * 0.6);
        fade = smoothstep(0.0, 0.22 - 0.1 * uCloudBand * (1.0 - uNight), y);
        a += 0.08 * k;
      }
      vec3 cloudCol = mix(shade, litCol, lit);
      col = mix(col, cloudCol, c * fade * a);
    }
  } else if (uLowerClouds > 0.001) {
    // ------------------------------------------------------ sea of clouds below
    vec2 lp = qd.xz / (max(-qd.y, 0.0) + 0.07) * 0.6 + uWind * uTime * 0.6 + vec2(37.0, 11.0);
    float n = fbm4(lp);
    float c = smoothstep(0.42, 0.74, n);
    float n2 = fbm4(lp + shz * 0.12);
    float lit = clamp(0.5 + (n - n2) * 5.0, 0.0, 1.0);
    lit = floor(lit * 3.0 + 0.5) / 3.0;
    c = floor(c * 3.0 + 0.5) / 3.0;
    vec3 topCol = uHorizon * 1.08 + glowCol * (0.06 + band * 0.25) * sunUp;
    vec3 shadeCol = mix(uBottom, uHorizon, 0.5);
    vec3 cc = mix(shadeCol, topCol, 0.3 + lit * 0.7);
    float distFade = smoothstep(0.0, 0.16, -y);
    col = mix(col, cc, c * uLowerClouds * distFade);
  }

  gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,$t=new B,en=class e{constructor({radius:t=180,cloudCover:n=.45,lowerClouds:r=.5,starDensity:i=1100,sunSize:a=.032,moonSize:o=.026,sunIntensity:s=9,cloudPixel:c=380,wind:l=[.012,.004],earlyZ:u=!0}={}){this.radius=t,this.uniforms={uTop:{value:new m(3833568)},uHorizon:{value:new m(12902642)},uBottom:{value:new m(9417936)},uSunDir:{value:new B(.3,.6,-.5).normalize()},uMoonDir:{value:new B(-.3,.6,-.5).normalize()},uSunColor:{value:new m(1,.9,.75)},uNight:{value:0},uGlow:{value:1},uClouds:{value:n},uLowerClouds:{value:r},uTime:{value:0},uStarDensity:{value:i},uSunSize:{value:a},uMoonSize:{value:o},uSunIntensity:{value:s},uCloudPixel:{value:c},uWind:{value:new U(l[0],l[1])},uAurora:{value:0},uHorizonExp:{value:e.HORIZON_EXPONENT},uCloudBand:{value:0}},this.material=new ge({name:`SkyMaterial`,uniforms:this.uniforms,vertexShader:Zt,fragmentShader:Qt,side:1,depthWrite:!1,depthTest:u,fog:!1,toneMapped:!0}),this.geometry=new E(t,48,24);let d=new W(this.geometry,this.material);d.name=`Sky`,d.renderOrder=u?e.EARLY_Z_RENDER_ORDER:-1e3,d.frustumCulled=!1,d.castShadow=!1,d.receiveShadow=!1,d.matrixAutoUpdate=!1,d.onBeforeRender=(e,t,n)=>{$t.setFromMatrixPosition(n.matrixWorld),d.position.copy($t),d.updateMatrix(),d.matrixWorld.copy(d.matrix)},this.object=d}setState({top:e,horizon:t,bottom:n,sunDirection:r,sunColor:i,night:a,moonDirection:o,glow:s,clouds:c}={}){let l=this.uniforms;e&&l.uTop.value.copy(e),t&&l.uHorizon.value.copy(t),n&&l.uBottom.value.copy(n),r&&l.uSunDir.value.copy(r),i&&l.uSunColor.value.copy(i),a!==void 0&&(l.uNight.value=a),o&&l.uMoonDir.value.copy(o),s!==void 0&&(l.uGlow.value=s),c!==void 0&&(l.uClouds.value=c)}get cloudCover(){return this.uniforms.uClouds.value}set cloudCover(e){this.uniforms.uClouds.value=e}get lowerClouds(){return this.uniforms.uLowerClouds.value}set lowerClouds(e){this.uniforms.uLowerClouds.value=e}get horizonExponent(){return this.uniforms.uHorizonExp.value}set horizonExponent(e){this.uniforms.uHorizonExp.value=e}get cloudBand(){return this.uniforms.uCloudBand.value}set cloudBand(e){this.uniforms.uCloudBand.value=e}update(e){this.uniforms.uTime.value+=e}dispose(){this.geometry.dispose(),this.material.dispose()}};en.EARLY_Z_RENDER_ORDER=1e6,en.HORIZON_EXPONENT=.5;var tn=[{t:0,name:`night`,top:`#050a1f`,horizon:`#1b2a5c`,bottom:`#0a1232`,sun:`#7294ff`,sunI:.85,hemiSky:`#2a48b4`,hemiGround:`#101430`,hemiI:1.12,fog:.011,exp:1.3,night:1,moon:1,shadow:.6,glow:.4,clouds:.3},{t:4.3,name:`late night`,top:`#070c24`,horizon:`#213062`,bottom:`#0d1436`,sun:`#7a98ff`,sunI:.72,hemiSky:`#2e4ab0`,hemiGround:`#121632`,hemiI:1.1,fog:.0115,exp:1.3,night:1,moon:1,shadow:.58,glow:.5,clouds:.34},{t:5.25,name:`pre-dawn`,top:`#18204e`,horizon:`#5c5a92`,bottom:`#282852`,sun:`#a0a6ea`,sunI:.16,hemiSky:`#5460a8`,hemiGround:`#221e38`,hemiI:1.05,fog:.014,exp:1.26,night:.86,moon:1,shadow:.35,glow:.8,clouds:.45},{t:6.1,name:`pink dawn`,top:`#3c5098`,horizon:`#f59aa0`,bottom:`#8a6aa0`,sun:`#ff7c6a`,sunI:2.3,hemiSky:`#9a86d2`,hemiGround:`#6a4450`,hemiI:.98,fog:.012,exp:1.08,night:.3,moon:0,shadow:.85,glow:1,clouds:.45},{t:6.9,name:`sunrise`,top:`#4a74c4`,horizon:`#f8c0a0`,bottom:`#a08aa8`,sun:`#ffb88a`,sunI:2.8,hemiSky:`#98aee0`,hemiGround:`#6e5048`,hemiI:1.05,fog:.013,exp:1.06,night:.06,moon:0,shadow:.95,glow:1,clouds:.44},{t:8,name:`morning`,top:`#4f86d6`,horizon:`#d6e6f0`,bottom:`#9cb6cc`,sun:`#ffe6c0`,sunI:3.2,hemiSky:`#a2c2ec`,hemiGround:`#6e5c46`,hemiI:1.05,fog:.011,exp:1.02,night:0,moon:0,shadow:1,glow:.8,clouds:.42},{t:12.2,name:`noon`,top:`#3a7ee0`,horizon:`#c4e0f2`,bottom:`#8fb4d0`,sun:`#fff4e2`,sunI:3.5,hemiSky:`#a6c8f2`,hemiGround:`#72624a`,hemiI:1.1,fog:.009,exp:1,night:0,moon:0,shadow:1,glow:.7,clouds:.38},{t:15.3,name:`afternoon`,top:`#4880d8`,horizon:`#dde2da`,bottom:`#9eb0c0`,sun:`#ffe0b0`,sunI:3.6,hemiSky:`#9cb8e8`,hemiGround:`#786248`,hemiI:1.1,fog:.0095,exp:1,night:0,moon:0,shadow:1,glow:.8,clouds:.42},{t:17.2,name:`golden hour`,top:`#3e4c9a`,horizon:`#f7a068`,bottom:`#a0628a`,sun:`#ffb466`,sunI:6,hemiSky:`#7078cc`,hemiGround:`#9a6444`,hemiI:1.45,fog:.0098,exp:1.12,night:0,moon:0,shadow:1,glow:1,clouds:.48},{t:18.45,name:`sunset`,top:`#2a2a70`,horizon:`#ec7e6c`,bottom:`#643a70`,sun:`#ff8050`,sunI:3.1,hemiSky:`#6c5ec4`,hemiGround:`#4c2e44`,hemiI:1.2,fog:.0112,exp:1.12,night:.22,moon:0,shadow:.85,glow:1.3,clouds:.5},{t:19.25,name:`purple dusk`,top:`#1a1c54`,horizon:`#8a5a9e`,bottom:`#2c2052`,sun:`#c07aaa`,sunI:.3,hemiSky:`#4c4ea8`,hemiGround:`#2a1c36`,hemiI:1.15,fog:.013,exp:1.28,night:.62,moon:0,shadow:.5,glow:.9,clouds:.46},{t:20.05,name:`blue hour`,top:`#0b1240`,horizon:`#2c3e82`,bottom:`#111a40`,sun:`#7090f4`,sunI:.38,hemiSky:`#304cae`,hemiGround:`#12152e`,hemiI:1.08,fog:.0125,exp:1.28,night:.92,moon:1,shadow:.5,glow:.5,clouds:.42},{t:21.4,name:`night`,top:`#060b20`,horizon:`#1c2b5c`,bottom:`#0b1332`,sun:`#7294ff`,sunI:.82,hemiSky:`#2a48b4`,hemiGround:`#101430`,hemiI:1.12,fog:.011,exp:1.3,night:1,moon:1,shadow:.6,glow:.4,clouds:.3}],nn=[`top`,`horizon`,`bottom`,`sun`,`hemiSky`,`hemiGround`],rn=[`sunI`,`hemiI`,`fog`,`exp`,`night`,`moon`,`shadow`,`glow`,`clouds`],an=nn.length*3+rn.length,on=nn.length*3,Z=Object.fromEntries(rn.map((e,t)=>[e,on+t])),sn=3.5,cn=class{constructor(e,t,n,r=24){let i=e.length;this.n=i,this.channels=n,this.period=r,this.t=new Float64Array(i+1),this.y=new Float64Array((i+1)*n),this.m=new Float64Array((i+1)*n);for(let t=0;t<i;t++)this.t[t]=e[t];this.t[i]=e[0]+r,this.y.set(t.subarray(0,i*n)),this.y.set(t.subarray(0,n),i*n);let a=new Float64Array(i);for(let e=0;e<i;e++)a[e]=this.t[e+1]-this.t[e];let o=new Float64Array(i);for(let e=0;e<n;e++){for(let t=0;t<i;t++)o[t]=(this.y[(t+1)*n+e]-this.y[t*n+e])/a[t];for(let t=0;t<i;t++){let r=(t-1+i)%i,s=o[r],c=o[t],l=0;if(s*c>0){let e=a[r],n=a[t],i=2*n+e,o=n+2*e;l=(i+o)/(i/s+o/c)}this.m[t*n+e]=l}this.m[i*n+e]=this.m[e]}}evaluate(e,t){let{n,channels:r,t:i}=this,a=e-i[0];a=(a%this.period+this.period)%this.period+i[0];let o=0;for(;o<n-1&&a>=i[o+1];)o++;let s=i[o+1]-i[o],c=(a-i[o])/s,l=c*c,u=l*c,d=2*u-3*l+1,f=(u-2*l+c)*s,p=-2*u+3*l,m=(u-l)*s,h=o*r,g=(o+1)*r;for(let e=0;e<r;e++)t[e]=d*this.y[h+e]+f*this.m[h+e]+p*this.y[g+e]+m*this.m[g+e];return t}};function ln(e,t,n,r){let i=(e-t.noon)/24*Math.PI*2,a=t.lat*se,o=t.dec*se,s=Math.cos(o),c=Math.sin(o),l=Math.cos(i),u=Math.sin(i),d=Math.sin(a),f=Math.cos(a),p=-s*u,m=c*d+s*l*f,h=-c*f+s*l*d,g=Math.cos(n),_=Math.sin(n);return r.set(p*g+h*_,m,-p*_+h*g).normalize()}function un(e,t,n){let r=ln(t,e,0,new B);return n*se-Math.atan2(r.x,r.z)}var dn=(e,t,n)=>.5*(e+t+Math.sqrt((e-t)*(e-t)+n*n)),fn=(e,t,n)=>.5*(e+t-Math.sqrt((e-t)*(e-t)+n*n));function pn(e){return e=(e+Math.PI)%(Math.PI*2),e<0&&(e+=Math.PI*2),e-Math.PI}function mn(e,t){let n=Math.floor(e),r=e-n,i=r*r*(3-2*r);return I(oe(n,0,t),oe(n+1,0,t),i)}function hn(e,t){return mn(e,t)*.55+mn(e*2.37+11.3,t+17)*.3+mn(e*5.13+3.1,t+41)*.15}var Q=new B,gn=new B,_n=new B,vn=new B,yn=new B,bn=(e,t)=>t.setStyle(e,l),xn=new m,Sn=e=>e.r*.2126+e.g*.7152+e.b*.0722;function Cn(e,t,n){let r=t.sun?H(t.sun[0],t.sun[1],n):1;if(!(r>0))return;let i=Sn(e)/Math.max(1e-5,Sn(t.color))*(1+t.lift*r);e.lerp(xn.copy(t.color).multiplyScalar(i),t.mix*r)}var wn=class{constructor(e,t={}){this.name=`lighting`,this.engine=e,this.renderer=e.renderer,this.scene=e.scene,this.camera=e.camera,this.timeOfDay=((t.timeOfDay??17.2)%24+24)%24,this.timeSpeed=t.timeSpeed??0,this.paused=!1,this.settings={sunMul:1,ambientMul:1,fogMul:1,shadows:!0,exposureMul:1,pointLightMul:1,flicker:!0,backdrop:null},this._clearBefore=null,this._backdropApplied=null,this.shadowMapSize=t.shadowMapSize??2048,this._shadowExtent=t.shadowExtent??22,this.lightDistance=t.lightDistance??70,this.minElevation=(t.minElevation??10)*se,this.maxElevation=(t.maxElevation??68)*se,this.followPlaneY=t.followPlaneY??0,this.shadowForward=t.shadowForward??.22,this.shadowRadius={day:2.5,night:3.2},this.haze=null,this.sunPath={noon:12.4,lat:45,dec:5,refTime:17.2,refAzimuth:-125,...t.sunPath||{}},this.moonPath={noon:23.6,lat:45,dec:2,refTime:0,refAzimuth:140,...t.moonPath||{}},this._sunYaw=un(this.sunPath,this.sunPath.refTime,this.sunPath.refAzimuth),this._moonYaw=un(this.moonPath,this.moonPath.refTime,this.moonPath.refAzimuth),this.group=new D,this.group.name=`LightingSystem`,this.sun=new r(16777215,3),this.sun.name=`Sun`,this.sun.castShadow=!0;let n=this.sun.shadow;n.mapSize.set(this.shadowMapSize,this.shadowMapSize),n.bias=-2e-4,n.normalBias=.055,n.radius=this.shadowRadius.day,n.camera.near=1,n.camera.far=this.lightDistance*2.4,this._applyShadowExtent(),this.group.add(this.sun,this.sun.target),this.hemi=new g(10535167,6309944,1),this.hemi.name=`Hemisphere`,this.hemi.position.set(0,1,0),this.group.add(this.hemi),this.pointLightGroup=new D,this.pointLightGroup.name=`PointLights`,this.group.add(this.pointLightGroup),this.sky=new en(t.sky),this.scene.add(this.group),this.scene.add(this.sky.object),this.fog=new le(10465480,.012),this._previousFog=this.scene.fog,this.scene.fog=this.fog,this.renderer?.shadowMap&&(this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type===2&&(this.renderer.shadowMap.type=1)),this._values=new Float64Array(an),this.setKeyframes(t.keyframes??tn),this.state={skyTop:new m,skyHorizon:new m,skyBottom:new m,sunColor:new m,hemiSky:new m,hemiGround:new m,sunIntensity:0,hemiIntensity:0,fogDensity:0,exposure:1,night:0,moonBlend:0,shadowIntensity:1,glow:1,clouds:.4,sunElevation:0,lightElevation:0},this._sunDir=new B(0,1,0),this._moonDir=new B(0,1,0),this._lightDir=new B(0,1,0),this._skyState={top:this.state.skyTop,horizon:this.state.skyHorizon,bottom:this.state.skyBottom,sunDirection:this._sunDir,moonDirection:this._moonDir,sunColor:new m,night:0,glow:1,clouds:.4},this._follow=null,this._clock=0,this._pointLights=[],this._unindexed=new Set,this._emissives=[],this._nightFactor=0,this._apply(0)}setTime(e){this.timeOfDay=(e%24+24)%24,this._apply(0)}get nightFactor(){return this._nightFactor}get phaseName(){let e=``,t=1/0,n=this.timeOfDay;for(let r=0;r<this.keyframes.length;r++){let i=this.keyframes[r],a=Math.min(Math.abs(i.t-n),24-Math.abs(i.t-n));a<t&&(t=a,e=i.name??``)}return e}get sunDirection(){return this._lightDir}get trueSunDirection(){return this._sunDir}get moonDirection(){return this._moonDir}get shadowExtent(){return this._shadowExtent}set shadowExtent(e){this._shadowExtent=e,this._applyShadowExtent()}setShadowDepthRange(e,t){let n=this.sun.shadow.camera;this._shadowBase??={near:n.near,far:n.far,bias:this.sun.shadow.bias};let r=this._shadowBase;e==null||t==null?(n.near=r.near,n.far=r.far,this.sun.shadow.bias=r.bias):(n.near=Math.max(.1,this.lightDistance-e),n.far=Math.max(n.near+1,this.lightDistance+t),this.sun.shadow.bias=r.bias*((r.far-r.near)/(n.far-n.near))),n.updateProjectionMatrix()}_setBackdrop(e){this.sky.object.visible=!e,this._backdropApplied=e?(this._backdropApplied??new m).copy(e):null;let t=this.renderer;if(t){if(e){if(!this._clearBefore){let e=new m;t.getClearColor(e),this._clearBefore={color:e,alpha:t.getClearAlpha()}}t.setClearColor(e,1)}else this._clearBefore&&=(t.setClearColor(this._clearBefore.color,this._clearBefore.alpha),null)}}followTarget(e){this._follow=e||null}setHaze(e){if(!e||!(e.mix>0))this.haze=null;else{let t=this.haze?.color??new m;typeof e.tint==`number`?t.setHex(e.tint,l):bn(e.tint,t);let n=e.sun?[e.sun[0]*se,e.sun[1]*se]:null;this.haze={color:t,mix:V(e.mix),lift:Math.max(0,Number(e.lift)||0),sun:n}}this.state&&this._apply(0)}setKeyframes(e){let t=[...e].sort((e,t)=>e.t-t.t);this.keyframes=t;let n=new Float64Array(t.length*an),r=new m;t.forEach((e,t)=>{let i=tn.reduce((t,n)=>Math.abs(n.t-e.t)<Math.abs(t.t-e.t)?n:t);nn.forEach((a,o)=>{let s=e[a]??i[a];typeof s==`number`?r.setHex(s,l):bn(s,r),n[t*an+o*3]=r.r,n[t*an+o*3+1]=r.g,n[t*an+o*3+2]=r.b}),rn.forEach((r,a)=>{n[t*an+on+a]=e[r]??i[r]})}),this._track=new cn(t.map(e=>(e.t%24+24)%24),n,an,24),this.state&&this._apply(0)}addPointLight({position:e,color:t=16757867,intensity:n=8,distance:r=8,decay:i=2,flicker:a=.3,nightOnly:s=!0,dayIntensity:c=.15,seed:l,flickerSpeed:u=2.6,indexed:d=!0}={}){let f=new o(t,0,r,i);f.castShadow=!1,e&&f.position.set(e.x,e.y,e.z),this.pointLightGroup.add(f);let p=this._pointLights.length-this._unindexed.size,m=this,h={light:f,intensity:n,flicker:a,nightOnly:s,dayIntensity:c,flickerSpeed:u,seed:l??p*7919+13>>>0,flickerFactor:1,fade:1,dispose(){let e=m._pointLights.indexOf(h);e>=0&&m._pointLights.splice(e,1),m._unindexed.delete(h),f.removeFromParent(),f.dispose()}};return this._pointLights.push(h),d||this._unindexed.add(h),this._updatePointLight(h),h}retargetPointLight(e,t={}){let n=e.light;t.position&&n.position.set(t.position.x,t.position.y,t.position.z),t.color!==void 0&&n.color.set(t.color),t.distance!==void 0&&(n.distance=t.distance),t.decay!==void 0&&(n.decay=t.decay);for(let n of[`intensity`,`flicker`,`nightOnly`,`dayIntensity`,`seed`,`flickerSpeed`])t[n]!==void 0&&(e[n]=t[n]);return this._updatePointLight(e),e}flickerAt(e,t,n=2.6){if(!this.settings.flicker||!(t>0))return 1;let r=hn(this._clock*n,e);return Math.max(0,1+t*(r-.5)*1.7)}registerEmissive(e,{day:t=0,night:n=1.6,flicker:r=null}={}){let i=this,a={material:e,day:t,night:n,flicker:r,dispose(){let e=i._emissives.indexOf(a);e>=0&&i._emissives.splice(e,1)}};return this._emissives.push(a),this._updateEmissive(a),a}update(e){!this.paused&&this.timeSpeed!==0&&(this.timeOfDay=((this.timeOfDay+this.timeSpeed*e)%24+24)%24),this._apply(e)}lateUpdate(){this._placeSun()}dispose(){for(let e of[...this._pointLights])e.dispose();this._emissives.length=0,this.sun.dispose(),this.hemi.dispose(),this.group.removeFromParent(),this.sky.object.removeFromParent(),this.sky.dispose(),this.scene.fog===this.fog&&(this.scene.fog=this._previousFog??null)}_applyShadowExtent(){let e=this.sun.shadow.camera,t=this._shadowExtent;e.left=-t,e.right=t,e.top=t,e.bottom=-t,e.updateProjectionMatrix()}_apply(e){this._clock+=e;let t=this._track.evaluate(this.timeOfDay,this._values),n=this.state,r=this._stateColors||=[n.skyTop,n.skyHorizon,n.skyBottom,n.sunColor,n.hemiSky,n.hemiGround];for(let e=0;e<6;e++)r[e].setRGB(Math.max(0,t[e*3]),Math.max(0,t[e*3+1]),Math.max(0,t[e*3+2]));n.sunIntensity=Math.max(0,t[Z.sunI]),n.hemiIntensity=Math.max(0,t[Z.hemiI]),n.fogDensity=Math.max(0,t[Z.fog]),n.exposure=Math.max(.05,t[Z.exp]),n.night=V(t[Z.night]),n.moonBlend=V(t[Z.moon]),n.shadowIntensity=V(t[Z.shadow]),n.glow=Math.max(0,t[Z.glow]),n.clouds=V(t[Z.clouds]),this._nightFactor=n.night,this._computeDirections();let i=this.settings;this.sun.color.copy(n.sunColor),this.sun.intensity=n.sunIntensity*i.sunMul;let a=this.sun.shadow;a.intensity=i.shadows?n.shadowIntensity:0,a.autoUpdate=!!i.shadows,a.radius=I(this.shadowRadius.day,this.shadowRadius.night,n.night),this._placeSun(),this.hemi.color.copy(n.hemiSky),this.hemi.groundColor.copy(n.hemiGround),this.hemi.intensity=n.hemiIntensity*i.ambientMul;let o=i.backdrop;this.fog.color.copy(o??n.skyHorizon);let s=o?null:this.haze;s&&Cn(this.fog.color,s,n.sunElevation),this.fog.density=n.fogDensity*i.fogMul,this.scene.fog!==this.fog&&this.scene.fog==null&&(this.scene.fog=this.fog);let c=this._backdropApplied;(this.sky.object.visible===!!o||o&&!(c&&c.equals(o)))&&this._setBackdrop(o),this.renderer&&(this.renderer.toneMappingExposure=n.exposure*i.exposureMul),G.uNight.value=n.night,G.uSunDirection.value.copy(this._lightDir),G.uSunColor.value.copy(n.sunColor).multiplyScalar(n.sunIntensity*i.sunMul/sn),G.uFogColor.value.copy(s?this.fog.color:o??n.skyHorizon);let l=this._skyState;l.sunColor.copy(n.sunColor),l.night=n.night,l.glow=n.glow,l.clouds=n.clouds,this.sky.setState(l),this.sky.update(e);for(let e=0;e<this._pointLights.length;e++)this._updatePointLight(this._pointLights[e]);for(let e=0;e<this._emissives.length;e++)this._updateEmissive(this._emissives[e])}_computeDirections(){let e=this.state;ln(this.timeOfDay,this.sunPath,this._sunYaw,this._sunDir),ln(this.timeOfDay,this.moonPath,this._moonYaw,this._moonDir);let t=Math.asin(V(this._sunDir.y,-1,1)),n=Math.asin(V(this._moonDir.y,-1,1));e.sunElevation=t;let r=.12,i=this.minElevation,a=this.maxElevation,o=fn(dn(t,i,r),a,r),s=fn(dn(n,i,r),a,r),c=Math.atan2(this._sunDir.x,this._sunDir.z),l=Math.atan2(this._moonDir.x,this._moonDir.z),u=e.moonBlend,d=c+pn(l-c)*u,f=I(o,s,u);e.lightElevation=f;let p=Math.cos(f);this._lightDir.set(Math.sin(d)*p,Math.sin(f),Math.cos(d)*p)}_getFollowPoint(e){let t=this._follow;if(t&&t.isObject3D)return t.getWorldPosition(e);if(t&&t.isVector3)return e.copy(t);let n=this.camera;if(!n)return e.set(0,0,0);yn.setFromMatrixPosition(n.matrixWorld),n.getWorldDirection(vn);let r=24;return vn.y<-.05&&(r=Math.min(60,(yn.y-this.followPlaneY)/-vn.y)),e.copy(yn).addScaledVector(vn,Math.max(0,r))}_placeSun(){let e=this._lightDir,t=this.camera;if(t&&t.updateWorldMatrix(!0,!1),this._getFollowPoint(Q),t&&this.shadowForward!==0){yn.setFromMatrixPosition(t.matrixWorld);let e=Q.x-yn.x,n=Q.z-yn.z,r=Math.hypot(e,n);if(r>.001){let t=yn.distanceTo(Q),i=Math.min(t*this.shadowForward,this._shadowExtent*.5)/r;Q.x+=e*i,Q.z+=n*i}}let n=this.sun.shadow.camera.up;gn.crossVectors(n,e),gn.lengthSq()<1e-8&&gn.set(1,0,0),gn.normalize(),_n.crossVectors(e,gn);let r=2*this._shadowExtent/this.shadowMapSize,i=Q.dot(gn),a=Q.dot(_n),o=Math.round(i/r)*r-i,s=Math.round(a/r)*r-a;Q.addScaledVector(gn,o).addScaledVector(_n,s),this.sun.target.position.copy(Q),this.sun.position.copy(Q).addScaledVector(e,this.lightDistance),this.sun.target.updateMatrixWorld(),this.sun.updateMatrixWorld()}_updatePointLight(e){let t=this.settings,n=1;if(t.flicker&&e.flicker>0){let t=hn(this._clock*e.flickerSpeed,e.seed);n=Math.max(0,1+e.flicker*(t-.5)*1.7)}e.flickerFactor=n;let r=e.nightOnly?I(e.dayIntensity,1,this._nightFactor):1,i=e.intensity*r*n*t.pointLightMul;e.light.intensity=e.fade===1||e.fade===void 0?i:i*e.fade}_updateEmissive(e){let t=I(e.day,e.night,this._nightFactor);e.flicker&&(t*=I(1,e.flicker.flickerFactor,.6)),e.material.emissiveIntensity=t}},Tn=class{constructor(e,t=[],n={}){if(this.lighting=e,this.descriptors=t.slice(),this.size=Math.max(0,Math.floor(n.size??12)),this.fixed=!!n.fixed,this.interval=n.interval??.2,this.fadeTime=n.fadeTime??.35,this.margin=n.margin??4,this.priorityWeight=n.priorityWeight??1.5,this.hysteresis=n.hysteresis??2,this.dayPenalty=n.dayPenalty??10,this.nightDayIntensity=n.nightDayIntensity??.05,this.pooled=this.descriptors.length>this.size,this.handles=[],this._slots=[],this._sources=new Map,this._emissives=[],this._timer=0,this._snapNext=!0,this._frustum=new f,this._m=new N,this._sphere=new C,this._scored=this.descriptors.map(e=>({d:e,s:0})),this._wanted=new Set,this._seeds=new Map,this._baseSeeds=[],this._hidden=new Set,this._staticFading=!1,this.fixed){for(let e=0;e<this.size;e++)this.handles.push(this._addParked());this._baseSeeds=this.handles.map(e=>e.seed);let e=this.descriptors;this.descriptors=[],this.pooled=!1,this.setDescriptors(e,{snap:!0});return}if(!this.pooled){for(let t of this.descriptors){let n=e.addPointLight(this._staticParams(t));n.tag=t.tag,n.desc=t,this.handles.push(n)}this._baseSeeds=this.handles.map(e=>e.seed);return}for(let e of this.descriptors)this._seeds.set(e,e.seed??jn(e.position));for(let t=0;t<this.size;t++){let t=e.addPointLight({position:En,intensity:0,distance:8,flicker:0,nightOnly:!1});t.fade=0,t.tag=``,t.desc=null,this.handles.push(t),this._slots.push({handle:t,desc:null,target:null,fade:0})}this._baseSeeds=this.handles.map(e=>e.seed)}get activeCount(){if(!this.pooled)return Math.min(this.handles.length,this.descriptors.length);let e=0;for(let t of this._slots)t.desc&&e++;return e}get used(){return this.activeCount}get active(){return this.pooled?this._slots.filter(e=>e.desc).map(e=>e.desc):this.descriptors.slice(0,this.handles.length)}snap(){this._snapNext=!0}setHidden(e,t,{instant:n=!1}={}){if(!e||t===this._hidden.has(e))return;if(t?this._hidden.add(e):this._hidden.delete(e),this.pooled){this._timer=0,n&&(this._snapNext=!0);return}let r=this.handles.find(t=>t.desc===e);r&&(n?(r.fade=+!t,t&&(r.light.intensity=0)):this._staticFading=!0)}isHidden(e){return this._hidden.has(e)}setDescriptors(e,{snap:t=!1}={}){let n=e.slice(),r=this.descriptors,i=n.length===r.length&&n.every((e,t)=>e===r[t]);if(this.descriptors=n,i||(this._scored=n.map(e=>({d:e,s:0}))),t&&(this._snapNext=!0),!i&&this._hidden.size){let e=new Set(n);for(let t of this._hidden)e.has(t)||this._hidden.delete(t)}let a=this.handles.length,o=this.lighting;if(n.length<=a){this.pooled=!1,this._slots.length=0,this._seeds.clear();for(let e=0;e<a;e++){let r=this.handles[e],i=n[e];if(!i){this._park(r);continue}this._hidden.has(i)?t||r.desc!==i?r.fade=0:this._staticFading=!0:r.fade=1,o.retargetPointLight(r,this._params(i,i.seed??this._baseSeeds[e])),r.tag=i.tag,r.desc=i}return}let s=i?null:new Set(n),c=i?null:An(r,n,s),l=e=>!e||i||s.has(e)?e:c.get(e)??null;if(!i){let e=new Map;for(let t of n)e.set(t,this._seeds.get(t)??t.seed??jn(t.position));this._seeds=e;for(let[e,t]of[...this._sources]){let n=c.get(e);n&&!this._sources.has(n)&&(this._sources.delete(e),this._sources.set(n,t))}}if(!this.pooled){this.pooled=!0,this._slots=this.handles.map(e=>{let t=l(e.desc??null);return{handle:e,desc:t,target:null,fade:+!!t}});for(let e of this._slots)e.desc||this._park(e.handle),e.handle.desc=e.desc,e.handle.fade=e.fade}else if(!i){let e=new Set;for(let t of this._slots){let n=t.desc,r=l(n);r&&r!==n&&!e.has(r)&&(n=r),n!==t.desc&&(t.desc=n,t.handle.desc=n),t.desc&&s.has(t.desc)&&e.add(t.desc)}let t=new Set;for(let e of this._slots){let n=l(e.target);e.target=n&&!t.has(n)?n:null,e.target&&t.add(e.target)}}for(let e of this._slots)e.desc&&(o.retargetPointLight(e.handle,this._params(e.desc,this._seeds.get(e.desc)??e.handle.seed)),e.handle.tag=e.desc.tag);i||(this._timer=0)}flickerSource(e){let t=this._sources.get(e);return t||(t={flickerFactor:1},this._sources.set(e,t)),t}registerEmissive(e,{day:t=0,night:n=1.6,light:r=null}={}){let i=r?this.flickerSource(r):null,a=this.lighting.registerEmissive(e,{day:t,night:n,flicker:i});return this._emissives.push(a),a}update(e,{focus:t=null,camera:n=null}={}){if(this._updateSources(),!this.pooled){this._snapNext=!1,this._staticFading&&this._fadeStatic(e);return}let r=this.nightDayIntensity;for(let e of this._slots)e.desc&&e.desc.nightOnly!==!1&&e.desc.dayIntensity===void 0&&(e.handle.dayIntensity=r);if(this._snapNext){this._snapNext=!1,this._timer=this.interval,this._assign(t,n);for(let e of this._slots){let t=e.target!==e.desc;t&&this._move(e,e.target),e.fade=+!!e.desc,e.handle.fade=e.fade,t&&e.desc&&this.lighting.retargetPointLight(e.handle,{})}return}this._timer-=e,this._timer<=0&&(this._timer=this.interval,this._assign(t,n));let i=this.fadeTime>0?e/this.fadeTime:1;for(let e of this._slots)e.target===e.desc?e.desc&&(e.fade=Math.min(1,e.fade+i)):(e.fade=e.desc?Math.max(0,e.fade-i):0,e.fade===0&&this._move(e,e.target)),e.handle.fade=e.fade*e.fade*(3-2*e.fade)}_fadeStatic(e){let t=this.fadeTime>0?e/this.fadeTime:1,n=!1;for(let e of this.handles){if(!e.desc)continue;let r=+!this._hidden.has(e.desc);e.fade!==r&&(e.fade=r>e.fade?Math.min(1,e.fade+t):Math.max(0,e.fade-t),e.fade!==r&&(n=!0))}this._staticFading=n}dispose(){for(let e of this._emissives)e.dispose();this._emissives.length=0;for(let e of this.handles)e.dispose();this.handles.length=0,this._slots.length=0,this._sources.clear()}_staticParams(e){let t=e.nightOnly??!0;return{position:e.position,color:e.color,intensity:e.intensity,distance:e.distance,flicker:e.flicker,nightOnly:t,dayIntensity:e.dayIntensity??(t?this.nightDayIntensity:1),...e.seed===void 0?{}:{seed:e.seed},...e.flickerSpeed===void 0?{}:{flickerSpeed:e.flickerSpeed}}}_addParked(){let e=this.lighting.addPointLight({position:En,intensity:0,distance:8,flicker:0,nightOnly:!1});return e.fade=0,e.tag=``,e.desc=null,e}_park(e){e.desc=null,e.tag=``,e.fade=0,e.intensity=0,e.light.intensity=0,e.light.position.copy(En)}_params(e,t){let n=e.nightOnly??!0;return{position:e.position,color:e.color??16757867,intensity:e.intensity??8,distance:e.distance??8,flicker:e.flicker??.3,nightOnly:n,dayIntensity:e.dayIntensity??(n?this.nightDayIntensity:1),seed:t,flickerSpeed:e.flickerSpeed??2.6}}_move(e,t){e.desc=t;let n=e.handle;if(n.desc=t,n.fade=0,n.light.intensity=0,!t){n.tag=``,n.intensity=0,n.light.position.copy(En);return}let r=t.nightOnly??!0;this.lighting.retargetPointLight(n,{position:t.position,color:t.color??16757867,intensity:t.intensity??8,distance:t.distance??8,flicker:t.flicker??.3,nightOnly:r,dayIntensity:t.dayIntensity??(r?this.nightDayIntensity:1),seed:this._seeds.get(t),flickerSpeed:t.flickerSpeed??2.6}),n.tag=t.tag}_assign(e,t){let n=this._wanted;n.clear();let r=null;t&&(t.updateMatrixWorld(),this._m.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),r=this._frustum.setFromProjectionMatrix(this._m,t.coordinateSystem));let i=new Set;for(let e of this._slots)e.target&&i.add(e.target);let a=this.lighting.nightFactor,o=e?.x??0,s=e?.y??0,c=e?.z??0,l=this._scored,u=0;for(let t=0;t<l.length;t++){let n=l[t],d=n.d,f=d.position;if(r&&(this._sphere.center.copy(f),this._sphere.radius=(d.distance??8)+this.margin,!r.intersectsSphere(this._sphere))){n.s=1/0;continue}if(this._hidden.size&&this._hidden.has(d)){n.s=1/0;continue}let p=d.nightOnly??!0?I(d.dayIntensity??this.nightDayIntensity,1,a):1;n.s=(e?Math.hypot(f.x-o,(f.y-s)*.5,f.z-c):0)+(d.priority??3)*this.priorityWeight+(1-Math.min(1,p))*this.dayPenalty-(i.has(d)?this.hysteresis:0),u++}if(u){l.sort((e,t)=>e.s-t.s);for(let e=0;e<Math.min(this.size,u);e++)n.add(l[e].d)}let d=new Set;for(let e of this._slots)e.target&&n.has(e.target)&&!d.has(e.target)?d.add(e.target):e.desc&&n.has(e.desc)&&!d.has(e.desc)?(e.target=e.desc,d.add(e.desc)):e.target=null;let f=this._slots.filter(e=>!e.target).sort((e,t)=>e.fade-t.fade),p=0;for(let e of n){if(d.has(e))continue;let t=f[p++];if(!t)break;t.target=e}}_updateSources(){if(!this._sources.size)return;let e=this.lighting;for(let[t,n]of this._sources){let r=this._handleOf(t);n.flickerFactor=r?r.flickerFactor:e.flickerAt(this._seeds.get(t)??jn(t.position),t.flicker??.3,t.flickerSpeed??2.6)}}_handleOf(e){if(!this.pooled){let t=this.descriptors.indexOf(e);return t>=0?this.handles[t]:null}for(let t of this._slots)if(t.desc===e)return t.handle;return null}},En=new B(0,-500,0);function Dn(e){return{position:e.position,color:k(e.color,m.NAMES),intensity:kn(e.intensity,8,0,200),distance:kn(e.distance,8,.5,100),flicker:kn(e.flicker,.2,0,1),nightOnly:e.nightOnly??!0,priority:e.priority??3,tag:e.tag}}function On(e,{cache:t=null}={}){return e.map((e,t)=>({d:e,i:t,p:e.priority??3})).sort((e,t)=>e.p-t.p||e.i-t.i).map(({d:e})=>{if(!t)return Dn(e);let n=t.get(e);return n||(n=Dn(e),t.set(e,n)),n})}function kn(e,t,n,r){return e===void 0?void 0:Math.min(r,Math.max(n,Number.isFinite(Number(e))&&e!==null&&e!==``?Number(e):t))}function An(e,t,n){let r=new Map,i=new Set(e),a=new Map,o=new Map;for(let e of t){if(!e.tag)continue;let t=o.get(e.tag)??0;o.set(e.tag,t+1),i.has(e)||a.set(`${e.tag}#${t}`,e)}if(!a.size)return r;o.clear();for(let t of e){if(!t.tag)continue;let e=o.get(t.tag)??0;if(o.set(t.tag,e+1),n.has(t))continue;let i=a.get(`${t.tag}#${e}`);i&&r.set(t,i)}return r}function jn(e){return e?(Math.imul(Math.round(e.x*64),73856093)^Math.imul(Math.round(e.y*64),19349663)^Math.imul(Math.round(e.z*64),83492791))>>>0:13}var Mn=new Set,Nn={campfire:0,hearth:0,fire:0,smithy:0,wallTorch:1,light:1,monument:1,lamppost:2,belfry:2,cathedral:2,house:3},Pn=class e{constructor({textures:e,seed:t=42,factory:n=null}){this.textures=e,this.factory=n??new Fe({textures:e,seed:t}),this._ownsFactory=!n}static isBuildable(e){return z[e]?.kind===`prop`}build(t,n){let r=z[t.type];if(!r||r.kind!==`prop`&&t.type!==`enemy`)return null;let i=this.factory,a=(e,t)=>n.getHeight(e,t),o=t.rotation??0,s={...t.opts??{},id:t.id};r.rotatable&&(s.rotation=o);let c=null,l=null;switch(t.type){case`house`:case`windmill`:case`well`:case`marketStall`:case`lamppost`:case`campfire`:case`bench`:case`barrel`:case`crate`:case`crateStack`:case`flowerbox`:case`signpost`:case`rock`:case`haystack`:case`chest`:case`waystone`:case`bed`:case`table`:case`chair`:case`shelf`:case`hearth`:case`counter`:case`rug`:case`staircase`:case`wardrobe`:case`sacks`:case`fire`:case`debris`:case`crag`:case`belfry`:case`monument`:case`smithy`:case`cathedral`:case`spire`:case`pavilion`:case`arcade`:case`villa`:case`halo`:case`skyCrystal`:case`runeCircle`:case`lightBeam`:case`skyStatue`:case`skyBanner`:case`planter`:case`floatingIsle`:t.type===`house`&&!s.upperWall&&delete s.upperWall,c=i[t.type](t.x,a(t.x,t.z),t.z,s);break;case`enemy`:return null;case`garland`:c=i.garland(t.x0,t.z0,t.x1,t.z1,a((t.x0+t.x1)/2,(t.z0+t.z1)/2),s),l=new B((t.x0+t.x1)/2,0,(t.z0+t.z1)/2);break;case`ship`:c=i.ship(t.x,n.getWaterSurface(t.x,t.z)??a(t.x,t.z),t.z,s);break;case`tree`:c=i.tree(t.x,a(t.x,t.z),t.z,s),t.collider===!1&&(c.colliders=[]);break;case`wallTorch`:{let e=t.x+Math.sin(o)*.6,n=t.z+Math.cos(o)*.6;c=i.wallTorch(t.x,a(e,n)+(t.dy??2.1),t.z,s);break}case`wallWindow`:{let e=t.x+Math.sin(o)*.6,n=t.z+Math.cos(o)*.6;c=i.wallWindow(t.x,a(e,n),t.z,s);break}case`light`:{let e=new D;e.name=`light:${t.id}`;let n=a(t.x,t.z)+(t.dy??1.5);e.position.set(t.x,n,t.z),c={object:e,colliders:[],emissives:[],emitters:[],lights:[{position:new B(t.x,n,t.z),color:t.color??`#ffb46b`,intensity:t.intensity??8,distance:t.distance??8,flicker:t.flicker??.2,nightOnly:t.nightOnly??!0}],dispose:()=>e.removeFromParent()};break}case`fence`:c=i.fence(t.x0,t.z0,t.x1,t.z1,a((t.x0+t.x1)/2,(t.z0+t.z1)/2),s),l=new B((t.x0+t.x1)/2,0,(t.z0+t.z1)/2);break;case`bridge`:{let e=t.deckY??Fn(n,t);c=i.bridge(t.x0,t.z0,t.x1,t.z1,e,s),l=new B((t.x0+t.x1)/2,e,(t.z0+t.z1)/2);break}case`waterfall`:{if(Number.isFinite(t.drop)){let e=In(n,t),r=Math.min(120,Math.max(1,t.drop)),a=Number.isFinite(t.seed)?t.seed:Number.isFinite(t.opts?.seed)?t.opts.seed:void 0,o=Le(`a fall into the void`).buildSkyFall(i,t.x,t.z,e,r,{width:t.width??2,facing:t.facing??`S`,seed:a,id:t.id});c={object:o.object,colliders:o.colliders??[],emissives:o.emissives??[],lights:[],emitters:o.emitters??[],update:o.update,dispose:()=>{o.dispose?.(),o.object.removeFromParent()},waterfall:o},l=new B(t.x,e-r,t.z);break}let e=Ln(n,t);c={object:e.object,colliders:[],emissives:[],lights:[],emitters:e.emitters??[],update:e.update,dispose:()=>{e.dispose(),e.object.removeFromParent()},waterfall:e},l=new B(t.x,e.bottom,t.z);break}default:return e.isBuildable(t.type)&&!Mn.has(t.type)&&(Mn.add(t.type),console.warn(`[Luminati] no build case for the prop type "${t.type}": its objects build nothing`)),null}let u=(c.lights??[]).map(e=>({...e,tag:`${t.type}:${t.id}`,priority:e.fire?Nn.fire:Nn[t.type]??3}));return t.type===`house`&&!t.light&&u.splice(0,u.length,...u.filter(e=>e.fire)),l||=new B(t.x,a(t.x,t.z),t.z),l.y===0&&(t.type===`fence`||t.type===`garland`)&&(l.y=a(l.x,l.z)),c.object.userData.levelObjectId=t.id,{object:c.object,colliders:c.colliders??[],walkRects:c.walkRects??[],lights:u,emissives:c.emissives??[],emitters:c.emitters??[],update:c.update??null,interact:c.interact??null,anchor:l,source:t,propResult:t.type===`light`||t.type===`waterfall`?null:c,dispose:()=>c.dispose?.()}}dispose(){this._ownsFactory&&this.factory.dispose()}};function Fn(e,t){let n=t.x1-t.x0,r=t.z1-t.z0,i=Math.hypot(n,r)||1,a=n/i,o=r/i,s=(t,n)=>{let r=e.tileAt(Math.floor(t),Math.floor(n));return r&&!r.water&&!r.type?.void?e.getHeight(t,n):null},c=s(t.x0-a*.5,t.z0-o*.5),l=s(t.x1+a*.5,t.z1+o*.5),u=-1/0;for(let i of[0,.25,.5,.75,1]){let a=e.getWaterSurface(t.x0+n*i,t.z0+r*i);a!=null&&a>u&&(u=a)}let d=c??l;return d==null?u>-1/0?u+.3:e.getHeight(t.x0,t.z0):u>-1/0?Math.max(d,u+.1):d}function In(e,t){let[n,r]=Ne(t.facing),i=t.x-n*.5+.01,a=t.z-r*.5+.01;return e.getWaterSurface(i,a)??e.getHeight(i,a)}function Ln(e,t){let[n,r]=Ne(t.facing),i=(t,n)=>e.getWaterSurface(t,n)??e.getHeight(t,n),a=In(e,t),o=i(t.x+n*.5+.01,t.z+r*.5+.01),s=Me({x:t.x,z:t.z,width:t.width??2,top:a,bottom:Math.min(o,a-.05),facing:t.facing??`S`});return s.top=a,s.bottom=o,s}var Rn=.62;function zn(e,t){return Te(Bn(e,t))}function*Bn(t,{textures:n,chunkSize:r=32,tileMapOptions:i={},deferShore:a=!1}){let o=Re(t.environment),s=o?{edgeAO:Number.isFinite(o.edgeAO)?Math.min(1,Math.max(0,o.edgeAO)):Rn}:null,c=new Oe(e(t),{textures:n,chunkSize:r,...s,...i,deferBuild:!0});yield*c.buildSteps();let l=new D;l.name=`terrain:${t.name}`,l.add(c.object);let u=null;return t.tiles.some(e=>[...e].some(e=>t.legend[e]?.water))&&(u=new Pe(c,{flow:t.water?.flow??[0,.45],reflect:t.water?.reflect??.2,neutral:t.water?.neutral??.2,glint:Vn(t),deferShore:a}),l.add(u.object)),{tileMap:c,water:u,object:l,dispose:()=>{u?.dispose(),c.dispose(),l.removeFromParent()}}}function Vn(e){let t=e?.water?.glint,n=Number(t);return t!==null&&t!==``&&Number.isFinite(n)?Math.max(0,n):1}function Hn(e,t=3){let n=1/0,r=-1/0,i=1/0,a=-1/0;if(e.tiles.forEach((t,o)=>{for(let s=0;s<t.length;s++){let c=e.legend[t[s]];!c||c.void||c.water||c.walkable===!1||(n=Math.min(n,s),r=Math.max(r,s+1),i=Math.min(i,o),a=Math.max(a,o+1))}}),!Number.isFinite(n))return{minX:0,maxX:e.width,minZ:0,maxZ:e.depth};let o=(n+r)/2,s=(i+a)/2,c=Math.max(0,(r-n)/2-t),l=Math.max(0,(a-i)/2-t);return{minX:o-c,maxX:o+c,minZ:s-l,maxZ:s+l}}var Un=he({FOREST_KINDS:()=>qn,buildOuterGround:()=>cr,forestKindAreas:()=>Yn,makeOuterHeight:()=>ir,mergeTreeSteps:()=>Kn,mergeTrees:()=>Gn,outerGroundSteps:()=>lr,scatterForest:()=>Xn,scatterForestSteps:()=>Zn,sceneryProp:()=>rr}),$=new B,Wn=[`position`,`aCenter`,`aSway`,`aPhase`];function Gn(e,t={}){return Te(Kn(e,t))}function*Kn(e,{name:t=`trees`,castShadow:n=!0,maxTriangles:r=1/0,maxExtent:i=1/0,minTriangles:a=0,tags:o=null}={}){let s=new Map,c=!!o?.size,l=[];for(let t of e){let e=t.object,r=c?o.get(t)??null:null;e.updateWorldMatrix(!0,!0);let i=oe(Math.round(e.position.x*7),Math.round(e.position.z*7),3)*Math.PI*2;e.traverse(t=>{if(!t.isMesh||Array.isArray(t.material))return;let a=t.material,o=n&&t.castShadow,c=`${a.uuid}|${+o}|${+t.receiveShadow}`,l=s.get(c);l||(l={material:a,castShadow:o,receiveShadow:t.receiveShadow,depth:t.customDepthMaterial,geos:[],pos:[],tags:[]},s.set(c,l));let u=t.geometry,d=u.clone(),f=t.matrixWorld;d.applyMatrix4(f);let p=d.getAttribute(`aCenter`);if(p){let e=u.getAttribute(`aCenter`),t=u.getAttribute(`position`),n=d.getAttribute(`position`),r=f.elements,i=Math.hypot(r[0],r[1],r[2]);for(let r=0;r<p.count;r++)$.fromBufferAttribute(e,r).applyMatrix4(f),p.setXYZ(r,$.x,$.y,$.z),n.setXYZ(r,$.x+(t.getX(r)-e.getX(r))*i,$.y+(t.getY(r)-e.getY(r))*i,$.z+(t.getZ(r)-e.getZ(r))*i)}let m=d.getAttribute(`aPhase`);if(m)for(let e=0;e<m.count;e++)m.setX(e,m.getX(e)+i);l.geos.push(d),l.pos.push([e.position.x,e.position.z]),l.tags.push(r)}),t.dispose?.(),yield}let u=new D;u.name=t;let d=[];for(let e of s.values()){let n=e.geos.map((e,t)=>t),o=Number.isFinite(r)||Number.isFinite(i)?De(n,{x:t=>e.pos[t][0],z:t=>e.pos[t][1],weight:t=>we(e.geos[t]),maxWeight:r,maxExtent:i,minWeight:a}):[n];c&&(o=o.map(t=>Ee(t,t=>e.tags[t])));for(let n=0;n<o.length;n++){let r=o[n],i=Ae(r.map(t=>e.geos[t]),!1);if(!i)continue;c&&l.push(...Ce(i,r.map(t=>e.geos[t].attributes.position.count),r.map(t=>e.tags[t]),Wn)),i.computeBoundingSphere(),i.computeBoundingBox(),i.boundingSphere.radius+=1.8,i.boundingBox.expandByScalar(1.8);let a=new W(i,e.material);a.name=`${t}:${e.material.name||`mat`}${o.length>1?`#${n}`:``}`,a.castShadow=e.castShadow,a.receiveShadow=e.receiveShadow,e.depth&&(a.customDepthMaterial=e.depth),a.matrixAutoUpdate=!1,u.add(a),d.push(a),yield}for(let t of e.geos)t.dispose()}return{object:u,meshes:d,ranges:l,dispose(){for(let e of d)e.geometry.dispose();u.removeFromParent()}}}var qn=Object.freeze([`oak`,`pine`,`birch`,`autumn`,`blossom`,`maple`,`goldbirch`,`snowpine`,`bare`,`bamboo`,`banana`]),Jn=new Set([`pine`,`snowpine`]);function Yn(e){let t=e?.forest&&typeof e.forest==`object`&&Array.isArray(e.forest.areas)?e.forest.areas:[],n=[];for(let e of t){if(!e||typeof e!=`object`||![`minX`,`maxX`,`minZ`,`maxZ`].every(t=>Number.isFinite(e[t])))continue;let t=e.kinds&&typeof e.kinds==`object`?e.kinds:{},r=qn.map(e=>[e,Number.isFinite(t[e])&&t[e]>0?t[e]:0]).filter(([,e])=>e>0),i=r.reduce((e,[,t])=>e+t,0);if(!(i>0))continue;let a=0,o=r.map(([e,t])=>[e,a+=t/i]);n.push({minX:e.minX,maxX:e.maxX,minZ:e.minZ,maxZ:e.maxZ,cumulative:o})}return n}function Xn(e){return Te(Zn(e))}function*Zn({tileMap:e,heightAt:t,seed:n=77,avoid:r=[],southGap:i=0,kindAreas:a=[],climate:o=null,season:s=null}){if(o===`arid`)return yield*nr({tileMap:e,heightAt:t,seed:n,avoid:r,southGap:i});let c=s?Ie()?.SEASON_LAND:null,l=c&&Object.hasOwn(c.mix,s)?c.mix[s]:null,u=e.width,d=e.depth,f=new re(n),p=[],m=[],h=[],g=1.35,_=new Map,v=(e,t)=>`${Math.floor(e/g)},${Math.floor(t/g)}`,y=(e,t,n)=>{let i=Math.floor(e/g),a=Math.floor(t/g);for(let r=-2;r<=2;r++)for(let o=-2;o<=2;o++){let s=_.get(`${i+o},${a+r}`);if(s){for(let r of s)if((r.x-e)**2+(r.z-t)**2<(r.r+n)**2)return!1}}for(let i of r)if((i.x-e)**2+(i.z-t)**2<(i.r+n)**2)return!1;return!0},b=(e,t,n)=>{let r={x:e,z:t,r:n};h.push(r);let i=v(e,t),a=_.get(i);a||_.set(i,a=[]),a.push(r)},x=(e,t,r)=>{for(let n=0;n<a.length;n++){let i=a[n];if(!(e<i.minX||e>=i.maxX||t<i.minZ||t>=i.maxZ)){for(let[e,t]of i.cumulative)if(r<t)return e;return i.cumulative[i.cumulative.length-1][0]}}let i=t<6,o=e>u*.72&&t>8,s=F(e*.09,t*.09,{seed:n+5,octaves:2});if(l){let e=i?l.north:s>.55?l.dense:l.open;for(let[t,n]of e)if(r<n)return t;return e[e.length-1][0]}return i?r<.5?`pine`:r<.82?`oak`:`birch`:o?r<.5?`autumn`:r<.78?`oak`:r<.9?`pine`:`birch`:s>.55?r<.6?`pine`:`oak`:r<.62?`oak`:r<.82?`pine`:r<.93?`birch`:`autumn`},S=(e,t,n)=>{if(n.char!==`T`||t>=d-3)return;let r=t<3?1:2,i=t>=9?Math.min(e,u-1-e):-1;for(let a=0;a<r;a++){let r=e+f.range(.1,.9),a=t+f.range(.1,.9),o=f.range(.85,1.25);if(!y(r,a,o))continue;let s=x(r,a,f.next()),c=(Jn.has(s)?5.4:s===`banana`?3.2:s===`bamboo`?6:s===`birch`||s===`goldbirch`?5.2:5)*f.range(.85,1.25)*(i===1?.8:1);i!==2&&(b(r,a,o),p.push([s,r,n.h,a,c]))}};for(let t=0;t<d;t++){for(let n=0;n<u;n++){let r=e.tileAt(n,t);r&&S(n,t,r)}yield}let C=$n(e,Qn);for(let e=0;e<5200;e++){e%400==399&&(yield);let r=f.range(-34,u+34),a=f.range(-44,d+20.4),o=Math.max(0,-r,r-u),s=Math.max(0,-a,a-d),c=Math.hypot(o,s);if(c<.6||i>0&&a>d&&a<d+i||c<Qn&&C?.(r,a))continue;let l=F(r*.075+11,a*.075-4,{seed:n+2,octaves:3}),p=1-H(4,30,c),h=V((l-.42)*2.6+p*(a<0?.35:.75),0,1)*(1-H(24,34,c)*.85);if(f.next()>h)continue;let g=f.range(.95,1.5);if(!y(r,a,g))continue;b(r,a,g);let _=x(r,a,f.next()),v=Jn.has(_)?5.8:_===`banana`?3.4:_===`bamboo`?6.4:5.2;m.push([_,r,t(r,a),a,v*f.range(.85,1.35)])}return{border:p,outer:m}}var Qn=2.5;function $n(e,t){let n=e.width,r=e.depth,i=(t,n)=>{let r=e.tileAt(t,n);return!!r&&!r.water&&!r.type?.void&&(r.type?.walkable??!0)!==!1},a=new Set,o=(e,t)=>{let r=[];for(let o=0;o<=e;o++){let s=o<e?t(o):null;if(s&&i(s[0],s[1])){r.push(s);continue}if(r.length>=3)for(let[e,t]of r)a.add(t*n+e);r=[]}};return o(n,e=>[e,0]),o(n,e=>[e,r-1]),o(r,e=>[0,e]),o(r,e=>[n-1,e]),a.size?(e,i)=>{let o=Math.max(0,Math.floor(e-t)),s=Math.min(n-1,Math.floor(e+t)),c=Math.max(0,Math.floor(i-t)),l=Math.min(r-1,Math.floor(i+t));for(let r=c;r<=l;r++)for(let c=o;c<=s;c++){if(!a.has(r*n+c))continue;let o=Math.max(0,c-e,e-(c+1)),s=Math.max(0,r-i,i-(r+1));if(o*o+s*s<t*t)return!0}return!1}:null}var er={juniper:3.4,deadwood:4,crag:3.4};function tr(e){return e===`basalt`||e===`ash`||e===`scorched`?`basalt`:e===`red_sand`||e===`redrock`?`redrock`:`sandstone`}function*nr({tileMap:e,heightAt:t,seed:n,avoid:r,southGap:i}){let a=e.width,o=e.depth,s=new re(n+4111),c=[],l=[],u=1.35,d=new Map,f=(e,t,n)=>{let i=Math.floor(e/u),a=Math.floor(t/u);for(let r=-2;r<=2;r++)for(let o=-2;o<=2;o++){let s=d.get(`${i+o},${a+r}`);if(s){for(let r of s)if((r.x-e)**2+(r.z-t)**2<(r.r+n)**2)return!1}}for(let i of r)if((i.x-e)**2+(i.z-t)**2<(i.r+n)**2)return!1;return!0},p=(e,t,n)=>{let r=`${Math.floor(e/u)},${Math.floor(t/u)}`,i=d.get(r);i||d.set(r,i=[]),i.push({x:e,z:t,r:n})},m=(e,t)=>e?t<.24?`crag`:t<.6?`deadwood`:`juniper`:t<.56?`juniper`:t<.82?`deadwood`:`crag`,h=(e,t,n,r,i,a)=>[e===`crag`?`crag:${t}`:e,n,r,i,er[e]*a];for(let t=0;t<o;t++){for(let n=0;n<a;n++){let r=e.tileAt(n,t);if(!r||r.char!==`T`||t>=o-3)continue;let i=t>=9?Math.min(n,a-1-n):-1,l=t<3?1:2;for(let e=0;e<l;e++){let e=n+s.range(.1,.9),a=t+s.range(.1,.9),o=s.range(.95,1.4),l=s.next(),u=s.range(.7,1.35)*(i===1?.78:1);i===2||l>.72||!f(e,a,o)||(p(e,a,o),c.push(h(m(t<6,s.next()),tr(r.type.top),e,r.h,a,u)))}}yield}let g=$n(e,Qn);for(let e=0;e<5200;e++){e%400==399&&(yield);let r=s.range(-34,a+34),c=s.range(-44,o+20.4),u=Math.max(0,-r,r-a),d=Math.max(0,-c,c-o),_=Math.hypot(u,d);if(_<.6||i>0&&c>o&&c<o+i||_<Qn&&g?.(r,c))continue;let v=F(r*.08+31,c*.08-9,{seed:n+3,octaves:3}),y=1-H(4,30,_),b=V((v-.48)*2.2+y*.35,0,1)*.42*(1-H(22,34,_)*.85);if(s.next()>b)continue;let x=s.range(1.1,1.7),S=t(r,c),C=m(c<0,s.next()),w=s.range(.85,1.4);if(c<-5&&S>t(r,-1)+3&&C!==`crag`||!f(r,c,x))continue;p(r,c,x);let T=F(r*.05,c*.05,{seed:n+6,octaves:2})>.58?`redrock`:`sandstone`;l.push(h(C,T,r,S,c,w))}return{border:c,outer:l}}function rr(e,[t,n,r,i,a]){return t.startsWith(`crag:`)?e.crag(n,r,i,{kind:`spire`,stone:t.slice(5),height:a,width:V(a*.42,1,2.2)}):e.tree(n,r,i,{kind:t,height:a,fallenLeaves:!1})}function ir(e,{climate:t=null,season:n=null}={}){let r=t===`arid`,i=n?Ie()?.SEASON_LAND:null,a=e.width,o=e.depth,s=(t,n)=>{let r=-1/0;for(let i of[-.5,.5])for(let s of[-.5,.5]){let c=V(Math.floor(t+i),0,a-1),l=V(Math.floor(n+s),0,o-1),u=e.tileAt(c,l);if(!u)continue;let d=u.water?Math.max(u.h,.5):u.h;d>r&&(r=d)}return Number.isFinite(r)?r:0};return(t,c)=>{let l=V(t,0,a),u=V(c,0,o),d=t-l,f=c-u,p=Math.hypot(d,f),m=s(l,u)-.04;if(p<1e-6)return m;let h=(F(t*.05,c*.05,{seed:91,octaves:3})-.5)*3.2,g=H(0,10,p),_=m+h*g;if(r)return Math.max(_+or(t,c,a,o),m-.6*g);let v=H(2,-30,c);_+=v*(H(0,40,-c)*7+F(t*.03,c*.04,{seed:17,octaves:4})*9*H(-6,-40,c));let y=H(-55,-120,c);_+=y*(18+F(t*.018,3.1,{seed:23,octaves:4})*34);let b=H(18,90,Math.max(-t,t-a,c-o));return _+=b*(4+F(t*.02,c*.02,{seed:29,octaves:3})*14),i&&(_+=i.relief(n,e,t,c,l,u,p,v,y)),Math.max(_,m-.6*g)}}var ar=(e,t,n,r=4)=>1-Math.abs(F(e,t,{seed:n,octaves:r})*2-1);function or(e,t,n,r){let i=0,a=H(2,-30,t),o=(H(0,36,-t)*9+ar(e*.035,t*.045,17)*12*H(-6,-40,t))/3,s=Math.floor(o);i+=a*(s+H(.6,.95,o-s))*3;let c=H(-46,-100,t);i+=c*(24+ar(e*.016,t*.022+4.1,23,5)*62);let l=H(16,70,Math.max(-e,e-n,t-r)),u=F(e*.024,t*.024,{seed:29,octaves:3})*4,d=Math.floor(u);return i+=l*(3+(d+H(.72,.98,u-d))*6.5),i}function*sr(e,t,n){let r=e.index,i=e.getAttribute(`position`),a=new b(new Float32Array(i.count*3),3);e.setAttribute(`normal`,a);let o=new B,s=new B,c=new B,l=new B,u=new B,d=new B,f=new B,p=new B,m=0;for(let e=0,n=r.count;e<n;e+=3){let n=r.getX(e),h=r.getX(e+1),g=r.getX(e+2);o.fromBufferAttribute(i,n),s.fromBufferAttribute(i,h),c.fromBufferAttribute(i,g),f.subVectors(c,s),p.subVectors(o,s),f.cross(p),l.fromBufferAttribute(a,n),u.fromBufferAttribute(a,h),d.fromBufferAttribute(a,g),l.add(f),u.add(f),d.add(f),a.setXYZ(n,l.x,l.y,l.z),a.setXYZ(h,u.x,u.y,u.z),a.setXYZ(g,d.x,d.y,d.z),++m===t&&(m=0,yield)}yield;for(let e=0,t=a.count;e<t;e++)$.fromBufferAttribute(a,e).normalize(),a.setXYZ(e,$.x,$.y,$.z),e%n===n-1&&(yield);a.needsUpdate=!0}function cr(e){let t=lr(e),n=t.next();for(;!n.done;)n=t.next();return n.value}function*lr({textures:e,tileMap:t,heightAt:n,extent:r=170,rowsPerStep:i=12,climate:o=null,season:s=null}){let c=o===`arid`,l=!c&&s?Ie()?.SEASON_LAND:null,u=l&&Object.hasOwn(l.outer,s)?l.outer[s]:null,d=t.width,f=t.depth,p=(e,t)=>{let n=new Set;for(let t=e-r;t<e-40;t+=10)n.add(t);for(let t=e-40;t<e-16;t+=2)n.add(t);for(let r=e-16;r<=t+16;r+=1)n.add(r);for(let e=t+16;e<=t+40;e+=2)n.add(e);for(let e=t+40;e<=t+r;e+=10)n.add(e);return[...n].sort((e,t)=>e-t)},h=p(0,d),g=p(0,f),_=h.length,v=g.length,y=new Float32Array(_*v*3),x=new Float32Array(_*v*2),S=new Float32Array(_*v*3),C=new Float32Array(_*v);for(let e=0;e<v;e++){for(let t=0;t<_;t++){let r=h[t],i=g[e];C[e*_+t]=n(r,i)}e%i===i-1&&(yield)}let w=u?u[0]:c?`arid_dirt`:`grass_dark`,T=e.meta(w).units,E=new m,ee=new m(1,1,1),D=u?new m(...u[1]):c?new m(1.04,.96,.88):new m(.78,.86,.72),O=u?new m(...u[2]):c?new m(1.02,.74,.6):new m(.62,.6,.66),te=new m(.92,.86,.84);for(let e=0;e<v;e++){for(let t=0;t<_;t++){let n=e*_+t,r=h[t],i=g[e],a=C[n];y[n*3]=r,y[n*3+1]=a,y[n*3+2]=i,x[n*2]=r/T[0],x[n*2+1]=-i/T[1];let o=C[e*_+Math.max(0,t-1)],s=C[e*_+Math.min(_-1,t+1)],l=C[Math.max(0,e-1)*_+t],p=C[Math.min(v-1,e+1)*_+t],m=(s-o)/Math.max(.001,h[Math.min(_-1,t+1)]-h[Math.max(0,t-1)]),b=(p-l)/Math.max(.001,g[Math.min(v-1,e+1)]-g[Math.max(0,e-1)]),w=Math.hypot(m,b),k=Math.max(0,-r,r-d),A=Math.max(0,-i,i-f),j=Math.hypot(k,A);E.copy(ee).lerp(D,H(20,80,j)).lerp(O,H(.55,1.2,w)),c&&E.lerp(te,H(26,60,a));let M=I(u?u[3]:c?.8:.62,1,H(0,14,j))*(.9+.2*F(r*.11,i*.11,{seed:4,octaves:2}));S[n*3]=E.r*M,S[n*3+1]=E.g*M,S[n*3+2]=E.b*M}e%i===i-1&&(yield)}let k=(e,t)=>e>0&&e<t,A=0;for(let e=0;e<_-1;e++)k((h[e]+h[e+1])/2,d)&&A++;let j=0;for(let e=0;e<v-1;e++)k((g[e]+g[e+1])/2,f)&&j++;let M=(_-1)*(v-1)-A*j,N=_*v-1>=65535?new Uint32Array(M*6):new Uint16Array(M*6),P=0;for(let e=0;e<v-1;e++){let t=k((g[e]+g[e+1])/2,f);for(let n=0;n<_-1;n++){if(t&&k((h[n]+h[n+1])/2,d))continue;let r=e*_+n,i=r+1,a=r+_,o=a+1;N[P++]=r,N[P++]=a,N[P++]=i,N[P++]=i,N[P++]=a,N[P++]=o}e%i===i-1&&(yield)}let L=new a;L.setAttribute(`position`,new b(y,3)),L.setAttribute(`uv`,new b(x,2)),L.setAttribute(`color`,new b(S,3)),L.setIndex(new b(N,1)),yield,yield*sr(L,i*(_-1)*2,i*_),L.computeBoundingSphere();let R=e.material(w,{vertexColors:!0,normalScale:.35}),z=new W(L,R);return z.name=`OuterGround`,z.receiveShadow=!0,z.castShadow=!1,z.matrixAutoUpdate=!1,z.updateMatrix(),z}var ur=Object.freeze({distance:30,pitch:32,fov:28,minDistance:18,maxDistance:42}),dr=1/90,fr=Object.freeze({noon:12.6,lat:32,dec:14,refTime:17.2,refAzimuth:-112}),pr=Object.freeze({refAzimuth:40}),mr=Object.freeze({night:{hemiI:1.6,hemiSky:`#3656c0`,hemiGround:`#1a2042`,sunI:1,exp:1.36},"late night":{hemiI:1.55,hemiSky:`#3656c0`,hemiGround:`#1a2042`,sunI:.9,exp:1.36},"blue hour":{hemiI:1.5,exp:1.36},sunset:{hemiI:1.45,exp:1.2},"purple dusk":{sunI:.85,hemiI:1.62,exp:1.46},"golden hour":{hemiGround:`#7a6058`,hemiSky:`#6a80d4`}}),hr=Object.freeze({normalUp:.6,wrap:.6,roundness:.55,emissive:`#ffe9d2`,emissiveIntensity:.06}),gr=Object.freeze({day:.05,night:.03}),_r=Object.freeze([.5,.62]),vr=Object.freeze({alpha:.2,color:`#b3aca6`,colorEnd:`#85828c`,size:[.3,.46],sizeEnd:3.4}),yr=Object.freeze({countPerWidth:8,alpha:.07}),br=4e3;function xr(e){return Math.max(e.width,e.depth)>64?br:1/0}function Sr(e){return!!e&&e.interior===!0}function Cr(e){return e?.climate===`arid`?`arid`:null}function wr(e){let t=e?.season;return t===`spring`||t===`summer`||t===`autumn`||t===`winter`?t:null}function Tr(e){let t=e?.frost;if(!t||typeof t!=`object`||typeof t.until!=`string`||!t.until.trim())return null;let n=Array.isArray(t.at)&&t.at.length===2&&t.at.every(Number.isFinite)?[t.at[0],t.at[1]]:null;return{until:t.until,cover:Number.isFinite(t.cover)?V(t.cover,.2,1):1,at:n,ice:t.ice===!0,falls:t.falls===!0,patches:Array.isArray(t.patches)?t.patches.filter(e=>e&&typeof e.when==`string`&&Array.isArray(e.at)&&Number.isFinite(e.r)):[]}}function Er(e){let t=e?.states;return Array.isArray(t)?t.filter(e=>e&&typeof e==`object`&&typeof e.when==`string`&&e.when.trim()).slice(0,8):[]}function Dr(e){return Number.isFinite(e?.aurora)?V(e.aurora,0,1):0}var Or=Object.freeze({explore:`emberfall`,battle:`battle`,boss:`boss`});function kr(e,t){let n=e?.soundtrack,r=n&&typeof n==`object`&&Object.hasOwn(n,t)?n[t]:void 0;return typeof r==`string`&&r.trim()?r.trim():Or[t]}function Ar(e){return!Sr(e)&&!Re(e)&&e?.border===`forest`}function jr(e){return!Sr(e)&&!Re(e)&&e?.outerScenery!==!1}function Mr(e,t){return Sr(e)?`clear`:t}function Nr(e){let t=typeof e?.backdrop==`string`?e.backdrop.trim():``;return t===`void`?`#000000`:/^#[0-9a-fA-F]{6}$/.test(t)?t.toLowerCase():null}var Pr=Object.freeze({x:20,y:4.5,z:16});function Fr(e){let t=e.width??2;return{count:Math.max(4,Math.round(yr.countPerWidth*t)),alpha:yr.alpha,...e.mist??{}}}function Ir(e){return Number.isFinite(e?.scenery?.southGap)?e.scenery.southGap:5}function Lr(e,t,n){let r=[];if(e.godRays===!1||Sr(e))return r;let i=Array.isArray(e.godRayAreas)&&e.godRayAreas.length?e.godRayAreas:[Rr(t,n)];for(let e of i){if(!e||typeof e!=`object`)continue;let t=Math.min(12,Math.max(0,Math.round(e.count??3)));t&&e.maxX>e.minX&&e.maxZ>e.minZ&&r.push({bounds:{minX:e.minX,maxX:e.maxX,minZ:e.minZ,maxZ:e.maxZ,y:Number.isFinite(e.y)?e.y:0},count:t,seed:Number.isFinite(e.seed)?e.seed:7})}return r}function Rr(e,t){let n=Hn(e,1),r=new Map;t?.forEachTile((e,t,n)=>{if(!n.walkable||n.water)return;let i=Math.round(n.h*2);r.set(i,(r.get(i)??0)+1)});let i=0,a=-1;for(let[e,t]of r)t>a&&(a=t,i=e/2);let o=Math.max(1,(n.maxX-n.minX)*(n.maxZ-n.minZ));return{...n,y:i,count:Math.max(1,Math.min(6,Math.round(o/90))),seed:7}}function zr(e){let t=e.environment??{},n=t.foliage&&typeof t.foliage==`object`?t.foliage:{},r=e=>(Array.isArray(e)?e:[]).filter(e=>e&&[`minX`,`maxX`,`minZ`,`maxZ`].every(t=>Number.isFinite(e[t]))),i=r(n.flowerAreas).map(e=>({...e,palette:(Array.isArray(e.palette)?e.palette:[]).filter(e=>Number.isInteger(e)&&e>=0&&e<=3)})).filter(e=>e.palette.length),a=r(n.shrubAreas).filter(e=>Number.isFinite(e.chance)),o=(t,n)=>t>=0&&n>=0&&t<=e.width&&n<=e.depth,s=t=>e.objects.filter(e=>e.type===t);return{trees:s(`tree`).filter(e=>o(e.x,e.z)).map(e=>({x:e.x,z:e.z,r:.3})),clearings:s(`npc`).map(e=>({x:e.x,z:e.z,r:Math.min(8,Math.max(0,Number.isFinite(e.wander)?e.wander:1.2))+.8})),seed:Number.isFinite(n.seed)?n.seed:2024,flowerAreas:i,shrubAreas:a,cropAreas:(Array.isArray(n.cropAreas)?n.cropAreas:[]).filter(e=>e&&[`x`,`z`,`w`,`h`].every(t=>Number.isFinite(e[t]))&&(e.kind===`wheat`||e.kind===`stubble`||e.kind===`rice`))}}function Br(e){let t=e&&typeof e==`object`?e:{},n=V(Vr(t.distance,ur.distance),8,80);return{distance:n,pitch:V(Vr(t.pitch,ur.pitch),10,80),minDistance:Math.min(ur.minDistance,n),maxDistance:Math.max(ur.maxDistance,n)}}var Vr=(e,t)=>Number.isFinite(Number(e))&&e!==null&&e!==``?Number(e):t,Hr=Object.freeze({toneMapping:7,grade:Object.freeze({exposure:1,vignette:.1,grain:0,chromaticAberration:0,highlightsTint:Object.freeze([.0234,.0312,.0429]),shadowsTint:Object.freeze([.022,.015,.026]),highlightsWarm:1}),gradeTemperature:0,gradeSaturation:1.28,viewExposure:Object.freeze({plain:.81,open:.965}),viewFill:Object.freeze({plain:1.12,open:.9}),viewLift:Object.freeze({plain:.8,open:1}),shadeView:Object.freeze([.2,.7]),rain:Object.freeze({fog:2,exposure:1.08}),plainGrade:Object.freeze({temperature:.04,saturation:1.3}),plainSun:Object.freeze([27,46])}),Ur=Object.freeze({shadowRadius:4,haze:Object.freeze({tint:`#e2d5de`,mix:.45,lift:.06,sun:Object.freeze([18,40])})}),Wr=Object.freeze({horizonExponent:.28,cloudBand:.7}),Gr=Object.freeze([{t:0,name:`night`,top:`#040a26`,horizon:`#21366c`,bottom:`#0c1742`,sun:`#82a0ff`,sunI:1.05,hemiSky:`#3c5ac4`,hemiGround:`#2e3a74`,hemiI:1.7,fog:.0085,exp:2,night:1,moon:1,shadow:.6,glow:.4,clouds:.28},{t:4.3,name:`late night`,top:`#060c2a`,horizon:`#25396e`,bottom:`#0e1946`,sun:`#86a2ff`,sunI:.95,hemiSky:`#3c5ac4`,hemiGround:`#303c76`,hemiI:1.65,fog:.0088,exp:2,night:1,moon:1,shadow:.58,glow:.5,clouds:.3},{t:5.25,name:`pre-dawn`,top:`#18225a`,horizon:`#6a6aaa`,bottom:`#2c2e66`,sun:`#a8aef0`,sunI:.22,hemiSky:`#5c66b0`,hemiGround:`#52507e`,hemiI:1.28,fog:.0095,exp:1.86,night:.86,moon:1,shadow:.35,glow:.8,clouds:.36},{t:6.1,name:`pink dawn`,top:`#3a58a8`,horizon:`#f4b4b8`,bottom:`#9a82ba`,sun:`#ff9e82`,sunI:2.4,hemiSky:`#9c90cc`,hemiGround:`#ceb2bc`,hemiI:1.2,fog:.0051,exp:1.45,night:.3,moon:0,shadow:.85,glow:1,clouds:.4},{t:6.9,name:`sunrise`,top:`#3e72cc`,horizon:`#f8d6bc`,bottom:`#aaa4c8`,sun:`#ffcaa6`,sunI:3,hemiSky:`#a8a4d0`,hemiGround:`#e2d0d4`,hemiI:1.35,fog:.0045,exp:1.43,night:.06,moon:0,shadow:.88,glow:1,clouds:.4},{t:8,name:`morning`,top:`#246eb2`,horizon:`#a6b6c7`,bottom:`#8aa6c6`,sun:`#ffffff`,sunI:3.6,hemiSky:`#aca0b2`,hemiGround:`#d9c9e7`,hemiI:1.5,fog:.0032,exp:1.435,night:0,moon:0,shadow:.9,glow:.85,clouds:.4},{t:12.2,name:`noon`,top:`#226ab0`,horizon:`#a5b6c6`,bottom:`#86a4c4`,sun:`#ffffff`,sunI:3.6,hemiSky:`#aca0b2`,hemiGround:`#d9c9e7`,hemiI:1.5,fog:.003,exp:1.421,night:0,moon:0,shadow:.9,glow:.75,clouds:.38},{t:15.3,name:`afternoon`,top:`#2670b4`,horizon:`#a9bac8`,bottom:`#8ca8c4`,sun:`#fffaf2`,sunI:3.6,hemiSky:`#aca0b0`,hemiGround:`#dbc9e3`,hemiI:1.48,fog:.0032,exp:1.411,night:0,moon:0,shadow:.9,glow:.8,clouds:.42},{t:17.2,name:`golden hour`,top:`#3456a8`,horizon:`#ffc888`,bottom:`#c4a0a8`,sun:`#ffd48a`,sunI:4.6,hemiSky:`#9a8cb8`,hemiGround:`#e2d2c0`,hemiI:1.5,fog:.0029,exp:1.58,night:0,moon:0,shadow:.9,glow:1,clouds:.4},{t:18.45,name:`sunset`,top:`#2a3080`,horizon:`#f49a82`,bottom:`#7a5c96`,sun:`#ff8c5c`,sunI:3,hemiSky:`#7464bc`,hemiGround:`#a88894`,hemiI:1.42,fog:.0055,exp:1.42,night:.22,moon:0,shadow:.82,glow:1.25,clouds:.46},{t:19.25,name:`purple dusk`,top:`#1a1e5a`,horizon:`#8c6aa8`,bottom:`#2e2a5e`,sun:`#c48ab4`,sunI:.85,hemiSky:`#5256aa`,hemiGround:`#5a4a7c`,hemiI:1.6,fog:.009,exp:1.76,night:.62,moon:0,shadow:.5,glow:.9,clouds:.42},{t:20.05,name:`blue hour`,top:`#0b1446`,horizon:`#2e4890`,bottom:`#13204e`,sun:`#7896f4`,sunI:.45,hemiSky:`#3450b0`,hemiGround:`#2e3674`,hemiI:1.55,fog:.009,exp:1.94,night:.92,moon:1,shadow:.5,glow:.5,clouds:.38},{t:21.4,name:`night`,top:`#050b28`,horizon:`#22386e`,bottom:`#0c1742`,sun:`#82a0ff`,sunI:1.05,hemiSky:`#3c5ac4`,hemiGround:`#2e3a74`,hemiI:1.7,fog:.0085,exp:2,night:1,moon:1,shadow:.6,glow:.4,clouds:.28}].map(e=>Object.freeze(e))),Kr=Object.freeze({count:96,size:[.05,.11],color:`#ffd27a`,hdr:2.1,alpha:.8,windInfluence:.18,velocity:[.02,.12,0],velocityVariance:[.05,.05,.05],nightVisibility:-.15}),qr=Object.freeze([{t:0,name:`night`,top:`#04071a`,horizon:`#2e2442`,bottom:`#0b0c24`,sun:`#7c96f2`,sunI:1,hemiSky:`#3654bc`,hemiGround:`#251c2c`,hemiI:1.58,fog:.0098,exp:1.36,night:1,moon:1,shadow:.6,glow:.45,clouds:.12},{t:4.3,name:`late night`,top:`#060a20`,horizon:`#33284a`,bottom:`#0d0e2a`,sun:`#809af2`,sunI:.9,hemiSky:`#3654bc`,hemiGround:`#261c2e`,hemiI:1.52,fog:.0102,exp:1.36,night:1,moon:1,shadow:.58,glow:.5,clouds:.14},{t:5.25,name:`pre-dawn`,top:`#181a46`,horizon:`#7a5874`,bottom:`#2a2244`,sun:`#a6a2e2`,sunI:.18,hemiSky:`#5a5ea6`,hemiGround:`#2c2030`,hemiI:1.05,fog:.0125,exp:1.26,night:.86,moon:1,shadow:.35,glow:.85,clouds:.2},{t:6.1,name:`pink dawn`,top:`#3a4a94`,horizon:`#f7a27a`,bottom:`#8e6488`,sun:`#ff8456`,sunI:2.4,hemiSky:`#9c86cc`,hemiGround:`#7a4c3c`,hemiI:1,fog:.0118,exp:1.08,night:.3,moon:0,shadow:.85,glow:1.05,clouds:.2},{t:6.9,name:`sunrise`,top:`#4c72c0`,horizon:`#fbc694`,bottom:`#a8869a`,sun:`#ffbe84`,sunI:3,hemiSky:`#9cb0de`,hemiGround:`#7e5a40`,hemiI:1.05,fog:.0118,exp:1.05,night:.06,moon:0,shadow:.95,glow:1,clouds:.18},{t:8,name:`morning`,top:`#5488d2`,horizon:`#ecdcc2`,bottom:`#c2aa8c`,sun:`#fff0d2`,sunI:3.5,hemiSky:`#a6c0e6`,hemiGround:`#94704c`,hemiI:1.05,fog:.0104,exp:1,night:0,moon:0,shadow:1,glow:.8,clouds:.15},{t:12.2,name:`noon`,top:`#5a94de`,horizon:`#e8e2d2`,bottom:`#cab494`,sun:`#fffaf0`,sunI:3.9,hemiSky:`#b2cae8`,hemiGround:`#a08058`,hemiI:1.02,fog:.0102,exp:.95,night:0,moon:0,shadow:1,glow:.6,clouds:.12},{t:15.3,name:`afternoon`,top:`#5a8cd8`,horizon:`#ecdcbe`,bottom:`#c2a688`,sun:`#ffe8c0`,sunI:3.9,hemiSky:`#a6bce6`,hemiGround:`#9a7450`,hemiI:1.06,fog:.0104,exp:.98,night:0,moon:0,shadow:1,glow:.8,clouds:.15},{t:17.2,name:`golden hour`,top:`#46448e`,horizon:`#f8a066`,bottom:`#a8626e`,sun:`#ffb468`,sunI:5.1,hemiSky:`#7276d4`,hemiGround:`#8c6656`,hemiI:1.9,fog:.0104,exp:1.12,night:0,moon:0,shadow:1,glow:1.2,clouds:.22},{t:18.45,name:`sunset`,top:`#2c2466`,horizon:`#f2704c`,bottom:`#6a2e5c`,sun:`#ff7040`,sunI:3.2,hemiSky:`#6a58c0`,hemiGround:`#4e2c3c`,hemiI:1.45,fog:.0112,exp:1.2,night:.22,moon:0,shadow:.85,glow:1.35,clouds:.25},{t:19.25,name:`purple dusk`,top:`#1a184e`,horizon:`#9a5878`,bottom:`#2c1c46`,sun:`#c47a9e`,sunI:.85,hemiSky:`#4c4ca6`,hemiGround:`#2c1c32`,hemiI:1.62,fog:.0122,exp:1.46,night:.62,moon:0,shadow:.5,glow:.95,clouds:.22},{t:20.05,name:`blue hour`,top:`#0a1040`,horizon:`#3c3478`,bottom:`#12163c`,sun:`#7290f2`,sunI:.42,hemiSky:`#304cae`,hemiGround:`#1c1630`,hemiI:1.5,fog:.0116,exp:1.36,night:.92,moon:1,shadow:.5,glow:.55,clouds:.15},{t:21.4,name:`night`,top:`#050a20`,horizon:`#30264a`,bottom:`#0b0e28`,sun:`#7a96f2`,sunI:1,hemiSky:`#3654bc`,hemiGround:`#251c2c`,hemiI:1.58,fog:.0098,exp:1.36,night:1,moon:1,shadow:.6,glow:.45,clouds:.12}]);function Jr(e){return Re(e)&&Kr?{...Kr}:Cr(e)===`arid`?{count:190,size:[.06,.14],color:`#ffd596`,windInfluence:.45,velocity:[.1,.04,.03],velocityVariance:[.09,.05,.09],hdr:1.1,alpha:.75}:{}}var Yr=new WeakMap,Xr=new WeakMap,Zr=null,Qr=null;function $r(){return Qr??=O(()=>import(`./SeasonLook-Drig6J26.js`).then(e=>Zr=e,e=>{throw Qr=null,e}),__vite__mapDeps([0,1,2,3,4]),import.meta.url)}function ei(){return Zr?null:Qr}function ti(e,t,n=null,r=!1){let i=r?`sky`:t??(n&&Zr?n:null);if((Xr.get(e)??null)===i)return!1;Yr.has(e)||Yr.set(e,e.keyframes);let a=Yr.get(e);return e.setKeyframes(i===`sky`?Gr.map(e=>({...e})):i===`arid`?qr.map(e=>({...e})):i?Zr.seasonKeyframes(a,i):a),Xr.set(e,i),!0}var ni=.25;function ri(e){let t=Re(e);if(!t)return ni;let n=t.lowerClouds;return typeof n==`number`&&Number.isFinite(n)?V(n,0,1.5):.8}var ii=new WeakMap;function ai(e,t){e&&(t?(ii.has(e)||ii.set(e,e.toneMapping),e.toneMapping!==Hr.toneMapping&&(e.toneMapping=Hr.toneMapping)):ii.has(e)&&(e.toneMapping=ii.get(e),ii.delete(e)))}var oi=new WeakMap;function si(e,t){let n=e.grade,r=oi.get(e);t&&!e.cinematic?.enabled?(r||oi.set(e,{exposure:n.exposure,vignette:n.vignette,grain:n.grain,chromaticAberration:n.chromaticAberration,highlightsTint:[...n.highlightsTint],shadowsTint:[...n.shadowsTint],highlightsWarm:n.highlightsWarm}),ci(n,Hr.grade)):r&&(ci(n,r),oi.delete(e))}function ci(e,t){e.exposure=t.exposure,e.vignette=t.vignette,e.grain=t.grain,e.chromaticAberration=t.chromaticAberration,e.highlightsWarm=t.highlightsWarm;for(let n=0;n<3;n++)e.highlightsTint[n]=t.highlightsTint[n],e.shadowsTint[n]=t.shadowsTint[n]}var li=new WeakMap;function ui(e,t){let n=li.get(e);if(t){if(n)return;li.set(e,{radius:e.shadowRadius.day,haze:e.haze}),e.shadowRadius.day=Ur.shadowRadius,e.setHaze(Ur.haze)}else n&&(e.shadowRadius.day=n.radius,e.haze=n.haze,li.delete(e))}function di(e,t){e.horizonExponent=t?Wr.horizonExponent:en.HORIZON_EXPONENT,e.cloudBand=t?Wr.cloudBand:0}function fi(e,t){let n=wr(t);n&&!Zr&&$r().catch(()=>{});let r=!!Re(t);ti(e,Cr(t),n,r),ui(e,r),ai(e.renderer,r),di(e.sky,r),e.sky.lowerClouds=ri(t),e.sky.uniforms.uAurora.value=Dr(t)*e.nightFactor}function pi(e,t){let n=wr(t),r=!!Re(t);if(ti(e.lighting,Cr(t),n,r),ui(e.lighting,r),ai(e.engine?.renderer,r),e.postfx&&si(e.postfx.settings,r),di(e.lighting.sky,r),e.lighting.sky.lowerClouds=ri(t),e.season=null,e.lighting.sky.uniforms.uAurora.value=0,je(null),!n&&!(Dr(t)>0))return;let i=()=>{e.env===t&&(ti(e.lighting,Cr(t),n,r),e.season=Zr.createSeason(e))};Zr?i():$r().then(i,e=>console.warn(`[Luminati] the season look did not load:`,e))}function mi(e){let t=e.map(({kind:e,seed:t})=>be(e,{seed:t})),n=Math.max(...t.map(e=>e.frameWidth))+2,r=Math.max(...t.map(e=>e.frameHeight))+1,i=document.createElement(`canvas`);i.width=n*t.length,i.height=r;let a=i.getContext(`2d`);return a.imageSmoothingEnabled=!1,t.forEach((e,t)=>{let i=t*n+Math.floor((n-e.frameWidth)/2),o=r-e.frameHeight;a.drawImage(e.canvas,0,0,e.frameWidth,e.frameHeight,i,o,e.frameWidth,e.frameHeight),e.dispose()}),{texture:w(i,{wrap:`clamp`,mipmaps:!1,srgb:!0,name:`foliage-strip`}),width:n,height:r,pixelsPerUnit:16,anchor:[.5,0],frames:t.length}}var hi=new Set([`g`,`G`,`f`]),gi=[1,2,3,1,2],_i={dry_grass:{tufts:3,tall:.3,shrub:.07,odds:[.5,.15,.25,.1],pebbles:.04,bones:.004},arid_dirt:{tufts:.45,tall:.15,shrub:.06,odds:[.5,.2,.15,.15],pebbles:.12,bones:.008},cracked_earth:{tufts:.1,tall:0,shrub:.01,odds:[.3,0,.7,0],pebbles:.07,bones:.012},red_sand:{tufts:.25,tall:.2,shrub:.05,odds:[.45,.35,.05,.15],pebbles:.08,bones:.006},sandstone:{tufts:.08,tall:0,shrub:.015,odds:[.4,.4,.2,0],pebbles:.1,bones:0},redrock:{tufts:.08,tall:0,shrub:.015,odds:[.4,.4,.2,0],pebbles:.1,bones:0},scree:{tufts:.06,tall:0,shrub:.01,odds:[.6,.2,.2,0],pebbles:.25,bones:.004},flagstone:{tufts:.04,tall:0,shrub:0,odds:[1,0,0,0],pebbles:.02,bones:0},scorched:{tufts:0,tall:0,shrub:0,odds:[1,0,0,0],pebbles:.03,bones:.006},basalt:{tufts:0,tall:0,shrub:0,odds:[1,0,0,0],pebbles:.06,bones:.004},ash:{tufts:0,tall:0,shrub:0,odds:[1,0,0,0],pebbles:.05,bones:.03}},vi=new Set([`basalt`,`ash`,`scorched`]),yi={tufts:2,tall:.55,shrub:.5,odds:[.45,.1,.4,.05],pebbles:.05,bones:0},bi=[`#ffffff`,`#ffffff`,`#f4e6c8`,`#e4ecc0`],xi=new Set(Se),Si=Object.freeze({grass:[`sky_tuft`,`sky_tall`],flowers:[`sky_flower_red`,`sky_flower_yellow`,`sky_flower_white`,`sky_flower_blue`],shrubs:[`sky_bush`,`sky_fern`,`mushroom`,`rock_small`]}),Ci=Object.freeze({light:`#f2ecd2`,forest:`#c8c0a0`});function wi(e){return Te(Ti(e))}function*Ti({tileMap:e,isFree:t,seed:n=2024,houses:r=[],trees:i=[],clearings:a=[],flowerAreas:o=[],shrubAreas:s=[],cropAreas:c=[],maxInstances:l=1/0}){let u=new re(n),d=new D;d.name=`GroundDetail`;let f=[],p=[],m=[],h=[],g=[],_=[],v=[],y=(e,t)=>{for(let n=0;n<a.length;n++){let r=a[n];if((e-r.x)**2+(t-r.z)**2<r.r*r.r)return!0}return!1},b=(e,t,n)=>{for(let r=0;r<e.length;r++){let i=e[r];if(t>=i.minX&&t<i.maxX&&n>=i.minZ&&n<i.maxZ)return i}return null},x=(t,n,r)=>{for(let i=-1;i<=1;i++)for(let a=-1;a<=1;a++){if(!a&&!i)continue;let o=e.tileAt(t+a,n+i);if(o&&r(o))return!0}return!1},S={grass:[],shrubs:[],clutter:[],reeds:[],rng:new re(n+4099),tints:bi,reed:.6},C=Ie()?.SEASON_LAND??null,w=new re(n+7351),T={},E=(e,r,i,a,o)=>{let s=o.rng,c=i.h,l=i.char===`T`,u=F(e*.21+7,r*.21,{seed:n+11,octaves:3}),d=(e,n)=>l||t(e,n),f=a.tufts*(a.tufts>=1?.8+u*.5:1),p=Math.floor(f)+ +(s.next()<f-Math.floor(f));for(let t=0;t<p;t++){let t=e+s.next(),n=r+s.next(),i=s.next()<a.tall*(u>.55?1.6:.7),f=s.range(.7,1.05),p=o.tints[s.int(0,o.tints.length-1)];if(!d(t,n))continue;let m=!l&&y(t,n);o.grass.push({x:t,y:c,z:n,scale:m?f*.75:f,frame:i&&!m?1:0,tint:p})}if(s.next()<a.shrub*(l?1:.6+u*.8)){let t=e+s.range(.15,.85),n=r+s.range(.15,.85),i=s.next(),u=0;for(;u<a.odds.length-1&&i>=a.odds[u];)i-=a.odds[u],u++;let f=s.range(.8,1.2);d(t,n)&&(l||!y(t,n))&&o.shrubs.push({x:t,y:c,z:n,scale:f,frame:u})}if(s.next()<a.pebbles){let t=e+s.next(),n=r+s.next();d(t,n)&&o.clutter.push({x:t,y:c,z:n,scale:s.range(.7,1.1),frame:o===S&&vi.has(i.type.top)?2:0})}if(s.next()<a.bones){let t=e+s.range(.2,.8),n=r+s.range(.2,.8);d(t,n)&&!y(t,n)&&o.clutter.push({x:t,y:c,z:n,scale:s.range(.85,1.05),frame:1})}if(!l&&x(e,r,e=>e.water)&&s.next()<o.reed){let n=e+s.next(),i=r+s.next();t(n,i)&&o.reeds.push({x:n,y:c,z:i,scale:s.range(.75,1.1)})}},ee=(e,r,i)=>{let a=i.char,c=i.h,l=i.type.top;if(l&&Object.hasOwn(_i,l)){E(e,r,i,a===`T`?yi:_i[l],S);return}if(C&&l&&Object.hasOwn(C.growth,l)){let[t,n]=C.growth[l],o=C.families[t];T[t]??={grass:[],shrubs:[],clutter:[],reeds:[],rng:w,tints:o.tints,reed:o.reed},E(e,r,i,a===`T`?o.thicket:n,T[t]);return}let d=a===`T`;if(hi.has(a)||d){let i=xi.has(l),m=i?g:f,x=i?_:p,S=i?v:h,C=F(e*.23,r*.23,{seed:n+1,octaves:3}),w=d?2:3+(C>.55?2:0);for(let n=0;n<w;n++){let n=e+u.next(),a=r+u.next();if(!d&&!t(n,a))continue;let o=C>.58&&u.chance(.45),s=u.range(.7,1.05),l=u.chance(.25)?i?Ci.light:`#e2f2a8`:d?i?Ci.forest:`#b8c8a0`:`#ffffff`,f=!d&&y(n,a);m.push({x:n,y:c,z:a,scale:f?s*.75:s,frame:o&&!f?1:0,tint:l})}let T=d?0:a===`f`?3:C>.6?1:+!!u.chance(.25),E=b(o,e,r)?.palette??gi;for(let n=0;n<T;n++){let n=e+u.next(),i=r+u.next();if(!t(n,i))continue;let a=u.range(.75,1),o=E[u.int(0,E.length-1)];y(n,i)||x.push({x:n,y:c,z:i,scale:a,frame:o})}let ee=d?.55:b(s,e,r)?.chance??.05;if(u.chance(ee)){let n=e+u.range(.15,.85),i=r+u.range(.15,.85);if(d||t(n,i)){let e=u.next(),t=e<.45?0:e<.85?1:2,r=u.range(.8,1.2);(d||!y(n,i))&&S.push({x:n,y:c,z:i,scale:r,frame:t})}}if(!d&&u.chance(.035)){let n=e+u.next(),i=r+u.next();t(n,i)&&S.push({x:n,y:c,z:i,scale:u.range(.8,1.1),frame:3})}}else if(a===`s`){let n=x(e,r,e=>e.water),i=n?2:1;for(let a=0;a<i;a++){let i=e+u.next(),a=r+u.next();t(i,a)&&(n&&u.chance(.7)?m.push({x:i,y:c,z:a,scale:u.range(.75,1.1)}):h.push({x:i,y:c,z:a,scale:u.range(.7,1),frame:3}))}}else if(a===`F`)u.chance(.3)&&f.push({x:e+u.next(),y:c,z:r+u.next(),scale:u.range(.55,.75),frame:0,tint:`#d8e4a0`});else if(a===`d`||a===`.`){if(u.chance(.12)){let n=e+u.next(),i=r+u.next();t(n,i)&&f.push({x:n,y:c,z:i,scale:u.range(.5,.7),frame:0,tint:`#d8e0a0`})}}else a===`m`&&u.chance(.35)&&h.push({x:e+u.next(),y:c,z:r+u.next(),scale:u.range(.7,1),frame:u.chance(.5)?1:3})};for(let t=0;t<e.depth;t++){for(let n=0;n<e.width;n++){let r=e.tileAt(n,t);r&&ee(n,t,r),(n&31)==31&&(yield)}yield}let O=(t,n)=>{let r=e.tileAt(Math.floor(t),Math.floor(n));return r&&hi.has(r.char)&&!Object.hasOwn(_i,r.type.top)&&!(C&&Object.hasOwn(C.growth,r.type.top))?r:null},te=(e,n,r,i)=>{let a=O(e,n);return!a||!t(e,n)||y(e,n)?!1:((xi.has(a.type.top)?v:h).push({x:e,y:a.h,z:n,scale:i,frame:r}),!0)};for(let e of r){let t=[[e.minX,e.maxZ,e.maxX,e.maxZ,0,1],[e.minX,e.minZ,e.maxX,e.minZ,0,-1],[e.minX,e.minZ,e.minX,e.maxZ,-1,0],[e.maxX,e.minZ,e.maxX,e.maxZ,1,0]];for(let[n,r,i,a,o,s]of t){let t=Math.hypot(i-n,a-r),c=Math.max(1,Math.round(t/.95));for(let t=0;t<c;t++){if(!u.chance(.62))continue;let l=(t+u.range(.2,.8))/c,d=u.range(.28,.55),f=n+(i-n)*l+o*d,p=r+(a-r)*l+s*d;e.door&&Math.hypot(f-e.door.x,p-e.door.z)<1.25||te(f,p,u.next()<.62?0:1,u.range(.75,1.1))}}}for(let e of i){let t=u.int(1,3);for(let n=0;n<t;n++){let t=u.range(0,Math.PI*2),n=(e.r??.3)+u.range(.35,.8);te(e.x+Math.cos(t)*n,e.z+Math.sin(t)*n,+!!u.chance(.6),u.range(.7,1.05))}}let k=[],A=function*(e,t,r,i={}){if(!r.length)return[];let a=r.length>l?yield*ke(r,{x:e=>e.x,z:e=>e.z,maxWeight:l}):[r],o=a.map((t,n)=>[a.length>1?`${e}#${n}`:e,t]),s=[];for(let[e,r]of o){let a=new Wt({sprite:t,instances:r,name:e,seed:n+k.length,...i});d.add(a.object),k.push(a),s.push(a),yield}return s},j=mi([{kind:`grass_tuft`},{kind:`grass_tall`}]),M=mi([{kind:`flower_red`},{kind:`flower_yellow`},{kind:`flower_white`},{kind:`flower_blue`}]),N=mi([{kind:`bush`},{kind:`fern`},{kind:`mushroom`},{kind:`rock_small`}]),P=be(`reeds`);yield,yield*A(`Foliage:grass`,j,f,{wind:1}),yield*A(`Foliage:flowers`,M,p,{wind:1.1}),yield*A(`Foliage:reeds`,P,m,{wind:1.4});let I=yield*A(`Foliage:shrubs`,N,h,{wind:.5,rootDarken:.25});for(let e of I)e.castShadow=!0;let L=[],R=e=>{let t=mi(e.map(e=>({kind:e})));return L.push(t.texture),t};if(g.length&&(yield*A(`Foliage:sky-grass`,R(Si.grass),g,{wind:1})),_.length&&(yield*A(`Foliage:sky-flowers`,R(Si.flowers),_,{wind:1.1})),v.length){let e=yield*A(`Foliage:sky-shrubs`,R(Si.shrubs),v,{wind:.5,rootDarken:.25});for(let t of e)t.castShadow=!0}let z=[],ne=e=>{let t=mi(e);return z.push(t.texture),t};if(S.grass.length&&(yield*A(`Foliage:arid-grass`,ne([{kind:`dry_tuft`},{kind:`dry_grass_tall`}]),S.grass,{wind:1})),S.shrubs.length){let e=yield*A(`Foliage:arid-shrubs`,ne([{kind:`scrub`},{kind:`agave`},{kind:`thornbush`},{kind:`prickly_pear`}]),S.shrubs,{wind:.35,rootDarken:.25});for(let t of e)t.castShadow=!0}S.clutter.length&&(yield*A(`Foliage:arid-clutter`,ne([{kind:`pebbles`},{kind:`bones`},{kind:`cinders`}]),S.clutter,{wind:0,rootDarken:.1})),S.reeds.length&&(yield*A(`Foliage:arid-reeds`,P,S.reeds,{wind:1.4}));let B=C?yield*C.fields({fams:T,cropAreas:c,tileMap:e,isFree:t,inClearing:y,seed:n,add:A,kinds:e=>ne(e.map(e=>({kind:e}))),reedSprite:P}):{},ie=S.grass.length+S.shrubs.length+S.clutter.length?{aridGrass:S.grass.length,aridShrubs:S.shrubs.length,aridClutter:S.clutter.length}:{};return{fields:k,object:d,stats:{grass:f.length+g.length,flowers:p.length+_.length,reeds:m.length+S.reeds.length,shrubs:h.length+v.length,...ie,...B},dispose(){for(let e of k)e.dispose();j.texture.dispose(),M.texture.dispose(),N.texture.dispose(),P.dispose();for(let e of z)e.dispose();for(let e of L)e.dispose()}}}var Ei={value:0},Di=null,Oi=async()=>Di??=await O(()=>import(`./ThawKit-Cq6Ya5Q1.js`),__vite__mapDeps([5,1,2,4,6]),import.meta.url),ki=()=>Di,Ai=`
	{
		vec3 snowN = inverseTransformDirection( normal, viewMatrix );
		float snowUp = smoothstep( 0.5, 0.86, snowN.y );
		float snowL = dot( diffuseColor.rgb, vec3( 0.299, 0.587, 0.114 ) );
		float snowK = uSnowCover * snowUp * ( 0.7 + 0.25 * smoothstep( 0.02, 0.2, snowL ) );
		diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 0.8, 0.84, 0.92 ) * ( 0.82 + 0.3 * smoothstep( 0.0, 0.3, snowL ) ), snowK );
	}
`,ji=`
	{
		float snowL = dot( diffuseColor.rgb, vec3( 0.299, 0.587, 0.114 ) );
		float snowK = uSnowCover * smoothstep( 0.2, 0.95, vQuadUv.y ) * 0.72;
		diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 0.78, 0.83, 0.9 ) * ( 0.7 + 0.6 * sqrt( snowL ) ), snowK );
	}
`;function Mi(e,t=`ground`){if(!e||e.userData.luminatiSnow)return;e.userData.luminatiSnow=t;let n=e.onBeforeCompile,r=e.customProgramCacheKey();e.onBeforeCompile=function(e,r){n.call(this,e,r),e.uniforms.uSnowCover=Ei;let i=t===`foliage`?ji:Ai;e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform float uSnowCover;`).replace(`#include <emissivemap_fragment>`,`${i}\n#include <emissivemap_fragment>`)},e.customProgramCacheKey=()=>`${r}|luminati-snow-${t}`,e.needsUpdate=!0}var Ni=/^luminati:roof/;function Pi(e,{roofsOnly:t=!1}={}){e?.traverse(e=>{let n=e.isMesh?e.material:null;!n||Array.isArray(n)||n.userData.luminatiSnow||(!t||Ni.test(n.name??``))&&Mi(n,`ground`)})}var Fi=[`clear`,`rain`,`snow`],Ii=.22;function Li(e){let t=Math.exp(-(((e-17.3)/1.3)**2))+.6*Math.exp(-(((e-7)/1)**2));return I(.35,1,V(t))}function Ri(e){return{brightness:I(1,.66,e),glint:I(1,.55,e)}}var zi=Object.freeze({clear:Object.freeze({sun:1,ambient:1,fog:1,exposure:1,wind:1,windX:1,windZ:.35,temp:0,sat:0,rays:1,dust:1,bugs:1,leaves:1,rain:0,snow:0,overcast:0}),rain:Object.freeze({sun:.26,ambient:.9,fog:2.1,exposure:.92,wind:2.3,windX:2.2,windZ:.9,temp:-.12,sat:-.24,rays:0,dust:.15,bugs:0,leaves:1.6,rain:1,snow:0,overcast:.72}),snow:Object.freeze({sun:.45,ambient:1.15,fog:1.9,exposure:1.04,wind:1.3,windX:1.2,windZ:.5,temp:-.3,sat:-.42,rays:.25,dust:0,bugs:0,leaves:.3,rain:0,snow:1,overcast:.62}),frost:Object.freeze({sun:.8,ambient:1.1,fog:1.4,exposure:.92,wind:.6,windX:.8,windZ:.3,temp:-.22,sat:-.25,rays:.7,dust:.6,bugs:0,leaves:0,rain:0,snow:0,overcast:.15})}),Bi=Object.keys(zi.clear);function Vi(e){return typeof e==`string`&&Object.hasOwn(zi,e)?e:`clear`}function Hi(e){return zi[Vi(e)]}function Ui(e){let t=Vi(e);return+(t===`snow`||t===`frost`)}var Wi={rain:{preset:`rain`,count:2600,bounds:[44,16,44]},snow:{preset:`snow`,count:2400,bounds:[44,15,44],size:[.09,.15]}};function Gi(e,t={}){let n=Wi[e];if(!n)throw Error(`precipitationEmitter: unknown kind "${e}"`);let r={preset:n.preset,...t,count:n.count,bounds:[...n.bounds]};return n.size&&(r.size=[...n.size]),r}function Ki(e){return e<.02?0:e}function qi(e,t,{sunMul:n=1,ambientMul:r=1,exposureMul:i=1,pointLightMul:a=1}={}){e.sunMul=n*t.sun,e.ambientMul=r*t.ambient,e.exposureMul=i*t.exposure,e.pointLightMul=a}function Ji(e,t=1,n=0){let r=G.uTime.value,i=n&&Math.sin(r*2.7)*Math.sin(r*1.1+1);G.uWindStrength.value=t*e.wind*(1+n*(1+.3*i));let a=Math.cos(n*.22*i),o=Math.sin(n*.22*i);G.uWind.value.set(e.windX*a-e.windZ*o,e.windX*o+e.windZ*a)}function Yi(e,t,n,r){e.temperature=n+t.temp,e.saturation=r+t.sat}var Xi=new m(.9,.97,1.12),Zi=new m;function Qi(e,t){if(t<=0)return e;let n=e.r*.2126+e.g*.7152+e.b*.0722;return Zi.copy(Xi).multiplyScalar(n),e.lerp(Zi,t)}function $i(e,t){t>.002&&(Qi(e.fog.color,t),Qi(e.sun.color,t*.85),Qi(e.hemi.color,t*.6),Qi(e.hemi.groundColor,t*.6),G.uFogColor.value.copy(e.fog.color),Qi(G.uSunColor.value,t*.85))}function ea(e){return I(.05,.45,e)}function ta(e,t,n){let r=ea(n);for(let t=0;t<e.length;t++)e[t].nightOnly&&(e[t].dayIntensity=r);t&&(t.nightDayIntensity=r)}function na(e,t,n=!1){if(n){for(let n=0;n<e.length;n++)e[n].day=I(e[n].baseDay,Math.max(e[n].baseDay,e[n].night*.4),t);return}for(let n=0;n<e.length;n++)e[n].day=I(e[n].baseDay,e[n].night*.4,t)}function ra(e,t){return I(.5,1,V(Math.max(e,t*.8)))}var ia=Object.freeze({fireflies:1,leaves:1,petals:1,dust:1,smoke:1,mist:1});function aa(e,t,n=ia,r=0){switch(e){case`fireflies`:return n.fireflies*t.bugs;case`leaves`:return n.leaves*V(t.leaves,0,1)*(1-.6*r);case`petals`:return n.petals*V(1-t.rain-t.snow,0,1);case`dust`:return n.dust*t.dust;case`smoke`:return n.smoke;case`mist`:return n.mist;default:return null}}export{Er as $,pi as A,Xt as At,Br as B,Pi as C,Hn as Ct,ki as D,On as Dt,Ei as E,Tn as Et,br as F,K as Ft,Lr as G,xr as H,Pr as I,q as It,jr as J,zr as K,vr as L,Xe as Lt,ei as M,zt as Mt,fi as N,Et as Nt,wi as O,tn as Ot,Hr as P,bt as Pt,Ir as Q,Dr as R,We as Rt,Ni as S,Bn as St,Oi as T,In as Tt,Ar as U,Cr as V,Tr as W,Mr as X,wr as Y,kr as Z,Ui as _,Zn as _t,na as a,pr as at,ji as b,Fn as bt,Yi as c,dr as ct,aa as d,Yn as dt,Fr as et,ra as f,ir as ft,Ki as g,Xn as gt,Gi as h,lr as ht,zi as i,mr as it,Jr as j,Bt as jt,Ti as k,wn as kt,qi as l,Un as lt,Ri as m,Gn as mt,Fi as n,hr as nt,ta as o,gr as ot,Li as p,Kn as pt,Sr as q,Bi as r,_r as rt,$i as s,fr as st,Ii as t,ur as tt,Ji as u,cr as ut,Hi as v,rr as vt,Mi as w,Vn as wt,Ai as x,zn as xt,Vi as y,Pn as yt,Nr as z};