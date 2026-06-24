// Shown on public pages when the owner has paused preorders.
export function ClosedBanner({ message }: { message?: string }) {
  return (
    <div className="mb-8 rounded-blob border-4 border-watermelon/30 bg-white p-6 text-center shadow">
      <p className="text-3xl" aria-hidden>
        😴💤
      </p>
      <p className="mt-2 text-2xl font-extrabold text-watermelon">
        Preorders are paused
      </p>
      <p className="mt-1 font-semibold text-cocoa/70">
        {message?.trim()
          ? message
          : "We're not taking preorders right now. Check back soon!"}
      </p>
      <p className="mt-2 text-sm text-cocoa/50">
        You can still browse the menu below.
      </p>
    </div>
  );
}
