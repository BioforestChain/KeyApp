import{j as a,r as n}from"./iframe-DDIM8zrC.js";import{A as o}from"./arbitrary-key-input-Buo4Q6Pz.js";import"./preload-helper-PPVm8Dsz.js";import"./button-DiXbBXrQ.js";import"./utils-4perknFd.js";import"./useButton-aGui-FA9.js";import"./useRenderElement-Dd9A4p6M.js";import"./useTranslation-CzpZJ1d8.js";import"./index-aBLE1Wau.js";import"./IconEye-Cgp4-OIY.js";import"./createReactComponent-qYmak6bv.js";import"./IconEyeOff-4bvF-PbZ.js";import"./IconRotateClockwise-ZMHA5ZH6.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
