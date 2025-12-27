import { useState, useCallback } from 'react'
import type { BioAccount } from '@aspect-aspect/bio-sdk'

type Step = 'connect' | 'input' | 'confirm' | 'pending' | 'success'

const FORGE_ADDRESS = '0x...' // TODO: Replace with actual forge contract address
const ETH_TO_BIO_RATE = 10000 // 1 ETH = 10000 BIO (example)

export default function App() {
  const [step, setStep] = useState<Step>('connect')
  const [ethAccount, setEthAccount] = useState<BioAccount | null>(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const bioAmount = amount ? (parseFloat(amount) * ETH_TO_BIO_RATE).toFixed(2) : '0'

  const handleConnect = useCallback(async () => {
    if (!window.bio) {
      setError('Bio SDK 未初始化')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const account = await window.bio.request<BioAccount>({
        method: 'bio_selectAccount',
        params: [{ chain: 'ethereum' }],
      })
      setEthAccount(account)
      setStep('input')
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!window.bio || !ethAccount || !amount) return

    setStep('confirm')
  }, [ethAccount, amount])

  const handleForge = useCallback(async () => {
    if (!window.bio || !ethAccount || !amount) return

    setLoading(true)
    setError(null)

    try {
      const result = await window.bio.request<{ txHash: string }>({
        method: 'bio_sendTransaction',
        params: [{
          from: ethAccount.address,
          to: FORGE_ADDRESS,
          amount: amount,
          chain: 'ethereum',
        }],
      })

      setTxHash(result.txHash)
      setStep('pending')

      // TODO: Poll backend for forge completion
      setTimeout(() => {
        setStep('success')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '交易失败')
      setStep('input')
    } finally {
      setLoading(false)
    }
  }, [ethAccount, amount])

  const handleReset = useCallback(() => {
    setStep('connect')
    setEthAccount(null)
    setAmount('')
    setError(null)
    setTxHash(null)
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>锻造</h1>
        <p style={styles.subtitle}>将 ETH 转换为 Bio Token</p>

        {error && (
          <div style={styles.error}>{error}</div>
        )}

        {step === 'connect' && (
          <div style={styles.stepContent}>
            <div style={styles.rateInfo}>
              <span>兑换比率</span>
              <span style={styles.rate}>1 ETH = {ETH_TO_BIO_RATE.toLocaleString()} BIO</span>
            </div>
            <button style={styles.button} onClick={handleConnect} disabled={loading}>
              {loading ? '连接中...' : '选择 ETH 钱包'}
            </button>
          </div>
        )}

        {step === 'input' && (
          <div style={styles.stepContent}>
            <div style={styles.accountCard}>
              <span style={styles.label}>ETH 地址</span>
              <span style={styles.address}>{ethAccount?.address}</span>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>支付 ETH</label>
              <input
                type="number"
                style={styles.input}
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.001"
              />
            </div>

            <div style={styles.arrow}>↓</div>

            <div style={styles.outputGroup}>
              <label style={styles.inputLabel}>获得 BIO</label>
              <div style={styles.output}>{bioAmount}</div>
            </div>

            <button
              style={styles.button}
              onClick={handleConfirm}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              下一步
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div style={styles.stepContent}>
            <div style={styles.summary}>
              <div style={styles.summaryRow}>
                <span>支付</span>
                <span>{amount} ETH</span>
              </div>
              <div style={styles.summaryRow}>
                <span>获得</span>
                <span>{bioAmount} BIO</span>
              </div>
              <div style={styles.summaryRow}>
                <span>费率</span>
                <span>1:{ETH_TO_BIO_RATE.toLocaleString()}</span>
              </div>
            </div>
            <button style={styles.button} onClick={handleForge} disabled={loading}>
              {loading ? '处理中...' : '确认锻造'}
            </button>
            <button style={styles.buttonSecondary} onClick={() => setStep('input')}>
              返回修改
            </button>
          </div>
        )}

        {step === 'pending' && (
          <div style={styles.stepContent}>
            <div style={styles.spinner} />
            <p>交易处理中...</p>
            <p style={styles.txHash}>{txHash}</p>
          </div>
        )}

        {step === 'success' && (
          <div style={styles.stepContent}>
            <div style={styles.successIcon}>✓</div>
            <p>锻造成功！</p>
            <p style={styles.successAmount}>+{bioAmount} BIO</p>
            <button style={styles.buttonSecondary} onClick={handleReset}>
              再次锻造
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    background: 'white',
    borderRadius: 16,
    padding: 32,
    maxWidth: 400,
    width: '100%',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
  },
  rateInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: 16,
    background: '#f8f9fa',
    borderRadius: 12,
    width: '100%',
  },
  rate: {
    fontSize: 20,
    fontWeight: 600,
    color: '#f5576c',
  },
  button: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 12,
    padding: '14px 28px',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  buttonSecondary: {
    background: '#f0f0f0',
    color: '#333',
    border: 'none',
    borderRadius: 12,
    padding: '14px 28px',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  accountCard: {
    background: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  label: {
    fontSize: 12,
    color: '#666',
    display: 'block',
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    fontFamily: 'monospace',
    wordBreak: 'break-all',
  },
  inputGroup: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    display: 'block',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: 16,
    fontSize: 24,
    fontWeight: 600,
    border: '2px solid #eee',
    borderRadius: 12,
    outline: 'none',
  },
  arrow: {
    fontSize: 24,
    color: '#f5576c',
  },
  outputGroup: {
    width: '100%',
  },
  output: {
    padding: 16,
    fontSize: 24,
    fontWeight: 600,
    background: '#f8f9fa',
    borderRadius: 12,
    textAlign: 'center',
    color: '#f5576c',
  },
  summary: {
    width: '100%',
    background: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  },
  error: {
    background: '#fee',
    color: '#c00',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
    width: '100%',
  },
  spinner: {
    width: 48,
    height: 48,
    border: '4px solid #f0f0f0',
    borderTopColor: '#f5576c',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  txHash: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    wordBreak: 'break-all',
  },
  successIcon: {
    fontSize: 48,
    color: '#4caf50',
  },
  successAmount: {
    fontSize: 24,
    fontWeight: 600,
    color: '#4caf50',
  },
}
