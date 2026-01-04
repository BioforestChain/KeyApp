import{j as e,r as i}from"./iframe-CsJjcyMS.js";import{C as s}from"./chain-address-preview-Dc2V0KZU.js";import"./preload-helper-PPVm8Dsz.js";import"./address-display-E2gqOghN.js";import"./utils-CDN07tui.js";import"./web-D11Qze_b.js";import"./breakpoint-LJlNYN6X.js";import"./schemas-34eCiBJ6.js";import"./useTranslation-mJk0QBrw.js";import"./index-DvB0ldGR.js";import"./IconCheck-BAqEtIBE.js";import"./createReactComponent-B1QyCjEx.js";import"./IconCopy-BZGAnz7k.js";import"./index-D0E7N0oa.js";import"./bioforest-D6P49my8.js";const w={title:"Onboarding/ChainAddressPreview",component:s,tags:["autodocs"],decorators:[r=>e.jsx("div",{className:"max-w-md space-y-4 p-4",children:e.jsx(r,{})})]},m=[{id:"bfmeta",version:"1.0",type:"bioforest",name:"BFMeta",symbol:"BFT",decimals:8,enabled:!0,source:"default"},{id:"pmchain",version:"1.0",type:"bioforest",name:"PMChain",symbol:"PM",decimals:8,enabled:!0,source:"default"}],t={render:()=>{const[r,o]=i.useState("my secret");return e.jsxs("div",{className:"space-y-3",children:[e.jsx("input",{className:"w-full rounded border px-3 py-2 text-sm",value:r,onChange:a=>o(a.target.value)}),e.jsx(s,{secret:r,enabledBioforestChainConfigs:m})]})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [secret, setSecret] = useState('my secret');
    return <div className="space-y-3">
        <input className="w-full rounded border px-3 py-2 text-sm" value={secret} onChange={e => setSecret(e.target.value)} />
        <ChainAddressPreview secret={secret} enabledBioforestChainConfigs={mockConfigs} />
      </div>;
  }
}`,...t.parameters?.docs?.source}}};const S=["Default"];export{t as Default,S as __namedExportsOrder,w as default};
