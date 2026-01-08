import{c,r as n,j as e,m as y}from"./index-Bhn4ADLA.js";/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=[["rect",{x:"14",y:"3",width:"5",height:"18",rx:"1",key:"kaeet6"}],["rect",{x:"5",y:"3",width:"5",height:"18",rx:"1",key:"1wsw3u"}]],w=c("pause",j);/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["path",{d:"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",key:"10ikf1"}]],b=c("play",g);/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}]],v=c("square",k);/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]],_=c("volume-2",N),S=({text:l,autoPlay:o=!1,onEnd:d})=>{const[i,a]=n.useState(!1),[u,r]=n.useState(!1),s=window.speechSynthesis,x=n.useRef(null);n.useEffect(()=>()=>{s.cancel()},[]),n.useEffect(()=>{o&&l&&h()},[l,o]);const h=()=>{if(u){s.resume(),a(!0),r(!1);return}s.cancel();const t=new SpeechSynthesisUtterance(l);t.lang="ko-KR",t.rate=.9,t.pitch=1,t.onend=()=>{a(!1),r(!1),d&&d()},x.current=t,s.speak(t),a(!0)},p=()=>{s.pause(),a(!1),r(!0)},m=()=>{s.cancel(),a(!1),r(!1)};return e.jsxs("div",{className:"flex items-center gap-4 bg-white/40 backdrop-blur-md border border-white/50 rounded-full px-4 py-2 shadow-sm",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[i?e.jsx("button",{onClick:p,className:"w-8 h-8 flex items-center justify-center rounded-full bg-white text-peace-500 border border-peace-200 hover:bg-peace-50 transition-colors",children:e.jsx(w,{size:14,fill:"currentColor"})}):e.jsx("button",{onClick:h,className:"w-8 h-8 flex items-center justify-center rounded-full bg-peace-500 text-white hover:bg-peace-600 transition-colors shadow-md",children:e.jsx(b,{size:14,fill:"currentColor",className:"ml-0.5"})}),(i||u)&&e.jsx("button",{onClick:m,className:"w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors",children:e.jsx(v,{size:12,fill:"currentColor"})})]}),e.jsx("div",{className:"flex items-center gap-1 h-6 w-24 justify-center",children:i?e.jsx(e.Fragment,{children:[...Array(5)].map((t,f)=>e.jsx(y.div,{className:"w-1 bg-peace-400 rounded-full",animate:{height:[4,16,8,20,4]},transition:{duration:.8,repeat:1/0,repeatType:"reverse",delay:f*.1}},f))}):e.jsxs("div",{className:"flex items-center gap-2 text-xs text-slate-500 font-medium",children:[e.jsx(_,{size:14}),e.jsx("span",{children:"Listen"})]})})]})};export{S as V};
