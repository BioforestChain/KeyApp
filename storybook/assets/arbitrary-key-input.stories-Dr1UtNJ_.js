import{j as a,r as n}from"./iframe-D60tT8n5.js";import{A as o}from"./arbitrary-key-input-l04PBteH.js";import"./preload-helper-PPVm8Dsz.js";import"./button-BAXRuSGM.js";import"./utils-4perknFd.js";import"./useButton-dlfQV4Oq.js";import"./useRenderElement-GH_joVgn.js";import"./useTranslation-Cwzcid2v.js";import"./index-CPD7HH6A.js";import"./IconEye-Ci1rtOUd.js";import"./createReactComponent-CSeiZBWP.js";import"./IconEyeOff-CGfK9rsl.js";import"./IconRotateClockwise-Dm1-1i_x.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('');
    return <ArbitraryKeyInput value={value} onChange={setValue} />;
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'my secret key',
    onChange: () => undefined
  }
}`,...r.parameters?.docs?.source}}};const b=["Default","Filled"];export{e as Default,r as Filled,b as __namedExportsOrder,j as default};
