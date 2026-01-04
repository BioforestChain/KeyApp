import{j as e}from"./iframe-BEYsz_Nt.js";import{G as i}from"./gradient-button-C-uFbkJH.js";import{L as d}from"./loading-spinner-qCYwQe_K.js";import{E as m}from"./empty-state-Bs7MkhC2.js";import{u as c}from"./useTranslation-B3xWiyCw.js";import"./preload-helper-PPVm8Dsz.js";import"./index-CYW01yvF.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./createReactComponent-BT0NPHve.js";import"./index-vFE_paAZ.js";function l(){const{t:s,i18n:t}=c(["common","wallet","transaction"]);return e.jsxs("div",{className:"bg-card space-y-6 rounded-xl p-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("h2",{className:"text-lg font-semibold",children:s("wallet:myWallet")}),e.jsx("p",{className:"text-muted-foreground text-sm",children:s("loading")})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(d,{size:"sm"}),e.jsxs("span",{className:"text-sm",children:[s("loading"),"..."]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(i,{variant:"purple",size:"sm",children:s("wallet:transfer")}),e.jsx(i,{variant:"blue",size:"sm",children:s("wallet:receive")})]}),e.jsxs("div",{className:"bg-background rounded-lg p-3",children:[e.jsx("p",{className:"text-sm font-medium",children:s("transaction:send")}),e.jsx("p",{className:"text-muted-foreground text-xs",children:s("transaction:pending")})]}),e.jsxs("div",{className:"text-muted-foreground text-xs",children:["Current: ",t.language," | Dir: ",t.dir()]})]})}const w={title:"Common/ThemeDemo",component:l,tags:["autodocs"],parameters:{docs:{description:{component:`
演示多语言和主题切换功能。

## 使用方法

使用工具栏切换：
- **🌐 Globe 图标**: 切换语言 (简体中文 / English / العربية)
- **🎨 Paintbrush 图标**: 切换主题 (Light / Dark)

## RTL 支持

选择阿拉伯语 (العربية) 时，页面会自动切换为 RTL 布局。
        `}}}},a={},r={render:()=>{const{t:s}=c(["token","empty"]);return e.jsx(m,{title:s("noAssets"),description:s("empty:description"),action:e.jsx(i,{variant:"purple",size:"sm",children:s("addToken")})})}},n={render:()=>{const{t:s}=c("transaction");return e.jsx("div",{className:"space-y-3",children:["send","receive","swap","stake"].map(t=>e.jsxs("div",{className:"bg-card flex items-center justify-between rounded-lg p-3",children:[e.jsx("span",{className:"font-medium",children:s(t)}),e.jsx("span",{className:"text-muted-foreground text-sm",children:s("confirmed")})]},t))})}},o={render:()=>{const{t:s}=c("security");return e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"bg-card rounded-lg p-3",children:[e.jsx("p",{className:"font-medium",children:s("password")}),e.jsx("div",{className:"mt-2 flex gap-2",children:["weak","medium","strong"].map(t=>e.jsx("span",{className:`rounded px-2 py-1 text-xs ${t==="weak"?"bg-destructive/20 text-destructive":t==="medium"?"bg-yellow-500/20 text-yellow-600":"bg-green-500/20 text-green-500"}`,children:s(`strength.${t}`)},t))})]}),e.jsxs("div",{className:"bg-card rounded-lg p-3",children:[e.jsx("p",{className:"font-medium",children:s("mnemonic")}),e.jsx("p",{className:"text-muted-foreground mt-1 text-sm",children:s("copyMnemonic")})]})]})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{}",...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      t
    } = useTranslation(['token', 'empty']);
    return <EmptyState title={t('noAssets')} description={t('empty:description')} action={<GradientButton variant="purple" size="sm">
            {t('addToken')}
          </GradientButton>} />;
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      t
    } = useTranslation('transaction');
    return <div className="space-y-3">
        {(['send', 'receive', 'swap', 'stake'] as const).map(type => <div key={type} className="bg-card flex items-center justify-between rounded-lg p-3">
            <span className="font-medium">{t(type)}</span>
            <span className="text-muted-foreground text-sm">{t('confirmed')}</span>
          </div>)}
      </div>;
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      t
    } = useTranslation('security');
    return <div className="space-y-3">
        <div className="bg-card rounded-lg p-3">
          <p className="font-medium">{t('password')}</p>
          <div className="mt-2 flex gap-2">
            {(['weak', 'medium', 'strong'] as const).map(level => <span key={level} className={\`rounded px-2 py-1 text-xs \${level === 'weak' ? 'bg-destructive/20 text-destructive' : level === 'medium' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-green-500/20 text-green-500'}\`}>
                {t(\`strength.\${level}\`)}
              </span>)}
          </div>
        </div>
        <div className="bg-card rounded-lg p-3">
          <p className="font-medium">{t('mnemonic')}</p>
          <p className="text-muted-foreground mt-1 text-sm">{t('copyMnemonic')}</p>
        </div>
      </div>;
  }
}`,...o.parameters?.docs?.source}}};const k=["Default","WithEmptyState","TransactionStates","SecurityLabels"];export{a as Default,o as SecurityLabels,n as TransactionStates,r as WithEmptyState,k as __namedExportsOrder,w as default};
