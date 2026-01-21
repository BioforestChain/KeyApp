import{j as e,r as o}from"./iframe-BI2yxCKi.js";import{w as C,e as w,u as x}from"./index-BjIXEP53.js";import{M as h}from"./miniapp-splash-screen-gwp3p9k1.js";import{M as D,E as T,b as S}from"./ecosystem-desktop-yP2tlyCU.js";import{S as j}from"./swiper-sync-context-Bm7L5rP1.js";import{T as N}from"./TabBar-C5-MNNBl.js";import{c as k,r as v,s as y,l as A,u as I}from"./index-uUnHDs2Z.js";import{M}from"./MiniappVisualProvider-BzciUIYx.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./proxy-BrUNF1zU.js";import"./swiper-dBhjW7IB.js";import"./my-apps-page-D1fuQ_uM.js";import"./IconApps-C0dAEInE.js";import"./createReactComponent-CXoWQxjz.js";import"./IconSparkles-DAaAc9fQ.js";import"./IconLock-DL1vzu_9.js";import"./useTranslation-CJAVMPUn.js";import"./index-CIM2jmAx.js";import"./IconSearch-tLpYmbQ1.js";import"./IconDownload-CxrZ1GyD.js";import"./IconTrash-C4lkmK4m.js";import"./button-CMgAABAS.js";import"./useButton-Z1ioppNI.js";import"./useRenderElement-CM9yFL3n.js";import"./IconChevronRight-B10RzyNM.js";import"./index-BtDqtYDD.js";import"./index-BJvbeWjC.js";import"./IconDots-Dy12A-Iy.js";import"./index-DtvldaWd.js";/* empty css                     */import"./chain-icon-CdZCo0UC.js";import"./index-Br8wWO4_.js";import"./schemas-B18CumQY.js";import"./notification-D6eu7TS6.js";import"./breakpoint-C1BNOfKS.js";import"./amount-BQsqQYGO.js";import"./index-DEV6RnEr.js";import"./index-D0E7N0oa.js";import"./bioforest-CKYD5h3O.js";import"./user-profile-Dzwd19KS.js";import"./avatar-codec-Cqc11mkJ.js";import"./transaction-meta-B1OgDJDK.js";import"./IconShieldCheck-CfVeWEzx.js";import"./IconCoins-CMXp6P8x.js";import"./IconWallet-DW_Ac6Fw.js";import"./IconSettings-YdrgFoOu.js";import"./wujie-container-CnUlxkhw.js";import"./web-Bu3Nj0RP.js";import"./index-DRQXAVdd.js";const Ce={title:"Ecosystem/MiniappWindow",parameters:{layout:"fullscreen"}},b=[{id:"gaubee",name:"Gaubee",description:"gaubee.com",icon:"https://gaubee.com/icon-192x192.png",url:"https://gaubee.com/",version:"1.0.0",themeColor:"#4285F4",splashScreen:!0,capsuleTheme:"auto"},{id:"wikipedia",name:"Wikipedia",description:"The Free Encyclopedia",icon:"https://www.wikipedia.org/static/favicon/wikipedia.ico",url:"https://www.wikipedia.org/",version:"1.0.0",themeColor:"#111827",splashScreen:{timeout:1200},capsuleTheme:"auto"},{id:"kingsword-blog",name:"Kingsword Blog",description:"blog.kingsword.tech",icon:"https://blog.kingsword.tech/favicon.png",url:"https://blog.kingsword.tech/",version:"1.0.0",themeColor:"#0f172a",capsuleTheme:"auto"},{id:"openai",name:"OpenAI",description:"Research (no splash)",icon:"https://openai.com/favicon.ico",url:"https://openai.com/",version:"1.0.0",themeColor:"#10a37f"}],p={render:()=>e.jsx("div",{className:"relative h-screen",children:e.jsx(h,{appId:"demo",app:{name:"锻造",icon:"https://api.iconify.design/fluent-emoji:hammer-and-wrench.svg",themeColor:"#f59e0b"},visible:!0})})},l={render:()=>e.jsx("div",{className:"relative h-screen bg-gradient-to-br from-blue-500 to-purple-600",children:e.jsx(D,{visible:!0,onAction:()=>console.log("Action clicked"),onClose:()=>console.log("Close clicked")})})},d={render:()=>e.jsxs("div",{className:"grid h-screen grid-cols-2 gap-4 p-4",children:[e.jsx("div",{className:"relative h-full overflow-hidden rounded-xl",children:e.jsx(h,{appId:"amber",app:{name:"锻造",icon:"https://api.iconify.design/fluent-emoji:hammer-and-wrench.svg",themeColor:"#f59e0b"},visible:!0})}),e.jsx("div",{className:"relative h-full overflow-hidden rounded-xl",children:e.jsx(h,{appId:"purple",app:{name:"传送",icon:"https://api.iconify.design/fluent-emoji:rocket.svg",themeColor:"#8b5cf6"},visible:!0})}),e.jsx("div",{className:"relative h-full overflow-hidden rounded-xl",children:e.jsx(h,{appId:"green",app:{name:"市场",icon:"https://api.iconify.design/fluent-emoji:shopping-bags.svg",themeColor:"#10b981"},visible:!0})}),e.jsx("div",{className:"relative h-full overflow-hidden rounded-xl",children:e.jsx(h,{appId:"blue",app:{name:"钱包",icon:"https://api.iconify.design/fluent-emoji:money-bag.svg",themeColor:"#3b82f6"},visible:!0})})]})},m={decorators:[r=>e.jsx(j,{children:e.jsx("div",{className:"h-screen",children:e.jsx(r,{})})})],render:function(){const t=o.useRef(null),[s,i]=o.useState(1);o.useEffect(()=>(k(),v(),y(1),()=>{v()}),[]),o.useEffect(()=>{y(s)},[s]);const c=b.map((a,n)=>({app:a,lastUsed:Date.now()-n*1e3*60*60})),f=a=>{console.log("[LaunchDemo] Opening app:",a.name);const n={...a,targetDesktop:"mine"};t.current?.slideTo("mine"),requestAnimationFrame(()=>A(a.id,n))};return e.jsx(M,{children:e.jsxs("div",{className:"flex h-screen flex-col",children:[e.jsxs("div",{className:"relative flex-1 overflow-hidden",children:[e.jsx(T,{ref:t,showDiscoverPage:!1,showStackPage:"auto",apps:b,myApps:c,onAppOpen:f,onAppDetail:a=>console.log("Detail:",a.name),onAppRemove:a=>console.log("Remove:",a)}),e.jsx(S,{})]}),e.jsx(N,{activeTab:"ecosystem",className:"static",onTabChange:()=>{}}),e.jsxs("div",{className:"shrink-0 bg-black/90 px-3 py-2 text-xs text-white",children:[e.jsxs("div",{className:"flex items-center justify-between gap-3",children:[e.jsx("div",{className:"truncate",children:"点击图标启动应用 | 锻造/传送有 Splash | 市场/钱包直接打开"}),e.jsxs("div",{className:"flex items-center gap-2 whitespace-nowrap",children:[e.jsx("button",{className:"rounded bg-white/10 px-2 py-1",onClick:()=>i(a=>Math.max(.25,Number((a-.25).toFixed(2)))),children:"-"}),e.jsxs("div",{className:"min-w-[6ch] text-center tabular-nums",children:["x",s.toFixed(2)]}),e.jsx("button",{className:"rounded bg-white/10 px-2 py-1",onClick:()=>i(a=>Math.min(4,Number((a+.25).toFixed(2)))),children:"+"}),e.jsx("button",{className:"rounded bg-white/10 px-2 py-1",onClick:()=>i(1),children:"Reset"})]})]}),e.jsx("input",{className:"mt-2 w-full",type:"range",min:.25,max:4,step:.05,value:s,onChange:a=>i(Number(a.target.value)),"aria-label":"Miniapp motion speed"})]})]})})}};function R({desktopRef:r,myApps:t,onAppOpen:s}){return I(),e.jsx(T,{ref:r,showDiscoverPage:!1,showStackPage:"auto",apps:b,myApps:t,onAppOpen:s,onAppDetail:i=>console.log("Detail:",i.name),onAppRemove:i=>console.log("Remove:",i)})}const u={decorators:[r=>e.jsx(j,{children:e.jsx("div",{className:"h-screen",children:e.jsx(r,{})})})],render:function(){const t=o.useRef(null),[s,i]=o.useState("ecosystem");o.useEffect(()=>(k(),v(),()=>{v()}),[]);const c=b.map((n,g)=>({app:n,lastUsed:Date.now()-g*1e3*60*60})),f=n=>{console.log("[TabSwitchVisibility] Opening app:",n.name);const g={...n,targetDesktop:"mine"};t.current?.slideTo("mine"),requestAnimationFrame(()=>A(n.id,g))},a=n=>{console.log("[TabSwitchVisibility] Tab changed to:",n),i(n)};return e.jsx(M,{children:e.jsxs("div",{className:"flex h-screen flex-col bg-background",children:[e.jsxs("div",{className:"relative flex-1 overflow-hidden",children:[e.jsx(o.Activity,{mode:s==="wallet"?"visible":"hidden",children:e.jsx("div",{className:"flex h-full items-center justify-center",children:e.jsxs("div",{className:"text-center text-muted-foreground",children:[e.jsx("div",{className:"text-4xl mb-2",children:"👛"}),e.jsx("div",{children:"钱包页面"})]})})}),e.jsx(o.Activity,{mode:s==="ecosystem"?"visible":"hidden",children:e.jsx(R,{desktopRef:t,myApps:c,onAppOpen:f})}),e.jsx(o.Activity,{mode:s==="settings"?"visible":"hidden",children:e.jsx("div",{className:"flex h-full items-center justify-center",children:e.jsxs("div",{className:"text-center text-muted-foreground",children:[e.jsx("div",{className:"text-4xl mb-2",children:"⚙️"}),e.jsx("div",{children:"设置页面"})]})})}),e.jsx(S,{}),e.jsx("div",{id:"miniapp-fallback-portal",style:{display:"contents"}})]}),e.jsx(N,{activeTab:s,onTabChange:a,className:"static"})]})})},play:async({canvasElement:r,step:t})=>{const s=C(r);await new Promise(i=>setTimeout(i,500)),await t("点击第一个应用图标启动",async()=>{const i=s.getAllByTestId(/^ios-app-icon-/)[0];w(i).toBeInTheDocument(),await x.click(i),await new Promise(c=>setTimeout(c,1500))}),await t("验证窗口已渲染",async()=>{const i=s.getByTestId("miniapp-window");w(i).toBeInTheDocument()}),await t("点击钱包 Tab 切走",async()=>{const i=s.getByTestId("tab-wallet");await x.click(i),await new Promise(c=>setTimeout(c,300))}),await t("点击生态 Tab 切回",async()=>{const i=s.getByTestId("tab-ecosystem");await x.click(i),await new Promise(c=>setTimeout(c,500))}),await t("验证窗口重新可见",async()=>{const i=s.getByTestId("miniapp-window");w(i).toBeInTheDocument()})}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="relative h-screen">
      <MiniappSplashScreen appId="demo" app={{
      name: '锻造',
      icon: 'https://api.iconify.design/fluent-emoji:hammer-and-wrench.svg',
      themeColor: '#f59e0b'
    }} visible={true} />
    </div>
}`,...p.parameters?.docs?.source},description:{story:"单独测试启动屏幕",...p.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="relative h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <MiniappCapsule visible={true} onAction={() => console.log('Action clicked')} onClose={() => console.log('Close clicked')} />
    </div>
}`,...l.parameters?.docs?.source},description:{story:"单独测试胶囊按钮",...l.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid h-screen grid-cols-2 gap-4 p-4">
      <div className="relative h-full overflow-hidden rounded-xl">
        <MiniappSplashScreen appId="amber" app={{
        name: '锻造',
        icon: 'https://api.iconify.design/fluent-emoji:hammer-and-wrench.svg',
        themeColor: '#f59e0b'
      }} visible={true} />
      </div>
      <div className="relative h-full overflow-hidden rounded-xl">
        <MiniappSplashScreen appId="purple" app={{
        name: '传送',
        icon: 'https://api.iconify.design/fluent-emoji:rocket.svg',
        themeColor: '#8b5cf6'
      }} visible={true} />
      </div>
      <div className="relative h-full overflow-hidden rounded-xl">
        <MiniappSplashScreen appId="green" app={{
        name: '市场',
        icon: 'https://api.iconify.design/fluent-emoji:shopping-bags.svg',
        themeColor: '#10b981'
      }} visible={true} />
      </div>
      <div className="relative h-full overflow-hidden rounded-xl">
        <MiniappSplashScreen appId="blue" app={{
        name: '钱包',
        icon: 'https://api.iconify.design/fluent-emoji:money-bag.svg',
        themeColor: '#3b82f6'
      }} visible={true} />
      </div>
    </div>
}`,...d.parameters?.docs?.source},description:{story:"不同主题色的启动屏幕",...d.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  decorators: [Story => <SwiperSyncProvider>
        <div className="h-screen">
          <Story />
        </div>
      </SwiperSyncProvider>],
  render: function LaunchDemoStory() {
    const desktopRef = useRef<EcosystemDesktopHandle>(null);
    const [timeScale, setTimeScale] = useState(1);

    // 清理旧状态
    useEffect(() => {
      // 清理之前可能残留的应用状态
      closeAllApps();
      resetMiniappVisualConfig();
      setMiniappMotionTimeScale(1);
      return () => {
        resetMiniappVisualConfig();
      };
    }, []);
    useEffect(() => {
      setMiniappMotionTimeScale(timeScale);
    }, [timeScale]);
    const myApps = mockApps.map((app, i) => ({
      app,
      lastUsed: Date.now() - i * 1000 * 60 * 60
    }));
    const handleAppOpen = (app: MiniappManifest) => {
      console.log('[LaunchDemo] Opening app:', app.name);
      // 关键：动画目标来自 targetDesktop 对应 slide 的 rect，因此必须先切到该页
      const manifest: MiniappManifest = {
        ...app,
        targetDesktop: 'mine'
      };
      desktopRef.current?.slideTo('mine');
      requestAnimationFrame(() => launchApp(app.id, manifest));
    };
    return <MiniappVisualProvider>
        <div className="flex h-screen flex-col">
          <div className="relative flex-1 overflow-hidden">
            <EcosystemDesktop ref={desktopRef} showDiscoverPage={false} showStackPage="auto" apps={mockApps} myApps={myApps} onAppOpen={handleAppOpen} onAppDetail={app => console.log('Detail:', app.name)} onAppRemove={id => console.log('Remove:', id)} />

            {/* 窗口层 */}
            <MiniappWindow />
          </div>

          {/* 真实项目底部指示器（TabBar 内置生态 indicator） */}
          <TabBar activeTab="ecosystem" className="static" onTabChange={() => {}} />

          {/* 提示 + 速度调控 */}
          <div className="shrink-0 bg-black/90 px-3 py-2 text-xs text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="truncate">点击图标启动应用 | 锻造/传送有 Splash | 市场/钱包直接打开</div>

              <div className="flex items-center gap-2 whitespace-nowrap">
                <button className="rounded bg-white/10 px-2 py-1" onClick={() => setTimeScale(s => Math.max(0.25, Number((s - 0.25).toFixed(2))))}>
                  -
                </button>
                <div className="min-w-[6ch] text-center tabular-nums">x{timeScale.toFixed(2)}</div>
                <button className="rounded bg-white/10 px-2 py-1" onClick={() => setTimeScale(s => Math.min(4, Number((s + 0.25).toFixed(2))))}>
                  +
                </button>
                <button className="rounded bg-white/10 px-2 py-1" onClick={() => setTimeScale(1)}>
                  Reset
                </button>
              </div>
            </div>

            <input className="mt-2 w-full" type="range" min={0.25} max={4} step={0.05} value={timeScale} onChange={e => setTimeScale(Number(e.target.value))} aria-label="Miniapp motion speed" />
          </div>
        </div>
      </MiniappVisualProvider>;
  }
}`,...m.parameters?.docs?.source},description:{story:`启动动画演示

点击图标启动应用，观察 FLIP 动画效果：
- 锻造/传送：有 splash screen（路径 1）
- 市场/钱包：无 splash screen（路径 2）`,...m.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  decorators: [Story => <SwiperSyncProvider>
        <div className="h-screen">
          <Story />
        </div>
      </SwiperSyncProvider>],
  render: function TabSwitchVisibilityStory() {
    const desktopRef = useRef<EcosystemDesktopHandle>(null);
    const [activeTab, setActiveTab] = useState<'wallet' | 'ecosystem' | 'settings'>('ecosystem');

    // 清理旧状态
    useEffect(() => {
      closeAllApps();
      resetMiniappVisualConfig();
      return () => {
        resetMiniappVisualConfig();
      };
    }, []);
    const myApps = mockApps.map((app, i) => ({
      app,
      lastUsed: Date.now() - i * 1000 * 60 * 60
    }));
    const handleAppOpen = (app: MiniappManifest) => {
      console.log('[TabSwitchVisibility] Opening app:', app.name);
      const manifest: MiniappManifest = {
        ...app,
        targetDesktop: 'mine'
      };
      desktopRef.current?.slideTo('mine');
      requestAnimationFrame(() => launchApp(app.id, manifest));
    };
    const handleTabChange = (tab: 'wallet' | 'ecosystem' | 'settings') => {
      console.log('[TabSwitchVisibility] Tab changed to:', tab);
      setActiveTab(tab);
    };
    return <MiniappVisualProvider>
        <div className="flex h-screen flex-col bg-background">
          <div className="relative flex-1 overflow-hidden">
            {/* 使用 React 19 Activity 模拟真实 Tab 切换行为 */}
            <Activity mode={activeTab === 'wallet' ? 'visible' : 'hidden'}>
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-4xl mb-2">👛</div>
                  <div>钱包页面</div>
                </div>
              </div>
            </Activity>

            <Activity mode={activeTab === 'ecosystem' ? 'visible' : 'hidden'}>
              <EcosystemTabMock desktopRef={desktopRef} myApps={myApps} onAppOpen={handleAppOpen} />
            </Activity>

            <Activity mode={activeTab === 'settings' ? 'visible' : 'hidden'}>
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-4xl mb-2">⚙️</div>
                  <div>设置页面</div>
                </div>
              </div>
            </Activity>

            {/* MiniappWindow 在全局层，不随 Tab 切换卸载（与 StackflowApp 一致） */}
            <MiniappWindow />
            {/* Fallback 容器 - 当 slot lost 时保持 MiniappWindow 挂载 */}
            <div id="miniapp-fallback-portal" style={{
            display: 'contents'
          }} />
          </div>

          {/* 真实 TabBar */}
          <TabBar activeTab={activeTab} onTabChange={handleTabChange} className="static" />
        </div>
      </MiniappVisualProvider>;
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await new Promise(r => setTimeout(r, 500));
    await step('点击第一个应用图标启动', async () => {
      const appIcon = canvas.getAllByTestId(/^ios-app-icon-/)[0];
      expect(appIcon).toBeInTheDocument();
      await userEvent.click(appIcon);
      await new Promise(r => setTimeout(r, 1500));
    });
    await step('验证窗口已渲染', async () => {
      const window = canvas.getByTestId('miniapp-window');
      expect(window).toBeInTheDocument();
    });
    await step('点击钱包 Tab 切走', async () => {
      const walletTab = canvas.getByTestId('tab-wallet');
      await userEvent.click(walletTab);
      await new Promise(r => setTimeout(r, 300));
    });
    await step('点击生态 Tab 切回', async () => {
      const ecosystemTab = canvas.getByTestId('tab-ecosystem');
      await userEvent.click(ecosystemTab);
      await new Promise(r => setTimeout(r, 500));
    });
    await step('验证窗口重新可见', async () => {
      const window = canvas.getByTestId('miniapp-window');
      expect(window).toBeInTheDocument();
    });
  }
}`,...u.parameters?.docs?.source},description:{story:`Tab 切换可见性测试

使用真实的 TabBar 和 React 19 Activity 模拟底部 Tab 切换场景：
- MiniappWindow 在全局层渲染（不随 Tab 切换卸载）
- EcosystemTabMock 在 Activity 内，包含 activateApp 逻辑

测试步骤：
1. 点击生态 Tab，然后点击图标启动应用
2. 点击钱包 Tab 切走
3. 点击生态 Tab 切回
4. 观察小程序窗口是否仍然可见`,...u.parameters?.docs?.description}}};const De=["SplashScreenOnly","CapsuleOnly","SplashScreenThemes","LaunchDemo","TabSwitchVisibility"];export{l as CapsuleOnly,m as LaunchDemo,p as SplashScreenOnly,d as SplashScreenThemes,u as TabSwitchVisibility,De as __namedExportsOrder,Ce as default};
