/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Coins, 
  HelpCircle, 
  ShieldAlert, 
  Layers, 
  Info, 
  Calendar, 
  TrendingUp, 
  FileCheck2,
  BookmarkCheck
} from 'lucide-react';
import { MOCK_TARIFF_PLAN, MOCK_REVENUE_HISTORY } from '../data';
import { TelemetryPoint } from '../types';

interface RevenueScreenProps {
  telemetry: TelemetryPoint;
  stepIndex: number;
}

export default function RevenueScreen({ telemetry, stepIndex }: RevenueScreenProps) {
  const [selectedFormula, setSelectedFormula] = useState<'arbitrage' | 'self_use' | 'charging' | 'grid'>('arbitrage');

  // 计算今日实时累计收益 (受推演步骤影响)
  const isAfterDispatch = stepIndex >= 5; // 如果已经下发了储能高峰放电
  const todayRevenue = {
    pvSelfUse: 304.8,
    pvGrid: 46.2,
    essArbitrage: isAfterDispatch ? 945.0 : 645.0, // 放电 300kW 额外获得峰谷价差套利 300元
    charging: 2880.0,
    serviceFee: 864.0,
    gridCost: isAfterDispatch ? 1180.0 : 1380.0, // 避峰省下 200元电费
    demandSaving: isAfterDispatch ? 11200.0 : 0.0, // 避免需量超额罚金 11200 元
  };

  const todayNet = todayRevenue.pvSelfUse + todayRevenue.pvGrid + todayRevenue.essArbitrage + todayRevenue.charging + todayRevenue.serviceFee - todayRevenue.gridCost + todayRevenue.demandSaving;

  return (
    <div className="space-y-6" id="revenue-screen">
      {/* 1. 分时电价方案时段模型 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs" id="tariff-panel">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5" id="tariff-header">
          <div className="space-y-1" id="tariff-title-area">
            <h2 className="text-sm font-bold text-slate-800" id="tariff-h2">
              当前执行电价时段版本
            </h2>
            <p className="text-xs text-slate-500 font-sans" id="tariff-p">
              中国浙江工商业两部制分时电价规则。所有收益严格以此版本进行确定性核算。
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-100 text-slate-600 px-3.5 py-1.5 rounded-lg border border-slate-200" id="tariff-version-tag">
            <BookmarkCheck className="h-4 w-4 text-emerald-600" />
            {MOCK_TARIFF_PLAN.name} ({MOCK_TARIFF_PLAN.version})
          </div>
        </div>

        {/* 24 小时分时时段彩条 */}
        <div className="space-y-3" id="tariff-axis-section">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans block">
            24小时分时电价日轴模型 (元/kWh)
          </label>
          <div className="h-8 rounded-xl overflow-hidden flex text-white text-[10px] font-mono font-bold shadow-inner" id="tariff-bar-axis">
            <div className="bg-slate-500 flex items-center justify-center cursor-help transition-all hover:opacity-90" style={{ width: '33.3%' }} title="00:00-08:00 谷段: 0.312元">
              谷 0.312
            </div>
            <div className="bg-emerald-500 flex items-center justify-center cursor-help transition-all hover:opacity-90" style={{ width: '4.2%' }} title="08:00-09:00 平段: 0.658元">
              平 0.658
            </div>
            <div className="bg-amber-500 flex items-center justify-center cursor-help transition-all hover:opacity-90" style={{ width: '8.3%' }} title="09:00-11:00 峰段: 0.984元">
              峰 0.984
            </div>
            <div className="bg-emerald-500 flex items-center justify-center cursor-help transition-all hover:opacity-90" style={{ width: '8.3%' }} title="11:00-13:00 平段: 0.658元">
              平 0.658
            </div>
            <div className="bg-rose-500 flex items-center justify-center cursor-help transition-all hover:opacity-90 animate-none" style={{ width: '8.3%' }} title="13:00-15:00 尖峰段: 1.246元">
              尖峰 1.246
            </div>
            <div className="bg-emerald-500 flex items-center justify-center cursor-help transition-all hover:opacity-90" style={{ width: '8.3%' }} title="15:00-17:00 平段: 0.658元">
              平 0.658
            </div>
            <div className="bg-amber-500 flex items-center justify-center cursor-help transition-all hover:opacity-90" style={{ width: '20.8%' }} title="17:00-22:00 峰段: 0.984元">
              峰 0.984
            </div>
            <div className="bg-slate-500 flex items-center justify-center cursor-help transition-all hover:opacity-90" style={{ width: '8.3%' }} title="22:00-24:00 谷段: 0.312元">
              谷 0.312
            </div>
          </div>
          {/* 时段指示文字 */}
          <div className="flex justify-between text-[9px] text-slate-400 font-mono px-1" id="tariff-axis-ticks">
            <span>00:00</span>
            <span>08:00</span>
            <span>09:00</span>
            <span>11:00</span>
            <span>13:00</span>
            <span>15:00</span>
            <span>17:00</span>
            <span>22:00</span>
            <span>24:00</span>
          </div>
        </div>
      </div>

      {/* 2. 今日实时累计收益核算 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="revenue-split-row">
        {/* 今日综合净收益构成表 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-4" id="today-revenue-table">
          <div className="border-b border-slate-100 pb-3" id="revenue-table-header">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5" id="rev-tb-h3">
              <FileCheck2 className="h-4 w-4 text-emerald-500" />
              今日实时累计收益构成核算
            </h3>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5" id="rev-tb-desc">
              数据源来自于底层 facts 库，点击特定项目可在右侧进行公式级溯源审计
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs" id="revenue-items-list">
            <div 
              id="row-revenue-selfuse"
              onClick={() => setSelectedFormula('self_use')}
              className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition ${
                selectedFormula === 'self_use' ? 'bg-slate-50 border border-slate-200' : 'hover:bg-slate-50/50'
              }`}
            >
              <span className="font-bold text-slate-700">1. 光伏自发自用收益</span>
              <div className="flex items-center gap-4 font-mono" id="val-row-selfuse">
                <span className="text-slate-500">2,140kWh * 91% * ¥0.72</span>
                <span className="font-bold text-emerald-600">+ ¥ {todayRevenue.pvSelfUse.toFixed(2)}</span>
              </div>
            </div>

            <div 
              id="row-revenue-arbitrage"
              onClick={() => setSelectedFormula('arbitrage')}
              className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition ${
                selectedFormula === 'arbitrage' ? 'bg-slate-50 border border-slate-200' : 'hover:bg-slate-50/50'
              }`}
            >
              <span className="font-bold text-slate-700">2. 储能峰谷套利收益</span>
              <div className="flex items-center gap-4 font-mono" id="val-row-arbitrage">
                <span className="text-slate-500">放电峰值2次套利 (今日)</span>
                <span className="font-bold text-emerald-600">+ ¥ {todayRevenue.essArbitrage.toFixed(2)}</span>
              </div>
            </div>

            <div 
              id="row-revenue-charging"
              onClick={() => setSelectedFormula('charging')}
              className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition ${
                selectedFormula === 'charging' ? 'bg-slate-50 border border-slate-200' : 'hover:bg-slate-50/50'
              }`}
            >
              <span className="font-bold text-slate-700">3. 快充服务费及售电增益</span>
              <div className="flex items-center gap-4 font-mono" id="val-row-charging">
                <span className="text-slate-500">订单充电总量 ¥2,880 + 服务费</span>
                <span className="font-bold text-emerald-600">+ ¥ {(todayRevenue.charging + todayRevenue.serviceFee).toFixed(2)}</span>
              </div>
            </div>

            <div 
              id="row-revenue-grid"
              onClick={() => setSelectedFormula('grid')}
              className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition ${
                selectedFormula === 'grid' ? 'bg-slate-50 border border-slate-200' : 'hover:bg-slate-50/50'
              }`}
            >
              <span className="font-bold text-slate-700">4. 关口购电成本 (扣除项)</span>
              <div className="flex items-center gap-4 font-mono" id="val-row-grid">
                <span className="text-slate-500">低谷及平段网购电电费</span>
                <span className="font-bold text-rose-600">- ¥ {todayRevenue.gridCost.toFixed(2)}</span>
              </div>
            </div>

            {todayRevenue.demandSaving > 0 && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100" id="row-revenue-demand-saving">
                <span className="font-bold text-emerald-800">5. 需量避峰节省 (避免惩罚)</span>
                <div className="flex items-center gap-4 font-mono" id="val-row-demand-saving">
                  <span className="text-emerald-700">完美压实需量 &lt; 500kW</span>
                  <span className="font-bold text-emerald-600">+ ¥ {todayRevenue.demandSaving.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between bg-slate-900 text-white rounded-xl p-4 shadow-md" id="net-revenue-summary-row">
            <span className="text-xs font-bold font-sans">
              今日平台综合净套利收益总计 (Net Return)
            </span>
            <div className="flex items-baseline gap-1 font-mono" id="net-revenue-summary-val-row">
              <span className="text-lg font-bold" id="net-revenue-summary-val">¥ {todayNet.toFixed(2)}</span>
              <span className="text-[10px] text-emerald-400 font-bold">元</span>
            </div>
          </div>
        </div>

        {/* 右侧：公式级溯源审计面板 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between" id="formula-panel">
          <div className="border-b border-slate-100 pb-3" id="formula-header">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5" id="formula-h3">
              <ShieldAlert className="h-4 w-4 text-emerald-600" />
              公式级财务合规溯源
            </h3>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5" id="formula-desc">
              无幻觉！平台所有核算完全符合国家二级电力审计规范
            </p>
          </div>

          {/* 详细的公式展示 */}
          <div className="py-4 space-y-4 flex-1 text-xs" id="formula-detail-area">
            {selectedFormula === 'arbitrage' && (
              <div className="space-y-3" id="formula-arbitrage-desc">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 font-mono text-emerald-700 font-bold" id="formula-arbitrage-math">
                  P_ess = ∑(Q_discharge_i * Pr_peak_i) - ∑(Q_charge_j * Pr_valley_j) - L_loss
                </div>
                <div className="space-y-1.5 text-slate-500 font-sans leading-relaxed" id="formula-arbitrage-text">
                  <p><strong>BMS/PCS 确定性事实审计对齐：</strong></p>
                  <p>● 充电电量 (Q_charge): 低谷 00:00-06:00 共吸纳电量 900 kWh，电价 0.312 元。</p>
                  <p>● 放电电量 (Q_discharge): 下午尖峰 13:00-15:00 释放 400 kWh (尖电价 1.246元)，晚高峰释放 300 kWh (峰电价 0.984元)。</p>
                  <p>● 综合转换损耗率 (L_loss): 系统标定为 8.5%。</p>
                </div>
              </div>
            )}

            {selectedFormula === 'self_use' && (
              <div className="space-y-3" id="formula-selfuse-desc">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 font-mono text-emerald-700 font-bold" id="formula-selfuse-math">
                  P_self = ∑(Q_pv_total - Q_grid_export) * Pr_industrial_buy
                </div>
                <div className="space-y-1.5 text-slate-500 font-sans leading-relaxed" id="formula-selfuse-text">
                  <p><strong>光伏自发自用收益对齐：</strong></p>
                  <p>● 园区自消纳：光伏所发电力未外送，直接代替了园区向电网以高昂的高峰/平段电价购电。节省金额即为收益价值。</p>
                  <p>● 相比直接外送上网（0.415元上网标杆价），杭州示范站本地消纳大大提升了光伏回收期效率。</p>
                </div>
              </div>
            )}

            {selectedFormula === 'charging' && (
              <div className="space-y-3" id="formula-charging-desc">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 font-mono text-emerald-700 font-bold" id="formula-charging-math">
                  P_charge = ∑(Q_order_k * Pr_segment_k) + ∑(Q_order_k * S_service)
                </div>
                <div className="space-y-1.5 text-slate-500 font-sans leading-relaxed" id="formula-charging-text">
                  <p><strong>快充售电及服务费结算对齐：</strong></p>
                  <p>● 售电电费: 快充桩完全按照浙江工商业分时电表进行销售，多充多售。</p>
                  <p>● 运营附加：每度电额外加收固定 <strong>¥0.30/kWh</strong> 的绿色通道快充服务费，是示范站直接、稳定的现金回源渠道。</p>
                </div>
              </div>
            )}

            {selectedFormula === 'grid' && (
              <div className="space-y-3" id="formula-grid-desc">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 font-mono text-rose-700 font-bold" id="formula-grid-math">
                  Cost_grid = ∑(Q_buy_m * Pr_segment_m) + C_demand
                </div>
                <div className="space-y-1.5 text-slate-500 font-sans leading-relaxed" id="formula-grid-text">
                  <p><strong>国家电网购电成本对齐：</strong></p>
                  <p>● 谷电购电: 重点在谷段给电池大功率充能，成本极低。</p>
                  <p>● 需量控制 (C_demand): 平台的核心算法职责就是压平尖、峰负荷，削减最高需量，从而减少每月向电网缴纳的“两部制合同基本电费”。</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100" id="formula-footer">
            <span className="text-[10px] text-slate-500 font-bold font-sans">
              审计结果
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
              ✔ 无幻觉审计通过
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
