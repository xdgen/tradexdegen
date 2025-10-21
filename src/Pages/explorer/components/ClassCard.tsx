import { useNavigate } from "react-router-dom";
import { AcademyClass } from "../../../data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { cn } from "../../../lib/utils";

type Props = { data: AcademyClass; isLoading: boolean };

const statusColor: Record<AcademyClass["status"], string> = {
  Ongoing: "text-emerald-400 border-emerald-500/30",
  Upcoming: "text-fuchsia-300 border-fuchsia-500/30",
  Ended: "text-gray-400 border-gray-500/20",
};

export default function ClassCard({ data, isLoading }: Props) {
  const navigate = useNavigate();
  const { id, pda, title, banner, facilitator, isPaid, price, status } = data;

  return (
    <button
      onClick={() => navigate(`/class/${pda}`)}
      className={cn(
        "group text-left relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-secondary/70 to-secondary/30 hover:from-secondary/80 hover:to-secondary/50 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400",
        isLoading ? "bg-zinc-900 animate-pulse duration-500" : ""
      )}
      aria-label={`Open details for ${title}`}
    >
      <div className="relative h-40 w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner}
          alt="class banner"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://source.unsplash.com/featured/640x360?crypto,solana";
          }}
          className="h-full w-full object-cover transform transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 to-black/40" />
      </div>
      <div className="p-4">
        <h3 className="text-base font-bold text-white/90 line-clamp-1">
          {title}
        </h3>
        <p className="mt-1 text-xs text-gray-400">Facilitator: {facilitator}</p>

        <div className="mt-3 flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    isPaid
                      ? "text-amber-300 border-amber-400/40"
                      : "text-emerald-300 border-emerald-400/40"
                  }`}
                  aria-label={isPaid ? "Paid class" : "Free class"}
                >
                  {isPaid ? `Paid • ${price} SOL` : "Free"}
                </span>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                {isPaid
                  ? "Paid: Requires SOL to register"
                  : "Free: No SOL needed!"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[status]}`}
            aria-label={`Status: ${status}`}
          >
            {status}
          </span>
        </div>
      </div>
    </button>
  );
}
