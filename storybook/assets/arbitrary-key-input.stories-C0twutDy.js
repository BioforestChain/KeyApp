import{j as a,r as n}from"./iframe-BJgN3E0_.js";import{A as o}from"./arbitrary-key-input-BmCLa9Ye.js";import"./preload-helper-PPVm8Dsz.js";import"./button-DI21DV3e.js";import"./utils-4perknFd.js";import"./useButton-kGvBe4pw.js";import"./useRenderElement-DsRqdjfH.js";import"./useTranslation-BA-yisZJ.js";import"./index-mS2T2Imm.js";import"./IconEye-B7PEBuwu.js";import"./createReactComponent-BPs_Exgf.js";import"./IconEyeOff-CGZU4nb0.js";import"./IconRotateClockwise-DborYGYv.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
