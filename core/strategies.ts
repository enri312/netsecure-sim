import { ITrafficStrategy, TrafficContext, EvaluationResult, Action, Protocol } from '../types';

/**
 * Strategy: IntraVlanStrategy
 * Checks if source and destination are in the same VLAN.
 * If so, allows traffic immediately (L2 switching).
 */
export class IntraVlanStrategy implements ITrafficStrategy {
  evaluate(context: TrafficContext): EvaluationResult {
    const { srcId, dstId, vlans } = context;

    const srcVlan = vlans.find(v => v.devices.some(d => d.id === srcId));
    const dstVlan = vlans.find(v => v.devices.some(d => d.id === dstId));

    if (!srcVlan || !dstVlan) {
      return { status: 'BLOCKED', reason: 'Dispositivo no encontrado en VLANs' };
    }

    if (srcVlan.id === dstVlan.id) {
      return { status: 'SUCCESS', reason: 'Tráfico local (Misma VLAN - Switching L2)' };
    }

    return { status: 'CONTINUE', reason: 'Diferente VLAN, requiere enrutamiento' };
  }
}

/**
 * Strategy: AclStrategy
 * Checks Firewall rules (ACLs) for Inter-VLAN traffic.
 * Implements Implicit Deny at the end.
 */
export class AclStrategy implements ITrafficStrategy {
  evaluate(context: TrafficContext): EvaluationResult {
    const { srcId, dstId, vlans, acls, protocol } = context;

    const srcVlan = vlans.find(v => v.devices.some(d => d.id === srcId));
    const dstVlan = vlans.find(v => v.devices.some(d => d.id === dstId));

    if (!srcVlan || !dstVlan) {
       // Should be caught by previous strategy, but safe guard
      return { status: 'BLOCKED', reason: 'Error de topología' }; 
    }

    // Find first matching rule
    const matchingRule = acls.find(rule => 
      rule.srcVlanId === srcVlan.vlanId && 
      rule.dstVlanId === dstVlan.vlanId &&
      (rule.protocol === Protocol.ANY || rule.protocol === protocol)
    );

    if (matchingRule) {
      if (matchingRule.action === Action.ALLOW) {
        return { status: 'SUCCESS', reason: `Permitido por regla ACL ID ${matchingRule.id}` };
      } else {
        return { status: 'BLOCKED', reason: `Denegado por regla ACL ID ${matchingRule.id}` };
      }
    }

    return { status: 'BLOCKED', reason: 'Bloqueo implícito (Sin regla coincidente)' };
  }
}

/**
 * Strategy: UtmStrategy
 * Simulates Next-Gen Firewall features (IPS, AV).
 * Only runs if traffic was previously allowed.
 */
export class UtmStrategy implements ITrafficStrategy {
  evaluate(context: TrafficContext): EvaluationResult {
    // This strategy is special; it doesn't decide connectivity, 
    // it decides if allowed traffic is safe.
    // However, in our simplified flow, we run it after connectivity is established.
    
    const { utm, protocol } = context;

    // Simulation logic for threats
    const threatDetected = 
      (utm.ips && Math.random() > 0.8) || 
      (utm.av && Math.random() > 0.9) ||
      (utm.webFilter && protocol === Protocol.TCP && Math.random() > 0.85);

    if (threatDetected) {
      return { status: 'UTM_BLOCKED', reason: 'Amenaza detectada por motor UTM (Simulación)' };
    }

    return { status: 'SUCCESS', reason: 'Tráfico limpio' };
  }
}