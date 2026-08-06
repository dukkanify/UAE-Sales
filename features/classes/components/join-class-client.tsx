"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { ExternalLink, Radio, Shield } from "lucide-react";
import { toast } from "sonner";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { classFetch } from "@/features/classes/lib/api";
import type { LiveClassListItem } from "@/types/classes";

interface JoinClassClientProps {
  classId: string;
}

function JoinClassClient({ classId }: JoinClassClientProps) {
  const [data, setData] = React.useState<{
    class: LiveClassListItem;
    join: {
      zoomMeetingId: string;
      joinUrl: string;
      startUrl: string | null;
      password: string;
      waitingRoom: boolean;
      providerMode: string;
    } | null;
    isHost: boolean;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const result = await classFetch<NonNullable<typeof data>>(`/api/classes/${classId}/join`, {
        method: "POST",
        body: "{}",
      });
      if (cancelled) return;
      if (!result.success || !result.data) {
        setError(result.error ?? "Unable to join");
        setData(null);
      } else {
        setData(result.data);
        setError(null);
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [classId]);

  function copy(text: string) {
    void navigator.clipboard.writeText(text);
    toast.success("Copied");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
        <BrandLogo href="/login" />
        <h1 className="font-display text-2xl font-semibold">Unable to join</h1>
        <p className="text-sm text-muted-foreground">{error ?? "Class not available"}</p>
        <Button asChild variant="outline">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  const cls = data.class;
  const join = data.join;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-6 p-6">
      <BrandLogo href="/" />
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle>{cls.title}</CardTitle>
              <CardDescription>
                {new Date(cls.startsAt).toLocaleString()} · {cls.durationMinutes} min
              </CardDescription>
            </div>
            <Badge variant={cls.computedStatus === "live_now" ? "success" : "outline"}>
              {cls.computedStatus === "live_now" ? "Live Now" : String(cls.computedStatus)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {join ? (
            <>
              <div className="rounded-xl border border-border/70 p-3 text-sm">
                <p>
                  <span className="text-muted-foreground">Meeting ID:</span>{" "}
                  <button
                    type="button"
                    className="font-medium"
                    onClick={() => copy(join.zoomMeetingId)}
                  >
                    {join.zoomMeetingId}
                  </button>
                </p>
                <p>
                  <span className="text-muted-foreground">Passcode:</span>{" "}
                  <button type="button" className="font-medium" onClick={() => copy(join.password)}>
                    {join.password || "—"}
                  </button>
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  {join.providerMode === "mock"
                    ? "Secure mock meeting (Zoom credentials not configured)"
                    : "Zoom-connected meeting"}
                  {join.waitingRoom ? " · Waiting room on" : ""}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {data.isHost && join.startUrl ? (
                  <Button asChild>
                    <a href={join.startUrl} target="_blank" rel="noreferrer">
                      <Radio className="mr-2 h-4 w-4" /> Start as host
                    </a>
                  </Button>
                ) : null}
                <Button asChild variant={data.isHost ? "outline" : "default"}>
                  <a href={join.joinUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Join class
                  </a>
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Meeting details unavailable.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export { JoinClassClient };
