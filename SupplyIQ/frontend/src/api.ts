import type { Dashboard } from './types'
const BASE=import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
export async function getDashboard():Promise<Dashboard>{const r=await fetch(`${BASE}/dashboard`);if(!r.ok)throw new Error('Unable to reach the SupplyIQ API');return r.json()}
export async function resolveAlert(id:number){const r=await fetch(`${BASE}/alerts/${id}/resolve`,{method:'PATCH'});if(!r.ok)throw new Error('Could not resolve alert');return r.json()}
