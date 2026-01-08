import{j as a,m as d}from"./index-Bhn4ADLA.js";const i=({children:o,className:s="",onClick:e,intensity:r="medium"})=>{const l=r==="low"?"bg-white/40":r==="high"?"bg-white/95":"bg-white/70",t=r==="low"?"backdrop-blur-md":r==="high"?"backdrop-blur-3xl":"backdrop-blur-xl";return a.jsxs(d.div,{whileHover:{scale:e?1.005:1,y:e?-2:0},whileTap:{scale:e?.99:1},className:`
        relative overflow-hidden
        ${l} ${t}
        border border-white/60
        shadow-brand
        rounded-lg
        p-8
        transition-all duration-300 ease-out
        group
        ${s}
      `,onClick:e,children:[a.jsx("div",{className:"absolute inset-x-0 top-0 h-px bg-white/80 opacity-50"}),a.jsx("div",{className:"relative z-10",children:o})]})};export{i as G};
