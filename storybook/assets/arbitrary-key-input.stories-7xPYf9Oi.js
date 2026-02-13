import{j as a,r as n}from"./iframe-C21mQbSY.js";import{A as o}from"./arbitrary-key-input-Cp-2WPxi.js";import"./preload-helper-PPVm8Dsz.js";import"./button-o_HTLRsN.js";import"./utils-4perknFd.js";import"./useButton-Br6m5WU1.js";import"./useRenderElement-C78O61am.js";import"./useTranslation-FhkkIyCA.js";import"./index-Dr6-oy7a.js";import"./IconEye-s79_1whj.js";import"./createReactComponent-BRgf_Xxb.js";import"./IconEyeOff-DJG6U1J2.js";import"./IconRotateClockwise-DXl5b2RP.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
