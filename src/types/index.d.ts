type Role = "ACADEMY" | "STUDENT";

interface RoleData {
  title: Role;
  description: string;
}

interface AcademyStats {
  studentsCount: number;
  accumulatedFees: number;
  totalEarnings: number;
}

interface Academy {
  id: string;
  academyStreamId: string;
  contract_address: string;
  created_at: Date;
  updated_at: Date;
  userId: string;
}

interface Token {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

interface User {
  id: string;
  wallet: string;
  role: Role;
  created_at: Date;
  updated_at: Date;
}

interface AuthResponse {
  token: Token;
  user: User;
}

interface CheckUserResponse {
  status: boolean;
  message: string;
  wallet: string;
}

interface AcademyResponse<T> extends Omit<CheckUserResponse, "wallet"> {
  data: T;
}
