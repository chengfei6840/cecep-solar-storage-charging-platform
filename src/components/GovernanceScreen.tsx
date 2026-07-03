/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  Power, 
  RotateCcw, 
  Lock, 
  CheckCircle,
  AlertOctagon,
  FileText
} from 'lucide-react';
import { AuditLog } from '../types';

interface GovernanceScreenProps {
  auditLogs: AuditLog[];
  onClearLogs: () => void;
}

export default function GovernanceScreen({ auditLogs, onClearLogs }: GovernanceScreenProps) {
  const [llmDegraded, setLlmDegraded] = useState(false);

  return (
    <div className="space-y-6" id="governance-screen">
      {/* 1. LLM 故障安全降级机制 (Fail-safe) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center" id="degrade-panel">
        <div className="md:col-span-2 space-y-1.5" id="degrade-desc-col">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5" id="degrade-h2">
            <AlertOctagon className={`h-5 w-5 ${llmDegraded ? 'text-amber-500 animate-pulse' : 'text-slate-500'}`} />
            LLM 物理自保降级机制 (Fail-safe Mode)
          </h2>
          <p className="text-xs text-slate-500 font-sans leading-relaxed" id="degrade-p">
            当大模型外部服务不可用（延迟超限、API Keys 鉴权中断、网络阻塞）时，系统基础能力如 <strong>数据接入、运行监测、分时收益核算、物理告警生成、人工审批流转</strong> 等事实源能力不中断。Agent 仅有的“解释与摘要建议”能力将安全回落至结构化模板，不产生系统性瘫痪。
          </p>
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-150 gap-2" id="degrade-switch-col">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wide block" id="degrade-switch-label">
            系统当前 LLM 降级模式
          </span>
          <button
            id="btn-toggle-degrade"
            onClick={() => setLlmDegraded(!llmDegraded)}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-md ${
              llmDegraded 
                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/10' 
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/10'
            }`}
          >
            <Power className="h-4 w-4" />
            {llmDegraded ? 'LLM 降级激活 (FAIL-SAFE ON)' : 'LLM 正常运行 (HEALTHY)'}
          </button>
          <span className="text-[9px] text-slate-400 font-mono" id="degrade-switch-meta">
            {llmDegraded ? '模板安全回退已生效' : '全系统 Agentic 高级思考就绪'}
          </span>
        </div>
      </div>

      {/* 2. 多源审计事实追踪日志 (Audit Trails) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4" id="audit-trail-panel">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3" id="audit-header">
          <div className="space-y-0.5" id="audit-title-area">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5" id="audit-h3">
              <Terminal className="h-4.5 w-4.5 text-emerald-600" />
              多源审计事实追踪审计 (Audit Trails)
            </h3>
            <p className="text-[10px] text-slate-500 font-sans" id="audit-desc">
              记录所有数据接入、字段标准化映射、Agent 运行、工具物理调用及人工授权签名 trace 链
            </p>
          </div>

          <button
            id="btn-clear-audit"
            onClick={onClearLogs}
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 px-3 py-1.5 rounded-lg transition font-bold cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            清空审计日志
          </button>
        </div>

        {/* 日志流显示 */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-950 font-mono text-xs text-slate-300" id="audit-logs-display">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between text-[10px] text-slate-500 font-bold" id="audit-logs-display-header">
            <span>TIMESTAMP | CATEGORY</span>
            <span>TRACE ID | OPERATOR | TRACE</span>
          </div>
          <div className="divide-y divide-slate-900 h-96 overflow-y-auto" id="audit-logs-rows-container">
            {auditLogs.length === 0 ? (
              <div className="text-center py-20 text-slate-600 text-[10px]" id="audit-empty-view">
                --- 无审计日志事实记录 ---
              </div>
            ) : (
              auditLogs.map((log) => {
                let catColor = 'text-slate-500';
                if (log.category === 'agent') catColor = 'text-purple-400';
                else if (log.category === 'tool_call') catColor = 'text-amber-400';
                else if (log.category === 'approval') catColor = 'text-emerald-400';
                else if (log.category === 'dispatch') catColor = 'text-rose-400';
                else if (log.category === 'sync') catColor = 'text-cyan-400';

                return (
                  <div key={log.id} className="p-3.5 flex items-start gap-4 hover:bg-slate-900/40 text-[10.5px]" id={`audit-row-${log.id}`}>
                    <div className="flex-shrink-0 w-36 text-slate-500" id={`audit-time-${log.id}`}>
                      {log.timestamp.split(' ')[1] || log.timestamp} <span className={`text-[9px] uppercase font-bold ml-1.5 ${catColor}`}>{log.category}</span>
                    </div>
                    <div className="flex-1 space-y-1" id={`audit-details-col-${log.id}`}>
                      <p className="text-slate-200 leading-normal font-sans" id={`audit-title-text-${log.id}`}>
                        {log.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9.5px] text-slate-500" id={`audit-meta-row-${log.id}`}>
                        <span id={`audit-operator-${log.id}`}>Operator: <strong className="text-slate-400">{log.operator}</strong></span>
                        <span id={`audit-trace-${log.id}`}>traceId: <strong className="text-slate-400">{log.traceId}</strong></span>
                        <span id={`audit-detail-${log.id}`} className="text-slate-600 line-clamp-1 select-all" title={log.details}>Payload: {log.details}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
