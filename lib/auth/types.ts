export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  pk: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface BackendLoginResponse {
  access: string;
  refresh: string;
  user: AuthenticatedUser;
}
