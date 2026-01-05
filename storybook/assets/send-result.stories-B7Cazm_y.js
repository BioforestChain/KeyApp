import{j as c}from"./iframe-CVsnPOYc.js";import{f as n}from"./index-BjIXEP53.js";import{S as m}from"./send-result-DDEOudCv.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./icon-circle-CQXqp_re.js";import"./transaction-status-CracxaPO.js";import"./IconBan-Ckqxpd--.js";import"./createReactComponent-BX-2XwI1.js";import"./IconX-n-2lFrYi.js";import"./IconCheck-CTmUUJ-J.js";import"./web-D11Qze_b.js";import"./breakpoint-LJlNYN6X.js";import"./schemas-34eCiBJ6.js";import"./useTranslation-DzAxu0sT.js";import"./index-DwHoKsdM.js";import"./IconCopy-BXs4XcV9.js";const J={title:"Transfer/SendResult",component:m,parameters:{layout:"centered"},decorators:[d=>c.jsx("div",{className:"w-[380px] bg-background",children:c.jsx(d,{})})],args:{onDone:n(),onViewExplorer:n()}},s={args:{status:"success",amount:"100",symbol:"USDT",toAddress:"0x1234567890abcdef1234567890abcdef12345678",txHash:"0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"}},e={args:{status:"success",amount:"1.5",symbol:"ETH",toAddress:"TJYmgH3xvqQbP1LqVvdrEaBzCHmvtjmJfS"}},r={args:{status:"failed",amount:"500",symbol:"USDT",toAddress:"0x1234567890abcdef1234567890abcdef12345678",errorMessage:"余额不足",onRetry:n()}},a={args:{status:"failed",amount:"0.1",symbol:"BTC",toAddress:"1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",errorMessage:"网络连接失败，请检查网络后重试",onRetry:n()}},t={args:{status:"pending",amount:"1000",symbol:"TRX",toAddress:"TJYmgH3xvqQbP1LqVvdrEaBzCHmvtjmJfS"}},o={args:{status:"success",amount:"1,234,567.89",symbol:"USDT",toAddress:"0x1234567890abcdef1234567890abcdef12345678",txHash:"0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};const h=["Success","SuccessWithoutHash","Failed","FailedNetworkError","Pending","LargeAmount"];export{r as Failed,a as FailedNetworkError,o as LargeAmount,t as Pending,s as Success,e as SuccessWithoutHash,h as __namedExportsOrder,J as default};
