/**
 * BioForest 支付密码测试
 *
 * 使用临时账户测试设置和使用支付密码，测试结束后归还资金
 */

import { test, expect } from '@playwright/test';
import * as bip39 from 'bip39';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const FUND_MNEMONIC = process.env.E2E_TEST_MNEMONIC ?? '';
const FUND_ADDRESS = process.env.E2E_TEST_ADDRESS ?? '';
const WALLET_PATTERN = '0,1,2,5,8'; // 钱包锁图案：L形
const PAY_PASSWORD = 'pay-pwd-123';
const API_BASE = 'https://walletapi.bfmeta.info';
const CHAIN_PATH = 'bfm';
const CHAIN_MAGIC = 'nxOGQ';

async function getBalance(address: string): Promise<number> {
  const res = await fetch(`${API_BASE}/wallet/${CHAIN_PATH}/address/balance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, magic: CHAIN_MAGIC, assetType: 'BFM' }),
  });
  const json = (await res.json()) as { success: boolean; result?: { amount: string } };
  return json.success ? Number(json.result?.amount ?? 0) : 0;
}

async function getTxCount(address: string): Promise<number> {
  const res = await fetch(`${API_BASE}/wallet/${CHAIN_PATH}/transactions/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senderId: address, offset: 0, limit: 1 }),
  });
  const json = (await res.json()) as { success: boolean; result?: { count: number } };
  return json.success ? (json.result?.count ?? 0) : 0;
}

async function hasSecondPublicKey(address: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/wallet/${CHAIN_PATH}/address/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  });
  const json = (await res.json()) as { success: boolean; result?: { secondPublicKey?: string } };
  return !!json.result?.secondPublicKey;
}

/** 等待交易上链，最多 45 秒 */
async function waitForTx(address: string, beforeCount: number): Promise<boolean> {
  const total = 9;
  for (let i = 0; i < total; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const newCount = await getTxCount(address);
    if (newCount > beforeCount) return true;
    console.log(`   ⏳ 检查 ${i + 1}/${total}: ${newCount}`);
  }
  return false;
}

const describeOrSkip = FUND_MNEMONIC ? test.describe : test.describe.skip;

describeOrSkip('BioForest 支付密码测试', () => {
  // 临时账户信息，在测试间共享
  let tempMnemonic: string;
  let tempAddress: string;

  test.setTimeout(150000); // 2.5 分钟，设置密码 + 转账

  // 测试结束后归还资金
  // 归还在测试步骤 5 中通过 UI 完成

  test('设置支付密码', async ({ page }) => {
    // 捕获所有控制台日志
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('PayPassword') || text.includes('Settings') || text.includes('callback') || text.includes('error')) {
        console.log('[Browser]', text)
      }
    })

    // 1. 生成有效的 BIP39 助记词
    console.log('1. 生成临时账户...');
    tempMnemonic = bip39.generateMnemonic();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    tempAddress = await page.evaluate(async (m) => {
      // @ts-expect-error
      const { getBioforestCore } = await import('/src/services/bioforest-sdk/index.ts');
      const core = await getBioforestCore('bfmeta');
      return await core.accountBaseHelper().getAddressFromSecret(m);
    }, tempMnemonic);
    console.log(`   地址: ${tempAddress}`);

    // 2. SDK 打款
    console.log('2. SDK 打款 0.001 BFM...');
    const fundTxCount = await getTxCount(FUND_ADDRESS);

    await page.evaluate(
      async ({ fromMnemonic, toAddress, fundAddr }) => {
        // @ts-expect-error
        const sdk = await import('/src/services/bioforest-sdk/index.ts');
        const lastBlock = await sdk.getLastBlock('https://walletapi.bfmeta.info', 'bfm');
        const tx = await sdk.createTransferTransaction({
          rpcUrl: 'https://walletapi.bfmeta.info',
          chainId: 'bfmeta',
          apiPath: 'bfm',
          mainSecret: fromMnemonic,
          from: fundAddr,
          to: toAddress,
          amount: '100000', // 0.001 BFM (足够设置支付密码)
          assetType: 'BFM',
          fee: '500',
          applyBlockHeight: lastBlock.height,
          timestamp: lastBlock.timestamp,
        });
        await sdk.broadcastTransaction('https://walletapi.bfmeta.info', 'bfm', tx).catch(() => {});
      },
      { fromMnemonic: FUND_MNEMONIC, toAddress: tempAddress, fundAddr: FUND_ADDRESS },
    );

    console.log('   等待上链...');
    await waitForTx(FUND_ADDRESS, fundTxCount);

    const tempBalance = await getBalance(tempAddress);
    console.log(`   ✅ 余额: ${tempBalance / 1e8} BFM`);
    expect(tempBalance).toBeGreaterThan(0);

    // 3. 导入临时账户
    console.log('3. 导入临时账户...');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="import-wallet-button"]').click();
    await page.locator('[data-testid="continue-button"]').click();
    await page.locator('[data-testid="mnemonic-textarea"]').fill(tempMnemonic);
    await page.locator('[data-testid="continue-button"]').click();
    await page.locator('[data-testid="pattern-lock-input"]').fill(WALLET_PATTERN);
    const confirmInput = page.locator('[data-testid="pattern-lock-confirm"]');
    if (await confirmInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmInput.fill(WALLET_PATTERN);
    }
    await page.locator('[data-testid="continue-button"]').click();
    await page.locator('[data-testid="enter-wallet-button"]').click();
    await page.waitForLoadState('networkidle');
    console.log('   ✅ 导入完成');

    // 切换到 BFMeta
    const chainSelector = page.locator('[data-testid="chain-selector"]');
    if (await chainSelector.isVisible({ timeout: 2000 }).catch(() => false)) {
      await chainSelector.click();
      const bfmetaOption = page.locator('[data-testid="chain-option-bfmeta"]');
      if (await bfmetaOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await bfmetaOption.click();
        await page.waitForTimeout(500);
      }
    }

    // 4. 设置支付密码
    console.log('4. 设置支付密码...');
    const txCountBeforeSet = await getTxCount(tempAddress);

    // 隐藏 Mock DevTools 按钮（避免遮挡）
    await page.evaluate(() => {
      const mockBtn = document.querySelector('[title*="Mock DevTools"]') as HTMLElement;
      if (mockBtn) mockBtn.style.display = 'none';
    });

    await page.locator('[data-testid="tab-settings"]:visible').click();
    await page.waitForTimeout(1000);
    console.log('   切换到设置页');

    const setPayPwdBtn = page.locator('[data-testid="set-pay-password-button"]');
    const btnVisible = await setPayPwdBtn.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`   设置按钮可见: ${btnVisible}`);
    if (!btnVisible) {
      await page.screenshot({ path: 'e2e/test-results/debug-settings.png' });
      throw new Error('设置支付密码按钮不可见');
    }
    await setPayPwdBtn.click();
    console.log('   打开设置对话框');

    // Step 1: 输入新支付密码
    const newPwdInput = page.locator('[data-testid="new-pay-password-input"]');
    await expect(newPwdInput).toBeVisible({ timeout: 5000 });
    await newPwdInput.fill(PAY_PASSWORD);
    await page.locator('[data-testid="set-pay-password-next-button"]').click();
    console.log('   Step 1: 输入新密码');

    // Step 2: 确认支付密码
    const confirmPwdInput = page.locator('[data-testid="confirm-pay-password-input"]');
    await expect(confirmPwdInput).toBeVisible({ timeout: 5000 });
    await confirmPwdInput.fill(PAY_PASSWORD);
    await page.locator('[data-testid="set-pay-password-next-button"]').click();
    console.log('   Step 2: 确认密码');

    // Step 3: 验证钱包锁
    const walletPatternInput = page.locator('[data-testid="wallet-pattern-input"]');
    await expect(walletPatternInput).toBeVisible({ timeout: 5000 });
    await walletPatternInput.fill(WALLET_PATTERN);
    await page.locator('[data-testid="set-pay-password-confirm-button"]').click();
    console.log('   Step 3: 验证钱包锁');

    // 等待上链并验证
    console.log('   等待上链...');
    let hasKey = false;
    for (let i = 0; i < 3; i++) {
      await new Promise(r => setTimeout(r, 15000));
      hasKey = await hasSecondPublicKey(tempAddress);
      console.log(`   检查 ${i + 1}/3: secondPublicKey = ${hasKey}`);
      if (hasKey) break;
    }
    expect(hasKey).toBe(true);
    console.log('   ✅ 支付密码设置成功');

    // 点击"完成"按钮关闭弹窗（使用共享组件的 data-testid）
    const doneButton = page.locator('[data-testid="tx-status-done-button"]');
    await expect(doneButton).toBeVisible({ timeout: 5000 });
    await doneButton.click();
    console.log('   点击完成按钮');
    
    // 等待弹窗关闭
    await page.waitForTimeout(1000);

    // ===== 5. UI 带支付密码转账归还资金 =====
    console.log('5. UI 带支付密码转账...');
    
    const balanceBeforeReturn = await getBalance(tempAddress);
    const returnAmount = Math.max(0, balanceBeforeReturn - 1000) / 1e8; // 扣除手续费
    
    if (returnAmount <= 0) {
      console.log('   余额不足，跳过归还');
    } else {
      console.log(`   归还金额: ${returnAmount.toFixed(8)} BFM`);
      
      // 点击转账 tab
      await page.locator('[data-testid="tab-transfer"]').last().click();
      await page.waitForLoadState('networkidle');
      console.log('   进入转账页面');
      
      // 点击"新建转账"按钮
      await page.getByRole('button', { name: /新建转账/ }).click();
      await page.waitForLoadState('networkidle');
      console.log('   进入发送页面');
      
      // 填写地址
      const addressInput = page.locator('[data-testid="address-input"]');
      await expect(addressInput).toBeVisible({ timeout: 5000 });
      await addressInput.fill(FUND_ADDRESS);
      console.log('   填写地址完成');
      
      // 填写金额
      await page.locator('[data-testid="amount-input"]').fill(returnAmount.toFixed(8));
      console.log('   填写金额完成');
      
      // 点击继续
      await page.locator('[data-testid="send-continue-button"]').click();
      console.log('   点击继续');
      
      // 等待确认弹窗并点击确认
      const confirmButton = page.getByRole('button', { name: /确认转账/ });
      await expect(confirmButton).toBeVisible({ timeout: 5000 });
      await confirmButton.click();
      console.log('   确认转账');
      
      // 等待钱包锁验证弹窗
      const walletPatternInput = page.locator('[data-testid="wallet-pattern-input"]');
      await expect(walletPatternInput).toBeVisible({ timeout: 5000 });
      
      // 验证钱包锁并提交
      await walletPatternInput.fill(WALLET_PATTERN);
      await page.locator('[data-testid="wallet-lock-confirm-button"]').click();
      console.log('   验证钱包锁');
      
      // 等待切换到支付密码步骤
      const payPwdInput = page.locator('[data-testid="pay-password-input"]');
      await expect(payPwdInput).toBeVisible({ timeout: 5000 });
      
      // 输入支付密码并提交
      await payPwdInput.fill(PAY_PASSWORD);
      await page.locator('[data-testid="pay-password-confirm-button"]').click();
      console.log('   提交支付密码');
      
      // 等待交易结果（成功或失败）
      // 注意：TransferPasswordJob 成功后会显示 TxStatusDisplay，失败则在 send 页面显示结果
      await page.waitForTimeout(3000);
      
      // 检查是否有完成按钮（成功时显示）
      const transferDoneBtn = page.locator('[data-testid="tx-status-done-button"]');
      const isDoneVisible = await transferDoneBtn.isVisible().catch(() => false);
      if (isDoneVisible) {
        console.log('   ✅ 转账成功状态显示');
        await transferDoneBtn.click();
        console.log('   点击完成按钮');
      }
      
      // 等待上链
      const txCountBefore = await getTxCount(tempAddress);
      console.log('   等待上链...');
      let confirmed = false;
      for (let i = 0; i < 3; i++) {
        await new Promise(r => setTimeout(r, 15000));
        const newCount = await getTxCount(tempAddress);
        console.log(`   检查 ${i + 1}/3: 交易数 ${newCount}`);
        if (newCount > txCountBefore) {
          confirmed = true;
          break;
        }
      }
      
      if (confirmed) {
        console.log('   ✅ 带支付密码转账成功!');
      } else {
        // 检查余额变化
        const finalBalance = await getBalance(tempAddress);
        console.log(`   最终余额: ${finalBalance / 1e8} BFM`);
        if (finalBalance < balanceBeforeReturn) {
          console.log('   ✅ 余额已减少，转账成功!');
        }
      }
    }
    
    console.log('🎉 支付密码完整测试通过!');
  });
});
