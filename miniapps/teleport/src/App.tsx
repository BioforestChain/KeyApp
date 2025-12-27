import { useState, useCallback } from 'react'
import type { BioAccount } from '@aspect-aspect/bio-sdk'

type Step = 'connect' | 'select-source' | 'select-target' | 'confirm' | 'success'

export default function App() {
  const [step, setStep] = useState<Step>('connect')
  const [sourceAccount, setSourceAccount] = useState<BioAccount | null>(null)
  const [targetAccount, setTargetAccount] = useState<BioAccount | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = useCallback(async () => {
    if (!window.bio) {
      setError('Bio SDK 未初始化')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const accounts = await window.bio.request<BioAccount[]>({
        method: 'bio_requestAccounts',
      })

      if (accounts.length > 0) {
        setStep('select-source')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSelectSource = useCallback(async () => {
    if (!window.bio) return

    setLoading(true)
    setError(null)

    try {
      const account = await window.bio.request<BioAccount>({
        method: 'bio_selectAccount',
        params: [{ chain: 'bioforest' }],
      })
      setSourceAccount(account)
      setStep('select-target')
    } catch (err) {
      setError(err instanceof Error ? err.message : '选择失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSelectTarget = useCallback(async () => {
    if (!window.bio || !sourceAccount) return

    setLoading(true)
    setError(null)

    try {
      const account = await window.bio.request<BioAccount>({
        method: 'bio_pickWallet',
        params: [{ chain: 'bioforest', exclude: sourceAccount.address }],
      })
      setTargetAccount(account)
      setStep('confirm')
    } catch (err) {
      setError(err instanceof Error ? err.message : '选择失败')
    } finally {
      setLoading(false)
    }
  }, [sourceAccount])

  const handleConfirm = useCallback(async () => {
    if (!window.bio || !sourceAccount) return

    setLoading(true)
    setError(null)

    try {
      // Sign authentication message
      await window.bio.request<string>({
        method: 'bio_signMessage',
        params: [{
          message: `Authorize asset transfer from ${sourceAccount.address} to ${targetAccount?.address}`,
          address: sourceAccount.address,
        }],
      })

      // TODO: Call backend API to execute transfer
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '签名失败')
    } finally {
      setLoading(false)
    }
  }, [sourceAccount, targetAccount])

  const handleReset = useCallback(() => {
    setStep('connect')
    setSourceAccount(null)
    setTargetAccount(null)
    setError(null)
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>一键传送</h1>
        <p style={styles.subtitle}>将资产从一个钱包转移到另一个钱包</p>

        {error && (
          <div style={styles.error}>{error}</div>
        )}

        {step === 'connect' && (
          <div style={styles.stepContent}>
            <p>连接钱包以开始传送</p>
            <button style={styles.button} onClick={handleConnect} disabled={loading}>
              {loading ? '连接中...' : '连接钱包'}
            </button>
          </div>
        )}

        {step === 'select-source' && (
          <div style={styles.stepContent}>
            <p>选择源地址（资产转出方）</p>
            <button style={styles.button} onClick={handleSelectSource} disabled={loading}>
              {loading ? '选择中...' : '选择源地址'}
            </button>
          </div>
        )}

        {step === 'select-target' && (
          <div style={styles.stepContent}>
            <div style={styles.accountCard}>
              <span style={styles.label}>源地址</span>
              <span style={styles.address}>{sourceAccount?.address}</span>
            </div>
            <p>选择目标地址（资产接收方）</p>
            <button style={styles.button} onClick={handleSelectTarget} disabled={loading}>
              {loading ? '选择中...' : '选择目标地址'}
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div style={styles.stepContent}>
            <div style={styles.accountCard}>
              <span style={styles.label}>从</span>
              <span style={styles.address}>{sourceAccount?.address}</span>
            </div>
            <div style={styles.arrow}>↓</div>
            <div style={styles.accountCard}>
              <span style={styles.label}>到</span>
              <span style={styles.address}>{targetAccount?.address}</span>
            </div>
            <button style={styles.button} onClick={handleConfirm} disabled={loading}>
              {loading ? '签名中...' : '确认传送'}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div style={styles.stepContent}>
            <div style={styles.successIcon}>✓</div>
            <p>传送请求已提交！</p>
            <button style={styles.buttonSecondary} onClick={handleReset}>
              再次传送
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
  button: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
  arrow: {
    fontSize: 24,
    color: '#667eea',
  },
  error: {
    background: '#fee',
    color: '#c00',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  successIcon: {
    fontSize: 48,
    color: '#4caf50',
    marginBottom: 16,
  },
}
