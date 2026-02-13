import{j as s,r as u}from"./iframe-DiTbX0IW.js";import{A as p}from"./asset-selector-C6zDx9jS.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./token-icon-o2Evsbq3.js";import"./LoadingSpinner-D1DjlpnU.js";import"./NumberFlow-client-48rw3j0J-MEBnEMM-.js";import"./amount-display-DkxTPL1-.js";import"./animated-number-D9k-rG-f.js";import"./time-display-OmewVAKh.js";import"./useTranslation-CrBtWVkI.js";import"./index-PxwM-cQl.js";import"./service-status-alert-BdEDVk2W.js";import"./web-DCQ-jzzt.js";import"./createReactComponent-CsAWfYOO.js";import"./breakpoint-DQ_qwb34.js";import"./schemas-CO8_C8zP.js";import"./IconCheck-D-zvsvG2.js";import"./IconX-DQkGJ2tu.js";import"./IconAlertTriangle-BYJYLH3z.js";import"./IconLock-DsnzZlgd.js";import"./IconChevronDown-CqVIs3Wg.js";import"./composite-CN7r9zdQ.js";import"./useRenderElement-DsnB5a2h.js";import"./useBaseUiId-B7b9C06f.js";import"./index-DqbLvQvd.js";import"./index-C5BCuv5I.js";import"./useField-D9v5Z2Zp.js";import"./useCompositeListItem-BWP5pVQr.js";import"./useButton-CWLqZqk7.js";const e=[{symbol:"BFM",name:"BFMeta",balance:"10000.12345678",decimals:8,chain:"bfmeta"},{symbol:"USDT",name:"Tether USD",balance:"500.00",decimals:6,chain:"bfmeta"},{symbol:"ETH",name:"Ethereum",balance:"2.50000000",decimals:18,chain:"ethereum"},{symbol:"BTC",name:"Bitcoin",balance:"0.05",decimals:8,chain:"bitcoin"},{symbol:"TRX",name:"Tron",balance:"1500.00",decimals:6,chain:"tron"}],G={title:"Asset/AssetSelector",component:p,parameters:{layout:"centered"},decorators:[t=>s.jsx("div",{className:"w-[320px]",children:s.jsx(t,{})})],tags:["autodocs"]};function A(){const[t,i]=u.useState(null);return s.jsxs("div",{className:"space-y-4",children:[s.jsx(p,{selectedAsset:t,assets:e,onSelect:i}),t&&s.jsxs("div",{className:"text-sm text-muted-foreground",children:["已选择: ",t.symbol," (",t.name,")"]})]})}const d={render:()=>s.jsx(A,{})},r={args:{selectedAsset:e[0],assets:e,onSelect:()=>{}}},o={args:{selectedAsset:e[1],assets:e,onSelect:()=>{},disabled:!0}},a={render:()=>{const[t,i]=u.useState(null);return s.jsxs("div",{className:"space-y-4",children:[s.jsx("p",{className:"text-sm text-muted-foreground",children:"排除了 BFM (主资产)"}),s.jsx(p,{selectedAsset:t,assets:e,onSelect:i,excludeAssets:["BFM"]})]})}},c={args:{selectedAsset:e[0],assets:e,onSelect:()=>{},showBalance:!1}},n={args:{selectedAsset:null,assets:e,onSelect:()=>{},placeholder:"点击选择要销毁的资产"}},l={args:{selectedAsset:null,assets:[],onSelect:()=>{}}},m={args:{selectedAsset:null,assets:e,onSelect:()=>{},excludeAssets:["BFM","USDT","ETH","BTC","TRX"]}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <InteractiveDemo />
}`,...d.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    selectedAsset: mockAssets[0],
    assets: mockAssets,
    onSelect: () => {}
  }
}`,...r.parameters?.docs?.source},description:{story:"预选资产",...r.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    selectedAsset: mockAssets[1],
    assets: mockAssets,
    onSelect: () => {},
    disabled: true
  }
}`,...o.parameters?.docs?.source},description:{story:"禁用状态",...o.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selected, setSelected] = useState<TokenInfo | null>(null);
    return <div className="space-y-4">
        <p className="text-sm text-muted-foreground">排除了 BFM (主资产)</p>
        <AssetSelector selectedAsset={selected} assets={mockAssets} onSelect={setSelected} excludeAssets={['BFM']} />
      </div>;
  }
}`,...a.parameters?.docs?.source},description:{story:"排除资产 (如销毁场景不显示主资产)",...a.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    selectedAsset: mockAssets[0],
    assets: mockAssets,
    onSelect: () => {},
    showBalance: false
  }
}`,...c.parameters?.docs?.source},description:{story:"不显示余额",...c.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    selectedAsset: null,
    assets: mockAssets,
    onSelect: () => {},
    placeholder: '点击选择要销毁的资产'
  }
}`,...n.parameters?.docs?.source},description:{story:"自定义占位符",...n.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    selectedAsset: null,
    assets: [],
    onSelect: () => {}
  }
}`,...l.parameters?.docs?.source},description:{story:"空资产列表",...l.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    selectedAsset: null,
    assets: mockAssets,
    onSelect: () => {},
    excludeAssets: ['BFM', 'USDT', 'ETH', 'BTC', 'TRX']
  }
}`,...m.parameters?.docs?.source},description:{story:"所有资产被排除",...m.parameters?.docs?.description}}};const J=["Default","WithSelectedAsset","Disabled","ExcludeAssets","WithoutBalance","CustomPlaceholder","EmptyAssets","AllExcluded"];export{m as AllExcluded,n as CustomPlaceholder,d as Default,o as Disabled,l as EmptyAssets,a as ExcludeAssets,r as WithSelectedAsset,c as WithoutBalance,J as __namedExportsOrder,G as default};
