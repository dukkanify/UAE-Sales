"use client";

import * as React from "react";
import { ImageIcon, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { OptimizedImage } from "@/components/media/optimized-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authFetch, csrfHeaders, ensureBrowserCsrf } from "@/features/auth/services/auth-api";
import { MEDIA_ASSET_KINDS } from "@/constants/media-library";
import type { MediaLibraryAsset, MediaLibraryCategory } from "@/types/media-library";

type LibraryPayload = {
  categories: MediaLibraryCategory[];
  assets: MediaLibraryAsset[];
};

export function MediaLibraryPanel({ embedded = false }: { embedded?: boolean }) {
  const [categories, setCategories] = React.useState<MediaLibraryCategory[]>([]);
  const [assets, setAssets] = React.useState<MediaLibraryAsset[]>([]);
  const [categoryId, setCategoryId] = React.useState("all");
  const [kind, setKind] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [uploadCategory, setUploadCategory] = React.useState("background_images");
  const [uploadKind, setUploadKind] = React.useState<string>("media");
  const [altText, setAltText] = React.useState("");
  const [newCatId, setNewCatId] = React.useState("");
  const [newCatLabel, setNewCatLabel] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const params = new URLSearchParams();
    if (categoryId !== "all") params.set("categoryId", categoryId);
    if (kind !== "all") params.set("kind", kind);
    if (q.trim()) params.set("q", q.trim());
    const res = await authFetch<LibraryPayload>(`/api/admin/media-library?${params}`);
    setCategories(res.data?.categories ?? []);
    setAssets(res.data?.assets ?? []);
    if (!res.success) setError(res.error);
    if (res.data?.categories?.[0] && uploadCategory === "background_images") {
      /* keep default */
    }
  }, [categoryId, kind, q, uploadCategory]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function uploadFile(file: File) {
    setBusy(true);
    await ensureBrowserCsrf();
    const form = new FormData();
    form.append("file", file);
    form.append("categoryId", uploadCategory);
    form.append("kind", uploadKind);
    if (altText.trim()) form.append("altText", altText.trim());
    form.append("title", file.name.replace(/\.[^.]+$/, ""));
    const res = await fetch("/api/admin/media-library", {
      method: "POST",
      credentials: "include",
      headers: csrfHeaders(),
      body: form,
    });
    const json = (await res.json()) as { success: boolean; error?: string };
    setBusy(false);
    if (!json.success) {
      toast.error(json.error ?? "Upload failed");
      return;
    }
    toast.success("Asset uploaded");
    setAltText("");
    void load();
  }

  async function addCategory() {
    setBusy(true);
    const res = await authFetch("/api/admin/media-library", {
      method: "POST",
      body: JSON.stringify({
        action: "add_category",
        id: newCatId,
        label: newCatLabel || newCatId,
      }),
    });
    setBusy(false);
    if (!res.success) {
      toast.error(res.error ?? "Failed");
      return;
    }
    toast.success("Category added");
    setNewCatId("");
    setNewCatLabel("");
    void load();
  }

  async function removeAsset(id: string) {
    const res = await authFetch("/api/admin/media-library", {
      method: "POST",
      body: JSON.stringify({ action: "delete_asset", id }),
    });
    if (!res.success) {
      toast.error(res.error ?? "Delete failed");
      return;
    }
    toast.success("Asset removed");
    void load();
  }

  const body = (
    <div className="space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload media</CardTitle>
          <CardDescription>
            High-resolution web images with alt text and SEO fields. Lazy-loaded in UI via
            OptimizedImage.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={uploadCategory} onValueChange={setUploadCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Asset kind</Label>
            <Select value={uploadKind} onValueChange={setUploadKind}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEDIA_ASSET_KINDS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Alt text (accessibility / SEO)</Label>
            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image"
            />
          </div>
          <Label className="sm:col-span-2 cursor-pointer">
            <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <Upload className="size-4" />
              Choose image / PDF
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadFile(file);
                e.target.value = "";
              }}
            />
          </Label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add category</CardTitle>
          <CardDescription>Future categories without code changes.</CardDescription>
        </CardHeader>
        <CardContent className="form-row-responsive">
          <Input
            placeholder="id_snake_case"
            value={newCatId}
            onChange={(e) => setNewCatId(e.target.value)}
            className="w-full min-w-0 sm:max-w-[200px]"
          />
          <Input
            placeholder="Label"
            value={newCatLabel}
            onChange={(e) => setNewCatLabel(e.target.value)}
            className="w-full min-w-0 sm:max-w-[220px]"
          />
          <Button onClick={() => void addCategory()} disabled={busy || !newCatId.trim()}>
            <Plus className="me-2 size-4" />
            Add
          </Button>
        </CardContent>
      </Card>

      <div className="form-row-responsive">
        <div className="min-w-0 space-y-1">
          <Label>Filter category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-0 space-y-1">
          <Label>Kind</Label>
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {MEDIA_ASSET_KINDS.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-0 space-y-1">
          <Label>Search</Label>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full min-w-0 sm:w-[200px]"
          />
        </div>
        <Button variant="ghost" size="icon" onClick={() => void load()} aria-label="Refresh">
          <RefreshCw className="size-4" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <Card key={asset.id} className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              {asset.mimeType.startsWith("image/") ? (
                <OptimizedImage
                  src={asset.url}
                  alt={asset.altText || asset.title}
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <ImageIcon className="size-8" />
                </div>
              )}
            </div>
            <CardContent className="space-y-2 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium leading-tight">{asset.title}</p>
                  <p className="text-xs text-muted-foreground">{asset.altText}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete ${asset.title}`}
                  onClick={() => void removeAsset(asset.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary">{asset.kind}</Badge>
                <Badge variant="outline">
                  {categories.find((c) => c.id === asset.categoryId)?.label ?? asset.categoryId}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {assets.length === 0 ? (
          <p className="text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
            No assets yet. Upload aviation imagery by category.
          </p>
        ) : null}
      </div>
    </div>
  );

  if (embedded) return body;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aviation media library"
        description="Centralized categorized media for AviatorPass."
        breadcrumbs={[
          { label: "Super Admin", href: "/super-admin/dashboard" },
          { label: "Media library" },
        ]}
      />
      {body}
    </div>
  );
}
