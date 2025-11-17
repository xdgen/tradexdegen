import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../provider/AuthProvider";
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

// Helper function to truncate academy name
const truncateAcademyName = (name: string): string => {
  if (!name) return "";

  // Remove "academy" (case insensitive) and trim
  const cleanedName = name.replace(/\bacademy\b/gi, "").trim();

  // If name is too long, truncate and add ellipsis
  if (cleanedName.length > 20) {
    return cleanedName.substring(0, 20) + "...";
  }

  return cleanedName || "My Academy";
};

const AcademyStats: React.FC = () => {
  const { role } = useAuth();
  const { publicKey } = useWallet();
  const { getAcademy } = useAcademy();

  const [transactions] = useState<any[]>([]); // Empty for now

  // Memoize wallet key to prevent unnecessary re-renders
  const walletKey = useMemo(() => publicKey ?? null, [publicKey]);

  // Use the academy query
  const academyQuery = getAcademy(walletKey ?? undefined);

  // Memoize the stats calculation
  const stats = useMemo(() => {
    if (!academyQuery?.data) {
      return {
        studentsCount: 0,
        accumulatedFees: 0,
        totalEarnings: 0,
      };
    }

    const academy = academyQuery.data;
    const studentsCount = academy.totalStudents?.toNumber?.() || 0;
    const accumulatedFees = academy.totalEnrollmentAmount?.toNumber?.() || 0;
    const totalEarnings = accumulatedFees * 0.98;

    return {
      studentsCount,
      accumulatedFees,
      totalEarnings,
    };
  }, [academyQuery?.data]);

  // Memoize the academy name with truncation
  const academyName = useMemo(() => {
    if (!academyQuery?.data?.title) {
      return "My Academy";
    }
    return truncateAcademyName(academyQuery.data.title);
  }, [academyQuery?.data?.title]);

  // Handle errors once
  useEffect(() => {
    if (academyQuery?.isError) {
      toast.error("Failed to load academy data");
    }
  }, [academyQuery?.isError]);

  // Early returns for different states
  if (role !== "ACADEMY") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">
            Academy role required to view this page.
          </p>
        </div>
      </div>
    );
  }

  if (academyQuery?.isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading academy stats...</p>
          </div>
        </div>
      </div>
    );
  }

  if (academyQuery?.isError) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-400">Failed to load academy data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="p-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              {academyName} Dashboard
            </h1>
            <p className="text-gray-400">
              Track your academy performance and manage students
            </p>
          </div>

          <SendAcademyMessage />
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Students"
            value={stats.studentsCount}
            icon={<Users className="size-5 text-muted-foreground" />}
            change={1}
          />

          <StatCard
            title="Accumulated Fees"
            value={`$${stats.accumulatedFees.toFixed(2)}`}
            icon={<DollarSign className="size-5 text-muted-foreground" />}
            change={12}
          />

          <StatCard
            title="Total Earnings"
            value={`$${stats.totalEarnings.toFixed(2)}`}
            icon={<TrendingUp className="size-5 text-muted-foreground" />}
            change={10}
          />
        </div>

        {/* Transactions Table */}
        <div className="bg-[#111] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          {transactions.length > 0 ? (
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
                    <TableCell className="font-mono text-sm">
                      {tx.wallet_address}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {tx.hash}
                    </TableCell>
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
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No transactions yet</p>
              <p className="text-sm mt-1">
                Student enrollments will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Separate stat card component to prevent re-renders
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change: number;
}

const StatCard: React.FC<StatCardProps> = React.memo(
  ({ title, value, icon, change }) => (
    <div className="bg-[#111] rounded-lg p-4 h-[114px]">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h1 className="text-sm font-medium">{title}</h1>
        {icon}
      </div>

      <div className="space-y-0.5">
        <div className="text-2xl font-extrabold">{value}</div>
        <div
          className={`text-sm ${
            change >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(0)}%
        </div>
      </div>
    </div>
  )
);

StatCard.displayName = "StatCard";

export default AcademyStats;
