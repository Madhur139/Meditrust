import { useEffect, useState } from "react";

const MESSAGES = [
  "Connecting to verified doctors",
  "Checking pharmacy stock",
  "Securing your health data",
];

export default function LoaderScreen({ messages = MESSAGES }) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(8);

  // Rotate status text
  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % messages.length),
      1600,
    );
    return () => clearInterval(id);
  }, [messages.length]);

  // Fake progress that eases toward 92% and waits for the app to unmount the loader
  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p >= 92 ? p : p + (92 - p) * 0.08));
    }, 200);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-white px-6">
      {/* Logo with pulse rings */}
      <div className="relative flex h-28 w-28 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-teal-600/15" />
        <span className="absolute inset-3 animate-pulse rounded-full bg-teal-600/10" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-teal-100 border-t-teal-700 [animation-duration:1.4s]" />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-700 shadow-lg shadow-teal-900/20">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-white"
            aria-hidden="true">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
          </svg>
        </div>
      </div>

      {/* Brand */}
      <h1 className="mt-8 text-2xl font-extrabold tracking-tight text-slate-900">
        Medi<span className="text-teal-700">Trust</span>
      </h1>
      <p className="mt-1 text-xs font-medium tracking-widest text-slate-400">
        HEALTHCARE HUB
      </p>

      {/* Progress */}
      <div className="mt-10 h-1.5 w-56 overflow-hidden rounded-full bg-teal-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-600 to-emerald-400 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status text */}
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
        <span key={index}>{messages[index]}</span>
        <span className="flex items-end gap-0.5" aria-hidden="true">
          <span className="h-1 w-1 animate-bounce rounded-full bg-teal-600" />
          <span className="h-1 w-1 animate-bounce rounded-full bg-teal-600 [animation-delay:150ms]" />
          <span className="h-1 w-1 animate-bounce rounded-full bg-teal-600 [animation-delay:300ms]" />
        </span>
      </div>

      {/* Trust line */}
      <p className="absolute bottom-8 text-xs text-slate-400">
        100% verified doctors · Genuine medicines · NABL certified labs
      </p>
    </div>
  );
}
