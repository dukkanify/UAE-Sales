import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { InstructorStudentsView } from "@/features/courses/components/instructor-students-view";
import { routes } from "@/constants/routes";
import { ROLES } from "@/constants/roles";
import { getCurrentSession } from "@/services/auth/auth-service";
import { listInstructorStudents } from "@/services/courses/instructor-students";

export const metadata: Metadata = { title: "Students" };

export default async function InstructorStudentsPage() {
  const { user } = await getCurrentSession();
  if (!user) redirect(routes.login);
  if (user.role !== ROLES.INSTRUCTOR) redirect(routes.accessDenied);

  const students = listInstructorStudents(user.id);

  return <InstructorStudentsView students={students} />;
}
