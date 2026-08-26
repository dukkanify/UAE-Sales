"use client";

import * as React from "react";
import { BookOpen, CalendarClock, GraduationCap, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

type Snapshot = {
  subjectCount: number;
  studentCount: number;
  instructorCount: number;
  lectureAssignmentCount: number;
  defaultFirstSubjectCourseId: string | null;
  subjects: Array<{ id: string; code: string; title: string; primaryInstructorId: string | null }>;
  students: Array<{
    studentId: string;
    name: string;
    email: string;
    firstSubjectCode: string | null;
    enrollmentCount: number;
  }>;
  instructors: Array<{
    instructorId: string;
    name: string;
    email: string;
    atplSubjectCount: number;
    upcomingClasses: number;
  }>;
  recentAudit: Array<{ id: string; action: string; detail: string; createdAt: string }>;
};

async function cgiFetch<T>(query = ""): Promise<T> {
  const res = await fetch(`/api/cgi${query}`, { cache: "no-store" });
  const json = (await res.json()) as { success: boolean; data: T; error: string | null };
  if (!res.ok || !json.success) throw new Error(json.error ?? "Request failed");
  return json.data;
}

async function cgiPost(body: Record<string, unknown>) {
  const res = await fetch("/api/cgi", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { success: boolean; data: unknown; error: string | null };
  if (!res.ok || !json.success) throw new Error(json.error ?? "Request failed");
  return json.data;
}

export function CgiConsoleView({ initial }: { initial: Snapshot }) {
  const [data, setData] = React.useState(initial);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const [firstSubjectCourseId, setFirstSubjectCourseId] = React.useState(
    initial.defaultFirstSubjectCourseId ?? initial.subjects[0]?.id ?? "",
  );
  const [studentId, setStudentId] = React.useState(initial.students[0]?.studentId ?? "");
  const [studentFirstSubject, setStudentFirstSubject] = React.useState(
    initial.subjects[0]?.id ?? "",
  );
  const [changeCourseId, setChangeCourseId] = React.useState(initial.subjects[0]?.id ?? "");
  const [changeInstructorId, setChangeInstructorId] = React.useState(
    initial.instructors[0]?.instructorId ?? "",
  );
  const [lectureTitle, setLectureTitle] = React.useState("ATPL briefing");
  const [lectureCourseId, setLectureCourseId] = React.useState(initial.subjects[0]?.id ?? "");
  const [lectureInstructorId, setLectureInstructorId] = React.useState(
    initial.instructors[0]?.instructorId ?? "",
  );
  const [noteTarget, setNoteTarget] = React.useState(initial.students[0]?.studentId ?? "");
  const [noteBody, setNoteBody] = React.useState("");

  async function refresh() {
    const next = await cgiFetch<Snapshot>("?view=dashboard");
    setData(next);
  }

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Chief Ground Instructor"
        description="ATPL journey control — subject distribution, lectures, instructors, and student follow-up."
        breadcrumbs={[{ label: "CGI" }, { label: "Dashboard" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="ATPL subjects" value={data.subjectCount} icon={BookOpen} />
        <StatCard label="ATPL students" value={data.studentCount} icon={Users} />
        <StatCard label="Instructors" value={data.instructorCount} icon={GraduationCap} />
        <StatCard
          label="Lecture assignments"
          value={data.lectureAssignmentCount}
          icon={CalendarClock}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Choose first subject (platform default)
        </h2>
        <p className="text-sm text-muted-foreground">
          Sets the default opening subject for new ATPL student plans.
        </p>
        <div className="form-row-responsive">
          <div className="min-w-0 w-full sm:w-auto sm:min-w-[180px] space-y-1.5">
            <Label>First subject</Label>
            <Select value={firstSubjectCourseId} onValueChange={setFirstSubjectCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {data.subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.code} — {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            disabled={busy || !firstSubjectCourseId}
            onClick={() =>
              void run(() =>
                cgiPost({ action: "set_default_first_subject", courseId: firstSubjectCourseId }),
              )
            }
          >
            Save default
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Distribute subjects & first subject
        </h2>
        <p className="text-sm text-muted-foreground">
          Assign the ATPL subject order for a student and unlock the opening subject.
        </p>
        <div className="form-row-responsive">
          <div className="min-w-0 w-full sm:w-auto sm:min-w-[180px] space-y-1.5">
            <Label>Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {data.students.map((s) => (
                  <SelectItem key={s.studentId} value={s.studentId}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0 w-full sm:w-auto sm:min-w-[180px] space-y-1.5">
            <Label>First subject</Label>
            <Select value={studentFirstSubject} onValueChange={setStudentFirstSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {data.subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            disabled={busy || !studentId}
            variant="secondary"
            onClick={() =>
              void run(() =>
                cgiPost({
                  action: "distribute_subjects",
                  studentId,
                  courseIds: data.subjects.map((s) => s.id),
                  firstCourseId: studentFirstSubject || data.subjects[0]?.id,
                }),
              )
            }
          >
            Distribute all subjects
          </Button>
          <Button
            disabled={busy || !studentId || !studentFirstSubject}
            onClick={() =>
              void run(() =>
                cgiPost({
                  action: "choose_first_subject",
                  studentId,
                  courseId: studentFirstSubject,
                }),
              )
            }
          >
            Set first subject
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Change instructor</h2>
        <div className="form-row-responsive">
          <div className="min-w-0 w-full sm:w-auto sm:min-w-[180px] space-y-1.5">
            <Label>Subject</Label>
            <Select value={changeCourseId} onValueChange={setChangeCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {data.subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0 w-full sm:w-auto sm:min-w-[180px] space-y-1.5">
            <Label>Instructor</Label>
            <Select value={changeInstructorId} onValueChange={setChangeInstructorId}>
              <SelectTrigger>
                <SelectValue placeholder="Instructor" />
              </SelectTrigger>
              <SelectContent>
                {data.instructors.map((i) => (
                  <SelectItem key={i.instructorId} value={i.instructorId}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            disabled={busy || !changeCourseId || !changeInstructorId}
            onClick={() =>
              void run(() =>
                cgiPost({
                  action: "change_instructor",
                  courseId: changeCourseId,
                  instructorId: changeInstructorId,
                }),
              )
            }
          >
            Reassign instructor
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Distribute lecture</h2>
        <div className="form-row-responsive">
          <div className="min-w-0 w-full sm:w-auto sm:min-w-[180px] space-y-1.5">
            <Label>Title</Label>
            <Input value={lectureTitle} onChange={(e) => setLectureTitle(e.target.value)} />
          </div>
          <div className="min-w-0 w-full sm:w-auto sm:min-w-[180px] space-y-1.5">
            <Label>Subject</Label>
            <Select value={lectureCourseId} onValueChange={setLectureCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {data.subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0 w-full sm:w-auto sm:min-w-[180px] space-y-1.5">
            <Label>Instructor</Label>
            <Select value={lectureInstructorId} onValueChange={setLectureInstructorId}>
              <SelectTrigger>
                <SelectValue placeholder="Instructor" />
              </SelectTrigger>
              <SelectContent>
                {data.instructors.map((i) => (
                  <SelectItem key={i.instructorId} value={i.instructorId}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            disabled={busy || !lectureCourseId || !lectureInstructorId}
            onClick={() =>
              void run(() =>
                cgiPost({
                  action: "distribute_lecture",
                  courseId: lectureCourseId,
                  lessonId: `lesson-${Date.now()}`,
                  lessonTitle: lectureTitle,
                  instructorId: lectureInstructorId,
                  studentId: studentId || null,
                }),
              )
            }
          >
            Assign lecture
          </Button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">ATPL students</h2>
          <ul className="space-y-2 text-sm">
            {data.students.length === 0 ? (
              <li className="text-muted-foreground">No ATPL package enrollments yet.</li>
            ) : (
              data.students.map((s) => (
                <li key={s.studentId} className="border-b border-border/60 pb-2">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground"> · {s.email}</span>
                  <div className="text-muted-foreground">
                    First: {s.firstSubjectCode ?? "—"} · {s.enrollmentCount} enrollments
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Instructors</h2>
          <ul className="space-y-2 text-sm">
            {data.instructors.map((i) => (
              <li key={i.instructorId} className="border-b border-border/60 pb-2">
                <span className="font-medium">{i.name}</span>
                <div className="text-muted-foreground">
                  {i.atplSubjectCount} ATPL subjects · {i.upcomingClasses} upcoming classes
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Follow-up note</h2>
        <div className="form-row-responsive">
          <div className="min-w-0 w-full sm:w-auto sm:min-w-[180px] space-y-1.5">
            <Label>Student</Label>
            <Select value={noteTarget} onValueChange={setNoteTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Student" />
              </SelectTrigger>
              <SelectContent>
                {data.students.map((s) => (
                  <SelectItem key={s.studentId} value={s.studentId}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0 w-full sm:w-auto sm:min-w-[180px] space-y-1.5">
            <Label>Note</Label>
            <Textarea value={noteBody} onChange={(e) => setNoteBody(e.target.value)} rows={2} />
          </div>
          <Button
            disabled={busy || !noteTarget || !noteBody.trim()}
            onClick={() =>
              void run(async () => {
                await cgiPost({
                  action: "add_note",
                  targetType: "student",
                  targetUserId: noteTarget,
                  body: noteBody,
                });
                setNoteBody("");
              })
            }
          >
            Save note
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Recent CGI activity</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {data.recentAudit.length === 0 ? (
            <li>No activity yet.</li>
          ) : (
            data.recentAudit.map((a) => (
              <li key={a.id}>
                <span className="font-medium text-foreground">{a.action}</span> — {a.detail}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
