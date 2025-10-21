import { useEffect, useState } from "react";
import { classes, AcademyClass } from "../../data";
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

export default function ExplorerGrid() {
  const [items, setItems] = useState<AcademyClass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { getAllAcademies } = useAcademy();

  function formatDate(time: number) {
    const formatted = Math.floor(time * 1000);
    return new Date(formatted).toISOString()
  }

  useEffect(() => {
    if (getAllAcademies.data) {
      const data: AcademyClass[] = getAllAcademies.data.map(academy => {
        const startDate = academy.account.startDate.toNumber()
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
          isPaid: !academy.account.fee ? false: true,
          status,
          price: academy.account.fee ? academy.account.fee.toNumber() : undefined,
          students: academy.account.totalStudents.toNumber(),
          mentors: academy.account.tutors.length > 0 ? academy.account.tutors : null,
          facilitator: academy.account.tutors[0]
        }
      })
      setItems(data)
      setLoading(false)
    }
  }, [getAllAcademies.data])

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(classes);
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

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

        {loading ? (
          <div
            role="status"
            aria-live="polite"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl bg-secondary/60 border border-white/5 h-64"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <ClassCard key={item.pda} data={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}