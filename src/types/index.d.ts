type Role = "academy" | "student";

interface RoleData {
  title: Role;
  description: string;
}

interface AcademyStats {
  studentsCount: number;
  accumulatedFees: number;
  totalEarnings: number;
  activeStudents: number;
  courseCompletionRate: number;
  averageRating: number;
  monthlyEnrollments: number;
  retentionRate: number;
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
