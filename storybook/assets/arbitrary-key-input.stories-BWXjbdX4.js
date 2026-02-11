import{j as a,r as n}from"./iframe-D6qYwrCP.js";import{A as o}from"./arbitrary-key-input-C38_PvVF.js";import"./preload-helper-PPVm8Dsz.js";import"./button-DeN3KJiF.js";import"./utils-4perknFd.js";import"./useButton-Cs4hutME.js";import"./useRenderElement-DlrUMPN8.js";import"./useTranslation-CYT98Nx5.js";import"./index-Dm7aXZv1.js";import"./IconEye-VhQdRCQh.js";import"./createReactComponent-3sZwvKLg.js";import"./IconEyeOff-DIGfY6Wv.js";import"./IconRotateClockwise-CVDCKtmg.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
