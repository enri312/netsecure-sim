import { VLAN, ACLRule, Protocol, Action } from './types';

export const INITIAL_VLANS: VLAN[] = [
  {
    id: 'v1',
    vlanId: 10,
    name: 'Administración',
    subnet: '192.168.10.0/24',
    color: 'bg-emerald-600',
    devices: [
      { id: 'd1', name: 'Admin-PC-01', ip: '192.168.10.5', type: 'PC' },
      { id: 'd2', name: 'Admin-Srv', ip: '192.168.10.10', type: 'SERVER' }
    ]
  },
  {
    id: 'v2',
    vlanId: 20,
    name: 'Ventas',
    subnet: '192.168.20.0/24',
    color: 'bg-blue-600',
    devices: [
      { id: 'd3', name: 'Ventas-Laptop', ip: '192.168.20.5', type: 'PC' }
    ]
  },
  {
    id: 'v3',
    vlanId: 30,
    name: 'IoT / Cámaras',
    subnet: '192.168.30.0/24',
    color: 'bg-orange-600',
    devices: [
      { id: 'd4', name: 'Cam-Frontal', ip: '192.168.30.15', type: 'IOT' }
    ]
  },
  {
    id: 'v4',
    vlanId: 99,
    name: 'Servidores DMZ',
    subnet: '172.16.1.0/24',
    color: 'bg-purple-600',
    devices: [
      { id: 'd5', name: 'WebServer', ip: '172.16.1.5', type: 'SERVER' }
    ]
  }
];

export const INITIAL_ACLS: ACLRule[] = [
  {
    id: 'r1',
    srcVlanId: 10,
    dstVlanId: 99,
    protocol: Protocol.ANY,
    action: Action.ALLOW,
    description: 'Admin acceso total a DMZ'
  },
  {
    id: 'r2',
    srcVlanId: 20,
    dstVlanId: 99,
    protocol: Protocol.TCP,
    action: Action.ALLOW,
    description: 'Ventas acceso Web a DMZ'
  },
  {
    id: 'r3',
    srcVlanId: 30,
    dstVlanId: 10,
    protocol: Protocol.ANY,
    action: Action.DENY,
    description: 'IoT no puede acceder a Admin'
  }
];