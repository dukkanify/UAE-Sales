"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COURSE_STATUSES,
  COURSE_STATUS_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_LEVELS,
  ENROLLMENT_MODE_LABELS,
  ENROLLMENT_MODES,
} from "@/constants/courses";
import { courseFetch } from "@/features/courses/lib/api";
import type { CourseCategory, CourseListItem } from "@/types/courses";
import type { UserProfile } from "@/types";

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: CourseListItem | null;
  categories: CourseCategory[];
  instructors: UserProfile[];
  onSaved: (course: CourseListItem) => void;
}

function CourseFormDialog({
  open,
  onOpenChange,
  course,
  categories,
  instructors,
  onSaved,
}: CourseFormDialogProps) {
  const [saving, setSaving] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [code, setCode] = React.useState("");
  const [shortDescription, setShortDescription] = React.useState("");
  const [fullDescription, setFullDescription] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<string>("none");
  const [difficulty, setDifficulty] = React.useState("intermediate");
  const [enrollmentMode, setEnrollmentMode] = React.useState("manual");
  const [status, setStatus] = React.useState("draft");
  const [primaryInstructorId, setPrimaryInstructorId] = React.useState<string>("none");
  const [scheduledPublishAt, setScheduledPublishAt] = React.useState("");
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = React.useState("0");

  React.useEffect(() => {
    if (!open) return;
    setTitle(course?.title ?? "");
    setCode(course?.code ?? "");
    setShortDescription(course?.shortDescription ?? "");
    setFullDescription(course?.fullDescription ?? "");
    setCategoryId(course?.categoryId ?? "none");
    setDifficulty(course?.difficulty ?? "intermediate");
    setEnrollmentMode(course?.enrollmentMode ?? "manual");
    setStatus(course?.status ?? "draft");
    setPrimaryInstructorId(course?.primaryInstructorId ?? "none");
    setScheduledPublishAt(
      course?.scheduledPublishAt
        ? course.scheduledPublishAt.slice(0, 16)
        : "",
    );
    setEstimatedDurationMinutes(String(course?.estimatedDurationMinutes ?? 0));
  }, [open, course]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title,
      code,
      shortDescription,
      fullDescription,
      categoryId: categoryId === "none" ? null : categoryId,
      difficulty,
      enrollmentMode,
      status,
      primaryInstructorId:
        primaryInstructorId === "none" ? null : primaryInstructorId,
      scheduledPublishAt:
        status === "scheduled" && scheduledPublishAt
          ? new Date(scheduledPublishAt).toISOString()
          : null,
      estimatedDurationMinutes: Number(estimatedDurationMinutes) || 0,
      language: "en",
    };

    const result = course
      ? await courseFetch<CourseListItem>(`/api/courses/${course.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      : await courseFetch<CourseListItem>("/api/courses", {
          method: "POST",
          body: JSON.stringify(payload),
        });

    setSaving(false);
    if (!result.success || !result.data) {
      toast.error(result.error ?? "Unable to save course");
      return;
    }
    toast.success(course ? "Course updated" : "Course created");
    onSaved(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{course ? "Edit course" : "Create course"}</DialogTitle>
          <DialogDescription>
            Configure catalog details, visibility, and instructor assignment.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="course-title">Title</Label>
              <Input
                id="course-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={160}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-code">Course code</Label>
              <Input
                id="course-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                maxLength={32}
                placeholder="ATPL-010"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Uncategorized</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.parentId ? `↳ ${c.name}` : c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-short">Short description</Label>
            <Textarea
              id="course-short"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-full">Full description</Label>
            <Textarea
              id="course-full"
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {DIFFICULTY_LABELS[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Enrollment</Label>
              <Select value={enrollmentMode} onValueChange={setEnrollmentMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENROLLMENT_MODES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {ENROLLMENT_MODE_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {COURSE_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Primary instructor</Label>
              <Select
                value={primaryInstructorId}
                onValueChange={setPrimaryInstructorId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign instructor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {instructors.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.fullName || i.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {status === "scheduled" ? (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="publish-at">Future publish date</Label>
                <Input
                  id="publish-at"
                  type="datetime-local"
                  value={scheduledPublishAt}
                  onChange={(e) => setScheduledPublishAt(e.target.value)}
                  required
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={0}
                value={estimatedDurationMinutes}
                onChange={(e) => setEstimatedDurationMinutes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {course ? "Save changes" : "Create course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { CourseFormDialog };
