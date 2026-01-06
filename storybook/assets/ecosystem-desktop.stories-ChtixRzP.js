import{j as e,r as g}from"./iframe-Cctxta_P.js";import{E as h,a as f}from"./ecosystem-desktop-BnPQQWcR.js";import{S as y}from"./swiper-sync-context-CjJlB7jB.js";import{l as A}from"./index-PMWuThF-.js";import"./preload-helper-PPVm8Dsz.js";import"./swiper-DvJCME9U.js";import"./my-apps-page-MK7MKRTA.js";import"./utils-CDN07tui.js";import"./IconTrash-B0njLt7H.js";import"./createReactComponent-BokZZTcn.js";import"./IconSparkles-B5YMY-mG.js";import"./IconSearch-C5pGjBwS.js";import"./IconDownload-eiHb9IB1.js";import"./proxy-BHzkbUHN.js";import"./IconInfoCircle-Cpbyhs8C.js";import"./button-sjDKCcea.js";import"./index-B_jtOnfb.js";import"./useButton-BiCET3WI.js";import"./useRenderElement-qlaWX--Y.js";import"./IconChevronRight-C0BW2P53.js";import"./miniapp-splash-screen-CFlAZsTJ.js";import"./index-CAE8aR0t.js";import"./index-t7D9Uy62.js";import"./IconDots-BSGCpCPI.js";import"./index-CkK9OME9.js";/* empty css                     */import"./web-DnZPwNCZ.js";import"./chain-config-DqVXGLIz.js";import"./index-D0E7N0oa.js";import"./bioforest-uXX5qE5N.js";import"./schemas-BX8BzOgD.js";import"./address-format-DY2duW3A.js";import"./breakpoint-wIg8UP9C.js";import"./amount-BQsqQYGO.js";import"./index-Ar-6A-5n.js";import"./index-Ddwf1R_9.js";const o=[{id:"forge",name:"锻造",description:"铸造和管理你的 NFT 资产",icon:"/miniapps/forge/logo.webp",url:"https://localhost:5182/",version:"1.0.0",themeColor:"#FF6B35",splashScreen:!0,sourceName:"BioChain",sourceIcon:"/logo.webp"},{id:"teleport",name:"传送",description:"跨链资产转移",icon:"/miniapps/teleport/logo.webp",url:"https://localhost:5183/",version:"1.0.0",themeColor:"#6366F1",splashScreen:!0,sourceName:"BioChain",sourceIcon:"/logo.webp"},{id:"market",name:"市场",description:"NFT 交易市场",icon:"/miniapps/forge/logo.webp",url:"https://example.com/market",version:"1.0.0",themeColor:"#10B981",sourceName:"Community",sourceIcon:"/logo.webp"},{id:"wallet",name:"钱包",description:"数字资产管理",icon:"/miniapps/teleport/logo.webp",url:"https://example.com/wallet",version:"1.0.0",themeColor:"#F59E0B",sourceName:"BioChain",sourceIcon:"/logo.webp"}],se={title:"Ecosystem/EcosystemDesktop",component:h,parameters:{layout:"fullscreen",viewport:{defaultViewport:"mobile1"}},decorators:[n=>e.jsx(y,{groupId:"ecosystem",children:e.jsx("div",{className:"h-[667px] w-[375px] mx-auto bg-background overflow-hidden relative",children:e.jsx(n,{})})})]},l={render:function(){const s=g.useRef(null),a=o.slice(0,3).map((t,c)=>({app:t,lastUsed:Date.now()-c*1e3*60*60})),i=g.useCallback(t=>{console.log("Open:",t.name);const c={...t,targetDesktop:"mine"};s.current?.slideTo("mine"),requestAnimationFrame(()=>A(t.id,c))},[]);return e.jsxs(e.Fragment,{children:[e.jsx(h,{ref:s,showDiscoverPage:!0,showStackPage:"auto",apps:o,myApps:a,featuredApps:o.slice(0,2),recommendedApps:o.slice(2),hotApps:o,onAppOpen:i,onAppDetail:t=>console.log("Detail:",t.name),onAppRemove:t=>console.log("Remove:",t)}),e.jsx("div",{className:"absolute bottom-4 left-0 right-0 flex justify-center",children:e.jsx(f,{onPageChange:t=>s.current?.slideTo(t)})})]})}},m={render:function(){const s=o.map((a,i)=>({app:a,lastUsed:Date.now()-i*1e3*60*60}));return e.jsxs(e.Fragment,{children:[e.jsx(h,{showDiscoverPage:!1,showStackPage:!1,apps:o,myApps:s,onAppOpen:a=>console.log("Open:",a.name),onAppDetail:a=>console.log("Detail:",a.name),onAppRemove:a=>console.log("Remove:",a)}),e.jsx("div",{className:"absolute bottom-4 left-0 right-0 flex justify-center",children:e.jsx(f,{})})]})}},d={render:function(){const s=g.useRef(null),[a,i]=g.useState(!0),[t,c]=g.useState("auto"),v=o.map((p,r)=>({app:p,lastUsed:Date.now()-r*1e3*60*60}));return e.jsxs("div",{className:"flex flex-col h-full",children:[e.jsxs("div",{className:"shrink-0 bg-black/90 text-white p-3 space-y-2",children:[e.jsxs("label",{className:"flex items-center gap-2 text-sm",children:[e.jsx("input",{type:"checkbox",checked:a,onChange:p=>i(p.target.checked),className:"rounded"}),"显示发现页"]}),e.jsx("label",{className:"flex items-center gap-2 text-sm",children:e.jsxs("select",{value:String(t),onChange:p=>{const r=p.target.value;c(r==="auto"?"auto":r==="true")},className:"bg-gray-800 rounded px-2 py-1 text-sm",children:[e.jsx("option",{value:"auto",children:"应用堆栈页: 自动"}),e.jsx("option",{value:"true",children:"应用堆栈页: 显示"}),e.jsx("option",{value:"false",children:"应用堆栈页: 隐藏"})]})})]}),e.jsxs("div",{className:"flex-1 relative overflow-hidden",children:[e.jsx(h,{ref:s,showDiscoverPage:a,showStackPage:t,apps:o,myApps:v,featuredApps:o.slice(0,2),recommendedApps:o.slice(2),hotApps:o,onAppOpen:p=>{console.log("Open:",p.name);const r={...p,targetDesktop:"mine"};s.current?.slideTo("mine"),requestAnimationFrame(()=>A(p.id,r))},onAppDetail:p=>console.log("Detail:",p.name),onAppRemove:p=>console.log("Remove:",p)}),e.jsx("div",{className:"absolute bottom-4 left-0 right-0 flex justify-center",children:e.jsx(f,{})})]})]})}},u={render:function(){return e.jsxs(e.Fragment,{children:[e.jsx(h,{showDiscoverPage:!0,apps:o,myApps:[],featuredApps:o.slice(0,2),recommendedApps:o,hotApps:o,onAppOpen:s=>console.log("Open:",s.name),onAppDetail:s=>console.log("Detail:",s.name),onAppRemove:s=>console.log("Remove:",s)}),e.jsx("div",{className:"absolute bottom-4 left-0 right-0 flex justify-center",children:e.jsx(f,{})})]})}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: function FullDesktopStory() {
    const desktopRef = useRef<EcosystemDesktopHandle>(null);
    const myApps = mockApps.slice(0, 3).map((app, i) => ({
      app,
      lastUsed: Date.now() - i * 1000 * 60 * 60
    }));
    const handleAppOpen = useCallback((app: MiniappManifest) => {
      console.log('Open:', app.name);
      const manifest: MiniappManifest = {
        ...app,
        targetDesktop: 'mine'
      };
      desktopRef.current?.slideTo('mine');
      requestAnimationFrame(() => launchApp(app.id, manifest));
    }, []);
    return <>
        <EcosystemDesktop ref={desktopRef} showDiscoverPage={true} showStackPage="auto" apps={mockApps} myApps={myApps} featuredApps={mockApps.slice(0, 2)} recommendedApps={mockApps.slice(2)} hotApps={mockApps} onAppOpen={handleAppOpen} onAppDetail={app => console.log('Detail:', app.name)} onAppRemove={id => console.log('Remove:', id)} />
        {/* 底部指示器（松耦合，自动从 store 读取状态） */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <EcosystemTabIndicator onPageChange={page => desktopRef.current?.slideTo(page)} />
        </div>
      </>;
  }
}`,...l.parameters?.docs?.source},description:{story:"完整桌面（发现页 + 我的页 + 应用堆栈页）",...l.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: function MyAppsOnlyStory() {
    const myApps = mockApps.map((app, i) => ({
      app,
      lastUsed: Date.now() - i * 1000 * 60 * 60
    }));
    return <>
        <EcosystemDesktop showDiscoverPage={false} showStackPage={false} apps={mockApps} myApps={myApps} onAppOpen={app => console.log('Open:', app.name)} onAppDetail={app => console.log('Detail:', app.name)} onAppRemove={id => console.log('Remove:', id)} />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <EcosystemTabIndicator />
        </div>
      </>;
  }
}`,...m.parameters?.docs?.source},description:{story:"仅我的页（无发现页，无搜索框）",...m.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: function ConfigurableStory() {
    const desktopRef = useRef<EcosystemDesktopHandle>(null);
    const [showDiscoverPage, setShowDiscoverPage] = useState(true);
    const [showStackPage, setShowStackPage] = useState<boolean | 'auto'>('auto');
    const myApps = mockApps.map((app, i) => ({
      app,
      lastUsed: Date.now() - i * 1000 * 60 * 60
    }));
    return <div className="flex flex-col h-full">
        {/* 控制面板 */}
        <div className="shrink-0 bg-black/90 text-white p-3 space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showDiscoverPage} onChange={e => setShowDiscoverPage(e.target.checked)} className="rounded" />
            显示发现页
          </label>
          <label className="flex items-center gap-2 text-sm">
            <select value={String(showStackPage)} onChange={e => {
            const v = e.target.value;
            setShowStackPage(v === 'auto' ? 'auto' : v === 'true');
          }} className="bg-gray-800 rounded px-2 py-1 text-sm">
              <option value="auto">应用堆栈页: 自动</option>
              <option value="true">应用堆栈页: 显示</option>
              <option value="false">应用堆栈页: 隐藏</option>
            </select>
          </label>
        </div>

        {/* 桌面 */}
        <div className="flex-1 relative overflow-hidden">
          <EcosystemDesktop ref={desktopRef} showDiscoverPage={showDiscoverPage} showStackPage={showStackPage} apps={mockApps} myApps={myApps} featuredApps={mockApps.slice(0, 2)} recommendedApps={mockApps.slice(2)} hotApps={mockApps} onAppOpen={app => {
          console.log('Open:', app.name);
          const manifest: MiniappManifest = {
            ...app,
            targetDesktop: 'mine'
          };
          desktopRef.current?.slideTo('mine');
          requestAnimationFrame(() => launchApp(app.id, manifest));
        }} onAppDetail={app => console.log('Detail:', app.name)} onAppRemove={id => console.log('Remove:', id)} />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <EcosystemTabIndicator />
          </div>
        </div>
      </div>;
  }
}`,...d.parameters?.docs?.source},description:{story:"可配置桌面",...d.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: function EmptyStateStory() {
    return <>
        <EcosystemDesktop showDiscoverPage={true} apps={mockApps} myApps={[]} featuredApps={mockApps.slice(0, 2)} recommendedApps={mockApps} hotApps={mockApps} onAppOpen={app => console.log('Open:', app.name)} onAppDetail={app => console.log('Detail:', app.name)} onAppRemove={id => console.log('Remove:', id)} />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <EcosystemTabIndicator />
        </div>
      </>;
  }
}`,...u.parameters?.docs?.source},description:{story:"空状态",...u.parameters?.docs?.description}}};const te=["FullDesktop","MyAppsOnly","Configurable","EmptyState"];export{d as Configurable,u as EmptyState,l as FullDesktop,m as MyAppsOnly,te as __namedExportsOrder,se as default};
