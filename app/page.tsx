import { UI_TEXT } from "@/lib/ui-text";

// Temporary placeholder page; the real main screen is built in Milestone 2.
export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <h1 className="text-4xl font-bold text-center">{UI_TEXT.title}</h1>
    </main>
  );
}
