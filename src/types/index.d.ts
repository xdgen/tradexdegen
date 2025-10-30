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

interface User {
  id: string;
  wallet: string;
  role: Role;
  created_at: Date;
  updated_at: Date;
}

interface Token {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

interface Student {
  id: string;
  userId: string;
  contract_address: string;
  streamId: string | null;
  created_at: Date;
  updated_at: Date;
}

interface Academy {
  id: string;
  streamId: string;
  contract_address: string;
  created_at: Date;
  updated_at: Date;
  userId: string;
}

type StudentWithUser = Student & { user?: User };

interface Enrollments {
  id: string;
  academyId: string;
  studentId: string;
  contract_address: string;
  created_at: Date;
  updated_at: Date;
}

interface EnrollmentWithRelations extends Enrollments {
  student?: StudentWithUser;
  academy?: Academy;
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

interface APIResponse<T> extends Omit<CheckUserResponse, "wallet" | status> {
  success: boolean;
  data: T;
}
