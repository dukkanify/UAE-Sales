"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plane, Plus } from "lucide-react";

import { PublicLayout } from "@/components/layout/app-layouts";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { colorRoles, typographyScale } from "@/config/design-system";
import { siteConfig } from "@/config/site";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Button, ButtonGroup } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorPicker } from "@/components/ui/color-picker";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { OtpInput } from "@/components/ui/otp-input";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { SplitButton } from "@/components/ui/split-button";
import { Switch } from "@/components/ui/switch";
import { Tag } from "@/components/ui/tag";
import { Textarea } from "@/components/ui/textarea";
import { TimePicker } from "@/components/ui/time-picker";
import { Timeline } from "@/components/ui/timeline";
import { StatCard } from "@/components/dashboard/stat-card";
import { PresetEmptyState } from "@/components/feedback/preset-empty-states";
import { PageTransition, HoverLift } from "@/components/motion/presets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div>
        <h2 className="text-h2">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function DesignSystemShowcase() {
  const [otp, setOtp] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [dial, setDial] = React.useState("+965");
  const [color, setColor] = React.useState("#0B1F3A");
  const [currency, setCurrency] = React.useState("120");
  const [multi, setMulti] = React.useState<string[]>(["ppl"]);
  const [time, setTime] = React.useState("09:30");

  return (
    <PublicLayout>
      <PageTransition className="container-app space-y-16 py-12">
        <header className="flex flex-col gap-6 border-b border-border pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <BrandLogo />
            <h1 className="text-display text-primary">Design System</h1>
            <p className="max-w-2xl text-body text-muted-foreground">
              Production UI foundation for {siteConfig.name}. Tokens, layouts, forms, feedback,
              data, overlays, and motion — no business logic.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={() => toast.success("Toast system is ready")}>
              Test toast
            </Button>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2" aria-label="Design system sections">
          {["colors", "typography", "buttons", "forms", "feedback", "data", "empty", "motion"].map(
            (id) => (
              <Button key={id} variant="secondary" size="sm" asChild>
                <a href={`#${id}`} className="capitalize">
                  {id}
                </a>
              </Button>
            ),
          )}
        </nav>

        <Section
          id="colors"
          title="Color roles"
          description="Deep aviation blue, sky accent, semantic states."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(colorRoles).map(([key, swatch]) => (
              <div
                key={key}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-soft"
              >
                <div className="h-16" style={{ backgroundColor: swatch.value }} />
                <div className="p-3">
                  <p className="text-label capitalize">{key}</p>
                  <p className="text-caption">{swatch.name}</p>
                  <p className="mt-1 font-mono text-xs">{swatch.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="typography"
          title="Typography"
          description="Plus Jakarta Sans (display) + DM Sans (body). English LTR only."
        >
          <Card>
            <CardContent className="space-y-4 pt-6">
              {Object.entries(typographyScale).map(([key, meta]) => (
                <div key={key} className="border-b border-border pb-3 last:border-0">
                  <p className="text-caption mb-1">{meta.label}</p>
                  <p className={meta.className}>The quick brown fox jumps over AviatorPass</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </Section>

        <Section
          id="buttons"
          title="Buttons"
          description="Primary, semantic, loading, groups, and split actions."
        >
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="destructive">Danger</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button size="icon" aria-label="Add">
              <Plus />
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonGroup>
              <Button variant="outline">Left</Button>
              <Button variant="outline">Middle</Button>
              <Button variant="outline">Right</Button>
            </ButtonGroup>
            <SplitButton
              label="Publish"
              onPrimaryClick={() => toast.message("Primary action")}
              items={[
                { label: "Save draft", onSelect: () => toast.message("Draft") },
                { label: "Schedule", onSelect: () => toast.message("Schedule") },
              ]}
            />
          </div>
        </Section>

        <Section
          id="forms"
          title="Form controls"
          description="Inputs for auth, settings, and future modules."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Text & select</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ds-name">Name</Label>
                  <Input id="ds-name" placeholder="Abdulaziz" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ds-bio">Notes</Label>
                  <Textarea id="ds-bio" placeholder="Optional notes" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <PasswordInput placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Multi select</Label>
                  <MultiSelect
                    options={[
                      { value: "ppl", label: "PPL" },
                      { value: "cpl", label: "CPL" },
                      { value: "atpl", label: "ATPL" },
                    ]}
                    value={multi}
                    onValueChange={setMulti}
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Specialized</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>OTP</Label>
                  <OtpInput value={otp} onChange={setOtp} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <PhoneInput
                    value={phone}
                    dialCode={dial}
                    onValueChange={setPhone}
                    onDialCodeChange={setDial}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <CurrencyInput value={currency} onValueChange={setCurrency} currency="KWD" />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <TimePicker value={time} onValueChange={setTime} />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <ColorPicker value={color} onValueChange={setColor} />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox id="ds-check" />
                    <Label htmlFor="ds-check">Checkbox</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="ds-switch" />
                    <Label htmlFor="ds-switch">Toggle</Label>
                  </div>
                </div>
                <RadioGroup defaultValue="a" className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="a" id="r1" />
                    <Label htmlFor="r1">Option A</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="b" id="r2" />
                    <Label htmlFor="r2">Option B</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section
          id="feedback"
          title="Feedback"
          description="Alerts, banners, progress, skeletons, spinner."
        >
          <div className="space-y-3">
            <Banner
              variant="info"
              title="Info banner"
              description="Non-blocking platform message."
            />
            <Banner variant="success" title="Success" description="Action completed." />
            <Banner variant="warning" title="Warning" description="Review before continuing." />
            <Banner variant="error" title="Error" description="Something needs attention." />
            <Alert>
              <AlertTitle>Alert</AlertTitle>
              <AlertDescription>Inline alert for form or page context.</AlertDescription>
            </Alert>
            <div className="flex flex-wrap items-center gap-4">
              <Progress value={64} className="max-w-xs" />
              <Spinner label="Loading sample" />
              <Skeleton className="h-10 w-40 rounded-xl" />
            </div>
          </div>
        </Section>

        <Section id="data" title="Data display" description="Stat cards, tags, avatars, timeline.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HoverLift>
              <StatCard label="Active students" value={128} icon={Plane} trend={{ value: 8 }} />
            </HoverLift>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags & badges</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Tag>Default</Tag>
                <Tag variant="accent">Accent</Tag>
                <Tag variant="success">Success</Tag>
                <Tag variant="warning">Warning</Tag>
                <Tag variant="danger">Danger</Tag>
                <Badge>Badge</Badge>
                <Avatar>
                  <AvatarFallback>AP</AvatarFallback>
                </Avatar>
              </CardContent>
            </Card>
          </div>
          <Timeline
            className="mt-6 max-w-xl"
            items={[
              {
                id: "1",
                title: "Design tokens defined",
                description: "Color, type, radius, motion.",
                timestamp: "Today",
                status: "success",
              },
              {
                id: "2",
                title: "Component library expanded",
                description: "Forms, overlays, feedback.",
                timestamp: "Today",
                status: "default",
              },
            ]}
          />
        </Section>

        <Section id="empty" title="Empty states" description="Reusable presets for future modules.">
          <Tabs defaultValue="courses">
            <TabsList>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            {(["courses", "notifications", "calendar", "reports"] as const).map((preset) => (
              <TabsContent key={preset} value={preset}>
                <PresetEmptyState preset={preset} />
              </TabsContent>
            ))}
          </Tabs>
        </Section>

        <Section
          id="motion"
          title="Motion"
          description="Framer Motion presets for pages and micro-interactions."
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hover lift</CardTitle>
              <CardDescription>
                Cards and interactive surfaces use subtle elevation.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <HoverLift key={n}>
                  <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                    Card {n}
                  </div>
                </HoverLift>
              ))}
            </CardContent>
          </Card>
        </Section>

        <Separator />
        <p className="text-center text-caption pb-8">
          AviatorPass Design System · Light default · Dark + System themes ready · ⌘K command
          palette in dashboards
        </p>
      </PageTransition>
    </PublicLayout>
  );
}

export default DesignSystemShowcase;
