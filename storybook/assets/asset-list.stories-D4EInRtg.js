import{j as n}from"./iframe-BthQp-yI.js";import{f as p}from"./index-BjIXEP53.js";import{A as c}from"./asset-list-n4vL59yV.js";import{A as s}from"./amount-BQsqQYGO.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./asset-item-zYRK0A88.js";import"./token-icon-DORYIj3r.js";import"./gradient-button-CgO-AYfL.js";import"./index-B6b3ROc4.js";import"./index-B_jtOnfb.js";import"./createReactComponent-BFWyios4.js";import"./loading-spinner-C-v8VCQz.js";import"./useTranslation-RlIfOlQn.js";import"./index-BwV9l44E.js";import"./empty-state-j_WMTAxs.js";import"./skeleton-D_N5zBz_.js";import"./amount-display-CILsBzbF.js";import"./animated-number-Cy3n0mWG.js";import"./time-display-C15IEYdt.js";import"./qr-code-DThun7Q5.js";import"./index-uahEs6gY.js";import"./icon-circle-CEFRwkEd.js";import"./copyable-text-CdUfpeX5.js";import"./IconAlertCircle-RmefdvIa.js";import"./IconAlertTriangle-D9dLWVnX.js";import"./IconCircleCheck-DpqyWJe7.js";import"./IconInfoCircle-DYnvcef8.js";import"./button-C78JC7RI.js";import"./useButton-DJTZFLL_.js";import"./useRenderElement-DlBKa77z.js";import"./web-HeVpcjH-.js";import"./breakpoint-BtpSOnE_.js";import"./schemas-jh0dXz-I.js";import"./IconCheck-B6x97gNc.js";import"./IconX-DrWLqtlx.js";import"./IconChevronRight-BvZrDBKb.js";import"./IconCoins-BAthEZVe.js";const m=[{assetType:"ETH",name:"Ethereum",amount:s.fromRaw("1500000000000000000",18,"ETH"),decimals:18},{assetType:"USDT",name:"Tether USD",amount:s.fromRaw("100000000",6,"USDT"),decimals:6,contractAddress:"0xdAC17F958D2ee523a2206206994597C13D831ec7"},{assetType:"USDC",name:"USD Coin",amount:s.fromRaw("50000000",6,"USDC"),decimals:6},{assetType:"BTC",name:"Bitcoin",amount:s.fromRaw("50000000",8,"BTC"),decimals:8}],V={title:"Asset/AssetList",component:c,parameters:{layout:"centered"},decorators:[i=>n.jsx("div",{className:"w-[380px]",children:n.jsx(i,{})})],args:{assets:m,onAssetClick:p()}},e={},r={args:{assets:[]}},t={args:{assets:[],isLoading:!0}},a={args:{assets:[m[0]]}},o={args:{assets:[...m,{assetType:"TRX",name:"TRON",amount:s.fromRaw("10000000000",6,"TRX"),decimals:6},{assetType:"BFM",name:"BioForest Meta",amount:s.fromRaw("500000000000",8,"BFM"),decimals:8}]}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
