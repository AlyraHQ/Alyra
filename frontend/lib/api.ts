// const API = process.env.NEXT_PUBLIC_API_URL || 'https://alyra.up.railway.app';

// async function req(endpoint: string, options: RequestInit = {}) {
//   const token = typeof window !== 'undefined' ? localStorage.getItem('alyra_token') : null;
//   const res = await fetch(`${API}${endpoint}`, {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       ...((options.headers as Record<string, string>) || {}),
//     },
//   });
//   const json = await res.json();
//   if (!res.ok) throw new Error(json?.error?.message || json?.message || 'Something went wrong');
//   return json.data ?? json;
// }

// export interface Prediction {
//   hours_until_empty: number;
//   units_remaining: number;
//   recommended_top_up_naira: number;
//   needs_alert: boolean;
//   consumption_rate_per_hour: number;
// }

// export const api = {
//   // Auth
//   register: (data: { phone: string; pin: string; full_name: string; vendor_id?: string }) =>
//     req('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
//   login: (phone: string, pin: string) =>
//     req('/api/auth/login', { method: 'POST', body: JSON.stringify({ phone, pin }) }),
//   me: () => req('/api/auth/me'),

//   // Vendors
//   listVendors: () => req('/api/vendors'),
//   registerVendor: (data: { business_name: string; owner_name: string; phone: string; email?: string }) =>
//     req('/api/vendors/register', { method: 'POST', body: JSON.stringify(data) }),

//   // Devices
//   getDevices: () => req('/api/devices'),
//   registerGrid: (data: { device_name: string; meter_number: string; tariff_kobo_per_kwh: number; state?: string; lga?: string; vendor_id?: string }) =>
//     req('/api/devices/grid', { method: 'POST', body: JSON.stringify(data) }),
//   registerSolar: (data: { device_name: string; kit_serial_number: string; daily_rate_kobo: number; state?: string; lga?: string; vendor_id?: string }) =>
//     req('/api/devices/solar', { method: 'POST', body: JSON.stringify(data) }),
//   getPrediction: (deviceId: string): Promise<Prediction> =>
//     req(`/api/devices/${deviceId}/prediction`),

//   // Payments
//   initiatePayment: (device_id: string, amount_kobo: number, channel: string) =>
//     req('/api/payments/initiate', {
//       method: 'POST',
//       body: JSON.stringify({ device_id, amount_kobo, channel })
//     }),
//   testConfirm: (reference: string) =>
//     req('/api/payments/test-confirm', { method: 'POST', body: JSON.stringify({ reference }) }),
//   getTransactions: () => req('/api/payments/transactions'),
//   verifyPayment: (reference: string) =>
//     req('/api/payments/verify', {
//       method: 'POST',
//       body: JSON.stringify({ reference })
//     }),
// };

// frontend/lib/api.ts
const API = process.env.NEXT_PUBLIC_API_URL || 'https://alyra.up.railway.app';

async function req(endpoint: string, options: RequestInit = {}) {
  // Use 'access_token' consistently
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || json?.message || 'Something went wrong');
  return json.data ?? json;
}

export interface Prediction {
  hours_until_empty: number;
  units_remaining: number;
  recommended_top_up_naira: number;
  needs_alert: boolean;
  consumption_rate_per_hour: number;
}

export const api = {
  // Auth
  register: (data: { phone: string; pin: string; full_name: string; vendor_id?: string }) =>
    req('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    
  login: async (phone: string, pin: string) => {
    const response = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, pin }),
    });
    
    const json = await response.json();
    
    if (!response.ok) {
      throw new Error(json?.message || json?.error?.message || 'Login failed');
    }
    
    // Extract token from your backend's response format
    // Your backend returns: { success: true, data: { token, user } }
    const token = json.data?.token || json.token;
    
    if (!token) {
      throw new Error('No token received from server');
    }
    
    // Store token with the correct key
    localStorage.setItem('access_token', token);
    
    return json.data ?? json;
  },
  
  me: () => req('/api/auth/me'),
  logout: () => {
    localStorage.removeItem('access_token');
  },

  // Vendors
  listVendors: () => req('/api/vendors'),
  registerVendor: (data: { business_name: string; owner_name: string; phone: string; email?: string }) =>
    req('/api/vendors/register', { method: 'POST', body: JSON.stringify(data) }),

  // Devices
  getDevices: () => req('/api/devices'),
  registerGrid: (data: { device_name: string; meter_number: string; tariff_kobo_per_kwh: number; state?: string; lga?: string; vendor_id?: string }) =>
    req('/api/devices/grid', { method: 'POST', body: JSON.stringify(data) }),
  registerSolar: (data: { device_name: string; kit_serial_number: string; daily_rate_kobo: number; state?: string; lga?: string; vendor_id?: string }) =>
    req('/api/devices/solar', { method: 'POST', body: JSON.stringify(data) }),
  getPrediction: (deviceId: string): Promise<Prediction> =>
    req(`/api/devices/${deviceId}/prediction`),

  // Payments
  initiatePayment: (device_id: string, amount_kobo: number, channel: string) =>
    req('/api/payments/initiate', {
      method: 'POST',
      body: JSON.stringify({ device_id, amount_kobo, channel })
    }),
  testConfirm: (reference: string) =>
    req('/api/payments/test-confirm', { method: 'POST', body: JSON.stringify({ reference }) }),
  getTransactions: () => req('/api/payments/transactions'),
  verifyPayment: (reference: string) =>
    req('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ reference })
    }),
};