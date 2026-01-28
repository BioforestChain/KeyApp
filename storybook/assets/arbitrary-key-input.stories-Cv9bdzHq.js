import{j as a,r as n}from"./iframe-0iuA4WOb.js";import{A as o}from"./arbitrary-key-input-jZJbj5wb.js";import"./preload-helper-PPVm8Dsz.js";import"./button-B2WLzXQc.js";import"./utils-4perknFd.js";import"./useButton-x5-Fe-Gq.js";import"./useRenderElement-Rk6mAKsh.js";import"./useTranslation-DcwoRKNa.js";import"./index-CsHIUSRp.js";import"./IconEye-DS_LFdi6.js";import"./createReactComponent-SHUP81T7.js";import"./IconEyeOff-sxyIZTcW.js";import"./IconRotateClockwise-BmbCf_DF.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
