import Big from 'big.js'

/**
 * Amount - 不可变的金额类型
 *
 * 设计原则：
 * 1. 内部使用 Big.js 进行精确计算
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
  private readonly _value: Big // 存储原始单位的值
  private readonly _decimals: number
  private readonly _symbol: string | undefined

  private constructor(value: Big, decimals: number, symbol: string | undefined) {
    this._value = value
    this._decimals = decimals
    this._symbol = symbol
  }

  // ==================== 静态工厂方法 ====================

  /**
   * 从原始值创建（最小单位，如 wei、lamports、satoshi）
   * 用于：链上返回的余额、交易金额等
   */
  static fromRaw(raw: bigint | string | number, decimals: number, symbol?: string): Amount {
    const value = new Big(raw.toString())
    return new Amount(value, decimals, symbol)
  }

  /**
   * 从格式化值创建（带小数的人类可读格式）
   * 用于：用户输入、显示值转换
   * @throws 如果输入格式无效
   */
  static fromFormatted(formatted: string, decimals: number, symbol?: string): Amount {
    const result = Amount.tryFromFormatted(formatted, decimals, symbol)
    if (result === null) {
      throw new Error(`Invalid amount format: "${formatted}"`)
    }
    return result
  }

  /**
   * 尝试从格式化值创建，失败返回 null
   * 用于：用户输入验证
   */
  static tryFromFormatted(formatted: string, decimals: number, symbol?: string): Amount | null {
    const input = formatted.trim()
    if (!input) return null
    if (!/^-?\d*\.?\d*$/.test(input)) return null
    if (input === '.' || input === '-' || input === '-.') return null

    try {
      const parsed = new Big(input)
      const multiplier = new Big(10).pow(decimals)
      const raw = parsed.times(multiplier)
      // 检查是否有超出精度的小数
      if (!raw.round(0, Big.roundDown).eq(raw)) {
        return null // 超出精度
      }
      return new Amount(raw.round(0, Big.roundDown), decimals, symbol)
    } catch {
      return null
    }
  }

  /**
   * 创建零值
   */
  static zero(decimals: number, symbol?: string): Amount {
    return new Amount(new Big(0), decimals, symbol)
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

  /**
   * 从 JSON 反序列化
   */
  static fromJSON(json: AmountJSON): Amount {
    return Amount.fromRaw(json.raw, json.decimals, json.symbol)
  }

  // ==================== Getters ====================

  /** 原始值（bigint） */
  get raw(): bigint {
    return BigInt(this._value.toFixed(0))
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
    return this._value.toFixed(0)
  }

  /** 转为格式化显示（人类可读） */
  toFormatted(options?: { trimTrailingZeros?: boolean }): string {
    const { trimTrailingZeros = true } = options ?? {}

    if (this._value.eq(0)) return '0'

    const divisor = new Big(10).pow(this._decimals)
    const formatted = this._value.div(divisor)

    if (trimTrailingZeros) {
      // 使用 Big.js 的 toFixed 然后去掉尾部零
      const fixed = formatted.toFixed(this._decimals)
      return fixed.replace(/\.?0+$/, '')
    } else {
      return formatted.toFixed(this._decimals)
    }
  }

  /**
   * 转为带千分位的显示字符串
   */
  toDisplayString(options?: {
    locale?: string
    maximumFractionDigits?: number
    minimumFractionDigits?: number
  }): string {
    const {
      locale = 'en-US',
      maximumFractionDigits = this._decimals,
      minimumFractionDigits = 0,
    } = options ?? {}

    const num = this.toNumber()
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits,
      minimumFractionDigits,
    }).format(num)
  }

  /** 转为 number（可能丢失精度，仅用于显示） */
  toNumber(): number {
    const divisor = new Big(10).pow(this._decimals)
    return this._value.div(divisor).toNumber()
  }

  /** 返回带符号的格式化字符串 */
  toString(): string {
    const formatted = this.toFormatted()
    return this._symbol ? `${formatted} ${this._symbol}` : formatted
  }

  /** 序列化为 JSON */
  toJSON(): AmountJSON {
    return {
      raw: this.toRawString(),
      decimals: this._decimals,
      ...(this._symbol !== undefined && { symbol: this._symbol }),
    }
  }

  // ==================== 比较方法 ====================

  /** 是否为零 */
  isZero(): boolean {
    return this._value.eq(0)
  }

  /** 是否为正数 */
  isPositive(): boolean {
    return this._value.gt(0)
  }

  /** 是否为负数 */
  isNegative(): boolean {
    return this._value.lt(0)
  }

  /** 大于 */
  gt(other: Amount): boolean {
    this.assertSameDecimals(other)
    return this._value.gt(other._value)
  }

  /** 大于等于 */
  gte(other: Amount): boolean {
    this.assertSameDecimals(other)
    return this._value.gte(other._value)
  }

  /** 小于 */
  lt(other: Amount): boolean {
    this.assertSameDecimals(other)
    return this._value.lt(other._value)
  }

  /** 小于等于 */
  lte(other: Amount): boolean {
    this.assertSameDecimals(other)
    return this._value.lte(other._value)
  }

  /** 等于 */
  eq(other: Amount): boolean {
    this.assertSameDecimals(other)
    return this._value.eq(other._value)
  }

  // ==================== 算术方法 ====================

  /** 加法 */
  add(other: Amount): Amount {
    this.assertSameDecimals(other)
    return new Amount(this._value.plus(other._value), this._decimals, this._symbol)
  }

  /** 减法 */
  sub(other: Amount): Amount {
    this.assertSameDecimals(other)
    return new Amount(this._value.minus(other._value), this._decimals, this._symbol)
  }

  /** 乘法（用于计算百分比等） */
  mul(factor: number | bigint | string | Big): Amount {
    const bigFactor = factor instanceof Big ? factor : new Big(factor.toString())
    return new Amount(this._value.times(bigFactor).round(0, Big.roundDown), this._decimals, this._symbol)
  }

  /** 除法（向下取整） */
  div(divisor: number | bigint | string | Big): Amount {
    const bigDivisor = divisor instanceof Big ? divisor : new Big(divisor.toString())
    return new Amount(this._value.div(bigDivisor).round(0, Big.roundDown), this._decimals, this._symbol)
  }

  /** 取余 */
  mod(divisor: number | bigint | string | Big): Amount {
    const bigDivisor = divisor instanceof Big ? divisor : new Big(divisor.toString())
    return new Amount(this._value.mod(bigDivisor), this._decimals, this._symbol)
  }

  /** 绝对值 */
  abs(): Amount {
    return new Amount(this._value.abs(), this._decimals, this._symbol)
  }

  /** 取反 */
  neg(): Amount {
    return new Amount(this._value.neg(), this._decimals, this._symbol)
  }

  /** 取最小值 */
  min(other: Amount): Amount {
    this.assertSameDecimals(other)
    return this._value.lte(other._value) ? this : other
  }

  /** 取最大值 */
  max(other: Amount): Amount {
    this.assertSameDecimals(other)
    return this._value.gte(other._value) ? this : other
  }

  /**
   * 按百分比计算
   * @param percent 百分比值（如 5 表示 5%）
   */
  percent(percent: number): Amount {
    return this.mul(percent).div(100)
  }

  // ==================== 精度转换 ====================

  /**
   * 转换到不同精度
   * @param newDecimals 新的精度
   */
  toDecimals(newDecimals: number): Amount {
    if (newDecimals === this._decimals) return this
    
    const diff = newDecimals - this._decimals
    if (diff > 0) {
      // 增加精度，乘以 10^diff
      const multiplier = new Big(10).pow(diff)
      return new Amount(this._value.times(multiplier), newDecimals, this._symbol)
    } else {
      // 减少精度，除以 10^|diff|（向下取整）
      const divisor = new Big(10).pow(-diff)
      return new Amount(this._value.div(divisor).round(0, Big.roundDown), newDecimals, this._symbol)
    }
  }

  // ==================== 工具方法 ====================

  /** 创建具有相同精度和符号的新实例 */
  withRaw(raw: bigint | string): Amount {
    return Amount.fromRaw(raw, this._decimals, this._symbol)
  }

  /** 创建具有不同符号的副本 */
  withSymbol(symbol: string): Amount {
    return new Amount(this._value, this._decimals, symbol)
  }

  /** 创建具有不同精度的副本（重新计算 raw 值） */
  withDecimals(decimals: number): Amount {
    return this.toDecimals(decimals)
  }

  /** 从资产信息创建新 Amount（继承 decimals 和 symbol） */
  withAsset(asset: { decimals: number; assetType?: string }): Amount {
    return this.toDecimals(asset.decimals).withSymbol(asset.assetType ?? this._symbol ?? '')
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
}

// ==================== 类型定义 ====================

/** Amount 的 JSON 表示 */
export interface AmountJSON {
  raw: string
  decimals: number
  symbol?: string
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

/**
 * 类型守卫：检查是否为 Amount 实例
 */
export function isAmount(value: unknown): value is Amount {
  return value instanceof Amount
}

/**
 * 安全转换：如果已经是 Amount 则返回，否则解析
 */
export function toAmount(
  value: Amount | string,
  decimals: number,
  symbol?: string
): Amount {
  if (isAmount(value)) return value
  return Amount.parse(value, decimals, symbol)
}
