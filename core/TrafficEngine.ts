import { ITrafficStrategy, TrafficContext, SimulationLog, EvaluationResult } from '../types';
import { IntraVlanStrategy, AclStrategy, UtmStrategy } from './strategies';

export class TrafficEngine {
  private connectivityStrategies: ITrafficStrategy[];
  private inspectionStrategies: ITrafficStrategy[];

  constructor() {
    // We separate connectivity (Can they talk?) from inspection (Is it safe?)
    // This allows for cleaner flow control.
    this.connectivityStrategies = [
      new IntraVlanStrategy(),
      new AclStrategy()
    ];
    
    this.inspectionStrategies = [
      new UtmStrategy()
    ];
  }

  public simulate(context: TrafficContext): SimulationLog {
    const { srcId, dstId, vlans, protocol } = context;
    
    // 1. Resolve basic info for logging
    const srcVlan = vlans.find(v => v.devices.some(d => d.id === srcId));
    const dstVlan = vlans.find(v => v.devices.some(d => d.id === dstId));
    const srcDevice = srcVlan?.devices.find(d => d.id === srcId);
    const dstDevice = dstVlan?.devices.find(d => d.id === dstId);

    if (!srcVlan || !dstVlan || !srcDevice || !dstDevice) {
       throw new Error("Invalid topology for simulation");
    }

    let finalResult: EvaluationResult = { status: 'BLOCKED', reason: 'Error desconocido' };

    // 2. Connectivity Phase (L2/L3)
    for (const strategy of this.connectivityStrategies) {
      const result = strategy.evaluate(context);
      if (result.status !== 'CONTINUE') {
        finalResult = result;
        break;
      }
    }

    // 3. Inspection Phase (L4-L7) - Only if Connectivity Allowed
    if (finalResult.status === 'SUCCESS') {
      for (const strategy of this.inspectionStrategies) {
        const result = strategy.evaluate(context);
        // If inspection blocks it, we override the success
        if (result.status === 'UTM_BLOCKED') {
          finalResult = result;
          break; // Stop at first detected threat
        }
        // If success/continue, we keep the previous success result unless inspection logic changes to return explicit 'SAFE'
      }
    }

    // 4. Construct Log
    return {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      srcDevice: srcDevice.name,
      srcVlan: `VLAN ${srcVlan.vlanId}`,
      dstDevice: dstDevice.name,
      dstVlan: `VLAN ${dstVlan.vlanId}`,
      protocol: protocol,
      result: finalResult.status as 'SUCCESS' | 'BLOCKED' | 'UTM_BLOCKED',
      reason: finalResult.reason
    };
  }
}