export enum Protocol {
  TCP = 'TCP',
  UDP = 'UDP',
  ICMP = 'ICMP',
  ANY = 'ANY'
}

export enum Action {
  ALLOW = 'PERMITIR',
  DENY = 'BLOQUEAR'
}

export type ExecutionMode = 'LOCAL' | 'DOTNET_API';

export interface VLAN {
  id: string | number;
  vlanId: number;
  name: string;
  subnet: string;
  color: string;
  devices: Device[];
}

export interface Device {
  id: string | number;
  name: string;
  ip: string;
  type: 'PC' | 'SERVER' | 'PRINTER' | 'IOT';
}

export interface ACLRule {
  id: string | number;
  srcVlanId: number;
  dstVlanId: number;
  protocol: Protocol;
  action: Action;
  description: string;
}

export interface SimulationLog {
  id: string;
  timestamp: string;
  srcDevice: string;
  srcVlan: string;
  dstDevice: string;
  dstVlan: string;
  protocol: Protocol;
  result: 'SUCCESS' | 'BLOCKED' | 'UTM_BLOCKED';
  reason: string;
}

export interface UtmFeatures {
  ips: boolean; // Intrusion Prevention System
  av: boolean; // Anti-Virus
  webFilter: boolean;
}

// --- Domain & Architecture Types ---

export interface TrafficContext {
  srcId: string;
  dstId: string;
  protocol: Protocol;
  vlans: VLAN[];
  acls: ACLRule[];
  utm: UtmFeatures;
}

export interface EvaluationResult {
  status: 'SUCCESS' | 'BLOCKED' | 'UTM_BLOCKED' | 'CONTINUE';
  reason: string;
}

export interface ITrafficStrategy {
  evaluate(context: TrafficContext): EvaluationResult;
}

// Service Abstraction for Dependency Injection support
export interface ITrafficService {
  simulate(context: TrafficContext): Promise<SimulationLog>;
}

export interface ISecurityAnalyzer {
  analyze(vlans: VLAN[], acls: ACLRule[], utm: UtmFeatures): Promise<string>;
}