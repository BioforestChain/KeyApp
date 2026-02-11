import{j as e,r as p}from"./iframe-mWBAGdu2.js";import{c as m}from"./utils-4perknFd.js";import{u as b}from"./useTranslation-CgcY4kD2.js";import{I as f}from"./IconCircleCheck-KBzony0K.js";import{T as k}from"./Trans-D_DQa61U.js";import{I as d}from"./IconShield-D8g-eIcD.js";import{I as N}from"./IconChevronRight--uM43yWz.js";import"./preload-helper-PPVm8Dsz.js";import"./index-CQqlk44_.js";import"./createReactComponent-B-6fW5hv.js";function i({walletName:s,onBackup:t,onEnterWallet:x,skipBackup:a=!0,className:g}){const{t:r}=b("onboarding");return e.jsxs("div",{className:m("flex flex-col items-center px-6 py-8",g),children:[e.jsx("div",{className:"mb-6 flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30",children:e.jsx(f,{className:"size-10 text-green-600 dark:text-green-400"})}),e.jsx("h1",{className:"mb-2 text-2xl font-bold",children:r("create.success.title")}),e.jsx("p",{className:"text-muted-foreground mb-8 text-center",children:e.jsx(k,{i18nKey:"create.success.description",ns:"onboarding",values:{name:s},components:{bold:e.jsx("span",{className:"text-foreground font-medium"})}})}),a&&t&&e.jsx("div",{className:"mb-8 w-full rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20",children:e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx(d,{className:"mt-0.5 size-5 shrink-0 text-yellow-600 dark:text-yellow-400"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-yellow-800 dark:text-yellow-200",children:r("create.success.securityReminder")}),e.jsx("p",{className:"mt-1 text-sm text-yellow-700 dark:text-yellow-300",children:r("create.success.securityReminderDesc")})]})]})}),e.jsxs("div",{className:"w-full space-y-3",children:[a&&t&&e.jsxs("button",{type:"button",onClick:t,className:m("flex w-full items-center justify-center gap-2 rounded-full py-3 font-medium text-primary-foreground transition-colors","bg-primary hover:bg-primary/90"),children:[e.jsx(d,{className:"size-5"}),e.jsx("span",{children:r("create.success.backupNow")})]}),e.jsxs("button",{type:"button",onClick:x,className:m("flex w-full items-center justify-center gap-2 rounded-full py-3 font-medium transition-colors",a&&t?"border-border text-foreground hover:bg-muted border":"bg-primary hover:bg-primary/90 text-primary-foreground"),children:[e.jsx("span",{children:r(a&&t?"create.success.backupLater":"create.success.enterWallet")}),e.jsx(N,{className:"size-5"})]})]}),a&&t&&e.jsx("p",{className:"text-muted-foreground mt-4 text-center text-xs",children:r("create.success.backupNote")})]})}i.__docgenInfo={description:"Success screen shown after wallet creation",methods:[],displayName:"CreateWalletSuccess",props:{walletName:{required:!0,tsType:{name:"string"},description:"Wallet name"},onBackup:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Callback when user chooses to backup mnemonic"},onEnterWallet:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Callback when user chooses to enter wallet"},skipBackup:{required:!1,tsType:{name:"boolean"},description:"Whether backup is skipped (skipBackup=true)",defaultValue:{value:"true",computed:!1}},className:{required:!1,tsType:{name:"string"},description:"Additional class name"}}};const I={title:"Onboarding/CreateWalletSuccess",component:i,tags:["autodocs"],decorators:[s=>e.jsx("div",{className:"max-w-md",children:e.jsx(s,{})})]},n={args:{walletName:"我的钱包",skipBackup:!0,onBackup:()=>console.log("Backup"),onEnterWallet:()=>console.log("Enter wallet")}},l={args:{walletName:"MyWallet",skipBackup:!1,onEnterWallet:()=>console.log("Enter wallet")}},o={args:{walletName:"超长钱包名称测试",skipBackup:!0,onBackup:()=>console.log("Backup"),onEnterWallet:()=>console.log("Enter wallet")}},c={render:()=>{const[s,t]=p.useState(null);return s==="backup"?e.jsxs("div",{className:"space-y-4 p-6 text-center",children:[e.jsx("p",{className:"text-lg font-medium",children:"开始备份助记词..."}),e.jsx("button",{onClick:()=>t(null),className:"text-sm text-muted-foreground",children:"返回"})]}):s==="enter"?e.jsxs("div",{className:"space-y-4 p-6 text-center",children:[e.jsx("p",{className:"text-lg font-medium",children:"进入钱包主页..."}),e.jsx("button",{onClick:()=>t(null),className:"text-sm text-muted-foreground",children:"返回"})]}):e.jsx(i,{walletName:"测试钱包",skipBackup:!0,onBackup:()=>t("backup"),onEnterWallet:()=>t("enter")})}},u={render:()=>{const[s,t]=p.useState("success");return s==="done"?e.jsxs("div",{className:"space-y-4 p-6 text-center",children:[e.jsxs("div",{className:"rounded-xl bg-blue-100 p-6 dark:bg-blue-900/30",children:[e.jsx("p",{className:"text-lg font-semibold text-blue-800 dark:text-blue-200",children:"🏠 钱包主页"}),e.jsx("p",{className:"mt-2 text-sm text-blue-600 dark:text-blue-300",children:"您已成功进入钱包"})]}),e.jsx("button",{onClick:()=>t("success"),className:"text-sm text-muted-foreground",children:"重新开始"})]}):e.jsx(i,{walletName:"BFM Pay",skipBackup:!0,onBackup:()=>alert("跳转到备份页面"),onEnterWallet:()=>t("done")})}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    walletName: '我的钱包',
    skipBackup: true,
    onBackup: () => console.log('Backup'),
    onEnterWallet: () => console.log('Enter wallet')
  }
}`,...n.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    walletName: 'MyWallet',
    skipBackup: false,
    onEnterWallet: () => console.log('Enter wallet')
  }
}`,...l.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    walletName: '超长钱包名称测试',
    skipBackup: true,
    onBackup: () => console.log('Backup'),
    onEnterWallet: () => console.log('Enter wallet')
  }
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [action, setAction] = useState<string | null>(null);
    if (action === 'backup') {
      return <div className="space-y-4 p-6 text-center">
          <p className="text-lg font-medium">开始备份助记词...</p>
          <button onClick={() => setAction(null)} className="text-sm text-muted-foreground">
            返回
          </button>
        </div>;
    }
    if (action === 'enter') {
      return <div className="space-y-4 p-6 text-center">
          <p className="text-lg font-medium">进入钱包主页...</p>
          <button onClick={() => setAction(null)} className="text-sm text-muted-foreground">
            返回
          </button>
        </div>;
    }
    return <CreateWalletSuccess walletName="测试钱包" skipBackup={true} onBackup={() => setAction('backup')} onEnterWallet={() => setAction('enter')} />;
  }
}`,...c.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [step, setStep] = useState<'success' | 'done'>('success');
    if (step === 'done') {
      return <div className="space-y-4 p-6 text-center">
          <div className="rounded-xl bg-blue-100 p-6 dark:bg-blue-900/30">
            <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
              🏠 钱包主页
            </p>
            <p className="mt-2 text-sm text-blue-600 dark:text-blue-300">
              您已成功进入钱包
            </p>
          </div>
          <button onClick={() => setStep('success')} className="text-sm text-muted-foreground">
            重新开始
          </button>
        </div>;
    }
    return <CreateWalletSuccess walletName="BFM Pay" skipBackup={true} onBackup={() => alert('跳转到备份页面')} onEnterWallet={() => setStep('done')} />;
  }
}`,...u.parameters?.docs?.source}}};const T=["Default","WithoutBackupOption","LongWalletName","Interactive","InOnboardingFlow"];export{n as Default,u as InOnboardingFlow,c as Interactive,o as LongWalletName,l as WithoutBackupOption,T as __namedExportsOrder,I as default};
