/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TelemetryPoint, 
  AlarmEvent, 
  AuditLog, 
  Scenario, 
  AgentType, 
  Station
} from './types';
import { 
  MOCK_STATIONS, 
  MOCK_DEVICES, 
  MOCK_REVENUE_HISTORY, 
  INITIAL_ALARMS, 
  WALKTHROUGH_SCENARIOS, 
  SYSTEM_TOOLS,
  AGENT_DIRECTORY
} from './data';

import Sidebar from './components/Sidebar';
import type { ScreenId } from './components/Sidebar';
import ScenarioWalkthrough from './components/ScenarioWalkthrough';
import AgentWorkspace from './components/AgentWorkspace';
import DashboardScreen from './components/DashboardScreen';
import MonitoringScreen from './components/MonitoringScreen';
import RevenueScreen from './components/RevenueScreen';
import AlarmScreen from './components/AlarmScreen';
import StrategyScreen from './components/StrategyScreen';
import GovernanceScreen from './components/GovernanceScreen';

// 初始遥测快照 (上午10:00平稳期作为系统最初 facts)
const INITIAL_TELEMETRY: TelemetryPoint = {
  time: '10:00',
  pvPower: 280,
  essPower: 0,
  chargerPower: 140,
  baseLoad: 180,
  totalLoad: 320,
  gridPower: 40,
  soc: 60,
  batteryTemp: 29.8,
  demand: 180
};

// 预设系统启动时的最近 5 条基础审计日志，凸显严谨与高保真
const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'aud-01', timestamp: '2026-06-30 08:00:00', category: 'api', title: '成功拉取中国气象局今日杭州滨江辐照预报与温度特征数据', operator: 'DataAgent', traceId: 'tr-sync-wea-8812', details: '{"status": 200, "irradiancePeakW": 1050, "tempMax": 34}' },
  { id: 'aud-02', timestamp: '2026-06-30 08:00:05', category: 'sync', title: '试点站点 st-01 开启今日数据接入任务并初始化点位标准化映射', operator: 'SystemAdmin', traceId: 'tr-map-init-2341', details: '设备映射：25逆变器、1储能、16充电桩，对齐标准采集字典' },
  { id: 'aud-03', timestamp: '2026-06-30 08:00:10', category: 'sync', title: '今日数据质量规则引擎自检完毕，启用空值突变过滤配置', operator: 'DataAgent', traceId: 'tr-dq-check-9921', details: '规则上限需量: 500kW, 温度越界: 50°C, 突跳因子: 35%' },
  { id: 'aud-04', timestamp: '2026-06-30 08:15:22', category: 'sync', title: '关口计量表同步任务捕获异常：大功率快充桩群上报网络心跳超时', operator: 'DataAgent', traceId: 'tr-net-chg-881274', details: '点位：st-01_dev-chg-group_status=offline' },
  { id: 'aud-05', timestamp: '2026-06-30 08:32:10', category: 'approval', title: 'MonitorAgent 针对 12号快充桩离线报警自动确认心跳恢复并闭环', operator: 'MonitorAgent', traceId: 'tr-net-chg-881274', details: '心跳响应包重连正常，质量标记对齐，无需人工派工，状态转为 closed' }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');
  const [activeStationId, setActiveStationId] = useState<string>('st-01');
  const [telemetry, setTelemetry] = useState<TelemetryPoint>(INITIAL_TELEMETRY);
  const [alarms, setAlarms] = useState<AlarmEvent[]>(INITIAL_ALARMS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  
  // 推演场景控制
  const [activeScenarioId, setActiveScenarioId] = useState<string>('sc-demand');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Agent 思考链节点
  const [thoughtChain, setThoughtChain] = useState<any[]>([]);

  const station = MOCK_STATIONS.find(s => s.id === activeStationId) || MOCK_STATIONS[0];

  // ==========================================
  // 1. 重置演练场景到系统最初状态
  // ==========================================
  const handleResetScenario = () => {
    setTelemetry(INITIAL_TELEMETRY);
    setAlarms(INITIAL_ALARMS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentStepIndex(0);
    setThoughtChain([]);
    setCurrentScreen('dashboard');
    setIsProcessing(false);
  };

  // 监听演练场景切换，切换时自动重置
  useEffect(() => {
    handleResetScenario();
  }, [activeScenarioId]);

  // ==========================================
  // 2. 演练场景核心状态流转机 (The Orchestrator Step Controller)
  // ==========================================
  const handleNextStep = () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const activeScenario = WALKTHROUGH_SCENARIOS.find(s => s.id === activeScenarioId) || WALKTHROUGH_SCENARIOS[0];
    const steps = activeScenario.steps;
    const nextStep = steps[currentStepIndex];

    setTimeout(() => {
      const nowTime = new Date().toLocaleTimeString('zh-CN', { hour12: false });
      const traceId = activeScenarioId === 'sc-demand' ? 'tr-dsp-9921475' : 'tr-temp-pv-554129';

      // ----------------------------------------
      // 场景一：突发充电高峰与需量越限控制
      // ----------------------------------------
      if (activeScenarioId === 'sc-demand') {
        if (currentStepIndex === 0) {
          // 步骤 1：大负荷冲击涌入
          setTelemetry(prev => ({
            ...prev,
            time: '10:30',
            chargerPower: 620,    // 桩功率飙升
            totalLoad: 800,       // 总负荷暴涨
            gridPower: 780,       // 电网购电飙升
            demand: 780           // 需量越限报警！
          }));

          // 告警库增加一条需量超标 Level 2 红色报警
          const newAlarm: AlarmEvent = {
            id: 'alm-demand-peak',
            title: '关口契约最大需量越峰报警',
            level: 'critical',
            source: 'rule_engine',
            status: 'new',
            stationId: 'st-01',
            triggerTime: `2026-06-30 ${nowTime}`,
            description: '实测最大需量达到 780 kW，严重突破 500 kW 合同限额！预计产生每月罚金风险。',
            traceId,
            revenueImpact: 11200
          };
          setAlarms(prev => [newAlarm, ...prev]);

          // 注入 AI 思考链
          setThoughtChain([
            {
              agentType: 'DataAgent',
              agentName: '数据治理专家 (DataAgent)',
              avatar: '🟢',
              time: nowTime,
              type: 'thought',
              content: '遥测队列监听异常：检测到关口有功功率发生瞬时突变。 st-01 站总负荷由 320 kW 拉升至 800 kW。质量规则校验：数据变化与大巴快充枪满载同步，排除仪表通信断线引起的尖峰抖动，确认为【物理真实超额用能事实】。'
            },
            {
              agentType: 'DataAgent',
              agentName: '数据治理专家 (DataAgent)',
              avatar: '🟢',
              time: nowTime,
              type: 'tool_call',
              content: '物理事实落库：已秒级将 10:30 标准化能流遥测写入 telemetry_history facts。质量状态标记为：GOOD (可信)。'
            }
          ]);

          // 追加审计日志
          setAuditLogs(prev => [
            {
              id: `aud-${Date.now()}-1`,
              timestamp: `2026-06-30 ${nowTime}`,
              category: 'sync',
              title: '遥测事实落库：10:30 st-01 站大功率充电负荷达 620 kW，关口最大需量至 780 kW 触发越线规则',
              operator: 'DataAgent',
              traceId,
              details: '{"chargerPower": 620, "gridPower": 780, "demandLimit": 500}'
            },
            ...prev
          ]);

          // 自动平滑跳转界面至“运行监测”，让用户直接在大屏中看到红色超限
          setCurrentScreen('monitoring');

        } else if (currentStepIndex === 1) {
          // 步骤 2：MonitorAgent 研判完毕
          // 在原有思考上追加
          setThoughtChain(prev => [
            ...prev,
            {
              agentType: 'MonitorAgent',
              agentName: '安全运营管家 (MonitorAgent)',
              avatar: '🔴',
              time: nowTime,
              type: 'thought',
              content: '接收到规则引擎越限警报！关口需量：780 kW > 限额 500 kW。立刻检索当前小时分时电价（10:30 属于高峰时段：0.984元）。'
            },
            {
              agentType: 'MonitorAgent',
              agentName: '安全运营管家 (MonitorAgent)',
              avatar: '🔴',
              time: nowTime,
              type: 'tool_call',
              content: '调用工具：telemetry.get_current 并计算罚款系数。合同基础电价：40元/kW 阶梯超额罚款。越限差额：280 kW。'
            },
            {
              agentType: 'MonitorAgent',
              agentName: '安全运营管家 (MonitorAgent)',
              avatar: '🔴',
              time: nowTime,
              type: 'decision',
              content: `研判结论发布：如果不介入协同调控，本次越峰将导致本月基础电费惩罚性加收 280 kW * 40元/kW = 11,200 元！\n紧急对策建议：通知 StrategyAgent 仿真日前/日内协同消峰策略。启动 1MWh 储能电池进行大功率应急放电支撑。`
            }
          ]);

          // 告警事实充实 MonitorAgent 分析
          setAlarms(prev => prev.map(a => a.id === 'alm-demand-peak' ? {
            ...a,
            aiExplanation: '上午 10:30。园区出现高频快充冲击。由于契约最大负荷为 500 kW，已产生严重的基础用电加罚。MonitorAgent 联动 tariff.get_active 获取今日分时差，判定电池具有充足放电套利容量。',
            aiRemedyAdvice: '建议立即采取日前储能协同放电策略 + 充电桩 10% 功率软压限。削峰仿真测算可规避 11,200 元损失。'
          } : a));

          setAuditLogs(prev => [
            {
              id: `aud-${Date.now()}-2`,
              timestamp: `2026-06-30 ${nowTime}`,
              category: 'agent',
              title: 'MonitorAgent 完成需量超限财务风险估算，发起日前消峰策略协同指令',
              operator: 'MonitorAgent',
              traceId,
              details: '{"riskPenalty": 11200, "activeTariffPrice": 0.984}'
            },
            ...prev
          ]);

          // 自动跳转到“告警与事件闭环”，让用户看见带有 AI 智能解释的告警卡片
          setCurrentScreen('alarms');

        } else if (currentStepIndex === 2) {
          // 步骤 3：StrategyAgent 算法仿真
          setThoughtChain(prev => [
            ...prev,
            {
              agentType: 'StrategyAgent',
              agentName: '协同调控专家 (StrategyAgent)',
              avatar: '🟠',
              time: nowTime,
              type: 'thought',
              content: '接收到消峰优化指令。调用电芯寿命及功率仿真服务进行协同演算。'
            },
            {
              agentType: 'StrategyAgent',
              agentName: '协同调控专家 (StrategyAgent)',
              avatar: '🟠',
              time: nowTime,
              type: 'tool_call',
              content: '调用工具：simulation.run (风险等级 Level 1) 对方案一（放任不理）和方案二（储能放电300kW + 充电桩群10%软限功率）进行模拟比较。'
            },
            {
              agentType: 'StrategyAgent',
              agentName: '协同调控专家 (StrategyAgent)',
              avatar: '🟠',
              time: nowTime,
              type: 'decision',
              content: '日前仿真报告生成：\n● 方案一：今日套利收益增加 0 元，需量罚款 11,200 元，净资产亏损 11,200 元。\n● 方案二：10:40 下发放电 +300kW (持续 1.2h)，关口需量下降到 480 kW (安全区)。避峰罚金规避率 100% (+11,200元)。电池循环折旧成本折合 42 元。净套利套现增加 300元。\n决策结果：强烈推荐下发方案二。已拼装调度下发执行单 Draft_APV-ZJ01。由于涉及 Level 3 高风险物理电池下发，物理锁生效，正在等待人工最终授权审批。'
            }
          ]);

          setAuditLogs(prev => [
            {
              id: `aud-${Date.now()}-3`,
              timestamp: `2026-06-30 ${nowTime}`,
              category: 'agent',
              title: 'StrategyAgent 完成协同消峰日前仿真。生成调度执行单，向审批中心提交人工审批申请',
              operator: 'StrategyAgent',
              traceId,
              details: '{"simulatedNetBenefit": 11500, "proposedDischargeKW": 300, "proposedChgLimitRatio": 0.9}'
            },
            ...prev
          ]);

          // 自动跳转到“策略优化与仿真”，让用户看见 24 小时日前调度计划曲线与仿真对比
          setCurrentScreen('strategy');

        } else if (currentStepIndex === 3) {
          // 步骤 4：审批流展示与 Orchestrator 提示
          setThoughtChain(prev => [
            ...prev,
            {
              agentType: 'StrategyAgent',
              agentName: 'Orchestrator 编排器',
              avatar: '🛡',
              time: nowTime,
              type: 'thought',
              content: '最高安全网关隔离提示：日前调度计划包含 storage.dispatch_discharge (高险Level 3) 工具。平台 ToolExecutor 安全锁生效：该高风险控制接口默认 enabled=false，拒绝直接物理下发。'
            },
            {
              agentType: 'StrategyAgent',
              agentName: 'Orchestrator 编排器',
              avatar: '🛡',
              time: nowTime,
              type: 'observation',
              content: '等待人工进行最终授权审批签名。只有接收到人类的 approve 响应，编排器才可通过 ToolExecutor 临时解封执行口。'
            }
          ]);

          setAuditLogs(prev => [
            {
              id: `aud-${Date.now()}-4`,
              timestamp: `2026-06-30 ${nowTime}`,
              category: 'approval',
              title: 'Orchestrator 安全审计：调度计划 Draft_APV-ZJ01 处于待审批状态，物理设备控制接口锁定中',
              operator: 'Orchestrator',
              traceId,
              details: '{"interfaceStatus": "LOCKED", "toolName": "storage.dispatch_discharge"}'
            },
            ...prev
          ]);

        } else if (currentStepIndex === 4) {
          // 步骤 5：人工确认审批下发！物理下发生效，曲线完美被削平！
          setTelemetry(prev => ({
            ...prev,
            time: '11:00',
            essPower: 300,         // 电池开始大功率放电！
            totalLoad: 780,        //
            gridPower: 480,        // 关口购电功率完美下降至 480 kW 需量线以下
            demand: 480,           // 需量压回 480 kW，安全！
            soc: 45                // SOC 放电到 45%
          }));

          // 需量超限故障闭环，变为 recovered
          setAlarms(prev => prev.map(a => a.id === 'alm-demand-peak' ? {
            ...a,
            status: 'recovered',
            recoverTime: `2026-06-30 ${nowTime}`
          } : a));

          setThoughtChain(prev => [
            ...prev,
            {
              agentType: 'StrategyAgent',
              agentName: 'Orchestrator 编排器',
              avatar: '🛡',
              time: nowTime,
              type: 'thought',
              content: '接收到业主 leiziyue 的最终 APPROVED 授权签名！解锁工具：storage.dispatch_discharge 临时物理使能解封。'
            },
            {
              agentType: 'StrategyAgent',
              agentName: 'Orchestrator 编排器',
              avatar: '🛡',
              time: nowTime,
              type: 'tool_call',
              content: '物理下发执行：storage.dispatch_discharge(300kW, targetSoc=15) 成功。充电桩功率压限至 10% 执行。'
            },
            {
              agentType: 'StrategyAgent',
              agentName: 'Orchestrator 编排器',
              avatar: '🛡',
              time: nowTime,
              type: 'observation',
              content: '试点站反馈遥测： st-01 储能 PCS 功率拉升至 +300 kW。关口计量电表实测有功功率成功降至 480 kW（已处于 500 kW 需量配额以下）。消峰大功率避峰控制运行平稳。'
            }
          ]);

          setAuditLogs(prev => [
            {
              id: `aud-${Date.now()}-5`,
              timestamp: `2026-06-30 ${nowTime}`,
              category: 'dispatch',
              title: '日前物理调度计划执行成功：储能电池在高峰期大功率放电 300 kW，避峰罚款规避率 100%，关口有功购电成功降至 480 kW',
              operator: 'User: leiziyue & Orchestrator',
              traceId,
              details: '{"approvedBy": "leiziyue45@gmail.com", "dischargeKW": 300, "measuredGridPower": 480}'
            },
            ...prev
          ]);

          // 自动跳转至首页大屏，让用户在大屏拓扑能流图里，直观、高保真地看到刚才那条变红越峰的需量曲线，被完美一键削平，能流图上代表放电的绿色光球欢快运动！
          setCurrentScreen('dashboard');

        } else if (currentStepIndex === 5) {
          // 步骤 6：ReportAgent 自动归档
          setThoughtChain(prev => [
            ...prev,
            {
              agentType: 'ReportAgent',
              agentName: '报表归档专家 (ReportAgent)',
              avatar: '🟣',
              time: nowTime,
              type: 'thought',
              content: '检测到日前调度闭环完成。调用报表服务汇总 facts 事实，自动提取本次事件全流程细节（遥测对比、决策轨迹、人工审批凭据）。'
            },
            {
              agentType: 'ReportAgent',
              agentName: '报表归档专家 (ReportAgent)',
              avatar: '🟣',
              time: nowTime,
              type: 'tool_call',
              content: '生成事故闭环电子专报：report.archive_generate 并存入 report_archive 事实层，绑定电子公章。'
            },
            {
              agentType: 'ReportAgent',
              agentName: '报表归档专家 (ReportAgent)',
              avatar: '🟣',
              time: nowTime,
              type: 'decision',
              content: '《中节能杭州示范站 6月30日突发充电负荷需量协同削峰分析报告》归档成功。\n本事件净挽回基本电费罚款损失：11,200 元。额外峰谷价差获现：300 元。扣除电池折旧摊销成本 42 元。综合资产回报率（ROI）增加：¥ 11,458 元。\n推演圆满落幕，全链路审计日志已安全落锁存入 facts。'
            }
          ]);

          setAuditLogs(prev => [
            {
              id: `aud-${Date.now()}-6`,
              timestamp: `2026-06-30 ${nowTime}`,
              category: 'approval',
              title: 'ReportAgent 将突发需量消峰事件闭环报告存档。进行电子签章并写入 facts 报表归档层',
              operator: 'ReportAgent',
              traceId,
              details: '{"documentTitle": "示范站大负荷协同消峰专报.pdf", "netProfitGained": 11458}'
            },
            ...prev
          ]);
        }
      }

      // ----------------------------------------
      // 场景二：电池舱温升控制
      // ----------------------------------------
      if (activeScenarioId === 'sc-temp') {
        if (currentStepIndex === 0) {
          // 步骤 1：温升触发
          setTelemetry(prev => ({
            ...prev,
            time: '14:15',
            essPower: 200,         // 当前下午尖峰大功率放电中
            batteryTemp: 53.8,     // 传感器 14 号飙升至 53.8°C (超额 50°C 报警限)
            soc: 30
          }));

          const newAlarm: AlarmEvent = {
            id: 'alm-temp-high',
            title: '储能2号电池舱电芯温升预警',
            level: 'major',
            source: 'third_party',
            status: 'new',
            stationId: 'st-01',
            triggerTime: `2026-06-30 ${nowTime}`,
            description: 'BMS 上报储能 2号电池舱 B-14号单体电芯最高温度达 53.8°C，超出安全设定值 50.0°C！',
            traceId,
            revenueImpact: 4200
          };
          setAlarms(prev => [newAlarm, ...prev]);

          setThoughtChain([
            {
              agentType: 'DataAgent',
              agentName: '数据治理专家 (DataAgent)',
              avatar: '🟢',
              time: nowTime,
              type: 'thought',
              content: '点位监视报警：检测到 BMS 热电耦传感器 14 号异常温度阻抗。 st-01_dev-ess-bms_temp_14 = 53.8°C。排除传感器接线引起的阻抗突变，判定电池在 200 kW 放电过程中确实积累了大量焦耳热。'
            }
          ]);

          setAuditLogs(prev => [
            {
              id: `aud-${Date.now()}-7`,
              timestamp: `2026-06-30 ${nowTime}`,
              category: 'sync',
              title: '遥测事实落库：14:15 st-01 2号电池舱电芯最高温度升至 53.8°C 触发重要温升规则',
              operator: 'DataAgent',
              traceId,
              details: '{"batteryTemp_14": 53.8, "essPower": 200}'
            },
            ...prev
          ]);

          setCurrentScreen('monitoring');

        } else if (currentStepIndex === 1) {
          // 步骤 2：MonitorAgent 评估折损
          setThoughtChain(prev => [
            ...prev,
            {
              agentType: 'MonitorAgent',
              agentName: '安全运营管家 (MonitorAgent)',
              avatar: '🔴',
              time: nowTime,
              type: 'thought',
              content: '温升捕获正常。调用 Arrhenius 物理老化算法，评估由于在 53.8°C 极限温度下大功率放电产生的电池寿命衰退。'
            },
            {
              agentType: 'MonitorAgent',
              agentName: '安全运营管家 (MonitorAgent)',
              avatar: '🔴',
              time: nowTime,
              type: 'decision',
              content: `研判结论发布：如果不介入调优，2号舱电芯热量进一步积聚，电芯析锂加速将导致电池寿命（SOH）永久性折损 0.08%，折合未来资产减值约 4,200 元。且一旦突破 55°C 将触发热失控保护断路停机，错失下午尖峰套利（套利电费 1.246元/kWh）。`
            }
          ]);

          setAlarms(prev => prev.map(a => a.id === 'alm-temp-high' ? {
            ...a,
            aiExplanation: '2号电池舱 B-14号传感器升至 53.8°C。Arrhenius 老化模型计算表明：该温度下持续 1C 放电对电池 SOH 损害较大，折损电池资产折旧价值约 4,200 元。且随时可能触发强制停机。',
            aiRemedyAdvice: '建议：将 2号电池舱放电功率调频下探至 40 kW，启动风冷强排；同时协同处于 24°C 健康低温的 1号电池舱，将其放电出力拉至 160 kW 补位。总出力维持 200 kW 不变。'
          } : a));

          setAuditLogs(prev => [
            {
              id: `aud-${Date.now()}-8`,
              timestamp: `2026-06-30 ${nowTime}`,
              category: 'agent',
              title: 'MonitorAgent 完成温升电池 SOH 老化寿命损失估算，发起资产减耗日前协同指令',
              operator: 'MonitorAgent',
              traceId,
              details: '{"sohLossRatio": 0.0008, "assetDepreciation": 4200}'
            },
            ...prev
          ]);

          setCurrentScreen('alarms');

        } else if (currentStepIndex === 2) {
          // 步骤 3：StrategyAgent 算法仿真多舱协同
          setThoughtChain(prev => [
            ...prev,
            {
              agentType: 'StrategyAgent',
              agentName: '协同调控专家 (StrategyAgent)',
              avatar: '🟠',
              time: nowTime,
              type: 'thought',
              content: '接收到温控限载协同要求。调用多舱协同算法进行调度仿真。1号舱当前环境温度 24°C，SOH=99.1%，负载率极低，具备充裕的补位出力条件。'
            },
            {
              agentType: 'StrategyAgent',
              agentName: '协同调控专家 (StrategyAgent)',
              avatar: '🟠',
              time: nowTime,
              type: 'decision',
              content: '策略仿真推荐：\n● 2号电池舱：限制最高放电功率为 40 kW，物理触发舱外排风扇风强制冷却。\n● 1号电池舱：提升放电功率至 160 kW 代为出力。\n仿真分析：两舱协同后，杭州示范站并网总出力维持 200 kW，套利收益无任何折折损。2号舱温升将在 15 分钟内回落至 44°C 以下安全区。已拼装运维协同单 DispatchPlan_TEMP02 (Level 2 业务改参权限)。'
            }
          ]);

          setAuditLogs(prev => [
            {
              id: `aud-${Date.now()}-9`,
              timestamp: `2026-06-30 ${nowTime}`,
              category: 'agent',
              title: 'StrategyAgent 生成多舱协同放电温控对策仿真报告。发起 Level 2 运维微调计划',
              operator: 'StrategyAgent',
              traceId,
              details: '{"limitCabin2": "40kW", "boostCabin1": "160kW", "fanOn": true}'
            },
            ...prev
          ]);

          setCurrentScreen('strategy');

        } else if (currentStepIndex === 3) {
          // 步骤 4：运维人员确认 Acknowledge
          setThoughtChain(prev => [
            ...prev,
            {
              agentType: 'StrategyAgent',
              agentName: 'Orchestrator 编排器',
              avatar: '🛡',
              time: nowTime,
              type: 'thought',
              content: 'Orchestrator 接收到运维单。调优不涉及越峰和物理安全红线，属于 Level 2 中级授权级别。无需变电主站高阶审批，但仍要求站内运维人员 Acknowledge (人工确认) 以对齐 ToolExecutor 签名事实。'
            }
          ]);

          setAuditLogs(prev => [
            {
              id: `aud-${Date.now()}-10`,
              timestamp: `2026-06-30 ${nowTime}`,
              category: 'approval',
              title: 'Orchestrator 安全审计：多舱协同调温计划 Draft_TEMP02 处于等待站内运维人工确认状态',
              operator: 'Orchestrator',
              traceId,
              details: '{"toolRequired": "storage.cabin_coordination_dispatch"}'
            },
            ...prev
          ]);

        } else if (currentStepIndex === 4) {
          // 步骤 5：强排启动，温度平稳回落
          setTelemetry(prev => ({
            ...prev,
            batteryTemp: 42.1,      // 温度成功下降
            soc: 20
          }));

          setAlarms(prev => prev.map(a => a.id === 'alm-temp-high' ? {
            ...a,
            status: 'recovered',
            recoverTime: `2026-06-30 ${nowTime}`
          } : a));

          setThoughtChain(prev => [
            ...prev,
            {
              agentType: 'StrategyAgent',
              agentName: 'Orchestrator 编排器',
              avatar: '🛡',
              time: nowTime,
              type: 'thought',
              content: '运维人员 leiziyue 进行了 Acknowledge 人工签名事实录入。'
            },
            {
              agentType: 'StrategyAgent',
              agentName: 'Orchestrator 编排器',
              avatar: '🛡',
              time: nowTime,
              type: 'tool_call',
              content: '下发控制参数：st-01_cabin2_discharge_limit=40kW; cabin1_discharge_target=160kW; cabin2_fan_on=true。'
            },
            {
              agentType: 'StrategyAgent',
              agentName: 'Orchestrator 编排器',
              avatar: '🛡',
              time: nowTime,
              type: 'observation',
              content: '遥测回显事实：2号电池舱风机开启，单体 14号电芯温度已于 15 分钟内从 53.8°C 平滑回落至 42.1°C 安全区，1号电池舱并网出力平稳补足，下午尖峰套利表现对齐事实。'
            }
          ]);

          setAuditLogs(prev => [
            {
              id: `aud-${Date.now()}-11`,
              timestamp: `2026-06-30 ${nowTime}`,
              category: 'dispatch',
              title: '多舱协同温控指令执行生效：1号舱出力 160 kW，2号舱强冷风机运行且限功率 40 kW，温升降至 42.1°C 消除热失控风险',
              operator: 'User: leiziyue & Orchestrator',
              traceId,
              details: '{"cabin2Temp": 42.1, "totalDischargeKW": 200}'
            },
            ...prev
          ]);

          setCurrentScreen('dashboard');

        } else if (currentStepIndex === 5) {
          // 步骤 6：电池报告归档
          setThoughtChain(prev => [
            ...prev,
            {
              agentType: 'ReportAgent',
              agentName: '报表归档专家 (ReportAgent)',
              avatar: '🟣',
              time: nowTime,
              type: 'thought',
              content: '接收到温升警报闭环。自动汇总充放电热传导记录、SOH 老化损耗曲线及运维 leiziyue 的确认签字事实。'
            },
            {
              agentType: 'ReportAgent',
              agentName: '报表归档专家 (ReportAgent)',
              avatar: '🟣',
              time: nowTime,
              type: 'tool_call',
              content: '电子归档电池舱温控协同分析报告：report.archive_generate。'
            },
            {
              agentType: 'ReportAgent',
              agentName: '报表归档专家 (ReportAgent)',
              avatar: '🟣',
              time: nowTime,
              type: 'decision',
              content: '《中节能杭州示范站 2号储能电池舱高温协同控制运维报告》归档成功。\n本协同机制完美规避电池单体资产衰老折价：¥ 4,200 元。同时完全保全了今日尖峰电费套利收益。\n推演圆满落幕，审计事实已封存至 facts。'
            }
          ]);

          setAuditLogs(prev => [
            {
              id: `aud-${Date.now()}-12`,
              timestamp: `2026-06-30 ${nowTime}`,
              category: 'approval',
              title: 'ReportAgent 将2号储能舱高温协同运维报告存档，写入 facts 报表归档区并电子公章加锁',
              operator: 'ReportAgent',
              traceId,
              details: '{"documentTitle": "示范站储能电池协同温控运维专报.pdf", "assetDepreciationAvoided": 4200}'
            },
            ...prev
          ]);
        }
      }

      // 前进一个步骤（如果已经是最后一步，点reset）
      setCurrentStepIndex(prev => prev + 1);
      setIsProcessing(false);
    }, 1500); // 模拟 1.5 秒 Agent 打字思考延迟，体验棒极了！
  };

  // ==========================================
  // 3. AI Agent 对话提问推演 (Expert Agent Simulation)
  // ==========================================
  const handleQuickQuery = (query: string, agentType: AgentType) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const nowTime = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    const traceId = `tr-qa-${Math.floor(Math.random() * 900000) + 100000}`;

    // 添加一条用户问话的假思考作为引子 (在前端直观展示)
    setThoughtChain(prev => [
      ...prev,
      {
        agentType: 'Orchestrator' as any,
        agentName: '用户',
        avatar: '👤',
        time: nowTime,
        type: 'thought' as any,
        content: `“${query}”`
      }
    ]);

    setTimeout(() => {
      let thought1 = '';
      let toolCall = '';
      let observation = '';
      let decision = '';

      if (agentType === 'DataAgent') {
        thought1 = '收到能流拓扑转化效率分析请求。正在读取 facts 遥测历史库与计量精度数据对齐。';
        toolCall = '调用工具：telemetry.get_current 成功，获取最近 24 小时 96 个遥测样本。';
        observation = '观察到光伏组件发电设备转化效率 19.8%，储能双向逆变器（PCS）交流转换循环效率 91.5%，快充桩电能传输效率 95.8%，综合关口损失率低于 0.8%。';
        decision = '【中节能杭州低碳产业园示范站能流效率报告】生成：\n平台综合能流传输效率达到 92.4%，完全高于行业同等示范园区均值 (89%)。\n建议优化：下半月对快充桩 3号接触器进行铜排电阻例检，可额外降低线路损耗 0.05%。全部事实可信，已存入日志。';
      } else if (agentType === 'RevenueAgent') {
        thought1 = '收到电价方案时段收益率审计请求。正在检索 active_tariff 适用分时电价时段并进行明细对齐。';
        toolCall = '调用工具：tariff.get_active 获取杭州低碳园 tf-zj-2026 电价方案生效文本。';
        observation = '今日最大电价峰谷差（下午尖峰 1.246元 与 低谷 0.312元 差额）为 0.934元/kWh。储能电池两充两放额定获利表现符合预期。';
        decision = '【杭州低碳园分时套利审计结果】汇总如下：\n● 每日低谷充电 900 kWh（00:00-08:00），电费支出 ¥ 280.8。\n● 尖峰时段（13:00-15:00）全额放电 400 kWh，获现 ¥ 498.4。\n● 高峰时段（17:00-22:00）放电 300 kWh，获现 ¥ 295.2。\n● 扣除损耗后的纯每日套利收益额：¥ 645.0 元。\n公式级交叉复核结果：✔ 完全无偏差审计通过。';
      } else if (agentType === 'MonitorAgent') {
        thought1 = '收到温升老化损失估算请求。关联 arrhenius 电池化学反应速率和资产贬值模型。';
        toolCall = '调用工具：telemetry.get_current 并提取 B-14单体电芯历史温升记录。';
        observation = '当单体电芯温度长期高于 50°C 满载放电时，阴极析锂速度会产生指数级衰减。';
        decision = '【储能电池温升资产损失审计】评估：\n如不进行舱协调调载，每日高温放电将导致电池年循环寿命缩减 4.5%（相当于未来提前更换电池的固定资产折旧亏损 28,500元）。\n采用 StrategyAgent 多舱协同调控后，SOH 挽回率达 99.8%，保值成效显著。建议强制排风在电芯温升触发 48°C 时即超前启动。';
      } else if (agentType === 'CarbonAgent') {
        thought1 = '收到杭州低碳园示范站 ESG 绿电报告请求。对齐国家工商业电网平均碳因子。';
        toolCall = '调用工具：telemetry.get_current 成功，检索今日绿电消纳量。';
        observation = '今日光伏自发自用电量达到 1,951 kWh，碳减排系数为 0.5703 kg CO₂ / kWh。';
        decision = '【中节能杭州低碳示范站 ESG 今日成果报】归档完成：\n● 今日总消纳绿电：1,951 kWh。\n● 本地消纳率：91.2%。\n● 今日碳减排贡献：1,112.6 kg CO₂。相比火电煤耗减少 389 kg，植树 61 棵。\n● 绿电消纳在同类型中节能长三角园区中排名：第 3 位 (TOP 5)。\n已出具 ESG 智能签章报表归档 facts。';
      } else {
        // 自定义问题的通用拟真回复
        thought1 = '接收到用户提问，Orchestrator 自动将问题分派给安全运营管家和财务专家。正在分析。';
        toolCall = '调用工具：telemetry.get_current 成功。';
        observation = '当前杭州示范站运行状况：光伏出力正常，电池 SOC 正常，充电桩在线，关口无越限。';
        decision = `安全运营管家 MonitorAgent 对您的提问：“${query}”进行了深度分析：\n经检索数据库事实源，示范站当前处于安全健康的【Level 0】无告警常态运行模式下。绿电消纳和套利公式无偏差审计合格。您可以通过点击顶部的“Agentic 推演盘”来模拟充电高峰和电池高温越限，即可捕获 Agent 的联动反应。`;
      }

      setThoughtChain(prev => [
        ...prev,
        {
          agentType,
          agentName: AGENT_DIRECTORY.find(a => a.type === agentType)?.name || '安全运营管家 (MonitorAgent)',
          avatar: AGENT_DIRECTORY.find(a => a.type === agentType)?.avatar || '🔴',
          time: nowTime,
          type: 'thought',
          content: thought1
        },
        {
          agentType,
          agentName: AGENT_DIRECTORY.find(a => a.type === agentType)?.name || '安全运营管家 (MonitorAgent)',
          avatar: AGENT_DIRECTORY.find(a => a.type === agentType)?.avatar || '🔴',
          time: nowTime,
          type: 'tool_call',
          content: toolCall
        },
        {
          agentType,
          agentName: AGENT_DIRECTORY.find(a => a.type === agentType)?.name || '安全运营管家 (MonitorAgent)',
          avatar: AGENT_DIRECTORY.find(a => a.type === agentType)?.avatar || '🔴',
          time: nowTime,
          type: 'observation',
          content: observation
        },
        {
          agentType,
          agentName: AGENT_DIRECTORY.find(a => a.type === agentType)?.name || '安全运营管家 (MonitorAgent)',
          avatar: AGENT_DIRECTORY.find(a => a.type === agentType)?.avatar || '🔴',
          time: nowTime,
          type: 'decision',
          content: decision
        }
      ]);

      // 追加一笔审计
      setAuditLogs(prev => [
        {
          id: `aud-${Date.now()}-q`,
          timestamp: `2026-06-30 ${nowTime}`,
          category: 'agent',
          title: `用户提问快速响应成功，Operator=${agentType} 输出了无幻觉审计报告`,
          operator: agentType,
          traceId,
          details: `Query: ${query}`
        },
        ...prev
      ]);

      setIsProcessing(false);
    }, 1500);
  };

  // ==========================================
  // 4. 其他闭环交互逻辑
  // ==========================================
  const handleAcknowledgeAlarm = (id: string, comment: string) => {
    const nowTime = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
    
    setAuditLogs(prev => [
      {
        id: `aud-${Date.now()}-ack`,
        timestamp: `2026-06-30 ${nowTime}`,
        category: 'approval',
        title: `业主 leiziyue 对告警事件 ${id} 进行了人工 Acknowledge 签名确认。进入运维排查阶段`,
        operator: 'User: leiziyue',
        traceId: 'tr-op-ack-112',
        details: comment
      },
      ...prev
    ]);

    // 追加一条 MonitorAgent 的自省思考，表明已经协助运维
    setThoughtChain(prev => [
      ...prev,
      {
        agentType: 'MonitorAgent',
        agentName: '安全运营管家 (MonitorAgent)',
        avatar: '🔴',
        time: nowTime,
        type: 'thought',
        content: `业主 leiziyue 人工确认了 ${id} 报警事实。我已自动整理并冻结当前故障上下能流数据，方便运维排查。调度锁在故障解除前将处于高度隔离警戒模式。`
      }
    ]);
  };

  const handleDeclareFalsePositive = (id: string) => {
    const nowTime = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, status: 'false_positive' } : a));
    setAuditLogs(prev => [
      {
        id: `aud-${Date.now()}-fp`,
        timestamp: `2026-06-30 ${nowTime}`,
        category: 'approval',
        title: `业主 leiziyue 判定告警事件 ${id} 为【物理误报 (False Positive)】。事件自动标记关闭`,
        operator: 'User: leiziyue',
        traceId: 'tr-op-fp-332',
        details: '误报原因：传感器零漂校验维护'
      },
      ...prev
    ]);
  };

  const handleClearAlarm = (id: string) => {
    const nowTime = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, status: 'closed' } : a));
    setAuditLogs(prev => [
      {
        id: `aud-${Date.now()}-clear`,
        timestamp: `2026-06-30 ${nowTime}`,
        category: 'approval',
        title: `业主 leiziyue 人工手动关闭了已完成修复的告警事件 ${id}， facts 事实归档入库`,
        operator: 'User: leiziyue',
        traceId: 'tr-op-cls-441',
        details: '人工判定故障已消除'
      },
      ...prev
    ]);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none text-slate-800" id="main-app-container">
      {/* 1. 左侧导航 Sidebar */}
      <Sidebar 
        currentScreen={currentScreen} 
        onScreenChange={setCurrentScreen} 
        activeStationId={activeStationId}
        onStationChange={setActiveStationId}
      />

      {/* 中间主要运营区 */}
      <div className="flex-1 flex flex-col min-w-0" id="main-workspace-center">
        {/* 顶部场景推演盘 */}
        <ScenarioWalkthrough 
          scenarios={WALKTHROUGH_SCENARIOS}
          activeScenarioId={activeScenarioId}
          onScenarioChange={setActiveScenarioId}
          currentStepIndex={currentStepIndex}
          onNextStep={handleNextStep}
          onReset={handleResetScenario}
          isProcessing={isProcessing}
        />

        {/* 核心视窗屏 */}
        <div className="flex-1 overflow-y-auto p-6" id="view-port-screen-container">
          {currentScreen === 'dashboard' && (
            <DashboardScreen 
              station={station}
              telemetry={telemetry}
              alarms={alarms}
              onScreenChange={setCurrentScreen}
              scenarioId={activeScenarioId}
              stepIndex={currentStepIndex}
            />
          )}

          {currentScreen === 'monitoring' && (
            <MonitoringScreen telemetry={telemetry} />
          )}

          {currentScreen === 'revenue' && (
            <RevenueScreen telemetry={telemetry} stepIndex={currentStepIndex} />
          )}

          {currentScreen === 'alarms' && (
            <AlarmScreen 
              alarms={alarms}
              onAcknowledge={handleAcknowledgeAlarm}
              onDeclareFalsePositive={handleDeclareFalsePositive}
              onClearAlarm={handleClearAlarm}
            />
          )}

          {currentScreen === 'strategy' && (
            <StrategyScreen 
              telemetry={telemetry}
              stepIndex={currentStepIndex}
              onApproveDispatch={handleNextStep} // 审批同意就是演练的前进一步！完美配合
              isProcessing={isProcessing}
            />
          )}

          {currentScreen === 'governance' && (
            <GovernanceScreen 
              auditLogs={auditLogs}
              onClearLogs={() => setAuditLogs([])}
            />
          )}
        </div>
      </div>

      {/* 3. 右侧 AI Agentic 协作工作台 */}
      <AgentWorkspace 
        currentScenarioStepIndex={currentStepIndex}
        activeScenarioId={activeScenarioId}
        thoughtChain={thoughtChain}
        onQuickQuery={handleQuickQuery}
        isProcessing={isProcessing}
      />
    </div>
  );
}
