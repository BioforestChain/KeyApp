import type { Meta, StoryObj } from '@storybook/react'
import { useState, useEffect, useRef } from 'react'
import { QRScanner, createQRScanner } from './index'
import { generateQRCanvas, generateTransformedQR, getCanvasImageData, runReliabilityTest, STANDARD_TEST_CASES } from './test-utils'
import type { ScanResult } from './types'

const meta: Meta = {
  title: 'Lib/QRScanner',
  parameters: {
    layout: 'centered',
  },
}

export default meta

/** 基础扫描演示 */
export const BasicScan: StoryObj = {
  render: () => {
    const [content, setContent] = useState('Hello World')
    const [scanResult, setScanResult] = useState<ScanResult | null>(null)
    const [scanning, setScanning] = useState(false)
    const [qrCanvas, setQrCanvas] = useState<HTMLCanvasElement | null>(null)
    const canvasContainerRef = useRef<HTMLDivElement>(null)
    const scannerRef = useRef<QRScanner | null>(null)

    useEffect(() => {
      scannerRef.current = createQRScanner({ useWorker: true })
      return () => {
        scannerRef.current?.destroy()
      }
    }, [])

    useEffect(() => {
      generateQRCanvas(content, { width: 200 }).then(setQrCanvas)
    }, [content])

    useEffect(() => {
      if (qrCanvas && canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = ''
        canvasContainerRef.current.appendChild(qrCanvas)
      }
    }, [qrCanvas])

    const handleScan = async () => {
      if (!qrCanvas || !scannerRef.current) return
      setScanning(true)
      setScanResult(null)

      const imageData = getCanvasImageData(qrCanvas)
      const result = await scannerRef.current.scan(imageData)
      
      setScanResult(result)
      setScanning(false)
    }

    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <h2 className="text-lg font-semibold">QR Scanner 基础演示</h2>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="rounded border px-3 py-2"
            placeholder="输入 QR 内容"
          />
        </div>

        <div ref={canvasContainerRef} className="rounded border p-2" />

        <button
          onClick={handleScan}
          disabled={scanning}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
        >
          {scanning ? '扫描中...' : '扫描 QR 码'}
        </button>

        {scanResult && (
          <div className="rounded bg-green-100 p-4">
            <p className="font-medium text-green-800">扫描成功！</p>
            <p className="text-sm">内容: {scanResult.content}</p>
            <p className="text-sm">耗时: {scanResult.duration.toFixed(2)}ms</p>
          </div>
        )}
      </div>
    )
  },
}

/** 变换测试 */
export const TransformTest: StoryObj = {
  render: () => {
    const [scale, setScale] = useState(1)
    const [rotate, setRotate] = useState(0)
    const [noise, setNoise] = useState(0)
    const [blur, setBlur] = useState(0)
    const [scanResult, setScanResult] = useState<ScanResult | null>(null)
    const [qrCanvas, setQrCanvas] = useState<HTMLCanvasElement | null>(null)
    const canvasContainerRef = useRef<HTMLDivElement>(null)
    const scannerRef = useRef<QRScanner | null>(null)

    const content = 'Transform Test QR'

    useEffect(() => {
      scannerRef.current = createQRScanner({ useWorker: true })
      return () => {
        scannerRef.current?.destroy()
      }
    }, [])

    useEffect(() => {
      generateTransformedQR(
        content,
        { width: 200, errorCorrectionLevel: 'H' },
        { scale, rotate, noise, blur }
      ).then(setQrCanvas)
    }, [scale, rotate, noise, blur])

    useEffect(() => {
      if (qrCanvas && canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = ''
        canvasContainerRef.current.appendChild(qrCanvas)
      }
    }, [qrCanvas])

    const handleScan = async () => {
      if (!qrCanvas || !scannerRef.current) return
      setScanResult(null)

      const imageData = getCanvasImageData(qrCanvas)
      const result = await scannerRef.current.scan(imageData)
      setScanResult(result)
    }

    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <h2 className="text-lg font-semibold">QR 变换测试</h2>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col">
            缩放: {scale.toFixed(2)}
            <input
              type="range"
              min="0.3"
              max="2"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
            />
          </label>
          <label className="flex flex-col">
            旋转: {rotate}°
            <input
              type="range"
              min="0"
              max="360"
              step="5"
              value={rotate}
              onChange={(e) => setRotate(parseInt(e.target.value))}
            />
          </label>
          <label className="flex flex-col">
            噪声: {noise}
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={noise}
              onChange={(e) => setNoise(parseInt(e.target.value))}
            />
          </label>
          <label className="flex flex-col">
            模糊: {blur}px
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={blur}
              onChange={(e) => setBlur(parseFloat(e.target.value))}
            />
          </label>
        </div>

        <div ref={canvasContainerRef} className="rounded border p-2 bg-white" />

        <button
          onClick={handleScan}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          扫描
        </button>

        {scanResult ? (
          <div className="rounded bg-green-100 p-4">
            <p className="font-medium text-green-800">✓ 识别成功</p>
            <p className="text-sm">耗时: {scanResult.duration.toFixed(2)}ms</p>
          </div>
        ) : (
          <div className="rounded bg-gray-100 p-4">
            <p className="text-gray-600">点击扫描按钮测试</p>
          </div>
        )}
      </div>
    )
  },
}

/** 可靠性测试报告 */
export const ReliabilityReport: StoryObj = {
  render: () => {
    const [running, setRunning] = useState(false)
    const [report, setReport] = useState<Awaited<ReturnType<typeof runReliabilityTest>> | null>(null)
    const scannerRef = useRef<QRScanner | null>(null)

    useEffect(() => {
      scannerRef.current = createQRScanner({ useWorker: true })
      return () => {
        scannerRef.current?.destroy()
      }
    }, [])

    const handleRunTest = async () => {
      if (!scannerRef.current) return
      setRunning(true)
      setReport(null)

      await scannerRef.current.waitReady()
      const result = await runReliabilityTest(scannerRef.current, STANDARD_TEST_CASES)
      setReport(result)
      setRunning(false)
    }

    return (
      <div className="flex flex-col gap-4 p-4 max-w-2xl">
        <h2 className="text-lg font-semibold">QR Scanner 可靠性测试</h2>

        <button
          onClick={handleRunTest}
          disabled={running}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50 self-start"
        >
          {running ? '测试中...' : '运行测试'}
        </button>

        {report && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded bg-gray-100 p-3 text-center">
                <p className="text-2xl font-bold">{report.totalCases}</p>
                <p className="text-sm text-gray-600">总用例</p>
              </div>
              <div className="rounded bg-green-100 p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{report.passed}</p>
                <p className="text-sm text-gray-600">通过</p>
              </div>
              <div className="rounded bg-red-100 p-3 text-center">
                <p className="text-2xl font-bold text-red-700">{report.failed}</p>
                <p className="text-sm text-gray-600">失败</p>
              </div>
              <div className={`rounded p-3 text-center ${report.passRate >= 0.8 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <p className="text-2xl font-bold">{(report.passRate * 100).toFixed(1)}%</p>
                <p className="text-sm text-gray-600">通过率</p>
              </div>
            </div>

            <div className="rounded border">
              <div className="border-b bg-gray-50 px-4 py-2 font-medium">测试结果详情</div>
              <div className="max-h-96 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">用例</th>
                      <th className="px-4 py-2 text-left">状态</th>
                      <th className="px-4 py-2 text-left">耗时</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.results.map((r, i) => (
                      <tr key={i} className={r.passed ? '' : 'bg-red-50'}>
                        <td className="px-4 py-2">{r.name}</td>
                        <td className="px-4 py-2">
                          {r.passed ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-red-600">✗</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {r.scanTime ? `${r.scanTime.toFixed(2)}ms` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              平均扫描时间: {report.avgScanTime.toFixed(2)}ms
            </div>
          </div>
        )}
      </div>
    )
  },
}
