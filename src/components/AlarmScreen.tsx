/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  MessageSquare,
  Clock,
  Briefcase,
  FileSpreadsheet
} from 'lucide-react';
import { AlarmEvent, AlarmStatus } from '../types';

interface AlarmScreenProps {
  alarms: AlarmEvent[];
  onAcknowledge: (id: string, comment: string) => void;
  onDeclareFalsePositive: (id: string) => void;
  onClearAlarm: (id: string) => void;
}

export default function AlarmScreen({
  alarms,
  onAcknowledge,
  onDeclareFalsePositive,
  onClearAlarm
}: AlarmScreenProps) {
  return (
    <div className="space-y-6" id="alarm-screen">
      {/* 头部信息 */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4" id="alarm-header">
        <div className="space-y-1" id="alarm-title-area">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2" id="alarm-h2">
            <BellRing className="h-5 w-5 text-rose-500" />
            告警事件与智能闭环中心
          </h2>
          <p className="text-xs text-slate-500 font-sans" id="alarm-p">
            所有告警均来源于真实遥测、第三方网关或规则引擎。结合 MonitorAgent 进行智能解释及故障影响金额量化。
          </p>
        </div>
        <div className="flex items-center gap-2" id="alarm-summary-badge">
          <span className="text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-100 px-3.5 py-1.5 rounded-lg">
            待处理故障: {alarms.filter(a => a.status === 'new' || a.status === 'acknowledged' || a.status === 'processing').length} 个
          </span>
        </div>
      </div>

      {/* 告警事件卡片流列表 */}
      <div className="space-y-4.5" id="alarm-events-flow-list">
        {alarms.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3" id="alarms-empty">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <div className="text-xs font-bold text-slate-700">全系统运行安全无故障</div>
            <p className="text-[11px] text-slate-500 max-w-sm">
              当前示范站所有逆变器、电池、枪桩、变流器、通信端口遥测指标均在绿色健康区间。
            </p>
          </div>
        ) : (
          alarms.map((alarm) => {
            let levelBadge = 'bg-slate-100 text-slate-600';
            if (alarm.level === 'critical') levelBadge = 'bg-red-100 text-red-700 font-bold border border-red-200';
            else if (alarm.level === 'major') levelBadge = 'bg-amber-100 text-amber-700 font-bold border border-amber-200';
            else if (alarm.level === 'minor') levelBadge = 'bg-blue-100 text-blue-700 border border-blue-200';

            const isPending = alarm.status === 'new';

            return (
              <div 
                key={alarm.id} 
                id={`alarm-card-${alarm.id}`}
                className={`bg-white border rounded-2xl p-6 shadow-xs transition-all relative overflow-hidden ${
                  isPending ? 'border-rose-300 ring-2 ring-rose-500/5' : 'border-slate-200'
                }`}
              >
                {/* 1. 顶部基本信息 */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-3" id={`alarm-card-header-${alarm.id}`}>
                  <div className="space-y-1" id={`alarm-card-title-col-${alarm.id}`}>
                    <div className="flex items-center gap-2" id={`alarm-card-badge-row-${alarm.id}`}>
                      <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${levelBadge}`} id={`alarm-level-badge-${alarm.id}`}>
                        {alarm.level}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400" id={`alarm-id-label-${alarm.id}`}>
                        ID: {alarm.id} | traceId: {alarm.traceId}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-800" id={`alarm-title-${alarm.id}`}>
                      {alarm.title}
                    </h3>
                  </div>

                  <span className={`text-[10px] font-sans font-extrabold px-2.5 py-1 rounded-full ${
                    alarm.status === 'closed' || alarm.status === 'recovered'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse'
                  }`} id={`alarm-status-tag-${alarm.id}`}>
                    状态: {alarm.status.toUpperCase()}
                  </span>
                </div>

                {/* 2. 故障事实描述 */}
                <div className="py-4 space-y-2.5" id={`alarm-body-${alarm.id}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs" id={`alarm-fact-grid-${alarm.id}`}>
                    <div className="space-y-1" id={`alarm-fact-col-left-${alarm.id}`}>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">触发点位设备</span>
                      <p className="font-bold text-slate-700" id={`alarm-device-${alarm.id}`}>{alarm.deviceName || '示范站关口电表'}</p>
                    </div>
                    <div className="space-y-1" id={`alarm-fact-col-right-${alarm.id}`}>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">首次发生时间</span>
                      <p className="text-slate-600 font-mono" id={`alarm-time-${alarm.id}`}>{alarm.triggerTime}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs text-slate-600 leading-relaxed font-sans" id={`alarm-desc-box-${alarm.id}`}>
                    <strong>故障原始记录：</strong> {alarm.description}
                  </div>
                </div>

                {/* 3. MonitorAgent 智能诊断分析 (如果存在) */}
                {alarm.aiExplanation && (
                  <div className="bg-slate-900 text-slate-300 rounded-xl p-4 space-y-3 border border-slate-800 mb-4" id={`alarm-ai-agent-box-${alarm.id}`}>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2" id={`alarm-ai-header-${alarm.id}`}>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold" id={`alarm-ai-title-${alarm.id}`}>
                        <MessageSquare className="h-4 w-4" />
                        MonitorAgent 安全运营管家 智能研判
                      </div>
                      {alarm.revenueImpact !== undefined && (
                        <span className="text-[10px] font-mono font-bold bg-rose-950/80 text-rose-400 border border-rose-900/40 px-2 py-0.5 rounded" id={`alarm-ai-loss-${alarm.id}`}>
                          估算直接经济风险：¥ {alarm.revenueImpact} 元
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed font-sans text-slate-400" id={`alarm-ai-expl-${alarm.id}`}>
                      <strong>故障成因：</strong> {alarm.aiExplanation}
                    </p>
                    <p className="text-[11px] leading-relaxed font-sans text-slate-400 border-t border-dashed border-slate-800 pt-2" id={`alarm-ai-advice-${alarm.id}`}>
                      <strong>运营修复策略：</strong> {alarm.aiRemedyAdvice}
                    </p>
                  </div>
                )}

                {/* 4. 人工闭环决策操作栏 */}
                {isPending && (
                  <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4" id={`alarm-action-bar-${alarm.id}`}>
                    <button
                      id={`btn-declare-fp-${alarm.id}`}
                      onClick={() => onDeclareFalsePositive(alarm.id)}
                      className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-lg transition cursor-pointer font-bold"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      标记误报 (False Positive)
                    </button>
                    <button
                      id={`btn-acknowledge-${alarm.id}`}
                      onClick={() => onAcknowledge(alarm.id, '运维人员人工确认：故障真实有效，开始排查。')}
                      className="flex items-center gap-1 text-[11px] text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 px-4 py-2 rounded-lg transition shadow-md shadow-emerald-950/20 cursor-pointer font-bold"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      确认故障并启动修复
                    </button>
                  </div>
                )}

                {alarm.status === 'acknowledged' && (
                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-4" id={`alarm-action-bar-ack-${alarm.id}`}>
                    <button
                      id={`btn-resolve-${alarm.id}`}
                      onClick={() => onClearAlarm(alarm.id)}
                      className="text-[11px] text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg transition cursor-pointer font-bold"
                    >
                      手动完成修复并关闭
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
