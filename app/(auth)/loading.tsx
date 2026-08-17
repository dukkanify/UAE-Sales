import { LoadingState } from "@/components/shared/loading-state";

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <LoadingState label="Loading…" />
    </div>
  );
}
