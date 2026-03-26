// // const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://alyra.up.railway.app";

// function getToken(): string | null {
//   if (typeof window === "undefined") return null;
//   return localStorage.getItem("alyra_token");
// }

// async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
//   const token = getToken();
//   const headers: HeadersInit = {
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     ...((options.headers as Record<string, string>) || {}),
//   };
//   const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
//   const data = await res.json();
//   if (!res.ok) throw new Error(data?.message || data?.error || "Request failed");
//   return data as T;
// }

// // Auth
// export async function register(payload: { phone: string; pin: string; full_name: string }) {
//   return request<{ message: string }>("/api/auth/register", {
//     method: "POST",
//     body: JSON.stringify(payload),
//   });
// }

// export async function login(payload: { phone: string; pin: string }) {
//   return request<{ token: string; user: User }>("/api/auth/login", {
//     method: "POST",
//     body: JSON.stringify(payload),
//   });
// }

// // Types
// export interface User {
//   id: string;
//   full_name: string;
//   phone: string;
// }

// export interface Device {
//   id: string;
//   device_type: "grid_meter" | "solar_payg";
//   meter_number: string;
//   current_units: number;
//   battery_percentage?: number;
//   is_active: boolean;
// }

// export interface Prediction {
//   device_id: string;
//   predicted_depletion_hours: number;
//   recommended_topup_naira: number;
//   recommended_units: number;
//   current_units: number;
// }

// export interface Transaction {
//   id: string;
//   amount: number;
//   units_purchased: number;
//   token?: string;
//   status: "success" | "pending" | "failed";
//   created_at: string;
// }

// export interface PaymentInitResponse {
//   payment_url: string;
//   transaction_reference: string;
//   amount: number;
// }

// // Devices
// export async function getMyDevices() {
//   return request<Device[]>("/api/devices/my");
// }

// export async function getDevicePrediction(deviceId: string) {
//   return request<Prediction>(`/api/devices/${deviceId}/prediction`);
// }

// // Payments
// export async function initiatePayment(payload: { device_id: string; amount: number }) {
//   return request<PaymentInitResponse>("/api/payments/initiate", {
//     method: "POST",
//     body: JSON.stringify(payload),
//   });
// }

// export async function getTransactions() {
//   return request<Transaction[]>("/api/payments/transactions");
// }

// export async function verifyPayment(reference: string) {
//   return request<{ status: string; token?: string; units_credited?: number }>(
//     `/api/payments/verify/${reference}`
//   );
// }


/////-------2222222222222----------//////

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// export async function apiCall(
//   endpoint: string,
//   options: RequestInit = {}
// ) {
//   const token = typeof window !== 'undefined'
//     ? localStorage.getItem('alyra_token')
//     : null;

//   const res = await fetch(`${API}${endpoint}`, {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       ...options.headers,
//     },
//   });

//   const data = await res.json();

//   if (!res.ok) {
//     throw new Error(data?.error?.message || 'Something went wrong');
//   }

//   return data;
// }

// export const api = {
//   register: (phone: string, pin: string, full_name: string) =>
//     apiCall('/api/auth/register', {
//       method: 'POST',
//       body: JSON.stringify({ phone, pin, full_name }),
//     }),

//   login: (phone: string, pin: string) =>
//     apiCall('/api/auth/login', {
//       method: 'POST',
//       body: JSON.stringify({ phone, pin }),
//     }),

//   me: () => apiCall('/api/auth/me'),

//   getDevices: () => apiCall('/api/devices'),

//   initiatePayment: (device_id: string, amount_kobo: number, channel: string) =>
//     apiCall('/api/payments/initiate', {
//       method: 'POST',
//       body: JSON.stringify({ device_id, amount_kobo, channel }),
//     }),

//   getTransactions: () => apiCall('/api/payments/transactions'),

//   registerGridMeter: (data: {
//     device_name: string;
//     meter_number: string;
//     tariff_kobo_per_kwh: number;
//     state?: string;
//     lga?: string;
//   }) => apiCall('/api/devices/grid', { method: 'POST', body: JSON.stringify(data) }),
// };


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
  
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Request failed');
  }

  return data.data;
}

export const authAPI = {
  register: (body: { phone: string; pin: string; full_name?: string }) =>
    request('POST', '/api/auth/register', body),
  login: (body: { phone: string; pin: string }) =>
    request('POST', '/api/auth/login', body),
  me: () => request('GET', '/api/auth/me'),
};

export const vendorAPI = {
  register: (body: { business_name: string; owner_name: string; phone: string; email?: string }) =>
    request('POST', '/api/vendors/register', body),
  get: (id: string) => request('GET', `/api/vendors/${id}`),
};

export const deviceAPI = {
  list: () => request('GET', '/api/devices'),
  get: (id: string) => request('GET', `/api/devices/${id}`),
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