/**
 * Amount - 不可变的金额类型
 *
 * 设计原则：
 * 1. 内部始终使用 bigint 存储原始值（最小单位）
 * 2. 不可变 - 所有操作返回新实例
 * 3. 类型安全 - 通过静态工厂方法创建，防止混淆 raw/formatted
 * 4. 自文档化 - 方法名清晰表达意图
 *
 * 使用示例：
 * ```ts
 * // 从原始值创建（如链上返回的余额）
 * const balance = Amount.fromRaw('1000000000000000000', 18, 'ETH')
 *
 * // 从用户输入创建（如输入框的金额）
 * const input = Amount.fromFormatted('1.5', 18, 'ETH')
 *
 * // 比较
 * if (input.gt(balance)) { console.log('余额不足') }
 *
 * // 运算
 * const remaining = balance.sub(input)
 *
 * // 显示
 * console.log(remaining.toFormatted()) // "0.5"
 * ```
 */
export class Amount {
  private readonly _raw: bigint
  private readonly _decimals: number
  private readonly _symbol: string | undefined

  private constructor(raw: bigint, decimals: number, symbol: string | undefined) {
    this._raw = raw
    this._decimals = decimals
    this._symbol = symbol
  }

  // ==================== 静态工厂方法 ====================

  /**
   * 从原始值创建（最小单位，如 wei、lamports、satoshi）
   * 用于：链上返回的余额、交易金额等
   */
  static fromRaw(raw: bigint | string, decimals: number, symbol?: string): Amount {
    const value = typeof raw === 'string' ? BigInt(raw) : raw
    return new Amount(value, decimals, symbol)
  }

  /**
   * 从格式化值创建（带小数的人类可读格式）
   * 用于：用户输入、显示值转换
   * @throws 如果输入格式无效
   */
  static fromFormatted(formatted: string, decimals: number, symbol?: string): Amount {
    const raw = Amount.parseFormatted(formatted, decimals)
    if (raw === null) {
      throw new Error(`Invalid amount format: "${formatted}"`)
    }
    return new Amount(raw, decimals, symbol)
  }

  /**
   * 尝试从格式化值创建，失败返回 null
   * 用于：用户输入验证
   */
  static tryFromFormatted(formatted: string, decimals: number, symbol?: string): Amount | null {
    const raw = Amount.parseFormatted(formatted, decimals)
    if (raw === null) return null
    return new Amount(raw, decimals, symbol)
  }

  /**
   * 创建零值
   */
  static zero(decimals: number, symbol?: string): Amount {
    return new Amount(0n, decimals, symbol)
  }

  /**
   * 智能解析 - 自动判断是 raw 还是 formatted
   * 规则：如果包含小数点，则为 formatted；否则为 raw
   * 用于：处理来源不确定的数据（如 API 返回）
   */
  static parse(value: string, decimals: number, symbol?: string): Amount {
    if (value.includes('.')) {
      return Amount.fromFormatted(value, decimals, symbol)
    }
    return Amount.fromRaw(value, decimals, symbol)
  }

  // ==================== Getters ====================

  /** 原始值（bigint） */
  get raw(): bigint {
    return this._raw
  }

  /** 精度（小数位数） */
  get decimals(): number {
    return this._decimals
  }

  /** 符号/单位 */
  get symbol(): string | undefined {
    return this._symbol
  }

  // ==================== 转换方法 ====================

  /** 转为原始值字符串 */
  toRawString(): string {
    return this._raw.toString()
  }

  /** 转为格式化显示（人类可读） */
  toFormatted(options?: { trimTrailingZeros?: boolean }): string {
    const { trimTrailingZeros = true } = options ?? {}

    if (this._raw === 0n) return '0'

    const divisor = 10n ** BigInt(this._decimals)
    const integerPart = this._raw / divisor
    const fractionalPart = this._raw % divisor

    if (fractionalPart === 0n) {
      return integerPart.toString()
    }

    const fractionalStr = fractionalPart.toString().padStart(this._decimals, '0')
    const trimmed = trimTrailingZeros ? fractionalStr.replace(/0+$/, '') : fractionalStr

    return `${integerPart}.${trimmed}`
  }

  /** 转为 number（可能丢失精度，仅用于显示） */
  toNumber(): number {
    return Number(this._raw) / 10 ** this._decimals
  }

  /** 返回带符号的格式化字符串 */
  toString(): string {
    const formatted = this.toFormatted()
    return this._symbol ? `${formatted} ${this._symbol}` : formatted
  }

  // ==================== 比较方法 ====================

  /** 是否为零 */
  isZero(): boolean {
    return this._raw === 0n
  }

  /** 是否为正数 */
  isPositive(): boolean {
    return this._raw > 0n
  }

  /** 是否为负数 */
  isNegative(): boolean {
    return this._raw < 0n
  }

  /** 大于 */
  gt(other: Amount): boolean {
    this.assertSameDecimals(other)
    return this._raw > other._raw
  }

  /** 大于等于 */
  gte(other: Amount): boolean {
    this.assertSameDecimals(other)
    return this._raw >= other._raw
  }

  /** 小于 */
  lt(other: Amount): boolean {
    this.assertSameDecimals(other)
    return this._raw < other._raw
  }

  /** 小于等于 */
  lte(other: Amount): boolean {
    this.assertSameDecimals(other)
    return this._raw <= other._raw
  }

  /** 等于 */
  eq(other: Amount): boolean {
    this.assertSameDecimals(other)
    return this._raw === other._raw
  }

  // ==================== 算术方法 ====================

  /** 加法 */
  add(other: Amount): Amount {
    this.assertSameDecimals(other)
    return new Amount(this._raw + other._raw, this._decimals, this._symbol)
  }

  /** 减法 */
  sub(other: Amount): Amount {
    this.assertSameDecimals(other)
    return new Amount(this._raw - other._raw, this._decimals, this._symbol)
  }

  /** 乘法（用于计算百分比等） */
  mul(factor: number | bigint): Amount {
    if (typeof factor === 'bigint') {
      return new Amount(this._raw * factor, this._decimals, this._symbol)
    }
    // 对于 number，先放大再缩小以保持精度
    const scaleFactor = 1_000_000_000n // 9 位精度
    const scaled = BigInt(Math.round(factor * Number(scaleFactor)))
    return new Amount((this._raw * scaled) / scaleFactor, this._decimals, this._symbol)
  }

  /** 除法（向下取整） */
  div(divisor: number | bigint): Amount {
    if (typeof divisor === 'bigint') {
      return new Amount(this._raw / divisor, this._decimals, this._symbol)
    }
    const scaleFactor = 1_000_000_000n
    const scaled = BigInt(Math.round(divisor * Number(scaleFactor)))
    return new Amount((this._raw * scaleFactor) / scaled, this._decimals, this._symbol)
  }

  /** 取最小值 */
  min(other: Amount): Amount {
    this.assertSameDecimals(other)
    return this._raw <= other._raw ? this : other
  }

  /** 取最大值 */
  max(other: Amount): Amount {
    this.assertSameDecimals(other)
    return this._raw >= other._raw ? this : other
  }

  // ==================== 工具方法 ====================

  /** 创建具有相同精度和符号的新实例 */
  withRaw(raw: bigint): Amount {
    return new Amount(raw, this._decimals, this._symbol)
  }

  /** 创建具有不同符号的副本 */
  withSymbol(symbol: string): Amount {
    return new Amount(this._raw, this._decimals, symbol)
  }

  /** 验证精度是否相同 */
  private assertSameDecimals(other: Amount): void {
    if (this._decimals !== other._decimals) {
      throw new Error(
        `Amount decimals mismatch: ${this._decimals} vs ${other._decimals}. ` +
          `Cannot compare or operate on amounts with different decimals.`
      )
    }
  }

  // ==================== 私有辅助方法 ====================

  /** 解析格式化字符串为 bigint */
  private static parseFormatted(value: string, decimals: number): bigint | null {
    const input = value.trim()
    if (!input) return null

    const parts = input.split('.')
    if (parts.length > 2) return null

    const wholeRaw = parts[0] ?? ''
    const fractionRaw = parts[1] ?? ''
    const whole = wholeRaw === '' ? '0' : wholeRaw

    if (!/^[0-9]+$/.test(whole)) return null
    if (fractionRaw && !/^[0-9]+$/.test(fractionRaw)) return null
    if (fractionRaw.length > decimals) return null

    const fraction = fractionRaw.padEnd(decimals, '0')
    const combined = `${whole}${fraction}`.replace(/^0+/, '') || '0'

    return BigInt(combined)
  }
}

// ==================== 辅助函数 ====================

/**
 * 从 AssetInfo 创建 Amount
 * 使用智能解析，自动判断 amount 是 raw 还是 formatted
 */
export function amountFromAsset(asset: {
  amount: string
  decimals: number
  assetType?: string
}): Amount {
  return Amount.parse(asset.amount, asset.decimals, asset.assetType)
}
