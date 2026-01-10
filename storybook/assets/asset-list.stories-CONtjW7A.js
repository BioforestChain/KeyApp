import{j as n}from"./iframe-13xkpxxJ.js";import{f as p}from"./index-BjIXEP53.js";import{A as c}from"./asset-list-JJHZpY9U.js";import{A as s}from"./amount-BQsqQYGO.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./asset-item-DoK4EGlk.js";import"./token-icon-4Sb63430.js";import"./gradient-button-DCnBx6RQ.js";import"./index-4ISX3GU7.js";import"./index-B_jtOnfb.js";import"./createReactComponent-BmAlyfWH.js";import"./loading-spinner-BXPA_y9J.js";import"./useTranslation-D9auEEwq.js";import"./index-PAALN2cm.js";import"./empty-state-CO3P3pDq.js";import"./skeleton-CWqeczkJ.js";import"./amount-display-XGXyYCoX.js";import"./animated-number-ZaHCEpwq.js";import"./time-display-DHbdk47D.js";import"./qr-code-BlvJSNDw.js";import"./index-B-jb3YYx.js";import"./icon-circle-OiJv53Z7.js";import"./copyable-text-C6DQsG-Y.js";import"./IconAlertCircle-BgRI9wDX.js";import"./IconAlertTriangle-DEYTA4rT.js";import"./IconCircleCheck-BNWpkvmi.js";import"./IconInfoCircle-ChIDWp9R.js";import"./button-CRDRzMEV.js";import"./useButton-SxNZmItn.js";import"./useRenderElement-D3XtaFtU.js";import"./web-RRtXCQIV.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./IconCheck-elmjIu2_.js";import"./IconX-zq5gkp-B.js";import"./IconChevronRight-CAgHa6FF.js";import"./IconCoins-Bw6pI9po.js";const m=[{assetType:"ETH",name:"Ethereum",amount:s.fromRaw("1500000000000000000",18,"ETH"),decimals:18},{assetType:"USDT",name:"Tether USD",amount:s.fromRaw("100000000",6,"USDT"),decimals:6,contractAddress:"0xdAC17F958D2ee523a2206206994597C13D831ec7"},{assetType:"USDC",name:"USD Coin",amount:s.fromRaw("50000000",6,"USDC"),decimals:6},{assetType:"BTC",name:"Bitcoin",amount:s.fromRaw("50000000",8,"BTC"),decimals:8}],V={title:"Asset/AssetList",component:c,parameters:{layout:"centered"},decorators:[i=>n.jsx("div",{className:"w-[380px]",children:n.jsx(i,{})})],args:{assets:m,onAssetClick:p()}},e={},r={args:{assets:[]}},t={args:{assets:[],isLoading:!0}},a={args:{assets:[m[0]]}},o={args:{assets:[...m,{assetType:"TRX",name:"TRON",amount:s.fromRaw("10000000000",6,"TRX"),decimals:6},{assetType:"BFM",name:"BioForest Meta",amount:s.fromRaw("500000000000",8,"BFM"),decimals:8}]}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    assets: []
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    assets: [],
    isLoading: true
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    assets: [mockAssets[0]!]
  }
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};const W=["Default","Empty","Loading","SingleAsset","ManyAssets"];export{e as Default,r as Empty,t as Loading,o as ManyAssets,a as SingleAsset,W as __namedExportsOrder,V as default};
