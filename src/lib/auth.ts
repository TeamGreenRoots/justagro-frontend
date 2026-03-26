import Cookies from "js-cookie";
import api from "./api";
import { User } from "@/types";

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = Cookies.get("user");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function getToken(): string | null {
  return Cookies.get("accessToken") || null;
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function logout(): void {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  Cookies.remove("user");
  window.location.href = "/login";
}

export async function loginUser(phone: string, password: string): Promise<User> {
  const res = await api.post("/auth/login", { phone, password });
  const { accessToken, refreshToken, user } = res.data;
  Cookies.set("accessToken",  accessToken,       { expires: 7 });
  Cookies.set("refreshToken", refreshToken,      { expires: 30 });
  Cookies.set("user",         JSON.stringify(user), { expires: 7 });
  return user as User;
}

export async function registerUser(data: Record<string, any>): Promise<void> {
  await api.post("/auth/register", data);
}

export function getDashboardPath(role: string): string {
  switch (role) {
    case "FARMER":     return "/dashboard/farmer";
    case "BUYER":      return "/dashboard/buyer";
    case "AGGREGATOR": return "/dashboard/aggregator";
    default:           return "/login";
  }
}
