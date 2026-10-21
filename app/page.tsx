"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import { UI_TEXT } from "@/lib/ui-text";
import { MAX_TOPIC_LENGTH } from "@/lib/validation";

type Status = "idle" | "loading" | "success" | "error";
type ErrorKind = "offline" | "noJoke" | "general";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [joke, setJoke] = useState("");
  const [errorKind, setErrorKind] = useState<ErrorKind>("general");
  // Blocks repeat submits immediately, before the disabled button re-renders.
  const inFlight = useRef(false);

  function showError(kind: ErrorKind) {
    setJoke("");
    setErrorKind(kind);
    setStatus("error");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    if (!navigator.onLine) {
      showError("offline");
      return;
    }
    inFlight.current = true;
    setStatus("loading");

    try {
      let response: Response;
      try {
        response = await fetch("/api/joke", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: topic.trim() }),
        });
      } catch {
        // fetch only throws on network failure, so treat it as offline.
        showError("offline");
        return;
      }

      // Non-JSON bodies (e.g. a platform 504 page) fall through to the general error.
      const data = await response.json().catch(() => null);
      if (response.ok && typeof data?.joke === "string") {
        setJoke(data.joke);
        setStatus("success");
      } else if (response.status === 422) {
        showError("noJoke");
      } else {
        showError("general");
      }
    } finally {
      inFlight.current = false;
    }
  }

  const isLoading = status === "loading";

  return (
    <main className="flex-1 px-6 py-8">
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4">
        <div className="relative h-[250px] overflow-hidden rounded-[20px] border-4 border-ink bg-paper shadow-[5px_5px_0_#111111]">
          <Image
            src="/hero.png"
            alt={UI_TEXT.heroAlt}
            fill
            priority
            sizes="(max-width: 528px) 100vw, 480px"
            className="object-cover object-center"
          />
        </div>

        <h1 className="mt-2 text-center font-display text-[40px] leading-[44px] text-ink [text-shadow:3px_3px_0_#f6b41f]">
          {UI_TEXT.title}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            maxLength={MAX_TOPIC_LENGTH}
            placeholder={UI_TEXT.topicPlaceholder}
            aria-label={UI_TEXT.topicPlaceholder}
            className="h-14 w-full rounded-xl border-[3px] border-ink bg-paper px-4 text-start text-[18px] leading-7 text-ink outline-none placeholder:text-muted-gray focus:ring-4 focus:ring-comic-yellow"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="h-[58px] w-full rounded-xl border-[3px] border-ink bg-pop-red font-display text-[20px] leading-6 text-white shadow-[4px_4px_0_#111111] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:bg-deep-red active:shadow-[1px_1px_0_#111111] disabled:translate-x-0 disabled:translate-y-0 disabled:border-muted-gray disabled:bg-light-gray disabled:text-muted-gray disabled:shadow-none"
          >
            {UI_TEXT.submitButton}
          </button>
        </form>

        <div aria-live="polite" className="mt-4 flex flex-col">
          {isLoading ? (
            <LoadingPill />
          ) : status === "error" ? (
            <AlertMessage kind={errorKind} />
          ) : (
            <JokeBubble joke={joke} />
          )}
        </div>
      </div>
    </main>
  );
}

function LoadingPill() {
  return (
    <div className="inline-flex items-center gap-2 self-start rounded-full border-[3px] border-ink bg-comic-yellow px-4 py-2 text-[18px] leading-7 text-ink">
      <BurstIcon />
      <span>{UI_TEXT.loading}</span>
    </div>
  );
}

function JokeBubble({ joke }: { joke: string }) {
  return (
    <div className="relative min-h-[104px] rounded-[20px] border-[3px] border-ink bg-paper shadow-[4px_4px_0_#111111]">
      {/* Tail: top-right in RTL, pointing up at the button */}
      <svg
        aria-hidden="true"
        viewBox="0 0 32 23"
        className="absolute -top-[20px] start-16 h-[23px] w-8"
      >
        {/* White patch hides the bubble border under the tail's base */}
        <rect x="2.5" y="18" width="27" height="5" fill="#ffffff" />
        <path
          d="M1 20 L16 2 L31 20"
          fill="#ffffff"
          stroke="#111111"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
      <div
        aria-hidden="true"
        className="halftone-corner pointer-events-none absolute bottom-0 end-0 h-16 w-1/4 rounded-ee-[17px]"
      />
      <p className="relative whitespace-pre-line p-[18px] text-start text-[18px] leading-7 text-ink">
        {joke}
      </p>
    </div>
  );
}

const ERROR_TEXT: Record<ErrorKind, string> = {
  offline: UI_TEXT.offlineError,
  noJoke: UI_TEXT.noJokeError,
  general: UI_TEXT.generalError,
};

function AlertMessage({ kind }: { kind: ErrorKind }) {
  const isOffline = kind === "offline";
  return (
    <div
      className={`flex items-center gap-3 rounded-[14px] border-[3px] border-ink p-4 text-start text-[18px] leading-7 ${
        isOffline ? "bg-paper text-ink" : "bg-error-tint text-deep-red"
      }`}
    >
      {isOffline ? <WifiOffIcon /> : <AlertIcon />}
      <p>{ERROR_TEXT[kind]}</p>
    </div>
  );
}

function WifiOffIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <g stroke="#111111">
        <path d="M2 8.5a15 15 0 0 1 20 0" />
        <path d="M5.5 12.5a10 10 0 0 1 13 0" />
        <path d="M9 16.3a5 5 0 0 1 6 0" />
        <path d="M12 20h.01" />
      </g>
      <path d="M3 3l18 18" stroke="#d7261e" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0"
      fill="none"
      stroke="#9c1a14"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7v6M12 17h.01" />
    </svg>
  );
}

function BurstIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0"
      fill="none"
      stroke="#111111"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
    </svg>
  );
}
