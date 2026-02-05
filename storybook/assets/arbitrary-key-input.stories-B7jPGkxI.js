import{j as a,r as n}from"./iframe-CtleeSHV.js";import{A as o}from"./arbitrary-key-input-Z9oxPw2O.js";import"./preload-helper-PPVm8Dsz.js";import"./button-DI7m9c8N.js";import"./utils-4perknFd.js";import"./useButton-yK3-RJv8.js";import"./useRenderElement-D2Hgm0s_.js";import"./useTranslation-BuScmFrn.js";import"./index-Nvskhkzv.js";import"./IconEye-DKSb0D5G.js";import"./createReactComponent-43mkGQ7G.js";import"./IconEyeOff-DCpwubXH.js";import"./IconRotateClockwise-C8BWowRz.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
