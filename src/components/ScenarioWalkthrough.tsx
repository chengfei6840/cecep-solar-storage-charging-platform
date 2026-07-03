/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, CheckCircle2, ChevronRight, HelpCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { Scenario, ScenarioStep } from '../types';

interface ScenarioWalkthroughProps {
  scenarios: Scenario[];
  activeScenarioId: string;
  onScenarioChange: (id: string) => void;
  currentStepIndex: number;
  onNextStep: () => void;
  onReset: () => void;
  isProcessing: boolean;
}

export default function ScenarioWalkthrough({
  scenarios,
  activeScenarioId,
  onScenarioChange,
  currentStepIndex,
  onNextStep,
  onReset,
  isProcessing
}: ScenarioWalkthroughProps) {
  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];
  const steps = activeScenario.steps;

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm" id="scenario-walkthrough">
      {/* 顶部控制选择区 */}
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100" id="scenario-header">
        <div className="flex items-center gap-3" id="scenario-title-area">
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100" id="scenario-icon-container">
            <Play className="h-4 w-4 fill-emerald-600" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 flex items-center gap-2" id="sc-h1">
              智能运营 Agentic 推演盘
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                交互式演示模式
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium max-w-2xl mt-0.5" id="sc-desc">
              {activeScenario.description}
            </p>
          </div>
        </div>

        {/* 场景切换下拉及重置 */}
        <div className="flex items-center gap-2" id="scenario-controls">
          <label className="text-xs font-semibold text-slate-600 font-sans" id="switch-scenario-label">
            选择演练场景:
          </label>
          <select
            id="scenario-selector-dropdown"
            value={activeScenarioId}
            onChange={(e) => onScenarioChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            {scenarios.map(s => (
              <option key={s.id} value={s.id}>{s.name.split('：')[1] || s.name}</option>
            ))}
          </select>

          <button
            id="btn-reset-scenario"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition font-medium cursor-pointer"
            title="重置推演状态"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            重置
          </button>
        </div>
      </div>

      {/* 步骤流式指示器 */}
      <div className="px-6 py-5 bg-slate-50/50 overflow-x-auto" id="scenario-steps-container">
        <div className="flex items-stretch min-w-max gap-4" id="scenario-steps-list">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isActive = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <div
                key={step.id}
                id={`step-card-${index}`}
                className={`w-64 rounded-xl border p-4.5 transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-emerald-500 bg-white shadow-md ring-2 ring-emerald-500/10 scale-102'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20 opacity-80'
                    : 'border-slate-200 bg-white opacity-60'
                }`}
              >
                {/* 步骤序号与执行人 */}
                <div className="flex items-center justify-between mb-2.5" id={`step-header-${index}`}>
                  <div className="flex items-center gap-1.5" id={`step-badge-row-${index}`}>
                    <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                      isActive 
                        ? 'bg-emerald-600 text-white' 
                        : isCompleted 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-100 text-slate-500'
                    }`} id={`step-num-${index}`}>
                      STEP {step.id}
                    </span>
                    <span className="text-[10px] font-sans font-bold text-slate-400" id={`step-actor-label-${index}`}>
                      {step.actor}
                    </span>
                  </div>
                  {isCompleted && (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 fill-emerald-50/50" id={`step-complete-icon-${index}`} />
                  )}
                  {isActive && (
                    <span className="flex h-2 w-2 relative" id={`step-active-ping-${index}`}>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                    </span>
                  )}
                </div>

                {/* 步骤内容说明 */}
                <div className="flex-1" id={`step-body-${index}`}>
                  <h3 className={`text-xs font-bold leading-relaxed mb-1 ${isActive ? 'text-emerald-700' : 'text-slate-700'}`} id={`step-title-${index}`}>
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans line-clamp-3 hover:line-clamp-none transition-all duration-300" id={`step-desc-${index}`}>
                    {step.description}
                  </p>
                </div>

                {/* 交互操作区 */}
                {isActive && (
                  <div className="mt-4" id={`step-action-area-${index}`}>
                    {step.actionRequired ? (
                      <button
                        id={`btn-trigger-action-${index}`}
                        disabled={isProcessing}
                        onClick={onNextStep}
                        className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-[11px] font-bold py-2 px-3 rounded-lg hover:from-emerald-700 hover:to-emerald-600 shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {isProcessing ? 'Agent计算中...' : step.actionLabel || '开始下一步'}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 font-semibold" id={`step-auto-running-${index}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Agent 自动执行中...
                      </div>
                    )}
                  </div>
                )}

                {!isActive && isPending && (
                  <div className="mt-4 border-t border-dashed border-slate-100 pt-2.5 flex items-center gap-1 text-[10px] text-slate-400 font-sans" id={`step-pending-status-${index}`}>
                    <HelpCircle className="h-3 w-3" />
                    等待上一步完成
                  </div>
                )}

                {isCompleted && (
                  <div className="mt-4 border-t border-dashed border-emerald-100/50 pt-2.5 flex items-center gap-1 text-[10px] text-emerald-600/80 font-mono font-medium" id={`step-completed-status-${index}`}>
                    ● 完成
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
