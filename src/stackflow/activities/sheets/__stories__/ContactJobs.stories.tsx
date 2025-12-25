import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { parseQRContent, generateContactQRContent, type ParsedContact } from '@/lib/qr-parser'

const meta: Meta = {
  title: 'Sheets/ContactJobs',
  parameters: {
    layout: 'centered',
  },
}

export default meta

/** 联系人协议解析测试 */
export const ContactProtocolDemo: StoryObj = {
  render: () => {
    const [name, setName] = useState('张三')
    const [ethAddress, setEthAddress] = useState('0x742d35Cc6634C0532925a3b844Bc9e7595f12345')
    const [btcAddress, setBtcAddress] = useState('')
    const [memo, setMemo] = useState('好友')
    
    const addresses = [
      ethAddress && { chainType: 'ethereum' as const, address: ethAddress },
      btcAddress && { chainType: 'bitcoin' as const, address: btcAddress },
    ].filter(Boolean) as { chainType: 'ethereum' | 'bitcoin' | 'tron'; address: string }[]
    
    const qrContent = generateContactQRContent({
      name,
      addresses,
      memo: memo || undefined,
    })
    
    const parsed = parseQRContent(qrContent)
    
    return (
      <div className="w-[500px] space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">联系人协议测试</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">备注</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">ETH 地址</label>
          <input
            type="text"
            value={ethAddress}
            onChange={(e) => setEthAddress(e.target.value)}
            className="w-full rounded border px-3 py-2 font-mono text-sm"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">BTC 地址 (可选)</label>
          <input
            type="text"
            value={btcAddress}
            onChange={(e) => setBtcAddress(e.target.value)}
            className="w-full rounded border px-3 py-2 font-mono text-sm"
            placeholder="bc1..."
          />
        </div>
        
        <div className="flex justify-center rounded-lg bg-white p-4">
          <QRCodeSVG value={qrContent} size={180} level="M" />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">生成的二维码内容</label>
          <pre className="rounded bg-gray-100 p-3 text-xs overflow-auto max-h-32">
            {JSON.stringify(JSON.parse(qrContent), null, 2)}
          </pre>
        </div>
        
        <div className={`rounded p-3 ${parsed.type === 'contact' ? 'bg-green-100' : 'bg-red-100'}`}>
          {parsed.type === 'contact' ? (
            <div>
              <p className="font-medium text-green-800">✓ 解析为联系人</p>
              <p className="text-sm text-green-700">名称: {parsed.name}</p>
              <p className="text-sm text-green-700">地址数: {parsed.addresses.length}</p>
            </div>
          ) : (
            <p className="font-medium text-red-800">✗ 解析失败: {parsed.type}</p>
          )}
        </div>
      </div>
    )
  },
}

/** 添加联系人确认 UI 预览 */
export const ContactAddConfirmPreview: StoryObj = {
  render: () => {
    const [name, setName] = useState('张三')
    const [memo, setMemo] = useState('')
    const [saved, setSaved] = useState(false)
    
    const addresses = [
      { chainType: 'ethereum', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f12345' },
      { chainType: 'bitcoin', address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq' },
    ]
    
    const chainNames: Record<string, string> = {
      ethereum: 'Ethereum',
      bitcoin: 'Bitcoin',
      tron: 'Tron',
    }
    
    return (
      <div className="w-[375px] rounded-t-2xl bg-background pb-6">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>
        
        {/* Title */}
        <div className="border-b px-4 pb-4">
          <h2 className="text-center text-lg font-semibold">添加联系人</h2>
        </div>
        
        {/* Content */}
        <div className="space-y-4 p-4">
          {/* Avatar & Name */}
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <svg className="size-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入联系人名称"
              className="flex-1 rounded-lg border px-3 py-2"
            />
          </div>
          
          {/* Addresses */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">地址</label>
            <div className="space-y-2">
              {addresses.map((addr, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <svg className="size-5 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground">
                      {chainNames[addr.chainType] || addr.chainType}
                    </div>
                    <div className="truncate font-mono text-sm">{addr.address}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Memo */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">备注</label>
            <input
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="添加备注（可选）"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 p-4">
          <button className="flex-1 rounded-lg border py-2.5 font-medium">
            取消
          </button>
          <button 
            onClick={() => setSaved(true)}
            className={`flex-1 rounded-lg py-2.5 font-medium text-white ${
              saved ? 'bg-green-500' : 'bg-primary'
            }`}
          >
            {saved ? '✓ 已保存' : '保存'}
          </button>
        </div>
      </div>
    )
  },
}

/** 分享名片 UI 预览 */
export const ContactSharePreview: StoryObj = {
  render: () => {
    const contact = {
      name: '张三',
      addresses: [
        { chainType: 'ethereum' as const, address: '0x742d35Cc6634C0532925a3b844Bc9e7595f12345' },
      ],
      memo: '好友',
    }
    
    const qrContent = generateContactQRContent(contact)
    
    return (
      <div className="w-[375px] rounded-t-2xl bg-background pb-6">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 pb-4">
          <button className="rounded-full p-2 hover:bg-muted">
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold">分享名片</h2>
          <div className="w-10" />
        </div>
        
        {/* Content */}
        <div className="flex flex-col items-center p-6">
          {/* Contact Info */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <svg className="size-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">{contact.name}</h3>
              <p className="text-sm text-muted-foreground">ETH</p>
            </div>
          </div>
          
          {/* QR Code */}
          <div className="rounded-2xl bg-white p-4">
            <QRCodeSVG value={qrContent} size={200} level="M" includeMargin />
          </div>
          
          {/* Hint */}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            扫码添加联系人
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 p-4">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 font-medium">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            下载
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-medium text-white">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            分享
          </button>
        </div>
      </div>
    )
  },
}

/** 边界条件测试 */
export const EdgeCases: StoryObj = {
  render: () => {
    const testCases = [
      {
        name: '正常联系人',
        content: '{"type":"contact","name":"张三","addresses":[{"chainType":"ethereum","address":"0x742d35Cc6634C0532925a3b844Bc9e7595f12345"}]}',
      },
      {
        name: '多地址联系人',
        content: '{"type":"contact","name":"李四","addresses":[{"chainType":"ethereum","address":"0x742d35Cc6634C0532925a3b844Bc9e7595f12345"},{"chainType":"bitcoin","address":"bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"}]}',
      },
      {
        name: '带备注和头像',
        content: '{"type":"contact","name":"王五","addresses":[{"chainType":"tron","address":"TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW"}],"memo":"老板","avatar":"👨‍💼"}',
      },
      {
        name: 'URI 格式',
        content: 'contact://张三?eth=0x742d35Cc6634C0532925a3b844Bc9e7595f12345&memo=好友',
      },
      {
        name: '空名称 (无效)',
        content: '{"type":"contact","name":"","addresses":[{"chainType":"ethereum","address":"0x742d35Cc6634C0532925a3b844Bc9e7595f12345"}]}',
      },
      {
        name: '空地址列表 (无效)',
        content: '{"type":"contact","name":"测试","addresses":[]}',
      },
      {
        name: '非联系人 JSON',
        content: '{"type":"other","data":"test"}',
      },
      {
        name: '普通地址',
        content: '0x742d35Cc6634C0532925a3b844Bc9e7595f12345',
      },
    ]
    
    return (
      <div className="w-[600px] space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">边界条件测试</h2>
        
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">用例</th>
              <th className="py-2 text-left">解析类型</th>
              <th className="py-2 text-left">结果</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((tc) => {
              const parsed = parseQRContent(tc.content)
              const isContact = parsed.type === 'contact'
              const contactParsed = parsed as ParsedContact
              
              return (
                <tr key={tc.name} className="border-b">
                  <td className="py-2 font-medium">{tc.name}</td>
                  <td className="py-2">
                    <span className={`rounded px-2 py-0.5 text-xs ${
                      isContact ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {parsed.type}
                    </span>
                  </td>
                  <td className="py-2 text-xs">
                    {isContact ? (
                      <span>{contactParsed.name} ({contactParsed.addresses.length} 地址)</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  },
}
