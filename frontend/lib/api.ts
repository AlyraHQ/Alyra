
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function request(method: string, path: string, body?: object) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Request failed');
  return data.data;
}

export const authAPI = {
  register: (body: { phone: string; pin: string; full_name?: string }) =>
    request('POST', '/api/auth/register', body),
  login: (body: { phone: string; pin: string }) =>
    request('POST', '/api/auth/login', body),
  me: () => request('GET', '/api/auth/me'),
  selectVendor: (vendor_id: string) =>
    request('POST', '/api/auth/select-vendor', { vendor_id }),
};

export const vendorAPI = {
  list: () => request('GET', '/api/vendors'),
  register: (body: { business_name: string; owner_name: string; phone: string; email?: string }) =>
    request('POST', '/api/vendors/register', body),
};

export const deviceAPI = {
  list: () => request('GET', '/api/devices'),
  registerGrid: (body: { device_name: string; meter_number: string; tariff_kobo_per_kwh: number; state?: string; lga?: string }) =>
    request('POST', '/api/devices/grid', body),
  registerSolar: (body: { device_name: string; kit_serial_number: string; daily_rate_kobo: number; state?: string; lga?: string }) =>
    request('POST', '/api/devices/solar', body),
};

export const paymentAPI = {
  initiate: (body: { device_id: string; amount_kobo: number; channel: string }) =>
    request('POST', '/api/payments/initiate', body),
  testConfirm: (reference: string) =>
    request('POST', '/api/payments/test-confirm', { reference }),
  transactions: () => request('GET', '/api/payments/transactions'),
};