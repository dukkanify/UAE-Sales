"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  UserPlus,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  COURSE_STATUS_LABELS,
  DIFFICULTY_LABELS,
  ENROLLMENT_MODE_LABELS,
  ENROLLMENT_STATUS_LABELS,
} from "@/constants/courses";
import { courseFetch } from "@/features/courses/lib/api";
import { CourseFormDialog } from "@/features/courses/components/course-form-dialog";
import type {
  CourseCategory,
  CourseDetail,
  CourseModule,
  EnrollmentWithStudent,
  Lesson,
} from "@/types/courses";
import type { UserProfile } from "@/types";

interface CourseDetailViewProps {
  courseId: string;
  basePath: string;
  roleLabel: string;
}

function CourseDetailView({ courseId, basePath, roleLabel }: CourseDetailViewProps) {
  const [course, setCourse] = React.useState<CourseDetail | null>(null);
  const [enrollments, setEnrollments] = React.useState<EnrollmentWithStudent[]>([]);
  const [students, setStudents] = React.useState<UserProfile[]>([]);
  const [categories, setCategories] = React.useState<CourseCategory[]>([]);
  const [instructors, setInstructors] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editOpen, setEditOpen] = React.useState(false);
  const [moduleTitle, setModuleTitle] = React.useState("");
  const [lessonTitle, setLessonTitle] = React.useState("");
  const [targetModuleId, setTargetModuleId] = React.useState<string>("");
  const [enrollStudentId, setEnrollStudentId] = React.useState<string>("");
  const [resourceUrl, setResourceUrl] = React.useState("");
  const [resourceLessonId, setResourceLessonId] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    const [detail, enroll, studs, cats, inst] = await Promise.all([
      courseFetch<CourseDetail>(`/api/courses/${courseId}`),
      courseFetch<EnrollmentWithStudent[]>(`/api/courses/${courseId}/enrollments`),
      courseFetch<UserProfile[]>("/api/users?role=student"),
      courseFetch<CourseCategory[]>("/api/courses/categories?includeHidden=1"),
      courseFetch<UserProfile[]>("/api/users?role=instructor"),
    ]);
    setCourse(detail.data);
    setEnrollments(enroll.data ?? []);
    setStudents(studs.data ?? []);
    setCategories(cats.data ?? []);
    setInstructors(inst.data ?? []);
    if (detail.data?.modules[0]) {
      setTargetModuleId(detail.data.modules[0].id);
      const firstLesson = detail.data.modules[0].lessons[0];
      if (firstLesson) setResourceLessonId(firstLesson.id);
    }
    setLoading(false);
  }, [courseId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function addModule() {
    if (!moduleTitle.trim()) return;
    const result = await courseFetch<CourseModule>(`/api/courses/${courseId}/modules`, {
      method: "POST",
      body: JSON.stringify({ title: moduleTitle }),
    });
    if (!result.success) {
      toast.error(result.error ?? "Failed to add module");
      return;
    }
    toast.success("Module added");
    setModuleTitle("");
    void load();
  }

  async function addLesson() {
    if (!lessonTitle.trim() || !targetModuleId) return;
    const result = await courseFetch<Lesson>(
      `/api/courses/${courseId}/modules/${targetModuleId}/lessons`,
      {
        method: "POST",
        body: JSON.stringify({
          title: lessonTitle,
          contentHtml: `<p>${lessonTitle}</p>`,
          estimatedStudyMinutes: 60,
        }),
      },
    );
    if (!result.success) {
      toast.error(result.error ?? "Failed to add lesson");
      return;
    }
    toast.success("Lesson added");
    setLessonTitle("");
    void load();
  }

  async function deleteModule(moduleId: string) {
    const result = await courseFetch(`/api/courses/${courseId}/modules/${moduleId}`, {
      method: "DELETE",
    });
    if (!result.success) {
      toast.error(result.error ?? "Failed to delete module");
      return;
    }
    toast.success("Module deleted");
    void load();
  }

  async function deleteLesson(lessonId: string) {
    const result = await courseFetch(`/api/courses/${courseId}/lessons/${lessonId}`, {
      method: "DELETE",
    });
    if (!result.success) {
      toast.error(result.error ?? "Failed to delete lesson");
      return;
    }
    toast.success("Lesson deleted");
    void load();
  }

  async function addResource() {
    if (!resourceLessonId || !resourceUrl.trim()) return;
    const result = await courseFetch(`/api/courses/${courseId}/lessons/${resourceLessonId}`, {
      method: "PATCH",
      body: JSON.stringify({
        action: "add_resource",
        title: "Learning resource",
        type: "link",
        url: resourceUrl,
        downloadable: true,
      }),
    });
    if (!result.success) {
      toast.error(result.error ?? "Failed to add resource");
      return;
    }
    toast.success("Resource added");
    setResourceUrl("");
    void load();
  }

  async function enroll() {
    if (!enrollStudentId) return;
    const result = await courseFetch(`/api/courses/${courseId}/enrollments`, {
      method: "POST",
      body: JSON.stringify({ studentId: enrollStudentId }),
    });
    if (!result.success) {
      toast.error(result.error ?? "Enrollment failed");
      return;
    }
    toast.success("Student enrolled");
    setEnrollStudentId("");
    void load();
  }

  async function enrollmentAction(enrollmentId: string, action: string) {
    const result = await courseFetch(`/api/courses/${courseId}/enrollments`, {
      method: "POST",
      body: JSON.stringify({ action, enrollmentId }),
    });
    if (!result.success) {
      toast.error(result.error ?? "Action failed");
      return;
    }
    toast.success("Enrollment updated");
    void load();
  }

  async function courseAction(action: string) {
    const result = await courseFetch(`/api/courses/${courseId}/actions`, {
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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Course not found.</p>
        <Button asChild variant="outline">
          <Link href={basePath}>Back to courses</Link>
        </Button>
      </div>
    );
  }

  const allLessons = course.modules.flatMap((m) => m.lessons);

  return (
    <div className="space-y-6">
      <PageHeader
        title={course.title}
        description={`${course.code} · ${COURSE_STATUS_LABELS[course.status]} · ${DIFFICULTY_LABELS[course.difficulty]}`}
        breadcrumbs={[
          { label: roleLabel },
          { label: "Courses", href: basePath },
          { label: course.code },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href={basePath}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              Edit details
            </Button>
            <Button variant="outline" onClick={() => void courseAction("publish")}>
              Publish
            </Button>
            <Button variant="outline" onClick={() => void courseAction("duplicate")}>
              Duplicate
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
            <CardDescription>{course.shortDescription}</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert">
            <p>{course.fullDescription || "No full description yet."}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Enrollment:</span>{" "}
              {ENROLLMENT_MODE_LABELS[course.enrollmentMode]}
            </p>
            <p>
              <span className="text-muted-foreground">Instructor:</span>{" "}
              {course.primaryInstructorName ?? "Unassigned"}
            </p>
            <p>
              <span className="text-muted-foreground">Category:</span>{" "}
              {course.categoryName ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Modules / lessons:</span>{" "}
              {course.counts.modules} / {course.counts.lessons}
            </p>
            <p>
              <span className="text-muted-foreground">Active enrollments:</span>{" "}
              {course.counts.activeEnrollments}
            </p>
            <p>
              <span className="text-muted-foreground">Duration:</span>{" "}
              {course.estimatedDurationMinutes} min
            </p>
            <Badge>{COURSE_STATUS_LABELS[course.status]}</Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="structure">
        <TabsList>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add module</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Module title"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
              />
              <Button onClick={() => void addModule()}>
                <Plus className="mr-2 h-4 w-4" /> Module
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add lesson</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Select value={targetModuleId} onValueChange={setTargetModuleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  {course.modules.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Lesson title"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
              />
              <Button onClick={() => void addLesson()}>
                <Plus className="mr-2 h-4 w-4" /> Lesson
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {course.modules.map((mod) => (
              <Card key={mod.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                  <div>
                    <CardTitle className="text-base">
                      {mod.order}. {mod.title}
                    </CardTitle>
                    <CardDescription>
                      {mod.description || "No description"} · {mod.lessons.length} lessons
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete module"
                    onClick={() => void deleteModule(mod.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mod.lessons.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No lessons in this module.</p>
                  ) : (
                    mod.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-border/70 px-3 py-2"
                      >
                        <div>
                          <p className="font-medium">
                            {lesson.order}. {lesson.title}
                            {lesson.previewAvailable ? (
                              <Badge className="ml-2" variant="outline">
                                Preview
                              </Badge>
                            ) : null}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lesson.estimatedStudyMinutes} min study ·{" "}
                            {lesson.resources.length} resources
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete lesson"
                          onClick={() => void deleteLesson(lesson.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enroll student</CardTitle>
              <CardDescription>Manual enrollment for admin-managed cohorts.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Select value={enrollStudentId} onValueChange={setEnrollStudentId}>
                <SelectTrigger className="sm:max-w-md">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.fullName || s.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => void enroll()}>
                <UserPlus className="mr-2 h-4 w-4" /> Enroll
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Roster</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {enrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No enrollments yet.</p>
              ) : (
                enrollments.map((e) => (
                  <div
                    key={e.id}
                    className="flex flex-col gap-2 rounded-xl border border-border/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{e.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.studentEmail} · {ENROLLMENT_STATUS_LABELS[e.status]}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void enrollmentAction(e.id, "suspend")}
                      >
                        Suspend
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void enrollmentAction(e.id, "resume")}
                      >
                        Resume
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void enrollmentAction(e.id, "remove")}
                      >
                        Drop
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attach external resource</CardTitle>
              <CardDescription>
                PDF, PPT, Word, images, audio, video, ZIP, or external links.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Select value={resourceLessonId} onValueChange={setResourceLessonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Lesson" />
                </SelectTrigger>
                <SelectContent>
                  {allLessons.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="https://…"
                value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
              />
              <Button onClick={() => void addResource()}>Add link</Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {allLessons.map((lesson) =>
              lesson.resources.length ? (
                <Card key={lesson.id}>
                  <CardHeader>
                    <CardTitle className="text-sm">{lesson.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {lesson.resources.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          {r.title} ({r.type})
                        </a>
                        <span className="text-xs text-muted-foreground">
                          {r.downloadable ? "Downloadable" : "View only"}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : null,
            )}
          </div>
        </TabsContent>
      </Tabs>

      <CourseFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        course={course}
        categories={categories}
        instructors={instructors}
        onSaved={() => void load()}
      />
    </div>
  );
}

export { CourseDetailView };
