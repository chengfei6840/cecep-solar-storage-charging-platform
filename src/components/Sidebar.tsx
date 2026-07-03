/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Coins, 
  BellRing, 
  Workflow, 
  ShieldAlert, 
  Leaf 
} from 'lucide-react';

export type ScreenId = 'dashboard' | 'monitoring' | 'revenue' | 'alarms' | 'strategy' | 'governance';

interface SidebarProps {
  currentScreen: ScreenId;
  onScreenChange: (screen: ScreenId) => void;
  activeStationId: string;
  onStationChange: (id: string) => void;
}

export default function Sidebar({ 
  currentScreen, 
  onScreenChange, 
  activeStationId, 
  onStationChange 
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: '首页大屏监测', icon: LayoutDashboard, color: 'text-emerald-600' },
    { id: 'monitoring', label: '运行监测看板', icon: Activity, color: 'text-cyan-600' },
    { id: 'revenue', label: '电价收益中心', icon: Coins, color: 'text-amber-500' },
    { id: 'alarms', label: '告警与事件闭环', icon: BellRing, color: 'text-rose-500' },
    { id: 'strategy', label: '策略优化与仿真', icon: Workflow, color: 'text-indigo-600' },
    { id: 'governance', label: 'Agentic 治理审计', icon: ShieldAlert, color: 'text-violet-600' },
  ] as const;

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-300" id="sidebar-container">
      {/* 头部 Logo 区域 */}
      <div className="p-6 border-b border-slate-800 flex flex-col gap-1.5" id="sidebar-header">
        <div className="flex items-center gap-2" id="sidebar-logo-row">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-white text-sm shadow-md" id="logo-icon">
            E
          </div>
          <span className="font-sans font-bold text-lg text-white tracking-wide" id="logo-text">
            中节能 CECEP
          </span>
        </div>
        <span className="text-xs font-mono text-emerald-400 font-medium tracking-wider" id="platform-subtitle">
          基于AI+低碳园区微电网数字化平台
        </span>
      </div>

      {/* 站点选择器 */}
      <div className="p-4 border-b border-slate-800" id="sidebar-station-selector">
        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2" id="station-label">
          当前运营站点
        </label>
        <select 
          id="station-dropdown"
          value={activeStationId} 
          onChange={(e) => onStationChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
        >
          <option value="st-01">杭州低碳园示范站</option>
          <option value="st-02">深圳光明物流示范站</option>
        </select>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" id="sidebar-nav-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onScreenChange(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-white' : item.color}`} />
              <span id={`nav-text-${item.id}`}>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" id={`active-dot-${item.id}`} />
              )}
            </button>
          );
        })}
      </nav>

      {/* 底部信息与绿色标识 */}
      <div className="p-5 border-t border-slate-800 bg-slate-950/40 text-center" id="sidebar-footer">
        <div className="flex items-center justify-center gap-2 mb-2" id="footer-status">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-mono text-slate-500 font-medium tracking-wide">
            ● AGENTIC RUNTIME ON
          </span>
        </div>
        <p className="text-[10px] text-slate-600 font-mono" id="version-text">
          CECEP-EMS-v2.6-PROD
        </p>
      </div>
    </div>
  );
}
