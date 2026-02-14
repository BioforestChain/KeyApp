import{j as a,r as n}from"./iframe-CDstBDzb.js";import{A as o}from"./arbitrary-key-input-CL2rqk0s.js";import"./preload-helper-PPVm8Dsz.js";import"./button-Bydz1ysO.js";import"./utils-4perknFd.js";import"./useButton-se5Y8ILU.js";import"./useRenderElement-C5ecs9bm.js";import"./useTranslation-DtChdlRe.js";import"./index-6DqNxuEB.js";import"./IconEye-1rTCvPla.js";import"./createReactComponent-BXjChy2x.js";import"./IconEyeOff-CBz9dWPd.js";import"./IconRotateClockwise-CfO21Zh8.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
