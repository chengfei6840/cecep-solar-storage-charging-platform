/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Cpu, 
  Terminal, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert,
  Send,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { AgentMetadata, ToolMetadata, AgentType } from '../types';
import { AGENT_DIRECTORY, SYSTEM_TOOLS } from '../data';

interface ThoughtNode {
  agentType: AgentType;
  agentName: string;
  avatar: string;
  time: string;
  type: 'thought' | 'tool_call' | 'observation' | 'decision';
  content: string;
}

interface AgentWorkspaceProps {
  currentScenarioStepIndex: number;
  activeScenarioId: string;
  thoughtChain: ThoughtNode[];
  onQuickQuery: (query: string, agentType: AgentType) => void;
  isProcessing: boolean;
}

export default function AgentWorkspace({
  currentScenarioStepIndex,
  activeScenarioId,
  thoughtChain,
  onQuickQuery,
  isProcessing
}: AgentWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'chain' | 'team' | 'tools'>('chain');
  const [customQuery, setCustomQuery] = useState('');

  // 高频快捷问题，根据场景或通常业务
  const quickQueries = [
    { text: '分析当前能流拓扑转化效率', agentType: 'DataAgent' },
    { text: '审计电价方案各时段收益率', agentType: 'RevenueAgent' },
    { text: '一键估算电池温升老化损失', agentType: 'MonitorAgent' },
    { text: '生成示范站低碳绿电ESG报告', agentType: 'CarbonAgent' }
  ] as const;

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim() || isProcessing) return;
    // 默认分配给 MonitorAgent 接收
    onQuickQuery(customQuery.trim(), 'MonitorAgent');
    setCustomQuery('');
  };

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full text-slate-300" id="agent-workspace">
      {/* 工作台头部 */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between" id="workspace-header">
        <div className="flex items-center gap-2" id="header-title-row">
          <Cpu className="h-5 w-5 text-emerald-400" />
          <span className="font-sans font-bold text-sm text-white tracking-wide">
            Agentic 协同工作台
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono bg-emerald-900/40 text-emerald-400 px-2.5 py-1 rounded-full font-bold border border-emerald-800/60" id="orchestrator-status">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          ORCHESTRATOR LIVE
        </div>
      </div>

      {/* 选项卡切换 */}
      <div className="flex border-b border-slate-800 text-xs text-center" id="workspace-tabs">
        <button
          id="tab-chain"
          onClick={() => setActiveTab('chain')}
          className={`flex-1 py-3 font-semibold transition-all cursor-pointer ${
            activeTab === 'chain' 
              ? 'text-emerald-400 border-b-2 border-emerald-500 bg-slate-950/20' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
          }`}
        >
          协同思考链
        </button>
        <button
          id="tab-team"
          onClick={() => setActiveTab('team')}
          className={`flex-1 py-3 font-semibold transition-all cursor-pointer ${
            activeTab === 'team' 
              ? 'text-emerald-400 border-b-2 border-emerald-500 bg-slate-950/20' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
          }`}
        >
          AI 专家团队
        </button>
        <button
          id="tab-tools"
          onClick={() => setActiveTab('tools')}
          className={`flex-1 py-3 font-semibold transition-all cursor-pointer ${
            activeTab === 'tools' 
              ? 'text-emerald-400 border-b-2 border-emerald-500 bg-slate-950/20' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
          }`}
        >
          工具沙盒
        </button>
      </div>

      {/* 核心内容展示区 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="workspace-content">
        {/* 1. 协同思考链 Tab */}
        {activeTab === 'chain' && (
          <div className="space-y-4.5" id="thought-chain-panel">
            {thoughtChain.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center justify-center gap-3 text-slate-500" id="chain-empty">
                <Terminal className="h-10 w-10 text-slate-700 animate-pulse" />
                <div className="text-xs font-medium font-sans">等待演练动作或 AI 指令触发...</div>
                <p className="text-[10px] text-slate-600 max-w-xs font-sans leading-relaxed">
                  点击顶部的 “推演场景步骤” 或下方 “快捷问题”，即可在此捕获 Multi-Agent 多阶链式思考与物理工具调用审计。
                </p>
              </div>
            ) : (
              <div className="relative border-l border-slate-800 ml-3.5 pl-4 space-y-5" id="chain-list">
                {thoughtChain.map((node, i) => {
                  let badgeColor = 'bg-slate-800 text-slate-300';
                  let icon = '💭';
                  if (node.type === 'tool_call') {
                    badgeColor = 'bg-amber-950/80 text-amber-400 border border-amber-800/50';
                    icon = '🛠';
                  } else if (node.type === 'observation') {
                    badgeColor = 'bg-blue-950/80 text-blue-400 border border-blue-800/50';
                    icon = '👁';
                  } else if (node.type === 'decision') {
                    badgeColor = 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50';
                    icon = '💡';
                  }

                  return (
                    <div key={i} className="relative group transition-all" id={`thought-node-${i}`}>
                      {/* 头像圆点 */}
                      <span className="absolute -left-7.5 top-0.5 h-6 w-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs shadow-md" id={`node-avatar-${i}`}>
                        {node.avatar}
                      </span>

                      {/* 节点气泡 */}
                      <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5 space-y-2 shadow-sm" id={`node-bubble-${i}`}>
                        <div className="flex items-center justify-between text-[10px] font-sans" id={`node-meta-${i}`}>
                          <span className="font-bold text-slate-300" id={`node-name-${i}`}>{node.agentName}</span>
                          <div className="flex items-center gap-1.5 text-slate-500 font-mono" id={`node-time-row-${i}`}>
                            <Clock className="h-3 w-3" />
                            {node.time}
                          </div>
                        </div>

                        {/* 状态标志 */}
                        <div className="flex" id={`node-badge-row-${i}`}>
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded flex items-center gap-1 ${badgeColor}`} id={`node-badge-${i}`}>
                            <span>{icon}</span>
                            {node.type}
                          </span>
                        </div>

                        {/* 文本内容 */}
                        <p className="text-[11px] font-sans text-slate-400 leading-relaxed whitespace-pre-wrap select-text" id={`node-content-${i}`}>
                          {node.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. AI 专家团队 Tab */}
        {activeTab === 'team' && (
          <div className="space-y-3" id="ai-team-panel">
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed font-sans px-1">
              基于AI+低碳园区微电网数字化平台项目配备了 6 位专业 Agent。由 Orchestrator 进行工作流编排，所有决策最终都必须通过数据库事实源进行，确保没有数据幻觉。
            </p>
            <div className="space-y-2.5" id="agent-list">
              {AGENT_DIRECTORY.map((agent) => (
                <div key={agent.type} className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 flex gap-3 hover:border-slate-700/80 transition-all" id={`agent-card-${agent.type}`}>
                  <span className="text-xl bg-slate-850 h-9 w-9 rounded-lg flex items-center justify-center border border-slate-700/50 shadow-inner" id={`agent-avatar-${agent.type}`}>
                    {agent.avatar}
                  </span>
                  <div className="space-y-1 flex-1" id={`agent-info-${agent.type}`}>
                    <h4 className="text-xs font-bold text-slate-200" id={`agent-name-${agent.type}`}>{agent.name}</h4>
                    <p className="text-[10px] text-emerald-400 font-semibold font-sans" id={`agent-role-${agent.type}`}>{agent.role}</p>
                    <ul className="text-[9px] text-slate-400 space-y-0.5 list-disc pl-3 pt-1 font-sans leading-normal" id={`agent-resp-${agent.type}`}>
                      {agent.responsibilities.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. 工具沙盒 Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-3.5" id="tools-panel">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2" id="sandbox-warning">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs font-sans" id="warning-header">
                <ShieldAlert className="h-4 w-4 animate-pulse" />
                最高安全原则 (Highest Security Directive)
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                根据架构原则，高风险工具（如 <strong>Level 3 控制指令</strong>）严禁由 Agent 自由、静默执行。在无人工审批授权（Approval=false）和控制下发许可之前，设备物理写入接口锁定为 <strong>disabled (enabled=false)</strong>。
              </p>
            </div>

            <div className="space-y-2.5" id="tool-list">
              {SYSTEM_TOOLS.map((tool) => {
                let riskColor = 'bg-slate-800 text-slate-400';
                let riskLabel = 'Level 0 (只读查询)';
                if (tool.riskLevel === 1) {
                  riskColor = 'bg-blue-950 text-blue-400';
                  riskLabel = 'Level 1 (写业务记录)';
                } else if (tool.riskLevel === 2) {
                  riskColor = 'bg-amber-950 text-amber-400';
                  riskLabel = 'Level 2 (修改业务参数)';
                } else if (tool.riskLevel === 3) {
                  riskColor = 'bg-rose-950 text-rose-400 border border-rose-900/40';
                  riskLabel = 'Level 3 (高险设备控制)';
                }

                return (
                  <div key={tool.name} className="bg-slate-950/20 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700/60 transition" id={`tool-card-${tool.name}`}>
                    <div className="flex items-start justify-between gap-2" id={`tool-header-${tool.name}`}>
                      <code className="text-[10.5px] font-mono text-emerald-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800" id={`tool-code-name-${tool.name}`}>
                        {tool.name}
                      </code>
                      <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded ${riskColor}`} id={`tool-risk-badge-${tool.name}`}>
                        {riskLabel}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 font-sans mt-2 leading-relaxed" id={`tool-desc-${tool.name}`}>
                      {tool.description}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-[9px] text-slate-500 font-mono gap-1" id={`tool-footer-${tool.name}`}>
                      <span id={`tool-approv-${tool.name}`}>
                        审批要求: <strong className={tool.requiresApproval ? 'text-amber-400' : 'text-slate-400'}>{tool.requiresApproval ? 'YES' : 'NO'}</strong>
                      </span>
                      <span className="flex items-center gap-1" id={`tool-status-badge-col-${tool.name}`}>
                        物理使能: 
                        <span className={`inline-flex h-2 w-2 rounded-full ${tool.enabled ? 'bg-emerald-500' : 'bg-rose-500'}`} id={`tool-status-dot-${tool.name}`}></span>
                        <strong className={tool.enabled ? 'text-emerald-500' : 'text-rose-500'} id={`tool-status-txt-${tool.name}`}>{tool.enabled ? 'ENABLED' : 'DISABLED'}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 底部 AI 专家交互提问区 */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3" id="workspace-footer-interactive">
        {/* 快捷按钮 */}
        <div className="flex flex-wrap gap-1.5" id="quick-queries-list">
          {quickQueries.map((q, idx) => (
            <button
              key={idx}
              id={`quick-query-btn-${idx}`}
              disabled={isProcessing}
              onClick={() => onQuickQuery(q.text, q.agentType)}
              className="text-[10px] font-sans font-medium bg-slate-800 hover:bg-slate-700/80 active:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-750 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Sparkles className="h-2.5 w-2.5 text-emerald-400" />
              {q.text}
            </button>
          ))}
        </div>

        {/* 输入框表单 */}
        <form onSubmit={handleSubmitCustom} className="flex gap-2" id="custom-query-form">
          <input
            id="custom-query-input"
            type="text"
            value={customQuery}
            disabled={isProcessing}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder={isProcessing ? "Agent正在拼装数据..." : "向安全运营管家/财务专家提问..."}
            className="flex-1 bg-slate-800 border border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
          />
          <button
            id="btn-send-query"
            type="submit"
            disabled={isProcessing || !customQuery.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg p-2.5 cursor-pointer flex items-center justify-center transition shadow-md shadow-emerald-900/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
