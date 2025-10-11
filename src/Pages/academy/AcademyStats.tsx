import React, { useState, useEffect } from "react";
import { useCheckUserRole } from "../../provider/UserRoleProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { toast } from "sonner";
import { Users, DollarSign, TrendingUp, Star } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import Navbar from "../../components/dashboard/navbar";
import SendAcademyMessage from "../../components/dialogs/sendAcademyMessage";

// Mock recent activities
const mockActivities = [
  {
    id: 1,
    type: "enrollment",
    student: "Alice Johnson",
    date: "2025-01-15",
    course: "Trading Basics",
  },
  {
    id: 2,
    type: "completion",
    student: "Bob Smith",
    date: "2025-01-14",
    course: "Advanced Strategies",
  },
  {
    id: 3,
    type: "enrollment",
    student: "Charlie Brown",
    date: "2025-01-13",
    course: "Risk Management",
  },
  {
    id: 4,
    type: "enrollment",
    student: "Diana Prince",
    date: "2025-01-12",
    course: "Crypto Trading",
  },
];

// Mock top students
const mockTopStudents = [
  {
    id: 1,
    name: "Alice Johnson",
    coursesCompleted: 5,
    averageScore: 95,
    trend: "up",
  },
  {
    id: 2,
    name: "Bob Smith",
    coursesCompleted: 4,
    averageScore: 92,
    trend: "up",
  },
  {
    id: 3,
    name: "Charlie Brown",
    coursesCompleted: 3,
    averageScore: 88,
    trend: "down",
  },
  {
    id: 4,
    name: "Diana Prince",
    coursesCompleted: 3,
    averageScore: 85,
    trend: "up",
  },
];

// Mock transactions
const mockTransactions = [
  {
    id: 1,
    xHandle: "@alice",
    telegram: "@alice_tg",
    hash: "5K8q7p9L3mN2oP4rS6tU8vW0xY2zA4bC6dE8fG0hI2jK4lM6nO8pQ2rS4tU6vW8xY0z",
    explorer:
      "https://explorer.solana.com/tx/5K8q7p9L3mN2oP4rS6tU8vW0xY2zA4bC6dE8fG0hI2jK4lM6nO8pQ2rS4tU6vW8xY0z",
  },
  {
    id: 2,
    xHandle: "@bob",
    telegram: "@bob_tg",
    hash: "3J5k9mN1oQ3sU5wY7aC9eG1iK3mO5qS7uW9yA1cE3gI5kM7oQ9sU1wY3aC5eG7iK9m",
    explorer:
      "https://explorer.solana.com/tx/3J5k9mN1oQ3sU5wY7aC9eG1iK3mO5qS7uW9yA1cE3gI5kM7oQ9sU1wY3aC5eG7iK9m",
  },
  {
    id: 3,
    xHandle: "@charlie",
    telegram: "@charlie_tg",
    hash: "7N9p1rT3vX5zB7dF9hJ1lN3pR5tV7xZ9bD1fH3jL5nP7rT9vX1zB3dF5hJ7lN9pR1t",
    explorer:
      "https://explorer.solana.com/tx/7N9p1rT3vX5zB7dF9hJ1lN3pR5tV7xZ9bD1fH3jL5nP7rT9vX1zB3dF5hJ7lN9pR1t",
  },
  {
    id: 4,
    xHandle: "@diana",
    telegram: "@diana_tg",
    hash: "9P1rT3vX5zB7dF9hJ1lN3pR5tV7xZ9bD1fH3jL5nP7rT9vX1zB3dF5hJ7lN9pR1tV3",
    explorer:
      "https://explorer.solana.com/tx/9P1rT3vX5zB7dF9hJ1lN3pR5tV7xZ9bD1fH3jL5nP7rT9vX1zB3dF5hJ7lN9pR1tV3",
  },
];

const AcademyStats: React.FC = () => {
  const { role } = useCheckUserRole();
  const { publicKey } = useWallet();
  const [stats, setStats] = useState<AcademyStats>({
    studentsCount: 0,
    accumulatedFees: 0,
    totalEarnings: 0,
    activeStudents: 0,
    courseCompletionRate: 0,
    averageRating: 0,
    monthlyEnrollments: 0,
    retentionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (role !== "academy") {
      // Redirect or show error
      return;
    }
    fetchStats();
  }, [role, publicKey]);

  // Fetch academy stats
  const fetchStats = async () => {
    if (!publicKey) return;

    try {
      // Mock other stats
      const totalEarnings = 0 * 0.98; // Deduct 2% platform fee
      const activeStudents = 0; // Example
      const courseCompletionRate = 75; // Mock
      const averageRating = 4.2; // Mock
      const monthlyEnrollments = 0; // Mock
      const retentionRate = 85;

      console.log(
        totalEarnings,
        activeStudents,
        courseCompletionRate,
        averageRating,
        monthlyEnrollments,
        retentionRate
      );

      setStats({
        studentsCount: 0,
        accumulatedFees: 0,
        totalEarnings,
        activeStudents,
        courseCompletionRate,
        averageRating,
        monthlyEnrollments,
        retentionRate,
      });
      setRecentActivities(mockActivities);
      setTopStudents(mockTopStudents);
      setTransactions(mockTransactions);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  if (role !== "academy") {
    return (
      <div className="text-white text-center mt-20">
        Access denied. Academy role required.
      </div>
    );
  }

  if (loading) {
    return <div className="text-white text-center mt-20">Loading stats...</div>;
  }

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-black text-white p-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Academy Dashboard</h1>
            <p className="text-gray-400 mb-6">
              Track your academy performance and manage students
            </p>
          </div>

          <SendAcademyMessage />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#111] rounded-lg p-4 h-[114px]">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h1 className="text-sm font-medium">Students</h1>
              <Users className="size-5 text-muted-foreground" />
            </div>

            <div className="space-y-0.5">
              <div className="text-2xl font-extrabold">
                {stats.studentsCount}
              </div>
              <div
                className={`text-sm ${
                  1 >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {1 >= 0 ? "↑" : "↓"} {Math.abs(1 || 0).toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="bg-[#111] rounded-lg p-4 h-[114px]">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h1 className="text-sm font-medium">Accumulated Fees</h1>
              <DollarSign className="size-5 text-muted-foreground" />
            </div>

            <div className="space-y-0.5">
              <div className="text-2xl font-extrabold">
                ${stats.accumulatedFees.toFixed(2)}
              </div>

              <div className="text-sm text-green-500">+12%</div>
            </div>
          </div>

          <div className="bg-[#111] rounded-lg p-4 h-[114px]">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h1 className="text-sm font-medium">Total Earnings</h1>
              <TrendingUp className="size-5 text-muted-foreground" />
            </div>

            <div className="space-y-0.5">
              <div className="text-2xl font-bold">
                ${stats.totalEarnings.toFixed(2)}
              </div>

              <div className="text-sm text-green-500">+10%</div>
            </div>
          </div>

          <div className="bg-[#111] rounded-lg p-4 h-[114px]">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h1 className="text-sm font-medium">Active Students</h1>
              <Users className="size-5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.activeStudents}</div>
            </div>
          </div>

          <div className="bg-[#111] rounded-lg p-4 h-[114px]">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h1 className="text-sm font-medium">Average Rating</h1>
              <Star className="size-5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.averageRating}/5</div>
            </div>
          </div>

          {/* <div className="bg-[#111] rounded-lg p-4 h-[114px]">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h1 className="text-sm font-medium">Retention Rate</h1>
              <Award className="size-5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.retentionRate}%</div>
            </div>
          </div> */}
        </div>

        <div className="bg-[#111] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Top Students</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Courses Completed</TableHead>
                <TableHead>Average Score</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topStudents.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell>#{index + 1}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.coursesCompleted}</TableCell>
                  <TableCell>{student.averageScore}%</TableCell>
                  <TableCell>{student.trend === "up" ? "↑" : "↓"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-[#111] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Transactions</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>X Handle</TableHead>
                <TableHead>Telegram</TableHead>
                <TableHead>Transaction Hash</TableHead>
                <TableHead>Explorer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.xHandle}</TableCell>
                  <TableCell>{tx.telegram}</TableCell>
                  <TableCell className="font-mono text-xs">{tx.hash}</TableCell>
                  <TableCell>
                    <a
                      href={tx.explorer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400 underline"
                    >
                      View
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AcademyStats;
