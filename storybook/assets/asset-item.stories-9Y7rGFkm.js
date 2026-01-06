import{j as l}from"./iframe-CLYHcCRY.js";import{f as U}from"./index-BjIXEP53.js";import{A}from"./asset-item-CypAepdL.js";import{A as g}from"./amount-BQsqQYGO.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./token-icon-Dr_c_NXn.js";import"./gradient-button-eh87wLHg.js";import"./index-Cih1Hrsb.js";import"./index-B_jtOnfb.js";import"./createReactComponent-wBEFsRbv.js";import"./loading-spinner-DqC7JCd8.js";import"./useTranslation-Cb2TYd22.js";import"./index-BII8D0GK.js";import"./empty-state-DX03tGcj.js";import"./skeleton-CAwtnORC.js";import"./amount-display-BRiBavrB.js";import"./NumberFlow-client-48rw3j0J-CN8CXYSF.js";import"./animated-number-DcLSzJ4j.js";import"./time-display-CIVcGCI1.js";import"./qr-code-aEqhiK5l.js";import"./index-Brvk0KZk.js";import"./icon-circle-DgObHDui.js";import"./error-boundary-BC2jZZ2a.js";import"./IconAlertCircle-BRQls_oc.js";import"./IconAlertTriangle-DbB-nqyx.js";import"./IconCircleCheck-7EIB1DCh.js";import"./IconInfoCircle-Brhpw96t.js";import"./button-DwhlsmiW.js";import"./useButton-AYI6L8Mv.js";import"./useRenderElement-VYtBqXlq.js";import"./IconChevronRight-8wpOjaFr.js";const e={assetType:"ETH",name:"Ethereum",amount:g.fromRaw("1500000000000000000",18,"ETH"),decimals:18},h={...e,priceUsd:2500,priceChange24h:2.3},X={title:"Asset/AssetItem",component:A,parameters:{layout:"centered"},decorators:[C=>l.jsx("div",{className:"w-[380px]",children:l.jsx(C,{})})],args:{asset:e,onClick:U()}},r={},s={args:{asset:h}},a={args:{asset:{...e,priceUsd:2500,priceChange24h:5.2}}},o={args:{asset:{...e,priceUsd:2500,priceChange24h:-3.5}}},t={args:{asset:{...h,logoUrl:"https://cryptologos.cc/logos/ethereum-eth-logo.png"}}},c={args:{asset:{assetType:"USDT",name:"Tether USD",amount:g.fromRaw("100000000",6,"USDT"),decimals:6,contractAddress:"0xdAC17F958D2ee523a2206206994597C13D831ec7",priceUsd:1,priceChange24h:.01}}},n={args:{asset:{assetType:"BTC",name:"Bitcoin",amount:g.fromRaw("50000000",8,"BTC"),decimals:8,priceUsd:45e3,priceChange24h:-1.5}}},m={args:{showChevron:!1}},i={args:{asset:{...e,amount:g.fromRaw("1000000000000000",18,"ETH"),priceUsd:2500,priceChange24h:2.3}}},p={args:{asset:e}},d={args:{asset:h,currency:"CNY"}},u={args:{asset:h,currency:"EUR"}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:"{}",...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
