/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Station, Device, Point, TelemetryPoint, TariffPlan, RevenueDaily, AlarmEvent, AgentMetadata, ToolMetadata, AuditLog, Scenario } from './types';

// 1. 试点站点
export const MOCK_STATIONS: Station[] = [
  {
    id: 'st-01',
    name: '中节能杭州低碳产业园智慧示范站',
    location: '浙江省杭州市滨江区中节能路1号',
    owner: '中国节能太阳能股份有限公司',
    status: 'active',
    capacityPV: 450,       // 450 kW 光伏
    capacityESS: '500kW/1000kWh', // 1MWh 储能
    chargerCount: 16       // 16把快充枪
  },
  {
    id: 'st-02',
    name: '中节能深圳光明绿色物流示范站',
    location: '广东省深圳市光明区中节能环保示范园',
    owner: '中节能（深圳）实业发展有限公司',
    status: 'active',
    capacityPV: 300,
    capacityESS: '250kW/500kWh',
    chargerCount: 8
  }
];

// 2. 设备台账
export const MOCK_DEVICES: Device[] = [
  { id: 'dev-pv-01', stationId: 'st-01', name: '1号光伏逆变器 (250kW)', type: 'pv', manufacturer: '阳光电源', model: 'SG250HX', status: 'online' },
  { id: 'dev-pv-02', stationId: 'st-01', name: '2号光伏逆变器 (200kW)', type: 'pv', manufacturer: '阳光电源', model: 'SG200HX', status: 'online' },
  { id: 'dev-ess-pcs', stationId: 'st-01', name: '储能变流器 PCS (500kW)', type: 'ess', manufacturer: '科华数据', model: 'BCS500K-B', status: 'online' },
  { id: 'dev-ess-bms', stationId: 'st-01', name: '储能电池管理系统 BMS', type: 'ess', manufacturer: '宁德时代', model: 'BMS-LFP-1000', status: 'online' },
  { id: 'dev-chg-group', stationId: 'st-01', name: '大功率快充桩群 (16枪)', type: 'charger', manufacturer: '中节能能投', model: 'CECEP-FC-120D', status: 'online' },
  { id: 'dev-meter-grid', stationId: 'st-01', name: '关口计量主电表', type: 'meter', manufacturer: '威胜集团', model: 'DSZF606', status: 'online' }
];

// 3. 标准电价方案 (中国浙江 2026 最新分时电价规则 - 典型工商业两部制电价)
export const MOCK_TARIFF_PLAN: TariffPlan = {
  id: 'tf-zj-2026',
  name: '浙江省工商业分时电价 - 中节能杭州示范站专属版本',
  version: 'V2026.07.01-Active',
  effectiveDate: '2026-07-01',
  stationId: 'st-01',
  segments: [
    { name: '低谷', type: 'valley', start: '00:00', end: '08:00', price: 0.312 },
    { name: '平段', type: 'flat', start: '08:00', end: '09:00', price: 0.658 },
    { name: '高峰', type: 'peak', start: '09:00', end: '11:00', price: 0.984 },
    { name: '平段', type: 'flat', start: '11:00', end: '13:00', price: 0.658 },
    { name: '尖峰', type: 'sharp', start: '13:00', end: '15:00', price: 1.246 },
    { name: '平段', type: 'flat', start: '15:00', end: '17:00', price: 0.658 },
    { name: '高峰', type: 'peak', start: '17:00', end: '22:00', price: 0.984 },
    { name: '低谷', type: 'valley', start: '22:00', end: '24:00', price: 0.312 }
  ]
};

// 4. 24小时基准遥测曲线 (15分钟一个点，96个点，这里精简为24个正点展示，既能保持图表美观又降低计算复杂度)
export const BASE_TELEMETRY_DATA: TelemetryPoint[] = [
  { time: '00:00', pvPower: 0, essPower: -150, chargerPower: 20, baseLoad: 80, totalLoad: 100, gridPower: 250, soc: 10, batteryTemp: 22.4, demand: 250 },
  { time: '01:00', pvPower: 0, essPower: -150, chargerPower: 15, baseLoad: 75, totalLoad: 90, gridPower: 240, soc: 25, batteryTemp: 22.8, demand: 240 },
  { time: '02:00', pvPower: 0, essPower: -150, chargerPower: 10, baseLoad: 70, totalLoad: 80, gridPower: 230, soc: 40, batteryTemp: 23.2, demand: 230 },
  { time: '03:00', pvPower: 0, essPower: -150, chargerPower: 10, baseLoad: 70, totalLoad: 80, gridPower: 230, soc: 55, batteryTemp: 23.5, demand: 230 },
  { time: '04:00', pvPower: 0, essPower: -150, chargerPower: 12, baseLoad: 70, totalLoad: 82, gridPower: 232, soc: 70, batteryTemp: 23.8, demand: 232 },
  { time: '05:00', pvPower: 0, essPower: -150, chargerPower: 15, baseLoad: 72, totalLoad: 87, gridPower: 237, soc: 85, batteryTemp: 24.1, demand: 237 },
  { time: '06:00', pvPower: 0, essPower: -150, chargerPower: 20, baseLoad: 80, totalLoad: 100, gridPower: 250, soc: 100, batteryTemp: 24.3, demand: 250 },
  { time: '07:00', pvPower: 10, essPower: 0, chargerPower: 30, baseLoad: 90, totalLoad: 120, gridPower: 110, soc: 100, batteryTemp: 24.4, demand: 110 },
  { time: '08:00', pvPower: 60, essPower: 0, chargerPower: 60, baseLoad: 110, totalLoad: 170, gridPower: 110, soc: 100, batteryTemp: 24.5, demand: 110 },
  { time: '09:00', pvPower: 150, essPower: 200, chargerPower: 120, baseLoad: 150, totalLoad: 270, gridPower: -80, soc: 80, batteryTemp: 27.2, demand: 0 },
  { time: '10:00', pvPower: 280, essPower: 200, chargerPower: 140, baseLoad: 180, totalLoad: 320, gridPower: -160, soc: 60, batteryTemp: 29.8, demand: 0 },
  // 11点开始，进入平谷时段，原计划储能不充不放
  { time: '11:00', pvPower: 350, essPower: 0, chargerPower: 160, baseLoad: 190, totalLoad: 350, gridPower: 0, soc: 60, batteryTemp: 28.5, demand: 0 },
  { time: '12:00', pvPower: 410, essPower: -100, chargerPower: 110, baseLoad: 160, totalLoad: 270, gridPower: -240, soc: 70, batteryTemp: 27.2, demand: 0 },
  // 13点-15点是下午尖峰时段
  { time: '13:00', pvPower: 430, essPower: 200, chargerPower: 130, baseLoad: 170, totalLoad: 300, gridPower: -330, soc: 50, batteryTemp: 31.4, demand: 0 },
  { time: '14:00', pvPower: 380, essPower: 200, chargerPower: 150, baseLoad: 180, totalLoad: 330, gridPower: -250, soc: 30, batteryTemp: 34.6, demand: 0 },
  { time: '15:00', pvPower: 260, essPower: 0, chargerPower: 140, baseLoad: 160, totalLoad: 300, gridPower: 40, soc: 30, batteryTemp: 31.2, demand: 40 },
  { time: '16:00', pvPower: 180, essPower: 0, chargerPower: 120, baseLoad: 150, totalLoad: 270, gridPower: 90, soc: 30, batteryTemp: 29.5, demand: 90 },
  { time: '17:00', pvPower: 80, essPower: 0, chargerPower: 180, baseLoad: 160, totalLoad: 340, gridPower: 260, soc: 30, batteryTemp: 28.1, demand: 260 },
  // 18点-21点是晚高峰
  { time: '18:00', pvPower: 10, essPower: 150, chargerPower: 220, baseLoad: 180, totalLoad: 400, gridPower: 240, soc: 15, batteryTemp: 30.5, demand: 260 },
  { time: '19:00', pvPower: 0, essPower: 0, chargerPower: 240, baseLoad: 190, totalLoad: 430, gridPower: 430, soc: 15, batteryTemp: 28.4, demand: 430 },
  { time: '20:00', pvPower: 0, essPower: 0, chargerPower: 210, baseLoad: 170, totalLoad: 380, gridPower: 380, soc: 15, batteryTemp: 27.2, demand: 430 },
  { time: '21:00', pvPower: 0, essPower: 0, chargerPower: 160, baseLoad: 150, totalLoad: 310, gridPower: 310, soc: 15, batteryTemp: 26.5, demand: 430 },
  { time: '22:00', pvPower: 0, essPower: 0, chargerPower: 90, baseLoad: 120, totalLoad: 210, gridPower: 210, soc: 15, batteryTemp: 25.8, demand: 210 },
  { time: '23:00', pvPower: 0, essPower: 0, chargerPower: 50, baseLoad: 90, totalLoad: 140, gridPower: 140, soc: 15, batteryTemp: 25.1, demand: 140 }
];

// 5. 模拟历史收益数据 (最近7天)
export const MOCK_REVENUE_HISTORY: RevenueDaily[] = [
  { date: '06-24', pvSelfUseRevenue: 284.5, pvGridRevenue: 45.2, essArbitrageRevenue: 645.0, chargingRevenue: 2120.0, chargingServiceFee: 636.0, gridCost: 1140.0, netRevenue: 1944.7, demandSaving: 120.0 },
  { date: '06-25', pvSelfUseRevenue: 290.1, pvGridRevenue: 42.0, essArbitrageRevenue: 645.0, chargingRevenue: 2340.0, chargingServiceFee: 702.0, gridCost: 1210.0, netRevenue: 2069.1, demandSaving: 120.0 },
  { date: '06-26', pvSelfUseRevenue: 245.3, pvGridRevenue: 21.5, essArbitrageRevenue: 590.0, chargingRevenue: 1980.0, chargingServiceFee: 594.0, gridCost: 1080.0, netRevenue: 1750.8, demandSaving: 120.0 },
  { date: '06-27', pvSelfUseRevenue: 310.8, pvGridRevenue: 58.4, essArbitrageRevenue: 645.0, chargingRevenue: 2450.0, chargingServiceFee: 735.0, gridCost: 1190.0, netRevenue: 2159.2, demandSaving: 120.0 },
  { date: '06-28', pvSelfUseRevenue: 302.2, pvGridRevenue: 48.0, essArbitrageRevenue: 645.0, chargingRevenue: 2280.0, chargingServiceFee: 684.0, gridCost: 1120.0, netRevenue: 2039.2, demandSaving: 120.0 },
  { date: '06-29', pvSelfUseRevenue: 295.4, pvGridRevenue: 39.5, essArbitrageRevenue: 645.0, chargingRevenue: 2650.0, chargingServiceFee: 795.0, gridCost: 1320.0, netRevenue: 2304.9, demandSaving: 120.0 },
  { date: '06-30', pvSelfUseRevenue: 304.8, pvGridRevenue: 46.2, essArbitrageRevenue: 645.0, chargingRevenue: 2880.0, chargingServiceFee: 864.0, gridCost: 1380.0, netRevenue: 2479.8, demandSaving: 120.0 } // 今日
];

// 6. 告警事件库
export const INITIAL_ALARMS: AlarmEvent[] = [
  {
    id: 'alm-20260630-01',
    title: '充电设备离线报警',
    level: 'minor',
    source: 'integration',
    status: 'closed',
    stationId: 'st-01',
    deviceId: 'dev-chg-group',
    deviceName: '大功率快充桩群 #12快充桩',
    triggerTime: '2026-06-30 08:15:22',
    recoverTime: '2026-06-30 08:32:10',
    description: '12号充电桩上报网络心跳超时（超过3分钟未通信），可能原因为站点子网通信波动。',
    traceId: 'tr-net-chg-881274',
    aiExplanation: '根据网络拓扑日志，故障发生在滨江示范站东区交换机第4端口波动期间。MonitorAgent 自动确认数据同步已于 08:32 恢复，数据对齐校验正常。',
    aiRemedyAdvice: '自动闭环成功。建议运维人员在下月例检时对该插头通信触点进行防潮检查。',
    revenueImpact: 0
  },
  {
    id: 'alm-20260630-02',
    title: '逆变器轻微温度异常',
    level: 'info',
    source: 'third_party',
    status: 'recovered',
    stationId: 'st-01',
    deviceId: 'dev-pv-02',
    deviceName: '2号光伏逆变器 (200kW)',
    triggerTime: '2026-06-30 11:30:15',
    recoverTime: '2026-06-30 12:45:00',
    description: '2号光伏逆变器主控芯片温度达到 78°C，接近 80°C 预警值。',
    traceId: 'tr-temp-pv-554129',
    aiExplanation: '由于11:30至12:45期间户外环境辐照度突破 1050W/m²，逆变器满载运行产热较大。MonitorAgent 分析风机风速点位在 85% 区间，属正常散热范围。',
    aiRemedyAdvice: '当前温度已随着午后负荷平滑回落。无需紧急派单。',
    revenueImpact: 0
  }
];

// 7. Multi-Agent 目录
export const AGENT_DIRECTORY: AgentMetadata[] = [
  {
    type: 'DataAgent',
    name: '数据治理专家 (DataAgent)',
    role: '多源数据接入、清洗与标准化映射',
    responsibilities: [
      '对多渠道（光、储、充、电网）上报数据进行秒级解包、协议适配及标准化单位换算',
      '自动检测缺失值、越界突变并进行质量标记',
      '提供人工修复的幂等性校验及质量日志审计'
    ],
    avatar: '🟢'
  },
  {
    type: 'MonitorAgent',
    name: '安全运营管家 (MonitorAgent)',
    role: '告警异常归纳、收益影响估算及故障闭环分析',
    responsibilities: [
      '全时段扫描告警事实库，过滤高频干扰，关联设备及电量上下文',
      '利用热失控、通信中断等故障分析模型，极速给出事件影响解释和修复建议',
      '秒级估算异常事件导致的套利损失、需量越限电费损失，为审批提供量化依据'
    ],
    avatar: '🔴'
  },
  {
    type: 'RevenueAgent',
    name: '财务核算专家 (RevenueAgent)',
    role: '电价版本追溯、确定性收益审计及公式级核算',
    responsibilities: [
      '严格基于数据库事实源、公式库、适用电价方案进行无偏差计算（绝不依赖大模型直出算力）',
      '为综合收益、套利明细、需量节省、碳指标提供明细溯源与多维交叉审计',
      '电价方案版本变更时，精确评估历史或未来重算影响'
    ],
    avatar: '🔵'
  },
  {
    type: 'StrategyAgent',
    name: '协同调控专家 (StrategyAgent)',
    role: '充放电策略推荐、日前计划生成与高阶仿真比较',
    responsibilities: [
      '根据气象、历史负荷，动态预测光伏出力曲线与充电负荷概率模型',
      '设计“削峰填谷”、“消纳优先”、“需量控制”等多策略仿真演算',
      '提交带有仿真收益曲线和风险等级评估的调度计划草稿（DispatchPlan）'
    ],
    avatar: '🟠'
  },
  {
    type: 'ReportAgent',
    name: '报表归档专家 (ReportAgent)',
    role: '日报/月报智能生成、归档辅助及报告可信校对',
    responsibilities: [
      '自动汇总遥测与收益事实库，形成标准化、不可篡改的日/周/月度PDF/Excel归档模型',
      '对质量有瑕疵、未修复的报表指标进行高亮批注说明，杜绝数据瞒报风险',
      '自动将事件闭环全生命周期转换为标准事故分析报表并进入归档区'
    ],
    avatar: '🟣'
  },
  {
    type: 'CarbonAgent',
    name: '低碳核算专家 (CarbonAgent)',
    role: '绿电消纳量化、碳排放因子对齐及ESG报告生成',
    responsibilities: [
      '根据中国工商业电网最新平均碳排放因子，动态计算自发自用绿电减碳贡献',
      '统计每日、每月消纳绿电占比并进行同类型示范园区节碳排行'
    ],
    avatar: '🍃'
  }
];

// 8. ToolExecutor 可用工具元数据
export const SYSTEM_TOOLS: ToolMetadata[] = [
  // Level 0: 只读
  { name: 'telemetry.get_current', description: '获取站点实时能流与点位数值', inputSchema: '{"stationId": "string"}', allowedAgents: ['DataAgent', 'MonitorAgent', 'StrategyAgent'], riskLevel: 0, requiresApproval: false, enabled: true },
  { name: 'tariff.get_active', description: '获取站点当前执行的生效电价时段版本', inputSchema: '{"stationId": "string"}', allowedAgents: ['RevenueAgent', 'StrategyAgent'], riskLevel: 0, requiresApproval: false, enabled: true },
  { name: 'revenue.calculate_daily', description: '精确计算特定日期的各项确定性收益明细', inputSchema: '{"stationId": "string", "date": "YYYY-MM-DD"}', allowedAgents: ['RevenueAgent'], riskLevel: 0, requiresApproval: false, enabled: true },
  // Level 1: 写业务记录
  { name: 'alarm.acknowledge', description: '对告警事件进行人工或系统策略确认', inputSchema: '{"alarmId": "string", "comment": "string"}', allowedAgents: ['MonitorAgent'], riskLevel: 1, requiresApproval: false, enabled: true },
  { name: 'report.archive_generate', description: '生成并归档周期性报表或事件专报', inputSchema: '{"stationId": "string", "type": "daily|monthly", "date": "string"}', allowedAgents: ['ReportAgent'], riskLevel: 1, requiresApproval: false, enabled: true },
  // Level 2: 修改业务参数
  { name: 'demand.set_target', description: '修改关口电表的最大需量控制限额', inputSchema: '{"stationId": "string", "targetkW": "number"}', allowedAgents: ['StrategyAgent'], riskLevel: 2, requiresApproval: true, enabled: true },
  { name: 'tariff.update_plan', description: '更新电价版本或时段设定（必须财务确认）', inputSchema: '{"planId": "string", "segments": "array"}', allowedAgents: ['RevenueAgent'], riskLevel: 2, requiresApproval: true, enabled: true },
  // Level 3: 物理设备调度与执行控制（最严格，未启用物理执行时为 disabled/placeholder）
  { name: 'storage.dispatch_charge', description: '紧急下发储能电池充电指令（功率/目标SOC）', inputSchema: '{"stationId": "string", "powerkW": "number", "targetSoc": "number"}', allowedAgents: ['StrategyAgent'], riskLevel: 3, requiresApproval: true, enabled: false },
  { name: 'storage.dispatch_discharge', description: '紧急下发储能电池放电指令（功率/目标SOC）', inputSchema: '{"stationId": "string", "powerkW": "number", "targetSoc": "number"}', allowedAgents: ['StrategyAgent'], riskLevel: 3, requiresApproval: true, enabled: false },
  { name: 'charger.limit_power', description: '下发充电桩群最大输出功率限额比例', inputSchema: '{"stationId": "string", "limitRatio": "number"}', allowedAgents: ['StrategyAgent'], riskLevel: 3, requiresApproval: true, enabled: false }
];

// 9. 智能场景推演引擎 - 脚本定义
export const WALKTHROUGH_SCENARIOS: Scenario[] = [
  {
    id: 'sc-demand',
    name: '场景A：突发充电高峰与需量越限控制 (高阶协同调度推演)',
    description: '10:30 上午，大批新能源物流车/大巴突然涌入，充电需求暴增。园区总负荷冲向历史极值，最大需量即将击穿电网变压器配额。MonitorAgent 自动研判，StrategyAgent 仿真削峰策略，通过人工审批，下发控制计划实现完美避峰。',
    steps: [
      {
        id: 1,
        title: '突发大负荷冲击，总负荷越线',
        description: '上午 10:30。大功率快充桩群功率从 140 kW 陡增至 620 kW。园区总负荷飙升至 800 kW。由于变压器关口需量协议限额为 500 kW，已产生严重越限罚款风险！数据标准化服务接收并进行质量和异常标记。',
        actor: '系统数据流',
        status: 'pending',
        actionRequired: true,
        actionLabel: '模拟大负荷涌入',
        agentThought: '数据接收队列正常：发现 st-01 站快充桩群功率在 5 分钟内拉升 340%，遥测事实已秒级记入 telemetry_history。质量校验结果：GOOD，属真实物理充能负荷。'
      },
      {
        id: 2,
        title: 'MonitorAgent 介入：安全预警与收益损失估算',
        description: 'MonitorAgent 接收到需量超标警报。通过结合分时电价时段（当前为10:00-11:00高峰期）和电网需量合同，估算出若不进行控制，本次超限将导致本月基础电费惩罚性暴增 8,500 元。MonitorAgent 亮起红色警报，并建议启动联合避峰。',
        actor: 'MonitorAgent',
        status: 'pending',
        actionRequired: true,
        actionLabel: '启动故障研判',
        agentThought: '警告！检测到最大需量超标（780 kW > 500 kW 限额）。基于 contract_demand 规则：罚金计算为超额功率 * 40元/kW = (780 - 500) * 40 = 11,200 元（或带来尖峰电费损耗）。紧急调用 telemetry.get_current 成功，已捕获电网、储能和光伏的能量快照。'
      },
      {
        id: 3,
        title: 'StrategyAgent 介入：高阶协同策略与多方案仿真',
        description: 'StrategyAgent 接收研判结果，调用仿真服务。生成两种调度计划：\n方案1（保持原样）：由于不干预，导致 11,200元 基础电费罚款。\n方案2（光储充协同）：调用储能电池紧急大功率放电 (300kW) 进行避峰；同时对大功率快充桩进行 10% 充电功率软压限。仿真测算最大需量将控制在 480 kW，避免所有罚款，且完全保全大巴车的充能安全。',
        actor: 'StrategyAgent',
        status: 'pending',
        actionRequired: true,
        actionLabel: '进行算法策略仿真',
        agentThought: '正在调用 simulation.run 评估削峰模型。模型参数：光伏满载、电池 SOC=60%（完全具备 300kW/1.5h 的持续放电能力）。计算得到方案 2 综合净收益提升 11,200 元。已自动拼装调度计划 DispatchPlan_ZJ01_Draft，风险等级评定：Level 3 (设备调度)，要求人工审批。'
      },
      {
        id: 4,
        title: '发起 Level 3 物理调度计划审批',
        description: 'StrategyAgent 将调度计划 DispatchPlan_ZJ01 发送给审批中心。审批单详细列出了：储能变流器 (PCS) 预计于 10:40-12:00 放电 300 kW，充电桩限流 10%。在没有人工最终授权前，物理指令绝不下发，以隔离大模型带来的控制风险。',
        actor: '审批人 (您)',
        status: 'pending',
        actionRequired: true,
        actionLabel: '一键授权并下发调度',
        agentThought: 'Orchestrator 拦截调度流：当前控制工具 storage.dispatch_discharge 之 enabled=false。必须进入审批中心进行解封和人工签名，traceId = tr-dsp-9921475。'
      },
      {
        id: 5,
        title: '执行网关生效：曲线被完美削平',
        description: '用户点击“同意并下发”。审批状态更新为 APPROVED。Orchestrator 联动执行网关，向站点下发充放电配置。2MWh 储能电池开始大功率放电！快充桩限功率平稳，关口购电功率成功从 780 kW 被压回 480 kW，需量曲线完美削平！',
        actor: '执行网关',
        status: 'pending',
        actionRequired: true,
        actionLabel: '查看调度执行结果',
        agentThought: '工具解锁：storage.dispatch_discharge(300kW) 物理执行成功！接收到 st-01 遥测：电池功率转为 +300 kW，gridPower 成功下降到 480 kW（低于 500kW 配额线）。状态更新：正常消峰中，预计持续 1.2 小时。'
      },
      {
        id: 6,
        title: 'ReportAgent 自动归档与收益落袋',
        description: '事件平稳结束。ReportAgent 提取事件全过程的遥测事实、审批记录和执行成效，生成《关于中节能杭州示范站6月30日突发负荷需量削峰事件分析专报》，完成电子签章归档。综合收益核算完毕，电费罚款规避率 100%。',
        actor: 'ReportAgent',
        status: 'pending',
        actionRequired: false,
        agentThought: '归档服务 report.archive_generate 已启动。分析总结：挽回罚款损失 11,200 元，额外消耗储能循环 0.15 次，套利净收益增加 112 元。全部审计路径绑定 traceId: tr-dsp-9921475，已封存至数据库事实源。推演圆满结束。'
      }
    ]
  },
  {
    id: 'sc-temp',
    name: '场景B：储能电池仓温升预警与自适应调频控制 (设备运维推演)',
    description: '下午 14:15，2号储能电池仓某电芯传感器温度飙升。MonitorAgent 自动研判并估算热失控风险及 SOH 折损寿命损失，提出局部调频限载并让1号舱补出力的策略，运维人员人工确认并平稳降温，不中断套利。',
    steps: [
      {
        id: 1,
        title: '14:15 电芯14号温升异常报警触发',
        description: '在下午尖峰放电时段（13:00-15:00），储能 BMS 上报 2号电池舱 B-14号单体电芯温度达到 53.8°C，触发温升报警界限（50°C）。',
        actor: 'BMS数据源',
        status: 'pending',
        actionRequired: true,
        actionLabel: '模拟温升异常触发',
        agentThought: '遥测事实接收：st-01_dev-ess-bms_temp_14 = 53.8°C。质量检测：由于温升点位伴随放电功率 200kW 产生，排除传感器断线突变故障，标记为 VALID HIGH TEMP 物理事实。'
      },
      {
        id: 2,
        title: 'MonitorAgent 评估：SOH 损耗与电池折价风险',
        description: 'MonitorAgent 捕获报警。通过电芯物理和衰减公式研判，如果保持目前 200 kW (1.0C) 放电速度直到 15:00，温升可能加速电芯析锂，导致寿命提前衰竭，电池 SOH 将直接折损 0.08%，折合电池资产折价 4,200 元，且一旦超过 55°C 将触发紧急停机，错失套利收益。',
        actor: 'MonitorAgent',
        status: 'pending',
        actionRequired: true,
        actionLabel: '进行资产折损研判',
        agentThought: '结合电池 SOH 预测模型：电芯处于 53.8°C 满载放电，其 Arrhenius 衰减因子增加 340%。如不控制，本月热失控概率提高 12%，资产折旧约 4,200 元。MonitorAgent 发起 Level 2 调优单。'
      },
      {
        id: 3,
        title: 'StrategyAgent 介入：多舱协同放电温控调配',
        description: 'StrategyAgent 迅速算出动态优化对策：\n1. 将 2号电池舱放电功率限缩至 0.2C (40 kW)，启动舱内双风机强排冷风。\n2. 协同调配处于 24°C 低温健康状态的 1号电池舱，将其放电功率从 100 kW 提升至 160 kW 补位。\n既能完美保证示范站对电网承诺的 200 kW 放电功率，赚取尖峰套利收益，又能让 2号电芯平稳降温。',
        actor: 'StrategyAgent',
        status: 'pending',
        actionRequired: true,
        actionLabel: '生成多舱协同对策',
        agentThought: '正在下发协同计算：2号电池舱充放电比限制调小，1号电池舱放电功率加大。预测最终温升变化趋势：2号舱温度将在 15 分钟内回落至 44°C。已拼装运维微调单 DispatchPlan_TEMP02，由于不直接涉及越限，属于中等风险 Level 2。'
      },
      {
        id: 4,
        title: '运维人员人工确认协同微调指令',
        description: '该协同控制策略需要站内值班运维人员进行“确认”并执行（Level 2 业务改参权限），操作将被记录进 tool_call_log 与审计源。',
        actor: '站内运维 (您)',
        status: 'pending',
        actionRequired: true,
        actionLabel: '运维确认协同下发',
        agentThought: 'Orchestrator 提示：等待运维人员 Acknowledge。该策略安全无害，不影响电网关口总出力。'
      },
      {
        id: 5,
        title: '强排开启，多舱出力调整，温度平稳回落',
        description: '点击“运维确认”。1号舱出力拉升，2号舱开启高负荷排风，放电功率限制在 40 kW。15分钟后，14号电芯温度平滑回落至 42.1°C，故障警报成功解除，下午尖峰时段 200 kW 放电总任务圆满完成。',
        actor: '物理设备',
        status: 'pending',
        actionRequired: true,
        actionLabel: '查看温控成效',
        agentThought: '工具调用成功。遥测回显：st-01_ess-bms_temp_14 = 42.1°C。放电补位完满。温度曲线进入平稳区。'
      },
      {
        id: 6,
        title: '运维与资产报告归档',
        description: 'ReportAgent 将温升事件、SOH 避免折损明细、舱风扇强制启停日志以及运维审批签字，一体化生成《电池舱温控协同分析报告》归档，成功结束。',
        actor: 'ReportAgent',
        status: 'pending',
        actionRequired: false,
        agentThought: '自动形成资产保值报表。避免折损价值：4,200 元。多舱协同机制运行完美。推演结束。'
      }
    ]
  }
];
