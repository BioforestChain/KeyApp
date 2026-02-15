import{j as a,r as n}from"./iframe-DTpQIzq1.js";import{A as o}from"./arbitrary-key-input-DnJWwfea.js";import"./preload-helper-PPVm8Dsz.js";import"./button-COZIujNI.js";import"./utils-4perknFd.js";import"./useButton-CsylPOAT.js";import"./useRenderElement-C1xkhfI3.js";import"./useTranslation-CVemGc0k.js";import"./index-TsPtL0LE.js";import"./IconEye-jkncJM92.js";import"./createReactComponent-D4ZaaTIu.js";import"./IconEyeOff-DxnaELab.js";import"./IconRotateClockwise-BbEWrzwx.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
