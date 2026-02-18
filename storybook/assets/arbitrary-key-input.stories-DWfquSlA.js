import{j as a,r as n}from"./iframe-BCrNjImN.js";import{A as o}from"./arbitrary-key-input-pVPPhEwn.js";import"./preload-helper-PPVm8Dsz.js";import"./button-CpWQPgd7.js";import"./utils-4perknFd.js";import"./useButton-DrZEIbiF.js";import"./useRenderElement-Blsu1gsm.js";import"./useTranslation-CU2slI-l.js";import"./index-DHKp91te.js";import"./IconEye-DOCNgCDW.js";import"./createReactComponent-andi6kw7.js";import"./IconEyeOff-DyEPPqE8.js";import"./IconRotateClockwise-D682meR5.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
