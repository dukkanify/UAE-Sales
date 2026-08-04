"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, ImageIcon, Palette, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { brandingConfig } from "@/config/branding";
import { CommercialLicensePanel } from "@/features/assets/components/commercial-license-panel";
import { MediaLibraryPanel } from "@/features/assets/components/media-library-panel";
import { authFetch } from "@/features/auth/services/auth-api";
import type { PlatformSettings } from "@/types/settings";

export function AssetManagerShell() {
  const [settings, setSettings] = React.useState<PlatformSettings | null>(null);

  React.useEffect(() => {
    void authFetch<PlatformSettings>("/api/admin/settings").then((r) => {
      if (r.data) setSettings(r.data);
    });
  }, []);

  const brand = settings?.branding;
  const general = settings?.general;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset manager"
        description="Replace logos, media, documents, and email assets from the admin panel — no code deploy required for swaps."
        breadcrumbs={[
          { label: "Super Admin", href: "/super-admin/dashboard" },
          { label: "Asset manager" },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        {brandingConfig.pending.brandGuidelines ? (
          <Badge variant="warning">Brand guidelines pending</Badge>
        ) : null}
        {brandingConfig.pending.officialColorPalette ? (
          <Badge variant="warning">Color palette pending</Badge>
        ) : null}
        {brandingConfig.pending.officialTypography ? (
          <Badge variant="warning">Typography pending</Badge>
        ) : null}
        <Badge variant="secondary">English only</Badge>
        <Badge variant="secondary">{general?.socialHandle ?? brandingConfig.socialHandle}</Badge>
      </div>

      <Tabs defaultValue="brand">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="brand">Brand logos</TabsTrigger>
          <TabsTrigger value="media">Media library</TabsTrigger>
          <TabsTrigger value="license">Commercial license</TabsTrigger>
          <TabsTrigger value="email">Email & SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="brand" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="size-4" />
                Brand identity assets
              </CardTitle>
              <CardDescription>
                Upload replacements under Platform Settings → Branding. Masters (AI/SVG/PDF/PNG) go
                in <code className="text-xs">public/brand/source/</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Logo", url: brand?.logoUrl },
                { label: "Dark logo", url: brand?.darkLogoUrl },
                { label: "Favicon", url: brand?.faviconUrl },
                { label: "Open Graph", url: brand?.openGraphImageUrl },
                { label: "Login background", url: brand?.loginBackgroundUrl },
                { label: "Login illustration", url: brand?.loginIllustrationUrl },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium">{item.label}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url || "/brand/icon.svg"}
                    alt={item.label}
                    className="h-16 w-full object-contain bg-muted/40"
                  />
                  <p className="mt-2 truncate text-xs text-muted-foreground">{item.url}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Button asChild>
            <Link href="/super-admin/settings">
              Open branding settings
              <ExternalLink className="ms-2 size-4" />
            </Link>
          </Button>
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          <MediaLibraryPanel embedded />
        </TabsContent>

        <TabsContent value="license" className="mt-4">
          <CommercialLicensePanel embedded />
        </TabsContent>

        <TabsContent value="email" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="size-4" />
                Email & metadata
              </CardTitle>
              <CardDescription>
                Transactional emails use platform logo, colors, support email, locations, and social
                links via <code className="text-xs">renderBrandedEmail</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Platform:</strong> {general?.platformName ?? "ATPL PASS"}
              </p>
              <p>
                <strong>Support:</strong> {general?.supportEmail}
              </p>
              <p>
                <strong>Locations:</strong> {general?.primaryLocations?.join(" · ")}
              </p>
              <p>
                <strong>OG image:</strong> {brand?.openGraphImageUrl}
              </p>
              <p className="text-muted-foreground">
                Meta description: Professional Aviation Education Platform for ATPL Training.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/super-admin/settings">Edit company & email settings</Link>
                </Button>
                <Badge variant="outline" className="gap-1">
                  <ShieldCheck className="size-3" />
                  Favicon from brand settings
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
