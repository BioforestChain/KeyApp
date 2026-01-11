import{j as s,r as u}from"./iframe-BthQp-yI.js";import{A as p}from"./asset-selector-Dpw991AK.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./token-icon-DORYIj3r.js";import"./gradient-button-CgO-AYfL.js";import"./index-B6b3ROc4.js";import"./index-B_jtOnfb.js";import"./createReactComponent-BFWyios4.js";import"./loading-spinner-C-v8VCQz.js";import"./useTranslation-RlIfOlQn.js";import"./index-BwV9l44E.js";import"./empty-state-j_WMTAxs.js";import"./skeleton-D_N5zBz_.js";import"./amount-display-CILsBzbF.js";import"./animated-number-Cy3n0mWG.js";import"./time-display-C15IEYdt.js";import"./qr-code-DThun7Q5.js";import"./index-uahEs6gY.js";import"./icon-circle-CEFRwkEd.js";import"./copyable-text-CdUfpeX5.js";import"./IconAlertCircle-RmefdvIa.js";import"./IconAlertTriangle-D9dLWVnX.js";import"./IconCircleCheck-DpqyWJe7.js";import"./IconInfoCircle-DYnvcef8.js";import"./button-C78JC7RI.js";import"./useButton-DJTZFLL_.js";import"./useRenderElement-DlBKa77z.js";import"./web-HeVpcjH-.js";import"./breakpoint-BtpSOnE_.js";import"./schemas-jh0dXz-I.js";import"./IconCheck-B6x97gNc.js";import"./IconX-DrWLqtlx.js";import"./IconChevronDown-C_ZF589p.js";import"./composite-4Cx2ClS2.js";import"./useBaseUiId-B5L88r9M.js";import"./index-Bdi7dIcT.js";import"./index-D9SMGAnr.js";import"./useField-BC0S3jmd.js";import"./useCompositeListItem-Bvx2WBqb.js";const e=[{symbol:"BFM",name:"BFMeta",balance:"10000.12345678",decimals:8,chain:"bfmeta"},{symbol:"USDT",name:"Tether USD",balance:"500.00",decimals:6,chain:"bfmeta"},{symbol:"ETH",name:"Ethereum",balance:"2.50000000",decimals:18,chain:"ethereum"},{symbol:"BTC",name:"Bitcoin",balance:"0.05",decimals:8,chain:"bitcoin"},{symbol:"TRX",name:"Tron",balance:"1500.00",decimals:6,chain:"tron"}],se={title:"Asset/AssetSelector",component:p,parameters:{layout:"centered"},decorators:[t=>s.jsx("div",{className:"w-[320px]",children:s.jsx(t,{})})],tags:["autodocs"]};function A(){const[t,i]=u.useState(null);return s.jsxs("div",{className:"space-y-4",children:[s.jsx(p,{selectedAsset:t,assets:e,onSelect:i}),t&&s.jsxs("div",{className:"text-sm text-muted-foreground",children:["已选择: ",t.symbol," (",t.name,")"]})]})}const d={render:()=>s.jsx(A,{})},r={args:{selectedAsset:e[0],assets:e,onSelect:()=>{}}},o={args:{selectedAsset:e[1],assets:e,onSelect:()=>{},disabled:!0}},a={render:()=>{const[t,i]=u.useState(null);return s.jsxs("div",{className:"space-y-4",children:[s.jsx("p",{className:"text-sm text-muted-foreground",children:"排除了 BFM (主资产)"}),s.jsx(p,{selectedAsset:t,assets:e,onSelect:i,excludeAssets:["BFM"]})]})}},c={args:{selectedAsset:e[0],assets:e,onSelect:()=>{},showBalance:!1}},n={args:{selectedAsset:null,assets:e,onSelect:()=>{},placeholder:"点击选择要销毁的资产"}},m={args:{selectedAsset:null,assets:[],onSelect:()=>{}}},l={args:{selectedAsset:null,assets:e,onSelect:()=>{},excludeAssets:["BFM","USDT","ETH","BTC","TRX"]}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source},description:{story:"自定义占位符",...n.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    selectedAsset: null,
    assets: [],
    onSelect: () => {}
  }
}`,...m.parameters?.docs?.source},description:{story:"空资产列表",...m.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    selectedAsset: null,
    assets: mockAssets,
    onSelect: () => {},
    excludeAssets: ['BFM', 'USDT', 'ETH', 'BTC', 'TRX']
  }
}`,...l.parameters?.docs?.source},description:{story:"所有资产被排除",...l.parameters?.docs?.description}}};const te=["Default","WithSelectedAsset","Disabled","ExcludeAssets","WithoutBalance","CustomPlaceholder","EmptyAssets","AllExcluded"];export{l as AllExcluded,n as CustomPlaceholder,d as Default,o as Disabled,m as EmptyAssets,a as ExcludeAssets,r as WithSelectedAsset,c as WithoutBalance,te as __namedExportsOrder,se as default};
