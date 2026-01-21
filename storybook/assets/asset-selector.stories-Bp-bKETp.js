import{j as s,r as u}from"./iframe-BtBfLKTD.js";import{A as p}from"./asset-selector-CajgVO8v.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./token-icon-C3iaPTcR.js";import"./LoadingSpinner-DSXmk0nS.js";import"./NumberFlow-client-48rw3j0J-D5k-VzPL.js";import"./amount-display-Cot2TNqs.js";import"./animated-number-GLYRgzkD.js";import"./time-display-Cl-v_6rV.js";import"./useTranslation-NbEfJFuK.js";import"./index-BmMlfY7b.js";import"./copyable-text-CjRqC9Ch.js";import"./web-DSwQeJCf.js";import"./createReactComponent-D_MX2SzB.js";import"./breakpoint-C1BNOfKS.js";import"./schemas-B18CumQY.js";import"./IconCheck-BTp0X1fd.js";import"./IconX-htZAI7TQ.js";import"./IconChevronDown-DGF-xdRN.js";import"./composite-Dunzz5J7.js";import"./useRenderElement-BgCqABuI.js";import"./useBaseUiId-BOQ4kkyn.js";import"./index-BZPwEHM_.js";import"./index-P0LMgqf_.js";import"./useField-OCkrxmrq.js";import"./useCompositeListItem-DnwpODrl.js";import"./useButton-nYR3qDRL.js";const e=[{symbol:"BFM",name:"BFMeta",balance:"10000.12345678",decimals:8,chain:"bfmeta"},{symbol:"USDT",name:"Tether USD",balance:"500.00",decimals:6,chain:"bfmeta"},{symbol:"ETH",name:"Ethereum",balance:"2.50000000",decimals:18,chain:"ethereum"},{symbol:"BTC",name:"Bitcoin",balance:"0.05",decimals:8,chain:"bitcoin"},{symbol:"TRX",name:"Tron",balance:"1500.00",decimals:6,chain:"tron"}],q={title:"Asset/AssetSelector",component:p,parameters:{layout:"centered"},decorators:[t=>s.jsx("div",{className:"w-[320px]",children:s.jsx(t,{})})],tags:["autodocs"]};function A(){const[t,i]=u.useState(null);return s.jsxs("div",{className:"space-y-4",children:[s.jsx(p,{selectedAsset:t,assets:e,onSelect:i}),t&&s.jsxs("div",{className:"text-sm text-muted-foreground",children:["已选择: ",t.symbol," (",t.name,")"]})]})}const d={render:()=>s.jsx(A,{})},r={args:{selectedAsset:e[0],assets:e,onSelect:()=>{}}},a={args:{selectedAsset:e[1],assets:e,onSelect:()=>{},disabled:!0}},o={render:()=>{const[t,i]=u.useState(null);return s.jsxs("div",{className:"space-y-4",children:[s.jsx("p",{className:"text-sm text-muted-foreground",children:"排除了 BFM (主资产)"}),s.jsx(p,{selectedAsset:t,assets:e,onSelect:i,excludeAssets:["BFM"]})]})}},c={args:{selectedAsset:e[0],assets:e,onSelect:()=>{},showBalance:!1}},n={args:{selectedAsset:null,assets:e,onSelect:()=>{},placeholder:"点击选择要销毁的资产"}},l={args:{selectedAsset:null,assets:[],onSelect:()=>{}}},m={args:{selectedAsset:null,assets:e,onSelect:()=>{},excludeAssets:["BFM","USDT","ETH","BTC","TRX"]}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <InteractiveDemo />
}`,...d.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    selectedAsset: mockAssets[0],
    assets: mockAssets,
    onSelect: () => {}
  }
}`,...r.parameters?.docs?.source},description:{story:"预选资产",...r.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    selectedAsset: mockAssets[1],
    assets: mockAssets,
    onSelect: () => {},
    disabled: true
  }
}`,...a.parameters?.docs?.source},description:{story:"禁用状态",...a.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selected, setSelected] = useState<TokenInfo | null>(null);
    return <div className="space-y-4">
        <p className="text-sm text-muted-foreground">排除了 BFM (主资产)</p>
        <AssetSelector selectedAsset={selected} assets={mockAssets} onSelect={setSelected} excludeAssets={['BFM']} />
      </div>;
  }
}`,...o.parameters?.docs?.source},description:{story:"排除资产 (如销毁场景不显示主资产)",...o.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source},description:{story:"所有资产被排除",...m.parameters?.docs?.description}}};const z=["Default","WithSelectedAsset","Disabled","ExcludeAssets","WithoutBalance","CustomPlaceholder","EmptyAssets","AllExcluded"];export{m as AllExcluded,n as CustomPlaceholder,d as Default,a as Disabled,l as EmptyAssets,o as ExcludeAssets,r as WithSelectedAsset,c as WithoutBalance,z as __namedExportsOrder,q as default};
