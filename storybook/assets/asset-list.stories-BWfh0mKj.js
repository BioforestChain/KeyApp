import{j as e}from"./iframe-CLYHcCRY.js";import{f as T}from"./index-BjIXEP53.js";import{c}from"./utils-CDN07tui.js";import{A}from"./asset-item-CypAepdL.js";import{u as w}from"./useTranslation-Cb2TYd22.js";import{I as S}from"./IconCoins-DDfrCBdn.js";import{A as a}from"./amount-BQsqQYGO.js";import"./preload-helper-PPVm8Dsz.js";import"./token-icon-Dr_c_NXn.js";import"./gradient-button-eh87wLHg.js";import"./index-Cih1Hrsb.js";import"./index-B_jtOnfb.js";import"./createReactComponent-wBEFsRbv.js";import"./loading-spinner-DqC7JCd8.js";import"./empty-state-DX03tGcj.js";import"./skeleton-CAwtnORC.js";import"./amount-display-BRiBavrB.js";import"./NumberFlow-client-48rw3j0J-CN8CXYSF.js";import"./animated-number-DcLSzJ4j.js";import"./time-display-CIVcGCI1.js";import"./qr-code-aEqhiK5l.js";import"./index-Brvk0KZk.js";import"./icon-circle-DgObHDui.js";import"./error-boundary-BC2jZZ2a.js";import"./IconAlertCircle-BRQls_oc.js";import"./IconAlertTriangle-DbB-nqyx.js";import"./IconCircleCheck-7EIB1DCh.js";import"./IconInfoCircle-Brhpw96t.js";import"./button-DwhlsmiW.js";import"./useButton-AYI6L8Mv.js";import"./useRenderElement-VYtBqXlq.js";import"./IconChevronRight-8wpOjaFr.js";import"./index-BII8D0GK.js";function l({assets:t,onAssetClick:u,isLoading:f=!1,currency:g="USD",exchangeRate:y,className:d}){const{t:x}=w("common");return f?e.jsx("div",{className:c("space-y-2",d),children:[1,2,3].map(s=>e.jsxs("div",{className:"bg-muted/30 flex items-center gap-3 rounded-xl p-3",children:[e.jsx("div",{className:"bg-muted size-10 animate-pulse rounded-full"}),e.jsxs("div",{className:"flex-1 space-y-2",children:[e.jsx("div",{className:"bg-muted h-4 w-24 animate-pulse rounded"}),e.jsx("div",{className:"bg-muted h-3 w-16 animate-pulse rounded"})]}),e.jsx("div",{className:"bg-muted h-5 w-20 animate-pulse rounded"})]},s))}):t.length===0?e.jsxs("div",{className:c("flex flex-col items-center py-12",d),children:[e.jsx("div",{className:"bg-muted mb-4 flex size-16 items-center justify-center rounded-full",children:e.jsx(S,{className:"text-muted-foreground size-8"})}),e.jsx("p",{className:"text-muted-foreground",children:x("noAssets")})]}):e.jsx("div",{className:c("space-y-1",d),children:t.map(s=>e.jsx(A,{asset:s,currency:g,exchangeRate:y,onClick:u?()=>u(s):void 0},`${s.assetType}-${s.contractAddress||"native"}`))})}l.__docgenInfo={description:"Scrollable list of asset items",methods:[],displayName:"AssetList",props:{assets:{required:!0,tsType:{name:"Array",elements:[{name:"AssetInfo"}],raw:"AssetInfo[]"},description:"List of assets to display"},onAssetClick:{required:!1,tsType:{name:"union",raw:"((asset: AssetInfo) => void) | undefined",elements:[{name:"unknown"},{name:"undefined"}]},description:"Click handler for asset item"},isLoading:{required:!1,tsType:{name:"union",raw:"boolean | undefined",elements:[{name:"boolean"},{name:"undefined"}]},description:"Loading state",defaultValue:{value:"false",computed:!1}},currency:{required:!1,tsType:{name:"union",raw:"string | undefined",elements:[{name:"string"},{name:"undefined"}]},description:"Currency code for fiat display (default: USD)",defaultValue:{value:"'USD'",computed:!1}},exchangeRate:{required:!1,tsType:{name:"union",raw:"number | undefined",elements:[{name:"number"},{name:"undefined"}]},description:"Exchange rate from USD to target currency (1 USD = rate target currency)"},className:{required:!1,tsType:{name:"union",raw:"string | undefined",elements:[{name:"string"},{name:"undefined"}]},description:"Additional class name"}}};const p=[{assetType:"ETH",name:"Ethereum",amount:a.fromRaw("1500000000000000000",18,"ETH"),decimals:18},{assetType:"USDT",name:"Tether USD",amount:a.fromRaw("100000000",6,"USDT"),decimals:6,contractAddress:"0xdAC17F958D2ee523a2206206994597C13D831ec7"},{assetType:"USDC",name:"USD Coin",amount:a.fromRaw("50000000",6,"USDC"),decimals:6},{assetType:"BTC",name:"Bitcoin",amount:a.fromRaw("50000000",8,"BTC"),decimals:8}],se={title:"Asset/AssetList",component:l,parameters:{layout:"centered"},decorators:[t=>e.jsx("div",{className:"w-[380px]",children:e.jsx(t,{})})],args:{assets:p,onAssetClick:T()}},r={},n={args:{assets:[]}},o={args:{assets:[],isLoading:!0}},m={args:{assets:[p[0]]}},i={args:{assets:[...p,{assetType:"TRX",name:"TRON",amount:a.fromRaw("10000000000",6,"TRX"),decimals:6},{assetType:"BFM",name:"BioForest Meta",amount:a.fromRaw("500000000000",8,"BFM"),decimals:8}]}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:"{}",...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    assets: []
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    assets: [],
    isLoading: true
  }
}`,...o.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    assets: [mockAssets[0]!]
  }
}`,...m.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    assets: [...mockAssets, {
      assetType: 'TRX',
      name: 'TRON',
      amount: Amount.fromRaw('10000000000', 6, 'TRX'),
      decimals: 6
    }, {
      assetType: 'BFM',
      name: 'BioForest Meta',
      amount: Amount.fromRaw('500000000000', 8, 'BFM'),
      decimals: 8
    }]
  }
}`,...i.parameters?.docs?.source}}};const ae=["Default","Empty","Loading","SingleAsset","ManyAssets"];export{r as Default,n as Empty,o as Loading,i as ManyAssets,m as SingleAsset,ae as __namedExportsOrder,se as default};
