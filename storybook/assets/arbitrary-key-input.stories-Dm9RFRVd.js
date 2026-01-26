import{j as a,r as n}from"./iframe-BTjVugVZ.js";import{A as o}from"./arbitrary-key-input-D7jlPVOz.js";import"./preload-helper-PPVm8Dsz.js";import"./button-u8GeBPo-.js";import"./utils-4perknFd.js";import"./useButton-BcHWilYT.js";import"./useRenderElement-Bi-W2An_.js";import"./useTranslation-DavaNEIK.js";import"./index-CLH7eXVP.js";import"./IconEye-C7h0Ey1r.js";import"./createReactComponent-CWFjM57r.js";import"./IconEyeOff-CDn0s0Rt.js";import"./IconRotateClockwise-DAp9X6xr.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
