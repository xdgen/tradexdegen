import { ClassStatus } from "@/data";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function markdownToHtml(md: string): string {
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

export function compareDate(startTime: number, endTime: number): ClassStatus {
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
