import{j as l}from"./iframe-D83HRxja.js";import{f as U}from"./index-BjIXEP53.js";import{A}from"./asset-item-q8G9A5p3.js";import{A as g}from"./amount-BQsqQYGO.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./token-icon-DhHQv1yP.js";import"./gradient-button-BMU4sITt.js";import"./index-DZxl4Jsp.js";import"./index-B_jtOnfb.js";import"./createReactComponent-D7OhYMh1.js";import"./loading-spinner-Bz27mwkU.js";import"./useTranslation-DO0JxAAY.js";import"./index-npW09g6C.js";import"./empty-state-DaZr51ss.js";import"./skeleton-CrEiQn3s.js";import"./amount-display-BcyyGRSk.js";import"./NumberFlow-client-48rw3j0J-BGcghRho.js";import"./animated-number-Dpvp6Z0Y.js";import"./time-display-O2nBreqk.js";import"./qr-code-D5l_HpWg.js";import"./index-ySv_Lraw.js";import"./icon-circle-B4y7N1Rv.js";import"./error-boundary-B2WqwxYa.js";import"./IconAlertCircle-DVbL7mU0.js";import"./IconAlertTriangle-Dgg3x20_.js";import"./IconCircleCheck-CAcXJ-EA.js";import"./IconInfoCircle-0_SBzl_3.js";import"./button-Dy8qyJWI.js";import"./useButton-B8xhICYR.js";import"./useRenderElement-Dbc4X9rA.js";import"./IconChevronRight-DT-Fpbcl.js";const e={assetType:"ETH",name:"Ethereum",amount:g.fromRaw("1500000000000000000",18,"ETH"),decimals:18},h={...e,priceUsd:2500,priceChange24h:2.3},X={title:"Asset/AssetItem",component:A,parameters:{layout:"centered"},decorators:[C=>l.jsx("div",{className:"w-[380px]",children:l.jsx(C,{})})],args:{asset:e,onClick:U()}},r={},s={args:{asset:h}},a={args:{asset:{...e,priceUsd:2500,priceChange24h:5.2}}},o={args:{asset:{...e,priceUsd:2500,priceChange24h:-3.5}}},t={args:{asset:{...h,logoUrl:"https://cryptologos.cc/logos/ethereum-eth-logo.png"}}},c={args:{asset:{assetType:"USDT",name:"Tether USD",amount:g.fromRaw("100000000",6,"USDT"),decimals:6,contractAddress:"0xdAC17F958D2ee523a2206206994597C13D831ec7",priceUsd:1,priceChange24h:.01}}},n={args:{asset:{assetType:"BTC",name:"Bitcoin",amount:g.fromRaw("50000000",8,"BTC"),decimals:8,priceUsd:45e3,priceChange24h:-1.5}}},m={args:{showChevron:!1}},i={args:{asset:{...e,amount:g.fromRaw("1000000000000000",18,"ETH"),priceUsd:2500,priceChange24h:2.3}}},p={args:{asset:e}},d={args:{asset:h,currency:"CNY"}},u={args:{asset:h,currency:"EUR"}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:"{}",...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    asset: mockAssetWithPrice
  }
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    asset: {
      ...mockAsset,
      priceUsd: 2500,
      priceChange24h: 5.2
    }
  }
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    asset: {
      ...mockAsset,
      priceUsd: 2500,
      priceChange24h: -3.5
    }
  }
}`,...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    asset: {
      ...mockAssetWithPrice,
      logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
    }
  }
}`,...t.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    asset: {
      assetType: 'USDT',
      name: 'Tether USD',
      amount: Amount.fromRaw('100000000', 6, 'USDT'),
      // 100 USDT
      decimals: 6,
      contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      priceUsd: 1,
      priceChange24h: 0.01
    }
  }
}`,...c.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    asset: {
      assetType: 'BTC',
      name: 'Bitcoin',
      amount: Amount.fromRaw('50000000', 8, 'BTC'),
      // 0.5 BTC
      decimals: 8,
      priceUsd: 45000,
      priceChange24h: -1.5
    }
  }
}`,...n.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    showChevron: false
  }
}`,...m.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    asset: {
      ...mockAsset,
      amount: Amount.fromRaw('1000000000000000', 18, 'ETH'),
      // 0.001 ETH
      priceUsd: 2500,
      priceChange24h: 2.3
    }
  }
}`,...i.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    asset: mockAsset // No price fields
  }
}`,...p.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    asset: mockAssetWithPrice,
    currency: 'CNY'
  }
}`,...d.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    asset: mockAssetWithPrice,
    currency: 'EUR'
  }
}`,...u.parameters?.docs?.source}}};const Z=["Default","WithPrice","WithPricePositive","WithPriceNegative","WithIcon","USDT","Bitcoin","NoClick","SmallAmount","NoPriceData","CurrencyCNY","CurrencyEUR"];export{n as Bitcoin,d as CurrencyCNY,u as CurrencyEUR,r as Default,m as NoClick,p as NoPriceData,i as SmallAmount,c as USDT,t as WithIcon,s as WithPrice,o as WithPriceNegative,a as WithPricePositive,Z as __namedExportsOrder,X as default};
