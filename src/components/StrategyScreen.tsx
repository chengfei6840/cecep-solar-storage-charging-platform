/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Workflow, 
  TrendingUp, 
  ShieldCheck, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Layers,
  Sparkles,
  FileText
} from 'lucide-react';
import { TelemetryPoint } from '../types';

interface StrategyScreenProps {
  telemetry: TelemetryPoint;
  stepIndex: number;
  onApproveDispatch: () => void;
  isProcessing: boolean;
}

export default function StrategyScreen({
  telemetry,
  stepIndex,
  onApproveDispatch,
  isProcessing
}: StrategyScreenProps) {
  const isPendingApproval = stepIndex === 3; // 触发到了步骤 3：发起调度计划审批
  const isApproved = stepIndex >= 4;         // 已经点击通过

  // 1. 生成 24 小时功率仿真对比曲线数据 (手绘 SVG 曲线点)
  // [00:00 - 24:00] 的典型削峰放电曲线
  const mockHours = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'];
  
  // 曲线 A: 未削峰的电网购电功率 (在 10:00 突发极高充电负荷)
  const buyCurveUncontrolled = [100, 80, 82, 100, 110, 780, 270, 330, 270, 400, 380, 210];
  // 曲线 B: 协同控制后的电网购电功率 (在 10:00 电池大功率放电 300kW)
  const buyCurveControlled = [100, 80, 82, 100, 110, 480, 270, 330, 270, 240, 380, 210];

  // 映射到 SVG (宽 520, 高 150)
  const pointsUncontrolled = buyCurveUncontrolled.map((val, i) => {
    const x = 50 + i * 40;
    const y = 140 - (val / 900) * 110;
    return `${x},${y}`;
  }).join(' ');

  const pointsControlled = buyCurveControlled.map((val, i) => {
    const x = 50 + i * 40;
    const y = 140 - (val / 900) * 110;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-6" id="strategy-screen">
      {/* 1. 顶部日前/日内调度计划曲线 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs" id="simulation-chart-panel">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5" id="sim-header">
          <div className="space-y-1" id="sim-title-area">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5" id="sim-h2">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-600" />
              日前光储充一体化协同调度仿真曲线 (24h)
            </h2>
            <p className="text-xs text-slate-500 font-sans" id="sim-p">
              StrategyAgent 通过气象、充电大巴概率模型仿真出最优日前调度。红虚线为 500kW 合同需量峰值。
            </p>
          </div>
          <div className="flex items-center gap-2" id="sim-legend">
            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold" id="lg-uncontrolled">
              <span className="h-1 w-3 bg-rose-400 inline-block"></span>
              原计划负荷曲线
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold" id="lg-controlled">
              <span className="h-1 w-3 bg-emerald-500 inline-block"></span>
              削峰优化后购电
            </span>
          </div>
        </div>

        {/* 功率曲线 SVG */}
        <div className="relative py-2" id="simulation-svg-container">
          <svg viewBox="0 0 540 160" className="w-full h-full" id="sim-svg">
            {/* 网格背景 */}
            <line x1="50" y1="30" x2="490" y2="30" stroke="#f8fafc" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="50" y1="80" x2="490" y2="80" stroke="#f8fafc" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="50" y1="140" x2="490" y2="140" stroke="#e2e8f0" strokeWidth="1" />

            {/* 500 kW 红虚线需量上限限额 */}
            <line 
              id="limit-line"
              x1="50" 
              y1={140 - (500 / 900) * 110} 
              x2="490" 
              y2={140 - (500 / 900) * 110} 
              stroke="#ef4444" 
              strokeWidth="1.5" 
              strokeDasharray="4 4" 
            />
            <text x="440" y={140 - (500 / 900) * 110 - 6} fill="#ef4444" fontSize="8" fontWeight="bold" fontFamily="monospace" id="limit-text">
              合同需量上限 500kW
            </text>

            {/* 坐标轴纵轴文本 */}
            <text x="15" y="34" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">900kW</text>
            <text x="15" y="84" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">450kW</text>
            <text x="15" y="144" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">0kW</text>

            {/* 1. 原计划负荷曲线 (未削峰) */}
            <path
              d={`M ${pointsUncontrolled}`}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeDasharray="3 3"
              id="path-uncontrolled"
            />

            {/* 2. 削峰优化后电网购电 (绿色实线) */}
            <path
              d={`M ${pointsControlled}`}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              id="path-controlled"
            />

            {/* 充放电 PCS 示意小横条 (底板色条) */}
            {/* 10点-12点 (对应 index 5) 充电放电柱状指示 */}
            <g transform="translate(210, 140)" id="ess-discharge-bar-g">
              <rect x="-10" y="-80" width="20" height="80" fill="#10b981" opacity="0.15" rx="3" />
              <text x="0" y="-86" textAnchor="middle" fill="#047857" fontSize="8" fontWeight="bold" fontFamily="sans">储能放电300kW</text>
            </g>

            {/* 横轴小时点 */}
            {mockHours.map((h, i) => {
              const x = 50 + i * 40;
              return (
                <text key={i} x={x} y="154" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace" id={`hour-tick-${i}`}>
                  {h}:00
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 2. 高风险 Level 3 物理调度计划审批单 */}
      {isPendingApproval && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-md animate-none" id="dispatch-approval-box">
          <div className="flex items-start gap-4" id="dispatch-header-row">
            <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 border border-rose-200 animate-pulse" id="dispatch-icon-box">
              <AlertTriangle className="h-5.5 w-5.5" />
            </div>
            <div className="space-y-1 flex-1" id="dispatch-meta-col">
              <div className="flex items-center gap-2" id="dispatch-badge-row">
                <span className="text-[9px] font-mono font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded">
                  LEVEL 3 高险设备控制
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  审批单编号: APV-ZJ01-20260630 | traceId: tr-dsp-9921475
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-800">
                储能变流器 (PCS) 紧急高峰削峰调度计划 - 待您最终审批下发
              </h3>
            </div>
          </div>

          <div className="py-4 space-y-3.5 text-xs text-slate-600 border-b border-rose-100 pb-4 mt-3" id="dispatch-details-area">
            <p className="font-sans leading-relaxed">
              <strong>事件背景：</strong> 园区突发大功率充电负荷，实测需量达到 <strong>{telemetry.demand} kW</strong>，越限超出 500kW 协议线。MonitorAgent 估算不控制将产生罚金 11,200元。
            </p>
            <div className="bg-white border border-rose-100 rounded-xl p-4 space-y-2.5 font-sans" id="dispatch-proposals">
              <p className="font-bold text-rose-800">StrategyAgent 协同调度对策建议：</p>
              <p>1. <strong>PCS 储能调度：</strong> 10:40 起下发紧急大功率放电指令 <strong>+300 kW</strong>。持续时间 1.5 小时，使电池荷电状态降至 15% 截止线，规避越峰。</p>
              <p>2. <strong>快充功率策略：</strong> 限制 12-16号充电枪最大功率 10%（软压限，乘用车车主不明显察觉，保安全性）。</p>
              <p className="text-emerald-700 font-bold">✔ 仿真预期成效：最大需量压平在 480 kW，避免全部需量加罚，今日综合收益净增加 ¥ 11,200.</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4" id="dispatch-actions">
            <button
              id="btn-dispatch-reject"
              className="px-4 py-2 text-xs text-rose-700 bg-white hover:bg-rose-100 border border-rose-200 rounded-lg transition font-bold cursor-pointer"
            >
              驳回调度 (保持原样)
            </button>
            <button
              id="btn-dispatch-approve"
              disabled={isProcessing}
              onClick={onApproveDispatch}
              className="flex items-center gap-1.5 px-5 py-2 text-xs text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 rounded-lg transition shadow-md shadow-emerald-500/10 font-bold cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              {isProcessing ? '正在生成审计凭据...' : '同意并下发物理调度'}
            </button>
          </div>
        </div>
      )}

      {/* 3. 已审批执行提示 */}
      {isApproved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4 text-xs text-emerald-800" id="dispatch-executed-box">
          <CheckCircle className="h-8 w-8 text-emerald-500 flex-shrink-0" />
          <div className="space-y-1" id="dispatch-executed-text">
            <h4 className="font-bold text-emerald-900">调度控制执行生效中：</h4>
            <p>日前/日内协同调度已通过人工审批（Approver: 您），Orchestrator 联动执行网关物理下发 <code>storage.dispatch_discharge(300kW)</code> 成功。当前关口削峰表现正常，事实已被封存记入 <code>dispatch_execution_log</code>，traceId = tr-dsp-9921475。</p>
          </div>
        </div>
      )}
    </div>
  );
}
