import { VLAN, ACLRule, Device } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5009/api';

const getHeaders = () => {
    // Get token from local storage (stored by AuthContext)
    const storedAuth = localStorage.getItem('netsecure_auth');
    if (storedAuth) {
        const { token } = JSON.parse(storedAuth);
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }
    return { 'Content-Type': 'application/json' };
};

export const backendService = {
    // VLANs & Devices
    async getTopology(): Promise<{ vlans: VLAN[] }> {
        const res = await fetch(`${API_URL}/network/topology`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch topology');
        return res.json();
    },

    async getDevices(): Promise<Device[]> {
        const res = await fetch(`${API_URL}/network/devices`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch devices');
        return res.json();
    },

    // ACLs
    async getAcls(): Promise<ACLRule[]> {
        const res = await fetch(`${API_URL}/firewall/rules`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch ACL rules');
        return res.json();
    },

    async addAcl(rule: Omit<ACLRule, 'id'>): Promise<ACLRule> {
        const res = await fetch(`${API_URL}/firewall/rules`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(rule)
        });
        if (!res.ok) throw new Error('Failed to add ACL rule');
        return res.json();
    },

    async deleteAcl(id: string | number): Promise<void> {
        const res = await fetch(`${API_URL}/firewall/rules/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete ACL rule');
    }
};
