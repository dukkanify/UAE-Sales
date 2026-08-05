export default function MarketingLoading() {
  return (
    <div className="min-h-[60vh] animate-pulse">
      <div className="h-[70vh] bg-[var(--surface-ink,#070f14)]" />
      <div className="container-app space-y-4 py-16">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-10 w-2/3 max-w-xl rounded bg-muted" />
        <div className="h-4 w-full max-w-lg rounded bg-muted" />
      </div>
    </div>
  );
}
