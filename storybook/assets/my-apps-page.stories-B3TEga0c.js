import{j as g}from"./iframe-CDstBDzb.js";import{f as p,e as o,a as w}from"./index-BjIXEP53.js";import{M as h}from"./my-apps-page-DoJwkS0d.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./config-HmZ3kn8E.js";import"./window-stack-BPi_p-h9.js";import"./IconApps-BCTSoYG_.js";import"./createReactComponent-BXjChy2x.js";import"./IconSparkles-wNWv5Ech.js";import"./IconLock-By0tM6M0.js";import"./useTranslation-DtChdlRe.js";import"./index-6DqNxuEB.js";import"./IconSearch-CzBArCd1.js";import"./index-CoUMwVBX.js";import"./wujie-container-D6VXbiyQ.js";import"./index-DwlKY4Ls.js";import"./service-CfajPHx_.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-TAhnwOiX.js";import"./amount-BQsqQYGO.js";import"./bioforest-VKGNL388.js";import"./web-B8WusLuF.js";import"./user-profile-Bowjya44.js";import"./avatar-codec-D8sLk-Qg.js";import"./breakpoint-DQ_qwb34.js";import"./index-BwiwV7zE.js";import"./IconDownload-DY4EJH9f.js";import"./IconTrash-DlHrPGHq.js";import"./proxy-DRSK5_cr.js";const t=[{app:{id:"app-1",name:"转账助手",description:"快速安全的转账工具",icon:"https://picsum.photos/seed/app1/200",url:"https://example.com/app-1",version:"1.0.0",permissions:[]},lastUsed:Date.now()},{app:{id:"app-2",name:"DeFi 收益",description:"一站式 DeFi 收益管理",icon:"https://picsum.photos/seed/app2/200",url:"https://example.com/app-2",version:"1.0.0",permissions:[]},lastUsed:Date.now()-1e3},{app:{id:"app-3",name:"NFT 市场",description:"发现和交易 NFT",icon:"https://picsum.photos/seed/app3/200",url:"https://example.com/app-3",version:"1.0.0",permissions:[]},lastUsed:Date.now()-2e3},{app:{id:"app-4",name:"链上投票",description:"参与 DAO 治理投票",icon:"https://picsum.photos/seed/app4/200",url:"https://example.com/app-4",version:"1.0.0",permissions:[]},lastUsed:Date.now()-3e3},{app:{id:"app-5",name:"跨链桥",description:"多链资产跨链转移",icon:"https://picsum.photos/seed/app5/200",url:"https://example.com/app-5",version:"1.0.0",permissions:[]},lastUsed:Date.now()-4e3},{app:{id:"app-6",name:"质押挖矿",description:"质押代币获取收益",icon:"https://picsum.photos/seed/app6/200",url:"https://example.com/app-6",version:"1.0.0",permissions:[]},lastUsed:Date.now()-5e3}],Q={title:"Ecosystem/MyAppsPage",component:h,tags:["autodocs"],parameters:{layout:"fullscreen"},decorators:[e=>g.jsx("div",{className:"h-[600px] bg-background",children:g.jsx(e,{})})],args:{onSearchClick:p(),onAppOpen:p(),onAppDetail:p(),onAppRemove:p()}},r={args:{apps:t}},c={args:{apps:[]}},i={args:{apps:t.slice(0,2)}},m={args:{apps:[...t,...t.map((e,s)=>({...e,app:{...e.app,id:`app-extra-${s}`,name:`应用 ${s+7}`}}))]}},u={args:{apps:t},play:async({canvas:e,step:s})=>{await s("检查图标是否渲染",async()=>{const a=e.getByText("转账助手");await o(a).toBeInTheDocument()}),await s("右键点击图标触发菜单",async()=>{e.getByText("转账助手").closest("button").dispatchEvent(new MouseEvent("contextmenu",{bubbles:!0})),await w(()=>{const n=document.querySelector(".ios-desktop-icon:popover-open");o(n).toBeInTheDocument()},{timeout:2e3})}),await s("验证菜单内容",async()=>{await w(()=>{const a=document.querySelector(".ios-context-menu");o(a).toBeVisible()})})}},l={args:{apps:t,onSearchClick:p()},play:async({args:e,canvas:s,step:a,userEvent:n})=>{await a("点击搜索胶囊",async()=>{const y=s.getByText("搜索");await n.click(y),await o(e.onSearchClick).toHaveBeenCalled()})}},d={args:{apps:t,onAppOpen:p()},play:async({args:e,canvas:s,step:a,userEvent:n})=>{await a("点击应用图标",async()=>{const y=s.getByText("转账助手").closest("button");await n.click(y),await o(e.onAppOpen).toHaveBeenCalled()})}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    apps: mockApps
  }
}`,...r.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    apps: []
  }
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    apps: mockApps.slice(0, 2)
  }
}`,...i.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    apps: [...mockApps, ...mockApps.map((item, i) => ({
      ...item,
      app: {
        ...item.app,
        id: \`app-extra-\${i}\`,
        name: \`应用 \${i + 7}\`
      }
    }))]
  }
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    apps: mockApps
  },
  play: async ({
    canvas,
    step
  }) => {
    await step('检查图标是否渲染', async () => {
      const icon = canvas.getByText('转账助手');
      await expect(icon).toBeInTheDocument();
    });
    await step('右键点击图标触发菜单', async () => {
      const iconButton = canvas.getByText('转账助手').closest('button') as HTMLElement;

      // 触发 contextmenu 事件（模拟右键/长按）
      iconButton.dispatchEvent(new MouseEvent('contextmenu', {
        bubbles: true
      }));

      // 等待 popover 打开
      await waitFor(() => {
        const popover = document.querySelector('.ios-desktop-icon:popover-open');
        expect(popover).toBeInTheDocument();
      }, {
        timeout: 2000
      });
    });
    await step('验证菜单内容', async () => {
      await waitFor(() => {
        const menu = document.querySelector('.ios-context-menu');
        expect(menu).toBeVisible();
      });
    });
  }
}`,...u.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    apps: mockApps,
    onSearchClick: fn()
  },
  play: async ({
    args,
    canvas,
    step,
    userEvent
  }) => {
    await step('点击搜索胶囊', async () => {
      const searchCapsule = canvas.getByText('搜索');
      await userEvent.click(searchCapsule);
      await expect(args.onSearchClick).toHaveBeenCalled();
    });
  }
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    apps: mockApps,
    onAppOpen: fn()
  },
  play: async ({
    args,
    canvas,
    step,
    userEvent
  }) => {
    await step('点击应用图标', async () => {
      const iconButton = canvas.getByText('转账助手').closest('button') as HTMLElement;
      await userEvent.click(iconButton);
      await expect(args.onAppOpen).toHaveBeenCalled();
    });
  }
}`,...d.parameters?.docs?.source}}};const W=["Default","Empty","FewApps","ManyApps","LongPressTest","SearchCapsuleTest","TapIconTest"];export{r as Default,c as Empty,i as FewApps,u as LongPressTest,m as ManyApps,l as SearchCapsuleTest,d as TapIconTest,W as __namedExportsOrder,Q as default};
