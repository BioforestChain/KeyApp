import{j as a,r as n}from"./iframe-BQJL0pL_.js";import{A as o}from"./arbitrary-key-input-CpmiLfHa.js";import"./preload-helper-PPVm8Dsz.js";import"./button-CEk9DjEf.js";import"./utils-4perknFd.js";import"./useButton-BXym9LV_.js";import"./useRenderElement-DRTGoeR8.js";import"./useTranslation-CFAlGsOi.js";import"./index-Ctp8a16w.js";import"./IconEye-ycCUeNr-.js";import"./createReactComponent-DxQJumuF.js";import"./IconEyeOff-DB5oPYt2.js";import"./IconRotateClockwise-DAkkO0ze.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
