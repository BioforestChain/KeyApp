import{j as a,r as n}from"./iframe-BR45iAMW.js";import{A as o}from"./arbitrary-key-input-7s2FUGOo.js";import"./preload-helper-PPVm8Dsz.js";import"./button-BMLPHxvn.js";import"./utils-4perknFd.js";import"./useButton-DybKAZj4.js";import"./useRenderElement-Cz1qcXuI.js";import"./useTranslation-UW7x6zxI.js";import"./index-DhoY983P.js";import"./IconEye-Drbivkj-.js";import"./createReactComponent-Cr_JlDar.js";import"./IconEyeOff-CH1Np4ar.js";import"./IconRotateClockwise-jfe9Lmgd.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
