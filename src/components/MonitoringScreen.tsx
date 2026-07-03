/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sun, 
  Battery, 
  Zap, 
  Gauge, 
  Wifi, 
  AlertTriangle, 
  Thermometer, 
  TrendingUp, 
  FileSpreadsheet,
  Layers,
  CircleDot
} from 'lucide-react';
import { TelemetryPoint, Device } from '../types';
import { MOCK_DEVICES } from '../data';

interface MonitoringScreenProps {
  telemetry: TelemetryPoint;
}

export default function MonitoringScreen({ telemetry }: MonitoringScreenProps) {
  const [activeSubTab, setActiveSubTab] = useState<'pv' | 'ess' | 'charger' | 'demand'>('pv');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden" id="monitoring-screen">
      {/* 内部子 Tab 切换条 */}
      <div className="flex border-b border-slate-200 bg-slate-50/50" id="mon-tab-bar">
        {(['pv', 'ess', 'charger', 'demand'] as const).map((tab) => {
          let label = '光伏系统';
          let Icon = Sun;
          let color = 'text-amber-500';
          if (tab === 'ess') {
            label = '储能系统';
            Icon = Battery;
            color = 'text-emerald-500';
          } else if (tab === 'charger') {
            label = '快充桩群';
            Icon = Zap;
            color = 'text-cyan-500';
          } else if (tab === 'demand') {
            label = '电网与需量';
            Icon = Gauge;
            color = 'text-rose-500';
          }

          const isActive = activeSubTab === tab;
          return (
            <button
              key={tab}
              id={`mon-tab-btn-${tab}`}
              onClick={() => setActiveSubTab(tab)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-bold border-r border-slate-200 transition-all cursor-pointer ${
                isActive 
                  ? 'bg-white text-slate-800 border-b-2 border-b-emerald-600' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${isActive ? color : 'text-slate-400'}`} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab 内容 */}
      <div className="p-6" id="mon-tab-content">
        {/* 1. 光伏系统 */}
        {activeSubTab === 'pv' && (
          <div className="space-y-6" id="mon-pv-panel">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="pv-sub-grid">
              <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100 flex flex-col justify-between" id="pv-sub-card-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">光伏实时电功率</span>
                <div className="text-xl font-mono font-bold text-slate-800 mt-2" id="pv-power-text">{telemetry.pvPower} kW</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1" id="pv-power-sub">当前组件出力率：{(telemetry.pvPower / 4.5).toFixed(1)} %</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100 flex flex-col justify-between" id="pv-sub-card-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">今日累计发电量</span>
                <div className="text-xl font-mono font-bold text-slate-800 mt-2">2,140 kWh</div>
                <div className="text-[10px] text-slate-500 font-medium mt-1">昨日全天：1,980 kWh</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100 flex flex-col justify-between" id="pv-sub-card-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">自发自用绿电量</span>
                <div className="text-xl font-mono font-bold text-slate-800 mt-2">1,951 kWh</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1">本地消纳绿电占比：91.2 %</div>
              </div>
            </div>

            {/* 逆变器详情列表 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden" id="pv-inverter-table">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 text-xs font-bold text-slate-700">
                光伏并网逆变器遥测列表
              </div>
              <div className="divide-y divide-slate-100 text-xs" id="inverter-rows">
                <div className="flex items-center justify-between p-4" id="inv-row-1">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="font-bold text-slate-700">1号逆变器 (SG250HX)</span>
                  </div>
                  <div className="flex items-center gap-8 font-mono" id="inv-meta-1">
                    <span>当前功率: <strong>{Math.round(telemetry.pvPower * 0.55)} kW</strong></span>
                    <span>输出电压: <strong className="text-slate-500">400 V</strong></span>
                    <span>电参频率: <strong className="text-slate-500">50.02 Hz</strong></span>
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-sans font-bold text-[10px]">并网运行中</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4" id="inv-row-2">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="font-bold text-slate-700">2号逆变器 (SG200HX)</span>
                  </div>
                  <div className="flex items-center gap-8 font-mono" id="inv-meta-2">
                    <span>当前功率: <strong>{Math.round(telemetry.pvPower * 0.45)} kW</strong></span>
                    <span>输出电压: <strong className="text-slate-500">401 V</strong></span>
                    <span>电参频率: <strong className="text-slate-500">50.01 Hz</strong></span>
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-sans font-bold text-[10px]">并网运行中</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. 储能系统 */}
        {activeSubTab === 'ess' && (
          <div className="space-y-6" id="mon-ess-panel">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="ess-sub-grid">
              {/* 电池组电参 */}
              <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100 flex flex-col justify-between" id="ess-card-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">变流器 PCS 功率</span>
                <div className="text-lg font-mono font-bold text-slate-800 mt-2" id="ess-p-text">
                  {telemetry.essPower > 0 ? `放电: +${telemetry.essPower}` : telemetry.essPower < 0 ? `充电: ${telemetry.essPower}` : '热备用: 0'} kW
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-1">最大额定：500 kW</div>
              </div>
              {/* SOC */}
              <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100 flex flex-col justify-between" id="ess-card-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">电池荷电状态 (SOC)</span>
                <div className="flex items-center gap-3 mt-2" id="soc-row">
                  <div className="text-lg font-mono font-bold text-slate-800">{telemetry.soc} %</div>
                  {/* 立体电池条 */}
                  <div className="flex-1 h-3.5 bg-slate-200 rounded-md border border-slate-300 relative overflow-hidden" id="soc-battery-progress">
                    <div 
                      id="soc-battery-fill"
                      className="h-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${telemetry.soc}%` }}
                    />
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-1">充放循环剩余寿命：约 5,850 次</div>
              </div>
              {/* SOH */}
              <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100 flex flex-col justify-between" id="ess-card-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">电池健康状态 (SOH)</span>
                <div className="text-lg font-mono font-bold text-slate-800 mt-2">97.8 %</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1">模组无衰减断线风险</div>
              </div>
              {/* 舱内温度 */}
              <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100 flex flex-col justify-between" id="ess-card-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">电芯最高热传感器温度</span>
                <div className="flex items-center gap-1.5 text-lg font-mono font-bold text-slate-800 mt-2" id="temp-row">
                  <Thermometer className={`h-4.5 w-4.5 ${telemetry.batteryTemp > 45 ? 'text-amber-500 animate-pulse' : 'text-slate-500'}`} />
                  <span className={telemetry.batteryTemp > 45 ? 'text-amber-600 font-bold' : ''}>{telemetry.batteryTemp} °C</span>
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-1">强排风冷状态：{telemetry.batteryTemp > 45 ? '强冷启动中' : '自动模式'}</div>
              </div>
            </div>
          </div>
        )}

        {/* 3. 快充桩群 */}
        {activeSubTab === 'charger' && (
          <div className="space-y-6" id="mon-charger-panel">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="chg-sub-grid">
              <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100 flex flex-col justify-between" id="chg-card-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">快充枪桩综合功率</span>
                <div className="text-xl font-mono font-bold text-slate-800 mt-2">{telemetry.chargerPower} kW</div>
                <div className="text-[10px] text-slate-500 mt-1">最大配额：720 kW</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100 flex flex-col justify-between" id="chg-card-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">活跃快快充枪数 / 总数</span>
                <div className="text-xl font-mono font-bold text-slate-800 mt-2">
                  {telemetry.chargerPower > 400 ? '14' : telemetry.chargerPower > 200 ? '11' : '4'} / 16 把
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1">当前桩体在线率：100%</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100 flex flex-col justify-between" id="chg-card-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">今日充电订单总量</span>
                <div className="text-xl font-mono font-bold text-slate-800 mt-2">
                  {telemetry.chargerPower > 400 ? '154' : '142'} 笔
                </div>
                <div className="text-[10px] text-slate-500 mt-1">已成功结算：100%</div>
              </div>
            </div>

            {/* 模拟正在充电的订单 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden" id="chg-orders-table">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 text-xs font-bold text-slate-700">
                快充现场大功率车辆充电实况 (Top 3)
              </div>
              <div className="divide-y divide-slate-100 text-xs" id="chg-order-rows">
                <div className="flex items-center justify-between p-4" id="order-row-1">
                  <span className="font-bold text-slate-700">大巴快充 #02枪 (浙A·B5529)</span>
                  <div className="flex items-center gap-8 font-mono" id="order-meta-1">
                    <span>已充容量: <strong>114.5 kWh</strong></span>
                    <span>实时充电功率: <strong className="text-cyan-600 font-bold">120 kW</strong></span>
                    <span className="text-slate-500">SOC: 78%</span>
                    <span className="bg-cyan-50 text-cyan-700 px-2.5 py-0.5 rounded-full font-sans font-bold text-[10px]">高速充电中</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4" id="order-row-2">
                  <span className="font-bold text-slate-700">大巴快充 #05枪 (浙A·F8831)</span>
                  <div className="flex items-center gap-8 font-mono" id="order-meta-2">
                    <span>已充容量: <strong>92.1 kWh</strong></span>
                    <span>实时充电功率: <strong className="text-cyan-600 font-bold">90 kW</strong></span>
                    <span className="text-slate-500">SOC: 62%</span>
                    <span className="bg-cyan-50 text-cyan-700 px-2.5 py-0.5 rounded-full font-sans font-bold text-[10px]">高速充电中</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4" id="order-row-3">
                  <span className="font-bold text-slate-700">乘用车快充 #11枪 (浙A·D90412)</span>
                  <div className="flex items-center gap-8 font-mono" id="order-meta-3">
                    <span>已充容量: <strong>34.2 kWh</strong></span>
                    <span>实时充电功率: <strong className="text-cyan-600 font-bold">45 kW</strong></span>
                    <span className="text-slate-500">SOC: 48%</span>
                    <span className="bg-cyan-50 text-cyan-700 px-2.5 py-0.5 rounded-full font-sans font-bold text-[10px]">普通快充中</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. 电网与需量 */}
        {activeSubTab === 'demand' && (
          <div className="space-y-6" id="mon-demand-panel">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="dem-sub-grid">
              <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100 flex flex-col justify-between" id="dem-card-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">电网关口实测有功功率</span>
                <div className="text-xl font-mono font-bold text-slate-800 mt-2" id="grid-p-text">{telemetry.gridPower} kW</div>
                <div className="text-[10px] text-slate-500 mt-1">正值购电，负值上网</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100 flex flex-col justify-between" id="dem-card-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">关口实时需量</span>
                <div className="text-xl font-mono font-bold text-slate-800 mt-2" id="demand-p-text">{telemetry.demand} kW</div>
                <div className="text-[10px] text-slate-500 mt-1">变压器关口协议需量上限：500 kW</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-100 flex flex-col justify-between" id="dem-card-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">关口综合功率因数</span>
                <div className="text-xl font-mono font-bold text-slate-800 mt-2">0.96</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1">符合电网标准（高于0.90，无罚款）</div>
              </div>
            </div>

            {telemetry.demand > 500 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-center text-amber-800" id="demand-warning-box">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 animate-bounce" />
                <div className="text-xs font-sans leading-relaxed" id="demand-warning-text">
                  <strong>最大需量越限报警触发：</strong> 当前实测需量已攀升至 <strong>{telemetry.demand} kW</strong>，突破了 500 kW 的最高限额。根据基本电费计算规则，若本计费周期需量未被成功削减，可能引发阶梯性加罚，造成基础电费损失。请紧急触发协同策略或启动储能放电。
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
