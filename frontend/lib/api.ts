const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://alyra.up.railway.app";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("alyra_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || data?.error || "Request failed");
  return data as T;
}

// Auth
export async function register(payload: { phone: string; pin: string; full_name: string }) {
  return request<{ message: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { phone: string; pin: string }) {
  return request<{ token: string; user: User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Types
export interface User {
  id: string;
  full_name: string;
  phone: string;
}

export interface Device {
  id: string;
  device_type: "grid_meter" | "solar_payg";
  meter_number: string;
  current_units: number;
  battery_percentage?: number;
  is_active: boolean;
}

export interface Prediction {
  device_id: string;
  predicted_depletion_hours: number;
  recommended_topup_naira: number;
  recommended_units: number;
  current_units: number;
}

export interface Transaction {
  id: string;
  amount: number;
  units_purchased: number;
  token?: string;
  status: "success" | "pending" | "failed";
  created_at: string;
}

export interface PaymentInitResponse {
  payment_url: string;
  transaction_reference: string;
  amount: number;
}

// Devices
export async function getMyDevices() {
  return request<Device[]>("/api/devices/my");
}

export async function getDevicePrediction(deviceId: string) {
  return request<Prediction>(`/api/devices/${deviceId}/prediction`);
}

// Payments
export async function initiatePayment(payload: { device_id: string; amount: number }) {
  return request<PaymentInitResponse>("/api/payments/initiate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getTransactions() {
  return request<Transaction[]>("/api/payments/transactions");
}

export async function verifyPayment(reference: string) {
  return request<{ status: string; token?: string; units_credited?: number }>(
    `/api/payments/verify/${reference}`
  );
}