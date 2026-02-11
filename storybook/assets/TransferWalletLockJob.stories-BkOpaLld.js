import{r as n,j as e}from"./iframe-D_wumixU.js";import{T as a}from"./tx-status-display--mokbPxu.js";import{P as b}from"./pattern-lock-CznuJFmL.js";import{P as f}from"./password-input-B7f2BtG_.js";import{c as g}from"./utils-4perknFd.js";import{I as y}from"./IconAlertCircle-CgrmZ3YY.js";import{I as v}from"./IconLock-Ba3v9Gai.js";import{I as h}from"./IconRefresh-C4_CpCCj.js";import"./preload-helper-PPVm8Dsz.js";import"./useTranslation-BUN0bWmz.js";import"./index-DJ7mgCHa.js";import"./IconCheck-D_havJbe.js";import"./createReactComponent-DTmO_ECI.js";import"./IconLoader2-CZF_M5-_.js";import"./IconEyeOff-DUP9JsTv.js";import"./IconEye-C0njIer0.js";const L={title:"Sheets/TransferWalletLockJob",parameters:{layout:"centered"}},c={render:()=>{const[s,t]=n.useState([]),[o,r]=n.useState(!1);return e.jsxs("div",{className:"bg-background w-[375px] rounded-2xl shadow-xl",children:[e.jsx("div",{className:"flex justify-center py-3",children:e.jsx("div",{className:"bg-muted h-1 w-10 rounded-full"})}),e.jsxs("div",{className:"px-4 pb-4",children:[e.jsx("h2",{className:"mb-4 text-center text-lg font-semibold",children:"验证钱包锁"}),e.jsx(b,{value:s,onChange:t,onComplete:d=>{d.length<4?(r(!0),t([])):r(!1)},minPoints:4,error:o}),o&&e.jsxs("div",{className:"text-destructive mt-3 flex items-center justify-center gap-1.5 text-sm",children:[e.jsx(y,{className:"size-4"}),e.jsx("span",{children:"图案错误，请重试"})]}),e.jsx("button",{type:"button",className:"text-muted-foreground hover:text-foreground mt-4 w-full py-2 text-center text-sm",children:"取消"})]})]})}},l={render:()=>{const[s,t]=n.useState(""),[o,r]=n.useState(null);return e.jsxs("div",{className:"bg-background w-[375px] rounded-2xl shadow-xl",children:[e.jsx("div",{className:"flex justify-center py-3",children:e.jsx("div",{className:"bg-muted h-1 w-10 rounded-full"})}),e.jsxs("div",{className:"space-y-6 p-4",children:[e.jsx("h2",{className:"text-center text-lg font-semibold",children:"需要安全密码"}),e.jsxs("div",{className:"text-primary flex items-center justify-center gap-2",children:[e.jsx(v,{className:"size-5"}),e.jsx("span",{className:"text-sm",children:"该地址已设置安全密码，请输入安全密码确认转账。"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(f,{value:s,onChange:d=>{t(d.target.value),r(null)},placeholder:"输入安全密码"}),o&&e.jsxs("div",{className:"text-destructive flex items-center gap-1.5 text-sm",children:[e.jsx(y,{className:"size-4"}),e.jsx("span",{children:o})]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx("button",{type:"button",disabled:!s.trim(),onClick:()=>r("安全密码错误"),className:g("text-primary-foreground w-full rounded-full py-3 font-medium transition-colors","bg-primary hover:bg-primary/90","disabled:cursor-not-allowed disabled:opacity-50"),children:"确认"}),e.jsx("button",{type:"button",className:"text-muted-foreground hover:text-foreground w-full py-2 text-center text-sm",children:"取消"})]})]})]})}},i={render:()=>e.jsxs("div",{className:"bg-background w-[375px] rounded-2xl shadow-xl",children:[e.jsx("div",{className:"flex justify-center py-3",children:e.jsx("div",{className:"bg-muted h-1 w-10 rounded-full"})}),e.jsx(a,{status:"broadcasting",title:{broadcasting:"广播中..."},description:{broadcasting:"正在将交易广播到网络..."}})]})},u={render:()=>e.jsxs("div",{className:"bg-background w-[375px] rounded-2xl shadow-xl",children:[e.jsx("div",{className:"flex justify-center py-3",children:e.jsx("div",{className:"bg-muted h-1 w-10 rounded-full"})}),e.jsx(a,{status:"broadcasted",txHash:"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",title:{broadcasted:"广播成功"},description:{broadcasted:"交易已广播，等待区块确认..."}}),e.jsx("div",{className:"px-4 pb-4",children:e.jsx("button",{type:"button",className:"text-muted-foreground hover:text-foreground w-full py-2 text-center text-sm",children:"关闭"})})]})},m={render:()=>{const[s,t]=n.useState(!1);return e.jsxs("div",{className:"bg-background w-[375px] rounded-2xl shadow-xl",children:[e.jsx("div",{className:"flex justify-center py-3",children:e.jsx("div",{className:"bg-muted h-1 w-10 rounded-full"})}),e.jsx(a,{status:"failed",title:{failed:"广播失败"},description:{failed:"资产余额不足"}}),e.jsxs("div",{className:"space-y-2 px-4 pb-4",children:[e.jsxs("button",{type:"button",onClick:()=>{t(!0),setTimeout(()=>t(!1),2e3)},disabled:s,className:g("flex w-full items-center justify-center gap-2 rounded-full py-3 font-medium transition-colors","bg-primary text-primary-foreground hover:bg-primary/90","disabled:cursor-not-allowed disabled:opacity-50"),children:[e.jsx(h,{className:"size-4"}),s?"重试中...":"重试"]}),e.jsx("button",{type:"button",className:"text-muted-foreground hover:text-foreground w-full py-2 text-center text-sm",children:"关闭"})]})]})}},p={render:()=>{const[s]=n.useState(5);return e.jsxs("div",{className:"bg-background w-93.75 rounded-2xl shadow-xl",children:[e.jsx("div",{className:"flex justify-center py-3",children:e.jsx("div",{className:"bg-muted h-1 w-10 rounded-full"})}),e.jsx(a,{status:"confirmed",txHash:"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",title:{confirmed:"转账成功"},description:{confirmed:`${s}秒后自动关闭`}}),e.jsx("div",{className:"px-4 pb-4",children:e.jsxs("button",{type:"button",className:"text-muted-foreground hover:text-foreground w-full py-2 text-center text-sm",children:["关闭 (",s,"s)"]})})]})}},x={render:()=>{const[s,t]=n.useState("wallet_lock"),[o,r]=n.useState([]),d=()=>{switch(s){case"wallet_lock":return e.jsxs("div",{className:"p-4",children:[e.jsx("h2",{className:"mb-4 text-center text-lg font-semibold",children:"验证钱包锁"}),e.jsx(b,{value:o,onChange:r,onComplete:()=>t("broadcasting"),minPoints:4}),e.jsx("button",{type:"button",onClick:()=>t("two_step"),className:"text-primary mt-4 w-full py-2 text-center text-sm",children:"模拟需要安全密码 →"})]});case"two_step":return e.jsxs("div",{className:"space-y-4 p-4",children:[e.jsx("h2",{className:"text-center text-lg font-semibold",children:"需要安全密码"}),e.jsx(f,{placeholder:"输入安全密码"}),e.jsx("button",{type:"button",onClick:()=>t("broadcasting"),className:"bg-primary text-primary-foreground w-full rounded-full py-3 font-medium",children:"确认"})]});case"broadcasting":return setTimeout(()=>t("broadcasted"),1500),e.jsx(a,{status:"broadcasting",title:{broadcasting:"广播中..."},description:{broadcasting:"正在将交易广播到网络..."}});case"broadcasted":return e.jsxs(e.Fragment,{children:[e.jsx(a,{status:"broadcasted",txHash:"0x1234...abcd",title:{broadcasted:"广播成功"},description:{broadcasted:"交易已广播，等待区块确认..."}}),e.jsxs("div",{className:"space-y-2 px-4 pb-4",children:[e.jsx("button",{type:"button",onClick:()=>t("confirmed"),className:"w-full rounded-full bg-green-500 py-2 text-sm text-white",children:"模拟上链成功"}),e.jsx("button",{type:"button",onClick:()=>t("failed"),className:"w-full rounded-full bg-red-500 py-2 text-sm text-white",children:"模拟广播失败"})]})]});case"confirmed":return e.jsxs(e.Fragment,{children:[e.jsx(a,{status:"confirmed",txHash:"0x1234...abcd",title:{confirmed:"转账成功"},description:{confirmed:"交易已成功上链"}}),e.jsx("div",{className:"px-4 pb-4",children:e.jsx("button",{type:"button",onClick:()=>{t("wallet_lock"),r([])},className:"text-muted-foreground w-full py-2 text-center text-sm",children:"重新开始"})})]});case"failed":return e.jsxs(e.Fragment,{children:[e.jsx(a,{status:"failed",title:{failed:"广播失败"},description:{failed:"资产余额不足"}}),e.jsxs("div",{className:"space-y-2 px-4 pb-4",children:[e.jsxs("button",{type:"button",onClick:()=>t("broadcasting"),className:"bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 rounded-full py-3 font-medium",children:[e.jsx(h,{className:"size-4"}),"重试"]}),e.jsx("button",{type:"button",onClick:()=>{t("wallet_lock"),r([])},className:"text-muted-foreground w-full py-2 text-center text-sm",children:"关闭"})]})]})}};return e.jsxs("div",{className:"bg-background w-[375px] rounded-2xl shadow-xl",children:[e.jsx("div",{className:"flex justify-center py-3",children:e.jsx("div",{className:"bg-muted h-1 w-10 rounded-full"})}),d()]})}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [pattern, setPattern] = useState<number[]>([]);
    const [error, setError] = useState(false);
    return <div className="bg-background w-[375px] rounded-2xl shadow-xl">
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>
        <div className="px-4 pb-4">
          <h2 className="mb-4 text-center text-lg font-semibold">验证钱包锁</h2>
          <PatternLock value={pattern} onChange={setPattern} onComplete={nodes => {
          if (nodes.length < 4) {
            setError(true);
            setPattern([]);
          } else {
            setError(false);
          }
        }} minPoints={4} error={error} />
          {error && <div className="text-destructive mt-3 flex items-center justify-center gap-1.5 text-sm">
              <IconAlertCircle className="size-4" />
              <span>图案错误，请重试</span>
            </div>}
          <button type="button" className="text-muted-foreground hover:text-foreground mt-4 w-full py-2 text-center text-sm">
            取消
          </button>
        </div>
      </div>;
  }
}`,...c.parameters?.docs?.source},description:{story:"钱包锁验证步骤",...c.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [secret, setSecret] = useState('');
    const [error, setError] = useState<string | null>(null);
    return <div className="bg-background w-[375px] rounded-2xl shadow-xl">
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>
        <div className="space-y-6 p-4">
          <h2 className="text-center text-lg font-semibold">需要安全密码</h2>

          <div className="text-primary flex items-center justify-center gap-2">
            <IconLock className="size-5" />
            <span className="text-sm">该地址已设置安全密码，请输入安全密码确认转账。</span>
          </div>

          <div className="space-y-2">
            <PasswordInput value={secret} onChange={e => {
            setSecret(e.target.value);
            setError(null);
          }} placeholder="输入安全密码" />
            {error && <div className="text-destructive flex items-center gap-1.5 text-sm">
                <IconAlertCircle className="size-4" />
                <span>{error}</span>
              </div>}
          </div>

          <div className="space-y-3">
            <button type="button" disabled={!secret.trim()} onClick={() => setError('安全密码错误')} className={cn('text-primary-foreground w-full rounded-full py-3 font-medium transition-colors', 'bg-primary hover:bg-primary/90', 'disabled:cursor-not-allowed disabled:opacity-50')}>
              确认
            </button>

            <button type="button" className="text-muted-foreground hover:text-foreground w-full py-2 text-center text-sm">
              取消
            </button>
          </div>
        </div>
      </div>;
  }
}`,...l.parameters?.docs?.source},description:{story:"二次签名验证步骤",...l.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => {
    return <div className="bg-background w-[375px] rounded-2xl shadow-xl">
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>
        <TxStatusDisplay status="broadcasting" title={{
        broadcasting: '广播中...'
      }} description={{
        broadcasting: '正在将交易广播到网络...'
      }} />
      </div>;
  }
}`,...i.parameters?.docs?.source},description:{story:"广播中状态",...i.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => {
    return <div className="bg-background w-[375px] rounded-2xl shadow-xl">
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>
        <TxStatusDisplay status="broadcasted" txHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" title={{
        broadcasted: '广播成功'
      }} description={{
        broadcasted: '交易已广播，等待区块确认...'
      }} />
        <div className="px-4 pb-4">
          <button type="button" className="text-muted-foreground hover:text-foreground w-full py-2 text-center text-sm">
            关闭
          </button>
        </div>
      </div>;
  }
}`,...u.parameters?.docs?.source},description:{story:"广播成功，等待上链",...u.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isRetrying, setIsRetrying] = useState(false);
    return <div className="bg-background w-[375px] rounded-2xl shadow-xl">
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>
        <TxStatusDisplay status="failed" title={{
        failed: '广播失败'
      }} description={{
        failed: '资产余额不足'
      }} />
        <div className="space-y-2 px-4 pb-4">
          <button type="button" onClick={() => {
          setIsRetrying(true);
          setTimeout(() => setIsRetrying(false), 2000);
        }} disabled={isRetrying} className={cn('flex w-full items-center justify-center gap-2 rounded-full py-3 font-medium transition-colors', 'bg-primary text-primary-foreground hover:bg-primary/90', 'disabled:cursor-not-allowed disabled:opacity-50')}>
            <IconRefresh className="size-4" />
            {isRetrying ? '重试中...' : '重试'}
          </button>
          <button type="button" className="text-muted-foreground hover:text-foreground w-full py-2 text-center text-sm">
            关闭
          </button>
        </div>
      </div>;
  }
}`,...m.parameters?.docs?.source},description:{story:"广播失败状态",...m.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [countdown] = useState(5);
    return <div className="bg-background w-93.75 rounded-2xl shadow-xl">
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>
        <TxStatusDisplay status="confirmed" txHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" title={{
        confirmed: '转账成功'
      }} description={{
        confirmed: \`\${countdown}秒后自动关闭\`
      }} />
        <div className="px-4 pb-4">
          <button type="button" className="text-muted-foreground hover:text-foreground w-full py-2 text-center text-sm">
            关闭 ({countdown}s)
          </button>
        </div>
      </div>;
  }
}`,...p.parameters?.docs?.source},description:{story:"交易已确认（上链成功）",...p.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    type Step = 'wallet_lock' | 'two_step' | 'broadcasting' | 'broadcasted' | 'confirmed' | 'failed';
    const [step, setStep] = useState<Step>('wallet_lock');
    const [pattern, setPattern] = useState<number[]>([]);
    const renderContent = () => {
      switch (step) {
        case 'wallet_lock':
          return <div className="p-4">
              <h2 className="mb-4 text-center text-lg font-semibold">验证钱包锁</h2>
              <PatternLock value={pattern} onChange={setPattern} onComplete={() => setStep('broadcasting')} minPoints={4} />
              <button type="button" onClick={() => setStep('two_step')} className="text-primary mt-4 w-full py-2 text-center text-sm">
                模拟需要安全密码 →
              </button>
            </div>;
        case 'two_step':
          return <div className="space-y-4 p-4">
              <h2 className="text-center text-lg font-semibold">需要安全密码</h2>
              <PasswordInput placeholder="输入安全密码" />
              <button type="button" onClick={() => setStep('broadcasting')} className="bg-primary text-primary-foreground w-full rounded-full py-3 font-medium">
                确认
              </button>
            </div>;
        case 'broadcasting':
          setTimeout(() => setStep('broadcasted'), 1500);
          return <TxStatusDisplay status="broadcasting" title={{
            broadcasting: '广播中...'
          }} description={{
            broadcasting: '正在将交易广播到网络...'
          }} />;
        case 'broadcasted':
          return <>
              <TxStatusDisplay status="broadcasted" txHash="0x1234...abcd" title={{
              broadcasted: '广播成功'
            }} description={{
              broadcasted: '交易已广播，等待区块确认...'
            }} />
              <div className="space-y-2 px-4 pb-4">
                <button type="button" onClick={() => setStep('confirmed')} className="w-full rounded-full bg-green-500 py-2 text-sm text-white">
                  模拟上链成功
                </button>
                <button type="button" onClick={() => setStep('failed')} className="w-full rounded-full bg-red-500 py-2 text-sm text-white">
                  模拟广播失败
                </button>
              </div>
            </>;
        case 'confirmed':
          return <>
              <TxStatusDisplay status="confirmed" txHash="0x1234...abcd" title={{
              confirmed: '转账成功'
            }} description={{
              confirmed: '交易已成功上链'
            }} />
              <div className="px-4 pb-4">
                <button type="button" onClick={() => {
                setStep('wallet_lock');
                setPattern([]);
              }} className="text-muted-foreground w-full py-2 text-center text-sm">
                  重新开始
                </button>
              </div>
            </>;
        case 'failed':
          return <>
              <TxStatusDisplay status="failed" title={{
              failed: '广播失败'
            }} description={{
              failed: '资产余额不足'
            }} />
              <div className="space-y-2 px-4 pb-4">
                <button type="button" onClick={() => setStep('broadcasting')} className="bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 rounded-full py-3 font-medium">
                  <IconRefresh className="size-4" />
                  重试
                </button>
                <button type="button" onClick={() => {
                setStep('wallet_lock');
                setPattern([]);
              }} className="text-muted-foreground w-full py-2 text-center text-sm">
                  关闭
                </button>
              </div>
            </>;
      }
    };
    return <div className="bg-background w-[375px] rounded-2xl shadow-xl">
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>
        {renderContent()}
      </div>;
  }
}`,...x.parameters?.docs?.source},description:{story:"完整流程演示",...x.parameters?.docs?.description}}};const B=["WalletLockStep","TwoStepSecretStep","BroadcastingState","BroadcastedState","FailedState","ConfirmedState","FullFlow"];export{u as BroadcastedState,i as BroadcastingState,p as ConfirmedState,m as FailedState,x as FullFlow,l as TwoStepSecretStep,c as WalletLockStep,B as __namedExportsOrder,L as default};
