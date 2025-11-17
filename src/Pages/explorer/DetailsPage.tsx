import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCallback } from "react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

import { AcademyClass } from "../../data";
import { useAuth } from "../../provider/AuthProvider";
import { useAcademy } from "../../hooks/useAcademy";
import { compareDate, markdownToHtml } from "../../lib/utils";

function DetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background text-white">
      {/* Banner Skeleton */}
      <div className="w-full h-56 sm:h-72 md:h-80 lg:h-96 bg-zinc-800 animate-pulse" />

      {/* Content Skeleton */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-10 relative">
        <div className="rounded-xl border border-white/10 bg-secondary/60 backdrop-blur p-4 sm:p-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="h-8 bg-zinc-700 rounded w-3/4 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 bg-zinc-700 rounded w-20 animate-pulse" />
              <div className="h-6 bg-zinc-700 rounded w-20 animate-pulse" />
            </div>
          </div>

          {/* Facilitator Skeleton */}
          <div className="mt-2 h-4 bg-zinc-700 rounded w-1/2 animate-pulse" />

          {/* Description Skeleton */}
          <div className="mt-4 space-y-2">
            <div className="h-4 bg-zinc-700 rounded w-full animate-pulse" />
            <div className="h-4 bg-zinc-700 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-zinc-700 rounded w-4/6 animate-pulse" />
          </div>

          {/* Stats Skeleton */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-white/10 p-3">
                <div className="h-4 bg-zinc-700 rounded w-3/4 mx-auto animate-pulse mb-2" />
                <div className="h-6 bg-zinc-700 rounded w-1/2 mx-auto animate-pulse" />
              </div>
            ))}
          </div>

          {/* Button Skeleton */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="h-10 bg-zinc-700 rounded w-24 animate-pulse" />
            <div className="h-10 bg-zinc-700 rounded w-40 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DetailsPage() {
  const { connected, publicKey } = useWallet();
  const { role } = useAuth();
  const params = useParams();
  const navigate = useNavigate();
  const { getAcademyByPDA, enroll, getStudentPDA, getIsStudentEnrolled } =
    useAcademy();

  // Early return if no valid ID
  if (!params.id || params.id === "undefined") {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-400">Invalid academy ID.</p>
          <Link
            to="/explorer"
            className="mt-3 inline-block text-fuchsia-300 hover:text-fuchsia-200 underline"
          >
            Back to Explorer
          </Link>
        </div>
      </div>
    );
  }

  const academyPDA = new PublicKey(params.id);
  const studentPDA = publicKey ? getStudentPDA(publicKey) : null;

  const { data: academyData, isLoading: isFetchingAcademyData } =
    getAcademyByPDA(academyPDA);

  // Check if student is already enrolled - only enable if connected as student
  const { data: isEnrolled, isLoading: isCheckingEnrollment } =
    getIsStudentEnrolled(academyPDA, studentPDA!);

  // Memoize the item creation to prevent unnecessary re-renders
  const item = useCallback((): AcademyClass | null => {
    if (!academyData) return null;

    return {
      id: academyPDA.toBase58(),
      pda: academyPDA.toBase58(),
      owner: academyData.owner.toBase58(),
      title: academyData.title,
      description: academyData.description,
      banner: academyData.banner,
      facilitator: academyData.tutors[0] || "Unknown",
      isPaid: !!academyData.fee,
      price: academyData.fee
        ? academyData.fee.toNumber() / LAMPORTS_PER_SOL
        : undefined,
      startDate: new Date(
        academyData.startDate.toNumber() * 1000
      ).toISOString(),
      endDate: new Date(academyData.endDate.toNumber() * 1000).toISOString(),
      status: compareDate(
        academyData.startDate.toNumber(),
        academyData.endDate.toNumber()
      ),
      students: academyData.totalStudents.toNumber(),
      mentors: academyData.tutors.length > 0 ? academyData.tutors : null,
    };
  }, [academyData, academyPDA]);

  const currentItem = item();

  // Show skeleton while loading
  if (isFetchingAcademyData || !currentItem) {
    return <DetailsSkeleton />;
  }

  const isEnded = currentItem.status === "Ended";
  const isOngoing = currentItem.status === "Ongoing";

  const handleEnroll = () => {
    if (!publicKey) return;

    enroll.mutate({
      studentPDA: getStudentPDA(publicKey),
      academyPDA: academyPDA,
    });
  };

  const renderActionButton = () => {
    if (!connected) {
      return (
        <div className="flex flex-col items-center">
          <WalletMultiButton
            style={{
              margin: "1px 0",
              padding: "2px 15px",
              borderRadius: "0.5rem",
              backgroundColor: "#0E0E0F",
              fontSize: "14px",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.4)",
            }}
          />
        </div>
      );
    }

    if (role === "STUDENT") {
      // Show loading state while checking enrollment
      if (isCheckingEnrollment) {
        return (
          <button
            className="px-4 py-2 rounded-lg font-semibold transition bg-gray-600 text-gray-300 cursor-not-allowed"
            disabled
          >
            Checking enrollment...
          </button>
        );
      }

      // If already enrolled, show enrolled status
      if (isEnrolled) {
        return (
          <button
            className="px-4 h-9 rounded-lg font-semibold transition bg-emerald-600 text-white cursor-default"
            disabled
          >
            ✓ Enrolled
          </button>
        );
      }

      if (isEnded) {
        return (
          <button
            className="px-4 py-2 rounded-lg font-semibold transition bg-gray-700 text-gray-400 cursor-not-allowed"
            disabled
          >
            Class Ended
          </button>
        );
      } else if (!isOngoing) {
        return (
          <button
            onClick={handleEnroll}
            disabled={enroll.isPending}
            className="px-4 py-2 rounded-lg font-semibold transition bg-fuchsia-600 hover:bg-fuchsia-700 text-white disabled:opacity-50"
          >
            {enroll.isPending ? "Registering..." : "Register for Class"}
          </button>
        );
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Banner */}
      <div className="w-full h-56 sm:h-72 md:h-80 lg:h-96 relative">
        <img
          src={currentItem.banner}
          alt="class banner"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://source.unsplash.com/featured/1280x720?solana,crypto";
          }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-10 relative">
        <div className="rounded-xl border border-white/10 bg-secondary/60 backdrop-blur p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              {currentItem.title}
            </h1>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  currentItem.isPaid
                    ? "text-amber-300 border-amber-400/40"
                    : "text-emerald-300 border-emerald-400/40"
                }`}
              >
                {currentItem.isPaid
                  ? `Paid • ${currentItem.price} SOL`
                  : "Free"}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  currentItem.status === "Ongoing"
                    ? "text-emerald-400 border-emerald-500/30"
                    : currentItem.status === "Upcoming"
                    ? "text-fuchsia-300 border-fuchsia-500/30"
                    : "text-gray-400 border-gray-500/20"
                }`}
              >
                {currentItem.status}
              </span>
            </div>
          </div>

          <p className="mt-2 text-sm text-gray-400">
            Facilitator: {currentItem.facilitator}
          </p>

          {/* Description */}
          <div
            className="mt-4 prose prose-invert max-w-none text-gray-200"
            dangerouslySetInnerHTML={{
              __html: markdownToHtml(currentItem.description),
            }}
          />

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-lg border border-white/10 p-3">
              <div className="text-xs text-gray-400">Students</div>
              <div className="text-lg font-bold">
                {currentItem.students.toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <div className="text-xs text-gray-400">Mentors</div>
              <div className="text-lg font-bold">
                {currentItem.mentors ? currentItem.mentors.length : 0}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <div className="text-xs text-gray-400">Starts</div>
              <div className="text-lg font-bold">
                {new Date(currentItem.startDate).toLocaleDateString()}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <div className="text-xs text-gray-400">Ends</div>
              <div className="text-lg font-bold">
                {new Date(currentItem.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg border border-white/10 text-gray-200 hover:bg-white/5 transition"
            >
              ← Back
            </button>
            {renderActionButton()}
          </div>
        </div>
      </div>
    </div>
  );
}
