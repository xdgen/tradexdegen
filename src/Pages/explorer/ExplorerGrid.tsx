import { useEffect, useState } from "react";
import { AcademyClass } from "../../data";
import ClassCard from "./components/ClassCard";
import Navbar from "../../components/dashboard/navbar";
import { useAcademy } from "../../hooks/useAcademy";
import type { ClassStatus } from "../../data";

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

function formatDate(time: number): string {
  const formatted = Math.floor(time * 1000);
  return new Date(formatted).toISOString();
}

export default function ExplorerGrid() {
  const [items, setItems] = useState<AcademyClass[]>([]);
  const { getAllAcademies } = useAcademy();

  const isLoading = getAllAcademies.isLoading || getAllAcademies.isFetching;
  const hasData = getAllAcademies.data && getAllAcademies.data.length > 0;

  useEffect(() => {
    if (!getAllAcademies.data) return;

    const formattedData: AcademyClass[] = getAllAcademies.data.map(
      (academy) => {
        const startDate = academy.account.startDate.toNumber();
        const endDate = academy.account.endDate.toNumber();
        const status: ClassStatus = compareDate(startDate, endDate);

        return {
          owner: academy.account.owner.toBase58(),
          pda: academy.publicKey.toBase58(),
          title: academy.account.title,
          banner: academy.account.banner,
          description: academy.account.description,
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          isPaid: !!academy.account.fee,
          status,
          price: academy.account.fee?.toNumber(),
          students: academy.account.totalStudents.toNumber(),
          mentors:
            academy.account.tutors.length > 0 ? academy.account.tutors : null,
          facilitator: academy.account.tutors[0],
        };
      }
    );
    console.log(getAllAcademies.data);

    setItems(formattedData);
  }, [getAllAcademies.data]);

  const renderSkeleton = () => (
    <div
      role="status"
      aria-live="polite"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl bg-secondary/60 border border-white/5 h-64"
        />
      ))}
    </div>
  );

  const renderContent = () => {
    if (!hasData) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No academies found</p>
          <p className="text-gray-500 text-sm mt-2">
            Be the first to create an academy!
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <ClassCard key={item.pda} data={item} isLoading={isLoading} />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-secondary text-white">
      <Navbar />
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 h-screen">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Degen Explorer
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Curated classes for on-chain mastery. Tap a card to view details.
          </p>
        </header>

        {isLoading ? renderSkeleton() : renderContent()}
      </div>
    </div>
  );
}
