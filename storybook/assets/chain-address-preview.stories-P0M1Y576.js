import{j as e,r as i}from"./iframe-COU4jiV7.js";import{C as t}from"./chain-address-preview-DCDx5yik.js";import"./preload-helper-PPVm8Dsz.js";import"./address-display-BotvcatA.js";import"./utils-CDN07tui.js";import"./web-DwEfzBpW.js";import"./breakpoint-CX_csqtO.js";import"./schemas-DBe5gblO.js";import"./useTranslation-_4fOArPU.js";import"./index-s3QWmJ4F.js";import"./IconCheck-CQN2B4KM.js";import"./createReactComponent-DE454l2M.js";import"./IconCopy-CLmv6fgQ.js";import"./index-D0E7N0oa.js";import"./bioforest-uXX5qE5N.js";const w={title:"Onboarding/ChainAddressPreview",component:t,tags:["autodocs"],decorators:[r=>e.jsx("div",{className:"max-w-md space-y-4 p-4",children:e.jsx(r,{})})]},n=[{id:"bfmeta",version:"1.0",chainKind:"bioforest",name:"BFMeta",symbol:"BFT",decimals:8,enabled:!0,source:"default"},{id:"pmchain",version:"1.0",chainKind:"bioforest",name:"PMChain",symbol:"PM",decimals:8,enabled:!0,source:"default"}],s={render:()=>{const[r,a]=i.useState("my secret");return e.jsxs("div",{className:"space-y-3",children:[e.jsx("input",{className:"w-full rounded border px-3 py-2 text-sm",value:r,onChange:o=>a(o.target.value)}),e.jsx(t,{secret:r,enabledBioforestChainConfigs:n})]})}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [secret, setSecret] = useState('my secret');
    return <div className="space-y-3">
        <input className="w-full rounded border px-3 py-2 text-sm" value={secret} onChange={e => setSecret(e.target.value)} />
        <ChainAddressPreview secret={secret} enabledBioforestChainConfigs={mockConfigs} />
      </div>;
  }
}`,...s.parameters?.docs?.source}}};const S=["Default"];export{s as Default,S as __namedExportsOrder,w as default};
