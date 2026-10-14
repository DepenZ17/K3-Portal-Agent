// src/services/authService.ts
import api from "./api";
import type { LoginRequest, LoginResponse, AuthUser } from "../types/auth";

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/users/login/", credentials);
  
  if (response.data.access && response.data.refresh) {
    localStorage.setItem("accessToken", response.data.access);
    localStorage.setItem("refreshToken", response.data.refresh);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};

export const getMeApi = async (): Promise<AuthUser> => {
  const response = await api.get<AuthUser>("/users/me/");
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
};