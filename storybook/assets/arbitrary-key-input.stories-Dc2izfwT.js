import{j as a,r as n}from"./iframe-BtBfLKTD.js";import{A as o}from"./arbitrary-key-input-CZ9xECoW.js";import"./preload-helper-PPVm8Dsz.js";import"./button-BwVYriG6.js";import"./utils-4perknFd.js";import"./useButton-nYR3qDRL.js";import"./useRenderElement-BgCqABuI.js";import"./useTranslation-NbEfJFuK.js";import"./index-BmMlfY7b.js";import"./IconEye-DqpJhGmH.js";import"./createReactComponent-D_MX2SzB.js";import"./IconEyeOff-taGzqbEO.js";import"./IconRotateClockwise-hXNrmQKH.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
