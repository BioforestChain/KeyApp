import{j as e}from"./iframe-Cctxta_P.js";import{f as T}from"./index-BjIXEP53.js";import{c}from"./utils-CDN07tui.js";import{A}from"./asset-item-C0mWABrZ.js";import{u as w}from"./useTranslation-Cyi9axMr.js";import{I as S}from"./IconCoins-B8xpaPYW.js";import{A as a}from"./amount-BQsqQYGO.js";import"./preload-helper-PPVm8Dsz.js";import"./token-icon-DtvtRadC.js";import"./gradient-button-CI0i7sXk.js";import"./index-CYflX4oo.js";import"./index-B_jtOnfb.js";import"./createReactComponent-BokZZTcn.js";import"./loading-spinner-CQ_N_PP1.js";import"./empty-state-QlYsD_4V.js";import"./skeleton-dMQmJuYw.js";import"./amount-display-lh-aDGFD.js";import"./NumberFlow-client-48rw3j0J-D-9LcztC.js";import"./animated-number-uR3fQozJ.js";import"./time-display-DtS7YJCT.js";import"./qr-code-CY_2OM_C.js";import"./index-C069iInY.js";import"./icon-circle-DAEhXiJ_.js";import"./error-boundary-DnCREgnV.js";import"./IconAlertCircle-BEx518Hp.js";import"./IconAlertTriangle-D1gPId_I.js";import"./IconCircleCheck-B3YbjWQ1.js";import"./IconInfoCircle-Cpbyhs8C.js";import"./button-sjDKCcea.js";import"./useButton-BiCET3WI.js";import"./useRenderElement-qlaWX--Y.js";import"./IconChevronRight-C0BW2P53.js";import"./index-ECTMCtyo.js";function l({assets:t,onAssetClick:u,isLoading:f=!1,currency:g="USD",exchangeRate:y,className:d}){const{t:x}=w("common");return f?e.jsx("div",{className:c("space-y-2",d),children:[1,2,3].map(s=>e.jsxs("div",{className:"bg-muted/30 flex items-center gap-3 rounded-xl p-3",children:[e.jsx("div",{className:"bg-muted size-10 animate-pulse rounded-full"}),e.jsxs("div",{className:"flex-1 space-y-2",children:[e.jsx("div",{className:"bg-muted h-4 w-24 animate-pulse rounded"}),e.jsx("div",{className:"bg-muted h-3 w-16 animate-pulse rounded"})]}),e.jsx("div",{className:"bg-muted h-5 w-20 animate-pulse rounded"})]},s))}):t.length===0?e.jsxs("div",{className:c("flex flex-col items-center py-12",d),children:[e.jsx("div",{className:"bg-muted mb-4 flex size-16 items-center justify-center rounded-full",children:e.jsx(S,{className:"text-muted-foreground size-8"})}),e.jsx("p",{className:"text-muted-foreground",children:x("noAssets")})]}):e.jsx("div",{className:c("space-y-1",d),children:t.map(s=>e.jsx(A,{asset:s,currency:g,exchangeRate:y,onClick:u?()=>u(s):void 0},`${s.assetType}-${s.contractAddress||"native"}`))})}l.__docgenInfo={description:"Scrollable list of asset items",methods:[],displayName:"AssetList",props:{assets:{required:!0,tsType:{name:"Array",elements:[{name:"AssetInfo"}],raw:"AssetInfo[]"},description:"List of assets to display"},onAssetClick:{required:!1,tsType:{name:"union",raw:"((asset: AssetInfo) => void) | undefined",elements:[{name:"unknown"},{name:"undefined"}]},description:"Click handler for asset item"},isLoading:{required:!1,tsType:{name:"union",raw:"boolean | undefined",elements:[{name:"boolean"},{name:"undefined"}]},description:"Loading state",defaultValue:{value:"false",computed:!1}},currency:{required:!1,tsType:{name:"union",raw:"string | undefined",elements:[{name:"string"},{name:"undefined"}]},description:"Currency code for fiat display (default: USD)",defaultValue:{value:"'USD'",computed:!1}},exchangeRate:{required:!1,tsType:{name:"union",raw:"number | undefined",elements:[{name:"number"},{name:"undefined"}]},description:"Exchange rate from USD to target currency (1 USD = rate target currency)"},className:{required:!1,tsType:{name:"union",raw:"string | undefined",elements:[{name:"string"},{name:"undefined"}]},description:"Additional class name"}}};const p=[{assetType:"ETH",name:"Ethereum",amount:a.fromRaw("1500000000000000000",18,"ETH"),decimals:18},{assetType:"USDT",name:"Tether USD",amount:a.fromRaw("100000000",6,"USDT"),decimals:6,contractAddress:"0xdAC17F958D2ee523a2206206994597C13D831ec7"},{assetType:"USDC",name:"USD Coin",amount:a.fromRaw("50000000",6,"USDC"),decimals:6},{assetType:"BTC",name:"Bitcoin",amount:a.fromRaw("50000000",8,"BTC"),decimals:8}],se={title:"Asset/AssetList",component:l,parameters:{layout:"centered"},decorators:[t=>e.jsx("div",{className:"w-[380px]",children:e.jsx(t,{})})],args:{assets:p,onAssetClick:T()}},r={},n={args:{assets:[]}},o={args:{assets:[],isLoading:!0}},m={args:{assets:[p[0]]}},i={args:{assets:[...p,{assetType:"TRX",name:"TRON",amount:a.fromRaw("10000000000",6,"TRX"),decimals:6},{assetType:"BFM",name:"BioForest Meta",amount:a.fromRaw("500000000000",8,"BFM"),decimals:8}]}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:"{}",...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
