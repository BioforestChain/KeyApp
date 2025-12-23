#!/usr/bin/env tsx
/**
 * BioForest Chain API 测试脚本
 *
 * 用于验证真实网络功能:
 * - 获取区块高度
 * - 查询账户余额
 * - 查询账户信息（二次签名公钥）
 * - 查询交易历史
 * - 计算手续费
 */

const RPC_URL = 'https://walletapi.bfmeta.info'
const CHAIN_ID = 'bfm'
const TEST_ADDRESS = 'b9gB9NzHKWsDKGYFCaNva6xRnxPwFfGcfx'

async function testGetLastBlock() {
  console.log('\n=== 测试获取最新区块 ===')
  const response = await fetch(`${RPC_URL}/wallet/${CHAIN_ID}/lastblock`)
  if (!response.ok) {
    throw new Error(`Failed: ${response.status}`)
  }
  const json = await response.json() as { success: boolean; result: { height: number; timestamp: number } }
  const data = json.result
  console.log('最新区块高度:', data.height)
  console.log('时间戳:', data.timestamp)
  return data
}

async function testGetBalance() {
  console.log('\n=== 测试查询余额 ===')
  const response = await fetch(`${RPC_URL}/wallet/${CHAIN_ID}/address/balance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: TEST_ADDRESS,
      magic: 'nxOGQ',
      assetType: 'BFM',
    }),
  })
  if (!response.ok) {
    throw new Error(`Failed: ${response.status}`)
  }
  const json = await response.json() as { success: boolean; result: { amount: string } }
  const data = json.result
  console.log(`地址 ${TEST_ADDRESS} 余额:`, data.amount)
  console.log('格式化余额:', (parseFloat(data.amount) / 1e8).toFixed(8), 'BFM')
  return data
}

async function testGetAddressInfo() {
  console.log('\n=== 测试查询地址信息 ===')
  const response = await fetch(`${RPC_URL}/wallet/${CHAIN_ID}/address/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: TEST_ADDRESS }),
  })
  if (!response.ok) {
    console.log('查询失败或地址不存在')
    return null
  }
  const json = await response.json() as { success: boolean; result: { address: string; secondPublicKey?: string } }
  const data = json.result
  console.log('地址信息:', JSON.stringify(data, null, 2))
  if (data?.secondPublicKey) {
    console.log('✅ 该账户已设置支付密码（二次签名）')
  } else {
    console.log('❌ 该账户未设置支付密码')
  }
  return data
}

async function testGetTransactionHistory(maxHeight: number) {
  console.log('\n=== 测试查询交易历史 ===')
  const response = await fetch(`${RPC_URL}/wallet/${CHAIN_ID}/transactions/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      maxHeight,
      address: TEST_ADDRESS,
      page: 1,
      pageSize: 5,
      sort: -1,
    }),
  })
  if (!response.ok) {
    throw new Error(`Failed: ${response.status}`)
  }
  const json = await response.json() as { success: boolean; result: { trs?: Array<{ transaction: { signature: string; type: string; senderId: string; recipientId: string; fee: string; timestamp: number } }> } }
  const data = json.result
  console.log(`找到 ${data.trs?.length ?? 0} 条交易记录`)
  
  if (data.trs && data.trs.length > 0) {
    console.log('\n最近的交易:')
    data.trs.slice(0, 3).forEach((item, i: number) => {
      const tx = item.transaction
      console.log(`\n  [${i + 1}]`)
      console.log(`    类型: ${tx.type}`)
      console.log(`    发送方: ${tx.senderId}`)
      console.log(`    接收方: ${tx.recipientId || '无'}`)
      console.log(`    手续费: ${(parseFloat(tx.fee) / 1e8).toFixed(8)} BFM`)
      console.log(`    交易ID: ${tx.signature.slice(0, 32)}...`)
    })
  }
  return data
}

async function testGetPendingTransactions() {
  console.log('\n=== 测试查询待处理交易 ===')
  const response = await fetch(`${RPC_URL}/wallet/${CHAIN_ID}/pendingTr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      senderId: TEST_ADDRESS,
      sort: -1,
    }),
  })
  if (!response.ok) {
    throw new Error(`Failed: ${response.status}`)
  }
  const json = await response.json() as { success: boolean; result: unknown[] }
  const data = json.result
  console.log(`待处理交易数: ${Array.isArray(data) ? data.length : 0}`)
  return data
}

async function main() {
  console.log('========================================')
  console.log('BioForest Chain API 测试')
  console.log('========================================')
  console.log('RPC URL:', RPC_URL)
  console.log('Chain ID:', CHAIN_ID)
  console.log('测试地址:', TEST_ADDRESS)
  
  try {
    const lastBlock = await testGetLastBlock()
    await testGetBalance()
    await testGetAddressInfo()
    await testGetTransactionHistory(lastBlock.height)
    await testGetPendingTransactions()
    
    console.log('\n========================================')
    console.log('✅ 所有 API 测试通过!')
    console.log('========================================')
  } catch (error) {
    console.error('\n❌ 测试失败:', error)
    process.exit(1)
  }
}

main()
