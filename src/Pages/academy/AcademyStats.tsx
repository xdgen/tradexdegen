import React, { useState, useEffect, useMemo } from "react";
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
import { useAcademy } from "../../hooks/useAcademy";

const AcademyStats: React.FC = () => {
  const { role } = useCheckUserRole();
  const { publicKey } = useWallet();
  const { getAcademy } = useAcademy();
  const [stats, setStats] = useState<AcademyStats>({
    studentsCount: 0,
    accumulatedFees: 0,
    totalEarnings: 0,
  });
  const [academyName, setAcademyName] = useState("");
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  const walletKey = useMemo(() => publicKey ?? null, [publicKey]);
  const academyQuery = getAcademy(walletKey ?? undefined);

  useEffect(() => {
    if (academyQuery?.isError) {
      console.error("Error fetching academy:", academyQuery?.error);
      toast.error("Failed to load academy data");
      return;
    }

    if (academyQuery?.data) {
      const academy = academyQuery?.data;

      const studentsCount = academy.totalStudents?.toNumber?.() || 0;
      const accumulatedFees = academy.totalEnrollmentAmount?.toNumber?.() || 0;
      const totalEarnings = accumulatedFees * 0.98;
      console.log(academyQuery.data);

      setAcademyName(academy.title);
      setStats({
        studentsCount,
        accumulatedFees,
        totalEarnings,
      });
    }
  }, [academyQuery?.data, academyQuery?.isError, academyQuery?.isLoading]);

  useEffect(() => {
    if (role !== "ACADEMY") {
      // Redirect or show error
      return;
    }
  }, [role, publicKey]);

  if (role !== "ACADEMY") {
    return (
      <div className="text-white text-center mt-20">
        Access denied. Academy role required.
      </div>
    );
  }

  if (academyQuery?.isLoading) {
    return <div className="text-white text-center mt-20">Loading stats...</div>;
  }

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-black text-white p-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {academyName} Academy Dashboard
            </h1>
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

          {/* <div className="bg-[#111] rounded-lg p-4 h-[114px]">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h1 className="text-sm font-medium">Active Students</h1>
              <Users className="size-5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.activeStudents}</div>
            </div>
          </div> */}

          {/* <div className="bg-[#111] rounded-lg p-4 h-[114px]">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h1 className="text-sm font-medium">Average Rating</h1>
              <Star className="size-5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.averageRating}/5</div>
            </div>
          </div> */}

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
          <h2 className="text-xl font-semibold mb-4">Transactions</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>X Handle</TableHead>
                <TableHead>Wallet Address</TableHead>
                <TableHead>Transaction Hash</TableHead>
                <TableHead>Explorer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.xHandle}</TableCell>
                  <TableCell>{tx.wallet_address}</TableCell>
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
