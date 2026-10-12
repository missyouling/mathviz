import { useState } from 'react'

interface SliderParam {
  key: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
}

interface ParameterPanelProps {
  title: string
  params: SliderParam[]
  onChange: (key: string, value: number) => void
  className?: string
}

export default function ParameterPanel({ title, params, onChange, className = '' }: ParameterPanelProps) {
  // 移动端默认折叠参数列表，节省首屏空间；桌面端保持展开
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className={`bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 overflow-hidden transition-all duration-300 ${className}`}>
      {/* 标题栏 */}
      <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 flex-1">{title}</h3>
          {/* 移动端折叠按钮 */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="md:hidden p-2 -mr-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label={collapsed ? '展开参数' : '折叠参数'}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 参数列表（移动端可折叠） */}
      <div className={`p-5 space-y-5 ${collapsed ? 'hidden md:block' : ''}`}>
        {params.map((param) => {
          const percentage = ((param.value - param.min) / (param.max - param.min)) * 100

          return (
            <div key={param.key} className="group">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-600">{param.label}</label>
                <span className="px-2.5 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg text-sm font-semibold text-indigo-600 tabular-nums">
                  {param.value.toFixed(param.step && param.step < 1 ? 2 : 0)}
                  {param.unit && <span className="text-indigo-400 ml-0.5">{param.unit}</span>}
                </span>
              </div>

              {/* 自定义滑块容器 */}
              <div className="relative h-6 flex items-center">
                {/* 轨道背景 */}
                <div className="absolute inset-x-0 h-2 bg-slate-100 rounded-full overflow-hidden">
                  {/* 填充进度 */}
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-150"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* 原生滑块（透明，用于交互） */}
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step || 1}
                  value={param.value}
                  onChange={(e) => onChange(param.key, parseFloat(e.target.value))}
                  className="relative w-full h-6 appearance-none bg-transparent cursor-pointer z-10"
                />
              </div>

              {/* 范围标签 */}
              <div className="flex justify-between mt-1.5 text-xs text-slate-400">
                <span>{param.min}{param.unit || ''}</span>
                <span>{param.max}{param.unit || ''}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
