import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ClassStatus, AcademyClass } from "../../data";
import { useCheckUserRole } from "../../provider/UserRoleProvider";
import { useAcademy } from "../../hooks/useAcademy";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";

function markdownToHtml(md: string): string {
  let html = md.trim();
  html = html.replace(
    /^>\s?(.*)$/gm,
    '<blockquote class="border-l-2 border-fuchsia-400/40 pl-3 text-gray-300">$1</blockquote>'
  );
  html = html.replace(/^\-\s(.*)$/gm, "<li>$1</li>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/\n\n/g, "</p><p>");
  html = `<p>${html}</p>`;
  html = html.replace(
    /(<li>.*<\/li>\s*)+/gs,
    (m) => `<ul class="list-disc list-inside space-y-1">${m}</ul>`
  );
  return html;
}

export default function DetailsPage() {
  const { connected, publicKey } = useWallet();
  const { role } = useCheckUserRole();
  const params = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<AcademyClass | null>(null);
  const { getAcademyByPDA, enroll, getStudentPDA } = useAcademy();

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

  // Get academy data by PDA - simplified approach
  const academyPDA = new PublicKey(params.id);
  const { data: academyData, isLoading: isFetchingAcademyData } =
    getAcademyByPDA(academyPDA);

  useEffect(() => {
    if (academyData) {
      const data = {
        id: academyPDA!.toBase58(),
        pda: academyPDA!.toBase58(),
        owner: academyData.owner.toBase58(),
        title: academyData.title,
        description: academyData.description,
        banner: academyData.banner,
        facilitator: academyData.tutors[0] || "Unknown",
        isPaid: academyData.fee ? true : false,
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
      setItem(data);
    }
  }, [academyData]);

  function compareDate(startTime: number, endTime: number): ClassStatus {
    const currentDate = new Date();
    const startDate = new Date(startTime * 1000);
    const endDate = new Date(endTime * 1000);

    if (currentDate < startDate) {
      return "Upcoming";
    } else if (currentDate >= startDate && currentDate <= endDate) {
      return "Ongoing";
    } else {
      return "Ended";
    }
  }

  let content;

  if (!item || !params.id) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-400">
            {params.id
              ? "Academy not found or still loading..."
              : "Invalid academy ID."}
          </p>
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

  const isEnded = item.status === "Ended";

  if (isFetchingAcademyData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full h-56 sm:h-72 md:h-80 lg:h-96 bg-zinc-900 animate-pulse" />

        <div className="mx-auto h-80 max-w-5xl px-4 sm:px-6 lg:px-8 bg-zinc-900 animate-pulse" />
      </div>
    );
  }

  if (connected) {
    if (role === "STUDENT") {
      if (isEnded) {
        content = (
          <button
            className="px-4 py-2 rounded-lg font-semibold transition bg-gray-700 text-gray-400 cursor-not-allowed hover:brightness-110"
            aria-label="Register for class"
            disabled={true}
          >
            Class Ended
          </button>
        );
      } else {
        content = (
          <button
            onClick={() => {
              if (academyPDA) {
                enroll.mutate({
                  studentPDA: getStudentPDA(publicKey!),
                  academyPDA: academyPDA,
                });
              }
            }}
            disabled={enroll.isPending}
            className="px-4 py-2 rounded-lg font-semibold transition bg-fuchsia-600 hover:bg-fuchsia-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Register for class"
          >
            {enroll.isPending ? "Registering..." : "Register for Class"}
          </button>
        );
      }
    } else {
      content = null;
    }
  } else {
    content = (
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

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="w-full h-56 sm:h-72 md:h-80 lg:h-96 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.banner}
          alt="class banner"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://source.unsplash.com/featured/1280x720?solana,crypto";
          }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-10 relative">
        <div className="rounded-xl border border-white/10 bg-secondary/60 backdrop-blur p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              {item.title}
            </h1>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  item.isPaid
                    ? "text-amber-300 border-amber-400/40"
                    : "text-emerald-300 border-emerald-400/40"
                }`}
              >
                {item.isPaid ? `Paid • ${item.price} SOL` : "Free"}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  item.status === "Ongoing"
                    ? "text-emerald-400 border-emerald-500/30"
                    : item.status === "Upcoming"
                    ? "text-fuchsia-300 border-fuchsia-500/30"
                    : "text-gray-400 border-gray-500/20"
                }`}
              >
                {item.status}
              </span>
            </div>
          </div>

          <p className="mt-2 text-sm text-gray-400">
            Facilitator: {item.facilitator}
          </p>

          <div
            className="mt-4 prose prose-invert max-w-none text-gray-200"
            dangerouslySetInnerHTML={{
              __html: markdownToHtml(item.description),
            }}
          />

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-lg border border-white/10 p-3">
              <div className="text-xs text-gray-400">Students</div>
              <div className="text-lg font-bold">
                {item.students.toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <div className="text-xs text-gray-400">Mentors</div>
              <div className="text-lg font-bold">
                {item.mentors ? item.mentors.length : 0}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <div className="text-xs text-gray-400">Starts</div>
              <div className="text-lg font-bold">
                {new Date(item.startDate).toLocaleDateString()}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <div className="text-xs text-gray-400">Ends</div>
              <div className="text-lg font-bold">
                {new Date(item.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg border border-white/10 text-gray-200 hover:bg-white/5 transition"
              aria-label="Go back"
            >
              ← Back
            </button>
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
