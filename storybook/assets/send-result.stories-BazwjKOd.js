import{j as m}from"./iframe-BBL1Y9Q3.js";import{f as n}from"./index-BjIXEP53.js";import{S as d}from"./send-result-9B9XNrFv.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./LoadingSpinner-3KCDQZQk.js";import"./NumberFlow-client-48rw3j0J-DRsoOONR.js";import"./amount-display-CxFCnklA.js";import"./animated-number-BjSGJsmA.js";import"./time-display-DRYwpQYb.js";import"./useTranslation-qL4usZoQ.js";import"./index-BRbw8C-D.js";import"./service-status-alert-C0XlwbMl.js";import"./web-CCbp988c.js";import"./createReactComponent-CNTpCBNj.js";import"./breakpoint-DQ_qwb34.js";import"./schemas-CO8_C8zP.js";import"./IconCheck-CtGimEMv.js";import"./IconX-Bw0AKI1S.js";import"./IconAlertTriangle-B3ia6w8L.js";import"./IconLock-Dg5k2l32.js";import"./transaction-status-3s92irtx.js";import"./IconBan-CegdLWcb.js";import"./IconClock-DB0HzRCM.js";import"./address-display-Qmklh1ew.js";import"./IconExternalLink-UuvfX3MO.js";const L={title:"Transfer/SendResult",component:d,parameters:{layout:"centered"},decorators:[c=>m.jsx("div",{className:"w-[380px] bg-background",children:m.jsx(c,{})})],args:{onDone:n(),onViewExplorer:n()}},s={args:{status:"success",amount:"100",symbol:"USDT",toAddress:"0x1234567890abcdef1234567890abcdef12345678",txHash:"0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"}},e={args:{status:"success",amount:"1.5",symbol:"ETH",toAddress:"TJYmgH3xvqQbP1LqVvdrEaBzCHmvtjmJfS"}},r={args:{status:"failed",amount:"500",symbol:"USDT",toAddress:"0x1234567890abcdef1234567890abcdef12345678",errorMessage:"余额不足",onRetry:n()}},a={args:{status:"failed",amount:"0.1",symbol:"BTC",toAddress:"1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",errorMessage:"网络连接失败，请检查网络后重试",onRetry:n()}},t={args:{status:"pending",amount:"1000",symbol:"TRX",toAddress:"TJYmgH3xvqQbP1LqVvdrEaBzCHmvtjmJfS"}},o={args:{status:"success",amount:"1,234,567.89",symbol:"USDT",toAddress:"0x1234567890abcdef1234567890abcdef12345678",txHash:"0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'success',
    amount: '100',
    symbol: 'USDT',
    toAddress: '0x1234567890abcdef1234567890abcdef12345678',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  }
}`,...s.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'success',
    amount: '1.5',
    symbol: 'ETH',
    toAddress: 'TJYmgH3xvqQbP1LqVvdrEaBzCHmvtjmJfS'
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'failed',
    amount: '500',
    symbol: 'USDT',
    toAddress: '0x1234567890abcdef1234567890abcdef12345678',
    errorMessage: '余额不足',
    onRetry: fn()
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'failed',
    amount: '0.1',
    symbol: 'BTC',
    toAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
    errorMessage: '网络连接失败，请检查网络后重试',
    onRetry: fn()
  }
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'pending',
    amount: '1000',
    symbol: 'TRX',
    toAddress: 'TJYmgH3xvqQbP1LqVvdrEaBzCHmvtjmJfS'
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'success',
    amount: '1,234,567.89',
    symbol: 'USDT',
    toAddress: '0x1234567890abcdef1234567890abcdef12345678',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  }
}`,...o.parameters?.docs?.source}}};const M=["Success","SuccessWithoutHash","Failed","FailedNetworkError","Pending","LargeAmount"];export{r as Failed,a as FailedNetworkError,o as LargeAmount,t as Pending,s as Success,e as SuccessWithoutHash,M as __namedExportsOrder,L as default};
