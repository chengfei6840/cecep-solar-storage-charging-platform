/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 1. 基础资源类型
export interface Station {
  id: string;
  name: string;
  location: string;
  owner: string;
  status: 'active' | 'inactive';
  capacityPV: number;      // kW
  capacityESS: string;     // e.g. "500kW/1000kWh"
  chargerCount: number;    // 充电桩数量
}

export interface Device {
  id: string;
  stationId: string;
  name: string;
  type: 'pv' | 'ess' | 'charger' | 'meter';
  manufacturer: string;
  model: string;
  status: 'online' | 'offline' | 'fault';
}

export interface Point {
  code: string;
  name: string;
  unit: string;
  type: 'analog' | 'discrete';
}

// 2. 遥测与数据质量
export interface TelemetryPoint {
  time: string;
  pvPower: number;       // kW
  essPower: number;      // kW (正放负充)
  chargerPower: number;  // kW
  baseLoad: number;      // kW (其他负荷)
  totalLoad: number;     // kW (基荷+充电)
  gridPower: number;     // kW (正购负售)
  soc: number;           // %
  batteryTemp: number;   // °C
  demand: number;        // kW
}

export type QualityFlag = 'good' | 'empty' | 'out_of_bounds' | 'sudden_jump' | 'stale';

export interface QualityRecord {
  pointCode: string;
  time: string;
  value: number;
  flag: QualityFlag;
  reason: string;
  remedyStatus: 'unresolved' | 'resolved';
  remedyValue?: number;
  remedyUser?: string;
  remedyTime?: string;
}

// 3. 电价与收益
export interface TariffSegment {
  name: string; // "尖峰" | "高峰" | "平段" | "低谷" | "深谷"
  type: 'sharp' | 'peak' | 'flat' | 'valley' | 'deep_valley';
  start: string; // "HH:mm"
  end: string;
  price: number; // 元/kWh
}

export interface TariffPlan {
  id: string;
  name: string;
  version: string;
  effectiveDate: string;
  stationId: string;
  segments: TariffSegment[];
}

export interface RevenueDaily {
  date: string;
  pvSelfUseRevenue: number;   // 光伏自用收益
  pvGridRevenue: number;      // 光伏上网收益
  essArbitrageRevenue: number;// 储能套利收益
  chargingRevenue: number;    // 充电桩收费
  chargingServiceFee: number; // 充电服务费
  gridCost: number;           // 购电成本
  netRevenue: number;         // 综合收益
  demandSaving: number;       // 需量基本电费节省
}

// 4. 告警事件
export type AlarmLevel = 'critical' | 'major' | 'minor' | 'info';
export type AlarmStatus = 'new' | 'acknowledged' | 'processing' | 'recovered' | 'closed' | 'false_positive' | 'rejected';
export type AlarmSource = 'third_party' | 'rule_engine' | 'integration' | 'data_quality' | 'strategy_risk';

export interface AlarmEvent {
  id: string;
  title: string;
  level: AlarmLevel;
  source: AlarmSource;
  status: AlarmStatus;
  stationId: string;
  deviceId?: string;
  deviceName?: string;
  triggerTime: string;
  recoverTime?: string;
  description: string;
  traceId: string;
  aiExplanation?: string;   // Monitor Agent 的智能解释
  aiRemedyAdvice?: string;  // Monitor Agent 的修复建议
  revenueImpact?: number;   // 估算收益影响金额 (元)
}

// 5. 策略与调度仿真
export type StrategyMode = 'economic' | 'consumption_prioritized' | 'demand_control' | 'manual';

export interface StrategyPlan {
  id: string;
  name: string;
  mode: StrategyMode;
  essChargeTimes: string[];    // e.g. ["00:00-06:00", "12:00-14:00"]
  essDischargeTimes: string[]; // e.g. ["09:00-11:00", "18:00-21:00"]
  maxDemandTarget: number;     // kW
  enabled: boolean;
}

export interface SimulationResult {
  planId: string;
  planName: string;
  simulatedRevenue: number;
  simulatedDemandSaving: number;
  riskScore: number; // 0-100
  riskAnalysis: string;
  pessimisticRevenue: number;
  optimisticRevenue: number;
}

export interface DispatchPlan {
  id: string;
  title: string;
  date: string;
  strategyPlanId: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'executed' | 'failed';
  proposer: string;
  approver?: string;
  approvalOpinion?: string;
  traceId: string;
  timeline: { time: string; essPowerTarget: number; demandLimit: number }[]; // 24小时控制计划
}

// 6. Agentic 治理
export type AgentType = 'DataAgent' | 'MonitorAgent' | 'RevenueAgent' | 'ReportAgent' | 'StrategyAgent' | 'CarbonAgent';

export interface AgentMetadata {
  type: AgentType;
  name: string;
  role: string;
  responsibilities: string[];
  avatar: string;
}

export interface ToolMetadata {
  name: string;
  description: string;
  inputSchema: string;
  allowedAgents: AgentType[];
  riskLevel: 0 | 1 | 2 | 3; // 0:只读 1:低险写 2:中险改参 3:高险控制
  requiresApproval: boolean;
  enabled: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  traceId: string;
  category: 'api' | 'sync' | 'agent' | 'tool_call' | 'approval' | 'dispatch';
  title: string;
  operator: string; // e.g. "MonitorAgent", "SystemAdmin", "User: leiziyue"
  details: string;
}

// 7. 场景推演步骤
export interface ScenarioStep {
  id: number;
  title: string;
  description: string;
  actor: string; // e.g. "系统", "MonitorAgent", "业主", "StrategyAgent"
  status: 'pending' | 'active' | 'completed';
  agentThought?: string; // 此时 Agent 的思考过程
  toolCalled?: string;   // 调用的工具和参数
  actionRequired?: boolean; // 是否需要用户在这里点击触发
  actionLabel?: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  steps: ScenarioStep[];
}
