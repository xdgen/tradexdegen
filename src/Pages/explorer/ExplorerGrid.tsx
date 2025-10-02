import { useEffect, useState } from "react";
import { classes, AcademyClass } from "../../data";
import ClassCard from "./components/ClassCard";
import Navbar from "../../components/dashboard/navbar";

export default function ExplorerGrid() {
  const [items, setItems] = useState<AcademyClass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
              <ClassCard key={item.id} data={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
