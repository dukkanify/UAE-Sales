/**
 * Unit: Chief Ground Instructor / ATPL journey (CR004).
 */

import { beforeAll, describe, expect, it } from "vitest";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLE_DASHBOARD, ROLE_HIERARCHY, ROLES } from "@/constants/roles";
import { hasPermission } from "@/services/auth/permissions";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb } from "@/services/auth/store";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import {
  changeSubjectInstructor,
  chooseFirstSubject,
  distributeLecture,
  distributeSubjects,
  listAllInstructors,
  listAtplCourses,
  setDefaultFirstSubject,
} from "@/services/cgi/journey-service";
import { resetCgiDbCache, writeCgiDb } from "@/services/cgi/store";

describe("chief ground instructor (CR004)", () => {
  beforeAll(() => {
    ensureDemoUsersSeeded();
    ensureCoursesSeeded();
    resetCgiDbCache();
    writeCgiDb((db) => {
      db.subjectAssignments = [];
      db.lectureAssignments = [];
      db.notes = [];
      db.audit = [];
      db.settings.defaultFirstSubjectCourseId = null;
    });
  });

  it("registers CGI role between instructor and admin", () => {
    expect(ROLE_HIERARCHY[ROLES.CHIEF_GROUND_INSTRUCTOR]).toBeGreaterThan(
      ROLE_HIERARCHY[ROLES.INSTRUCTOR],
    );
    expect(ROLE_HIERARCHY[ROLES.CHIEF_GROUND_INSTRUCTOR]).toBeLessThan(ROLE_HIERARCHY[ROLES.ADMIN]);
    expect(ROLE_DASHBOARD[ROLES.CHIEF_GROUND_INSTRUCTOR]).toBe("/cgi/dashboard");
  });

  it("grants CGI ATPL workflow permissions without finance/system", () => {
    expect(hasPermission(ROLES.CHIEF_GROUND_INSTRUCTOR, PERMISSIONS.SUBJECTS_DISTRIBUTE)).toBe(
      true,
    );
    expect(hasPermission(ROLES.CHIEF_GROUND_INSTRUCTOR, PERMISSIONS.LECTURES_DISTRIBUTE)).toBe(
      true,
    );
    expect(hasPermission(ROLES.CHIEF_GROUND_INSTRUCTOR, PERMISSIONS.INSTRUCTORS_ASSIGN)).toBe(true);
    expect(hasPermission(ROLES.CHIEF_GROUND_INSTRUCTOR, PERMISSIONS.SCHEDULE_MANAGE_ALL)).toBe(
      true,
    );
    expect(hasPermission(ROLES.CHIEF_GROUND_INSTRUCTOR, PERMISSIONS.ATPL_FIRST_SUBJECT)).toBe(true);
    expect(hasPermission(ROLES.CHIEF_GROUND_INSTRUCTOR, PERMISSIONS.STUDENTS_FOLLOW_ALL)).toBe(
      true,
    );
    expect(hasPermission(ROLES.CHIEF_GROUND_INSTRUCTOR, PERMISSIONS.INSTRUCTORS_FOLLOW)).toBe(true);
    expect(hasPermission(ROLES.CHIEF_GROUND_INSTRUCTOR, PERMISSIONS.SYSTEM_SETTINGS)).toBe(false);
    expect(hasPermission(ROLES.CHIEF_GROUND_INSTRUCTOR, PERMISSIONS.FINANCE_REPORTS)).toBe(false);
  });

  it("seeds a CGI demo user", () => {
    const cgi = readAuthDb().users.find((u) => u.role === ROLES.CHIEF_GROUND_INSTRUCTOR);
    expect(cgi?.email).toBe("cgi@eagerpilots.com");
  });

  it("distributes subjects, chooses first subject, and assigns lectures", async () => {
    const subjects = listAtplCourses();
    expect(subjects.length).toBeGreaterThan(1);
    const student = readAuthDb().users.find(
      (u) => u.role === ROLES.STUDENT && u.status === "active",
    );
    const instructors = listAllInstructors();
    expect(student).toBeTruthy();
    expect(instructors.length).toBeGreaterThan(0);

    const cgi = readAuthDb().users.find((u) => u.role === ROLES.CHIEF_GROUND_INSTRUCTOR)!;
    setDefaultFirstSubject({ courseId: subjects[1]!.id, actorId: cgi.id });

    const plan = distributeSubjects({
      studentId: student!.id,
      courseIds: subjects.map((s) => s.id),
      firstCourseId: subjects[1]!.id,
      actorId: cgi.id,
    });
    expect(plan[0]?.courseId).toBe(subjects[1]!.id);
    expect(plan[0]?.status).toBe("available");
    expect(plan[1]?.status).toBe("locked");

    const reordered = await chooseFirstSubject({
      studentId: student!.id,
      courseId: subjects[0]!.id,
      actorId: cgi.id,
    });
    expect(reordered[0]?.courseId).toBe(subjects[0]!.id);

    await changeSubjectInstructor({
      courseId: subjects[0]!.id,
      instructorId: instructors[0]!.instructorId,
      actorId: cgi.id,
    });

    const lecture = await distributeLecture({
      courseId: subjects[0]!.id,
      lessonId: "lesson-demo",
      lessonTitle: "Met briefing",
      instructorId: instructors[0]!.instructorId,
      studentId: student!.id,
      actorId: cgi.id,
    });
    expect(lecture.status).toBe("assigned");
    expect(lecture.lessonTitle).toBe("Met briefing");
    expect(lecture.liveClassId).toBeNull();
  }, 60_000);
});
