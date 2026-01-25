/**
 * Global Error Capture
 * 
 * Captures all errors and warnings to sessionStorage for debugging.
 * This is especially useful when console logs are hard to capture.
 */

interface CapturedError {
    timestamp: string
    type: 'error' | 'warning' | 'unhandled' | 'promise-rejection'
    message: string
    stack?: string
    source?: string
    lineno?: number
    colno?: number
}

const STORAGE_KEY = 'captured_errors'
const MAX_ERRORS = 50

function getErrors(): CapturedError[] {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

function saveError(error: CapturedError): void {
    try {
        const errors = getErrors()
        errors.push(error)
        // Keep only the last MAX_ERRORS
        if (errors.length > MAX_ERRORS) {
            errors.splice(0, errors.length - MAX_ERRORS)
        }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(errors))
    } catch (e) {
        console.warn('[ErrorCapture] Failed to save error:', e)
    }
}

function formatTimestamp(): string {
    return new Date().toISOString()
}

// Capture console.error
const originalError = console.error
console.error = function (...args: unknown[]) {
    saveError({
        timestamp: formatTimestamp(),
        type: 'error',
        message: args.map(a => {
            if (a instanceof Error) return `${a.message}\n${a.stack}`
            if (typeof a === 'object') {
                try { return JSON.stringify(a) } catch { return String(a) }
            }
            return String(a)
        }).join(' '),
    })
    originalError.apply(console, args)
}

// Capture console.warn
const originalWarn = console.warn
console.warn = function (...args: unknown[]) {
    saveError({
        timestamp: formatTimestamp(),
        type: 'warning',
        message: args.map(a => {
            if (a instanceof Error) return `${a.message}\n${a.stack}`
            if (typeof a === 'object') {
                try { return JSON.stringify(a) } catch { return String(a) }
            }
            return String(a)
        }).join(' '),
    })
    originalWarn.apply(console, args)
}

// Capture unhandled errors
window.onerror = function (message, source, lineno, colno, error) {
    saveError({
        timestamp: formatTimestamp(),
        type: 'unhandled',
        message: String(message),
        stack: error?.stack,
        source: source,
        lineno: lineno,
        colno: colno,
    })
    return false // Don't prevent default handling
}

// Capture unhandled promise rejections
window.onunhandledrejection = function (event) {
    const reason = event.reason
    saveError({
        timestamp: formatTimestamp(),
        type: 'promise-rejection',
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
    })
}

// Clear errors on fresh load (optional - comment out to keep across reloads)
// sessionStorage.removeItem(STORAGE_KEY)

// Export utilities for reading errors
export function getCapturedErrors(): CapturedError[] {
    return getErrors()
}

export function clearCapturedErrors(): void {
    sessionStorage.removeItem(STORAGE_KEY)
}

export function captureError(error: Error, errorInfo?: { componentStack?: string }): void {
    saveError({
        timestamp: formatTimestamp(),
        type: 'error',
        message: error.message,
        stack: [error.stack, errorInfo?.componentStack].filter(Boolean).join('\n'),
    })
}

export function printCapturedErrors(): void {
    const errors = getErrors()
    console.log(`[ErrorCapture] ${errors.length} captured errors:`)
    errors.forEach((e, i) => {
        console.log(`\n--- Error ${i + 1} (${e.timestamp}) [${e.type}] ---`)
        console.log(e.message)
        if (e.stack) console.log('Stack:', e.stack)
        if (e.source) console.log(`Source: ${e.source}:${e.lineno}:${e.colno}`)
    })
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
    (window as any).__errorCapture = {
        get: getCapturedErrors,
        clear: clearCapturedErrors,
        print: printCapturedErrors,
    }
}

console.log('[ErrorCapture] Initialized - errors will be saved to sessionStorage')
