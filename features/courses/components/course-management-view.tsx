"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import {
  Archive,
  BookOpen,
  Copy,
  Eye,
  Grid3X3,
  List,
  MoreHorizontal,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import {
  COURSE_STATUS_LABELS,
  COURSE_STATUSES,
  DIFFICULTY_LABELS,
  DIFFICULTY_LEVELS,
  ENROLLMENT_MODE_LABELS,
} from "@/constants/courses";
import { courseFetch } from "@/features/courses/lib/api";
import { CourseFormDialog } from "@/features/courses/components/course-form-dialog";
import { CourseStatsWidgets } from "@/features/courses/components/course-stats-widgets";
import type { CourseCategory, CourseListItem, CourseStats } from "@/types/courses";
import type { UserProfile } from "@/types";

const statusVariant: Record<
  string,
  "success" | "warning" | "secondary" | "outline" | "destructive"
> = {
  published: "success",
  draft: "secondary",
  private: "outline",
  scheduled: "warning",
  archived: "destructive",
};

interface CourseManagementViewProps {
  basePath: string;
  roleLabel: string;
  /** Super Admin only — publish / unpublish / archive / bulk publish (CR001). */
  canManagePublishing?: boolean;
}

function CourseManagementView({
  basePath,
  roleLabel,
  canManagePublishing = false,
}: CourseManagementViewProps) {
  const [courses, setCourses] = React.useState<CourseListItem[]>([]);
  const [stats, setStats] = React.useState<CourseStats | null>(null);
  const [categories, setCategories] = React.useState<CourseCategory[]>([]);
  const [instructors, setInstructors] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState<"table" | "grid">("table");
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [difficulty, setDifficulty] = React.useState("all");
  const [categoryId, setCategoryId] = React.useState("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CourseListItem | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<string[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status !== "all") params.set("status", status);
    if (difficulty !== "all") params.set("difficulty", difficulty);
    if (categoryId !== "all") params.set("categoryId", categoryId);
    params.set("pageSize", "100");

    const [listRes, statsRes, catRes, instRes] = await Promise.all([
      courseFetch<{ data: CourseListItem[] }>(`/api/courses?${params}`),
      courseFetch<CourseStats>("/api/courses/stats"),
      courseFetch<CourseCategory[]>("/api/courses/categories?includeHidden=1"),
      courseFetch<UserProfile[]>("/api/users?role=instructor"),
    ]);

    setCourses(listRes.data?.data ?? []);
    setStats(statsRes.data);
    setCategories(catRes.data ?? []);
    setInstructors(instRes.data ?? []);
    setLoading(false);
  }, [q, status, difficulty, categoryId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function runAction(id: string, action: string) {
    const result = await courseFetch(`/api/courses/${id}/actions`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
    if (!result.success) {
      toast.error(result.error ?? "Action failed");
      return;
    }
    toast.success(`Course ${action}d`);
    void load();
  }

  async function runBulk(action: string) {
    if (!selected.length) {
      toast.error("Select at least one course");
      return;
    }
    const result = await courseFetch<{ affected: number; exportRows?: CourseListItem[] }>(
      "/api/courses/bulk",
      {
        method: "POST",
        body: JSON.stringify({ action, courseIds: selected }),
      },
    );
    if (!result.success) {
      toast.error(result.error ?? "Bulk action failed");
      return;
    }
    if (action === "export" && result.data?.exportRows) {
      const blob = new Blob([JSON.stringify(result.data.exportRows, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "courses-export.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
      return;
    }
    toast.success(`Updated ${result.data?.affected ?? 0} courses`);
    setSelected([]);
    void load();
  }

  const columns: DataTableColumn<CourseListItem>[] = [
    {
      id: "title",
      header: "Course",
      sortable: true,
      cell: (row) => (
        <div>
          <Link href={`${basePath}/${row.id}`} className="font-medium text-primary hover:underline">
            {row.title}
          </Link>
          <p className="text-xs text-muted-foreground">{row.code}</p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={statusVariant[row.status] ?? "secondary"}>
          {COURSE_STATUS_LABELS[row.status]}
        </Badge>
      ),
    },
    {
      id: "categoryName",
      header: "Category",
      cell: (row) => row.categoryName ?? "—",
    },
    {
      id: "primaryInstructorName",
      header: "Instructor",
      cell: (row) => row.primaryInstructorName ?? "—",
    },
    {
      id: "difficulty",
      header: "Level",
      cell: (row) => DIFFICULTY_LABELS[row.difficulty],
    },
    {
      id: "counts",
      header: "Structure",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.counts.modules} mod · {row.counts.lessons} les · {row.counts.activeEnrollments}{" "}
          students
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Course actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`${basePath}/${row.id}`}>
                <Eye className="mr-2 h-4 w-4" /> Open
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditing(row);
                setFormOpen(true);
              }}
            >
              Edit details
            </DropdownMenuItem>
            {canManagePublishing ? (
              <>
                <DropdownMenuItem onClick={() => void runAction(row.id, "publish")}>
                  <Upload className="mr-2 h-4 w-4" /> Publish
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void runAction(row.id, "unpublish")}>
                  Unpublish
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void runAction(row.id, "archive")}>
                  <Archive className="mr-2 h-4 w-4" /> Archive
                </DropdownMenuItem>
              </>
            ) : null}
            <DropdownMenuItem onClick={() => void runAction(row.id, "duplicate")}>
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(row.id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="Manage curriculum catalog, structure, and enrollments."
        breadcrumbs={[{ label: roleLabel }, { label: "Courses" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            {canManagePublishing ? (
              <Button variant="outline" asChild>
                <Link href="/super-admin/courses/publishing">Publishing & visibility</Link>
              </Button>
            ) : null}
            <Button variant="outline" asChild>
              <Link href={`${basePath}/categories`}>Categories</Link>
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Create course
            </Button>
          </div>
        }
      />

      <CourseStatsWidgets stats={stats} loading={loading} />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base">Catalog</CardTitle>
              <CardDescription>
                Filter, search, and run bulk actions across courses.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={view === "table" ? "secondary" : "ghost"}
                size="icon"
                aria-label="Table view"
                onClick={() => setView("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "grid" ? "secondary" : "ghost"}
                size="icon"
                aria-label="Grid view"
                onClick={() => setView("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
            <Input
              placeholder="Search title or code…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="lg:max-w-xs"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="lg:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {COURSE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {COURSE_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="lg:w-44">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                {DIFFICULTY_LEVELS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {DIFFICULTY_LABELS[d]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="lg:w-52">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            {canManagePublishing ? (
              <>
                <Button size="sm" variant="outline" onClick={() => void runBulk("publish")}>
                  Bulk publish
                </Button>
                <Button size="sm" variant="outline" onClick={() => void runBulk("archive")}>
                  Bulk archive
                </Button>
              </>
            ) : null}
            <Button size="sm" variant="outline" onClick={() => void runBulk("delete")}>
              Bulk delete
            </Button>
            <Button size="sm" variant="outline" onClick={() => void runBulk("export")}>
              Bulk export
            </Button>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : courses.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-6 w-6" />}
              title="No courses yet"
              description="Create your first ATPL course to start building the curriculum."
              actionLabel="Create course"
              onAction={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            />
          ) : view === "table" ? (
            <DataTable
              columns={columns}
              data={courses}
              searchKeys={["title", "code"]}
              searchPlaceholder="Filter rows…"
              emptyMessage="No courses match filters"
              onExport={() => void runBulk("export")}
              bulkActions={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelected(courses.map((c) => c.id))}
                >
                  Select all ({courses.length})
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <div
                    className="h-28 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${course.coverImageUrl || course.thumbnailUrl || "/images/hero-aviation.svg"})`,
                    }}
                  />
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-snug">
                        <Link href={`${basePath}/${course.id}`} className="hover:underline">
                          {course.title}
                        </Link>
                      </CardTitle>
                      <Badge variant={statusVariant[course.status] ?? "secondary"}>
                        {COURSE_STATUS_LABELS[course.status]}
                      </Badge>
                    </div>
                    <CardDescription>{course.shortDescription}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      {course.code} · {DIFFICULTY_LABELS[course.difficulty]} ·{" "}
                      {ENROLLMENT_MODE_LABELS[course.enrollmentMode]}
                    </p>
                    <p>
                      {course.counts.modules} modules · {course.counts.lessons} lessons ·{" "}
                      {course.counts.activeEnrollments} enrolled
                    </p>
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link href={`${basePath}/${course.id}`}>Manage</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {stats?.recentlyUpdated?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recently updated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.recentlyUpdated.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 border-b border-border/60 py-2 last:border-0"
              >
                <div>
                  <Link href={`${basePath}/${c.id}`} className="font-medium hover:underline">
                    {c.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {c.code} · updated {new Date(c.updatedAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant={statusVariant[c.status] ?? "secondary"}>
                  {COURSE_STATUS_LABELS[c.status]}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <CourseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        course={editing}
        categories={categories}
        instructors={instructors}
        onSaved={() => void load()}
      />

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete course?</AlertDialogTitle>
            <AlertDialogDescription>
              This soft-deletes the course. Structure is retained for audit but hidden from the
              catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void (async () => {
                  if (!deleteId) return;
                  const result = await courseFetch(`/api/courses/${deleteId}`, {
                    method: "DELETE",
                  });
                  if (!result.success) {
                    toast.error(result.error ?? "Delete failed");
                    return;
                  }
                  toast.success("Course deleted");
                  setDeleteId(null);
                  void load();
                })();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { CourseManagementView };
