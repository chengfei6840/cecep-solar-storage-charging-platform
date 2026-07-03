/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Sun, 
  BatteryCharging, 
  Zap, 
  Building2, 
  Gauge, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Leaf,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { TelemetryPoint, Station, AlarmEvent } from '../types';

interface DashboardScreenProps {
  station: Station;
  telemetry: TelemetryPoint;
  alarms: AlarmEvent[];
  onScreenChange: (screen: any) => void;
  scenarioId: string;
  stepIndex: number;
}

export default function DashboardScreen({
  station,
  telemetry,
  alarms,
  onScreenChange,
  scenarioId,
  stepIndex
}: DashboardScreenProps) {
  // 找出未处理的高级报警
  const activeCriticalAlarms = alarms.filter(a => a.status === 'new' && (a.level === 'critical' || a.level === 'major'));

  // 1. 判断当前的能流动画流向和速率
  // essPower 正放负充。pvPower > 0 恒发电。chargerPower 充电。baseLoad 基荷。gridPower 购电(正)售电(负)
  const isESSCharging = telemetry.essPower < 0;
  const isESSDischarging = telemetry.essPower > 0;
  const gridPowerVal = telemetry.gridPower;
  const isSellingToGrid = gridPowerVal < 0;

  // 2. 模拟收益大屏的渐变面积图数据 (使用 7 日模拟数据)
  const chartData = [
    { label: '06-24', val: 1944.7, pv: 329.7, ess: 645.0, chg: 2756.0 },
    { label: '06-25', val: 2069.1, pv: 332.1, ess: 645.0, chg: 3042.0 },
    { label: '06-26', val: 1750.8, pv: 266.8, ess: 590.0, chg: 2574.0 },
    { label: '06-27', val: 2159.2, pv: 369.2, ess: 645.0, chg: 3185.0 },
    { label: '06-28', val: 2039.2, pv: 350.2, ess: 645.0, chg: 2964.0 },
    { label: '06-29', val: 2304.9, pv: 334.9, ess: 645.0, chg: 3445.0 },
    { label: '06-30', val: telemetry.demand > 500 && stepIndex < 4 ? -8500 : 2479.8, pv: 351.0, ess: isESSDischarging ? 850 : 645.0, chg: telemetry.chargerPower * 6.5 } // 今日受惩罚或今日高套利
  ];

  const maxChartVal = 3500;
  const points = chartData.map((d, i) => {
    const x = 50 + i * 85;
    const normVal = Math.max(0, d.val + 2000); // 抬高避免负值画出画布
    const maxNorm = maxChartVal + 2000;
    const y = 160 - (normVal / maxNorm) * 110;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-6" id="dashboard-screen">
      {/* 1. 顶部红色突发越限/告警横幅（带点击直达） */}
      {activeCriticalAlarms.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm animate-pulse" id="alert-banner">
          <div className="flex items-center gap-3" id="alert-banner-left">
            <div className="h-9 w-9 rounded-lg bg-red-100 flex items-center justify-center text-red-600 border border-red-200" id="alert-banner-icon">
              <AlertTriangle className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-red-800" id="alert-banner-title">
                安全运营警报：突发 {activeCriticalAlarms[0].title} 已触发！
              </h3>
              <p className="text-[11px] text-red-600 font-sans mt-0.5" id="alert-banner-desc">
                {activeCriticalAlarms[0].deviceName} - 故障点位监测值为 {activeCriticalAlarms[0].description}。
              </p>
            </div>
          </div>
          <button
            id="btn-goto-alarm-panel"
            onClick={() => onScreenChange('alarms')}
            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
          >
            一键处置
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 2. 核心 KPI 数据指标面板 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" id="kpi-grid">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 flex items-center justify-between shadow-xs relative overflow-hidden" id="kpi-card-pv">
          <div className="space-y-1.5" id="kpi-col-pv">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider font-sans block">今日光伏发电</span>
            <div className="flex items-baseline gap-1" id="kpi-val-row-pv">
              <span className="text-lg font-mono font-bold text-slate-800" id="kpi-val-pv">2,140</span>
              <span className="text-[10px] text-slate-500 font-bold font-sans">kWh</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 font-sans" id="kpi-sub-pv">
              自消纳率 91.2%
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100" id="kpi-icon-pv">
            <Sun className="h-5 w-5 fill-amber-500/20" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 flex items-center justify-between shadow-xs relative overflow-hidden" id="kpi-card-ess">
          <div className="space-y-1.5" id="kpi-col-ess">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider font-sans block">储能充放状态</span>
            <div className="flex items-baseline gap-1" id="kpi-val-row-ess">
              <span className="text-lg font-mono font-bold text-slate-800" id="kpi-val-ess">{telemetry.essPower}</span>
              <span className="text-[10px] text-slate-500 font-bold font-sans">kW</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium font-mono" id="kpi-sub-ess">
              SOC {telemetry.soc}% | {telemetry.batteryTemp}°C
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100" id="kpi-icon-ess">
            <BatteryCharging className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 flex items-center justify-between shadow-xs relative overflow-hidden" id="kpi-card-chg">
          <div className="space-y-1.5" id="kpi-col-chg">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider font-sans block">今日快充负荷</span>
            <div className="flex items-baseline gap-1" id="kpi-val-row-chg">
              <span className="text-lg font-mono font-bold text-slate-800" id="kpi-val-chg">{telemetry.chargerPower}</span>
              <span className="text-[10px] text-slate-500 font-bold font-sans">kW</span>
            </div>
            <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-0.5 font-sans" id="kpi-sub-chg">
              16枪枪桩在线率 100%
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-cyan-50 text-cyan-500 flex items-center justify-center border border-cyan-100" id="kpi-icon-chg">
            <Zap className="h-5 w-5 fill-cyan-500/20" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 flex items-center justify-between shadow-xs relative overflow-hidden animate-none" id="kpi-card-demand">
          <div className="space-y-1.5" id="kpi-col-demand">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider font-sans block">实时需量越限报警</span>
            <div className="flex items-baseline gap-1" id="kpi-val-row-demand">
              <span className={`text-lg font-mono font-bold ${telemetry.demand > 500 ? 'text-rose-600' : 'text-slate-800'}`} id="kpi-val-demand">{telemetry.demand}</span>
              <span className="text-[10px] text-slate-500 font-bold font-sans">/ 500 kW</span>
            </div>
            <span className={`text-[10px] font-bold font-sans flex items-center gap-0.5 ${telemetry.demand > 500 ? 'text-rose-500 animate-pulse' : 'text-emerald-600'}`} id="kpi-sub-demand">
              {telemetry.demand > 500 ? '⚠️ 超额：罚金超 8,500元' : '✔ 安全运行区'}
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100" id="kpi-icon-demand">
            <Gauge className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 flex items-center justify-between shadow-xs relative overflow-hidden" id="kpi-card-carbon">
          <div className="space-y-1.5" id="kpi-col-carbon">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider font-sans block">今日园区节碳</span>
            <div className="flex items-baseline gap-1" id="kpi-val-row-carbon">
              <span className="text-lg font-mono font-bold text-slate-800" id="kpi-val-carbon">1,486</span>
              <span className="text-[10px] text-slate-500 font-bold font-sans">kg CO₂</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 font-sans" id="kpi-sub-carbon">
              相当于植树 81 棵
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100" id="kpi-icon-carbon">
            <Leaf className="h-5 w-5 fill-emerald-500/20" />
          </div>
        </div>
      </div>

      {/* 3. SVG 实时流光能流拓扑图 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="topo-chart-row">
        {/* 能流图面板 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-2 shadow-xs flex flex-col justify-between" id="topo-panel">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3" id="topo-header">
            <div>
              <h2 className="text-xs font-bold text-slate-800" id="topo-title">
                园区一体化准实时能流拓扑图
              </h2>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5" id="topo-desc">
                根据物理遥测事实绘制，流光方向与虚线运动速率与功率成正比
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full font-bold font-mono" id="topo-status-tag">
              <ShieldCheck className="h-3.5 w-3.5" />
              数据质量合格
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="relative flex items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800/80 aspect-video lg:aspect-auto lg:h-[290px]" id="topo-svg-container">
            <svg 
              id="energy-flow-svg"
              viewBox="0 0 600 300" 
              className="w-full h-full max-w-lg"
            >
              {/* 定义渐变和流光 */}
              <defs>
                <linearGradient id="glow-pv" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="glow-ess" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="glow-grid" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                </linearGradient>

                {/* 流光小球滤镜 */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* 核心连接主路径 */}
              {/* 1. 光伏 (120, 60) -> 汇流主中心 (300, 150) */}
              <path 
                id="path-pv-hub"
                d="M 120,60 L 300,150" 
                fill="none" 
                stroke="#475569" 
                strokeWidth="2" 
                strokeDasharray="4 4"
                className="transition-all"
              />
              {/* 光伏流光小球 */}
              {telemetry.pvPower > 0 && (
                <circle id="flow-pv-hub" r="5" fill="#f59e0b" filter="url(#glow)">
                  <animateMotion 
                    dur={`${Math.max(1, 10 - telemetry.pvPower / 50)}s`} 
                    repeatCount="indefinite" 
                    path="M 120,60 L 300,150" 
                  />
                </circle>
              )}

              {/* 2. 储能 (120, 240) <-> 汇流主中心 (300, 150) */}
              <path 
                id="path-ess-hub"
                d="M 120,240 L 300,150" 
                fill="none" 
                stroke="#475569" 
                strokeWidth="2" 
                strokeDasharray="4 4"
                className="transition-all"
              />
              {/* 储能放电：电池(120, 240) -> 主中心(300, 150) */}
              {isESSDischarging && (
                <circle id="flow-ess-discharge" r="5" fill="#10b981" filter="url(#glow)">
                  <animateMotion 
                    dur={`${Math.max(1, 10 - telemetry.essPower / 40)}s`} 
                    repeatCount="indefinite" 
                    path="M 120,240 L 300,150" 
                  />
                </circle>
              )}
              {/* 储能充电：主中心(300, 150) -> 电池(120, 240) */}
              {isESSCharging && (
                <circle id="flow-ess-charge" r="5" fill="#a7f3d0" filter="url(#glow)">
                  <animateMotion 
                    dur={`${Math.max(1, 10 - Math.abs(telemetry.essPower) / 40)}s`} 
                    repeatCount="indefinite" 
                    path="M 300,150 L 120,240" 
                  />
                </circle>
              )}

              {/* 3. 国家电网计量点 (300, 40) <-> 汇流主中心 (300, 150) */}
              <path 
                id="path-grid-hub"
                d="M 300,40 L 300,150" 
                fill="none" 
                stroke="#475569" 
                strokeWidth="2" 
                strokeDasharray="4 4"
                className="transition-all"
              />
              {/* 电网购电：Grid(300, 40) -> 主中心(300, 150) */}
              {gridPowerVal > 0 && (
                <circle id="flow-grid-buy" r="5" fill="#3b82f6" filter="url(#glow)">
                  <animateMotion 
                    dur={`${Math.max(1, 12 - gridPowerVal / 50)}s`} 
                    repeatCount="indefinite" 
                    path="M 300,40 L 300,150" 
                  />
                </circle>
              )}
              {/* 电网余电上网：主中心(300, 150) -> Grid(300, 40) */}
              {isSellingToGrid && (
                <circle id="flow-grid-sell" r="5" fill="#60a5fa" filter="url(#glow)">
                  <animateMotion 
                    dur={`${Math.max(1, 12 - Math.abs(gridPowerVal) / 50)}s`} 
                    repeatCount="indefinite" 
                    path="M 300,150 L 300,40" 
                  />
                </circle>
              )}

              {/* 4. 汇流主中心 (300, 150) -> 充电桩群 (480, 80) */}
              <path 
                id="path-hub-chg"
                d="M 300,150 L 480,80" 
                fill="none" 
                stroke="#475569" 
                strokeWidth="2" 
                strokeDasharray="4 4"
                className="transition-all"
              />
              {telemetry.chargerPower > 0 && (
                <circle id="flow-hub-chg" r="5" fill="#06b6d4" filter="url(#glow)">
                  <animateMotion 
                    dur={`${Math.max(1, 10 - telemetry.chargerPower / 50)}s`} 
                    repeatCount="indefinite" 
                    path="M 300,150 L 480,80" 
                  />
                </circle>
              )}

              {/* 5. 汇流主中心 (300, 150) -> 园区负荷 (480, 220) */}
              <path 
                id="path-hub-load"
                d="M 300,150 L 480,220" 
                fill="none" 
                stroke="#475569" 
                strokeWidth="2" 
                strokeDasharray="4 4"
                className="transition-all"
              />
              {telemetry.baseLoad > 0 && (
                <circle id="flow-hub-load" r="5" fill="#ec4899" filter="url(#glow)">
                  <animateMotion 
                    dur={`${Math.max(1, 12 - telemetry.baseLoad / 40)}s`} 
                    repeatCount="indefinite" 
                    path="M 300,150 L 480,220" 
                  />
                </circle>
              )}

              {/* 拓扑节点图形与文字 */}
              {/* A. 光伏节点 */}
              <g transform="translate(120, 60)" id="node-pv-g">
                <circle r="22" fill="#1e293b" stroke="#f59e0b" strokeWidth="2.5" />
                <path d="M-8,-8 L8,8 M-8,8 L8,-8 M-12,0 L12,0 M0,-12 L0,12" stroke="#f59e0b" strokeWidth="1" opacity="0.4" />
                <circle r="8" fill="#f59e0b" />
                <text x="0" y="38" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">光伏发电</text>
                <text x="0" y="-28" textAnchor="middle" fill="#f59e0b" fontSize="11" fontFamily="monospace" fontWeight="extrabold">{telemetry.pvPower} kW</text>
              </g>

              {/* B. 储能节点 */}
              <g transform="translate(120, 240)" id="node-ess-g">
                <circle r="22" fill="#1e293b" stroke="#10b981" strokeWidth="2.5" />
                <rect x="-10" y="-12" width="20" height="24" rx="2" fill="none" stroke="#10b981" strokeWidth="2" />
                <rect x="-8" y="-9" width="16" height="18" fill="#10b981" opacity="0.6" />
                <rect x="-4" y="-15" width="8" height="3" fill="#10b981" />
                <text x="0" y="38" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">MWh储能电池</text>
                <text x="0" y="-28" textAnchor="middle" fill="#10b981" fontSize="11" fontFamily="monospace" fontWeight="extrabold">
                  {telemetry.essPower > 0 ? `+${telemetry.essPower}` : telemetry.essPower} kW
                </text>
              </g>

              {/* C. 电网关口节点 */}
              <g transform="translate(300, 40)" id="node-grid-g">
                <circle r="22" fill="#1e293b" stroke="#3b82f6" strokeWidth="2.5" />
                <polygon points="0,-12 10,6 -10,6" fill="none" stroke="#3b82f6" strokeWidth="2" />
                <polygon points="0,-6 5,3 -5,3" fill="#3b82f6" />
                <text x="0" y="-28" textAnchor="middle" fill="#3b82f6" fontSize="11" fontFamily="monospace" fontWeight="extrabold">{telemetry.gridPower} kW</text>
                <text x="0" y="38" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">10kV电网关口</text>
              </g>

              {/* D. 快充桩节点 */}
              <g transform="translate(480, 80)" id="node-chg-g">
                <circle r="22" fill="#1e293b" stroke="#06b6d4" strokeWidth="2.5" />
                <rect x="-10" y="-12" width="20" height="24" rx="2" fill="none" stroke="#06b6d4" strokeWidth="2" />
                <path d="M-4,-4 L4,4 M4,-4 L-4,4" stroke="#06b6d4" strokeWidth="1.5" />
                <circle r="4" fill="#06b6d4" />
                <text x="0" y="38" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">快充桩群</text>
                <text x="0" y="-28" textAnchor="middle" fill="#06b6d4" fontSize="11" fontFamily="monospace" fontWeight="extrabold">{telemetry.chargerPower} kW</text>
              </g>

              {/* E. 园区负荷节点 */}
              <g transform="translate(480, 220)" id="node-load-g">
                <circle r="22" fill="#1e293b" stroke="#ec4899" strokeWidth="2.5" />
                <path d="M-12,8 L-12,-4 L0,-12 L12,-4 L12,8 Z" fill="none" stroke="#ec4899" strokeWidth="2" />
                <rect x="-4" y="0" width="8" height="8" fill="#ec4899" />
                <text x="0" y="38" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">园区基荷</text>
                <text x="0" y="-28" textAnchor="middle" fill="#ec4899" fontSize="11" fontFamily="monospace" fontWeight="extrabold">{telemetry.baseLoad} kW</text>
              </g>

              {/* F. 汇流中心枢纽 */}
              <g transform="translate(300, 150)" id="node-hub-g">
                <circle r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
                <circle r="5" fill="#f8fafc" className="animate-pulse" />
              </g>
            </svg>
          </div>
        </div>

        {/* 右侧：7日收益折线大盘 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between" id="net-revenue-chart-panel">
          <div className="border-b border-slate-100 pb-3" id="revenue-chart-header">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5" id="rev-h2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              最近7日综合套利收益趋势
            </h2>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5" id="rev-desc">
              今日峰谷套利及服务费增益实时测算
            </p>
          </div>

          {/* 手写 SVG 折线图 */}
          <div className="relative py-2 flex-1 flex items-center justify-center" id="revenue-svg-container">
            <svg viewBox="0 0 550 180" className="w-full h-full" id="revenue-trend-svg">
              {/* 网格虚线背景 */}
              <line x1="50" y1="50" x2="520" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="50" y1="100" x2="520" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="50" y1="150" x2="520" y2="150" stroke="#e2e8f0" strokeWidth="1" />

              {/* 纵轴文本 */}
              <text x="15" y="54" fill="#94a3b8" fontSize="9" fontFamily="monospace">3.0k</text>
              <text x="15" y="104" fill="#94a3b8" fontSize="9" fontFamily="monospace">1.5k</text>
              <text x="15" y="154" fill="#94a3b8" fontSize="9" fontFamily="monospace">0.0k</text>

              {/* 渐变色定义 */}
              <defs>
                <linearGradient id="area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* 面积填充 */}
              <path
                d={`M 50,150 L ${points} L 520,150 Z`}
                fill="url(#area-grad)"
                id="revenue-area"
              />

              {/* 折线路径 */}
              <path
                d={`M ${points}`}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                id="revenue-line"
              />

              {/* 折线小圆点与标签 */}
              {chartData.map((d, i) => {
                const x = 50 + i * 85;
                const normVal = Math.max(0, d.val + 2000);
                const maxNorm = maxChartVal + 2000;
                const y = 160 - (normVal / maxNorm) * 110;
                const isToday = i === chartData.length - 1;

                return (
                  <g key={i} id={`point-g-${i}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isToday ? 5 : 4}
                      fill={isToday ? '#ef4444' : '#10b981'}
                      stroke="white"
                      strokeWidth="1.5"
                      className={isToday ? 'animate-pulse' : ''}
                    />
                    <text
                      x={x}
                      y={y - 10}
                      textAnchor="middle"
                      fill={d.val < 0 ? '#ef4444' : '#475569'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {d.val < 0 ? `-${Math.abs(d.val)}` : `¥${Math.round(d.val)}`}
                    </text>
                    <text
                      x={x}
                      y="170"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9.5"
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100" id="revenue-summary-footer">
            <span className="text-[10px] text-slate-500 font-bold font-sans">
              今日峰谷价格差（均值）
            </span>
            <span className="text-xs font-mono font-bold text-slate-800">
              ¥0.934 / kWh
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
