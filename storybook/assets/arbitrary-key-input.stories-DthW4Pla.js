import{j as a,r as n}from"./iframe-CftqfirD.js";import{A as o}from"./arbitrary-key-input-DF-l4MgS.js";import"./preload-helper-PPVm8Dsz.js";import"./button-B71_VDW-.js";import"./utils-4perknFd.js";import"./useButton-C5qJXrLb.js";import"./useRenderElement-DosBXD0d.js";import"./useTranslation-KzIqTB0x.js";import"./index-C6g0glMg.js";import"./IconEye-BQDbBMXw.js";import"./createReactComponent-R-j1hbng.js";import"./IconEyeOff-DFvz4jaj.js";import"./IconRotateClockwise-Bt0bpAx-.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
