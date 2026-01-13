import{j as a,r as n}from"./iframe-CHpnNFF-.js";import{A as o}from"./arbitrary-key-input-BkmGazmK.js";import"./preload-helper-PPVm8Dsz.js";import"./button-DoYcZF2P.js";import"./utils-CDN07tui.js";import"./useButton-B8jHMvD6.js";import"./useRenderElement-KLX3fYL1.js";import"./useTranslation-Cn35rriq.js";import"./index-DWDuuOjN.js";import"./IconEye-Cep3-VOC.js";import"./createReactComponent-BBuOTQib.js";import"./IconEyeOff-Hb4Cps0H.js";import"./IconRotateClockwise-BnfRL6I3.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
