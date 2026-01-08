/**
 * Console 面板 - 类似 Chrome DevTools Console
 * 支持执行表达式，自动注入暂停请求变量
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { ObjectInspector } from 'react-inspector'
import {
  IconTerminal2 as Terminal,
  IconPlayerPlay as Play,
  IconTrash as Trash,
  IconChevronRight as ChevronRight,
} from '@tabler/icons-react'
import {
  getPausedRequests,
  resumePausedRequest,
  abortPausedRequest,
  subscribeBreakpoints,
  type PausedRequest,
} from '@/lib/service-meta'

/** Console 输出条目 */
interface ConsoleEntry {
  id: number
  type: 'input' | 'output' | 'error' | 'info'
  content: unknown
  timestamp: Date
}

/** 创建暂停请求的代理对象 */
function createPausedProxy(request: PausedRequest) {
  return {
    id: request.id,
    service: request.breakpoint.service,
    method: request.breakpoint.method,
    phase: request.phase,
    $input: request.context.$input,
    $output: request.context.$output,
    resume: (modified?: { $input?: unknown; $output?: unknown }) => {
      resumePausedRequest(request.id, modified)
    },
    abort: (error?: Error) => {
      abortPausedRequest(request.id, error)
    },
  }
}

/** Console 面板 */
export function ConsolePanel({ 
  initialCommand 
}: { 
  initialCommand?: string | undefined
} = {}) {
  const [entries, setEntries] = useState<ConsoleEntry[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [pausedRequests, setPausedRequests] = useState<PausedRequest[]>(() => getPausedRequests())
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const entryIdRef = useRef(0)
  const lastCommandRef = useRef<string | undefined>(undefined)

  // 订阅暂停请求变化
  useEffect(() => {
    return subscribeBreakpoints(() => {
      setPausedRequests(getPausedRequests())
    })
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [entries])

  // 构建执行上下文
  const buildContext = useCallback(() => {
    const context: Record<string, unknown> = {}
    const proxies = pausedRequests.map(createPausedProxy)

    // $paused 数组
    context.$paused = proxies

    // $0, $1, $2... 快捷别名
    proxies.forEach((proxy, index) => {
      context[`$${index}`] = proxy
    })

    // $_ 最新的
    if (proxies.length > 0) {
      context.$_ = proxies[proxies.length - 1]
    }

    // $p{id} 唯一标识
    proxies.forEach((proxy) => {
      // 从 id 中提取数字部分，如 "req-5" -> "$p5"
      const match = proxy.id.match(/\d+/)
      if (match) {
        context[`$p${match[0]}`] = proxy
      }
    })

    return context
  }, [pausedRequests])

  // 帮助信息
  const helpInfo = {
    '命令': {
      '/help': '显示帮助信息',
      '/clear': '清空 Console',
      '/vars': '显示可用变量',
      '/copy <expr>': '复制表达式结果到剪贴板',
    },
    '变量': {
      '$paused': '暂停请求数组',
      '$0, $1...': '按索引访问暂停请求',
      '$_': '最新的暂停请求',
      '$p{id}': '按 ID 访问，如 $p1, $p2',
    },
    '方法': {
      '.resume(modified?)': '继续执行，可传入修改后的值',
      '.abort(error?)': '中止请求',
    },
    '示例': {
      '$_': '查看最新暂停请求',
      '$p1.$input': '查看请求的输入',
      '/copy $p1.$input': '复制输入到剪贴板',
      '$p1.resume()': '继续执行',
    },
  }

  // 执行代码
  const executeCode = useCallback((code: string, addToHistory = true) => {
    const trimmedCode = code.trim()
    if (!trimmedCode) return

    // 处理特殊命令
    if (trimmedCode.startsWith('/')) {
      const cmd = trimmedCode.toLowerCase()
      
      if (cmd === '/help') {
        setEntries(prev => [...prev, {
          id: ++entryIdRef.current,
          type: 'info',
          content: helpInfo,
          timestamp: new Date(),
        }])
        setInput('')
        return
      }
      
      if (cmd === '/clear') {
        setEntries([])
        setInput('')
        return
      }
      
      if (cmd === '/vars') {
        const context = buildContext()
        setEntries(prev => [...prev, {
          id: ++entryIdRef.current,
          type: 'info',
          content: { '可用变量': Object.keys(context), '暂停数量': pausedRequests.length },
          timestamp: new Date(),
        }])
        setInput('')
        return
      }

      // /copy <expr> - 复制表达式结果到剪贴板
      if (trimmedCode.startsWith('/copy ')) {
        const expr = trimmedCode.slice(6).trim()
        if (!expr) {
          setEntries(prev => [...prev, {
            id: ++entryIdRef.current,
            type: 'error',
            content: '用法: /copy <expr>，例如: /copy $p1.$input',
            timestamp: new Date(),
          }])
          setInput('')
          return
        }

        try {
          const context = buildContext()
          const contextKeys = Object.keys(context)
          const contextValues = Object.values(context)
          // eslint-disable-next-line @typescript-eslint/no-implied-eval
          const fn = new Function(...contextKeys, `return eval(${JSON.stringify(expr)})`)
          const result = fn(...contextValues)
          
          // 转换为字符串
          const text = typeof result === 'string' 
            ? result 
            : JSON.stringify(result, null, 2)
          
          // 复制到剪贴板
          navigator.clipboard.writeText(text).then(() => {
            setEntries(prev => [...prev, {
              id: ++entryIdRef.current,
              type: 'info',
              content: `已复制到剪贴板 (${text.length} 字符)`,
              timestamp: new Date(),
            }])
          }).catch((err) => {
            setEntries(prev => [...prev, {
              id: ++entryIdRef.current,
              type: 'error',
              content: `复制失败: ${err.message}`,
              timestamp: new Date(),
            }])
          })
        } catch (error) {
          setEntries(prev => [...prev, {
            id: ++entryIdRef.current,
            type: 'error',
            content: `表达式错误: ${error instanceof Error ? error.message : String(error)}`,
            timestamp: new Date(),
          }])
        }
        setInput('')
        return
      }

      // 未知命令
      setEntries(prev => [...prev, {
        id: ++entryIdRef.current,
        type: 'error',
        content: `未知命令: ${trimmedCode}。输入 /help 查看帮助。`,
        timestamp: new Date(),
      }])
      setInput('')
      return
    }

    // 添加输入条目
    setEntries(prev => [...prev, {
      id: ++entryIdRef.current,
      type: 'input',
      content: trimmedCode,
      timestamp: new Date(),
    }])

    // 添加到历史
    if (addToHistory) {
      setHistory(prev => [...prev.filter(h => h !== trimmedCode), trimmedCode])
      setHistoryIndex(-1)
    }

    try {
      const context = buildContext()
      const contextKeys = Object.keys(context)
      const contextValues = Object.values(context)

      // 构建函数并执行
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const fn = new Function(...contextKeys, `return eval(${JSON.stringify(trimmedCode)})`)
      const result = fn(...contextValues)

      // 添加输出条目
      setEntries(prev => [...prev, {
        id: ++entryIdRef.current,
        type: 'output',
        content: result,
        timestamp: new Date(),
      }])
    } catch (error) {
      // 添加错误条目
      setEntries(prev => [...prev, {
        id: ++entryIdRef.current,
        type: 'error',
        content: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      }])
    }

    setInput('')
  }, [buildContext, pausedRequests.length])

  // 处理外部传入的命令
  useEffect(() => {
    if (initialCommand && initialCommand !== lastCommandRef.current) {
      lastCommandRef.current = initialCommand
      // 延迟执行，确保组件已完全渲染
      setTimeout(() => {
        executeCode(initialCommand, false)
        inputRef.current?.focus()
      }, 0)
    }
  }, [initialCommand, executeCode])

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      executeCode(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        setInput(history[history.length - 1 - newIndex] || '')
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(history[history.length - 1 - newIndex] || '')
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput('')
      }
    }
  }, [input, history, historyIndex, executeCode])

  // 清空 Console
  const clearConsole = useCallback(() => {
    setEntries([])
  }, [])

  return (
    <div className="flex h-full flex-col">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 border-b p-2 dark:border-gray-700">
        <Terminal className="size-4 text-gray-400" />
        <span className="flex-1 text-xs font-medium text-gray-500">Console</span>
        {pausedRequests.length > 0 && (
          <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] text-orange-600 dark:bg-orange-900/30">
            {pausedRequests.length} paused
          </span>
        )}
        <button
          onClick={clearConsole}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          title="清空 Console (/clear)"
        >
          <Trash className="size-3.5" />
        </button>
      </div>

      {/* 输出区域 */}
      <div ref={outputRef} className="flex-1 overflow-auto p-2 font-mono text-xs">
        {entries.length === 0 ? (
          <div className="text-gray-400">
            <p>Console 面板 - 输入 <code className="text-blue-500">/help</code> 查看帮助</p>
            <p className="mt-1 text-[10px]">
              变量: <code className="text-blue-500">$paused</code>, <code className="text-blue-500">$0</code>, <code className="text-blue-500">$_</code>, <code className="text-blue-500">$p{'{id}'}</code>
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {entries.map((entry) => (
              <div key={entry.id} className="group">
                {entry.type === 'input' ? (
                  <div className="flex items-start gap-1 text-blue-600">
                    <ChevronRight className="size-3 mt-0.5 flex-shrink-0" />
                    <span className="break-all">{String(entry.content)}</span>
                  </div>
                ) : entry.type === 'error' ? (
                  <div className="flex items-start gap-1 text-red-500">
                    <span className="flex-shrink-0">✕</span>
                    <span className="break-all">{String(entry.content)}</span>
                  </div>
                ) : entry.type === 'info' ? (
                  <div className="rounded bg-blue-50 p-1.5 dark:bg-blue-900/20">
                    <ObjectInspector data={entry.content} expandLevel={1} />
                  </div>
                ) : (
                  <div className="pl-4">
                    <ObjectInspector data={entry.content} expandLevel={1} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="flex items-center gap-2 border-t p-2 dark:border-gray-700">
        <ChevronRight className="size-4 text-blue-500" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入表达式... (↑↓ 历史)"
          className="flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-gray-400"
          list="console-history"
          autoComplete="on"
          spellCheck={false}
        />
        {/* 历史记录 datalist */}
        <datalist id="console-history">
          {/* 内置命令 */}
          <option value="/help" />
          <option value="/clear" />
          <option value="/vars" />
          <option value="/copy " />
          {/* 常用变量 */}
          <option value="$_" />
          <option value="$paused" />
          {/* 历史记录（倒序，最新的在前） */}
          {[...history].toReversed().map((cmd, i) => (
            <option key={i} value={cmd} />
          ))}
        </datalist>
        <button
          onClick={() => executeCode(input)}
          disabled={!input.trim()}
          className="rounded bg-blue-500 p-1 text-white disabled:opacity-50 hover:bg-blue-600"
          title="执行 (Enter)"
        >
          <Play className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
