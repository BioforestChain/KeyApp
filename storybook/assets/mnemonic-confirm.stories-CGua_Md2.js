import{r as d,j as e}from"./iframe-DTpQIzq1.js";import{c as j}from"./utils-4perknFd.js";import{u as E}from"./useTranslation-CVemGc0k.js";import{I as R}from"./IconX-DyZuEkrC.js";import{I as q}from"./IconCheck-COB4eBHK.js";import{I as T}from"./IconRotateClockwise-BbEWrzwx.js";import"./preload-helper-PPVm8Dsz.js";import"./index-TsPtL0LE.js";import"./createReactComponent-D4ZaaTIu.js";function O(s){const r=[...s];for(let c=r.length-1;c>0;c--){const i=Math.floor(Math.random()*(c+1)),n=r[c],l=r[i];n!==void 0&&l!==void 0&&(r[c]=l,r[i]=n)}return r}function y({words:s,onComplete:r,onReset:c,className:i}){const{t:n}=E("security"),[l]=d.useState(()=>O(s.map((o,t)=>({word:o,originalIndex:t})))),[a,w]=d.useState([]),[N,m]=d.useState(!1),v=d.useMemo(()=>a.map(o=>{const t=l[o];if(!t)throw new Error(`Invalid shuffled word index: ${o}`);return t.word}),[a,l]),k=a.length===s.length,S=d.useMemo(()=>v.every((o,t)=>o===s[t]),[v,s]),I=d.useCallback(o=>{if(a.includes(o))return;m(!1);const t=[...a,o];w(t),t.length===s.length&&(t.map(p=>{const u=l[p];if(!u)throw new Error(`Invalid shuffled word index: ${p}`);return u.word}).every((p,u)=>p===s[u])?r():m(!0))},[a,s,l,r]),M=d.useCallback(()=>{w([]),m(!1),c?.()},[c]),W=d.useCallback(()=>{w(o=>o.slice(0,-1)),m(!1)},[]);return e.jsxs("div",{className:j("space-y-6",i),children:[e.jsxs("div",{className:"border-border bg-muted/30 rounded-xl border p-4",children:[e.jsxs("div",{className:"mb-2 flex items-center justify-between",children:[e.jsx("span",{className:"text-muted-foreground text-sm",children:n("mnemonicConfirm.selected",{current:a.length,total:s.length})}),a.length>0&&e.jsx("button",{type:"button",onClick:W,className:"text-muted-foreground hover:text-foreground text-sm",children:n("mnemonicConfirm.undo")})]}),e.jsxs("div",{className:"flex min-h-24 flex-wrap gap-2",children:[v.map((o,t)=>e.jsxs("span",{className:j("inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium",N&&t===a.length-1?"border-destructive bg-destructive/10 text-destructive":"border-border bg-background"),children:[e.jsx("span",{className:"text-muted-foreground text-xs",children:t+1}),o]},t)),a.length===0&&e.jsx("p",{className:"text-muted-foreground w-full py-4 text-center text-sm",children:n("mnemonicConfirm.hint")})]})]}),N&&e.jsxs("div",{className:"text-destructive flex items-center gap-2 text-sm",children:[e.jsx(R,{className:"size-4"}),e.jsx("span",{children:n("mnemonicConfirm.error")})]}),k&&S&&e.jsxs("div",{className:"flex items-center gap-2 text-sm text-green-600",children:[e.jsx(q,{className:"size-4"}),e.jsx("span",{children:n("mnemonicConfirm.success")})]}),e.jsx("div",{className:"flex flex-wrap gap-2",children:l.map((o,t)=>{const C=a.includes(t);return e.jsx("button",{type:"button",onClick:()=>I(t),disabled:C||k&&S,className:j("rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",C?"bg-muted text-muted-foreground border-transparent opacity-50":"border-border bg-background hover:border-primary hover:bg-primary/5","disabled:cursor-not-allowed"),children:o.word},t)})}),(a.length>0||N)&&e.jsxs("button",{type:"button",onClick:M,className:"text-muted-foreground hover:text-foreground flex w-full items-center justify-center gap-2 py-2 text-sm",children:[e.jsx(T,{className:"size-4"}),n("mnemonicConfirm.reset")]})]})}y.__docgenInfo={description:"Mnemonic confirmation component for backup verification",methods:[],displayName:"MnemonicConfirm",props:{words:{required:!0,tsType:{name:"Array",elements:[{name:"string"}],raw:"string[]"},description:"Original mnemonic words in correct order"},onComplete:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Callback when words are correctly confirmed"},onReset:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Callback when words are reset"},className:{required:!1,tsType:{name:"string"},description:"Additional class names"}}};const J={title:"Security/MnemonicConfirm",component:y,tags:["autodocs"],decorators:[s=>e.jsx("div",{className:"max-w-md p-4",children:e.jsx(s,{})})]},_=["abandon","ability","able","about","above","absent","absorb","abstract","absurd","abuse","access","accident"],z=["abandon","ability","able","about","above","absent","absorb","abstract","absurd","abuse","access","accident","account","accuse","achieve","acid","acoustic","acquire","across","act","action","actor","actress","actual"],x={args:{words:_,onComplete:()=>console.log("Complete!")}},g={args:{words:z,onComplete:()=>console.log("Complete!")}},b={args:{words:["apple","banana","cherry","date"],onComplete:()=>console.log("Complete!")}},f={render:()=>{const[s,r]=d.useState(!1),[c,i]=d.useState(0),n=()=>{r(!0)},l=()=>{r(!1),i(a=>a+1)};return s?e.jsxs("div",{className:"space-y-4 text-center",children:[e.jsxs("div",{className:"rounded-xl bg-green-100 p-6 dark:bg-green-900/30",children:[e.jsx("p",{className:"text-lg font-semibold text-green-800 dark:text-green-200",children:"🎉 验证成功！"}),e.jsx("p",{className:"mt-2 text-sm text-green-600 dark:text-green-300",children:"助记词已确认备份"})]}),e.jsx("button",{type:"button",onClick:l,className:"rounded-lg bg-primary px-4 py-2 text-white",children:"再试一次"})]}):e.jsx(y,{words:["apple","banana","cherry","date","elder","fig"],onComplete:n},c)}},h={render:()=>{const[s,r]=d.useState("show"),c=["ocean","wisdom","garden","silent","brave","crystal"];return s==="show"?e.jsxs("div",{className:"space-y-4",children:[e.jsx("h2",{className:"text-lg font-semibold",children:"请备份您的助记词"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"请按顺序抄写以下助记词，并妥善保管。"}),e.jsx("div",{className:"grid grid-cols-3 gap-2",children:c.map((i,n)=>e.jsxs("div",{className:"rounded-lg border border-border bg-muted/30 px-3 py-2 text-center",children:[e.jsxs("span",{className:"text-xs text-muted-foreground",children:[n+1,"."]})," ",e.jsx("span",{className:"font-medium",children:i})]},n))}),e.jsx("button",{type:"button",onClick:()=>r("confirm"),className:"w-full rounded-full bg-primary py-3 text-white",children:"我已备份，下一步"})]}):s==="confirm"?e.jsxs("div",{className:"space-y-4",children:[e.jsx("h2",{className:"text-lg font-semibold",children:"验证助记词"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"请按正确顺序点击助记词以验证备份。"}),e.jsx(y,{words:c,onComplete:()=>r("done")})]}):e.jsxs("div",{className:"space-y-4 text-center",children:[e.jsx("div",{className:"rounded-xl bg-green-100 p-6 dark:bg-green-900/30",children:e.jsx("p",{className:"text-lg font-semibold text-green-800 dark:text-green-200",children:"✅ 备份完成！"})}),e.jsx("button",{type:"button",onClick:()=>r("show"),className:"text-sm text-muted-foreground",children:"重新开始"})]})}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    words: words12,
    onComplete: () => console.log('Complete!')
  }
}`,...x.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    words: words24,
    onComplete: () => console.log('Complete!')
  }
}`,...g.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    words: ['apple', 'banana', 'cherry', 'date'],
    onComplete: () => console.log('Complete!')
  }
}`,...b.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [completed, setCompleted] = useState(false);
    const [key, setKey] = useState(0);
    const handleComplete = () => {
      setCompleted(true);
    };
    const handleRestart = () => {
      setCompleted(false);
      setKey(k => k + 1);
    };
    if (completed) {
      return <div className="space-y-4 text-center">
          <div className="rounded-xl bg-green-100 p-6 dark:bg-green-900/30">
            <p className="text-lg font-semibold text-green-800 dark:text-green-200">
              🎉 验证成功！
            </p>
            <p className="mt-2 text-sm text-green-600 dark:text-green-300">助记词已确认备份</p>
          </div>
          <button type="button" onClick={handleRestart} className="rounded-lg bg-primary px-4 py-2 text-white">
            再试一次
          </button>
        </div>;
    }
    return <MnemonicConfirm key={key} words={['apple', 'banana', 'cherry', 'date', 'elder', 'fig']} onComplete={handleComplete} />;
  }
}`,...f.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [step, setStep] = useState<'show' | 'confirm' | 'done'>('show');
    const words = ['ocean', 'wisdom', 'garden', 'silent', 'brave', 'crystal'];
    if (step === 'show') {
      return <div className="space-y-4">
          <h2 className="text-lg font-semibold">请备份您的助记词</h2>
          <p className="text-sm text-muted-foreground">
            请按顺序抄写以下助记词，并妥善保管。
          </p>
          <div className="grid grid-cols-3 gap-2">
            {words.map((word, i) => <div key={i} className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-center">
                <span className="text-xs text-muted-foreground">{i + 1}.</span>{' '}
                <span className="font-medium">{word}</span>
              </div>)}
          </div>
          <button type="button" onClick={() => setStep('confirm')} className="w-full rounded-full bg-primary py-3 text-white">
            我已备份，下一步
          </button>
        </div>;
    }
    if (step === 'confirm') {
      return <div className="space-y-4">
          <h2 className="text-lg font-semibold">验证助记词</h2>
          <p className="text-sm text-muted-foreground">请按正确顺序点击助记词以验证备份。</p>
          <MnemonicConfirm words={words} onComplete={() => setStep('done')} />
        </div>;
    }
    return <div className="space-y-4 text-center">
        <div className="rounded-xl bg-green-100 p-6 dark:bg-green-900/30">
          <p className="text-lg font-semibold text-green-800 dark:text-green-200">
            ✅ 备份完成！
          </p>
        </div>
        <button type="button" onClick={() => setStep('show')} className="text-sm text-muted-foreground">
          重新开始
        </button>
      </div>;
  }
}`,...h.parameters?.docs?.source}}};const P=["Default","Words24","ShortWords","Interactive","InOnboardingFlow"];export{x as Default,h as InOnboardingFlow,f as Interactive,b as ShortWords,g as Words24,P as __namedExportsOrder,J as default};
