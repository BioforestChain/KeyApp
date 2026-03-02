import{j as a,r as n}from"./iframe-DzuFRuhj.js";import{A as o}from"./arbitrary-key-input-qxZMVGrd.js";import"./preload-helper-PPVm8Dsz.js";import"./button-BOmMMcH3.js";import"./utils-4perknFd.js";import"./useButton-CM703ikI.js";import"./useRenderElement-DFeFw4Pv.js";import"./useTranslation-D40cbtz1.js";import"./index-B9F8gwoO.js";import"./IconEye-CL0ldovl.js";import"./createReactComponent-CsXGsFmR.js";import"./IconEyeOff-iel_Vxbo.js";import"./IconRotateClockwise-C0eCEBZv.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
