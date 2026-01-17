import{j as a,r as n}from"./iframe-CnCQVOpP.js";import{A as o}from"./arbitrary-key-input-BJjqfMMA.js";import"./preload-helper-PPVm8Dsz.js";import"./button-BgYAK_3A.js";import"./utils-CDN07tui.js";import"./useButton-G5ZReQd4.js";import"./useRenderElement-D677GkQS.js";import"./useTranslation-C6ajbKrk.js";import"./index-L9QLT5oL.js";import"./IconEye-2o0eqInq.js";import"./createReactComponent-DMt2BglU.js";import"./IconEyeOff-DeCqv1ST.js";import"./IconRotateClockwise-Dy9I4-qC.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
