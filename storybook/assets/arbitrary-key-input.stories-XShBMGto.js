import{j as a,r as n}from"./iframe-DmSIcYar.js";import{A as o}from"./arbitrary-key-input-BRCQdwNW.js";import"./preload-helper-PPVm8Dsz.js";import"./button-CjhDbb7h.js";import"./utils-4perknFd.js";import"./useButton-DCpgR4aa.js";import"./useRenderElement-CIdrVnLe.js";import"./useTranslation-5-CNWNe7.js";import"./index-CeB_thMf.js";import"./IconEye-DQ3kOT_G.js";import"./createReactComponent-m1MJ474U.js";import"./IconEyeOff-BQ64qI9E.js";import"./IconRotateClockwise-DLy7wt5J.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
