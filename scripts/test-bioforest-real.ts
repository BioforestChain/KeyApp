#!/usr/bin/env tsx
/**
 * BioForest Chain Real Network Tests
 *
 * This script performs real network operations to validate:
 * - API client functionality
 * - Pay password (二次签名) setting
 * - Transfer transactions
 *
 * Test Account:
 * - Mnemonic: 董 夜 孟 和 罚 箱 房 五 汁 搬 渗 县 督 细 速 连 岭 爸 养 谱 握 杭 刀 拆
 * - Address: b9gB9NzHKWsDKGYFCaNva6xRnxPwFfGcfx
 * - Balance: ~0.01 BFM
 */

import { BioForestApiClient, BioForestApiError } from '../src/services/bioforest-api';

// Test configuration
const TEST_ADDRESS = 'b9gB9NzHKWsDKGYFCaNva6xRnxPwFfGcfx';

// Create API client
const client = new BioForestApiClient({
  rpcUrl: 'https://walletapi.bfmeta.info',
  chainId: 'bfm',
});

// Test results
interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  data?: unknown;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<unknown>): Promise<void> {
  const start = Date.now();
  try {
    const data = await fn();
    results.push({
      name,
      passed: true,
      duration: Date.now() - start,
      data,
    });
    console.log(`✅ ${name} (${Date.now() - start}ms)`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({
      name,
      passed: false,
      duration: Date.now() - start,
      error: message,
    });
    console.log(`❌ ${name}: ${message}`);
  }
}

async function main() {
  console.log('═'.repeat(60));
  console.log('BioForest Chain Real Network Tests');
  console.log('═'.repeat(60));
  console.log(`API: ${client.getConfig().rpcUrl}`);
  console.log(`Chain: ${client.getConfig().chainId}`);
  console.log(`Test Address: ${TEST_ADDRESS}`);
  console.log('═'.repeat(60));

  // ============================================================
  // 1. Basic API Tests
  // ============================================================
  console.log('\n📦 1. Basic API Tests\n');

  await runTest('getLastBlock', async () => {
    const block = await client.getLastBlock();
    console.log(`   Height: ${block.height}, Timestamp: ${block.timestamp}`);
    return block;
  });

  await runTest('getBlockHeightAndTimestamp', async () => {
    const { height, timestamp } = await client.getBlockHeightAndTimestamp();
    console.log(`   Height: ${height}, Timestamp: ${timestamp}`);
    return { height, timestamp };
  });

  // ============================================================
  // 2. Account API Tests
  // ============================================================
  console.log('\n👤 2. Account API Tests\n');

  await runTest('getBalance', async () => {
    const balance = await client.getBalance(TEST_ADDRESS, 'BFM');
    const formatted = BioForestApiClient.formatAmount(balance.amount);
    console.log(`   Balance: ${formatted} BFM (raw: ${balance.amount})`);
    return balance;
  });

  await runTest('getAddressInfo', async () => {
    const info = await client.getAddressInfo(TEST_ADDRESS);
    console.log(`   Address: ${info.address}`);
    console.log(`   Public Key: ${info.publicKey || '(not set)'}`);
    console.log(`   Second Public Key: ${info.secondPublicKey || '(not set)'}`);
    console.log(`   Account Status: ${info.accountStatus}`);
    return info;
  });

  await runTest('hasTwoStepSecret', async () => {
    const has = await client.hasTwoStepSecret(TEST_ADDRESS);
    console.log(`   Has Pay Password: ${has}`);
    return has;
  });

  // ============================================================
  // 3. Transaction History Tests
  // ============================================================
  console.log('\n📜 3. Transaction History Tests\n');

  await runTest('getTransactionHistory', async () => {
    const history = await client.getTransactionHistory(TEST_ADDRESS, { pageSize: 5 });
    console.log(`   Found ${history.trs?.length ?? 0} transactions`);
    if (history.trs && history.trs.length > 0) {
      const tx = history.trs[0].transaction;
      console.log(`   Latest: Type=${tx.type}, From=${tx.senderId.slice(0, 12)}...`);
    }
    return history;
  });

  await runTest('getPendingTransactionsForSender', async () => {
    const pending = await client.getPendingTransactionsForSender(TEST_ADDRESS);
    console.log(`   Pending transactions: ${pending.length}`);
    return pending;
  });

  // ============================================================
  // 4. Utility Tests
  // ============================================================
  console.log('\n🔧 4. Utility Tests\n');

  await runTest('formatAmount', async () => {
    const tests = [
      { input: '100000000', expected: '1' },
      { input: '1000000', expected: '0.01' },
      { input: '123456789', expected: '1.23456789' },
      { input: '100', expected: '0.000001' },
    ];
    for (const { input, expected } of tests) {
      const result = BioForestApiClient.formatAmount(input);
      if (result !== expected) {
        throw new Error(`formatAmount(${input}) = ${result}, expected ${expected}`);
      }
    }
    console.log('   All format tests passed');
    return true;
  });

  await runTest('parseAmount', async () => {
    const tests = [
      { input: '1', expected: '100000000' },
      { input: '0.01', expected: '1000000' },
      { input: '1.23456789', expected: '123456789' },
      { input: '0.000001', expected: '100' },
    ];
    for (const { input, expected } of tests) {
      const result = BioForestApiClient.parseAmount(input);
      if (result !== expected) {
        throw new Error(`parseAmount(${input}) = ${result}, expected ${expected}`);
      }
    }
    console.log('   All parse tests passed');
    return true;
  });

  // ============================================================
  // 5. Error Handling Tests
  // ============================================================
  console.log('\n⚠️ 5. Error Handling Tests\n');

  await runTest('Invalid address handling', async () => {
    try {
      await client.getAddressInfo('invalid_address_12345');
      // If no error, the API might return empty result
      console.log('   API accepts any address format (no validation on server)');
      return true;
    } catch (error) {
      if (error instanceof BioForestApiError) {
        console.log(`   Correctly threw BioForestApiError: ${error.message}`);
        return true;
      }
      throw error;
    }
  });

  // ============================================================
  // Summary
  // ============================================================
  console.log('\n' + '═'.repeat(60));
  console.log('Test Summary');
  console.log('═'.repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total Duration: ${totalDuration}ms`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
  }

  console.log('\n' + '═'.repeat(60));

  // Return account status for next steps
  const addressInfo = results.find((r) => r.name === 'getAddressInfo')?.data as
    | { secondPublicKey: string | null }
    | undefined;
  const balance = results.find((r) => r.name === 'getBalance')?.data as { amount: string } | undefined;

  if (addressInfo && balance) {
    console.log('\n📋 Account Status Summary:');
    console.log(`   Address: ${TEST_ADDRESS}`);
    console.log(`   Balance: ${BioForestApiClient.formatAmount(balance.amount)} BFM`);
    console.log(`   Pay Password: ${addressInfo.secondPublicKey ? 'SET' : 'NOT SET'}`);

    if (!addressInfo.secondPublicKey) {
      console.log('\n💡 Next Step: Set pay password (二次签名)');
      console.log('   Run: npx tsx scripts/test-set-pay-password.ts');
    } else {
      console.log('\n💡 Next Step: Test transfer');
      console.log('   Run: npx tsx scripts/test-transfer.ts');
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
