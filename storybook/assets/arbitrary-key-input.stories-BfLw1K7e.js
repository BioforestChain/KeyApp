import{j as a,r as n}from"./iframe-d96jbflr.js";import{A as o}from"./arbitrary-key-input-i7-JhJD8.js";import"./preload-helper-PPVm8Dsz.js";import"./button-b-SychfI.js";import"./utils-4perknFd.js";import"./useButton-CNx3hbuy.js";import"./useRenderElement-mxdm8TbF.js";import"./useTranslation-ClTwWhs-.js";import"./index-eCgcuFC8.js";import"./IconEye-DWJ--hjZ.js";import"./createReactComponent-B3jwCrnC.js";import"./IconEyeOff-D2yzEcIp.js";import"./IconRotateClockwise-BYi0C0iO.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
