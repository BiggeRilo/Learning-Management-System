export const ROLE_STUDENT = 'STUDENT';
export const ROLE_ADMIN = 'ADMIN';

export type Role = (typeof ROLE_STUDENT) | (typeof ROLE_ADMIN);

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone: string;
  role: Role;
  createdAt: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}
