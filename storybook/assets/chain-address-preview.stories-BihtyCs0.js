import{j as e,r as i}from"./iframe-BWFzn1lJ.js";import{C as t}from"./chain-address-preview-C2vofGIt.js";import"./preload-helper-PPVm8Dsz.js";import"./address-display-U6iPI6Wr.js";import"./utils-CDN07tui.js";import"./web-CDZY9kGp.js";import"./createReactComponent-6mQvn9h0.js";import"./breakpoint-C1BNOfKS.js";import"./schemas-B18CumQY.js";import"./useTranslation-C2DDmKBj.js";import"./index-v2GAUope.js";import"./IconCheck-DIPf9SBz.js";import"./index-D0E7N0oa.js";import"./bioforest-B8KXXzKH.js";const j={title:"Onboarding/ChainAddressPreview",component:t,tags:["autodocs"],decorators:[r=>e.jsx("div",{className:"max-w-md space-y-4 p-4",children:e.jsx(r,{})})]},n=[{id:"bfmeta",version:"1.0",chainKind:"bioforest",name:"BFMeta",symbol:"BFT",decimals:8,enabled:!0,source:"default"},{id:"pmchain",version:"1.0",chainKind:"bioforest",name:"PMChain",symbol:"PM",decimals:8,enabled:!0,source:"default"}],s={render:()=>{const[r,a]=i.useState("my secret");return e.jsxs("div",{className:"space-y-3",children:[e.jsx("input",{className:"w-full rounded border px-3 py-2 text-sm",value:r,onChange:o=>a(o.target.value)}),e.jsx(t,{secret:r,enabledBioforestChainConfigs:n})]})}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [secret, setSecret] = useState('my secret');
    return <div className="space-y-3">
        <input className="w-full rounded border px-3 py-2 text-sm" value={secret} onChange={e => setSecret(e.target.value)} />
        <ChainAddressPreview secret={secret} enabledBioforestChainConfigs={mockConfigs} />
      </div>;
  }
}`,...s.parameters?.docs?.source}}};const w=["Default"];export{s as Default,w as __namedExportsOrder,j as default};
