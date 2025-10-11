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
