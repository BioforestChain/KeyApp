import{j as n}from"./iframe-CFpGkAjA.js";import{f as p}from"./index-BjIXEP53.js";import{A as c}from"./asset-list-DTfRlDdB.js";import{A as s}from"./amount-BQsqQYGO.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./asset-item-Bc_J6irM.js";import"./token-icon-FucWKfSH.js";import"./gradient-button-BKnqpZTJ.js";import"./index-CPqdIq6z.js";import"./index-B_jtOnfb.js";import"./createReactComponent-Betra0kq.js";import"./loading-spinner-efZLewvE.js";import"./useTranslation-CDZKQa2p.js";import"./index-Slj_T9xx.js";import"./empty-state-BOKhZfpO.js";import"./skeleton-DdfhkAAr.js";import"./amount-display-xrl_L3xI.js";import"./animated-number-CdvtBMz3.js";import"./time-display-BQl0mpsc.js";import"./qr-code-BaIhanpY.js";import"./index-D_k49hOT.js";import"./icon-circle-CS9B9w32.js";import"./copyable-text-Nuk-EDvM.js";import"./IconAlertCircle-Ca1EqWpa.js";import"./IconAlertTriangle-T4nWkjb3.js";import"./IconCircleCheck-Ba0FshAm.js";import"./IconInfoCircle-Cg8NZ49V.js";import"./button-BesopRSp.js";import"./useButton-BkynlJIp.js";import"./useRenderElement-CxuenlXE.js";import"./web-DtjOFHbD.js";import"./breakpoint-BtpSOnE_.js";import"./schemas-jh0dXz-I.js";import"./IconCheck-Dh4QVP6f.js";import"./IconX-CcL_Nguo.js";import"./IconChevronRight-ugpSrUrH.js";import"./IconCoins-BAYhE_ed.js";const m=[{assetType:"ETH",name:"Ethereum",amount:s.fromRaw("1500000000000000000",18,"ETH"),decimals:18},{assetType:"USDT",name:"Tether USD",amount:s.fromRaw("100000000",6,"USDT"),decimals:6,contractAddress:"0xdAC17F958D2ee523a2206206994597C13D831ec7"},{assetType:"USDC",name:"USD Coin",amount:s.fromRaw("50000000",6,"USDC"),decimals:6},{assetType:"BTC",name:"Bitcoin",amount:s.fromRaw("50000000",8,"BTC"),decimals:8}],V={title:"Asset/AssetList",component:c,parameters:{layout:"centered"},decorators:[i=>n.jsx("div",{className:"w-[380px]",children:n.jsx(i,{})})],args:{assets:m,onAssetClick:p()}},e={},r={args:{assets:[]}},t={args:{assets:[],isLoading:!0}},a={args:{assets:[m[0]]}},o={args:{assets:[...m,{assetType:"TRX",name:"TRON",amount:s.fromRaw("10000000000",6,"TRX"),decimals:6},{assetType:"BFM",name:"BioForest Meta",amount:s.fromRaw("500000000000",8,"BFM"),decimals:8}]}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
